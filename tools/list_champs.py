import re
from pathlib import Path

text = Path(r"C:\Users\User\Projects\rrfc\js\championships-data.js").read_text(encoding="utf-8")
champs = sorted(set(re.findall(r'champion:\s*"([^"]+)"', text)))
Path(r"C:\Users\User\Projects\rrfc\tools\champs.txt").write_text("\n".join(champs), encoding="utf-8")
print("\n".join(champs))
print("COUNT", len(champs))
