import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SiteChrome from '../components/SiteChrome.jsx'
import PageFooter from '../components/PageFooter.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useStallGuard } from '../hooks/useStallGuard.js'
import { images } from '../images.js'
import { ARCHIVE, NAV_PAGE, PLATE_KEYS } from '../data/collection.js'
import '../styles/archive.css'

export default function Archive() {
  useDocumentTitle('ARCHIVE — VESTIGE №7: EROSION')

  const root = useRef(null)
  const preview = useRef(null)

  useEffect(() => {
    const scope = root.current

    const ctx = gsap.context(() => {
      /* entrance */
      gsap.from('.a-head h1 span', { yPercent: 110, duration: 1.2, ease: 'power4.out', delay: 0.2 })
      gsap.from('.a-item', {
        opacity: 0,
        y: 26,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.035,
        delay: 0.5,
      })

      /* floating preview follows the pointer */
      const pv = preview.current
      const pvx = gsap.quickTo(pv, 'x', { duration: 0.55, ease: 'power3' })
      const pvy = gsap.quickTo(pv, 'y', { duration: 0.55, ease: 'power3' })
      const onMove = (e) => {
        pvx(e.clientX)
        pvy(e.clientY)
      }
      window.addEventListener('mousemove', onMove)

      const plates = pv.querySelectorAll('img')
      const items = scope.querySelectorAll('.a-item')
      const listeners = []

      items.forEach((item) => {
        const enter = () => {
          plates.forEach((im) => im.classList.toggle('on', im.dataset.key === item.dataset.key))
          gsap.to(pv, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' })
        }
        const leave = () => {
          gsap.to(pv, { opacity: 0, scale: 0.85, duration: 0.35, ease: 'power2.in' })
        }
        item.addEventListener('mouseenter', enter)
        item.addEventListener('mouseleave', leave)
        listeners.push([item, enter, leave])
      })

      return () => {
        window.removeEventListener('mousemove', onMove)
        listeners.forEach(([item, enter, leave]) => {
          item.removeEventListener('mouseenter', enter)
          item.removeEventListener('mouseleave', leave)
        })
      }
    }, root)

    return () => ctx.revert()
  }, [])

  useStallGuard(() => {
    gsap.globalTimeline.progress(1)
    gsap.set('.a-head h1 span, .a-item', { clearProps: 'all' })
  })

  return (
    <div ref={root}>
      <SiteChrome links={NAV_PAGE} />

      <main className="archive-main">
        <div className="a-head">
          <h1>
            <span>ARCHIVE</span>
          </h1>
          <div className="a-meta">
            COLLECTION №7 — EROSION
            <br />
            27 LOOKS · SHOWN IN SALT, WIND &amp; RUST
          </div>
        </div>

        <ul className="a-index">
          {ARCHIVE.map((look) => (
            <li key={look.id}>
              <a
                className="a-item"
                href="#"
                data-key={look.plate}
                onClick={(e) => e.preventDefault()}
              >
                <span className="ai-num">LOOK {look.number}</span>
                <span className="ai-name">“{look.name}”</span>
                <span className="ai-fab">{look.fabric}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="a-note">
          EACH LOOK EXISTS EXACTLY ONCE.
          <br />
          ARCHIVE VIEWING BY APPOINTMENT — PARIS 3E
        </div>
      </main>

      <div className="a-preview" ref={preview}>
        {PLATE_KEYS.map((key) => (
          <img key={key} src={images[key]} alt="" data-key={key} />
        ))}
      </div>

      <PageFooter />
    </div>
  )
}
