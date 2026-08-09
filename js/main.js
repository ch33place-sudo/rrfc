(() => {
  const nav = document.getElementById("nav");
  const toggle = document.querySelector("[data-menu-toggle]");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  const clubLabel = (clubId) => {
    const club = (window.RRFC_CLUBS || []).find((c) => c.id === clubId);
    return club ? club.label : `${clubId}'s Club`;
  };

  const slugify = (name) => encodeURIComponent(name);

  const findPlayer = (raw) => {
    const players = window.RRFC_PLAYERS || [];
    if (!raw) return null;
    const decoded = decodeURIComponent(raw).trim().toLowerCase();
    return players.find((p) => p.name.toLowerCase() === decoded) || null;
  };

  const iconHtml = (name) => {
    if (!window.RRFCIcons) {
      return `<div class="player-card-icon fallback">RR</div>`;
    }
    const url = window.RRFCIcons.resolveUrl(name);
    return `
      <div class="player-card-icon">
        <img src="${url}" alt="" data-player-icon />
      </div>`;
  };

  const listRoot = document.getElementById("players-root");
  if (listRoot && window.RRFC_PLAYERS) {
    const clubs = window.RRFC_CLUBS || [];
    listRoot.innerHTML = clubs
      .map((club) => {
        const members = window.RRFC_PLAYERS.filter((p) => p.club === club.id);
        const cards = members
          .map(
            (p, i) => `
          <a class="player-card" href="player.html?name=${slugify(p.name)}" style="animation-delay: ${Math.min(i * 0.03, 0.4)}s">
            ${iconHtml(p.name)}
            <div class="name">${p.name}</div>
            <div class="meta">${p.ovr} OVR${p.note ? " · *" : ""}</div>
          </a>`
          )
          .join("");
        return `
          <section class="club-section" id="club-${club.id}">
            <div class="club-heading">
              <h2>${club.label}</h2>
              <span>${club.range} · ${members.length} players</span>
            </div>
            <div class="players-grid">${cards}</div>
          </section>`;
      })
      .join("");

    listRoot.querySelectorAll("[data-player-icon]").forEach((img) => {
      img.addEventListener("error", () => {
        const wrap = img.parentElement;
        if (!wrap) return;
        img.remove();
        wrap.classList.add("fallback");
        wrap.textContent = "RR";
      });
    });
  }

  const profileRoot = document.querySelector("[data-player-profile]");
  if (profileRoot && window.RRFC_PLAYERS) {
    const params = new URLSearchParams(window.location.search);
    const player = findPlayer(params.get("name")) || window.RRFC_PLAYERS[0];

    document.title = `${player.name} — RRFC`;
    profileRoot.querySelector("[data-player-name]").textContent = player.name;
    profileRoot.querySelector("[data-player-club]").textContent = clubLabel(player.club);
    profileRoot.querySelector("[data-player-ovr]").textContent = String(player.ovr);
    profileRoot.querySelector("[data-player-meta]").textContent = `${clubLabel(player.club)} · ${player.ovr} OVR`;

    const noteEl = profileRoot.querySelector("[data-player-note]");
    if (noteEl) {
      if (player.note) {
        noteEl.hidden = false;
        noteEl.textContent = player.note;
      } else {
        noteEl.hidden = true;
      }
    }

    const badge = profileRoot.querySelector("[data-club-badge]");
    if (badge) badge.textContent = clubLabel(player.club);

    const avatar = profileRoot.querySelector(".player-avatar");
    if (avatar && window.RRFCIcons) {
      const url = window.RRFCIcons.resolveUrl(player.name);
      avatar.innerHTML = `
        <img src="${url}" alt="${player.name}" onerror="this.style.display='none'; this.nextElementSibling.hidden=false;" />
        <div class="avatar-placeholder" hidden>Avatar<br />coming soon</div>`;
      const img = avatar.querySelector("img");
      img.addEventListener("error", () => {
        img.style.display = "none";
        const ph = avatar.querySelector(".avatar-placeholder");
        if (ph) ph.hidden = false;
      });
    }
  }
})();
