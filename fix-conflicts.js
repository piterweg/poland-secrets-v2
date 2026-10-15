const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (['node_modules', '.git', 'images', 'backup-html'].includes(entry)) continue;
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (entry.endsWith('.html') || entry.endsWith('.js') || entry.endsWith('.xml')) files.push(full);
  }
  return files;
}

const files = walk('.');
let fixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('<<<<<<<')) continue;

  // Usuń bloki konfliktu — zostaw wersję z HEAD (między <<<<<<< i =======)
  content = content.replace(
    /<<<<<<< HEAD\n([\s\S]*?)\n=======\n[\s\S]*?\n>>>>>>> [a-f0-9]+\n/g,
    '$1\n'
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('✔', file);
  fixed++;
}
console.log(`\nGotowe. Naprawiono ${fixed} plików.`);