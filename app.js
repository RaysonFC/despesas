/* MeuOrçamento — app.js */

// ── DADOS ESTÁTICOS ───────────────────────────────────────────────────
const THEMES={
  dark:  {name:"Dark",  icon:"🌙",bg:"#080810",card:"#10101c",cardLight:"#1c1c2e",accent:"#00e5a0",danger:"#ff4d6d",warn:"#ffc94a",blue:"#4d9fff",text:"#e8e8f4",muted:"#5a5a72",border:"#22223a",navBg:"#0d0d1a",sidebar:"#0d0d1a"},
  light: {name:"Light", icon:"☀️",bg:"#f0f2f8",card:"#ffffff",cardLight:"#eef0f7",accent:"#00b37e",danger:"#e53e5e",warn:"#c87800",blue:"#2b7de9",text:"#1a1a2e",muted:"#8888aa",border:"#dde0ee",navBg:"#ffffff",sidebar:"#e8eaf4"},
  ocean: {name:"Ocean", icon:"🌊",bg:"#071829",card:"#0d2337",cardLight:"#163452",accent:"#00cfff",danger:"#ff6b6b",warn:"#ffd166",blue:"#7eb8f7",text:"#d6eeff",muted:"#4d7a99",border:"#1a4060",navBg:"#0d2337",sidebar:"#071829"},
  sunset:{name:"Sunset",icon:"🌅",bg:"#1a0a1e",card:"#271030",cardLight:"#3d1a4e",accent:"#ff9a3c",danger:"#ff4d6d",warn:"#ffdc5e",blue:"#c87af5",text:"#f5e6ff",muted:"#8a5a9e",border:"#4a1f60",navBg:"#271030",sidebar:"#1a0a1e"},
  forest:{name:"Forest",icon:"🌿",bg:"#071510",card:"#0e2018",cardLight:"#1a3428",accent:"#4cde80",danger:"#ff6b6b",warn:"#f0c040",blue:"#60c8a0",text:"#d4f5e0",muted:"#4a7a5a",border:"#1e3d2a",navBg:"#0e2018",sidebar:"#071510"},
  rose:  {name:"Rose",  icon:"🌸",bg:"#fdf4f7",card:"#ffffff",cardLight:"#fce8ef",accent:"#e05c8a",danger:"#c0392b",warn:"#c87830",blue:"#8060c0",text:"#2d1020",muted:"#b080a0",border:"#f0c8d8",navBg:"#ffffff",sidebar:"#fce8ef"},
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
const TAB_LABELS={home:"Início",cards:"Cartões",all:"Todos os Gastos",goals:"Metas",health:"Saúde Financeira"};

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
  const t=T(),light=S.theme==="light"||S.theme==="rose";
  document.body.style.background=t.bg;document.body.style.color=t.text;
  const sb=document.getElementById("sidebar");if(sb)sb.style.cssText=`background:${t.sidebar};border-color:${t.border}`;
  const bn=document.getElementById("bottom-nav");if(bn)bn.style.cssText=`background:${t.navBg};border-top-color:${t.border}`;
  const ti=document.getElementById("theme-icon-side");if(ti)ti.textContent=t.icon;
  const themeTopBtn=document.getElementById("theme-btn-top");if(themeTopBtn){themeTopBtn.style.background=t.cardLight;themeTopBtn.style.border=`1px solid ${t.border}`;themeTopBtn.style.color=t.muted;}
  const tb=document.getElementById("theme-btn-top");if(tb)tb.textContent=t.icon+" Tema";
  let st=document.getElementById("dyn-style")||document.createElement("style");st.id="dyn-style";
  st.textContent=`::-webkit-scrollbar-thumb{background:${t.border};}.crd{background:${t.card};border-color:${t.border};}.inp{background:${t.cardLight};border-color:${t.border};color:${t.text};}.inp:focus{border-color:${t.accent};}.inp.error{border-color:${t.danger}!important;}.chip{background:${t.cardLight};border-color:${t.border};color:${t.muted};}.chip.active{background:${t.accent}18;border-color:${t.accent};color:${t.accent};}.side-btn{color:${t.muted};}.side-btn:hover{background:${t.accent}12;color:${t.accent};}.side-btn.active{background:${t.accent}18;color:${t.accent};}.tab-btn{color:${t.muted};}.tab-btn.active{color:${t.accent};}.row{border-color:${t.border}44;}.btn-sm{background:${t.cardLight};border:1px solid ${t.border};color:${t.muted};}.btn-p{background:${t.accent};color:${light?"#fff":"#000"};}.modal-box{background:${t.card};border-color:${t.border};}.sec{color:${t.muted};}.prog-bg{background:${t.cardLight};}#login-screen{background:${t.bg};}`;
  document.head.appendChild(st);
  // Atualiza sync dot color
  const sd=document.getElementById("sync-dot");if(sd)sd.style.background=t.accent;
}

