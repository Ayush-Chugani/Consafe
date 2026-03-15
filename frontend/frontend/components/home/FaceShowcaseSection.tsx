'use client'
import { useEffect, useRef } from 'react'

export default function FaceShowcaseSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const wrapper = canvasEl.parentElement!
    canvasEl.width = wrapper.offsetWidth
    canvasEl.height = wrapper.offsetHeight
    const ctx = canvasEl.getContext('2d')!
    const W = canvasEl.width, H = canvasEl.height
    const cols=4,rows=3,padX=40,padY=40
    const cellW=(W-padX*2)/cols, cellH=(H-padY*2)/rows
    const ids=['W-001','W-002','W-003','W-004','W-005','W-006','W-007','W-008','W-009','W-010','W-011','W-012']
    type Worker={x:number;y:number;r:number;id:string;recognized:boolean;ringAlpha:number;ringScale:number;unrecognized:boolean}
    const workers:Worker[]=[]
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const i=r*cols+c
      workers.push({x:padX+c*cellW+cellW/2,y:padY+r*cellH+cellH/2,r:Math.min(cellW,cellH)*0.28,id:ids[i],recognized:false,ringAlpha:0,ringScale:1,unrecognized:Math.random()<0.2})
    }
    let scanY=-20
    const drawFace=(w:Worker)=>{
      const alpha=w.recognized?1:0.35; ctx.globalAlpha=alpha
      ctx.fillStyle=w.recognized?(w.unrecognized?'rgba(255,51,102,0.15)':'rgba(0,255,136,0.12)'):'rgba(28,34,56,0.6)'
      ctx.strokeStyle=w.recognized?(w.unrecognized?'#ff3366':'#00ff88'):'rgba(55,66,104,0.5)'
      ctx.lineWidth=w.recognized?1.5:1
      ctx.beginPath(); ctx.arc(w.x,w.y-4,w.r,0,Math.PI*2); ctx.fill(); ctx.stroke()
      const eyeY=w.y-4-w.r*0.1, eyeX=w.r*0.3
      ctx.fillStyle=w.recognized?(w.unrecognized?'#ff3366':'#00ff88'):'rgba(74,85,120,0.6)'
      ctx.beginPath(); ctx.arc(w.x-eyeX,eyeY,2.5,0,Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.arc(w.x+eyeX,eyeY,2.5,0,Math.PI*2); ctx.fill()
      if(w.recognized){
        ctx.globalAlpha=1; ctx.fillStyle=w.unrecognized?'#ff3366':'#00ff88'
        ctx.font='9px DM Mono'; ctx.textAlign='center'
        ctx.fillText(w.unrecognized?'⚠ UNKNOWN':w.id,w.x,w.y+w.r+14)
      }
      if(w.ringAlpha>0.01){
        ctx.globalAlpha=w.ringAlpha; ctx.strokeStyle=w.unrecognized?'#ff3366':'#00d4ff'; ctx.lineWidth=1.5
        ctx.beginPath(); ctx.arc(w.x,w.y-4,w.r*w.ringScale,0,Math.PI*2); ctx.stroke()
        w.ringAlpha-=0.02; w.ringScale+=0.04
      }
      ctx.globalAlpha=1; ctx.textAlign='left'
    }
    let animId:number
    const tick=()=>{
      ctx.clearRect(0,0,W,H)
      ctx.strokeStyle='rgba(28,34,56,0.4)'; ctx.lineWidth=0.5
      for(let gx=0;gx<W;gx+=48){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke()}
      for(let gy=0;gy<H;gy+=48){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke()}
      scanY+=1.2
      if(scanY>H+20){scanY=-20;workers.forEach(w=>{w.recognized=false;w.ringAlpha=0;w.ringScale=1})}
      workers.forEach(w=>{if(!w.recognized&&scanY>w.y){w.recognized=true;w.ringAlpha=1;w.ringScale=1}})
      workers.forEach(w=>drawFace(w))
      const grad=ctx.createLinearGradient(0,scanY-16,0,scanY+4)
      grad.addColorStop(0,'transparent'); grad.addColorStop(1,'rgba(168,85,247,0.6)')
      ctx.fillStyle=grad; ctx.fillRect(0,scanY-16,W,20)
      ctx.fillStyle='rgba(168,85,247,0.9)'; ctx.fillRect(0,scanY,W,1.5)
      ctx.fillStyle='rgba(168,85,247,0.7)'; ctx.font='9px DM Mono'; ctx.fillText('FACE RECOGNITION SCAN',12,18)
      const matched=workers.filter(w=>w.recognized&&!w.unrecognized).length
      ctx.fillStyle='rgba(0,255,136,0.7)'; ctx.fillText(`MATCHED: ${matched}/${workers.length}`,W-100,18)
      animId=requestAnimationFrame(tick)
    }
    tick()
    return ()=>cancelAnimationFrame(animId)
  }, [])

  return (
    <section style={{ padding: '100px 48px', background: 'linear-gradient(180deg, var(--bg-base), var(--bg-surface), var(--bg-base))' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="face-showcase-grid">
        {/* Text first on desktop */}
        <div>
          <div className="section-label" style={{ color: 'var(--c2-bright)', borderLeftColor: 'var(--c2-30)' }}>FACE ATTENDANCE SYSTEM</div>
          <h2 className="section-h2" style={{ marginBottom: 16 }}>
            Every Worker.<br /><span className="text-gradient-cv">Automatically Accounted For.</span>
          </h2>
          <p style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>Zero-touch attendance powered by face recognition. Workers enrolled in under 30 seconds, every clock-in recorded with proof frame, confidence score, and timestamp.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column' as const }}>
            {['Face enrollment in under 30 seconds per worker','Clock-in confidence scoring with proof frame storage','False detection flagging and manual override','Daily attendance heatmap with calendar drill-down','Clock-in/out timestamps with camera and location metadata'].map(f=>(
              <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--t2)', padding: '8px 0', borderBottom: '1px solid var(--border-dim)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c2-bright)', flexShrink: 0, marginTop: 7 }} />{f}
              </li>
            ))}
          </ul>
          {/* Proof mockup */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--t3)', marginBottom: 12, letterSpacing: '0.1em' }}>ATTENDANCE VERIFICATION</div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              {[['REFERENCE PHOTO','linear-gradient(135deg,var(--c2),var(--cyan))'],['DETECTED FRAME','linear-gradient(135deg,var(--cyan),var(--c3))']].map(([l,g])=>(
                <div key={l} style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--t4)', marginBottom: 6 }}>{l}</div>
                  <div style={{ height: 48, borderRadius: 8, background: g }} />
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c3)', marginBottom: 6 }}>CONFIDENCE: 91.4%</div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: 8 }}>
              <div style={{ width: '91%', height: '100%', background: 'var(--c3)', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--t4)' }}>
              <span>WORKER: W-0042</span><span>TIME: 06:47:23 UTC</span><span>CAM: GATE-01</span>
            </div>
          </div>
        </div>
        {/* Canvas */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', aspectRatio: '1', position: 'relative' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
      <style>{`@media(max-width:1024px){.face-showcase-grid{grid-template-columns:1fr!important;gap:40px!important}}`}</style>
    </section>
  )
}
