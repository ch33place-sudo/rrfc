import re
import time
import urllib.request
from pathlib import Path

OUT = Path(r"C:\Users\User\Projects\rrfc\assets\teams")
OUT.mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"


def slug(name: str) -> str:
    s = name.lower().strip().replace("'", "").replace("’", "")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


# College chip winners → ESPN NCAA team id
COLLEGE = {
    "Auburn Tigers": 2,
    "Duke Blue Devils": 150,
    "Kansas Jayhawks": 2305,
    "LSU Tigers": 99,
    "Northern Illinois Huskies": 2459,
    "Notre Dame Fighting Irish": 87,
    "Oklahoma Sooner": 201,
    "Oregon State Beavers": 204,
    "Rutgers Scarlett Knights": 164,
    "Texas Tech Red Raiders": 2641,
}

results = []
for name, team_id in COLLEGE.items():
    dest = OUT / f"{slug(name)}.png"
    url = f"https://a.espncdn.com/i/teamlogos/ncaa/500/{team_id}.png"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
        if len(data) < 1000:
            results.append((name, "TOO_SMALL", len(data)))
            continue
        dest.write_bytes(data)
        results.append((name, "OK", len(data)))
    except Exception as e:
        results.append((name, f"FAIL:{e}", 0))
    time.sleep(0.8)

for name, status, size in results:
    print(f"{status:10} {size:7}  {slug(name)}  ({name})")
