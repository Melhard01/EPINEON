import { motion as Motion, useReducedMotion } from 'framer-motion'
import './HumanCenteredAIDiagram.css'

/**
 * Human Centered AI Venn-style diagram — SVG, flat pastels, pure black field.
 * Circle fills render first; all labels sit in a top layer so overlaps never hide wording.
 */
export function HumanCenteredAIDiagram({ visible = true }) {
  const reduceMotion = useReducedMotion()

  return (
    <Motion.div
      className="hcai-diagram mx-auto min-w-0 w-full max-w-[min(100%,600px)] rounded-2xl bg-black px-3 py-5 sm:max-w-[min(100%,640px)] sm:px-5 sm:py-6 lg:max-w-[min(100%,700px)]"
      initial={reduceMotion ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 0.94 }}
      animate={
        visible
          ? { opacity: 1, scale: 1 }
          : reduceMotion
            ? { opacity: 0, scale: 1 }
            : { opacity: 0, scale: 0.94 }
      }
      transition={{
        opacity: { duration: reduceMotion ? 0.12 : 0.75, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: reduceMotion ? 0.12 : 0.85, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <svg
        viewBox="0 0 480 420"
        className="h-auto w-full"
        role="img"
        aria-label="Human Centered AI as the intersection of Technology, Ethics, and Humans"
      >
        <defs>
          <filter id="hcai-soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000000" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Layer 1 — circle fills only (back → front) */}
        <g className="hcai-float hcai-float--ethics" style={{ transformOrigin: '118px 312px' }}>
          <circle cx="118" cy="312" r="84" fill="#7aab9f" filter="url(#hcai-soft-shadow)" />
        </g>
        <g className="hcai-float hcai-float--humans" style={{ transformOrigin: '362px 312px' }}>
          <circle cx="362" cy="312" r="84" fill="#b8e8d4" filter="url(#hcai-soft-shadow)" />
        </g>
        <g className="hcai-float hcai-float--tech" style={{ transformOrigin: '240px 128px' }}>
          <circle cx="240" cy="128" r="84" fill="#f2e8b8" filter="url(#hcai-soft-shadow)" />
        </g>
        <g className="hcai-float hcai-float--center" style={{ transformOrigin: '240px 250px' }}>
          <circle cx="240" cy="250" r="102" fill="#e8b09a" filter="url(#hcai-soft-shadow)" />
        </g>

        {/* Layer 2 — labels always above all circle geometry */}
        <g fill="#121212" pointerEvents="none">
          <g className="hcai-float hcai-float--tech" style={{ transformOrigin: '240px 128px' }}>
            <text x="240" y="96" textAnchor="middle" fontSize="17" fontWeight="600" letterSpacing="0.02em">
              Technology
            </text>
            <text x="240" y="118" textAnchor="middle" fontSize="11.75" fontWeight="400">
              <tspan x="240" dy="0">
                Augmented human ability
              </tspan>
              <tspan x="240" dy="15">
                with AI
              </tspan>
            </text>
          </g>

          <g className="hcai-float hcai-float--ethics" style={{ transformOrigin: '118px 312px' }}>
            <text x="102" y="304" textAnchor="middle" fontSize="17" fontWeight="600" letterSpacing="0.02em">
              Ethics
            </text>
            <text x="102" y="326" textAnchor="middle" fontSize="11.75" fontWeight="400">
              <tspan x="102" dy="0">
                Ethical, Responsible and
              </tspan>
              <tspan x="102" dy="15">
                Transparent AI
              </tspan>
            </text>
          </g>

          <g className="hcai-float hcai-float--humans" style={{ transformOrigin: '362px 312px' }}>
            <text x="378" y="304" textAnchor="middle" fontSize="17" fontWeight="600" letterSpacing="0.02em">
              Humans
            </text>
            <text x="378" y="326" textAnchor="middle" fontSize="11.75" fontWeight="400">
              <tspan x="378" dy="0">
                Algorithm Explainability
              </tspan>
              <tspan x="378" dy="15">
                and Interpretability
              </tspan>
            </text>
          </g>

          <g className="hcai-float hcai-float--center" style={{ transformOrigin: '240px 250px' }}>
            <text x="240" y="226" textAnchor="middle" fontSize="18" fontWeight="600" letterSpacing="0.03em">
              Human Centered AI
            </text>
            <text x="240" y="252" textAnchor="middle" fontSize="12.5" fontStyle="italic" fontWeight="400">
              <tspan x="240" dy="0">
                Ethical, Sustainable and Trustworthy
              </tspan>
            </text>
          </g>
        </g>
      </svg>
    </Motion.div>
  )
}
