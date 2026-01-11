export function OrangeLogo({ className = "size-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orange fruit body */}
      <circle
        cx="50"
        cy="55"
        r="40"
        fill="url(#orangeGradient)"
      />

      {/* Subtle highlight */}
      <ellipse
        cx="38"
        cy="42"
        rx="12"
        ry="8"
        fill="white"
        opacity="0.3"
      />

      {/* Stem */}
      <path
        d="M50 15 L50 22"
        stroke="#5D4037"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Leaf */}
      <path
        d="M50 18 Q65 8 75 15 Q65 22 50 18"
        fill="#4CAF50"
      />
      <path
        d="M52 17 Q62 14 68 16"
        stroke="#2E7D32"
        strokeWidth="1"
        fill="none"
      />

      {/* Orange texture dots */}
      <circle cx="35" cy="50" r="1.5" fill="#E65100" opacity="0.3" />
      <circle cx="45" cy="65" r="1.5" fill="#E65100" opacity="0.3" />
      <circle cx="60" cy="55" r="1.5" fill="#E65100" opacity="0.3" />
      <circle cx="55" cy="70" r="1.5" fill="#E65100" opacity="0.3" />
      <circle cx="40" cy="75" r="1.5" fill="#E65100" opacity="0.3" />
      <circle cx="65" cy="45" r="1.5" fill="#E65100" opacity="0.3" />
      <circle cx="30" cy="60" r="1.5" fill="#E65100" opacity="0.3" />
      <circle cx="70" cy="65" r="1.5" fill="#E65100" opacity="0.3" />

      {/* Gradient definition */}
      <defs>
        <radialGradient id="orangeGradient" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFB74D" />
          <stop offset="50%" stopColor="#FF9800" />
          <stop offset="100%" stopColor="#F57C00" />
        </radialGradient>
      </defs>
    </svg>
  )
}
