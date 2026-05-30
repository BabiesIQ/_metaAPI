import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/lib/i18n.ts';
let content = readFileSync(filePath, 'utf8');

const languages = ['hi', 'es', 'fr', 'ar', 'pt', 'de', 'ja', 'ko', 'zh'];

for (const lang of languages) {
  const langStart = content.indexOf(`  ${lang}: {`);
  if (langStart === -1) {
    console.log(`Language ${lang} not found, skipping`);
    continue;
  }
  
  const commonIdx = content.indexOf(`      common:`, langStart);
  if (commonIdx === -1) {
    console.log(`common section not found for ${lang}, skipping`);
    continue;
  }
  
  const firstHalf = content.substring(langStart, commonIdx);
  const sectionsToRemove = ['dashboard', 'billing', 'footer'];
  
  let newFirstHalf = firstHalf;
  for (const section of sectionsToRemove) {
    const sectionPattern = `      ${section}: {`;
    const sectionStart = newFirstHalf.indexOf(sectionPattern);
    if (sectionStart === -1) continue;
    
    const openBraceIdx = newFirstHalf.indexOf('{', sectionStart + sectionPattern.length - 1);
    let braceCount = 1;
    let i = openBraceIdx + 1;
    while (i < newFirstHalf.length && braceCount > 0) {
      if (newFirstHalf[i] === '{') braceCount++;
      if (newFirstHalf[i] === '}') braceCount--;
      i++;
    }
    while (i < newFirstHalf.length && (newFirstHalf[i] === ',' || newFirstHalf[i] === '\n')) {
      i++;
    }
    
    newFirstHalf = newFirstHalf.substring(0, sectionStart) + newFirstHalf.substring(i);
    console.log(`  Removed first ${section} from ${lang}`);
  }
  
  content = content.substring(0, langStart) + newFirstHalf + content.substring(commonIdx);
}

writeFileSync(filePath, content, 'utf8');
console.log('Done! Duplicate sections removed.');
