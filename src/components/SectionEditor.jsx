import { Trash2 } from "lucide-react";
import { C, FF, RARITIES, RARITY_KEYS } from "../lib/theme";
import { inputStyle, labelStyle } from "./ui";
import { getStickerKey } from "../lib/utils";

export function SectionEditor({ section, onChange, onDelete, idx }) {
  return (
    <div style={{
      border: `1px solid ${C.rule}`, padding: 14, marginBottom: 10,
      background: C.paperLight, position: "relative",
    }}>
      <div style={{
        position: "absolute", top: -10, left: 12,
        background: C.paper, padding: "0 8px", fontFamily: FF.display,
        fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.inkMuted,
      }}>
        SECCIÓN {String(idx + 1).padStart(2, "0")}
      </div>
      <button onClick={onDelete} style={{
        position: "absolute", top: 8, right: 8,
        background: "none", border: "none", cursor: "pointer",
        color: C.inkMuted, padding: 4,
      }}>
        <Trash2 size={14} />
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 10, marginBottom: 10, marginTop: 4 }}>
        <div>
          <label style={labelStyle}>Nombre</label>
          <input value={section.name}
            onChange={(e) => onChange({ ...section, name: e.target.value })}
            placeholder="Ej: Argentina, Legendarias" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Prefijo</label>
          <input value={section.prefix}
            onChange={(e) => onChange({ ...section, prefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
            placeholder="ARG" maxLength={6}
            style={{ ...inputStyle, fontFamily: FF.mono }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Desde</label>
          <input type="number" min={0} value={section.from}
            onChange={(e) => onChange({ ...section, from: Math.max(0, +e.target.value || 0) })}
            style={{ ...inputStyle, fontFamily: FF.mono }} />
        </div>
        <div>
          <label style={labelStyle}>Hasta</label>
          <input type="number" min={0} value={section.to}
            onChange={(e) => onChange({ ...section, to: Math.max(section.from, +e.target.value || 0) })}
            style={{ ...inputStyle, fontFamily: FF.mono }} />
        </div>
        <div>
          <label style={labelStyle}>Rareza</label>
          <select value={section.rarity}
            onChange={(e) => onChange({ ...section, rarity: e.target.value })}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {RARITY_KEYS.map((k) => (
              <option key={k} value={k}>{RARITIES[k].name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 11, color: C.inkMuted, fontFamily: FF.mono }}>
        {section.to >= section.from
          ? `${section.to - section.from + 1} figuritas · ${getStickerKey(section, section.from)} a ${getStickerKey(section, section.to)}`
          : "Rango inválido"}
      </div>
    </div>
  );
}
