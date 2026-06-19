import { C, FF } from "../lib/theme";
import { Ring } from "./Ring";
import { getAlbumTotal, getAllStickerEntries } from "../lib/utils";

export function AlbumCard({ album, stickers, onOpen }) {
  const total = getAlbumTotal(album);
  const allEntries = getAllStickerEntries(album);
  let owned = 0, dupes = 0;
  for (const e of allEntries) {
    const st = stickers[e.key];
    if (st && st.count > 0) {
      owned++;
      if (st.count > 1) dupes += st.count - 1;
    }
  }
  const pct = total ? Math.round((owned / total) * 100) : 0;
  const done = pct === 100;

  return (
    <div onClick={onOpen} style={{
      display: "flex", flexDirection: "column", cursor: "pointer",
      background: C.paperLight, border: `1px solid ${C.ruleStrong}`,
      transition: "transform .15s, box-shadow .15s",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `4px 4px 0 ${C.ink}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}>
      <div style={{
        aspectRatio: "3 / 4",
        background: album.cover ? `url(${album.cover}) center/cover` : album.color,
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        borderBottom: `1px solid ${C.ruleStrong}`, padding: 16, overflow: "hidden",
      }}>
        {!album.cover && (
          <div style={{
            color: C.white, fontFamily: FF.display, fontWeight: 800, fontSize: 22,
            lineHeight: 1.05, textAlign: "center", letterSpacing: -0.5,
          }}>
            {album.name}
          </div>
        )}
        {done && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            background: C.gold, color: C.ink, fontFamily: FF.display,
            fontSize: 10, fontWeight: 900, padding: "4px 8px", letterSpacing: 2,
            border: `1px solid ${C.ink}`, transform: "rotate(6deg)",
          }}>
            COMPLETO
          </div>
        )}
      </div>
      <div style={{ padding: "14px 14px 12px" }}>
        <div style={{ fontSize: 9, letterSpacing: 2.5, color: C.red, fontWeight: 700, marginBottom: 4, fontFamily: FF.body }}>
          {album.sections.length} {album.sections.length === 1 ? "SECCIÓN" : "SECCIONES"}
          {dupes > 0 && ` · ${dupes} REPES`}
        </div>
        <div style={{ fontFamily: FF.display, fontWeight: 700, fontSize: 16, marginBottom: 10, lineHeight: 1.2 }}>
          {album.name}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontFamily: FF.mono, fontSize: 12, color: C.inkMuted }}>
            <strong style={{ color: C.ink, fontFamily: FF.display, fontWeight: 800, fontSize: 18 }}>{owned}</strong>
            <span> / {total}</span>
          </div>
          <Ring pct={pct} size={48} color={done ? C.green : album.color} />
        </div>
        <div style={{ height: 4, background: C.paperDark, marginTop: 8, position: "relative" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: done ? C.green : album.color, transition: "width .4s" }} />
        </div>
      </div>
    </div>
  );
}
