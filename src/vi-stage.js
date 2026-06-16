import { gsap } from 'gsap'
import {
  viBeats,
  viCapabilities,
  viDefinition,
  viLayers,
} from './data.js'

let currentBeatIndex = 0
let selectedStepId = null
let beatTween = null
let knotClickBound = false
let dismissClickBound = false

const story = () => document.querySelector('.story')
const FOCUS_STEPS = [3, 5]

export function getViBeatIndex() {
  return currentBeatIndex
}

export function isLifecycleBeat(index = currentBeatIndex) {
  return viBeats[index]?.phase === 'lifecycle'
}

export function isInteractiveBeat(index = currentBeatIndex) {
  return Boolean(viBeats[index]?.interactiveFlow)
}

function renderCapabilityPanel(stepId) {
  const cap = viCapabilities[stepId]
  if (!cap)
    return ''

  return `
    <div class="vi-detail-panel-shell" data-step="${stepId}">
      <div class="vi-detail-panel-core">
        <span class="vi-panel-step">${cap.stepLabel}</span>
        <header class="vi-panel-header">
          <h3>${cap.module}</h3>
          <p>${cap.tagline}</p>
        </header>
        <ul class="vi-panel-list" id="vi-panel-list">
          ${cap.items.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>
  `
}

export function renderViStage() {
  const root = document.getElementById('vi-stage-inner')
  if (!root)
    return

  const layersHtml = [...viLayers].reverse().map((layer, index) => `
    <article class="vi-layer" data-layer="${layer.id}" style="--layer-i:${index}">
      <div class="vi-layer-shell">
        <div class="vi-layer-core">
          <span class="vi-layer-label">${layer.label}</span>
          <div class="vi-layer-keywords">
            ${layer.keywords.map((kw) => `<span class="vi-keyword">${kw}</span>`).join('')}
          </div>
        </div>
      </div>
    </article>
  `).join('')

  root.innerHTML = `
    <div class="vi-platform" id="vi-platform">
      <div class="vi-definition" id="vi-definition">
        <h2 class="vi-definition-title">${viDefinition.title}</h2>
        <p class="vi-definition-lede">${viDefinition.lede}</p>
      </div>
      <div class="vi-layer-stack" id="vi-layer-stack" hidden aria-label="Ba lớp năng lực ATS VI">
        ${layersHtml}
      </div>
      <div class="vi-transition-badge" id="vi-transition-badge" hidden aria-hidden="true">
        <span>VI</span>
        <em>Volt Intelligent</em>
      </div>
    </div>

    <div class="vi-lifecycle-overlay" id="vi-lifecycle-overlay" hidden>
      <p class="vi-interactive-hint" id="vi-interactive-hint">Bấm bước <strong>03</strong> hoặc <strong>05</strong> trên sợi chỉ để xem ATS VI hỗ trợ gì</p>
      <div class="vi-detail-wrap" id="vi-detail-wrap" hidden></div>
    </div>
  `

  bindViKnotClicks()
  bindViDismissClicks()
}

function bindViKnotClicks() {
  if (knotClickBound)
    return

  const track = document.getElementById('flow-track')
  if (!track)
    return

  track.addEventListener('click', (event) => {
    if (!isInteractiveBeat())
      return

    const knot = event.target.closest('.thread-knot-vi')
    if (knot) {
      const stepId = Number(knot.dataset.step)
      if (!FOCUS_STEPS.includes(stepId))
        return

      if (selectedStepId === stepId) {
        clearViStepSelection()
        return
      }

      showViStepDetail(stepId)
      return
    }

    if (selectedStepId)
      clearViStepSelection()
  })

  knotClickBound = true
}

function bindViDismissClicks() {
  if (dismissClickBound)
    return

  document.addEventListener('click', (event) => {
    if (!isInteractiveBeat() || !selectedStepId)
      return

    const wrap = document.getElementById('vi-detail-wrap')
    if (wrap?.contains(event.target))
      return

    if (event.target.closest('#flow-track'))
      return

    clearViStepSelection()
  })

  dismissClickBound = true
}

