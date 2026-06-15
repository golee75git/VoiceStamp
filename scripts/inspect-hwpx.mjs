import fs from 'fs';
import JSZip from 'jszip';

const z = await JSZip.loadAsync(fs.readFileSync('assets/templates/report-source.hwpx'));
const s = await z.file('Contents/section0.xml').async('string');
const i = s.indexOf('{{@img1}}');
const chunk = s.slice(i, i + 12000);
const m = chunk.match(/binaryItemIDRef="([^"]+)"/);
console.log('binary ref', m?.[1]);
console.log(chunk.slice(0, 2500));
