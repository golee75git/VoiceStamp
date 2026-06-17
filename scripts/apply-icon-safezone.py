"""Scale app-icon-source.png into Adaptive Icon safe zone (center ~68%)."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

CANVAS = 1024
SCALE = 0.68
BACKGROUND_COLOR = (255, 255, 255, 255)


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    src = root / "assets" / "app-icon-source.png"
    if not src.is_file():
        print(f"ERROR: Source not found: {src}", file=sys.stderr)
        return 1

    source = Image.open(src).convert("RGBA")
    target = max(1, int(CANVAS * SCALE))
    resized = source.resize((target, target), Image.Resampling.LANCZOS)

    padded = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    offset = (CANVAS - target) // 2
    padded.paste(resized, (offset, offset), resized)

    assets = root / "assets"
    padded.save(assets / "icon.png", "PNG")
    padded.save(assets / "android-icon-foreground.png", "PNG")
    padded.save(assets / "favicon.png", "PNG")

    background = Image.new("RGBA", (CANVAS, CANVAS), BACKGROUND_COLOR)
    background.save(assets / "android-icon-background.png", "PNG")

    print(f"Applied safe-zone icons ({int(SCALE * 100)}% scale, {CANVAS}x{CANVAS})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
