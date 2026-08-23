const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/app/api/**/route.ts');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('export const dynamic')) {
    content = content.replace(/export const runtime = 'edge';/, "export const runtime = 'edge';\nexport const dynamic = 'force-dynamic';");
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
