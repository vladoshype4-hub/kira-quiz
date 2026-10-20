export default function CloverAnimation() {
  return (
    <div className="clover-scene" aria-label="Светящаяся конюшина на удачу" role="img">
      <span className="clover-scene__aura" aria-hidden="true" />
      <span className="clover-scene__orbit clover-scene__orbit--one" aria-hidden="true" />
      <span className="clover-scene__orbit clover-scene__orbit--two" aria-hidden="true" />
      <span className="clover-scene__leaf clover-scene__leaf--main" aria-hidden="true">🍀</span>
      <span className="clover-scene__spark clover-scene__spark--one" aria-hidden="true">✦</span>
      <span className="clover-scene__spark clover-scene__spark--two" aria-hidden="true">·</span>
      <span className="clover-scene__spark clover-scene__spark--three" aria-hidden="true">✧</span>
    </div>
  )
}
