/* MeuOrçamento — firebase.js */

import { initializeApp }                               from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
         updatePassword, sendPasswordResetEmail,
         signOut, onAuthStateChanged,
         reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, collection,
         onSnapshot, setDoc, addDoc, updateDoc,
         deleteDoc, getDoc, serverTimestamp }          from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
// Esses são os emails que você vai cadastrar no Firebase Authentication
// (Email/senha). Os nomes e emojis aparecem no app.
const COUPLE = {
  "raysandra27@gmail.com":  { name: "Rayson",     emoji: "👨" },
  "alecoelhofa@gmail.com": { name: "Alessandra", emoji: "👩" },
};
// ID fixo da "casa" do casal — compartilhado entre os dois
const HOUSE_ID = "casa-rayson-alessandra";
// ─────────────────────────────────────────────────────────────────────

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

let unsubs = [];
let currentUserInfo = null; // { name, emoji, email, uid }

// ── RATE LIMITING ────────────────────────────────────────────────────
const _rl = { count:0, lockedUntil:0 };
function rlCheck(){ const n=Date.now(); if(_rl.lockedUntil>n){ const m=Math.ceil((_rl.lockedUntil-n)/60000); return `Conta bloqueada por ${m} min. Muitas tentativas.`; } return null; }
function rlFail(){ _rl.count++; if(_rl.count>=5){ _rl.lockedUntil=Date.now()+15*60000; _rl.count=0; } }
function rlReset(){ _rl.count=0; _rl.lockedUntil=0; }

// ── MAPA USUÁRIO → EMAIL ─────────────────────────────────────────────
const EMAIL_MAP = {
  "rayson":     "raysandra27@gmail.com",
  "alessandra": "alecoelhofa@gmail.com",
};

// ── TELA: selecionar quem está entrando ──────────────────────────────
window.selectUser = (username) => {
  window._loginUsername = username;
  const info = COUPLE[EMAIL_MAP[username]];
  // Mostra tela de senha
  document.getElementById("step-select").style.display = "none";
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
  const rb = document.getElementById("reset-box");
  if (rb) rb.style.display = "none";
};

window.toggleResetBox = () => {
  const box  = document.getElementById("reset-box");
  if (!box) return;
  const open = box.style.display === "none" || box.style.display === "";
  box.style.display = open ? "block" : "none";
  // Mostra email que vai receber
  if (open) {
    const email = EMAIL_MAP[window._loginUsername] || "";
    const prev  = document.getElementById("reset-email-preview");
    if (prev) prev.textContent = "📧 " + email;
    const btn = document.getElementById("reset-btn");
    if (btn) { btn.textContent = "Enviar email de redefinição"; btn.disabled = false; }
    const msg = document.getElementById("reset-msg");
    if (msg) msg.style.display = "none";
  }
};

// ── LOGIN normal ──────────────────────────────────────────────────────
window.doLogin = async () => {
  const blocked = rlCheck();
  if (blocked) { showLoginError(blocked); return; }
  const pass = document.getElementById("login-pass").value;
  if (!pass) { showLoginError("Digite sua senha!"); return; }
  const email = EMAIL_MAP[window._loginUsername];
  if (!email) { showLoginError("Usuário inválido."); return; }
  showLoginLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    rlReset();
  } catch(e) {
    showLoginLoading(false);
    rlFail();
    const blocked2 = rlCheck();
    if (blocked2) { showLoginError(blocked2); return; }
    const rem = 5 - _rl.count;
    const msgs = {
      "auth/invalid-credential": "Senha incorreta.",
      "auth/user-not-found":     "Usuário não encontrado.",
      "auth/wrong-password":     "Senha incorreta.",
      "auth/too-many-requests":  "Muitas tentativas. Aguarde.",
      "auth/network-request-failed": "Sem conexão.",
    };
    const suffix = rem > 0 && rem < 5 ? ` (${rem} tentativa(s) restante(s))` : "";
    showLoginError((msgs[e.code] || "Erro: " + e.message) + suffix);
  }
};

