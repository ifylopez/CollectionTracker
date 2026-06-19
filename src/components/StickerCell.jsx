import { useRef } from "react";
import { C, FF, RARITIES } from "../lib/theme";

export function StickerCell({ entry, state, onCycle, onLongPress }) {
  const pressTimer = useRef(null);
  const longFired = useRef(false);

  const count = state?.count || 0;
  const pasted = state?.pasted || false;
  const rar = entry.section.rarity || "common";
  const rarDef = RARITIES[rar];

  let bg, color, borderStyle, borderColor;
  if (count === 0) {
    bg = C.paperLight; color = C.inkFaint; borderStyle = "dashed"; borderColor = C.rule;
  } else if (pasted) {
    bg = C.green; color = C.white; borderStyle = "solid"; borderColor = C.green;
  } else {
    bg = C.goldSoft; color = C.ink; borderStyle = "solid"; borderColor = C.gold;
  }
  const rarityAccent = rar !== "common" ? rarDef.color : null;

  const handleDown = () => {
    longFired.current = false;
    pressTimer.current = setTimeout(() => {
      longFired.current = true;
      onLongPress();
    }, 450);
  };
  const handleUp = () => {
    clearTimeout(pressTimer.current);
    if (!longFired.current) onCycle();
  };
  const handleCancel = () => { clearTimeout(pressTimer.current); };
  const handleContext = (e) => { e.preventDefault(); onLongPress(); };

  return (
    <div
      onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleCancel}
      onTouchStart={handleDown} onTouchEnd={handleUp} onTouchCancel={handleCancel}
      onContextMenu={handleContext}
      title={`${entry.key} — ${count === 0 ? "Falta" : pasted ? "Pegada" : "Suelta"}${count > 1 ? ` ×${count}` : ""}\nClic: cambiar estado · Mantener: editar repes`}
      style={{
        position: "relative", minWidth: 48, height: 36,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: bg, color, fontFamily: FF.mono, fontSize: 11, fontWeight: 600,
        borderTop: `2px ${borderStyle} ${borderColor}`,
        borderRight: `1px ${borderStyle} ${borderColor}`,
        borderBottom: `1px ${borderStyle} ${borderColor}`,
        borderLeft: rarityAccent ? `3px solid ${rarityAccent}` : `1px ${borderStyle} ${borderColor}`,
        cursor: "pointer", userSelect: "none", padding: "0 4px",
        transition: "transform .08s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.zIndex = "3"; }}
      onMouseOut={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.zIndex = ""; }}
    >
      {entry.key}
      {count > 1 && (
        <div style={{
          position: "absolute", top: -6, right: -6,
          minWidth: 18, height: 18, padding: "0 4px",
          background: C.red, color: C.white,
          fontFamily: FF.mono, fontSize: 10, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1.5px solid ${C.paper}`,
        }}>
          ×{count}
        </div>
      )}
      {pasted && count === 1 && (
        <div style={{ position: "absolute", bottom: 2, right: 3, fontSize: 8, opacity: 0.9 }}>✓</div>
      )}
    </div>
  );
}
