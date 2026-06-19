import { useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { AddAlbumView } from "./components/AddAlbumView";
import { AlbumDetailView } from "./components/AlbumDetailView";
import { storage } from "./lib/storage";
import { uid } from "./lib/utils";
import { C, FF } from "./lib/theme";

export default function App() {
  const [view, setView] = useState("loading");
  const [albums, setAlbums] = useState([]);
  const [stickers, setStickers] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Carga inicial desde localStorage
  useEffect(() => {
    const a = storage.loadAlbums();
    const st = {};
    for (const al of a) st[al.id] = storage.loadStickers(al.id);
    setAlbums(a);
    setStickers(st);
    setView("dash");
  }, []);

  const persistAlbums = (next) => {
    setAlbums(next);
    storage.saveAlbums(next);
  };

  const persistStickers = (albumId, next) => {
    setStickers((prev) => ({ ...prev, [albumId]: next }));
    storage.saveStickers(albumId, next);
  };

  const createAlbum = (data) => {
    const newAlbum = { id: uid(), ...data, createdAt: Date.now() };
    persistAlbums([...albums, newAlbum]);
    persistStickers(newAlbum.id, {});
    setView("dash");
  };

  const updateAlbum = (id, data) => {
    const next = albums.map((a) => (a.id === id ? { ...a, ...data } : a));
    persistAlbums(next);
    setEditingId(null);
    setView("detail");
  };

  const deleteAlbum = (id) => {
    persistAlbums(albums.filter((a) => a.id !== id));
    storage.deleteAlbumData(id);
    setStickers((prev) => {
      const c = { ...prev };
      delete c[id];
      return c;
    });
    setActiveId(null);
    setView("dash");
  };

  const reloadAll = () => {
    const a = storage.loadAlbums();
    const st = {};
    for (const al of a) st[al.id] = storage.loadStickers(al.id);
    setAlbums(a);
    setStickers(st);
    setActiveId(null);
    setEditingId(null);
    setView("dash");
  };

  if (view === "loading") {
    return (
      <div style={{
        minHeight: "100vh", background: C.paper,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ color: C.inkMuted, fontFamily: FF.display, fontSize: 16 }}>
          Abriendo el archivo…
        </span>
      </div>
    );
  }

  if (view === "add") {
    return (
      <AddAlbumView onCancel={() => setView("dash")} onSubmit={createAlbum} />
    );
  }

  if (view === "edit" && editingId) {
    const editing = albums.find((a) => a.id === editingId);
    if (!editing) {
      setEditingId(null);
      setView("dash");
      return null;
    }
    return (
      <AddAlbumView editing={editing}
        onCancel={() => { setEditingId(null); setView("detail"); }}
        onSubmit={(data) => updateAlbum(editingId, data)} />
    );
  }

  if (view === "detail" && activeId) {
    const album = albums.find((a) => a.id === activeId);
    if (!album) {
      setActiveId(null);
      setView("dash");
      return null;
    }
    return (
      <AlbumDetailView album={album}
        stickers={stickers[album.id] || {}}
        onUpdateStickers={(s) => persistStickers(album.id, s)}
        onBack={() => setView("dash")}
        onEdit={() => { setEditingId(album.id); setView("edit"); }}
        onDelete={() => deleteAlbum(album.id)} />
    );
  }

  return (
    <Dashboard albums={albums} stickers={stickers}
      onOpen={(id) => { setActiveId(id); setView("detail"); }}
      onAdd={() => setView("add")}
      onImport={reloadAll} />
  );
}
