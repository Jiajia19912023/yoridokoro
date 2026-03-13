import { useState, useEffect, useRef, createContext, useContext } from "react";

function playBell() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);
    [523.25, 1046.5].forEach(freq => {
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
  return <div style={{position:"fixed",inset:0,zIndex:0,background:"linear-gradient(160deg,#010c05 0%,#021a09 40%,#031e0c 70%,#010c05 100%)"}}/>;
}

const SK = { sess:"cc_sess", memo:"cc_memo", att:"cc_att", ath:"cc_ath", dftEm:"cc_dft_em", dftRe:"cc_dft_re" };
function ld(k,fb){ try{ return JSON.parse(localStorage.getItem(k))??fb; }catch{ return fb; } }
function sv(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} }

const LangCtx = createContext(null);
const useT = () => useContext(LangCtx);

const LANGS = [
  {code:"ja",label:"日本語"},{code:"en",label:"English"},{code:"zh",label:"中文"},
  {code:"yue",label:"廣東話"},{code:"ko",label:"한국어"},
  {code:"es",label:"Español"},{code:"fr",label:"Français"},{code:"ru",label:"Русский"},
];

const T = {
  ja:{
    locale:"ja-JP", tagline:"二人をつなぐ心の場所", subtitle:"まず、どっちを選ぶ？",
    heroLine1:"大切な人と", heroHighlight:'"最悪の結末"', heroLine2post:"を", heroLine3:"迎える前に",
    em:"緊急モード", emDesc:"今すぐ爆発しそう\n衝動を止めたい時", emTime:"5〜7分",
    re:"通常モード", reDesc:"少し落ち着いてる\nじっくり整理したい時", reTime:"15〜25分",
    prevSess:"前回のセッション", attLatest:"愛着スタイル（最新）",
    diagBanner:"💞 愛着スタイルの診断で自分の反応パターンを知ろう。",
    diagBtn:"診断する（2分）", later:"あとで",
    home:"ホーム", att:"愛着", log:"ログ", memo:"日記",
    draftSess:"途中のセッション", draftResume:"▶ 再開する", draftDiscard:"破棄",
    draftStep:"ステップ", draftAt:"に中断", draftNone:"未選択",
    sessHome:"🏠 ホーム", sessSave:"💾 中断して保存",
    cats:["喧嘩直後","冷戦・距離がある","不安（連絡/既読）","自己否定（私が悪い？）","同じパターンの繰り返し","別れ/関係の終わり"],
    catIcons:["⚡","🧊","📱","💭","🔄","🍂"],
    urges:["今すぐ返信する","長文を送る","追及する","謝り倒す","ブロック/ミュート","SNSを見る/監視する","別れを切り出す","その他"],
    regs:[{label:"呼吸（1分）",icon:"🫁"},{label:"足裏に注意",icon:"🦶"},{label:"冷水（手/顔）",icon:"💧"},{label:"水を飲む",icon:"🥤"},{label:"肩の力を抜く",icon:"💆"}],
    trigs:["連絡が遅い/既読無視","言い方がきつい","約束が変わった","嘘・隠し事っぽい","束縛・干渉","距離を置かれた","お金・負担","家事・役割","価値観・将来"],
    amodes:[{id:"anxious",l:"不安で追いかけたくなる",icon:"😰"},{id:"avoidant",l:"距離を置いて切り離したくなる",icon:"🌫️"},{id:"stable",l:"どちらでもない / わからない",icon:"🤷"}],
    mq1:["嫌われた","大切にされてない","もう終わりかも","私が悪い","わからない"],
    mq3:["それは普通に傷ついていいよ","まだ何もしなくていいと思う","もう少し情報を待ってみたら","相手も今いっぱいいっぱいかも","気持ちを聞かせてって言うかも","その他"],
    mq4:["安心したい","大切にされたい","尊重されたい","自分を守りたい","コントロール感","わからない"],
    mq6:["まだ情報が足りない","相手が忙しい/疲れている","自分が疲れて過敏","タイミングが悪い","何か別の理由がある","わからない"],
    commits:["今日は連絡を急がない","送るなら短文だけ","明日もう一回見直す","散歩/入浴/睡眠優先","境界線を言語化する","その他"],
    ughOpts:["はい（でも今は保留）","少し下がった","だいぶ下がった"],
    attQs:["返信が遅いと不安が強くなる","距離を置かれると追いかけたくなる","相手が近づくと息苦しくなる","本音を言うのが怖い","相手の気持ちを確かめたくて落ち着かない","問題が起きると一人になりたくなる","嫌われるのが怖くて我慢しがち","親密になると急に冷めたくなる"],
    attOpts:["0 — 全然ない","1 — 少しある","2 — かなりある","3 — とてもある"],
    attTypes:{
      anxious:{label:"不安型",color:"#f08070",desc:"繋がりを強く求め、相手の反応にとても敏感なタイプ。置き去りにされる恐怖を感じやすい傾向があります。",tips:["感情日記をつけて自分を観察する","「今ここ」にフォーカスする練習","落ち着かせるルーティンを作る"]},
      avoidant:{label:"回避型",color:"#70b8f0",desc:"親密になることへの不安から、距離を取りやすいタイプ。感情を抑制して一人の安全を守ろうとします。",tips:["感情に名前をつける練習","小さな自己開示から始める","安全な関係の場を作る"]},
      mixed:{label:"混合型",color:"#e8c060",desc:"近づきたいけど傷つきたくない、という葛藤を抱えやすいタイプ。状況によって反応が変わります。",tips:["自分のパターンをノートで観察する","安全な関係の経験を積む","信頼できるサポーターを見つける"]},
      secure:{label:"安定型",color:"#60cc80",desc:"比較的バランスの取れた愛着スタイル。関係の中で安心感を持ちやすく、適度な距離感を保てます。",tips:["このバランスを意識して維持する","パートナーの愛着ニーズを理解する","定期的な自己チェックを続ける"]},
      disorganized:{label:"無秩序型",color:"#d080e0",desc:"不安と回避の両方が高く、関係の中で混乱しやすいタイプ。近づきたいが怖いという矛盾した気持ちを抱えます。",tips:["感情パターンを記録して自己理解を深める","信頼できる安全な関係から少しずつ経験を積む","専門家のサポートも選択肢として活用する"]},
    },
    attAxisLabels:["不安傾向","無秩序","回避傾向","安定性"],
    attDisorgSub:"（回避と不安のミックス）",
    attAnxious:"不安", attAvoidant:"回避",
    attDiagTitle:"愛着診断", attResultTitle:"診断結果",
    attSaveHome:"保存してホームへ", attRecommend:"おすすめの取り組み",
    attTabTitle:"愛着スタイル", attTabHistory:"愛着スタイル履歴",
    attTabEmpty:"まだ診断していません",
    attTabEmptyDesc:"愛着スタイルを知ることで\n自分の感情パターンが見えてきます",
    attTabNew:"+ 診断する", attTabRediag:"+ 再診断", attTabLatest:"最新",
    emScanLabel:"状況スキャン", emScanTitle:"今どんな状況？",
    emCatLabel:"状況カテゴリー", emUrgeLabel:"いちばんやりたい行動",
    emUrgeOtherPh:"具体的に書く（任意）",
    emCalmLabel:"鎮静", emCalmTitle:"今できるやつを選んで実行",
    emDelayLabel:"衝動遅延", emDelayTitle:"実行できたかな？",
    emDelaySub:"次は３分間、スマホも何もかも置いて\n何もしない時間を作ろう。",
    emDelayHint:"このまま画面を伏せて、\nただ呼吸するだけでいい。",
    emTimerBtn:"タイマーを始める →",
    emTimerLabel:"衝動遅延", emTimerTitle:"３分間、ただ何もしない時間",
    emTimerQ:"いま、その行動を\"今すぐ\"やりたい？",
    emEndLabel:"終了スキャン", emEndTitle:"今の状態を確認",
    emMemoPlaceholder:"一言メモ（任意）",
    reSitLabel:"状況・状態", reSitTitle:"今の状況を整理しよう",
    reCatLabel:"状況カテゴリー", reTrigLabel:"トリガータグ（複数可）",
    reModeLabel:"今の反応モード", reModeTitle:"今はどっちに近い？",
    reExpLabel:"曝露 3分", reExpTitle:"感情とそのまま向き合う",
    reExpHint:"逃げずに、ただ感じている。\n判断しない。解決しない。ただ観察する。",
    reExpInfoHint:"スマホを置いて\nただ感情とともにいる時間です。",
    reExpTimerTitle:"３分間、ただ何もしない時間",
    reWriteLabel:"筆記開示", reWriteTitle:"紙に書く時間",
    reWritePurpose:"感情を言葉にして書き出すことで、心の整理と距離感が生まれます。",
    reWriteInstruction:"📝 紙とペンを用意してください",
    reWriteTips:"· 15分、止まらずに書く\n· 文章の上手さは不要",
    metaLabel:"メタ認知",
    mq1Title:"頭の中で一番強い言葉は？",
    mq3Title:"友達が同じ状況なら何て声をかけてあげる？",
    mq3OtherPh:"具体的に書く（任意）",
    mq4Title:"この気持ちは何を守ってる？（複数可）",
    mq5Title:"最悪の想像が起きる確率はどれくらいだと思う？",
    mq5Lo:"ほぼない", mq5Mid:"半々", mq5Hi:"ほぼ確実",
    mq6Title:"別の可能性があるとしたら？（複数可）",
    commitLabel:"今日の行動", commitTitle:"1つだけ決める",
    commitOtherPh:"具体的に書く（任意）",
    reEndLabel:"終了スキャン", reEndTitle:"今の状態を確認",
    reMemoPlaceholder:"一番の気づき（任意）",
    completeTitle:"セッション完了",
    completeMsgs:["よくやった。今日のあなたを誇りに思う。","少し楽になれた。それで十分。","感情は動かなくていい。向き合ったことが大事。"],
    completeChangeLabel:"今回の変化",
    completeActionLabel:"今日の行動：",
    completeHomeBtn:"ホームに戻る",
    logTitle:"セッションログ", logEmpty:"まだセッションがありません",
    logBack:"← 一覧へ", logChangeLabel:"変化",
    logEm:"🚨 緊急", logRe:"🌿 通常",
    memoTitle:"日記", memoEmpty:"まだ日記がありません",
    memoPh:"今思ったこと、気づき…",
    memoTagPh:"タグ（任意）", memoAdd:"追加",
    memoEdit:"編集", memoSave:"保存", memoCancel:"キャンセル",
    emoLabel:"感情の強さ", urgeLabel:"衝動の強さ", bodyLabel:"身体の緊張",
    thoughtLabel:"思考の確信度", stressLabel:"生活ストレス",
    afterEmoLabel:"3分後の感情の強さ",
    changeLabel:"変化",
    scoreEmo:"感情", scoreUrge:"衝動", scoreBody:"身体緊張",
    navBack:"← 戻る", navNext:"次へ →", navSaveDone:"保存して終了",
    timerStart:"開始", timerPause:"一時停止", timerReset:"リセット", timerDone:"完了!",
  },
  en:{
    locale:"en-US", tagline:"A place for two hearts", subtitle:"Which do you need right now?",
    heroLine1:"Before the", heroHighlight:'"worst outcome"', heroLine2post:"", heroLine3:"with someone you love",
    em:"Emergency Mode", emDesc:"About to explode\nStop the impulse now", emTime:"5–7 min",
    re:"Calm Mode", reDesc:"A bit calmer\nSort through feelings slowly", reTime:"15–25 min",
    prevSess:"Last Session", attLatest:"Attachment Style (latest)",
    diagBanner:"💞 Discover your attachment style and understand your patterns.",
    diagBtn:"Take the quiz (2 min)", later:"Later",
    home:"Home", att:"Attach", log:"Log", memo:"Diary",
    draftSess:"Session in progress", draftResume:"▶ Resume", draftDiscard:"Discard",
    draftStep:"Step", draftAt:"interrupted at", draftNone:"Not selected",
    sessHome:"🏠 Home", sessSave:"💾 Save & exit",
    cats:["After a fight","Cold war / distant","Anxiety (no reply)","Self-blame","Same pattern","Breakup / end of relationship"],
    catIcons:["⚡","🧊","📱","💭","🔄","🍂"],
    urges:["Reply immediately","Send a long message","Confront them","Apologize repeatedly","Block / mute","Check their SNS","Bring up breaking up","Other"],
    regs:[{label:"Breathe (1 min)",icon:"🫁"},{label:"Feel your feet",icon:"🦶"},{label:"Cold water (hands/face)",icon:"💧"},{label:"Drink water",icon:"🥤"},{label:"Drop your shoulders",icon:"💆"}],
    trigs:["Late reply / left on read","Harsh tone","Plans changed","Possible lies / secrets","Controlling","Feeling pushed away","Money / burden","Chores / roles","Values / future"],
    amodes:[{id:"anxious",l:"Anxious — want to chase",icon:"😰"},{id:"avoidant",l:"Avoidant — want to pull away",icon:"🌫️"},{id:"stable",l:"Neither / not sure",icon:"🤷"}],
    mq1:["They hate me","I'm not cared for","It might be over","It's my fault","I don't know"],
    mq3:["It's okay to be hurt by that","You don't have to do anything yet","Maybe wait for more information","They might be overwhelmed too","I'd ask to hear how they feel","Other"],
    mq4:["I want to feel safe","I want to feel cared for","I want to feel respected","I want to protect myself","I want a sense of control","I don't know"],
    mq6:["Not enough information yet","They're busy or tired","I'm exhausted and oversensitive","Bad timing","Some other reason","I don't know"],
    commits:["Don't rush a reply today","If I send anything, keep it short","Review it again tomorrow","Prioritize a walk / bath / sleep","Put my boundary into words","Other"],
    ughOpts:["Yes (but holding off)","It's come down a little","It's come down a lot"],
    attQs:["I get anxious when replies are slow","I want to chase when someone pulls away","I feel suffocated when someone gets too close","It's scary to share my real feelings","I need to keep checking how they feel","I want to be alone when problems arise","I tend to hold back to avoid rejection","I go cold when things get intimate"],
    attOpts:["0 — Not at all","1 — A little","2 — Quite a bit","3 — Very much"],
    attTypes:{
      anxious:{label:"Anxious",color:"#f08070",desc:"You strongly seek connection and are very sensitive to others' reactions. You may fear being abandoned.",tips:["Keep an emotion journal","Practice focusing on the present moment","Build a calming routine"]},
      avoidant:{label:"Avoidant",color:"#70b8f0",desc:"You tend to create distance when intimacy grows. You protect yourself by suppressing emotions.",tips:["Practice naming your emotions","Start with small self-disclosures","Create safe spaces for connection"]},
      mixed:{label:"Mixed",color:"#e8c060",desc:"You want closeness but fear being hurt. Your reactions can shift depending on the situation.",tips:["Journal your patterns","Seek out safe relationship experiences","Find a trusted support person"]},
      secure:{label:"Secure",color:"#60cc80",desc:"You have a relatively balanced attachment style. You can feel secure in relationships and maintain healthy distance.",tips:["Keep nurturing this balance","Learn your partner's attachment needs","Check in with yourself regularly"]},
      disorganized:{label:"Disorganized",color:"#d080e0",desc:"You show high levels of both anxiety and avoidance. You may feel conflicted — wanting closeness but also fearing it.",tips:["Track your emotional patterns to build self-awareness","Gradually build trust in safe relationships","Consider professional support as an option"]},
    },
    attAxisLabels:["Anxious","Disorganized","Avoidant","Secure"],
    attDisorgSub:"(Avoidant & Anxious mix)",
    attAnxious:"Anxious", attAvoidant:"Avoidant",
    attDiagTitle:"Attachment quiz", attResultTitle:"Your result",
    attSaveHome:"Save & go home", attRecommend:"Suggested practices",
    attTabTitle:"Attachment style", attTabHistory:"Attachment history",
    attTabEmpty:"No results yet",
    attTabEmptyDesc:"Understanding your attachment style\nhelps you see your emotional patterns",
    attTabNew:"+ Take quiz", attTabRediag:"+ Retake quiz", attTabLatest:"Latest",
    emScanLabel:"Situation scan", emScanTitle:"What's happening?",
    emCatLabel:"Situation category", emUrgeLabel:"Strongest urge right now",
    emUrgeOtherPh:"Describe it (optional)",
    emCalmLabel:"Calm down", emCalmTitle:"Pick one and do it now",
    emDelayLabel:"Delay impulse", emDelayTitle:"Did you do it?",
    emDelaySub:"Now put your phone down for 3 minutes\nand do absolutely nothing.",
    emDelayHint:"Just put the screen down\nand breathe.",
    emTimerBtn:"Start timer →",
    emTimerLabel:"Delay impulse", emTimerTitle:"Just let it sit for 3 minutes",
    emTimerQ:"Do you still want to act on that urge right now?",
    emEndLabel:"End scan", emEndTitle:"Check how you feel now",
    emMemoPlaceholder:"Quick note (optional)",
    reSitLabel:"Situation", reSitTitle:"Let's sort out what's going on",
    reCatLabel:"Situation category", reTrigLabel:"Trigger tags (multiple ok)",
    reModeLabel:"Reaction mode", reModeTitle:"Which feels closer right now?",
    reExpLabel:"Exposure 3 min", reExpTitle:"Sit with the feeling",
    reExpHint:"Don't run from it. Just feel it.\nNo judging. No fixing. Just observe.",
    reWriteLabel:"Expressive writing", reWriteTitle:"Time to write",
    reWriteInstruction:"📝 Grab paper and a pen",
    reWriteTips:"· Write for 15 min without stopping\n· Neatness doesn't matter",
    metaLabel:"Meta-cognition",
    mq1Title:"What's the strongest thought in your head?",
    mq3Title:"What would you say to a friend in this situation?",
    mq3OtherPh:"Describe it (optional)",
    mq4Title:"What is this feeling protecting? (multiple ok)",
    mq5Title:"How likely is your worst-case scenario?",
    mq5Lo:"Almost never", mq5Mid:"50/50", mq5Hi:"Almost certain",
    mq6Title:"What other possibilities exist? (multiple ok)",
    commitLabel:"Today's action", commitTitle:"Choose just one",
    commitOtherPh:"Describe it (optional)",
    reEndLabel:"End scan", reEndTitle:"Check how you feel now",
    reMemoPlaceholder:"Biggest insight (optional)",
    completeTitle:"Session complete",
    completeMsgs:["Well done. I'm proud of you today.","You got a little relief. That's enough.","Emotions don't have to shift. Facing them is what matters."],
    completeChangeLabel:"Change this session",
    completeActionLabel:"Today's action: ",
    completeHomeBtn:"Back to home",
    logTitle:"Session log", logEmpty:"No sessions yet",
    logBack:"← Back", logChangeLabel:"Change",
    logEm:"🚨 Emergency", logRe:"🌿 Calm",
    memoTitle:"Diary", memoEmpty:"No entries yet",
    memoPh:"What's on your mind…",
    memoTagPh:"Tag (optional)", memoAdd:"Add",
    memoEdit:"Edit", memoSave:"Save", memoCancel:"Cancel",
    emoLabel:"Emotion intensity", urgeLabel:"Urge intensity", bodyLabel:"Body tension",
    thoughtLabel:"Thought believability", stressLabel:"Life stress",
    afterEmoLabel:"Emotion intensity after 3 min",
    changeLabel:"Change",
    scoreEmo:"Emotion", scoreUrge:"Urge", scoreBody:"Body tension",
    navBack:"← Back", navNext:"Next →", navSaveDone:"Save & finish",
    timerStart:"Start", timerPause:"Pause", timerReset:"Reset", timerDone:"Done!",
  },
  zh:{
    locale:"zh-CN", tagline:"两颗心相连的地方", subtitle:"你现在需要哪种模式？",
    heroLine1:"在与爱人走向", heroHighlight:'"最坏的结局"', heroLine2post:"", heroLine3:"之前",
    em:"紧急模式", emDesc:"情绪即将爆发\n需要控制冲动", emTime:"5–7分钟",
    re:"平静模式", reDesc:"稍微冷静一些\n慢慢整理思绪", reTime:"15–25分钟",
    prevSess:"上次记录", attLatest:"依恋风格（最新）",
    diagBanner:"💞 了解你的依恋风格，认识自己的情绪模式。",
    diagBtn:"开始测试（2分钟）", later:"稍后",
    home:"主页", att:"依恋", log:"记录", memo:"日记",
    draftSess:"进行中的会话", draftResume:"▶ 继续", draftDiscard:"放弃",
    draftStep:"步骤", draftAt:"中断于", draftNone:"未选择",
    sessHome:"🏠 主页", sessSave:"💾 保存并退出",
    cats:["吵架后","冷战/疏远","焦虑（未回复）","自我责备","同样的模式","分手/关系结束"],
    catIcons:["⚡","🧊","📱","💭","🔄","🍂"],
    urges:["立刻回复","发长消息","质问对方","道歉再道歉","拉黑/屏蔽","查看对方社交","提出分手","其他"],
    regs:[{label:"呼吸（1分钟）",icon:"🫁"},{label:"感受脚踩地面",icon:"🦶"},{label:"冷水（手/脸）",icon:"💧"},{label:"喝水",icon:"🥤"},{label:"放松肩膀",icon:"💆"}],
    trigs:["回复慢/已读不回","语气强硬","约定改变","可能说谎/隐瞒","控制/干涉","被推开","金钱/负担","家务/分工","价值观/未来"],
    amodes:[{id:"anxious",l:"焦虑——想追上去",icon:"😰"},{id:"avoidant",l:"回避——想拉开距离",icon:"🌫️"},{id:"stable",l:"两者皆非/不确定",icon:"🤷"}],
    mq1:["他们讨厌我","我不被重视","也许要结束了","是我的错","不知道"],
    mq3:["受伤是正常的","你现在不必做任何事","也许再等等更多信息","他们可能也很难受","我会问他们的感受","其他"],
    mq4:["想感到安全","想被珍视","想被尊重","想保护自己","想有控制感","不知道"],
    mq6:["信息还不够","他们很忙或很累","我太累了，过于敏感","时机不好","有其他原因","不知道"],
    commits:["今天不急着回复","如果发消息，保持简短","明天再看一遍","优先散步/泡澡/睡眠","把界限说出来","其他"],
    ughOpts:["是（但先忍住）","稍微降低了","降低了很多"],
    attQs:["回复慢时我会变得焦虑","被拉开距离时我想追上去","对方靠近时我会感到窒息","说出真实感受让我害怕","我需要不断确认对方的感受","出现问题时我想一个人待着","害怕被拒绝所以习惯忍耐","关系变亲密时我会突然冷淡"],
    attOpts:["0 — 完全没有","1 — 有一点","2 — 比较有","3 — 非常有"],
    attTypes:{
      anxious:{label:"焦虑型",color:"#f08070",desc:"强烈渴望连接，对他人反应非常敏感，容易害怕被抛弃。",tips:["写情绪日记","练习活在当下","建立让自己平静的日常"]},
      avoidant:{label:"回避型",color:"#70b8f0",desc:"当关系变亲密时倾向于保持距离，通过抑制情绪保护自己。",tips:["练习给情绪命名","从小小的自我开放开始","创造安全的连接空间"]},
      mixed:{label:"混合型",color:"#e8c060",desc:"渴望亲密又害怕受伤，反应可能因情况而变。",tips:["用笔记观察自己的模式","积累安全关系的经验","找到可信赖的支持者"]},
      secure:{label:"安全型",color:"#60cc80",desc:"依恋风格相对平衡，能在关系中感到安心，保持适当距离。",tips:["有意识地维持这种平衡","了解伴侣的依恋需求","定期进行自我检视"]},
      disorganized:{label:"混乱型",color:"#d080e0",desc:"不安与回避都很强烈，容易在关系中感到混乱。既想亲近又害怕受伤。",tips:["记录情绪模式，加深自我理解","在安全关系中慢慢积累信任经验","也可以考虑寻求专业支持"]},
    },
    attAxisLabels:["焦虑倾向","混乱","回避倾向","安全性"],
    attDisorgSub:"（回避与焦虑的混合）",
    attAnxious:"焦虑", attAvoidant:"回避",
    attDiagTitle:"依恋测试", attResultTitle:"测试结果",
    attSaveHome:"保存并返回主页", attRecommend:"推荐练习",
    attTabTitle:"依恋风格", attTabHistory:"依恋历史",
    attTabEmpty:"尚未测试",
    attTabEmptyDesc:"了解你的依恋风格\n有助于看清情绪模式",
    attTabNew:"+ 开始测试", attTabRediag:"+ 重新测试", attTabLatest:"最新",
    emScanLabel:"情境扫描", emScanTitle:"现在发生了什么？",
    emCatLabel:"情境类别", emUrgeLabel:"最强烈的冲动",
    emUrgeOtherPh:"具体描述（可选）",
    emCalmLabel:"镇静", emCalmTitle:"选一个，现在就做",
    emDelayLabel:"延迟冲动", emDelayTitle:"做到了吗？",
    emDelaySub:"现在放下手机3分钟\n什么都不做。",
    emDelayHint:"把屏幕朝下放\n只是呼吸就好。",
    emTimerBtn:"开始计时 →",
    emTimerLabel:"延迟冲动", emTimerTitle:"静静等3分钟",
    emTimerQ:"现在还想立刻付诸行动吗？",
    emEndLabel:"结束扫描", emEndTitle:"检查现在的状态",
    emMemoPlaceholder:"简短备注（可选）",
    reSitLabel:"情境", reSitTitle:"整理一下现在的状况",
    reCatLabel:"情境类别", reTrigLabel:"触发标签（可多选）",
    reModeLabel:"当前反应模式", reModeTitle:"哪个更接近你现在的感受？",
    reExpLabel:"暴露 3分钟", reExpTitle:"与情绪同在",
    reExpHint:"不要逃避，只是去感受它。\n不评判，不解决，只是观察。",
    reWriteLabel:"书写释放", reWriteTitle:"写下来的时间",
    reWriteInstruction:"📝 准备纸和笔",
    reWriteTips:"· 不间断写15分钟\n· 不需要写得好",
    metaLabel:"元认知",
    mq1Title:"脑海中最强烈的想法是什么？",
    mq3Title:"如果朋友遇到同样的情况，你会说什么？",
    mq3OtherPh:"具体描述（可选）",
    mq4Title:"这种感受在保护什么？（可多选）",
    mq5Title:"你认为最坏的情况发生的可能性有多大？",
    mq5Lo:"几乎不可能", mq5Mid:"五五开", mq5Hi:"几乎确定",
    mq6Title:"还有哪些可能性？（可多选）",
    commitLabel:"今日行动", commitTitle:"只选一个",
    commitOtherPh:"具体描述（可选）",
    reEndLabel:"结束扫描", reEndTitle:"检查现在的状态",
    reMemoPlaceholder:"最大的感悟（可选）",
    completeTitle:"会话完成",
    completeMsgs:["做得很好。为今天的你感到骄傲。","稍微轻松了一些，这就够了。","情绪不需要改变，面对它本身就是重要的。"],
    completeChangeLabel:"本次变化",
    completeActionLabel:"今日行动：",
    completeHomeBtn:"返回主页",
    logTitle:"会话记录", logEmpty:"暂无会话记录",
    logBack:"← 返回列表", logChangeLabel:"变化",
    logEm:"🚨 紧急", logRe:"🌿 平静",
    memoTitle:"日记", memoEmpty:"暂无日记",
    memoPh:"写下你的想法…",
    memoTagPh:"标签（可选）", memoAdd:"添加",
    memoEdit:"编辑", memoSave:"保存", memoCancel:"取消",
    emoLabel:"情绪强度", urgeLabel:"冲动强度", bodyLabel:"身体紧张",
    thoughtLabel:"想法可信度", stressLabel:"生活压力",
    afterEmoLabel:"3分钟后的情绪强度",
    changeLabel:"变化",
    scoreEmo:"情绪", scoreUrge:"冲动", scoreBody:"身体紧张",
    navBack:"← 返回", navNext:"下一步 →", navSaveDone:"保存并完成",
    timerStart:"开始", timerPause:"暂停", timerReset:"重置", timerDone:"完成!",
  },
  yue:{
    locale:"zh-HK", tagline:"兩顆心相連嘅地方", subtitle:"你而家需要邊種模式？",
    heroLine1:"喺同愛人走向", heroHighlight:'"最壞結局"', heroLine2post:"", heroLine3:"之前",
    em:"緊急模式", emDesc:"情緒快爆發\n要控制衝動", emTime:"5–7分鐘",
    re:"平靜模式", reDesc:"稍為冷靜咗\n慢慢整理思緒", reTime:"15–25分鐘",
    prevSess:"上次記錄", attLatest:"依附風格（最新）",
    diagBanner:"💞 了解你嘅依附風格，認識自己嘅情緒模式。",
    diagBtn:"開始測試（2分鐘）", later:"稍後",
    home:"主頁", att:"依附", log:"記錄", memo:"日記",
    draftSess:"進行中嘅會話", draftResume:"▶ 繼續", draftDiscard:"放棄",
    draftStep:"步驟", draftAt:"中斷於", draftNone:"未選擇",
    sessHome:"🏠 主頁", sessSave:"💾 儲存並退出",
    cats:["嗌完交後","冷戰/疏遠","焦慮（未回覆）","自責","同樣嘅模式","分手/關係終結"],
    catIcons:["⚡","🧊","📱","💭","🔄","🍂"],
    urges:["即刻回覆","發長訊息","追問對方","道歉再道歉","拉黑/屏蔽","睇對方社交","提出分手","其他"],
    regs:[{label:"呼吸（1分鐘）",icon:"🫁"},{label:"感受腳踩地面",icon:"🦶"},{label:"凍水（手/臉）",icon:"💧"},{label:"飲水",icon:"🥤"},{label:"放鬆膊頭",icon:"💆"}],
    trigs:["回覆慢/已讀唔回","語氣強硬","約定改變","可能講大話/隱瞞","控制/干涉","被推開","金錢/負擔","家務/分工","價值觀/未來"],
    amodes:[{id:"anxious",l:"焦慮——想追上去",icon:"😰"},{id:"avoidant",l:"回避——想拉開距離",icon:"🌫️"},{id:"stable",l:"兩者皆非/唔確定",icon:"🤷"}],
    mq1:["佢哋討厭我","我唔被重視","可能要結束咗","係我嘅錯","唔知道"],
    mq3:["受傷係正常嘅","你而家唔需要做任何事","或者再等等更多資訊","佢哋可能都好難受","我會問佢哋嘅感受","其他"],
    mq4:["想感到安全","想被珍視","想被尊重","想保護自己","想有控制感","唔知道"],
    mq6:["資訊仲唔夠","佢哋好忙或好攰","我太攰咗，過於敏感","時機唔好","有其他原因","唔知道"],
    commits:["今日唔急住回覆","如果發訊息，保持簡短","聽日再睇一次","優先散步/沖涼/睡覺","將界線講出嚟","其他"],
    ughOpts:["係（但先忍住）","稍微降低咗","降低咗好多"],
    attQs:["回覆慢時我會變得焦慮","被拉開距離時我想追上去","對方靠近時我會感到窒息","講出真實感受令我害怕","我需要不斷確認對方嘅感受","出現問題時我想一個人待住","怕被拒絕所以習慣忍耐","關係變親密時我會突然冷淡"],
    attOpts:["0 — 完全冇","1 — 有少少","2 — 幾有","3 — 非常有"],
    attTypes:{
      anxious:{label:"焦慮型",color:"#f08070",desc:"強烈渴望連接，對他人反應非常敏感，容易害怕被拋棄。",tips:["寫情緒日記","練習活在當下","建立令自己平靜嘅日常"]},
      avoidant:{label:"回避型",color:"#70b8f0",desc:"當關係變親密時傾向保持距離，通過抑制情緒保護自己。",tips:["練習為情緒命名","由小小嘅自我開放開始","創造安全嘅連接空間"]},
      mixed:{label:"混合型",color:"#e8c060",desc:"渴望親密又怕受傷，反應可能因情況而變。",tips:["用筆記觀察自己嘅模式","積累安全關係嘅經驗","搵到可信賴嘅支持者"]},
      secure:{label:"安全型",color:"#60cc80",desc:"依附風格相對平衡，能喺關係中感到安心，保持適當距離。",tips:["有意識咁維持呢種平衡","了解伴侶嘅依附需求","定期進行自我檢視"]},
      disorganized:{label:"混亂型",color:"#d080e0",desc:"不安同回避都好強烈，容易喺關係中感到混亂。想親近但又驚受傷。",tips:["記錄情緒模式，加深自我了解","喺安全關係中慢慢積累信任經驗","亦可考慮尋求專業支援"]},
    },
    attAxisLabels:["焦慮傾向","混亂","回避傾向","安全性"],
    attDisorgSub:"（回避同焦慮嘅混合）",
    attAnxious:"焦慮", attAvoidant:"回避",
    attDiagTitle:"依附測試", attResultTitle:"測試結果",
    attSaveHome:"儲存並返回主頁", attRecommend:"推薦練習",
    attTabTitle:"依附風格", attTabHistory:"依附歷史",
    attTabEmpty:"尚未測試",
    attTabEmptyDesc:"了解你嘅依附風格\n有助於看清情緒模式",
    attTabNew:"+ 開始測試", attTabRediag:"+ 重新測試", attTabLatest:"最新",
    emScanLabel:"情境掃描", emScanTitle:"而家發生咩事？",
    emCatLabel:"情境類別", emUrgeLabel:"最強烈嘅衝動",
    emUrgeOtherPh:"具體描述（可選）",
    emCalmLabel:"鎮靜", emCalmTitle:"揀一個，而家就去做",
    emDelayLabel:"延遲衝動", emDelayTitle:"做到咗未？",
    emDelaySub:"而家放低手機3分鐘\n乜都唔做。",
    emDelayHint:"將屏幕朝下放\n淨係呼吸就好。",
    emTimerBtn:"開始計時 →",
    emTimerLabel:"延遲衝動", emTimerTitle:"靜靜等3分鐘",
    emTimerQ:"而家仲想即刻付諸行動嗎？",
    emEndLabel:"結束掃描", emEndTitle:"檢查而家嘅狀態",
    emMemoPlaceholder:"簡短備注（可選）",
    reSitLabel:"情境", reSitTitle:"整理一下而家嘅狀況",
    reCatLabel:"情境類別", reTrigLabel:"觸發標籤（可多選）",
    reModeLabel:"當前反應模式", reModeTitle:"邊個更接近你而家嘅感受？",
    reExpLabel:"暴露 3分鐘", reExpTitle:"與情緒同在",
    reExpHint:"唔好逃避，只係去感受佢。\n唔評判，唔解決，只係觀察。",
    reWriteLabel:"書寫釋放", reWriteTitle:"寫落嚟嘅時間",
    reWriteInstruction:"📝 準備紙同筆",
    reWriteTips:"· 唔間斷寫15分鐘\n· 唔需要寫得好",
    metaLabel:"元認知",
    mq1Title:"腦海中最強烈嘅想法係咩？",
    mq3Title:"如果朋友遇到同樣情況，你會講咩？",
    mq3OtherPh:"具體描述（可選）",
    mq4Title:"呢種感受喺保護乜？（可多選）",
    mq5Title:"你認為最壞情況發生嘅可能性有幾大？",
    mq5Lo:"幾乎唔可能", mq5Mid:"五五開", mq5Hi:"幾乎肯定",
    mq6Title:"仲有咩其他可能性？（可多選）",
    commitLabel:"今日行動", commitTitle:"只揀一個",
    commitOtherPh:"具體描述（可選）",
    reEndLabel:"結束掃描", reEndTitle:"檢查而家嘅狀態",
    reMemoPlaceholder:"最大嘅感悟（可選）",
    completeTitle:"會話完成",
    completeMsgs:["做得好。為今日嘅你感到驕傲。","稍微輕鬆咗啲，呢樣就夠。","情緒唔需要改變，面對佢本身就係重要嘅。"],
    completeChangeLabel:"今次變化",
    completeActionLabel:"今日行動：",
    completeHomeBtn:"返回主頁",
    logTitle:"會話記錄", logEmpty:"暫無會話記錄",
    logBack:"← 返回列表", logChangeLabel:"變化",
    logEm:"🚨 緊急", logRe:"🌿 平靜",
    memoTitle:"日記", memoEmpty:"暫無日記",
    memoPh:"寫低你嘅想法…",
    memoTagPh:"標籤（可選）", memoAdd:"添加",
    memoEdit:"編輯", memoSave:"儲存", memoCancel:"取消",
    emoLabel:"情緒強度", urgeLabel:"衝動強度", bodyLabel:"身體緊張",
    thoughtLabel:"想法可信度", stressLabel:"生活壓力",
    afterEmoLabel:"3分鐘後嘅情緒強度",
    changeLabel:"變化",
    scoreEmo:"情緒", scoreUrge:"衝動", scoreBody:"身體緊張",
    navBack:"← 返回", navNext:"下一步 →", navSaveDone:"儲存並完成",
    timerStart:"開始", timerPause:"暫停", timerReset:"重置", timerDone:"完成!",
  },
  ko:{
    locale:"ko-KR", tagline:"두 마음이 이어지는 곳", subtitle:"지금 어떤 게 필요한가요?",
    heroLine1:"소중한 사람과", heroHighlight:'"최악의 결말"', heroLine2post:"을", heroLine3:"맞이하기 전에",
    em:"긴급 모드", emDesc:"폭발 직전\n충동을 멈추고 싶을 때", emTime:"5–7분",
    re:"일반 모드", reDesc:"조금 차분할 때\n천천히 정리하고 싶을 때", reTime:"15–25분",
    prevSess:"지난 세션", attLatest:"애착 유형 (최신)",
    diagBanner:"💞 애착 유형을 알고 나의 감정 패턴을 이해해보세요.",
    diagBtn:"진단하기 (2분)", later:"나중에",
    home:"홈", att:"애착", log:"로그", memo:"일기",
    draftSess:"진행 중인 세션", draftResume:"▶ 재개하기", draftDiscard:"삭제",
    draftStep:"단계", draftAt:"에서 중단", draftNone:"미선택",
    sessHome:"🏠 홈", sessSave:"💾 저장하고 나가기",
    cats:["싸운 직후","냉전 / 거리감","불안 (연락/읽씹)","자기비난","같은 패턴 반복","이별 / 관계 종료"],
    catIcons:["⚡","🧊","📱","💭","🔄","🍂"],
    urges:["바로 답장하기","긴 메시지 보내기","따지기","사과 연발","차단/숨기기","SNS 확인","헤어지자고 하기","기타"],
    regs:[{label:"호흡 (1분)",icon:"🫁"},{label:"발바닥에 집중",icon:"🦶"},{label:"찬물 (손/얼굴)",icon:"💧"},{label:"물 마시기",icon:"🥤"},{label:"어깨 힘 빼기",icon:"💆"}],
    trigs:["연락 늦음/읽씹","말투가 날카로움","약속이 바뀜","거짓말/숨김 의심","구속/간섭","거리를 둠","돈/부담","집안일/역할","가치관/미래"],
    amodes:[{id:"anxious",l:"불안 — 쫓아가고 싶음",icon:"😰"},{id:"avoidant",l:"회피 — 거리를 두고 싶음",icon:"🌫️"},{id:"stable",l:"둘 다 아님 / 모르겠음",icon:"🤷"}],
    mq1:["미움받았다","소중히 여겨지지 않는다","이제 끝일 수도","내 잘못이다","모르겠다"],
    mq3:["그건 상처받는 게 당연해","지금 아무것도 안 해도 돼","조금 더 정보를 기다려봐","상대도 지금 힘들지도 몰라","어떤 마음인지 들어볼 것 같아","기타"],
    mq4:["안심하고 싶다","소중히 여겨지고 싶다","존중받고 싶다","나를 지키고 싶다","통제감","모르겠다"],
    mq6:["아직 정보가 부족","상대가 바쁘거나 피곤함","내가 지쳐서 과민반응","타이밍이 안 좋음","다른 이유가 있음","모르겠다"],
    commits:["오늘은 답장을 서두르지 않기","보낸다면 짧게만","내일 다시 한 번 봐보기","산책/목욕/수면 우선","경계선을 말로 표현하기","기타"],
    ughOpts:["네 (하지만 지금은 참을게요)","조금 가라앉았어요","많이 가라앉았어요"],
    attQs:["답장이 늦으면 불안해진다","거리를 두면 쫓아가고 싶어진다","상대가 가까워지면 숨막힌다","솔직한 마음을 말하기 무섭다","상대 마음을 계속 확인하고 싶어진다","문제가 생기면 혼자 있고 싶어진다","거절이 무서워 참는 편이다","친밀해지면 갑자기 식어버린다"],
    attOpts:["0 — 전혀 없다","1 — 조금 있다","2 — 꽤 있다","3 — 매우 있다"],
    attTypes:{
      anxious:{label:"불안형",color:"#f08070",desc:"연결을 강하게 원하고, 상대의 반응에 매우 민감해요. 버려지는 두려움을 느끼기 쉬워요.",tips:["감정 일기 쓰기","지금 이 순간에 집중하는 연습","마음을 안정시키는 루틴 만들기"]},
      avoidant:{label:"회피형",color:"#70b8f0",desc:"친밀함이 커지면 거리를 두려는 경향이 있어요. 감정을 억제해서 혼자만의 안전을 지키려 해요.",tips:["감정에 이름 붙이는 연습","작은 자기 개방부터 시작하기","안전한 관계 공간 만들기"]},
      mixed:{label:"혼합형",color:"#e8c060",desc:"가까워지고 싶지만 상처받기 싫은 갈등을 안고 있어요. 상황에 따라 반응이 달라져요.",tips:["노트에 자신의 패턴을 관찰하기","안전한 관계 경험 쌓기","신뢰할 수 있는 지지자 찾기"]},
      secure:{label:"안정형",color:"#60cc80",desc:"비교적 균형 잡힌 애착 스타일이에요. 관계에서 안정감을 느끼기 쉽고, 적당한 거리를 유지할 수 있어요.",tips:["이 균형을 의식적으로 유지하기","파트너의 애착 니즈 이해하기","정기적으로 자기 점검하기"]},
      disorganized:{label:"혼란형",color:"#d080e0",desc:"불안과 회피 모두 높은 편이에요. 가까워지고 싶지만 두렵다는 모순된 감정을 안고 있어요.",tips:["감정 패턴을 기록해 자기 이해를 깊이하기","안전한 관계에서 천천히 신뢰 쌓기","전문적인 지원을 활용하는 것도 선택지입니다"]},
    },
    attAxisLabels:["불안 경향","혼란","회피 경향","안정성"],
    attDisorgSub:"（회피와 불안의 혼합）",
    attAnxious:"불안", attAvoidant:"회피",
    attDiagTitle:"애착 진단", attResultTitle:"진단 결과",
    attSaveHome:"저장하고 홈으로", attRecommend:"추천 활동",
    attTabTitle:"애착 스타일", attTabHistory:"애착 이력",
    attTabEmpty:"아직 진단하지 않았어요",
    attTabEmptyDesc:"애착 스타일을 알면\n나의 감정 패턴을 볼 수 있어요",
    attTabNew:"+ 진단하기", attTabRediag:"+ 재진단", attTabLatest:"최신",
    emScanLabel:"상황 스캔", emScanTitle:"지금 어떤 상황인가요?",
    emCatLabel:"상황 카테고리", emUrgeLabel:"가장 하고 싶은 행동",
    emUrgeOtherPh:"구체적으로 적기 (선택)",
    emCalmLabel:"진정", emCalmTitle:"할 수 있는 것 골라서 실행",
    emDelayLabel:"충동 지연", emDelayTitle:"실행했나요?",
    emDelaySub:"이제 3분 동안 핸드폰을 내려놓고\n아무것도 하지 마세요.",
    emDelayHint:"화면을 엎어놓고\n그냥 숨만 쉬어도 돼요.",
    emTimerBtn:"타이머 시작 →",
    emTimerLabel:"충동 지연", emTimerTitle:"3분 동안 그냥 두기",
    emTimerQ:"지금 바로 그 행동을 하고 싶나요?",
    emEndLabel:"종료 스캔", emEndTitle:"지금 상태 확인",
    emMemoPlaceholder:"짧은 메모 (선택)",
    reSitLabel:"상황·상태", reSitTitle:"지금 상황을 정리해봐요",
    reCatLabel:"상황 카테고리", reTrigLabel:"트리거 태그 (복수 선택 가능)",
    reModeLabel:"현재 반응 모드", reModeTitle:"지금 어느 쪽에 더 가까운가요?",
    reExpLabel:"노출 3분", reExpTitle:"감정과 그대로 마주하기",
    reExpHint:"도망가지 말고, 그냥 느끼세요.\n판단하지 말고, 해결하려 말고, 그냥 관찰하세요.",
    reWriteLabel:"글쓰기 표현", reWriteTitle:"종이에 쓰는 시간",
    reWriteInstruction:"📝 종이와 펜을 준비하세요",
    reWriteTips:"· 15분 동안 멈추지 않고 쓰기\n· 잘 쓸 필요 없어요",
    metaLabel:"메타인지",
    mq1Title:"머릿속에서 가장 강한 말은?",
    mq3Title:"친구가 같은 상황이라면 뭐라고 해줄 것 같아요?",
    mq3OtherPh:"구체적으로 적기 (선택)",
    mq4Title:"이 감정은 무엇을 지키고 있나요? (복수 선택 가능)",
    mq5Title:"최악의 상상이 실제로 일어날 확률은?",
    mq5Lo:"거의 없음", mq5Mid:"반반", mq5Hi:"거의 확실",
    mq6Title:"다른 가능성이 있다면? (복수 선택 가능)",
    commitLabel:"오늘의 행동", commitTitle:"딱 하나만 정하기",
    commitOtherPh:"구체적으로 적기 (선택)",
    reEndLabel:"종료 스캔", reEndTitle:"지금 상태 확인",
    reMemoPlaceholder:"가장 큰 깨달음 (선택)",
    completeTitle:"세션 완료",
    completeMsgs:["잘 해냈어요. 오늘의 당신이 자랑스러워요.","조금 편해졌어요. 그것으로 충분해요.","감정이 바뀌지 않아도 괜찮아요. 마주한 것 자체가 중요해요."],
    completeChangeLabel:"이번 세션의 변화",
    completeActionLabel:"오늘의 행동: ",
    completeHomeBtn:"홈으로 돌아가기",
    logTitle:"세션 로그", logEmpty:"아직 세션이 없어요",
    logBack:"← 목록으로", logChangeLabel:"변화",
    logEm:"🚨 긴급", logRe:"🌿 일반",
    memoTitle:"일기", memoEmpty:"아직 일기가 없어요",
    memoPh:"지금 떠오르는 생각…",
    memoTagPh:"태그 (선택)", memoAdd:"추가",
    memoEdit:"편집", memoSave:"저장", memoCancel:"취소",
    emoLabel:"감정 강도", urgeLabel:"충동 강도", bodyLabel:"신체 긴장",
    thoughtLabel:"생각 신뢰도", stressLabel:"생활 스트레스",
    afterEmoLabel:"3분 후 감정 강도",
    changeLabel:"변화",
    scoreEmo:"감정", scoreUrge:"충동", scoreBody:"신체 긴장",
    navBack:"← 뒤로", navNext:"다음 →", navSaveDone:"저장하고 완료",
    timerStart:"시작", timerPause:"일시정지", timerReset:"초기화", timerDone:"완료!",
  },
  es:{
    locale:"es-ES", tagline:"Un lugar para dos corazones", subtitle:"¿Qué necesitas ahora mismo?",
    heroLine1:"Antes del", heroHighlight:'"peor final"', heroLine2post:"", heroLine3:"con alguien que amas",
    em:"Modo urgente", emDesc:"A punto de explotar\nDetener el impulso ya", emTime:"5–7 min",
    re:"Modo calma", reDesc:"Un poco más tranquilo\nOrdenar los pensamientos", reTime:"15–25 min",
    prevSess:"Última sesión", attLatest:"Estilo de apego (último)",
    diagBanner:"💞 Descubre tu estilo de apego y entiende tus patrones.",
    diagBtn:"Hacer el test (2 min)", later:"Después",
    home:"Inicio", att:"Apego", log:"Registro", memo:"Diario",
    draftSess:"Sesión en progreso", draftResume:"▶ Reanudar", draftDiscard:"Descartar",
    draftStep:"Paso", draftAt:"interrumpido a las", draftNone:"Sin selección",
    sessHome:"🏠 Inicio", sessSave:"💾 Guardar y salir",
    cats:["Tras una pelea","Guerra fría / distancia","Ansiedad (sin respuesta)","Autoculpa","Mismo patrón","Ruptura / fin de la relación"],
    catIcons:["⚡","🧊","📱","💭","🔄","🍂"],
    urges:["Responder ahora mismo","Enviar un mensaje largo","Confrontarle","Disculparme repetidamente","Bloquear / silenciar","Ver su perfil","Hablar de ruptura","Otro"],
    regs:[{label:"Respirar (1 min)",icon:"🫁"},{label:"Sentir los pies en el suelo",icon:"🦶"},{label:"Agua fría (manos/cara)",icon:"💧"},{label:"Beber agua",icon:"🥤"},{label:"Relajar los hombros",icon:"💆"}],
    trigs:["Respuesta tardiva / visto","Tono brusco","Planes cambiados","Posible mentira / secreto","Control / ingérencia","Siento que me alejan","Dinero / carga","Tareas / roles","Valores / futuro"],
    amodes:[{id:"anxious",l:"Ansioso/a — quiero ir tras él/ella",icon:"😰"},{id:"avoidant",l:"Evitativo/a — quiero alejarme",icon:"🌫️"},{id:"stable",l:"Ninguno / no sé",icon:"🤷"}],
    mq1:["Me odian","No me cuidan","Quizá se acaba","Es mi culpa","No sé"],
    mq3:["Es normal que te duela","No tienes que hacer nada aún","Espera más información","Quizá él/ella también está desbordado/a","Le preguntaría cómo se siente","Otro"],
    mq4:["Quiero sentirme seguro/a","Quiero sentirme cuidado/a","Quiero sentirme respetado/a","Quiero protegerme","Quiero sensación de control","No sé"],
    mq6:["Aún no hay suficiente información","Está ocupado/a o cansado/a","Estoy agotado/a y sensible","Mal momento","Alguna otra razón","No sé"],
    commits:["No apresurar la respuesta hoy","Si escribo, que sea breve","Revisarlo mañana","Priorizar paseo / baño / dormir","Poner mis límites en palabras","Otro"],
    ughOpts:["Sí (pero me aguanto)","Ha bajado un poco","Ha bajado bastante"],
    attQs:["Me pongo ansioso/a cuando tardan en responder","Quiero ir tras alguien cuando se aleja","Me siento agobiado/a cuando alguien se acerca","Me da miedo compartir mis sentimientos reales","Necesito confirmar constantemente cómo se siente","Quiero estar solo/a cuando hay problemas","Aguanto para evitar el rechazo","Me enfría cuando las cosas se vuelven íntimas"],
    attOpts:["0 — Para nada","1 — Un poco","2 — Bastante","3 — Mucho"],
    attTypes:{
      anxious:{label:"Ansioso",color:"#f08070",desc:"Buscas conexión intensamente y eres muy sensible a las reacciones de los demás. Puedes temer el abandono.",tips:["Lleva un diario emocional","Practica vivir el momento presente","Crea una rutina que te calme"]},
      avoidant:{label:"Evitativo",color:"#70b8f0",desc:"Tiendes a crear distancia cuando la intimidad crece. Te proteges suprimiendo emociones.",tips:["Practica nombrar tus emociones","Empieza con pequeñas revelaciones","Crea espacios seguros de conexión"]},
      mixed:{label:"Mixto",color:"#e8c060",desc:"Quieres cercanía pero temes salir herido/a. Tus reacciones pueden variar según la situación.",tips:["Anota tus patrones en un diario","Busca experiencias de relación segura","Encuentra un apoyo de confianza"]},
      secure:{label:"Seguro",color:"#60cc80",desc:"Tienes un estilo de apego relativamente equilibrado. Puedes sentirte seguro/a en relaciones.",tips:["Sigue cultivando este equilibrio","Aprende las necesidades de apego de tu pareja","Haz un chequeo regular"]},
      disorganized:{label:"Desorganizado",color:"#d080e0",desc:"Muestras altos niveles de ansiedad y evitación. Puedes sentirte conflictuado/a — queriendo cercanía pero también temiéndola.",tips:["Registra tus patrones emocionales para conocerte mejor","Construye confianza gradualmente en relaciones seguras","Considera el apoyo profesional como opción"]},
    },
    attAxisLabels:["Ansioso","Desorganizado","Evitativo","Seguro"],
    attDisorgSub:"(Mezcla evitativo y ansioso)",
    attAnxious:"Ansioso", attAvoidant:"Evitativo",
    attDiagTitle:"Test de apego", attResultTitle:"Tu resultado",
    attSaveHome:"Guardar e ir al inicio", attRecommend:"Prácticas sugeridas",
    attTabTitle:"Estilo de apego", attTabHistory:"Historial de apego",
    attTabEmpty:"Sin resultados aún",
    attTabEmptyDesc:"Conocer tu estilo de apego\nte ayuda a ver tus patrones emocionales",
    attTabNew:"+ Hacer test", attTabRediag:"+ Repetir test", attTabLatest:"Último",
    emScanLabel:"Escáner situacional", emScanTitle:"¿Qué está pasando?",
    emCatLabel:"Categoría de situación", emUrgeLabel:"Impulso más fuerte ahora",
    emUrgeOtherPh:"Descríbelo (opcional)",
    emCalmLabel:"Calmarse", emCalmTitle:"Elige uno y hazlo ahora",
    emDelayLabel:"Retrasar el impulso", emDelayTitle:"¿Lo hiciste?",
    emDelaySub:"Ahora deja el teléfono 3 minutos\ny no hagas nada.",
    emDelayHint:"Deja la pantalla boca abajo\ny simplemente respira.",
    emTimerBtn:"Iniciar temporizador →",
    emTimerLabel:"Retrasar el impulso", emTimerTitle:"Solo déjalo estar 3 minutos",
    emTimerQ:"¿Todavía quieres actuar sobre ese impulso ahora mismo?",
    emEndLabel:"Escaneo final", emEndTitle:"Comprueba cómo estás ahora",
    emMemoPlaceholder:"Nota rápida (opcional)",
    reSitLabel:"Situación", reSitTitle:"Ordenemos qué está pasando",
    reCatLabel:"Categoría de situación", reTrigLabel:"Etiquetas de detonante (varias ok)",
    reModeLabel:"Modo de reacción", reModeTitle:"¿Cuál se acerca más a cómo te sientes?",
    reExpLabel:"Exposición 3 min", reExpTitle:"Siéntate con la emoción",
    reExpHint:"No huyas. Solo siéntela.\nSin juzgar. Sin resolver. Solo observa.",
    reWriteLabel:"Escritura expresiva", reWriteTitle:"Tiempo de escribir",
    reWriteInstruction:"📝 Coge papel y bolígrafo",
    reWriteTips:"· Escribe 15 min sin parar\n· No importa la forma",
    metaLabel:"Metacognición",
    mq1Title:"¿Cuál es el pensamiento más fuerte en tu cabeza?",
    mq3Title:"¿Qué le dirías a un amigo en esta situación?",
    mq3OtherPh:"Descríbelo (opcional)",
    mq4Title:"¿Qué está protegiendo este sentimiento? (varias ok)",
    mq5Title:"¿Qué probabilidad le das a tu peor escenario?",
    mq5Lo:"Casi nunca", mq5Mid:"50/50", mq5Hi:"Casi seguro",
    mq6Title:"¿Qué otras posibilidades existen? (varias ok)",
    commitLabel:"Acción de hoy", commitTitle:"Elige solo una",
    commitOtherPh:"Descríbelo (opcional)",
    reEndLabel:"Escaneo final", reEndTitle:"Comprueba cómo estás ahora",
    reMemoPlaceholder:"Mayor aprendizaje (opcional)",
    completeTitle:"Sesión completa",
    completeMsgs:["Bien hecho. Estoy orgulloso/a de ti hoy.","Te sientes un poco mejor. Es suficiente.","Las emociones no tienen que cambiar. Afrontarlas es lo que importa."],
    completeChangeLabel:"Cambio esta sesión",
    completeActionLabel:"Acción de hoy: ",
    completeHomeBtn:"Volver al inicio",
    logTitle:"Registro de sesiones", logEmpty:"Sin sesiones aún",
    logBack:"← Volver", logChangeLabel:"Cambio",
    logEm:"🚨 Urgente", logRe:"🌿 Calma",
    memoTitle:"Diario", memoEmpty:"Sin entradas aún",
    memoPh:"¿Qué tienes en mente?…",
    memoTagPh:"Etiqueta (opcional)", memoAdd:"Añadir",
    memoEdit:"Editar", memoSave:"Guardar", memoCancel:"Cancelar",
    emoLabel:"Intensidad emocional", urgeLabel:"Intensidad del impulso", bodyLabel:"Tensión corporal",
    thoughtLabel:"Credibilidad del pensamiento", stressLabel:"Estrés vital",
    afterEmoLabel:"Intensidad emocional tras 3 min",
    changeLabel:"Cambio",
    scoreEmo:"Emoción", scoreUrge:"Impulso", scoreBody:"Tensión corporal",
    navBack:"← Atrás", navNext:"Siguiente →", navSaveDone:"Guardar y terminar",
    timerStart:"Iniciar", timerPause:"Pausar", timerReset:"Reiniciar", timerDone:"¡Listo!",
  },
  fr:{
    locale:"fr-FR", tagline:"Un lieu pour deux cœurs", subtitle:"De quoi avez-vous besoin maintenant ?",
    heroLine1:"Avant le", heroHighlight:'"pire dénouement"', heroLine2post:"", heroLine3:"avec quelqu'un qui compte",
    em:"Mode urgence", emDesc:"Sur le point d'exploser\nArrêter l'impulsion", emTime:"5–7 min",
    re:"Mode calme", reDesc:"Un peu plus calme\nPrendre le temps de réfléchir", reTime:"15–25 min",
    prevSess:"Dernière session", attLatest:"Style d'attachement (dernier)",
    diagBanner:"💞 Découvrez votre style d'attachement et comprenez vos schémas.",
    diagBtn:"Faire le test (2 min)", later:"Plus tard",
    home:"Accueil", att:"Attachement", log:"Journal", memo:"Notes",
    draftSess:"Session en cours", draftResume:"▶ Reprendre", draftDiscard:"Abandonner",
    draftStep:"Étape", draftAt:"interrompue à", draftNone:"Non sélectionné",
    sessHome:"🏠 Accueil", sessSave:"💾 Enregistrer et quitter",
    cats:["Après une dispute","Guerre froide / distance","Anxiété (pas de réponse)","Auto-culpabilité","Même schéma répété","Rupture / fin de relation"],
    catIcons:["⚡","🧊","📱","💭","🔄","🍂"],
    urges:["Répondre tout de suite","Envoyer un long message","Confronter","S'excuser sans cesse","Bloquer / couper le son","Vérifier ses réseaux","Parler de rupture","Autre"],
    regs:[{label:"Respirer (1 min)",icon:"🫁"},{label:"Sentir ses pieds au sol",icon:"🦶"},{label:"Eau froide (mains/visage)",icon:"💧"},{label:"Boire de l'eau",icon:"🥤"},{label:"Relâcher les épaules",icon:"💆"}],
    trigs:["Réponse tardive / vu","Ton dur","Plans changés","Possible mensonge / secret","Contrôle / ingérence","Sentiment de rejet","Argent / charge","Tâches / rôles","Valeurs / avenir"],
    amodes:[{id:"anxious",l:"Anxieux/se — envie de courir après",icon:"😰"},{id:"avoidant",l:"Évitant/e — envie de prendre de la distance",icon:"🌫️"},{id:"stable",l:"Ni l'un ni l'autre / je ne sais pas",icon:"🤷"}],
    mq1:["Il/elle me déteste","Je ne suis pas aimé(e)","C'est peut-être fini","C'est ma faute","Je ne sais pas"],
    mq3:["C'est normal d'être blessé(e)","Tu n'as pas à faire quoi que ce soit","Attends plus d'informations","Il/elle est peut-être aussi dépassé(e)","Je lui demanderais comment il/elle se sent","Autre"],
    mq4:["Je veux me sentir en sécurité","Je veux me sentir chéri(e)","Je veux me sentir respecté(e)","Je veux me protéger","Je veux un sentiment de contrôle","Je ne sais pas"],
    mq6:["Pas assez d'informations encore","Il/elle est occupé(e) ou fatigué(e)","Je suis épuisé(e) et hypersensible","Mauvais timing","Une autre raison","Je ne sais pas"],
    commits:["Ne pas précipiter une réponse aujourd'hui","Si j'envoie quelque chose, rester bref","Y revenir demain","Prioriser une promenade / bain / sommeil","Formuler ma limite","Autre"],
    ughOpts:["Oui (mais je me retiens)","Ça a un peu baissé","Ça a beaucoup baissé"],
    attQs:["Je stresse quand les réponses tardent","Je veux courir après quand quelqu'un s'éloigne","Je me sens étouffé(e) quand quelqu'un se rapproche","C'est effrayant de partager mes vrais sentiments","Je dois vérifier constamment comment ils se sentent","Je veux être seul(e) quand des problèmes surgissent","Je me retiens pour éviter le rejet","Je me refroidis quand les choses deviennent intimes"],
    attOpts:["0 — Pas du tout","1 — Un peu","2 — Assez","3 — Beaucoup"],
    attTypes:{
      anxious:{label:"Anxieux",color:"#f08070",desc:"Vous cherchez intensément la connexion et êtes très sensible aux réactions des autres. Vous pouvez craindre l'abandon.",tips:["Tenez un journal émotionnel","Pratiquez la pleine conscience","Créez une routine apaisante"]},
      avoidant:{label:"Évitant",color:"#70b8f0",desc:"Vous tendez à créer de la distance quand l'intimité grandit. Vous vous protégez en supprimant vos émotions.",tips:["Pratiquez la nomination de vos émotions","Commencez par de petites révélations","Créez des espaces sûrs de connexion"]},
      mixed:{label:"Mixte",color:"#e8c060",desc:"Vous voulez de la proximité mais craignez d'être blessé(e). Vos réactions peuvent varier selon les situations.",tips:["Notez vos schémas dans un journal","Cherchez des expériences relationnelles sûres","Trouvez un soutien de confiance"]},
      secure:{label:"Sécure",color:"#60cc80",desc:"Vous avez un style d'attachement relativement équilibré. Vous pouvez vous sentir en sécurité dans les relations.",tips:["Continuez à cultiver cet équilibre","Apprenez les besoins d'attachement de votre partenaire","Faites un bilan régulier"]},
      disorganized:{label:"Désorganisé",color:"#d080e0",desc:"Vous présentez de hauts niveaux d'anxiété et d'évitement. Vous pouvez vous sentir partagé(e) — désirant la proximité mais la craignant aussi.",tips:["Notez vos schémas émotionnels pour mieux vous connaître","Construisez la confiance progressivement dans des relations sûres","Envisagez un soutien professionnel"]},
    },
    attAxisLabels:["Anxieux","Désorganisé","Évitant","Sécure"],
    attDisorgSub:"(Mélange évitant et anxieux)",
    attAnxious:"Anxieux", attAvoidant:"Évitant",
    attDiagTitle:"Test d'attachement", attResultTitle:"Votre résultat",
    attSaveHome:"Enregistrer et rentrer", attRecommend:"Pratiques suggérées",
    attTabTitle:"Style d'attachement", attTabHistory:"Historique d'attachement",
    attTabEmpty:"Pas encore de résultats",
    attTabEmptyDesc:"Connaître votre style d'attachement\nvous aide à comprendre vos schémas émotionnels",
    attTabNew:"+ Faire le test", attTabRediag:"+ Refaire le test", attTabLatest:"Dernier",
    emScanLabel:"Scan situationnel", emScanTitle:"Que se passe-t-il ?",
    emCatLabel:"Catégorie de situation", emUrgeLabel:"Impulsion la plus forte en ce moment",
    emUrgeOtherPh:"Décrivez (optionnel)",
    emCalmLabel:"Se calmer", emCalmTitle:"Choisissez-en un et faites-le maintenant",
    emDelayLabel:"Retarder l'impulsion", emDelayTitle:"L'avez-vous fait ?",
    emDelaySub:"Maintenant posez le téléphone 3 minutes\net ne faites rien du tout.",
    emDelayHint:"Posez l'écran face contre terre\net respirez simplement.",
    emTimerBtn:"Lancer le minuteur →",
    emTimerLabel:"Retarder l'impulsion", emTimerTitle:"Laissez-le reposer 3 minutes",
    emTimerQ:"Voulez-vous encore agir sur cette impulsion maintenant ?",
    emEndLabel:"Scan final", emEndTitle:"Comment vous sentez-vous maintenant ?",
    emMemoPlaceholder:"Note rapide (optionnel)",
    reSitLabel:"Situation", reSitTitle:"Clarifions ce qui se passe",
    reCatLabel:"Catégorie de situation", reTrigLabel:"Tags déclencheurs (plusieurs ok)",
    reModeLabel:"Mode de réaction", reModeTitle:"Lequel correspond le mieux à ce que vous ressentez ?",
    reExpLabel:"Exposition 3 min", reExpTitle:"Restez avec l'émotion",
    reExpHint:"Ne fuyez pas. Ressentez-la.\nSans juger. Sans résoudre. Observez seulement.",
    reWriteLabel:"Écriture expressive", reWriteTitle:"C'est l'heure d'écrire",
    reWriteInstruction:"📝 Prenez du papier et un stylo",
    reWriteTips:"· Écrivez 15 min sans vous arrêter\n· La forme n'a pas d'importance",
    metaLabel:"Métacognition",
    mq1Title:"Quelle est la pensée la plus forte dans votre tête ?",
    mq3Title:"Que diriez-vous à un ami dans cette situation ?",
    mq3OtherPh:"Décrivez (optionnel)",
    mq4Title:"Qu'est-ce que ce sentiment protège ? (plusieurs ok)",
    mq5Title:"Quelle probabilité donnez-vous à votre pire scénario ?",
    mq5Lo:"Presque jamais", mq5Mid:"50/50", mq5Hi:"Presque certain",
    mq6Title:"Quelles autres possibilités existent ? (plusieurs ok)",
    commitLabel:"Action du jour", commitTitle:"Choisissez-en une seule",
    commitOtherPh:"Décrivez (optionnel)",
    reEndLabel:"Scan final", reEndTitle:"Comment vous sentez-vous maintenant ?",
    reMemoPlaceholder:"Plus grande prise de conscience (optionnel)",
    completeTitle:"Session terminée",
    completeMsgs:["Bien joué. Je suis fier/fière de vous aujourd'hui.","Vous vous sentez un peu mieux. C'est suffisant.","Les émotions n'ont pas besoin de changer. Y faire face est ce qui compte."],
    completeChangeLabel:"Changement cette session",
    completeActionLabel:"Action du jour : ",
    completeHomeBtn:"Retour à l'accueil",
    logTitle:"Journal de sessions", logEmpty:"Pas encore de sessions",
    logBack:"← Retour", logChangeLabel:"Changement",
    logEm:"🚨 Urgence", logRe:"🌿 Calme",
    memoTitle:"Notes", memoEmpty:"Pas encore de notes",
    memoPh:"Ce qui vous traverse l'esprit…",
    memoTagPh:"Étiquette (optionnel)", memoAdd:"Ajouter",
    memoEdit:"Modifier", memoSave:"Enregistrer", memoCancel:"Annuler",
    emoLabel:"Intensité émotionnelle", urgeLabel:"Intensité de l'impulsion", bodyLabel:"Tension corporelle",
    thoughtLabel:"Crédibilité de la pensée", stressLabel:"Stress de vie",
    afterEmoLabel:"Intensité émotionnelle après 3 min",
    changeLabel:"Changement",
    scoreEmo:"Émotion", scoreUrge:"Impulsion", scoreBody:"Tension corporelle",
    navBack:"← Retour", navNext:"Suivant →", navSaveDone:"Enregistrer et terminer",
    timerStart:"Démarrer", timerPause:"Pause", timerReset:"Réinitialiser", timerDone:"Terminé !",
  },
  ru:{
    locale:"ru-RU", tagline:"Место для двух сердец", subtitle:"Что вам нужно прямо сейчас?",
    heroLine1:"До", heroHighlight:'"худшего конца"', heroLine2post:"", heroLine3:"с любимым человеком",
    em:"Экстренный режим", emDesc:"Вот-вот взорвусь\nОстановить импульс", emTime:"5–7 мин",
    re:"Спокойный режим", reDesc:"Немного спокойнее\nРазобраться в чувствах", reTime:"15–25 мин",
    prevSess:"Последняя сессия", attLatest:"Стиль привязанности (посл.)",
    diagBanner:"💞 Узнайте свой стиль привязанности и поймите свои паттерны.",
    diagBtn:"Пройти тест (2 мин)", later:"Позже",
    home:"Главная", att:"Привязан.", log:"Журнал", memo:"Дневник",
    draftSess:"Сессия в процессе", draftResume:"▶ Продолжить", draftDiscard:"Удалить",
    draftStep:"Шаг", draftAt:"прервано в", draftNone:"Не выбрано",
    sessHome:"🏠 Главная", sessSave:"💾 Сохранить и выйти",
    cats:["После ссоры","Холодная война / дистанция","Тревога (нет ответа)","Самообвинение","Повторяющийся паттерн","Расставание / конец отношений"],
    catIcons:["⚡","🧊","📱","💭","🔄","🍂"],
    urges:["Ответить прямо сейчас","Отправить длинное сообщение","Выяснить отношения","Просить прощения снова и снова","Заблокировать / отключить звук","Проверить соцсети","Заговорить о разрыве","Другое"],
    regs:[{label:"Дышать (1 мин)",icon:"🫁"},{label:"Почувствовать ноги на полу",icon:"🦶"},{label:"Холодная вода (руки/лицо)",icon:"💧"},{label:"Выпить воды",icon:"🥤"},{label:"Расслабить плечи",icon:"💆"}],
    trigs:["Долго не отвечает / прочитано","Резкий тон","Изменение планов","Возможная ложь / тайна","Контроль / вмешательство","Ощущение отчуждения","Деньги / бремя","Обязанности / роли","Ценности / будущее"],
    amodes:[{id:"anxious",l:"Тревожный — хочу преследовать",icon:"😰"},{id:"avoidant",l:"Избегающий — хочу дистанцироваться",icon:"🌫️"},{id:"stable",l:"Ни то ни другое / не знаю",icon:"🤷"}],
    mq1:["Меня ненавидят","Обо мне не заботятся","Возможно, всё кончено","Это моя вина","Не знаю"],
    mq3:["Обидеться — это нормально","Тебе не нужно ничего делать сейчас","Подожди больше информации","Им тоже сейчас может быть тяжело","Я бы спросил/а, как они себя чувствуют","Другое"],
    mq4:["Хочу чувствовать себя в безопасности","Хочу заботы","Хочу уважения","Хочу защитить себя","Хочу ощущения контроля","Не знаю"],
    mq6:["Ещё недостаточно информации","Они заняты или устали","Я сам/а устал/а и слишком чувствителен/на","Плохое время","Какая-то другая причина","Не знаю"],
    commits:["Не торопиться с ответом сегодня","Если напишу, то коротко","Пересмотреть завтра","Приоритет — прогулка / ванна / сон","Сформулировать свою границу","Другое"],
    ughOpts:["Да (но сдерживаюсь)","Немного спало","Значительно спало"],
    attQs:["Я тревожусь, когда медленно отвечают","Я хочу преследовать, когда кто-то отдаляется","Мне тяжело дышать, когда кто-то слишком близко","Страшно делиться настоящими чувствами","Мне нужно постоянно проверять, как они себя чувствуют","Я хочу быть один/а, когда есть проблемы","Терплю, чтобы не быть отвергнутым/ой","Остываю, когда отношения становятся близкими"],
    attOpts:["0 — Совсем нет","1 — Немного","2 — Довольно много","3 — Очень много"],
    attTypes:{
      anxious:{label:"Тревожный",color:"#f08070",desc:"Вы интенсивно ищете связь и очень чувствительны к реакциям других. Вы можете бояться быть брошенным/ой.",tips:["Ведите дневник эмоций","Практикуйте осознанность настоящего момента","Создайте успокаивающую рутину"]},
      avoidant:{label:"Избегающий",color:"#70b8f0",desc:"Вы склонны создавать дистанцию по мере роста близости. Вы защищаете себя, подавляя эмоции.",tips:["Практикуйте называние своих эмоций","Начните с небольшого самораскрытия","Создавайте безопасные пространства для связи"]},
      mixed:{label:"Смешанный",color:"#e8c060",desc:"Вы хотите близости, но боитесь быть ранённым/ой. Ваши реакции могут меняться в зависимости от ситуации.",tips:["Записывайте свои паттерны в дневник","Ищите опыт безопасных отношений","Найдите надёжного помощника"]},
      secure:{label:"Надёжный",color:"#60cc80",desc:"У вас относительно сбалансированный стиль привязанности. Вы можете чувствовать себя в безопасности в отношениях.",tips:["Продолжайте развивать этот баланс","Изучите потребности привязанности партнёра","Регулярно проверяйте себя"]},
      disorganized:{label:"Дезорганизованный",color:"#d080e0",desc:"У вас высокий уровень как тревожности, так и избегания. Вы можете чувствовать внутренний конфликт — желать близости, но бояться её.",tips:["Отслеживайте эмоциональные паттерны для самопознания","Постепенно выстраивайте доверие в безопасных отношениях","Рассмотрите профессиональную поддержку как вариант"]},
    },
    attAxisLabels:["Тревожность","Дезорган.","Избегание","Надёжность"],
    attDisorgSub:"(Смесь избегания и тревоги)",
    attAnxious:"Тревожность", attAvoidant:"Избегание",
    attDiagTitle:"Тест привязанности", attResultTitle:"Ваш результат",
    attSaveHome:"Сохранить и на главную", attRecommend:"Рекомендуемые практики",
    attTabTitle:"Стиль привязанности", attTabHistory:"История привязанности",
    attTabEmpty:"Результатов пока нет",
    attTabEmptyDesc:"Знание своего стиля привязанности\nпомогает понять эмоциональные паттерны",
    attTabNew:"+ Пройти тест", attTabRediag:"+ Пройти снова", attTabLatest:"Последний",
    emScanLabel:"Скан ситуации", emScanTitle:"Что происходит?",
    emCatLabel:"Категория ситуации", emUrgeLabel:"Самый сильный импульс сейчас",
    emUrgeOtherPh:"Опишите (необязательно)",
    emCalmLabel:"Успокоиться", emCalmTitle:"Выберите одно и сделайте прямо сейчас",
    emDelayLabel:"Задержать импульс", emDelayTitle:"Вы сделали это?",
    emDelaySub:"Теперь отложите телефон на 3 минуты\nи ничего не делайте.",
    emDelayHint:"Положите экран вниз\nи просто дышите.",
    emTimerBtn:"Запустить таймер →",
    emTimerLabel:"Задержать импульс", emTimerTitle:"Просто подождите 3 минуты",
    emTimerQ:"Вы всё ещё хотите действовать по этому импульсу прямо сейчас?",
    emEndLabel:"Финальный скан", emEndTitle:"Проверьте, как вы себя чувствуете",
    emMemoPlaceholder:"Краткая заметка (необязательно)",
    reSitLabel:"Ситуация", reSitTitle:"Разберёмся, что происходит",
    reCatLabel:"Категория ситуации", reTrigLabel:"Теги триггеров (можно несколько)",
    reModeLabel:"Режим реакции", reModeTitle:"Что из этого ближе к вашему ощущению?",
    reExpLabel:"Экспозиция 3 мин", reExpTitle:"Побудьте с эмоцией",
    reExpHint:"Не убегайте. Просто чувствуйте.\nБез оценок. Без решений. Только наблюдение.",
    reWriteLabel:"Экспрессивное письмо", reWriteTitle:"Время писать",
    reWriteInstruction:"📝 Возьмите бумагу и ручку",
    reWriteTips:"· Пишите 15 мин не останавливаясь\n· Форма не важна",
    metaLabel:"Метакогниция",
    mq1Title:"Какая мысль сейчас самая сильная?",
    mq3Title:"Что бы вы сказали другу в такой ситуации?",
    mq3OtherPh:"Опишите (необязательно)",
    mq4Title:"Что защищает это чувство? (можно несколько)",
    mq5Title:"Какова вероятность вашего худшего сценария?",
    mq5Lo:"Почти никогда", mq5Mid:"50/50", mq5Hi:"Почти наверняка",
    mq6Title:"Какие ещё возможности существуют? (можно несколько)",
    commitLabel:"Действие сегодня", commitTitle:"Выберите только одно",
    commitOtherPh:"Опишите (необязательно)",
    reEndLabel:"Финальный скан", reEndTitle:"Проверьте, как вы себя чувствуете",
    reMemoPlaceholder:"Главное осознание (необязательно)",
    completeTitle:"Сессия завершена",
    completeMsgs:["Отличная работа. Горжусь вами сегодня.","Стало чуть легче. Этого достаточно.","Эмоциям не нужно меняться. Важно то, что вы с ними встретились."],
    completeChangeLabel:"Изменение за эту сессию",
    completeActionLabel:"Действие сегодня: ",
    completeHomeBtn:"На главную",
    logTitle:"Журнал сессий", logEmpty:"Сессий пока нет",
    logBack:"← Назад", logChangeLabel:"Изменение",
    logEm:"🚨 Экстренный", logRe:"🌿 Спокойный",
    memoTitle:"Дневник", memoEmpty:"Записей пока нет",
    memoPh:"Что у вас на уме…",
    memoTagPh:"Тег (необязательно)", memoAdd:"Добавить",
    memoEdit:"Редактировать", memoSave:"Сохранить", memoCancel:"Отмена",
    emoLabel:"Интенсивность эмоций", urgeLabel:"Интенсивность импульса", bodyLabel:"Телесное напряжение",
    thoughtLabel:"Достоверность мысли", stressLabel:"Стресс в жизни",
    afterEmoLabel:"Интенсивность эмоций после 3 мин",
    changeLabel:"Изменение",
    scoreEmo:"Эмоции", scoreUrge:"Импульс", scoreBody:"Напряжение тела",
    navBack:"← Назад", navNext:"Далее →", navSaveDone:"Сохранить и завершить",
    timerStart:"Старт", timerPause:"Пауза", timerReset:"Сброс", timerDone:"Готово!",
  },
};

