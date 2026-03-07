import { useState, useEffect, useRef } from "react";



// ── Bell sound (Web Audio API) ────────────────────────────────────────────────
function playBell() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);
    [523.25, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.995, ctx.currentTime + 2.8);
      osc.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.8);
    });
  } catch(e) {}
}


function ForestBG() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:0,
      background:"linear-gradient(160deg,#010c05 0%,#021a09 40%,#031e0c 70%,#010c05 100%)"}}/>
  );
}

const SK = { sess:"cc_sess", memo:"cc_memo", att:"cc_att", ath:"cc_ath", dftEm:"cc_dft_em", dftRe:"cc_dft_re" };
function ld(k,fb){ try{ return JSON.parse(localStorage.getItem(k))??fb; }catch{ return fb; } }
function sv(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} }

const CATS = [
  {id:"fight",    label:"喧嘩直後",            icon:"⚡"},
  {id:"coldwar",  label:"冷戦・距離がある",      icon:"🧊"},
  {id:"anxiety",  label:"不安（連絡/既読）",     icon:"📱"},
  {id:"selfblame",label:"自己否定（私が悪い？）", icon:"💭"},
  {id:"repeat",   label:"同じパターンの繰り返し", icon:"🔄"},
  {id:"breakup",  label:"別れ/関係の終わり",     icon:"🍂"},
];
const URGES   = ["今すぐ返信する","長文を送る","追及する","謝り倒す","ブロック/ミュート","SNSを見る/監視する","別れを切り出す","その他"];
const REGS    = [{id:"breath",label:"呼吸（1分）",icon:"🫁"},{id:"feet",label:"足裏に注意",icon:"🦶"},{id:"cold",label:"冷水（手/顔）",icon:"💧"},{id:"water",label:"水を飲む",icon:"🥤"},{id:"shoulder",label:"肩の力を抜く",icon:"💆"}];
const TRIGS   = ["連絡が遅い/既読無視","言い方がきつい","約束が変わった","嘘・隠し事っぽい","束縛・干渉","距離を置かれた","お金・負担","家事・役割","価値観・将来"];
const MQ1     = ["嫌われた","大切にされてない","もう終わりかも","私が悪い","わからない"];
const MQ2     = ["起きた事実","自分の受け取り方","未来の予想"];
const MQ3     = ["それは普通に傷ついていいよ","まだ何もしなくていいと思う","もう少し情報を待ってみたら","相手も今いっぱいいっぱいかも","気持ちを聞かせてって言うかも","その他"];
const MQ4     = ["安心したい","大切にされたい","尊重されたい","自分を守りたい","コントロール感","わからない"];
const MQ6     = ["まだ情報が足りない","相手が忙しい/疲れている","自分が疲れて過敏","タイミングが悪い","何か別の理由がある","わからない"];
const COMMITS = ["今日は連絡を急がない","送るなら短文だけ","明日もう一回見直す","散歩/入浴/睡眠優先","境界線を言語化する","その他"];
const ATT_QS  = [
  "返信が遅いと不安が強くなる","距離を置かれると追いかけたくなる","相手が近づくと息苦しくなる",
  "本音を言うのが怖い","相手の気持ちを確かめたくて落ち着かない","問題が起きると一人になりたくなる",
  "嫌われるのが怖くて我慢しがち","親密になると急に冷めたくなる",
];

const TH = {
  panelBg:"rgba(4,20,8,0.88)", blur:"blur(22px)",
  text:"#dff0e2", sub:"rgba(215,238,220,0.85)", muted:"rgba(180,220,188,0.50)",
  border:"rgba(65,195,85,0.16)",
  card:"rgba(5,22,9,0.75)", cardB:"rgba(65,195,85,0.14)",
  sel:"rgba(65,175,85,0.28)", selB:"rgba(65,175,85,0.80)",
  inp:"rgba(255,255,255,0.08)",
};

function getTypeInfo(r) {
  const a=r.anxious,v=r.avoidant;
  if(a>65)return{label:"不安型",color:"#f08070",short:"anxious"};
  if(v>65)return{label:"回避型",color:"#70b8f0",short:"avoidant"};
  if(a>45||v>45)return{label:"混合型",color:"#e8c060",short:"mixed"};
  return{label:"安定型",color:"#60cc80",short:"secure"};
}

