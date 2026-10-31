import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp, rand} from '../anim';
import {Arrow, Badge, Formula, Glow, Label, Motes, Note, Ripple, Spark, Stage, Stream, Sub, Tint, TSub, TSup, Twinkles, V, pointAlong} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Elektrolisis air (AUDIT): H₂ di katoda (−), O₂ di anoda (+), volume H₂ : O₂ = 2 : 1.
// Katoda: 2H₂O + 2e⁻ → H₂ + 2OH⁻; anoda: 2H₂O → O₂ + 4H⁺ + 4e⁻.
// F = N_A·e = 96 485 C/mol ("≈ 96 500"); 1 mol H₂ butuh 2 mol e⁻ = 192 970 C ("≈ 193 000").
// Elektron mengalir dari kutub − baterai ke katoda dan dari anoda ke kutub +; arus konvensional (toska) berlawanan.

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ---------- sel ----------
const BL = 330;
const BR = 1070;
const BT = 470;
const BB = 830;
const WL = 520; // permukaan air di gelas
const TC = 520; // tabung katoda (H₂)
const TA = 880; // tabung anoda (O₂)
const TW = 54; // setengah lebar tabung
const TT = 250; // puncak tabung
const TBOT = 800;
const PL0 = 700; // pelat elektroda
const PL1 = 780;
const WY = 190; // kawat atas
const BX = 700; // baterai
const GMAX = 300;
// ---------- panel kanan ----------
const RX = 1480;

const fmtC = (v: number) => Math.round(v).toLocaleString('en-US').replace(/,/g, ' ');

