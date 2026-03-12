/* ═══════════════════════════════════════════════════════════════
   MeuOrçamento — js/firebase.js
   Firebase config + autenticação + Firestore listeners
   ═══════════════════════════════════════════════════════════════ */

import { initializeApp }                                    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword,
         createUserWithEmailAndPassword,
         signOut, onAuthStateChanged,
         updatePassword, reauthenticateWithCredential,
         EmailAuthProvider }                               from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, collection,
         onSnapshot, setDoc, addDoc, updateDoc,
         deleteDoc, getDoc, serverTimestamp }              from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── CONFIG ────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyD-wsqjITPFeSSZ9c1itBBzUQYpyx0AGzA",
  authDomain:        "meu-orcamento-59122.firebaseapp.com",
  projectId:         "meu-orcamento-59122",
  storageBucket:     "meu-orcamento-59122.firebasestorage.app",
  messagingSenderId: "485896023448",
  appId:             "1:485896023448:web:98908abad02c7a84928fed",
  measurementId:     "G-BGX8D7Z7KK",
};

// ── USUÁRIOS DO CASAL ─────────────────────────────────────────────────
export const COUPLE = {
  "rayson@meuorcamento.app":     { name: "Rayson",     emoji: "👨" },
  "alessandra@meuorcamento.app": { name: "Alessandra", emoji: "👩" },
};
export const EMAIL_MAP = {
  "rayson":     "rayson@meuorcamento.app",
  "alessandra": "alessandra@meuorcamento.app",
};
// Casa compartilhada — ID fixo
export const HOUSE_ID = "casa-rayson-alessandra";

// ── INIT ──────────────────────────────────────────────────────────────
const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

let unsubs = [];
export let currentUserInfo = null;

// ── SEGURANÇA: Rate limiting local ────────────────────────────────────
const loginAttempts = { count: 0, lockedUntil: 0 };
const MAX_ATTEMPTS  = 5;
const LOCK_MINUTES  = 15;

function checkRateLimit() {
  const now = Date.now();
  if (loginAttempts.lockedUntil > now) {
    const rem = Math.ceil((loginAttempts.lockedUntil - now) / 60000);
    return `Muitas tentativas. Aguarde ${rem} minuto(s).`;
  }
  return null;
}
function recordFailedAttempt() {
  loginAttempts.count++;
  if (loginAttempts.count >= MAX_ATTEMPTS) {
    loginAttempts.lockedUntil = Date.now() + LOCK_MINUTES * 60000;
    loginAttempts.count = 0;
  }
}
function resetAttempts() { loginAttempts.count = 0; loginAttempts.lockedUntil = 0; }

// ── LOGIN ─────────────────────────────────────────────────────────────
window.doLogin = async () => {
  const locked = checkRateLimit();
  if (locked) { showLoginError(locked); return; }

  const pass = document.getElementById("login-pass").value;
  if (!pass) { showLoginError("Digite sua senha!"); return; }

  const email = EMAIL_MAP[window._loginUsername];
  if (!email) { showLoginError("Usuário inválido."); return; }

  showLoginLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    resetAttempts();
  } catch(e) {
    showLoginLoading(false);
    recordFailedAttempt();
    const lockMsg = checkRateLimit();
    if (lockMsg) { showLoginError(lockMsg); return; }
    const msgs = {
      "auth/invalid-credential": "Senha incorreta. Tente novamente.",
      "auth/user-not-found":     "Usuário não encontrado.",
      "auth/wrong-password":     "Senha incorreta.",
      "auth/too-many-requests":  "Muitas tentativas. Aguarde alguns minutos.",
      "auth/network-request-failed": "Sem conexão. Verifique sua internet.",
    };
    const remaining = MAX_ATTEMPTS - loginAttempts.count;
    const suffix = remaining < MAX_ATTEMPTS && remaining > 0
      ? ` (${remaining} tentativa(s) restante(s))`
      : "";
    showLoginError((msgs[e.code] || "Erro: " + e.message) + suffix);
  }
};

window.loginKeydown = (e) => { if (e.key === "Enter") doLogin(); };

// ── LOGOUT ────────────────────────────────────────────────────────────
window.doLogout = async () => {
  // Confirma logout
  if (!confirm("Deseja sair da sua conta?")) return;
  stopListeners();
  currentUserInfo = null;
  window._currentUser = null;
  await signOut(auth);
  showLoginScreen();
};