function renderAll(){
  applyTheme();
  renderSalarySidebar();renderSalaryTopbar();renderStatus();renderTab(S.currentTab);
  updateUserBadge();
}

function renderSalarySidebar(){
  const t=T(),total=S.salary+S.extra;
  const el=document.getElementById("salary-sidebar");if(!el)return;
  el.innerHTML=`<div style="padding:10px 14px;border-radius:14px;border:1px solid ${t.border};background:${t.cardLight}"><button onclick="openSalaryModal()" style="display:block;width:100%;background:none;border:none;text-align:left;padding:0;cursor:pointer"><p style="font-size:10px;color:${t.muted};margin-bottom:2px">Salário</p><p style="color:${t.accent};font-size:14px;font-weight:800;margin-bottom:6px">${fmt(S.salary)} ✎</p><p style="font-size:10px;color:${t.muted};margin-bottom:2px">Extra</p><p style="color:${t.blue};font-size:14px;font-weight:800;margin-bottom:6px">${fmt(S.extra)} ✎</p><div style="border-top:1px solid ${t.border};padding-top:6px"><p style="font-size:10px;color:${t.muted};margin-bottom:2px">Total em conta</p><p style="color:${t.accent};font-size:16px;font-weight:800">${fmt(total)}</p></div></button></div>`;
}
function renderSalaryTopbar(){
  const t=T(),total=S.salary+S.extra;
  const el=document.getElementById("salary-topbar");if(!el)return;
  el.innerHTML=`<div style="display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;justify-content:flex-end"><div style="text-align:right"><p style="font-size:10px;color:${t.muted};margin-bottom:2px">Salário</p><button onclick="openSalaryModal()" style="background:none;border:none;color:${t.accent};font-size:16px;font-weight:800;padding:0">${fmt(S.salary)} ✎</button></div><div style="text-align:right"><p style="font-size:10px;color:${t.muted};margin-bottom:2px">Extra</p><button onclick="openSalaryModal()" style="background:none;border:none;color:${t.blue};font-size:16px;font-weight:800;padding:0">${fmt(S.extra)} ✎</button></div><div style="text-align:right;padding-left:12px;border-left:1px solid ${t.border}"><p style="font-size:10px;color:${t.muted};margin-bottom:2px">Total</p><button onclick="openSalaryModal()" style="background:none;border:none;color:${t.accent};font-size:18px;font-weight:800;padding:0">${fmt(total)}</button></div></div>`;
}

