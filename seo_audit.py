#!/usr/bin/env python3
"""
Poland Secrets v2 — read-only SEO and project audit.
Run from the project root:
    python seo_audit.py
Outputs:
    reports/seo-audit.md
    reports/seo-audit.csv

This script only reads project files and writes reports. It does not modify website files.
"""
from __future__ import annotations

import csv
import json
import re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
REPORT_DIR = ROOT / "reports"
SKIP_DIRS = {".git", "node_modules", "reports", ".next", "dist", "build", "vendor"}
HTML_EXTS = {".html", ".htm"}
JSON_EXTS = {".json"}
CONFLICT_MARKERS = ("<<<<<<< ", "=======", ">>>>>>> ")
TRACKING_OR_EXTERNAL_SCHEMES = {"mailto", "tel", "javascript", "data"}

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_parts = []
        self.in_title = False
        self.meta = []
        self.links = []
        self.images = []
        self.h1 = []
        self.in_h1 = False
        self.h1_parts = []
        self.canonical = []
        self.hreflang = []
        self.jsonld = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            self.meta.append(a)
        elif tag == "link":
            rel = (a.get("rel") or "").lower().split()
            if "canonical" in rel and a.get("href"):
                self.canonical.append(a["href"])
            if "alternate" in rel and a.get("hreflang") and a.get("href"):
                self.hreflang.append((a["hreflang"], a["href"]))
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"].strip())
        elif tag == "img":
            self.images.append(a)
        elif tag == "h1":
            self.in_h1 = True
            self.h1_parts = []
        elif tag == "script" and (a.get("type") or "").lower() == "application/ld+json":
            self.jsonld += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "h1" and self.in_h1:
            self.h1.append(" ".join("".join(self.h1_parts).split()))
            self.in_h1 = False

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)
        if self.in_h1:
            self.h1_parts.append(data)

def walk_files():
    for p in ROOT.rglob("*"):
        if not p.is_file():
            continue
        try:
            rel = p.relative_to(ROOT)
        except ValueError:
            continue
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        yield p

def meta_value(parser, key, attr="name"):
    vals = []
    for m in parser.meta:
        if (m.get(attr) or "").lower() == key.lower() and m.get("content"):
            vals.append(m["content"].strip())
    return vals

def add_issue(rows, severity, file, issue, detail=""):
    rows.append({"severity": severity, "file": str(file), "issue": issue, "detail": detail})

