(() => {
  const root = document.querySelector("[data-standings-root]");
  if (!root || !window.RRFC_STANDINGS) return;

  root.innerHTML = `
    <div class="standings-table" role="table" aria-label="Season 11 standings">
      <div class="standings-head" role="row">
        <span role="columnheader">#</span>
        <span role="columnheader">Team</span>
        <span role="columnheader">W</span>
        <span role="columnheader">L</span>
        <span role="columnheader">PCT</span>
      </div>
      ${window.RRFC_STANDINGS.map((row, i) => {
        const games = row.wins + row.losses;
        const pct = games ? (row.wins / games).toFixed(3).replace(/^0/, "") : ".000";
        const logoUrl = window.RRFCMedia
          ? window.RRFCMedia.resolveUrl("teams", row.team)
          : "";
        return `
          <a class="standings-row" role="row" href="team.html?name=${encodeURIComponent(row.team)}">
            <span class="standings-rank" role="cell">${i + 1}</span>
            <span class="standings-team" role="cell">
              <img class="team-logo-sm" src="${logoUrl}" alt="" onerror="this.classList.add('is-missing')" />
              <strong>${row.team}</strong>
            </span>
            <span role="cell">${row.wins}</span>
            <span role="cell">${row.losses}</span>
            <span role="cell">${pct}</span>
          </a>`;
      }).join("")}
    </div>`;
})();
