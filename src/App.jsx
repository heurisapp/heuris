import React, { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// HEURIS — acabamento premium, nível estúdio
// A ousadia está concentrada no neurônio. Tudo ao redor é
// quieto, preciso e disciplinado. Profundidade real em camadas,
// microinterações com mola, textura de ruído sobre a luz.
// ============================================================

// ---- design tokens ----
const C = {
  void: "#06070C",
  base: "#0A0C13",
  raised: "#10131C",
  raisedHi: "#151925",
  line: "rgba(255,255,255,0.06)",
  lineHi: "rgba(255,255,255,0.11)",
  ink: "#F4F6FB",
  inkSoft: "#AEB7C7",
  inkFaint: "#6B7488",
  inkGhost: "#3D4553",
  // via nova — teal frio luminoso
  nova: "#5BF0DB",
  novaDeep: "#2AB9A6",
  novaGlow: "rgba(91,240,219,0.45)",
  novaWash: "rgba(91,240,219,0.06)",
  // identidade — índigo suave
  id: "#9AA6FF",
  idGlow: "rgba(154,166,255,0.4)",
  idWash: "rgba(154,166,255,0.07)",
  // via velha — âmbar dessaturado, adormecido
  velha: "#B78A66",
  velhaGlow: "rgba(183,138,102,0.25)",
  // sinal de ajuste — bronze
  bronze: "#D9B87E",
};

const F = {
  disp: "'Space Grotesk',system-ui,sans-serif",
  text: "'Inter',system-ui,-apple-system,sans-serif",
  num: "'Space Grotesk',system-ui,sans-serif",
};

// ---- injeta fontes + reset + textura de ruído + keyframes ----
function useAtmosfera() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;450;500;600;700&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      body { margin: 0; }
      ::selection { background: rgba(91,240,219,0.25); color: #fff; }
      @keyframes heurisRise {
        from { opacity: 0; transform: translateY(14px) scale(0.99); }
        to { opacity: 1; transform: none; }
      }
      @keyframes heurisGlow {
        0%,100% { opacity: 0.5; } 50% { opacity: 0.85; }
      }
      @keyframes heurisSweep {
        from { transform: translateX(-120%); } to { transform: translateX(120%); }
      }
      textarea::placeholder { color: ${C.inkGhost}; }
      textarea:focus { border-color: ${C.novaGlow} !important; box-shadow: 0 0 0 3px ${C.novaWash}; }
      .heuris-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

// textura de ruído como data-uri, aplicada por cima de tudo
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.028'/%3E%3C/svg%3E\")";

// ---------- dados ----------
const HEURISTICAS = [
  {
    id: "comer", nome: "saciedade-consciente", fase: "em construção",
    padraoVelho: "comer por prazer mesmo já estando saciada",
    identidade: "alguém que percebe quando o corpo já está biologicamente satisfeito",
    gatilho: "sinto vontade de continuar comendo mesmo sem fome real",
    acao: "faço uma pausa e pergunto ao meu corpo se ele ainda precisa",
    recompensa: "a leveza de comer no meu tempo, sem o desconforto de exceder",
    construcoes: 9, negacoes: 7, sequencia: 3, ultimos7: [1, 0, 1, 1, 0, 1, 1],
  },
  {
    id: "fujona", nome: "resposta-serena", fase: "em construção",
    padraoVelho: "silenciar mensagens que parecem trazer cobrança",
    identidade: "alguém que encara o que precisa ser encarado",
    gatilho: "sinto o aperto no peito e a vontade de silenciar a notificação",
    acao: "abro a mensagem, leio até o fim e respondo que retorno até amanhã",
    recompensa: "o alívio de ter encarado, no lugar do peso de adiar",
    construcoes: 14, negacoes: 11, sequencia: 4, ultimos7: [1, 1, 0, 1, 1, 1, 0],
  },
  {
    id: "agrada", nome: "escolha-consciente", fase: "se consolidando",
    padraoVelho: "dizer sim para evitar qualquer desconforto",
    identidade: "alguém que honra o próprio sim",
    gatilho: "sinto o nó na garganta e o sim já querendo escapar",
    acao: "digo que preciso de um instante para pensar antes de responder",
    recompensa: "a paz de não me trair sem precisar decepcionar ninguém",
    construcoes: 27, negacoes: 24, sequencia: 9, ultimos7: [1, 1, 1, 1, 0, 1, 1],
  },
  {
    id: "adiador", nome: "primeiro-passo", fase: "recém-plantada",
    padraoVelho: "fugir para o celular diante de uma tarefa grande",
    identidade: "alguém que começa, mesmo pequeno",
    gatilho: "percebo a mão indo para o celular diante de uma tarefa grande",
    acao: "faço só dois minutos dela, sem nenhuma meta de terminar",
    recompensa: "a leveza de ter começado, que dissolve o peso de adiar",
    construcoes: 3, negacoes: 2, sequencia: 1, ultimos7: [0, 0, 1, 0, 1, 0, 1],
  },
];

const cons = (u7) => u7.reduce((a, b) => a + b, 0) / u7.length;

// ============================================================
// hook de mola para hover/press (física, não transição linear)
// ============================================================
function usePress() {
  const [state, setState] = useState({ hover: false, press: false });
  const bind = {
    onMouseEnter: () => setState((s) => ({ ...s, hover: true })),
    onMouseLeave: () => setState({ hover: false, press: false }),
    onMouseDown: () => setState((s) => ({ ...s, press: true })),
    onMouseUp: () => setState((s) => ({ ...s, press: false })),
    onTouchStart: () => setState((s) => ({ ...s, press: true })),
    onTouchEnd: () => setState({ hover: false, press: false }),
  };
  return [state, bind];
}

// ============================================================
// BOTÃO premium — profundidade, brilho de varredura, mola
// ============================================================
function Botao({ children, onClick, variante = "primario", full }) {
  const [s, bind] = usePress();
  const base = {
    position: "relative", overflow: "hidden", border: "none",
    padding: "13px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600,
    fontFamily: F.text, cursor: "pointer", letterSpacing: -0.1,
    transition: "transform .18s cubic-bezier(.2,.9,.3,1.2), box-shadow .2s ease, background .2s ease",
    transform: s.press ? "scale(0.97)" : s.hover ? "translateY(-1px)" : "none",
    width: full ? "100%" : "auto",
  };
  const estilos = {
    primario: {
      background: `linear-gradient(135deg, ${C.nova}, ${C.novaDeep})`,
      color: C.void,
      boxShadow: s.hover
        ? `0 8px 30px ${C.novaGlow}, inset 0 1px 0 rgba(255,255,255,0.35)`
        : `0 4px 18px rgba(91,240,219,0.28), inset 0 1px 0 rgba(255,255,255,0.3)`,
    },
    fantasma: {
      background: s.hover ? C.raisedHi : "rgba(255,255,255,0.03)",
      color: C.inkSoft,
      boxShadow: `inset 0 0 0 1px ${s.hover ? C.lineHi : C.line}`,
    },
  };
  return (
    <button onClick={onClick} {...bind} style={{ ...base, ...estilos[variante] }}>
      {variante === "primario" && s.hover && (
        <span style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          width: "60%", animation: "heurisSweep 0.9s ease",
        }} />
      )}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </button>
  );
}