export function showViStepDetail(stepId, { animate = true, reduceMotion = false } = {}) {
  if (!FOCUS_STEPS.includes(stepId))
    return

  selectedStepId = stepId
  const root = story()
  if (root)
    root.dataset.viSelectedStep = String(stepId)

  const rig = document.querySelector('.thread-rig')
  if (rig)
    rig.dataset.focusStep = String(stepId)

  swapCapabilityPanel(stepId)

  const wrap = document.getElementById('vi-detail-wrap')
  const hint = document.getElementById('vi-interactive-hint')
  if (wrap)
    wrap.hidden = false
  if (hint)
    hint.hidden = true

  if (reduceMotion || !animate) {
    gsap.set('#vi-detail-wrap, #vi-panel-list li', { autoAlpha: 1, clearProps: 'x,y' })
    return
  }

  gsap.fromTo('#vi-detail-wrap', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' })
  gsap.fromTo('#vi-panel-list li', { autoAlpha: 0, x: 10 }, {
    autoAlpha: 1,
    x: 0,
    duration: 0.35,
    stagger: 0.07,
    ease: 'power3.out',
  }, '-=0.25')
}

function clearViStepSelection() {
  selectedStepId = null
  const root = story()
  if (root)
    delete root.dataset.viSelectedStep

  const rig = document.querySelector('.thread-rig')
  if (rig)
    delete rig.dataset.focusStep

  const wrap = document.getElementById('vi-detail-wrap')
  const hint = document.getElementById('vi-interactive-hint')
  if (wrap)
    wrap.hidden = true
  if (hint && isInteractiveBeat())
    hint.hidden = false
}

function updateBeatIndicator() {
  const el = document.getElementById('vi-beat-indicator')
  const hint = document.querySelector('.footer-hint-text')
  if (el)
    el.textContent = `VI · ${currentBeatIndex + 1} / ${viBeats.length}`
  if (hint) {
    hint.textContent = isInteractiveBeat()
      ? 'Bấm bước 03 / 05 trên sợi chỉ · ← → scene'
      : 'Space beat · ↑↓ · ← → scene · Auto tour'
  }
}

const LAYER_ORDER = ['knowledge', 'assistant', 'workflow']

function setLayerStates(activeLayerId) {
  const activeIndex = activeLayerId ? LAYER_ORDER.indexOf(activeLayerId) : -1

  document.querySelectorAll('.vi-layer').forEach((layer) => {
    const id = layer.dataset.layer
    const layerIndex = LAYER_ORDER.indexOf(id)
    const shouldShow = activeIndex >= 0 && layerIndex <= activeIndex
    const isActive = id === activeLayerId

    layer.classList.toggle('is-active', isActive)
    layer.classList.toggle('is-dim', shouldShow && !isActive)
    layer.classList.toggle('is-visible', shouldShow)
  })
}

function swapCapabilityPanel(stepId) {
  const wrap = document.getElementById('vi-detail-wrap')
  if (!wrap)
    return
  wrap.innerHTML = renderCapabilityPanel(stepId)
}

function applyFlowVisibilityForBeat(index) {
  const flowStage = document.getElementById('flow-stage-wrap')
  if (!flowStage)
    return

  const showFlow = isLifecycleBeat(index)
  gsap.set(flowStage, {
    autoAlpha: showFlow ? 1 : 0,
    visibility: showFlow ? 'visible' : 'hidden',
    pointerEvents: showFlow ? 'auto' : 'none',
    filter: 'blur(0px)',
  })
}

function applyPlatformVisibility(beat) {
  const platform = document.getElementById('vi-platform')
  const overlay = document.getElementById('vi-lifecycle-overlay')
  const definition = document.getElementById('vi-definition')
  const layerStack = document.getElementById('vi-layer-stack')
  const badge = document.getElementById('vi-transition-badge')

  if (overlay) {
    overlay.hidden = beat.phase !== 'lifecycle'
    overlay.classList.toggle('vi-lifecycle-overlay--interactive', Boolean(beat.interactiveFlow))
  }

  if (platform)
    platform.hidden = beat.phase === 'lifecycle'

  if (definition)
    definition.hidden = beat.id !== 'define'

  if (layerStack)
    layerStack.hidden = !beat.activeLayer && beat.id !== 'transition'

  if (badge)
    badge.hidden = beat.id !== 'transition'

  if (beat.activeLayer)
    setLayerStates(beat.activeLayer)
  else if (beat.id === 'define' || beat.id === 'transition')
    setLayerStates(null)
}

function applyLifecycleOverlay(beat) {
  const overlay = document.getElementById('vi-lifecycle-overlay')
  const hint = document.getElementById('vi-interactive-hint')
  const detailWrap = document.getElementById('vi-detail-wrap')
  const rig = document.querySelector('.thread-rig')
  const root = story()

  if (overlay)
    overlay.hidden = false

  if (root) {
    if (beat.interactiveFlow)
      root.dataset.viInteractive = 'true'
    else
      delete root.dataset.viInteractive
  }

  if (rig) {
    if (beat.interactiveFlow && selectedStepId)
      rig.dataset.focusStep = String(selectedStepId)
    else
      delete rig.dataset.focusStep
  }

  if (hint)
    hint.hidden = Boolean(selectedStepId)
  if (detailWrap)
    detailWrap.hidden = !selectedStepId
}

export function applyViBeatDom(index) {
  const beat = viBeats[index]
  if (!beat)
    return

  const root = story()
  if (root) {
    root.dataset.viBeat = String(index)
    root.dataset.viPhase = beat.phase
  }

  applyFlowVisibilityForBeat(index)
  applyPlatformVisibility(beat)

  if (beat.phase === 'lifecycle')
    applyLifecycleOverlay(beat)

  updateBeatIndicator()
}

function animatePlatformBeat(beat, { fromTransition = false } = {}) {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  if (beat.id === 'define') {
    tl.fromTo('#vi-definition', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.65 })
    return tl
  }

  if (beat.activeLayer) {
    const layer = document.querySelector(`.vi-layer[data-layer="${beat.activeLayer}"]`)
    if (layer && !layer.classList.contains('was-shown')) {
      layer.classList.add('was-shown')
      tl.fromTo(layer, { autoAlpha: 0, y: 32, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 })
    }
    tl.to('.vi-layer.is-dim', { autoAlpha: 0.4, duration: 0.4 }, '<')
    tl.to(`.vi-layer[data-layer="${beat.activeLayer}"]`, { autoAlpha: 1, duration: 0.4 }, '<')
    return tl
  }

  if (beat.id === 'transition') {
    tl.to('#vi-definition', { autoAlpha: 0, y: -12, duration: 0.35 })
      .to('#vi-layer-stack', { autoAlpha: 0, scale: 0.88, y: -20, duration: 0.5 }, '<')
      .fromTo('#vi-transition-badge', { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'back.out(1.5)' }, '-=0.15')
    return tl
  }

  if (fromTransition)
    tl.fromTo('#vi-transition-badge', { autoAlpha: 1 }, { autoAlpha: 0, scale: 0.8, duration: 0.4 })

  return tl
}

