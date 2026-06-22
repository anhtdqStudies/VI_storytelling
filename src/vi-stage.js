import { gsap } from 'gsap'
import {
  viBeats,
  viCapabilities,
  viDefinition,
  viLayers,
} from './data.js'
import { VI_LOGO_GRADIENT } from './assets.js'

let currentBeatIndex = 0
let selectedStepId = null
let beatTween = null
let knotClickBound = false
let dismissClickBound = false

const story = () => document.querySelector('.story')
const FOCUS_STEPS = [2, 3]

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
      <img
        class="vi-logo-mark vi-logo-mark--intro"
        id="vi-define-logo"
        src="${VI_LOGO_GRADIENT}"
        alt="Volt Intelligent VI"
        width="140"
        height="96"
        hidden
      />
      <p class="vi-define-prompt" id="vi-define-prompt">Nhấn <strong>Space</strong> để xem ba lớp năng lực</p>
      <div class="vi-layer-stack" id="vi-layer-stack" hidden aria-label="Ba lớp năng lực ATS VI">
        ${layersHtml}
      </div>
      <div class="vi-transition-badge" id="vi-transition-badge" hidden aria-hidden="true">
        <img
          class="vi-logo-mark vi-logo-mark--hero"
          src="${VI_LOGO_GRADIENT}"
          alt="VI"
          width="120"
          height="82"
        />
        <em>Volt Intelligent</em>
      </div>
    </div>

    <div class="vi-lifecycle-overlay" id="vi-lifecycle-overlay" hidden>
      <p class="vi-interactive-hint" id="vi-interactive-hint">Bấm bước <strong>02</strong> hoặc <strong>03</strong> trên sợi chỉ để xem ATS VI hỗ trợ gì</p>
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
      ? 'Bấm bước 02 / 03 trên sợi chỉ · ← → scene'
      : 'Space beat · ↑↓ · ← → scene · Auto tour'
  }
}

function syncViHeaderSubtitle(beat) {
  const subtitle = document.querySelector('[data-bind="subtitle"]')
  if (!subtitle)
    return

  if (beat?.phase === 'platform' && beat.id === 'define') {
    subtitle.textContent = viDefinition.lede
    subtitle.hidden = false
    return
  }

  subtitle.textContent = ''
  subtitle.hidden = true
}

const LAYER_ORDER = ['knowledge', 'assistant', 'workflow']
const VI_GSAP_TARGETS = '#vi-layer-stack, #vi-platform, .vi-layer, #vi-transition-badge, #vi-define-prompt, #vi-define-logo, #vi-interactive-hint, #vi-detail-wrap, [data-bind="subtitle"]'

function clearViGsapState() {
  gsap.killTweensOf(VI_GSAP_TARGETS)
  gsap.set(VI_GSAP_TARGETS, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    clearProps: 'transform,filter,opacity,visibility',
  })
}

function syncPlatformLayerOpacity(beat) {
  const stack = document.getElementById('vi-layer-stack')
  if (stack) {
    if (beat.activeLayer || beat.id === 'transition')
      gsap.set(stack, { autoAlpha: 1, scale: 1, y: 0 })
  }

  document.querySelectorAll('.vi-layer').forEach((layer) => {
    if (!layer.classList.contains('is-visible')) {
      gsap.set(layer, { autoAlpha: 0, visibility: 'hidden' })
      return
    }
    if (layer.classList.contains('is-dim')) {
      gsap.set(layer, { autoAlpha: 0.45, visibility: 'visible' })
      return
    }
    gsap.set(layer, { autoAlpha: 1, visibility: 'visible', y: 0, scale: 1 })
  })
}

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
  const layerStack = document.getElementById('vi-layer-stack')
  const badge = document.getElementById('vi-transition-badge')

  if (overlay) {
    overlay.hidden = beat.phase !== 'lifecycle'
    overlay.classList.toggle('vi-lifecycle-overlay--interactive', Boolean(beat.interactiveFlow))
  }

  if (platform)
    platform.hidden = beat.phase === 'lifecycle'

  if (layerStack)
    layerStack.hidden = !beat.activeLayer && beat.id !== 'transition'

  if (badge)
    badge.hidden = beat.id !== 'transition'

  if (beat.activeLayer)
    setLayerStates(beat.activeLayer)
  else if (beat.id === 'define' || beat.id === 'transition')
    setLayerStates(null)

  syncViHeaderSubtitle(beat)
  syncHiddenViElements(beat)
}

