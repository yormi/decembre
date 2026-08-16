import { readFileSync, writeFileSync } from 'fs';

const [, , inputPath, outputPath, title] = process.argv;
const source = readFileSync(inputPath, 'utf8');

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const renderInline = (text) =>
  escapeHtml(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

const splitRow = (line) =>
  line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());

const isBullet = (line) => /^\s*[-*]\s+/.test(line);
const isNumbered = (line) => /^\s*\d+\.\s+/.test(line);
const isHeading = (line) => /^#{1,4}\s+/.test(line);
const isTable = (line) => /^\s*\|/.test(line);
const isBlank = (line) => line.trim() === '';

const lines = source.split('\n');
const html = [];
let listType = null;
let paragraph = [];

const flushParagraph = () => {
  if (paragraph.length) {
    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
    paragraph = [];
  }
};

const closeList = () => {
  if (listType) { html.push(`</${listType}>`); listType = null; }
};

const nextContentLine = (from) => {
  for (let i = from; i < lines.length; i += 1) {
    if (!isBlank(lines[i])) return lines[i];
  }
  return '';
};

for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index];

  if (isTable(line) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[index + 1] || '')) {
    flushParagraph();
    closeList();
    html.push('<table><thead><tr>');
    splitRow(line).forEach((cell) =>
      html.push(`<th>${renderInline(cell)}</th>`));
    html.push('</tr></thead><tbody>');
    index += 1;
    while (isTable(lines[index + 1] || '')) {
      index += 1;
      html.push('<tr>');
      splitRow(lines[index]).forEach((cell) =>
        html.push(`<td>${renderInline(cell)}</td>`));
      html.push('</tr>');
    }
    html.push('</tbody></table>');
    continue;
  }

  const heading = line.match(/^(#{1,4})\s+(.*)$/);
  if (heading) {
    flushParagraph();
    closeList();
    const level = heading[1].length;
    html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
    continue;
  }

  if (isBullet(line) || isNumbered(line)) {
    flushParagraph();
    const wanted = isBullet(line) ? 'ul' : 'ol';
    if (listType && listType !== wanted) closeList();
    if (!listType) { html.push(`<${wanted}>`); listType = wanted; }
    const text = line.replace(/^\s*(?:[-*]|\d+\.)\s+/, '');
    html.push(`<li>${renderInline(text)}</li>`);
    continue;
  }

  if (isBlank(line)) {
    flushParagraph();
    const upcoming = nextContentLine(index + 1);
    const continues =
      (listType === 'ul' && isBullet(upcoming)) ||
      (listType === 'ol' && isNumbered(upcoming));
    if (!continues) closeList();
    continue;
  }

  // Continuation of the previous list item, or plain prose.
  if (listType && /^\s{2,}\S/.test(line) && html[html.length - 1]?.endsWith('</li>')) {
    const previous = html[html.length - 1];
    html[html.length - 1] =
      `${previous.slice(0, -5)} ${renderInline(line.trim())}</li>`;
    continue;
  }
  closeList();
  paragraph.push(line.trim());
}
flushParagraph();
closeList();

const document = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  @page { size: letter; margin: 18mm 16mm; }
  body { font: 10.5pt/1.5 "Helvetica Neue", Arial, sans-serif;
         color: #1a1a1a; }
  h1 { font-size: 20pt; margin: 0 0 10pt; letter-spacing: -0.4pt; }
  h2 { font-size: 13pt; margin: 18pt 0 6pt; padding-bottom: 3pt;
       border-bottom: 1.5pt solid #2d5a3d; color: #2d5a3d;
       page-break-after: avoid; }
  h3 { font-size: 11pt; margin: 12pt 0 4pt; page-break-after: avoid; }
  h4 { font-size: 10pt; margin: 10pt 0 3pt; page-break-after: avoid; }
  p { margin: 0 0 7pt; }
  ul, ol { margin: 0 0 9pt; padding-left: 18pt; }
  li { margin-bottom: 3pt; }
  table { border-collapse: collapse; width: 100%; margin: 6pt 0 12pt;
          font-size: 9.5pt; page-break-inside: avoid; }
  th { background: #eef3ef; text-align: left; font-weight: 600;
       border-bottom: 1pt solid #2d5a3d; }
  th, td { padding: 4pt 6pt; vertical-align: top;
           border-bottom: 0.5pt solid #d8ddd9; }
  code { background: #f1f3f1; padding: 0 2pt; font-size: 9pt;
         border-radius: 2pt; }
  strong { color: #14301f; }
  a { color: #2d5a3d; }
</style></head><body>
${html.join('\n')}
</body></html>`;

writeFileSync(outputPath, document);
