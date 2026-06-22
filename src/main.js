import { gsap } from 'gsap'
import {
  lifecycleSteps,
  pressureNarrative,
  scenes,
  viBeats,
} from './data.js'
import { animatePressureSceneIn, renderPressureStage, settlePressureScene } from './pressure-stage.js'
import {
  applyThreadPaths,
  buildThreadPath,
  isLabelAbove,
  resetKnotCssPositions,
  stepToKnotPercent,
  stepToThreadSvg,
  syncKnotPositions,
} from './thread-geometry.js'
import {
  animateViSceneIn,
  getViBeatIndex,
  isInteractiveBeat,
  isLifecycleBeat,
  nextViBeat,
  onViSceneEnter,
  onViSceneLeave,
  prevViBeat,
  renderViStage,
  settleViScene,
} from './vi-stage.js'
import './styles.css'

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'
const DESKTOP_BREAKPOINT = 1100
gsap.defaults({ duration: 0.72, ease: 'power3.out' })

const story = document.querySelector('.story')
const scenePills = Array.from(document.querySelectorAll('.scene-pill[data-scene]'))
const titleEl = document.querySelector('[data-bind="title"]')
const eyebrowEl = document.querySelector('[data-bind="eyebrow"]')
const subtitleEl = document.querySelector('[data-bind="subtitle"]')
const progressFill = document.querySelector('.progress-fill')
const starCanvas = document.querySelector('.starfield')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let currentSceneIndex = 0
let tourTween = null
let transitionLock = false
let resizeRaf = 0
const visitedScenes = new Set(['lifecycle'])

function syncThreadLayout() {
  const svg = document.querySelector('.thread-svg')
  const rig = document.querySelector('.thread-rig')
  if (!svg || !rig)
    return null

  const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT
  let pathD = ''

  if (isDesktop) {
    pathD = buildThreadPath(lifecycleSteps.map(stepToThreadSvg))
    applyThreadPaths(svg, pathD)
    syncKnotPositions(svg, rig, lifecycleSteps)
  }
  else {
    resetKnotCssPositions(rig, lifecycleSteps)
    pathD = buildThreadPath(lifecycleSteps.map(stepToThreadSvg))
    applyThreadPaths(svg, pathD)
  }

  const path = document.querySelector('.thread-path-core')
  if (path && pathD) {
    const len = path.getTotalLength()
    path.style.strokeDasharray = `${len}`
  }

  return pathD
}

function scheduleThreadSync() {
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = requestAnimationFrame(() => syncThreadLayout())
  })
}

function applySceneVisibility(sceneId) {
  const flowStage = document.getElementById('flow-stage-wrap')
  const pressureStage = document.getElementById('pressure-stage')
  const viStage = document.getElementById('vi-stage')

  if (sceneId === 'pressure') {
    if (flowStage) {
      gsap.set(flowStage, {
        autoAlpha: 0,
        visibility: 'hidden',
        pointerEvents: 'none',
      })
    }
    if (viStage)
      onViSceneLeave()
    if (pressureStage) {
      pressureStage.hidden = false
      gsap.set(pressureStage, {
        autoAlpha: 1,
        visibility: 'visible',
        pointerEvents: 'auto',
      })
    }
    return
  }

  if (sceneId === 'vi') {
    if (pressureStage) {
      pressureStage.hidden = true
      gsap.set(pressureStage, {
        autoAlpha: 0,
        visibility: 'hidden',
        pointerEvents: 'none',
      })
    }
    if (flowStage) {
      gsap.set(flowStage, {
        autoAlpha: 0,
        visibility: 'hidden',
        pointerEvents: 'none',
      })
    }
    onViSceneEnter({ reduceMotion })
    return
  }

  if (viStage)
    onViSceneLeave()

  if (pressureStage) {
    pressureStage.hidden = true
    gsap.set(pressureStage, {
      autoAlpha: 0,
      visibility: 'hidden',
      pointerEvents: 'none',
    })
  }

  if (flowStage) {
    gsap.set(flowStage, {
      autoAlpha: 1,
      visibility: 'visible',
      pointerEvents: 'auto',
    })
  }
}

