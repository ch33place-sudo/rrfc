window.RRFCMedia = (() => {
  const BUCKETS = {
    players: {
      storageKey: "rrfc-player-icons-v1",
      dir: "assets/players",
      size: 256,
    },
    teams: {
      storageKey: "rrfc-team-logos-v1",
      dir: "assets/teams",
      size: 256,
    },
    site: {
      storageKey: "rrfc-site-images-v1",
      dir: "assets",
      size: 512,
    },
  };

  const slug = (name) =>
    String(name)
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const bucket = (id) => BUCKETS[id] || BUCKETS.players;

  const readMap = (bucketId) => {
    try {
      return JSON.parse(localStorage.getItem(bucket(bucketId).storageKey) || "{}");
    } catch {
      return {};
    }
  };

  const writeMap = (bucketId, map) => {
    localStorage.setItem(bucket(bucketId).storageKey, JSON.stringify(map));
  };

  const get = (bucketId, name) => {
    const map = readMap(bucketId);
    return map[slug(name)] || null;
  };

  const set = (bucketId, name, dataUrl) => {
    const map = readMap(bucketId);
    map[slug(name)] = dataUrl;
    writeMap(bucketId, map);
  };

  const remove = (bucketId, name) => {
    const map = readMap(bucketId);
    delete map[slug(name)];
    writeMap(bucketId, map);
  };

  const fileUrl = (bucketId, name) => {
    const b = bucket(bucketId);
    if (bucketId === "site" && name === "logo") return "assets/logo.png";
    return `${b.dir}/${slug(name)}.png`;
  };

  const resolveUrl = (bucketId, name) => get(bucketId, name) || fileUrl(bucketId, name);

  const resizeToDataUrl = (file, size = 256, options = {}) =>
    new Promise((resolve, reject) => {
      const fit = options.fit === "cover" ? "cover" : "contain";
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Could not load image"));
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          // Keep transparency — do not fill a background.
          ctx.clearRect(0, 0, size, size);
          const scale =
            fit === "cover"
              ? Math.max(size / img.width, size / img.height)
              : Math.min(size / img.width, size / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

          // Punch out near-black studio/backdrop pixels so old black-box uploads clean up.
          try {
            const imageData = ctx.getImageData(0, 0, size, size);
            const { data } = imageData;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              // Very dark + low color spread = backdrop black/charcoal
              if (max <= 28 && max - min <= 10) {
                data[i + 3] = 0;
              } else if (max <= 42 && max - min <= 8) {
                data[i + 3] = Math.round(data[i + 3] * ((max - 28) / 14));
              }
            }
            ctx.putImageData(imageData, 0, 0);
          } catch {
            /* tainted canvas — keep drawn image as-is */
          }

          resolve(canvas.toDataURL("image/png"));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

  const dataUrlToBlob = (dataUrl) => {
    const [header, data] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  };

  return {
    BUCKETS,
    slug,
    readMap,
    get,
    set,
    remove,
    fileUrl,
    resolveUrl,
    resizeToDataUrl,
    dataUrlToBlob,
  };
})();

/* Back-compat for player icons */
window.RRFCIcons = {
  slug: (...a) => window.RRFCMedia.slug(...a),
  readMap: () => window.RRFCMedia.readMap("players"),
  getIcon: (name) => window.RRFCMedia.get("players", name),
  setIcon: (name, dataUrl) => window.RRFCMedia.set("players", name, dataUrl),
  removeIcon: (name) => window.RRFCMedia.remove("players", name),
  fileUrl: (name) => window.RRFCMedia.fileUrl("players", name),
  resolveUrl: (name) => window.RRFCMedia.resolveUrl("players", name),
  resizeToDataUrl: (...a) => window.RRFCMedia.resizeToDataUrl(...a),
  dataUrlToBlob: (...a) => window.RRFCMedia.dataUrlToBlob(...a),
  STORAGE_KEY: "rrfc-player-icons-v1",
};

window.RRFCTeams = {
  resolveLogo: (name) => window.RRFCMedia.resolveUrl("teams", name),
  getLogo: (name) => window.RRFCMedia.get("teams", name),
};
