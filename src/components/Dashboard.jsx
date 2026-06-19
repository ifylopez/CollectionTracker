import { useRef, useState } from "react";
import { Plus, BookOpen, Download, Upload, AlertTriangle } from "lucide-react";
import { C, FF } from "../lib/theme";
import { Btn, Modal } from "./ui";
import { AlbumCard } from "./AlbumCard";
import { getAlbumTotal, getAllStickerEntries } from "../lib/utils";
import { storage } from "../lib/storage";

export function Dashboard({ albums, stickers, onOpen, onAdd, onImport }) {
  const fileRef = useRef(null);
  const [confirmImport, setConfirmImport] = useState(null);

  const totalCollections = albums.length;
  const totalOwned = albums.reduce((s, a) => {
    const st = stickers[a.id] || {};
    return s + Object.values(st).filter((x) => x && x.count > 0).length;
  }, 0);
  const completed = albums.filter((a) => {
    const st = stickers[a.id] || {};
    const total = getAlbumTotal(a);
    const owned = getAllStickerEntries(a).filter((e) => st[e.key] && st[e.key].count > 0).length;
    return total > 0 && owned === total;
  }).length;

  const today = new Date()
    .toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
    .toUpperCase();

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.albums)) throw new Error("Formato inválido");
      setConfirmImport(data);
    } catch (err) {
      alert("No se pudo leer el archivo. ¿Es un backup válido?");
    }
    e.target.value = "";
  };

  const doImport = () => {
    try {
      storage.importAll(confirmImport);
      onImport();
      setConfirmImport(null);
    } catch (err) {
      alert("Error al importar: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 80px" }}>
      {/* Masthead */}
      <div style={{ borderTop: `5px solid ${C.ink}`, borderBottom: `1px solid ${C.ink}`, padding: "14px 0 10px", marginBottom: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, fontWeight: 700, color: C.inkMuted, fontFamily: FF.body }}>
            EDICIÓN PERSONAL · {today}
          </div>
          <div style={{ fontSize: 10, letterSpacing: 4, fontWeight: 700, color: C.red, fontFamily: FF.body }}>
            {totalCollections} {totalCollections === 1 ? "TÍTULO" : "TÍTULOS"} · {totalOwned.toLocaleString("es-AR")} FIGURITAS
          </div>
        </div>
      </div>

      <div style={{ borderBottom: `3px solid ${C.ink}`, paddingBottom: 18, marginBottom: 28 }}>
        <h1 style={{
          fontFamily: FF.display, fontSize: "clamp(48px, 9vw, 96px)", fontWeight: 900,
          lineHeight: 0.92, letterSpacing: -3, margin: "8px 0 6px", color: C.ink,
        }}>
          El Álbum
        </h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontFamily: FF.display, fontSize: 16, fontStyle: "italic", color: C.inkMuted, margin: 0, fontWeight: 400 }}>
            Archivo personal de figuritas y cartas
            {completed > 0 && (
              <span style={{ color: C.green, fontStyle: "normal", fontWeight: 600 }}>
                {" · "}{completed} {completed === 1 ? "completo" : "completos"}
              </span>
            )}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn variant="ghost" icon={Upload} onClick={() => fileRef.current?.click()}>Importar</Btn>
            <Btn variant="ghost" icon={Download} onClick={() => storage.downloadBackup()}
              style={{ opacity: albums.length === 0 ? 0.4 : 1, pointerEvents: albums.length === 0 ? "none" : "auto" }}>
              Exportar backup
            </Btn>
            <Btn variant="filled" icon={Plus} onClick={onAdd}>Nuevo álbum</Btn>
          </div>
        </div>
        <input type="file" accept=".json,application/json" ref={fileRef} onChange={handleFile} style={{ display: "none" }} />
      </div>

      {albums.length === 0 && (
        <div style={{
          border: `2px dashed ${C.ruleStrong}`, padding: "70px 24px",
          textAlign: "center", marginTop: 40,
        }}>
          <BookOpen size={36} color={C.inkFaint} style={{ marginBottom: 14 }} />
          <h2 style={{ fontFamily: FF.display, fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>
            El archivo está vacío
          </h2>
          <p style={{ color: C.inkMuted, margin: "0 0 18px", fontSize: 14 }}>
            Empezá agregando tu primera colección, o importá un backup
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="filled" icon={Plus} onClick={onAdd}>Crear primer álbum</Btn>
            <Btn icon={Upload} onClick={() => fileRef.current?.click()}>Importar backup</Btn>
          </div>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 18,
      }}>
        {albums.map((a) => (
          <AlbumCard key={a.id} album={a} stickers={stickers[a.id] || {}}
            onOpen={() => onOpen(a.id)} />
        ))}
      </div>

      {confirmImport && (
        <Modal onClose={() => setConfirmImport(null)} maxWidth={420}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
            <AlertTriangle size={24} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ fontFamily: FF.display, fontWeight: 800, fontSize: 20, margin: "0 0 6px" }}>
                Reemplazar todo el archivo
              </h3>
              <p style={{ color: C.inkMuted, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                Vas a importar <strong style={{ color: C.ink }}>{confirmImport.albums.length}</strong> álbum(es)
                {confirmImport.exportedAt && (
                  <> exportado(s) el <strong style={{ color: C.ink }}>{new Date(confirmImport.exportedAt).toLocaleString("es-AR")}</strong></>
                )}.
                Esto va a borrar todos tus álbumes actuales y reemplazarlos. ¿Seguro?
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
            <Btn onClick={() => setConfirmImport(null)}>Cancelar</Btn>
            <Btn variant="red" onClick={doImport}>Sí, reemplazar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
