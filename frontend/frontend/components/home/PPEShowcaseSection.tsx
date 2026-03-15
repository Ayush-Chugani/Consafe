'use client'
import { useEffect, useRef } from 'react'

export default function PPEShowcaseSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const wrapper = canvasEl.parentElement!
    canvasEl.width = wrapper.offsetWidth
    canvasEl.height = wrapper.offsetHeight
    const ctx = canvasEl.getContext('2d')!
    const W = canvasEl.width, H = canvasEl.height
    const cx = W/2

    const keypoints = [
      { name:'head',   x:0.5, y:0.15, w:0.14, h:0.12 },
      { name:'torso',  x:0.5, y:0.38, w:0.28, h:0.30 },
      { name:'hand_l', x:0.28,y:0.50, w:0.12, h:0.10 },
      { name:'hand_r', x:0.72,y:0.50, w:0.12, h:0.10 },
      { name:'boot_l', x:0.38,y:0.82, w:0.14, h:0.10 },
      { name:'boot_r', x:0.62,y:0.82, w:0.14, h:0.10 },
    ]
    const boxes = [
      { kp:'head',   label:'Helmet', color:'#00d4ff', conf:0.94 },
      { kp:'torso',  label:'Vest',   color:'#a855f7', conf:0.88 },
      { kp:'hand_l', label:'Gloves', color:'#00ff88', conf:0.76 },
      { kp:'hand_r', label:'Gloves', color:'#00ff88', conf:0.82 },
      { kp:'boot_l', label:'Boots',  color:'#f59e0b', conf:0.91 },
      { kp:'boot_r', label:'Boots',  color:'#f59e0b', conf:0.89 },
    ]

    let scanY=0, phaseT=0, phase='scanning'
    const boxProgress=new Array(boxes.length).fill(0)
    const boxVisible=new Array(boxes.length).fill(false)

    const drawWorker=()=>{
      ctx.strokeStyle='rgba(136,150,179,0.4)'; ctx.lineWidth=2
      ctx.beginPath(); ctx.arc(cx,H*0.15,W*0.07,0,Math.PI*2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx,H*0.21); ctx.lineTo(cx,H*0.55); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx,H*0.28); ctx.lineTo(cx-W*0.18,H*0.48); ctx.moveTo(cx,H*0.28); ctx.lineTo(cx+W*0.18,H*0.48); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx,H*0.55); ctx.lineTo(cx-W*0.1,H*0.8); ctx.moveTo(cx,H*0.55); ctx.lineTo(cx+W*0.1,H*0.8); ctx.stroke()
    }
    const drawBox=(kp: typeof keypoints[0], color: string, progress: number, label: string, conf: number)=>{
      const x=kp.x*W,y=kp.y*H,w=kp.w*W,h=kp.h*H
      const l=x-w/2,t=y-h/2,edge=Math.min(w,h)*0.3
      ctx.strokeStyle=color; ctx.lineWidth=1.5; ctx.globalAlpha=progress
      ctx.beginPath()
      ctx.moveTo(l,t+edge); ctx.lineTo(l,t); ctx.lineTo(l+edge,t)
      ctx.moveTo(l+w-edge,t); ctx.lineTo(l+w,t); ctx.lineTo(l+w,t+edge)
      ctx.moveTo(l+w,t+h-edge); ctx.lineTo(l+w,t+h); ctx.lineTo(l+w-edge,t+h)
      ctx.moveTo(l+edge,t+h); ctx.lineTo(l,t+h); ctx.lineTo(l,t+h-edge)
      ctx.stroke()
      ctx.fillStyle=color; ctx.font="500 10px 'DM Mono', monospace"
      ctx.fillText(`${label} ${(conf*100).toFixed(0)}%`,l,t-4)
      ctx.globalAlpha=1
    }

    let animId: number
    const tick=()=>{
      ctx.clearRect(0,0,W,H)
      ctx.strokeStyle='rgba(28,34,56,0.5)'; ctx.lineWidth=0.5
      for(let gx=0;gx<W;gx+=40){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke()}
      for(let gy=0;gy<H;gy+=40){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke()}
      drawWorker(); phaseT++
      if(phase==='scanning'){
        scanY=(phaseT/80)*H
        const grad=ctx.createLinearGradient(0,scanY-20,0,scanY+4)
        grad.addColorStop(0,'transparent'); grad.addColorStop(1,'rgba(0,212,255,0.8)')
        ctx.fillStyle=grad; ctx.fillRect(0,scanY-20,W,24)
        ctx.fillStyle='#00d4ff'; ctx.fillRect(0,scanY,W,1.5)
        boxes.forEach((b,i)=>{
          const kp=keypoints.find(k=>k.name===b.kp)!
          if(kp.y*H<scanY){boxVisible[i]=true;boxProgress[i]=Math.min(1,boxProgress[i]+0.06)}
        })
        boxes.forEach((b,i)=>{if(boxVisible[i]){drawBox(keypoints.find(k=>k.name===b.kp)!,b.color,boxProgress[i],b.label,b.conf)}})
        if(phaseT>=80){phase='showing';phaseT=0}
      } else if(phase==='showing'){
        boxes.forEach((b,i)=>{drawBox(keypoints.find(k=>k.name===b.kp)!,b.color,1,b.label,b.conf)})
        if(phaseT>=80){phase='clearing';phaseT=0}
      } else {
        const fade=1-phaseT/30
        boxes.forEach((b,i)=>{drawBox(keypoints.find(k=>k.name===b.kp)!,b.color,Math.max(0,fade),b.label,b.conf)})
        if(phaseT>=30){phase='scanning';phaseT=0;scanY=0;boxProgress.fill(0);boxVisible.fill(false)}
      }
      ctx.fillStyle='rgba(0,212,255,0.6)'; ctx.font='9px DM Mono'
      ctx.fillText('LIVE DETECTION',12,20)
      ctx.fillStyle='rgba(136,150,179,0.5)'; ctx.fillText(`FRAME 0${phaseT+100}`,W-80,20)
      animId=requestAnimationFrame(tick)
    }
    tick()
    return ()=>cancelAnimationFrame(animId)
  }, [])

  return (
    <section id="ppe-showcase" style={{ padding: '100px 48px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="showcase-grid">
        {/* Canvas */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', aspectRatio: '1', position: 'relative' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Text */}
        <div>
          <div className="section-label">PPE DETECTION ENGINE</div>
          <h2 className="section-h2" style={{ marginBottom: 16 }}>
            See Every Worker.<br /><span className="text-gradient-hero">Miss Nothing.</span>
          </h2>
          <p style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>Our computer vision pipeline processes video frame by frame, building a safety profile for each worker tracked in the scene.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column' as const, gap: 0 }}>
            {['12 PPE object classes supported','Configurable confidence (0.05–0.95) and IoU thresholds','Per-worker tracking across frames with stable IDs','Bounding boxes + center points + labels in output video','SSE frame streaming at up to 30fps preview rate'].map(f=>(
              <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--t2)', padding: '8px 0', borderBottom: '1px solid var(--border-dim)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0, marginTop: 7 }} />{f}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            {[['12','Classes'],['99.2%','Accuracy'],['<200ms','Per Frame']].map(([n,l])=>(
              <div key={l}>
                <div className="text-gradient-hero" style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700 }}>{n}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--t3)' }}>{l}</div>
              </div>
            ))}
          </div>
          <a href="#cta-section" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--cyan)', textDecoration: 'none' }}
            onMouseEnter={e=>(e.currentTarget.style.textDecoration='underline')}
            onMouseLeave={e=>(e.currentTarget.style.textDecoration='none')}>
            See Detection Demo →
          </a>
        </div>
      </div>
      <style>{`@media(max-width:1024px){.showcase-grid{grid-template-columns:1fr!important;gap:40px!important}}`}</style>
    </section>
  )
}