// ============================================================
// AFIRMAÇÃO
// ============================================================
function Afirmacao({ h, size = "m", curta }) {
  const escala = { s: 15, m: 17, l: 23 }[size];
  const lh = { s: 1.55, m: 1.6, l: 1.5 }[size];
  return (
    <div style={{ fontSize: escala, lineHeight: lh, color: C.ink, fontFamily: F.disp, fontWeight: 400, letterSpacing: -0.4 }}>
      <span style={{ color: C.id, fontWeight: 600 }}>Eu sou</span> {h.identidade}.
      {!curta && (<>{" "}<span style={{ color: C.nova, fontWeight: 600 }}>Quando</span> {h.gatilho},{" "}<span style={{ color: C.nova, fontWeight: 600 }}>eu</span> {h.acao}.</>)}
    </div>
  );
}

// ============================================================
// NEURÔNIO — peça de assinatura, brilho volumétrico
// ============================================================
function Neuronio({ construcoes, negacoes, alto }) {
  const maxRef = 30;
  const velhaVida = Math.max(0.16, 1 - Math.min(negacoes, maxRef) / maxRef * 0.84);
  const novaVida = Math.min(1, construcoes / maxRef);
  const [t, setT] = useState(0);
  const raf = useRef();
  useEffect(() => {
    let mounted = true;
    const loop = () => { if (!mounted) return; setT((x) => x + 0.008); raf.current = requestAnimationFrame(loop); };
    raf.current = requestAnimationFrame(loop);
    return () => { mounted = false; cancelAnimationFrame(raf.current); };
  }, []);
  const cx = 260, cy = 185, rad = (a) => (a * Math.PI) / 180;
  const gV = [{ a: 202, l: 145 }, { a: 226, l: 122 }, { a: 168, l: 132 }, { a: 250, l: 104 }, { a: 186, l: 114 }, { a: 214, l: 96 }];
  const gN = [{ a: -22, l: 148 }, { a: 10, l: 126 }, { a: -46, l: 116 }, { a: 36, l: 106 }, { a: 2, l: 136 }, { a: -32, l: 98 }];

  const ramo = (g, vida, cor, glow, idx, lado, dorm) => {
    const ext = 0.32 + 0.68 * vida;
    const breathe = 1 + Math.sin(t * 1.1 + idx) * 0.015 * vida;
    const x2 = cx + Math.cos(rad(g.a)) * g.l * ext * breathe;
    const y2 = cy + Math.sin(rad(g.a)) * g.l * ext * breathe;
    const nSub = Math.round(1 + vida * 3.2), sub = [];
    for (let i = 0; i < nSub; i++) {
      const sa = g.a + (i - nSub / 2) * 19 + Math.sin(t * 0.7 + idx) * 4;
      const sl = g.l * 0.4 * vida;
      const sx = x2 + Math.cos(rad(sa)) * sl, sy = y2 + Math.sin(rad(sa)) * sl;
      const nT = Math.round(vida * 2);
      const tips = [];
      for (let j = 0; j < nT; j++) {
        const ta = sa + (j - nT / 2) * 24;
        tips.push({ x: sx + Math.cos(rad(ta)) * sl * 0.5, y: sy + Math.sin(rad(ta)) * sl * 0.5 });
      }
      sub.push({ x: sx, y: sy, tips });
    }
    const pulso = (Math.sin(t * 1.5 + idx * 1.3) + 1) / 2;
    const px = cx + (x2 - cx) * pulso, py = cy + (y2 - cy) * pulso;
    const showPulse = dorm ? vida > 0.14 && Math.sin(t * 0.35 + idx) > 0.9 : vida > 0.1;
    return (
      <g key={lado + idx} opacity={0.2 + vida * 0.8}>
        <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={cor} strokeWidth={1.2 + vida * 2.8} strokeLinecap="round"
          strokeDasharray={dorm ? "1.5 5" : "none"}
          style={{ filter: vida > 0.35 && !dorm ? `drop-shadow(0 0 6px ${glow})` : "none" }} />
        {sub.map((sp, i) => (
          <g key={i}>
            <line x1={x2} y1={y2} x2={sp.x} y2={sp.y} stroke={cor} strokeWidth={0.8 + vida * 1.5} strokeLinecap="round" opacity={0.62} strokeDasharray={dorm ? "1.5 5" : "none"} />
            {sp.tips.map((tp, j) => (
              <line key={j} x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y} stroke={cor} strokeWidth={0.6 + vida} strokeLinecap="round" opacity={0.4} />
            ))}
            <circle cx={sp.x} cy={sp.y} r={1.3 + vida * 2.4} fill={cor} opacity={dorm ? 0.45 : 0.9}
              style={{ filter: vida > 0.45 && !dorm ? `drop-shadow(0 0 4px ${glow})` : "none" }} />
          </g>
        ))}
        {showPulse && (
          <circle cx={px} cy={py} r={2.4 + vida * 2.4} fill="#fff" opacity={(dorm ? 0.3 : 1) * vida}
            style={{ filter: `drop-shadow(0 0 7px ${glow})` }} />
        )}
      </g>
    );
  };

  const H = alto ? 380 : 340;
  return (
    <svg viewBox={`0 0 520 ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <radialGradient id="somaG" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" /><stop offset="40%" stopColor="#E4EAF3" /><stop offset="100%" stopColor="#5A6476" />
        </radialGradient>
        <radialGradient id="haloNova" cx="72%" cy="50%" r="42%">
          <stop offset="0%" stopColor={C.nova} stopOpacity={novaVida * 0.16} />
          <stop offset="100%" stopColor={C.nova} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="haloVelha" cx="28%" cy="50%" r="38%">
          <stop offset="0%" stopColor={C.velha} stopOpacity={velhaVida * 0.08} />
          <stop offset="100%" stopColor={C.velha} stopOpacity="0" />
        </radialGradient>
        <pattern id="gridG" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="520" height={H} fill="url(#gridG)" />
      <rect width="520" height={H} fill="url(#haloNova)" />
      <rect width="520" height={H} fill="url(#haloVelha)" />
      {gV.map((g, i) => ramo(g, velhaVida, C.velha, C.velhaGlow, i, "v", true))}
      {gN.map((g, i) => ramo(g, novaVida, C.nova, C.novaGlow, i, "n", false))}
      {/* halo do soma */}
      <circle cx={cx} cy={cy} r={40} fill="#fff" opacity={0.06 + Math.sin(t) * 0.02} style={{ filter: "blur(8px)" }} />
      <circle cx={cx} cy={cy} r={27} fill="url(#somaG)" style={{ filter: "drop-shadow(0 0 16px rgba(255,255,255,0.3))" }} />
      <circle cx={cx - 8} cy={cy - 9} r={7} fill="#fff" opacity={0.5} style={{ filter: "blur(3px)" }} />
    </svg>
  );
}

// ============================================================
// medidor de 7 dias — barras com profundidade
// ============================================================
function Semana({ u7, seq }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 500 }}>Últimos sete gatilhos</span>
        <span style={{ fontSize: 12.5, color: cons(u7) >= 0.6 ? C.nova : C.inkFaint, fontFamily: F.num, fontWeight: 500 }}>
          {seq} seguidos
        </span>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {u7.map((v, i) => (
          <div key={i} style={{
            flex: 1, height: 26, borderRadius: 6,
            background: v ? `linear-gradient(180deg, ${C.nova}, ${C.novaDeep})` : "rgba(255,255,255,0.035)",
            boxShadow: v ? `0 3px 12px ${C.novaGlow}, inset 0 1px 0 rgba(255,255,255,0.3)` : `inset 0 0 0 1px ${C.line}`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CARD
// ============================================================
function Card({ h, onOpen, delay }) {
  const [s, bind] = usePress();
  const nivel = Math.min(1, h.construcoes / 30);
  const rot = nivel > 0.75 ? "caminho novo dominante" : nivel > 0.4 ? "caminho novo ganhando força" : "caminho novo em formação";
  return (
    <button onClick={onOpen} {...bind}
      style={{
        textAlign: "left", position: "relative", overflow: "hidden", cursor: "pointer",
        background: s.hover
          ? `linear-gradient(165deg, ${C.raisedHi}, ${C.raised})`
          : `linear-gradient(165deg, ${C.raised}, ${C.base})`,
        borderRadius: 20, padding: "24px 26px", fontFamily: F.text,
        boxShadow: s.hover
          ? `0 24px 60px rgba(0,0,0,0.55), inset 0 0 0 1px ${C.lineHi}, inset 0 1px 0 rgba(255,255,255,0.08)`
          : `0 4px 20px rgba(0,0,0,0.35), inset 0 0 0 1px ${C.line}`,
        transform: s.press ? "scale(0.985)" : s.hover ? "translateY(-4px)" : "none",
        transition: "transform .28s cubic-bezier(.2,.9,.3,1.1), box-shadow .3s ease, background .3s ease",
        display: "flex", flexDirection: "column", gap: 16,
        animation: `heurisRise .6s cubic-bezier(.2,.8,.3,1) ${delay}s both`,
      }}>
      {/* filete de luz superior no hover */}
      <div style={{
        position: "absolute", top: 0, left: 24, right: 24, height: 1,
        background: `linear-gradient(90deg, transparent, ${C.novaGlow}, transparent)`,
        opacity: s.hover ? 1 : 0, transition: "opacity .3s ease",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12.5, color: C.inkFaint, fontFamily: F.num, fontWeight: 500, letterSpacing: -0.2 }}>{h.nome}</span>
        <span style={{
          fontSize: 11, color: h.fase === "se consolidando" ? C.nova : C.inkFaint,
          padding: "4px 10px", borderRadius: 7, fontWeight: 500,
          boxShadow: `inset 0 0 0 1px ${h.fase === "se consolidando" ? "rgba(91,240,219,0.3)" : C.line}`,
          background: h.fase === "se consolidando" ? C.novaWash : "transparent",
        }}>{h.fase}</span>
      </div>
      <div style={{ fontSize: 12.5, color: C.velha, fontStyle: "italic", opacity: 0.8, lineHeight: 1.4 }}>
        no lugar de {h.padraoVelho}
      </div>
      <Afirmacao h={h} size="s" curta />
      <div style={{ marginTop: 2 }}>
        <div style={{ display: "flex", gap: 3, marginBottom: 9 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 5, borderRadius: 3,
              background: i / 10 < nivel ? `linear-gradient(90deg, ${C.novaDeep}, ${C.nova})` : "rgba(255,255,255,0.05)",
              boxShadow: i / 10 < nivel ? `0 0 8px ${C.novaGlow}` : "none",
              transition: "all .3s ease",
            }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: C.inkFaint }}>{rot}</span>
      </div>
    </button>
  );
}

// ============================================================
// DETALHE
// ============================================================
function Detalhe({ h, onVoltar, onRegistrar }) {
  const [perguntando, setPerguntando] = useState(false);
  const responder = (ap) => { onRegistrar(h.id, ap ? "ambos" : "construcao"); setPerguntando(false); };
  return (
    <div style={{ animation: "heurisRise .5s cubic-bezier(.2,.8,.3,1) both" }}>
      <Voltar onClick={onVoltar}>todas as heurísticas</Voltar>

      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 12.5, color: C.inkFaint, fontFamily: F.num, marginBottom: 8 }}>{h.nome}</div>
        <div style={{ fontSize: 13, color: C.velha, fontStyle: "italic", marginBottom: 22, opacity: 0.85 }}>no lugar de {h.padraoVelho}</div>
        <div style={{ maxWidth: 600, margin: "0 auto" }}><Afirmacao h={h} size="l" /></div>
        <div style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.7, maxWidth: 540, margin: "20px auto 0", fontStyle: "italic" }}>
          e assim eu alcanço {h.recompensa}.
        </div>
      </div>

      {/* palco do neurônio, com profundidade */}
      <div style={{
        position: "relative", borderRadius: 24, margin: "28px 0 8px", overflow: "hidden",
        background: `radial-gradient(ellipse at 50% 40%, ${C.raised}, ${C.void})`,
        boxShadow: `inset 0 0 0 1px ${C.line}, inset 0 2px 40px rgba(0,0,0,0.5)`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 22px 0" }}>
          <div>
            <div style={{ fontSize: 12.5, color: C.velha, fontWeight: 600 }}>caminho antigo</div>
            <div style={{ fontSize: 11.5, color: C.inkFaint, fontFamily: F.num, marginTop: 2 }}>adormecido · {h.negacoes} vezes enfraquecido</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12.5, color: C.nova, fontWeight: 600 }}>caminho novo</div>
            <div style={{ fontSize: 11.5, color: C.inkFaint, fontFamily: F.num, marginTop: 2 }}>{h.construcoes} vezes percorrido</div>
          </div>
        </div>
        <Neuronio construcoes={h.construcoes} negacoes={h.negacoes} alto />
      </div>

      <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.8, textAlign: "center", maxWidth: 520, margin: "0 auto 30px" }}>
        O caminho antigo não é apagado. Ele fica adormecido, um traço fraco que pode reagir sob cansaço ou tensão. O caminho novo, a cada vez que você o percorre, se torna o primeiro que o seu cérebro encontra.
      </p>

      <div style={{ maxWidth: 440, margin: "0 auto 32px" }}><Semana u7={h.ultimos7} seq={h.sequencia} /></div>

      {!perguntando ? (
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Botao onClick={() => setPerguntando(true)}>Segui minha heurística agora</Botao>
          <Botao variante="fantasma" onClick={() => onRegistrar(h.id, "recaida")}>O antigo venceu desta vez</Botao>
        </div>
      ) : (
        <div style={{ ...cartao(460), textAlign: "center", animation: "heurisRise .35s ease both" }}>
          <div style={{ fontSize: 15, color: C.ink, marginBottom: 20, lineHeight: 1.65 }}>
            O gatilho antigo chegou a aparecer, e você seguiu a heurística mesmo assim?
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Botao onClick={() => responder(true)}>Sim, apareceu e eu segui</Botao>
            <Botao variante="fantasma" onClick={() => responder(false)}>Não, só pratiquei</Botao>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CRIAR
// ============================================================
function Criar({ onVoltar }) {
  const [passo, setPasso] = useState(0);
  const [d, setD] = useState({ padraoVelho: "", desejo: "", identidade: "", gatilho: "", acao: "", recompensa: "" });
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));

  const coleta = [
    { chave: "padraoVelho", pre: "Hoje eu", cor: C.velha,
      t: "Qual padrão você quer enfraquecer?",
      sub: "Comece pelo que incomoda. Descreva a reação automática que você repete e gostaria de deixar para trás, sem se julgar por ela. É esse caminho antigo que vamos deixar adormecer.",
      ex: "como por impulso mesmo quando já não tenho fome",
      dica: "Reconhecer o padrão, sem se culpar, já é o primeiro movimento. Não vamos apagá-lo, vamos construir um caminho mais forte ao lado dele." },
    { chave: "desejo", pre: "Eu queria ser", cor: C.id, ia: true,
      t: "E quem você gostaria de ser no lugar?",
      sub: "Diga com suas palavras, mesmo que ainda soe amplo. Eu ajudo você a transformar esse desejo numa identidade precisa, do tipo que o cérebro reconhece e segue.",
      ex: "uma pessoa com mais autocontrole",
      dica: "Um desejo amplo é um bom ponto de partida. O trabalho agora é afiná-lo até virar algo concreto o bastante para guiar uma ação." },
    { chave: "gatilho", pre: "Quando", cor: C.nova,
      t: "Onde esse padrão começa dentro de você?",
      sub: "Procure o instante exato em que ele se ativa, de preferência algo que você sente no corpo. É esse sinal que vai avisar você na hora certa.",
      ex: "sinto vontade de continuar comendo mesmo sem fome real",
      dica: "Um gatilho ligado ao corpo é reconhecível a tempo. Uma sensação física clara funciona como aviso, enquanto um estado vago passa sem ser notado." },
    { chave: "acao", pre: "Eu", cor: C.nova,
      t: "O que você faz nesse momento, no lugar do de sempre?",
      sub: "Escolha um gesto pequeno, concreto e possível até num dia cansado. Precisa ser a resposta que você consegue repetir muitas vezes.",
      ex: "faço uma pausa e pergunto ao meu corpo se ele ainda precisa",
      dica: "A nova ligação se forma pela repetição, não pela intensidade. Um passo pequeno e frequente constrói mais do que um gesto grande e raro." },
    { chave: "recompensa", pre: "E assim eu alcanço", cor: C.nova,
      t: "O que você ganha de verdade ao agir assim?",
      sub: "A heurística precisa cuidar da mesma necessidade que o padrão antigo protegia, por um caminho que não custe tão caro a você.",
      ex: "a leveza de comer no meu tempo, sem o desconforto de exceder",
      dica: "O cérebro só troca um caminho por outro quando o novo entrega o que ele buscava. Nomear isso é o que dá sentido à mudança." },
  ];
  const p = coleta[passo];
  const naOficina = passo === coleta.length;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", animation: "heurisRise .5s ease both" }}>
      <Voltar onClick={onVoltar}>deixar para depois</Voltar>

      {/* progresso segmentado */}
      <div style={{ display: "flex", gap: 7, marginBottom: 44 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            height: 4, flex: 1, borderRadius: 3,
            background: i < passo ? C.novaDeep : i === passo ? C.nova : "rgba(255,255,255,0.06)",
            boxShadow: i <= passo ? `0 0 10px ${C.novaGlow}` : "none",
            transition: "all .4s cubic-bezier(.2,.8,.3,1)",
          }} />
        ))}
      </div>

      {!naOficina ? (
        <div key={passo} style={{ animation: "heurisRise .4s ease both" }}>
          <h1 style={{ margin: "0 0 14px", fontSize: 29, fontFamily: F.disp, fontWeight: 600, lineHeight: 1.22, letterSpacing: -0.6, color: C.ink }}>{p.t}</h1>
          <p style={{ fontSize: 15.5, color: C.inkSoft, lineHeight: 1.7, marginBottom: 26 }}>{p.sub}</p>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
            <span style={{ fontSize: 15, color: p.cor, fontWeight: 600, fontFamily: F.disp, paddingTop: 16, whiteSpace: "nowrap" }}>{p.pre}</span>
            <textarea value={d[p.chave]} onChange={(e) => set(p.chave, e.target.value)} placeholder={p.ex}
              style={campoTexto(88)} />
          </div>

          {p.ia && (
            <div style={{ ...cartao(null), background: `linear-gradient(160deg, ${C.idWash}, transparent)`, boxShadow: `inset 0 0 0 1px rgba(154,166,255,0.28)`, marginBottom: 20, padding: 20 }}>
              <div style={{ display: "flex", gap: 13, marginBottom: 16 }}>
                <Selo cor={C.id} glow={C.idGlow} letra="H" />
                <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.65 }}>
                  Autocontrole costuma soar como uma luta contra você mesma, e isso raramente se sustenta. Que tal transformar em uma percepção, algo que você nota, não algo que você reprime. Veja se esta versão ressoa.
                </div>
              </div>
              <div style={{ background: "rgba(154,166,255,0.05)", boxShadow: `inset 0 0 0 1px rgba(154,166,255,0.35)`, borderRadius: 12, padding: "16px 18px", fontSize: 15.5, color: C.ink, fontFamily: F.disp, lineHeight: 1.6, marginBottom: 16, letterSpacing: -0.3 }}>
                <span style={{ color: C.id, fontWeight: 600 }}>Eu sou</span> alguém que percebe quando o corpo já está biologicamente satisfeito, e quando sinto isso, perco a vontade de comer apenas por prazer.
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Botao onClick={() => { set("identidade", "alguém que percebe quando o corpo já está biologicamente satisfeito"); setPasso(passo + 1); }}>Essa é a minha identidade</Botao>
                <Botao variante="fantasma">Quero ajustar</Botao>
              </div>
            </div>
          )}

          <Dica>{p.dica}</Dica>

          <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
            {passo > 0 && <Botao variante="fantasma" onClick={() => setPasso(passo - 1)}>voltar</Botao>}
            {!p.ia && <Botao full onClick={() => setPasso(passo + 1)}>seguir</Botao>}
          </div>
        </div>
      ) : (
        <Oficina d={d} setPasso={setPasso} set={set} onConcluir={onVoltar} />
      )}
    </div>
  );
}

function Oficina({ d, setPasso, set, onConcluir }) {
  const h = {
    identidade: d.identidade || "alguém que percebe quando o corpo já está biologicamente satisfeito",
    gatilho: d.gatilho || "sinto vontade de continuar comendo mesmo sem fome real",
    acao: d.acao || "faço uma pausa e pergunto ao meu corpo se ele ainda precisa",
    recompensa: d.recompensa || "a leveza de comer no meu tempo, sem o desconforto de exceder",
  };
  const checagens = [
    { ok: h.identidade.length > 8, r: "A identidade está clara", bom: "A frase parte de quem você quer ser, e é isso que sustenta cada escolha.", aj: "Descreva a pessoa que você está se tornando, para dar raiz à mudança." },
    { ok: /(sinto|percebo|vejo|escuto|noto|bate|sobe|aperta|calor|nó|vontade|mão)/i.test(h.gatilho), r: "O gatilho é perceptível", bom: "Está ligado a algo que você percebe, então dá para reconhecer na hora.", aj: "Ancore o gatilho numa sensação do corpo, para notá-lo a tempo." },
    { ok: /(faço|abro|respiro|digo|leio|paro|repito|respondo|anoto|saio|pausa|pergunto)/i.test(h.acao) && h.acao.length < 90, r: "A ação é concreta e pequena", bom: "É um gesto observável e enxuto, do tamanho que sobrevive a um dia cansado.", aj: "Descreva um gesto único e pequeno, algo que daria para ver você fazendo." },
    { ok: h.recompensa.length > 10, r: "A recompensa está nomeada", bom: "A frase diz por que vale a pena, e é isso que convence o cérebro a trocar.", aj: "Nomeie o que você ganha de verdade, para dar sentido à mudança." },
  ];
  return (
    <div style={{ animation: "heurisRise .4s ease both" }}>
      <h1 style={{ margin: "0 0 12px", fontSize: 29, fontFamily: F.disp, fontWeight: 600, lineHeight: 1.22, letterSpacing: -0.6, color: C.ink }}>Esta é a heurística que você vai instalar.</h1>
      <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.7, marginBottom: 28 }}>Ela vai aparecer para você todos os dias e é o que o seu cérebro vai aprender a executar sozinho. Leia com calma, sinta se soa como você, e ajuste o que quiser.</p>

      {/* frase de assinatura, com brilho */}
      <div style={{
        position: "relative", overflow: "hidden", borderRadius: 20, padding: 30, marginBottom: 24,
        background: `linear-gradient(160deg, ${C.idWash}, ${C.novaWash})`,
        boxShadow: `inset 0 0 0 1px rgba(91,240,219,0.3), 0 20px 50px rgba(0,0,0,0.4), inset 0 0 60px rgba(91,240,219,0.03)`,
      }}>
        <div style={{ position: "absolute", top: 0, left: 30, right: 30, height: 1, background: `linear-gradient(90deg, transparent, ${C.novaGlow}, transparent)` }} />
        <div style={{ fontSize: 22, lineHeight: 1.58, fontFamily: F.disp, fontWeight: 400, color: C.ink, letterSpacing: -0.4 }}>
          <span style={{ color: C.id, fontWeight: 600 }}>Eu sou</span> {h.identidade}.{" "}
          <span style={{ color: C.nova, fontWeight: 600 }}>Quando</span> {h.gatilho},{" "}
          <span style={{ color: C.nova, fontWeight: 600 }}>eu</span> {h.acao},{" "}
          <span style={{ color: C.nova, fontWeight: 600 }}>e assim eu alcanço</span> {h.recompensa}.
        </div>
      </div>

      {/* checagens */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {checagens.map((c, i) => (
          <div key={i} style={{
            display: "flex", gap: 13, alignItems: "flex-start", borderRadius: 14, padding: "14px 16px",
            background: c.ok ? C.novaWash : "rgba(217,184,126,0.05)",
            boxShadow: `inset 0 0 0 1px ${c.ok ? "rgba(91,240,219,0.25)" : "rgba(217,184,126,0.28)"}`,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1,
              background: c.ok ? `linear-gradient(135deg, ${C.nova}, ${C.novaDeep})` : "transparent",
              boxShadow: c.ok ? `0 2px 8px ${C.novaGlow}` : `inset 0 0 0 1.5px ${C.bronze}`,
              display: "flex", alignItems: "center", justifyContent: "center", color: C.void, fontSize: 12, fontWeight: 800,
            }}>{c.ok ? "✓" : ""}</div>
            <div>
              <div style={{ fontSize: 13.5, color: C.ink, fontWeight: 600, marginBottom: 3 }}>{c.r}</div>
              <div style={{ fontSize: 13, color: c.ok ? C.inkSoft : C.bronze, lineHeight: 1.55 }}>{c.ok ? c.bom : c.aj}</div>
            </div>
          </div>
        ))}
      </div>

      {/* editar componentes */}
      <div style={{ marginBottom: 28 }}>
        {[["identidade", "Eu sou", C.id], ["gatilho", "Quando", C.nova], ["acao", "Eu", C.nova], ["recompensa", "E assim eu alcanço", C.nova]].map(([k, r, cor]) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, color: cor, marginBottom: 7, fontWeight: 600, fontFamily: F.disp }}>{r}</div>
            <textarea value={h[k]} onChange={(e) => set(k, e.target.value)} style={campoTexto(50)} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <Botao variante="fantasma" onClick={() => setPasso(4)}>voltar</Botao>
        <Botao full onClick={onConcluir}>Guardar minha heurística</Botao>
      </div>
    </div>
  );
}

// ============================================================
// peças de apoio
// ============================================================
function Selo({ cor, glow, letra }) {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: 9, flexShrink: 0,
      background: `linear-gradient(135deg, ${cor}, ${cor}99)`, color: C.void,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14, fontWeight: 700, fontFamily: F.disp,
      boxShadow: `0 3px 12px ${glow}, inset 0 1px 0 rgba(255,255,255,0.4)`,
    }}>{letra}</div>
  );
}

function Dica({ children }) {
  return (
    <div style={{
      fontSize: 13.5, color: C.bronze, lineHeight: 1.65, borderRadius: 12, padding: "15px 17px",
      background: "rgba(217,184,126,0.045)", boxShadow: `inset 0 0 0 1px rgba(217,184,126,0.16)`,
      display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <span style={{ color: C.bronze, opacity: 0.7, fontSize: 16, lineHeight: 1.3 }}>◆</span>
      <span>{children}</span>
    </div>
  );
}

function Voltar({ onClick, children }) {
  const [s, bind] = usePress();
  return (
    <button onClick={onClick} {...bind} style={{
      background: "none", border: "none", cursor: "pointer", padding: "0 0 0 0",
      color: s.hover ? C.inkSoft : C.inkFaint, fontSize: 13.5, fontFamily: F.text,
      marginBottom: 30, display: "flex", alignItems: "center", gap: 7,
      transition: "color .2s ease, gap .2s ease",
    }}>
      <span style={{ transition: "transform .2s ease", transform: s.hover ? "translateX(-3px)" : "none", fontSize: 15 }}>←</span>
      {children}
    </button>
  );
}

function campoTexto(minH) {
  return {
    flex: 1, width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.025)", color: C.ink, fontFamily: F.text,
    fontSize: 15.5, lineHeight: 1.6, padding: "15px 17px", borderRadius: 12,
    border: `1px solid ${C.line}`, minHeight: minH, resize: "vertical", outline: "none",
    transition: "border-color .2s ease, box-shadow .2s ease",
  };
}
function cartao(max) {
  return {
    borderRadius: 18, padding: 24, maxWidth: max || "none", margin: max ? "0 auto" : 0,
    background: `linear-gradient(160deg, ${C.raised}, ${C.base})`,
    boxShadow: `inset 0 0 0 1px ${C.line}, 0 12px 40px rgba(0,0,0,0.4)`,
  };
}

// ============================================================
// SHELL
// ============================================================
export default function App() {
  useAtmosfera();
  const [tela, setTela] = useState("cards");
  const [abertaId, setAbertaId] = useState(null);
  const [dados, setDados] = useState(HEURISTICAS);
  const [flash, setFlash] = useState(null);
  const aberta = dados.find((h) => h.id === abertaId);

  const registrar = (id, tipo) => {
    setDados((ds) => ds.map((h) => {
      if (h.id !== id) return h;
      if (tipo === "construcao") return { ...h, construcoes: h.construcoes + 1, sequencia: h.sequencia + 1, ultimos7: [...h.ultimos7.slice(1), 1] };
      if (tipo === "ambos") return { ...h, construcoes: h.construcoes + 1, negacoes: h.negacoes + 1, sequencia: h.sequencia + 1, ultimos7: [...h.ultimos7.slice(1), 1] };
      return { ...h, sequencia: 0, ultimos7: [...h.ultimos7.slice(1), 0] };
    }));
    setFlash(tipo === "recaida"
      ? { cor: C.velha, txt: "Tudo bem. Recaídas acontecem quando estamos cansados ou tensos. Perceba o que levou a isso e volte quando puder. Você não perdeu o caminho que já construiu." }
      : { cor: C.nova, txt: "Você agiu como quem você está se tornando. O caminho novo ficou um pouco mais forte." });
    setTimeout(() => setFlash(null), 4200);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.void, color: C.ink, fontFamily: F.text, position: "relative" }}>
      {/* atmosfera de fundo: brilho superior + textura */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(91,240,219,0.05), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 10%, rgba(154,166,255,0.04), transparent 60%)` }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: NOISE, mixBlendMode: "overlay" }} />

      {/* topbar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(6,7,12,0.72)", backdropFilter: "blur(20px) saturate(1.4)",
        boxShadow: `inset 0 -1px 0 ${C.line}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, cursor: "pointer" }} onClick={() => setTela("cards")}>
          <LogoMark />
          <span style={{ fontSize: 20, fontWeight: 600, fontFamily: F.disp, letterSpacing: -0.5 }}>Heuris</span>
        </div>
        {tela === "cards" && <Botao onClick={() => setTela("criar")}>Nova heurística</Botao>}
      </div>

      {/* toast */}
      {flash && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 50,
          maxWidth: 500, width: "calc(100% - 48px)", padding: "16px 22px", borderRadius: 14,
          background: "rgba(16,19,28,0.95)", color: C.ink, fontSize: 14, lineHeight: 1.6, textAlign: "center",
          backdropFilter: "blur(20px)",
          boxShadow: `inset 0 0 0 1px ${flash.cor}44, 0 16px 50px rgba(0,0,0,0.7), 0 0 30px ${flash.cor}22`,
          animation: "heurisRise .4s cubic-bezier(.2,.8,.3,1) both",
        }}>{flash.txt}</div>
      )}

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "48px 32px 100px", position: "relative" }}>
        {tela === "cards" && (
          <>
            <div style={{ marginBottom: 40, animation: "heurisRise .5s ease both" }}>
              <h1 style={{ margin: 0, fontSize: 36, fontFamily: F.disp, fontWeight: 600, letterSpacing: -0.9, color: C.ink }}>Suas heurísticas</h1>
              <p style={{ fontSize: 15.5, color: C.inkSoft, marginTop: 12, lineHeight: 1.7, maxWidth: 600 }}>
                Cada uma é um caminho neural que você constrói no lugar de um antigo. Abra qualquer uma para ver o caminho antigo adormecer enquanto o novo se fortalece.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 20 }}>
              {dados.map((h, i) => (<Card key={h.id} h={h} delay={0.05 + i * 0.07} onOpen={() => { setAbertaId(h.id); setTela("detalhe"); }} />))}
            </div>
          </>
        )}
        {tela === "detalhe" && aberta && <Detalhe h={aberta} onVoltar={() => setTela("cards")} onRegistrar={registrar} />}
        {tela === "criar" && <Criar onVoltar={() => setTela("cards")} />}
      </div>
    </div>
  );
}

// marca do app — um soma com dois ramos, coerente com o neurônio
function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="4" fill={C.ink} />
      <path d="M13 13 L21 8 M13 13 L22 14 M13 13 L19 18" stroke={C.nova} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 13 L5 9 M13 13 L4 15" stroke={C.velha} strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1.5 3" />
      <circle cx="21" cy="8" r="1.6" fill={C.nova} />
      <circle cx="22" cy="14" r="1.4" fill={C.nova} />
    </svg>
  );
}
