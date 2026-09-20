/* Plain-text ranges shared by the editor and automated SVG export. */
(function (root) {
  function paint(ranges, start, end, color) {
    const result = [];
    for (const range of ranges) {
      if (range.end <= start || range.start >= end) result.push({ ...range });
      else {
        if (range.start < start) result.push({ ...range, end: start });
        if (range.end > end) result.push({ ...range, start: end });
      }
    }
    if (color && end > start) result.push({ start, end, color });
    return result.sort((a, b) => a.start - b.start);
  }

  function edit(ranges, before, after) {
    let start = 0;
    while (start < before.length && start < after.length && before[start] === after[start]) start++;
    let oldEnd = before.length, newEnd = after.length;
    while (oldEnd > start && newEnd > start && before[oldEnd - 1] === after[newEnd - 1]) { oldEnd--; newEnd--; }
    const delta = newEnd - oldEnd, result = [];
    for (const range of ranges) {
      if (range.end <= start) result.push({ ...range });
      else if (range.start >= oldEnd) result.push({ ...range, start: range.start + delta, end: range.end + delta });
      else {
        if (range.start < start) result.push({ ...range, end: start });
        if (range.start <= start && range.end >= oldEnd && newEnd > start) result.push({ start, end: newEnd, color: range.color });
        if (range.end > oldEnd) result.push({ ...range, start: newEnd, end: range.end + delta });
      }
    }
    return result.filter(range => range.end > range.start);
  }

  function runs(text, ranges, baseColor, offset = 0) {
    const points = new Set([0, text.length]);
    for (const range of ranges) {
      if (range.end <= offset || range.start >= offset + text.length) continue;
      points.add(Math.max(0, range.start - offset));
      points.add(Math.min(text.length, range.end - offset));
    }
    const boundaries = [...points].sort((a, b) => a - b);
    return boundaries.slice(0, -1).map((start, i) => {
      const range = [...ranges].reverse().find(r => r.start <= start + offset && r.end > start + offset);
      return { text: text.slice(start, boundaries[i + 1]), color: range?.color || baseColor };
    });
  }
  const api = { paint, edit, runs };
  if (typeof module !== 'undefined') module.exports = api;
  else root.CoverText = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
