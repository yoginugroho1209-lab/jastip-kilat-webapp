const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/api/**/route.ts');
for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes("export const runtime = 'edge';")) {
    fs.writeFileSync(f, "export const runtime = 'edge';\n" + content);
    console.log('Updated ' + f);
  }
}
