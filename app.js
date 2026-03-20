/* MeuOrçamento — app.js */

// ── DADOS ESTÁTICOS ───────────────────────────────────────────────────
const THEMES={
  // ── DARK: referência — profundo, contrastado ──────────────────────────
  dark:{
    name:"Dark", icon:"🌙",
    bg:"#080810", card:"#10101c", cardLight:"#1c1c2e",
    accent:"#00e5a0", danger:"#ff4d6d", warn:"#ffc94a", blue:"#4d9fff",
    text:"#e8e8f4", muted:"#6e6e8a", border:"#22223a",
    navBg:"#0d0d1a", sidebar:"#0d0d1a",
    cardShadow:"0 2px 16px #00000055",
  },
  // ── LIGHT: fundo cinza azulado, cards brancos elevados ────────────────
  // bg cinza → card branco: contraste claro. cardLight acinzentado p/ inputs
  light:{
    name:"Light", icon:"☀️",
    bg:"#dfe3ee", card:"#ffffff", cardLight:"#edf0f7",
    accent:"#0066cc", danger:"#dc2626", warn:"#b45309", blue:"#1d6fb8",
    text:"#0a0a18", muted:"#52586a", border:"#c4c9d8",
    navBg:"#ffffff", sidebar:"#e8ecf6",
    cardShadow:"0 2px 14px #00000018, 0 1px 4px #0000000e",
  },
  // ── OCEAN: fundo quase preto azulado → card azul-petróleo, cardLight teal ─
  // Quebra a monotonia: bg escuro, card médio, cardLight com tom teal
  ocean:{
    name:"Ocean", icon:"🌊",
    bg:"#04111e", card:"#082236", cardLight:"#0d3550",
    accent:"#00d4ff", danger:"#ff5f6d", warn:"#ffd166", blue:"#4db8ff",
    text:"#dff0ff", muted:"#5b8faa", border:"#0f3558",
    navBg:"#082236", sidebar:"#04111e",
    cardShadow:"0 4px 24px #000000bb",
  },
  // ── SUNSET: fundo roxo escuro → card cinza-chumbo escuro (sem roxo!) ──
  // card é quase neutro escuro para quebrar a cor do fundo roxo
  sunset:{
    name:"Sunset", icon:"🌅",
    bg:"#1a0828", card:"#1d1528", cardLight:"#2c2040",
    accent:"#ff9a3c", danger:"#ff4d6d", warn:"#ffdc5e", blue:"#c07af5",
    text:"#faeeff", muted:"#a07cbf", border:"#3a2850",
    navBg:"#1c1624", sidebar:"#1a0828",
    cardShadow:"0 4px 24px #00000099",
  },
  // ── FOREST: fundo verde-preto → card cinza-escuro esverdeado neutro ───
  // card mais neutro (não verde puro) para criar separação do fundo
  forest:{
    name:"Forest", icon:"🌿",
    bg:"#030c05", card:"#101a12", cardLight:"#1c3224",
    accent:"#3ddc84", danger:"#ff6b6b", warn:"#e8c840", blue:"#50c8a0",
    text:"#d8f5e4", muted:"#6db888", border:"#1e3e28",
    navBg:"#101a12", sidebar:"#030c05",
    cardShadow:"0 4px 24px #000000aa",
  },
  // ── ROSE: fundo rosado, cards com sombra rosada, texto escuro nítido ──
  rose:{
    name:"Rose", icon:"🌸",
    bg:"#f5e8ef", card:"#ffffff", cardLight:"#fce8f0",
    accent:"#d63a75", danger:"#c0392b", warn:"#c87830", blue:"#7040b0",
    text:"#1a0610", muted:"#8a4a6a", border:"#e8c0d0",
    navBg:"#ffffff", sidebar:"#fce0ec",
    cardShadow:"0 2px 12px #d63a7518, 0 1px 4px #00000012",
  },
};
const BRANDS={
  "Visa":{color:"#1a1f71",text:"#fff",accent:"#f7a600",label:"VISA"},
  "Mastercard":{color:"#1d1d1d",text:"#fff",accent:"#eb001b",label:"MC"},
  "Elo":{color:"#ffcb05",text:"#000",accent:"#00a4e0",label:"ELO"},
  "Nubank":{color:"#7a1baf",text:"#fff",accent:"#e5d5f5",label:"NU"},
  "Inter":{color:"#ff7a00",text:"#fff",accent:"#fff",label:"INTER"},
  "PicPay":{color:"#11c76f",text:"#fff",accent:"#fff",label:"PP"},
  "Itaú":{color:"#ec7000",text:"#fff",accent:"#003d7d",label:"ITAÚ"},
  "Bemol Visa":{color:"#3a5bc7",text:"#fff",accent:"#fff",label:"bemol"},
  "Renner":{color:"#cc0000",text:"#fff",accent:"#fff",label:"RENNER"},
  "Bradesco":{color:"#c0003c",text:"#fff",accent:"#7b2ff7",label:"BRAD",gradient:"linear-gradient(135deg,#c0003c,#7b2ff7)"},
  "Neon":{color:"#00bfff",text:"#fff",accent:"#00e5ff",label:"NEON",gradient:"linear-gradient(135deg,#00bfff,#00e5c8)"},
  "C6 Bank":{color:"#2d2d2d",text:"#fff",accent:"#f5c518",label:"C6"},
  "XP":{color:"#000",text:"#fff",accent:"#ff6a00",label:"XP"},
  "Sicredi":{color:"#006600",text:"#fff",accent:"#ffdd00",label:"SICR"},
};
const CATS={"Alimentação":"🍔","Transporte":"🚗","Saúde":"💊","Lazer":"🎮","Casa":"🏠","Educação":"📚","Roupas":"👕","Outros":"💸"};
const GOAL_EMOJIS=["🏖️","✈️","💻","📱","🚗","🏠","💍","🎓","🏋️","🎮","📷","🎸","🌍","👶","💰","🎯"];
const TAB_LABELS={home:"Início",cards:"Cartões",goals:"Metas",health:"Saúde Financeira",report:"Relatório",calendar:"Calendário"};

// ── STATE (em memória — Firebase é a fonte da verdade) ─────────────────
let S={
  theme:"dark", salary:0, extra:0,
  expenses:[], cards:[], installments:[], goals:[],
  filterMonth:"",
  currentTab:"home", selectedBrand:"Visa", selectedInstCard:null, selectedGoalEmoji:"🎯",
};
const T=()=>THEMES[S.theme];
const fmt=v=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v||0);
const today=()=>new Date().toISOString().split("T")[0];
const fmtD=d=>new Date(d+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});
const curM=()=>{const n=new Date();return`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;};
const fmtMonth=m=>{if(!m)return"";const[y,mo]=m.split("-");return new Date(y,mo-1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});};



// ── TOAST ─────────────────────────────────────────────────────────────
let _toastT=null;
function toast(msg,type="ok"){
  const el=document.getElementById("toast"),t=T();
  const col={ok:{bg:t.accent,c:"#000"},err:{bg:t.danger,c:"#fff"},info:{bg:t.blue,c:"#fff"}};
  const cc=col[type]||col.ok;
  el.style.background=cc.bg;el.style.color=cc.c;el.style.boxShadow=`0 4px 20px ${cc.bg}55`;
  el.textContent=msg;el.style.display="block";el.className="";void el.offsetWidth;el.className="slide-up";
  if(_toastT)clearTimeout(_toastT);
  _toastT=setTimeout(()=>el.style.display="none",2800);
}

// ── CONFIRM ───────────────────────────────────────────────────────────
function confirm2(opts){
  const t=T();
  document.getElementById("confirm-emoji").textContent=opts.emoji||"⚠️";
  document.getElementById("confirm-title").textContent=opts.title||"Tem certeza?";
  document.getElementById("confirm-msg").textContent=opts.msg||"";
  const ok=document.getElementById("confirm-ok-btn");
  ok.textContent=opts.okLabel||"Confirmar";ok.style.background=opts.okColor||t.danger;ok.style.color="#fff";
  const cancel=document.getElementById("confirm-cancel-btn");
  cancel.style.background=t.cardLight;cancel.style.color=t.muted;cancel.style.border=`1px solid ${t.border}`;
  ok.onclick=()=>{closeModal("modal-confirm");opts.ok&&opts.ok();};
  openModal("modal-confirm");
}

// ── CARD HTML ─────────────────────────────────────────────────────────
function cardHTML(card,small){
  const b=BRANDS[card.brand]||BRANDS["Visa"];
  const w=small?115:280,h=small?68:158,r=small?10:18;
  const bg=b.gradient||`linear-gradient(135deg,${b.color},${b.color}bb)`;
  return`<div style="width:${w}px;height:${h}px;border-radius:${r}px;flex-shrink:0;background:${bg};position:relative;overflow:hidden;border:1px solid ${b.accent}33;box-shadow:0 8px 28px ${b.color}44">
    <div style="position:absolute;top:-18px;right:-18px;width:80px;height:80px;border-radius:50%;background:${b.accent}22"></div>
    <div style="padding:${small?"8px 10px":"18px 20px"};height:100%;display:flex;flex-direction:column;justify-content:space-between;color:${b.text}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <span style="font-size:${small?9:11}px;opacity:.75;font-weight:600">${card.name}</span>
        <span style="font-size:${small?12:22}px;font-weight:900;color:${b.accent};letter-spacing:-1px">${b.label}</span>
      </div>
      ${!small?`<div><p style="font-size:9px;opacity:.5;margin-bottom:3px">Limite disponível</p><p style="font-size:17px;font-weight:700">${fmt(card.limit)}</p></div>`:""}
    </div>
  </div>`;
}

// ── THEME ─────────────────────────────────────────────────────────────
function applyTheme(){
  const t=T(), light=S.theme==="light"||S.theme==="rose";
  document.body.style.background=t.bg;
  document.body.style.color=t.text;
  const sb=document.getElementById("sidebar");if(sb)sb.style.cssText=`background:${t.sidebar};border-color:${t.border}`;
  const bn=document.getElementById("bottom-nav");if(bn)bn.style.cssText=`background:${t.navBg};border-top-color:${t.border}`;
  const ti=document.getElementById("theme-icon-side");if(ti)ti.textContent=t.icon;
  const tb=document.getElementById("theme-btn-top");if(tb){tb.textContent=t.icon+" Tema";tb.style.cssText=`background:${t.cardLight};border:1px solid ${t.border};color:${t.muted}`;}
  const lb=document.getElementById("logout-btn");
  if(lb){
    lb.style.color=t.danger;
    lb.style.background=`${t.danger}10`;
    lb.style.border=`1px solid ${t.danger}30`;
    lb.style.borderRadius="12px";
    lb.style.marginTop="4px";
  }
  // Aplica ham-btn color
  const hb=document.getElementById("ham-btn");if(hb){const spans=hb.querySelectorAll("span");spans.forEach(s=>s.style.background=t.text);}
  let st=document.getElementById("dyn-style")||document.createElement("style");st.id="dyn-style";
  st.textContent=`
    ::-webkit-scrollbar-thumb{background:${t.border};}
    .crd,#status-card{background:${t.card};border-color:${t.border};box-shadow:${t.cardShadow||'none'};}
    .inp{background:${t.cardLight};border-color:${t.border};color:${t.text};}
    .inp:focus{border-color:${t.accent};}
    .inp.error{border-color:${t.danger}!important;}
    .chip{background:${t.cardLight};border-color:${t.border};color:${t.muted};}
    .chip.active{background:${t.accent}18;border-color:${t.accent};color:${t.accent};}
    .side-btn{color:${t.muted};}
    .side-btn:hover{background:${t.accent}12;color:${t.accent};}
    .side-btn.active{background:${t.accent}18;color:${t.accent};}
    .side-divider{background:${t.border};}
    .tab-btn{color:${t.muted};}
    .tab-btn.active{color:${t.accent};}
    .row{border-color:${t.border}44;}
    .btn-sm{background:${t.cardLight};border:1px solid ${t.border};color:${t.muted};}
    .btn-p{background:${t.accent};color:${light?"#fff":"#000"};}
    .modal-box{background:${t.card};border-color:${t.border};}
    .sec{color:${t.muted};}
    .prog-bg{background:${t.cardLight};}
    .user-badge-inner{border-color:${t.border};background:${t.cardLight};}
    .user-avatar{background:${t.accent};}
    #logout-btn{color:${t.danger}!important;font-weight:700;}
    #topbar{border-bottom:1px solid ${t.border}44;}
    #login-screen,#loading-screen,#setup-screen{background:${t.bg};}
    #sync-indicator{font-size:11px;color:${t.muted};background:${t.cardLight};border-radius:10px;margin:0 2px 6px;}
  `;
  document.head.appendChild(st);
  const sd=document.getElementById("sync-dot");if(sd)sd.style.background=t.accent;
  // Topbar border
  const tp=document.getElementById("topbar");if(tp)tp.style.borderBottomColor=t.border+"44";
}


// ── CALENDÁRIO DE CONTAS ──────────────────────────────────────────────
let _calYear  = new Date().getFullYear();
let _calMonth = new Date().getMonth(); // 0-based

function renderCalendar(){
  const t   = T();
  const now = new Date();
  const y   = _calYear;
  const m   = _calMonth;

  const firstDay    = new Date(y, m, 1);
  const lastDay     = new Date(y, m+1, 0);
  const daysInMonth = lastDay.getDate();
  const startOffset = firstDay.getDay(); // 0=dom

  const monthStr = `${y}-${String(m+1).padStart(2,"0")}`;
  const todayStr = now.toISOString().split("T")[0];

  // ── Coleta eventos por dia ────────────────────────────────────────
  const events = {};
  const addEvent = (ds, ev) => { if(!events[ds])events[ds]=[]; events[ds].push(ev); };

  // ── PARCELAS ──────────────────────────────────────────────────────
  // Mostra em TODOS os meses em que a parcela está ativa
  // (startMonth <= monthStr E não quitada OU ainda futura)
  S.installments.forEach(i => {
    // Calcula o mês de início e fim da dívida
    const start = i.startMonth || "0000-00";
    const totalParcelas = i.installments || 1;

    // Calcula o mês final: startMonth + totalParcelas meses
    const [sy, smo] = start.split("-").map(Number);
    const endDate   = new Date(sy, smo - 1 + totalParcelas, 1);
    const endMonth  = `${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,"0")}`;

    // Só aparece se o mês visualizado está dentro do período da dívida
    if(start > monthStr) return;        // ainda não começou
    if(monthStr >= endMonth) return;    // já terminou (quitada no tempo)

    // Parcela já quitada manualmente antes do fim?
    const isQuitada = i.paidInstallments >= i.installments;

    // Qual parcela é essa no mês visualizado?
    const [iy, imo] = start.split("-").map(Number);
    const parcNum   = (y - iy) * 12 + (m+1 - imo) + 1; // 1-based

    // Dia de vencimento — se não tiver dueDay, usa dia 1
    const dueDay = i.dueDay || 1;
    const day    = Math.min(dueDay, daysInMonth);
    const ds     = `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    addEvent(ds, {
      type:    "inst",
      label:   i.desc,
      color:   isQuitada ? t.muted : (parcNum > i.paidInstallments ? t.warn : t.accent),
      amount:  i.installmentValue,
      id:      i.id,
      parcNum,
      total:   i.installments,
      paid:    i.paidInstallments,
      quitada: isQuitada,
      pago:    parcNum <= i.paidInstallments,
    });
  });

  // ── GASTOS RECORRENTES ────────────────────────────────────────────
  // Projeta em todos os meses (passados e futuros) pelo dia original
  const recurringBase = S.expenses.filter(e =>
    e.recurring &&
    !e._fromRecurring &&  // só o gasto original, não os relançamentos
    e.date               // precisa ter data
  );
  recurringBase.forEach(e => {
    const origDay = parseInt(e.date.split("-")[2]) || 1;
    const day     = Math.min(origDay, daysInMonth);
    const ds      = `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    // Verifica se já foi lançado nesse mês (existe um _fromRecurring)
    const jaLancado = S.expenses.some(x =>
      x._fromRecurring === e.id &&
      x.date?.startsWith(monthStr)
    );
    addEvent(ds, {
      type:      "recurring",
      label:     e.desc,
      color:     jaLancado ? t.accent : t.blue,
      amount:    e.amount,
      id:        e.id,
      jaLancado,
    });
  });

  // ── GASTOS AVULSOS do mês ─────────────────────────────────────────
  S.expenses
    .filter(e => e.date?.startsWith(monthStr) && !e.recurring && !e._fromRecurring)
    .forEach(e => addEvent(e.date, {
      type:"expense", label:e.desc,
      color:t.danger, amount:e.amount, id:e.id, cat:e.cat,
    }));

  // ── Totais do mês ─────────────────────────────────────────────────
  const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const monthName = new Date(y, m).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});

  const totalInst = S.installments.filter(i => {
    const start = i.startMonth || "0000-00";
    const [sy,smo] = start.split("-").map(Number);
    const endDate  = new Date(sy, smo-1+(i.installments||1), 1);
    const endMonth = `${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,"0")}`;
    return start <= monthStr && monthStr < endMonth;
  }).reduce((s,i) => s+i.installmentValue, 0);

  const totalExp = S.expenses
    .filter(e => e.date?.startsWith(monthStr))
    .reduce((s,e) => s+e.amount, 0);

  let html = `
    <!-- Cabeçalho do calendário -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div style="display:flex;align-items:center;gap:10px">
        <button onclick="_calNav(-1)" style="background:${t.cardLight};border:1px solid ${t.border};border-radius:10px;padding:8px 13px;color:${t.text};font-size:16px;cursor:pointer">‹</button>
        <h2 style="font-size:16px;font-weight:800;text-transform:capitalize;min-width:160px;text-align:center">${monthName}</h2>
        <button onclick="_calNav(1)"  style="background:${t.cardLight};border:1px solid ${t.border};border-radius:10px;padding:8px 13px;color:${t.text};font-size:16px;cursor:pointer">›</button>
      </div>
      <button onclick="_calGoToday()" style="background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:8px 14px;color:${t.accent};font-size:12px;font-weight:700;cursor:pointer">Hoje</button>
    </div>

    <!-- Resumo do mês -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px">
      <div class="crd" style="padding:12px 14px">
        <p style="font-size:10px;color:${t.muted};margin-bottom:4px">Parcelas</p>
        <p style="font-size:16px;font-weight:800;color:${t.warn}">${fmt(totalInst)}</p>
      </div>
      <div class="crd" style="padding:12px 14px">
        <p style="font-size:10px;color:${t.muted};margin-bottom:4px">Gastos</p>
        <p style="font-size:16px;font-weight:800;color:${t.danger}">${fmt(totalExp)}</p>
      </div>
      <div class="crd" style="padding:12px 14px">
        <p style="font-size:10px;color:${t.muted};margin-bottom:4px">Eventos</p>
        <p style="font-size:16px;font-weight:800;color:${t.blue}">${Object.values(events).reduce((a,v)=>a+v.length,0)}</p>
      </div>
    </div>

    <!-- Legenda -->
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;font-size:11px;color:${t.muted}">
      <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${t.warn};margin-right:4px"></span>Parcela pendente</span>
      <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${t.accent};margin-right:4px"></span>Parcela paga</span>
      <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${t.blue};margin-right:4px"></span>Recorrente</span>
      <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${t.danger};margin-right:4px"></span>Gasto avulso</span>
    </div>

    <!-- Grid do calendário -->
    <div class="crd" style="padding:14px;overflow:hidden">
      <!-- Dias da semana -->
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px">
        ${WEEKDAYS.map(d=>`<div style="text-align:center;font-size:10px;font-weight:700;color:${t.muted};padding:4px 0">${d}</div>`).join("")}
      </div>
      <!-- Células dos dias -->
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px" id="cal-grid">`;

  // Células vazias antes do dia 1
  for(let i=0;i<startOffset;i++){
    html+=`<div style="min-height:54px"></div>`;
  }

  // Dias do mês
  for(let d=1;d<=daysInMonth;d++){
    const ds      = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const isToday = ds === todayStr;
    const dayEvs  = events[ds] || [];
    const hasEvs  = dayEvs.length > 0;

    // Cores dos pontos (máx 3 pontos)
    const dots = [...new Set(dayEvs.map(e=>e.color))].slice(0,3);

    html+=`<div onclick="_calDayClick('${ds}')"
      style="min-height:54px;border-radius:10px;padding:5px 4px;cursor:${hasEvs?"pointer":"default"};
             background:${isToday?t.accent+"22":hasEvs?t.cardLight:"transparent"};
             border:1px solid ${isToday?t.accent+"66":hasEvs?t.border+"88":"transparent"};
             transition:background .12s;text-align:center"
      ${hasEvs?`onmouseover="this.style.background='${t.cardLight}'" onmouseout="this.style.background='${isToday?t.accent+"22":t.cardLight}'"`:""}>
      <p style="font-size:12px;font-weight:${isToday?"800":"500"};color:${isToday?t.accent:t.text};margin-bottom:4px">${d}</p>
      <div style="display:flex;justify-content:center;gap:3px;flex-wrap:wrap">
        ${dots.map(c=>`<span style="display:block;width:6px;height:6px;border-radius:50%;background:${c}"></span>`).join("")}
      </div>
      ${dayEvs.length>3?`<p style="font-size:9px;color:${t.muted};margin-top:2px">+${dayEvs.length-3}</p>`:""}
    </div>`;
  }

  html += `</div></div>`; // fecha grid e crd

  window._calEvents = events; // cache para _calDayClick

  // ── SEÇÃO: REGISTRAR GASTO ────────────────────────────────────────
  html += `
    <div style="margin-top:28px">
      <p class="sec">Registrar Gasto</p>
      <div class="crd">
        <div class="grid-2 keep-2" style="gap:10px;margin-bottom:10px">
          <input class="inp" type="date" id="cal-date" value="${todayStr}"/>
          <select class="inp" id="cal-cat">${Object.keys(CATS).map(cat=>`<option>${cat}</option>`).join("")}</select>
        </div>
        <input class="inp" id="cal-desc" placeholder="Descrição (ex: Mercado)" style="margin-bottom:10px"/>
        <div class="grid-2 keep-2" style="gap:10px;margin-bottom:10px">
          <input class="inp" type="number" id="cal-amount" placeholder="Valor (R$)" step="0.01"/>
          <select class="inp" id="cal-card">
            <option value="">💵 Dinheiro</option>
            ${S.cards.map(cd=>`<option value="${cd.id}">${cd.name}</option>`).join("")}
          </select>
        </div>
        <textarea class="inp" id="cal-note" placeholder="Observação (opcional)" style="margin-bottom:12px;resize:vertical;min-height:48px;font-size:13px;line-height:1.5"></textarea>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:14px;cursor:pointer;font-size:13px;font-weight:600">
          <input type="checkbox" id="cal-recurring" style="width:15px;height:15px;accent-color:${t.accent}"/>
          Gasto recorrente (repetir todo mês)
        </label>
        <button class="btn-p" onclick="saveCalExp()">+ Registrar Gasto</button>
      </div>
    </div>`;

  // ── SEÇÃO: GASTOS DO MÊS ─────────────────────────────────────────
  const monthExps = S.expenses
    .filter(e => e.date?.startsWith(monthStr))
    .sort((a,b) => b.date.localeCompare(a.date));

  html += `<div style="margin-top:28px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <p class="sec" style="margin-bottom:0">Gastos do Mês (${monthExps.length})</p>
      ${monthExps.length ? `<span style="font-size:13px;font-weight:700;color:${t.danger}">${fmt(monthExps.reduce((s,e)=>s+e.amount,0))}</span>` : ""}
    </div>`;

  if(!monthExps.length){
    html += `<div class="crd" style="text-align:center;padding:32px">
      <p style="font-size:32px;margin-bottom:8px">💸</p>
      <p style="color:${t.muted};font-size:13px">Nenhum gasto registrado neste mês.</p>
    </div>`;
  } else {
    html += `<div class="crd" style="padding:0 18px">`;
    monthExps.forEach(e => {
      const card = S.cards.find(cd => cd.id == e.cardId);
      const who  = window._houseMembers && e._createdBy && window._houseMembers[e._createdBy]
        ? `<span class="badge" style="background:${t.warn}18;color:${t.warn}">${(window._houseMembers[e._createdBy]||"").split(" ")[0]}</span>`
        : "";
      html += `<div class="row" style="flex-direction:column;align-items:stretch;gap:0">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:38px;height:38px;background:${t.cardLight};border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${CATS[e.cat]||"💸"}</div>
          <div style="flex:1;min-width:0">
            <p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${e.desc}${e.recurring?` <span style="font-size:9px;background:${t.blue}18;color:${t.blue};padding:1px 5px;border-radius:5px;font-weight:700">🔁</span>`:""}
            </p>
            <div style="display:flex;gap:6px;margin-top:2px;align-items:center;flex-wrap:wrap">
              <span style="font-size:10px;color:${t.muted}">${fmtD(e.date)}</span>
              ${card?`<span class="badge" style="background:${t.blue}18;color:${t.blue}">${card.name}</span>`:""}
              ${who}
            </div>
          </div>
          <p style="font-weight:700;color:${t.danger};white-space:nowrap;margin-right:6px">${fmt(e.amount)}</p>
          <button data-comment-id="${e.id}" onclick="openComments('${e.id}')" style="background:${t.cardLight};border:1px solid ${t.border};border-radius:8px;padding:5px 8px;color:${t.muted};font-size:11px;flex-shrink:0;margin-right:4px">💬</button>
          <button onclick="openEditExp('${e.id}')" style="background:${t.blue}15;border:none;border-radius:8px;padding:6px 9px;color:${t.blue};font-size:12px;flex-shrink:0;margin-right:4px">✏️</button>
          <button onclick="delExp('${e.id}')" style="background:${t.danger}15;border:none;border-radius:8px;padding:6px 9px;color:${t.danger};font-size:12px;flex-shrink:0">✕</button>
        </div>
        ${e.note?`<p style="font-size:11px;color:${t.muted};margin-top:5px;padding:5px 8px;background:${t.cardLight};border-radius:8px;line-height:1.5;white-space:pre-wrap">📝 ${e.note}</p>`:""}
      </div>`;
    });
    html += `</div>`;
  }
  html += `</div>`;

  // ── SEÇÃO: DÍVIDAS / PARCELAMENTOS ───────────────────────────────
  html += `<div style="margin-top:28px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <p class="sec" style="margin-bottom:0">Dívidas &amp; Parcelamentos (${S.installments.length})</p>
      <button onclick="openAddInst()" style="background:${t.warn}18;border:1px solid ${t.warn}44;border-radius:10px;padding:8px 16px;color:${t.warn};font-weight:700;font-size:12px">+ Nova Dívida</button>
    </div>`;

  if(!S.installments.length){
    html += `<div class="crd" style="text-align:center;padding:32px">
      <p style="font-size:32px;margin-bottom:8px">✅</p>
      <p style="color:${t.muted};font-size:13px">Nenhuma dívida cadastrada.</p>
    </div>`;
  } else {
    S.installments.forEach(i => {
      const card = S.cards.find(cd => cd.id == i.cardId);
      const prog = (i.paidInstallments / i.installments) * 100;
      const done = i.paidInstallments >= i.installments;
      const overdue = !done && i.dueDay > 0 && new Date().getDate() > i.dueDay;
      html += `<div class="crd" id="inst-${i.id}" style="margin-bottom:10px;opacity:${done?.5:1};transition:opacity .3s">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
              <p style="font-size:15px;font-weight:700">${i.desc}</p>
              ${done?`<span class="badge" style="background:${t.accent}18;color:${t.accent}">QUITADO</span>`:""}
              ${overdue?`<span class="badge" style="background:${t.danger}18;color:${t.danger}">ATRASADA</span>`:""}
            </div>
            ${card?`<div style="margin-bottom:6px">${cardHTML(card,true)}</div>`:`<span class="badge" style="background:${t.cardLight};color:${t.muted}">💵 Sem cartão</span>`}
          </div>
          <div style="text-align:right;flex-shrink:0;margin-left:12px">
            <p style="font-size:22px;font-weight:800;color:${overdue?t.danger:t.warn}">${fmt(i.installmentValue)}</p>
            <p style="font-size:10px;color:${t.muted}">por mês</p>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:${t.muted};margin-bottom:8px">
          <span>${i.paidInstallments}/${i.installments} parcelas${i.dueDay?` · Vence dia ${i.dueDay}`:""}</span>
          <span>Restante: ${fmt((i.installments-i.paidInstallments)*i.installmentValue)}</span>
        </div>
        <div class="prog-bg" style="height:5px;margin-bottom:12px">
          <div class="prog-fill" style="width:${prog}%;background:${done?t.accent:overdue?t.danger:t.warn}"></div>
        </div>
        <div style="display:flex;gap:8px">
          ${!done?`<button onclick="payInst('${i.id}','calendar')" style="flex:1;background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:10px;color:${t.accent};font-weight:700;font-size:12px">✓ Pagar parcela</button>`:""}
          <button onclick="openEditInst('${i.id}')" style="background:${t.blue}15;border:1px solid ${t.blue}33;border-radius:10px;padding:10px 14px;color:${t.blue};font-size:12px;font-weight:700">✏️</button>
          <button onclick="delInst('${i.id}')" style="background:${t.danger}15;border:none;border-radius:10px;padding:10px 14px;color:${t.danger};font-size:12px">✕</button>
        </div>
      </div>`;
    });
  }
  html += `</div>`;

  document.getElementById("tab-calendar").innerHTML = html;
}


