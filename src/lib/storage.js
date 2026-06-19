// Almacenamiento local. Todo queda en el navegador del usuario.
// Las claves usan un prefijo "alb." para evitar colisiones con otras apps.

const KEY_ALBUMS = "alb.albums";
const KEY_STICKERS = (id) => `alb.stk.${id}`;
const SCHEMA_VERSION = 2;

export const storage = {
  loadAlbums() {
    try {
      const raw = localStorage.getItem(KEY_ALBUMS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveAlbums(albums) {
    try {
      localStorage.setItem(KEY_ALBUMS, JSON.stringify(albums));
      return true;
    } catch (e) {
      console.error("No se pudo guardar la lista de álbumes:", e);
      return false;
    }
  },

  loadStickers(albumId) {
    try {
      const raw = localStorage.getItem(KEY_STICKERS(albumId));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveStickers(albumId, stickers) {
    try {
      localStorage.setItem(KEY_STICKERS(albumId), JSON.stringify(stickers));
      return true;
    } catch (e) {
      console.error("No se pudo guardar las figuritas:", e);
      return false;
    }
  },

  deleteAlbumData(albumId) {
    localStorage.removeItem(KEY_STICKERS(albumId));
  },

  // ── Backup completo a archivo JSON ─────────────────────────────────────
  exportAll() {
    const albums = storage.loadAlbums();
    const stickers = {};
    for (const a of albums) stickers[a.id] = storage.loadStickers(a.id);
    return {
      schema: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      albums,
      stickers,
    };
  },

  downloadBackup() {
    const data = storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `album-tracker-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Reemplaza TODO con los datos importados. El llamador debe pedir
  // confirmación al usuario antes de invocar esto.
  importAll(data) {
    if (!data || !Array.isArray(data.albums)) {
      throw new Error("El archivo no tiene el formato esperado.");
    }
    // Limpiar todo lo viejo
    const oldAlbums = storage.loadAlbums();
    for (const a of oldAlbums) storage.deleteAlbumData(a.id);
    localStorage.removeItem(KEY_ALBUMS);

    // Cargar lo nuevo
    storage.saveAlbums(data.albums);
    const stickers = data.stickers || {};
    for (const album of data.albums) {
      const s = stickers[album.id] || {};
      storage.saveStickers(album.id, s);
    }
    return true;
  },
};
