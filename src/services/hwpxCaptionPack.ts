import JSZip from 'jszip';

import type { PdfPhotosPerPage } from './settingsService';

export type HwpxCaptionRow = {
  label: string;
  value: string;
};

export type HwpxCaptionStamp = {
  orgName: string;
  rows: HwpxCaptionRow[];
  footerPhrase: string;
  footerDate: string;
  imageBytes: Uint8Array;
  imageExt: 'jpg' | 'png';
};

const PAGE_W = 59528;
const PAGE_H = 84186;
const MARGIN_L = 5668;
const MARGIN_R = 5668;
const MARGIN_T = 4252;
const MARGIN_B = 4252;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;
const CONTENT_H = PAGE_H - MARGIN_T - MARGIN_B;
const COL_GAP = 1134;
const TEXT_ROW_H = 1400;
const MIN_PIC_H = 4800;

/** Full Hancom HWPML namespace set (matches what Hancom Office itself emits in section/head/content.hpf root elements). */
const HWPML_NAMESPACES =
  'xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" xmlns:hp10="http://www.hancom.co.kr/hwpml/2016/paragraph" xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core" xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head" xmlns:hhs="http://www.hancom.co.kr/hwpml/2011/history" xmlns:hm="http://www.hancom.co.kr/hwpml/2011/master-page" xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf/" xmlns:ooxmlchart="http://www.hancom.co.kr/hwpml/2016/ooxmlchart" xmlns:hwpunitchar="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar" xmlns:epub="http://www.idpf.org/2007/ops" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0"';

