/**
 * VoiceStamp 자체 HWPX 껍데기를 만든다.
 * 외부 예제·URL을 받지 않는다. 자리 표시는 exportHwpx / hwpxTemplate 과 맞춘다.
 */
import fs from 'fs';
import JSZip from 'jszip';

const OUT = 'assets/templates/vs-form.hwpx';
const PUBLIC_OUT = 'public/templates/report.hwpx';

const NS =
  'xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" ' +
  'xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core" ' +
  'xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" ' +
  'xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head" ' +
  'xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app"';

/** 1×1 PNG (자리만). 글꼴 파일 아님. */
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

function para(text, paraPr, charPr) {
  return (
    `<hp:p id="0" paraPrIDRef="${paraPr}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">` +
    `<hp:run charPrIDRef="${charPr}"><hp:t>${text}</hp:t></hp:run>` +
    `<hp:linesegarray><hp:lineseg textpos="0" vertpos="0" vertsize="1000" textheight="1000" baseline="850" spacing="600" horzpos="0" horzsize="48000" flags="0"/></hp:linesegarray>` +
    `</hp:p>`
  );
}

const picPara =
  `<hp:p id="0" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">` +
  `<hp:run charPrIDRef="0">` +
  `<hp:pic id="0" zOrder="0" numberingType="PICTURE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0">` +
  `<hp:offset x="0" y="0"/>` +
  `<hp:orgSz width="42000" height="31500"/>` +
  `<hp:curSz width="42000" height="31500"/>` +
  `<hp:flip horizontal="0" vertical="0"/>` +
  `<hp:rotationInfo rotateAngle="0" imageRotate="0"/>` +
  `<hp:renderingInfo>` +
  `<hc:transMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/>` +
  `<hc:scaMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/>` +
  `<hc:rotMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/>` +
  `</hp:renderingInfo>` +
  `<hc:img binaryItemIDRef="image1" bright="0" contrast="0" effect="REAL_PIC" alpha="0"/>` +
  `</hp:pic>` +
  `</hp:run>` +
  `<hp:linesegarray><hp:lineseg textpos="0" vertpos="0" vertsize="31500" textheight="31500" baseline="31500" spacing="600" horzpos="0" horzsize="42000" flags="0"/></hp:linesegarray>` +
  `</hp:p>`;

const secPr =
  `<hp:p id="0" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">` +
  `<hp:run charPrIDRef="0">` +
  `<hp:secPr id="" textDirection="HORIZONTAL" spaceColumns="1134" tabStop="8000" outlineShapeIDRef="1" memoShapeIDRef="0" textVerticalWidthHead="0" masterPageCnt="0">` +
  `<hp:grid lineGrid="0" charGrid="0" wonggojiFormat="0"/>` +
  `<hp:startNum pageStartsOn="BOTH" page="0" pic="0" tbl="0" equation="0"/>` +
  `<hp:visibility hideFirstHeader="0" hideFirstFooter="0" hideFirstMasterPage="0" border="SHOW_ALL" fill="SHOW_ALL" hideFirstPageNum="0" hideFirstEmptyLine="0" showLineNumber="0"/>` +
  `<hp:pagePr landscape="WIDELY" width="59528" height="84188" gutterType="LEFT_ONLY">` +
  `<hp:margin header="4252" footer="4252" gutter="0" left="5668" right="5668" top="4252" bottom="4252"/>` +
  `</hp:pagePr>` +
  `</hp:secPr>` +
  `</hp:run>` +
  `</hp:p>`;