function Radar({ result, size=250 }) {
  const cx=size/2,cy=size/2,R=86,N=5,off=-Math.PI/2;
  const stable=Math.max(5,100-Math.max(result.anxious,result.avoidant));
  const trust=Math.max(5,Math.round(100-result.anxious*0.55-result.avoidant*0.38));
  const indep=Math.max(5,Math.min(100,Math.round(60-result.anxious*0.5+result.avoidant*0.25)));
  const axes=[
    {label:"不安傾向",val:result.anxious,c:"#f08070"},
    {label:"安定性",val:stable,c:"#60cc80"},
    {label:"回避傾向",val:result.avoidant,c:"#70b8f0"},
    {label:"自立",val:indep,c:"#e8c060"},
    {label:"信頼",val:trust,c:"#c880f0"},
  ];
  const pt=(i,r)=>({x:cx+r*Math.cos(i*2*Math.PI/N+off),y:cy+r*Math.sin(i*2*Math.PI/N+off)});
  const dpts=axes.map((a,i)=>pt(i,(a.val/100)*R));
  const poly=dpts.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+" Z";
  const lpts=axes.map((a,i)=>{const r=R+28,ang=i*2*Math.PI/N+off;return{x:cx+r*Math.cos(ang),y:cy+r*Math.sin(ang),...a};});
  const ti=getTypeInfo(result);
  return (
    <div style={{textAlign:"center"}}>
      <svg width={size} height={size} style={{overflow:"visible"}}>
        {[25,50,75,100].map(p=>{const r=(p/100)*R;const pts=Array.from({length:N},(_,i)=>pt(i,r));const d=pts.map((q,i)=>(i===0?"M":"L")+q.x.toFixed(1)+","+q.y.toFixed(1)).join(" ")+" Z";return <path key={p} d={d} fill="none" stroke={p===100?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.08)"} strokeWidth={p===100?1.5:1}/>;} )}
        {axes.map((_,i)=>{const e=pt(i,R);return <line key={i} x1={cx} y1={cy} x2={e.x.toFixed(1)} y2={e.y.toFixed(1)} stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>;} )}
        {axes.map((a,i)=>{const ni=(i+1)%N,p1=dpts[i],p2=dpts[ni];return <path key={i} d={"M"+cx+","+cy+" L"+p1.x.toFixed(1)+","+p1.y.toFixed(1)+" L"+p2.x.toFixed(1)+","+p2.y.toFixed(1)+" Z"} fill={a.c} opacity="0.13"/>;} )}
        <path d={poly} fill="rgba(80,220,110,0.11)"/>
        <path d={poly} fill="none" stroke="rgba(90,230,120,0.78)" strokeWidth="2.5"/>
        {dpts.map((p,i)=>(<g key={i}><circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="9" fill={axes[i].c} opacity="0.18"/><circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="5" fill={axes[i].c} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/></g>))}
        {lpts.map((p,i)=>(<g key={i}><text x={p.x.toFixed(1)} y={(p.y-7).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill={p.c} fontWeight="700">{p.label}</text><text x={p.x.toFixed(1)} y={(p.y+8).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="rgba(255,255,255,0.85)" fontWeight="600">{p.val}%</text></g>))}
        <text x={cx} y={cy-5} textAnchor="middle" fontSize="15" fontWeight="800" fill={ti.color}>{ti.label}</text>
      </svg>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"5px 12px",marginTop:4}}>
        {axes.map(a=>(<div key={a.label} style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:6,height:6,borderRadius:"50%",background:a.c}}/><span style={{fontSize:9,color:"rgba(255,255,255,0.48)"}}>{a.label}</span></div>))}
      </div>
    </div>
  );
}

function Panel({ children, style }) {
  return (
    <div style={{background:TH.panelBg,backdropFilter:TH.blur,WebkitBackdropFilter:TH.blur,
      borderRadius:20,border:"1px solid "+TH.border,padding:"20px 16px",...style}}>
      {children}
    </div>
  );
}
function Card({ children, selected, onClick, style }) {
  return (
    <div onClick={onClick} style={{
      padding:"12px 15px",borderRadius:12,cursor:onClick?"pointer":"default",
      border:"1.5px solid "+(selected?TH.selB:TH.cardB),background:selected?TH.sel:TH.card,
      backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
      transition:"all 0.15s",marginBottom:7,userSelect:"none",
      transform:selected?"scale(1.01)":"scale(1)",...style}}>
      {children}
    </div>
  );
}
function Btn({ children, onClick, variant="green", disabled, style }) {
  const vs={
    green:{background:"linear-gradient(135deg,#4a9e5a,#2e7a3e)",color:"#fff"},
    red:{background:"linear-gradient(135deg,#c97b84,#a85a65)",color:"#fff"},
    amber:{background:"linear-gradient(135deg,#c89a40,#a07020)",color:"#fff"},
    ghost:{background:"transparent",color:"rgba(180,220,188,0.60)",border:"none"},
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding:"12px 20px",borderRadius:11,fontSize:13,fontWeight:600,
      cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.45:1,
      transition:"all 0.18s",fontFamily:"inherit",border:"none",...vs[variant],...style}}>
      {children}
    </button>
  );
}
function Slider({ label, value, onChange, accent="#60cc80" }) {
  return (
    <div style={{marginBottom:16}}>
      {label&&<div style={{fontSize:11,color:TH.muted,marginBottom:6}}>{label}</div>}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <input type="range" min={0} max={10} step={1} value={value}
          onChange={e=>onChange(Number(e.target.value))} style={{flex:1,accentColor:accent,height:4}}/>
        <div style={{minWidth:40,height:40,borderRadius:9,background:"rgba(70,180,90,0.14)",
          border:"1px solid rgba(70,180,90,0.28)",display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:16,fontWeight:700,color:accent}}>{value}</div>
      </div>
    </div>
  );
}
function TimerWidget({ seconds, onComplete, label }) {
  const [left,setLeft]=useState(seconds);
  const [run,setRun]=useState(false);
  const [done,setDone]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    if(run&&left>0){ref.current=setInterval(()=>{setLeft(p=>{if(p<=1){clearInterval(ref.current);setRun(false);setDone(true);playBell();if(onComplete)onComplete();return 0;}return p-1;});},1000);}
    return()=>clearInterval(ref.current);
  },[run,left]);
  const r=50,circ=2*Math.PI*r,pct=((seconds-left)/seconds)*100;
  const mm=Math.floor(left/60),ss=left%60;
  return (
    <div style={{textAlign:"center",padding:"16px 0"}}>
      {label&&<div style={{fontSize:10,color:"rgba(180,220,188,0.45)",marginBottom:10,letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</div>}
      <div style={{position:"relative",display:"inline-block"}}>
        <svg width={116} height={116} style={{transform:"rotate(-90deg)"}}>
          <circle cx={58} cy={58} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6}/>
          <circle cx={58} cy={58} r={r} fill="none" stroke={done?"#60cc80":"#4a9e5a"} strokeWidth={6}
            strokeDasharray={circ} strokeDashoffset={circ-circ*pct/100}
            strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:22,fontWeight:700,color:done?"#60cc80":"#dff0e2"}}>
            {done?"✓":mm+":"+(ss<10?"0":"")+ss}
          </span>
        </div>
      </div>
      <div style={{marginTop:14,display:"flex",gap:10,justifyContent:"center"}}>
        {!done&&<Btn variant="green" onClick={()=>setRun(x=>!x)} style={{minWidth:90}}>{run?"一時停止":"開始"}</Btn>}
        {!done&&<Btn variant="ghost" onClick={()=>{setLeft(seconds);setRun(false);}}>リセット</Btn>}
        {done&&<div style={{color:"#60cc80",fontWeight:600}}>完了!</div>}
      </div>
    </div>
  );
}
function ScoreBar({ label, before, after }) {
  const d=after-before;
  const diffColor=d<0?"#7ec8f0":d>0?"#f08070":"#a0d8b0";
  return (
    <div style={{marginBottom:11}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:11,color:"#a0d8b0"}}>{label}</span>
        <span style={{fontSize:11,fontWeight:600,color:"#a0d8b0"}}>
          {before}→{after}{d!==0&&<span style={{color:diffColor}}> ({d>0?"+":""}{d})</span>}
        </span>
      </div>
      <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
        <div style={{height:"100%",width:(after*10)+"%",background:d<0?"#7ec8f0":d>0?"#f08070":"#60cc80",borderRadius:2,transition:"width 0.6s"}}/>
      </div>
    </div>
  );
}

function SessBar({ onSaveExit, onHome }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <button onClick={onHome} style={{
        background:"rgba(5,20,8,0.82)",backdropFilter:"blur(10px)",
        color:TH.sub,border:"1px solid "+TH.border,borderRadius:9,
        padding:"6px 13px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
        🏠 ホーム
      </button>
      <button onClick={onSaveExit} style={{
        background:"rgba(60,100,65,0.52)",backdropFilter:"blur(10px)",
        color:"#a0e8b0",border:"1px solid rgba(70,180,90,0.38)",borderRadius:9,
        padding:"6px 13px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
        💾 中断して保存
      </button>
    </div>
  );
}

function TabBar({ active, onTab }) {
  const tabs=[{id:"home",icon:"🏠",label:"ホーム"},{id:"attachment",icon:"💞",label:"愛着"},{id:"log",icon:"📋",label:"ログ"},{id:"memo",icon:"📝",label:"日記"}];
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,
      background:"rgba(2,12,4,0.96)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
      borderTop:"1px solid "+TH.border,display:"flex",justifyContent:"space-around",
      alignItems:"center",paddingBottom:"env(safe-area-inset-bottom,6px)",paddingTop:7}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onTab(t.id)} style={{display:"flex",flexDirection:"column",
          alignItems:"center",gap:2,background:"transparent",border:"none",cursor:"pointer",padding:"2px 8px"}}>
          <span style={{fontSize:18}}>{t.icon}</span>
          <span style={{fontSize:9,fontWeight:active===t.id?700:400,color:active===t.id?"#60cc80":TH.muted}}>{t.label}</span>
          {active===t.id&&<div style={{width:14,height:2,borderRadius:1,background:"#60cc80"}}/>}
        </button>
      ))}
    </div>
  );
}

