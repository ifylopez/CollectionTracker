export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function getStickerKey(section, n) {
  return section.prefix ? `${section.prefix}-${n}` : `${n}`;
}

export function getAlbumTotal(album) {
  return album.sections.reduce(
    (s, sec) => s + Math.max(0, sec.to - sec.from + 1),
    0
  );
}

export function getAllStickerEntries(album) {
  const entries = [];
  for (const sec of album.sections) {
    for (let i = sec.from; i <= sec.to; i++) {
      entries.push({ key: getStickerKey(sec, i), section: sec, num: i });
    }
  }
  return entries;
}

// Parsea entradas tipo "1, 5-10, 15" dentro del rango [min..max].
export function parseNumRanges(input, min, max) {
  const result = new Set();
  input.split(/[,;]+/).forEach((p) => {
    p = p.trim();
    if (!p) return;
    const m = p.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (m) {
      const a = +m[1], b = +m[2];
      for (let i = Math.max(min, Math.min(a, b)); i <= Math.min(max, Math.max(a, b)); i++) {
        result.add(i);
      }
    } else {
      const n = +p;
      if (n >= min && n <= max) result.add(n);
    }
  });
  return result;
}

// Convierte [1,2,3,5,7,8,9] en "1-3, 5, 7-9"
export function numsToRanges(nums) {
  if (!nums.length) return "";
  const s = [...nums].sort((a, b) => a - b);
  const out = [];
  let lo = s[0], hi = s[0];
  for (let i = 1; i < s.length; i++) {
    if (s[i] === hi + 1) hi = s[i];
    else {
      out.push(lo === hi ? `${lo}` : `${lo}-${hi}`);
      lo = hi = s[i];
    }
  }
  out.push(lo === hi ? `${lo}` : `${lo}-${hi}`);
  return out.join(", ");
}
