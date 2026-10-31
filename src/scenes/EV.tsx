import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp} from '../anim';
import {Arrow, Badge, Formula, Glow, Label, Motes, Ripple, Spark, Stage, Stream, Sub, Sup, Tint, TSup, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Elektronvolt (AUDIT): 1 eV = 1,602×10⁻¹⁹ J; × N_A = 96,485 kJ/mol ("≈ 96"); ikatan ≈ 1–10 eV;
// foton tampak 1,65–3,1 eV ("2–3 eV"); kT (300 K) = 0,026 eV; ionisasi H 13,6 eV (1312 kJ/mol).
// 1 J ≈ apel 100 g diangkat 1 m (g = 10 m/s²) = 6,2×10¹⁸ eV.

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));

// ---------- pelat ----------
const XM = 640; // pelat − (V = 0)
const XP = 1240; // pelat + (V = 1 V)
const PT = 270;
const PB = 680;
const YE = 475;
// ---------- tangga log ----------
const AX0 = 200;
const DEC = 380;
const AY = 540;
const lx = (e: number) => AX0 + DEC * (Math.log10(e) + 2);
const nmRGB = (ev: number) => {
  // warna kasar untuk 1,65–3,1 eV (merah → ungu)
  const nm = 1240 / ev;
  const stops: [number, string][] = [
    [750, '#ff2a2a'],
    [620, '#ff6a2a'],
    [580, '#ffd23a'],
    [530, '#5cf05c'],
    [480, '#3ab4ff'],
    [440, '#5a5cff'],
    [400, '#a04dff'],
  ];
  for (const [n, c] of stops) if (nm >= n) return c;
  return '#a04dff';
};