// ── PRIMEIRO ACESSO: criar senha ──────────────────────────────────────
window.doSetupPassword = async () => {
  const pass  = document.getElementById("setup-pass").value;
  const pass2 = document.getElementById("setup-pass2").value;
  const err   = document.getElementById("setup-error");
  err.style.display = "none";

  if (pass.length < 6) { err.textContent = "A senha precisa ter pelo menos 6 caracteres."; err.style.display="block"; return; }
  if (pass !== pass2)  { err.textContent = "As senhas não coincidem!"; err.style.display="block"; return; }

  const btnSetup = document.getElementById("setup-btn");
  btnSetup.textContent = "Criando..."; btnSetup.disabled = true;

  try {
    // Cria usuário no Firebase Auth com a senha escolhida
    const email = EMAIL_MAP[window._setupUsername];
    await createUserWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged vai cuidar do resto
  } catch(e) {
    btnSetup.textContent = "Criar minha senha"; btnSetup.disabled = false;
    if (e.code === "auth/email-already-in-use") {
      // Usuário já existe — redireciona pro login normal
      showSetupScreen(false);
      showLoginError("Você já tem uma senha criada. Entre normalmente.");
      document.getElementById("step-select").style.display = "none";
      document.getElementById("step-password").style.display = "block";
      document.getElementById("login-who").textContent = COUPLE[email].emoji + " " + COUPLE[email].name;
    } else {
      document.getElementById("setup-error").textContent = "Erro: " + e.message;
      document.getElementById("setup-error").style.display = "block";
      btnSetup.textContent = "Criar minha senha"; btnSetup.disabled = false;
    }
  }
};

// Mostra/esconde tela de primeiro acesso
function showSetupScreen(show, username) {
  document.getElementById("login-screen").style.display = show ? "none" : "flex";
  document.getElementById("setup-screen").style.display = show ? "flex" : "none";
  if (show && username) {
    window._setupUsername = username;
    const info = COUPLE[EMAIL_MAP[username]];
    document.getElementById("setup-who").textContent = info.emoji + " " + info.name;
  }
}
window.openSetup = (username) => showSetupScreen(true, username);
window.closeSetup = () => showSetupScreen(false);

window.setupKeydown = (e) => { if (e.key === "Enter") doSetupPassword(); };

// Permite Enter no campo de senha
window.loginKeydown = (e) => { if (e.key === "Enter") doLogin(); };

// ── FORÇA DE SENHA ────────────────────────────────────────────────────
window.checkPasswordStrength = (inputId, barId) => {
  const val = document.getElementById(inputId)?.value || "";
  const bar  = document.getElementById(barId);
  const lbl  = document.getElementById(barId + "-label");
  if (!bar) return;
  let score = 0;
  if (val.length >= 8)           score++;
  if (val.length >= 12)          score++;
  if (/[A-Z]/.test(val))         score++;
  if (/[0-9]/.test(val))         score++;
  if (/[^A-Za-z0-9]/.test(val))  score++;
  const levels = [
    { w:"0%",   bg:"transparent", label:"" },
    { w:"25%",  bg:"#ff4d6d",     label:"Fraca"    },
    { w:"50%",  bg:"#ffc94a",     label:"Razoável" },
    { w:"75%",  bg:"#4d9fff",     label:"Boa"      },
    { w:"100%", bg:"#00e5a0",     label:"Forte"    },
  ];
  const lv = levels[Math.min(score, 4)];
  bar.style.width      = lv.w;
  bar.style.background = lv.bg;
  if (lbl) { lbl.textContent = lv.label; lbl.style.color = lv.bg; }
};

// ── ESQUECI MINHA SENHA ───────────────────────────────────────────────
window.doResetPassword = async () => {
  const email = EMAIL_MAP[window._loginUsername];
  if (!email) { showResetMsg("Selecione seu usuário primeiro.", false); return; }

  const btn = document.getElementById("reset-btn");
  btn.textContent = "Enviando..."; btn.disabled = true;

  try {
    await sendPasswordResetEmail(auth, email);
    showResetMsg(`✅ Email enviado para ${email}!
Verifique sua caixa de entrada (e spam).`, true);
    btn.textContent = "Reenviar email";
    btn.disabled = false;
  } catch(e) {
    btn.textContent = "Enviar email de redefinição";
    btn.disabled = false;
    const msgs = {
      "auth/user-not-found": "Usuário não encontrado. Faça o 1º acesso primeiro.",
      "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos.",
      "auth/network-request-failed": "Sem conexão. Verifique sua internet.",
    };
    showResetMsg(msgs[e.code] || "Erro: " + e.message, false);
  }
};