function renderFlowTrack() {
  const track = document.getElementById('flow-track')
  if (!track)
    return

  track.innerHTML = lifecycleSteps.map((step, index) => {
    const above = isLabelAbove(step)
    const knotPos = stepToKnotPercent(step)
    const labelHtml = `<strong class="knot-label">${step.label}</strong>`
    const bodyHtml = `
      <div class="knot-body">
        <span class="knot-ring" aria-hidden="true"></span>
        <span class="knot-hole" aria-hidden="true"></span>
        <em class="knot-num">${String(step.id).padStart(2, '0')}</em>
      </div>
    `
    const hintHtml = `<p class="knot-hint">${step.hint}</p>`
    const copyClass = above ? 'knot-copy knot-copy--above' : 'knot-copy knot-copy--below'

    return `
    <li
      class="thread-knot ${step.vi ? 'thread-knot-vi' : ''} ${above ? 'thread-knot--above' : 'thread-knot--below'}"
      data-step="${step.id}"
      style="--x:${knotPos.x}%;--y:${knotPos.y}%;--i:${index}"
    >
      ${bodyHtml}
      <div class="${copyClass}">
        ${labelHtml}
        ${hintHtml}
      </div>
    </li>
  `
  }).join('')
}

function updateHeader(sceneId) {
  const meta = scenes.find((s) => s.id === sceneId)
  if (!meta)
    return
  if (titleEl)
    titleEl.textContent = meta.title
  if (eyebrowEl)
    eyebrowEl.textContent = meta.eyebrow
  if (subtitleEl) {
    if (sceneId === 'pressure') {
      subtitleEl.textContent = pressureNarrative.lede
      subtitleEl.hidden = false
    }
    else {
      subtitleEl.textContent = ''
      subtitleEl.hidden = true
    }
  }
}

function setActivePills(sceneId) {
  scenePills.forEach((pill) => {
    pill.classList.toggle('is-active', pill.dataset.scene === sceneId)
  })
  document.querySelector('[data-action="tour"]')?.classList.remove('is-active')
}

function updateProgress(index) {
  const pct = ((index + 1) / scenes.length) * 100
  if (progressFill) {
    gsap.to(progressFill, { width: `${pct}%`, duration: 0.55, ease: 'power2.out' })
  }
}

function primeSceneForIntro(sceneId) {
  gsap.set('.flow-header', { autoAlpha: 0, y: 14, filter: 'blur(6px)' })

  if (sceneId === 'pressure') {
    gsap.set('.pressure-stage', { autoAlpha: 1, y: 0, visibility: 'visible', filter: 'blur(0px)' })
    return
  }

  if (sceneId === 'vi') {
    gsap.set('.vi-stage', { autoAlpha: 1, y: 0, visibility: 'visible', filter: 'blur(0px)' })
    return
  }

  gsap.set('.flow-stage-wrap', { autoAlpha: 0, y: 14, filter: 'blur(6px)' })
}

function revealSceneShell(sceneId) {
  const targets = sceneId === 'vi'
    ? '.vi-stage, .flow-header'
    : sceneId === 'pressure'
      ? '.pressure-stage, .flow-header'
      : '.flow-stage-wrap, .flow-header'

  gsap.set(targets, {
    autoAlpha: 1,
    y: 0,
    filter: 'blur(0px)',
    visibility: 'visible',
    clearProps: 'filter',
  })
}

function settleSceneState(sceneId) {
  if (sceneId === 'pressure') {
    settlePressureScene()
    return
  }

  if (sceneId === 'vi') {
    settleViScene({ reduceMotion })
    return
  }

  gsap.killTweensOf('.knot-body, .knot-label')
  gsap.set('.knot-body, .knot-label', {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    clearProps: 'transform',
  })
}

function animateSceneIn(sceneId) {
  if (reduceMotion) {
    settleSceneState(sceneId)
    return Promise.resolve()
  }

  if (sceneId === 'pressure') {
    const tl = animatePressureSceneIn({ reduceMotion })
    gsap.to('.flow-header', {
      autoAlpha: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.55,
      ease: 'power3.out',
    })
    return new Promise((resolve) => {
      if (!tl) {
        resolve()
        return
      }
      const finish = () => resolve()
      tl.eventCallback('onComplete', finish)
      if (tl.progress() === 1)
        finish()
    })
  }

  if (sceneId === 'vi') {
    return animateViSceneIn({ reduceMotion }).then(() => {
      gsap.to('.flow-header', {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.55,
        ease: 'power3.out',
      })
    })
  }

  const tl = gsap.timeline()
  tl.fromTo(
    '.flow-header',
    { autoAlpha: 0, y: 12, filter: 'blur(6px)' },
    { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' },
  )
  tl.fromTo(
    '.knot-body',
    { autoAlpha: 0, y: 28, scale: 0.94, filter: 'blur(6px)' },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.72,
      stagger: 0.08,
      ease: 'power3.out',
      overwrite: 'auto',
    },
    '-=0.25',
  )
  return new Promise((resolve) => {
    tl.eventCallback('onComplete', resolve)
  })
}

function resetTour() {
  if (tourTween) {
    tourTween.kill()
    tourTween = null
  }
}

