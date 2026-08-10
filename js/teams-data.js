window.RRFC_TEAMS = [
  {
    name: "Florida Gators",
    season: 11,
    roster: [
      "Unc Mike",
      "Yin",
      "Zay",
      "Joker",
      "Trey/Flock",
      "Yilo",
      "Mar",
      "Spoon",
      "Vipbaby",
      "Fazy",
    ],
    colors: { primary: "#FA4616", secondary: "#0021A5", accent: "#FA4616" },
  },
  {
    name: "Oregon State Beavers",
    season: 11,
    roster: [
      "Kiwiz",
      "Rev",
      "Kazu",
      "Minivip",
      "Luigi",
      "Genz",
      "Pittman",
    ],
    colors: { primary: "#DC4405", secondary: "#000000", accent: "#FF6A2A" },
  },
  {
    name: "Oregon Ducks",
    season: 11,
    roster: [
      "Zir",
      "Kakarot",
      "Kye",
      "Bilxa",
      "Xpgzz",
      "Bear",
      "Slim",
      "BabyTray",
      "Zermis",
    ],
    colors: { primary: "#FEE123", secondary: "#154733", accent: "#FEE123" },
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
    roster: [
      "Kratos",
      "Purp",
      "Shark",
      "Yang",
      "Icy",
      "Sojay",
      "Fhonts",
      "Straw",
      "Sasuke",
      "Malmal",
      "Elijah",
    ],
    colors: { primary: "#FFCB05", secondary: "#00274C", accent: "#FFCB05" },
  },
  {
    name: "Texas Longhorns",
    season: 11,
    roster: [
      "Dez",
      "Error",
      "ZK",
      "Shehates",
      "Noah",
      "Lil DG",
      "Kingdrip",
      "Cyber",
    ],
    colors: { primary: "#BF5700", secondary: "#FFFFFF", accent: "#E66A00" },
  },
  {
    name: "Missouri Tigers",
    season: 11,
    roster: [
      "Nadia",
      "Pap",
      "Mars",
      "Deer",
      "Pabyo",
      "JT",
      "Polo",
    ],
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
    roster: [
      "Kayden",
      "Nao",
      "Jay",
      "MVP",
      "Mini jr",
      "Rain",
      "Nico",
      "Venus",
    ],
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

/** Colors for historic / non-S11 teams (player badges, etc.). */
window.RRFC_HISTORIC_TEAM_COLORS = {
  "Notre Dame Fighting Irish": { primary: "#0C2340", accent: "#C99700" },
  "Texas Tech Red Raiders": { primary: "#CC0000", accent: "#000000" },
  "Auburn Tigers": { primary: "#0C2340", accent: "#E87722" },
  "Oklahoma Sooners": { primary: "#841617", accent: "#C8102E" },
  "Oklahoma Sooner": { primary: "#841617", accent: "#C8102E" },
  "Northern Illinois Huskies": { primary: "#BA0C2F", accent: "#000000" },
  "Rutgers Scarlett Knights": { primary: "#CC0033", accent: "#E31C3F" },
  "Rutgers Scarlet Knights": { primary: "#CC0033", accent: "#E31C3F" },
  "New York Jets": { primary: "#125740", accent: "#FFFFFF" },
  "Dallas Cowboys": { primary: "#041E42", accent: "#869397" },
  "Baltimore Huskies": { primary: "#5C2D91", accent: "#9B59B6" },
  "Las Vegas Leviathans": { primary: "#1E4DB7", accent: "#4C7DFF" },
};

window.RRFC_colorsForTeamName = (teamName) => {
  if (!teamName) return null;
  const fromS11 = (window.RRFC_TEAMS || []).find(
    (t) => t.name.toLowerCase() === String(teamName).trim().toLowerCase()
  );
  if (fromS11 && fromS11.colors) return fromS11.colors;
  const historic = window.RRFC_HISTORIC_TEAM_COLORS || {};
  const key = Object.keys(historic).find(
    (k) => k.toLowerCase() === String(teamName).trim().toLowerCase()
  );
  return key ? historic[key] : null;
};

window.RRFC_findTeam = (raw) => {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw).trim().toLowerCase();
  return (window.RRFC_TEAMS || []).find((t) => t.name.toLowerCase() === decoded) || null;
};

window.RRFC_normalizeName = (name) =>
  String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

window.RRFC_findPlayerByName = (name) => {
  if (!name) return null;
  try {
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
  } catch {
    return null;
  }
};

window.RRFC_findTeamForPlayer = (name) => {
  if (!name || !Array.isArray(window.RRFC_TEAMS)) return null;
  try {
    const raw = String(name).trim();
    const rawLower = raw.toLowerCase();
    const rawCompact = window.RRFC_normalizeName
      ? window.RRFC_normalizeName(raw)
      : rawLower.replace(/[^a-z0-9]/g, "");
    const resolved =
      (window.RRFC_findPlayerByName && window.RRFC_findPlayerByName(raw)) || null;
    const resolvedName = resolved ? resolved.name : raw;
    const resolvedLower = resolvedName.toLowerCase();
    const resolvedCompact = window.RRFC_normalizeName
      ? window.RRFC_normalizeName(resolvedName)
      : resolvedLower.replace(/[^a-z0-9]/g, "");

    for (const team of window.RRFC_TEAMS) {
      for (const entry of team.roster || []) {
        const rosterName = String(entry).trim();
        const rosterLower = rosterName.toLowerCase();
        if (rosterLower === rawLower || rosterLower === resolvedLower) return team;

        const rosterCompact = window.RRFC_normalizeName
          ? window.RRFC_normalizeName(rosterName)
          : rosterLower.replace(/[^a-z0-9]/g, "");
        if (
          rosterCompact === rawCompact ||
          rosterCompact === resolvedCompact
        ) {
          return team;
        }

        const matched =
          window.RRFC_findPlayerByName && window.RRFC_findPlayerByName(rosterName);
        if (matched && matched.name.toLowerCase() === resolvedLower) return team;
      }
    }
  } catch {
    return null;
  }
  return null;
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
    p ? `rgba(${p.r}, ${p.g}, ${p.b}, 0.35)` : "rgba(212, 160, 23, 0.28)"
  );
  root.style.setProperty(
    "--team-glow-strong",
    p ? `rgba(${p.r}, ${p.g}, ${p.b}, 0.6)` : "rgba(240, 195, 74, 0.55)"
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

  // Stripe panel colors for roster rows — middle stays faded/dark like the old rows
  const panelRgb = lum(s) < 0.08 ? p || { r: 212, g: 160, b: 23 } : s;
  const endRgb = p || { r: 212, g: 160, b: 23 };
  root.style.setProperty(
    "--team-panel",
    `rgb(${panelRgb.r}, ${panelRgb.g}, ${panelRgb.b})`
  );
  root.style.setProperty(
    "--team-panel-soft",
    `rgba(${panelRgb.r}, ${panelRgb.g}, ${panelRgb.b}, 0.2)`
  );
  root.style.setProperty(
    "--team-icon-fill",
    a
      ? `rgba(${a.r}, ${a.g}, ${a.b}, ${lum(a) > 0.7 ? 0.28 : 0.55})`
      : `rgba(${endRgb.r}, ${endRgb.g}, ${endRgb.b}, 0.45)`
  );
  root.style.setProperty(
    "--team-stripe-end",
    `rgba(${endRgb.r}, ${endRgb.g}, ${endRgb.b}, 0.85)`
  );
  document.body.classList.add("team-themed");
};