function showResetMsg(msg, success) {
  const el = document.getElementById("reset-msg");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  el.style.background = success ? "#00e5a018" : "#ff4d6d18";
  el.style.color = success ? "#00e5a0" : "#ff4d6d";
  el.style.border = `1px solid ${success ? "#00e5a044" : "#ff4d6d44"}`;
}

window.doLogout = async () => {
  unsubs.forEach(u => u());
  unsubs = [];
  currentUserInfo = null;
  await signOut(auth);
  showLoginScreen();
};

// ── AUTH STATE ────────────────────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) { showLoginScreen(); return; }

  // Busca nome pelo email exato, ou por correspondência parcial (compatibilidade)
  let info = COUPLE[user.email];
  if (!info) {
    // Fallback: checa se o email contém parte conhecida (ex: conta antiga)
    const emailLower = user.email.toLowerCase();
    if (emailLower.includes("raysandra") || emailLower.includes("rayson")) {
      info = { name: "Rayson", emoji: "👨" };
    } else if (emailLower.includes("alecoelho") || emailLower.includes("alessandra")) {
      info = { name: "Alessandra", emoji: "👩" };
    }
  }
  currentUserInfo = {
    uid:   user.uid,
    email: user.email,
    name:  info?.name  || user.email,
    emoji: info?.emoji || "👤",
  };
  window._currentUser = currentUserInfo;

  showLoadingScreen(currentUserInfo.name);

  try {
    // Garante que o doc da casa existe
    const houseRef = doc(db, "houses", HOUSE_ID);
    const houseSnap = await getDoc(houseRef);
    if (!houseSnap.exists()) {
      await setDoc(houseRef, {
        salary: 0, extra: 0,
        themes: {},       // tema por usuário: { uid: "dark" }
        createdAt: new Date().toISOString(),
      });
    }

    // Salva tema pessoal do usuário no Firestore (se não existir ainda)
    const houseData = (await getDoc(houseRef)).data();
    const myTheme = houseData?.themes?.[user.uid] || "dark";
    S.theme = myTheme;

    startListeners(user);

  } catch(e) {
    document.getElementById("loading-msg").textContent = "❌ Erro: " + e.message;
    document.getElementById("loading-msg").style.color = "#ff4d6d";
    const btn = document.createElement("button");
    btn.textContent = "Sair e tentar novamente";
    btn.style.cssText = "margin-top:20px;padding:12px 24px;background:#00e5a0;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;color:#000";
    btn.onclick = () => doLogout();
    document.getElementById("loading-screen").appendChild(btn);
  }
});

// ── LISTENERS FIRESTORE ───────────────────────────────────────────────
function startListeners(user) {
  unsubs.forEach(u => u());
  unsubs = [];

  // Casa (salary, extra, themes por usuário)
  unsubs.push(onSnapshot(doc(db, "houses", HOUSE_ID), snap => {
    if (!snap.exists()) return;
    const d = snap.data();
    S.salary = d.salary || 0;
    S.extra  = d.extra  || 0;
    // Tema pessoal: só aplica o tema DO usuário atual
    const myTheme = d.themes?.[user.uid];
    if (myTheme && myTheme !== S.theme) {
      S.theme = myTheme;
    }
    if (document.getElementById("layout").style.display !== "none") scheduleRender("house");
  }));

  // Gastos, cartões, parcelamentos, metas — todos compartilhados
  unsubs.push(onSnapshot(collection(db, "houses", HOUSE_ID, "expenses"), snap => {
    S.expenses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (document.getElementById("layout").style.display !== "none") scheduleRender("expenses");
  }));
  unsubs.push(onSnapshot(collection(db, "houses", HOUSE_ID, "cards"), snap => {
    S.cards = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (document.getElementById("layout").style.display !== "none") scheduleRender("cards");
  }));
  unsubs.push(onSnapshot(collection(db, "houses", HOUSE_ID, "installments"), snap => {
    S.installments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (document.getElementById("layout").style.display !== "none") scheduleRender("installments");
  }));
  unsubs.push(onSnapshot(collection(db, "houses", HOUSE_ID, "goals"), snap => {
    S.goals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (document.getElementById("layout").style.display !== "none") scheduleRender("goals");
  }));

  showAppScreen();
}

