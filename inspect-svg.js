const fs = require('fs');

['images/logo.svg', 'images/logo-white.svg'].forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('\n⚠️  Brak pliku:', file);
    return;
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('📄 PLIK:', file);
  console.log('═══════════════════════════════════════════');

  const svg = fs.readFileSync(file, 'utf8');

  console.log('Rozmiar:', svg.length, 'bajtów');
  console.log('Pierwsze 300 znaków:\n');
  console.log(svg.substring(0, 300));
  console.log('\n--- Znalezione <path> ---');

  // Znajdź wszystkie <path...>
  const pathRegex = /<path\b[^>]*\/?>/g;
  let match;
  let count = 0;

  while ((match = pathRegex.exec(svg)) !== null) {
    count++;
    const pathTag = match[0];
    const truncated = pathTag.length > 150
      ? pathTag.substring(0, 150) + '.../>'
      : pathTag;

    // Wyciągnij fill i opacity
    const fillMatch = pathTag.match(/fill=["']([^"']+)["']/i);
    const opacityMatch = pathTag.match(/opacity=["']([^"']+)["']/i);

    console.log(`\n[${count}] fill=${fillMatch ? fillMatch[1] : '—'} | opacity=${opacityMatch ? opacityMatch[1] : '—'}`);
    console.log('    ' + truncated.replace(/\s+/g, ' '));
  }

  console.log(`\nRAZEM: ${count} pathów`);
});