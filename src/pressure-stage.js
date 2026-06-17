import { gsap } from 'gsap'
import { painPoints, pressureNarrative } from './data.js'

export function renderPressureStage() {
  const root = document.getElementById('pressure-stage-inner')
  if (!root)
    return

  const n = pressureNarrative

  root.innerHTML = `
    <div class="pressure-intro">
      <div class="pressure-hero">
        <div class="pressure-hero-glow" aria-hidden="true"></div>
        <div class="pressure-hero-shell">
          <div class="pressure-hero-core">
            <span class="pressure-hero-label">${n.meterLabel}</span>
            <div class="pressure-hero-counter">
              <span class="pressure-count-from">${n.meterFrom}</span>
              <span class="pressure-count-arrow" aria-hidden="true">→</span>
              <strong class="pressure-count-to" id="pressure-counter">${n.meterFrom}</strong>
              <em class="pressure-count-overload">${n.overloadLabel}</em>
            </div>
            <div class="pressure-capacity">
              <div class="pressure-capacity-head">
                <span>${n.capacityLabel}</span>
                <span class="pressure-capacity-pct" id="pressure-capacity-pct">0%</span>
              </div>
              <div class="pressure-capacity-track" aria-hidden="true">
                <span class="pressure-capacity-safe"></span>
                <span class="pressure-capacity-fill" id="pressure-capacity-fill"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pressure-meta">
        <p class="pressure-lede">${n.lede}</p>
      </div>
    </div>

    <div class="pressure-cards" id="pressure-cards">
      ${painPoints.map((pain, index) => `
        <article class="pressure-card" data-pain="${pain.id}" style="--i:${index}">
          <div class="pressure-card-shell">
            <div class="pressure-card-core">
              <span class="pressure-card-index">${String(index + 1).padStart(2, '0')}</span>
              <h3>${pain.title}</h3>
              <p class="pressure-card-detail">${pain.detail}</p>
            </div>
          </div>
        </article>
      `).join('')}
    </div>
  `
}

export function animatePressureSceneIn({ reduceMotion = false } = {}) {
  const n = pressureNarrative
  const counter = document.getElementById('pressure-counter')
  const capacityFill = document.getElementById('pressure-capacity-fill')
  const capacityPct = document.getElementById('pressure-capacity-pct')

  if (reduceMotion) {
    gsap.set('.pressure-intro, .pressure-card', { autoAlpha: 1, y: 0 })
    if (counter)
      counter.textContent = String(n.meterTo)
    if (capacityPct)
      capacityPct.textContent = '118%'
    if (capacityFill)
      capacityFill.style.width = '100%'
    return
  }

  gsap.set('.pressure-intro', { autoAlpha: 0, y: 20 })
  gsap.set('.pressure-card', { autoAlpha: 0, y: 28 })

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.to('.pressure-intro', { autoAlpha: 1, y: 0, duration: 0.6 })

  if (counter) {
    const obj = { val: n.meterFrom, cap: 0 }
    tl.to(obj, {
      val: n.meterTo,
      cap: 118,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        counter.textContent = String(Math.round(obj.val))
        if (capacityPct)
          capacityPct.textContent = `${Math.round(obj.cap)}%`
        if (capacityFill)
          capacityFill.style.width = `${Math.min(obj.cap, 100)}%`
      },
    }, '-=0.15')
  }

  tl.to('.pressure-card', {
    autoAlpha: 1,
    y: 0,
    duration: 0.65,
    stagger: 0.12,
    ease: 'power3.out',
  }, '-=0.9')

  startPressureGlowLoop()

  return tl
}

export function startPressureGlowLoop() {
  gsap.killTweensOf('.pressure-hero-glow')
  gsap.to('.pressure-hero-glow', {
    scale: 1.12,
    opacity: 0.5,
    duration: 1.8,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
}

export function settlePressureScene() {
  const n = pressureNarrative
  gsap.killTweensOf('.pressure-intro, .pressure-card, .pressure-hero-glow, #pressure-counter, #pressure-capacity-fill, #pressure-capacity-pct')
  gsap.set('.pressure-intro, .pressure-card', { autoAlpha: 1, y: 0, clearProps: 'filter' })

  const counter = document.getElementById('pressure-counter')
  const capacityFill = document.getElementById('pressure-capacity-fill')
  const capacityPct = document.getElementById('pressure-capacity-pct')

  if (counter)
    counter.textContent = String(n.meterTo)
  if (capacityPct)
    capacityPct.textContent = '118%'
  if (capacityFill)
    capacityFill.style.width = '100%'

  startPressureGlowLoop()
}
