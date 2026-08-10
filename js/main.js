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

  const homePlayersRoot = document.getElementById("home-top-players");
  const homeTeamsRoot = document.getElementById("home-top-teams");
  const homeStandingsRoot = document.getElementById("home-top-standings");
  if (homePlayersRoot || homeTeamsRoot || homeStandingsRoot) {
    const bindThumbErrors = (root) => {
      root.querySelectorAll("[data-home-thumb]").forEach((img) => {
        img.addEventListener("error", () => {
          const wrap = img.parentElement;
          if (!wrap) return;
          img.remove();
          wrap.classList.add("fallback");
          wrap.textContent = "RR";
        });
      });
    };

    const teamPower = (team) => {
      const ovrs = (team.roster || [])
        .map((name) => {
          const player =
            window.RRFC_findPlayerByName &&
            window.RRFC_findPlayerByName(name);
          return player && player.ovr != null ? Number(player.ovr) : null;
        })
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => b - a);
      const top = ovrs.slice(0, 5);
      if (!top.length) return null;
      return Math.round(top.reduce((sum, n) => sum + n, 0) / top.length);
    };

    const findTeam = (name) =>
      (window.RRFC_TEAMS || []).find(
        (t) => t.name.toLowerCase() === String(name).toLowerCase()
      ) || { name };

    if (homePlayersRoot && window.RRFC_PLAYERS) {
      const top = [...window.RRFC_PLAYERS]
        .filter((p) => p.ovr != null)
        .sort(
          (a, b) =>
            Number(b.ovr) - Number(a.ovr) ||
            String(a.name).localeCompare(String(b.name))
        )
        .slice(0, 14);

      homePlayersRoot.innerHTML = `
        <div class="home-rank">
          ${top
            .map((p, i) => {
              const icon = window.RRFCIcons
                ? `<div class="thumb"><img src="${window.RRFCIcons.resolveUrl(p.name)}" alt="" data-home-thumb /></div>`
                : `<div class="thumb fallback">RR</div>`;
              return `
                <a class="home-rank-row" href="player.html?name=${encodeURIComponent(p.name)}" style="animation-delay: ${Math.min(i * 0.03, 0.35)}s">
                  <span class="rank">${i + 1}</span>
                  ${icon}
                  <div class="copy">
                    <strong>${p.name}</strong>
                    <span>${clubLabel(p.club)}</span>
                  </div>
                  <div class="stat">${p.ovr}<small>OVR</small></div>
                </a>`;
            })
            .join("")}
        </div>`;
      bindThumbErrors(homePlayersRoot);
    }

    if (homeStandingsRoot && window.RRFC_STANDINGS) {
      const ranked = [...window.RRFC_STANDINGS].slice(0, 7).map((s) => ({
        team: findTeam(s.team),
        record: s,
      }));

      homeStandingsRoot.innerHTML = `
        <div class="home-rank">
          ${ranked
            .map((row, i) => {
              const logo = window.RRFCMedia
                ? `<div class="thumb"><img src="${window.RRFCMedia.resolveUrl("teams", row.team.name)}" alt="" data-home-thumb /></div>`
                : `<div class="thumb fallback">TM</div>`;
              const record = `${row.record.wins}-${row.record.losses}`;
              return `
                <a class="home-rank-row" href="team.html?name=${encodeURIComponent(row.team.name)}" style="animation-delay: ${Math.min(i * 0.03, 0.35)}s">
                  <span class="rank">${i + 1}</span>
                  ${logo}
                  <div class="copy">
                    <strong>${row.team.name}</strong>
                    <span>Season 11</span>
                  </div>
                  <div class="stat">${record}<small>W-L</small></div>
                </a>`;
            })
            .join("")}
        </div>`;
      bindThumbErrors(homeStandingsRoot);
    }

    if (homeTeamsRoot && window.RRFC_TEAMS) {
      const ranked = window.RRFC_TEAMS.map((team) => ({
        team,
        power: teamPower(team),
      }))
        .filter((row) => row.power != null)
        .sort(
          (a, b) =>
            b.power - a.power ||
            String(a.team.name).localeCompare(String(b.team.name))
        )
        .slice(0, 7);

      homeTeamsRoot.innerHTML = `
        <div class="home-rank">
          ${ranked
            .map((row, i) => {
              const logo = window.RRFCMedia
                ? `<div class="thumb"><img src="${window.RRFCMedia.resolveUrl("teams", row.team.name)}" alt="" data-home-thumb /></div>`
                : `<div class="thumb fallback">TM</div>`;
              return `
                <a class="home-rank-row" href="team.html?name=${encodeURIComponent(row.team.name)}" style="animation-delay: ${Math.min(i * 0.03, 0.35)}s">
                  <span class="rank">${i + 1}</span>
                  ${logo}
                  <div class="copy">
                    <strong>${row.team.name}</strong>
                    <span>Team overall</span>
                  </div>
                  <div class="stat">${row.power}<small>AVG</small></div>
                </a>`;
            })
            .join("")}
        </div>`;
      bindThumbErrors(homeTeamsRoot);
    }
  }

  const ovrChanged = (p) =>
    p && p.prevOvr != null && Number(p.prevOvr) !== Number(p.ovr);

  const prevOvrHtml = (p) =>
    ovrChanged(p) ? `<span class="ovr-prev">was ${p.prevOvr}</span>` : "";

  const slugify = (name) => encodeURIComponent(name);

  const findPlayer = (raw) => {
    if (!raw) return null;
    try {
      if (window.RRFC_findPlayerByName) {
        const found = window.RRFC_findPlayerByName(raw);
        if (found) return found;
      }
    } catch {
      /* fall through to basic lookup */
    }
    const players = window.RRFC_PLAYERS || [];
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
            <div class="meta">${p.ovr} OVR ${prevOvrHtml(p)}${p.note ? " · *" : ""}</div>
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
    const club = clubLabel(player.club);

    // 1) Always paint core player data first so the page never depends on teams.
    document.title = `${player.name} — RRFC`;
    document.body.classList.add("player-profile-page");
    profileRoot.querySelector("[data-player-name]").textContent = player.name;
    profileRoot.querySelector("[data-player-ovr]").textContent = String(player.ovr);
    profileRoot.querySelector("[data-player-meta]").textContent =
      `${club} · ${player.ovr} OVR`;

    const badge = profileRoot.querySelector("[data-club-badge]");
    if (badge) badge.textContent = club;

    const badgesRoot = profileRoot.querySelector("[data-player-badges]");
    if (badgesRoot) {
      const manual = Array.isArray(player.badges) ? player.badges : [];
      const derived =
        (window.RRFC_awardsForPlayer &&
          window.RRFC_awardsForPlayer(player.name)) ||
        [];
      const seen = new Set(
        manual.map((b) => String(b.label || "").toLowerCase())
      );
      const chips = [
        ...manual,
        ...derived.filter((b) => {
          const key = String(b.label || "").toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }),
      ];
      if (!chips.length) {
        badgesRoot.innerHTML = "";
        badgesRoot.hidden = true;
      } else {
        badgesRoot.hidden = false;
        badgesRoot.innerHTML = chips
          .map((b, i) => {
            const colors =
              (window.RRFC_colorsForTeamName &&
                window.RRFC_colorsForTeamName(b.team)) ||
              {};
            const accent = colors.accent || colors.primary || "#f0c34a";
            const primary = colors.primary || accent;
            const title = b.title
              ? b.title
              : b.team
                ? `${b.label} · ${b.team}`
                : b.label || "Badge";
            return `
              <span
                class="badge trophy"
                title="${title}"
                style="
                  --badge-accent: ${accent};
                  --badge-primary: ${primary};
                  animation-delay: ${0.08 + i * 0.06}s;
                "
              >${b.label || "Champion"}</span>`;
          })
          .join("");
      }
    }

    const prevEl = profileRoot.querySelector("[data-player-prev-ovr]");
    if (prevEl) {
      if (ovrChanged(player)) {
        prevEl.hidden = false;
        prevEl.textContent = `was ${player.prevOvr}`;
      } else {
        prevEl.hidden = true;
        prevEl.textContent = "";
      }
    }

    const noteEl = profileRoot.querySelector("[data-player-note]");
    if (noteEl) {
      if (player.note) {
        noteEl.hidden = false;
        noteEl.textContent = player.note;
      } else {
        noteEl.hidden = true;
      }
    }

    const avatar = profileRoot.querySelector(".player-avatar");
    if (avatar && window.RRFCIcons) {
      const url = window.RRFCIcons.resolveUrl(player.name);
      avatar.innerHTML = `
        <img src="${url}" alt="${player.name}" />
        <div class="avatar-placeholder" hidden>Avatar<br />coming soon</div>`;
      const img = avatar.querySelector("img");

      const fitLineToOpaqueBottom = () => {
        try {
          if (!img.naturalWidth) return;
          const canvas = document.createElement("canvas");
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          const { data } = ctx.getImageData(0, 0, w, h);

          let bottom = -1;
          for (let y = h - 1; y >= 0; y -= 1) {
            const row = y * w * 4;
            for (let x = 0; x < w; x += 1) {
              if (data[row + x * 4 + 3] > 12) {
                bottom = y;
                break;
              }
            }
            if (bottom >= 0) break;
          }

          if (bottom < 0) return;

          const displayWidth = avatar.getBoundingClientRect().width || avatar.clientWidth;
          if (!displayWidth) return;
          const fullDisplayHeight = displayWidth * (h / w);
          // Crop to last opaque pixel + 1px so the team line sits under the body.
          const cropHeight = ((bottom + 1) / h) * fullDisplayHeight + 1;
          avatar.classList.add("is-fitted");
          avatar.style.height = `${Math.ceil(cropHeight)}px`;
          img.style.width = "100%";
          img.style.height = "auto";
          img.style.maxWidth = "none";
        } catch (err) {
          console.warn("RRFC avatar line fit skipped:", err);
        }
      };

      const layoutAvatar = () => {
        avatar.style.height = "";
        avatar.style.marginTop = "";
        requestAnimationFrame(fitLineToOpaqueBottom);
      };

      if (img.complete && img.naturalWidth) layoutAvatar();
      else img.addEventListener("load", layoutAvatar, { once: true });

      window.addEventListener("resize", layoutAvatar);

      img.addEventListener("error", () => {
        img.style.display = "none";
        avatar.style.height = "";
        avatar.style.marginTop = "";
        avatar.classList.remove("is-fitted");
        const ph = avatar.querySelector(".avatar-placeholder");
        if (ph) ph.hidden = false;
      });
    }

    // 2) Optional team overlay — failures here must not wipe the profile.
    try {
      const wrap = profileRoot.querySelector("[data-player-team-wrap]");
      const teamLink = profileRoot.querySelector("[data-player-team-link]");
      const teamLabel = profileRoot.querySelector("[data-player-team]");
      const teamLogo = profileRoot.querySelector("[data-player-team-logo]");
      const team =
        (window.RRFC_findTeamForPlayer &&
          window.RRFC_findTeamForPlayer(player.name)) ||
        null;

      if (wrap && teamLabel) {
        wrap.hidden = false;
        wrap.removeAttribute("hidden");
        if (team) {
          wrap.classList.remove("is-free-agent");
          teamLabel.textContent = team.name;
          if (teamLink) {
            teamLink.href = `team.html?name=${encodeURIComponent(team.name)}`;
          }
          profileRoot.querySelector("[data-player-meta]").textContent =
            `${team.name} · ${club} · ${player.ovr} OVR`;
          const seasonEl = profileRoot.querySelector("[data-player-season]");
          if (seasonEl && team.season != null) {
            seasonEl.textContent = `Season ${team.season}`;
          }
          if (teamLogo && window.RRFCMedia) {
            try {
              teamLogo.hidden = false;
              teamLogo.removeAttribute("hidden");
              teamLogo.src = window.RRFCMedia.resolveUrl("teams", team.name);
              teamLogo.alt = team.name;
              teamLogo.onerror = () => teamLogo.classList.add("is-missing");
            } catch {
              teamLogo.hidden = true;
            }
          }
          try {
            if (window.RRFC_applyTeamTheme) window.RRFC_applyTeamTheme(team);
          } catch (themeErr) {
            console.warn("RRFC team theme skipped:", themeErr);
          }
        } else {
          wrap.classList.add("is-free-agent");
          teamLabel.textContent = "Free Agent";
          if (teamLink) teamLink.removeAttribute("href");
          if (teamLogo) teamLogo.hidden = true;
        }
      }
    } catch (err) {
      console.warn("RRFC team overlay skipped:", err);
    }
  }

  const teamsRoot = document.getElementById("teams-root");
  if (teamsRoot && window.RRFC_TEAMS) {
    teamsRoot.innerHTML = `
      <div class="teams-grid">
        ${window.RRFC_TEAMS.map((t, i) => {
          const url = window.RRFCMedia
            ? window.RRFCMedia.resolveUrl("teams", t.name)
            : "";
          return `
          <a class="team-card" href="team.html?name=${encodeURIComponent(t.name)}" style="animation-delay: ${Math.min(i * 0.04, 0.4)}s">
            <div class="team-card-logo">
              <img src="${url}" alt="${t.name}" />
            </div>
            <div class="team-card-name">${t.name}</div>
            <div class="team-card-meta">Season ${t.season}</div>
          </a>`;
        }).join("")}
      </div>`;
  }

  const teamPage = document.querySelector("[data-team-page]");
  if (teamPage && window.RRFC_TEAMS) {
    const params = new URLSearchParams(window.location.search);
    const team =
      (window.RRFC_findTeam && window.RRFC_findTeam(params.get("name"))) ||
      window.RRFC_TEAMS[0];

    document.title = `${team.name} — RRFC`;
    if (window.RRFC_applyTeamTheme) window.RRFC_applyTeamTheme(team);

    const logoUrl = window.RRFCMedia
      ? window.RRFCMedia.resolveUrl("teams", team.name)
      : "";

    teamPage.querySelector("[data-team-name]").textContent = team.name;
    teamPage.querySelector("[data-team-meta]").textContent = `Season ${team.season}`;
    const logoImg = teamPage.querySelector("[data-team-logo]");
    if (logoImg) {
      logoImg.src = logoUrl;
      logoImg.alt = team.name;
    }

    const rosterRoot = teamPage.querySelector("[data-team-roster]");
    const top5El = teamPage.querySelector("[data-team-top5]");
    const roster = [...(team.roster || [])].sort((a, b) => {
      const pa = window.RRFC_findPlayerByName && window.RRFC_findPlayerByName(a);
      const pb = window.RRFC_findPlayerByName && window.RRFC_findPlayerByName(b);
      const oa = pa && pa.ovr != null ? Number(pa.ovr) : -Infinity;
      const ob = pb && pb.ovr != null ? Number(pb.ovr) : -Infinity;
      if (ob !== oa) return ob - oa;
      return String(a).localeCompare(String(b));
    });

    const ovrs = roster
      .map((name) => {
        const player =
          window.RRFC_findPlayerByName && window.RRFC_findPlayerByName(name);
        return player && player.ovr != null ? Number(player.ovr) : null;
      })
      .filter((n) => Number.isFinite(n));

    if (top5El) {
      const valueEl = top5El.querySelector("[data-team-top5-value]");
      if (ovrs.length) {
        const top = ovrs.slice(0, 5);
        const avg = Math.round(top.reduce((sum, n) => sum + n, 0) / top.length);
        top5El.hidden = false;
        if (valueEl) valueEl.textContent = String(avg);
      } else {
        top5El.hidden = true;
        if (valueEl) valueEl.textContent = "";
      }
    }

    if (!roster.length) {
      rosterRoot.innerHTML = `<p class="stub-note">Roster not added yet. Send the player list and we’ll plug it in.</p>`;
    } else {
      rosterRoot.innerHTML = `
        <div class="roster-list">
          ${roster
            .map((name) => {
              const player =
                window.RRFC_findPlayerByName && window.RRFC_findPlayerByName(name);
              const iconUrl =
                player && window.RRFCIcons
                  ? window.RRFCIcons.resolveUrl(player.name)
                  : "";
              const meta = player
                ? `${player.ovr} OVR${
                    player.prevOvr != null && Number(player.prevOvr) !== Number(player.ovr)
                      ? ` · was ${player.prevOvr}`
                      : ""
                  }`
                : "N/A";
              const stripes = `
                <span class="roster-stripe roster-stripe-edge" aria-hidden="true"></span>
                <span class="roster-stripe roster-stripe-accent" aria-hidden="true"></span>`;
              const stripeEnd = `<span class="roster-stripe roster-stripe-end" aria-hidden="true"></span>`;
              const icon = player
                ? `<div class="roster-row-icon"><img src="${iconUrl}" alt="" onerror="this.parentElement.classList.add('fallback'); this.remove(); this.parentElement.textContent='RR';" /></div>`
                : `<div class="roster-row-icon fallback">N/A</div>`;

              if (player) {
                return `
                  <a class="roster-row" href="player.html?name=${encodeURIComponent(player.name)}">
                    ${stripes}
                    ${icon}
                    <div class="roster-row-copy">
                      <strong>${name}</strong>
                      <span>${meta}</span>
                    </div>
                    ${stripeEnd}
                  </a>`;
              }
              return `
                <div class="roster-row is-plain">
                  ${stripes}
                  ${icon}
                  <div class="roster-row-copy">
                    <strong>${name}</strong>
                    <span>${meta}</span>
                  </div>
                  ${stripeEnd}
                </div>`;
            })
            .join("")}
        </div>`;
    }
  }

  // Apply custom site logo from Media Editor if present
  if (window.RRFCMedia) {
    const logoUrl = window.RRFCMedia.resolveUrl("site", "logo");
    document.querySelectorAll(".brand img, .league-mark, [data-site-logo]").forEach((img) => {
      const local = window.RRFCMedia.get("site", "logo");
      if (local) img.src = local;
      else img.src = logoUrl;
    });
  }
})();