function animateLifecycleBeat(beat) {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  if (!beat.interactiveFlow)
    return tl

  const path = document.querySelector('.thread-path-core')
  if (path) {
    const len = path.getTotalLength()
    path.style.strokeDasharray = `${len}`
    path.style.strokeDashoffset = `${len}`
    tl.to(path, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
  }

  tl.fromTo('#vi-interactive-hint', { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.35')
  tl.fromTo('.thread-knot-vi .knot-body', { scale: 0.92 }, {
    scale: 1.14,
    duration: 0.45,
    stagger: 0.08,
    yoyo: true,
    repeat: 1,
    ease: 'sine.inOut',
  }, '-=0.25')

  return tl
}

export function goToViBeat(index, { animate = true, reduceMotion = false } = {}) {
  const next = Math.max(0, Math.min(viBeats.length - 1, index))
  const prev = currentBeatIndex
  const beat = viBeats[next]

  if (beatTween) {
    beatTween.kill()
    beatTween = null
  }

  if (beat.interactiveFlow && viBeats[prev]?.id === 'transition')
    clearViStepSelection()

  if (!isLifecycleBeat(next))
    clearViStepSelection()

  currentBeatIndex = next
  applyViBeatDom(next)

  if (reduceMotion || !animate) {
    gsap.set('#vi-definition, .vi-layer, #vi-transition-badge, #vi-interactive-hint, #vi-detail-wrap', { autoAlpha: 1, clearProps: 'x,y,scale' })
    return Promise.resolve()
  }

  const fromTransition = viBeats[prev]?.id === 'transition' && beat.phase === 'lifecycle'

  let tl
  if (beat.phase === 'platform')
    tl = animatePlatformBeat(beat, { fromTransition })
  else
    tl = animateLifecycleBeat(beat)

  if (fromTransition && beat.phase === 'lifecycle') {
    tl.fromTo('#vi-transition-badge', { autoAlpha: 1 }, { autoAlpha: 0, scale: 0.7, duration: 0.4 }, 0)
  }

  beatTween = tl
  if (!tl || tl.duration() === 0)
    return Promise.resolve()

  return new Promise((resolve) => {
    tl.eventCallback('onComplete', resolve)
  })
}

export function nextViBeat(options = {}) {
  if (isInteractiveBeat())
    return Promise.resolve()
  return goToViBeat(currentBeatIndex + 1, options)
}

export function prevViBeat(options = {}) {
  return goToViBeat(currentBeatIndex - 1, options)
}

export function resetViBeat({ reduceMotion = false } = {}) {
  currentBeatIndex = 0
  selectedStepId = null
  document.querySelectorAll('.vi-layer').forEach((l) => l.classList.remove('was-shown', 'is-active', 'is-dim', 'is-visible'))
  const root = story()
  if (root) {
    delete root.dataset.viSelectedStep
    delete root.dataset.viInteractive
  }
  applyViBeatDom(0)
  if (!reduceMotion)
    gsap.set('#vi-definition, .vi-layer, #vi-transition-badge, #vi-detail-wrap', { clearProps: 'all' })
}

export function initViBeatState() {
  currentBeatIndex = 0
  applyViBeatDom(0)
}

export function animateViSceneIn({ reduceMotion = false } = {}) {
  resetViBeat({ reduceMotion })
  return goToViBeat(0, { animate: !reduceMotion, reduceMotion })
}

export function onViSceneEnter({ reduceMotion = false } = {}) {
  const viStage = document.getElementById('vi-stage')
  const indicator = document.getElementById('vi-beat-indicator')

  if (viStage) {
    viStage.hidden = false
    gsap.set(viStage, { autoAlpha: 1, visibility: 'visible', pointerEvents: 'none' })
  }

  if (indicator)
    indicator.hidden = false

  resetViBeat({ reduceMotion })
  return animateViSceneIn({ reduceMotion })
}

export function onViSceneLeave() {
  const viStage = document.getElementById('vi-stage')
  const indicator = document.getElementById('vi-beat-indicator')
  const rig = document.querySelector('.thread-rig')
  const footerHint = document.querySelector('.footer-hint-text')

  if (viStage) {
    viStage.hidden = true
    gsap.set(viStage, { autoAlpha: 0, visibility: 'hidden', pointerEvents: 'none' })
  }

  if (indicator)
    indicator.hidden = true

  if (footerHint)
    footerHint.textContent = 'Space beat · ↑↓ · ← → scene · Auto tour'

  if (rig)
    delete rig.dataset.focusStep

  selectedStepId = null
  if (story()) {
    delete story().dataset.viBeat
    delete story().dataset.viPhase
    delete story().dataset.viInteractive
    delete story().dataset.viSelectedStep
  }

  currentBeatIndex = 0
}