// ── PRIMEIRO ACESSO: criar senha ──────────────────────────────────────
window.doSetupPassword = async () => {
  const pass  = document.getElementById("setup-pass").value;
  const pass2 = document.getElementById("setup-pass2").value;
  const errEl = document.getElementById("setup-error");
  errEl.style.display = "none";

  // Validações de senha segura
  if (pass.length < 8) {
    errEl.textContent = "A senha precisa ter pelo menos 8 caracteres.";
    errEl.style.display = "block"; return;
  }
  if (!/[A-Z]/.test(pass) && !/[0-9]/.test(pass)) {
    errEl.textContent = "Use pelo menos uma letra maiúscula ou número.";
    errEl.style.display = "block"; return;
  }
  if (pass !== pass2) {
    errEl.textContent = "As senhas não coincidem!";
    errEl.style.display = "block"; return;
  }

  const btn = document.getElementById("setup-btn");
  btn.textContent = "Criando..."; btn.disabled = true;

  try {
    const email = EMAIL_MAP[window._setupUsername];
    await createUserWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged cuida do resto
  } catch(e) {
    btn.textContent = "Criar minha senha"; btn.disabled = false;
    if (e.code === "auth/email-already-in-use") {
      showSetupScreen(false);
      document.getElementById("step-select").style.display = "none";
      document.getElementById("step-password").style.display = "block";
      const email = EMAIL_MAP[window._setupUsername];
      document.getElementById("login-who").textContent =
        COUPLE[email].emoji + " " + COUPLE[email].name;
      showLoginError("Você já tem senha. Entre normalmente.");
    } else {
      errEl.textContent = "Erro: " + e.message;
      errEl.style.display = "block";
    }
  }
};
window.setupKeydown = (e) => { if (e.key === "Enter") doSetupPassword(); };

// ── ALTERAR SENHA (dentro do app) ─────────────────────────────────────
window.doChangePassword = async () => {
  const current  = document.getElementById("cp-current").value;
  const newPass  = document.getElementById("cp-new").value;
  const confirm  = document.getElementById("cp-confirm").value;
  const errEl    = document.getElementById("cp-error");
  errEl.style.display = "none";

  if (!current || !newPass || !confirm) {
    errEl.textContent = "Preencha todos os campos.";
    errEl.style.display = "block"; return;
  }
  if (newPass.length < 8) {
    errEl.textContent = "Nova senha: mínimo 8 caracteres.";
    errEl.style.display = "block"; return;
  }
  if (newPass !== confirm) {
    errEl.textContent = "As senhas não coincidem!";
    errEl.style.display = "block"; return;
  }

  const btn = document.getElementById("cp-btn");
  btn.textContent = "Salvando..."; btn.disabled = true;

  try {
    const user = auth.currentUser;
    // Re-autentica antes de mudar a senha
    const credential = EmailAuthProvider.credential(user.email, current);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPass);
    closeModal("modal-change-pass");
    window.toast("🔐 Senha alterada com sucesso!");
  } catch(e) {
    const msgs = {
      "auth/wrong-password":     "Senha atual incorreta.",
      "auth/invalid-credential": "Senha atual incorreta.",
      "auth/weak-password":      "Nova senha muito fraca.",
    };
    errEl.textContent = msgs[e.code] || "Erro: " + e.message;
    errEl.style.display = "block";
  } finally {
    btn.textContent = "Salvar nova senha"; btn.disabled = false;
  }
};

// ── SELEÇÃO DE USUÁRIO ────────────────────────────────────────────────
window.selectUser = (username) => {
  window._loginUsername = username;
  const info = COUPLE[EMAIL_MAP[username]];
  document.getElementById("step-select").style.display   = "none";
  document.getElementById("step-password").style.display = "block";
  document.getElementById("login-who").textContent = info.emoji + " " + info.name;
  document.getElementById("login-pass").value = "";
  document.getElementById("login-error").style.display = "none";
  document.getElementById("login-pass").focus();
};
window.backToSelect = () => {
  document.getElementById("step-select").style.display   = "block";
  document.getElementById("step-password").style.display = "none";
  document.getElementById("login-error").style.display   = "none";
};
window.openSetup = (username) => {
  if (!username || !EMAIL_MAP[username]) return;
  showSetupScreen(true, username);
};
window.closeSetup = () => showSetupScreen(false);