export const EV: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  const ph0 = Math.min(ramp(t, 0.1, 1.0), 1 - ramp(t, cue(1) - 0.6, cue(1) - 0.1, EASE_IN_OUT));
  const ph1 = Math.min(ramp(t, cue(1) - 0.3, cue(1) + 0.5), 1 - ramp(t, cue(2) - 0.6, cue(2) - 0.1, EASE_IN_OUT));
  const ph2 = Math.min(ramp(t, cue(2) - 0.3, cue(2) + 0.5), 1 - ramp(t, cue(3) - 0.6, cue(3) - 0.1, EASE_IN_OUT));
  const ph3 = ramp(t, cue(3) - 0.3, cue(3) + 0.5);

  // ================= 0: joule vs atom =================
  const lift = 0.5 - 0.5 * Math.cos(t * 1.4);
  const appleY = mix(735, 345, lift);
  const atomOn = ramp(t, wordOf(0, 'atom') - 0.4, wordOf(0, 'atom') + 0.3);
  const evOn = ramp(t, wordOf(0, 'elektronvolt') - 0.3, wordOf(0, 'elektronvolt') + 0.4);

  // ================= 1: elektron dipercepat 1 V =================
  const P = 2.4;
  const raw = Math.max(0, t - cue(1) + 0.3) / P;
  const ph = raw % 1;
  const s = Math.min(1, ph / 0.88);
  const fill = ph < 0.88 ? s * s : 1 - EASE_IN_OUT((ph - 0.88) / 0.12);
  const eX = mix(XM + 30, XP - 30, s * s);
  const eOp = Math.min(1, ph * 10) * (1 - ramp(ph, 0.88, 1));
  const eTrail = s > 0.05 && ph < 0.9 ? Array.from({length: 6}, (_, k) => [mix(XM + 30, XP - 30, Math.max(0, s - 0.03 * (k + 1)) ** 2), YE] as [number, number]) : undefined;
  const hitP = ph >= 0.88 ? (ph - 0.88) / 0.3 : (ph + 0.12) / 0.3; // riak saat tiba di pelat +
  const vOn = ramp(t, wordOf(1, 'volt', 1) - 0.4, wordOf(1, 'volt', 1) + 0.4);
  const card1 = slot(t, wordOf(1, 'koma') - 0.4, cue(2) - 0.4);
  const fieldX = (k: number) => (((XP - 60 - (t * 90 + k * 110)) % 480) + 480) % 480;

  // ================= 2: × N_A =================
  const nA = ramp(t, wordOf(2, 'Avogadro') - 0.6, wordOf(2, 'Avogadro') + 1.6, EASE_IN_OUT);
  const card2 = slot(t, wordOf(2, 'sembilan') - 0.5, cue(3) - 0.3);
  const NSW = 170;
  const swarm = Array.from({length: NSW}, (_, i) => {
    const a = i * 2.39996;
    const r = 15 * Math.sqrt(i + 0.5);
    return {x: 1340 + r * Math.cos(a), y: 470 + r * Math.sin(a), k: i / NSW};
  });

  // ================= 3: tangga energi =================
  const axisP = ramp(t, cue(3) - 0.2, cue(3) + 1.0, EASE_IN_OUT);
  const ionH = ramp(t, cue(3) + 0.6, cue(3) + 1.3);
  const bondOn = ramp(t, wordOf(3, 'ikatan') - 0.4, wordOf(3, 'ikatan') + 0.5);
  const visOn = ramp(t, wordOf(3, 'foton') - 0.4, wordOf(3, 'foton') + 0.5);
  const kTOn = ramp(t, wordOf(3, 'termal') - 0.4, wordOf(3, 'termal') + 0.5);
  const cur =
    lx(13.6) +
    (lx(3.2) - lx(13.6)) * ramp(t, wordOf(3, 'ikatan') - 0.5, wordOf(3, 'ikatan') + 0.4, EASE_IN_OUT) +
    (lx(2.3) - lx(3.2)) * ramp(t, wordOf(3, 'foton') - 0.5, wordOf(3, 'foton') + 0.4, EASE_IN_OUT) +
    (lx(0.026) - lx(2.3)) * ramp(t, wordOf(3, 'termal') - 0.6, wordOf(3, 'termal') + 0.5, EASE_IN_OUT);
  const curOn = ramp(t, cue(3) + 0.8, cue(3) + 1.4);

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <linearGradient id="ev-vis" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff2a2a" />
            <stop offset="22%" stopColor="#ff8a2a" />
            <stop offset="38%" stopColor="#ffe03a" />
            <stop offset="55%" stopColor="#5cf05c" />
            <stop offset="75%" stopColor="#3ab4ff" />
            <stop offset="100%" stopColor="#a04dff" />
          </linearGradient>
          <linearGradient id="ev-meter" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#c2541c" />
            <stop offset="100%" stopColor={C.kin} />
          </linearGradient>
          <radialGradient id="ev-apple" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ff9a8a" />
            <stop offset="55%" stopColor="#d8323c" />
            <stop offset="100%" stopColor="#7a1020" />
          </radialGradient>
        </defs>

        {/* ============ 0: joule terlalu besar ============ */}
        {ph0 > 0.001 ? (
          <g opacity={ph0}>
            <Motes x={960} y={500} rx={760} ry={300} n={24} color="ink" opacity={0.3} seed={3} />
            {/* apel diangkat 1 m */}
            <line x1={330} y1={760} x2={790} y2={760} stroke={C.muted} strokeWidth={3} />
            <line x1={390} y1={345} x2={390} y2={735} stroke={C.ink} strokeWidth={2.5} />
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <line key={f} x1={380} y1={mix(735, 345, f)} x2={400} y2={mix(735, 345, f)} stroke={C.ink} strokeWidth={2} />
            ))}
            <Label x={366} y={540} size={26} anchor="end" font="mono">
              1 m
            </Label>
            <Glow x={560} y={appleY} r={90} color="kin" opacity={0.25 + 0.5 * lift} />
            <ellipse cx={560} cy={760} rx={45 * (1 - 0.4 * lift)} ry={8} fill="#000" opacity={0.35 * (1 - 0.5 * lift)} />
            <g transform={`translate(560 ${appleY})`}>
              <circle cx={-12} cy={0} r={34} fill="url(#ev-apple)" />
              <circle cx={12} cy={0} r={34} fill="url(#ev-apple)" />
              <path d="M0,-30 q4,-18 12,-26" stroke="#6b4a2a" strokeWidth={4} fill="none" strokeLinecap="round" />
              <path d="M6,-40 q20,-14 30,2 q-18,8 -30,-2 Z" fill="#4fe3a0" />
            </g>
            <Arrow x1={650} y1={700} x2={650} y2={400} color="kin" width={5} opacity={0.6 + 0.4 * Math.sin(t * 1.4)} />
            <Label x={560} y={820} size={28} weight={600} color={C.kin}>
              1 J ≈ apel 100 g diangkat 1 m
            </Label>
            {/* satu atom */}
            <g opacity={atomOn}>
              <Glow x={1400} y={500} r={120} color="spr" opacity={0.4} />
              <circle cx={1400} cy={500} r={95} fill="none" stroke={C.pot} strokeWidth={1.5} strokeDasharray="4 7" opacity={0.5} />
              <circle cx={1400} cy={500} r={14} fill={C.heat} />
              <Spark x={1400 + 95 * Math.cos(t * 2)} y={500 - 95 * Math.sin(t * 2)} r={7} color="pot" />
              <Spark x={1400 + 22 * Math.cos(t * 5)} y={430 + 6 * Math.sin(t * 7)} r={3} color="kin" />
              <Label x={1400} y={650} size={28} weight={600}>
                energi satu atom
              </Label>
              <Label x={1400} y={695} size={32} weight={600} color={C.kin}>
                ~ 10<TSup>−19</TSup> J
              </Label>
              <Label x={980} y={540} size={34} weight={600} color={C.muted}>
                ≫
              </Label>
            </g>
            <Twinkles x={1400} y={500} rx={130} ry={110} n={5} color="kin" opacity={evOn} seed={2} />
          </g>
        ) : null}

        {/* ============ 1: 1 eV ============ */}
        {ph1 > 0.001 ? (
          <g opacity={ph1}>
            <Glow x={(XM + XP) / 2} y={YE} r={360} color="force" opacity={0.18} />
            {/* garis medan: dari + ke − (ke kiri) */}
            {[330, 400, 475, 550, 620].map((y, i) => (
              <g key={y}>
                <line x1={XP - 30} y1={y} x2={XM + 30} y2={y} stroke={C.force} strokeWidth={1.6} opacity={0.22} />
                {[0, 1, 2, 3].map((k) => {
                  const d = fieldX(k + i * 0.37);
                  const x = XP - 60 - d;
                  const op = Math.min(1, d / 60) * Math.min(1, (480 - d) / 60);
                  return <path key={k} d={`M${x + 9},${y - 7} L${x - 3},${y} L${x + 9},${y + 7}`} fill="none" stroke={C.force} strokeWidth={2.5} opacity={0.65 * op} />;
                })}
              </g>
            ))}
            <Label x={(XM + XP) / 2} y={PB + 30} size={24} color={C.force} weight={600}>
              medan E (dari + ke −)
            </Label>
            {/* pelat */}
            <rect x={XM - 16} y={PT} width={22} height={PB - PT} rx={5} fill={C.pot} />
            <rect x={XP - 6} y={PT} width={22} height={PB - PT} rx={5} fill={C.heat} />
            {Array.from({length: 7}, (_, k) => (
              <g key={k}>
                <text x={XM - 40} y={PT + 30 + k * 58} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={700} fill={C.pot} fontFamily="Inter">
                  −
                </text>
                <text x={XP + 40} y={PT + 30 + k * 58} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={700} fill={C.heat} fontFamily="Inter">
                  +
                </text>
              </g>
            ))}
            {/* potensial */}
            <g opacity={vOn}>
              <Label x={XM} y={225} size={28} color={C.spr} weight={600} font="mono">
                V = 0
              </Label>
              <Label x={XP} y={225} size={28} color={C.spr} weight={600} font="mono">
                V = 1 V
              </Label>
              <Arrow x1={XM + 90} y1={225} x2={XP - 110} y2={225} color="spr" width={4} />
              <Label x={(XM + XP) / 2 - 10} y={190} size={26} color={C.spr} weight={600}>
                beda potensial 1 V
              </Label>
            </g>
            {/* elektron */}
            <Spark x={eX} y={YE} r={11} color="pot" opacity={eOp} trail={eTrail} />
            <Label x={eX} y={YE - 42} size={24} color={C.pot} opacity={eOp} weight={600}>
              e⁻
            </Label>
            <Ripple x={XP - 20} y={YE} p={hitP} r={110} color="kin" />
            <Stream pts={[[XP + 70, YE], [1420, YE - 40], [1520, 300 + 340 * (1 - fill)]]} color="kin" n={5} speed={0.6} r={4} opacity={0.6} />
            {/* meter energi kinetik */}
            <rect x={1490} y={300} width={60} height={340} rx={12} fill="#0d1534" stroke="#6f7cab" strokeWidth={2.5} />
            <rect x={1496} y={300 + 340 * (1 - fill) + 6} width={48} height={Math.max(0, 340 * fill - 12)} rx={8} fill="url(#ev-meter)" />
            <line x1={1480} y1={306} x2={1560} y2={306} stroke={C.kin} strokeWidth={2} strokeDasharray="5 5" />
            <Label x={1580} y={306} size={24} color={C.kin} anchor="start" weight={600}>
              1 eV
            </Label>
            <Label x={1580} y={634} size={22} color={C.muted} anchor="start">
              0
            </Label>
            <Label x={1520} y={680} size={26} color={C.kin} weight={600}>
              K elektron
            </Label>
            <Label x={1520} y={258} size={26} color={C.kin} font="mono" weight={600}>
              {`${fill.toFixed(2).replace('.', ',')} eV`}
            </Label>
          </g>
        ) : null}

        {/* ============ 2: × N_A ============ */}
        {ph2 > 0.001 ? (
          <g opacity={ph2}>
            <Glow x={420} y={470} r={150} color="kin" opacity={0.45} />
            <Spark x={420 + 6 * Math.sin(t * 2)} y={470 + 6 * Math.cos(t * 2.4)} r={14} color="pot" />
            <Label x={420} y={560} size={32} weight={600} color={C.kin}>
              1 eV
            </Label>
            <Label x={420} y={600} size={24} color={C.muted}>
              satu partikel
            </Label>
            <Arrow x1={560} y1={470} x2={1080} y2={470} color="kin" width={6} opacity={ramp(t, wordOf(2, 'Dikali') - 0.3, wordOf(2, 'Dikali') + 0.4)} />
            <Label x={820} y={420} size={34} weight={600} opacity={ramp(t, wordOf(2, 'Dikali') - 0.3, wordOf(2, 'Dikali') + 0.4)}>
              × N<tspan baselineShift="sub" fontSize="0.65em">A</tspan>
            </Label>
            <Label x={820} y={520} size={26} color={C.muted} opacity={ramp(t, wordOf(2, 'Avogadro') - 0.3, wordOf(2, 'Avogadro') + 0.4)}>
              6,022 × 10<TSup>23</TSup> per mol
            </Label>
            <Stream pts={[[560, 470], [1080, 470]]} color="kin" n={8} speed={0.7} r={4} opacity={nA} />
            <Glow x={1340} y={470} r={260} color="kin" opacity={0.35 * nA} />
            {swarm.map((p, i) => {
              const on = ramp(nA, p.k * 0.85, p.k * 0.85 + 0.15);
              if (on <= 0.01) return null;
              const jx = 3 * Math.sin(t * 4 + i * 1.7);
              const jy = 3 * Math.cos(t * 3.6 + i * 2.3);
              return <circle key={i} cx={p.x + jx} cy={p.y + jy} r={5} fill={i % 3 ? C.pot : C.kin} opacity={0.85 * on} />;
            })}
            <Label x={1340} y={700} size={32} weight={600} color={C.kin} opacity={nA}>
              1 mol partikel
            </Label>
            <Twinkles x={1340} y={470} rx={220} ry={200} n={6} color="kin" opacity={card2} seed={6} />
          </g>
        ) : null}

        {/* ============ 3: tangga energi (log) ============ */}
        {ph3 > 0.001 ? (
          <g opacity={ph3}>
            <Motes x={960} y={540} rx={820} ry={260} n={24} color="ink" opacity={0.3} seed={8} />
            <Label x={960} y={215} size={30} weight={600} opacity={axisP}>
              tangga energi (skala logaritmik)
            </Label>
            {/* sumbu */}
            <line x1={AX0 - 40} y1={AY} x2={AX0 - 40 + (1600 - 0) * axisP} y2={AY} stroke={C.ink} strokeWidth={3} />
            {[0.01, 0.1, 1, 10, 100].map((e, i) => (
              <g key={e} opacity={ramp(axisP, i * 0.18, i * 0.18 + 0.2)}>
                <line x1={lx(e)} y1={AY - 10} x2={lx(e)} y2={AY + 10} stroke={C.ink} strokeWidth={2.5} />
                <Label x={lx(e)} y={AY + 34} size={22} font="mono">
                  {`${String(e).replace('.', ',')} eV`}
                </Label>
                <Label x={lx(e)} y={AY + 64} size={21} font="mono" color={C.muted}>
                  {`${['≈ 1', '≈ 10', '96', '965', '9650'][i]} kJ/mol`}
                </Label>
              </g>
            ))}
            {[0.02, 0.03, 0.05, 0.2, 0.3, 0.5, 2, 3, 5, 20, 30, 50].map((e) => (
              <line key={e} x1={lx(e)} y1={AY - 5} x2={lx(e)} y2={AY + 5} stroke={C.ink} strokeWidth={1.5} opacity={0.5 * axisP} />
            ))}
            {/* kursor sorot */}
            <Glow x={cur} y={AY} r={110} color="gold" opacity={0.5 * curOn} />
            {/* ionisasi H */}
            <g opacity={ionH}>
              <line x1={lx(13.6)} y1={AY} x2={lx(13.6)} y2={AY + 120} stroke={C.work} strokeWidth={3} />
              <circle cx={lx(13.6)} cy={AY} r={8} fill={C.work} />
              <Label x={lx(13.6) + 10} y={AY + 150} size={24} color={C.work} weight={600}>
                ionisasi H: 13,6 eV
              </Label>
              <Label x={lx(13.6) + 10} y={AY + 180} size={20} color={C.muted} font="mono">
                1312 kJ/mol
              </Label>
            </g>
            {/* ikatan kimia: beberapa eV */}
            <g opacity={bondOn}>
              <rect x={lx(1)} y={AY - 100} width={(lx(10) - lx(1)) * bondOn} height={40} rx={10} fill={C.kin} opacity={0.5} />
              <rect x={lx(1)} y={AY - 100} width={lx(10) - lx(1)} height={40} rx={10} fill="none" stroke={C.kin} strokeWidth={2} />
              <Label x={(lx(1) + lx(10)) / 2} y={AY - 140} size={26} color={C.kin} weight={600}>
                energi ikatan kimia ≈ 1–10 eV
              </Label>
              {/* molekul H₂ bergetar di 4,5 eV */}
              {(() => {
                const x = lx(4.5);
                const d = 22 + 5 * Math.sin(t * 9);
                return (
                  <g>
                    <line x1={x} y1={AY - 60} x2={x} y2={AY} stroke={C.kin} strokeWidth={2} strokeDasharray="4 4" />
                    <circle cx={x - d / 2} cy={AY - 80} r={11} fill="#f2f5ff" />
                    <circle cx={x + d / 2} cy={AY - 80} r={11} fill="#f2f5ff" />
                  </g>
                );
              })()}
              <Label x={lx(4.5) + 70} y={AY - 22} size={19} color={C.ink} font="mono">
                H–H 4,5 eV
              </Label>
            </g>
            {/* foton tampak */}
            <g opacity={visOn}>
              <rect x={lx(1.65)} y={AY + 100} width={lx(3.1) - lx(1.65)} height={34} rx={6} fill="url(#ev-vis)" />
              <line x1={lx(1.65)} y1={AY + 100} x2={lx(1.65)} y2={AY + 10} stroke="#ff4a3a" strokeWidth={1.5} strokeDasharray="4 4" />
              <line x1={lx(3.1)} y1={AY + 100} x2={lx(3.1)} y2={AY + 10} stroke="#a04dff" strokeWidth={1.5} strokeDasharray="4 4" />
              {[1.8, 2.3, 2.9].map((e, i) => {
                const x0 = lx(e);
                const col = nmRGB(e);
                const pts: string[] = [];
                const k = 0.12 + 0.05 * e; // foton berenergi lebih tinggi → gelombang lebih rapat
                for (let y = 0; y <= 110; y += 3) pts.push(`${pts.length ? 'L' : 'M'}${(x0 + 8 * Math.sin(k * y * 2.4 - t * 8 - i)).toFixed(1)},${(AY + 260 - y).toFixed(1)}`);
                return <path key={e} d={pts.join(' ')} stroke={col} strokeWidth={3} fill="none" opacity={0.9} />;
              })}
              <Label x={(lx(1.65) + lx(3.1)) / 2} y={AY + 290} size={24} weight={600}>
                foton tampak 2–3 eV
              </Label>
            </g>
            {/* kT suhu kamar */}
            <g opacity={kTOn}>
              {[0, 1, 2, 3, 4].map((i) => (
                <circle
                  key={i}
                  cx={lx(0.026) - 40 + i * 20 + 6 * Math.sin(t * 7 + i * 2.1)}
                  cy={AY - 70 + 8 * Math.sin(t * 6.3 + i * 1.3) + (i % 2) * 14}
                  r={6}
                  fill={C.press}
                  opacity={0.8}
                />
              ))}
              <circle cx={lx(0.026)} cy={AY} r={8} fill={C.press} />
              <Label x={lx(0.026)} y={AY - 130} size={26} color={C.press} weight={600}>
                termal kT (300 K)
              </Label>
              <Label x={lx(0.026)} y={AY + 120} size={26} color={C.press} weight={600} font="mono">
                0,026 eV
              </Label>
              <Ripple x={lx(0.026)} y={AY} p={(t - wordOf(3, 'termal')) / 1.2} r={90} color="press" />
            </g>
            <Ripple x={lx(3)} y={AY - 80} p={(t - wordOf(3, 'ikatan')) / 1.2} r={160} color="kin" />
          </g>
        ) : null}
      </Stage>

      {/* ============ kartu HTML ============ */}
      <Badge x={960} y={330} text="elektronvolt (eV)" color={C.kin} opacity={evOn * ph0} scale={0.9 + 0.1 * evOn} size={34} />
      <Formula x={960} y={810} p={card1} accent={C.kin} size={60} caption="energi satu elektron yang melewati beda potensial 1 V">
        1 eV = <Tint c="kin">1,602 × 10<Sup>−19</Sup> J</Tint>
      </Formula>
      <Formula x={960} y={800} p={card2} accent={C.kin} size={58} caption={<>1,602×10<Sup>−19</Sup> J × 6,022×10<Sup>23</Sup> mol<Sup>−1</Sup> = 96 485 J/mol</>}>
        1 eV × <V>N</V>
        <Sub>A</Sub> ≈ <Tint c="kin">96 kJ/mol</Tint>
      </Formula>
    </AbsoluteFill>
  );
};