// ── STATUS ────────────────────────────────────────────────────────────
function renderStatus(){
  const t=T(),cm=curM();
  // Sempre usa o mês atual para o status (ignora filtro aqui)
  const thisMonthExp=S.expenses.filter(e=>e.date?.startsWith(cm));
  // Parcelas: só conta as do mês atual (startMonth <= curM e não quitadas)
  const thisMonthInst=S.installments.filter(i=>{
    if(i.paidInstallments>=i.installments)return false;
    if(!i.startMonth)return true;
    return i.startMonth<=cm;
  });
  const iT=thisMonthInst.reduce((s,i)=>s+i.installmentValue,0);
  const eT=thisMonthExp.reduce((s,e)=>s+e.amount,0);
  const totalIncome=S.salary+S.extra,tot=eT+iT,rem=totalIncome-tot;
  const pct=Math.min((tot/(totalIncome||1))*100,100);
  const h=pct<50?{l:"Ótimo!",c:t.accent}:pct<75?{l:"Atenção",c:t.warn}:{l:"Crítico",c:t.danger};
  const sc=document.getElementById("status-card");if(!sc)return;
  sc.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-bottom:20px">
    <div><p style="font-size:11px;color:${t.muted};margin-bottom:4px">Total Comprometido <span style="color:${t.blue}">${fmtMonth(cm)}</span></p><p style="font-size:28px;font-weight:800;color:${t.danger}">${fmt(tot)}</p><p style="font-size:11px;color:${t.muted};margin-top:4px"><span style="color:${t.warn}">Parcelas: ${fmt(iT)}</span> &nbsp;·&nbsp; <span style="color:${t.blue}">Avulsos: ${fmt(eT)}</span></p></div>
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
  ["home","cards","all","goals","health"].forEach(id=>{
    document.getElementById("tab-"+id).style.display=id===tab?"block":"none";
    document.getElementById("side-"+id)?.classList.toggle("active",id===tab);
    document.getElementById("nav-"+id)?.classList.toggle("active",id===tab);
  });
  document.getElementById("topbar-title").textContent=TAB_LABELS[tab]||tab;
  S.currentTab=tab;renderTab(tab);
}
function renderTab(t){
  if(t==="home")renderHome();else if(t==="cards")renderCards();
  else if(t==="all")renderAllExp();else if(t==="goals")renderGoals();else if(t==="health")renderHealth();
}

// ── FILTER BAR ────────────────────────────────────────────────────────
function filterBar(){
  const t=T(),fm=S.filterMonth;
  const months=[...new Set(S.expenses.map(e=>e.date?.slice(0,7)).filter(Boolean))].sort((a,b)=>b.localeCompare(a));
  return`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:20px"><span style="font-size:11px;color:${t.muted};letter-spacing:1px;text-transform:uppercase;font-weight:700;flex-shrink:0">Filtrar:</span><button class="chip ${!fm?"active":""}" onclick="setFilter('')">Tudo</button>${months.slice(0,7).map(m=>`<button class="chip ${fm===m?"active":""}" onclick="setFilter('${m}')">${fmtMonth(m)}</button>`).join("")}</div>`;
}
function setFilter(m){S.filterMonth=m;renderAll();}

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
    return`<div class="row"><div style="width:40px;height:40px;background:${t.cardLight};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${CATS[e.cat]||"💸"}</div><div style="flex:1;min-width:0"><p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.desc}</p><div style="display:flex;gap:6px;align-items:center;margin-top:2px"><span style="font-size:10px;color:${t.muted}">${fmtD(e.date)}</span>${card?`<span class="badge" style="background:${t.blue}18;color:${t.blue}">${card.name}</span>`:""}${who}</div></div><p style="font-weight:700;color:${t.danger};font-size:14px;white-space:nowrap">${fmt(e.amount)}</p></div>`;
  }).join("");

  document.getElementById("tab-home").innerHTML=`${filterBar()}${daysH}${instH}<div class="grid-2" style="align-items:start"><div><p class="sec">Registrar Gasto</p><div class="crd"><div class="grid-2 keep-2" style="gap:10px;margin-bottom:10px"><input class="inp" type="date" id="h-date" value="${today()}"/><select class="inp" id="h-cat">${Object.keys(CATS).map(c=>`<option>${c}</option>`).join("")}</select></div><input class="inp" id="h-desc" placeholder="Descrição (ex: Mercado)" style="margin-bottom:10px"/><div class="grid-2 keep-2" style="gap:10px;margin-bottom:14px"><input class="inp" type="number" id="h-amount" placeholder="Valor (R$)" step="0.01"/><select class="inp" id="h-card"><option value="">💵 Dinheiro</option>${S.cards.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}</select></div><button class="btn-p" onclick="saveHomeExp()">+ Registrar Gasto</button></div></div><div><p class="sec">Recentes</p><div class="crd" style="padding:0 20px">${!filtExp.length?`<p style="padding:20px 0;color:${t.muted};font-size:13px">Nenhum gasto ainda.</p>`:recentH}</div></div></div>`;
}

