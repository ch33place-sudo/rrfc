(() => {
  const root = document.getElementById("media-editor-root");
  if (!root || !window.RRFCMedia) return;

  const searchInput = document.getElementById("media-search");
  const clubSelect = document.getElementById("media-club");
  const teamScope = document.getElementById("media-team-scope");
  const progressEl = document.getElementById("media-progress");
  const fileInput = document.getElementById("media-file-input");
  const saveFolderBtn = document.getElementById("save-folder-btn");
  const folderHint = document.getElementById("folder-hint");
  const clubWrap = document.getElementById("player-club-wrap");
  const teamScopeWrap = document.getElementById("team-scope-wrap");
  const tabs = [...document.querySelectorAll(".editor-tab")];

  let activeTab = "teams";
  let activeItem = null;
  const folderHandles = { players: null, teams: null, site: null };

  const setTab = (tab) => {
    activeTab = tab;
    tabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
    clubWrap.hidden = tab !== "players";
    teamScopeWrap.hidden = tab !== "teams";
    searchInput.parentElement.hidden = tab === "site";
    render();
  };

  tabs.forEach((btn) => btn.addEventListener("click", () => setTab(btn.dataset.tab)));

  const itemsForTab = () => {
    const q = (searchInput.value || "").trim().toLowerCase();

    if (activeTab === "site") {
      return [{ key: "logo", label: "Site logo", sub: "Header + favicon", bucket: "site" }];
    }

    if (activeTab === "players") {
      const club = clubSelect.value;
      return (window.RRFC_PLAYERS || [])
        .filter((p) => (club === "all" || p.club === club) && (!q || p.name.toLowerCase().includes(q)))
        .map((p) => ({
          key: p.name,
          label: p.name,
          sub: `${p.ovr} OVR`,
          bucket: "players",
        }));
    }

    // teams
    const scope = teamScope.value;
    const currentNames = new Set((window.RRFC_TEAMS || []).map((t) => t.name));
    let names =
      scope === "current"
        ? (window.RRFC_TEAMS || []).map((t) => t.name)
        : window.RRFC_HISTORY_TEAMS || [];

    return names
      .filter((name) => !q || name.toLowerCase().includes(q))
      .map((name) => ({
        key: name,
        label: name,
        sub: currentNames.has(name) ? "Season 11" : "History",
        bucket: "teams",
      }));
  };

  const updateProgress = (items) => {
    const map = window.RRFCMedia.readMap(activeTab === "site" ? "site" : activeTab);
    const set = items.filter((item) => map[window.RRFCMedia.slug(item.key)]).length;
    progressEl.textContent = `${set} / ${items.length} set`;
  };

  const render = () => {
    const items = itemsForTab();
    root.innerHTML = items
      .map((item) => {
        const url = window.RRFCMedia.resolveUrl(item.bucket, item.key);
        const hasLocal = Boolean(window.RRFCMedia.get(item.bucket, item.key));
        return `
          <article class="icon-edit-card" data-bucket="${item.bucket}" data-key="${item.key.replace(/"/g, "&quot;")}">
            <div class="icon-edit-avatar">
              <img src="${url}" alt="" onerror="this.style.display='none'; this.nextElementSibling.hidden=false;" />
              <div class="icon-edit-fallback" ${hasLocal ? "hidden" : ""}>No image</div>
            </div>
            <div class="icon-edit-info">
              <strong>${item.label}</strong>
              <span>${item.sub}</span>
            </div>
            <div class="icon-edit-buttons">
              <button type="button" class="btn-primary btn-small" data-upload>Upload</button>
              <button type="button" class="btn-ghost btn-small" data-clear ${hasLocal ? "" : "disabled"}>Clear</button>
            </div>
          </article>`;
      })
      .join("");
    updateProgress(items);
  };

  root.addEventListener("click", (e) => {
    const card = e.target.closest(".icon-edit-card");
    if (!card) return;
    const bucket = card.getAttribute("data-bucket");
    const key = card.getAttribute("data-key");

    if (e.target.closest("[data-upload]")) {
      activeItem = { bucket, key };
      fileInput.value = "";
      fileInput.click();
      return;
    }

    if (e.target.closest("[data-clear]")) {
      window.RRFCMedia.remove(bucket, key);
      render();
      refreshSiteLogos();
    }
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file || !activeItem) return;
    const { bucket, key } = activeItem;
    const size = window.RRFCMedia.BUCKETS[bucket].size;

    try {
      const dataUrl = await window.RRFCMedia.resizeToDataUrl(file, size);
      window.RRFCMedia.set(bucket, key, dataUrl);

      const handle = folderHandles[bucket];
      if (handle) {
        try {
          const blob = window.RRFCMedia.dataUrlToBlob(dataUrl);
          const fileName = bucket === "site" && key === "logo" ? "logo.png" : `${window.RRFCMedia.slug(key)}.png`;
          const fh = await handle.getFileHandle(fileName, { create: true });
          const writable = await fh.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          console.warn(err);
        }
      }

      render();
      refreshSiteLogos();
    } catch (err) {
      alert("Could not use that image. Try a PNG or JPG.");
      console.error(err);
    } finally {
      activeItem = null;
    }
  });

  const refreshSiteLogos = () => {
    const url = window.RRFCMedia.resolveUrl("site", "logo");
    document.querySelectorAll("[data-site-logo], .brand img, .league-mark").forEach((img) => {
      img.src = url;
    });
  };

  saveFolderBtn.addEventListener("click", async () => {
    if (!window.showDirectoryPicker) {
      alert("Folder saving needs Chrome or Edge. Images still save in this browser.");
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      folderHandles[activeTab === "site" ? "site" : activeTab] = handle;
      const bucketId = activeTab === "site" ? "site" : activeTab;
      const map = window.RRFCMedia.readMap(bucketId);
      let saved = 0;
      for (const [key, dataUrl] of Object.entries(map)) {
        const blob = window.RRFCMedia.dataUrlToBlob(dataUrl);
        const fileName = bucketId === "site" && key === "logo" ? "logo.png" : `${key}.png`;
        const fh = await handle.getFileHandle(fileName, { create: true });
        const writable = await fh.createWritable();
        await writable.write(blob);
        await writable.close();
        saved += 1;
      }
      folderHint.textContent = `Connected. Saved ${saved} file(s). New uploads for this tab will also save there.`;
    } catch (err) {
      if (err && err.name === "AbortError") return;
      alert("Could not open that folder.");
    }
  });

  searchInput.addEventListener("input", render);
  clubSelect.addEventListener("change", render);
  teamScope.addEventListener("change", render);

  setTab("teams");
  refreshSiteLogos();
})();
