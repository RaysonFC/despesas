/* ═══════════════════════════════════════════════════════════════
   MeuOrçamento — js/forms.js
   Todos os formulários, modais e ações do usuário
   ═══════════════════════════════════════════════════════════════ */

// ── MODAIS ────────────────────────────────────────────────────────────
window.openModal  = (id) => document.getElementById(id).style.display = "flex";
window.closeModal = (id) => document.getElementById(id).style.display = "none";

// ── TEMAS ─────────────────────────────────────────────────────────────
window.openThemes = () => {
  const t = T();
  document.getElementById("theme-list").innerHTML = Object.entries(THEMES).map(([key, th]) => {
    const a = key === S.theme;
    return `<button onclick="setTheme('${key}')" style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;width:100%;border:1px solid ${a ? t.accent : t.border};background:${a ? t.accent + "18" : t.cardLight};cursor:pointer;margin-bottom:8px;text-align:left">
      <div style="display:flex;gap:4px;flex-shrink:0">
        <div style="width:22px;height:22px;border-radius:50%;background:${th.bg};border:2px solid ${th.border}"></div>
        <div style="width:22px;height:22px;border-radius:50%;background:${th.card};border:2px solid ${th.border}"></div>
        <div style="width:22px;height:22px;border-radius:50%;background:${th.accent}"></div>
      </div>
      <span style="font-size:22px">${th.icon}</span>
      <span style="font-size:14px;font-weight:700;color:${a ? t.accent : t.text};flex:1">${th.name}</span>
      ${a ? `<span style="font-size:12px;color:${t.accent};font-weight:700">✓ Ativo</span>` : ""}
    </button>`;
  }).join("");
  openModal("modal-themes");
};

window.setTheme = (key) => {
  S.theme = key;
  window.fbSaveTheme(key);
  closeModal("modal-themes");
  renderAll();
};

// ── RENDA ─────────────────────────────────────────────────────────────
window.openSalaryModal = () => {
  document.getElementById("salary-input").value = S.salary || "";
  document.getElementById("extra-input").value  = S.extra  || "";
  updateIncomePreview();
  openModal("modal-salary");
};
window.updateIncomePreview = () => {
  const s = parseFloat(document.getElementById("salary-input").value) || 0;
  const e = parseFloat(document.getElementById("extra-input").value)  || 0;
  document.getElementById("total-income-preview").textContent = "Total em conta: " + fmt(s + e);
};
window.saveSalary = () => {
  const v = parseFloat(document.getElementById("salary-input").value);
  const x = parseFloat(document.getElementById("extra-input").value);
  const data = {};
  if (!isNaN(v)) data.salary = v;
  data.extra = isNaN(x) ? 0 : x;
  window.fbSaveHouse(data)
    .then(() => toast("✅ Renda atualizada!"))
    .catch(e => toast("Erro: " + e.message, "err"));
  closeModal("modal-salary");
};

// ── CARTÕES ───────────────────────────────────────────────────────────
let editCardId = null;

window.openAddCard = () => {
  S.selectedBrand = "Visa";
  renderBrandChips();
  renderCardPreview();
  ["card-name","card-limit","card-closing","card-due"].forEach(id => document.getElementById(id).value = "");
  openModal("modal-card");
};

window.renderBrandChips = () => {
  document.getElementById("brand-chips").innerHTML = Object.keys(BRANDS).map(b =>
    `<button class="chip ${b === S.selectedBrand ? "active" : ""}" onclick="selectBrand('${b}')">${b}</button>`
  ).join("");
};

window.selectBrand = (b) => { S.selectedBrand = b; renderBrandChips(); renderCardPreview(); };

window.renderCardPreview = () => {
  document.getElementById("card-preview").innerHTML = cardHTML({
    name:  document.getElementById("card-name")?.value || "Prévia",
    brand: S.selectedBrand
  }, false);
};

window.saveCard = () => {
  const el   = document.getElementById("card-name");
  const name = el.value.trim();
  if (!name) {
    el.classList.add("error");
    setTimeout(() => el.classList.remove("error"), 600);
    toast("Informe o nome do cartão!", "err");
    return;
  }
  const data = {
    name,
    brand:   S.selectedBrand,
    limit:   parseFloat(document.getElementById("card-limit").value)   || 0,
    closing: parseInt(document.getElementById("card-closing").value)   || 1,
    due:     parseInt(document.getElementById("card-due").value)       || 10,
  };
  window.fbAdd("cards", data)
    .then(() => { toast("💳 Cartão adicionado!"); closeModal("modal-card"); })
    .catch(e => toast("Erro: " + e.message, "err"));
};

