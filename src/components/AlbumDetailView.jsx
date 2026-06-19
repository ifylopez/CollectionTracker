import { useState, useMemo, useCallback } from "react";
import {
  ChevronLeft, Edit3, Trash2, Zap, Copy, Check, Search,
} from "lucide-react";
import { C, FF, RARITIES, RARITY_KEYS } from "../lib/theme";
import { Btn, FilterChip, Stat, Modal, inputStyle, labelStyle } from "./ui";
import { StickerCell } from "./StickerCell";
import { DuplicateEditor } from "./DuplicateEditor";
import {
  getAlbumTotal, getAllStickerEntries,
  getStickerKey, parseNumRanges, numsToRanges,
} from "../lib/utils";

export function AlbumDetailView({ album, stickers, onUpdateStickers, onBack, onEdit, onDelete }) {
  const [filterSection, setFilterSection] = useState("all");
  const [filterRarity, setFilterRarity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showBatch, setShowBatch] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [batchSection, setBatchSection] = useState(album.sections[0]?.id);
  const [batchInput, setBatchInput] = useState("");
  const [batchAction, setBatchAction] = useState("loose");
  const [editingDup, setEditingDup] = useState(null);
  const [copied, setCopied] = useState(false);

  const total = useMemo(() => getAlbumTotal(album), [album]);
  const allEntries = useMemo(() => getAllStickerEntries(album), [album]);

  const stats = useMemo(() => {
    let owned = 0, pasted = 0, loose = 0, dupes = 0;
    for (const e of allEntries) {
      const st = stickers[e.key];
      if (st && st.count > 0) {
        owned++;
        if (st.pasted) pasted++;
        else loose++;
        if (st.count > 1) dupes += st.count - 1;
      }
    }
    return {
      owned, pasted, loose, missing: total - owned, dupes,
      pct: total ? Math.round((owned / total) * 100) : 0,
    };
  }, [allEntries, stickers, total]);

  const filtered = useMemo(() => {
    return allEntries.filter((e) => {
      if (filterSection !== "all" && e.section.id !== filterSection) return false;
      if (filterRarity !== "all" && (e.section.rarity || "common") !== filterRarity) return false;
      const st = stickers[e.key];
      const count = st?.count || 0;
      const pasted = st?.pasted || false;
      if (filterStatus === "missing" && count > 0) return false;
      if (filterStatus === "loose" && (count === 0 || pasted)) return false;
      if (filterStatus === "pasted" && !pasted) return false;
      if (filterStatus === "dupes" && count <= 1) return false;
      if (search) {
        const q = search.trim().toLowerCase();
        if (!e.key.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allEntries, stickers, filterSection, filterRarity, filterStatus, search]);

  const cycleSticker = useCallback((key) => {
    const cur = stickers[key];
    const count = cur?.count || 0;
    const pasted = cur?.pasted || false;
    let next;
    if (count === 0) next = { count: 1, pasted: false };
    else if (count === 1 && !pasted) next = { count: 1, pasted: true };
    else if (count === 1 && pasted) next = { count: 0, pasted: false };
    else next = { count, pasted: !pasted };
    const updated = { ...stickers };
    if (next.count === 0) delete updated[key];
    else updated[key] = next;
    onUpdateStickers(updated);
  }, [stickers, onUpdateStickers]);

  const applyBatch = () => {
    const sec = album.sections.find((s) => s.id === batchSection);
    if (!sec || !batchInput.trim()) return;
    const nums = parseNumRanges(batchInput, sec.from, sec.to);
    if (!nums.size) return;
    const updated = { ...stickers };
    nums.forEach((n) => {
      const k = getStickerKey(sec, n);
      if (batchAction === "clear") delete updated[k];
      else if (batchAction === "loose") {
        const cur = updated[k];
        updated[k] = { count: cur?.count >= 1 ? cur.count : 1, pasted: false };
      } else if (batchAction === "pasted") {
        const cur = updated[k];
        updated[k] = { count: cur?.count >= 1 ? cur.count : 1, pasted: true };
      }
    });
    onUpdateStickers(updated);
    setBatchInput("");
  };

  const buildMissingText = () => {
    const lines = [`📕 ${album.name.toUpperCase()}`];
    lines.push(`Me faltan ${stats.missing} de ${total} figuritas (${100 - stats.pct}% restante)`);
    lines.push("");
    for (const sec of album.sections) {
      const miss = [];
      for (let i = sec.from; i <= sec.to; i++) {
        const k = getStickerKey(sec, i);
        if (!stickers[k] || stickers[k].count === 0) miss.push(i);
      }
      if (miss.length === 0) continue;
      const label = sec.prefix ? `${sec.name} (${sec.prefix})` : sec.name;
      const rarityTag = sec.rarity && sec.rarity !== "common" ? ` [${RARITIES[sec.rarity].name}]` : "";
      lines.push(`▪ ${label}${rarityTag} — faltan ${miss.length}`);
      lines.push(`   ${numsToRanges(miss)}`);
    }
    if (stats.dupes > 0) {
      lines.push("");
      lines.push(`🔁 Tengo ${stats.dupes} repetidas para intercambio:`);
      for (const sec of album.sections) {
        const dupes = [];
        for (let i = sec.from; i <= sec.to; i++) {
          const k = getStickerKey(sec, i);
          const st = stickers[k];
          if (st && st.count > 1) dupes.push(`${getStickerKey(sec, i)}×${st.count - 1}`);
        }
        if (dupes.length) lines.push(`   ${sec.name}: ${dupes.join(", ")}`);
      }
    }
    return lines.join("\n");
  };

  const copyMissing = async () => {
    try {
      await navigator.clipboard.writeText(buildMissingText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("No se pudo copiar. Seleccioná el texto manualmente.");
    }
  };

  const grouped = useMemo(() => {
    const map = new Map();
    for (const e of filtered) {
      if (!map.has(e.section.id)) map.set(e.section.id, { section: e.section, entries: [] });
      map.get(e.section.id).entries.push(e);
    }
    return [...map.values()];
  }, [filtered]);

  const currentBatchSec = album.sections.find((s) => s.id === batchSection);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: C.inkMuted, cursor: "pointer",
        padding: 0, marginBottom: 16, fontSize: 13, fontFamily: FF.body, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <ChevronLeft size={16} /> Archivo
      </button>

      {/* Cabecera con tapa */}
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 20, marginBottom: 24, alignItems: "start" }}>
        <div style={{
          aspectRatio: "3 / 4",
          background: album.cover ? `url(${album.cover}) center/cover` : album.color,
          border: `1px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 10, textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          {!album.cover && (
            <div style={{ color: C.white, fontFamily: FF.display, fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>
              {album.name}
            </div>
          )}
          {stats.pct === 100 && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(31,26,20,0.55)",
            }}>
              <div style={{
                fontFamily: FF.display, fontWeight: 900, fontSize: 20, color: C.gold,
                border: `3px solid ${C.gold}`, padding: "6px 14px", letterSpacing: 2,
                transform: "rotate(-12deg)",
              }}>
                COMPLETO
              </div>
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: C.red, fontWeight: 700, marginBottom: 4, fontFamily: FF.body }}>
            FICHA · {album.sections.length} {album.sections.length === 1 ? "SECCIÓN" : "SECCIONES"}
          </div>
          <h1 style={{
            fontFamily: FF.display, fontSize: 32, fontWeight: 900, lineHeight: 1.05,
            margin: "0 0 12px", letterSpacing: -0.5, color: C.ink,
          }}>
            {album.name}
          </h1>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ fontFamily: FF.mono, fontSize: 13, color: C.inkSoft }}>
                <strong style={{ color: C.ink, fontSize: 16, fontFamily: FF.display, fontWeight: 800 }}>{stats.owned}</strong>
                <span style={{ color: C.inkMuted }}> de </span>
                <strong>{total}</strong>
              </span>
              <span style={{ fontFamily: FF.display, fontWeight: 800, fontSize: 22, color: stats.pct === 100 ? C.green : C.ink }}>
                {stats.pct}%
              </span>
            </div>
            <div style={{ height: 6, background: C.paperDark, position: "relative" }}>
              <div style={{
                height: "100%", width: `${stats.pct}%`,
                background: stats.pct === 100 ? C.green : album.color, transition: "width .4s",
              }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, fontFamily: FF.mono, fontSize: 12, flexWrap: "wrap" }}>
            <Stat label="Pegadas" value={stats.pasted} color={C.green} />
            <Stat label="Sueltas" value={stats.loose} color={C.gold} />
            <Stat label="Faltan" value={stats.missing} color={C.red} />
            {stats.dupes > 0 && <Stat label="Repetidas" value={stats.dupes} color={C.inkMuted} />}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn variant="ghost" icon={Edit3} onClick={onEdit}>Editar álbum</Btn>
            <Btn variant="ghost" icon={Trash2} onClick={() => setShowDel(true)}
              style={{ color: C.red, borderColor: C.redSoft }}>
              Eliminar
            </Btn>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", borderTop: `1px solid ${C.ruleStrong}`, paddingTop: 14 }}>
        <Btn icon={Zap} onClick={() => { setShowBatch((s) => !s); setShowExport(false); }}
          variant={showBatch ? "filled" : "outline"}>
          Marcar rango
        </Btn>
        <Btn icon={Copy} onClick={() => { setShowExport((s) => !s); setShowBatch(false); }}
          variant={showExport ? "filled" : "outline"}>
          Exportar faltantes
        </Btn>
      </div>

      {showBatch && (
        <div style={{ background: C.paperLight, border: `1px solid ${C.ruleStrong}`, padding: 14, marginBottom: 12 }}>
          <div style={{ fontFamily: FF.display, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
            Marcar muchas figuritas a la vez
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(140px, 1fr) 2fr minmax(120px, 1fr) auto",
            gap: 8, alignItems: "end",
          }}>
            <div>
              <label style={labelStyle}>Sección</label>
              <select value={batchSection} onChange={(e) => setBatchSection(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {album.sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.prefix ? ` (${s.prefix})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Números</label>
              <input value={batchInput} onChange={(e) => setBatchInput(e.target.value)}
                placeholder={currentBatchSec
                  ? `Ej: ${currentBatchSec.from}-${Math.min(currentBatchSec.from + 9, currentBatchSec.to)}, ${Math.min(currentBatchSec.from + 15, currentBatchSec.to)}`
                  : ""}
                style={{ ...inputStyle, fontFamily: FF.mono }} />
            </div>
            <div>
              <label style={labelStyle}>Acción</label>
              <select value={batchAction} onChange={(e) => setBatchAction(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="loose">Marcar como sueltas</option>
                <option value="pasted">Marcar como pegadas</option>
                <option value="clear">Quitar (volver a faltante)</option>
              </select>
            </div>
            <Btn variant="filled" onClick={applyBatch}>Aplicar</Btn>
          </div>
          <p style={{ fontSize: 11, color: C.inkMuted, margin: "8px 0 0", fontFamily: FF.mono }}>
            {currentBatchSec ? `Rango válido: ${currentBatchSec.from}–${currentBatchSec.to}. ` : ""}
            Solo números (sin prefijo): "1-50, 73, 90-95"
          </p>
        </div>
      )}

      {showExport && (
        <div style={{ background: C.paperLight, border: `1px solid ${C.ruleStrong}`, padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <div style={{ fontFamily: FF.display, fontWeight: 700, fontSize: 14 }}>
              Texto listo para compartir
            </div>
            <Btn variant="filled" icon={copied ? Check : Copy} onClick={copyMissing}>
              {copied ? "Copiado" : "Copiar todo"}
            </Btn>
          </div>
          <textarea readOnly value={buildMissingText()}
            style={{
              ...inputStyle, fontFamily: FF.mono, fontSize: 12, lineHeight: 1.5,
              minHeight: 200, resize: "vertical", whiteSpace: "pre-wrap",
            }} />
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <FilterChip active={filterStatus === "all"} onClick={() => setFilterStatus("all")}>Todas</FilterChip>
        <FilterChip active={filterStatus === "missing"} onClick={() => setFilterStatus("missing")} color={C.red}>Faltan</FilterChip>
        <FilterChip active={filterStatus === "loose"} onClick={() => setFilterStatus("loose")} color={C.gold}>Sueltas</FilterChip>
        <FilterChip active={filterStatus === "pasted"} onClick={() => setFilterStatus("pasted")} color={C.green}>Pegadas</FilterChip>
        <FilterChip active={filterStatus === "dupes"} onClick={() => setFilterStatus("dupes")}>Repes</FilterChip>

        <div style={{ width: 1, height: 20, background: C.rule, margin: "0 2px" }} />

        <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}
          style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
          <option value="all">Todas las secciones</option>
          {album.sections.map((s) => (
            <option key={s.id} value={s.id}>{s.name}{s.prefix ? ` (${s.prefix})` : ""}</option>
          ))}
        </select>

        <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)}
          style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
          <option value="all">Toda rareza</option>
          {RARITY_KEYS.map((k) => <option key={k} value={k}>{RARITIES[k].name}</option>)}
        </select>

        <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.ruleStrong}`, background: C.white, padding: "0 10px" }}>
          <Search size={12} color={C.inkMuted} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar"
            style={{
              background: "none", border: "none", outline: "none",
              padding: "7px 8px", fontFamily: FF.mono, fontSize: 12, width: 100,
            }} />
        </div>

        <span style={{ fontFamily: FF.mono, fontSize: 11, color: C.inkMuted, marginLeft: "auto" }}>
          {filtered.length} figuritas
        </span>
      </div>

      <div style={{
        fontSize: 11, color: C.inkMuted, marginBottom: 14, fontFamily: FF.body,
        display: "flex", gap: 16, flexWrap: "wrap",
      }}>
        <span><strong>Clic:</strong> falta → suelta → pegada → falta</span>
        <span><strong>Mantener apretado / clic derecho:</strong> editar duplicados</span>
      </div>

      {grouped.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: C.inkMuted, fontFamily: FF.display, fontSize: 16 }}>
          No hay figuritas con estos filtros
        </div>
      ) : (
        grouped.map(({ section, entries }) => (
          <div key={section.id} style={{ marginBottom: 24 }}>
            <div style={{
              display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10,
              paddingBottom: 6, borderBottom: `1px solid ${C.rule}`,
            }}>
              <h3 style={{ fontFamily: FF.display, fontWeight: 700, fontSize: 16, margin: 0 }}>
                {section.name}
              </h3>
              {section.prefix && (
                <span style={{ fontFamily: FF.mono, fontSize: 11, color: C.inkMuted, background: C.paperDark, padding: "2px 6px" }}>
                  {section.prefix}
                </span>
              )}
              {section.rarity !== "common" && (
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                  color: RARITIES[section.rarity].color, fontFamily: FF.body,
                }}>
                  · {RARITIES[section.rarity].name}
                </span>
              )}
              <span style={{ marginLeft: "auto", fontFamily: FF.mono, fontSize: 11, color: C.inkMuted }}>
                {entries.length} de {section.to - section.from + 1}
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {entries.map((e) => (
                <StickerCell key={e.key} entry={e} state={stickers[e.key]}
                  onCycle={() => cycleSticker(e.key)}
                  onLongPress={() => setEditingDup(e)} />
              ))}
            </div>
          </div>
        ))
      )}

      {editingDup && (
        <DuplicateEditor entry={editingDup} state={stickers[editingDup.key]}
          onChange={(s) => {
            const updated = { ...stickers };
            if (s.count === 0) delete updated[editingDup.key];
            else updated[editingDup.key] = s;
            onUpdateStickers(updated);
          }}
          onClose={() => setEditingDup(null)} />
      )}

      {showDel && (
        <Modal onClose={() => setShowDel(false)}>
          <h3 style={{ fontFamily: FF.display, fontWeight: 800, fontSize: 20, margin: "0 0 8px" }}>
            ¿Eliminar este álbum?
          </h3>
          <p style={{ color: C.inkMuted, fontSize: 13, margin: "0 0 18px" }}>
            Se borra <strong style={{ color: C.ink }}>{album.name}</strong> con todas sus figuritas marcadas. Esta acción no se puede deshacer.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn onClick={() => setShowDel(false)}>Cancelar</Btn>
            <Btn variant="red" onClick={onDelete}>Sí, eliminar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
