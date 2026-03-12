/* ═══════════════════════════════════════════════════════════════
   MeuOrçamento — js/ui.js
   Renderização de todos os componentes visuais
   ═══════════════════════════════════════════════════════════════ */

// ── TOAST ─────────────────────────────────────────────────────────────
let _toastT = null;
window.toast = (msg, type = "ok") => {
  const el = document.getElementById("toast");
  if (!el) return;
  clearTimeout(_toastT);
  const t = T();
  el.textContent = msg;
  el.style.display = "block";
  el.style.background = type === "err"  ? t.danger
                      : type === "info" ? t.blue
                      : t.accent;
  el.style.color = (type === "ok" && (S.theme === "light" || S.theme === "rose")) ? "#fff" : "#000";
  if (type === "err" || type === "info") el.style.color = "#fff";
  _toastT = setTimeout(() => { el.style.display = "none"; }, 3000);
};

// ── CONFIRM DIALOG ────────────────────────────────────────────────────
window.confirm2 = (opts) => {
  const t = T();
  document.getElementById("confirm-emoji").textContent   = opts.emoji || "⚠️";
  document.getElementById("confirm-title").textContent   = opts.title || "Tem certeza?";
  document.getElementById("confirm-msg").textContent     = opts.msg   || "";
  document.getElementById("confirm-cancel-btn").textContent = opts.cancelLabel || "Cancelar";
  const okBtn = document.getElementById("confirm-ok-btn");
  okBtn.textContent   = opts.okLabel || "Confirmar";
  okBtn.style.background = opts.danger ? t.danger : t.accent;
  okBtn.onclick = () => { closeModal("modal-confirm"); opts.ok?.(); };
  openModal("modal-confirm");
};

// ── CARD HTML ─────────────────────────────────────────────────────────
window.cardHTML = (card, small) => {
  const b = BRANDS[card?.brand] || BRANDS["Visa"];
  const bg = b.gradient || b.color;
  const sz = small ? "60px" : "100%";
  const h  = small ? "38px" : "56px";
  return `<div style="background:${bg};border-radius:${small?"10px":"14px"};padding:${small?"8px 12px":"14px 18px"};width:${sz};height:${h};display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
    <span style="font-size:${small?"10px":"13px"};font-weight:800;color:${b.text};letter-spacing:.5px">${b.label}</span>
    <span style="font-size:${small?"8px":"11px"};color:${b.text}88;font-weight:700">${card.name || ""}</span>
  </div>`;
};

// ── APPLY THEME ───────────────────────────────────────────────────────
window.applyTheme = () => {
  const t = T();
  const light = S.theme === "light" || S.theme === "rose";
  document.body.style.background = t.bg;
  document.body.style.color      = t.text;

  const sb = document.getElementById("sidebar");
  if (sb) sb.style.cssText = `background:${t.sidebar};border-color:${t.border}`;

  const bn = document.getElementById("bottom-nav");
  if (bn) bn.style.cssText = `background:${t.navBg};border-top-color:${t.border}`;

  const ti = document.getElementById("theme-icon-side");
  if (ti) ti.textContent = t.icon;

  const tb = document.getElementById("theme-btn-top");
  if (tb) {
    tb.style.background = t.cardLight;
    tb.style.border     = `1px solid ${t.border}`;
    tb.style.color      = t.muted;
    tb.textContent      = t.icon + " Tema";
  }

  // Estilos dinâmicos via CSS
  let st = document.getElementById("dyn-style") || document.createElement("style");
  st.id = "dyn-style";
  st.textContent = `
    :root { --accent: ${t.accent}; }
    ::-webkit-scrollbar-thumb { background:${t.border}; }
    .crd  { background:${t.card};      border-color:${t.border}; }
    .inp  { background:${t.cardLight}; border-color:${t.border}; color:${t.text}; }
    .inp:focus { border-color:${t.accent}; }
    .inp.error { border-color:${t.danger}!important; }
    .chip { background:${t.cardLight}; border-color:${t.border}; color:${t.muted}; }
    .chip.active { background:${t.accent}18; border-color:${t.accent}; color:${t.accent}; }
    .side-btn { color:${t.muted}; }
    .side-btn:hover  { background:${t.accent}12; color:${t.accent}; }
    .side-btn.active { background:${t.accent}18; color:${t.accent}; }
    .tab-btn { color:${t.muted}; }
    .tab-btn.active { color:${t.accent}; }
    .row   { border-color:${t.border}44; }
    .btn-sm{ background:${t.cardLight}; border:1px solid ${t.border}; color:${t.muted}; }
    .btn-p { background:${t.accent}; color:${light ? "#fff" : "#000"}; }
    .modal-box { background:${t.card}; border-color:${t.border}; }
    .sec  { color:${t.muted}; }
    .prog-bg { background:${t.cardLight}; }
    #login-screen  { background:${t.bg}; }
    #loading-screen{ background:${t.bg}; }
  `;
  document.head.appendChild(st);

  const sd = document.getElementById("sync-dot");
  if (sd) sd.style.background = t.accent;
};