function saveHomeExp(){
  const dEl=document.getElementById("h-desc"),aEl=document.getElementById("h-amount");
  const desc=dEl.value.trim(),amount=parseFloat(aEl.value);
  let ok=true;
  if(!desc){dEl.classList.add("error");setTimeout(()=>dEl.classList.remove("error"),600);ok=false;}
  if(!amount||amount<=0){aEl.classList.add("error");setTimeout(()=>aEl.classList.remove("error"),600);ok=false;}
  if(!ok){toast("Preencha descrição e valor!","err");return;}
  const cv=document.getElementById("h-card").value;
  const data={date:document.getElementById("h-date").value,desc,amount,cat:document.getElementById("h-cat").value,cardId:cv||null};
  dEl.value="";aEl.value="";
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
function renderAllExp(){
  const t=T(),fm=S.filterMonth;
  const filtExp=fm?S.expenses.filter(e=>e.date?.startsWith(fm)):S.expenses;
  const total=filtExp.reduce((s,e)=>s+e.amount,0);
  let html=filterBar()+`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px"><div><p class="sec" style="margin-bottom:2px">Gastos (${filtExp.length})</p>${filtExp.length?`<p style="font-size:13px;font-weight:700;color:${t.danger}">Total: ${fmt(total)}</p>`:""}</div><button onclick="openModal('modal-expense');document.getElementById('exp-date').value=today();populateExpCard()" style="background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:9px 18px;color:${t.accent};font-weight:700;font-size:13px">+ Novo Gasto</button></div>`;
  if(!filtExp.length){
    html+=`<div class="crd" style="text-align:center;padding:48px"><p style="font-size:40px;margin-bottom:12px">💸</p><p style="color:${t.muted}">Nenhum gasto registrado.</p></div>`;
  } else {
    html+=`<div class="grid-2">`;
    Object.keys(CATS).forEach(cat=>{
      const items=filtExp.filter(e=>e.cat===cat);if(!items.length)return;
      const catTotal=items.reduce((s,e)=>s+e.amount,0);
      html+=`<div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span style="font-size:14px;font-weight:700">${CATS[cat]} ${cat}</span><span style="font-size:13px;font-weight:700;color:${t.warn}">${fmt(catTotal)}</span></div><div class="crd" style="padding:0 18px">${items.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(e=>{const card=S.cards.find(c=>c.id==e.cardId);const who=window._houseMembers&&e._createdBy&&window._houseMembers[e._createdBy]?`<span class="badge" style="background:${t.warn}18;color:${t.warn}">${(window._houseMembers[e._createdBy]||"").split(" ")[0]}</span>`:"";return`<div class="row"><div style="flex:1;min-width:0"><p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.desc}</p><div style="display:flex;gap:6px;margin-top:2px;align-items:center"><span style="font-size:10px;color:${t.muted}">${fmtD(e.date)}</span>${card?`<span class="badge" style="background:${t.blue}18;color:${t.blue}">${card.name}</span>`:""}${who}</div></div><p style="font-weight:700;color:${t.danger};margin-right:8px;white-space:nowrap">${fmt(e.amount)}</p><button onclick="delExp('${e.id}')" style="background:${t.danger}15;border:none;border-radius:8px;padding:6px 10px;color:${t.danger};font-size:12px;flex-shrink:0">✕</button></div>`;}).join("")}</div></div>`;
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
      let monthsH="";if(!done&&freeNow>0&&rem>0){const m=Math.ceil(rem/freeNow);monthsH=`<p style="font-size:11px;color:${t.blue};margin-top:6px">💡 ~${m} ${m===1?"mês":"meses"} guardando a sobra</p>`;}
      let dlH="";if(g.deadline){const diff=Math.max(0,Math.round((new Date(g.deadline+"-01")-new Date())/(1000*60*60*24*30)));dlH=`<span style="font-size:10px;color:${diff<2?t.danger:t.muted};display:block;margin-top:2px">📅 ${fmtMonth(g.deadline)}${diff===0?" — este mês":diff>0?` — ${diff} meses`:""}</span>`;}
      html+=`<div class="crd" style="${done?`border-color:${t.accent}55`:""}"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px"><div><p style="font-size:38px;margin-bottom:6px">${g.emoji||"🎯"}</p><p style="font-size:16px;font-weight:800">${g.name}</p>${dlH}</div>${done?`<span class="badge" style="background:${t.accent}18;color:${t.accent}">✅ CONCLUÍDA</span>`:""}</div><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px"><span style="color:${t.accent};font-weight:700">${fmt(g.saved)}</span><span style="color:${t.muted}">Meta: ${fmt(g.target)}</span></div><div class="prog-bg" style="height:8px;margin-bottom:8px"><div class="prog-fill" style="width:${pct}%;background:${done?t.accent:`linear-gradient(90deg,${t.blue},${t.accent})`}"></div></div><p style="font-size:13px;font-weight:700">${pct.toFixed(0)}% concluído</p>${monthsH}<div style="display:flex;gap:8px;margin-top:14px"><button onclick="depositGoal('${g.id}')" style="flex:1;background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:9px;color:${t.accent};font-weight:700;font-size:12px">+ Depositar</button><button onclick="openEditGoal('${g.id}')" style="background:${t.blue}15;border:1px solid ${t.blue}33;border-radius:10px;padding:9px 12px;color:${t.blue};font-size:12px;font-weight:700">✏️</button><button onclick="delGoal('${g.id}')" style="background:${t.danger}15;border:none;border-radius:10px;padding:9px 12px;color:${t.danger};font-size:12px">✕</button></div></div>`;
    });
    html+=`</div>`;
  }
  document.getElementById("tab-goals").innerHTML=html;
}