function showSetupScreen(show, username) {
  document.getElementById("login-screen").style.display  = show ? "none" : "flex";
  document.getElementById("setup-screen").style.display  = show ? "flex" : "none";
  if (show && username) {
    window._setupUsername = username;
    const info = COUPLE[EMAIL_MAP[username]];
    document.getElementById("setup-who").textContent = info.emoji + " " + info.name;
    document.getElementById("setup-pass").value  = "";
    document.getElementById("setup-pass2").value = "";
    document.getElementById("setup-error").style.display = "none";
    document.getElementById("setup-pass").focus();
  }
}

// ── INDICADOR DE FORÇA DA SENHA ───────────────────────────────────────
window.checkPasswordStrength = (inputId, barId) => {
  const val = document.getElementById(inputId)?.value || "";
  const bar = document.getElementById(barId);
  if (!bar) return;
  let score = 0;
  if (val.length >= 8)  score++;
  if (val.length >= 12) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { w: "0%",    bg: "transparent", label: "" },
    { w: "25%",   bg: "#ff4d6d",     label: "Fraca" },
    { w: "50%",   bg: "#ffc94a",     label: "Razoável" },
    { w: "75%",   bg: "#4d9fff",     label: "Boa" },
    { w: "100%",  bg: "#00e5a0",     label: "Forte" },
  ];
  const lv = levels[Math.min(score, 4)];
  bar.style.width      = lv.w;
  bar.style.background = lv.bg;
  const label = document.getElementById(barId + "-label");
  if (label) { label.textContent = lv.label; label.style.color = lv.bg; }
};

// ── AUTH STATE ────────────────────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) { showLoginScreen(); return; }

  const info = COUPLE[user.email];
  currentUserInfo = {
    uid:   user.uid,
    email: user.email,
    name:  info?.name  || user.email,
    emoji: info?.emoji || "👤",
  };
  window._currentUser = currentUserInfo;

  showLoadingScreen(currentUserInfo.name);

  try {
    const houseRef  = doc(db, "houses", HOUSE_ID);
    const houseSnap = await getDoc(houseRef);
    if (!houseSnap.exists()) {
      await setDoc(houseRef, {
        salary: 0, extra: 0,
        themes: {},
        createdAt: serverTimestamp(),
      });
    }
    const houseData = (await getDoc(houseRef)).data();
    const myTheme   = houseData?.themes?.[user.uid] || "dark";
    window.S.theme  = myTheme;

    // Registra/atualiza último acesso
    await setDoc(doc(db, "sessions", user.uid), {
      lastSeen:  serverTimestamp(),
      userAgent: navigator.userAgent.slice(0, 200),
      name:      info?.name || user.email,
    }, { merge: true });

    startListeners(user);

  } catch(e) {
    const msg = document.getElementById("loading-msg");
    if (msg) { msg.textContent = "❌ Erro: " + e.message; msg.style.color = "#ff4d6d"; }
    const btn = document.createElement("button");
    btn.textContent = "Sair e tentar novamente";
    btn.style.cssText = "margin-top:20px;padding:12px 24px;background:#00e5a0;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;color:#000";
    btn.onclick = () => doLogout();
    document.getElementById("loading-screen").appendChild(btn);
  }
});

// ── LISTENERS FIRESTORE ───────────────────────────────────────────────
function startListeners(user) {
  stopListeners();

  // Casa (salary, extra, themes pessoais)
  unsubs.push(onSnapshot(doc(db, "houses", HOUSE_ID), snap => {
    if (!snap.exists()) return;
    const d = snap.data();
    window.S.salary = d.salary || 0;
    window.S.extra  = d.extra  || 0;
    const myTheme = d.themes?.[user.uid];
    if (myTheme && myTheme !== window.S.theme) window.S.theme = myTheme;
    if (document.getElementById("layout").style.display !== "none") window.renderAll();
  }));

  // Gastos, cartões, parcelamentos, metas — todos compartilhados
  const cols = ["expenses", "cards", "installments", "goals"];
  const keys = ["expenses", "cards", "installments", "goals"];
  cols.forEach((col, i) => {
    unsubs.push(onSnapshot(collection(db, "houses", HOUSE_ID, col), snap => {
      window.S[keys[i]] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (document.getElementById("layout").style.display !== "none") window.renderAll();
    }));
  });

  showAppScreen();
}

