import { useRef, useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { C, FF } from "../lib/theme";
import { labelStyle } from "./ui";
import { compressImage } from "../lib/imageCompress";

export function CoverUploader({ cover, color, name, onChange }) {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLoading(true);
    try {
      const compressed = await compressImage(f, 600, 0.82);
      onChange(compressed);
    } catch {
      alert("No se pudo procesar la imagen.");
    }
    setLoading(false);
    e.target.value = "";
  };

  return (
    <div>
      <label style={labelStyle}>Portada del álbum</label>
      <div
        style={{
          aspectRatio: "3 / 4", width: "100%", maxWidth: 200,
          background: cover ? `url(${cover}) center/cover` : color,
          border: `1px solid ${C.ruleStrong}`, position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", cursor: "pointer",
        }}
        onClick={() => fileRef.current?.click()}
      >
        {!cover && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <ImageIcon size={28} color={C.white} style={{ opacity: 0.6, marginBottom: 8 }} />
            <div style={{ color: C.white, fontFamily: FF.display, fontWeight: 700, fontSize: 18, lineHeight: 1.1, opacity: 0.95 }}>
              {name || "Sin nombre"}
            </div>
          </div>
        )}
        <div
          style={{
            position: "absolute", inset: 0, background: "rgba(31,26,20,0.4)",
            opacity: 0, transition: "opacity .15s",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
        >
          <Upload size={20} color={C.white} />
          <span style={{ color: C.white, marginLeft: 8, fontFamily: FF.body, fontSize: 13, fontWeight: 600 }}>
            {loading ? "Procesando..." : cover ? "Cambiar" : "Subir foto"}
          </span>
        </div>
      </div>
      <input type="file" ref={fileRef} accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      {cover && (
        <button onClick={() => onChange(null)} style={{
          marginTop: 6, background: "none", border: "none",
          color: C.inkMuted, fontSize: 12, fontFamily: FF.body,
          cursor: "pointer", padding: 0,
        }}>
          Quitar portada
        </button>
      )}
    </div>
  );
}
