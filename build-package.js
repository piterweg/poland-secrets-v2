<<<<<<< HEAD
const fs = require('fs');
const path = require('path');

const OUTPUT = 'dist';                    // katalog wynikowy
const PROD_FILES = [                      // pliki produkcyjne do skopiowania
  '.html', '.css', '.js', '.json', '.xml', '.txt', '.svg', '.webp', '.jpg', '.png', '.ico'
];
const SKIP_DIRS = [                       // foldery pomijane
  'node_modules', '.git', '.venv', '__pycache__', '.vscode', '.claude', 'dist'
];
const SKIP_FILES = [                      // pliki pomijane
  'local.settings.json', 'host.json', 'function_app.py', 'requirements.txt',
  'package.json', 'package-lock.json',
  'generate-blog.js', 'generate-blog-categories.js', 'generate-rss.js',
  'generate-sitemap.js', 'generate-regions.js', 'prerender.js',
  'change-domain.js', 'remove-bg.js', 'replace-logos.js', 'update-analytics.js',
  'inspect-svg.js', 'check-images.js',
  'blog-posts.json', 'regions-data.json',
  'README.txt'
];

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      if (SKIP_DIRS.includes(entry)) continue;
      copyDir(srcPath, destPath);
    } else {
      if (SKIP_FILES.includes(entry)) continue;
      if (entry.endsWith('.bak')) continue;
      const ext = path.extname(entry).toLowerCase();
      if (PROD_FILES.includes(ext)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Wyczyść dist i skopiuj
if (fs.existsSync(OUTPUT)) fs.rmSync(OUTPUT, { recursive: true });
copyDir('.', OUTPUT);

console.log(`✅ Paczka gotowa w folderze: ${OUTPUT}/`);
=======
const fs = require('fs');
const path = require('path');

const OUTPUT = 'dist';                    // katalog wynikowy
const PROD_FILES = [                      // pliki produkcyjne do skopiowania
  '.html', '.css', '.js', '.json', '.xml', '.txt', '.svg', '.webp', '.jpg', '.png', '.ico'
];
const SKIP_DIRS = [                       // foldery pomijane
  'node_modules', '.git', '.venv', '__pycache__', '.vscode', '.claude', 'dist'
];
const SKIP_FILES = [                      // pliki pomijane
  'local.settings.json', 'host.json', 'function_app.py', 'requirements.txt',
  'package.json', 'package-lock.json',
  'generate-blog.js', 'generate-blog-categories.js', 'generate-rss.js',
  'generate-sitemap.js', 'generate-regions.js', 'prerender.js',
  'change-domain.js', 'remove-bg.js', 'replace-logos.js', 'update-analytics.js',
  'inspect-svg.js', 'check-images.js',
  'blog-posts.json', 'regions-data.json',
  'README.txt'
];

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      if (SKIP_DIRS.includes(entry)) continue;
      copyDir(srcPath, destPath);
    } else {
      if (SKIP_FILES.includes(entry)) continue;
      if (entry.endsWith('.bak')) continue;
      const ext = path.extname(entry).toLowerCase();
      if (PROD_FILES.includes(ext)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Wyczyść dist i skopiuj
if (fs.existsSync(OUTPUT)) fs.rmSync(OUTPUT, { recursive: true });
copyDir('.', OUTPUT);

console.log(`✅ Paczka gotowa w folderze: ${OUTPUT}/`);
>>>>>>> ccc4658c4a7d66f235c701a64926ebc8bd10c776
console.log(`   Wgraj całą zawartość dist/ na hosting.`);