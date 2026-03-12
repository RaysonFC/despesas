/* ═══════════════════════════════════════════════════════════════
   MeuOrçamento — js/constants.js
   Temas, marcas de cartão, categorias e estado global
   ═══════════════════════════════════════════════════════════════ */

// ── TEMAS ─────────────────────────────────────────────────────────────
window.THEMES = {
  dark:  { name:"Dark",   icon:"🌙", bg:"#080810", card:"#10101c", cardLight:"#1c1c2e", accent:"#00e5a0", danger:"#ff4d6d", warn:"#ffc94a", blue:"#4d9fff", text:"#e8e8f4", muted:"#5a5a72", border:"#22223a", navBg:"#0d0d1a",  sidebar:"#0d0d1a"  },
  light: { name:"Light",  icon:"☀️", bg:"#f0f2f8", card:"#ffffff", cardLight:"#eef0f7", accent:"#00b37e", danger:"#e53e5e", warn:"#c87800", blue:"#2b7de9", text:"#1a1a2e", muted:"#8888aa", border:"#dde0ee", navBg:"#ffffff",  sidebar:"#e8eaf4"  },
  ocean: { name:"Ocean",  icon:"🌊", bg:"#071829", card:"#0d2337", cardLight:"#163452", accent:"#00cfff", danger:"#ff6b6b", warn:"#ffd166", blue:"#7eb8f7", text:"#d6eeff", muted:"#4d7a99", border:"#1a4060", navBg:"#0d2337",  sidebar:"#071829"  },
  sunset:{ name:"Sunset", icon:"🌅", bg:"#1a0a1e", card:"#271030", cardLight:"#3d1a4e", accent:"#ff9a3c", danger:"#ff4d6d", warn:"#ffdc5e", blue:"#c87af5", text:"#f5e6ff", muted:"#8a5a9e", border:"#4a1f60", navBg:"#271030",  sidebar:"#1a0a1e"  },
  forest:{ name:"Forest", icon:"🌿", bg:"#071510", card:"#0e2018", cardLight:"#1a3428", accent:"#4cde80", danger:"#ff6b6b", warn:"#f0c040", blue:"#60c8a0", text:"#d4f5e0", muted:"#4a7a5a", border:"#1e3d2a", navBg:"#0e2018",  sidebar:"#071510"  },
  rose:  { name:"Rose",   icon:"🌸", bg:"#fdf4f7", card:"#ffffff", cardLight:"#fce8ef", accent:"#e05c8a", danger:"#c0392b", warn:"#c87830", blue:"#8060c0", text:"#2d1020", muted:"#b080a0", border:"#f0c8d8", navBg:"#ffffff",  sidebar:"#fce8ef"  },
};

// ── BANDEIRAS DE CARTÃO ───────────────────────────────────────────────
window.BRANDS = {
  "Visa":       { color:"#1a1f71", text:"#fff", accent:"#f7a600",  label:"VISA"   },
  "Mastercard": { color:"#1d1d1d", text:"#fff", accent:"#eb001b",  label:"MC"     },
  "Elo":        { color:"#ffcb05", text:"#000", accent:"#00a4e0",  label:"ELO"    },
  "Nubank":     { color:"#7a1baf", text:"#fff", accent:"#e5d5f5",  label:"NU"     },
  "Inter":      { color:"#ff7a00", text:"#fff", accent:"#fff",     label:"INTER"  },
  "PicPay":     { color:"#11c76f", text:"#fff", accent:"#fff",     label:"PP"     },
  "Itaú":       { color:"#ec7000", text:"#fff", accent:"#003d7d",  label:"ITAÚ"   },
  "Bemol Visa": { color:"#3a5bc7", text:"#fff", accent:"#fff",     label:"bemol"  },
  "Renner":     { color:"#cc0000", text:"#fff", accent:"#fff",     label:"RENNER" },
  "Bradesco":   { color:"#c0003c", text:"#fff", accent:"#7b2ff7",  label:"BRAD",  gradient:"linear-gradient(135deg,#c0003c,#7b2ff7)" },
  "Neon":       { color:"#00bfff", text:"#fff", accent:"#00e5ff",  label:"NEON",  gradient:"linear-gradient(135deg,#00bfff,#00e5c8)" },
  "C6 Bank":    { color:"#2d2d2d", text:"#fff", accent:"#f5c518",  label:"C6"     },
  "XP":         { color:"#000",    text:"#fff", accent:"#ff6a00",  label:"XP"     },
  "Sicredi":    { color:"#006600", text:"#fff", accent:"#ffdd00",  label:"SICR"   },
};

// ── CATEGORIAS DE GASTO ───────────────────────────────────────────────
window.CATS = {
  "Alimentação": "🍔",
  "Transporte":  "🚗",
  "Saúde":       "💊",
  "Lazer":       "🎮",
  "Casa":        "🏠",
  "Educação":    "📚",
  "Roupas":      "👕",
  "Outros":      "💸",
};

// ── EMOJIS DE META ─────────────────────────────────────────────────────
window.GOAL_EMOJIS = ["🏖️","✈️","💻","📱","🚗","🏠","💍","🎓","🏋️","🎮","📷","🎸","🌍","👶","💰","🎯"];

// ── LABELS DAS ABAS ───────────────────────────────────────────────────
window.TAB_LABELS = {
  home:   "Início",
  cards:  "Cartões",
  all:    "Todos os Gastos",
  goals:  "Metas",
  health: "Saúde Financeira",
};

// ── ESTADO GLOBAL (em memória — Firebase é a fonte da verdade) ─────────
window.S = {
  theme:            "dark",
  salary:           0,
  extra:            0,
  expenses:         [],
  cards:            [],
  installments:     [],
  goals:            [],
  filterMonth:      "",
  currentTab:       "home",
  selectedBrand:    "Visa",
  selectedInstCard: null,
  selectedGoalEmoji:"🎯",
};

// ── HELPERS ───────────────────────────────────────────────────────────
window.T      = () => THEMES[S.theme] || THEMES.dark;
window.fmt    = v  => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(v || 0);
window.today  = () => new Date().toISOString().split("T")[0];
window.fmtD   = d  => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day:"2-digit", month:"short" });
window.curM   = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
};
window.fmtMonth = m => {
  if (!m) return "";
  const [y, mo] = m.split("-");
  return new Date(y, mo - 1).toLocaleDateString("pt-BR", { month:"long", year:"numeric" });
};
