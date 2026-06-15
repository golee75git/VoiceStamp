import fs from 'fs';
import JSZip from 'jszip';

const SOURCE = 'assets/templates/report-source.hwpx';
const OUT = 'assets/templates/report.hwpx';
const PUBLIC_OUT = 'public/templates/report.hwpx';
const SOURCE_URL =
  'https://raw.githubusercontent.com/hajeong-lim/auto-hwpx/main/demo-assets/example.hwpx';

if (!fs.existsSync(SOURCE)) {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Failed to download template source: ${SOURCE_URL}`);
  }
  fs.mkdirSync('assets/templates', { recursive: true });
  fs.writeFileSync(SOURCE, Buffer.from(await res.arrayBuffer()));
}

const z = await JSZip.loadAsync(fs.readFileSync(SOURCE));
const section0 = await z.file('Contents/section0.xml').async('string');

const secOpen = section0.match(/^[\s\S]*?<hs:sec[^>]*>/)?.[0] ?? '';
const secPrPara = section0.match(/<hp:p[^>]*>[\s\S]*?<hp:secPr>[\s\S]*?<\/hp:p>/)?.[0] ?? '';

function textPara(text, paraPrIDRef = '21', charPrIDRef = '12') {
  return `<hp:p id="2147483648" paraPrIDRef="${paraPrIDRef}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="${charPrIDRef}"><hp:t>${text}</hp:t></hp:run><hp:linesegarray><hp:lineseg textpos="0" vertpos="0" vertsize="1000" textheight="1000" baseline="850" spacing="600" horzpos="0" horzsize="47368" flags="393216"/></hp:linesegarray></hp:p>`;
}

const img1Index = section0.indexOf('{{@img1}}');
const picStart = section0.indexOf('<hp:pic ', img1Index);
const picEnd = section0.indexOf('</hp:pic>', picStart) + '</hp:pic>'.length;
const picParaStart = section0.lastIndexOf('<hp:p ', picStart);
const picParaEnd = section0.indexOf('</hp:p>', picEnd) + '</hp:p>'.length;
const imagePara = section0.slice(picParaStart, picParaEnd);
const imageParaStamp = imagePara
  .replace('{{@img1}}', '{{@stampImage}}')
  .replace(/binaryItemIDRef="image1"/g, 'binaryItemIDRef="image1"')
  .replace(/\{\{caption1\}\}/g, '')
  .replace(/<hp:caption[\s\S]*?<\/hp:caption>/g, '');

const stampBlock = [
  textPara('{{STAMP_BLOCK_START}}', '31', '12'),
  textPara('{{stampIndex}}. {{stampTitle}}', '31', '17'),
  textPara('{{stampMemo}}', '31', '12'),
  textPara('{{stampMeta}}', '31', '7'),
  textPara('{{@stampImage}}', '20', '19'),
  imageParaStamp,
  textPara('{{STAMP_BLOCK_END}}', '31', '12'),
].join('');

const newSection = `${secOpen}
${secPrPara}
${textPara('{{reportTitle}}', '21', '17')}
${textPara('생성: {{exportedAt}}', '31', '7')}
${textPara(' ', '31', '12')}
${stampBlock}
</hs:sec>`;

z.file('Contents/section0.xml', newSection);

// Keep only image1 in BinData for template placeholder
const binFiles = Object.keys(z.files).filter((n) => n.startsWith('BinData/') && !n.endsWith('/'));
for (const name of binFiles) {
  if (name !== 'BinData/image1.png') {
    z.remove(name);
  }
}

// Update content.hpf - remove image2 reference if any
let hpf = await z.file('Contents/content.hpf').async('string');
hpf = hpf.replace(
  /<opf:item id="image2" href="BinData\/image2\.png"[^>]*\/>/g,
  '',
);
z.file('Contents/content.hpf', hpf);

let manifest = await z.file('META-INF/manifest.xml').async('string');
manifest = manifest.replace(
  /<manifest:file-entry[^>]*manifest:full-path="BinData\/image2\.png"[^>]*\/>\s*/g,
  '',
);
z.file('META-INF/manifest.xml', manifest);

const outBytes = await z.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 6 },
});

fs.mkdirSync('public/templates', { recursive: true });
fs.writeFileSync(OUT, outBytes);
fs.copyFileSync(OUT, PUBLIC_OUT);
console.log('Wrote', OUT, outBytes.length, 'bytes');
