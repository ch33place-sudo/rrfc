window.RRFCIcons = (() => {
  const STORAGE_KEY = "rrfc-player-icons-v1";

  const slug = (name) =>
    String(name)
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const readMap = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  };

  const writeMap = (map) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  };

  const getIcon = (name) => {
    const map = readMap();
    return map[slug(name)] || null;
  };

  const setIcon = (name, dataUrl) => {
    const map = readMap();
    map[slug(name)] = dataUrl;
    writeMap(map);
  };

  const removeIcon = (name) => {
    const map = readMap();
    delete map[slug(name)];
    writeMap(map);
  };

  const fileUrl = (name) => `assets/players/${slug(name)}.png`;

  const resolveUrl = (name) => getIcon(name) || fileUrl(name);

  const resizeToDataUrl = (file, size = 256) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Could not load image"));
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          const scale = Math.max(size / img.width, size / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.fillStyle = "#111";
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.88));
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
    slug,
    readMap,
    getIcon,
    setIcon,
    removeIcon,
    fileUrl,
    resolveUrl,
    resizeToDataUrl,
    dataUrlToBlob,
    STORAGE_KEY,
  };
})();