function DraftCard({ draft, onResume, onDiscard, modeColor, icon, label }) {
  if (!draft) return null;
  const cat=CATS.find(c=>c.id===draft.situationCategory);
  const time=new Date(draft.savedAt).toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"});
  return (
    <div style={{marginBottom:12,padding:"14px 16px",
      background:`rgba(${modeColor},0.16)`,backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",
      borderRadius:14,border:`1px solid rgba(${modeColor},0.38)`}}>
      <div style={{fontSize:10,color:`rgba(${modeColor},1)`,fontWeight:700,marginBottom:3}}>
        {icon} {label} — 途中のセッション
      </div>
      <div style={{fontSize:11,color:`rgba(${modeColor},0.72)`,marginBottom:11}}>
        {cat?.label||"未選択"} · ステップ {(draft.step||0)+1} · {time} に中断
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onResume} style={{
          flex:1,padding:"9px 12px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",
          background:`rgba(${modeColor},0.55)`,color:"#fff",border:"none",fontFamily:"inherit"}}>
          ▶ 再開する
        </button>
        <button onClick={onDiscard} style={{
          padding:"9px 14px",borderRadius:9,fontSize:11,fontWeight:600,cursor:"pointer",
          background:"transparent",color:`rgba(${modeColor},0.55)`,
          border:`1px solid rgba(${modeColor},0.28)`,fontFamily:"inherit"}}>
          破棄
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ onStart, onResume, onDiscard, sessions, draftEm, draftRe, attResult }) {
  const last=sessions[sessions.length-1];
  const ti=attResult?getTypeInfo(attResult):null;
  return (
    <div>
      <div style={{textAlign:"center",paddingTop:20,paddingBottom:22}}>
        <div style={{fontSize:9,letterSpacing:"0.28em",color:"rgba(136,220,150,0.80)",textTransform:"uppercase",marginBottom:7}}>couple calm</div>
        <div style={{fontSize:22,fontWeight:700,color:"#dff0e2",lineHeight:1.45,maxWidth:280,margin:"0 auto"}}>
          大切な人と<br/><span style={{color:"#7de89a"}}>"最悪の結末"</span>を<br/>迎える前に
        </div>
        <div style={{fontSize:10,color:TH.muted,marginTop:8}}>まず、どっちを選ぶ？</div>
      </div>
      <DraftCard draft={draftEm} icon="🚨" label="緊急モード" modeColor="200,100,90" onResume={()=>onResume("em")} onDiscard={()=>onDiscard("em")}/>
      <DraftCard draft={draftRe} icon="🌿" label="通常モード" modeColor="80,185,105" onResume={()=>onResume("re")} onDiscard={()=>onDiscard("re")}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:16}}>
        <div onClick={()=>onStart("em")} style={{background:"linear-gradient(148deg,rgba(175,46,58,0.42),rgba(136,26,42,0.32))",border:"1.5px solid rgba(196,70,84,0.46)",borderRadius:18,padding:"18px 10px 14px",cursor:"pointer",textAlign:"center",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"}}>
          <div style={{fontSize:36,marginBottom:6}}>🚨</div>
          <div style={{fontSize:12,fontWeight:700,color:"#ffb0b8",marginBottom:4}}>緊急モード</div>
          <div style={{fontSize:10,color:"rgba(255,162,170,0.65)",lineHeight:1.5}}>今すぐ爆発しそう<br/>衝動を止めたい時</div>
          <div style={{fontSize:9,color:"rgba(255,140,150,0.45)",marginTop:4}}>5〜7分</div>
        </div>
        <div onClick={()=>onStart("re")} style={{background:"linear-gradient(148deg,rgba(20,80,34,0.42),rgba(14,60,24,0.32))",border:"1.5px solid rgba(50,140,66,0.46)",borderRadius:18,padding:"18px 10px 14px",cursor:"pointer",textAlign:"center",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"}}>
          <div style={{fontSize:36,marginBottom:6}}>🌿</div>
          <div style={{fontSize:12,fontWeight:700,color:"#a0e8b0",marginBottom:4}}>通常モード</div>
          <div style={{fontSize:10,color:"rgba(136,216,156,0.65)",lineHeight:1.5}}>少し落ち着いてる<br/>じっくり整理したい時</div>
          <div style={{fontSize:9,color:"rgba(116,196,136,0.45)",marginTop:4}}>15〜25分</div>
        </div>
      </div>
      {last&&last.after&&(
        <Panel style={{marginBottom:11}}>
          <div style={{fontSize:9,color:TH.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>前回のセッション</div>
          <div style={{display:"flex",gap:16}}>
            {[["感情",last.before.emotionIntensity0_10,last.after.emotionIntensity0_10],
              ["衝動",last.before.urgeIntensity0_10,last.after.urgeIntensity0_10]].map(([l,b,a])=>(
              <div key={l} style={{fontSize:11,color:TH.sub}}>
                {l}: <span style={{color:"#f08070"}}>{b}</span>→<span style={{color:a<b?"#60cc80":"#f08070"}}>{a}</span>
              </div>
            ))}
          </div>
          <div style={{fontSize:9,color:TH.muted,marginTop:3}}>
            {new Date(last.createdAt).toLocaleDateString("ja-JP",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
          </div>
        </Panel>
      )}
      {ti&&(
        <Panel style={{marginBottom:11}}>
          <div style={{fontSize:9,color:TH.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>愛着スタイル（最新）</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{padding:"3px 12px",borderRadius:11,background:ti.color+"18",border:"1.5px solid "+ti.color+"50",color:ti.color,fontSize:11,fontWeight:700}}>{ti.label}</div>
            <div style={{fontSize:10,color:TH.muted}}>不安 {attResult.anxious}% · 回避 {attResult.avoidant}%</div>
          </div>
        </Panel>
      )}
    </div>
  );
}

function AttDiag({ onDone, onHome }) {
  const [answers,setAnswers]=useState(Array(8).fill(1));
  const [step,setStep]=useState(0);
  const [result,setResult]=useState(null);
  function calcResult(ans){
    const aq=[0,1,4,6],vq=[2,3,5,7];
    return{anxious:Math.round((aq.reduce((s,i)=>s+ans[i],0)/(aq.length*3))*100),avoidant:Math.round((vq.reduce((s,i)=>s+ans[i],0)/(vq.length*3))*100),date:new Date().toISOString()};
  }
  if(step===8){
    if(!result) return null;
    const ti=getTypeInfo(result);
    const infoMap={
      anxious:{desc:"繋がりを強く求め、相手の反応にとても敏感なタイプ。置き去りにされる恐怖を感じやすい傾向があります。",tips:["感情日記をつけて自分を観察する","「今ここ」にフォーカスする練習","落ち着かせるルーティンを作る"]},
      avoidant:{desc:"親密になることへの不安から、距離を取りやすいタイプ。感情を抑制して一人の安全を守ろうとします。",tips:["感情に名前をつける練習","小さな自己開示から始める","安全な関係の場を作る"]},
      mixed:{desc:"近づきたいけど傷つきたくない、という葛藤を抱えやすいタイプ。状況によって反応が変わります。",tips:["自分のパターンをノートで観察する","安全な関係の経験を積む","信頼できるサポーターを見つける"]},
      secure:{desc:"比較的バランスの取れた愛着スタイル。関係の中で安心感を持ちやすく、適度な距離感を保てます。",tips:["このバランスを意識して維持する","パートナーの愛着ニーズを理解する","定期的な自己チェックを続ける"]},
    };
    const info=infoMap[ti.short];
    return(
      <Panel>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>診断結果</span>
          <button onClick={onHome} style={{background:"rgba(5,20,8,0.80)",color:TH.sub,border:"1px solid "+TH.border,borderRadius:9,padding:"5px 12px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🏠 ホーム</button>
        </div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><Radar result={result} size={240}/></div>
        <div style={{textAlign:"center",marginBottom:14}}>
          <div style={{display:"inline-block",padding:"5px 18px",borderRadius:16,background:ti.color+"22",border:"1.5px solid "+ti.color+"66",color:ti.color,fontSize:13,fontWeight:800,marginBottom:7}}>{ti.label}</div>
          <div style={{fontSize:12,color:TH.sub,lineHeight:1.75}}>{info.desc}</div>
        </div>
        <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.05)",borderRadius:12,marginBottom:16}}>
          <div style={{fontSize:9,color:TH.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>おすすめの取り組み</div>
          {info.tips.map((t,i)=>(<div key={i} style={{fontSize:12,color:TH.sub,marginBottom:5,display:"flex",gap:7}}><span style={{color:ti.color}}>·</span>{t}</div>))}
        </div>
        <Btn variant="green" style={{width:"100%"}} onClick={()=>onDone(result)}>保存してホームへ</Btn>
      </Panel>
    );
  }
  return(
    <Panel>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>愛着診断 {step+1}/8</span>
        <button onClick={onHome} style={{background:"rgba(5,20,8,0.80)",color:TH.sub,border:"1px solid "+TH.border,borderRadius:9,padding:"5px 12px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🏠 ホーム</button>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:22}}>
        {Array.from({length:8}).map((_,i)=>(<div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?"#60cc80":"rgba(255,255,255,0.10)",transition:"background 0.3s"}}/>))}
      </div>
      <div style={{fontSize:16,color:TH.text,lineHeight:1.65,marginBottom:24,minHeight:48}}>{ATT_QS[step]}</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {[["0 — 全然ない",0],["1 — 少しある",1],["2 — かなりある",2],["3 — とてもある",3]].map(([l,val])=>(
          <Card key={val} selected={answers[step]===val} onClick={()=>{const n=[...answers];n[step]=val;setAnswers(n);}}>
            <span style={{color:TH.sub,fontSize:13}}>{l}</span>
          </Card>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginTop:18}}>
        {step>0&&<Btn variant="ghost" onClick={()=>setStep(s=>s-1)}>← 戻る</Btn>}
        <Btn variant="green" style={{flex:1}} onClick={()=>{if(step===7){setResult(calcResult(answers));setStep(8);}else setStep(s=>s+1);}}>{step===7?"結果を見る →":"次へ →"}</Btn>
      </div>
    </Panel>
  );
}

function AttTab({ history, onNew }) {
  if(history.length===0) return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontSize:16,fontWeight:700,color:TH.text}}>愛着スタイル</span>
        <Btn variant="green" onClick={onNew} style={{fontSize:10,padding:"7px 13px"}}>+ 診断する</Btn>
      </div>
      <Panel style={{textAlign:"center",padding:"40px 18px"}}>
        <div style={{fontSize:40,marginBottom:12}}>💞</div>
        <div style={{fontSize:13,fontWeight:600,color:TH.text,marginBottom:6}}>まだ診断していません</div>
        <div style={{fontSize:11,color:TH.muted,lineHeight:1.7,marginBottom:20}}>愛着スタイルを知ることで<br/>自分の感情パターンが見えてきます</div>
        <Btn variant="green" onClick={onNew}>診断する（2分）</Btn>
      </Panel>
    </div>
  );
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontSize:16,fontWeight:700,color:TH.text}}>愛着スタイル履歴</span>
        <Btn variant="green" onClick={onNew} style={{fontSize:10,padding:"7px 13px"}}>+ 再診断</Btn>
      </div>
      {[...history].reverse().map((h,i)=>{
        const ti=getTypeInfo(h);
        return(
          <Panel key={i} style={{marginBottom:14,position:"relative"}}>
            {i===0&&<div style={{position:"absolute",top:12,right:12,padding:"2px 8px",borderRadius:7,background:"rgba(96,204,128,0.18)",border:"1px solid rgba(96,204,128,0.36)",fontSize:9,color:"#60cc80",fontWeight:700}}>最新</div>}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:10,color:TH.muted}}>{new Date(h.date).toLocaleDateString("ja-JP",{year:"numeric",month:"long",day:"numeric"})}</span>
              <span style={{padding:"2px 9px",borderRadius:9,background:ti.color+"1a",border:"1px solid "+ti.color+"50",color:ti.color,fontSize:10,fontWeight:700}}>{ti.label}</span>
            </div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Radar result={h} size={i===0?240:200}/></div>
            <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:"1px solid "+TH.border}}>
              {[["不安傾向","#f08070",h.anxious],["回避傾向","#70b8f0",h.avoidant]].map(([lbl,c,val],j)=>(
                <div key={j} style={{flex:1,textAlign:"center",padding:"10px 6px",background:j===0?"rgba(240,128,112,0.07)":"rgba(112,184,240,0.07)",borderRight:j===0?"1px solid "+TH.border:"none"}}>
                  <div style={{fontSize:9,color:TH.muted,marginBottom:2}}>{lbl}</div>
                  <div style={{fontSize:18,fontWeight:700,color:c}}>{val}<span style={{fontSize:10}}>%</span></div>
                </div>
              ))}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

function EmSess({ onDone, onHome, onSaveDraft, initialDraft }) {
  const d=initialDraft||{};
  const [step,setStep]=useState(d.step??0);
  const [sc,setSc]=useState(d.sc??null);
  const [bef,setBef]=useState(d.bef??{e:5,u:5,b:5,t:5});
  const [aft,setAft]=useState(d.aft??{e:5,u:5,b:5,t:5});
  const [ua,setUa]=useState(d.ua??null);
  const [uaOther,setUaOther]=useState(d.uaOther??"");
  const [regs,setRegs]=useState(d.regs??[]);
  const [ugh,setUgh]=useState(d.ugh??null);
  const [memo,setMemo]=useState(d.memo??"");
  const [td,setTd]=useState(false);
  const bb=(k,x)=>setBef(p=>({...p,[k]:x}));
  const ab=(k,x)=>setAft(p=>({...p,[k]:x}));
  const snap=s=>({mode:"emergency",step:s??step,sc,bef,aft,ua,uaOther,regs,ugh,memo,situationCategory:sc,savedAt:new Date().toISOString()});
  const SB=()=><SessBar onHome={()=>{onSaveDraft(snap());onHome();}} onSaveExit={()=>{onSaveDraft(snap());onHome();}}/>;
  const ac="#ff9aa2";
  const pages=[
    <div key="e0">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>状況スキャン</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>今どんな状況？</div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,color:TH.muted,marginBottom:6}}>状況カテゴリー</div>
        {CATS.map(c=>(<Card key={c.id} selected={sc===c.id} onClick={()=>setSc(c.id)}><span style={{color:TH.sub}}>{c.icon} {c.label}</span></Card>))}
      </div>
      <Slider label="感情の強さ" value={bef.e} onChange={x=>bb("e",x)} accent={ac}/>
      <Slider label="衝動の強さ" value={bef.u} onChange={x=>bb("u",x)} accent={ac}/>
      <Slider label="身体の緊張" value={bef.b} onChange={x=>bb("b",x)} accent={ac}/>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,color:TH.muted,marginBottom:6}}>いちばんやりたい行動</div>
        {URGES.map(a=>(<Card key={a} selected={ua===a} onClick={()=>setUa(a)}><span style={{color:TH.sub,fontSize:12}}>{a}</span></Card>))}
        {ua==="その他"&&<input value={uaOther} onChange={e=>setUaOther(e.target.value)}
          placeholder="具体的に書く（任意）"
          style={{width:"100%",background:TH.inp,border:"1px solid "+TH.border,borderRadius:8,
            color:TH.text,padding:"8px 11px",fontSize:12,fontFamily:"inherit",marginTop:4,boxSizing:"border-box"}}/>}
      </div>
      <Btn variant="red" style={{width:"100%"}} onClick={()=>setStep(1)} disabled={!sc}>次へ →</Btn>
    </div>,
    <div key="e1">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>鎮静</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>今できるやつを選んで実行</div>
      {REGS.map(o=>{const sel=regs.includes(o.id);return(<Card key={o.id} selected={sel} onClick={()=>setRegs(r=>sel?r.filter(x=>x!==o.id):[...r,o.id])}><span style={{fontSize:17,marginRight:8}}>{o.icon}</span><span style={{color:TH.sub,fontSize:12}}>{o.label}</span></Card>);})}
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn variant="ghost" onClick={()=>setStep(0)}>← 戻る</Btn>
        <Btn variant="red" style={{flex:1}} onClick={()=>setStep(2)}>次へ →</Btn>
      </div>
    </div>,
    <div key="e2">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>衝動遅延</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:20,lineHeight:1.6}}>
        実行できたかな？<br/>
        <span style={{fontSize:14,color:TH.muted,fontWeight:400}}>次は３分間、スマホも何もかも置いて<br/>何もしない時間を作ろう。</span>
      </div>
      <div style={{padding:"16px",background:"rgba(255,154,162,0.08)",borderRadius:12,marginBottom:20,textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:8}}>📵</div>
        <div style={{fontSize:12,color:"rgba(255,154,162,0.75)",lineHeight:1.7}}>
          このまま画面を伏せて、<br/>ただ呼吸するだけでいい。
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn variant="ghost" onClick={()=>setStep(1)}>← 戻る</Btn>
        <Btn variant="red" style={{flex:1}} onClick={()=>setStep(3)}>タイマーを始める →</Btn>
      </div>
    </div>,
    <div key="e3">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>衝動遅延</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>３分間、ただ置いておく</div>
      <TimerWidget seconds={180} onComplete={()=>setTd(true)} label="3分タイマー"/>
      {td&&(<div style={{marginTop:12}}>
        <div style={{fontSize:12,color:TH.text,marginBottom:8}}>いま、その行動を"今すぐ"やりたい？</div>
        {["はい（でも今は保留）","少し下がった","だいぶ下がった"].map(a=>(<Card key={a} selected={ugh===a} onClick={()=>setUgh(a)}><span style={{color:TH.sub,fontSize:12}}>{a}</span></Card>))}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <Btn variant="ghost" onClick={()=>setStep(2)}>← 戻る</Btn>
          <Btn variant="red" style={{flex:1}} onClick={()=>setStep(4)} disabled={!ugh}>次へ →</Btn>
        </div>
      </div>)}
      {!td&&<Btn variant="ghost" onClick={()=>setStep(2)} style={{marginTop:12}}>← 戻る</Btn>}
    </div>,
    <div key="e4">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>終了スキャン</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>今の状態を確認</div>
      <Slider label="感情の強さ"   value={aft.e} onChange={x=>ab("e",x)} accent={ac}/>
      <Slider label="衝動の強さ"   value={aft.u} onChange={x=>ab("u",x)} accent={ac}/>
      <Slider label="身体の緊張"   value={aft.b} onChange={x=>ab("b",x)} accent={ac}/>
      <Slider label="思考の確信度" value={aft.t} onChange={x=>ab("t",x)} accent={ac}/>
      <div style={{padding:"13px",background:"rgba(200,70,80,0.08)",borderRadius:11,marginBottom:12}}>
        <div style={{fontSize:9,color:"#a0d8b0",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>変化</div>
        <ScoreBar label="感情" before={bef.e} after={aft.e}/>
        <ScoreBar label="衝動" before={bef.u} after={aft.u}/>
        <ScoreBar label="身体緊張" before={bef.b} after={aft.b}/>
      </div>
      <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder="一言メモ（任意）"
        style={{width:"100%",minHeight:52,background:TH.inp,border:"1px solid "+TH.border,borderRadius:9,color:TH.text,padding:"9px 11px",fontSize:12,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",marginBottom:12}}/>
      <div style={{display:"flex",gap:8}}>
        <Btn variant="ghost" onClick={()=>setStep(3)}>← 戻る</Btn>
        <Btn variant="red" style={{flex:1}} onClick={()=>onDone({
          mode:"emergency",situationCategory:sc,
          before:{emotionIntensity0_10:bef.e,urgeIntensity0_10:bef.u,bodyTension0_10:bef.b,thoughtBelievability0_10:bef.t},
          after:{emotionIntensity0_10:aft.e,urgeIntensity0_10:aft.u,bodyTension0_10:aft.b,thoughtBelievability0_10:aft.t},
          memo,createdAt:new Date().toISOString(),endedAt:new Date().toISOString(),
        })}>保存して終了</Btn>
      </div>
    </div>,
  ];
  return(
    <Panel>
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {[0,1,2,3,4].map(i=>(<div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?"#ff9aa2":"rgba(255,255,255,0.10)",transition:"background 0.3s"}}/>))}
      </div>
      {pages[step]}
    </Panel>
  );
}

function ReSess({ onDone, onHome, onSaveDraft, initialDraft }) {
  const d=initialDraft||{};
  const [step,setStep]=useState(d.step??0);
  const [sc,setSc]=useState(d.sc??null);
  const [tt,setTt]=useState(d.tt??[]);
  const [bef,setBef]=useState(d.bef??{e:5,u:5,b:5,t:5});
  const [aft,setAft]=useState(d.aft??{e:5,u:5,b:5,t:5});
  const [stress,setStress]=useState(d.stress??5);
  const [amode,setAmode]=useState(d.amode??null);
  const [exAft,setExAft]=useState(d.exAft??5);
  const [mq,setMq]=useState(d.mq??{q1:null,q2:null,q3:null,q4:null,q5:30,q6:null});
  const [commit,setCommit]=useState(d.commit??null);
  const [commitOther,setCommitOther]=useState(d.commitOther??"");
  const [memo,setMemo]=useState(d.memo??"");
  const ac="#a0e8b0";
  const bb=(k,x)=>setBef(p=>({...p,[k]:x}));
  const ab=(k,x)=>setAft(p=>({...p,[k]:x}));
  const qm=(k,x)=>setMq(p=>({...p,[k]:x}));
  const tog=t=>setTt(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t]);
  const snap=s=>({mode:"regular",step:s??step,sc,tt,bef,aft,stress,amode,exAft,mq,commit,commitOther,memo,situationCategory:sc,savedAt:new Date().toISOString()});
  const SB=()=><SessBar onHome={()=>{onSaveDraft(snap());onHome();}} onSaveExit={()=>{onSaveDraft(snap());onHome();}}/>;
  const metaQ=[
    {t:"頭の中で一番強い言葉は？",items:MQ1,k:"q1",prev:3,multi:false},
    {t:"友達が同じ状況なら何て声をかけてあげる？",items:MQ3,k:"q3",prev:4,multi:false},
    {t:"この気持ちは何を守ってる？（複数可）",items:MQ4,k:"q4",prev:5,multi:true},
  ];
  const pages=[
    <div key="r0">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>状況・状態</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>今の状況を整理しよう</div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,color:TH.muted,marginBottom:6}}>状況カテゴリー</div>
        {CATS.map(c=>(<Card key={c.id} selected={sc===c.id} onClick={()=>setSc(c.id)}><span style={{color:TH.sub}}>{c.icon} {c.label}</span></Card>))}
      </div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,color:TH.muted,marginBottom:6}}>トリガータグ（複数可）</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {TRIGS.map(t=>(<div key={t} onClick={()=>tog(t)} style={{padding:"5px 10px",borderRadius:16,fontSize:10,cursor:"pointer",background:tt.includes(t)?"rgba(70,180,90,0.28)":"rgba(255,255,255,0.06)",border:tt.includes(t)?"1px solid rgba(70,180,90,0.56)":"1px solid rgba(255,255,255,0.10)",color:tt.includes(t)?ac:TH.muted,transition:"all 0.15s"}}>{t}</div>))}
        </div>
      </div>
      <Slider label="感情の強さ"  value={bef.e} onChange={x=>bb("e",x)} accent={ac}/>
      <Slider label="衝動の強さ"  value={bef.u} onChange={x=>bb("u",x)} accent={ac}/>
      <Slider label="身体の緊張"  value={bef.b} onChange={x=>bb("b",x)} accent={ac}/>
      <Slider label="生活ストレス" value={stress} onChange={setStress} accent={ac}/>
      <Btn variant="green" style={{width:"100%",marginTop:4}} onClick={()=>setStep(1)} disabled={!sc}>次へ →</Btn>
    </div>,
    <div key="r1">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>今の反応モード</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>今はどっちに近い？</div>
      {[{id:"anxious",l:"不安で追いかけたくなる",icon:"😰"},{id:"avoidant",l:"距離を置いて切り離したくなる",icon:"🌫️"},{id:"stable",l:"どちらでもない / わからない",icon:"🤷"}].map(o=>(<Card key={o.id} selected={amode===o.id} onClick={()=>setAmode(o.id)}><span style={{fontSize:16,marginRight:8}}>{o.icon}</span><span style={{color:TH.sub,fontSize:12}}>{o.l}</span></Card>))}
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn variant="ghost" onClick={()=>setStep(0)}>← 戻る</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>setStep(2)} disabled={!amode}>次へ →</Btn>
      </div>
    </div>,
    <div key="r2">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>曝露 3分</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>感情とそのまま向き合う</div>
      <div style={{padding:"10px 12px",background:"rgba(255,255,255,0.05)",borderRadius:10,marginBottom:12,fontSize:11,color:TH.muted,lineHeight:1.7}}>逃げずに、ただ感じている。<br/>判断しない。解決しない。ただ観察する。</div>
      <TimerWidget seconds={180} onComplete={()=>{}} label="3分タイマー"/>
      <Slider label="3分後の感情の強さ" value={exAft} onChange={setExAft} accent={ac}/>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <Btn variant="ghost" onClick={()=>setStep(1)}>← 戻る</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>setStep(3)}>次へ →</Btn>
      </div>
    </div>,
    <div key="r3">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>筆記開示</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>紙に書く時間</div>
      <div style={{padding:"12px 14px",background:"rgba(70,180,90,0.10)",borderRadius:12,marginBottom:14,lineHeight:1.8}}>
        <div style={{fontSize:12,color:ac,marginBottom:4,fontWeight:600}}>📝 紙とペンを用意してください</div>
        <div style={{fontSize:11,color:TH.muted}}>· 15分、止まらずに書く<br/>· 文章の上手さは不要</div>
      </div>
      <TimerWidget seconds={900} onComplete={()=>{}} label="15分タイマー"/>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn variant="ghost" onClick={()=>setStep(2)}>← 戻る</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>setStep(4)}>次へ →</Btn>
      </div>
    </div>,
    ...metaQ.map(({t,items,k,prev,multi},idx)=>(
      <div key={"m"+idx}>
        <SB/>
        <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>メタ認知 {idx+1}/5</div>
        <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t}</div>
        {items.map(a=>{
          const sel=multi?(Array.isArray(mq[k])&&mq[k].includes(a)):mq[k]===a;
          const onCl=multi?()=>qm(k,Array.isArray(mq[k])?(mq[k].includes(a)?mq[k].filter(x=>x!==a):[...mq[k],a]):[a]):()=>qm(k,a);
          return(<Card key={a} selected={sel} onClick={onCl}><span style={{color:TH.sub,fontSize:12}}>{a}</span></Card>);
        })}
        {k==="q3"&&mq.q3==="その他"&&<input value={mq.q3other||""} onChange={e=>qm("q3other",e.target.value)}
          placeholder="具体的に書く（任意）"
          style={{width:"100%",background:TH.inp,border:"1px solid "+TH.border,borderRadius:8,
            color:TH.text,padding:"8px 11px",fontSize:12,fontFamily:"inherit",marginTop:4,boxSizing:"border-box"}}/>}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <Btn variant="ghost" onClick={()=>setStep(prev)}>← 戻る</Btn>
          <Btn variant="green" style={{flex:1}} onClick={()=>setStep(4+idx+1)}
            disabled={multi?(!(Array.isArray(mq[k])&&mq[k].length>0)):(!mq[k])}>次へ →</Btn>
        </div>
      </div>
    )),
    <div key="m4">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>メタ認知 4/5</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>最悪の想像が起きる確率はどれくらいだと思う？</div>
      <div style={{textAlign:"center",padding:"16px 0"}}>
        <div style={{fontSize:42,fontWeight:700,color:ac,marginBottom:6}}>{mq.q5}%</div>
        <input type="range" min={0} max={100} value={mq.q5} onChange={e=>qm("q5",Number(e.target.value))} style={{width:"100%",accentColor:"#4a9e5a"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:TH.muted,marginTop:3}}><span>ほぼない</span><span>半々</span><span>ほぼ確実</span></div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <Btn variant="ghost" onClick={()=>setStep(6)}>← 戻る</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>setStep(8)}>次へ →</Btn>
      </div>
    </div>,
    <div key="m5">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>メタ認知 5/5</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>別の可能性があるとしたら？（複数可）</div>
      {MQ6.map(a=>{
        const sel=Array.isArray(mq.q6)&&mq.q6.includes(a);
        return(<Card key={a} selected={sel} onClick={()=>qm("q6",Array.isArray(mq.q6)?(sel?mq.q6.filter(x=>x!==a):[...mq.q6,a]):[a])}><span style={{color:TH.sub,fontSize:12}}>{a}</span></Card>);
      })}
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn variant="ghost" onClick={()=>setStep(7)}>← 戻る</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>setStep(9)}
          disabled={!(Array.isArray(mq.q6)&&mq.q6.length>0)}>次へ →</Btn>
      </div>
    </div>,
    <div key="c0">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>今日の行動</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>1つだけ決める</div>
      {COMMITS.map(a=>(<Card key={a} selected={commit===a} onClick={()=>setCommit(a)}><span style={{color:TH.sub,fontSize:12}}>{a}</span></Card>))}
      {commit==="その他"&&<input value={commitOther} onChange={e=>setCommitOther(e.target.value)}
        placeholder="具体的に書く（任意）"
        style={{width:"100%",background:TH.inp,border:"1px solid "+TH.border,borderRadius:8,
          color:TH.text,padding:"8px 11px",fontSize:12,fontFamily:"inherit",marginTop:4,boxSizing:"border-box"}}/>}
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn variant="ghost" onClick={()=>setStep(8)}>← 戻る</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>setStep(10)} disabled={!commit}>次へ →</Btn>
      </div>
    </div>,
    <div key="af">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>終了スキャン</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>今の状態を確認</div>
      <Slider label="感情の強さ"   value={aft.e} onChange={x=>ab("e",x)} accent={ac}/>
      <Slider label="衝動の強さ"   value={aft.u} onChange={x=>ab("u",x)} accent={ac}/>
      <Slider label="身体の緊張"   value={aft.b} onChange={x=>ab("b",x)} accent={ac}/>
      <Slider label="思考の確信度" value={aft.t} onChange={x=>ab("t",x)} accent={ac}/>
      <div style={{padding:"13px",background:"rgba(60,140,75,0.08)",borderRadius:11,marginBottom:12}}>
        <div style={{fontSize:9,color:TH.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>変化</div>
        <ScoreBar label="感情" before={bef.e} after={aft.e}/>
        <ScoreBar label="衝動" before={bef.u} after={aft.u}/>
        <ScoreBar label="身体緊張" before={bef.b} after={aft.b}/>
      </div>
      <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder="一番の気づき（任意）"
        style={{width:"100%",minHeight:52,background:TH.inp,border:"1px solid "+TH.border,borderRadius:9,color:TH.text,padding:"9px 11px",fontSize:12,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",marginBottom:12}}/>
      <div style={{display:"flex",gap:8}}>
        <Btn variant="ghost" onClick={()=>setStep(9)}>← 戻る</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>onDone({
          mode:"regular",situationCategory:sc,triggerTags:tt,
          before:{emotionIntensity0_10:bef.e,urgeIntensity0_10:bef.u,bodyTension0_10:bef.b,thoughtBelievability0_10:bef.t},
          after:{emotionIntensity0_10:aft.e,urgeIntensity0_10:aft.u,bodyTension0_10:aft.b,thoughtBelievability0_10:aft.t},
          committedAction:commit==='その他'&&commitOther?commitOther:commit,memo,createdAt:new Date().toISOString(),endedAt:new Date().toISOString(),
        })}>保存して終了</Btn>
      </div>
    </div>,
  ];
  return(
    <Panel>
      <div style={{display:"flex",gap:2,marginBottom:16}}>
        {Array.from({length:11}).map((_,i)=>(<div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?"#a0e8b0":"rgba(255,255,255,0.08)",transition:"background 0.3s"}}/>))}
      </div>
      {pages[Math.min(step,pages.length-1)]}
    </Panel>
  );
}

