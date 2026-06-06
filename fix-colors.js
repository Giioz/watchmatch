const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) { 
      results.push(file);
    }
  });
  return results;
}

const files = [...walk('src'), ...walk('app')];

let replacedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/color:\s*colors\.primarySoft/g, 'color: colors.primary')
    .replace(/color=\{colors\.primarySoft\}/g, 'color={colors.primary}');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    replacedCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Replaced in ${replacedCount} files.`);
