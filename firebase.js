/* MeuOrçamento — firebase.js */

import { initializeApp }                               from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
         updatePassword, sendPasswordResetEmail,
         signOut, onAuthStateChanged,
         reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, collection,
         onSnapshot, setDoc, addDoc, updateDoc,
         deleteDoc, getDoc }                           from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
  const pass = document.getElementById("login-pass").value;
  if (!pass) { showLoginError("Digite sua senha!"); return; }
  const email = EMAIL_MAP[window._loginUsername];
  showLoginLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch(e) {
    showLoginLoading(false);
    if (e.code === "auth/invalid-credential" || e.code === "auth/user-not-found" || e.code === "auth/wrong-password") {
      showLoginError("Senha incorreta. Tente novamente.");
    } else if (e.code === "auth/too-many-requests") {
      showLoginError("Muitas tentativas. Aguarde alguns minutos.");
    } else {
      showLoginError("Erro: " + e.message);
    }
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
    if (document.getElementById("layout").style.display !== "none") renderAll();
  }));

  // Gastos, cartões, parcelamentos, metas — todos compartilhados
  unsubs.push(onSnapshot(collection(db, "houses", HOUSE_ID, "expenses"), snap => {
    S.expenses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (document.getElementById("layout").style.display !== "none") renderAll();
  }));
  unsubs.push(onSnapshot(collection(db, "houses", HOUSE_ID, "cards"), snap => {
    S.cards = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (document.getElementById("layout").style.display !== "none") renderAll();
  }));
  unsubs.push(onSnapshot(collection(db, "houses", HOUSE_ID, "installments"), snap => {
    S.installments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (document.getElementById("layout").style.display !== "none") renderAll();
  }));
  unsubs.push(onSnapshot(collection(db, "houses", HOUSE_ID, "goals"), snap => {
    S.goals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (document.getElementById("layout").style.display !== "none") renderAll();
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
  const badgeHTML = `<div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:14px;border:1px solid ${t.border};background:${t.cardLight}">
    <div style="width:32px;height:32px;border-radius:50%;background:${t.accent};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${u.emoji}</div>
    <div style="min-width:0;flex:1">
      <p style="font-size:13px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.name}</p>
      <p style="font-size:10px;color:${t.muted}">● Online</p>
    </div>
    <button onclick="doLogout()" title="Sair" style="background:none;border:none;color:${t.muted};font-size:18px;padding:2px 6px;cursor:pointer">↩ Sair</button>
  </div>`;
  const el = document.getElementById("user-badge");
  if (el) el.innerHTML = badgeHTML;
  // Topbar user (mobile)
  const tb = document.getElementById("topbar-user");
  if (tb) {
    tb.style.display = "flex";
    tb.innerHTML = `<div style="display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:12px;border:1px solid ${t.border};background:${t.cardLight}">
      <span style="font-size:16px">${u.emoji}</span>
      <span style="font-size:13px;font-weight:700">${u.name}</span>
      <button onclick="doLogout()" style="background:none;border:none;color:${t.muted};font-size:13px;font-weight:600;padding:0 0 0 6px;cursor:pointer" title="Sair">↩ Sair</button>
    </div>`;
  }
};