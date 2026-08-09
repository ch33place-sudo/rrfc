(() => {
  const root = document.getElementById("icon-editor-root");
  if (!root || !window.RRFC_PLAYERS || !window.RRFCIcons) return;

  const searchInput = document.getElementById("icon-search");
  const clubSelect = document.getElementById("icon-club");
  const progressEl = document.getElementById("icon-progress");
  const fileInput = document.getElementById("icon-file-input");
  const saveFolderBtn = document.getElementById("save-folder-btn");
  const folderHint = document.getElementById("folder-hint");

  let activePlayer = null;
  let folderHandle = null;

  const clubLabel = (clubId) => {
    const club = (window.RRFC_CLUBS || []).find((c) => c.id === clubId);
    return club ? club.label : `${clubId}'s Club`;
  };

  const updateProgress = () => {
    const map = window.RRFCIcons.readMap();
    const total = window.RRFC_PLAYERS.length;
    const set = window.RRFC_PLAYERS.filter((p) => map[window.RRFCIcons.slug(p.name)]).length;
    progressEl.textContent = `${set} / ${total} icons set`;
  };

  const filteredPlayers = () => {
    const q = (searchInput.value || "").trim().toLowerCase();
    const club = clubSelect.value;
    return window.RRFC_PLAYERS.filter((p) => {
      const clubOk = club === "all" || p.club === club;
      const searchOk = !q || p.name.toLowerCase().includes(q);
      return clubOk && searchOk;
    });
  };

  const render = () => {
    const players = filteredPlayers();
    root.innerHTML = players
      .map((p) => {
        const url = window.RRFCIcons.resolveUrl(p.name);
        const hasLocal = Boolean(window.RRFCIcons.getIcon(p.name));
        return `
          <article class="icon-edit-card" data-name="${p.name.replace(/"/g, "&quot;")}">
            <div class="icon-edit-avatar">
              <img src="${url}" alt="" data-icon-img onerror="this.style.display='none'; this.nextElementSibling.hidden=false;" />
              <div class="icon-edit-fallback" ${hasLocal ? "hidden" : ""}>No icon</div>
            </div>
            <div class="icon-edit-info">
              <strong>${p.name}</strong>
              <span>${p.ovr} OVR · ${clubLabel(p.club)}</span>
            </div>
            <div class="icon-edit-buttons">
              <button type="button" class="btn-primary btn-small" data-upload>Upload</button>
              <button type="button" class="btn-ghost btn-small" data-clear ${hasLocal ? "" : "disabled"}>Clear</button>
            </div>
          </article>`;
      })
      .join("");

    updateProgress();
  };

  root.addEventListener("click", async (e) => {
    const card = e.target.closest(".icon-edit-card");
    if (!card) return;
    const name = card.getAttribute("data-name");

    if (e.target.closest("[data-upload]")) {
      activePlayer = name;
      fileInput.value = "";
      fileInput.click();
      return;
    }

    if (e.target.closest("[data-clear]")) {
      window.RRFCIcons.removeIcon(name);
      render();
    }
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file || !activePlayer) return;

    try {
      const dataUrl = await window.RRFCIcons.resizeToDataUrl(file, 256);
      window.RRFCIcons.setIcon(activePlayer, dataUrl);

      if (folderHandle) {
        try {
          const blob = window.RRFCIcons.dataUrlToBlob(dataUrl);
          const fileName = `${window.RRFCIcons.slug(activePlayer)}.png`;
          const handle = await folderHandle.getFileHandle(fileName, { create: true });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          console.warn("Could not write to folder", err);
        }
      }

      render();
    } catch (err) {
      alert("Could not use that image. Try a PNG or JPG.");
      console.error(err);
    } finally {
      activePlayer = null;
    }
  });

  searchInput.addEventListener("input", render);
  clubSelect.addEventListener("change", render);

  saveFolderBtn.addEventListener("click", async () => {
    if (!window.showDirectoryPicker) {
      alert(
        "Folder saving needs Chrome or Edge. Icons still save in this browser and show on the site when you open pages here."
      );
      return;
    }

    try {
      folderHandle = await window.showDirectoryPicker({ mode: "readwrite" });
      const map = window.RRFCIcons.readMap();
      let saved = 0;

      for (const player of window.RRFC_PLAYERS) {
        const key = window.RRFCIcons.slug(player.name);
        const dataUrl = map[key];
        if (!dataUrl) continue;
        const blob = window.RRFCIcons.dataUrlToBlob(dataUrl);
        const handle = await folderHandle.getFileHandle(`${key}.png`, { create: true });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        saved += 1;
      }

      folderHint.textContent = `Connected. Saved ${saved} icon file(s) into that folder. New uploads will also save there.`;
    } catch (err) {
      if (err && err.name === "AbortError") return;
      console.error(err);
      alert("Could not open that folder.");
    }
  });

  render();
})();
