import { C, FF } from "../lib/theme";

export const btnBase = {
  fontFamily: FF.body, fontSize: 13, fontWeight: 600, cursor: "pointer",
  border: `1px solid ${C.ink}`, padding: "8px 16px", borderRadius: 0,
  background: "transparent", color: C.ink, transition: "all .12s",
  display: "inline-flex", alignItems: "center", gap: 6, letterSpacing: 0.2,
};
export const btnFilled = { ...btnBase, background: C.ink, color: C.paper };
export const btnRed = { ...btnBase, background: C.red, border: `1px solid ${C.red}`, color: C.white };
export const btnGhost = { ...btnBase, border: `1px solid ${C.rule}`, padding: "6px 12px", fontSize: 12 };

export function Btn({ variant = "outline", icon: Icon, children, ...rest }) {
  const base =
    variant === "filled" ? btnFilled :
    variant === "red" ? btnRed :
    variant === "ghost" ? btnGhost : btnBase;
  const hoverBg =
    variant === "filled" ? C.inkSoft :
    variant === "red" ? "#A82826" : C.paperDark;
  const restingBg =
    variant === "filled" ? C.ink :
    variant === "red" ? C.red : "transparent";
  return (
    <button {...rest} style={{ ...base, ...(rest.style || {}) }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; rest.onMouseEnter?.(e); }}
      onMouseLeave={e => { e.currentTarget.style.background = restingBg; rest.onMouseLeave?.(e); }}>
      {Icon && <Icon size={14} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

export const inputStyle = {
  width: "100%", padding: "9px 12px", background: C.white,
  border: `1px solid ${C.ruleStrong}`, borderRadius: 0,
  color: C.ink, fontSize: 14, fontFamily: FF.body,
  outline: "none", boxSizing: "border-box",
};

export const labelStyle = {
  display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
  color: C.inkMuted, fontFamily: FF.body, textTransform: "uppercase", marginBottom: 6,
};

export function FilterChip({ active, onClick, color, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 12px", border: `1px solid ${active ? C.ink : C.rule}`,
      background: active ? C.ink : "transparent",
      color: active ? C.paper : color || C.ink,
      fontSize: 12, fontWeight: 600, fontFamily: FF.body, cursor: "pointer",
      letterSpacing: 0.3, borderRadius: 0,
    }}>
      {children}
    </button>
  );
}

export function Stat({ label, value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
      <span style={{ fontFamily: FF.display, fontWeight: 800, fontSize: 18, color }}>{value}</span>
      <span style={{ color: C.inkMuted, fontSize: 11 }}>{label}</span>
    </div>
  );
}

// Modal genérico: fondo oscurecido + tarjeta centrada
export function Modal({ children, onClose, maxWidth = 360 }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(31,26,20,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.paper, border: `2px solid ${C.ink}`, padding: 24,
        maxWidth, width: "100%",
      }}>
        {children}
      </div>
    </div>
  );
}
