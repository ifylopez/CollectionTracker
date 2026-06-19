import { useState } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { C, FF, PALETTE_COLORS } from "../lib/theme";
import { Btn, inputStyle, labelStyle } from "./ui";
import { SectionEditor } from "./SectionEditor";
import { CoverUploader } from "./CoverUploader";
import { uid } from "../lib/utils";

export function AddAlbumView({ onCancel, onSubmit, editing }) {
  const [name, setName] = useState(editing?.name || "");
  const [cover, setCover] = useState(editing?.cover || null);
  const [color, setColor] = useState(editing?.color || PALETTE_COLORS[0]);
  const [sections, setSections] = useState(
    editing?.sections || [
      { id: uid(), name: "Principal", prefix: "", from: 1, to: 100, rarity: "common" },
    ]
  );

  const total = sections.reduce((s, sec) => s + Math.max(0, sec.to - sec.from + 1), 0);
  const valid =
    name.trim() &&
    sections.length > 0 &&
    sections.every((s) => s.name.trim() && s.to >= s.from);

  const addSection = () =>
    setSections([
      ...sections,
      { id: uid(), name: "", prefix: "", from: 1, to: 50, rarity: "common" },
    ]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={onCancel} style={{
        background: "none", border: "none", color: C.inkMuted, cursor: "pointer",
        padding: 0, marginBottom: 24, fontSize: 13, fontFamily: FF.body, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <ChevronLeft size={16} /> Volver al archivo
      </button>

      <div style={{ borderTop: `3px solid ${C.ink}`, paddingTop: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, fontWeight: 700, color: C.red, marginBottom: 6, fontFamily: FF.body }}>
          {editing ? "EDITAR · FICHA TÉCNICA" : "ALTA · NUEVO ÁLBUM"}
        </div>
        <h1 style={{
          fontFamily: FF.display, fontSize: 38, fontWeight: 900, lineHeight: 1,
          margin: 0, color: C.ink, letterSpacing: -1,
        }}>
          {editing ? "Editar álbum" : "Agregar un álbum"}
        </h1>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "200px 1fr",
        gap: 24, alignItems: "start", marginBottom: 28,
      }}>
        <CoverUploader cover={cover} color={color} name={name} onChange={setCover} />

        <div>
          <label style={labelStyle}>Nombre del álbum</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Ej: FIFA World Cup 2022"
            style={{ ...inputStyle, marginBottom: 16, fontFamily: FF.display, fontSize: 18, fontWeight: 600 }} />

          <label style={labelStyle}>Color de identificación</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PALETTE_COLORS.map((c) => (
              <div key={c} onClick={() => setColor(c)} style={{
                width: 28, height: 28, background: c, cursor: "pointer",
                border: color === c ? `2px solid ${C.ink}` : `1px solid ${C.rule}`,
                boxShadow: color === c ? `inset 0 0 0 2px ${C.paper}` : "none",
              }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.ruleStrong}`, paddingTop: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <h2 style={{ fontFamily: FF.display, fontSize: 22, fontWeight: 700, margin: 0 }}>
            Secciones <span style={{ color: C.inkMuted, fontWeight: 400 }}>· {sections.length}</span>
          </h2>
          <span style={{ fontSize: 12, fontFamily: FF.mono, color: C.inkMuted }}>
            {total} figuritas en total
          </span>
        </div>
        <p style={{ fontSize: 13, color: C.inkMuted, margin: "0 0 16px", lineHeight: 1.5 }}>
          Definí los bloques que componen el álbum. Para una numeración simple (1 al N) dejá el prefijo vacío.
          Para grupos por equipo o especiales, usá un prefijo (ej:{" "}
          <span style={{ fontFamily: FF.mono, color: C.ink }}>ARG</span>,{" "}
          <span style={{ fontFamily: FF.mono, color: C.ink }}>LE</span>).
        </p>
      </div>

      {sections.map((s, i) => (
        <SectionEditor key={s.id} section={s} idx={i}
          onChange={(ns) => setSections(sections.map((x) => (x.id === s.id ? ns : x)))}
          onDelete={() => sections.length > 1 && setSections(sections.filter((x) => x.id !== s.id))} />
      ))}

      <Btn variant="ghost" icon={Plus} onClick={addSection} style={{ marginBottom: 28 }}>
        Agregar otra sección
      </Btn>

      <div style={{ display: "flex", gap: 10, borderTop: `1px solid ${C.ruleStrong}`, paddingTop: 18 }}>
        <Btn variant="filled" disabled={!valid}
          onClick={() => valid && onSubmit({ name: name.trim(), cover, color, sections })}
          style={{ opacity: valid ? 1 : 0.4, cursor: valid ? "pointer" : "default" }}>
          {editing ? "Guardar cambios" : "Crear álbum"}
        </Btn>
        <Btn onClick={onCancel}>Cancelar</Btn>
      </div>
    </div>
  );
}
