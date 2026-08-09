import re
import time
import urllib.request
from pathlib import Path

OUT = Path(r"C:\Users\User\Projects\rrfc\assets\teams")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"


def slug(name: str) -> str:
    s = name.lower().strip().replace("'", "").replace("’", "")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


# NFL chip winners → ESPN NFL team id
NFL = {
    "Baltimore Ravens": 33,
    "Dallas Cowboys": 6,
    "Kansas City Chiefs": 12,
    "New York Jets": 20,
    "Philadelphia Eagles": 21,
}

for name, team_id in NFL.items():
    dest = OUT / f"{slug(name)}.png"
    url = f"https://a.espncdn.com/i/teamlogos/nfl/500/{team_id}.png"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
        dest.write_bytes(data)
        print(f"OK  {len(data):6}  {dest.name}  ({name})")
    except Exception as e:
        print(f"FAIL {name}: {e}")
    time.sleep(0.7)
