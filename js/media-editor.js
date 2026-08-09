(() => {
  const root = document.getElementById("media-editor-root");
  if (!root || !window.RRFCMedia) return;

  const searchInput = document.getElementById("media-search");
  const clubSelect = document.getElementById("media-club");
  const progressEl = document.getElementById("media-progress");
  const fileInput = document.getElementById("media-file-input");
  const saveFolderBtn = document.getElementById("save-folder-btn");
  const folderHint = document.getElementById("folder-hint");
  const clubWrap = document.getElementById("player-club-wrap");
  const searchWrap = searchInput.parentElement;
  const tabs = [...document.querySelectorAll(".editor-tab")];

  let activeTab = "teams";
  let activeItem = null;
  const folderHandles = { players: null, teams: null, site: null };

  const FOLDER_LABELS = {
    teams: "assets/teams",
    players: "assets/players",
    site: "assets",
  };

  const IDB_NAME = "rrfc-media-folders";
  const IDB_STORE = "handles";

  const openDb = () =>
    new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

  const idbGet = async (key) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  };

  const idbSet = async (key, value) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  };

  const bucketForTab = () => {
    if (activeTab === "players") return "players";
    if (activeTab === "site") return "site";
    return "teams";
  };

  const updateFolderHint = () => {
    const bucket = bucketForTab();
    const connected = Boolean(folderHandles[bucket]);
    const path = FOLDER_LABELS[bucket];
    if (connected) {
      folderHint.textContent = `Connected to ${path}. New uploads save there automatically. Still commit + push in GitHub Desktop for the live site.`;
      saveFolderBtn.textContent = "Change folder…";
    } else {
      folderHint.innerHTML = `First upload will ask you to choose <code>${path}</code>. After that, uploads save there automatically (Chrome/Edge, local only).`;
      saveFolderBtn.textContent = "Connect folder…";
    }
  };

  const ensurePermission = async (handle) => {
    if (!handle) return false;
    const opts = { mode: "readwrite" };
    if ((await handle.queryPermission(opts)) === "granted") return true;
    if ((await handle.requestPermission(opts)) === "granted") return true;
    return false;
  };

  const restoreHandle = async (bucket) => {
    try {
      const handle = await idbGet(bucket);
      if (!handle) return null;
      if (await ensurePermission(handle)) {
        folderHandles[bucket] = handle;
        return handle;
      }
    } catch (err) {
      console.warn(err);
    }
    return null;
  };

  const pickFolder = async (bucket) => {
    if (!window.showDirectoryPicker) {
      alert("Auto-save to folder needs Chrome or Edge.");
      return null;
    }
    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    folderHandles[bucket] = handle;
    await idbSet(bucket, handle);
    updateFolderHint();
    return handle;
  };

  const ensureFolder = async (bucket) => {
    if (folderHandles[bucket] && (await ensurePermission(folderHandles[bucket]))) {
      return folderHandles[bucket];
    }
    const restored = await restoreHandle(bucket);
    if (restored) return restored;
    return pickFolder(bucket);
  };

  const writeToFolder = async (bucket, key, dataUrl) => {
    const handle = await ensureFolder(bucket);
    if (!handle) return false;
    const blob = window.RRFCMedia.dataUrlToBlob(dataUrl);
    const fileName =
      bucket === "site" && key === "logo" ? "logo.png" : `${window.RRFCMedia.slug(key)}.png`;
    const fh = await handle.getFileHandle(fileName, { create: true });
    const writable = await fh.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  };

  const setTab = (tab) => {
    activeTab = tab;
    tabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
    clubWrap.hidden = tab !== "players";
    searchWrap.hidden = tab === "site";
    updateFolderHint();
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

    if (activeTab === "historic") {
      const current = new Set((window.RRFC_TEAMS || []).map((t) => t.name));
      return (window.RRFC_CHIP_CHAMPIONS || [])
        .filter((name) => !q || name.toLowerCase().includes(q))
        .map((name) => ({
          key: name,
          label: name,
          sub: current.has(name) ? "Chip winner · also S11" : "Chip winner",
          bucket: "teams",
        }));
    }

    return (window.RRFC_TEAMS || [])
      .filter((t) => !q || t.name.toLowerCase().includes(q))
      .map((t) => ({
        key: t.name,
        label: t.name,
        sub: `Season ${t.season}`,
        bucket: "teams",
      }));
  };

  const updateProgress = () => {
    const cards = [...root.querySelectorAll(".icon-edit-card")];
    const ready = cards.filter((card) => {
      const img = card.querySelector("img");
      const fallback = card.querySelector(".icon-edit-fallback");
      return img && img.style.display !== "none" && fallback && fallback.hidden;
    }).length;
    progressEl.textContent = `${ready} / ${cards.length} set`;
  };

  const wireImage = (img, fallback, clearBtn) => {
    const markMissing = () => {
      img.style.display = "none";
      fallback.hidden = false;
      if (clearBtn) clearBtn.disabled = true;
      updateProgress();
    };
    const markReady = () => {
      img.style.display = "";
      fallback.hidden = true;
      if (clearBtn) {
        const card = img.closest(".icon-edit-card");
        clearBtn.disabled = !window.RRFCMedia.get(card.dataset.bucket, card.dataset.key);
      }
      updateProgress();
    };

    img.addEventListener("load", markReady);
    img.addEventListener("error", markMissing);
    if (img.complete) {
      if (img.naturalWidth > 0) markReady();
      else markMissing();
    }
  };

  const render = () => {
    const items = itemsForTab();
    root.innerHTML = items
      .map((item) => {
        const url = window.RRFCMedia.resolveUrl(item.bucket, item.key);
        const hasLocal = Boolean(window.RRFCMedia.get(item.bucket, item.key));
        const src = hasLocal ? url : `${url}?v=${Date.now() % 100000}`;
        return `
          <article class="icon-edit-card" data-bucket="${item.bucket}" data-key="${item.key.replace(/"/g, "&quot;")}">
            <div class="icon-edit-avatar">
              <img src="${src}" alt="" />
              <div class="icon-edit-fallback" hidden>No image</div>
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

    root.querySelectorAll(".icon-edit-card").forEach((card) => {
      wireImage(
        card.querySelector("img"),
        card.querySelector(".icon-edit-fallback"),
        card.querySelector("[data-clear]")
      );
    });
    updateProgress();
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
      const dataUrl = await window.RRFCMedia.resizeToDataUrl(file, size, {
        // Player headshots fill the frame; logos keep full artwork with transparent padding.
        fit: bucket === "players" ? "cover" : "contain",
      });
      window.RRFCMedia.set(bucket, key, dataUrl);

      try {
        const saved = await writeToFolder(bucket, key, dataUrl);
        if (saved) {
          folderHint.textContent = `Saved to ${FOLDER_LABELS[bucket]}/${
            bucket === "site" && key === "logo" ? "logo.png" : window.RRFCMedia.slug(key) + ".png"
          }. Push with GitHub Desktop when ready.`;
        }
      } catch (err) {
        console.warn(err);
        alert(
          "Saved in browser, but could not write the file. Click Connect folder… and choose " +
            FOLDER_LABELS[bucket]
        );
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
    try {
      await pickFolder(bucketForTab());
    } catch (err) {
      if (err && err.name === "AbortError") return;
      alert("Could not open that folder.");
    }
  });

  searchInput.addEventListener("input", render);
  clubSelect.addEventListener("change", render);

  (async () => {
    await Promise.all(["teams", "players", "site"].map((b) => restoreHandle(b)));
    setTab("teams");
    refreshSiteLogos();
  })();
})();