// ── SALVAR GASTO PELO CALENDÁRIO ─────────────────────────────────────
function saveCalExp(){
  const dEl=document.getElementById("cal-desc"),aEl=document.getElementById("cal-amount");
  const desc=dEl.value.trim(),amount=parseFloat(aEl.value);
  let ok=true;
  if(!desc){dEl.classList.add("error");setTimeout(()=>dEl.classList.remove("error"),600);ok=false;}
  if(!amount||amount<=0){aEl.classList.add("error");setTimeout(()=>aEl.classList.remove("error"),600);ok=false;}
  if(!ok){toast("Preencha descrição e valor!","err");return;}
  const cv        = document.getElementById("cal-card").value;
  const note      = (document.getElementById("cal-note")?.value||"").trim();
  const recurring = document.getElementById("cal-recurring")?.checked||false;
  const date      = document.getElementById("cal-date").value || today();
  const data={date,desc,amount,cat:document.getElementById("cal-cat").value,cardId:cv||null,note:note||"",recurring};
  dEl.value="";aEl.value="";
  const nn=document.getElementById("cal-note");if(nn)nn.value="";
  const rc=document.getElementById("cal-recurring");if(rc)rc.checked=false;
  // Atualiza o mês do calendário para o mês do gasto registrado
  const [ey,em]=date.split("-").map(Number);
  _calYear=ey;_calMonth=em-1;
  window.fbAdd("expenses",data)
    .then(()=>toast(recurring?"🔁 Gasto recorrente salvo!":"✅ Gasto registrado!"))
    .catch(e=>toast("Erro: "+e.message,"err"));
}

function _calNav(delta){
  _calMonth += delta;
  if(_calMonth > 11){ _calMonth = 0; _calYear++; }
  if(_calMonth < 0) { _calMonth = 11; _calYear--; }
  renderCalendar();
}

function _calGoToday(){
  _calYear  = new Date().getFullYear();
  _calMonth = new Date().getMonth();
  renderCalendar();
}

