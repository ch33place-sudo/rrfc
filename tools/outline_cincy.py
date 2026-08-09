from PIL import Image, ImageFilter, ImageChops

src = r"C:\Users\User\Projects\rrfc\assets\teams\cincinnati-bearcats.png"
out = src

im = Image.open(src).convert("RGBA")
w, h = im.size
px = im.load()

# Build mask of logo content: not fully transparent, and not pure near-black background
# Keep black logo ink that is part of the C (interior), but remove flat black bg.
# Strategy: treat corner color as background if nearly black; keep pixels that differ OR
# use alpha if present.

corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
print("corners", corners)

# If image has real alpha, use it; else treat near-black as background only when
# surrounded by black (flood-ish via threshold on luminance for exterior).
alphas = {}
for y in range(h):
    for x in range(w):
        a = px[x, y][3]
        alphas[a] = alphas.get(a, 0) + 1
print("alpha samples", sorted(alphas.items(), key=lambda t: -t[1])[:5])

# Create content mask
mask = Image.new("L", (w, h), 0)
mp = mask.load()

has_alpha = max(alphas) < 255 or min(alphas) < 255 and alphas.get(0, 0) > 1000

if has_alpha and alphas.get(0, 0) > w:
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 20:
                mp[x, y] = 255
else:
    # Opaque logo on black: flood-fill background from corners
    from collections import deque

    bg = set()
    q = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])
    seen = [[False] * w for _ in range(h)]

    def is_bg(r, g, b, a):
        return a < 10 or (r < 35 and g < 35 and b < 35)

    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y][x]:
            continue
        r, g, b, a = px[x, y]
        if not is_bg(r, g, b, a):
            continue
        seen[y][x] = True
        bg.add((x, y))
        q.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

    for y in range(h):
        for x in range(w):
            if (x, y) not in bg:
                mp[x, y] = 255
    print("bg pixels", len(bg), "content", w * h - len(bg))

# Dilate mask for white outline (thin)
outline = mask.filter(ImageFilter.MaxFilter(9))
outline = ImageChops.subtract(outline, mask)

# White ring
white = Image.new("RGBA", (w, h), (0, 0, 0, 0))
wp = white.load()
op = outline.load()
for y in range(h):
    for x in range(w):
        if op[x, y] > 0:
            wp[x, y] = (255, 255, 255, 255)

# Make true background transparent on original
out_im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
out_px = out_im.load()
for y in range(h):
    for x in range(w):
        if mp[x, y] > 0:
            out_px[x, y] = px[x, y]

# Composite: white outline under logo
final = Image.alpha_composite(white, out_im)
final.save(out, "PNG")
print("saved", out)