// ── RENDER ALL ────────────────────────────────────────────────────────
window.renderAll = () => {
  applyTheme();
  renderSalarySidebar();
  renderSalaryTopbar();
  renderStatus();
  renderTab(S.currentTab);
  updateUserBadge();
};

// ── SALARY SIDEBAR ────────────────────────────────────────────────────
window.renderSalarySidebar = () => {
  const t = T(), total = S.salary + S.extra;
  const el = document.getElementById("salary-sidebar");
  if (!el) return;
  el.innerHTML = `
    <div style="padding:10px 14px;border-radius:14px;border:1px solid ${t.border};background:${t.cardLight}">
      <button onclick="openSalaryModal()" style="display:block;width:100%;background:none;border:none;text-align:left;padding:0;cursor:pointer">
        <p style="font-size:10px;color:${t.muted};margin-bottom:2px">Salário</p>
        <p style="color:${t.accent};font-size:14px;font-weight:800;margin-bottom:6px">${fmt(S.salary)} ✎</p>
        <p style="font-size:10px;color:${t.muted};margin-bottom:2px">Extra</p>
        <p style="color:${t.blue};font-size:14px;font-weight:800;margin-bottom:6px">${fmt(S.extra)} ✎</p>
        <div style="border-top:1px solid ${t.border};padding-top:6px">
          <p style="font-size:10px;color:${t.muted};margin-bottom:2px">Total em conta</p>
          <p style="color:${t.accent};font-size:16px;font-weight:800">${fmt(total)}</p>
        </div>
      </button>
    </div>`;
};

// ── SALARY TOPBAR ─────────────────────────────────────────────────────
window.renderSalaryTopbar = () => {
  const t = T(), total = S.salary + S.extra;
  const el = document.getElementById("salary-topbar");
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;justify-content:flex-end">
      <div style="text-align:right">
        <p style="font-size:10px;color:${t.muted};margin-bottom:2px">Salário</p>
        <button onclick="openSalaryModal()" style="background:none;border:none;color:${t.accent};font-size:16px;font-weight:800;padding:0">${fmt(S.salary)} ✎</button>
      </div>
      <div style="text-align:right">
        <p style="font-size:10px;color:${t.muted};margin-bottom:2px">Extra</p>
        <button onclick="openSalaryModal()" style="background:none;border:none;color:${t.blue};font-size:16px;font-weight:800;padding:0">${fmt(S.extra)} ✎</button>
      </div>
      <div style="text-align:right;padding-left:12px;border-left:1px solid ${t.border}">
        <p style="font-size:10px;color:${t.muted};margin-bottom:2px">Total</p>
        <button onclick="openSalaryModal()" style="background:none;border:none;color:${t.accent};font-size:18px;font-weight:800;padding:0">${fmt(total)}</button>
      </div>
    </div>`;
};

// ── STATUS CARD ───────────────────────────────────────────────────────
window.renderStatus = () => {
  const t = T(), cm = curM();
  const thisMonthExp  = S.expenses.filter(e => e.date?.startsWith(cm));
  const thisMonthInst = S.installments.filter(i => {
    if (i.paidInstallments >= i.installments) return false;
    return !i.startMonth || i.startMonth <= cm;
  });
  const iT = thisMonthInst.reduce((s, i) => s + i.installmentValue, 0);
  const eT = thisMonthExp.reduce((s, e) => s + e.amount, 0);
  const totalIncome = S.salary + S.extra;
  const tot = eT + iT, rem = totalIncome - tot;
  const pct = Math.min((tot / (totalIncome || 1)) * 100, 100);
  const h = pct < 50 ? { l:"Ótimo!",  c:t.accent }
          : pct < 75 ? { l:"Atenção", c:t.warn   }
                     : { l:"Crítico", c:t.danger  };
  const sc = document.getElementById("status-card");
  if (!sc) return;
  sc.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-bottom:20px">
      <div>
        <p style="font-size:11px;color:${t.muted};margin-bottom:4px">
          Total Comprometido
          <span style="color:${t.blue};margin-left:6px">${fmtMonth(cm)}</span>
        </p>
        <p style="font-size:28px;font-weight:800;color:${t.danger}">${fmt(tot)}</p>
        <p style="font-size:11px;color:${t.muted};margin-top:4px">
          <span style="color:${t.warn}">Parcelas: ${fmt(iT)}</span>
          &nbsp;·&nbsp;
          <span style="color:${t.blue}">Avulsos: ${fmt(eT)}</span>
        </p>
      </div>
      <div>
        <p style="font-size:11px;color:${t.muted};margin-bottom:4px">Disponível Livre</p>
        <p style="font-size:28px;font-weight:800;color:${rem >= 0 ? t.accent : t.danger}">${fmt(rem)}</p>
      </div>
      <div style="display:flex;flex-direction:column;justify-content:center;gap:8px">
        <div style="display:flex;justify-content:space-between;font-size:12px">
          <span style="color:${t.muted}">${pct.toFixed(1)}% do salário</span>
          <span style="font-weight:800;color:${h.c}">${h.l}</span>
        </div>
        <div class="prog-bg" style="height:18px;border-radius:99px">
          <div class="prog-fill" style="height:18px;width:${pct}%;background:linear-gradient(90deg,${t.accent},${pct > 75 ? t.danger : t.warn});border-radius:99px;transition:width .6s"></div>
        </div>
        <p style="font-size:10px;color:${t.muted};text-align:right">${fmt(tot)} de ${fmt(totalIncome)}</p>
      </div>
    </div>`;
};