// ── HEALTH ────────────────────────────────────────────────────────────
function renderHealth(){
  const t=T(),fm=S.filterMonth;
  const filtExp=fm?S.expenses.filter(e=>e.date?.startsWith(fm)):S.expenses;
  const iT=S.installments.reduce((s,i)=>s+i.installmentValue,0),eT=filtExp.reduce((s,e)=>s+e.amount,0);
  const totalIncome=S.salary+S.extra,tot=eT+iT,rem=totalIncome-tot;
  const pct=Math.min((tot/(totalIncome||1))*100,100);
  const h=pct<50?{e:"😊",l:"Ótimo!",c:t.accent,m:"Vocês estão economizando bem. Continue assim!"}:pct<75?{e:"😐",l:"Atenção",c:t.warn,m:"Gastos moderados. Fiquem de olho nas parcelas."}:{e:"😰",l:"Crítico",c:t.danger,m:"Gastos muito altos! Revisem urgente o orçamento."};
  let catBars="";
  Object.keys(CATS).forEach(cat=>{const cT=filtExp.filter(e=>e.cat===cat).reduce((s,e)=>s+e.amount,0);if(!cT)return;const cPct=(cT/(tot||1))*100;catBars+=`<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:13px">${CATS[cat]} ${cat}</span><span style="font-size:12px;font-weight:600">${fmt(cT)} <span style="color:${t.muted}">(${cPct.toFixed(0)}%)</span></span></div><div class="prog-bg" style="height:6px"><div class="prog-fill" style="width:${cPct}%;background:${t.accent};opacity:.85"></div></div></div>`;});
  const mTotals={};S.expenses.forEach(e=>{const m=e.date?.slice(0,7);if(m)mTotals[m]=(mTotals[m]||0)+e.amount;});
  const sortedM=Object.entries(mTotals).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,6).reverse();
  const maxV=Math.max(...sortedM.map(x=>x[1]),1);
  let chartH="";if(sortedM.length>1){chartH=`<p class="sec">Gastos por Mês</p><div class="crd" style="padding:20px;margin-bottom:20px"><div style="display:flex;align-items:flex-end;gap:8px;height:100px">${sortedM.map(([m,v])=>{const hh=Math.max((v/maxV)*80,4),act=fm===m;return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer" onclick="setFilter('${m}')"><span style="font-size:9px;color:${t.muted};font-weight:600;text-align:center">${fmt(v).replace("R$","").trim()}</span><div style="width:100%;border-radius:6px 6px 0 0;background:${act?t.accent:t.blue}${act?"":"88"};height:${hh}px"></div><span style="font-size:9px;color:${act?t.accent:t.muted};font-weight:700">${m.slice(5)}</span></div>`;}).join("")}</div>${fm?`<div style="text-align:center;margin-top:10px"><button onclick="setFilter('')" style="background:${t.cardLight};border:1px solid ${t.border};border-radius:8px;padding:5px 14px;color:${t.muted};font-size:12px">✕ Limpar filtro</button></div>`:""}</div>`;}
  document.getElementById("tab-health").innerHTML=`<div class="grid-2" style="align-items:start"><div>${[{l:"Salário",v:fmt(S.salary),c:t.accent},{l:"Extra (Caixa)",v:fmt(S.extra),c:t.blue},{l:"Total em Conta",v:fmt(S.salary+S.extra),c:t.accent},{l:"Gastos Avulsos",v:fmt(eT),c:t.blue},{l:"Parcelas/mês",v:fmt(iT),c:t.warn},{l:"Total Comprometido",v:fmt(tot),c:t.danger},{l:"Dinheiro Livre",v:fmt(rem),c:rem>=0?t.accent:t.danger}].map(s=>`<div class="crd" style="padding:16px 20px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center"><p style="font-size:13px;color:${t.muted}">${s.l}</p><p style="font-size:20px;font-weight:800;color:${s.c}">${s.v}</p></div>`).join("")}</div><div>${chartH}<p class="sec">Gastos por Categoria</p><div class="crd" style="padding:20px;margin-bottom:20px">${catBars||`<p style="color:${t.muted};font-size:13px">Nenhum gasto registrado.</p>`}</div>${S.installments.length?`<p class="sec">Resumo das Dívidas</p>${S.installments.map(i=>{const prog=(i.paidInstallments/i.installments)*100;return`<div class="crd" style="padding:16px 20px;margin-bottom:10px"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><p style="font-size:13px;font-weight:600">${i.desc}</p><p style="font-size:13px;font-weight:700;color:${t.danger}">${fmt((i.installments-i.paidInstallments)*i.installmentValue)} restante</p></div><div class="prog-bg" style="height:5px"><div class="prog-fill" style="width:${prog}%;background:${t.accent}"></div></div><p style="font-size:10px;color:${t.muted};margin-top:5px">${i.paidInstallments} de ${i.installments} parcelas pagas</p></div>`;}).join("")}`:""}${window._houseMembers&&Object.keys(window._houseMembers).length>1?`<p class="sec">Membros da Casa 👫</p><div class="crd" style="padding:16px 20px">${Object.entries(window._houseMembers).map(([uid,name])=>`<div class="row"><div style="width:36px;height:36px;border-radius:50%;background:${t.accent};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#000;flex-shrink:0">${(name||"?")[0].toUpperCase()}</div><p style="font-size:14px;font-weight:600">${name}</p></div>`).join("")}</div>`:""}</div></div>`;
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
      if(el){el.classList.add("dust-out");setTimeout(()=>renderAll(),560);}
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
  document.getElementById("theme-list").innerHTML=Object.entries(THEMES).map(([key,th])=>{const a=key===S.theme;return`<button onclick="setTheme('${key}')" style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;width:100%;border:1px solid ${a?t.accent:t.border};background:${a?t.accent+"18":t.cardLight};cursor:pointer;margin-bottom:8px;text-align:left"><div style="display:flex;gap:4px;flex-shrink:0"><div style="width:22px;height:22px;border-radius:50%;background:${th.bg};border:2px solid ${th.border}"></div><div style="width:22px;height:22px;border-radius:50%;background:${th.card};border:2px solid ${th.border}"></div><div style="width:22px;height:22px;border-radius:50%;background:${th.accent}"></div></div><span style="font-size:22px">${th.icon}</span><span style="font-size:14px;font-weight:700;color:${a?t.accent:t.text};flex:1">${th.name}</span>${a?`<span style="font-size:12px;color:${t.accent};font-weight:700">✓ Ativo</span>`:""}</button>`;}).join("");
  openModal("modal-themes");
}
function setTheme(key){S.theme=key;window.fbSaveTheme(key);closeModal("modal-themes");renderAll();}

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
  let ok=true;
  if(!desc){dEl.classList.add("error");setTimeout(()=>dEl.classList.remove("error"),600);ok=false;}
  if(!total||total<=0){tEl.classList.add("error");setTimeout(()=>tEl.classList.remove("error"),600);ok=false;}
  if(!n||n<1){nEl.classList.add("error");setTimeout(()=>nEl.classList.remove("error"),600);ok=false;}
  if(!ok){toast("Preencha todos os campos!","err");return;}
  const dueDay=parseInt(document.getElementById("inst-due").value)||0;
  const data={desc,cardId:S.selectedInstCard||null,totalAmount:total,installments:n,paidInstallments:0,installmentValue:parseFloat((total/n).toFixed(2)),startMonth:document.getElementById("inst-month").value,dueDay};
  window.fbAdd("installments",data).then(()=>{toast("✅ Parcelamento adicionado!");closeModal("modal-inst");}).catch(e=>toast("Erro: "+e.message,"err"));
}
function openEditInst(id){const i=S.installments.find(x=>x.id===id);if(!i)return;editInstId=id;editInstCard=i.cardId;document.getElementById("edit-inst-desc").value=i.desc;document.getElementById("edit-inst-total").value=i.totalAmount;document.getElementById("edit-inst-n").value=i.installments;document.getElementById("edit-inst-paid").value=i.paidInstallments;document.getElementById("edit-inst-month").value=i.startMonth||curM();document.getElementById("edit-inst-due").value=i.dueDay||"";renderEditInstChips();openModal("modal-edit-inst");}
function renderEditInstChips(){let h=`<button class="chip ${!editInstCard?"active":""}" onclick="selEditInstCard(null)">💵 Sem cartão</button>`;S.cards.forEach(c=>{const a=editInstCard==c.id;h+=`<button class="chip ${a?"active":""}" onclick="selEditInstCard('${c.id}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px"><span>${c.name}</span><span style="font-size:10px;opacity:.65">${fmt(c.limit)} limite</span></button>`;});document.getElementById("edit-inst-card-chips").innerHTML=h;}
function selEditInstCard(id){editInstCard=id;renderEditInstChips();}
function saveEditInst(){
  const i=S.installments.find(x=>x.id===editInstId);if(!i)return;
  const total=parseFloat(document.getElementById("edit-inst-total").value),n=parseInt(document.getElementById("edit-inst-n").value),paid=parseInt(document.getElementById("edit-inst-paid").value);
  const data={desc:document.getElementById("edit-inst-desc").value.trim()||i.desc,cardId:editInstCard||null};
  if(!isNaN(total)&&total>0)data.totalAmount=total;
  if(!isNaN(n)&&n>=1){data.installments=n;data.installmentValue=parseFloat(((data.totalAmount||i.totalAmount)/n).toFixed(2));}
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
  const data={date:document.getElementById("exp-date").value,desc,amount,cat:document.getElementById("exp-cat").value,cardId:cv||null};
  window.fbAdd("expenses",data).then(()=>{toast("✅ Gasto registrado!");closeModal("modal-expense");}).catch(e=>toast("Erro: "+e.message,"err"));
}

