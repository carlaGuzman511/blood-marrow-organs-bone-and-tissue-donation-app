// US-WEB-09: color values live only in src/styles/tokens.css; everything else uses var(--vd-*).
// Run: npm run lint:tokens
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ALLOWED = new Set(['src/styles/tokens.css']);
const LITERAL = [
  /#[0-9a-fA-F]{3,8}\b/, // #fff, #E11D48
  /\b(rgba?|hsla?)\(/, // rgba(0, 0, 0, 0.5)
  /:\s*(white|black|red|green|blue|gray|grey|yellow|orange|purple|pink)\s*[;!}]/i, // color: white;
];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return files(full);
    const isSource = /\.(css|scss|html)$/.test(name) || (name.endsWith('.ts') && !name.endsWith('.spec.ts'));
    return isSource ? [full] : [];
  });
}

const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');

const offenders = files(join(ROOT, 'src')).flatMap((file) => {
  const rel = relative(ROOT, file).split(sep).join('/');
  if (ALLOWED.has(rel)) return [];
  return stripComments(readFileSync(file, 'utf8'))
    .split('\n')
    .flatMap((line, i) => (LITERAL.some((re) => re.test(line)) ? [`${rel}:${i + 1}  ${line.trim()}`] : []));
});

if (offenders.length) {
  console.error(`Color literals outside src/styles/tokens.css (use a --vd-* token):\n${offenders.join('\n')}`);
  process.exit(1);
}
console.log('Design tokens: no color literals outside src/styles/tokens.css.');