// ── FIREBASE HELPERS ──────────────────────────────────────────────────
// Salva salary/extra na casa (compartilhado)
window.fbSaveHouse = async (data) => {
  await updateDoc(doc(db, "houses", HOUSE_ID), data);
};

// Salva tema PESSOAL (só afeta o usuário atual)
window.fbSaveTheme = async (themeKey) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await updateDoc(doc(db, "houses", HOUSE_ID), {
    [`themes.${uid}`]: themeKey,
  });
};

window.fbAdd = async (col, data) => {
  const ref = await addDoc(collection(db, "houses", HOUSE_ID, col), {
    ...data,
    _createdAt: new Date().toISOString(),
    _createdBy: auth.currentUser?.uid || "",
    _createdByName: window._currentUser?.name || "",
  });
  return ref.id;
};

window.fbUpdate = async (col, id, data) => {
  await updateDoc(doc(db, "houses", HOUSE_ID, col, id), data);
};

window.fbDel = async (col, id) => {
  await deleteDoc(doc(db, "houses", HOUSE_ID, col, id));
};

// ── TELA HELPERS ──────────────────────────────────────────────────────
function showLoginScreen() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("setup-screen").style.display = "none";
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("layout").style.display = "none";
  document.getElementById("bottom-nav").style.display = "none";
  // Volta para step 1
  const s1 = document.getElementById("step-select");
  const s2 = document.getElementById("step-password");
  if (s1) s1.style.display = "block";
  if (s2) s2.style.display = "none";
  const p = document.getElementById("login-pass");
  if (p) p.value = "";
  document.getElementById("login-error").style.display = "none";
}
function showLoadingScreen(name) {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("loading-screen").style.display = "flex";
  document.getElementById("layout").style.display = "none";
  document.getElementById("bottom-nav").style.display = "none";
  document.getElementById("loading-msg").textContent = `Carregando dados de ${name}...`;
}
function showAppScreen() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("layout").style.removeProperty("display");
  checkLayout();
  renderAll();
  setTab("home");
  updateUserBadge();
  if(window._checkAutoBackupOnLoad) window._checkAutoBackupOnLoad();
  if(window._checkNotificationsOnLoad) window._checkNotificationsOnLoad();
}
function showLoginLoading(v) {
  const btn = document.getElementById("login-btn");
  if (btn) { btn.textContent = v ? "Entrando..." : "Entrar"; btn.disabled = v; }
}
function showLoginError(msg) {
  const el = document.getElementById("login-error");
  if (el) { el.textContent = msg; el.style.display = "block"; }
}

// Expõe updateUserBadge e doLogout globalmente para serem chamados fora do módulo
window.updateUserBadge = function() {
  const u = window._currentUser;
  if (!u) return;
  const t = T();
  // Garante que sempre mostra o nome, nunca o email
  const displayName = u.name && !u.name.includes("@") ? u.name : (u.emoji === "👨" ? "Rayson" : "Alessandra");
  // Sidebar badge
  const el = document.getElementById("user-badge");
  if (el) el.innerHTML = `
    <div class="user-badge-inner">
      <div class="user-avatar" style="background:${t.accent}">${u.emoji}</div>
      <div style="min-width:0;flex:1">
        <p style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${displayName}</p>
        <p style="font-size:10px;color:${t.accent}">● Online</p>
      </div>
    </div>`;
  // Topbar (só mobile) — exibe apenas emoji + nome, sem caixa/badge
  const tb = document.getElementById("topbar-user");
  if (tb) {
    const mob = window.innerWidth < 768;
    tb.style.display = mob ? "flex" : "none";
    if (mob) {
      tb.innerHTML = `<span style="font-size:13px;font-weight:700;color:${t.muted}">${u.emoji} ${displayName}</span>`;
    }
  }
};