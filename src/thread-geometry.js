export const THREAD_VIEWBOX = { w: 1200, h: 480 }

/** Khoảng cách % giữa sợi chỉ và tâm nút step */
export const KNOT_THREAD_GAP = 18

export function stepToThreadSvg(step) {
  const threadY = step.threadY ?? step.y ?? 50
  return {
    x: (step.x / 100) * THREAD_VIEWBOX.w,
    y: (threadY / 100) * THREAD_VIEWBOX.h,
  }
}

export function stepToKnotPercent(step) {
  const threadY = step.threadY ?? step.y ?? 50
  const gap = step.knotGap ?? KNOT_THREAD_GAP
  const above = step.side === 'above'
  return {
    x: step.x,
    y: above ? threadY - gap : threadY + gap,
  }
}

export function stepToKnotSvg(step) {
  const { x, y } = stepToKnotPercent(step)
  return {
    x: (x / 100) * THREAD_VIEWBOX.w,
    y: (y / 100) * THREAD_VIEWBOX.h,
  }
}

/** @deprecated — dùng stepToThreadSvg / stepToKnotSvg */
export function stepToSvg(step) {
  return stepToThreadSvg(step)
}

/** Catmull-Rom → cubic Bézier — đi qua đúng từng anchor trên sợi chỉ */
export function buildThreadPath(points) {
  if (points.length < 2)
    return ''

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }

  return d
}

export function isLabelAbove(step) {
  return step.side === 'above'
}

export function applyThreadPaths(svg, pathD) {
  if (!svg || !pathD)
    return

  for (const id of ['thread-path-shadow', 'thread-path', 'thread-path-travel']) {
    const el = svg.querySelector(`#${id}`)
    if (el)
      el.setAttribute('d', pathD)
  }

  const motion = svg.querySelector('#thread-motion')
  if (motion)
    motion.setAttribute('path', pathD)
}

/** Map SVG knot coords → % trong .thread-rig */
export function syncKnotPositions(svg, rig, steps) {
  if (!svg || !rig)
    return

  const rigBox = rig.getBoundingClientRect()
  if (!rigBox.width || !rigBox.height)
    return

  const ctm = svg.getScreenCTM()
  if (!ctm)
    return

  const svgPoint = svg.createSVGPoint()

  steps.forEach((step) => {
    const knot = rig.querySelector(`[data-step="${step.id}"]`)
    if (!knot)
      return

    const { x, y } = stepToKnotSvg(step)
    svgPoint.x = x
    svgPoint.y = y
    const mapped = svgPoint.matrixTransform(ctm)

    const left = ((mapped.x - rigBox.left) / rigBox.width) * 100
    const top = ((mapped.y - rigBox.top) / rigBox.height) * 100

    knot.style.left = `${left}%`
    knot.style.top = `${top}%`
  })

  syncViCalloutPositions(rig, steps)
}

function syncViCalloutPositions(rig, steps) {
  steps.forEach((step) => {
    if (!step.vi)
      return

    const callout = rig.querySelector(`.vi-callout[data-for="${step.id}"]`)
    const knot = rig.querySelector(`[data-step="${step.id}"]`)
    if (!callout || !knot)
      return

    callout.style.left = knot.style.left
    callout.style.top = knot.style.top
  })
}

export function resetKnotCssPositions(rig, steps) {
  if (!rig)
    return

  steps.forEach((step) => {
    const knotPos = stepToKnotPercent(step)
    const knot = rig.querySelector(`[data-step="${step.id}"]`)
    if (knot) {
      knot.style.left = `${knotPos.x}%`
      knot.style.top = `${knotPos.y}%`
    }

    const callout = rig.querySelector(`.vi-callout[data-for="${step.id}"]`)
    if (callout) {
      callout.style.left = `${knotPos.x}%`
      callout.style.top = `${knotPos.y}%`
    }
  })
}
