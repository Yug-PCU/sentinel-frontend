import { useInView } from '../../hooks/useInView.js'

/** Fades and lifts its children into place when they scroll into view. */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView()
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
      className={`transition-[opacity,translate,rotate] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        inView ? 'translate-y-0 rotate-0 opacity-100' : 'translate-y-10 rotate-[0.6deg] opacity-0 motion-reduce:translate-y-0 motion-reduce:rotate-0 motion-reduce:opacity-100'
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