function sceneTransitionTarget(sceneId) {
  if (sceneId === 'pressure')
    return '.pressure-stage'
  if (sceneId === 'vi')
    return isLifecycleBeat() ? '.flow-stage-wrap, .vi-stage' : '.vi-stage'
  return '.flow-stage-wrap'
}

function goToScene(index, { keepTour = false } = {}) {
  if (transitionLock)
    return Promise.resolve()

  const nextIndex = Math.max(0, Math.min(scenes.length - 1, index))
  if (nextIndex === currentSceneIndex && !keepTour)
    return Promise.resolve()

  transitionLock = true
  if (!keepTour)
    resetTour()

  const nextScene = scenes[nextIndex]
  const prevScene = scenes[currentSceneIndex]

  const isFirstVisit = !visitedScenes.has(nextScene.id)

  const run = async () => {
    try {
      gsap.killTweensOf('.pressure-intro, .pressure-card, .pressure-hero-glow, #pressure-counter, #pressure-capacity-fill, #pressure-capacity-pct')

      if (!reduceMotion && prevScene.id !== nextScene.id) {
        const prevTarget = prevScene.id === 'vi'
          ? (isLifecycleBeat() ? '.flow-stage-wrap, .vi-stage, .flow-header' : '.vi-stage, .flow-header')
          : [`.flow-header`, sceneTransitionTarget(prevScene.id)]
        await gsap.to(prevTarget, {
          autoAlpha: 0,
          y: 18,
          filter: 'blur(8px)',
          duration: 0.32,
          ease: 'power2.in',
          stagger: 0.04,
        })
      }

      if (prevScene.id === 'vi' && nextScene.id !== 'vi')
        onViSceneLeave()

      story.dataset.scene = nextScene.id
      setActivePills(nextScene.id)
      updateHeader(nextScene.id)
      updateProgress(nextIndex)
      currentSceneIndex = nextIndex
      applySceneVisibility(nextScene.id)

      if (nextScene.id !== 'pressure')
        scheduleThreadSync()

      const nextTarget = nextScene.id === 'vi'
        ? '.vi-stage, .flow-header'
        : [`.flow-header`, sceneTransitionTarget(nextScene.id)]

      if (!reduceMotion) {
        if (isFirstVisit) {
          primeSceneForIntro(nextScene.id)
          await animateSceneIn(nextScene.id)
          revealSceneShell(nextScene.id)
        }
        else {
          await gsap.to(nextTarget, {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.42,
            ease: 'power3.out',
            stagger: 0.04,
          })
          settleSceneState(nextScene.id)
        }
      }
      else {
        settleSceneState(nextScene.id)
        revealSceneShell(nextScene.id)
      }

      visitedScenes.add(nextScene.id)
    }
    catch (error) {
      console.error('Scene transition failed:', error)
      revealSceneShell(nextScene.id)
      settleSceneState(nextScene.id)
    }
    finally {
      transitionLock = false
    }
  }

  return run()
}

function startTour() {
  resetTour()
  scenePills.forEach((pill) => pill.classList.remove('is-active'))
  document.querySelector('[data-action="tour"]')?.classList.add('is-active')

  let index = 0
  const dwell = [3.4, 3.8, 4.2]

  goToScene(index, { keepTour: true }).then(() => scheduleNext())

  function scheduleNext() {
    tourTween = gsap.delayedCall(dwell[index], () => {
      index = (index + 1) % scenes.length
      goToScene(index, { keepTour: true }).then(() => scheduleNext())
    })
  }
}

function initStarfield() {
  if (!starCanvas || reduceMotion)
    return

  const ctx = starCanvas.getContext('2d')
  let width = 0
  let height = 0
  const stars = []

  function resize() {
    width = starCanvas.width = window.innerWidth
    height = starCanvas.height = window.innerHeight
  }

  function seed() {
    stars.length = 0
    const count = Math.floor((width * height) / 8500)
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.15,
        a: Math.random() * 0.55 + 0.08,
        sp: Math.random() * 0.28 + 0.03,
      })
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)
    for (const star of stars) {
      star.y += star.sp
      if (star.y > height)
        star.y = 0
      ctx.beginPath()
      ctx.fillStyle = `rgba(200, 235, 255, ${star.a})`
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
      ctx.fill()
    }
    requestAnimationFrame(draw)
  }

  resize()
  seed()
  draw()
  window.addEventListener('resize', () => {
    resize()
    seed()
  })
}