// ── Theme ─────────────────────────────────────────────────────────────────────
const TH = {
  panelBg:"rgba(4,20,8,0.88)", blur:"blur(22px)",
  text:"#dff0e2", sub:"rgba(215,238,220,0.85)", muted:"rgba(180,220,188,0.50)",
  border:"rgba(65,195,85,0.16)",
  card:"rgba(5,22,9,0.75)", cardB:"rgba(65,195,85,0.14)",
  sel:"rgba(65,175,85,0.28)", selB:"rgba(65,175,85,0.80)",
  inp:"rgba(255,255,255,0.08)",
};

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const ICON_COLORS = {
  siren:"#ff7080", leaf:"#5ee888", home:"#e0c860", heart:"#f06878",
  log:"#70c8b8", book:"#d4984e", sprout:"#70e8a0",
  bolt:"#f0d040", snowflake:"#88c8f8", phone:"#b888f0",
  bubble:"#f09870", refresh:"#48c8a8", maple:"#e06830",
  lungs:"#78b4f8", foot:"#c4a060", drop:"#50c0e8",
  cup:"#68d8a8", relax:"#c098d8",
  worried:"#f08850", waves:"#88a8d8", neutral:"#98b888",
};
const IC = {
  siren: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 15.5C6.5 11 9.2 8.5 12 8.5C14.8 8.5 17.5 11 17.5 15.5" fill={color} fillOpacity="0.18"/>
      <path d="M6.5 15.5C6.5 11 9.2 8.5 12 8.5C14.8 8.5 17.5 11 17.5 15.5"/>
      <line x1="4.5" y1="15.5" x2="19.5" y2="15.5"/>
      <rect x="6" y="17" width="12" height="2.5" rx="1.2" fill={color} fillOpacity="0.25"/>
      <rect x="6" y="17" width="12" height="2.5" rx="1.2"/>
      <line x1="12" y1="3" x2="12" y2="5.5"/>
      <line x1="17.5" y1="5.2" x2="16" y2="6.8"/>
      <line x1="6.5" y1="5.2" x2="8" y2="6.8"/>
      <line x1="21" y1="11.5" x2="19" y2="11.5"/>
      <line x1="3" y1="11.5" x2="5" y2="11.5"/>
    </svg>
  ),
  leaf: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 20C6 20 5 12 11 8S21 5 21 5C21 5 20 14 14 17S6 20 6 20Z" fill={color} fillOpacity="0.18"/>
      <path d="M6 20C6 20 5 12 11 8S21 5 21 5C21 5 20 14 14 17S6 20 6 20Z"/>
      <path d="M6 20Q10.5 15 18 7"/>
    </svg>
  ),
  home: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" fill={color} fillOpacity="0.12"/>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <polyline points="9,21 9,12 15,12 15,21" fill={color} fillOpacity="0.2"/>
      <polyline points="9,21 9,12 15,12 15,21"/>
    </svg>
  ),
  heart: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={color} fillOpacity="0.22"/>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  log: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="6" x2="20" y2="6"/>
      <line x1="9" y1="12" x2="20" y2="12"/>
      <line x1="9" y1="18" x2="16" y2="18"/>
      <circle cx="4.5" cy="6" r="1.4" fill={color} stroke="none"/>
      <circle cx="4.5" cy="12" r="1.4" fill={color} stroke="none"/>
      <circle cx="4.5" cy="18" r="1.4" fill={color} stroke="none"/>
    </svg>
  ),
  book: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" fill={color} fillOpacity="0.12"/>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      <line x1="8" y1="8" x2="14" y2="8"/>
      <line x1="8" y1="12" x2="12" y2="12"/>
    </svg>
  ),
  bolt: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13,2 8,12 12,12 11,22 16,12 12,12 13,2" fill={color} fillOpacity="0.25"/>
      <polyline points="13,2 8,12 12,12 11,22 16,12 12,12 13,2"/>
    </svg>
  ),
  snowflake: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
      <circle cx="12" cy="12" r="2.5" fill={color} fillOpacity="0.35" stroke="none"/>
    </svg>
  ),
  phone: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="10" height="20" rx="2" fill={color} fillOpacity="0.12"/>
      <rect x="7" y="2" width="10" height="20" rx="2"/>
      <circle cx="9.5" cy="12" r="1.2" fill={color} stroke="none"/>
      <circle cx="12" cy="12" r="1.2" fill={color} stroke="none"/>
      <circle cx="14.5" cy="12" r="1.2" fill={color} stroke="none"/>
    </svg>
  ),
  bubble: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill={color} fillOpacity="0.15"/>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  refresh: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6"/>
      <path d="M1 20v-6h6"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10"/>
      <path d="M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  ),
  maple: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L10 6L7 5L8.5 8.5L5 10L8 12L7 15.5L10 14L12 22L14 14L17 15.5L16 12L19 10L15.5 8.5L17 5L14 6Z" fill={color} fillOpacity="0.22"/>
      <path d="M12 2L10 6L7 5L8.5 8.5L5 10L8 12L7 15.5L10 14L12 22L14 14L17 15.5L16 12L19 10L15.5 8.5L17 5L14 6Z"/>
    </svg>
  ),
  lungs: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="4" x2="12" y2="11"/>
      <path d="M12 11C12 11 9.5 11 8.5 13.5S8 18 8 19C8 20.5 9 22 10.5 22C11.5 22 12 21.2 12 20" fill={color} fillOpacity="0.15"/>
      <path d="M12 11C12 11 14.5 11 15.5 13.5S16 18 16 19C16 20.5 15 22 13.5 22C12.5 22 12 21.2 12 20" fill={color} fillOpacity="0.15"/>
      <path d="M12 11C12 11 9.5 11 8.5 13.5S8 18 8 19C8 20.5 9 22 10.5 22C11.5 22 12 21.2 12 20"/>
      <path d="M12 11C12 11 14.5 11 15.5 13.5S16 18 16 19C16 20.5 15 22 13.5 22C12.5 22 12 21.2 12 20"/>
      <path d="M10 4Q12 2.5 14 4"/>
    </svg>
  ),
  foot: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 22C7 22 5.5 20 6.5 17C7.5 14 7.5 11 8.5 9C9.5 7 10.5 6 12 6C13.5 6 14.5 8 14.5 11C14.5 14 13 17.5 12 19.5C11 21.5 11 22 11 22" fill={color} fillOpacity="0.15"/>
      <path d="M9 22C7 22 5.5 20 6.5 17C7.5 14 7.5 11 8.5 9C9.5 7 10.5 6 12 6C13.5 6 14.5 8 14.5 11C14.5 14 13 17.5 12 19.5C11 21.5 11 22 11 22"/>
      <ellipse cx="6.5" cy="7.5" rx="1.3" ry="1.5" fill={color} fillOpacity="0.6" stroke={color} strokeWidth="0.8"/>
      <ellipse cx="8" cy="4.8" rx="1.1" ry="1.3" fill={color} fillOpacity="0.6" stroke={color} strokeWidth="0.8"/>
      <ellipse cx="10.5" cy="3.5" rx="1.1" ry="1.3" fill={color} fillOpacity="0.6" stroke={color} strokeWidth="0.8"/>
      <ellipse cx="13" cy="4" rx="1.1" ry="1.3" fill={color} fillOpacity="0.6" stroke={color} strokeWidth="0.8"/>
      <ellipse cx="15" cy="5.5" rx="1" ry="1.2" fill={color} fillOpacity="0.6" stroke={color} strokeWidth="0.8"/>
    </svg>
  ),
  drop: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C12 2 5 11 5 15.5A7 7 0 0019 15.5C19 11 12 2 12 2Z" fill={color} fillOpacity="0.22"/>
      <path d="M12 2C12 2 5 11 5 15.5A7 7 0 0019 15.5C19 11 12 2 12 2Z"/>
      <path d="M9 16Q11 14 14 15.5" strokeWidth="1.2"/>
    </svg>
  ),
  cup: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 3.5L7.5 20.5H16.5L15.5 3.5Z" fill={color} fillOpacity="0.15"/>
      <path d="M8.5 3.5L7.5 20.5H16.5L15.5 3.5Z"/>
      <line x1="6" y1="20.5" x2="18" y2="20.5"/>
      <path d="M15.5 7.5C18.5 7.5 20 9 20 11.5S18.5 15 15.5 15"/>
      <path d="M9.5 10Q11 8.5 12.5 10" strokeWidth="1.3"/>
    </svg>
  ),
  relax: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5.5" r="2.5" fill={color} fillOpacity="0.22"/>
      <circle cx="12" cy="5.5" r="2.5"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <path d="M5 16C7 13.5 9.5 12 12 12S17 13.5 19 16"/>
      <path d="M5 16C4.5 18 5 20 5.5 21"/>
      <path d="M19 16C19.5 18 19 20 18.5 21"/>
    </svg>
  ),
  worried: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" fill={color} fillOpacity="0.12"/>
      <circle cx="12" cy="12" r="8"/>
      <path d="M9 16Q10.5 14.5 12 14.5T15 16"/>
      <circle cx="9.5" cy="9.5" r="1.2" fill={color} stroke="none"/>
      <circle cx="14.5" cy="9.5" r="1.2" fill={color} stroke="none"/>
      <path d="M18 6.5Q19.5 5 20.5 5.5" strokeWidth="1.3"/>
    </svg>
  ),
  waves: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7Q6 5 9 7T15 7T21 7" strokeOpacity="0.6"/>
      <path d="M3 12Q6 10 9 12T15 12T21 12"/>
      <path d="M3 17Q6 15 9 17T15 17T21 17" strokeOpacity="0.6"/>
    </svg>
  ),
  neutral: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" fill={color} fillOpacity="0.12"/>
      <circle cx="12" cy="12" r="8"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
      <circle cx="9.5" cy="9.5" r="1.2" fill={color} stroke="none"/>
      <circle cx="14.5" cy="9.5" r="1.2" fill={color} stroke="none"/>
    </svg>
  ),
  sprout: ({size=24,color="currentColor"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V13"/>
      <path d="M12 13C12 13 7 13 7 8S12 3 12 3C12 3 17 3 17 8S12 13 12 13Z" fill={color} fillOpacity="0.2"/>
      <path d="M12 13C12 13 7 13 7 8S12 3 12 3C12 3 17 3 17 8S12 13 12 13Z"/>
    </svg>
  ),
};
function SvgIcon({name, size=24, color}) {
  const I = IC[name];
  const c = color ?? ICON_COLORS[name] ?? "currentColor";
  return I ? <I size={size} color={c}/> : null;
}
const CAT_ICONS = ["bolt","snowflake","phone","bubble","refresh","maple"];
const REG_ICONS = ["lungs","foot","drop","cup","relax"];
const AMODE_ICONS = {anxious:"worried", avoidant:"waves", stable:"neutral"};

