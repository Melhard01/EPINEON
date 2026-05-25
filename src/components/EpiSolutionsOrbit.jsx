import { motion as Motion, useReducedMotion } from 'framer-motion'

/**
 * OUR MISSION — four dimensions orbiting “EPI Solutions” (inline SVG, animations run here — not via img).
 * No outer background; sits on the section surface.
 */
export function EpiSolutionsOrbit({ visible = true }) {
  const reduceMotion = useReducedMotion()

  return (
    <Motion.div
      className="epi-solutions-orbit mx-auto min-w-0 w-full max-w-[700px]"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
      animate={
        visible
          ? { opacity: 1, scale: 1 }
          : reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.97 }
      }
      transition={{
        opacity: { duration: reduceMotion ? 0.12 : 0.75, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: reduceMotion ? 0.12 : 0.85, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 680 640"
        className="block h-auto w-full"
        role="img"
        shapeRendering="geometricPrecision"
      >
        <title>Epineon four dimensions orbiting EPI Solutions</title>
        <desc>
          EPI Solutions at the center while Physical, Psychological, Social, and Contribution orbit slowly around
          it.
        </desc>
        <style>
          {`
            .epiSo-t-th { font-size: 14px; font-weight: 500; font-family: ui-sans-serif, system-ui, sans-serif; }
            .epiSo-t-ts { font-size: 12px; font-style: italic; font-family: ui-sans-serif, system-ui, sans-serif; }
            .epiSo-t-center-title { font-family: Georgia, "Times New Roman", serif; font-size: 22px; font-weight: 500; }
            .epiSo-t-center-sub { font-family: Georgia, "Times New Roman", serif; font-size: 12px; font-style: italic; }
            @keyframes epiSo-spin { to { transform: rotate(360deg); } }
            @keyframes epiSo-counter { to { transform: rotate(-360deg); } }
            .epiSo-orb { animation: epiSo-spin 60s linear infinite; transform-origin: 340px 320px; }
            .epiSo-up { animation: epiSo-counter 60s linear infinite; }
            .epiSo-up-t { transform-origin: 340px 105px; }
            .epiSo-up-r { transform-origin: 555px 320px; }
            .epiSo-up-b { transform-origin: 340px 535px; }
            .epiSo-up-l { transform-origin: 125px 320px; }
            @media (prefers-reduced-motion: reduce) {
              .epiSo-orb, .epiSo-up { animation: none; }
            }
          `}
        </style>

        <circle cx="340" cy="320" r="215" fill="none" stroke="#D4A574" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.18" />
        <circle cx="340" cy="320" r="148" fill="#3D2A14" stroke="#D4A574" strokeWidth="1" />

        <g className="epiSo-orb">
          <g className="epiSo-up epiSo-up-t">
            <circle cx="340" cy="105" r="95" fill="#15292D" stroke="#4DA6A6" strokeWidth="1" />
            <text className="epiSo-t-th" x="340" y="100" textAnchor="middle" fill="#B8DCDC">
              Physical
            </text>
            <text className="epiSo-t-ts" x="340" y="122" textAnchor="middle" fill="#94B8B8">
              What the body knows.
            </text>
          </g>
        </g>

        <g className="epiSo-orb">
          <g className="epiSo-up epiSo-up-r">
            <circle cx="555" cy="320" r="95" fill="#2A1E18" stroke="#B5836B" strokeWidth="1" />
            <text className="epiSo-t-th" x="555" y="315" textAnchor="middle" fill="#E0C7B0">
              Social
            </text>
            <text className="epiSo-t-ts" x="555" y="337" textAnchor="middle" fill="#B59F8A">
              No one walks alone.
            </text>
          </g>
        </g>

        <g className="epiSo-orb">
          <g className="epiSo-up epiSo-up-b">
            <circle cx="340" cy="535" r="95" fill="#1D2A1F" stroke="#7DA882" strokeWidth="1" />
            <text className="epiSo-t-th" x="340" y="530" textAnchor="middle" fill="#B8D6B8">
              Contribution
            </text>
            <text className="epiSo-t-ts" x="340" y="552" textAnchor="middle" fill="#94B898">
              What helps the next.
            </text>
          </g>
        </g>

        <g className="epiSo-orb">
          <g className="epiSo-up epiSo-up-l">
            <circle cx="125" cy="320" r="95" fill="#1A2030" stroke="#7585B5" strokeWidth="1" />
            <text className="epiSo-t-th" x="125" y="315" textAnchor="middle" fill="#C0CADE">
              Psychological
            </text>
            <text className="epiSo-t-ts" x="125" y="337" textAnchor="middle" fill="#9DA8C5">
              Clarity that stays yours.
            </text>
          </g>
        </g>

        <text className="epiSo-t-center-title" x="340" y="308" textAnchor="middle" fill="#F0D5A8">
          EPI Solutions
        </text>
        <text className="epiSo-t-center-sub" x="340" y="335" textAnchor="middle" fill="#D4A574">
          Across four dimensions
        </text>
        <text className="epiSo-t-center-sub" x="340" y="353" textAnchor="middle" fill="#D4A574">
          of a whole life
        </text>
      </svg>
    </Motion.div>
  )
}