function LogScreen({ sessions }) {
  const [sel,setSel]=useState(null);
  if(sel!==null){
    const s=sessions[sel];const cat=CATS.find(c=>c.id===s.situationCategory);
    return(
      <Panel>
        <button onClick={()=>setSel(null)} style={{background:"transparent",border:"none",color:TH.muted,cursor:"pointer",fontSize:11,marginBottom:12,fontFamily:"inherit"}}>← 一覧へ</button>
        <div style={{fontSize:9,color:"#a0d8b0",marginBottom:2}}>{s.mode==="emergency"?"🚨 緊急":"🌿 通常"} · {new Date(s.createdAt).toLocaleDateString("ja-JP")+" "+new Date(s.createdAt).toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})}</div>
        <div style={{fontSize:14,fontWeight:600,color:"#dff0e2",marginBottom:14}}>{cat?cat.label:"—"}</div>
        {s.after&&(<div style={{padding:12,background:"rgba(255,255,255,0.05)",borderRadius:11,marginBottom:12}}>
          <div style={{fontSize:9,color:"#a0d8b0",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>変化</div>
          <ScoreBar label="感情"     before={s.before.emotionIntensity0_10} after={s.after.emotionIntensity0_10}/>
          <ScoreBar label="衝動"     before={s.before.urgeIntensity0_10}   after={s.after.urgeIntensity0_10}/>
          <ScoreBar label="身体緊張" before={s.before.bodyTension0_10}     after={s.after.bodyTension0_10}/>
        </div>)}
        {s.committedAction&&<div style={{fontSize:11,color:"#60cc80",marginBottom:6}}>✓ {s.committedAction}</div>}
        {s.memo&&<div style={{padding:"10px 12px",background:"rgba(255,255,255,0.05)",borderRadius:8,fontSize:11,color:"#a0d8b0",fontStyle:"italic"}}>「{s.memo}」</div>}
      </Panel>
    );
  }
  return(
    <div>
      <div style={{fontSize:16,fontWeight:700,color:TH.text,marginBottom:14}}>セッションログ</div>
      {sessions.length===0?(<Panel style={{textAlign:"center",padding:"36px 16px"}}><div style={{fontSize:11,color:TH.muted}}>まだセッションがありません</div></Panel>):(
        [...sessions].reverse().map((s,i)=>{
          const idx=sessions.length-1-i;const cat=CATS.find(c=>c.id===s.situationCategory);const diff=s.after?s.after.emotionIntensity0_10-s.before.emotionIntensity0_10:null;
          return(<Card key={i} onClick={()=>setSel(idx)}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:9,color:s.mode==="emergency"?"#ff9aa2":"#a0e8b0",marginBottom:2}}>{s.mode==="emergency"?"🚨 緊急":"🌿 通常"} · {new Date(s.createdAt).toLocaleDateString("ja-JP",{month:"short",day:"numeric"})+" "+new Date(s.createdAt).toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})}</div>
                <div style={{fontSize:12,color:TH.sub}}>{cat?cat.label:"—"}</div>
                {diff!==null&&<div style={{fontSize:10,color:"#a0d8b0",marginTop:2}}>感情 {s.before.emotionIntensity0_10}→{s.after.emotionIntensity0_10}{diff!==0&&<span style={{color:diff<0?"#7ec8f0":"#f08070"}}> ({diff>0?"+":""}{diff})</span>}</div>}
              </div>
              <span style={{color:TH.muted,fontSize:14}}>›</span>
            </div>
          </Card>);
        })
      )}
    </div>
  );
}

