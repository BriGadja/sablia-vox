'use client'

export function RippleBackground() {
  // Points d'origine aléatoires pour les ripples (en pourcentage)
  const rippleOrigins = [
    { cx: '25%', cy: '35%', delay: 0 },
    { cx: '70%', cy: '25%', delay: 2 },
    { cx: '45%', cy: '60%', delay: 4 },
    { cx: '80%', cy: '70%', delay: 1.5 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-transparent" />

      {/* SVG Ripples */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gradient pour les cercles */}
          <linearGradient id="rippleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#c084fc', stopOpacity: 0.2 }} />
          </linearGradient>
        </defs>

        {/* Génération des ripples pour chaque point d'origine */}
        {rippleOrigins.map((origin, idx) => (
          <g key={idx}>
            {/* 3 cercles concentriques par point */}
            <circle
              cx={origin.cx}
              cy={origin.cy}
              r="0"
              fill="none"
              stroke="url(#rippleGradient)"
              strokeWidth="0.15"
              className="ripple-circle"
              style={{
                animationDelay: `${origin.delay}s`,
              }}
            />
            <circle
              cx={origin.cx}
              cy={origin.cy}
              r="0"
              fill="none"
              stroke="url(#rippleGradient)"
              strokeWidth="0.15"
              className="ripple-circle"
              style={{
                animationDelay: `${origin.delay + 2}s`,
              }}
            />
            <circle
              cx={origin.cx}
              cy={origin.cy}
              r="0"
              fill="none"
              stroke="url(#rippleGradient)"
              strokeWidth="0.15"
              className="ripple-circle"
              style={{
                animationDelay: `${origin.delay + 4}s`,
              }}
            />
          </g>
        ))}
      </svg>

      {/* Grid overlay subtil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes ripple {
          0% {
            r: 0;
            opacity: 0.4;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            r: 40;
            opacity: 0;
          }
        }

        .ripple-circle {
          animation: ripple 7s ease-out infinite;
        }
      `}</style>
    </div>
  )
}