function getTypeInfo(r, t) {
  const a=r.anxious, v=r.avoidant;
  const types = t?.attTypes || T.ja.attTypes;
  if(a>50 && v>50) return {label:types.disorganized?.label||T.ja.attTypes.disorganized.label, color:types.disorganized?.color||"#d080e0", short:"disorganized"};
  if(a>50) return {label:types.anxious.label, color:types.anxious.color, short:"anxious"};
  if(v>50) return {label:types.avoidant.label, color:types.avoidant.color, short:"avoidant"};
  return {label:types.secure.label, color:types.secure.color, short:"secure"};
}

// ── Radar ─────────────────────────────────────────────────────────────────────
function Radar({ result, size=250 }) {
  const t = useContext(LangCtx);
  const cx=size/2,cy=size/2,R=74,N=4,off=-Math.PI/2;
  const stable=Math.max(5,100-Math.max(result.anxious,result.avoidant));
  const disorg=Math.round((result.anxious+result.avoidant)/2);
  const ax = t?.attAxisLabels || T.ja.attAxisLabels;
  const axes=[
    {label:ax[0],val:result.anxious,c:"#f08070"},
    {label:ax[1],val:disorg,c:"#d080e0"},
    {label:ax[2],val:result.avoidant,c:"#70b8f0"},
    {label:ax[3],val:stable,c:"#60cc80"},
  ];
  const pt=(i,r)=>({x:cx+r*Math.cos(i*2*Math.PI/N+off),y:cy+r*Math.sin(i*2*Math.PI/N+off)});
  const dpts=axes.map((a,i)=>pt(i,(a.val/100)*R));
  const poly=dpts.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+" Z";
  // top/bottom get R+26 offset, left/right get R+42 to avoid overlap
  const lpts=axes.map((a,i)=>{const rr=(i===1||i===3)?R+42:R+26;const ang=i*2*Math.PI/N+off;return{x:cx+rr*Math.cos(ang),y:cy+rr*Math.sin(ang),...a};});
  const ti=getTypeInfo(result,t);
  return (
    <div style={{textAlign:"center"}}>
      <svg width={size} height={size} style={{overflow:"visible"}}>
        {[25,50,75,100].map(p=>{const rr=(p/100)*R;const pts=Array.from({length:N},(_,i)=>pt(i,rr));const d=pts.map((q,i)=>(i===0?"M":"L")+q.x.toFixed(1)+","+q.y.toFixed(1)).join(" ")+" Z";return <path key={p} d={d} fill="none" stroke={p===100?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.08)"} strokeWidth={p===100?1.5:1}/>;} )}
        {axes.map((_,i)=>{const e=pt(i,R);return <line key={i} x1={cx} y1={cy} x2={e.x.toFixed(1)} y2={e.y.toFixed(1)} stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>;} )}
        {axes.map((a,i)=>{const ni=(i+1)%N,p1=dpts[i],p2=dpts[ni];return <path key={i} d={"M"+cx+","+cy+" L"+p1.x.toFixed(1)+","+p1.y.toFixed(1)+" L"+p2.x.toFixed(1)+","+p2.y.toFixed(1)+" Z"} fill={a.c} opacity="0.13"/>;} )}
        <path d={poly} fill="rgba(80,220,110,0.11)"/>
        <path d={poly} fill="none" stroke="rgba(90,230,120,0.78)" strokeWidth="2.5"/>
        {dpts.map((p,i)=>(<g key={i}><circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="9" fill={axes[i].c} opacity="0.18"/><circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="5" fill={axes[i].c} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/></g>))}
        {lpts.map((p,i)=>(<g key={i}><text x={p.x.toFixed(1)} y={(p.y-7).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill={p.c} fontWeight="700">{p.label}</text><text x={p.x.toFixed(1)} y={(p.y+8).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="rgba(255,255,255,0.85)" fontWeight="600">{p.val}%</text>{i===1&&<text x={p.x.toFixed(1)} y={(p.y+22).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill={p.c} opacity="0.75">{t?.attDisorgSub||"（回避と不安のミックス）"}</text>}</g>))}
        <text x={cx} y={cy-5} textAnchor="middle" fontSize="15" fontWeight="800" fill={ti.color}>{ti.label}</text>
      </svg>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"5px 12px",marginTop:4}}>
        {axes.map(a=>(<div key={a.label} style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:6,height:6,borderRadius:"50%",background:a.c}}/><span style={{fontSize:9,color:"rgba(255,255,255,0.48)"}}>{a.label}</span></div>))}
      </div>
    </div>
  );
}

// ── UI Primitives ─────────────────────────────────────────────────────────────
function Panel({ children, style }) {
  return <div style={{background:TH.panelBg,backdropFilter:TH.blur,WebkitBackdropFilter:TH.blur,borderRadius:20,border:"1px solid "+TH.border,padding:"20px 16px",...style}}>{children}</div>;
}
function Card({ children, selected, onClick, style }) {
  return <div onClick={onClick} style={{padding:"12px 15px",borderRadius:12,cursor:onClick?"pointer":"default",border:"1.5px solid "+(selected?TH.selB:TH.cardB),background:selected?TH.sel:TH.card,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",transition:"all 0.15s",marginBottom:7,userSelect:"none",transform:selected?"scale(1.01)":"scale(1)",...style}}>{children}</div>;
}
function Btn({ children, onClick, variant="green", disabled, style }) {
  const vs={green:{background:"linear-gradient(135deg,#4a9e5a,#2e7a3e)",color:"#fff"},red:{background:"linear-gradient(135deg,#c97b84,#a85a65)",color:"#fff"},amber:{background:"linear-gradient(135deg,#c89a40,#a07020)",color:"#fff"},ghost:{background:"transparent",color:"rgba(180,220,188,0.60)",border:"none"}};
  return <button onClick={onClick} disabled={disabled} style={{padding:"12px 20px",borderRadius:11,fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.45:1,transition:"all 0.18s",fontFamily:"inherit",border:"none",...vs[variant],...style}}>{children}</button>;
}
function Slider({ label, value, onChange, accent="#60cc80" }) {
  return (
    <div style={{marginBottom:16}}>
      {label&&<div style={{fontSize:11,color:TH.muted,marginBottom:6}}>{label}</div>}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <input type="range" min={0} max={10} step={1} value={value} onChange={e=>onChange(Number(e.target.value))} style={{flex:1,accentColor:accent,height:4}}/>
        <div style={{minWidth:40,height:40,borderRadius:9,background:"rgba(70,180,90,0.14)",border:"1px solid rgba(70,180,90,0.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:accent}}>{value}</div>
      </div>
    </div>
  );
}
function TimerWidget({ seconds, onComplete }) {
  const t = useContext(LangCtx);
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
      <div style={{position:"relative",display:"inline-block"}}>
        <svg width={116} height={116} style={{transform:"rotate(-90deg)"}}>
          <circle cx={58} cy={58} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6}/>
          <circle cx={58} cy={58} r={r} fill="none" stroke={done?"#60cc80":"#4a9e5a"} strokeWidth={6} strokeDasharray={circ} strokeDashoffset={circ-circ*pct/100} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:22,fontWeight:700,color:done?"#60cc80":"#dff0e2"}}>{done?"✓":mm+":"+(ss<10?"0":"")+ss}</span>
        </div>
      </div>
      <div style={{marginTop:14,display:"flex",gap:10,justifyContent:"center"}}>
        {!done&&<Btn variant="green" onClick={()=>setRun(x=>!x)} style={{minWidth:90}}>{run?(t?.timerPause||"一時停止"):(t?.timerStart||"開始")}</Btn>}
        {!done&&<Btn variant="ghost" onClick={()=>{setLeft(seconds);setRun(false);}}>{t?.timerReset||"リセット"}</Btn>}
        {done&&<div style={{color:"#60cc80",fontWeight:600}}>{t?.timerDone||"完了!"}</div>}
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
        <span style={{fontSize:11,fontWeight:600,color:"#a0d8b0"}}>{before}→{after}{d!==0&&<span style={{color:diffColor}}> ({d>0?"+":""}{d})</span>}</span>
      </div>
      <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
        <div style={{height:"100%",width:(after*10)+"%",background:d<0?"#7ec8f0":d>0?"#f08070":"#60cc80",borderRadius:2,transition:"width 0.6s"}}/>
      </div>
    </div>
  );
}
function SessBar({ onSaveExit, onHome }) {
  const t = useContext(LangCtx);
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <button onClick={onHome} style={{background:"rgba(5,20,8,0.82)",backdropFilter:"blur(10px)",color:TH.sub,border:"1px solid "+TH.border,borderRadius:9,padding:"6px 13px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{t?.sessHome||"🏠 ホーム"}</button>
      <button onClick={onSaveExit} style={{background:"rgba(60,100,65,0.52)",backdropFilter:"blur(10px)",color:"#a0e8b0",border:"1px solid rgba(70,180,90,0.38)",borderRadius:9,padding:"6px 13px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{t?.sessSave||"💾 中断して保存"}</button>
    </div>
  );
}

// ── Lang Switcher ─────────────────────────────────────────────────────────────
function LangSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const cur = LANGS.find(l=>l.code===lang)||LANGS[0];
  return (
    <div style={{position:"relative",zIndex:200}}>
      <button onClick={()=>setOpen(o=>!o)} style={{background:"rgba(10,30,12,0.72)",backdropFilter:"blur(12px)",border:"1px solid rgba(65,195,85,0.22)",borderRadius:8,color:"rgba(200,230,205,0.75)",fontSize:10,fontWeight:600,padding:"4px 9px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
        🌐 {cur.label} <span style={{fontSize:8,opacity:0.6}}>{open?"▲":"▼"}</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,background:"rgba(6,24,10,0.97)",backdropFilter:"blur(20px)",border:"1px solid rgba(65,195,85,0.22)",borderRadius:10,overflow:"hidden",minWidth:110,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
          {LANGS.map(l=>(
            <button key={l.code} onClick={()=>{setLang(l.code);setOpen(false);}} style={{display:"block",width:"100%",textAlign:"left",padding:"8px 14px",fontSize:11,fontWeight:l.code===lang?700:400,color:l.code===lang?"#7de89a":"rgba(200,230,205,0.70)",background:l.code===lang?"rgba(65,195,85,0.12)":"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",borderBottom:"1px solid rgba(65,195,85,0.08)"}}>{l.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab Bar ───────────────────────────────────────────────────────────────────
function TabBar({ active, onTab }) {
  const t = useContext(LangCtx);
  const tabs=[{id:"home",iconName:"home",label:t?.home||"ホーム"},{id:"attachment",iconName:"heart",label:t?.att||"愛着"},{id:"log",iconName:"log",label:t?.log||"ログ"},{id:"memo",iconName:"book",label:t?.memo||"日記"}];
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"rgba(2,12,4,0.96)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:"1px solid "+TH.border,display:"flex",justifyContent:"space-around",alignItems:"center",paddingBottom:"env(safe-area-inset-bottom,6px)",paddingTop:7}}>
      {tabs.map(tab=>(
        <button key={tab.id} onClick={()=>onTab(tab.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"transparent",border:"none",cursor:"pointer",padding:"2px 8px"}}>
          <SvgIcon name={tab.iconName} size={20} color={active===tab.id?"#60cc80":TH.muted}/>
          <span style={{fontSize:9,fontWeight:active===tab.id?700:400,color:active===tab.id?"#60cc80":TH.muted}}>{tab.label}</span>
          {active===tab.id&&<div style={{width:14,height:2,borderRadius:1,background:"#60cc80"}}/>}
        </button>
      ))}
    </div>
  );
}

// ── Draft Card ────────────────────────────────────────────────────────────────
function DraftCard({ draft, onResume, onDiscard, modeColor, icon, modeLabel }) {
  const t = useContext(LangCtx);
  if (!draft) return null;
  const cats = t?.cats || T.ja.cats;
  const catKeys=["fight","coldwar","anxiety","selfblame","repeat","breakup"];
  const catIdx=catKeys.indexOf(draft.situationCategory);
  const catLabel=catIdx>=0?cats[catIdx]:(t?.draftNone||"未選択");
  const lc=t?.locale||"ja-JP";
  const time=new Date(draft.savedAt).toLocaleTimeString(lc,{hour:"2-digit",minute:"2-digit"});
  return (
    <div style={{marginBottom:12,padding:"14px 16px",background:`rgba(${modeColor},0.16)`,backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",borderRadius:14,border:`1px solid rgba(${modeColor},0.38)`}}>
      <div style={{fontSize:10,color:`rgba(${modeColor},1)`,fontWeight:700,marginBottom:3,display:"flex",alignItems:"center",gap:4}}><SvgIcon name={icon} size={13} color={`rgba(${modeColor},1)`}/>{modeLabel} — {t?.draftSess||"途中のセッション"}</div>
      <div style={{fontSize:11,color:`rgba(${modeColor},0.72)`,marginBottom:11}}>{catLabel} · {t?.draftStep||"ステップ"} {(draft.step||0)+1} · {time} {t?.draftAt||"に中断"}</div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onResume} style={{flex:1,padding:"9px 12px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",background:`rgba(${modeColor},0.55)`,color:"#fff",border:"none",fontFamily:"inherit"}}>{t?.draftResume||"▶ 再開する"}</button>
        <button onClick={onDiscard} style={{padding:"9px 14px",borderRadius:9,fontSize:11,fontWeight:600,cursor:"pointer",background:"transparent",color:`rgba(${modeColor},0.55)`,border:`1px solid rgba(${modeColor},0.28)`,fontFamily:"inherit"}}>{t?.draftDiscard||"破棄"}</button>
      </div>
    </div>
  );
}

// ── Home Screen ───────────────────────────────────────────────────────────────
function HomeScreen({ onStart, onResume, onDiscard, sessions, draftEm, draftRe, attResult }) {
  const t = useContext(LangCtx);
  return (
    <div>
      <div style={{textAlign:"center",paddingTop:20,paddingBottom:22}}>
        <div style={{fontSize:11,color:"rgba(220,205,170,0.70)",letterSpacing:"0.12em",marginBottom:10,fontWeight:300}}>{t?.tagline||"二人をつなぐ心の場所"}</div>
        <div style={{position:"relative",display:"inline-block",marginBottom:4}}>
          <div style={{fontFamily:"'Georgia','Times New Roman',serif",fontSize:32,fontWeight:700,color:"#f5f0e8",letterSpacing:"0.18em",textShadow:"0 0 18px rgba(255,240,200,0.55), 0 0 40px rgba(255,220,150,0.28), 0 0 2px rgba(255,255,255,0.9)",lineHeight:1.1}}>YORIDOKORO</div>
          <div style={{position:"absolute",bottom:-10,right:-8,fontFamily:"'Dancing Script','Pacifico',cursive",fontSize:18,color:"rgba(230,195,110,0.88)",fontStyle:"italic",fontWeight:400,textShadow:"0 0 8px rgba(220,180,80,0.35)",pointerEvents:"none"}}>yoridokoro</div>
        </div>
        <div style={{height:24}}/>
        <div style={{fontSize:9,letterSpacing:"0.28em",color:"rgba(136,220,150,0.80)",textTransform:"uppercase",marginBottom:7}}>couple calm</div>
        <div style={{fontSize:22,fontWeight:700,color:"#dff0e2",lineHeight:1.45,maxWidth:280,margin:"0 auto"}}>
          {t?.heroLine1??'大切な人と'}<br/><span style={{color:"#7de89a"}}>{t?.heroHighlight??'"最悪の結末"'}</span>{t?.heroLine2post??'を'}<br/>{t?.heroLine3??'迎える前に'}
        </div>
        <div style={{fontSize:10,color:TH.muted,marginTop:8}}>{t?.subtitle}</div>
      </div>
      <DraftCard draft={draftEm} icon="siren" modeLabel={t?.em||"緊急モード"} modeColor="200,100,90" onResume={()=>onResume("em")} onDiscard={()=>onDiscard("em")}/>
      <DraftCard draft={draftRe} icon="leaf" modeLabel={t?.re||"通常モード"} modeColor="80,185,105" onResume={()=>onResume("re")} onDiscard={()=>onDiscard("re")}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:16}}>
        <div onClick={()=>onStart("em")} style={{background:"linear-gradient(148deg,rgba(175,46,58,0.42),rgba(136,26,42,0.32))",border:"1.5px solid rgba(196,70,84,0.46)",borderRadius:18,padding:"18px 10px 14px",cursor:"pointer",textAlign:"center",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"}}>
          <div style={{marginBottom:8}}><SvgIcon name="siren" size={40} color="#ff9aa2"/></div>
          <div style={{fontSize:12,fontWeight:700,color:"#ffb0b8",marginBottom:4}}>{t?.em}</div>
          <div style={{fontSize:10,color:"rgba(255,162,170,0.65)",lineHeight:1.5}}>{(t?.emDesc||"").split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</div>
          <div style={{fontSize:9,color:"rgba(255,140,150,0.45)",marginTop:4}}>{t?.emTime}</div>
        </div>
        <div onClick={()=>onStart("re")} style={{background:"linear-gradient(148deg,rgba(20,80,34,0.42),rgba(14,60,24,0.32))",border:"1.5px solid rgba(50,140,66,0.46)",borderRadius:18,padding:"18px 10px 14px",cursor:"pointer",textAlign:"center",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"}}>
          <div style={{marginBottom:8}}><SvgIcon name="leaf" size={40} color="#a0e8b0"/></div>
          <div style={{fontSize:12,fontWeight:700,color:"#a0e8b0",marginBottom:4}}>{t?.re}</div>
          <div style={{fontSize:10,color:"rgba(136,216,156,0.65)",lineHeight:1.5}}>{(t?.reDesc||"").split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</div>
          <div style={{fontSize:9,color:"rgba(116,196,136,0.45)",marginTop:4}}>{t?.reTime}</div>
        </div>
      </div>
    </div>
  );
}

// ── Attachment Diagnostic ──────────────────────────────────────────────────────
function AttDiag({ onDone, onHome }) {
  const t = useContext(LangCtx);
  const [answers,setAnswers]=useState(Array(8).fill(1));
  const [step,setStep]=useState(0);
  const [result,setResult]=useState(null);
  const attQs = t?.attQs || T.ja.attQs;
  const attOpts = t?.attOpts || T.ja.attOpts;
  function calcResult(ans){
    const aq=[0,1,4,6],vq=[2,3,5,7];
    return{anxious:Math.round((aq.reduce((s,i)=>s+ans[i],0)/(aq.length*3))*100),avoidant:Math.round((vq.reduce((s,i)=>s+ans[i],0)/(vq.length*3))*100),date:new Date().toISOString()};
  }
  if(step===8){
    if(!result) return null;
    const ti=getTypeInfo(result,t);
    const types = t?.attTypes || T.ja.attTypes;
    const info=types[ti.short];
    return(
      <Panel>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>{t?.attResultTitle||"診断結果"}</span>
          <button onClick={onHome} style={{background:"rgba(5,20,8,0.80)",color:TH.sub,border:"1px solid "+TH.border,borderRadius:9,padding:"5px 12px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🏠 {t?.home||"ホーム"}</button>
        </div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><Radar result={result} size={240}/></div>
        <div style={{textAlign:"center",marginBottom:14}}>
          <div style={{display:"inline-block",padding:"5px 18px",borderRadius:16,background:ti.color+"22",border:"1.5px solid "+ti.color+"66",color:ti.color,fontSize:13,fontWeight:800,marginBottom:ti.short==="disorganized"?3:7}}>{ti.label}</div>
          {ti.short==="disorganized"&&<div style={{fontSize:10,color:ti.color,opacity:0.75,marginBottom:7}}>{t?.attDisorgSub||"（回避と不安のミックス）"}</div>}
          <div style={{fontSize:12,color:TH.sub,lineHeight:1.75}}>{info.desc}</div>
        </div>
        <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.05)",borderRadius:12,marginBottom:16}}>
          <div style={{fontSize:9,color:TH.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{t?.attRecommend||"おすすめの取り組み"}</div>
          {info.tips.map((tip,i)=>(<div key={i} style={{fontSize:12,color:TH.sub,marginBottom:5,display:"flex",gap:7}}><span style={{color:ti.color}}>·</span>{tip}</div>))}
        </div>
        <Btn variant="green" style={{width:"100%"}} onClick={()=>onDone(result)}>{t?.attSaveHome||"保存してホームへ"}</Btn>
      </Panel>
    );
  }
  return(
    <Panel>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>{t?.attDiagTitle||"愛着診断"} {step+1}/8</span>
        <button onClick={onHome} style={{background:"rgba(5,20,8,0.80)",color:TH.sub,border:"1px solid "+TH.border,borderRadius:9,padding:"5px 12px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🏠 {t?.home||"ホーム"}</button>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:22}}>{Array.from({length:8}).map((_,i)=>(<div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?"#60cc80":"rgba(255,255,255,0.10)",transition:"background 0.3s"}}/>))}</div>
      <div style={{fontSize:16,color:TH.text,lineHeight:1.65,marginBottom:24,minHeight:48}}>{attQs[step]}</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {attOpts.map((label,val)=>(<Card key={val} selected={answers[step]===val} onClick={()=>{const n=[...answers];n[step]=val;setAnswers(n);}}><span style={{color:TH.sub,fontSize:13}}>{label}</span></Card>))}
      </div>
      <div style={{display:"flex",gap:8,marginTop:18}}>
        {step>0&&<Btn variant="ghost" onClick={()=>setStep(s=>s-1)}>{t?.navBack||"← 戻る"}</Btn>}
        <Btn variant="green" style={{flex:1}} onClick={()=>{if(step===7){setResult(calcResult(answers));setStep(8);}else setStep(s=>s+1);}}>{step===7?"→":(t?.navNext||"次へ →")}</Btn>
      </div>
    </Panel>
  );
}

// ── Attachment Tab ────────────────────────────────────────────────────────────
function AttTab({ history, onNew }) {
  const t = useContext(LangCtx);
  if(history.length===0) return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingRight:95}}>
        <span style={{fontSize:16,fontWeight:700,color:TH.text}}>{t?.attTabTitle||"愛着スタイル"}</span>
        <Btn variant="green" onClick={onNew} style={{fontSize:10,padding:"7px 13px"}}>{t?.attTabNew||"+ 診断する"}</Btn>
      </div>
      <Panel style={{textAlign:"center",padding:"40px 18px"}}>
        <div style={{marginBottom:12}}><SvgIcon name="heart" size={44} color="#f08090"/></div>
        <div style={{fontSize:13,fontWeight:600,color:TH.text,marginBottom:6}}>{t?.attTabEmpty||"まだ診断していません"}</div>
        <div style={{fontSize:11,color:TH.muted,lineHeight:1.7,marginBottom:20}}>{(t?.attTabEmptyDesc||"").split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</div>
        <Btn variant="green" onClick={onNew}>{t?.diagBtn||"診断する（2分）"}</Btn>
      </Panel>
    </div>
  );
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingRight:95}}>
        <span style={{fontSize:16,fontWeight:700,color:TH.text}}>{t?.attTabHistory||"愛着スタイル履歴"}</span>
        <Btn variant="green" onClick={onNew} style={{fontSize:10,padding:"7px 13px"}}>{t?.attTabRediag||"+ 再診断"}</Btn>
      </div>
      {[...history].reverse().map((h,i)=>{
        const ti=getTypeInfo(h,t);
        const types = t?.attTypes || T.ja.attTypes;
        const info=types[ti.short];
        return(
          <Panel key={i} style={{marginBottom:14,position:"relative"}}>
            {i===0&&<div style={{position:"absolute",top:12,right:12,padding:"2px 8px",borderRadius:7,background:"rgba(96,204,128,0.18)",border:"1px solid rgba(96,204,128,0.36)",fontSize:9,color:"#60cc80",fontWeight:700}}>{t?.attTabLatest||"最新"}</div>}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:10,color:TH.muted}}>{new Date(h.date).toLocaleDateString(t?.locale||"ja-JP",{year:"numeric",month:"long",day:"numeric"})}</span>
              <span style={{padding:"2px 9px",borderRadius:9,background:ti.color+"1a",border:"1px solid "+ti.color+"50",color:ti.color,fontSize:10,fontWeight:700}}>{ti.label}</span>
            </div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Radar result={h} size={i===0?240:200}/></div>
            <div style={{padding:"10px 12px",background:"rgba(255,255,255,0.05)",borderRadius:10}}>
              <div style={{fontSize:9,color:TH.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>{t?.attRecommend||"おすすめの取り組み"}</div>
              {info.tips.map((tip,j)=>(<div key={j} style={{fontSize:11,color:TH.sub,marginBottom:4,display:"flex",gap:7}}><span style={{color:ti.color}}>·</span>{tip}</div>))}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

// ── Emergency Session ─────────────────────────────────────────────────────────
function EmSess({ onDone, onHome, onSaveDraft, initialDraft }) {
  const t = useContext(LangCtx);
  useEffect(()=>{ window.scrollTo(0,0); },[]);
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
  const cats=t?.cats||T.ja.cats;
  const catIcons=t?.catIcons||T.ja.catIcons;
  const catKeys=["fight","coldwar","anxiety","selfblame","repeat","breakup"];
  const urges=t?.urges||T.ja.urges;
  const regItems=t?.regs||T.ja.regs;
  const regIds=["breath","feet","cold","water","shoulder"];
  const ughOpts=t?.ughOpts||T.ja.ughOpts;
  const pages=[
    <div key="e0">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.emScanLabel||"状況スキャン"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t?.emScanTitle||"今どんな状況？"}</div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,color:TH.muted,marginBottom:6}}>{t?.emCatLabel||"状況カテゴリー"}</div>
        {catKeys.map((id,i)=>(<Card key={id} selected={sc===id} onClick={()=>setSc(id)}><span style={{color:TH.sub,display:"flex",alignItems:"center",gap:7}}><SvgIcon name={CAT_ICONS[i]} size={15}/>{cats[i]}</span></Card>))}
      </div>
      <Slider label={t?.emoLabel||"感情の強さ"} value={bef.e} onChange={x=>bb("e",x)} accent={ac}/>
      <Slider label={t?.urgeLabel||"衝動の強さ"} value={bef.u} onChange={x=>bb("u",x)} accent={ac}/>
      <Slider label={t?.bodyLabel||"身体の緊張"} value={bef.b} onChange={x=>bb("b",x)} accent={ac}/>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,color:TH.muted,marginBottom:6}}>{t?.emUrgeLabel||"いちばんやりたい行動"}</div>
        {urges.map(a=>(<Card key={a} selected={ua===a} onClick={()=>setUa(a)}><span style={{color:TH.sub,fontSize:12}}>{a}</span></Card>))}
        {ua===urges[urges.length-1]&&<input value={uaOther} onChange={e=>setUaOther(e.target.value)} placeholder={t?.emUrgeOtherPh||"具体的に書く（任意）"} style={{width:"100%",background:TH.inp,border:"1px solid "+TH.border,borderRadius:8,color:TH.text,padding:"8px 11px",fontSize:12,fontFamily:"inherit",marginTop:4,boxSizing:"border-box"}}/>}
      </div>
      <Btn variant="red" style={{width:"100%"}} onClick={()=>setStep(1)} disabled={!sc}>{t?.navNext||"次へ →"}</Btn>
    </div>,
    <div key="e1">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.emCalmLabel||"鎮静"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t?.emCalmTitle||"今できるやつを選んで実行"}</div>
      {regIds.map((id,i)=>{const sel=regs.includes(id);return(<Card key={id} selected={sel} onClick={()=>setRegs(r=>sel?r.filter(x=>x!==id):[...r,id])}><span style={{display:"inline-flex",alignItems:"center",marginRight:8}}><SvgIcon name={REG_ICONS[i]||"leaf"} size={18}/></span><span style={{color:TH.sub,fontSize:12}}>{regItems[i]?.label||id}</span></Card>);})}
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn variant="ghost" onClick={()=>setStep(0)}>{t?.navBack||"← 戻る"}</Btn>
        <Btn variant="red" style={{flex:1}} onClick={()=>setStep(2)}>{t?.navNext||"次へ →"}</Btn>
      </div>
    </div>,
    <div key="e2">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.emDelayLabel||"衝動遅延"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:20,lineHeight:1.6}}>
        {t?.emDelayTitle||"実行できたかな？"}<br/>
        <span style={{fontSize:14,color:TH.muted,fontWeight:400}}>{(t?.emDelaySub||"").split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</span>
      </div>
      <div style={{padding:"16px",background:"rgba(255,154,162,0.08)",borderRadius:12,marginBottom:20,textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:8}}>📵</div>
        <div style={{fontSize:12,color:"rgba(255,154,162,0.75)",lineHeight:1.7}}>{(t?.emDelayHint||"").split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn variant="ghost" onClick={()=>setStep(1)}>{t?.navBack||"← 戻る"}</Btn>
        <Btn variant="red" style={{flex:1}} onClick={()=>setStep(3)}>{t?.emTimerBtn||"タイマーを始める →"}</Btn>
      </div>
    </div>,
    <div key="e3">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.emTimerLabel||"衝動遅延"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t?.emTimerTitle||"３分間、ただ置いておく"}</div>
      <TimerWidget seconds={180} onComplete={()=>setTd(true)}/>
      {td&&(<div style={{marginTop:12}}>
        <div style={{fontSize:12,color:TH.text,marginBottom:8}}>{t?.emTimerQ||"いま、その行動を\"今すぐ\"やりたい？"}</div>
        {ughOpts.map(a=>(<Card key={a} selected={ugh===a} onClick={()=>setUgh(a)}><span style={{color:TH.sub,fontSize:12}}>{a}</span></Card>))}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <Btn variant="ghost" onClick={()=>setStep(2)}>{t?.navBack||"← 戻る"}</Btn>
          <Btn variant="red" style={{flex:1}} onClick={()=>setStep(4)} disabled={!ugh}>{t?.navNext||"次へ →"}</Btn>
        </div>
      </div>)}
      {!td&&<Btn variant="ghost" onClick={()=>setStep(2)} style={{marginTop:12}}>{t?.navBack||"← 戻る"}</Btn>}
    </div>,
    <div key="e4">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.emEndLabel||"終了スキャン"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t?.emEndTitle||"今の状態を確認"}</div>
      <Slider label={t?.emoLabel||"感情の強さ"} value={aft.e} onChange={x=>ab("e",x)} accent={ac}/>
      <Slider label={t?.urgeLabel||"衝動の強さ"} value={aft.u} onChange={x=>ab("u",x)} accent={ac}/>
      <Slider label={t?.bodyLabel||"身体の緊張"} value={aft.b} onChange={x=>ab("b",x)} accent={ac}/>
      <Slider label={t?.thoughtLabel||"思考の確信度"} value={aft.t} onChange={x=>ab("t",x)} accent={ac}/>
      <div style={{padding:"13px",background:"rgba(200,70,80,0.08)",borderRadius:11,marginBottom:12}}>
        <div style={{fontSize:9,color:"#a0d8b0",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>{t?.changeLabel||"変化"}</div>
        <ScoreBar label={t?.scoreEmo||"感情"} before={bef.e} after={aft.e}/>
        <ScoreBar label={t?.scoreUrge||"衝動"} before={bef.u} after={aft.u}/>
        <ScoreBar label={t?.scoreBody||"身体緊張"} before={bef.b} after={aft.b}/>
      </div>
      <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder={t?.emMemoPlaceholder||"一言メモ（任意）"} style={{width:"100%",minHeight:52,background:TH.inp,border:"1px solid "+TH.border,borderRadius:9,color:TH.text,padding:"9px 11px",fontSize:12,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",marginBottom:12}}/>
      <div style={{display:"flex",gap:8}}>
        <Btn variant="ghost" onClick={()=>setStep(3)}>{t?.navBack||"← 戻る"}</Btn>
        <Btn variant="red" style={{flex:1}} onClick={()=>onDone({
          mode:"emergency",situationCategory:sc,
          before:{emotionIntensity0_10:bef.e,urgeIntensity0_10:bef.u,bodyTension0_10:bef.b,thoughtBelievability0_10:bef.t},
          after:{emotionIntensity0_10:aft.e,urgeIntensity0_10:aft.u,bodyTension0_10:aft.b,thoughtBelievability0_10:aft.t},
          memo,createdAt:new Date().toISOString(),endedAt:new Date().toISOString(),
        })}>{t?.navSaveDone||"保存して終了"}</Btn>
      </div>
    </div>,
  ];
  return(
    <Panel>
      <div style={{display:"flex",gap:4,marginBottom:16}}>{[0,1,2,3].map(i=>(<div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?"#ff9aa2":"rgba(255,255,255,0.10)",transition:"background 0.3s"}}/>))}</div>
      {pages[step]}
    </Panel>
  );
}

// ── Regular Session ───────────────────────────────────────────────────────────
function ReSess({ onDone, onHome, onSaveDraft, initialDraft }) {
  const t = useContext(LangCtx);
  useEffect(()=>{ window.scrollTo(0,0); },[]);
  const d=initialDraft||{};
  const [step,setStep]=useState(d.step??0);
  const [sc,setSc]=useState(d.sc??null);
  const [tt,setTt]=useState(d.tt??[]);
  const [bef,setBef]=useState(d.bef??{e:5,u:5,b:5,t:5});
  const [aft,setAft]=useState(d.aft??{e:5,u:5,b:5,t:5});
  const [stress,setStress]=useState(d.stress??5);
  const [amode,setAmode]=useState(d.amode??null);
  const [exAft,setExAft]=useState(d.exAft??5);
  const [exDone,setExDone]=useState(d.exDone??false);
  const [mq,setMq]=useState(d.mq??{q1:null,q2:null,q3:null,q4:null,q5:30,q6:null});
  const [commit,setCommit]=useState(d.commit??null);
  const [commitOther,setCommitOther]=useState(d.commitOther??"");
  const [memo,setMemo]=useState(d.memo??"");
  const ac="#a0e8b0";
  const bb=(k,x)=>setBef(p=>({...p,[k]:x}));
  const ab=(k,x)=>setAft(p=>({...p,[k]:x}));
  const qm=(k,x)=>setMq(p=>({...p,[k]:x}));
  const tog=tg=>setTt(p=>p.includes(tg)?p.filter(x=>x!==tg):[...p,tg]);
  const snap=s=>({mode:"regular",step:s??step,sc,tt,bef,aft,stress,amode,exAft,exDone,mq,commit,commitOther,memo,situationCategory:sc,savedAt:new Date().toISOString()});
  const SB=()=><SessBar onHome={()=>{onSaveDraft(snap());onHome();}} onSaveExit={()=>{onSaveDraft(snap());onHome();}}/>;
  const cats=t?.cats||T.ja.cats;
  const catIcons=t?.catIcons||T.ja.catIcons;
  const catKeys=["fight","coldwar","anxiety","selfblame","repeat","breakup"];
  const trigs=t?.trigs||T.ja.trigs;
  const amodes=t?.amodes||T.ja.amodes;
  const mq1items=t?.mq1||T.ja.mq1;
  const mq3items=t?.mq3||T.ja.mq3;
  const mq4items=t?.mq4||T.ja.mq4;
  const mq6items=t?.mq6||T.ja.mq6;
  const commits=t?.commits||T.ja.commits;
  const metaQ=[
    {title:t?.mq1Title||"頭の中で一番強い言葉は？",items:mq1items,k:"q1",prev:4,multi:false},
    {title:t?.mq3Title||"友達が同じ状況なら何て声をかけてあげる？",items:mq3items,k:"q3",prev:5,multi:false,hasOther:true},
    {title:t?.mq4Title||"この気持ちは何を守ってる？（複数可）",items:mq4items,k:"q4",prev:6,multi:true},
  ];
  const pages=[
    <div key="r0">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.reSitLabel||"状況・状態"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t?.reSitTitle||"今の状況を整理しよう"}</div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,color:TH.muted,marginBottom:6}}>{t?.reCatLabel||"状況カテゴリー"}</div>
        {catKeys.map((id,i)=>(<Card key={id} selected={sc===id} onClick={()=>setSc(id)}><span style={{color:TH.sub,display:"flex",alignItems:"center",gap:7}}><SvgIcon name={CAT_ICONS[i]} size={15}/>{cats[i]}</span></Card>))}
      </div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,color:TH.muted,marginBottom:6}}>{t?.reTrigLabel||"トリガータグ（複数可）"}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {trigs.map(tg=>(<div key={tg} onClick={()=>tog(tg)} style={{padding:"5px 10px",borderRadius:16,fontSize:10,cursor:"pointer",background:tt.includes(tg)?"rgba(70,180,90,0.28)":"rgba(255,255,255,0.06)",border:tt.includes(tg)?"1px solid rgba(70,180,90,0.56)":"1px solid rgba(255,255,255,0.10)",color:tt.includes(tg)?ac:TH.muted,transition:"all 0.15s"}}>{tg}</div>))}
        </div>
      </div>
      <Slider label={t?.emoLabel||"感情の強さ"} value={bef.e} onChange={x=>bb("e",x)} accent={ac}/>
      <Slider label={t?.urgeLabel||"衝動の強さ"} value={bef.u} onChange={x=>bb("u",x)} accent={ac}/>
      <Slider label={t?.bodyLabel||"身体の緊張"} value={bef.b} onChange={x=>bb("b",x)} accent={ac}/>
      <Slider label={t?.stressLabel||"生活ストレス"} value={stress} onChange={setStress} accent={ac}/>
      <Btn variant="green" style={{width:"100%",marginTop:4}} onClick={()=>setStep(1)} disabled={!sc}>{t?.navNext||"次へ →"}</Btn>
    </div>,
    <div key="r1">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.reModeLabel||"今の反応モード"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t?.reModeTitle||"今はどっちに近い？"}</div>
      {amodes.map(o=>(<Card key={o.id} selected={amode===o.id} onClick={()=>setAmode(o.id)}><span style={{display:"inline-flex",alignItems:"center",marginRight:8}}><SvgIcon name={AMODE_ICONS[o.id]||"neutral"} size={17}/></span><span style={{color:TH.sub,fontSize:12}}>{o.l}</span></Card>))}
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn variant="ghost" onClick={()=>setStep(0)}>{t?.navBack||"← 戻る"}</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>setStep(2)} disabled={!amode}>{t?.navNext||"次へ →"}</Btn>
      </div>
    </div>,
    <div key="r2">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.reExpLabel||"曝露 3分"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t?.reExpTitle||"感情とそのまま向き合う"}</div>
      <div style={{padding:"16px",background:"rgba(70,180,90,0.08)",borderRadius:12,marginBottom:20,textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:8}}>📵</div>
        <div style={{fontSize:12,color:"rgba(160,232,176,0.85)",lineHeight:1.7}}>{(t?.reExpInfoHint||"スマホを置いて\nただ感情とともにいる時間です。").split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <Btn variant="ghost" onClick={()=>setStep(1)}>{t?.navBack||"← 戻る"}</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>setStep(3)}>{t?.emTimerBtn||"タイマーを始める →"}</Btn>
      </div>
    </div>,
    <div key="r3">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.reExpLabel||"曝露 3分"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t?.reExpTimerTitle||"３分間、ただ何もしない時間"}</div>
      <TimerWidget seconds={180} onComplete={()=>setExDone(true)}/>
      {exDone&&(
        <>
          <Slider label={t?.afterEmoLabel||"3分後の感情の強さ"} value={exAft} onChange={setExAft} accent={ac}/>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Btn variant="ghost" onClick={()=>setStep(2)}>{t?.navBack||"← 戻る"}</Btn>
            <Btn variant="green" style={{flex:1}} onClick={()=>setStep(4)}>{t?.navNext||"次へ →"}</Btn>
          </div>
        </>
      )}
      {!exDone&&<Btn variant="ghost" onClick={()=>setStep(2)} style={{marginTop:12}}>{t?.navBack||"← 戻る"}</Btn>}
    </div>,
    <div key="r4">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.reWriteLabel||"筆記開示"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:8}}>{t?.reWriteTitle||"紙に書く時間"}</div>
      <div style={{fontSize:11,color:"rgba(220,220,220,0.82)",lineHeight:1.7,marginBottom:12}}>{t?.reWritePurpose||"感情を言葉にして書き出すことで、心の整理と距離感が生まれます。"}</div>
      <div style={{padding:"12px 14px",background:"rgba(70,180,90,0.10)",borderRadius:12,marginBottom:14,lineHeight:1.8}}>
        <div style={{fontSize:12,color:ac,marginBottom:4,fontWeight:600}}>{t?.reWriteInstruction||"📝 紙とペンを用意してください"}</div>
        <div style={{fontSize:11,color:TH.muted}}>{(t?.reWriteTips||"").split("\n").map((l,i)=><div key={i}>{l}</div>)}</div>
      </div>
      <TimerWidget seconds={900} onComplete={()=>{}}/>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn variant="ghost" onClick={()=>setStep(3)}>{t?.navBack||"← 戻る"}</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>setStep(5)}>{t?.navNext||"次へ →"}</Btn>
      </div>
    </div>,
    ...metaQ.map(({title,items,k,prev,multi,hasOther},idx)=>(
      <div key={"m"+idx}>
        <SB/>
        <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.metaLabel||"メタ認知"} {idx+1}/3</div>
        <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{title}</div>
        {items.map(a=>{
          const sel=multi?(Array.isArray(mq[k])&&mq[k].includes(a)):mq[k]===a;
          const onCl=multi?()=>qm(k,Array.isArray(mq[k])?(mq[k].includes(a)?mq[k].filter(x=>x!==a):[...mq[k],a]):[a]):()=>qm(k,a);
          return(<Card key={a} selected={sel} onClick={onCl}><span style={{color:TH.sub,fontSize:12}}>{a}</span></Card>);
        })}
        {hasOther&&mq[k]===items[items.length-1]&&<input value={mq.q3other||""} onChange={e=>qm("q3other",e.target.value)} placeholder={t?.mq3OtherPh||"具体的に書く（任意）"} style={{width:"100%",background:TH.inp,border:"1px solid "+TH.border,borderRadius:8,color:TH.text,padding:"8px 11px",fontSize:12,fontFamily:"inherit",marginTop:4,boxSizing:"border-box"}}/>}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <Btn variant="ghost" onClick={()=>setStep(prev)}>{t?.navBack||"← 戻る"}</Btn>
          <Btn variant="green" style={{flex:1}} onClick={()=>setStep(5+idx+1)} disabled={multi?(!(Array.isArray(mq[k])&&mq[k].length>0)):(!mq[k])}>{t?.navNext||"次へ →"}</Btn>
        </div>
      </div>
    )),
    <div key="m4">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.metaLabel||"メタ認知"} — {t?.mq5Title||"確率"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t?.mq5Title||"最悪の想像が起きる確率はどれくらいだと思う？"}</div>
      <div style={{textAlign:"center",padding:"16px 0"}}>
        <div style={{fontSize:42,fontWeight:700,color:ac,marginBottom:6}}>{mq.q5}%</div>
        <input type="range" min={0} max={100} value={mq.q5} onChange={e=>qm("q5",Number(e.target.value))} style={{width:"100%",accentColor:"#4a9e5a"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:TH.muted,marginTop:3}}><span>{t?.mq5Lo||"ほぼない"}</span><span>{t?.mq5Mid||"半々"}</span><span>{t?.mq5Hi||"ほぼ確実"}</span></div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <Btn variant="ghost" onClick={()=>setStep(7)}>{t?.navBack||"← 戻る"}</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>setStep(9)}>{t?.navNext||"次へ →"}</Btn>
      </div>
    </div>,
    <div key="m5">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.metaLabel||"メタ認知"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t?.mq6Title||"別の可能性があるとしたら？（複数可）"}</div>
      {mq6items.map(a=>{const sel=Array.isArray(mq.q6)&&mq.q6.includes(a);return(<Card key={a} selected={sel} onClick={()=>qm("q6",Array.isArray(mq.q6)?(sel?mq.q6.filter(x=>x!==a):[...mq.q6,a]):[a])}><span style={{color:TH.sub,fontSize:12}}>{a}</span></Card>);})}
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn variant="ghost" onClick={()=>setStep(8)}>{t?.navBack||"← 戻る"}</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>setStep(10)} disabled={!(Array.isArray(mq.q6)&&mq.q6.length>0)}>{t?.navNext||"次へ →"}</Btn>
      </div>
    </div>,
    <div key="c0">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.commitLabel||"今日の行動"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t?.commitTitle||"1つだけ決める"}</div>
      {commits.map(a=>(<Card key={a} selected={commit===a} onClick={()=>setCommit(a)}><span style={{color:TH.sub,fontSize:12}}>{a}</span></Card>))}
      {commit===commits[commits.length-1]&&<input value={commitOther} onChange={e=>setCommitOther(e.target.value)} placeholder={t?.commitOtherPh||"具体的に書く（任意）"} style={{width:"100%",background:TH.inp,border:"1px solid "+TH.border,borderRadius:8,color:TH.text,padding:"8px 11px",fontSize:12,fontFamily:"inherit",marginTop:4,boxSizing:"border-box"}}/>}
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn variant="ghost" onClick={()=>setStep(9)}>{t?.navBack||"← 戻る"}</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>setStep(11)} disabled={!commit}>{t?.navNext||"次へ →"}</Btn>
      </div>
    </div>,
    <div key="af">
      <SB/>
      <div style={{fontSize:9,color:ac,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3}}>{t?.reEndLabel||"終了スキャン"}</div>
      <div style={{fontSize:18,fontWeight:700,color:TH.text,marginBottom:16}}>{t?.reEndTitle||"今の状態を確認"}</div>
      <Slider label={t?.emoLabel||"感情の強さ"} value={aft.e} onChange={x=>ab("e",x)} accent={ac}/>
      <Slider label={t?.urgeLabel||"衝動の強さ"} value={aft.u} onChange={x=>ab("u",x)} accent={ac}/>
      <Slider label={t?.bodyLabel||"身体の緊張"} value={aft.b} onChange={x=>ab("b",x)} accent={ac}/>
      <div style={{padding:"13px",background:"rgba(60,140,75,0.08)",borderRadius:11,marginBottom:12}}>
        <div style={{fontSize:9,color:TH.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>{t?.changeLabel||"変化"}</div>
        <ScoreBar label={t?.scoreEmo||"感情"} before={bef.e} after={aft.e}/>
        <ScoreBar label={t?.scoreUrge||"衝動"} before={bef.u} after={aft.u}/>
        <ScoreBar label={t?.scoreBody||"身体緊張"} before={bef.b} after={aft.b}/>
      </div>
      <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder={t?.reMemoPlaceholder||"一番の気づき（任意）"} style={{width:"100%",minHeight:52,background:TH.inp,border:"1px solid "+TH.border,borderRadius:9,color:TH.text,padding:"9px 11px",fontSize:12,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",marginBottom:12}}/>
      <div style={{display:"flex",gap:8}}>
        <Btn variant="ghost" onClick={()=>setStep(10)}>{t?.navBack||"← 戻る"}</Btn>
        <Btn variant="green" style={{flex:1}} onClick={()=>onDone({
          mode:"regular",situationCategory:sc,triggerTags:tt,
          before:{emotionIntensity0_10:bef.e,urgeIntensity0_10:bef.u,bodyTension0_10:bef.b,thoughtBelievability0_10:bef.t},
          after:{emotionIntensity0_10:aft.e,urgeIntensity0_10:aft.u,bodyTension0_10:aft.b,thoughtBelievability0_10:aft.t},
          committedAction:commit===commits[commits.length-1]&&commitOther?commitOther:commit,
          memo,createdAt:new Date().toISOString(),endedAt:new Date().toISOString(),
        })}>{t?.navSaveDone||"保存して終了"}</Btn>
      </div>
    </div>,
  ];
  return(
    <Panel>
      <div style={{display:"flex",gap:2,marginBottom:16}}>{Array.from({length:13}).map((_,i)=>(<div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?"#a0e8b0":"rgba(255,255,255,0.08)",transition:"background 0.3s"}}/>))}</div>
      {pages[Math.min(step,pages.length-1)]}
    </Panel>
  );
}

