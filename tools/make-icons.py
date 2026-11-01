"""画「添加到主屏幕」用的图标（docs/icons/*.png）。改了配色（courses.json 的 colorHex 或 style.css 的 --bg）后重跑：
    python3 tools/make-icons.py
需要 Pillow（pip install pillow）；只在本地画图时用，网站和 CI 都不依赖它。
图案是一小簇星座：三种梯队色的星 + 连线，maskable 版多留边，给安卓裁成圆形时不切到星星。"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

BG, GLOW, HALO, LINE, CORE = "#0a0e1a", "#16203a", "#131c33", "#3a4666", "#e9edf6"
T1, T2, T3 = "#199e70", "#3987e5", "#c98500"
OUT = Path(__file__).resolve().parent.parent / "docs" / "icons"


def make(size, name, pad):
    S = size * 4  # 先画 4 倍大再缩小，边缘更平滑
    img = Image.new("RGB", (S, S), BG)
    glow = Image.new("RGB", (S, S), BG)
    ImageDraw.Draw(glow).ellipse([S * 0.15, S * 0.1, S * 0.85, S * 0.8], fill=GLOW)
    img = glow.filter(ImageFilter.GaussianBlur(S * 0.12))
    d = ImageDraw.Draw(img)
    k = 1 - 2 * pad
    P = lambda x, y: (S * (pad + x * k), S * (pad + y * k))
    stars = [(0.24, 0.66, T1), (0.42, 0.40, T2), (0.62, 0.52, T2), (0.78, 0.28, T3), (0.70, 0.76, T1)]
    for a, b in [(0, 1), (1, 2), (2, 3), (2, 4)]:
        d.line([P(*stars[a][:2]), P(*stars[b][:2])], fill=LINE, width=int(S * 0.018 * k))
    for i, (x, y, c) in enumerate(stars):
        r = S * (0.075 if i == 3 else 0.055) * k
        cx, cy = P(x, y)
        d.ellipse([cx - r * 1.9, cy - r * 1.9, cx + r * 1.9, cy + r * 1.9], fill=HALO)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)
        d.ellipse([cx - r * 0.4, cy - r * 0.4, cx + r * 0.4, cy + r * 0.4], fill=CORE)
    img.resize((size, size), Image.LANCZOS).save(OUT / name, optimize=True)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    make(180, "apple-touch-icon.png", 0.06)
    make(192, "icon-192.png", 0.06)
    make(512, "icon-512.png", 0.06)
    make(512, "icon-maskable-512.png", 0.16)
    print("已生成", *sorted(p.name for p in OUT.glob("*.png")))