// ── GOALS FORMS ───────────────────────────────────────────────────────
let editGoalId=null;
function openAddGoal(){editGoalId=null;S.selectedGoalEmoji="🎯";["goal-name","goal-target","goal-saved","goal-deadline"].forEach(id=>document.getElementById(id).value="");document.getElementById("goal-modal-title").textContent="🎯 Nova Meta";document.getElementById("goal-save-btn").textContent="Adicionar Meta";renderGoalChips();updateGoalPreview();openModal("modal-goal");}
function openEditGoal(id){const g=S.goals.find(x=>x.id===id);if(!g)return;editGoalId=id;S.selectedGoalEmoji=g.emoji||"🎯";document.getElementById("goal-name").value=g.name;document.getElementById("goal-target").value=g.target;document.getElementById("goal-saved").value=g.saved;document.getElementById("goal-deadline").value=g.deadline||"";document.getElementById("goal-modal-title").textContent="✏️ Editar Meta";document.getElementById("goal-save-btn").textContent="Salvar";renderGoalChips();updateGoalPreview();openModal("modal-goal");}
function renderGoalChips(){document.getElementById("goal-emoji-chips").innerHTML=GOAL_EMOJIS.map(e=>`<button class="chip ${e===S.selectedGoalEmoji?"active":""}" onclick="S.selectedGoalEmoji='${e}';renderGoalChips()" style="font-size:18px;padding:6px 10px">${e}</button>`).join("");}
function updateGoalPreview(){const t=T(),target=parseFloat(document.getElementById("goal-target")?.value)||0,saved=parseFloat(document.getElementById("goal-saved")?.value)||0,p=document.getElementById("goal-preview");if(!p)return;if(target>0){p.style.display="block";p.style.background=t.accent+"18";p.style.border=`1px solid ${t.accent}44`;p.innerHTML=`<p style="font-size:13px;color:${t.muted};margin-bottom:4px">Progresso</p><p style="font-size:22px;font-weight:800;color:${t.accent}">${Math.min((saved/target)*100,100).toFixed(0)}%</p><p style="font-size:11px;color:${t.muted};margin-top:4px">Faltam ${fmt(Math.max(0,target-saved))}</p>`;}else p.style.display="none";}
function saveGoal(){
  const nEl=document.getElementById("goal-name"),tEl=document.getElementById("goal-target");
  const name=nEl.value.trim(),target=parseFloat(tEl.value);
  if(!name){nEl.classList.add("error");setTimeout(()=>nEl.classList.remove("error"),600);toast("Informe o nome!","err");return;}
  if(!target||target<=0){tEl.classList.add("error");setTimeout(()=>tEl.classList.remove("error"),600);toast("Informe o valor alvo!","err");return;}
  const saved=parseFloat(document.getElementById("goal-saved").value)||0,deadline=document.getElementById("goal-deadline").value||"";
  const data={name,target,saved,deadline,emoji:S.selectedGoalEmoji};
  if(editGoalId){
    window.fbUpdate("goals",editGoalId,data).then(()=>{toast("✅ Meta atualizada!");closeModal("modal-goal");}).catch(e=>toast("Erro: "+e.message,"err"));
  } else {
    window.fbAdd("goals",data).then(()=>{toast("🎯 Meta criada!");closeModal("modal-goal");}).catch(e=>toast("Erro: "+e.message,"err"));
  }
}
function depositGoal(id){
  const g=S.goals.find(x=>x.id===id);if(!g)return;
  const val=prompt(`💰 Quanto depositar na meta "${g.name}"?\nGuardado atual: ${fmt(g.saved)}`);
  if(!val)return;const amount=parseFloat(val);
  if(isNaN(amount)||amount<=0){toast("Valor inválido","err");return;}
  const newSaved=Math.min(g.saved+amount,g.target);
  window.fbUpdate("goals",id,{saved:newSaved}).then(()=>{
    if(newSaved>=g.target)toast(`🎉 Meta "${g.name}" concluída!`);else toast(`💰 ${fmt(amount)} depositado!`);
  }).catch(e=>toast("Erro: "+e.message,"err"));
}

// ── LAYOUT ────────────────────────────────────────────────────────────
function checkLayout(){
  const mob=window.innerWidth<768;
  const tb=document.getElementById("theme-btn-top");if(tb)tb.style.display=mob?"flex":"none";
}
window.addEventListener("resize",()=>{checkLayout();renderAll();});

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
// Checa backup automático ao entrar no app
window._checkAutoBackupOnLoad = ()=>{
  setTimeout(()=>{
    if(S.expenses.length>0||S.installments.length>0) checkAutoBackup();
  }, 5000);
};

// ── LAYOUT ────────────────────────────────────────────────────────────
function checkLayout(){
  const mob=window.innerWidth<768;
  const tb=document.getElementById("theme-btn-top");if(tb)tb.style.display=mob?"flex":"none";
}
window.addEventListener("resize",()=>{checkLayout();renderAll();});

// Expõe _auth para updateUserBadge
import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js").then(m=>{
  // já inicializado no module acima
}).catch(()=>{});