window.openEditCard = (id) => {
  const c = S.cards.find(x => x.id === id);
  if (!c) return;
  editCardId = id;
  S.selectedEditBrand = c.brand;
  document.getElementById("edit-card-name").value    = c.name;
  document.getElementById("edit-card-limit").value   = c.limit;
  document.getElementById("edit-card-closing").value = c.closing;
  document.getElementById("edit-card-due").value     = c.due;
  renderEditBrandChips();
  renderEditCardPreview();
  openModal("modal-edit-card");
};

window.renderEditBrandChips = () => {
  document.getElementById("edit-brand-chips").innerHTML = Object.keys(BRANDS).map(b =>
    `<button class="chip ${b === S.selectedEditBrand ? "active" : ""}" onclick="selectEditBrand('${b}')">${b}</button>`
  ).join("");
};

window.selectEditBrand = (b) => { S.selectedEditBrand = b; renderEditBrandChips(); renderEditCardPreview(); };

window.renderEditCardPreview = () => {
  document.getElementById("edit-card-preview").innerHTML = cardHTML({
    name:  document.getElementById("edit-card-name")?.value || "Prévia",
    brand: S.selectedEditBrand
  }, false);
};

window.saveEditCard = () => {
  const c = S.cards.find(x => x.id === editCardId);
  if (!c) return;
  const data = {
    name:    document.getElementById("edit-card-name").value.trim()    || c.name,
    brand:   S.selectedEditBrand,
    limit:   parseFloat(document.getElementById("edit-card-limit").value)   || c.limit,
    closing: parseInt(document.getElementById("edit-card-closing").value)   || c.closing,
    due:     parseInt(document.getElementById("edit-card-due").value)       || c.due,
  };
  window.fbUpdate("cards", editCardId, data)
    .then(() => { toast("✅ Cartão atualizado!"); closeModal("modal-edit-card"); })
    .catch(e => toast("Erro: " + e.message, "err"));
};

// ── PARCELAMENTOS ─────────────────────────────────────────────────────
let editInstId = null, editInstCard = null;

