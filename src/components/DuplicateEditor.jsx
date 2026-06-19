import { X } from "lucide-react";
import { C, FF, RARITIES } from "../lib/theme";
import { Modal, btnBase, inputStyle, labelStyle } from "./ui";

export function DuplicateEditor({ entry, state, onChange, onClose }) {
  const count = state?.count || 0;
  const pasted = state?.pasted || false;
  const rar = entry.section.rarity;

  return (
    <Modal onClose={onClose} maxWidth={320}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontFamily: FF.mono, fontSize: 18, fontWeight: 700 }}>{entry.key}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <X size={16} color={C.ink} />
        </button>
      </div>
      {rar && rar !== "common" && (
        <div style={{
          display: "inline-block", padding: "2px 8px",
          background: RARITIES[rar].bg, color: RARITIES[rar].color,
          fontSize: 10, fontWeight: 700, letterSpacing: 1,
          textTransform: "uppercase", marginBottom: 12,
        }}>
          {RARITIES[rar].name}
        </div>
      )}
      <div style={{ ...labelStyle, marginTop: 16 }}>Cantidad que tenés</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <button onClick={() => onChange({
          count: Math.max(0, count - 1),
          pasted: count - 1 === 0 ? false : pasted,
        })} style={{ ...btnBase, width: 36, padding: 0, height: 36, justifyContent: "center" }}>
          −
        </button>
        <input type="number" min={0} value={count}
          onChange={(e) => onChange({ count: Math.max(0, +e.target.value || 0), pasted })}
          style={{ ...inputStyle, fontFamily: FF.mono, fontWeight: 700, fontSize: 18, textAlign: "center", flex: 1 }} />
        <button onClick={() => onChange({ count: count + 1, pasted })}
          style={{ ...btnBase, width: 36, padding: 0, height: 36, justifyContent: "center" }}>
          +
        </button>
      </div>
      <label style={{
        display: "flex", alignItems: "center", gap: 8,
        cursor: count > 0 ? "pointer" : "default",
        opacity: count > 0 ? 1 : 0.4,
        fontFamily: FF.body, fontSize: 13,
      }}>
        <input type="checkbox" checked={pasted} disabled={count === 0}
          onChange={(e) => onChange({ count, pasted: e.target.checked })}
          style={{ width: 16, height: 16, cursor: count > 0 ? "pointer" : "default" }} />
        Una está pegada en el álbum
      </label>
    </Modal>
  );
}
