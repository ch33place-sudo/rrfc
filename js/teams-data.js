window.RRFC_TEAMS = [
  {
    name: "Florida Gators",
    season: 11,
    roster: [],
    colors: { primary: "#FA4616", secondary: "#0021A5", accent: "#FA4616" },
  },
  {
    name: "Oregon State Beavers",
    season: 11,
    roster: [],
    colors: { primary: "#DC4405", secondary: "#000000", accent: "#FF6A2A" },
  },
  {
    name: "Oregon Ducks",
    season: 11,
    roster: [],
    colors: { primary: "#154733", secondary: "#FEE123", accent: "#FEE123" },
  },
  {
    name: "Liberty Flames",
    season: 11,
    roster: [
      "Chee",
      "Vex",
      "Batman",
      "Bensimmons",
      "Dylan",
      "Ballhawk",
      "Javo",
      "Doughnutz",
      "Tyrone",
      "Sashy",
    ],
    colors: { primary: "#C41230", secondary: "#0C2340", accent: "#E23A52" },
  },
  {
    name: "Ball State Cardinals",
    season: 11,
    roster: [
      "Miri",
      "Mario",
      "Wo",
      "Kaizen",
      "Beckbone",
      "Tbestg",
      "Spaz",
    ],
    colors: { primary: "#BA0C2F", secondary: "#FFFFFF", accent: "#E01C3F" },
  },
  {
    name: "Michigan Wolverines",
    season: 11,
    roster: [],
    colors: { primary: "#FFCB05", secondary: "#00274C", accent: "#FFCB05" },
  },
  {
    name: "Texas Longhorns",
    season: 11,
    roster: [],
    colors: { primary: "#BF5700", secondary: "#FFFFFF", accent: "#E66A00" },
  },
  {
    name: "Missouri Tigers",
    season: 11,
    roster: [],
    colors: { primary: "#F1B82D", secondary: "#000000", accent: "#F1B82D" },
  },
  {
    name: "Hawaii Rainbow Warriors",
    season: 11,
    roster: [
      "Slashpass",
      "Aj",
      "Bossness",
      "Mood",
      "Crazy",
      "Kj",
      "Max",
      "Apollo",
      "Davieon",
      "Smokey",
    ],
    colors: { primary: "#024731", secondary: "#BEBEC0", accent: "#2F8F66" },
  },
  {
    name: "Cincinnati Bearcats",
    season: 11,
    roster: [],
    colors: { primary: "#E00122", secondary: "#000000", accent: "#FF2A48" },
  },
];

/** All team names that appear in championship history (for logos). */
window.RRFC_HISTORY_TEAMS = (() => {
  const names = new Set();
  const chips = window.RRFC_CHAMPIONSHIPS || {};
  for (const leagueId of Object.keys(chips)) {
    for (const s of chips[leagueId] || []) {
      if (s.champion) names.add(s.champion);
      if (s.opponent) names.add(s.opponent);
    }
  }
  for (const t of window.RRFC_TEAMS || []) names.add(t.name);
  return [...names].sort((a, b) => a.localeCompare(b));
})();

/** Unique championship-winning teams (for historic logos). */
window.RRFC_CHIP_CHAMPIONS = (() => {
  const names = new Set();
  const chips = window.RRFC_CHAMPIONSHIPS || {};
  for (const leagueId of Object.keys(chips)) {
    for (const s of chips[leagueId] || []) {
      if (s.champion) names.add(s.champion);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b));
})();

window.RRFC_findTeam = (raw) => {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw).trim().toLowerCase();
  return (window.RRFC_TEAMS || []).find((t) => t.name.toLowerCase() === decoded) || null;
};

window.RRFC_hexToRgb = (hex) => {
  const raw = String(hex || "")
    .trim()
    .replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

window.RRFC_applyTeamTheme = (team) => {
  const colors = (team && team.colors) || {};
  const primary = colors.primary || "#d4a017";
  const secondary = colors.secondary || "#101010";
  const accent = colors.accent || colors.primary || "#f0c34a";
  const p = window.RRFC_hexToRgb(primary);
  const s = window.RRFC_hexToRgb(secondary);
  const a = window.RRFC_hexToRgb(accent);
  const root = document.documentElement;

  const lum = (rgb) =>
    rgb ? (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255 : 0;

  const textAccent = lum(a) < 0.18 ? (lum(p) < 0.18 ? "#f0c34a" : primary) : accent;
  const rowLine = lum(p) < 0.12 ? textAccent : primary;

  root.style.setProperty("--team-primary", primary);
  root.style.setProperty("--team-secondary", secondary);
  root.style.setProperty("--team-accent", accent);
  root.style.setProperty("--team-text", textAccent);
  root.style.setProperty("--team-row-line", rowLine);
  root.style.setProperty(
    "--team-primary-glow",
    p ? `rgba(${p.r}, ${p.g}, ${p.b}, 0.28)` : "rgba(212, 160, 23, 0.28)"
  );
  root.style.setProperty(
    "--team-secondary-glow",
    s ? `rgba(${s.r}, ${s.g}, ${s.b}, 0.22)` : "rgba(16, 16, 16, 0.22)"
  );
  root.style.setProperty(
    "--team-accent-soft",
    a ? `rgba(${a.r}, ${a.g}, ${a.b}, 0.12)` : "rgba(240, 195, 74, 0.12)"
  );
  root.style.setProperty(
    "--team-row-fill",
    p ? `rgba(${p.r}, ${p.g}, ${p.b}, 0.2)` : "rgba(212, 160, 23, 0.12)"
  );
  document.body.classList.add("team-themed");
};

window.RRFC_normalizeName = (name) =>
  String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

window.RRFC_findPlayerByName = (name) => {
  if (!name) return null;
  const target = String(name).trim().toLowerCase();
  const compact = window.RRFC_normalizeName(name);
  const players = window.RRFC_PLAYERS || [];

  const byExact = players.find((p) => p.name.toLowerCase() === target);
  if (byExact) return byExact;

  const byCompact = players.find(
    (p) => window.RRFC_normalizeName(p.name) === compact
  );
  if (byCompact) return byCompact;

  return (
    players.find((p) =>
      (p.aliases || []).some((a) => {
        const alias = String(a).trim().toLowerCase();
        return alias === target || window.RRFC_normalizeName(a) === compact;
      })
    ) || null
  );
};