function syncHiddenViElements(beat) {
  const badge = document.getElementById('vi-transition-badge')
  const layerStack = document.getElementById('vi-layer-stack')
  const platform = document.getElementById('vi-platform')
  const definePrompt = document.getElementById('vi-define-prompt')
  const defineLogo = document.getElementById('vi-define-logo')

  if (defineLogo) {
    const show = beat.id === 'define'
    defineLogo.hidden = !show
    gsap.set(defineLogo, show
      ? { autoAlpha: 1, visibility: 'visible', y: 0, scale: 1 }
      : { autoAlpha: 0, visibility: 'hidden' })
  }

  if (definePrompt) {
    const show = beat.id === 'define'
    definePrompt.hidden = !show
    gsap.set(definePrompt, show
      ? { autoAlpha: 1, visibility: 'visible', y: 0 }
      : { autoAlpha: 0, visibility: 'hidden' })
  }

  if (badge) {
    const show = beat.id === 'transition'
    badge.hidden = !show
    gsap.set(badge, show
      ? { autoAlpha: 1, visibility: 'visible', y: 0, scale: 1 }
      : { autoAlpha: 0, visibility: 'hidden', y: 0, scale: 1 })
  }

  if (layerStack) {
    const show = Boolean(beat.activeLayer) || beat.id === 'transition'
    layerStack.hidden = !show
    if (!show)
      gsap.set(layerStack, { autoAlpha: 0, visibility: 'hidden' })
  }

  if (platform) {
    const show = beat.phase !== 'lifecycle'
    platform.hidden = !show
    if (show)
      gsap.set(platform, { autoAlpha: 1, visibility: 'visible' })
  }
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
  else
    syncPlatformLayerOpacity(beat)

  updateBeatIndicator()
}

function animatePlatformBeat(beat, { fromTransition = false } = {}) {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  if (beat.id === 'define') {
    tl.fromTo('#vi-define-logo', { autoAlpha: 0, y: 18, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 })
      .fromTo('[data-bind="subtitle"]', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.55 }, '-=0.4')
      .fromTo('#vi-define-prompt', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.35')
    return tl
  }

  if (beat.activeLayer) {
    const activeSelector = `.vi-layer[data-layer="${beat.activeLayer}"]`
    const layer = document.querySelector(activeSelector)
    tl.set('#vi-layer-stack', { autoAlpha: 1, scale: 1, y: 0 }, 0)
    if (layer && !layer.classList.contains('was-shown')) {
      layer.classList.add('was-shown')
      tl.fromTo(layer, { autoAlpha: 0, y: 32, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 })
    }
    else {
      tl.set(activeSelector, { autoAlpha: 1, y: 0, scale: 1, visibility: 'visible' }, 0)
    }
    tl.to('.vi-layer.is-dim', { autoAlpha: 0.45, duration: 0.4 }, '<')
    tl.to(activeSelector, { autoAlpha: 1, duration: 0.4 }, '<')
    return tl
  }

  if (beat.id === 'transition') {
    tl.to('[data-bind="subtitle"]', { autoAlpha: 0, y: -8, duration: 0.3 })
      .to('#vi-define-logo, #vi-define-prompt', { autoAlpha: 0, y: -8, duration: 0.3 }, '<')
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
    clearViGsapState()
    syncPlatformLayerOpacity(beat)
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
    const finish = () => resolve()
    tl.eventCallback('onComplete', finish)
    if (tl.progress() === 1)
      finish()
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
  if (beatTween) {
    beatTween.kill()
    beatTween = null
  }

  currentBeatIndex = 0
  selectedStepId = null
  document.querySelectorAll('.vi-layer').forEach((l) => l.classList.remove('was-shown', 'is-active', 'is-dim', 'is-visible'))
  const root = story()
  if (root) {
    delete root.dataset.viSelectedStep
    delete root.dataset.viInteractive
    delete root.dataset.viBeat
    delete root.dataset.viPhase
  }
  clearViGsapState()
  applyViBeatDom(0)
  if (!reduceMotion) {
    gsap.set('.vi-layer, #vi-transition-badge, #vi-detail-wrap', {
      clearProps: 'transform,filter',
    })
  }
}

export function initViBeatState() {
  currentBeatIndex = 0
  applyViBeatDom(0)
}

export function animateViSceneIn({ reduceMotion = false } = {}) {
  resetViBeat({ reduceMotion })
  return goToViBeat(0, { animate: !reduceMotion, reduceMotion }).then(() => {
    gsap.set('#vi-platform', { autoAlpha: 1, y: 0, visibility: 'visible' })
  })
}

export function settleViScene({ reduceMotion = false } = {}) {
  resetViBeat({ reduceMotion })
  clearViGsapState()
  const beat = viBeats[currentBeatIndex] ?? viBeats[0]
  syncPlatformLayerOpacity(beat)
  syncHiddenViElements(beat)
  gsap.set('#vi-interactive-hint, #vi-detail-wrap, [data-bind="subtitle"]', {
    autoAlpha: 1,
    clearProps: 'x,y,scale,filter',
  })
  gsap.set('#vi-platform', { autoAlpha: 1, clearProps: 'x,y,scale,filter' })
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
}

export function onViSceneLeave() {
  const viStage = document.getElementById('vi-stage')
  const indicator = document.getElementById('vi-beat-indicator')
  const rig = document.querySelector('.thread-rig')
  const footerHint = document.querySelector('.footer-hint-text')

  if (beatTween) {
    beatTween.kill()
    beatTween = null
  }

  resetViBeat({ reduceMotion: true })

  if (viStage) {
    viStage.hidden = true
    gsap.set(viStage, { autoAlpha: 0, visibility: 'hidden', pointerEvents: 'none' })
  }

  if (indicator)
    indicator.hidden = true

  if (footerHint)
    footerHint.textContent = 'Space beat · ↑↓ · ← → scene · Auto tour'

  syncViHeaderSubtitle(null)

  if (rig)
    delete rig.dataset.focusStep
}
