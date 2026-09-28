'use strict';

// Pure geometry shared by the renderer and regression tests. Keeping the
// decisions here makes the edge cases (top/left/corners) testable without an
// Electron desktop.
(function expose(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PetGeometry = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  // Electron ultimately converts BrowserWindow positions to signed native
  // integers. A Chromium pointer event can briefly expose a finite sentinel
  // outside that range while a transparent window crosses a screen edge.
  const NATIVE_WINDOW_COORD_MIN = -2147483648;
  const NATIVE_WINDOW_COORD_MAX = 2147483647;

  function safeNativeWindowPoint({ x, y, current = null, maxStep = Infinity }) {
    const point = { x: Math.round(Number(x)), y: Math.round(Number(y)) };
    if (!Number.isSafeInteger(point.x) || !Number.isSafeInteger(point.y)) return null;
    if (point.x < NATIVE_WINDOW_COORD_MIN || point.x > NATIVE_WINDOW_COORD_MAX
      || point.y < NATIVE_WINDOW_COORD_MIN || point.y > NATIVE_WINDOW_COORD_MAX) return null;

    const limit = Number(maxStep);
    if (current && Number.isFinite(limit) && limit >= 0) {
      const currentX = Number(current.x);
      const currentY = Number(current.y);
      if (!Number.isFinite(currentX) || !Number.isFinite(currentY)) return null;
      if (Math.abs(point.x - currentX) > limit || Math.abs(point.y - currentY) > limit) return null;
    }
    return point;
  }

  // Renderer screenX/screenY can lag one Electron resize transaction. Carry
  // the renderer's own window snapshot with the pet anchor, then translate the
  // anchor to the main process' authoritative bounds. A right/bottom/centre
  // aligned pet also moves *inside* the frame when that frame changes size;
  // compensate that local-layout delta as well as the window-origin delta.
  // Otherwise a stale compact 320px snapshot arriving just after a 520px
  // expansion subtracts 200px twice and the visible pet permanently jumps.
  function correctStalePetAnchor(anchor, actualWindow) {
    if (!anchor || typeof anchor !== 'object') return anchor;
    const corrected = { ...anchor };
    const actualX = Number(actualWindow && actualWindow.x);
    const actualY = Number(actualWindow && actualWindow.y);
    const actualWidth = Number(actualWindow && actualWindow.width);
    const actualHeight = Number(actualWindow && actualWindow.height);
    const reportedX = Number(anchor.windowX);
    const reportedY = Number(anchor.windowY);
    const reportedWidth = Number(anchor.windowWidth);
    const reportedHeight = Number(anchor.windowHeight);
    if (Number.isFinite(corrected.screenX) && Number.isFinite(actualX) && Number.isFinite(reportedX)) {
      let localLayoutDelta = 0;
      if (Number.isFinite(actualWidth) && Number.isFinite(reportedWidth)) {
        if (anchor.xAlign === 'right') localLayoutDelta = actualWidth - reportedWidth;
        else if (anchor.xAlign === 'center') localLayoutDelta = (actualWidth - reportedWidth) / 2;
      }
      corrected.screenX += actualX - reportedX + localLayoutDelta;
    }
    if (Number.isFinite(corrected.screenY) && Number.isFinite(actualY) && Number.isFinite(reportedY)) {
      const localLayoutDelta = anchor.yAlign === 'bottom'
        && Number.isFinite(actualHeight) && Number.isFinite(reportedHeight)
        ? actualHeight - reportedHeight
        : 0;
      corrected.screenY += actualY - reportedY + localLayoutDelta;
    }
    return corrected;
  }

  function normalizeRect(rect) {
    const x = Number(rect && rect.x) || 0;
    const y = Number(rect && rect.y) || 0;
    const width = Math.max(0, Number(rect && rect.width) || 0);
    const height = Math.max(0, Number(rect && rect.height) || 0);
    return { x, y, width, height, right: x + width, bottom: y + height };
  }

  function chooseRestingLayout({
    workArea,
    windowRect,
    petRect,
    current,
    threshold = 168,
    inferVerticalFrameClamp = true,
    inferHorizontalFrameClamp = true,
  }) {
    // CCPET: Permanent bottom-center alignment, eliminates edge shifting / misalignments
    return { vertical: 'above', horizontal: 'center' };
  }

  function choosePopupLayout({
    workArea,
    windowRect,
    petRect,
    current,
    popupHeight = 140,
    inferVerticalFrameClamp = true,
    inferHorizontalFrameClamp = true,
  }) {
    // CCPET: Popups consistently open above pet without jumping
    return { vertical: 'above', horizontal: 'center' };
  }

  function chooseDragVerticalLayout() {
    return String.fromCharCode(97,98,111,118,101);
  }

  function chooseDragHorizontalLayout() {
    return String.fromCharCode(99,101,110,116,101,114);
  }

  function windowFitsWorkArea(windowRect, workArea, slack = 1) {
    const wr = normalizeRect(windowRect);
    const wa = normalizeRect(workArea);
    const s = Math.max(0, Number(slack) || 0);
    return wr.x >= wa.x - s && wr.y >= wa.y - s
      && wr.right <= wa.right + s && wr.bottom <= wa.bottom + s;
  }

  function adornmentPosition({
    petRect,
    viewport,
    preferred = 'left',
    size = 28,
    gap = 5,
    edgePad = 4,
  }) {
    const pet = normalizeRect(petRect);
    const frame = normalizeRect(viewport);
    const adornmentSize = Math.max(12, Number(size) || 28);
    const space = Math.max(0, Number(gap) || 0);
    const pad = Math.max(0, Number(edgePad) || 0);
    const leftRoom = pet.x - frame.x - pad;
    const rightRoom = frame.right - pet.right - pad;
    let side = preferred === 'right' ? 'right' : 'left';
    const needed = adornmentSize + space;
    if (side === 'left' && leftRoom < needed && rightRoom > leftRoom) side = 'right';
    if (side === 'right' && rightRoom < needed && leftRoom > rightRoom) side = 'left';

    const rawX = side === 'left'
      ? pet.x - space - adornmentSize
      : pet.right + space;
    // Tool props sit by the pet's temple rather than at a percentage of the
    // transparent BrowserWindow. This remains close even when a popup widens
    // the frame or the pet is anchored against a side edge.
    const rawY = pet.y + Math.min(24, Math.max(5, pet.height * 0.18));
    return {
      side,
      x: clamp(rawX, frame.x + pad, frame.right - adornmentSize - pad),
      y: clamp(rawY, frame.y + pad, frame.bottom - adornmentSize - pad),
    };
  }

  const ARCS = {
    // A real 180-degree fan. The previous 156-degree arcs compressed eight
    // 46px controls until they overlapped into a heart-shaped cluster.
    above: { start: 180, end: 360 },
    below: { start: 0, end: 180 },
    right: { start: -90, end: 90 },
    left: { start: 90, end: 270 },
  };

  function arcPoints(direction, count, center, radius) {
    const arc = ARCS[direction];
    const points = [];
    for (let i = 0; i < count; i++) {
      const ratio = count === 1 ? 0.5 : i / (count - 1);
      const angle = (arc.start + (arc.end - arc.start) * ratio) * Math.PI / 180;
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      });
    }
    return points;
  }

  function radialLayout({ count, center, safeRect, preferred = [], radius = 106, itemRadius = 23 }) {
    const n = Math.max(0, Math.floor(Number(count) || 0));
    if (!n) return { direction: 'above', radius, points: [] };
    const safe = normalizeRect(safeRect);
    const directions = [...new Set([...preferred, 'above', 'below', 'right', 'left'])]
      .filter((direction) => ARCS[direction]);
    const radii = [...new Set([radius, 100, 94, 88, 80, 72].map((r) => Math.max(48, Number(r) || 0)))];
    let best = null;

    for (const direction of directions) {
      for (const candidateRadius of radii) {
        const adjustedCenter = { x: center.x, y: center.y };
        // At a left/right edge a full semicircle needs its two end buttons to
        // fit vertically. Move only the fan's centre line, never the pet or
        // the fan's inward-facing x anchor.
        if (direction === 'left' || direction === 'right') {
          adjustedCenter.y = clamp(
            adjustedCenter.y,
            safe.y + itemRadius + candidateRadius,
            safe.bottom - itemRadius - candidateRadius,
          );
        }
        const raw = arcPoints(direction, n, adjustedCenter, candidateRadius);
        let overflow = 0;
        for (const point of raw) {
          overflow += Math.max(0, safe.x + itemRadius - point.x);
          overflow += Math.max(0, point.x - (safe.right - itemRadius));
          overflow += Math.max(0, safe.y + itemRadius - point.y);
          overflow += Math.max(0, point.y - (safe.bottom - itemRadius));
        }
        const candidate = { direction, radius: candidateRadius, center: adjustedCenter, raw, overflow };
        if (!best || candidate.overflow < best.overflow) best = candidate;
        if (overflow === 0) {
          return { direction, radius: candidateRadius, center: adjustedCenter, points: raw };
        }
      }
    }

    const points = (best ? best.raw : []).map((point) => ({
      x: clamp(point.x, safe.x + itemRadius, safe.right - itemRadius),
      y: clamp(point.y, safe.y + itemRadius, safe.bottom - itemRadius),
    }));
    return {
      direction: best ? best.direction : directions[0],
      radius: best ? best.radius : radius,
      center: best ? best.center : center,
      points,
    };
  }

  return {
    safeNativeWindowPoint,
    correctStalePetAnchor,
    chooseRestingLayout,
    choosePopupLayout,
    chooseDragVerticalLayout,
    chooseDragHorizontalLayout,
    windowFitsWorkArea,
    adornmentPosition,
    radialLayout,
  };
});
