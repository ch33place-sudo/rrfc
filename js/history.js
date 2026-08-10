(() => {
  const root = document.getElementById("history-root");
  if (!root || !window.RRFC_LEAGUES || !window.RRFC_CHAMPIONSHIPS) return;

  const teamLogo = (name) => {
    if (!window.RRFCMedia) return "";
    const url = window.RRFCMedia.resolveUrl("teams", name);
    return `<img class="team-logo-sm" src="${url}" alt="" width="24" height="24" onerror="this.classList.add('is-missing')" />`;
  };

  const playerHtml =
    window.RRFC_playerNameHtml || ((name) => String(name || ""));

  const order = ["rrfc", "rrfo", "rrfa"];

  root.innerHTML = order
    .map((id) => {
      const league = window.RRFC_LEAGUES.find((l) => l.id === id);
      const seasons = [...(window.RRFC_CHAMPIONSHIPS[id] || [])].sort(
        (a, b) => b.season - a.season
      );
      if (!league || !seasons.length) return "";

      const rows = seasons
        .map(
          (s) => `
        <article class="chip-row">
          <div class="chip-season">S${s.season}</div>
          <div class="chip-logo">${teamLogo(s.champion)}</div>
          <div class="chip-main">
            <h3>${s.champion}</h3>
            <p>def. ${s.opponent}</p>
          </div>
          <div class="chip-mvp">
            <span>Chip MVP</span>
            <strong>${playerHtml(s.mvp, "player-ref")}</strong>
          </div>
        </article>`
        )
        .join("");

      return `
        <section class="history-league ${league.active ? "is-active" : "is-legacy"}" id="league-${id}">
          <div class="history-league-head">
            <div>
              <h2>${league.name}</h2>
              <p>${league.note}</p>
            </div>
            <span class="league-status ${league.active ? "live" : "inactive"}">
              ${league.active ? "Active" : "Inactive"}
            </span>
          </div>
          <div class="chip-list">${rows}</div>
        </section>`;
    })
    .join("");
})();

(() => {
  const root = document.getElementById("accolades-root");
  if (!root || !window.RRFC_CHAMPIONSHIPS) return;

  const playerHtml =
    window.RRFC_playerNameHtml || ((name) => String(name || ""));

  const rrfc = window.RRFC_CHAMPIONSHIPS.rrfc || [];
  const latest = [...rrfc].sort((a, b) => b.season - a.season)[0];

  const mvpCounts = {};
  for (const leagueId of Object.keys(window.RRFC_CHAMPIONSHIPS)) {
    for (const s of window.RRFC_CHAMPIONSHIPS[leagueId]) {
      mvpCounts[s.mvp] = (mvpCounts[s.mvp] || 0) + 1;
    }
  }

  const topMvps = Object.entries(mvpCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8);

  const awardOrder = window.RRFC_AWARD_ORDER || [];
  const awardLabels = window.RRFC_AWARD_LABELS || {};
  const seasonAwards = [...(window.RRFC_SEASON_AWARDS || [])].sort(
    (a, b) => b.season - a.season
  );

  const seasonAwardsHtml = seasonAwards
    .map((season) => {
      const items = awardOrder
        .filter((key) => season.awards[key])
        .map(
          (key) => `
          <div class="award-pill">
            <span title="${awardLabels[key] || key}">${key}</span>
            <strong>${playerHtml(season.awards[key], "player-ref")}</strong>
          </div>`
        )
        .join("");

      return `
        <section class="award-season" id="awards-s${season.season}">
          <div class="award-season-head">
            <h3>Season ${season.season}</h3>
          </div>
          <div class="award-grid">${items}</div>
        </section>`;
    })
    .join("");

  const positionLeadersHtml = awardOrder
    .map((key) => {
      const counts = {};
      for (const season of window.RRFC_SEASON_AWARDS || []) {
        const winner = season.awards[key];
        if (!winner || winner === "N/A") continue;
        counts[winner] = (counts[winner] || 0) + 1;
      }

      const ranked = Object.entries(counts).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
      );
      if (!ranked.length) return "";

      const topCount = ranked[0][1];
      const leaders = ranked.filter(([, count]) => count === topCount);
      const names = leaders
        .map(([name]) => playerHtml(name, "player-ref"))
        .join(" · ");

      return `
        <div class="mvp-row">
          <span><em>${key}</em> ${names}</span>
          <strong>${topCount}</strong>
        </div>`;
    })
    .join("");

  root.innerHTML = `
    <section class="accolade-block">
      <h2>Latest RRFC Champion</h2>
      ${
        latest
          ? `<p class="accolade-highlight">S${latest.season} · <strong>${latest.champion}</strong> def. ${latest.opponent}</p>
             <p class="accolade-sub">Chip MVP: ${playerHtml(latest.mvp, "player-ref")}</p>`
          : `<p class="stub-note">No RRFC championships yet.</p>`
      }
    </section>
    <section class="accolade-block">
      <h2>Season Awards</h2>
      <p class="accolade-sub">RRFC yearly awards by season. Names link to matching player cards.</p>
      <div class="award-seasons">${seasonAwardsHtml}</div>
    </section>
    <section class="accolade-block leaders-block">
      <div class="leaders-grid">
        <div>
          <h2>Most Chip MVPs</h2>
          <p class="accolade-sub">All leagues</p>
          <div class="mvp-leaderboard">
            ${topMvps
              .map(
                ([name, count]) => `
              <div class="mvp-row">
                <span>${playerHtml(name, "player-ref")}</span>
                <strong>${count}</strong>
              </div>`
              )
              .join("")}
          </div>
          <p class="back-link"><a href="history.html">Full championship history →</a></p>
        </div>
        <div>
          <h2>Most Awards by Position</h2>
          <p class="accolade-sub">RRFC season awards</p>
          <div class="mvp-leaderboard">
            ${positionLeadersHtml}
          </div>
        </div>
      </div>
    </section>`;
})();