def main():
    files = list(walk_files())
    html_files = [p for p in files if p.suffix.lower() in HTML_EXTS]
    json_files = [p for p in files if p.suffix.lower() in JSON_EXTS]
    rows = []
    slug_map = {}

    if not html_files:
        add_issue(rows, "INFO", ".", "No HTML files found", "Check that the script is run from the project root.")

    for p in files:
        rel = p.relative_to(ROOT).as_posix()
        try:
            raw = p.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            try:
                raw = p.read_text(encoding="utf-8-sig")
            except Exception as exc:
                add_issue(rows, "WARN", rel, "Could not read file as UTF-8", str(exc))
                continue
        except Exception as exc:
            add_issue(rows, "WARN", rel, "Could not read file", str(exc))
            continue

        for marker in CONFLICT_MARKERS:
            if marker in raw:
                add_issue(rows, "ERROR", rel, "Possible unresolved Git conflict marker", marker.strip())
                break

        if p.suffix.lower() in HTML_EXTS:
            parser = PageParser()
            try:
                parser.feed(raw)
            except Exception as exc:
                add_issue(rows, "WARN", rel, "HTML parsing warning", str(exc))

            title = " ".join("".join(parser.title_parts).split())
            descriptions = meta_value(parser, "description")
            robots = meta_value(parser, "robots")
            if not title:
                add_issue(rows, "WARN", rel, "Missing title tag")
            elif len(title) > 60:
                add_issue(rows, "INFO", rel, "Title may be long", f"{len(title)} characters: {title}")
            if not descriptions:
                add_issue(rows, "WARN", rel, "Missing meta description")
            else:
                desc = descriptions[0]
                if len(desc) > 160:
                    add_issue(rows, "INFO", rel, "Meta description may be long", f"{len(desc)} characters")
            if not parser.h1:
                add_issue(rows, "WARN", rel, "Missing H1")
            elif len(parser.h1) > 1:
                add_issue(rows, "INFO", rel, "Multiple H1 headings", " | ".join(parser.h1))
            if not parser.canonical:
                add_issue(rows, "INFO", rel, "No canonical link found")
            elif len(set(parser.canonical)) > 1:
                add_issue(rows, "WARN", rel, "Multiple different canonical URLs", " | ".join(parser.canonical))
            if not parser.hreflang:
                add_issue(rows, "INFO", rel, "No hreflang alternate links found", "Check whether this page has a translated counterpart.")
            for img in parser.images:
                if not img.get("alt"):
                    add_issue(rows, "INFO", rel, "Image missing alt attribute", img.get("src", "(no src)"))
                if not img.get("src") and not img.get("srcset"):
                    add_issue(rows, "WARN", rel, "Image has no src/srcset")
            for href in parser.links:
                if not href or href.startswith("#"):
                    continue
                parsed = urlparse(href)
                if parsed.scheme.lower() in TRACKING_OR_EXTERNAL_SCHEMES:
                    continue
                if parsed.scheme.lower() in {"http", "https"} or href.startswith("//"):
                    continue
                path_part = href.split("#", 1)[0].split("?", 1)[0]
                if not path_part:
                    continue
                # Only test local paths; root-relative paths resolve from project root.
                target = (ROOT / path_part.lstrip("/")) if path_part.startswith("/") else (p.parent / path_part)
                if not target.exists():
                    add_issue(rows, "WARN", rel, "Local link target not found", href)
            # Basic duplicate title tracking
            if title:
                slug_map.setdefault(title.casefold(), []).append(rel)

        elif p.suffix.lower() == ".json":
            try:
                json.loads(raw)
            except json.JSONDecodeError as exc:
                add_issue(rows, "ERROR", rel, "Invalid JSON", f"Line {exc.lineno}, column {exc.colno}: {exc.msg}")

    for title, paths in slug_map.items():
        if len(paths) > 1:
            add_issue(rows, "INFO", " | ".join(paths), "Duplicate HTML title", title)

    REPORT_DIR.mkdir(exist_ok=True)
    csv_path = REPORT_DIR / "seo-audit.csv"
    md_path = REPORT_DIR / "seo-audit.md"

    with csv_path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=["severity", "file", "issue", "detail"])
        writer.writeheader()
        writer.writerows(rows)

    counts = {level: sum(1 for r in rows if r["severity"] == level) for level in ("ERROR", "WARN", "INFO")}
    with md_path.open("w", encoding="utf-8") as f:
        f.write("# Poland Secrets v2 — SEO audit report\n\n")
        f.write("> Read-only audit. Review findings before changing production files.\n\n")
        f.write(f"- HTML files scanned: **{len(html_files)}**\n")
        f.write(f"- JSON files scanned: **{len(json_files)}**\n")
        f.write(f"- Errors: **{counts['ERROR']}**\n")
        f.write(f"- Warnings: **{counts['WARN']}**\n")
        f.write(f"- Informational findings: **{counts['INFO']}**\n\n")
        if not rows:
            f.write("No issues were detected by these basic checks. This is not a complete SEO or browser test.\n")
        else:
            for level in ("ERROR", "WARN", "INFO"):
                subset = [r for r in rows if r["severity"] == level]
                if not subset:
                    continue
                f.write(f"## {level.title()} ({len(subset)})\n\n")
                for r in subset:
                    detail = f" — {r['detail']}" if r["detail"] else ""
                    f.write(f"- **{r['file']}**: {r['issue']}{detail}\n")
                f.write("\n")
        f.write("## Limitations\n\n")
        f.write("- This script does not crawl the live website or verify external URLs.\n")
        f.write("- JavaScript-rendered content may not be detected.\n")
        f.write("- Canonical, hreflang and metadata findings require human review; some pages may intentionally differ.\n")
        f.write("- Local links are checked against files in this repository, so routing rules and generated pages may need exceptions.\n")

    print(f"Scanned {len(html_files)} HTML and {len(json_files)} JSON files.")
    print(f"Errors: {counts['ERROR']} | Warnings: {counts['WARN']} | Info: {counts['INFO']}")
    print(f"Reports written to:\n  {md_path}\n  {csv_path}")

if __name__ == "__main__":
    main()