function xmlText(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function pageShape(photosPerPage: PdfPhotosPerPage): { columns: number; rows: number } {
  if (photosPerPage === 4) {
    return { columns: 2, rows: 2 };
  }
  return { columns: photosPerPage, rows: 1 };
}

function columnWidth(columns: number): number {
  if (columns <= 1) {
    return CONTENT_W;
  }
  return Math.floor((CONTENT_W - (columns - 1) * COL_GAP) / columns);
}

function extraLineCount(stamp: HwpxCaptionStamp): number {
  return (
    (stamp.orgName.trim() ? 1 : 0) +
    stamp.rows.length +
    (stamp.footerPhrase.trim() ? 1 : 0) +
    (stamp.footerDate.trim() ? 1 : 0)
  );
}

function photoHeight(stamp: HwpxCaptionStamp, width: number, stackRows: number): number {
  const room = Math.floor(CONTENT_H / Math.max(1, stackRows)) - extraLineCount(stamp) * TEXT_ROW_H - 900;
  const byWidth = Math.round(width * 0.72);
  return Math.max(MIN_PIC_H, Math.min(room, byWidth));
}

function paragraph(text: string, width: number, pageBreak: '0' | '1', columnBreak: '0' | '1'): string {
  return `<hp:p paraPrIDRef="0" styleIDRef="0" pageBreak="${pageBreak}" columnBreak="${columnBreak}" merged="0"><hp:run charPrIDRef="0"><hp:t>${xmlText(text)}</hp:t></hp:run><hp:linesegarray><hp:lineseg textpos="0" vertpos="0" vertsize="1000" textheight="1000" baseline="850" spacing="200" horzpos="0" horzsize="${width}" flags="393216"/></hp:linesegarray></hp:p>`;
}

function pictureXml(imageId: string, width: number, height: number, picId: number): string {
  const cx = Math.round(width / 2);
  const cy = Math.round(height / 2);
  return `<hp:pic id="${picId}" zOrder="0" numberingType="PICTURE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" href="" groupLevel="0" instid="${picId}" reverse="0"><hp:offset x="0" y="0"/><hp:orgSz width="${width}" height="${height}"/><hp:curSz width="${width}" height="${height}"/><hp:flip horizontal="0" vertical="0"/><hp:rotationInfo angle="0" centerX="${cx}" centerY="${cy}" rotateimage="1"/><hp:renderingInfo><hc:transMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/><hc:scaMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/><hc:rotMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/></hp:renderingInfo><hc:img binaryItemIDRef="${imageId}" bright="0" contrast="0" effect="REAL_PIC" alpha="0"/><hp:imgRect><hc:pt0 x="0" y="0"/><hc:pt1 x="${width}" y="0"/><hc:pt2 x="${width}" y="${height}"/><hc:pt3 x="0" y="${height}"/></hp:imgRect><hp:imgClip left="0" right="${width}" top="0" bottom="${height}"/><hp:inMargin left="0" right="0" top="0" bottom="0"/><hp:imgDim dimwidth="${width}" dimheight="${height}"/><hp:effects/><hp:sz width="${width}" widthRelTo="ABSOLUTE" height="${height}" heightRelTo="ABSOLUTE" protect="0"/><hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="PARA" vertAlign="TOP" horzAlign="CENTER" vertOffset="0" horzOffset="0"/><hp:outMargin left="0" right="0" top="0" bottom="0"/></hp:pic>`;
}

function textParagraph(text: string, width: number, bold: boolean): string {
  const charPr = bold ? '1' : '0';
  return `<hp:p paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="${charPr}"><hp:t>${xmlText(text)}</hp:t></hp:run><hp:linesegarray><hp:lineseg textpos="0" vertpos="0" vertsize="1000" textheight="1000" baseline="850" spacing="160" horzpos="0" horzsize="${width}" flags="393216"/></hp:linesegarray></hp:p>`;
}

function cell(
  row: number,
  col: number,
  colSpan: number,
  width: number,
  height: number,
  inner: string,
  fillId: string,
): string {
  return `<hp:tc name="" header="0" hasMargin="1" protect="0" editable="0" dirty="0" borderFillIDRef="${fillId}"><hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0" metaTag="">${inner}</hp:subList><hp:cellAddr colAddr="${col}" rowAddr="${row}"/><hp:cellSpan colSpan="${colSpan}" rowSpan="1"/><hp:cellSz width="${width}" height="${height}"/><hp:cellMargin left="160" right="160" top="80" bottom="80"/></hp:tc>`;
}

function tableForStamp(params: {
  stamp: HwpxCaptionStamp;
  index: number;
  width: number;
  picHeight: number;
  pageBreak: '0' | '1';
  columnBreak: '0' | '1';
}): string {
  const imageId = `image${params.index + 1}`;
  const labelW = Math.max(7200, Math.round(params.width * 0.28));
  const valueW = params.width - labelW;
  const rows: string[] = [];
  let rowAddr = 0;

  const photoInner = `<hp:p paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:ctrl>${pictureXml(imageId, params.width - 400, params.picHeight, params.index + 1)}</hp:ctrl><hp:t/></hp:run><hp:linesegarray><hp:lineseg textpos="0" vertpos="0" vertsize="${params.picHeight}" textheight="${params.picHeight}" baseline="${Math.round(params.picHeight * 0.85)}" spacing="120" horzpos="0" horzsize="${params.width}" flags="393216"/></hp:linesegarray></hp:p>`;
  rows.push(
    `<hp:tr>${cell(rowAddr, 0, 2, params.width, params.picHeight + 280, photoInner, '1')}</hp:tr>`,
  );
  rowAddr += 1;

  const org = params.stamp.orgName.trim();
  if (org) {
    rows.push(
      `<hp:tr>${cell(rowAddr, 0, 2, params.width, TEXT_ROW_H, textParagraph(org, params.width, true), '2')}</hp:tr>`,
    );
    rowAddr += 1;
  }

  for (const row of params.stamp.rows) {
    rows.push(
      `<hp:tr>${cell(rowAddr, 0, 1, labelW, TEXT_ROW_H, textParagraph(row.label, labelW, true), '2')}${cell(rowAddr, 1, 1, valueW, TEXT_ROW_H, textParagraph(row.value, valueW, false), '2')}</hp:tr>`,
    );
    rowAddr += 1;
  }

  const phrase = params.stamp.footerPhrase.trim();
  if (phrase) {
    rows.push(
      `<hp:tr>${cell(rowAddr, 0, 2, params.width, TEXT_ROW_H, textParagraph(phrase, params.width, false), '2')}</hp:tr>`,
    );
    rowAddr += 1;
  }

  const date = params.stamp.footerDate.trim();
  if (date) {
    rows.push(
      `<hp:tr>${cell(rowAddr, 0, 2, params.width, TEXT_ROW_H, textParagraph(date, params.width, false), '2')}</hp:tr>`,
    );
    rowAddr += 1;
  }

  const totalH = params.picHeight + 280 + (rowAddr - 1) * TEXT_ROW_H;
  return `<hp:p paraPrIDRef="0" styleIDRef="0" pageBreak="${params.pageBreak}" columnBreak="${params.columnBreak}" merged="0"><hp:run charPrIDRef="0"><hp:ctrl><hp:tbl id="${1800000000 + params.index}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="NONE" repeatHeader="0" rowCnt="${rows.length}" colCnt="2" cellSpacing="0" borderFillIDRef="2" noAdjust="0"><hp:sz width="${params.width}" widthRelTo="ABSOLUTE" height="${totalH}" heightRelTo="ABSOLUTE" protect="0"/><hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="PARA" vertAlign="TOP" horzAlign="CENTER" vertOffset="0" horzOffset="0"/><hp:outMargin left="0" right="0" top="160" bottom="280"/><hp:inMargin left="0" right="0" top="0" bottom="0"/>${rows.join('')}</hp:tbl></hp:ctrl><hp:t/></hp:run><hp:linesegarray><hp:lineseg textpos="0" vertpos="0" vertsize="${totalH}" textheight="${totalH}" baseline="${Math.round(totalH * 0.85)}" spacing="200" horzpos="0" horzsize="${params.width}" flags="393216"/></hp:linesegarray></hp:p>`;
}

function placeKind(index: number, photosPerPage: PdfPhotosPerPage): 'page' | 'column' | 'continue' {
  if (index <= 0) {
    return 'continue';
  }
  if (photosPerPage === 4) {
    if (index % 4 === 0) {
      return 'page';
    }
    if (index % 4 === 2) {
      return 'column';
    }
    return 'continue';
  }
  if (photosPerPage <= 1) {
    return 'page';
  }
  if (index % photosPerPage === 0) {
    return 'page';
  }
  return 'column';
}

function sectionXml(
  reportTitle: string,
  exportedAt: string,
  stamps: HwpxCaptionStamp[],
  photosPerPage: PdfPhotosPerPage,
): string {
  const shape = pageShape(photosPerPage);
  const width = columnWidth(shape.columns);
  const body = stamps
    .map((stamp, index) => {
      const kind = placeKind(index, photosPerPage);
      return tableForStamp({
        stamp,
        index,
        width,
        picHeight: photoHeight(stamp, width, shape.rows),
        pageBreak: kind === 'page' ? '1' : '0',
        columnBreak: kind === 'column' ? '1' : '0',
      });
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hs:sec ${HWPML_NAMESPACES}>
<hp:p paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:secPr><hp:grid lineGrid="0" charGrid="0" wonggojiFormat="0"/><hp:startNum pageStartsOn="BOTH" page="1" pic="0" tbl="0" equation="0"/><hp:visibility hideFirstHeader="0" hideFirstFooter="0" hideFirstMasterPage="0" border="SHOW_ALL" fill="SHOW_ALL" hideFirstPageNum="0" hideFirstEmptyLine="0" showLineNumber="0"/><hp:pagePr landscape="WIDELY" width="${PAGE_W}" height="${PAGE_H}" gutterType="LEFT_ONLY"><hp:margin header="2834" footer="2834" gutter="0" left="${MARGIN_L}" right="${MARGIN_R}" top="${MARGIN_T}" bottom="${MARGIN_B}"/></hp:pagePr><hp:colPr type="NEWSPAPER" layout="LEFT" colCount="${shape.columns}" sameSz="1" sameGap="${COL_GAP}"/></hp:secPr><hp:t>${xmlText(reportTitle)}</hp:t></hp:run><hp:linesegarray><hp:lineseg textpos="0" vertpos="0" vertsize="1200" textheight="1200" baseline="1000" spacing="200" horzpos="0" horzsize="${CONTENT_W}" flags="393216"/></hp:linesegarray></hp:p>
${paragraph(exportedAt, CONTENT_W, '0', '0')}
${body}
</hs:sec>`;
}

function fontFace(lang: string): string {
  return `<hh:fontface lang="${lang}" fontCnt="1"><hh:font id="0" face="Noto Sans KR" type="TTF" isEmbedded="0"><hh:typeInfo familyType="FCAT_GOTHIC" weight="5" proportion="0" contrast="0" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="0"/></hh:font></hh:fontface>`;
}

function headerXml(): string {
  const faces = ['HANGUL', 'LATIN', 'HANJA', 'JAPANESE', 'OTHER', 'SYMBOL', 'USER']
    .map(fontFace)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hh:head ${HWPML_NAMESPACES} version="1.5" secCnt="1">
<hh:beginNum page="1" footnote="1" endnote="1" pic="1" tbl="1" equation="1"/>
<hh:refList>
<hh:fontfaces itemCnt="7">${faces}</hh:fontfaces>
<hh:borderFills itemCnt="2">
<hh:borderFill id="1" threeD="0" shadow="0" centerLine="NONE" breakCellSeparateLine="0"><hh:slash type="NONE" Crooked="0" isCounter="0"/><hh:backSlash type="NONE" Crooked="0" isCounter="0"/><hh:leftBorder type="NONE" width="0.12 mm" color="#000000"/><hh:rightBorder type="NONE" width="0.12 mm" color="#000000"/><hh:topBorder type="NONE" width="0.12 mm" color="#000000"/><hh:bottomBorder type="NONE" width="0.12 mm" color="#000000"/><hh:diagonal type="NONE" width="0.12 mm" color="#000000"/></hh:borderFill>
<hh:borderFill id="2" threeD="0" shadow="0" centerLine="NONE" breakCellSeparateLine="0"><hh:slash type="NONE" Crooked="0" isCounter="0"/><hh:backSlash type="NONE" Crooked="0" isCounter="0"/><hh:leftBorder type="SOLID" width="0.12 mm" color="#111827"/><hh:rightBorder type="SOLID" width="0.12 mm" color="#111827"/><hh:topBorder type="SOLID" width="0.12 mm" color="#111827"/><hh:bottomBorder type="SOLID" width="0.12 mm" color="#111827"/><hh:diagonal type="NONE" width="0.12 mm" color="#000000"/></hh:borderFill>
</hh:borderFills>
<hh:charProperties itemCnt="2">
<hh:charPr id="0" height="1000" textColor="#111827" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="1"><hh:fontRef hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/><hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/><hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/></hh:charPr>
<hh:charPr id="1" height="1000" textColor="#111827" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="1"><hh:fontRef hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/><hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/><hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/><hh:bold/></hh:charPr>
</hh:charProperties>
<hh:tabProperties itemCnt="1"><hh:tabPr id="0" autoTabLeft="0" autoTabRight="0"/></hh:tabProperties>
<hh:paraProperties itemCnt="1">
<hh:paraPr id="0" tabPrIDRef="0" condense="0" fontLineHeight="0" snapToGrid="1" suppressLineNumbers="0" checked="0"><hh:align horizontal="JUSTIFY" vertical="BASELINE"/><hh:heading type="NONE" idRef="0" level="0"/><hh:breakSetting breakLatinWord="KEEP_WORD" breakNonLatinWord="KEEP_WORD" widowOrphan="0" keepWithNext="0" keepLines="0" pageBreakBefore="0" lineWrap="BREAK"/><hh:margin indent="0" left="0" right="0" prev="0" next="0"/><hh:lineSpacing type="PERCENT" value="160" unit="HWPUNIT"/><hh:border borderFillIDRef="1" offsetLeft="0" offsetRight="0" offsetTop="0" offsetBottom="0" connect="0" ignoreMargin="0"/>
</hh:paraPr>
</hh:paraProperties>
<hh:styles itemCnt="1"><hh:style id="0" type="PARA" name="본문" engName="Body" paraPrIDRef="0" charPrIDRef="0" nextStyleIDRef="0" langID="1042" lockForm="0"/></hh:styles>
</hh:refList>
</hh:head>`;
}

function contentHpf(stamps: HwpxCaptionStamp[]): string {
  const images = stamps
    .map((stamp, index) => {
      const id = `image${index + 1}`;
      const ext = stamp.imageExt === 'png' ? 'png' : 'jpg';
      const media = stamp.imageExt === 'png' ? 'image/png' : 'image/jpeg';
      return `<opf:item id="${id}" href="BinData/${id}.${ext}" media-type="${media}" isEmbeded="1"/>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<opf:package ${HWPML_NAMESPACES} version="" unique-identifier="" id="">
<opf:metadata><opf:title>VoiceStamp</opf:title><opf:language>ko</opf:language></opf:metadata>
<opf:manifest>
<opf:item id="header" href="Contents/header.xml" media-type="application/xml"/>
<opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/>
${images}
</opf:manifest>
<opf:spine><opf:itemref idref="header" linear="yes"/><opf:itemref idref="section0" linear="yes"/></opf:spine>
</opf:package>`;
}

/** OCF/ODF-style rootfile manifest. Hancom readers treat this as part of package validity, not just content.hpf. */
function containerXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ocf:container xmlns:ocf="urn:oasis:names:tc:opendocument:xmlns:container" xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf">
<ocf:rootfiles><ocf:rootfile full-path="Contents/content.hpf" media-type="application/hwpml-package+xml"/><ocf:rootfile full-path="Preview/PrvText.txt" media-type="text/plain"/><ocf:rootfile full-path="META-INF/container.rdf" media-type="application/rdf+xml"/></ocf:rootfiles>
</ocf:container>`;
}

/** Required empty ODF manifest marker file — its absence, not just its content, breaks package validity for some readers. */
function manifestXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><odf:manifest xmlns:odf="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"/>`;
}

function containerRdfXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about=""><ns0:hasPart xmlns:ns0="http://www.hancom.co.kr/hwpml/2016/meta/pkg#" rdf:resource="Contents/header.xml"/></rdf:Description><rdf:Description rdf:about="Contents/header.xml"><rdf:type rdf:resource="http://www.hancom.co.kr/hwpml/2016/meta/pkg#HeaderFile"/></rdf:Description><rdf:Description rdf:about=""><ns0:hasPart xmlns:ns0="http://www.hancom.co.kr/hwpml/2016/meta/pkg#" rdf:resource="Contents/section0.xml"/></rdf:Description><rdf:Description rdf:about="Contents/section0.xml"><rdf:type rdf:resource="http://www.hancom.co.kr/hwpml/2016/meta/pkg#SectionFile"/></rdf:Description><rdf:Description rdf:about=""><rdf:type rdf:resource="http://www.hancom.co.kr/hwpml/2016/meta/pkg#Document"/></rdf:Description></rdf:RDF>`;
}

function versionXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hv:HCFVersion xmlns:hv="http://www.hancom.co.kr/hwpml/2011/version" tagetApplication="WORDPROCESSOR" major="5" minor="1" micro="1" buildNumber="0" os="1" xmlVersion="1.5" application="VoiceStamp" appVersion="1.0"/>`;
}

export async function buildHwpxCaptionPack(
  reportTitle: string,
  exportedAt: string,
  stamps: HwpxCaptionStamp[],
  photosPerPage: PdfPhotosPerPage,
): Promise<Uint8Array> {
  if (stamps.length === 0) {
    throw new Error('보낼 스탬프가 없습니다.');
  }

  const zip = new JSZip();
  zip.file('mimetype', 'application/hwp+zip', { compression: 'STORE' });
  zip.file('version.xml', versionXml());
  zip.file('META-INF/container.xml', containerXml());
  zip.file('META-INF/manifest.xml', manifestXml());
  zip.file('META-INF/container.rdf', containerRdfXml());
  zip.file('Contents/content.hpf', contentHpf(stamps));
  zip.file('Contents/header.xml', headerXml());
  zip.file(
    'Contents/section0.xml',
    sectionXml(reportTitle.trim() || 'VoiceStamp 보고서', exportedAt, stamps, photosPerPage),
  );
  zip.file('Preview/PrvText.txt', reportTitle.trim() || 'VoiceStamp');

  for (let i = 0; i < stamps.length; i++) {
    const ext = stamps[i].imageExt === 'png' ? 'png' : 'jpg';
    zip.file(`BinData/image${i + 1}.${ext}`, stamps[i].imageBytes);
  }

  return zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