function MemoScreen({ memos, onAdd, onEdit }) {
  const [text,setText]=useState("");
  const [tag,setTag]=useState("");
  const [editId,setEditId]=useState(null);
  const [editText,setEditText]=useState("");
  function add(){if(!text.trim())return;onAdd({id:Date.now()+"",createdAt:new Date().toISOString(),text:text.trim(),tags:tag?[tag]:[]});setText("");setTag("");}
  function startEdit(m){setEditId(m.id);setEditText(m.text);}
  function saveEdit(m){if(editText.trim())onEdit({...m,text:editText.trim()});setEditId(null);}
  const fmtDate=d=>new Date(d).toLocaleDateString("ja-JP",{year:"numeric",month:"short",day:"numeric"})+" "+new Date(d).toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"});
  return(
    <div>
      <div style={{fontSize:16,fontWeight:700,color:TH.text,marginBottom:14}}>日記</div>
      <Panel style={{marginBottom:12}}>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="今思ったこと、気づき…"
          style={{width:"100%",minHeight:64,background:TH.inp,border:"1px solid "+TH.border,borderRadius:8,color:TH.text,padding:"10px",fontSize:12,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",marginBottom:6}}/>
        <div style={{display:"flex",gap:6}}>
          <input value={tag} onChange={e=>setTag(e.target.value)} placeholder="タグ（任意）"
            style={{flex:1,background:TH.inp,border:"1px solid "+TH.border,borderRadius:7,color:TH.text,padding:"6px 10px",fontSize:11,fontFamily:"inherit"}}/>
          <Btn variant="green" onClick={add} disabled={!text.trim()} style={{padding:"7px 13px",fontSize:12}}>追加</Btn>
        </div>
      </Panel>
      {memos.length===0?(<div style={{textAlign:"center",padding:"26px 0",color:TH.muted,fontSize:11}}>まだ日記がありません</div>):(
        [...memos].reverse().map(m=>(
          <Card key={m.id} style={{marginBottom:8}}>
            {editId===m.id?(
              <div>
                <textarea value={editText} onChange={e=>setEditText(e.target.value)}
                  style={{width:"100%",minHeight:64,background:TH.inp,border:"1px solid "+TH.selB,borderRadius:8,
                    color:TH.text,padding:"9px",fontSize:12,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",marginBottom:8}}/>
                <div style={{display:"flex",gap:6}}>
                  <Btn variant="ghost" onClick={()=>setEditId(null)} style={{fontSize:11,padding:"5px 12px"}}>キャンセル</Btn>
                  <Btn variant="green" onClick={()=>saveEdit(m)} disabled={!editText.trim()} style={{flex:1,fontSize:11,padding:"5px 12px"}}>保存</Btn>
                </div>
              </div>
            ):(
              <div>
                <div style={{fontSize:11,color:"#dff0e2",lineHeight:1.65,marginBottom:8}}>{m.text}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                    {m.tags.map(t=>(<span key={t} style={{padding:"1px 6px",borderRadius:6,background:"rgba(70,180,90,0.18)",fontSize:9,color:"#a0e8b0"}}>{t}</span>))}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:9,color:"#a0d8b0"}}>{fmtDate(m.createdAt)}</span>
                    <button onClick={()=>startEdit(m)}
                      style={{background:"transparent",border:"1px solid rgba(96,204,128,0.25)",borderRadius:6,
                        color:"#a0d8b0",fontSize:9,padding:"2px 8px",cursor:"pointer",fontFamily:"inherit"}}>編集</button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

function CompleteScreen({ session, onHome }) {
  const diff=session.after.emotionIntensity0_10-session.before.emotionIntensity0_10;
  const msg=diff<-2?"よくやった。今日のあなたを誇りに思う。":diff<0?"少し楽になれた。それで十分。":"感情は動かなくていい。向き合ったことが大事。";
  return(
    <Panel>
      <div style={{textAlign:"center",padding:"10px 0 18px"}}>
        <div style={{fontSize:48,marginBottom:10}}>{diff<0?"🌱":"🌿"}</div>
        <div style={{fontSize:19,fontWeight:700,color:TH.text,marginBottom:6}}>セッション完了</div>
        <div style={{fontSize:12,color:TH.muted,marginBottom:20,lineHeight:1.7}}>{msg}</div>
        <div style={{padding:"13px",background:"rgba(255,255,255,0.05)",borderRadius:11,marginBottom:14,textAlign:"left"}}>
          <div style={{fontSize:9,color:TH.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>今回の変化</div>
          <ScoreBar label="感情"     before={session.before.emotionIntensity0_10} after={session.after.emotionIntensity0_10}/>
          <ScoreBar label="衝動"     before={session.before.urgeIntensity0_10}   after={session.after.urgeIntensity0_10}/>
          <ScoreBar label="身体緊張" before={session.before.bodyTension0_10}     after={session.after.bodyTension0_10}/>
        </div>
        {session.committedAction&&(<div style={{padding:"10px 13px",background:"rgba(55,135,65,0.13)",borderRadius:10,fontSize:12,color:"#80e8a0",marginBottom:14}}>✓ 今日の行動：{session.committedAction}</div>)}
        <Btn variant="green" style={{width:"100%"}} onClick={onHome}>ホームに戻る</Btn>
      </div>
    </Panel>
  );
}

const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{height:100%;}
  input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:rgba(255,255,255,0.14);outline:none;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#4a9e5a;cursor:pointer;}
  textarea,input{outline:none;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px;}
`;

function Shell({ children }) {
  return(
    <div style={{minHeight:"100vh",width:"100%",fontFamily:"'Noto Sans JP',system-ui,sans-serif",color:"#fff",position:"relative"}}>
      <style>{CSS}</style>
      <ForestBG/>
      <div style={{position:"relative",zIndex:1,maxWidth:480,margin:"0 auto",padding:"18px 13px 86px"}}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [tab,   setTab]  = useState("home");
  const [sub,   setSub]  = useState(null);
  const [sess,  setSess] = useState(()=>ld(SK.sess,[]));
  const [memo,  setMemo] = useState(()=>ld(SK.memo,[]));
  const [attR,  setAttR] = useState(()=>ld(SK.att,null));
  const [attH,  setAttH] = useState(()=>ld(SK.ath,[]));
  const [dftEm, setDftEm]= useState(()=>ld(SK.dftEm,null));
  const [dftRe, setDftRe]= useState(()=>ld(SK.dftRe,null));
  const [comp,  setComp] = useState(null);

  useEffect(()=>sv(SK.sess, sess), [sess]);
  useEffect(()=>sv(SK.memo, memo), [memo]);
  useEffect(()=>sv(SK.att,  attR), [attR]);
  useEffect(()=>sv(SK.ath,  attH), [attH]);
  useEffect(()=>sv(SK.dftEm,dftEm),[dftEm]);
  useEffect(()=>sv(SK.dftRe,dftRe),[dftRe]);

  const goHome     = ()=>{ setSub(null); setTab("home"); };
  const onAttDone  = r =>{ setAttR(r); setAttH(h=>[...h,r]); setSub(null); setTab("attachment"); };
  const onSessDone = s =>{ setSess(p=>[...p,s]); setComp(s); setSub("complete");
    if(s.mode==="emergency") setDftEm(null); else setDftRe(null);
  };
  const onResume  = mode => setSub(mode);
  const onDiscard = mode => { if(mode==="em") setDftEm(null); else setDftRe(null); };

  if(sub==="em") return(
    <Shell>
      <EmSess onDone={onSessDone} onHome={goHome} onSaveDraft={setDftEm} initialDraft={dftEm}/>
    </Shell>
  );
  if(sub==="re") return(
    <Shell>
      <ReSess onDone={onSessDone} onHome={goHome} onSaveDraft={setDftRe} initialDraft={dftRe}/>
    </Shell>
  );
  if(sub==="diag") return(
    <Shell><AttDiag onDone={onAttDone} onHome={goHome}/></Shell>
  );
  if(sub==="complete"&&comp) return(
    <Shell><CompleteScreen session={comp} onHome={()=>{ setSub(null); setComp(null); setTab("home"); }}/></Shell>
  );

  return(
    <Shell>
      {tab==="home"&&(
        <>
          {!attR&&(
            <div style={{marginBottom:12,padding:"12px 14px",background:"rgba(3,18,6,0.88)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",borderRadius:14,border:"1px solid rgba(68,195,84,0.22)",fontSize:11,color:"rgba(145,226,156,0.90)",lineHeight:1.7}}>
              💞 愛着スタイルの診断で自分の反応パターンを知ろう。
              <div style={{marginTop:8,display:"flex",gap:6}}>
                <Btn variant="green" style={{fontSize:10,padding:"6px 12px"}} onClick={()=>setSub("diag")}>診断する（2分）</Btn>
                <Btn variant="ghost" style={{fontSize:10,padding:"6px 12px"}} onClick={()=>{}}>あとで</Btn>
              </div>
            </div>
          )}
          <HomeScreen onStart={m=>setSub(m)} onResume={onResume} onDiscard={onDiscard} sessions={sess} draftEm={dftEm} draftRe={dftRe} attResult={attR}/>
        </>
      )}
      {tab==="attachment" && <AttTab history={attH} onNew={()=>setSub("diag")}/>}
      {tab==="log"        && <LogScreen sessions={sess}/>}
      {tab==="memo"       && <MemoScreen memos={memo} onAdd={m=>setMemo(ms=>[...ms,m])} onEdit={m=>setMemo(ms=>ms.map(x=>x.id===m.id?m:x))}/>}
      <TabBar active={tab} onTab={t=>{ setSub(null); setTab(t); }}/>
    </Shell>
  );
}