// ── Log Screen ────────────────────────────────────────────────────────────────
function LogScreen({ sessions }) {
  const t = useContext(LangCtx);
  const [sel,setSel]=useState(null);
  const cats=t?.cats||T.ja.cats;
  const catKeys=["fight","coldwar","anxiety","selfblame","repeat","breakup"];
  const getCatLabel=id=>{const i=catKeys.indexOf(id);return i>=0?cats[i]:"—";};
  if(sel!==null){
    const s=sessions[sel];
    return(
      <Panel>
        <button onClick={()=>setSel(null)} style={{background:"transparent",border:"none",color:TH.muted,cursor:"pointer",fontSize:11,marginBottom:12,fontFamily:"inherit"}}>{t?.logBack||"← 一覧へ"}</button>
        <div style={{fontSize:9,color:"#a0d8b0",marginBottom:2}}>{s.mode==="emergency"?(t?.logEm||"🚨 緊急"):(t?.logRe||"🌿 通常")} · {new Date(s.createdAt).toLocaleDateString(t?.locale||"ja-JP")+" "+new Date(s.createdAt).toLocaleTimeString(t?.locale||"ja-JP",{hour:"2-digit",minute:"2-digit"})}</div>
        <div style={{fontSize:14,fontWeight:600,color:"#dff0e2",marginBottom:14}}>{getCatLabel(s.situationCategory)}</div>
        {s.after&&(<div style={{padding:12,background:"rgba(255,255,255,0.05)",borderRadius:11,marginBottom:12}}>
          <div style={{fontSize:9,color:TH.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>{t?.logChangeLabel||"変化"}</div>
          <ScoreBar label={t?.scoreEmo||"感情"} before={s.before.emotionIntensity0_10} after={s.after.emotionIntensity0_10}/>
          <ScoreBar label={t?.scoreUrge||"衝動"} before={s.before.urgeIntensity0_10} after={s.after.urgeIntensity0_10}/>
          <ScoreBar label={t?.scoreBody||"身体緊張"} before={s.before.bodyTension0_10} after={s.after.bodyTension0_10}/>
        </div>)}
        {s.committedAction&&<div style={{fontSize:11,color:"#60cc80",marginBottom:6}}>✓ {s.committedAction}</div>}
        {s.memo&&<div style={{padding:"10px 12px",background:"rgba(255,255,255,0.05)",borderRadius:8,fontSize:11,color:"#a0d8b0",fontStyle:"italic"}}>「{s.memo}」</div>}
      </Panel>
    );
  }
  return(
    <div>
      <div style={{fontSize:16,fontWeight:700,color:TH.text,marginBottom:14}}>{t?.logTitle||"セッションログ"}</div>
      {sessions.length===0?(<Panel style={{textAlign:"center",padding:"36px 16px"}}><div style={{fontSize:11,color:TH.muted}}>{t?.logEmpty||"まだセッションがありません"}</div></Panel>):(
        [...sessions].reverse().map((s,i)=>{
          const idx=sessions.length-1-i;
          const diff=s.after?s.after.emotionIntensity0_10-s.before.emotionIntensity0_10:null;
          return(<Card key={i} onClick={()=>setSel(idx)}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:9,color:s.mode==="emergency"?"#ff9aa2":"#a0e8b0",marginBottom:2}}>{s.mode==="emergency"?(t?.logEm||"🚨 緊急"):(t?.logRe||"🌿 通常")} · {new Date(s.createdAt).toLocaleDateString(t?.locale||"ja-JP",{month:"short",day:"numeric"})+" "+new Date(s.createdAt).toLocaleTimeString(t?.locale||"ja-JP",{hour:"2-digit",minute:"2-digit"})}</div>
                <div style={{fontSize:12,color:TH.sub}}>{getCatLabel(s.situationCategory)}</div>
                {diff!==null&&<div style={{fontSize:10,color:"#a0d8b0",marginTop:2}}>{t?.scoreEmo||"感情"} {s.before.emotionIntensity0_10}→{s.after.emotionIntensity0_10}{diff!==0&&<span style={{color:diff<0?"#7ec8f0":"#f08070"}}> ({diff>0?"+":""}{diff})</span>}</div>}
              </div>
              <span style={{color:TH.muted,fontSize:14}}>›</span>
            </div>
          </Card>);
        })
      )}
    </div>
  );
}