const section0 =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<hs:sec ${NS}>` +
  secPr +
  para('{{reportTitle}}', '1', '1') +
  para('{{exportedAt}}', '2', '2') +
  para('{{STAMP_BLOCK_START}}', '0', '0') +
  para('{{stampIndex}}. {{stampTitle}}', '1', '1') +
  para('{{stampMemo}}', '0', '0') +
  para('{{stampMeta}}', '2', '2') +
  para('{{@stampImage}}', '0', '0') +
  picPara +
  para('{{STAMP_BLOCK_END}}', '0', '0') +
  `</hs:sec>`;

const header =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<hh:head ${NS} version="1.4" secCnt="1">` +
  `<hh:beginNum page="1" para="1" footnote="1" endnote="1" pic="1" tbl="1" equation="1"/>` +
  `<hh:refList>` +
  `<hh:fontfaces hangulFontCount="1" latinFontCount="1" hanjaFontCount="1" japaneseFontCount="1" otherFontCount="1" symbolFontCount="1" userFontCount="0">` +
  `<hh:fontface lang="HANGUL"><hh:font id="0" face="함초롬돋움" type="TTF" isEmbedded="0"><hh:typeInfo familyType="FCAT_GOTHIC" serifStyle="0" weight="6" proportion="0" contrast="0" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="0"/></hh:font></hh:fontface>` +
  `<hh:fontface lang="LATIN"><hh:font id="0" face="함초롬돋움" type="TTF" isEmbedded="0"><hh:typeInfo familyType="FCAT_GOTHIC" serifStyle="0" weight="6" proportion="0" contrast="0" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="0"/></hh:font></hh:fontface>` +
  `<hh:fontface lang="HANJA"><hh:font id="0" face="함초롬돋움" type="TTF" isEmbedded="0"><hh:typeInfo familyType="FCAT_GOTHIC" serifStyle="0" weight="6" proportion="0" contrast="0" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="0"/></hh:font></hh:fontface>` +
  `<hh:fontface lang="JAPANESE"><hh:font id="0" face="함초롬돋움" type="TTF" isEmbedded="0"><hh:typeInfo familyType="FCAT_GOTHIC" serifStyle="0" weight="6" proportion="0" contrast="0" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="0"/></hh:font></hh:fontface>` +
  `<hh:fontface lang="OTHER"><hh:font id="0" face="함초롬돋움" type="TTF" isEmbedded="0"><hh:typeInfo familyType="FCAT_GOTHIC" serifStyle="0" weight="6" proportion="0" contrast="0" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="0"/></hh:font></hh:fontface>` +
  `<hh:fontface lang="SYMBOL"><hh:font id="0" face="함초롬돋움" type="TTF" isEmbedded="0"><hh:typeInfo familyType="FCAT_GOTHIC" serifStyle="0" weight="6" proportion="0" contrast="0" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="0"/></hh:font></hh:fontface>` +
  `<hh:fontface lang="USER"/>` +
  `</hh:fontfaces>` +
  `<hh:borderFills>` +
  `<hh:borderFill id="1" threeD="0" shadow="0" centerLine="NONE" breakCellSeparateLine="0"><hh:slash type="NONE" Crooked="0" isCounter="0"/><hh:backSlash type="NONE" Crooked="0" isCounter="0"/><hh:leftBorder type="NONE" width="0.12 mm" color="#000000"/><hh:rightBorder type="NONE" width="0.12 mm" color="#000000"/><hh:topBorder type="NONE" width="0.12 mm" color="#000000"/><hh:bottomBorder type="NONE" width="0.12 mm" color="#000000"/><hh:diagonal type="SOLID" width="0.12 mm" color="#000000"/></hh:borderFill>` +
  `</hh:borderFills>` +
  `<hh:charProperties>` +
  `<hh:charPr id="0" height="1000" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="0"><hh:fontRef hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/><hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/><hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/></hh:charPr>` +
  `<hh:charPr id="1" height="1600" textColor="#111111" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="0" bold="1"><hh:fontRef hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/><hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/><hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/></hh:charPr>` +
  `<hh:charPr id="2" height="900" textColor="#555555" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="0"><hh:fontRef hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/><hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/><hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/></hh:charPr>` +
  `</hh:charProperties>` +
  `<hh:tabProperties><hh:tabPr id="0" autoTabLeft="0" autoTabRight="0"/></hh:tabProperties>` +
  `<hh:paraProperties>` +
  `<hh:paraPr id="0" tabPrIDRef="0" condence="0" fontLineHeight="0" snapToGrid="0"><hh:align horizontal="LEFT" vertical="BASELINE"/><hh:heading type="NONE" idRef="0" level="0"/><hh:breakSetting breakLatinWord="KEEP_WORD" breakNonLatinWord="KEEP_WORD" widowOrphan="0" keepWithNext="0" keepLines="0" pageBreakBefore="0" lineWrap="BREAK"/><hh:autoSpacing eAsianEng="0" eAsianNum="0"/><hh:switchMargin/><hh:lineSpacing type="PERCENT" value="160" unit="PERCENT"/><hh:border borderFillIDRef="1" offsetLeft="0" offsetRight="0" offsetTop="0" offsetBottom="0" connect="0" ignoreMargin="0"/></hh:paraPr>` +
  `<hh:paraPr id="1" tabPrIDRef="0" condence="0" fontLineHeight="0" snapToGrid="0"><hh:align horizontal="LEFT" vertical="BASELINE"/><hh:heading type="NONE" idRef="0" level="0"/><hh:breakSetting breakLatinWord="KEEP_WORD" breakNonLatinWord="KEEP_WORD" widowOrphan="0" keepWithNext="0" keepLines="0" pageBreakBefore="0" lineWrap="BREAK"/><hh:autoSpacing eAsianEng="0" eAsianNum="0"/><hh:switchMargin/><hh:lineSpacing type="PERCENT" value="150" unit="PERCENT"/><hh:border borderFillIDRef="1" offsetLeft="0" offsetRight="0" offsetTop="0" offsetBottom="0" connect="0" ignoreMargin="0"/></hh:paraPr>` +
  `<hh:paraPr id="2" tabPrIDRef="0" condence="0" fontLineHeight="0" snapToGrid="0"><hh:align horizontal="LEFT" vertical="BASELINE"/><hh:heading type="NONE" idRef="0" level="0"/><hh:breakSetting breakLatinWord="KEEP_WORD" breakNonLatinWord="KEEP_WORD" widowOrphan="0" keepWithNext="0" keepLines="0" pageBreakBefore="0" lineWrap="BREAK"/><hh:autoSpacing eAsianEng="0" eAsianNum="0"/><hh:switchMargin/><hh:lineSpacing type="PERCENT" value="140" unit="PERCENT"/><hh:border borderFillIDRef="1" offsetLeft="0" offsetRight="0" offsetTop="0" offsetBottom="0" connect="0" ignoreMargin="0"/></hh:paraPr>` +
  `</hh:paraProperties>` +
  `<hh:styles>` +
  `<hh:style id="0" type="PARA" name="VoiceStamp Body" engName="Body" paraPrIDRef="0" charPrIDRef="0" nextStyleIDRef="0" langID="1042" lockForm="0"/>` +
  `</hh:styles>` +
  `</hh:refList>` +
  `</hh:head>`;

