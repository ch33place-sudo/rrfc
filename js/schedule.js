(() => {
  const root = document.querySelector("[data-schedule-root]");
  if (!root || !window.RRFC_SCHEDULE) return;

  const isTeam = (name) =>
    !!(window.RRFC_findTeam && window.RRFC_findTeam(name));

  const teamSide = (name, seed) => {
    if (seed || !isTeam(name)) {
      return `<span class="sched-team is-placeholder"><strong>${name}</strong></span>`;
    }
    const logoUrl = window.RRFCMedia
      ? window.RRFCMedia.resolveUrl("teams", name)
      : "";
    return `
      <a class="sched-team" href="team.html?name=${encodeURIComponent(name)}">
        <img class="team-logo-sm" src="${logoUrl}" alt="" onerror="this.classList.add('is-missing')" />
        <strong>${name}</strong>
      </a>`;
  };

  root.innerHTML = window.RRFC_SCHEDULE.map((week) => {
    const games = (week.games || [])
      .map(
        (g) => `
        <article class="sched-game">
          <time class="sched-time">${g.time}</time>
          <div class="sched-matchup">
            ${teamSide(g.home, g.seed)}
            <span class="sched-vs">vs</span>
            ${teamSide(g.away, g.seed)}
          </div>
        </article>`
      )
      .join("");

    return `
      <section class="sched-week" id="${week.id}">
        <header class="sched-week-head">
          <h2>${week.title}</h2>
          <p>Auto ${week.auto}</p>
        </header>
        <div class="sched-games">${games}</div>
      </section>`;
  }).join("");
})();
