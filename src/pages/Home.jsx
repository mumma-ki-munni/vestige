import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SiteChrome from '../components/SiteChrome.jsx'
import Preloader from '../components/Preloader.jsx'
import ChapterTag from '../components/ChapterTag.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useStallGuard } from '../hooks/useStallGuard.js'
import { images } from '../images.js'
import { LOOKS, MANIFESTO, NAV_HOME, STATS } from '../data/collection.js'
import '../styles/home.css'

const PRELOAD = [
  images.hero,
  images.look1,
  images.look2,
  images.look3,
  images.detail,
  images.finale,
]

const MARQUEE = ['DECONSTRUCTION', 'MEMORY', 'SALT', 'WIND', 'RUST']

function MarqueeRun() {
  // Two identical runs so the -50% loop is seamless.
  const words = [...MARQUEE, ...MARQUEE]
  return (
    <span>
      {words.map((word, i) => (
        <Fragment key={i}>
          {word} <em>—</em>{' '}
        </Fragment>
      ))}
      &nbsp;
    </span>
  )
}

function ManifestoCopy() {
  const words = useMemo(
    () =>
      MANIFESTO.flatMap((segment, s) =>
        segment.text.split(/\s+/).map((word, w) => ({ key: `${s}-${w}`, word, em: segment.em })),
      ),
    [],
  )

  return (
    <p>
      {words.map(({ key, word, em }) => (
        <Fragment key={key}>
          <span className="w">{em ? <em>{word}</em> : word}</span>{' '}
        </Fragment>
      ))}
    </p>
  )
}