function stopListeners() {
  unsubs.forEach(u => u());
  unsubs = [];
}

// ── FIREBASE HELPERS (expostos globalmente) ───────────────────────────
window.fbSaveHouse = async (data) => {
  await updateDoc(doc(db, "houses", HOUSE_ID), data);
};

window.fbSaveTheme = async (themeKey) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await updateDoc(doc(db, "houses", HOUSE_ID), { [`themes.${uid}`]: themeKey });
};

window.fbAdd = async (col, data) => {
  const ref = await addDoc(collection(db, "houses", HOUSE_ID, col), {
    ...data,
    _createdAt:     new Date().toISOString(),
    _createdBy:     auth.currentUser?.uid  || "",
    _createdByName: window._currentUser?.name || "",
  });
  return ref.id;
};

window.fbUpdate = async (col, id, data) => {
  await updateDoc(doc(db, "houses", HOUSE_ID, col, id), {
    ...data,
    _updatedAt:     new Date().toISOString(),
    _updatedBy:     auth.currentUser?.uid  || "",
  });
};

window.fbDel = async (col, id) => {
  await deleteDoc(doc(db, "houses", HOUSE_ID, col, id));
};

// ── TELA HELPERS ──────────────────────────────────────────────────────
function showLoginScreen() {
  document.getElementById("login-screen").style.display  = "flex";
  document.getElementById("setup-screen").style.display  = "none";
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("layout").style.display         = "none";
  document.getElementById("bottom-nav").style.display     = "none";
  // Volta ao step 1
  const s1 = document.getElementById("step-select");
  const s2 = document.getElementById("step-password");
  if (s1) s1.style.display = "block";
  if (s2) s2.style.display = "none";
  const p = document.getElementById("login-pass");
  if (p) p.value = "";
  document.getElementById("login-error").style.display = "none";
}
function showLoadingScreen(name) {
  document.getElementById("login-screen").style.display   = "none";
  document.getElementById("loading-screen").style.display = "flex";
  document.getElementById("layout").style.display         = "none";
  document.getElementById("bottom-nav").style.display     = "none";
  document.getElementById("loading-msg").textContent = `Carregando dados de ${name}...`;
}
function showAppScreen() {
  document.getElementById("login-screen").style.display   = "none";
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("layout").style.removeProperty("display");
  window.checkLayout();
  window.renderAll();
  window.setTab("home");
  window.updateUserBadge();
}
function showLoginLoading(v) {
  const btn = document.getElementById("login-btn");
  if (btn) { btn.textContent = v ? "Entrando..." : "Entrar"; btn.disabled = v; }
}
function showLoginError(msg) {
  const el = document.getElementById("login-error");
  if (el) { el.textContent = msg; el.style.display = "block"; }
}

// ── updateUserBadge ───────────────────────────────────────────────────
window.updateUserBadge = function() {
  if (!currentUserInfo) return;
  const t = window.T();
  const html = `
    <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:14px;border:1px solid ${t.border};background:${t.cardLight}">
      <div style="width:32px;height:32px;border-radius:50%;background:${t.accent};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${currentUserInfo.emoji}</div>
      <div style="min-width:0;flex:1">
        <p style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${currentUserInfo.name}</p>
        <p style="font-size:10px;color:${t.muted}">● Online</p>
      </div>
      <button onclick="doLogout()" title="Sair" style="background:none;border:none;color:${t.muted};font-size:18px;padding:2px 6px;cursor:pointer">↩</button>
    </div>`;
  const el = document.getElementById("user-badge");
  if (el) el.innerHTML = html;

  // Topbar (mobile)
  const tb = document.getElementById("topbar-user");
  if (tb) {
    tb.style.display = "flex";
    tb.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:12px;border:1px solid ${t.border};background:${t.cardLight}">
        <span style="font-size:16px">${currentUserInfo.emoji}</span>
        <span style="font-size:13px;font-weight:700">${currentUserInfo.name}</span>
        <button onclick="doLogout()" style="background:none;border:none;color:${t.muted};font-size:15px;padding:0 0 0 4px;cursor:pointer" title="Sair">↩</button>
      </div>`;
  }
};
