/**
 * VoiceStamp /report — client-side JPEG export (watermark + caption).
 * No server upload; mirrors app web canvas rules in exportStampImage.ts.
 */
(function (global) {
  const STAMP_JPEG_MAX_WIDTH = 2048;
  const STAMP_JPEG_COMPRESS = 0.85;
  const TEXT_SCALE_PRESETS = [0.75, 1, 1.25, 1.5];

  function scalePx(base, textScale) {
    return Math.max(1, Math.round(base * textScale));
  }

  function normalizeTextScale(value) {
    const num = Number(value);
    return TEXT_SCALE_PRESETS.includes(num) ? num : 1;
  }

  function getLayoutSizes(textLayout, textScale) {
    if (textLayout === 'watermark') {
      return {
        barPaddingX: scalePx(20, textScale),
        barPaddingY: scalePx(16, textScale),
        orgFont: scalePx(26, textScale),
        orgLine: scalePx(30, textScale),
        titleFont: scalePx(32, textScale),
        titleLine: scalePx(38, textScale),
        memoFont: scalePx(26, textScale),
        memoLine: scalePx(32, textScale),
        coordsFont: scalePx(22, textScale),
        coordsLine: scalePx(28, textScale),
        phraseFont: scalePx(18, textScale),
        phraseLine: scalePx(24, textScale),
        memoGapBefore: scalePx(8, textScale),
        coordsGapBefore: scalePx(6, textScale),
        phraseGapBefore: scalePx(4, textScale),
        orgGapAfter: scalePx(4, textScale),
        titleAfterGap: scalePx(4, textScale),
        memoAfterGap: scalePx(4, textScale),
        titleBaseline: scalePx(28, textScale),
        orgBaseline: scalePx(22, textScale),
      };
    }

    return {
      padding: scalePx(24, textScale),
      orgFont: scalePx(28, textScale),
      orgLine: scalePx(36, textScale),
      titleFont: scalePx(36, textScale),
      titleLine: scalePx(44, textScale),
      memoFont: scalePx(28, textScale),
      memoLine: scalePx(36, textScale),
      coordsFont: scalePx(24, textScale),
      coordsLine: scalePx(32, textScale),
      phraseFont: scalePx(22, textScale),
      phraseLine: scalePx(28, textScale),
      imgToTextGap: scalePx(16, textScale),
      titleStartOffset: scalePx(40, textScale),
      orgGapBefore: scalePx(8, textScale),
      memoGapBefore: scalePx(12, textScale),
      coordsGapBefore: scalePx(8, textScale),
      phraseGapBefore: scalePx(8, textScale),
      titleAfterGap: scalePx(4, textScale),
      memoAfterGap: scalePx(8, textScale),
    };
  }

  function getWatermarkTheme(style) {
    const lightText = {
      titleColor: '#ffffff',
      memoColor: '#f3f4f6',
      coordsColor: '#e5e7eb',
    };
    const darkText = {
      titleColor: '#111827',
      memoColor: '#374151',
      coordsColor: '#6b7280',
    };
    const themes = {
      solid_dark: { barBackground: 'rgba(0, 0, 0, 0.55)', ...lightText },
      solid_light: { barBackground: 'rgba(255, 255, 255, 0.55)', ...darkText },
      slate: { barBackground: 'rgba(203, 213, 225, 0.55)', ...darkText },
      blue: { barBackground: 'rgba(147, 197, 253, 0.55)', ...darkText },
      indigo: { barBackground: 'rgba(165, 180, 252, 0.55)', ...darkText },
      green: { barBackground: 'rgba(134, 239, 172, 0.55)', ...darkText },
      teal: { barBackground: 'rgba(153, 246, 228, 0.55)', ...darkText },
      amber: { barBackground: 'rgba(253, 230, 138, 0.55)', ...darkText },
      red: { barBackground: 'rgba(252, 165, 165, 0.55)', ...darkText },
      rose: { barBackground: 'rgba(251, 207, 232, 0.55)', ...darkText },
    };
    return themes[style] || themes.solid_dark;
  }

  const VALID_WATERMARK_STYLES = new Set([
    'solid_dark',
    'solid_light',
    'slate',
    'blue',
    'indigo',
    'green',
    'teal',
    'amber',
    'red',
    'rose',
  ]);

  function sanitizeWatermarkStyle(value) {
    return VALID_WATERMARK_STYLES.has(value) ? value : 'solid_dark';
  }

  function drawWatermarkBar(ctx, x, y, width, height, style) {
    const theme = getWatermarkTheme(style);
    ctx.fillStyle = theme.barBackground;
    ctx.fillRect(x, y, width, height);
  }

  function wrapCanvasLines(ctx, text, maxWidth) {
    const paragraphs = String(text).split('\n');
    const lines = [];
    for (const paragraph of paragraphs) {
      let current = '';
      for (const char of paragraph) {
        const next = current + char;
        if (ctx.measureText(next).width > maxWidth && current) {
          lines.push(current);
          current = char;
        } else {
          current = next;
        }
      }
      if (current) {
        lines.push(current);
      }
    }
    return lines.length > 0 ? lines : [''];
  }

  function drawAlignedText(ctx, text, x, y, width, align, fontSize, fontWeight, color, lineHeight) {
    ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    const lines = wrapCanvasLines(ctx, text, width);
    let cursorY = y;
    for (const line of lines) {
      let drawX = x;
      const lineWidth = ctx.measureText(line).width;
      if (align === 'center') {
        drawX = x + (width - lineWidth) / 2;
      } else if (align === 'right') {
        drawX = x + width - lineWidth;
      }
      ctx.fillText(line, drawX, cursorY);
      cursorY += lineHeight;
    }
    return cursorY;
  }

  function stripDateTimePrefixFromTitle(title) {
    return String(title).trim().replace(/^\d{8}(?:_\d{4})?_?/, '').trim();
  }

  function pdfDisplayTitle(rawTitle, showDatetime) {
    const raw = String(rawTitle ?? '').trim();
    if (!raw) {
      return '(제목 없음)';
    }
    if (showDatetime) {
      return raw;
    }
    const stripped = stripDateTimePrefixFromTitle(raw);
    return stripped || '(제목 없음)';
  }

  function formatFloorSuffix(floor) {
    if (!floor) {
      return '';
    }
    return ` ${floor}층`;
  }

  function stampDisplayTitle(stamp, showDatetime) {
    const base = pdfDisplayTitle(stamp.title, showDatetime);
    const suffix = formatFloorSuffix(stamp.floor);
    if (base === '(제목 없음)' && suffix) {
      return suffix.trim();
    }
    return base + suffix;
  }

  function stampCoordinatesLine(stamp, labelMode) {
    const latitude = stamp.latitude;
    const longitude = stamp.longitude;
    if (latitude == null || longitude == null) {
      return null;
    }
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      return null;
    }
    const numbers = `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`;
    if (labelMode === 'gps') {
      return `GPS ${numbers}`;
    }
    if (labelMode === 'coords') {
      return `좌표 ${numbers}`;
    }
    return numbers;
  }

  function sanitizeOverlayText(text, maxLength) {
    return String(text ?? '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, maxLength);
  }

  function resolveOverlayOrgName(options) {
    if (!options.showOrgName) {
      return null;
    }
    const trimmed = sanitizeOverlayText(options.orgName, 80);
    return trimmed || null;
  }

  function resolveOverlayFooterPhrase(options) {
    if (!options.showFooterPhrase) {
      return null;
    }
    const trimmed = sanitizeOverlayText(options.footerPhrase, 120);
    return trimmed || null;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
      img.src = src;
    });
  }

  function canvasToBlob(canvas, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('JPEG 변환에 실패했습니다.'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        quality,
      );
    });
  }

  function sanitizeExportBaseName(name) {
    const cleaned = String(name).trim().replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ');
    return cleaned || 'VoiceStamp';
  }

  function exportFileName(stamp, index) {
    const base = sanitizeExportBaseName(stamp.title || 'VoiceStamp');
    const pad = String(index + 1).padStart(3, '0');
    return `${pad}_${base}.jpg`;
  }

  async function renderStampJpegWatermark(stamp, imageUrl, options) {
    const img = await loadImage(imageUrl);
    const scale = img.width > STAMP_JPEG_MAX_WIDTH ? STAMP_JPEG_MAX_WIDTH / img.width : 1;
    const imgWidth = Math.max(1, Math.round(img.width * scale));
    const imgHeight = Math.max(1, Math.round(img.height * scale));
    const sizes = getLayoutSizes('watermark', options.textScale);

    const title = stampDisplayTitle(stamp, options.showDatetime);
    const memo = String(stamp.memo ?? '').trim();
    const coords = stampCoordinatesLine(stamp, options.coordsLabel) ?? '';
    const orgName = resolveOverlayOrgName(options) ?? '';
    const footerPhrase = resolveOverlayFooterPhrase(options) ?? '';
    const textWidth = imgWidth - sizes.barPaddingX * 2;

    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    if (!measureCtx) {
      throw new Error('캔버스를 사용할 수 없습니다.');
    }

    measureCtx.font = `700 ${sizes.orgFont}px sans-serif`;
    const orgLines = orgName ? wrapCanvasLines(measureCtx, orgName, textWidth) : [];

    measureCtx.font = `700 ${sizes.titleFont}px sans-serif`;
    const titleLines = wrapCanvasLines(measureCtx, title, textWidth);
    measureCtx.font = `400 ${sizes.memoFont}px sans-serif`;
    const memoLines = memo ? wrapCanvasLines(measureCtx, memo, textWidth) : [];
    measureCtx.font = `400 ${sizes.coordsFont}px sans-serif`;
    const coordsLines = coords ? wrapCanvasLines(measureCtx, coords, textWidth) : [];
    measureCtx.font = `400 ${sizes.phraseFont}px sans-serif`;
    const phraseLines = footerPhrase ? wrapCanvasLines(measureCtx, footerPhrase, textWidth) : [];

    const barHeight =
      sizes.barPaddingY +
      (orgLines.length > 0 ? orgLines.length * sizes.orgLine + sizes.orgGapAfter : 0) +
      titleLines.length * sizes.titleLine +
      (memoLines.length > 0 ? sizes.memoGapBefore + memoLines.length * sizes.memoLine : 0) +
      (coordsLines.length > 0 ? sizes.coordsGapBefore + coordsLines.length * sizes.coordsLine : 0) +
      (phraseLines.length > 0 ? sizes.phraseGapBefore + phraseLines.length * sizes.phraseLine : 0) +
      sizes.barPaddingY;

    const canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('캔버스를 사용할 수 없습니다.');
    }

    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
    const theme = getWatermarkTheme(options.watermarkStyle);

    drawWatermarkBar(ctx, 0, imgHeight - barHeight, imgWidth, barHeight, options.watermarkStyle);

    let textY =
      imgHeight -
      barHeight +
      sizes.barPaddingY +
      (orgName ? sizes.orgBaseline : sizes.titleBaseline);

    if (orgName) {
      textY =
        drawAlignedText(
          ctx,
          orgName,
          sizes.barPaddingX,
          textY,
          textWidth,
          options.titleAlign,
          sizes.orgFont,
          '700',
          theme.titleColor,
          sizes.orgLine,
        ) + sizes.orgGapAfter;
    }

    textY =
      drawAlignedText(
        ctx,
        title,
        sizes.barPaddingX,
        textY,
        textWidth,
        options.titleAlign,
        sizes.titleFont,
        '700',
        theme.titleColor,
        sizes.titleLine,
      ) + sizes.titleAfterGap;

    if (memo) {
      textY = drawAlignedText(
        ctx,
        memo,
        sizes.barPaddingX,
        textY + sizes.memoAfterGap,
        textWidth,
        options.memoAlign,
        sizes.memoFont,
        '400',
        theme.memoColor,
        sizes.memoLine,
      );
    }

    if (coords) {
      textY = drawAlignedText(
        ctx,
        coords,
        sizes.barPaddingX,
        textY + sizes.memoAfterGap,
        textWidth,
        options.memoAlign,
        sizes.coordsFont,
        '400',
        theme.coordsColor,
        sizes.coordsLine,
      );
    }

    if (footerPhrase) {
      drawAlignedText(
        ctx,
        footerPhrase,
        sizes.barPaddingX,
        textY + sizes.memoAfterGap,
        textWidth,
        options.memoAlign,
        sizes.phraseFont,
        '400',
        theme.coordsColor,
        sizes.phraseLine,
      );
    }

    return canvasToBlob(canvas, STAMP_JPEG_COMPRESS);
  }

  async function renderStampJpegCaption(stamp, imageUrl, options) {
    const img = await loadImage(imageUrl);
    const scale = img.width > STAMP_JPEG_MAX_WIDTH ? STAMP_JPEG_MAX_WIDTH / img.width : 1;
    const imgWidth = Math.max(1, Math.round(img.width * scale));
    const imgHeight = Math.max(1, Math.round(img.height * scale));
    const sizes = getLayoutSizes('caption', options.textScale);

    const padding = sizes.padding;
    const contentWidth = imgWidth;
    const title = stampDisplayTitle(stamp, options.showDatetime);
    const memo = String(stamp.memo ?? '').trim();
    const coords = stampCoordinatesLine(stamp, options.coordsLabel) ?? '';
    const orgName = resolveOverlayOrgName(options) ?? '';
    const footerPhrase = resolveOverlayFooterPhrase(options) ?? '';

    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    if (!measureCtx) {
      throw new Error('캔버스를 사용할 수 없습니다.');
    }

    measureCtx.font = `700 ${sizes.orgFont}px sans-serif`;
    const orgLines = orgName ? wrapCanvasLines(measureCtx, orgName, contentWidth) : [];
    measureCtx.font = `700 ${sizes.titleFont}px sans-serif`;
    const titleLines = wrapCanvasLines(measureCtx, title, contentWidth);
    measureCtx.font = `400 ${sizes.memoFont}px sans-serif`;
    const memoLines = memo ? wrapCanvasLines(measureCtx, memo, contentWidth) : [];
    measureCtx.font = `400 ${sizes.coordsFont}px sans-serif`;
    const coordsLines = coords ? wrapCanvasLines(measureCtx, coords, contentWidth) : [];
    measureCtx.font = `400 ${sizes.phraseFont}px sans-serif`;
    const phraseLines = footerPhrase ? wrapCanvasLines(measureCtx, footerPhrase, contentWidth) : [];

    const canvasWidth = contentWidth + padding * 2;
    const canvasHeight =
      padding +
      imgHeight +
      sizes.imgToTextGap +
      (orgLines.length > 0 ? sizes.orgGapBefore + orgLines.length * sizes.orgLine : 0) +
      titleLines.length * sizes.titleLine +
      (memoLines.length > 0 ? sizes.memoGapBefore + memoLines.length * sizes.memoLine : 0) +
      (coordsLines.length > 0 ? sizes.coordsGapBefore + coordsLines.length * sizes.coordsLine : 0) +
      (phraseLines.length > 0 ? sizes.phraseGapBefore + phraseLines.length * sizes.phraseLine : 0) +
      padding;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('캔버스를 사용할 수 없습니다.');
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, padding, padding, imgWidth, imgHeight);

    let textY = padding + imgHeight + sizes.titleStartOffset;
    if (orgName) {
      textY =
        drawAlignedText(
          ctx,
          orgName,
          padding,
          textY,
          contentWidth,
          options.titleAlign,
          sizes.orgFont,
          '700',
          '#111827',
          sizes.orgLine,
        ) + sizes.titleAfterGap;
    }

    textY =
      drawAlignedText(
        ctx,
        title,
        padding,
        textY,
        contentWidth,
        options.titleAlign,
        sizes.titleFont,
        '700',
        '#111827',
        sizes.titleLine,
      ) + sizes.titleAfterGap;

    if (memo) {
      textY = drawAlignedText(
        ctx,
        memo,
        padding,
        textY + sizes.memoAfterGap,
        contentWidth,
        options.memoAlign,
        sizes.memoFont,
        '400',
        '#374151',
        sizes.memoLine,
      );
    }

    if (coords) {
      textY = drawAlignedText(
        ctx,
        coords,
        padding,
        textY + sizes.memoAfterGap,
        contentWidth,
        options.memoAlign,
        sizes.coordsFont,
        '400',
        '#6b7280',
        sizes.coordsLine,
      );
    }

    if (footerPhrase) {
      drawAlignedText(
        ctx,
        footerPhrase,
        padding,
        textY + sizes.memoAfterGap,
        contentWidth,
        options.memoAlign,
        sizes.phraseFont,
        '400',
        '#6b7280',
        sizes.phraseLine,
      );
    }

    return canvasToBlob(canvas, STAMP_JPEG_COMPRESS);
  }

  function normalizeExportSettings(raw) {
    const settings = raw && typeof raw === 'object' ? raw : {};
    return {
      titleAlign: settings.titleAlign === 'center' || settings.titleAlign === 'right' ? settings.titleAlign : 'left',
      memoAlign: settings.memoAlign === 'center' || settings.memoAlign === 'right' ? settings.memoAlign : 'left',
      showDatetime: settings.showDatetime !== false,
      textLayout: settings.textLayout === 'watermark' ? 'watermark' : 'caption',
      coordsLabel:
        settings.coordsLabel === 'gps' || settings.coordsLabel === 'coords' ? settings.coordsLabel : 'off',
      watermarkStyle: sanitizeWatermarkStyle(settings.watermarkStyle),
      textScale: normalizeTextScale(settings.textScale),
      orgName: typeof settings.orgName === 'string' ? settings.orgName : '',
      footerPhrase: typeof settings.footerPhrase === 'string' ? settings.footerPhrase : '',
      showOrgName: settings.showOrgName !== false,
      showFooterPhrase: settings.showFooterPhrase !== false,
    };
  }

  async function renderStampJpeg(stamp, imageUrl, options) {
    if (options.textLayout === 'watermark') {
      return renderStampJpegWatermark(stamp, imageUrl, options);
    }
    return renderStampJpegCaption(stamp, imageUrl, options);
  }

  async function createStampsJpegZip(manifest, imageUrls, options, onProgress) {
    const stamps = manifest.stamps || [];
    if (stamps.length === 0) {
      throw new Error('보낼 스탬프가 없습니다.');
    }
    if (stamps.length > 500) {
      throw new Error('한 번에 500장 이하만 처리할 수 있습니다.');
    }

    const zip = new JSZip();
    const folder = zip.folder('jpeg') || zip;

    for (let i = 0; i < stamps.length; i++) {
      const stamp = stamps[i];
      const imageUrl = imageUrls.get(stamp.imageFile);
      if (!imageUrl) {
        continue;
      }
      if (onProgress) {
        onProgress(i + 1, stamps.length);
      }
      const blob = await renderStampJpeg(stamp, imageUrl, options);
      folder.file(exportFileName(stamp, i), blob);
    }

    const baseName = sanitizeExportBaseName(manifest.reportTitle || 'VoiceStamp');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return { blob: zipBlob, fileName: `${baseName}_jpeg.zip` };
  }

  global.VoiceStampReportExport = {
    normalizeExportSettings,
    renderStampJpeg,
    createStampsJpegZip,
  };
})(window);
