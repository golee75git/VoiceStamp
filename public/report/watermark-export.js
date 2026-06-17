/**
 * VoiceStamp /report — client-side JPEG export (watermark + caption).
 * No server upload; mirrors app web canvas rules in exportStampImage.ts.
 */
(function (global) {
  const STAMP_JPEG_MAX_WIDTH = 2048;
  const STAMP_JPEG_COMPRESS = 0.85;

  function getWatermarkTheme(style) {
    if (style === 'solid_light') {
      return {
        barBackground: 'rgba(255, 255, 255, 0.55)',
        titleColor: '#111827',
        memoColor: '#374151',
        coordsColor: '#6b7280',
      };
    }
    return {
      barBackground: 'rgba(0, 0, 0, 0.55)',
      titleColor: '#ffffff',
      memoColor: '#f3f4f6',
      coordsColor: '#e5e7eb',
    };
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

    const title = stampDisplayTitle(stamp, options.showDatetime);
    const memo = String(stamp.memo ?? '').trim();
    const coords = stampCoordinatesLine(stamp, options.coordsLabel) ?? '';
    const barPaddingX = 20;
    const barPaddingY = 16;
    const textWidth = imgWidth - barPaddingX * 2;

    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    if (!measureCtx) {
      throw new Error('캔버스를 사용할 수 없습니다.');
    }

    measureCtx.font = '700 32px sans-serif';
    const titleLines = wrapCanvasLines(measureCtx, title, textWidth);
    measureCtx.font = '400 26px sans-serif';
    const memoLines = memo ? wrapCanvasLines(measureCtx, memo, textWidth) : [];
    measureCtx.font = '400 22px sans-serif';
    const coordsLines = coords ? wrapCanvasLines(measureCtx, coords, textWidth) : [];

    const barHeight =
      barPaddingY +
      titleLines.length * 38 +
      (memoLines.length > 0 ? 8 + memoLines.length * 32 : 0) +
      (coordsLines.length > 0 ? 6 + coordsLines.length * 28 : 0) +
      barPaddingY;

    const canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('캔버스를 사용할 수 없습니다.');
    }

    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
    drawWatermarkBar(ctx, 0, imgHeight - barHeight, imgWidth, barHeight, options.watermarkStyle);

    const theme = getWatermarkTheme(options.watermarkStyle);
    let textY = imgHeight - barHeight + barPaddingY + 28;
    textY =
      drawAlignedText(
        ctx,
        title,
        barPaddingX,
        textY,
        textWidth,
        options.titleAlign,
        32,
        '700',
        theme.titleColor,
        38,
      ) + 4;

    if (memo) {
      textY = drawAlignedText(
        ctx,
        memo,
        barPaddingX,
        textY + 4,
        textWidth,
        options.memoAlign,
        26,
        '400',
        theme.memoColor,
        32,
      );
    }

    if (coords) {
      drawAlignedText(
        ctx,
        coords,
        barPaddingX,
        textY + 4,
        textWidth,
        options.memoAlign,
        22,
        '400',
        theme.coordsColor,
        28,
      );
    }

    return canvasToBlob(canvas, STAMP_JPEG_COMPRESS);
  }

  async function renderStampJpegCaption(stamp, imageUrl, options) {
    const img = await loadImage(imageUrl);
    const scale = img.width > STAMP_JPEG_MAX_WIDTH ? STAMP_JPEG_MAX_WIDTH / img.width : 1;
    const imgWidth = Math.max(1, Math.round(img.width * scale));
    const imgHeight = Math.max(1, Math.round(img.height * scale));

    const padding = 24;
    const contentWidth = imgWidth;
    const title = stampDisplayTitle(stamp, options.showDatetime);
    const memo = String(stamp.memo ?? '').trim();
    const coords = stampCoordinatesLine(stamp, options.coordsLabel) ?? '';

    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    if (!measureCtx) {
      throw new Error('캔버스를 사용할 수 없습니다.');
    }

    measureCtx.font = '700 36px sans-serif';
    const titleLines = wrapCanvasLines(measureCtx, title, contentWidth);
    measureCtx.font = '400 28px sans-serif';
    const memoLines = memo ? wrapCanvasLines(measureCtx, memo, contentWidth) : [];
    measureCtx.font = '400 24px sans-serif';
    const coordsLines = coords ? wrapCanvasLines(measureCtx, coords, contentWidth) : [];

    const canvasWidth = contentWidth + padding * 2;
    const canvasHeight =
      padding +
      imgHeight +
      16 +
      titleLines.length * 44 +
      (memoLines.length > 0 ? 12 + memoLines.length * 36 : 0) +
      (coordsLines.length > 0 ? 8 + coordsLines.length * 32 : 0) +
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

    let textY = padding + imgHeight + 40;
    textY =
      drawAlignedText(
        ctx,
        title,
        padding,
        textY,
        contentWidth,
        options.titleAlign,
        36,
        '700',
        '#111827',
        44,
      ) + 4;

    if (memo) {
      textY = drawAlignedText(
        ctx,
        memo,
        padding,
        textY + 8,
        contentWidth,
        options.memoAlign,
        28,
        '400',
        '#374151',
        36,
      );
    }

    if (coords) {
      drawAlignedText(
        ctx,
        coords,
        padding,
        textY + 8,
        contentWidth,
        options.memoAlign,
        24,
        '400',
        '#6b7280',
        32,
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
      watermarkStyle: settings.watermarkStyle === 'solid_light' ? 'solid_light' : 'solid_dark',
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