// ── Memo Screen ───────────────────────────────────────────────────────────────
function MemoScreen({ memos, onAdd, onEdit }) {
  const t = useContext(LangCtx);
  const [text,setText]=useState("");
  const [tag,setTag]=useState("");
  const [editId,setEditId]=useState(null);
  const [editText,setEditText]=useState("");
  function add(){if(!text.trim())return;onAdd({id:Date.now()+"",createdAt:new Date().toISOString(),text:text.trim(),tags:tag?[tag]:[]});setText("");setTag("");}
  function startEdit(m){setEditId(m.id);setEditText(m.text);}
  function saveEdit(m){if(editText.trim())onEdit({...m,text:editText.trim()});setEditId(null);}
  const lc=t?.locale||"ja-JP";
  const fmtDate=d=>new Date(d).toLocaleDateString(lc,{year:"numeric",month:"short",day:"numeric"})+" "+new Date(d).toLocaleTimeString(lc,{hour:"2-digit",minute:"2-digit"});
  return(
    <div>
      <div style={{fontSize:16,fontWeight:700,color:TH.text,marginBottom:14}}>{t?.memoTitle||"日記"}</div>
      <Panel style={{marginBottom:12}}>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={t?.memoPh||"今思ったこと、気づき…"} style={{width:"100%",minHeight:64,background:TH.inp,border:"1px solid "+TH.border,borderRadius:8,color:TH.text,padding:"10px",fontSize:12,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",marginBottom:6}}/>
        <div style={{display:"flex",gap:6}}>
          <input value={tag} onChange={e=>setTag(e.target.value)} placeholder={t?.memoTagPh||"タグ（任意）"} style={{flex:1,background:TH.inp,border:"1px solid "+TH.border,borderRadius:7,color:TH.text,padding:"6px 10px",fontSize:11,fontFamily:"inherit"}}/>
          <Btn variant="green" onClick={add} disabled={!text.trim()} style={{padding:"7px 13px",fontSize:12}}>{t?.memoAdd||"追加"}</Btn>
        </div>
      </Panel>
      {memos.length===0?(<div style={{textAlign:"center",padding:"26px 0",color:TH.muted,fontSize:11}}>{t?.memoEmpty||"まだ日記がありません"}</div>):(
        [...memos].reverse().map(m=>(
          <Card key={m.id} style={{marginBottom:8}}>
            {editId===m.id?(
              <div>
                <textarea value={editText} onChange={e=>setEditText(e.target.value)} style={{width:"100%",minHeight:64,background:TH.inp,border:"1px solid "+TH.selB,borderRadius:8,color:TH.text,padding:"9px",fontSize:12,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",marginBottom:8}}/>
                <div style={{display:"flex",gap:6}}>
                  <Btn variant="ghost" onClick={()=>setEditId(null)} style={{fontSize:11,padding:"5px 12px"}}>{t?.memoCancel||"キャンセル"}</Btn>
                  <Btn variant="green" onClick={()=>saveEdit(m)} disabled={!editText.trim()} style={{flex:1,fontSize:11,padding:"5px 12px"}}>{t?.memoSave||"保存"}</Btn>
                </div>
              </div>
            ):(
              <div>
                <div style={{fontSize:11,color:"#dff0e2",lineHeight:1.65,marginBottom:8}}>{m.text}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{m.tags.map(tg=>(<span key={tg} style={{padding:"1px 6px",borderRadius:6,background:"rgba(70,180,90,0.18)",fontSize:9,color:"#a0e8b0"}}>{tg}</span>))}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:9,color:"#a0d8b0"}}>{fmtDate(m.createdAt)}</span>
                    <button onClick={()=>startEdit(m)} style={{background:"transparent",border:"1px solid rgba(96,204,128,0.25)",borderRadius:6,color:"#a0d8b0",fontSize:9,padding:"2px 8px",cursor:"pointer",fontFamily:"inherit"}}>{t?.memoEdit||"編集"}</button>
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

// ── Complete Screen ───────────────────────────────────────────────────────────
function CompleteScreen({ session, onHome }) {
  const t = useContext(LangCtx);
  const diff=session.after.emotionIntensity0_10-session.before.emotionIntensity0_10;
  const msgs = t?.completeMsgs || T.ja.completeMsgs;
  const msg=diff<-2?msgs[0]:diff<0?msgs[1]:msgs[2];
  return(
    <Panel>
      <div style={{textAlign:"center",padding:"10px 0 18px"}}>
        <div style={{marginBottom:10}}><SvgIcon name={diff<0?"sprout":"leaf"} size={52} color="#a0e8b0"/></div>
        <div style={{fontSize:19,fontWeight:700,color:TH.text,marginBottom:6}}>{t?.completeTitle||"セッション完了"}</div>
        <div style={{fontSize:12,color:TH.muted,marginBottom:20,lineHeight:1.7}}>{msg}</div>
        <div style={{padding:"13px",background:"rgba(255,255,255,0.05)",borderRadius:11,marginBottom:14,textAlign:"left"}}>
          <div style={{fontSize:9,color:TH.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>{t?.completeChangeLabel||"今回の変化"}</div>
          <ScoreBar label={t?.scoreEmo||"感情"} before={session.before.emotionIntensity0_10} after={session.after.emotionIntensity0_10}/>
          <ScoreBar label={t?.scoreUrge||"衝動"} before={session.before.urgeIntensity0_10} after={session.after.urgeIntensity0_10}/>
          <ScoreBar label={t?.scoreBody||"身体緊張"} before={session.before.bodyTension0_10} after={session.after.bodyTension0_10}/>
        </div>
        {session.committedAction&&(<div style={{padding:"10px 13px",background:"rgba(55,135,65,0.13)",borderRadius:10,fontSize:12,color:"#80e8a0",marginBottom:14}}>✓ {t?.completeActionLabel||"今日の行動："}{session.committedAction}</div>)}
        <Btn variant="green" style={{width:"100%"}} onClick={onHome}>{t?.completeHomeBtn||"ホームに戻る"}</Btn>
      </div>
    </Panel>
  );
}

// ── CSS & Shell ───────────────────────────────────────────────────────────────
const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;600;700&family=Dancing+Script:wght@400;700&display=swap');
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
      <div style={{position:"relative",zIndex:1,maxWidth:520,margin:"0 auto",padding:"18px 13px 86px"}}>
        {children}
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,   setTab]  = useState("home");
  const [sub,   setSub]  = useState(null);
  const [lang,  setLang] = useState(()=>ld("cc_lang","ja"));
  useEffect(()=>sv("cc_lang",lang),[lang]);
  const t = T[lang]||T.ja;
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
    <LangCtx.Provider value={t}>
      <Shell><EmSess onDone={onSessDone} onHome={goHome} onSaveDraft={setDftEm} initialDraft={dftEm}/></Shell>
    </LangCtx.Provider>
  );
  if(sub==="re") return(
    <LangCtx.Provider value={t}>
      <Shell><ReSess onDone={onSessDone} onHome={goHome} onSaveDraft={setDftRe} initialDraft={dftRe}/></Shell>
    </LangCtx.Provider>
  );
  if(sub==="diag") return(
    <LangCtx.Provider value={t}>
      <Shell><AttDiag onDone={onAttDone} onHome={goHome}/></Shell>
    </LangCtx.Provider>
  );
  if(sub==="complete"&&comp) return(
    <LangCtx.Provider value={t}>
      <Shell><CompleteScreen session={comp} onHome={()=>{ setSub(null); setComp(null); setTab("home"); }}/></Shell>
    </LangCtx.Provider>
  );

  return(
    <LangCtx.Provider value={t}>
      <Shell>
        <div style={{position:"fixed",top:12,right:14,zIndex:200}}>
          <LangSwitcher lang={lang} setLang={setLang}/>
        </div>
        <div style={{paddingTop:42}}>
        {tab==="home"&&(
          <>
            {!attR&&(
              <div style={{marginBottom:12,padding:"12px 14px",background:"rgba(3,18,6,0.88)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",borderRadius:14,border:"1px solid rgba(68,195,84,0.22)",fontSize:11,color:"rgba(145,226,156,0.90)",lineHeight:1.7}}>
                {t.diagBanner}
                <div style={{marginTop:8,display:"flex",gap:6}}>
                  <Btn variant="green" style={{fontSize:10,padding:"6px 12px"}} onClick={()=>setSub("diag")}>{t.diagBtn}</Btn>
                  <Btn variant="ghost" style={{fontSize:10,padding:"6px 12px"}} onClick={()=>{}}>{t.later}</Btn>
                </div>
              </div>
            )}
            <HomeScreen onStart={m=>setSub(m)} onResume={onResume} onDiscard={onDiscard} sessions={sess} draftEm={dftEm} draftRe={dftRe} attResult={attR}/>
          </>
        )}
        {tab==="attachment" && <AttTab history={attH} onNew={()=>setSub("diag")}/>}
        {tab==="log"        && <LogScreen sessions={sess}/>}
        {tab==="memo"       && <MemoScreen memos={memo} onAdd={m=>setMemo(ms=>[...ms,m])} onEdit={m=>setMemo(ms=>ms.map(x=>x.id===m.id?m:x))}/>}
        </div>
        <TabBar active={tab} onTab={x=>{ setSub(null); setTab(x); }}/>
      </Shell>
    </LangCtx.Provider>
  );
}