export default function Home() {
  useDocumentTitle('VESTIGE — Collection №7: EROSION')

  const root = useRef(null)
  const [ready, setReady] = useState(false)
  const [chapter, setChapter] = useState({ num: '00', label: 'OVERTURE' })

  // Scroll-driven choreography. Rebuilt only on mount; gsap.context tears the
  // whole graph (including pin spacers) back down on unmount.
  useEffect(() => {
    const scope = root.current

    const ctx = gsap.context(() => {
      /* HERO — pinned, title drifts as the image de-zooms */
      gsap
        .timeline({
          scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=120%', pin: true, scrub: 1 },
        })
        .to('.hero .hero-media img', { scale: 1, ease: 'none' }, 0)
        .to('.hero .hero-title', { yPercent: -18, opacity: 0, ease: 'none' }, 0)
        .to('.hero .ht-meta', { opacity: 0, ease: 'none' }, 0)
        .to('.hero .hero-shade', { opacity: 0.35, ease: 'none' }, 0)

      /* MARQUEE */
      gsap.to('.mq-track', { xPercent: -50, ease: 'none', duration: 26, repeat: -1 })

      /* MANIFESTO — word-by-word scrub reveal */
      gsap.to('.manifesto .w', {
        opacity: 1,
        stagger: 0.06,
        ease: 'none',
        scrollTrigger: {
          trigger: '.manifesto',
          start: 'top 65%',
          end: 'bottom 75%',
          scrub: 0.6,
        },
      })
      gsap.from('.manifesto .m-index, .manifesto .m-sig', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.manifesto', start: 'top 60%' },
      })

      /* LOOKS — horizontal scroll hijack */
      const track = scope.querySelector('.lk-track')
      const distance = () => track.scrollWidth - window.innerWidth
      const horiz = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: '.looks',
          start: 'top top',
          end: () => '+=' + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })

      scope.querySelectorAll('.look').forEach((look) => {
        gsap.fromTo(
          look.querySelector('.lk-frame img'),
          { yPercent: -9 },
          {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: look,
              containerAnimation: horiz,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        )
        gsap.from(look, {
          opacity: 0,
          y: 60,
          duration: 1,
          scrollTrigger: { trigger: look, containerAnimation: horiz, start: 'left 85%' },
        })
      })

      /* ATELIER */
      gsap.from('.detail h2 .line > span', {
        yPercent: 110,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.detail', start: 'top 60%' },
      })
      gsap.from('.detail .d-body, .detail .d-stats', {
        opacity: 0,
        y: 40,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: { trigger: '.detail', start: 'top 45%' },
      })
      gsap.fromTo(
        '.detail .d-media img',
        { yPercent: -10 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.detail', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )

      scope.querySelectorAll('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count)
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () =>
            gsap.to(
              { v: 0 },
              {
                v: end,
                duration: 1.8,
                ease: 'power2.out',
                onUpdate() {
                  el.textContent = Math.round(this.targets()[0].v)
                },
              },
            ),
        })
      })

      /* FINALE — pinned zoom, the word solidifies */
      gsap
        .timeline({
          scrollTrigger: {
            trigger: '.finale',
            start: 'top top',
            end: '+=160%',
            pin: true,
            scrub: 1,
          },
        })
        .fromTo('.finale .f-media img', { scale: 1.25}, { scale: 1, ease: 'none' }, 0)
        .fromTo(
          '.finale .f-word',
          { letterSpacing: '.45em', opacity: 0, color: 'rgba(232,228,220,0)' },
          { letterSpacing: '.12em', opacity: 1, ease: 'none' },
          0,
        )
        .to(
          '.finale .f-word',
          { color: 'rgba(232,228,220,1)', webkitTextStroke: '1px rgba(232,228,220,0)', ease: 'none' },
          0.55,
        )
        .to('.finale .f-credits', { opacity: 1, ease: 'none' }, 0.7)

      /* Chapter indicator */
      scope.querySelectorAll('[data-chapter]').forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (!self.isActive) return
            setChapter({ num: section.dataset.chapter, label: section.dataset.label })
          },
        })
      })
    }, root)

    return () => ctx.revert()
  }, [])

  // Hero entrance, handed off from the preloader. Measurements are only
  // trustworthy once the imagery has real dimensions, hence the refresh.
  useEffect(() => {
    if (!ready) return

    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .from('.hero h1 .char', {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: 'power3.out',
          stagger: 0.05,
        })
        .from('.ht-kicker', { opacity: 0, duration: 1 }, '-=0.8')
        .from('.ht-sub', { opacity: 0, duration: 1.2 }, '-=0.6')
    }, root)

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [ready])

  useStallGuard(() => {
    gsap.globalTimeline.progress(1)
    gsap.set('.hero h1 .char, .ht-kicker, .ht-sub, .hero .ht-meta', { clearProps: 'all' })
  })

  return (
    <div ref={root}>
      <Preloader sources={PRELOAD} onReveal={() => setReady(true)} />

      <SiteChrome links={NAV_HOME} />

      <ChapterTag num={chapter.num} label={chapter.label} />
      <div className="scroll-hint">SCROLL TO DESCEND</div>

      <main>
        {/* 00 · HERO */}
        <section className="hero" data-chapter="00" data-label="OVERTURE">
          <div className="hero-media">
            <img src={images.hero} alt="Monumental black couture on a brutalist rooftop" />
          </div>
          <div className="hero-shade" />
          <div className="hero-title">
            <div className="ht-kicker">MAISON VESTIGE — COLLECTION №7</div>
            <h1 aria-label="EROSION">
              {['ERO', 'SION'].map((line) => (
                <span className="line" key={line}>
                  {[...line].map((char, i) => (
                    <span className="char" key={i}>
                      {char}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <div className="ht-sub">what the wind could not take, we sewed back on</div>
          </div>
          <div className="ht-meta">
            <span>SS26</span>
            <span>PARIS — TOKYO — REYKJAVIK</span>
            <span>27 LOOKS</span>
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="mq-track">
            <MarqueeRun />
            <MarqueeRun />
          </div>
        </div>

        {/* 01 · MANIFESTO */}
        <section className="manifesto" id="manifesto" data-chapter="01" data-label="MANIFESTO">
          <div className="m-index">01 / MANIFESTO</div>
          <ManifestoCopy />
          <div className="m-sig">— A. VESTIGE, CREATIVE DIRECTOR</div>
        </section>

        {/* 02 · LOOKS (horizontal hijack) */}
        <section className="looks" id="looks" data-chapter="02" data-label="THE LOOKS">
          <div className="lk-pin">
            <div className="lk-head">02 / SELECTED LOOKS — DRAG OF THE EARTH</div>
            <div className="lk-track">
              {LOOKS.map((look) => (
                <div className="look" key={look.num}>
                  <div className="lk-num">{look.num}</div>
                  <div className="lk-frame">
                    <img src={look.src} alt={look.alt} />
                  </div>
                  <div className="lk-cap">
                    <span>{look.caption}</span>
                    <span>{look.fabric}</span>
                  </div>
                  <div className="lk-name">{look.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 03 · ATELIER */}
        <section className="detail" id="atelier" data-chapter="03" data-label="ATELIER">
          <div className="d-text">
            <div className="d-index">03 / THE ATELIER</div>
            <h2>
              {['SEWN,', 'UNSEWN,', 'SEWN AGAIN.'].map((line) => (
                <span className="line" key={line}>
                  <span>{line}</span>
                </span>
              ))}
            </h2>
            <p className="d-body">
              Every piece passes through destruction before it is allowed to exist. Cloth is buried,
              burned at the edges, dragged behind a bicycle through the Marais, then reconstructed
              by hand. What survives the week earns the label.
            </p>
            <div className="d-stats">
              {STATS.map((stat) => (
                <div className="stat" key={stat.label}>
                  <b data-count={stat.value}>0</b>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="d-media">
            <img src={images.detail} alt="Macro of frayed couture fabric" />
          </div>
        </section>

        {/* 04 · FINALE */}
        <section className="finale" id="finale" data-chapter="04" data-label="EROSION">
          <div className="f-media">
            <img src={images.finale} alt="Lone figure crossing a salt flat at dusk" />
          </div>
          <div className="f-shade" />
          <div className="f-word">ERODED</div>
          <div className="f-credits">
            <span>DIRECTION — A. VESTIGE</span>
            <span>PHOTOGRAPHY — STUDIO SALT</span>
            <span>SET — BUREAU BETON</span>
            <span>FILM — 35MM, UNCORRECTED</span>
          </div>
        </section>
      </main>

      <footer className="site-foot">
        <div className="f-logo">VESTIGE</div>
        <div className="f-note">
          COLLECTION №7 — EROSION · SS26
          <br />
          BY APPOINTMENT ONLY · PARIS 3E
          <br />© MMXXVI — NOTHING LASTS, LEAST OF ALL THIS SITE
        </div>
      </footer>
    </div>
  )
}