window.openAddInst = (preselectedCardId) => {
  S.selectedInstCard = preselectedCardId || null;
  renderInstChips();
  ["inst-desc","inst-total","inst-n","inst-due"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("inst-month").value = curM();
  document.getElementById("inst-preview").style.display = "none";
  openModal("modal-inst");
};

window.renderInstChips = () => {
  let h = `<button class="chip ${!S.selectedInstCard ? "active" : ""}" onclick="selInstCard(null)">💵 Sem cartão</button>`;
  S.cards.forEach(c => {
    const a = S.selectedInstCard == c.id;
    h += `<button class="chip ${a ? "active" : ""}" onclick="selInstCard('${c.id}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px">
      <span>${c.name}</span>
      <span style="font-size:10px;opacity:.65">${fmt(c.limit)} limite</span>
    </button>`;
  });
  document.getElementById("inst-card-chips").innerHTML = h;
};

window.selInstCard = (id) => { S.selectedInstCard = id; renderInstChips(); };

window.updateInstPreview = () => {
  const total = parseFloat(document.getElementById("inst-total").value);
  const n     = parseInt(document.getElementById("inst-n").value);
  const p     = document.getElementById("inst-preview");
  const t     = T();
  if (total && n && n > 0) {
    p.style.display    = "block";
    p.style.background = t.accent + "18";
    p.style.border     = `1px solid ${t.accent}44`;
    document.getElementById("inst-preview-val").textContent = fmt(total / n);
    document.getElementById("inst-preview-val").style.color = t.accent;
  } else {
    p.style.display = "none";
  }
};

window.saveInst = () => {
  const dEl = document.getElementById("inst-desc");
  const tEl = document.getElementById("inst-total");
  const nEl = document.getElementById("inst-n");
  const desc  = dEl.value.trim();
  const total = parseFloat(tEl.value);
  const n     = parseInt(nEl.value);
  let ok = true;
  if (!desc)        { dEl.classList.add("error"); setTimeout(() => dEl.classList.remove("error"), 600); ok = false; }
  if (!total || total <= 0) { tEl.classList.add("error"); setTimeout(() => tEl.classList.remove("error"), 600); ok = false; }
  if (!n || n < 1)  { nEl.classList.add("error"); setTimeout(() => nEl.classList.remove("error"), 600); ok = false; }
  if (!ok) { toast("Preencha todos os campos!", "err"); return; }

  const dueDay = parseInt(document.getElementById("inst-due").value) || 0;
  const data = {
    desc,
    cardId:           S.selectedInstCard || null,
    totalAmount:      total,
    installments:     n,
    paidInstallments: 0,
    installmentValue: parseFloat((total / n).toFixed(2)),
    startMonth:       document.getElementById("inst-month").value,
    dueDay,
  };
  window.fbAdd("installments", data)
    .then(() => { toast("✅ Parcelamento adicionado!"); closeModal("modal-inst"); })
    .catch(e => toast("Erro: " + e.message, "err"));
};

window.openEditInst = (id) => {
  const i = S.installments.find(x => x.id === id);
  if (!i) return;
  editInstId   = id;
  editInstCard = i.cardId;
  document.getElementById("edit-inst-desc").value  = i.desc;
  document.getElementById("edit-inst-total").value = i.totalAmount;
  document.getElementById("edit-inst-n").value     = i.installments;
  document.getElementById("edit-inst-paid").value  = i.paidInstallments;
  document.getElementById("edit-inst-month").value = i.startMonth || curM();
  document.getElementById("edit-inst-due").value   = i.dueDay || "";
  renderEditInstChips();
  openModal("modal-edit-inst");
};

window.renderEditInstChips = () => {
  let h = `<button class="chip ${!editInstCard ? "active" : ""}" onclick="selEditInstCard(null)">💵 Sem cartão</button>`;
  S.cards.forEach(c => {
    const a = editInstCard == c.id;
    h += `<button class="chip ${a ? "active" : ""}" onclick="selEditInstCard('${c.id}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px">
      <span>${c.name}</span>
      <span style="font-size:10px;opacity:.65">${fmt(c.limit)} limite</span>
    </button>`;
  });
  document.getElementById("edit-inst-card-chips").innerHTML = h;
};

window.selEditInstCard = (id) => { editInstCard = id; renderEditInstChips(); };

window.saveEditInst = () => {
  const i = S.installments.find(x => x.id === editInstId);
  if (!i) return;
  const total = parseFloat(document.getElementById("edit-inst-total").value) || i.totalAmount;
  const n     = parseInt(document.getElementById("edit-inst-n").value)       || i.installments;
  const paid  = parseInt(document.getElementById("edit-inst-paid").value);
  const data  = {
    desc:             document.getElementById("edit-inst-desc").value.trim() || i.desc,
    cardId:           editInstCard || null,
    totalAmount:      total,
    installments:     n,
    paidInstallments: isNaN(paid) ? i.paidInstallments : Math.min(paid, n),
    installmentValue: parseFloat((total / n).toFixed(2)),
    startMonth:       document.getElementById("edit-inst-month").value || i.startMonth,
    dueDay:           parseInt(document.getElementById("edit-inst-due").value) || 0,
  };
  window.fbUpdate("installments", editInstId, data)
    .then(() => { toast("✅ Parcelamento atualizado!"); closeModal("modal-edit-inst"); })
    .catch(e => toast("Erro: " + e.message, "err"));
};

// ── GASTOS ────────────────────────────────────────────────────────────
window.saveHomeExp = () => {
  const dEl = document.getElementById("h-desc");
  const aEl = document.getElementById("h-amount");
  const desc   = dEl.value.trim();
  const amount = parseFloat(aEl.value);
  let ok = true;
  if (!desc)         { dEl.classList.add("error"); setTimeout(() => dEl.classList.remove("error"), 600); ok = false; }
  if (!amount || amount <= 0) { aEl.classList.add("error"); setTimeout(() => aEl.classList.remove("error"), 600); ok = false; }
  if (!ok) { toast("Preencha descrição e valor!", "err"); return; }
  const cv = document.getElementById("h-card").value;
  const data = {
    date:   document.getElementById("h-date").value,
    desc, amount,
    cat:    document.getElementById("h-cat").value,
    cardId: cv || null,
  };
  window.fbAdd("expenses", data)
    .then(() => {
      toast("✅ Gasto registrado!");
      document.getElementById("h-desc").value   = "";
      document.getElementById("h-amount").value = "";
    })
    .catch(e => toast("Erro: " + e.message, "err"));
};

window.populateExpCard = () => {
  document.getElementById("exp-card").innerHTML =
    `<option value="">💵 Dinheiro</option>` +
    S.cards.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
};

window.saveExpense = () => {
  const dEl = document.getElementById("exp-desc");
  const aEl = document.getElementById("exp-amount");
  const desc   = dEl.value.trim();
  const amount = parseFloat(aEl.value);
  let ok = true;
  if (!desc)         { dEl.classList.add("error"); setTimeout(() => dEl.classList.remove("error"), 600); ok = false; }
  if (!amount || amount <= 0) { aEl.classList.add("error"); setTimeout(() => aEl.classList.remove("error"), 600); ok = false; }
  if (!ok) { toast("Preencha descrição e valor!", "err"); return; }
  const cv = document.getElementById("exp-card").value;
  const data = {
    date:   document.getElementById("exp-date").value,
    desc, amount,
    cat:    document.getElementById("exp-cat").value,
    cardId: cv || null,
  };
  window.fbAdd("expenses", data)
    .then(() => { toast("✅ Gasto registrado!"); closeModal("modal-expense"); })
    .catch(e => toast("Erro: " + e.message, "err"));
};

// ── METAS ─────────────────────────────────────────────────────────────
let editGoalId = null;

window.openAddGoal = () => {
  editGoalId = null;
  S.selectedGoalEmoji = "🎯";
  ["goal-name","goal-target","goal-saved","goal-deadline"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("goal-modal-title").textContent = "🎯 Nova Meta";
  document.getElementById("goal-save-btn").textContent    = "Adicionar Meta";
  renderGoalChips();
  updateGoalPreview();
  openModal("modal-goal");
};

window.openEditGoal = (id) => {
  const g = S.goals.find(x => x.id === id);
  if (!g) return;
  editGoalId = id;
  S.selectedGoalEmoji = g.emoji || "🎯";
  document.getElementById("goal-name").value     = g.name;
  document.getElementById("goal-target").value   = g.target;
  document.getElementById("goal-saved").value    = g.saved;
  document.getElementById("goal-deadline").value = g.deadline || "";
  document.getElementById("goal-modal-title").textContent = "✏️ Editar Meta";
  document.getElementById("goal-save-btn").textContent    = "Salvar";
  renderGoalChips();
  updateGoalPreview();
  openModal("modal-goal");
};

window.renderGoalChips = () => {
  document.getElementById("goal-emoji-chips").innerHTML = GOAL_EMOJIS.map(e =>
    `<button class="chip ${e === S.selectedGoalEmoji ? "active" : ""}" onclick="S.selectedGoalEmoji='${e}';renderGoalChips()" style="font-size:18px;padding:6px 10px">${e}</button>`
  ).join("");
};

window.updateGoalPreview = () => {
  const t      = T();
  const target = parseFloat(document.getElementById("goal-target")?.value) || 0;
  const saved  = parseFloat(document.getElementById("goal-saved")?.value)  || 0;
  const p      = document.getElementById("goal-preview");
  if (!p) return;
  if (target > 0) {
    p.style.display    = "block";
    p.style.background = t.accent + "18";
    p.style.border     = `1px solid ${t.accent}44`;
    p.innerHTML = `
      <p style="font-size:13px;color:${t.muted};margin-bottom:4px">Progresso</p>
      <p style="font-size:22px;font-weight:800;color:${t.accent}">${Math.min((saved / target) * 100, 100).toFixed(0)}%</p>
      <p style="font-size:11px;color:${t.muted};margin-top:4px">Faltam ${fmt(Math.max(0, target - saved))}</p>`;
  } else {
    p.style.display = "none";
  }
};

window.saveGoal = () => {
  const nEl   = document.getElementById("goal-name");
  const tEl   = document.getElementById("goal-target");
  const name  = nEl.value.trim();
  const target= parseFloat(tEl.value);
  if (!name)  { nEl.classList.add("error"); setTimeout(() => nEl.classList.remove("error"), 600); toast("Informe o nome!", "err"); return; }
  if (!target || target <= 0) { tEl.classList.add("error"); setTimeout(() => tEl.classList.remove("error"), 600); toast("Informe o valor alvo!", "err"); return; }
  const saved    = parseFloat(document.getElementById("goal-saved").value) || 0;
  const deadline = document.getElementById("goal-deadline").value || "";
  const data = { name, target, saved, deadline, emoji: S.selectedGoalEmoji };
  if (editGoalId) {
    window.fbUpdate("goals", editGoalId, data)
      .then(() => { toast("✅ Meta atualizada!"); closeModal("modal-goal"); })
      .catch(e => toast("Erro: " + e.message, "err"));
  } else {
    window.fbAdd("goals", data)
      .then(() => { toast("🎯 Meta criada!"); closeModal("modal-goal"); })
      .catch(e => toast("Erro: " + e.message, "err"));
  }
};

window.depositGoal = (id) => {
  const g = S.goals.find(x => x.id === id);
  if (!g) return;
  const val = prompt(`💰 Quanto depositar na meta "${g.name}"?\nGuardado atual: ${fmt(g.saved)}`);
  if (!val) return;
  const amount = parseFloat(val);
  if (isNaN(amount) || amount <= 0) { toast("Valor inválido", "err"); return; }
  const newSaved = Math.min(g.saved + amount, g.target);
  window.fbUpdate("goals", id, { saved: newSaved })
    .then(() => {
      if (newSaved >= g.target) toast(`🎉 Meta "${g.name}" concluída!`);
      else toast(`💰 ${fmt(amount)} depositado!`);
    })
    .catch(e => toast("Erro: " + e.message, "err"));
};

// ── AÇÕES ─────────────────────────────────────────────────────────────
window.payInst = (id, ctx) => {
  const i = S.installments.find(x => x.id === id);
  if (!i) return;
  const newPaid = Math.min(i.paidInstallments + 1, i.installments);
  const done    = newPaid >= i.installments;
  window.fbUpdate("installments", id, { paidInstallments: newPaid })
    .then(() => {
      if (done) toast(`🎉 ${i.desc} quitado!`);
      else toast(`✅ Parcela ${newPaid}/${i.installments} paga!`);
      if (done) {
        const el = document.getElementById(ctx === "h" ? `inst-h-${id}` : `inst-${id}`);
        if (el) { el.classList.add("dust-out"); setTimeout(() => renderAll(), 560); }
      }
    })
    .catch(e => toast("Erro: " + e.message, "err"));
};

window.delInst = (id) => {
  const i = S.installments.find(x => x.id === id);
  confirm2({ emoji:"🗑", title:"Remover parcelamento?", msg:`"${i?.desc}" será removido.`, okLabel:"Remover", danger:true,
    ok: () => window.fbDel("installments", id).then(() => toast("Parcelamento removido", "info")).catch(e => toast("Erro: " + e.message, "err"))
  });
};

window.delExp = (id) => {
  const e = S.expenses.find(x => x.id === id);
  confirm2({ emoji:"🗑", title:"Remover gasto?", msg:`"${e?.desc}" (${fmt(e?.amount)}) será removido.`, okLabel:"Remover", danger:true,
    ok: () => window.fbDel("expenses", id).then(() => toast("Gasto removido", "info")).catch(e => toast("Erro: " + e.message, "err"))
  });
};

window.delCard = (id) => {
  const c = S.cards.find(x => x.id === id);
  confirm2({ emoji:"💳", title:"Remover cartão?", msg:`"${c?.name}" será removido.`, okLabel:"Remover", danger:true,
    ok: () => window.fbDel("cards", id).then(() => toast("Cartão removido", "info")).catch(e => toast("Erro: " + e.message, "err"))
  });
};

window.delGoal = (id) => {
  const g = S.goals.find(x => x.id === id);
  confirm2({ emoji:"🎯", title:"Remover meta?", msg:`"${g?.name}" será removida.`, okLabel:"Remover", danger:true,
    ok: () => window.fbDel("goals", id).then(() => toast("Meta removida", "info")).catch(e => toast("Erro: " + e.message, "err"))
  });
};

// ── ALTERAR SENHA (abrir modal) ───────────────────────────────────────
window.openChangePassword = () => {
  ["cp-current","cp-new","cp-confirm"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("cp-error").style.display = "none";
  openModal("modal-change-pass");
};
