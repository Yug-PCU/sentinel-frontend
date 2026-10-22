import { useId } from 'react'

// Sentinel mark: a teal shield with a check.
export default function Logo({ className = '' }) {
  const gradientId = useId()
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="6" y1="3" x2="26" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#46ecd5" />
          <stop offset="1" stopColor="#00a693" />
        </linearGradient>
      </defs>
      <path
        d="M16 3 6 6.8v7.6c0 6.3 4.2 11.9 10 13.6 5.8-1.7 10-7.3 10-13.6V6.8L16 3Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="m11.5 15.8 3.2 3.2 6.3-6.6"
        stroke="#040b18"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
