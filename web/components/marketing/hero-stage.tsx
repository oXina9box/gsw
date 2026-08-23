export function HeroStage() {
  return <div className="hero-stage">
    <div className="stage-topline"><span>Current stage / 08 of 13</span><span className="stage-live"><span className="pulse-dot" /> Human-reviewed</span></div>
    <div className="stage-art" aria-hidden="true">
      <div className="orbit orbit-one" /><div className="orbit orbit-two" />
      <figure className="stage-frame">
        <div className="frame-content">
          <div className="visual-crosshair crosshair-a" /><div className="visual-crosshair crosshair-b" />
          <span className="visual-label label-a">CAST / CONTINUITY LOCKED</span><span className="visual-label label-b">SELECTED CLIP 01:24 / 02:48</span>
          <div className="visual-subject"><span /></div>
        </div>
      </figure>
      <div className="signal-card signal-card-one"><span className="signal-icon signal-pink">✦</span><div><b>GenPlay ready</b><small>copy prompt / generate</small></div></div>
      <div className="signal-card signal-card-two"><span className="signal-icon signal-cyan">◆</span><div><b>One Studio</b><small>channel → production</small></div></div>
      <div className="stage-stamp">GS <b>13</b></div>
    </div>
    <div className="stage-bottomline"><span>Brief → frame → release</span><span className="stage-bars"><i /><i /><i /><i /><i /></span></div>
  </div>;
}
