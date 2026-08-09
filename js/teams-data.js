window.RRFC_TEAMS = [
  { name: "Florida Gators", season: 11, roster: [] },
  { name: "Oregon State Beavers", season: 11, roster: [] },
  { name: "Oregon Ducks", season: 11, roster: [] },
  { name: "Liberty Flames", season: 11, roster: [] },
  { name: "Ball State Cardinals", season: 11, roster: [] },
  { name: "Michigan Wolverines", season: 11, roster: [] },
  { name: "Texas Longhorns", season: 11, roster: [] },
  { name: "Missouri Tigers", season: 11, roster: [] },
  { name: "Hawaii Rainbow Warriors", season: 11, roster: [] },
  { name: "Cincinnati Bearcats", season: 11, roster: [] },
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

window.RRFC_findPlayerByName = (name) => {
  if (!name) return null;
  const target = String(name).trim().toLowerCase();
  return (
    (window.RRFC_PLAYERS || []).find((p) => p.name.toLowerCase() === target) || null
  );
};