export const Electrolysis: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  const cellOn = ramp(t, 0.1, 1.3, EASE_IN_OUT);
  const battOn = ramp(t, wordOf(1, 'baterai') - 0.6, wordOf(1, 'baterai') + 0.2);
  const flowOn = ramp(t, wordOf(1, 'baterai') - 0.2, wordOf(1, 'baterai') + 0.6);
  const tG0 = wordOf(1, 'Gelembung') - 0.4;
  const gasF = clamp01((t - tG0) / (dur - tG0));
  const hH = GMAX * gasF;
  const hO = hH / 2;
  const gasLvlH = TT + 6 + hH;
  const gasLvlO = TT + 6 + hO;
  const bubOn = ramp(t, tG0, tG0 + 0.6);
  const hLbl = ramp(t, wordOf(1, 'hidrogen') - 0.3, wordOf(1, 'hidrogen') + 0.4);
  const oLbl = ramp(t, wordOf(1, 'oksigen') - 0.3, wordOf(1, 'oksigen') + 0.4);
  const ratioOn = ramp(t, wordOf(1, 'oksigen') + 0.6, wordOf(1, 'oksigen') + 1.3);

  // kawat: elektron (biru) dari − baterai ke katoda; dari anoda ke + baterai
  const wireC: [number, number][] = [
    [BX - 22, WY],
    [TC, WY],
    [TC, PL0],
  ];
  const wireA: [number, number][] = [
    [TA, PL0],
    [TA, WY],
    [BX + 22, WY],
  ];

  // ion dalam larutan (hijau): kation → katoda (kiri), anion → anoda (kanan)
  const ions = Array.from({length: 16}, (_, i) => {
    const cat = i % 2 === 0;
    const per = 4.2 + rand(i * 3.3) * 1.6;
    const ph = (((t * 1) / per + rand(i * 7.1)) % 1 + 1) % 1;
    const x0 = TC + TW + 14;
    const x1 = TA - TW - 14;
    const x = cat ? mix(x1, x0, ph) : mix(x0, x1, ph);
    const y = 560 + rand(i * 5.9 + 1) * 230 + 8 * Math.sin(t * 1.7 + i);
    return {x, y, cat, op: Math.min(1, ph * 5) * Math.min(1, (1 - ph) * 5)};
  });

  // panel kanan
  const p0 = slot(t, 0.6, wordOf(1, 'Gelembung') - 0.2);
  const inset = Math.min(ramp(t, wordOf(1, 'Gelembung') - 0.2, wordOf(1, 'Gelembung') + 0.6), 1 - ramp(t, cue(2) - 0.6, cue(2) - 0.1, EASE_IN_OUT));
  const pPlot = Math.min(ramp(t, cue(2) - 0.3, cue(2) + 0.5), 1 - ramp(t, cue(3) - 0.6, cue(3) - 0.1, EASE_IN_OUT));
  const pMol = Math.min(ramp(t, cue(3) - 0.3, cue(3) + 0.5), 1 - ramp(t, cue(4) - 0.6, cue(4) - 0.1, EASE_IN_OUT));
  const pCnt = ramp(t, cue(4) - 0.3, cue(4) + 0.5);
  const cardN = slot(t, wordOf(2, 'sebanding') - 0.4, cue(3) - 0.2);
  const cardF = slot(t, wordOf(3, 'sembilan') - 0.5, cue(4) - 0.2);
  const cardQ = ramp(t, wordOf(4, 'seratus') - 0.5, wordOf(4, 'seratus') + 0.3);
  // plot n ∝ Q
  const PX0 = 1240;
  const PX1 = 1720;
  const PY0 = 640;
  const PY1 = 300;
  const qP = 0.08 + 0.88 * (0.5 - 0.5 * Math.cos((t - cue(2)) * 0.9));
  const lineP = ramp(t, cue(2) + 0.2, cue(2) + 1.4, EASE_IN_OUT);
  // tetapan Faraday: paket 1 mol e⁻
  const pack = (cx: number, cy: number, n: number, rr: number, seed: number, op: number) =>
    op <= 0.01
      ? null
      : Array.from({length: n}, (_, i) => {
          const a = i * 2.39996 + seed;
          const r = rr * Math.sqrt((i + 0.5) / n);
          return (
            <circle
              key={`${seed}-${i}`}
              cx={cx + r * Math.cos(a) + 2.5 * Math.sin(t * 4 + i * 1.3)}
              cy={cy + r * Math.sin(a) + 2.5 * Math.cos(t * 3.4 + i * 2.1)}
              r={4.5}
              fill={C.pot}
              opacity={0.9 * op}
            />
          );
        });
  const molOn = ramp(t, wordOf(3, 'mol') - 0.4, wordOf(3, 'mol') + 0.6);
  // pencacah muatan: 0 → 192 970 C
  const tC0 = cue(4) + 0.3;
  const tC1 = wordOf(4, 'ribu') + 0.1;
  const qF = ramp(t, tC0, tC1, EASE_IN_OUT);
  const qNow = 192970 * qF;
  const qShown = qF >= 0.999 ? 193000 : Math.round(qNow / 100) * 100;
  const seg1 = clamp01(qF * 2);
  const seg2 = clamp01(qF * 2 - 1);
  const h2On = ramp(t, tC1 - 0.2, tC1 + 0.6);

  // inset katoda: H₂ terbentuk
  const ICX = RX;
  const ICY = 470;
  const IR = 210;

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <linearGradient id="el-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3aa8ff" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#123a7a" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="el-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.03" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
          </linearGradient>
          <clipPath id="el-inset">
            <circle cx={ICX} cy={ICY} r={IR} />
          </clipPath>
        </defs>

        {/* ============ sel elektrolisis ============ */}
        <g opacity={cellOn}>
          <Motes x={700} y={560} rx={420} ry={260} n={22} color="water" opacity={0.35} seed={5} />
          {/* gelas kimia */}
          <path d={`M${BL},${WL + 6 * Math.sin(t * 1.2)} Q${(BL + BR) / 2},${WL - 6 * Math.sin(t * 1.2)} ${BR},${WL + 6 * Math.sin(t * 1.2)} L${BR},${BB} L${BL},${BB} Z`} fill="url(#el-water)" />
          <path d={`M${BL - 10},${BT} L${BL},${BT + 12} L${BL},${BB} Q${BL},${BB + 14} ${BL + 14},${BB + 14} L${BR - 14},${BB + 14} Q${BR},${BB + 14} ${BR},${BB} L${BR},${BT + 12} L${BR + 10},${BT}`} fill="none" stroke="#b9c6ee" strokeWidth={4} strokeLinejoin="round" opacity={0.85} />
          <rect x={BL} y={BT + 12} width={BR - BL} height={BB - BT} fill="url(#el-glass)" />
          <ellipse cx={(BL + BR) / 2} cy={BB + 30} rx={(BR - BL) / 2} ry={10} fill="#000" opacity={0.3} />
          {/* ion */}
          <g opacity={flowOn}>
            {ions.map((o, i) => (
              <g key={i} opacity={o.op}>
                <circle cx={o.x} cy={o.y} r={o.cat ? 11 : 14} fill={C.work} opacity={0.85} />
                <text x={o.x} y={o.y + 1} textAnchor="middle" dominantBaseline="central" fontSize={o.cat ? 16 : 20} fontWeight={700} fill="#06281a" fontFamily="Inter">
                  {o.cat ? '+' : '−'}
                </text>
              </g>
            ))}
            <Label x={(TC + TA) / 2} y={BB - 16} size={20} color={C.work} weight={600}>
              ion bergerak dalam larutan
            </Label>
          </g>
          {/* tabung pengumpul gas */}
          {[
            {x: TC, lvl: gasLvlH, col: '#dbe8ff'},
            {x: TA, lvl: gasLvlO, col: '#ffd9de'},
          ].map((tb, k) => (
            <g key={k}>
                            {/* gas */}
              <clipPath id={`el-tube${k}`}>
                <path d={`M${tb.x - TW + 3},${TBOT} L${tb.x - TW + 3},${TT + TW} A${TW - 3},${TW - 3} 0 0 1 ${tb.x + TW - 3},${TT + TW} L${tb.x + TW - 3},${TBOT} Z`} />
              </clipPath>
              <g clipPath={`url(#el-tube${k})`}>
                <rect x={tb.x - TW} y={tb.lvl} width={TW * 2} height={TBOT - tb.lvl} fill="#3aa8ff" opacity={0.3} />
                <rect x={tb.x - TW} y={TT} width={TW * 2} height={tb.lvl - TT} fill={tb.col} opacity={0.1} />
                <path d={`M${tb.x - TW},${tb.lvl} Q${tb.x},${tb.lvl + 8} ${tb.x + TW},${tb.lvl}`} fill="none" stroke="#9fd2ff" strokeWidth={2.5} opacity={0.8} />
              </g>
              <path d={`M${tb.x - TW},${TBOT} L${tb.x - TW},${TT + TW} A${TW},${TW} 0 0 1 ${tb.x + TW},${TT + TW} L${tb.x + TW},${TBOT}`} fill="none" stroke="#c8d4f4" strokeWidth={3.5} />
              <line x1={tb.x - TW + 10} y1={TT + 40} x2={tb.x - TW + 10} y2={TBOT - 20} stroke="#fff" strokeWidth={4} opacity={0.12} />
              {[0, 1, 2, 3, 4, 5, 6].map((m) => (
                <line key={m} x1={tb.x + TW - 16} y1={TT + 6 + m * 50} x2={tb.x + TW} y2={TT + 6 + m * 50} stroke="#c8d4f4" strokeWidth={1.5} opacity={0.6} />
              ))}
            </g>
          ))}
          {/* elektroda */}
          <line x1={TC} y1={WY} x2={TC} y2={PL0} stroke="#7d86a6" strokeWidth={5} />
          <line x1={TA} y1={WY} x2={TA} y2={PL0} stroke="#7d86a6" strokeWidth={5} />
          <rect x={TC - 16} y={PL0} width={32} height={PL1 - PL0} rx={3} fill={C.pot} opacity={0.9} />
          <rect x={TA - 16} y={PL0} width={32} height={PL1 - PL0} rx={3} fill={C.heat} opacity={0.9} />
          <Label x={TC - TW - 70} y={720} size={24} color={C.pot} weight={600}>
            katoda
          </Label>
          <Label x={TC - TW - 70} y={752} size={24} color={C.pot} weight={700}>
            (−)
          </Label>
          <Label x={TA + TW + 70} y={720} size={24} color={C.heat} weight={600}>
            anoda
          </Label>
          <Label x={TA + TW + 70} y={752} size={24} color={C.heat} weight={700}>
            (+)
          </Label>
          {/* gelembung */}
          <g opacity={bubOn}>
            {Array.from({length: 14}, (_, i) => {
              const ph = ((t / 1.5 + i / 14) % 1 + 1) % 1;
              const y = mix(PL1 - 10, gasLvlH + 8, ph);
              const x = TC + (rand(i * 2.7) - 0.5) * 70 + 5 * Math.sin(t * 4 + i);
              return <circle key={`h${i}`} cx={x} cy={y} r={3 + 3 * rand(i * 1.9)} fill="none" stroke="#e6f0ff" strokeWidth={1.8} opacity={0.85 * cyc(ph)} />;
            })}
            {Array.from({length: 7}, (_, i) => {
              const ph = ((t / 1.5 + i / 7 + 0.05) % 1 + 1) % 1;
              const y = mix(PL1 - 10, gasLvlO + 8, ph);
              const x = TA + (rand(i * 4.1 + 3) - 0.5) * 70 + 5 * Math.sin(t * 4 + i);
              return <circle key={`o${i}`} cx={x} cy={y} r={3 + 3 * rand(i * 2.3)} fill="none" stroke="#ffe0e4" strokeWidth={1.8} opacity={0.85 * cyc(ph)} />;
            })}
          </g>
          <Label x={TC} y={TT + 40} size={32} weight={700} color="#e6f0ff" opacity={hLbl}>
            H<tspan baselineShift="sub" fontSize="0.65em">2</tspan>
          </Label>
          <Label x={TA} y={TT + 40} size={32} weight={700} color="#ffe0e4" opacity={oLbl}>
            O<tspan baselineShift="sub" fontSize="0.65em">2</tspan>
          </Label>
          {/* kawat & baterai */}
          <path d={`M${BX - 22},${WY} L${TC},${WY} L${TC},${TT - 4}`} fill="none" stroke="#c99a5a" strokeWidth={4} />
          <path d={`M${BX + 22},${WY} L${TA},${WY} L${TA},${TT - 4}`} fill="none" stroke="#c99a5a" strokeWidth={4} />
          <g opacity={battOn}>
            <rect x={BX - 44} y={WY - 46} width={88} height={92} rx={12} fill="#141e40" stroke="#6f7cab" strokeWidth={2} />
            <line x1={BX - 12} y1={WY - 16} x2={BX - 12} y2={WY + 16} stroke={C.pot} strokeWidth={7} />
            <line x1={BX + 12} y1={WY - 30} x2={BX + 12} y2={WY + 30} stroke={C.heat} strokeWidth={4} />
            <Label x={BX - 30} y={WY - 28} size={22} color={C.pot} weight={700}>
              −
            </Label>
            <Label x={BX + 30} y={WY - 28} size={22} color={C.heat} weight={700}>
              +
            </Label>
          </g>
          <g opacity={flowOn}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const ph = ((t * 0.32 + i / 6) % 1 + 1) % 1;
              const [x, y] = pointAlong(wireC, ph);
              const [x2, y2] = pointAlong(wireA, ph);
              return (
                <g key={i}>
                  <Spark x={x} y={y} r={5} color="pot" opacity={cyc(ph) * 0.4 + 0.5 * Math.min(1, ph * 8) * Math.min(1, (1 - ph) * 8)} />
                  <Spark x={x2} y={y2} r={5} color="pot" opacity={cyc(ph) * 0.4 + 0.5 * Math.min(1, ph * 8) * Math.min(1, (1 - ph) * 8)} />
                </g>
              );
            })}
            <Arrow x1={TC + 70} y1={WY - 26} x2={TC + 150} y2={WY - 26} color="cyan" width={3} pulse={false} />
            <Arrow x1={TA - 150} y1={WY - 26} x2={TA - 70} y2={WY - 26} color="cyan" width={3} pulse={false} />
            <Label x={TC + 110} y={WY + 26} size={20} color={C.pot} weight={600}>
              e⁻
            </Label>
            <Label x={TA - 110} y={WY + 26} size={20} color={C.pot} weight={600}>
              e⁻
            </Label>
            <Label x={TA + 50} y={WY - 26} size={20} color={C.cyan} weight={600} anchor="start">
              I
            </Label>
          </g>
          <Ripple x={BX} y={WY} p={(t - wordOf(1, 'baterai')) / 1.1} r={120} color="cyan" />
        </g>

        {/* ============ panel kanan ============ */}
        {/* inset katoda */}
        {inset > 0.001 ? (
          <g opacity={inset}>
            <line x1={TC + 16} y1={PL0} x2={ICX - IR * 0.8} y2={ICY - IR * 0.6} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.5} />
            <line x1={TC + 16} y1={PL1} x2={ICX - IR * 0.8} y2={ICY + IR * 0.6} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.5} />
            <circle cx={ICX} cy={ICY} r={IR} fill="#0b1838" />
            <g clipPath="url(#el-inset)">
              <rect x={ICX - IR} y={ICY - IR} width={IR * 2} height={IR * 2} fill="url(#el-water)" />
              <rect x={ICX - IR - 10} y={ICY - IR} width={70} height={IR * 2} fill={C.pot} opacity={0.85} />
              {/* elektron di permukaan katoda */}
              {[0, 1, 2, 3, 4].map((i) => {
                const ph = ((t * 0.5 + i / 5) % 1 + 1) % 1;
                return <Spark key={i} x={ICX - IR + 52} y={mix(ICY + IR, ICY - IR, ph)} r={5} color="pot" opacity={cyc(ph)} />;
              })}
              {/* molekul air */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const x = ICX - 60 + (i % 3) * 90 + 10 * Math.sin(t * 1.1 + i);
                const y = ICY - 110 + Math.floor(i / 3) * 170 + 12 * Math.cos(t * 0.9 + i * 2);
                const a = t * 0.6 + i;
                return (
                  <g key={i} opacity={0.75}>
                    <circle cx={x + 18 * Math.cos(a)} cy={y + 18 * Math.sin(a)} r={8} fill="#f2f5ff" />
                    <circle cx={x + 18 * Math.cos(a + 1.82)} cy={y + 18 * Math.sin(a + 1.82)} r={8} fill="#f2f5ff" />
                    <circle cx={x} cy={y} r={14} fill="#ff5a6e" />
                  </g>
                );
              })}
              {/* H₂ terbentuk & naik */}
              {[0, 1, 2].map((i) => {
                const ph = ((t / 2.2 + i / 3) % 1 + 1) % 1;
                const x = ICX - IR + 90 + 14 * Math.sin(t * 2 + i);
                const y = mix(ICY + 120 - i * 40, ICY - IR - 20, ph);
                const sep = mix(30, 18, clamp01(ph * 4));
                return (
                  <g key={i} opacity={cyc(ph)}>
                    <circle cx={x} cy={y} r={20} fill="none" stroke="#e6f0ff" strokeWidth={2} opacity={0.7} />
                    <circle cx={x - sep / 2} cy={y} r={7} fill="#f2f5ff" />
                    <circle cx={x + sep / 2} cy={y} r={7} fill="#f2f5ff" />
                  </g>
                );
              })}
            </g>
            <circle cx={ICX} cy={ICY} r={IR} fill="none" stroke="#c8d2f0" strokeWidth={4} />
            <Label x={ICX} y={ICY + IR + 40} size={26} weight={600}>
              di katoda: 2H<TSub>2</TSub>O + 2e⁻ → H<TSub>2</TSub> + 2OH⁻
            </Label>
          </g>
        ) : null}

        {/* plot n ∝ Q */}
        {pPlot > 0.001 ? (
          <g opacity={pPlot}>
            <line x1={PX0} y1={PY0} x2={PX1 + 20} y2={PY0} stroke={C.muted} strokeWidth={2.5} markerEnd="url(#arrow-muted)" />
            <line x1={PX0} y1={PY0} x2={PX0} y2={PY1 - 30} stroke={C.muted} strokeWidth={2.5} markerEnd="url(#arrow-muted)" />
            <Label x={PX1} y={PY0 + 34} size={24} color={C.cyan} anchor="end" weight={600}>
              muatan Q
            </Label>
            <Label x={PX0 + 14} y={PY1 - 30} size={24} color={C.work} anchor="start" weight={600}>
              zat terbentuk n
            </Label>
            <line x1={PX0} y1={PY0} x2={mix(PX0, PX1, lineP)} y2={mix(PY0, PY1, lineP)} stroke={C.gold} strokeWidth={4} />
            <line x1={mix(PX0, PX1, qP)} y1={PY0} x2={mix(PX0, PX1, qP)} y2={mix(PY0, PY1, qP)} stroke={C.cyan} strokeWidth={2} strokeDasharray="5 6" opacity={lineP} />
            <line x1={PX0} y1={mix(PY0, PY1, qP)} x2={mix(PX0, PX1, qP)} y2={mix(PY0, PY1, qP)} stroke={C.work} strokeWidth={2} strokeDasharray="5 6" opacity={lineP} />
            <Spark x={mix(PX0, PX1, qP)} y={mix(PY0, PY1, qP)} r={9} color="gold" opacity={lineP} />
            <rect x={PX0 + 6} y={PY0 - 14} width={(PX1 - PX0) * qP - 12} height={10} rx={5} fill={C.cyan} opacity={0.5 * lineP} />
            <rect x={PX0 + 4} y={mix(PY0, PY1, qP) + 4} width={10} height={(PY0 - PY1) * qP - 8} rx={5} fill={C.work} opacity={0.5 * lineP} />
          </g>
        ) : null}

        {/* paket 1 mol e⁻ */}
        {pMol > 0.001 ? (
          <g opacity={pMol}>
            <Glow x={RX} y={430} r={220} color="pot" opacity={0.45 * molOn} />
            {pack(RX, 430, 130, 140, 0, molOn)}
            <circle cx={RX} cy={430} r={158} fill="none" stroke={C.pot} strokeWidth={2} strokeDasharray="6 8" opacity={0.6 * molOn} transform={`rotate(${t * 12} ${RX} ${430})`} />
            <Label x={RX} y={232} size={30} weight={600} color={C.pot} opacity={molOn}>
              1 mol elektron
            </Label>
            <Label x={RX} y={628} size={26} color={C.muted} opacity={molOn}>
              6,022 × 10<TSup>23</TSup> × 1,602 × 10<TSup>−19</TSup> C
            </Label>
            <Twinkles x={RX} y={430} rx={180} ry={160} n={6} color="pot" opacity={cardF} seed={3} />
          </g>
        ) : null}

        {/* pencacah muatan → 1 mol H₂ */}
        {pCnt > 0.001 ? (
          <g opacity={pCnt}>
            <Label x={RX} y={240} size={26} color={C.muted}>
              muatan yang mengalir
            </Label>
            <Label x={RX} y={300} size={56} font="mono" weight={600} color={C.cyan}>
              {`${fmtC(qShown)} C`}
            </Label>
            <rect x={1230} y={350} width={500} height={34} rx={17} fill="#0d1534" stroke="#6f7cab" strokeWidth={2} />
            <rect x={1234} y={354} width={Math.max(0, 246 * seg1)} height={26} rx={13} fill={C.pot} />
            <rect x={1480} y={354} width={Math.max(0, 246 * seg2)} height={26} rx={13} fill={C.pot} opacity={0.85} />
            <line x1={1480} y1={344} x2={1480} y2={390} stroke={C.ink} strokeWidth={2} opacity={0.6} />
            <Label x={1355} y={412} size={20} color={C.pot} weight={600}>
              1 mol e⁻
            </Label>
            <Label x={1605} y={412} size={20} color={C.pot} weight={600}>
              2 mol e⁻
            </Label>
            {/* dua paket e⁻ → 1 mol H₂ */}
            {pack(1340, 530, 50, 55, 1, seg1 * (1 - h2On))}
            {pack(1620, 530, 50, 55, 2, seg2 * (1 - h2On))}
            <Stream pts={[[1340, 530], [RX, 540]]} color="pot" n={4} speed={0.8} r={4} opacity={h2On * (1 - ramp(t, tC1 + 1.2, tC1 + 2))} />
            <Stream pts={[[1620, 530], [RX, 540]]} color="pot" n={4} speed={0.8} r={4} opacity={h2On * (1 - ramp(t, tC1 + 1.2, tC1 + 2))} seed={2} />
            <g opacity={h2On} transform={`translate(${RX} 540) scale(${0.85 + 0.15 * h2On})`}>
              <Glow x={0} y={0} r={110} color="white" opacity={0.4} />
              <circle cx={-22 - 3 * Math.sin(t * 6)} cy={0} r={30} fill="#f2f5ff" />
              <circle cx={22 + 3 * Math.sin(t * 6)} cy={0} r={30} fill="#f2f5ff" />
              <Label x={0} y={0} size={26} color="#1a2450" weight={700}>
                H₂
              </Label>
            </g>
            <Label x={RX} y={612} size={24} weight={600} opacity={h2On}>
              1 mol gas hidrogen
            </Label>
            <Ripple x={RX} y={540} p={(t - tC1) / 1.2} r={160} color="cyan" />
            <Twinkles x={RX} y={300} rx={220} ry={40} n={5} color="cyan" opacity={h2On} seed={9} />
          </g>
        ) : null}
        <Glow x={TC} y={gasLvlH - 40} r={120} color="white" opacity={0.25 * h2On * pCnt} />
      </Stage>

      {/* ============ kartu HTML ============ */}
      <Badge x={(TC + TA) / 2} y={330} text={<>H₂ : O₂ = 2 : 1</>} color={C.water} opacity={ratioOn} size={28} />
      <Note x={RX} y={470} p={p0} color={C.cyan} size={34}>
        listrik <span style={{color: C.cyan}}>memaksa</span> reaksi kimia
      </Note>
      <Formula x={RX} y={780} p={cardN} accent={C.gold} size={66} caption="hukum Faraday: zat terbentuk sebanding muatan">
        <Tint c="work"><V>n</V></Tint> ∝ <Tint c="cyan"><V>Q</V></Tint>
      </Formula>
      <Formula x={RX} y={780} p={cardF} accent={C.pot} size={58} caption="tetapan Faraday = muatan 1 mol elektron">
        <V>F</V> = <V>N</V>
        <Sub>A</Sub>
        <V>e</V> ≈ <Tint c="cyan">96 500 C/mol</Tint>
      </Formula>
      <Formula x={RX} y={780} p={cardQ * pCnt} accent={C.cyan} size={58} caption={<>1 mol H₂ butuh 2 mol e⁻</>}>
        <V>Q</V> = 2<V>F</V> ≈ <Tint c="cyan">193 000 C</Tint>
      </Formula>
    </AbsoluteFill>
  );
};