function initParallax() {
  if (reduceMotion)
    return

  const rig = document.querySelector('.thread-rig')
  if (!rig)
    return

  let raf = 0
  window.addEventListener('pointermove', (event) => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      const px = (event.clientX / window.innerWidth - 0.5) * 2
      const py = (event.clientY / window.innerHeight - 0.5) * 2
      gsap.to(rig, {
        rotateY: px * 5,
        rotateX: -py * 3.5,
        transformPerspective: 1400,
        duration: 0.65,
        ease: 'power2.out',
      })
      gsap.to('.ambient-a', { x: px * 28, y: py * 18, duration: 1.1, ease: 'sine.out' })
      gsap.to('.ambient-b', { x: -px * 22, y: -py * 14, duration: 1.1, ease: 'sine.out' })
    })
  })

  window.addEventListener('pointerleave', () => {
    gsap.to(rig, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'power3.out' })
  })
}

function initMotionLoops() {
  gsap.to('.thread-path-travel', {
    strokeDashoffset: -200,
    repeat: -1,
    duration: 2.2,
    ease: 'none',
  })

  gsap.to('.knot-ring', {
    scale: 1.05,
    repeat: -1,
    yoyo: true,
    duration: 2.6,
    stagger: { each: 0.35, from: 'random' },
    ease: 'sine.inOut',
    transformOrigin: '50% 50%',
  })

  gsap.to('.ambient-a', {
    x: 24,
    y: 16,
    repeat: -1,
    yoyo: true,
    duration: 9,
    ease: 'sine.inOut',
  })

  gsap.to('.ambient-b', {
    x: -20,
    y: -12,
    repeat: -1,
    yoyo: true,
    duration: 11,
    ease: 'sine.inOut',
  })

  gsap.to('.ambient-c', {
    scale: 1.12,
    repeat: -1,
    yoyo: true,
    duration: 7,
    ease: 'sine.inOut',
  })

  gsap.to('.knot-ring', {
    rotate: 360,
    repeat: -1,
    duration: 48,
    ease: 'none',
    transformOrigin: '50% 50%',
  })
}

function initIntro() {
  const path = document.querySelector('.thread-path-core')
  if (path) {
    const len = path.getTotalLength()
    path.style.strokeDasharray = `${len}`
    path.style.strokeDashoffset = `${len}`
  }

  const tl = gsap.timeline()
  tl.from('.scene-nav', { autoAlpha: 0, y: -16, duration: 0.6 })
    .from('.flow-eyebrow', { autoAlpha: 0, y: 12, duration: 0.5 }, '-=0.35')
    .from('.flow-title', { autoAlpha: 0, y: 32, filter: 'blur(10px)', duration: 0.85 }, '-=0.4')
    .to('.thread-path-core', { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, '-=0.5')
    .from('.thread-svg', { autoAlpha: 0, scale: 0.94, duration: 0.6 }, '-=1.4')
    .from('.knot-body', {
      autoAlpha: 0,
      scale: 0.4,
      stagger: 0.12,
      duration: 0.55,
      ease: 'back.out(1.6)',
    }, '-=1.0')
    .from('.knot-label', { autoAlpha: 0, y: 8, stagger: 0.08, duration: 0.4 }, '-=0.7')
    .from('.story-footer', { autoAlpha: 0, y: 10, duration: 0.45 }, '-=0.2')
}

function bindNavigation() {
  scenePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      if (pill.dataset.action === 'tour') {
        startTour()
        return
      }
      const idx = scenes.findIndex((s) => s.id === pill.dataset.scene)
      if (idx >= 0)
        goToScene(idx)
    })

    const lift = gsap.quickTo(pill, 'y', { duration: 0.22, ease: EASE })
    pill.addEventListener('pointerenter', () => lift(-2))
    pill.addEventListener('pointerleave', () => lift(0))
  })

  window.addEventListener('keydown', (event) => {
    const sceneId = scenes[currentSceneIndex]?.id

    if (sceneId === 'vi') {
      if (event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        if (!isInteractiveBeat())
          nextViBeat({ reduceMotion })
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (getViBeatIndex() > 0)
          prevViBeat({ reduceMotion })
        return
      }
    }

    if (event.key === 'ArrowRight')
      goToScene(currentSceneIndex + 1)
    if (event.key === 'ArrowLeft')
      goToScene(currentSceneIndex - 1)
  })

  window.addEventListener('resize', scheduleThreadSync)
}

function bootstrap() {
  renderFlowTrack()
  renderViStage()
  renderPressureStage()
  bindNavigation()
  initStarfield()
  initParallax()

  applySceneVisibility('lifecycle')
  scheduleThreadSync()
  window.addEventListener('load', scheduleThreadSync)
  document.fonts?.ready?.then(() => scheduleThreadSync())

  if (!reduceMotion) {
    initIntro()
    initMotionLoops()
  }

  updateHeader('lifecycle')
  updateProgress(0)
  story.dataset.scene = 'lifecycle'

  const viIndicator = document.getElementById('vi-beat-indicator')
  if (viIndicator)
    viIndicator.hidden = true
}

bootstrap()