function _calDayClick(dateStr){
  const t     = T();
  const dayEvs = (window._calEvents||{})[dateStr] || [];
  if(!dayEvs.length) return;

  const label = new Date(dateStr+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"});

  const items = dayEvs.map(ev => {
    let emoji = "💸", sub = "";
    if(ev.type === "inst"){
      emoji = ev.quitada ? "✅" : ev.pago ? "✔️" : "📅";
      const status = ev.quitada
        ? "Dívida quitada"
        : ev.pago
          ? `Parcela ${ev.parcNum}/${ev.total} — paga`
          : `Parcela ${ev.parcNum}/${ev.total} · ${ev.paid} paga${ev.paid!==1?"s":""}`;
      sub = `${fmt(ev.amount)}/mês · ${status}`;
    } else if(ev.type === "recurring"){
      emoji = "🔁";
      sub   = `${fmt(ev.amount)} · Recorrente${ev.jaLancado?" · ✓ lançado este mês":""}`;
    } else {
      emoji = CATS[ev.cat] || "💸";
      sub   = `${fmt(ev.amount)} · ${ev.cat||"Gasto"}`;
    }
    return `
      <div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid ${t.border}44">
        <div style="width:36px;height:36px;border-radius:10px;background:${ev.color}22;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${emoji}</div>
        <div style="flex:1;min-width:0">
          <p style="font-size:13px;font-weight:700;color:${ev.color};margin-bottom:3px">${ev.label}</p>
          <p style="font-size:11px;color:${t.muted};line-height:1.5">${sub}</p>
        </div>
      </div>`;
  }).join("");

  confirm2({
    emoji:"📅",
    title:label,
    msg:"",
    okLabel:"Fechar",
    okColor:t.accent,
    ok:()=>{},
  });
  setTimeout(()=>{
    const msgEl = document.getElementById("confirm-msg");
    if(msgEl) msgEl.innerHTML = `<div style="text-align:left;margin-top:8px">${items}</div>`;
    const cancel = document.getElementById("confirm-cancel-btn");
    if(cancel) cancel.style.display = "none";
  }, 10);
}

// ── RELATÓRIO MENSAL ──────────────────────────────────────────────────
let _reportMonth = "";
function renderReport(){
  const t=T();
  if(!_reportMonth) _reportMonth=curM();
  const m=_reportMonth;

  // Dados do mês selecionado
  const mExp=S.expenses.filter(e=>e.date?.startsWith(m));
  const mInst=S.installments.filter(i=>{
    if(i.paidInstallments>=i.installments)return false;
    return !i.startMonth||i.startMonth<=m;
  });
  const eT=mExp.reduce((s,e)=>s+e.amount,0);
  const iT=mInst.reduce((s,i)=>s+i.installmentValue,0);
  const tot=eT+iT;
  const income=S.salary+S.extra;
  const rem=income-tot;
  const pct=income?Math.min((tot/income)*100,100):0;
  const hLabel=pct<50?"Ótimo! 😊":pct<75?"Atenção! 😐":"Crítico! 😰";
  const hColor=pct<50?t.accent:pct<75?t.warn:t.danger;

  // Meses disponíveis para seleção
  const months=[...new Set(S.expenses.map(e=>e.date?.slice(0,7)).filter(Boolean))]
    .sort((a,b)=>b.localeCompare(a)).slice(0,12);
  if(!months.includes(m)&&months.length) months.unshift(m);
  const monthOpts=months.map(mo=>`<option value="${mo}" ${mo===m?"selected":""}>${fmtMonth(mo)}</option>`).join("");

  // Gastos por categoria
  const catRows=Object.entries(CATS).map(([cat,emoji])=>{
    const items=mExp.filter(e=>e.cat===cat);
    const total=items.reduce((s,e)=>s+e.amount,0);
    if(!total)return"";
    const cp=(total/(tot||1))*100;
    return`<tr>
      <td style="padding:10px 0;border-bottom:1px solid ${t.border}22">${emoji} ${cat}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${t.border}22;text-align:right;font-weight:700;color:${t.text}">${fmt(total)}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${t.border}22;text-align:right;color:${t.muted};font-size:12px">${cp.toFixed(1)}%</td>
    </tr>`;
  }).join("");

  // Gastos avulsos detalhados
  const expRows=mExp.slice().sort((a,b)=>b.date.localeCompare(a.date))
    .map(e=>{
      const card=S.cards.find(c=>c.id==e.cardId);
      return`<tr>
        <td style="padding:9px 0;border-bottom:1px solid ${t.border}22;font-size:13px">${fmtD(e.date)}</td>
        <td style="padding:9px 0;border-bottom:1px solid ${t.border}22;font-size:13px">${e.desc}</td>
        <td style="padding:9px 0;border-bottom:1px solid ${t.border}22;font-size:12px;color:${t.muted}">${CATS[e.cat]||""} ${e.cat}</td>
        <td style="padding:9px 0;border-bottom:1px solid ${t.border}22;font-size:12px;color:${t.muted}">${card?card.name:"Dinheiro"}</td>
        <td style="padding:9px 0;border-bottom:1px solid ${t.border}22;text-align:right;font-weight:700;color:${t.danger};font-size:13px">${fmt(e.amount)}</td>
      </tr>`;
    }).join("");

  // Parcelas do mês
  const instRows=mInst.map(i=>`<tr>
    <td style="padding:9px 0;border-bottom:1px solid ${t.border}22;font-size:13px">${i.desc}</td>
    <td style="padding:9px 0;border-bottom:1px solid ${t.border}22;font-size:12px;color:${t.muted}">${i.paidInstallments}/${i.installments}x</td>
    <td style="padding:9px 0;border-bottom:1px solid ${t.border}22;font-size:12px;color:${t.muted}">${i.dueDay?`Dia ${i.dueDay}`:"-"}</td>
    <td style="padding:9px 0;border-bottom:1px solid ${t.border}22;text-align:right;font-weight:700;color:${t.warn};font-size:13px">${fmt(i.installmentValue)}</td>
  </tr>`).join("");

  const tStyle=`width:100%;border-collapse:collapse;font-size:13px;color:${t.text}`;
  const thStyle=`font-size:10px;color:${t.muted};letter-spacing:1px;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid ${t.border};text-align:left;font-weight:700`;

  document.getElementById("tab-report").innerHTML=`
    <!-- Seletor de mês + botão exportar -->
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <p class="sec" style="margin:0">Mês:</p>
        <select class="inp" style="width:auto;padding:8px 12px;font-weight:700" onchange="_reportMonth=this.value;renderReport()">
          ${monthOpts}
        </select>
      </div>
      <button onclick="exportReportPDF()" style="background:${t.accent};border:none;border-radius:12px;padding:10px 20px;color:#000;font-weight:800;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:8px">
        📄 Exportar PDF
      </button>
    </div>

    <!-- Cards de resumo -->
    <div class="grid-3" style="margin-bottom:20px">
      ${[
        {l:"Renda",       v:fmt(income),  c:t.accent, i:"💰"},
        {l:"Comprometido",v:fmt(tot),     c:t.danger, i:"📤"},
        {l:"Disponível",  v:fmt(rem),     c:rem>=0?t.accent:t.danger,i:"✅"},
        {l:"Avulsos",     v:fmt(eT),      c:t.blue,   i:"🧾"},
        {l:"Parcelas",    v:fmt(iT),      c:t.warn,   i:"📅"},
        {l:"Status",      v:hLabel,       c:hColor,   i:"📊"},
      ].map(s=>`<div class="crd" style="padding:14px 16px">
        <p style="font-size:18px;margin-bottom:6px">${s.i}</p>
        <p style="font-size:11px;color:${t.muted};margin-bottom:4px">${s.l}</p>
        <p style="font-size:16px;font-weight:800;color:${s.c}">${s.v}</p>
      </div>`).join("")}
    </div>

    <!-- Barra de progresso -->
    <div class="crd" style="padding:16px 20px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px">
        <span style="color:${t.muted}">Comprometido do orçamento</span>
        <span style="font-weight:800;color:${hColor}">${pct.toFixed(1)}%</span>
      </div>
      <div class="prog-bg" style="height:12px;border-radius:99px">
        <div class="prog-fill" style="height:12px;width:${pct}%;background:linear-gradient(90deg,${t.accent},${pct>75?t.danger:t.warn});border-radius:99px;transition:width .6s"></div>
      </div>
      <p style="font-size:11px;color:${t.muted};margin-top:8px;text-align:right">${fmt(tot)} de ${fmt(income)}</p>
    </div>

    <div class="grid-2" style="align-items:start;gap:20px">
      <div>
        <!-- Gastos por Categoria -->
        <p class="sec">Gastos por Categoria</p>
        <div class="crd" style="padding:16px 20px;margin-bottom:20px">
          ${catRows?`<table style="${tStyle}">
            <thead><tr>
              <th style="${thStyle}">Categoria</th>
              <th style="${thStyle};text-align:right">Total</th>
              <th style="${thStyle};text-align:right">%</th>
            </tr></thead>
            <tbody>${catRows}</tbody>
            <tfoot><tr>
              <td colspan="2" style="padding-top:12px;font-size:13px;font-weight:800">Total avulsos</td>
              <td style="padding-top:12px;text-align:right;font-weight:800;color:${t.danger}">${fmt(eT)}</td>
            </tr></tfoot>
          </table>`:`<p style="color:${t.muted};font-size:13px">Nenhum gasto avulso neste mês.</p>`}
        </div>

        <!-- Parcelas do Mês -->
        <p class="sec">Parcelas do Mês</p>
        <div class="crd" style="padding:16px 20px;margin-bottom:20px">
          ${instRows?`<table style="${tStyle}">
            <thead><tr>
              <th style="${thStyle}">Dívida</th>
              <th style="${thStyle}">Parcela</th>
              <th style="${thStyle}">Vencimento</th>
              <th style="${thStyle};text-align:right">Valor</th>
            </tr></thead>
            <tbody>${instRows}</tbody>
            <tfoot><tr>
              <td colspan="3" style="padding-top:12px;font-size:13px;font-weight:800">Total parcelas</td>
              <td style="padding-top:12px;text-align:right;font-weight:800;color:${t.warn}">${fmt(iT)}</td>
            </tr></tfoot>
          </table>`:`<p style="color:${t.muted};font-size:13px">Nenhuma parcela ativa neste mês.</p>`}
        </div>
      </div>

      <div>
        <!-- Lista detalhada de gastos -->
        <p class="sec">Todos os Gastos Avulsos (${mExp.length})</p>
        <div class="crd" style="padding:16px 20px;margin-bottom:20px">
          ${expRows?`<table style="${tStyle}">
            <thead><tr>
              <th style="${thStyle}">Data</th>
              <th style="${thStyle}">Descrição</th>
              <th style="${thStyle}">Categoria</th>
              <th style="${thStyle}">Cartão</th>
              <th style="${thStyle};text-align:right">Valor</th>
            </tr></thead>
            <tbody>${expRows}</tbody>
          </table>`:`<p style="color:${t.muted};font-size:13px">Nenhum gasto avulso neste mês.</p>`}
        </div>
      </div>
    </div>`;
}

function exportReportPDF(){
  const t=T();
  const m=_reportMonth||curM();
  const mExp=S.expenses.filter(e=>e.date?.startsWith(m));
  const mInst=S.installments.filter(i=>{
    if(i.paidInstallments>=i.installments)return false;
    return !i.startMonth||i.startMonth<=m;
  });
  const eT=mExp.reduce((s,e)=>s+e.amount,0);
  const iT=mInst.reduce((s,i)=>s+i.installmentValue,0);
  const tot=eT+iT;
  const income=S.salary+S.extra;
  const rem=income-tot;
  const pct=income?Math.min((tot/income)*100,100):0;

  // Gastos por categoria para o PDF
  const catBlock=Object.entries(CATS).map(([cat,emoji])=>{
    const items=mExp.filter(e=>e.cat===cat);
    const total=items.reduce((s,e)=>s+e.amount,0);
    if(!total)return"";
    const cp=(total/(tot||1))*100;
    return`<tr><td>${emoji} ${cat}</td><td>${fmt(total)}</td><td>${cp.toFixed(1)}%</td></tr>`;
  }).join("");

  const expBlock=mExp.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(e=>{
    const card=S.cards.find(c=>c.id==e.cardId);
    return`<tr><td>${fmtD(e.date)}</td><td>${e.desc}</td><td>${e.cat}</td><td>${card?card.name:"Dinheiro"}</td><td>${fmt(e.amount)}</td></tr>`;
  }).join("");

  const instBlock=mInst.map(i=>`<tr><td>${i.desc}</td><td>${i.paidInstallments}/${i.installments}x</td><td>${i.dueDay?`Dia ${i.dueDay}`:"-"}</td><td>${fmt(i.installmentValue)}</td></tr>`).join("");

  const barW=Math.round(pct*4); // max 400px

  const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
  <title>Relatório ${fmtMonth(m)} — Meu Orçamento</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:system-ui,sans-serif;color:#1a1a2e;background:#fff;padding:32px;font-size:13px;}
    h1{font-size:22px;font-weight:800;margin-bottom:4px;}
    .sub{color:#888;font-size:12px;margin-bottom:24px;}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;}
    .card{border:1px solid #e0e0f0;border-radius:10px;padding:14px;}
    .card-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;}
    .card-val{font-size:18px;font-weight:800;}
    .bar-wrap{background:#eee;border-radius:99px;height:10px;margin:8px 0;}
    .bar-fill{height:10px;border-radius:99px;background:linear-gradient(90deg,#00b37e,${pct>75?"#ff4d6d":"#ffc94a"});}
    h2{font-size:14px;font-weight:700;margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid #eee;}
    table{width:100%;border-collapse:collapse;font-size:12px;}
    th{text-align:left;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;padding:6px 0;border-bottom:2px solid #eee;}
    td{padding:8px 0;border-bottom:1px solid #f0f0f8;}
    td:last-child,th:last-child{text-align:right;}
    .total-row td{font-weight:800;border-top:2px solid #eee;border-bottom:none;padding-top:10px;}
    .footer{margin-top:32px;text-align:center;font-size:10px;color:#bbb;}
    @media print{body{padding:20px;}@page{margin:16mm;}}
  </style>
  </head><body>
  <h1>💰 Relatório Mensal</h1>
  <p class="sub">${fmtMonth(m)} &nbsp;·&nbsp; Gerado em ${new Date().toLocaleString("pt-BR")} &nbsp;·&nbsp; Meu Orçamento</p>

  <div class="grid">
    <div class="card"><div class="card-label">Renda</div><div class="card-val" style="color:#00b37e">${fmt(income)}</div></div>
    <div class="card"><div class="card-label">Comprometido</div><div class="card-val" style="color:#ff4d6d">${fmt(tot)}</div></div>
    <div class="card"><div class="card-label">Disponível</div><div class="card-val" style="color:${rem>=0?"#00b37e":"#ff4d6d"}">${fmt(rem)}</div></div>
    <div class="card"><div class="card-label">Gastos Avulsos</div><div class="card-val" style="color:#2b7de9">${fmt(eT)}</div></div>
    <div class="card"><div class="card-label">Parcelas</div><div class="card-val" style="color:#c87800">${fmt(iT)}</div></div>
    <div class="card"><div class="card-label">% da renda</div><div class="card-val" style="color:${pct<50?"#00b37e":pct<75?"#c87800":"#ff4d6d"}">${pct.toFixed(1)}%</div></div>
  </div>
  <div class="bar-wrap"><div class="bar-fill" style="width:${barW}px"></div></div>

  ${catBlock?`<h2>Gastos por Categoria</h2>
  <table><thead><tr><th>Categoria</th><th>Total</th><th>%</th></tr></thead>
  <tbody>${catBlock}</tbody>
  <tfoot><tr class="total-row"><td>Total avulsos</td><td></td><td>${fmt(eT)}</td></tr></tfoot>
  </table>`:""}

  ${instBlock?`<h2>Parcelas do Mês</h2>
  <table><thead><tr><th>Dívida</th><th>Progresso</th><th>Vencimento</th><th>Valor/mês</th></tr></thead>
  <tbody>${instBlock}</tbody>
  <tfoot><tr class="total-row"><td>Total parcelas</td><td></td><td></td><td>${fmt(iT)}</td></tr></tfoot>
  </table>`:""}

  ${expBlock?`<h2>Gastos Avulsos — Detalhado (${mExp.length})</h2>
  <table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Pagamento</th><th>Valor</th></tr></thead>
  <tbody>${expBlock}</tbody>
  </table>`:""}

  <div class="footer">Meu Orçamento — Rayson &amp; Alessandra &nbsp;·&nbsp; Exportado em ${new Date().toLocaleString("pt-BR")}</div>
  </body></html>`;

  const w=window.open("","_blank","width=900,height=700");
  if(!w){toast("Pop-up bloqueado! Permita pop-ups para exportar.","err");return;}
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(()=>{ w.print(); }, 400);
}

// ── RENDER INTELIGENTE ───────────────────────────────────────────────
// Dirty flags: cada coleção marca quais seções precisam re-renderizar
const DIRTY_MAP = {
  house:        ["theme","salary","status","tab"],
  expenses:     ["status","tab","salary"],
  cards:        ["status","tab"],
  installments: ["status","tab","salary"],
  goals:        ["tab"],
  all:          ["theme","salary","status","tab","badge"],
};

let _dirty    = new Set();
let _rafId    = null;

function scheduleRender(source){
  const flags = DIRTY_MAP[source] || DIRTY_MAP["all"];
  flags.forEach(f => _dirty.add(f));
  if(_rafId) return;                     // já está agendado
  _rafId = requestAnimationFrame(()=>{
    _rafId = null;
    _flush();
  });
}

function _flush(){
  const d = _dirty;
  _dirty   = new Set();

  if(d.has("theme"))  applyTheme();
  if(d.has("salary")) { renderSalarySidebar(); renderSalaryTopbar(); renderNotifSettings(); }
  if(d.has("status")) {
    renderStatus();
    const sc=document.getElementById("status-card");
    if(sc){sc.classList.remove("tab-enter");void sc.offsetWidth;sc.classList.add("tab-enter");}
  }
  if(d.has("tab"))    renderTab(S.currentTab);
  if(d.has("badge"))  { updateUserBadge(); renderNotifSettings(); }
}

// Mantém compatibilidade — qualquer chamada a renderAll() ainda funciona
function renderAll(){
  scheduleRender("all");
}

function renderSalarySidebar(){
  const t=T(),total=S.salary+S.extra;
  const el=document.getElementById("salary-sidebar");if(!el)return;
  el.innerHTML=`<div style="padding:10px 14px;border-radius:14px;border:1px solid ${t.border};background:${t.cardLight}"><button onclick="openSalaryModal()" style="display:block;width:100%;background:none;border:none;text-align:left;padding:0;cursor:pointer"><p style="font-size:10px;color:${t.muted};margin-bottom:2px">Salário</p><p style="color:${t.accent};font-size:14px;font-weight:800;margin-bottom:6px">${fmt(S.salary)} ✎</p><p style="font-size:10px;color:${t.muted};margin-bottom:2px">Extra</p><p style="color:${t.blue};font-size:14px;font-weight:800;margin-bottom:6px">${fmt(S.extra)} ✎</p><div style="border-top:1px solid ${t.border};padding-top:6px"><p style="font-size:10px;color:${t.muted};margin-bottom:2px">Total em conta</p><p style="color:${t.accent};font-size:16px;font-weight:800">${fmt(total)}</p></div></button></div>`;
}
function renderSalaryTopbar(){
  const t=T(),total=S.salary+S.extra;
  const el=document.getElementById("salary-topbar");if(!el)return;
  const mob=window.innerWidth<768;

  if(mob){
    // ── MOBILE: linha única super compacta ────────────────────────────
    el.innerHTML=`
      <button onclick="openSalaryModal()" style="display:flex;align-items:center;gap:6px;background:${t.cardLight};border:1px solid ${t.border};border-radius:99px;padding:5px 12px 5px 8px;cursor:pointer;">
        <span style="font-size:11px">💰</span>
        <span style="font-size:13px;font-weight:800;color:${t.accent}">${fmt(total)}</span>
        <span style="width:1px;height:12px;background:${t.border};margin:0 2px"></span>
        <span style="font-size:10px;color:${t.muted}">✎</span>
      </button>`;
  } else {
    // ── DESKTOP: layout expandido original ───────────────────────────
    el.innerHTML=`
      <div style="display:flex;gap:14px;align-items:flex-end;flex-wrap:wrap;justify-content:flex-end">
        <div style="text-align:right">
          <p style="font-size:10px;color:${t.muted};margin-bottom:2px">Salário</p>
          <button onclick="openSalaryModal()" style="background:none;border:none;color:${t.accent};font-size:15px;font-weight:800;padding:0;cursor:pointer">${fmt(S.salary)} ✎</button>
        </div>
        <div style="text-align:right">
          <p style="font-size:10px;color:${t.muted};margin-bottom:2px">Extra</p>
          <button onclick="openSalaryModal()" style="background:none;border:none;color:${t.blue};font-size:15px;font-weight:800;padding:0;cursor:pointer">${fmt(S.extra)} ✎</button>
        </div>
        <div style="text-align:right;padding-left:12px;border-left:1px solid ${t.border}44">
          <p style="font-size:10px;color:${t.muted};margin-bottom:2px">Total</p>
          <button onclick="openSalaryModal()" style="background:none;border:none;color:${t.accent};font-size:17px;font-weight:800;padding:0;cursor:pointer">${fmt(total)}</button>
        </div>
      </div>`;
  }
}

// ── STATUS ────────────────────────────────────────────────────────────
function renderStatus(){
  const t=T(),cm=curM();
  const sc=document.getElementById("status-card");if(!sc)return;

  // ── ONBOARDING: salário ainda não configurado ───────────────────────
  if(!S.salary&&!S.extra){
    sc.innerHTML=`
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:28px 20px;gap:14px">
        <div style="font-size:48px;line-height:1">💰</div>
        <div>
          <p style="font-size:17px;font-weight:800;margin-bottom:6px">Configure sua renda primeiro</p>
          <p style="font-size:13px;color:${t.muted};line-height:1.6;max-width:320px;margin:0 auto">
            Para acompanhar quanto vocês estão comprometendo do orçamento, informe o salário e a renda extra do casal.
          </p>
        </div>
        <button onclick="openSalaryModal()" style="background:${t.accent};border:none;border-radius:14px;padding:13px 28px;font-size:14px;font-weight:800;color:#000;cursor:pointer;margin-top:4px">
          ✏️ Informar renda agora
        </button>
      </div>`;
    return;
  }

  // ── CARD NORMAL ───────────────────────────────────────────────────────
  const thisMonthExp=S.expenses.filter(e=>e.date?.startsWith(cm));
  const thisMonthInst=S.installments.filter(i=>{
    if(i.paidInstallments>=i.installments)return false;
    if(!i.startMonth)return true;
    return i.startMonth<=cm;
  });
  const iT=thisMonthInst.reduce((s,i)=>s+i.installmentValue,0);
  const eT=thisMonthExp.reduce((s,e)=>s+e.amount,0);
  // Contribuições automáticas de metas ativas (não concluídas)
  const gT=S.goals.filter(g=>g.monthlyContrib>0&&g.saved<g.target)
                  .reduce((s,g)=>s+g.monthlyContrib,0);
  const totalIncome=S.salary+S.extra,tot=eT+iT+gT,rem=totalIncome-tot;
  const pct=Math.min((tot/totalIncome)*100,100);
  const h=pct<50?{l:"Ótimo!",c:t.accent}:pct<75?{l:"Atenção",c:t.warn}:{l:"Crítico",c:t.danger};
  sc.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-bottom:20px">
    <div><p style="font-size:11px;color:${t.muted};margin-bottom:4px">Total Comprometido <span style="color:${t.blue}">${fmtMonth(cm)}</span></p><p style="font-size:28px;font-weight:800;color:${t.danger}">${fmt(tot)}</p><p style="font-size:11px;color:${t.muted};margin-top:4px"><span style="color:${t.warn}">Parcelas: ${fmt(iT)}</span> &nbsp;·&nbsp; <span style="color:${t.blue}">Avulsos: ${fmt(eT)}</span>${gT>0?` &nbsp;·&nbsp; <span style="color:${t.accent}">Metas: ${fmt(gT)}</span>`:""}</p></div>
    <div><p style="font-size:11px;color:${t.muted};margin-bottom:4px">Disponível Livre</p><p style="font-size:28px;font-weight:800;color:${rem>=0?t.accent:t.danger}">${fmt(rem)}</p></div>
    <div style="display:flex;flex-direction:column;justify-content:center;gap:8px">
      <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:${t.muted}">${pct.toFixed(1)}% do salário</span><span style="font-weight:800;color:${h.c}">${h.l}</span></div>
      <div class="prog-bg" style="height:18px;border-radius:99px">
        <div class="prog-fill" style="height:18px;width:${pct}%;background:linear-gradient(90deg,${t.accent},${pct>75?t.danger:t.warn});border-radius:99px;transition:width .6s"></div>
      </div>
      <p style="font-size:10px;color:${t.muted};text-align:right">${fmt(tot)} de ${fmt(totalIncome)}</p>
    </div>
  </div>`;
}

// ── TABS ──────────────────────────────────────────────────────────────
function setTab(tab){
  ["home","cards","goals","health","report","calendar"].forEach(id=>{
    document.getElementById("tab-"+id).style.display=id===tab?"block":"none";
    document.getElementById("side-"+id)?.classList.toggle("active",id===tab);
    document.getElementById("nav-"+id)?.classList.toggle("active",id===tab);
  });
  document.getElementById("topbar-title").textContent=TAB_LABELS[tab]||tab;
  S.currentTab=tab;renderTab(tab);
  // Animação de entrada: remove e reaplica para reiniciar
  const el=document.getElementById("tab-"+tab);
  if(el){el.classList.remove("tab-enter");void el.offsetWidth;el.classList.add("tab-enter");}
}
function renderTab(t){
  if(t==="home")renderHome();else if(t==="cards")renderCards();
  else if(t==="goals")renderGoals();else if(t==="health")renderHealth();
  else if(t==="report")renderReport();
  else if(t==="calendar")renderCalendar();
}

// ── FILTER BAR ────────────────────────────────────────────────────────
function filterBar(){
  const t=T(),fm=S.filterMonth;
  const months=[...new Set(S.expenses.map(e=>e.date?.slice(0,7)).filter(Boolean))].sort((a,b)=>b.localeCompare(a));
  return`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:20px"><span style="font-size:11px;color:${t.muted};letter-spacing:1px;text-transform:uppercase;font-weight:700;flex-shrink:0">Filtrar:</span><button class="chip ${!fm?"active":""}" onclick="setFilter('')">Tudo</button>${months.slice(0,7).map(m=>`<button class="chip ${fm===m?"active":""}" onclick="setFilter('${m}')">${fmtMonth(m)}</button>`).join("")}</div>`;
}
function setFilter(m){S.filterMonth=m;scheduleRender("expenses");}

// ── HOME ──────────────────────────────────────────────────────────────
function renderHome(){
  const t=T(),fm=S.filterMonth;
  const filtExp=fm?S.expenses.filter(e=>e.date?.startsWith(fm)):S.expenses;
  const map={};filtExp.forEach(e=>{map[e.date]=(map[e.date]||0)+e.amount;});
  const days=Object.entries(map).sort((a,b)=>b[0].localeCompare(a[0]));
  const active=S.installments.filter(i=>i.paidInstallments<i.installments);
  const iT=S.installments.reduce((s,i)=>s+i.installmentValue,0);

  let daysH=`<p class="sec">Gastos por Dia</p><div class="scroll-x" style="margin-bottom:28px">`;
  if(!days.length)daysH+=`<p style="color:${t.muted};font-size:13px;padding:10px 0">Nenhum gasto ainda.</p>`;
  days.forEach(([d,total])=>{
    const isT=d===today();
    daysH+=`<div style="min-width:110px;scroll-snap-align:start;flex-shrink:0;background:${isT?t.accent+"18":t.card};border:1px solid ${isT?t.accent+"66":t.border};border-radius:16px;padding:14px"><p style="font-size:10px;color:${isT?t.accent:t.muted};margin-bottom:6px;font-weight:700">${isT?"HOJE":fmtD(d).toUpperCase()}</p><p style="font-size:18px;font-weight:800">${fmt(total)}</p><p style="font-size:10px;color:${t.muted};margin-top:4px">${filtExp.filter(e=>e.date===d).length} item(s)</p></div>`;
  });
  daysH+=`</div>`;

  // Parcelas do mês atual
  const cm=curM();
  const thisMonthInst=active.filter(i=>!i.startMonth||i.startMonth<=cm);
  const futureInst=active.filter(i=>i.startMonth&&i.startMonth>cm);
  const thisMonthInstTotal=thisMonthInst.reduce((s,i)=>s+i.installmentValue,0);

  let instH="";
  if(thisMonthInst.length||futureInst.length){
    instH=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><p class="sec" style="margin-bottom:0">Parcelas do Mês</p><span style="font-size:14px;font-weight:700;color:${t.warn}">${fmt(thisMonthInstTotal)}</span></div><div class="scroll-x" style="margin-bottom:28px">`;
    thisMonthInst.forEach(i=>{
      const card=S.cards.find(c=>c.id==i.cardId),prog=(i.paidInstallments/i.installments)*100;
      // Verifica se está atrasada: tem dueDay e já passou do dia de vencimento esse mês
      const dueDay=i.dueDay||0;
      const todayDay=new Date().getDate();
      const overdue=dueDay>0&&todayDay>dueDay;
      instH+=`<div id="inst-h-${i.id}" class="${overdue?"overdue-pulse":""}" style="min-width:200px;scroll-snap-align:start;flex-shrink:0;background:${t.card};border:1px solid ${overdue?t.danger:t.border};border-radius:18px;padding:18px">
        ${card?`<div style="margin-bottom:12px">${cardHTML(card,true)}</div>`:""}
        <p style="font-size:14px;font-weight:700;margin-bottom:4px">${i.desc}${overdue?` <span style="font-size:10px;background:${t.danger}22;color:${t.danger};padding:2px 6px;border-radius:6px;font-weight:700">ATRASADA</span>`:""}</p>
        <p style="font-size:20px;font-weight:800;color:${overdue?t.danger:t.warn}">${fmt(i.installmentValue)}<span style="font-size:12px;color:${t.muted}">/mês</span></p>
        ${dueDay?`<p style="font-size:10px;color:${overdue?t.danger:t.muted};margin-top:4px">Vence dia ${dueDay}</p>`:""}
        <p style="font-size:10px;color:${t.muted};margin:6px 0 10px">${i.paidInstallments}/${i.installments} pagas · ${fmt((i.installments-i.paidInstallments)*i.installmentValue)} restante</p>
        <div class="prog-bg" style="height:4px;margin-bottom:12px"><div class="prog-fill" style="width:${prog}%;background:${overdue?t.danger:t.accent}"></div></div>
        <button onclick="payInst('${i.id}','h')" style="background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:8px;color:${t.accent};font-size:11px;font-weight:700;width:100%">✓ Marcar parcela paga</button>
      </div>`;
    });
    // Parcelas futuras (próximo mês+)
    if(futureInst.length){
      futureInst.forEach(i=>{
        instH+=`<div style="min-width:180px;scroll-snap-align:start;flex-shrink:0;background:${t.cardLight};border:1px solid ${t.border}66;border-radius:18px;padding:18px;opacity:.6">
          <p style="font-size:10px;color:${t.blue};font-weight:700;margin-bottom:8px">📅 A PARTIR DE ${fmtMonth(i.startMonth).toUpperCase()}</p>
          <p style="font-size:14px;font-weight:700;margin-bottom:4px">${i.desc}</p>
          <p style="font-size:18px;font-weight:800;color:${t.muted}">${fmt(i.installmentValue)}<span style="font-size:11px">/mês</span></p>
        </div>`;
      });
    }
    instH+=`</div>`;
  }

  const recentH=filtExp.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map(e=>{
    const card=S.cards.find(c=>c.id==e.cardId);
    const who=window._houseMembers&&e._createdBy&&window._houseMembers[e._createdBy]?`<span class="badge" style="background:${t.warn}18;color:${t.warn}">${(window._houseMembers[e._createdBy]||"").split(" ")[0]}</span>`:"";
    return`<div class="row" style="flex-direction:column;align-items:stretch;gap:0"><div style="display:flex;align-items:center;gap:8px"><div style="width:40px;height:40px;background:${t.cardLight};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${CATS[e.cat]||"💸"}</div><div style="flex:1;min-width:0"><p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.desc}${e.recurring?` <span style="font-size:9px;background:${t.blue}18;color:${t.blue};padding:1px 6px;border-radius:5px;font-weight:700">🔁</span>`:""}</p><div style="display:flex;gap:6px;align-items:center;margin-top:2px"><span style="font-size:10px;color:${t.muted}">${fmtD(e.date)}</span>${card?`<span class="badge" style="background:${t.blue}18;color:${t.blue}">${card.name}</span>`:""}${who}</div></div><p style="font-weight:700;color:${t.danger};font-size:14px;white-space:nowrap">${fmt(e.amount)}</p><button data-comment-id="${e.id}" onclick="openComments('${e.id}')" style="background:${t.cardLight};border:1px solid ${t.border};border-radius:8px;padding:5px 9px;color:${t.muted};font-size:11px;flex-shrink:0;margin-left:6px">💬</button></div>${e.note?`<p style="font-size:11px;color:${t.muted};margin-top:5px;padding:5px 8px;background:${t.cardLight};border-radius:8px;line-height:1.5">📝 ${e.note}</p>`:""}</div>`;
  }).join("");

  document.getElementById("tab-home").innerHTML=`${filterBar()}${daysH}${instH}<div class="grid-2" style="align-items:start"><div><p class="sec">Registrar Gasto</p><div class="crd"><div class="grid-2 keep-2" style="gap:10px;margin-bottom:10px"><input class="inp" type="date" id="h-date" value="${today()}"/><select class="inp" id="h-cat">${Object.keys(CATS).map(c=>`<option>${c}</option>`).join("")}</select></div><input class="inp" id="h-desc" placeholder="Descrição (ex: Mercado)" style="margin-bottom:10px"/><div class="grid-2 keep-2" style="gap:10px;margin-bottom:14px"><input class="inp" type="number" id="h-amount" placeholder="Valor (R$)" step="0.01"/><select class="inp" id="h-card"><option value="">💵 Dinheiro</option>${S.cards.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}</select></div><textarea class="inp" id="h-note" placeholder="Observação (opcional)" style="margin-bottom:10px;resize:vertical;min-height:52px;font-size:13px;line-height:1.5"></textarea><button class="btn-p" onclick="saveHomeExp()">+ Registrar Gasto</button></div></div><div><p class="sec">Recentes</p><div class="crd" style="padding:0 20px">${!filtExp.length?`<p style="padding:20px 0;color:${t.muted};font-size:13px">Nenhum gasto ainda.</p>`:recentH}</div></div></div>`;
}

function saveHomeExp(){
  const dEl=document.getElementById("h-desc"),aEl=document.getElementById("h-amount");
  const desc=dEl.value.trim(),amount=parseFloat(aEl.value);
  let ok=true;
  if(!desc){dEl.classList.add("error");setTimeout(()=>dEl.classList.remove("error"),600);ok=false;}
  if(!amount||amount<=0){aEl.classList.add("error");setTimeout(()=>aEl.classList.remove("error"),600);ok=false;}
  if(!ok){toast("Preencha descrição e valor!","err");return;}
  const cv=document.getElementById("h-card").value;
  const note=(document.getElementById("h-note")?.value||"").trim();
  const data={date:document.getElementById("h-date").value,desc,amount,cat:document.getElementById("h-cat").value,cardId:cv||null,note:note||""};
  dEl.value="";aEl.value="";
  const hn=document.getElementById("h-note");if(hn)hn.value="";
  window.fbAdd("expenses",data).then(()=>toast("✅ Gasto registrado!")).catch(e=>toast("Erro: "+e.message,"err"));
}

// ── CARDS TAB ─────────────────────────────────────────────────────────
function renderCards(){
  const t=T();
  let cardsH="";
  if(!S.cards.length){
    cardsH=`<div class="crd" style="padding:40px;text-align:center;grid-column:1/-1"><p style="font-size:40px;margin-bottom:12px">💳</p><p style="font-size:16px;font-weight:600;color:${t.muted}">Nenhum cartão cadastrado</p></div>`;
  } else {
    S.cards.forEach(card=>{
      const unpaidInst=S.installments.filter(i=>i.cardId==card.id).reduce((s,i)=>s+((i.installments-i.paidInstallments)*i.installmentValue),0);
      const expAmt=S.expenses.filter(e=>e.cardId==card.id).reduce((s,e)=>s+e.amount,0);
      const used=expAmt+unpaidInst,usedPct=Math.min((used/(card.limit||1))*100,100);
      const cInst=S.installments.filter(i=>i.cardId==card.id);
      cardsH+=`<div class="crd"><div style="margin-bottom:16px">${cardHTML(card,false)}</div><div class="grid-2 keep-2" style="gap:10px;margin-bottom:14px"><div style="background:${t.cardLight};border-radius:12px;padding:12px;text-align:center"><p style="font-size:10px;color:${t.muted};margin-bottom:4px">Utilizado</p><p style="font-size:17px;font-weight:800;color:${usedPct>80?t.danger:t.text}">${fmt(used)}</p></div><div style="background:${t.cardLight};border-radius:12px;padding:12px;text-align:center"><p style="font-size:10px;color:${t.muted};margin-bottom:4px">Disponível</p><p style="font-size:17px;font-weight:800;color:${t.accent}">${fmt(card.limit-used)}</p></div></div><div class="prog-bg" style="height:6px;margin-bottom:8px"><div class="prog-fill" style="width:${usedPct}%;background:${usedPct>80?t.danger:t.accent}"></div></div><p style="font-size:11px;color:${t.muted};margin-bottom:${cInst.length?14:12}px">${usedPct.toFixed(0)}% do limite · Fecha dia ${card.closing} · Vence dia ${card.due}</p>${cInst.length?`<div style="border-top:1px solid ${t.border};padding-top:12px;margin-bottom:12px"><p style="font-size:10px;color:${t.muted};margin-bottom:8px;letter-spacing:1px">PARCELAMENTOS</p>${cInst.map(i=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid ${t.border}22"><div><p style="font-size:13px;font-weight:600">${i.desc}</p><p style="font-size:10px;color:${t.muted}">${i.paidInstallments}/${i.installments}x</p></div><span style="font-weight:700;color:${t.warn}">${fmt(i.installmentValue)}/mês</span></div>`).join("")}</div>`:""}<div style="display:flex;gap:8px"><button onclick="openEditCard('${card.id}')" style="flex:1;background:${t.blue}15;border:1px solid ${t.blue}33;border-radius:12px;padding:10px;color:${t.blue};font-weight:700;font-size:12px">✏️ Editar</button><button onclick="delCard('${card.id}')" style="flex:1;background:${t.danger}15;border:1px solid ${t.danger}33;border-radius:12px;padding:10px;color:${t.danger};font-weight:700;font-size:12px">🗑 Remover</button></div></div>`;
    });
  }

  let instH="";
  S.installments.forEach(i=>{
    const card=S.cards.find(c=>c.id==i.cardId),prog=(i.paidInstallments/i.installments)*100,done=i.paidInstallments>=i.installments;
    instH+=`<div class="crd" id="inst-${i.id}" style="opacity:${done?.55:1};transition:opacity .3s"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px"><div><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><p style="font-size:15px;font-weight:700">${i.desc}</p>${done?`<span class="badge" style="background:${t.accent}18;color:${t.accent}">QUITADO</span>`:""}</div>${card?cardHTML(card,true):`<span class="badge" style="background:${t.cardLight};color:${t.muted}">💵 Sem cartão</span>`}</div><div style="text-align:right;flex-shrink:0;margin-left:12px"><p style="font-size:22px;font-weight:800;color:${t.warn}">${fmt(i.installmentValue)}</p><p style="font-size:10px;color:${t.muted}">por mês</p></div></div><div style="display:flex;justify-content:space-between;font-size:11px;color:${t.muted};margin-bottom:8px"><span>${i.paidInstallments}/${i.installments} parcelas</span><span>Restante: ${fmt((i.installments-i.paidInstallments)*i.installmentValue)}</span></div><div class="prog-bg" style="height:6px;margin-bottom:14px"><div class="prog-fill" style="width:${prog}%;background:${done?t.accent:t.warn}"></div></div><div style="display:flex;gap:8px">${!done?`<button onclick="payInst('${i.id}','cards')" style="flex:1;background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:10px;color:${t.accent};font-weight:700;font-size:12px">✓ Pagar parcela</button>`:""}<button onclick="openEditInst('${i.id}')" style="background:${t.blue}15;border:1px solid ${t.blue}33;border-radius:10px;padding:10px 14px;color:${t.blue};font-size:12px;font-weight:700">✏️</button><button onclick="delInst('${i.id}')" style="background:${t.danger}15;border:none;border-radius:10px;padding:10px 14px;color:${t.danger};font-size:12px">✕</button></div></div>`;
  });

  document.getElementById("tab-cards").innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px"><p class="sec" style="margin-bottom:0">Meus Cartões (${S.cards.length})</p><button onclick="openAddCard()" style="background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:9px 18px;color:${t.accent};font-weight:700;font-size:13px">+ Novo Cartão</button></div><div class="grid-3" style="margin-bottom:32px">${cardsH}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px"><p class="sec" style="margin-bottom:0">Parcelamentos / Dívidas (${S.installments.length})</p><button onclick="openAddInst()" style="background:${t.warn}18;border:1px solid ${t.warn}44;border-radius:10px;padding:9px 18px;color:${t.warn};font-weight:700;font-size:13px">+ Nova Dívida</button></div><div class="grid-3">${instH||`<div class="crd" style="text-align:center;padding:32px;grid-column:1/-1"><p style="color:${t.muted}">Nenhum parcelamento cadastrado.</p></div>`}</div>`;
}

// ── ALL EXPENSES ──────────────────────────────────────────────────────

// ── COMENTÁRIOS EM GASTOS ─────────────────────────────────────────────
const COMMENT_REACTIONS = ["👍","❤️","😂","😮","😢","🤔"];
let _commentExpId   = null;
let _commentUnsub   = null;
let _comments       = [];

function openComments(expId){
  const e = S.expenses.find(x => x.id === expId);
  if(!e) return;
  _commentExpId = expId;
  const t = T();

  // Cabeçalho do modal
  document.getElementById("comment-exp-title").textContent  = e.desc;
  document.getElementById("comment-exp-amount").textContent = fmt(e.amount);
  document.getElementById("comment-exp-date").textContent   = fmtD(e.date);
  document.getElementById("comment-input").value = "";

  // Estiliza o modal com o tema atual
  const mb = document.querySelector("#modal-comments .modal-box");
  if(mb){ mb.style.background = t.card; mb.style.borderColor = t.border; }

  // Cancela listener anterior se existir
  if(_commentUnsub){ _commentUnsub(); _commentUnsub = null; }

  // Abre o modal e inicia o listener em tempo real
  _clearUnread(expId);
  openModal("modal-comments");
  renderCommentsList([]);

  _commentUnsub = window.fbListenComments(expId, (comments) => {
    _comments = comments.sort((a,b) => (a._createdAt||"").localeCompare(b._createdAt||""));
    renderCommentsList(_comments);
    // Atualiza badge no botão de comentários se visível
    updateCommentBadge(expId, _comments.length);
  });
}

function closeCommentModal(){
  if(_commentUnsub){ _commentUnsub(); _commentUnsub = null; }
  _commentExpId = null;
  closeModal("modal-comments");
}

function renderCommentsList(comments){
  const t  = T();
  const el = document.getElementById("comments-list");
  if(!el) return;
  const myUid = window._currentUser?.uid;

  if(!comments.length){
    el.innerHTML = `<div style="text-align:center;padding:24px 0;color:${t.muted};font-size:13px">
      <p style="font-size:28px;margin-bottom:8px">💬</p>
      <p>Nenhum comentário ainda.<br>Seja o primeiro!</p>
    </div>`;
    return;
  }

  el.innerHTML = comments.map(c => {
    const isMe = c._createdBy === myUid;
    const canDel = isMe;
    const timeStr = c._createdAt
      ? new Date(c._createdAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})+" · "+new Date(c._createdAt).toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})
      : "";

    // Reações agrupadas
    const reactionMap = {};
    (c.reactions||[]).forEach(r => {
      reactionMap[r.emoji] = (reactionMap[r.emoji]||[]);
      reactionMap[r.emoji].push(r.uid);
    });
    const reactionsHtml = Object.entries(reactionMap).map(([emoji, uids]) => {
      const iReacted = uids.includes(myUid);
      return `<button onclick="toggleReaction('${c.id}','${emoji}')"
        style="background:${iReacted?t.accent+"22":t.cardLight};border:1px solid ${iReacted?t.accent+"55":t.border};
               border-radius:99px;padding:2px 8px;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:3px;color:${t.text}">
        ${emoji} <span style="font-size:10px;color:${t.muted}">${uids.length}</span>
      </button>`;
    }).join("");

    return `
      <div style="display:flex;flex-direction:${isMe?"row-reverse":"row"};gap:8px;align-items:flex-start;margin-bottom:14px">
        <div style="width:32px;height:32px;border-radius:50%;background:${isMe?t.accent:t.blue}22;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">
          ${c._createdByEmoji||"👤"}
        </div>
        <div style="max-width:78%;${isMe?"align-items:flex-end;":""}">
          <p style="font-size:10px;color:${t.muted};margin-bottom:3px;text-align:${isMe?"right":"left"}">
            ${c._createdByName||"?"} · ${timeStr}
          </p>
          <div style="background:${isMe?t.accent+"22":t.cardLight};border:1px solid ${isMe?t.accent+"44":t.border};
                      border-radius:${isMe?"14px 4px 14px 14px":"4px 14px 14px 14px"};padding:10px 13px;position:relative">
            <p style="font-size:13px;color:${t.text};line-height:1.5;white-space:pre-wrap">${escapeHtmlComment(c.text||"")}</p>
            ${c.gif?`<img src="${c.gif}" style="max-width:100%;border-radius:8px;margin-top:6px">`:""}
          </div>
          ${reactionsHtml?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;justify-content:${isMe?"flex-end":"flex-start"}">${reactionsHtml}</div>`:""}
          <div style="display:flex;gap:6px;margin-top:5px;justify-content:${isMe?"flex-end":"flex-start"}">
            <!-- Picker de reação -->
            ${COMMENT_REACTIONS.map(em =>
              `<button onclick="toggleReaction('${c.id}','${em}')"
                style="background:none;border:none;font-size:14px;cursor:pointer;opacity:.5;padding:0;transition:opacity .15s"
                onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.5">${em}</button>`
            ).join("")}
            ${canDel?`<button onclick="deleteComment('${c.id}')"
              style="background:none;border:none;font-size:11px;color:${t.danger};cursor:pointer;opacity:.5;padding:0 2px"
              onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.5">remover</button>`:""}
          </div>
        </div>
      </div>`;
  }).join("");

  // Scroll para o final
  setTimeout(()=>{ el.scrollTop = el.scrollHeight; }, 50);
}

function escapeHtmlComment(str){
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function sendComment(){
  const inp  = document.getElementById("comment-input");
  const text = inp.value.trim();
  if(!text || !_commentExpId) return;
  inp.value = "";
  window.fbAddComment(_commentExpId, { text })
    .catch(e => toast("Erro ao comentar: "+e.message, "err"));
}

function deleteComment(commentId){
  if(!_commentExpId) return;
  window.fbDelComment(_commentExpId, commentId)
    .catch(e => toast("Erro: "+e.message,"err"));
}

function toggleReaction(commentId, emoji){
  if(!_commentExpId) return;
  const myUid = window._currentUser?.uid;
  const comment = _comments.find(c => c.id === commentId);
  if(!comment) return;
  const reactions = comment.reactions || [];
  const exists = reactions.find(r => r.uid === myUid && r.emoji === emoji);
  const newReactions = exists
    ? reactions.filter(r => !(r.uid === myUid && r.emoji === emoji))
    : [...reactions, { uid: myUid, emoji }];
  window.fbUpdate("expenses/"+_commentExpId+"/comments", commentId, { reactions: newReactions })
    .catch(e => console.warn("reaction error:", e));
}

function updateCommentBadge(expId, count){
  // Atualiza badge nos botões de comentário visíveis
  document.querySelectorAll(`[data-comment-id="${expId}"]`).forEach(btn => {
    btn.textContent = count > 0 ? `💬 ${count}` : "💬";
  });
}

// Conta comentários de um gasto sem abrir listener (usa cache local)
function getCommentCount(expId){
  return 0; // será atualizado dinamicamente pelo listener
}


function openCommentNotifPanel(){
  const t = T();
  if(_totalUnread === 0){
    toast("Nenhum comentário novo","info");
    return;
  }
  // Monta lista de gastos com não lidos
  const entries = Object.entries(_unreadComments)
    .filter(([,count])=>count>0)
    .map(([expId, count])=>{
      const e = S.expenses.find(x=>x.id===expId);
      if(!e) return "";
      return `<div class="row" style="cursor:pointer;gap:12px" onclick="_clearUnread('${expId}');openComments('${expId}')">
        <div style="width:36px;height:36px;background:${t.blue}18;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${CATS[e.cat]||"💸"}</div>
        <div style="flex:1;min-width:0">
          <p style="font-size:13px;font-weight:600">${e.desc}</p>
          <p style="font-size:11px;color:${t.muted}">${fmt(e.amount)} · ${fmtD(e.date)}</p>
        </div>
        <span style="background:${t.danger};color:#fff;border-radius:99px;font-size:10px;font-weight:800;padding:2px 8px;flex-shrink:0">${count} novo${count>1?"s":""}</span>
      </div>`;
    }).join("");

  confirm2({
    emoji:"💬",
    title:"Comentários novos",
    msg:"",
    okLabel:"Ver tudo",
    okColor:t.blue,
    ok:()=>{ setTab("all"); _clearUnread(); },
  });
  // Injeta a lista no modal confirm
  setTimeout(()=>{
    const msgEl = document.getElementById("confirm-msg");
    if(msgEl) msgEl.innerHTML = `<div style="text-align:left;margin-top:8px">${entries}</div>`;
  },10);
}

function sendQuickReaction(emoji){
  if(!_commentExpId) return;
  window.fbAddComment(_commentExpId, { text: emoji })
    .catch(e => toast("Erro: "+e.message,"err"));
}


// ── BADGE DE COMENTÁRIOS NÃO LIDOS ───────────────────────────────────
let _unreadComments = {}; // { expId: count }
let _totalUnread    = 0;

window._incrementCommentBadge = function(expId){
  _unreadComments[expId] = (_unreadComments[expId]||0) + 1;
  _totalUnread = Object.values(_unreadComments).reduce((a,b)=>a+b,0);
  _renderCommentBadge();
  _updateExpButtonBadge(expId);
  // In-app toast suave
  const e = S.expenses.find(x=>x.id===expId);
  if(e) toast(`💬 Novo comentário em "${e.desc}"`, "info");
};

function _clearUnread(expId){
  if(expId){
    _totalUnread = Math.max(0, _totalUnread - (_unreadComments[expId]||0));
    delete _unreadComments[expId];
  } else {
    _unreadComments = {};
    _totalUnread    = 0;
  }
  _renderCommentBadge();
  if(expId) _updateExpButtonBadge(expId);
}

function _renderCommentBadge(){
  const el = document.getElementById("comment-notif-badge");
  if(!el) return;
  if(_totalUnread > 0){
    el.style.display = "flex";
    el.textContent   = _totalUnread > 9 ? "9+" : String(_totalUnread);
  } else {
    el.style.display = "none";
  }
}

function _updateExpButtonBadge(expId){
  const t = T();
  document.querySelectorAll(`[data-comment-id="${expId}"]`).forEach(btn=>{
    const count = _unreadComments[expId] || 0;
    if(count > 0){
      btn.style.background   = t.blue + "22";
      btn.style.borderColor  = t.blue + "66";
      btn.style.color        = t.blue;
      btn.innerHTML          = `💬 <span style="background:${t.danger};color:#fff;border-radius:99px;padding:0 5px;font-size:9px;font-weight:700">${count}</span>`;
    } else {
      btn.style.background  = t.cardLight;
      btn.style.borderColor = t.border;
      btn.style.color       = t.muted;
      btn.textContent       = "💬";
    }
  });
}

// ── BUSCA DE GASTOS ───────────────────────────────────────────────────
let _expSearch = "";
function setExpSearch(v){ _expSearch=v.trim().toLowerCase(); scheduleRender("expenses"); }

// ── EDITAR GASTO ──────────────────────────────────────────────────────
let _editExpId = null;
function openEditExp(id){
  const e=S.expenses.find(x=>x.id===id);if(!e)return;
  _editExpId=id;
  const t=T();
  document.getElementById("edit-exp-date").value=e.date||"";
  document.getElementById("edit-exp-cat").value=e.cat||"Outros";
  document.getElementById("edit-exp-desc").value=e.desc||"";
  document.getElementById("edit-exp-amount").value=e.amount||"";
  document.getElementById("edit-exp-note").value=e.note||"";
  // popula cartões
  document.getElementById("edit-exp-card").innerHTML=
    `<option value="">💵 Dinheiro</option>${S.cards.map(c=>`<option value="${c.id}"${c.id==e.cardId?" selected":""}>${c.name}</option>`).join("")}`;
  openModal("modal-edit-expense");
}
function saveEditExp(){
  const e=S.expenses.find(x=>x.id===_editExpId);if(!e)return;
  const dEl=document.getElementById("edit-exp-desc"),aEl=document.getElementById("edit-exp-amount");
  const desc=dEl.value.trim(),amount=parseFloat(aEl.value);
  const err=(el,msg)=>{el.classList.add("error");setTimeout(()=>el.classList.remove("error"),600);toast(msg,"err");};
  if(!desc)  {err(dEl,"Informe a descrição!");return;}
  if(!amount||amount<=0){err(aEl,"Valor deve ser maior que zero!");return;}
  const data={
    date:   document.getElementById("edit-exp-date").value   || e.date,
    cat:    document.getElementById("edit-exp-cat").value    || e.cat,
    desc,
    amount,
    cardId: document.getElementById("edit-exp-card").value   || null,
    note:   document.getElementById("edit-exp-note").value.trim() || "",
    recurring: e.recurring||false,
  };
  window.fbUpdate("expenses",_editExpId,data)
    .then(()=>{toast("✅ Gasto atualizado!");closeModal("modal-edit-expense");})
    .catch(err=>toast("Erro: "+err.message,"err"));
}

function renderAllExp(){
  const t=T(),fm=S.filterMonth;
  let filtExp=fm?S.expenses.filter(e=>e.date?.startsWith(fm)):S.expenses;
  // Filtro de busca por texto
  if(_expSearch){
    const q=_expSearch;
    filtExp=filtExp.filter(e=>(e.desc||"").toLowerCase().includes(q)||(e.note||"").toLowerCase().includes(q));
  }
  const total=filtExp.reduce((s,e)=>s+e.amount,0);
  let html=filterBar()+`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <div style="flex:1;min-width:180px;position:relative">
        <input class="inp" type="search" placeholder="🔍 Buscar por descrição ou observação..."
          value="${_expSearch.replace(/"/g,'&quot;')}"
          oninput="setExpSearch(this.value)"
          style="padding-left:14px;font-size:13px"/>
        ${_expSearch?`<button onclick="setExpSearch('');this.previousElementSibling.value=''" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:${t.muted};font-size:16px;cursor:pointer;padding:0">✕</button>`:""}
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <div>
        <p class="sec" style="margin-bottom:2px">Gastos (${filtExp.length}${_expSearch?" encontrados":""})</p>
        ${filtExp.length?`<p style="font-size:13px;font-weight:700;color:${t.danger}">Total: ${fmt(total)}</p>`:""}
      </div>
      <button onclick="openModal('modal-expense');document.getElementById('exp-date').value=today();populateExpCard()" style="background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:9px 18px;color:${t.accent};font-weight:700;font-size:13px">+ Novo Gasto</button>
    </div>`;
  if(!filtExp.length){
    html+=`<div class="crd" style="text-align:center;padding:48px"><p style="font-size:40px;margin-bottom:12px">💸</p><p style="color:${t.muted}">Nenhum gasto registrado.</p></div>`;
  } else {
    html+=`<div class="grid-2">`;
    Object.keys(CATS).forEach(cat=>{
      const items=filtExp.filter(e=>e.cat===cat);if(!items.length)return;
      const catTotal=items.reduce((s,e)=>s+e.amount,0);
      html+=`<div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span style="font-size:14px;font-weight:700">${CATS[cat]} ${cat}</span><span style="font-size:13px;font-weight:700;color:${t.warn}">${fmt(catTotal)}</span></div><div class="crd" style="padding:0 18px">${items.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(e=>{const card=S.cards.find(c=>c.id==e.cardId);const who=window._houseMembers&&e._createdBy&&window._houseMembers[e._createdBy]?`<span class="badge" style="background:${t.warn}18;color:${t.warn}">${(window._houseMembers[e._createdBy]||"").split(" ")[0]}</span>`:"";return`<div class="row" style="flex-direction:column;align-items:stretch;gap:0"><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;min-width:0"><p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.desc}</p><div style="display:flex;gap:6px;margin-top:2px;align-items:center"><span style="font-size:10px;color:${t.muted}">${fmtD(e.date)}</span>${card?`<span class="badge" style="background:${t.blue}18;color:${t.blue}">${card.name}</span>`:""}${who}</div></div><p style="font-weight:700;color:${t.danger};margin-right:8px;white-space:nowrap">${fmt(e.amount)}</p><button data-comment-id="${e.id}" onclick="openComments('${e.id}')" style="background:${t.cardLight};border:1px solid ${t.border};border-radius:8px;padding:6px 10px;color:${t.muted};font-size:11px;flex-shrink:0;margin-right:4px">💬</button><button onclick="openEditExp('${e.id}')" style="background:${t.blue}15;border:none;border-radius:8px;padding:6px 10px;color:${t.blue};font-size:12px;flex-shrink:0;margin-right:4px">✏️</button><button onclick="delExp('${e.id}')" style="background:${t.danger}15;border:none;border-radius:8px;padding:6px 10px;color:${t.danger};font-size:12px;flex-shrink:0">✕</button></div>${e.note?`<p style="font-size:11px;color:${t.muted};margin-top:5px;padding:6px 8px;background:${t.cardLight};border-radius:8px;line-height:1.5;white-space:pre-wrap">📝 ${e.note}</p>`:""}</div>`;}).join("")}</div></div>`;
    });
    html+=`</div>`;
  }
  document.getElementById("tab-all").innerHTML=html;
}

// ── GOALS ─────────────────────────────────────────────────────────────
function renderGoals(){
  const t=T();
  const freeNow=S.salary+S.extra-S.installments.reduce((s,i)=>s+i.installmentValue,0)-S.expenses.reduce((s,e)=>s+e.amount,0);
  let html=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px"><p class="sec" style="margin-bottom:0">Metas de Poupança (${S.goals.length})</p><button onclick="openAddGoal()" style="background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:9px 18px;color:${t.accent};font-weight:700;font-size:13px">+ Nova Meta</button></div>`;
  if(!S.goals.length){
    html+=`<div class="crd" style="text-align:center;padding:60px"><p style="font-size:52px;margin-bottom:14px">🎯</p><p style="font-size:16px;font-weight:700;margin-bottom:8px">Nenhuma meta ainda</p><p style="font-size:13px;color:${t.muted}">Defina objetivos de poupança e acompanhe o progresso do casal.</p></div>`;
  } else {
    html+=`<div class="grid-3">`;
    S.goals.forEach(g=>{
      const pct=Math.min((g.saved/(g.target||1))*100,100),rem=g.target-g.saved,done=g.saved>=g.target;
      const mc=g.monthlyContrib||0;
      // Prazo: usa contribuição auto se existir, senão sobra livre
      let monthsH="";
      if(!done&&rem>0){
        const monthly=mc||freeNow;
        if(monthly>0){const m=Math.ceil(rem/monthly);monthsH=`<p style="font-size:11px;color:${mc?t.accent:t.blue};margin-top:6px">${mc?"🔄":"💡"} ~${m} ${m===1?"mês":"meses"}${mc?" com contribuição automática":" guardando a sobra"}</p>`;}
      }
      let dlH="";if(g.deadline){const diff=Math.max(0,Math.round((new Date(g.deadline+"-01")-new Date())/(1000*60*60*24*30)));dlH=`<span style="font-size:10px;color:${diff<2?t.danger:t.muted};display:block;margin-top:2px">📅 ${fmtMonth(g.deadline)}${diff===0?" — este mês":diff>0?` — ${diff} meses`:""}</span>`;}
      const autoBadge=mc&&!done?`<span style="font-size:10px;background:${t.accent}18;color:${t.accent};padding:2px 8px;border-radius:6px;font-weight:700;margin-left:6px">🔄 ${fmt(mc)}/mês</span>`:"";
      const lastKey=`goal-contrib-${g.id}-${curM()}`;
      const alreadyDone=localStorage.getItem(lastKey);
      const autoInfo=mc&&!done?`<div style="margin-top:10px;padding:10px 12px;border-radius:10px;background:${t.accent}10;border:1px solid ${t.accent}22;display:flex;justify-content:space-between;align-items:center">
        <div><p style="font-size:11px;color:${t.accent};font-weight:700">Contribuição automática</p><p style="font-size:10px;color:${t.muted}">Todo mês: ${fmt(mc)} ${alreadyDone?`· <span style="color:${t.accent}">✓ Depositado este mês</span>`:""}</p></div>
        ${!alreadyDone?`<button onclick="runAutoContrib('${g.id}')" style="background:${t.accent};border:none;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:700;color:#000;cursor:pointer">Depositar agora</button>`:""}
      </div>`:"";
      html+=`<div class="crd" style="${done?`border-color:${t.accent}55`:""}${mc&&!done?`;border-color:${t.accent}33`:""}" ><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px"><div><p style="font-size:38px;margin-bottom:6px">${g.emoji||"🎯"}</p><div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px"><p style="font-size:16px;font-weight:800">${g.name}</p>${autoBadge}</div>${dlH}</div>${done?`<span class="badge" style="background:${t.accent}18;color:${t.accent}">✅ CONCLUÍDA</span>`:""}</div><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px"><span style="color:${t.accent};font-weight:700">${fmt(g.saved)}</span><span style="color:${t.muted}">Meta: ${fmt(g.target)}</span></div><div class="prog-bg" style="height:8px;margin-bottom:8px"><div class="prog-fill" style="width:${pct}%;background:${done?t.accent:`linear-gradient(90deg,${t.blue},${t.accent})`}"></div></div><p style="font-size:13px;font-weight:700">${pct.toFixed(0)}% concluído</p>${monthsH}${autoInfo}<div style="display:flex;gap:8px;margin-top:14px"><button onclick="depositGoal('${g.id}')" style="flex:1;background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:9px;color:${t.accent};font-weight:700;font-size:12px">+ Depositar</button><button onclick="openEditGoal('${g.id}')" style="background:${t.blue}15;border:1px solid ${t.blue}33;border-radius:10px;padding:9px 12px;color:${t.blue};font-size:12px;font-weight:700">✏️</button><button onclick="delGoal('${g.id}')" style="background:${t.danger}15;border:none;border-radius:10px;padding:9px 12px;color:${t.danger};font-size:12px">✕</button></div></div>`;
    });
    html+=`</div>`;
  }
  document.getElementById("tab-goals").innerHTML=html;
}

// ── HEALTH ────────────────────────────────────────────────────────────
let _healthChart=null;
function renderHealth(){
  const t=T(),fm=S.filterMonth;
  const filtExp=fm?S.expenses.filter(e=>e.date?.startsWith(fm)):S.expenses;
  const iT=S.installments.reduce((s,i)=>s+i.installmentValue,0),eT=filtExp.reduce((s,e)=>s+e.amount,0);
  const totalIncome=S.salary+S.extra,tot=eT+iT,rem=totalIncome-tot;
  const pct=Math.min((tot/(totalIncome||1))*100,100);
  const h=pct<50?{e:"😊",l:"Ótimo!",c:t.accent}:pct<75?{e:"😐",l:"Atenção",c:t.warn}:{e:"😰",l:"Crítico",c:t.danger};

  // Categorias
  let catBars="";
  Object.keys(CATS).forEach(cat=>{
    const cT=filtExp.filter(e=>e.cat===cat).reduce((s,e)=>s+e.amount,0);
    if(!cT)return;
    const cPct=(cT/(tot||1))*100;
    catBars+=`<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <span style="font-size:13px">${CATS[cat]} ${cat}</span>
        <span style="font-size:12px;font-weight:700">${fmt(cT)} <span style="color:${t.muted};font-weight:400">(${cPct.toFixed(0)}%)</span></span>
      </div>
      <div class="prog-bg" style="height:7px;border-radius:99px">
        <div class="prog-fill" style="width:${cPct}%;background:linear-gradient(90deg,${t.blue},${t.accent});border-radius:99px"></div>
      </div>
    </div>`;
  });

  // Dados para o Chart.js
  const mTotals={};
  S.expenses.forEach(e=>{const m=e.date?.slice(0,7);if(m)mTotals[m]=(mTotals[m]||0)+e.amount;});
  const sortedM=Object.entries(mTotals).sort((a,b)=>a[0].localeCompare(b[0])).slice(-6);

  const chartSection=sortedM.length>0?`
    <p class="sec">Gastos por Mês</p>
    <div class="crd" style="padding:20px;margin-bottom:20px">
      <canvas id="health-chart" style="width:100%;max-height:200px"></canvas>
      ${fm?`<div style="text-align:center;margin-top:14px"><button onclick="setFilter('')" style="background:${t.cardLight};border:1px solid ${t.border};border-radius:8px;padding:5px 14px;color:${t.muted};font-size:12px">✕ Limpar filtro</button></div>`:""}
    </div>`:"";

  document.getElementById("tab-health").innerHTML=`
    <div class="grid-2" style="align-items:start">
      <div>
        ${[
          {l:"Salário",        v:fmt(S.salary),          c:t.accent},
          {l:"Extra (Caixa)",   v:fmt(S.extra),           c:t.blue},
          {l:"Total em Conta",  v:fmt(S.salary+S.extra),  c:t.accent},
          {l:"Gastos Avulsos",  v:fmt(eT),                c:t.blue},
          {l:"Parcelas/mês",    v:fmt(iT),                c:t.warn},
          {l:"Total Comprometido",v:fmt(tot),             c:t.danger},
          {l:"Dinheiro Livre",  v:fmt(rem),               c:rem>=0?t.accent:t.danger},
        ].map(s=>`<div class="crd" style="padding:16px 20px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
          <p style="font-size:13px;color:${t.muted}">${s.l}</p>
          <p style="font-size:20px;font-weight:800;color:${s.c}">${s.v}</p>
        </div>`).join("")}
      </div>
      <div>
        ${chartSection}
        <p class="sec">Gastos por Categoria</p>
        <div class="crd" style="padding:20px;margin-bottom:20px">
          ${catBars||`<p style="color:${t.muted};font-size:13px">Nenhum gasto registrado.</p>`}
        </div>
        ${S.installments.length?`
          <p class="sec">Resumo das Dívidas</p>
          ${S.installments.map(i=>{
            const prog=(i.paidInstallments/i.installments)*100;
            return`<div class="crd" style="padding:16px 20px;margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <p style="font-size:13px;font-weight:600">${i.desc}</p>
                <p style="font-size:13px;font-weight:700;color:${t.danger}">${fmt((i.installments-i.paidInstallments)*i.installmentValue)} restante</p>
              </div>
              <div class="prog-bg" style="height:5px">
                <div class="prog-fill" style="width:${prog}%;background:${t.accent}"></div>
              </div>
              <p style="font-size:10px;color:${t.muted};margin-top:5px">${i.paidInstallments} de ${i.installments} parcelas pagas</p>
            </div>`;
          }).join("")}`:""}
        ${window._houseMembers&&Object.keys(window._houseMembers).length>1?`
          <p class="sec">Membros da Casa 👫</p>
          <div class="crd" style="padding:16px 20px">
            ${Object.entries(window._houseMembers).map(([uid,name])=>`
              <div class="row">
                <div style="width:36px;height:36px;border-radius:50%;background:${t.accent};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#000;flex-shrink:0">${(name||"?")[0].toUpperCase()}</div>
                <p style="font-size:14px;font-weight:600">${name}</p>
              </div>`).join("")}
          </div>`:""}
      </div>
    </div>`;

  // ── Renderiza Chart.js ─────────────────────────────────────────────
  if(sortedM.length>0) _buildHealthChart(sortedM, t, fm);
}

function _buildHealthChart(sortedM, t, fm){
  // Destrói instância anterior se existir
  if(_healthChart){try{_healthChart.destroy();}catch(e){}_healthChart=null;}

  const canvas=document.getElementById("health-chart");
  if(!canvas)return;

  const labels=sortedM.map(([m])=>{
    const [y,mo]=m.split("-");
    return new Date(+y,+mo-1).toLocaleDateString("pt-BR",{month:"short",year:"2-digit"});
  });
  const values=sortedM.map(([,v])=>v);
  const activeIdx=fm?sortedM.findIndex(([m])=>m===fm):-1;

  const barColors=sortedM.map(([m],i)=>{
    if(m===fm)return t.accent;
    return t.blue+"bb";
  });
  const barHover=sortedM.map(([m])=>m===fm?t.accent:t.blue);

  const load=()=>{
    const ctx=canvas.getContext("2d");
    _healthChart=new Chart(ctx,{
      type:"bar",
      data:{
        labels,
        datasets:[{
          data:values,
          backgroundColor:barColors,
          hoverBackgroundColor:barHover,
          borderRadius:8,
          borderSkipped:false,
          borderWidth:0,
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:true,
        aspectRatio:2.4,
        onClick:(e,els)=>{
          if(els.length){const idx=els[0].index;setFilter(sortedM[idx][0]);}
        },
        plugins:{
          legend:{display:false},
          tooltip:{
            backgroundColor:t.card,
            borderColor:t.border,
            borderWidth:1,
            titleColor:t.muted,
            bodyColor:t.text,
            titleFont:{size:11,weight:"600"},
            bodyFont:{size:14,weight:"800"},
            padding:12,
            cornerRadius:12,
            displayColors:false,
            callbacks:{
              title:items=>{
                const [m]=sortedM[items[0].dataIndex];
                const [y,mo]=m.split("-");
                return new Date(+y,+mo-1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
              },
              label:item=>fmt(item.raw),
              afterLabel:item=>{
                const income=S.salary+S.extra;
                if(!income)return"";
                return(item.raw/income*100).toFixed(1)+"% da renda";
              }
            }
          }
        },
        scales:{
          x:{
            grid:{display:false},
            border:{display:false},
            ticks:{color:t.muted,font:{size:11,weight:"600"}},
          },
          y:{
            grid:{color:t.border+"44",drawBorder:false},
            border:{display:false,dash:[4,4]},
            ticks:{
              color:t.muted,
              font:{size:10},
              callback:v=>v>=1000?(v/1000).toFixed(0)+"k":""+v,
              maxTicksLimit:5,
            },
          }
        },
        animation:{duration:600,easing:"easeOutQuart"},
      }
    });
  };

  // Carrega Chart.js se ainda não estiver disponível
  if(window.Chart){
    load();
  } else {
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    s.onload=load;
    document.head.appendChild(s);
  }
}

// ── ACTIONS ───────────────────────────────────────────────────────────
function payInst(id,ctx){
  const i=S.installments.find(x=>x.id===id);if(!i)return;
  const newPaid=Math.min(i.paidInstallments+1,i.installments);
  const done=newPaid>=i.installments;
  window.fbUpdate("installments",id,{paidInstallments:newPaid}).then(()=>{
    if(done)toast(`🎉 ${i.desc} quitado!`);else toast(`✅ Parcela ${newPaid}/${i.installments} paga!`);
    if(done){
      const el=document.getElementById(ctx==="h"?`inst-h-${id}`:`inst-${id}`);
      if(el){el.classList.add("dust-out");setTimeout(()=>scheduleRender("installments"),560);}
    }
  }).catch(e=>toast("Erro: "+e.message,"err"));
}
function delInst(id){const i=S.installments.find(x=>x.id===id);confirm2({emoji:"🗑",title:"Remover parcelamento?",msg:`"${i?.desc}" será removido.`,okLabel:"Remover",ok:()=>{window.fbDel("installments",id).then(()=>toast("Parcelamento removido","info")).catch(e=>toast("Erro: "+e.message,"err"));}});}
function delExp(id){const e=S.expenses.find(x=>x.id===id);confirm2({emoji:"🗑",title:"Remover gasto?",msg:`"${e?.desc}" (${fmt(e?.amount)}) será removido.`,okLabel:"Remover",ok:()=>{window.fbDel("expenses",id).then(()=>toast("Gasto removido","info")).catch(e=>toast("Erro: "+e.message,"err"));}});}
function delCard(id){const c=S.cards.find(x=>x.id===id);confirm2({emoji:"💳",title:"Remover cartão?",msg:`"${c?.name}" será removido.`,okLabel:"Remover",ok:()=>{window.fbDel("cards",id).then(()=>toast("Cartão removido","info")).catch(e=>toast("Erro: "+e.message,"err"));}});}
function delGoal(id){const g=S.goals.find(x=>x.id===id);confirm2({emoji:"🎯",title:"Remover meta?",msg:`"${g?.name}" será removida.`,okLabel:"Remover",ok:()=>{window.fbDel("goals",id).then(()=>toast("Meta removida","info")).catch(e=>toast("Erro: "+e.message,"err"));}});}

// ── MODALS HELPERS ────────────────────────────────────────────────────
function openModal(id){document.getElementById(id).style.display="flex";}
function closeModal(id){document.getElementById(id).style.display="none";}

function openThemes(){
  const t=T();
  document.getElementById("theme-list").innerHTML=Object.entries(THEMES).map(([key,th])=>{
    const a=key===S.theme;
    return`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <button onclick="setTheme('${key}')" style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;flex:1;border:1px solid ${a?t.accent:t.border};background:${a?t.accent+"18":t.cardLight};cursor:pointer;text-align:left">
        <div style="display:flex;gap:4px;flex-shrink:0">
          <div style="width:22px;height:22px;border-radius:50%;background:${th.bg};border:2px solid ${th.border}"></div>
          <div style="width:22px;height:22px;border-radius:50%;background:${th.card};border:2px solid ${th.border}"></div>
          <div style="width:22px;height:22px;border-radius:50%;background:${th.accent}"></div>
        </div>
        <span style="font-size:22px">${th.icon}</span>
        <span style="font-size:14px;font-weight:700;color:${a?t.accent:t.text};flex:1">${th.name}</span>
        ${a?`<span style="font-size:12px;color:${t.accent};font-weight:700">✓ Ativo</span>`:""}
      </button>
      <button onclick="openThemeEditor('${key}')" style="background:${t.cardLight};border:1px solid ${t.border};border-radius:12px;padding:10px 13px;color:${t.muted};font-size:13px;cursor:pointer;flex-shrink:0" title="Editar cores">✏️</button>
    </div>`;
  }).join("");
  openModal("modal-themes");
}
function setTheme(key){S.theme=key;window.fbSaveTheme(key);closeModal("modal-themes");scheduleRender("house");}

// ── EDITOR DE TEMA ────────────────────────────────────────────────────
// Armazena os temas originais para poder restaurar
const THEMES_DEFAULT = JSON.parse(JSON.stringify(THEMES));

// Carrega customizações salvas no localStorage ao iniciar
(function loadSavedThemes(){
  try{
    const saved=JSON.parse(localStorage.getItem("customThemes")||"{}");
    Object.entries(saved).forEach(([key,overrides])=>{
      if(THEMES[key]) Object.assign(THEMES[key],overrides);
    });
  }catch(e){}
})();

const THEME_FIELD_LABELS={
  bg:       {label:"Fundo",         group:"Estrutura"},
  sidebar:  {label:"Sidebar",       group:"Estrutura"},
  card:     {label:"Card",          group:"Estrutura"},
  cardLight:{label:"Card claro",    group:"Estrutura"},
  border:   {label:"Borda",         group:"Estrutura"},
  navBg:    {label:"Nav fundo",     group:"Estrutura"},
  text:     {label:"Texto",         group:"Tipografia"},
  muted:    {label:"Texto apagado", group:"Tipografia"},
  accent:   {label:"Destaque",      group:"Cores"},
  blue:     {label:"Azul",          group:"Cores"},
  warn:     {label:"Aviso",         group:"Cores"},
  danger:   {label:"Perigo",        group:"Cores"},
};

let _editingThemeKey=null;
let _editorValues={};

function openThemeEditor(key){
  _editingThemeKey=key;
  const th=THEMES[key];
  _editorValues={...th};
  const t=T();

  document.getElementById("theme-editor-subtitle").textContent=
    `Editando: ${th.icon} ${th.name}`;

  // Renderiza os campos agrupados
  const groups=["Estrutura","Tipografia","Cores"];
  const fields=document.getElementById("theme-editor-fields");
  fields.innerHTML="";

  // Título de grupo
  let lastGroup="";
  Object.entries(THEME_FIELD_LABELS).forEach(([prop,meta])=>{
    if(!th[prop])return;
    if(meta.group!==lastGroup){
      lastGroup=meta.group;
      const sep=document.createElement("div");
      sep.style.cssText=`grid-column:1/-1;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:${t.muted};margin-top:6px;`;
      sep.textContent=meta.group;
      fields.appendChild(sep);
    }
    const wrap=document.createElement("label");
    wrap.style.cssText=`display:flex;flex-direction:column;gap:5px;`;
    wrap.innerHTML=`
      <span style="font-size:12px;color:${t.muted};font-weight:600">${meta.label}</span>
      <div style="display:flex;align-items:center;gap:8px">
        <input type="color" value="${th[prop]}" data-prop="${prop}"
          style="width:36px;height:36px;border-radius:8px;border:1px solid ${t.border};cursor:pointer;padding:2px;background:${t.cardLight}"
          oninput="onThemeEditorChange(this)"/>
        <input type="text" value="${th[prop]}" data-prop="${prop}" data-text="1"
          class="inp" style="flex:1;padding:7px 10px;font-size:12px;font-family:monospace"
          oninput="onThemeEditorChangeText(this)"/>
      </div>`;
    fields.appendChild(wrap);
  });

  updateThemeEditorPreview();
  closeModal("modal-themes");
  openModal("modal-theme-editor");
}

function onThemeEditorChange(el){
  const prop=el.dataset.prop;
  _editorValues[prop]=el.value;
  // Sincroniza o input de texto
  const twin=el.parentNode.querySelector('[data-text]');
  if(twin)twin.value=el.value;
  updateThemeEditorPreview();
}

function onThemeEditorChangeText(el){
  const val=el.value.trim();
  // Valida: deve ser hex válido
  if(!/^#[0-9a-fA-F]{3,8}$/.test(val))return;
  _editorValues[el.dataset.prop]=val;
  // Sincroniza o color picker
  const twin=el.parentNode.querySelector('[type=color]');
  if(twin)twin.value=val;
  updateThemeEditorPreview();
}

function updateThemeEditorPreview(){
  const th=_editorValues;
  const preview=document.getElementById("theme-editor-preview");
  preview.style.cssText=`border-radius:14px;padding:14px;margin-bottom:18px;border:1px solid ${th.border};background:${th.card}`;
  preview.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <p style="font-size:13px;font-weight:700;color:${th.text}">${THEMES[_editingThemeKey].icon} ${THEMES[_editingThemeKey].name}</p>
      <span style="font-size:11px;background:${th.accent}22;color:${th.accent};padding:2px 8px;border-radius:6px;font-weight:700">Preview</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div style="background:${th.cardLight};border:1px solid ${th.border};border-radius:10px;padding:10px">
        <p style="font-size:10px;color:${th.muted};margin-bottom:4px">Disponível</p>
        <p style="font-size:16px;font-weight:800;color:${th.accent}">R$ 5.312,65</p>
      </div>
      <div style="background:${th.cardLight};border:1px solid ${th.border};border-radius:10px;padding:10px">
        <p style="font-size:10px;color:${th.muted};margin-bottom:4px">Comprometido</p>
        <p style="font-size:16px;font-weight:800;color:${th.danger}">R$ 37,35</p>
      </div>
    </div>
    <div style="height:6px;background:${th.cardLight};border-radius:99px;overflow:hidden">
      <div style="height:6px;width:15%;background:${th.accent};border-radius:99px"></div>
    </div>
    <p style="font-size:10px;color:${th.muted};margin-top:5px">0.7% comprometido · Ótimo!</p>`;
}

function saveThemeEditor(){
  if(!_editingThemeKey)return;
  // Aplica ao objeto THEMES em memória
  Object.assign(THEMES[_editingThemeKey],_editorValues);
  // Persiste no localStorage
  try{
    const saved=JSON.parse(localStorage.getItem("customThemes")||"{}");
    saved[_editingThemeKey]={..._editorValues};
    localStorage.setItem("customThemes",JSON.stringify(saved));
  }catch(e){}
  // Se o tema editado é o ativo, re-aplica imediatamente
  if(S.theme===_editingThemeKey) scheduleRender("house");
  toast("✅ Tema salvo!");
  closeModal("modal-theme-editor");
  openThemes();
}

function resetThemeEditor(){
  if(!_editingThemeKey)return;
  confirm2({
    emoji:"↩️",
    title:"Restaurar padrão?",
    msg:`As cores de "${THEMES[_editingThemeKey].name}" voltarão ao original.`,
    okLabel:"Restaurar",
    okColor:T().warn,
    ok:()=>{
      // Remove do localStorage
      try{
        const saved=JSON.parse(localStorage.getItem("customThemes")||"{}");
        delete saved[_editingThemeKey];
        localStorage.setItem("customThemes",JSON.stringify(saved));
      }catch(e){}
      // Restaura em memória
      Object.assign(THEMES[_editingThemeKey],THEMES_DEFAULT[_editingThemeKey]);
      _editorValues={...THEMES[_editingThemeKey]};
      if(S.theme===_editingThemeKey) scheduleRender("house");
      toast("Tema restaurado!");
      // Re-abre o editor com os valores originais
      openThemeEditor(_editingThemeKey);
    }
  });
}

function openSalaryModal(){document.getElementById("salary-input").value=S.salary||"";document.getElementById("extra-input").value=S.extra||"";updateIncomePreview();openModal("modal-salary");}
function updateIncomePreview(){const s=parseFloat(document.getElementById("salary-input").value)||0,e=parseFloat(document.getElementById("extra-input").value)||0;document.getElementById("total-income-preview").textContent="Total em conta: "+fmt(s+e);}
function saveSalary(){
  const v=parseFloat(document.getElementById("salary-input").value);
  const x=parseFloat(document.getElementById("extra-input").value);
  const data={};
  if(!isNaN(v))data.salary=v;
  data.extra=isNaN(x)?0:x;
  window.fbSaveHouse(data).then(()=>toast("✅ Renda atualizada!")).catch(e=>toast("Erro: "+e.message,"err"));
  closeModal("modal-salary");
}

// ── CARD FORMS ────────────────────────────────────────────────────────
let editCardId=null,editInstId=null,editInstCard=null;
function openAddCard(){S.selectedBrand="Visa";renderBrandChips();renderCardPreview();["card-name","card-limit","card-closing","card-due"].forEach(id=>document.getElementById(id).value="");openModal("modal-card");}
function renderBrandChips(){document.getElementById("brand-chips").innerHTML=Object.keys(BRANDS).map(b=>`<button class="chip ${b===S.selectedBrand?"active":""}" onclick="selectBrand('${b}')">${b}</button>`).join("");}
function selectBrand(b){S.selectedBrand=b;renderBrandChips();renderCardPreview();}
function renderCardPreview(){document.getElementById("card-preview").innerHTML=cardHTML({name:document.getElementById("card-name")?.value||"Prévia",brand:S.selectedBrand},false);}
function saveCard(){
  const el=document.getElementById("card-name"),name=el.value.trim();
  if(!name){el.classList.add("error");setTimeout(()=>el.classList.remove("error"),600);toast("Informe o nome do cartão!","err");return;}
  const data={name,brand:S.selectedBrand,limit:parseFloat(document.getElementById("card-limit").value)||0,closing:parseInt(document.getElementById("card-closing").value)||1,due:parseInt(document.getElementById("card-due").value)||10};
  window.fbAdd("cards",data).then(()=>{toast("💳 Cartão adicionado!");closeModal("modal-card");}).catch(e=>toast("Erro: "+e.message,"err"));
}
function openEditCard(id){const c=S.cards.find(x=>x.id===id);if(!c)return;editCardId=id;S.selectedEditBrand=c.brand;document.getElementById("edit-card-name").value=c.name;document.getElementById("edit-card-limit").value=c.limit;document.getElementById("edit-card-closing").value=c.closing;document.getElementById("edit-card-due").value=c.due;renderEditBrandChips();renderEditCardPreview();openModal("modal-edit-card");}
function renderEditBrandChips(){document.getElementById("edit-brand-chips").innerHTML=Object.keys(BRANDS).map(b=>`<button class="chip ${b===S.selectedEditBrand?"active":""}" onclick="selectEditBrand('${b}')">${b}</button>`).join("");}
function selectEditBrand(b){S.selectedEditBrand=b;renderEditBrandChips();renderEditCardPreview();}
function renderEditCardPreview(){document.getElementById("edit-card-preview").innerHTML=cardHTML({name:document.getElementById("edit-card-name")?.value||"Prévia",brand:S.selectedEditBrand},false);}
function saveEditCard(){
  const c=S.cards.find(x=>x.id===editCardId);if(!c)return;
  const data={name:document.getElementById("edit-card-name").value.trim()||c.name,brand:S.selectedEditBrand,limit:parseFloat(document.getElementById("edit-card-limit").value)||c.limit,closing:parseInt(document.getElementById("edit-card-closing").value)||c.closing,due:parseInt(document.getElementById("edit-card-due").value)||c.due};
  window.fbUpdate("cards",editCardId,data).then(()=>{toast("✅ Cartão atualizado!");closeModal("modal-edit-card");}).catch(e=>toast("Erro: "+e.message,"err"));
}

// ── INSTALLMENT FORMS ─────────────────────────────────────────────────
function openAddInst(){S.selectedInstCard=null;renderInstChips();["inst-desc","inst-total","inst-n","inst-due"].forEach(id=>document.getElementById(id).value="");document.getElementById("inst-month").value=curM();document.getElementById("inst-preview").style.display="none";openModal("modal-inst");}
function renderInstChips(){let h=`<button class="chip ${!S.selectedInstCard?"active":""}" onclick="selInstCard(null)">💵 Sem cartão</button>`;S.cards.forEach(c=>{const a=S.selectedInstCard===c.id;h+=`<button class="chip ${a?"active":""}" onclick="selInstCard('${c.id}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px"><span>${c.name}</span><span style="font-size:10px;opacity:.65">${fmt(c.limit)} limite</span></button>`;});document.getElementById("inst-card-chips").innerHTML=h;}
function selInstCard(id){S.selectedInstCard=id;renderInstChips();}
function updateInstPreview(){const total=parseFloat(document.getElementById("inst-total").value),n=parseInt(document.getElementById("inst-n").value),p=document.getElementById("inst-preview"),t=T();if(total&&n&&n>0){p.style.display="block";p.style.background=t.accent+"18";p.style.border=`1px solid ${t.accent}44`;document.getElementById("inst-preview-val").textContent=fmt(total/n);document.getElementById("inst-preview-val").style.color=t.accent;}else p.style.display="none";}
function saveInst(){
  const dEl=document.getElementById("inst-desc"),tEl=document.getElementById("inst-total"),nEl=document.getElementById("inst-n");
  const desc=dEl.value.trim(),total=parseFloat(tEl.value),n=parseInt(nEl.value);
  const err=(el,msg)=>{el.classList.add("error");setTimeout(()=>el.classList.remove("error"),600);toast(msg,"err");};
  if(!desc)           {err(dEl,"Informe o nome da dívida!");return;}
  if(!total||total<=0){err(tEl,"O valor total deve ser maior que zero!");return;}
  if(!n||n<1||isNaN(n)){err(nEl,"Número de parcelas deve ser pelo menos 1!");return;}
  if(n>600)           {err(nEl,"Número de parcelas muito alto (máx. 600)!");return;}
  const installmentValue=parseFloat((total/n).toFixed(2));
  if(!isFinite(installmentValue)||installmentValue<=0){toast("Valor da parcela inválido. Verifique os campos.","err");return;}
  const dueDay=parseInt(document.getElementById("inst-due").value)||0;
  const data={desc,cardId:S.selectedInstCard||null,totalAmount:total,installments:n,paidInstallments:0,installmentValue,startMonth:document.getElementById("inst-month").value,dueDay};
  window.fbAdd("installments",data).then(()=>{toast("✅ Parcelamento adicionado!");closeModal("modal-inst");}).catch(e=>toast("Erro: "+e.message,"err"));
}
function openEditInst(id){const i=S.installments.find(x=>x.id===id);if(!i)return;editInstId=id;editInstCard=i.cardId;document.getElementById("edit-inst-desc").value=i.desc;document.getElementById("edit-inst-total").value=i.totalAmount;document.getElementById("edit-inst-n").value=i.installments;document.getElementById("edit-inst-paid").value=i.paidInstallments;document.getElementById("edit-inst-month").value=i.startMonth||curM();document.getElementById("edit-inst-due").value=i.dueDay||"";renderEditInstChips();openModal("modal-edit-inst");}
function renderEditInstChips(){let h=`<button class="chip ${!editInstCard?"active":""}" onclick="selEditInstCard(null)">💵 Sem cartão</button>`;S.cards.forEach(c=>{const a=editInstCard==c.id;h+=`<button class="chip ${a?"active":""}" onclick="selEditInstCard('${c.id}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px"><span>${c.name}</span><span style="font-size:10px;opacity:.65">${fmt(c.limit)} limite</span></button>`;});document.getElementById("edit-inst-card-chips").innerHTML=h;}
function selEditInstCard(id){editInstCard=id;renderEditInstChips();}
function saveEditInst(){
  const i=S.installments.find(x=>x.id===editInstId);if(!i)return;
  const tEl=document.getElementById("edit-inst-total"),nEl=document.getElementById("edit-inst-n"),pEl=document.getElementById("edit-inst-paid");
  const total=parseFloat(tEl.value),n=parseInt(nEl.value),paid=parseInt(pEl.value);
  const err=(el,msg)=>{el.classList.add("error");setTimeout(()=>el.classList.remove("error"),600);toast(msg,"err");};
  if(!isNaN(total)&&total<=0){err(tEl,"O valor total deve ser maior que zero!");return;}
  if(!isNaN(n)&&(n<1||n>600)){err(nEl,n<1?"Número de parcelas deve ser pelo menos 1!":"Número de parcelas muito alto (máx. 600)!");return;}
  const data={desc:document.getElementById("edit-inst-desc").value.trim()||i.desc,cardId:editInstCard||null};
  if(!isNaN(total)&&total>0)data.totalAmount=total;
  if(!isNaN(n)&&n>=1){
    data.installments=n;
    const iv=parseFloat(((data.totalAmount||i.totalAmount)/n).toFixed(2));
    if(!isFinite(iv)||iv<=0){toast("Valor da parcela inválido.","err");return;}
    data.installmentValue=iv;
  }
  if(!isNaN(paid)&&paid>=0)data.paidInstallments=Math.min(paid,data.installments||i.installments);
  data.startMonth=document.getElementById("edit-inst-month").value||i.startMonth;
  data.dueDay=parseInt(document.getElementById("edit-inst-due").value)||0;
  window.fbUpdate("installments",editInstId,data).then(()=>{toast("✅ Parcelamento atualizado!");closeModal("modal-edit-inst");}).catch(e=>toast("Erro: "+e.message,"err"));
}

// ── EXPENSE FORM ──────────────────────────────────────────────────────
function populateExpCard(){document.getElementById("exp-card").innerHTML=`<option value="">💵 Dinheiro</option>${S.cards.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}`;}
function saveExpense(){
  const dEl=document.getElementById("exp-desc"),aEl=document.getElementById("exp-amount");
  const desc=dEl.value.trim(),amount=parseFloat(aEl.value);
  let ok=true;
  if(!desc){dEl.classList.add("error");setTimeout(()=>dEl.classList.remove("error"),600);ok=false;}
  if(!amount||amount<=0){aEl.classList.add("error");setTimeout(()=>aEl.classList.remove("error"),600);ok=false;}
  if(!ok){toast("Preencha descrição e valor!","err");return;}
  const cv=document.getElementById("exp-card").value;
  const note=document.getElementById("exp-note").value.trim();
  const recurring=document.getElementById("exp-recurring")?.checked||false;
  const data={date:document.getElementById("exp-date").value,desc,amount,cat:document.getElementById("exp-cat").value,cardId:cv||null,note:note||"",recurring};
  window.fbAdd("expenses",data).then(()=>{
    toast(recurring?"🔁 Gasto recorrente salvo!":"✅ Gasto registrado!");
    closeModal("modal-expense");
    document.getElementById("exp-note").value="";
    const rc=document.getElementById("exp-recurring");if(rc)rc.checked=false;
  }).catch(e=>toast("Erro: "+e.message,"err"));
}

// ── GOALS FORMS ───────────────────────────────────────────────────────
let editGoalId=null;
function openAddGoal(){editGoalId=null;S.selectedGoalEmoji="🎯";["goal-name","goal-target","goal-saved","goal-deadline","goal-monthly"].forEach(id=>document.getElementById(id).value="");document.getElementById("goal-modal-title").textContent="🎯 Nova Meta";document.getElementById("goal-save-btn").textContent="Adicionar Meta";renderGoalChips();updateGoalPreview();openModal("modal-goal");}
function openEditGoal(id){const g=S.goals.find(x=>x.id===id);if(!g)return;editGoalId=id;S.selectedGoalEmoji=g.emoji||"🎯";document.getElementById("goal-name").value=g.name;document.getElementById("goal-target").value=g.target;document.getElementById("goal-saved").value=g.saved;document.getElementById("goal-deadline").value=g.deadline||"";document.getElementById("goal-monthly").value=g.monthlyContrib||"";document.getElementById("goal-modal-title").textContent="✏️ Editar Meta";document.getElementById("goal-save-btn").textContent="Salvar";renderGoalChips();updateGoalPreview();openModal("modal-goal");}
function renderGoalChips(){document.getElementById("goal-emoji-chips").innerHTML=GOAL_EMOJIS.map(e=>`<button class="chip ${e===S.selectedGoalEmoji?"active":""}" onclick="S.selectedGoalEmoji='${e}';renderGoalChips()" style="font-size:18px;padding:6px 10px">${e}</button>`).join("");}
function updateGoalPreview(){
  const t=T();
  const target=parseFloat(document.getElementById("goal-target")?.value)||0;
  const saved=parseFloat(document.getElementById("goal-saved")?.value)||0;
  const mc=parseFloat(document.getElementById("goal-monthly")?.value)||0;
  const p=document.getElementById("goal-preview");if(!p)return;
  if(target>0){
    const rem=Math.max(0,target-saved);
    const pct=Math.min((saved/target)*100,100);
    let hint="";
    if(mc>0&&rem>0){const months=Math.ceil(rem/mc);hint=`<p style="font-size:11px;color:${t.accent};margin-top:6px">🔄 Meta atingida em ~${months} ${months===1?"mês":"meses"} com ${fmt(mc)}/mês</p>`;}
    p.style.display="block";p.style.background=t.accent+"18";p.style.border=`1px solid ${t.accent}44`;
    p.innerHTML=`<p style="font-size:13px;color:${t.muted};margin-bottom:4px">Progresso atual</p><p style="font-size:22px;font-weight:800;color:${t.accent}">${pct.toFixed(0)}%</p><p style="font-size:11px;color:${t.muted};margin-top:4px">Faltam ${fmt(rem)}</p>${hint}`;
  }else p.style.display="none";
}
function saveGoal(){
  const nEl=document.getElementById("goal-name"),tEl=document.getElementById("goal-target");
  const name=nEl.value.trim(),target=parseFloat(tEl.value);
  if(!name){nEl.classList.add("error");setTimeout(()=>nEl.classList.remove("error"),600);toast("Informe o nome!","err");return;}
  if(!target||target<=0){tEl.classList.add("error");setTimeout(()=>tEl.classList.remove("error"),600);toast("Informe o valor alvo!","err");return;}
  const saved=parseFloat(document.getElementById("goal-saved").value)||0,deadline=document.getElementById("goal-deadline").value||"";
  const monthlyContrib=parseFloat(document.getElementById("goal-monthly").value)||0;
  const data={name,target,saved,deadline,emoji:S.selectedGoalEmoji,monthlyContrib};
  if(editGoalId){
    window.fbUpdate("goals",editGoalId,data).then(()=>{toast("✅ Meta atualizada!");closeModal("modal-goal");}).catch(e=>toast("Erro: "+e.message,"err"));
  } else {
    window.fbAdd("goals",data).then(()=>{toast("🎯 Meta criada!");closeModal("modal-goal");}).catch(e=>toast("Erro: "+e.message,"err"));
  }
}
let _depositGoalId=null;
function depositGoal(id){
  const g=S.goals.find(x=>x.id===id);if(!g)return;
  _depositGoalId=id;
  const t=T();
  const pct=Math.min((g.saved/(g.target||1))*100,100);
  const rem=Math.max(0,g.target-g.saved);
  document.getElementById("deposit-emoji").textContent=g.emoji||"🎯";
  document.getElementById("deposit-goal-name").textContent=g.name;
  document.getElementById("deposit-saved").textContent=fmt(g.saved);
  document.getElementById("deposit-target").textContent=fmt(g.target);
  document.getElementById("deposit-rem").textContent=fmt(rem);
  const bar=document.getElementById("deposit-bar");
  bar.style.width=pct+"%";
  bar.style.background=`linear-gradient(90deg,${t.blue},${t.accent})`;
  document.getElementById("deposit-bar-bg").style.background=t.cardLight;
  document.getElementById("deposit-amount").value="";
  document.getElementById("deposit-amount").style.borderColor=t.border;
  const sugs=[50,100,200,500].filter(v=>v<rem);
  if(rem>0)sugs.push(Math.round(rem));
  const chips=document.getElementById("deposit-chips");
  chips.innerHTML=sugs.slice(0,4).map(v=>`<button class="chip" onclick="document.getElementById('deposit-amount').value=${v};this.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));this.classList.add('active')" style="font-size:12px">${fmt(v)}</button>`).join("");
  openModal("modal-deposit");
  setTimeout(()=>document.getElementById("deposit-amount").focus(),120);
}
function confirmDeposit(){
  const g=S.goals.find(x=>x.id===_depositGoalId);if(!g)return;
  const aEl=document.getElementById("deposit-amount");
  const amount=parseFloat(aEl.value);
  if(isNaN(amount)||amount<=0){
    aEl.classList.add("error");setTimeout(()=>aEl.classList.remove("error"),600);
    toast("Informe um valor válido!","err");return;
  }
  const newSaved=Math.min(g.saved+amount,g.target);
  window.fbUpdate("goals",_depositGoalId,{saved:newSaved}).then(()=>{
    closeModal("modal-deposit");
    if(newSaved>=g.target)toast(`🎉 Meta "${g.name}" concluída!`);
    else toast(`💰 ${fmt(amount)} depositado na meta!`);
  }).catch(e=>toast("Erro: "+e.message,"err"));
}

// ── HAMBURGUER ────────────────────────────────────────────────────────
window.toggleSidebar = () => {
  const sb=document.getElementById("sidebar");
  const ov=document.getElementById("sidebar-overlay");
  const btn=document.getElementById("ham-btn");
  const open=sb.classList.toggle("open");
  ov.classList.toggle("open",open);
  btn.classList.toggle("open",open);
  document.body.style.overflow=open?"hidden":"";
};
window.closeSidebar = () => {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("sidebar-overlay")?.classList.remove("open");
  document.getElementById("ham-btn")?.classList.remove("open");
  document.body.style.overflow="";
};

// ── LAYOUT ────────────────────────────────────────────────────────────
function checkLayout(){
  const mob=window.innerWidth<768;
  if(!mob)closeSidebar();
}
let _resizeT=null;
window.addEventListener("resize",()=>{
  clearTimeout(_resizeT);
  _resizeT=setTimeout(()=>{checkLayout();scheduleRender("all");},200);
});

// ── BACKUP ────────────────────────────────────────────────────────────
let _backupData = null;
let _currentBackupTab = "export";

function openBackup(){
  const t=T();
  // Subtítulo com data/hora
  document.getElementById("backup-subtitle").textContent =
    "Dados salvos em " + new Date().toLocaleString("pt-BR");
  switchBackupTab("export");
  renderBackupStats();
  renderAutoBackupStatus();
  checkAutoBackup();
  openModal("modal-backup");
}

function switchBackupTab(tab){
  _currentBackupTab = tab;
  const t=T();
  ["export","import","auto"].forEach(id=>{
    document.getElementById("tab-"+id).style.display = id===tab?"block":"none";
    const btn=document.getElementById("tab-"+id+"-btn");
    if(btn){
      btn.style.background = id===tab ? t.accent+"22" : t.cardLight;
      btn.style.color      = id===tab ? t.accent : t.muted;
      btn.style.border     = "1px solid "+(id===tab ? t.accent+"55" : t.border);
    }
  });
}

function buildBackupObject(){
  return {
    version:      2,
    exportedAt:   new Date().toISOString(),
    exportedBy:   window._currentUser?.name || "Usuário",
    houseId:      "casa-rayson-alessandra",
    data: {
      salary:       S.salary,
      extra:        S.extra,
      expenses:     S.expenses,
      cards:        S.cards,
      installments: S.installments,
      goals:        S.goals,
    }
  };
}

function renderBackupStats(){
  const t=T();
  const el=document.getElementById("backup-stats");
  if(!el)return;
  el.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:4px">
      ${[
        {icon:"💸",label:"Gastos",    val:S.expenses.length},
        {icon:"💳",label:"Cartões",   val:S.cards.length},
        {icon:"📅",label:"Parcelas",  val:S.installments.length},
        {icon:"🎯",label:"Metas",     val:S.goals.length},
        {icon:"💰",label:"Salário",   val:fmt(S.salary)},
        {icon:"📦",label:"Tamanho",   val:Math.round(JSON.stringify(buildBackupObject()).length/1024)+"KB"},
      ].map(i=>`<div style="background:${t.cardLight};border:1px solid ${t.border};border-radius:12px;padding:12px;text-align:center">
        <p style="font-size:20px">${i.icon}</p>
        <p style="font-size:16px;font-weight:800;margin:4px 0">${i.val}</p>
        <p style="font-size:10px;opacity:.5">${i.label}</p>
      </div>`).join("")}
    </div>`;
}

function doExportBackup(silent){
  const backup = buildBackupObject();
  const json   = JSON.stringify(backup, null, 2);
  const blob   = new Blob([json], {type:"application/json"});
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  const date   = new Date().toISOString().slice(0,10);
  a.href       = url;
  a.download   = `MeuOrcamento-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
  // Salva info do último backup
  localStorage.setItem("lastBackup", new Date().toISOString());
  if(!silent) toast("✅ Backup baixado com sucesso!");
  renderAutoBackupStatus();
}

function doCopyBackup(){
  const json = JSON.stringify(buildBackupObject(), null, 2);
  navigator.clipboard.writeText(json)
    .then(()=>toast("📋 Backup copiado para a área de transferência!"))
    .catch(()=>toast("Erro ao copiar. Tente baixar o arquivo.","err"));
}

// ── IMPORTAR ──────────────────────────────────────────────────────────
function handleBackupDrop(e){
  e.preventDefault();
  document.getElementById("drop-zone").style.borderColor="#22223a";
  const file=e.dataTransfer.files[0];
  if(file) readBackupFile(file);
}
function handleBackupFile(e){
  const file=e.target.files[0];
  if(file) readBackupFile(file);
}
function readBackupFile(file){
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      validateAndPreviewBackup(data);
    }catch{
      showImportError("Arquivo inválido. Certifique-se de usar um backup do Meu Orçamento.");
    }
  };
  reader.readAsText(file);
}
function validateAndPreviewBackup(data){
  const errEl=document.getElementById("import-error");
  errEl.style.display="none";
  if(!data.data||!data.exportedAt){
    showImportError("Arquivo não reconhecido como backup do Meu Orçamento.");
    return;
  }
  _backupData=data;
  const t=T();
  const d=data.data;
  document.getElementById("import-preview").style.display="block";
  document.getElementById("import-preview").style.background=t.cardLight;
  document.getElementById("import-preview").style.border=`1px solid ${t.border}`;
  document.getElementById("import-preview").style.borderRadius="14px";
  document.getElementById("import-preview").innerHTML=`
    <p style="font-size:13px;font-weight:800;margin-bottom:10px">📦 Conteúdo do backup</p>
    <p style="font-size:11px;color:${t.muted};margin-bottom:8px">Exportado em: ${new Date(data.exportedAt).toLocaleString("pt-BR")} por ${data.exportedBy||"?"}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${[
        {l:"Gastos",    v:d.expenses?.length||0},
        {l:"Cartões",   v:d.cards?.length||0},
        {l:"Parcelas",  v:d.installments?.length||0},
        {l:"Metas",     v:d.goals?.length||0},
      ].map(i=>`<span style="background:${t.accent}18;color:${t.accent};padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700">${i.v} ${i.l}</span>`).join("")}
    </div>`;
  const btn=document.getElementById("import-confirm-btn");
  btn.style.display="block";
  btn.style.background="#ff4d6d";
  btn.style.marginTop="12px";
}
function showImportError(msg){
  const el=document.getElementById("import-error");
  el.textContent=msg;el.style.display="block";
  document.getElementById("import-preview").style.display="none";
  document.getElementById("import-confirm-btn").style.display="none";
}
async function doImportBackup(){
  if(!_backupData){return;}
  confirm2({
    emoji:"⚠️",
    title:"Restaurar backup?",
    msg:"Os dados do backup serão ADICIONADOS ao que já existe no app. Isso não pode ser desfeito.",
    okLabel:"Sim, importar",
    danger:true,
    ok: async ()=>{
      const d=_backupData.data;
      let count=0;
      try{
        // Importa gastos
        if(d.expenses?.length){
          for(const e of d.expenses){
            const {id,...rest}=e;
            await window.fbAdd("expenses",rest);count++;
          }
        }
        // Importa cartões (apenas se não existir pelo nome)
        if(d.cards?.length){
          for(const c of d.cards){
            const exists=S.cards.find(x=>x.name===c.name);
            if(!exists){const {id,...rest}=c;await window.fbAdd("cards",rest);count++;}
          }
        }
        // Importa parcelamentos
        if(d.installments?.length){
          for(const i of d.installments){
            const {id,...rest}=i;
            await window.fbAdd("installments",rest);count++;
          }
        }
        // Importa metas
        if(d.goals?.length){
          for(const g of d.goals){
            const exists=S.goals.find(x=>x.name===g.name);
            if(!exists){const {id,...rest}=g;await window.fbAdd("goals",rest);count++;}
          }
        }
        // Salário
        if(d.salary||d.extra){
          await window.fbSaveHouse({salary:d.salary||0,extra:d.extra||0});
        }
        toast(`✅ ${count} itens importados com sucesso!`);
        closeModal("modal-backup");
        _backupData=null;
      }catch(e){
        toast("Erro ao importar: "+e.message,"err");
      }
    }
  });
}

// ── BACKUP AUTOMÁTICO ─────────────────────────────────────────────────
function toggleAutoBackup(){
  const current=localStorage.getItem("autoBackup")==="true";
  localStorage.setItem("autoBackup", current?"false":"true");
  renderAutoBackupStatus();
  toast(current?"Backup automático desativado":"✅ Backup automático ativado!");
}
function checkAutoBackup(){
  if(localStorage.getItem("autoBackup")!=="true")return;
  const last=localStorage.getItem("lastBackup");
  if(!last)return;
  const days=(Date.now()-new Date(last).getTime())/(1000*60*60*24);
  if(days>=3){
    doExportBackup(true);
    toast("💾 Backup automático realizado!");
  }
}
function renderAutoBackupStatus(){
  const t=T();
  const enabled=localStorage.getItem("autoBackup")==="true";
  const last=localStorage.getItem("lastBackup");
  const toggle=document.getElementById("auto-toggle");
  const knob=document.getElementById("auto-toggle-knob");
  const row=document.getElementById("auto-backup-row");
  if(toggle){
    toggle.style.background=enabled?t.accent:"#22223a";
    if(knob)knob.style.left=enabled?"23px":"3px";
  }
  if(row)row.style.background=t.cardLight;
  const info=document.getElementById("last-backup-info");
  if(info){
    info.style.background=t.cardLight;
    info.style.borderRadius="14px";
    if(last){
      const d=new Date(last);
      const days=Math.floor((Date.now()-d.getTime())/(1000*60*60*24));
      const color=days>7?t.danger:days>3?t.warn:t.accent;
      info.innerHTML=`
        <p style="font-size:12px;color:${t.muted};margin-bottom:4px">Último backup</p>
        <p style="font-size:14px;font-weight:800;color:${color}">${d.toLocaleString("pt-BR")}</p>
        <p style="font-size:11px;color:${days>7?t.danger:t.muted};margin-top:2px">${days===0?"Hoje":days===1?"Ontem":`Há ${days} dias`}${days>7?" ⚠️ Recomendamos fazer backup!":""}</p>`;
    }else{
      info.innerHTML=`<p style="font-size:12px;color:${t.muted}">Nenhum backup realizado ainda.</p>`;
    }
  }
}
// ── CONTRIBUIÇÃO AUTOMÁTICA DE METAS ─────────────────────────────────
function runAutoContrib(id){
  const g=S.goals.find(x=>x.id===id);if(!g||!g.monthlyContrib||g.saved>=g.target)return;
  const key=`goal-contrib-${id}-${curM()}`;
  if(localStorage.getItem(key)){toast("Contribuição já realizada este mês!","info");return;}
  const newSaved=Math.min(g.saved+g.monthlyContrib,g.target);
  window.fbUpdate("goals",id,{saved:newSaved}).then(()=>{
    localStorage.setItem(key,"1");
    if(newSaved>=g.target)toast(`🎉 Meta "${g.name}" concluída!`);
    else toast(`🔄 ${fmt(g.monthlyContrib)} depositado automaticamente em "${g.name}"!`);
  }).catch(e=>toast("Erro: "+e.message,"err"));
}

// Roda ao entrar no app — deposita automaticamente nas metas com contrib ativa
window._checkAutoContribOnLoad = ()=>{
  setTimeout(async ()=>{
    const cm=curM();
    for(const g of S.goals){
      if(!g.monthlyContrib||g.monthlyContrib<=0)continue;
      if(g.saved>=g.target)continue;
      const key=`goal-contrib-${g.id}-${cm}`;
      if(localStorage.getItem(key))continue;
      // Deposita silenciosamente
      const newSaved=Math.min(g.saved+g.monthlyContrib,g.target);
      try{
        await window.fbUpdate("goals",g.id,{saved:newSaved});
        localStorage.setItem(key,"1");
        if(newSaved>=g.target)toast(`🎉 Meta "${g.name}" concluída!`);
        else toast(`🔄 Contribuição automática: ${fmt(g.monthlyContrib)} → "${g.name}"`,"info");
      }catch(e){console.warn("Auto contrib error:",e);}
    }
  }, 4000);
};

// ── GASTOS RECORRENTES ───────────────────────────────────────────────
// Relança gastos marcados como recorrentes no início de cada mês
window._checkRecurringOnLoad = ()=>{
  setTimeout(async ()=>{
    const cm=curM();
    const recurring=S.expenses.filter(e=>e.recurring);
    for(const e of recurring){
      const key=`recurring-${e.id}-${cm}`;
      if(localStorage.getItem(key))continue;
      // Verifica se já existe gasto igual esse mês (evita duplicata)
      const already=S.expenses.find(x=>
        x.recurring&&x.desc===e.desc&&x.amount===e.amount&&x.date?.startsWith(cm)&&x.id!==e.id
      );
      if(already){localStorage.setItem(key,"1");continue;}
      const today_str=`${cm}-${String(new Date().getDate()).padStart(2,"0")}`;
      const data={
        date:today_str,
        desc:e.desc,
        amount:e.amount,
        cat:e.cat,
        cardId:e.cardId||null,
        note:e.note||"",
        recurring:true,
        _fromRecurring:e.id,
      };
      try{
        await window.fbAdd("expenses",data);
        localStorage.setItem(key,"1");
        toast(`🔁 Gasto recorrente lançado: ${e.desc}`,"info");
      }catch(err){console.warn("Recurring error:",err);}
    }
  },6000);
};

// ── INDICADOR OFFLINE ─────────────────────────────────────────────────
function initOfflineBanner(){
  const banner=document.getElementById("offline-banner");
  if(!banner)return;
  const show=()=>{
    banner.style.display="block";
    // Empurra o layout para baixo
    const layout=document.getElementById("layout");
    if(layout)layout.style.marginTop="40px";
    const login=document.getElementById("login-screen");
    if(login)login.style.paddingTop="48px";
  };
  const hide=()=>{
    banner.style.display="none";
    const layout=document.getElementById("layout");
    if(layout)layout.style.marginTop="";
    const login=document.getElementById("login-screen");
    if(login)login.style.paddingTop="";
  };
  if(!navigator.onLine)show();
  window.addEventListener("offline",show);
  window.addEventListener("online",()=>{
    hide();
    toast("📶 Conexão restaurada!","ok");
  });
}
// Inicia o banner assim que o DOM carrega
document.addEventListener("DOMContentLoaded",initOfflineBanner);


// ── BLOQUEIO POR PIN ──────────────────────────────────────────────────
const PIN_TIMEOUT = 5 * 60 * 1000; // 5 minutos
const PIN_MAX_ATTEMPTS = 3;

let _pinBuffer     = "";
let _pinAttempts   = 0;
let _bgTime        = null;
let _pinSetupStep  = 1;   // 1 = digitar, 2 = confirmar
let _pinSetupFirst = "";
let _pinSetupBuffer= "";

// ── Utilitários ────────────────────────────────────────────────────────
function _pinKey(uid){ return "pin_" + (uid || window._currentUser?.uid || "user"); }

function _hashPin(pin){
  // Hash simples (djb2) — sem crypto nativa no SW, mas suficiente para PIN local
  let h = 5381;
  for(let i=0;i<pin.length;i++) h = ((h<<5)+h)+pin.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function getPinHash(){ return localStorage.getItem(_pinKey()); }
function setPinHash(pin){ localStorage.setItem(_pinKey(), _hashPin(pin)); }
function removePinHash(){ localStorage.removeItem(_pinKey()); }
function hasPinSet(){ return !!getPinHash(); }

// ── Overlay de desbloqueio ─────────────────────────────────────────────
function showPinOverlay(){
  const u = window._currentUser;
  const t = T();
  const ov = document.getElementById("pin-overlay");
  if(!ov) return;
  ov.style.background = t.bg;
  document.getElementById("pin-avatar").textContent = u?.emoji || "🔒";
  document.getElementById("pin-title").style.color = t.text;
  document.getElementById("pin-subtitle").style.color = t.muted;
  document.getElementById("pin-subtitle").textContent = "Digite seu PIN para continuar";
  _pinBuffer   = "";
  _pinAttempts = 0;
  _updatePinDots("pin-dot", _pinBuffer);
  _clearPinError();
  ov.classList.add("show");
}

function hidePinOverlay(){
  const ov = document.getElementById("pin-overlay");
  if(ov) ov.classList.remove("show");
  _pinBuffer = "";
  _bgTime    = null;
}

function pinKey(v){
  if(v === "logout"){ doLogout(); hidePinOverlay(); return; }
  if(v === "del"){ _pinBuffer = _pinBuffer.slice(0,-1); _updatePinDots("pin-dot", _pinBuffer); return; }
  if(_pinBuffer.length >= 4) return;
  _pinBuffer += String(v);
  _updatePinDots("pin-dot", _pinBuffer);
  if(_pinBuffer.length === 4) _verifyPin();
}

function _verifyPin(){
  if(_hashPin(_pinBuffer) === getPinHash()){
    hidePinOverlay();
    toast("✅ PIN correto!");
  } else {
    _pinAttempts++;
    const rem = PIN_MAX_ATTEMPTS - _pinAttempts;
    _shakeOverlay();
    _pinBuffer = "";
    _updatePinDots("pin-dot", "");
    if(_pinAttempts >= PIN_MAX_ATTEMPTS){
      toast("🔒 3 tentativas erradas — saindo!", "err");
      setTimeout(()=>{ doLogout(); hidePinOverlay(); }, 1200);
    } else {
      const el = document.getElementById("pin-error");
      el.textContent = `PIN incorreto. ${rem} tentativa${rem>1?"s":""} restante${rem>1?"s":""}.`;
      el.style.display = "block";
      document.getElementById("pin-attempts").textContent = "";
    }
  }
}

function _shakeOverlay(){
  const kb = document.getElementById("pin-keyboard");
  if(!kb) return;
  kb.style.animation = "shake .3s ease-out";
  setTimeout(()=> kb.style.animation = "", 400);
}

function _clearPinError(){
  const el = document.getElementById("pin-error");
  if(el){ el.style.display = "none"; el.textContent = ""; }
  const at = document.getElementById("pin-attempts");
  if(at) at.textContent = "";
}

function _updatePinDots(cls, buf){
  document.querySelectorAll("."+cls).forEach((d,i)=>{
    const t = T();
    d.style.background   = i < buf.length ? t.accent : "transparent";
    d.style.borderColor  = i < buf.length ? t.accent : t.border;
  });
}

// ── Setup / alteração de PIN ───────────────────────────────────────────
function openPinSetup(){
  _pinSetupStep   = 1;
  _pinSetupFirst  = "";
  _pinSetupBuffer = "";
  document.getElementById("pin-setup-step-label").textContent = "Digite um PIN de 4 dígitos";
  document.getElementById("pin-setup-error").style.display = "none";
  _updatePinDots("pin-setup-dot", "");
  openModal("modal-pin-setup");
}

function pinSetupKey(v){
  if(v === "del"){ _pinSetupBuffer = _pinSetupBuffer.slice(0,-1); _updatePinDots("pin-setup-dot",_pinSetupBuffer); return; }
  if(_pinSetupBuffer.length >= 4) return;
  _pinSetupBuffer += String(v);
  _updatePinDots("pin-setup-dot", _pinSetupBuffer);
  if(_pinSetupBuffer.length === 4){
    if(_pinSetupStep === 1){
      _pinSetupFirst  = _pinSetupBuffer;
      _pinSetupBuffer = "";
      _pinSetupStep   = 2;
      document.getElementById("pin-setup-step-label").textContent = "Confirme seu PIN";
      _updatePinDots("pin-setup-dot","");
    } else {
      if(_pinSetupBuffer === _pinSetupFirst){
        setPinHash(_pinSetupFirst);
        closeModal("modal-pin-setup");
        toast("🔒 PIN configurado com sucesso!");
      } else {
        _pinSetupBuffer = "";
        _pinSetupFirst  = "";
        _pinSetupStep   = 1;
        document.getElementById("pin-setup-step-label").textContent = "PINs diferentes — tente novamente";
        document.getElementById("pin-setup-error").textContent = "Os PINs não conferem.";
        document.getElementById("pin-setup-error").style.display = "block";
        _updatePinDots("pin-setup-dot","");
      }
    }
  }
}

function disablePinLock(){
  confirm2({
    emoji:"🔓",
    title:"Desativar bloqueio?",
    msg:"O app não pedirá mais PIN ao retornar do background.",
    okLabel:"Desativar",
    okColor:T().warn,
    ok:()=>{ removePinHash(); closeModal("modal-pin-setup"); toast("Bloqueio por PIN desativado","info"); }
  });
}

// ── Detecção de background ─────────────────────────────────────────────
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState === "hidden"){
    _bgTime = Date.now();
  } else {
    if(!_bgTime) return;
    const elapsed = Date.now() - _bgTime;
    _bgTime = null;
    // Só bloqueia se app está na tela principal E PIN foi configurado
    const layout = document.getElementById("layout");
    if(!layout || layout.style.display === "none") return;
    if(!hasPinSet()) return;
    if(elapsed >= PIN_TIMEOUT) showPinOverlay();
  }
});

// Expõe para a sidebar (botão de configurar PIN)
window.openPinSetup = openPinSetup;

// Checa backup automático ao entrar no app
window._checkAutoBackupOnLoad = ()=>{
  setTimeout(()=>{
    if(S.expenses.length>0||S.installments.length>0) checkAutoBackup();
  }, 5000);
};

// ── NOTIFICAÇÕES DE VENCIMENTO ────────────────────────────────────────
async function initNotifications(){
  if(!("Notification" in window)||!navigator.serviceWorker) return false;
  if(Notification.permission==="granted") return true;
  if(Notification.permission==="denied")  return false;
  const perm = await Notification.requestPermission();
  return perm==="granted";
}

async function _swReady(){
  if(!navigator.serviceWorker) return null;
  try{ return await navigator.serviceWorker.ready; }catch{ return null; }
}

// Envia uma notificação via SW (funciona mesmo com app em background)
async function _notify(title, body, tag){
  const reg = await _swReady();
  if(!reg) return;
  reg.active?.postMessage({ type:"NOTIFY_INSTALLMENT", title, body, tag });
}

// Verifica parcelas e emite notificações para as que vencem em breve
async function checkInstallmentNotifications(){
  if(Notification.permission !== "granted") return;
  if(!S.installments.length) return;

  const today     = new Date();
  const todayDay  = today.getDate();
  const todayMonth= `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;
  const alerted   = JSON.parse(localStorage.getItem("notif-alerted")||"{}");
  const newAlerts = {...alerted};

  for(const i of S.installments){
    // Ignora quitadas
    if(i.paidInstallments >= i.installments) continue;
    // Ignora sem dia de vencimento
    if(!i.dueDay) continue;
    // Ignora parcelas que ainda não começaram
    if(i.startMonth && i.startMonth > todayMonth) continue;

    const daysUntil = i.dueDay - todayDay;
    const alertKey  = `${i.id}-${todayMonth}`;

    // Já notificou esse mês? pula
    if(alerted[alertKey]) continue;

    if(daysUntil < 0){
      // Atrasada
      await _notify(
        `⚠️ Parcela atrasada!`,
        `${i.desc} venceu dia ${i.dueDay}. ${fmt(i.installmentValue)} em aberto.`,
        alertKey
      );
      newAlerts[alertKey] = "overdue";
    } else if(daysUntil <= 3){
      // Vence em até 3 dias
      const when = daysUntil===0 ? "hoje" : daysUntil===1 ? "amanhã" : `em ${daysUntil} dias`;
      await _notify(
        `📅 Parcela vence ${when}`,
        `${i.desc} — ${fmt(i.installmentValue)} — dia ${i.dueDay}.`,
        alertKey
      );
      newAlerts[alertKey] = "soon";
    }
  }

  localStorage.setItem("notif-alerted", JSON.stringify(newAlerts));
}

// Limpa alertas de meses anteriores do localStorage
function _pruneOldAlerts(){
  const cur = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;
  const stored = JSON.parse(localStorage.getItem("notif-alerted")||"{}");
  const pruned = {};
  Object.keys(stored).forEach(k=>{ if(k.includes(cur)) pruned[k]=stored[k]; });
  localStorage.setItem("notif-alerted", JSON.stringify(pruned));
}

// Chamado pelo firebase.js ao entrar no app (após dados carregados)
window._checkNotificationsOnLoad = ()=>{
  setTimeout(async ()=>{
    _pruneOldAlerts();
    // Se já tem permissão, checa direto
    if(Notification.permission==="granted"){
      await checkInstallmentNotifications();
    }
  }, 3000);
};

// Renderiza o bloco de configuração de notificações na sidebar
function renderNotifSettings(){
  const el=document.getElementById("notif-settings");if(!el)return;
  const t=T();
  const perm=("Notification" in window)?Notification.permission:"unsupported";
  const granted=perm==="granted";
  const denied=perm==="denied";

  el.innerHTML=`
    <div style="padding:10px 14px;border-radius:14px;border:1px solid ${t.border};background:${t.cardLight}">
      <p style="font-size:10px;color:${t.muted};margin-bottom:8px;letter-spacing:1px;text-transform:uppercase;font-weight:700">Notificações</p>
      ${denied
        ? `<p style="font-size:11px;color:${t.danger};line-height:1.5">Bloqueadas pelo navegador. Habilite nas configurações do site.</p>`
        : perm==="unsupported"
        ? `<p style="font-size:11px;color:${t.muted}">Não suportado neste navegador.</p>`
        : granted
        ? `<div style="display:flex;align-items:center;gap:8px">
             <span style="font-size:18px">🔔</span>
             <div style="flex:1">
               <p style="font-size:12px;font-weight:700;color:${t.accent}">Ativas</p>
               <p style="font-size:10px;color:${t.muted}">Aviso 3 dias antes do vencimento</p>
             </div>
             <button onclick="checkInstallmentNotifications().then(()=>toast('✅ Notificações verificadas!'))" style="background:${t.accent}18;border:1px solid ${t.accent}33;border-radius:8px;padding:5px 10px;color:${t.accent};font-size:11px;font-weight:700;cursor:pointer">Testar</button>
           </div>`
        : `<button onclick="initNotifications().then(ok=>{if(ok){renderNotifSettings();checkInstallmentNotifications();}else toast('Permissão negada.','err');})" style="width:100%;background:${t.accent};border:none;border-radius:10px;padding:10px;color:#000;font-weight:800;font-size:13px;cursor:pointer">🔔 Ativar notificações</button>`
      }
    </div>`;
}


// Expõe _auth para updateUserBadge
import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js").then(m=>{
  // já inicializado no module acima
}).catch(()=>{});