const contentHpf =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<opf:package xmlns:opf="http://www.idpf.org/2007/opf" unique-identifier="voicestamp-hwpx">` +
  `<opf:metadata><opf:title>VoiceStamp</opf:title><opf:language>ko</opf:language></opf:metadata>` +
  `<opf:manifest>` +
  `<opf:item id="header" href="header.xml" media-type="application/xml"/>` +
  `<opf:item id="section0" href="section0.xml" media-type="application/xml"/>` +
  `<opf:item id="image1" href="BinData/image1.png" media-type="image/png" isEmbeded="1"/>` +
  `</opf:manifest>` +
  `<opf:spine><opf:itemref idref="section0"/></opf:spine>` +
  `</opf:package>`;

const container =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">` +
  `<rootfiles><rootfile full-path="Contents/content.hpf" media-type="application/hwpml-package+xml"/></rootfiles>` +
  `</container>`;

const manifest =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<odf:manifest xmlns:odf="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" odf:version="1.2">` +
  `<odf:file-entry odf:full-path="/" odf:media-type="application/hwpml-package+zip"/>` +
  `<odf:file-entry odf:full-path="Contents/content.hpf" odf:media-type="application/hwpml-package+xml"/>` +
  `<odf:file-entry odf:full-path="Contents/header.xml" odf:media-type="application/xml"/>` +
  `<odf:file-entry odf:full-path="Contents/section0.xml" odf:media-type="application/xml"/>` +
  `<odf:file-entry odf:full-path="BinData/image1.png" odf:media-type="image/png"/>` +
  `</odf:manifest>`;

const versionXml =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<ha:HWPApplicationSetting xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app">` +
  `<ha:CaretPosition listIDRef="0" paraIDRef="0" pos="0"/>` +
  `</ha:HWPApplicationSetting>`;

const zip = new JSZip();
zip.file('mimetype', 'application/hwpml-package+zip', { compression: 'STORE' });
zip.file('version.xml', versionXml);
zip.file('META-INF/container.xml', container);
zip.file('META-INF/manifest.xml', manifest);
zip.file('Contents/content.hpf', contentHpf);
zip.file('Contents/header.xml', header);
zip.file('Contents/section0.xml', section0);
zip.file('BinData/image1.png', PLACEHOLDER_PNG);

const outBytes = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 6 },
});

fs.mkdirSync('assets/templates', { recursive: true });
fs.mkdirSync('public/templates', { recursive: true });
fs.writeFileSync(OUT, outBytes);
fs.copyFileSync(OUT, PUBLIC_OUT);

const check = await JSZip.loadAsync(outBytes);
const sec = await check.file('Contents/section0.xml').async('string');
const need = [
  '{{reportTitle}}',
  '{{exportedAt}}',
  '{{STAMP_BLOCK_START}}',
  '{{STAMP_BLOCK_END}}',
  '{{stampTitle}}',
  '{{@stampImage}}',
  'binaryItemIDRef="image1"',
];
for (const token of need) {
  if (!sec.includes(token)) {
    throw new Error('자리 표시 없음: ' + token);
  }
}
if (!check.file('BinData/image1.png')) {
  throw new Error('BinData/image1.png 없음');
}

const stale = 'assets/templates/report-source.hwpx';
if (fs.existsSync(stale)) {
  fs.unlinkSync(stale);
}

console.log('Wrote', OUT, outBytes.length, 'bytes');
console.log('Wrote', PUBLIC_OUT);
console.log('Removed', stale);