// ── TABS ──────────────────────────────────────────────────────────────
window.setTab = (tab) => {
  ["home","cards","all","goals","health"].forEach(id => {
    document.getElementById("tab-" + id).style.display = id === tab ? "block" : "none";
    document.getElementById("side-" + id)?.classList.toggle("active", id === tab);
    document.getElementById("nav-"  + id)?.classList.toggle("active", id === tab);
  });
  document.getElementById("topbar-title").textContent = TAB_LABELS[tab] || tab;
  S.currentTab = tab;
  renderTab(tab);
};

window.renderTab = (tab) => {
  if      (tab === "home")   renderHome();
  else if (tab === "cards")  renderCards();
  else if (tab === "all")    renderAllExp();
  else if (tab === "goals")  renderGoals();
  else if (tab === "health") renderHealth();
};

// ── FILTER BAR ────────────────────────────────────────────────────────
function filterBar() {
  const t = T(), fm = S.filterMonth;
  const months = [...new Set(S.expenses.map(e => e.date?.slice(0, 7)).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  return `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:20px">
    <span style="font-size:11px;color:${t.muted};letter-spacing:1px;text-transform:uppercase;font-weight:700;flex-shrink:0">Filtrar:</span>
    <button class="chip ${!fm ? "active" : ""}" onclick="setFilter('')">Tudo</button>
    ${months.slice(0, 7).map(m => `<button class="chip ${fm === m ? "active" : ""}" onclick="setFilter('${m}')">${fmtMonth(m)}</button>`).join("")}
  </div>`;
}
window.setFilter = (m) => { S.filterMonth = m; renderAll(); };

// ── HOME ──────────────────────────────────────────────────────────────
window.renderHome = () => {
  const t = T(), fm = S.filterMonth, cm = curM();
  const filtExp = fm ? S.expenses.filter(e => e.date?.startsWith(fm)) : S.expenses;
  const map = {};
  filtExp.forEach(e => { map[e.date] = (map[e.date] || 0) + e.amount; });
  const days = Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  const active = S.installments.filter(i => i.paidInstallments < i.installments);

  // Parcelas: mês atual vs futuras
  const thisMonthInst = active.filter(i => !i.startMonth || i.startMonth <= cm);
  const futureInst    = active.filter(i => i.startMonth && i.startMonth > cm);
  const thisMonthInstTotal = thisMonthInst.reduce((s, i) => s + i.installmentValue, 0);

  // Dias card
  let daysH = `<p class="sec">Gastos por Dia</p><div class="scroll-x" style="margin-bottom:28px">`;
  if (!days.length) daysH += `<p style="color:${t.muted};font-size:13px;padding:10px 0">Nenhum gasto ainda.</p>`;
  days.forEach(([d, total]) => {
    const isT = d === today();
    daysH += `<div style="min-width:110px;scroll-snap-align:start;flex-shrink:0;background:${isT ? t.accent + "18" : t.card};border:1px solid ${isT ? t.accent + "66" : t.border};border-radius:16px;padding:14px">
      <p style="font-size:10px;color:${isT ? t.accent : t.muted};margin-bottom:6px;font-weight:700">${isT ? "HOJE" : fmtD(d).toUpperCase()}</p>
      <p style="font-size:18px;font-weight:800">${fmt(total)}</p>
      <p style="font-size:10px;color:${t.muted};margin-top:4px">${filtExp.filter(e => e.date === d).length} item(s)</p>
    </div>`;
  });
  daysH += `</div>`;

  // Parcelas
  let instH = "";
  if (thisMonthInst.length || futureInst.length) {
    instH = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <p class="sec" style="margin-bottom:0">Parcelas do Mês</p>
      <span style="font-size:14px;font-weight:700;color:${t.warn}">${fmt(thisMonthInstTotal)}</span>
    </div><div class="scroll-x" style="margin-bottom:28px">`;

    thisMonthInst.forEach(i => {
      const card   = S.cards.find(c => c.id == i.cardId);
      const prog   = (i.paidInstallments / i.installments) * 100;
      const dueDay = i.dueDay || 0;
      const overdue = dueDay > 0 && new Date().getDate() > dueDay;
      instH += `<div id="inst-h-${i.id}" class="${overdue ? "overdue-pulse" : ""}" style="min-width:200px;scroll-snap-align:start;flex-shrink:0;background:${t.card};border:1px solid ${overdue ? t.danger : t.border};border-radius:18px;padding:18px">
        ${card ? `<div style="margin-bottom:12px">${cardHTML(card, true)}</div>` : ""}
        <p style="font-size:14px;font-weight:700;margin-bottom:4px">
          ${i.desc}
          ${overdue ? `<span style="font-size:10px;background:${t.danger}22;color:${t.danger};padding:2px 6px;border-radius:6px;font-weight:700;margin-left:4px">ATRASADA</span>` : ""}
        </p>
        <p style="font-size:20px;font-weight:800;color:${overdue ? t.danger : t.warn}">${fmt(i.installmentValue)}<span style="font-size:12px;color:${t.muted}">/mês</span></p>
        ${dueDay ? `<p style="font-size:10px;color:${overdue ? t.danger : t.muted};margin-top:4px">Vence dia ${dueDay}</p>` : ""}
        <p style="font-size:10px;color:${t.muted};margin:6px 0 10px">${i.paidInstallments}/${i.installments} pagas · ${fmt((i.installments - i.paidInstallments) * i.installmentValue)} restante</p>
        <div class="prog-bg" style="height:4px;margin-bottom:12px">
          <div class="prog-fill" style="width:${prog}%;background:${overdue ? t.danger : t.accent}"></div>
        </div>
        <button onclick="payInst('${i.id}','h')" style="background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:8px;color:${t.accent};font-size:11px;font-weight:700;width:100%">✓ Marcar parcela paga</button>
      </div>`;
    });

    // Futuras
    futureInst.forEach(i => {
      instH += `<div style="min-width:180px;scroll-snap-align:start;flex-shrink:0;background:${t.cardLight};border:1px solid ${t.border}66;border-radius:18px;padding:18px;opacity:.6">
        <p style="font-size:10px;color:${t.blue};font-weight:700;margin-bottom:8px">📅 A PARTIR DE ${fmtMonth(i.startMonth).toUpperCase()}</p>
        <p style="font-size:14px;font-weight:700;margin-bottom:4px">${i.desc}</p>
        <p style="font-size:18px;font-weight:800;color:${t.muted}">${fmt(i.installmentValue)}<span style="font-size:11px">/mês</span></p>
      </div>`;
    });
    instH += `</div>`;
  }

  // Recentes
  const recentH = filtExp.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map(e => {
    const card = S.cards.find(c => c.id == e.cardId);
    const who  = e._createdByName ? `<span class="badge" style="background:${t.warn}18;color:${t.warn}">${e._createdByName.split(" ")[0]}</span>` : "";
    return `<div class="row">
      <div style="width:40px;height:40px;background:${t.cardLight};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${CATS[e.cat] || "💸"}</div>
      <div style="flex:1;min-width:0">
        <p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.desc}</p>
        <div style="display:flex;gap:6px;align-items:center;margin-top:2px">
          <span style="font-size:10px;color:${t.muted}">${fmtD(e.date)}</span>
          ${card ? `<span class="badge" style="background:${t.blue}18;color:${t.blue}">${card.name}</span>` : ""}
          ${who}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <p style="font-weight:700;color:${t.danger};font-size:14px;white-space:nowrap">${fmt(e.amount)}</p>
        <button onclick="delExp('${e.id}')" style="background:${t.danger}15;border:none;border-radius:8px;padding:5px 8px;color:${t.danger};font-size:11px;flex-shrink:0">✕</button>
      </div>
    </div>`;
  }).join("");

  document.getElementById("tab-home").innerHTML = `
    ${filterBar()}
    ${daysH}
    ${instH}
    <div class="grid-2" style="align-items:start">
      <div>
        <p class="sec">Registrar Gasto</p>
        <div class="crd">
          <div class="grid-2 keep-2" style="gap:10px;margin-bottom:10px">
            <input class="inp" type="date" id="h-date" value="${today()}"/>
            <select class="inp" id="h-cat">${Object.keys(CATS).map(c => `<option>${c}</option>`).join("")}</select>
          </div>
          <input class="inp" id="h-desc" placeholder="Descrição (ex: Mercado)" style="margin-bottom:10px"/>
          <div class="grid-2 keep-2" style="gap:10px;margin-bottom:14px">
            <input class="inp" type="number" id="h-amount" placeholder="Valor (R$)" step="0.01"/>
            <select class="inp" id="h-card">
              <option value="">💵 Dinheiro</option>
              ${S.cards.map(c => `<option value="${c.id}">${c.name}</option>`).join("")}
            </select>
          </div>
          <button class="btn-p" onclick="saveHomeExp()">+ Registrar Gasto</button>
        </div>
      </div>
      <div>
        <p class="sec">Recentes</p>
        <div class="crd" style="padding:0 20px">
          ${!filtExp.length ? `<p style="padding:20px 0;color:${t.muted};font-size:13px">Nenhum gasto ainda.</p>` : recentH}
        </div>
      </div>
    </div>`;
};

// ── RENDER CARDS ──────────────────────────────────────────────────────
window.renderCards = () => {
  const t = T();
  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <p class="sec" style="margin-bottom:0">Meus Cartões (${S.cards.length})</p>
      <button onclick="openAddCard()" style="background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:9px 18px;color:${t.accent};font-weight:700;font-size:13px">+ Novo Cartão</button>
    </div>`;

  if (!S.cards.length) {
    html += `<div class="crd" style="text-align:center;padding:60px">
      <p style="font-size:52px;margin-bottom:14px">💳</p>
      <p style="font-size:16px;font-weight:700;margin-bottom:8px">Nenhum cartão ainda</p>
      <p style="font-size:13px;color:${t.muted}">Adicione seus cartões para organizar seus gastos.</p>
    </div>`;
  } else {
    html += `<div class="grid-3">`;
    S.cards.forEach(c => {
      const instTotal = S.installments.filter(i => i.cardId == c.id && i.paidInstallments < i.installments)
                                       .reduce((s, i) => s + i.installmentValue, 0);
      const usedPct   = Math.min((instTotal / (c.limit || 1)) * 100, 100);
      html += `<div class="crd">
        <div style="margin-bottom:16px">${cardHTML(c, false)}</div>
        <p style="font-size:18px;font-weight:800;margin-bottom:4px">${c.name}</p>
        <p style="font-size:12px;color:${t.muted};margin-bottom:12px">${BRANDS[c.brand]?.label || c.brand} · Vence dia ${c.due || "-"}</p>
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
          <span style="color:${t.muted}">Parcelas: ${fmt(instTotal)}</span>
          <span style="color:${t.muted}">Limite: ${fmt(c.limit)}</span>
        </div>
        <div class="prog-bg" style="height:5px;margin-bottom:14px">
          <div class="prog-fill" style="width:${usedPct}%;background:${usedPct > 80 ? t.danger : t.accent}"></div>
        </div>
        <div style="display:flex;gap:8px">
          <button onclick="openEditCard('${c.id}')" style="flex:1;background:${t.blue}15;border:1px solid ${t.blue}33;border-radius:10px;padding:9px;color:${t.blue};font-size:12px;font-weight:700">✏️ Editar</button>
          <button onclick="openAddInst('${c.id}')" style="flex:1;background:${t.warn}15;border:1px solid ${t.warn}33;border-radius:10px;padding:9px;color:${t.warn};font-size:12px;font-weight:700">+ Parcela</button>
          <button onclick="delCard('${c.id}')" style="background:${t.danger}15;border:none;border-radius:10px;padding:9px 12px;color:${t.danger};font-size:12px">✕</button>
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  // Parcelamentos ativos
  const active = S.installments.filter(i => i.paidInstallments < i.installments);
  if (active.length) {
    html += `<p class="sec" style="margin-top:28px">Parcelamentos Ativos (${active.length})</p>
      <div class="grid-2">`;
    active.forEach(i => {
      const card  = S.cards.find(c => c.id == i.cardId);
      const prog  = (i.paidInstallments / i.installments) * 100;
      const dueDay= i.dueDay || 0;
      const overdue = dueDay > 0 && new Date().getDate() > dueDay && (!i.startMonth || i.startMonth <= curM());
      html += `<div id="inst-${i.id}" class="${overdue ? "overdue-pulse" : ""} crd" style="border-color:${overdue ? t.danger : t.border}">
        ${card ? `<div style="margin-bottom:12px">${cardHTML(card, true)}</div>` : ""}
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div>
            <p style="font-size:14px;font-weight:700">${i.desc} ${overdue ? `<span style="font-size:10px;background:${t.danger}22;color:${t.danger};padding:2px 5px;border-radius:5px">ATRASADA</span>` : ""}</p>
            ${dueDay ? `<p style="font-size:11px;color:${overdue ? t.danger : t.muted}">Vence dia ${dueDay}</p>` : ""}
          </div>
          <div style="display:flex;gap:6px">
            <button onclick="openEditInst('${i.id}')" style="background:${t.blue}15;border:1px solid ${t.blue}33;border-radius:8px;padding:5px 10px;color:${t.blue};font-size:11px;font-weight:700">✏️</button>
            <button onclick="delInst('${i.id}')" style="background:${t.danger}15;border:none;border-radius:8px;padding:5px 9px;color:${t.danger};font-size:11px">✕</button>
          </div>
        </div>
        <p style="font-size:22px;font-weight:800;color:${t.warn}">${fmt(i.installmentValue)}<span style="font-size:12px;color:${t.muted}">/mês</span></p>
        <p style="font-size:11px;color:${t.muted};margin:6px 0 10px">${i.paidInstallments}/${i.installments} pagas · ${fmt((i.installments - i.paidInstallments) * i.installmentValue)} restante</p>
        <div class="prog-bg" style="height:5px;margin-bottom:12px">
          <div class="prog-fill" style="width:${prog}%;background:${overdue ? t.danger : t.accent}"></div>
        </div>
        <button onclick="payInst('${i.id}','c')" style="background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:8px;color:${t.accent};font-size:12px;font-weight:700;width:100%">✓ Pagar parcela</button>
      </div>`;
    });
    html += `</div>`;
  }
  // Botão nova dívida
  html += `<div style="margin-top:24px">
    <button onclick="openAddInst()" style="background:${t.warn}18;border:1px solid ${t.warn}44;border-radius:12px;padding:13px 24px;color:${t.warn};font-size:14px;font-weight:700;width:100%">+ Nova Dívida / Parcelamento</button>
  </div>`;

  document.getElementById("tab-cards").innerHTML = html;
};

// ── RENDER ALL EXPENSES ───────────────────────────────────────────────
window.renderAllExp = () => {
  const t = T(), fm = S.filterMonth;
  const filtExp = fm ? S.expenses.filter(e => e.date?.startsWith(fm)) : S.expenses;
  let html = filterBar();

  if (!filtExp.length) {
    html += `<div class="crd" style="text-align:center;padding:60px">
      <p style="font-size:48px;margin-bottom:14px">📋</p>
      <p style="font-size:16px;font-weight:700;margin-bottom:8px">Nenhum gasto registrado</p>
      <p style="font-size:13px;color:${t.muted}">Comece registrando gastos na aba Início.</p>
    </div>`;
  } else {
    const total = filtExp.reduce((s, e) => s + e.amount, 0);
    html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <p style="font-size:13px;color:${t.muted}">${filtExp.length} gasto(s)</p>
      <p style="font-size:18px;font-weight:800;color:${t.danger}">${fmt(total)}</p>
    </div><div>`;
    Object.keys(CATS).forEach(cat => {
      const items = filtExp.filter(e => e.cat === cat);
      if (!items.length) return;
      const catTotal = items.reduce((s, e) => s + e.amount, 0);
      html += `<div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <span style="font-size:14px;font-weight:700">${CATS[cat]} ${cat}</span>
          <span style="font-size:13px;font-weight:700;color:${t.warn}">${fmt(catTotal)}</span>
        </div>
        <div class="crd" style="padding:0 18px">
          ${items.slice().sort((a, b) => b.date.localeCompare(a.date)).map(e => {
            const card = S.cards.find(c => c.id == e.cardId);
            const who  = e._createdByName ? `<span class="badge" style="background:${t.warn}18;color:${t.warn}">${e._createdByName.split(" ")[0]}</span>` : "";
            return `<div class="row">
              <div style="flex:1;min-width:0">
                <p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.desc}</p>
                <div style="display:flex;gap:6px;margin-top:2px;align-items:center">
                  <span style="font-size:10px;color:${t.muted}">${fmtD(e.date)}</span>
                  ${card ? `<span class="badge" style="background:${t.blue}18;color:${t.blue}">${card.name}</span>` : ""}
                  ${who}
                </div>
              </div>
              <p style="font-weight:700;color:${t.danger};margin-right:8px;white-space:nowrap">${fmt(e.amount)}</p>
              <button onclick="delExp('${e.id}')" style="background:${t.danger}15;border:none;border-radius:8px;padding:6px 10px;color:${t.danger};font-size:12px;flex-shrink:0">✕</button>
            </div>`;
          }).join("")}
        </div>
      </div>`;
    });
    html += `</div>`;
  }
  document.getElementById("tab-all").innerHTML = html;
};

// ── RENDER GOALS ──────────────────────────────────────────────────────
window.renderGoals = () => {
  const t = T();
  const freeNow = S.salary + S.extra
    - S.installments.reduce((s, i) => s + i.installmentValue, 0)
    - S.expenses.reduce((s, e) => s + e.amount, 0);
  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <p class="sec" style="margin-bottom:0">Metas de Poupança (${S.goals.length})</p>
      <button onclick="openAddGoal()" style="background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:9px 18px;color:${t.accent};font-weight:700;font-size:13px">+ Nova Meta</button>
    </div>`;
  if (!S.goals.length) {
    html += `<div class="crd" style="text-align:center;padding:60px">
      <p style="font-size:52px;margin-bottom:14px">🎯</p>
      <p style="font-size:16px;font-weight:700;margin-bottom:8px">Nenhuma meta ainda</p>
      <p style="font-size:13px;color:${t.muted}">Defina objetivos de poupança e acompanhe o progresso do casal.</p>
    </div>`;
  } else {
    html += `<div class="grid-3">`;
    S.goals.forEach(g => {
      const pct  = Math.min((g.saved / (g.target || 1)) * 100, 100);
      const rem  = g.target - g.saved;
      const done = g.saved >= g.target;
      let monthsH = "";
      if (!done && freeNow > 0 && rem > 0) {
        const m = Math.ceil(rem / freeNow);
        monthsH = `<p style="font-size:11px;color:${t.blue};margin-top:6px">💡 ~${m} ${m === 1 ? "mês" : "meses"} guardando a sobra</p>`;
      }
      let dlH = "";
      if (g.deadline) {
        const diff = Math.max(0, Math.round((new Date(g.deadline + "-01") - new Date()) / (1000 * 60 * 60 * 24 * 30)));
        dlH = `<span style="font-size:10px;color:${diff < 2 ? t.danger : t.muted};display:block;margin-top:2px">📅 ${fmtMonth(g.deadline)}${diff === 0 ? " — este mês" : diff > 0 ? ` — ${diff} meses` : ""}</span>`;
      }
      html += `<div class="crd" style="${done ? `border-color:${t.accent}55` : ""}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
          <div>
            <p style="font-size:38px;margin-bottom:6px">${g.emoji || "🎯"}</p>
            <p style="font-size:16px;font-weight:800">${g.name}</p>
            ${dlH}
          </div>
          ${done ? `<span class="badge" style="background:${t.accent}18;color:${t.accent}">✅ CONCLUÍDA</span>` : ""}
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px">
          <span style="color:${t.accent};font-weight:700">${fmt(g.saved)}</span>
          <span style="color:${t.muted}">Meta: ${fmt(g.target)}</span>
        </div>
        <div class="prog-bg" style="height:8px;margin-bottom:8px">
          <div class="prog-fill" style="width:${pct}%;background:${done ? t.accent : `linear-gradient(90deg,${t.blue},${t.accent})`}"></div>
        </div>
        <p style="font-size:13px;font-weight:700">${pct.toFixed(0)}% concluído</p>
        ${monthsH}
        <div style="display:flex;gap:8px;margin-top:14px">
          <button onclick="depositGoal('${g.id}')" style="flex:1;background:${t.accent}18;border:1px solid ${t.accent}44;border-radius:10px;padding:9px;color:${t.accent};font-weight:700;font-size:12px">+ Depositar</button>
          <button onclick="openEditGoal('${g.id}')" style="background:${t.blue}15;border:1px solid ${t.blue}33;border-radius:10px;padding:9px 12px;color:${t.blue};font-size:12px;font-weight:700">✏️</button>
          <button onclick="delGoal('${g.id}')" style="background:${t.danger}15;border:none;border-radius:10px;padding:9px 12px;color:${t.danger};font-size:12px">✕</button>
        </div>
      </div>`;
    });
    html += `</div>`;
  }
  document.getElementById("tab-goals").innerHTML = html;
};

// ── RENDER HEALTH ─────────────────────────────────────────────────────
window.renderHealth = () => {
  const t = T(), fm = S.filterMonth, cm = curM();
  const filtExp   = fm ? S.expenses.filter(e => e.date?.startsWith(fm)) : S.expenses;
  const thisMonthInst = S.installments.filter(i => !i.startMonth || i.startMonth <= cm);
  const iT = thisMonthInst.reduce((s, i) => s + i.installmentValue, 0);
  const eT = filtExp.reduce((s, e) => s + e.amount, 0);
  const totalIncome = S.salary + S.extra, tot = eT + iT, rem = totalIncome - tot;
  const pct = Math.min((tot / (totalIncome || 1)) * 100, 100);
  const h = pct < 50
    ? { l:"Ótimo!",  c:t.accent, m:"Vocês estão economizando bem. Continue assim!" }
    : pct < 75
    ? { l:"Atenção", c:t.warn,   m:"Gastos moderados. Fiquem de olho nas parcelas." }
    : { l:"Crítico", c:t.danger, m:"Gastos muito altos! Revisem urgente o orçamento." };

  // Barras por categoria
  let catBars = "";
  Object.keys(CATS).forEach(cat => {
    const cT = filtExp.filter(e => e.cat === cat).reduce((s, e) => s + e.amount, 0);
    if (!cT) return;
    const cPct = (cT / (tot || 1)) * 100;
    catBars += `<div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <span style="font-size:13px">${CATS[cat]} ${cat}</span>
        <span style="font-size:12px;font-weight:600">${fmt(cT)} <span style="color:${t.muted}">(${cPct.toFixed(0)}%)</span></span>
      </div>
      <div class="prog-bg" style="height:6px">
        <div class="prog-fill" style="width:${cPct}%;background:${t.accent};opacity:.85"></div>
      </div>
    </div>`;
  });

  // Gráfico mensal
  const mTotals = {};
  S.expenses.forEach(e => {
    const m = e.date?.slice(0, 7);
    if (m) mTotals[m] = (mTotals[m] || 0) + e.amount;
  });
  const sortedM = Object.entries(mTotals).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6).reverse();
  const maxV = Math.max(...sortedM.map(x => x[1]), 1);
  let chartH = "";
  if (sortedM.length > 1) {
    chartH = `<p class="sec">Gastos por Mês</p>
      <div class="crd" style="padding:20px;margin-bottom:20px">
        <div style="display:flex;align-items:flex-end;gap:8px;height:100px">
          ${sortedM.map(([m, v]) => {
            const hh  = Math.max((v / maxV) * 80, 4);
            const act = fm === m;
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer" onclick="setFilter('${m}')">
              <span style="font-size:9px;color:${t.muted};font-weight:600;text-align:center">${fmt(v).replace("R$", "").trim()}</span>
              <div style="width:100%;border-radius:6px 6px 0 0;background:${act ? t.accent : t.blue}${act ? "" : "88"};height:${hh}px"></div>
              <span style="font-size:9px;color:${act ? t.accent : t.muted};font-weight:700">${m.slice(5)}</span>
            </div>`;
          }).join("")}
        </div>
        ${fm ? `<div style="text-align:center;margin-top:10px"><button onclick="setFilter('')" style="background:${t.cardLight};border:1px solid ${t.border};border-radius:8px;padding:5px 14px;color:${t.muted};font-size:12px">✕ Limpar filtro</button></div>` : ""}
      </div>`;
  }

  // Resumo saúde
  const summaryItems = [
    { l:"Salário",           v: fmt(S.salary),          c: t.accent },
    { l:"Extra (Caixa)",     v: fmt(S.extra),            c: t.blue   },
    { l:"Total em Conta",    v: fmt(S.salary + S.extra), c: t.accent },
    { l:"Gastos Avulsos",    v: fmt(eT),                 c: t.blue   },
    { l:"Parcelas/mês",      v: fmt(iT),                 c: t.warn   },
    { l:"Total Comprometido",v: fmt(tot),                c: t.danger },
    { l:"Dinheiro Livre",    v: fmt(rem),                c: rem >= 0 ? t.accent : t.danger },
  ];

  // Badge de status visual
  const statusColor = h.c;
  document.getElementById("tab-health").innerHTML = `
    <div class="grid-2" style="align-items:start">
      <div>
        <!-- Status resumido -->
        <div class="crd" style="padding:20px;margin-bottom:16px;border-color:${statusColor}44;display:flex;align-items:center;gap:16px">
          <div style="flex:1">
            <p style="font-size:11px;color:${t.muted};margin-bottom:4px;letter-spacing:1px;text-transform:uppercase">Status do Mês</p>
            <p style="font-size:24px;font-weight:800;color:${statusColor}">${h.l}</p>
            <p style="font-size:12px;color:${t.muted};margin-top:4px">${h.m}</p>
          </div>
          <div style="text-align:right">
            <p style="font-size:11px;color:${t.muted}">Comprometido</p>
            <p style="font-size:20px;font-weight:800;color:${statusColor}">${pct.toFixed(0)}%</p>
          </div>
        </div>
        ${summaryItems.map(s => `
          <div class="crd" style="padding:14px 20px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
            <p style="font-size:13px;color:${t.muted}">${s.l}</p>
            <p style="font-size:18px;font-weight:800;color:${s.c}">${s.v}</p>
          </div>`).join("")}
      </div>
      <div>
        ${chartH}
        <p class="sec">Gastos por Categoria</p>
        <div class="crd" style="padding:20px;margin-bottom:20px">
          ${catBars || `<p style="color:${t.muted};font-size:13px">Nenhum gasto registrado.</p>`}
        </div>
        ${S.installments.length ? `
          <p class="sec">Resumo das Dívidas</p>
          ${S.installments.map(i => {
            const prog = (i.paidInstallments / i.installments) * 100;
            return `<div class="crd" style="padding:16px 20px;margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <p style="font-size:13px;font-weight:600">${i.desc}</p>
                <p style="font-size:13px;font-weight:700;color:${t.danger}">${fmt((i.installments - i.paidInstallments) * i.installmentValue)} restante</p>
              </div>
              <div class="prog-bg" style="height:5px">
                <div class="prog-fill" style="width:${prog}%;background:${t.accent}"></div>
              </div>
              <p style="font-size:10px;color:${t.muted};margin-top:5px">${i.paidInstallments} de ${i.installments} parcelas pagas</p>
            </div>`;
          }).join("")}` : ""}
      </div>
    </div>`;
};

// ── LAYOUT ────────────────────────────────────────────────────────────
window.checkLayout = () => {
  const mob = window.innerWidth < 768;
  const tb  = document.getElementById("theme-btn-top");
  if (tb) tb.style.display = mob ? "flex" : "none";
};
window.addEventListener("resize", () => { checkLayout(); renderAll(); });
