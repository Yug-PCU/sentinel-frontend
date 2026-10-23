const CORNERS = [
  'top-0 left-0 border-t-2 border-l-2 rounded-tl-[6px]',
  'top-0 right-0 border-t-2 border-r-2 rounded-tr-[6px]',
  'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-[6px]',
  'bottom-0 right-0 border-b-2 border-r-2 rounded-br-[6px]',
]

export default function Corners({ className = 'text-teal-300/70', size = 'size-3.5' }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {CORNERS.map((position) => (
        <span key={position} className={`absolute ${size} border-current ${position}`} />
      ))}
    </span>
  )
}
