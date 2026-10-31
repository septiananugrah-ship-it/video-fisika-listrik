import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp} from '../anim';
import {Arrow, Formula, Frac, Glow, Label, Motes, Ripple, Stage, Stream, Sub, Twinkles, V, pointAlong} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Kapasitor (AUDIT): Q = CV; C = ε₀A/d (lebih luas / celah sempit → C besar); energi di medan; lampu kilat.
// Muatan pelat q(t) = V·(1 − e^(−t/τ)) — elektron di kawat bergeser sebanding dengan q (tertutup per frame).

type P = [number, number];
const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const Plate: React.FC<{x: number; y: number; h: number; sign: 1 | -1; q: number; nMax: number; w?: number}> = ({x, y, h, sign, q, nMax, w = 22}) => {
  const col = sign > 0 ? C.heat : C.pot;
  const n = q * nMax;
  const K = Math.ceil(n - 1e-6);
  const face = x + (sign > 0 ? w / 2 + 16 : -w / 2 - 16);
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={6} fill="#2a3560" stroke={col} strokeWidth={2.5} strokeOpacity={0.4 + 0.6 * q} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={6} fill={col} opacity={0.65 * q} />
      <rect x={x - w / 2 + 4} y={y - h / 2 + 6} width={5} height={h - 12} rx={2.5} fill="#fff" opacity={0.18} />
      {Array.from({length: Math.max(0, K)}, (_, k) => {
        const yy = y - h / 2 + ((k + 0.5) * h) / Math.max(K, 1);
        const op = clamp01(n - k);
        return (
          <g key={k} opacity={op}>
            <circle cx={face} cy={yy} r={9} fill={col} />
            <line x1={face - 5} y1={yy} x2={face + 5} y2={yy} stroke="#fff" strokeWidth={2.4} />
            {sign > 0 ? <line x1={face} y1={yy - 5} x2={face} y2={yy + 5} stroke="#fff" strokeWidth={2.4} /> : null}
          </g>
        );
      })}
    </g>
  );
};

const BatteryV: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-34} y={-62} width={68} height={124} rx={12} fill="#1b2550" stroke="#5a6aa8" strokeWidth={2.5} />
    <rect x={-34} y={-62} width={68} height={40} rx={12} fill={C.heat} opacity={0.75} />
    <rect x={-14} y={-74} width={28} height={12} rx={4} fill="#c8cfe6" />
    <rect x={-26} y={-52} width={8} height={100} rx={4} fill="#fff" opacity={0.15} />
    <text x={0} y={-42} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={26} fill="#fff">
      +
    </text>
    <text x={0} y={36} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={30} fill={C.pot}>
      −
    </text>
  </g>
);

const Electrons: React.FC<{pts: P[]; n: number; u: number; t: number; seed?: number; op?: number}> = ({pts, n, u, t, seed = 0, op = 1}) => (
  <g opacity={op}>
    {Array.from({length: n}, (_, k) => {
      const ph = (((k / n + u + seed) % 1) + 1) % 1;
      const [x, y] = pointAlong(pts, ph);
      const fade = Math.min(1, ph * 10, (1 - ph) * 10);
      const j = 2.5 * Math.sin(t * 7 + k * 2.3);
      return (
        <g key={k} opacity={fade}>
          <circle cx={x + j} cy={y - j * 0.6} r={11} fill={`url(#soft-pot)`} />
          <circle cx={x + j} cy={y - j * 0.6} r={4.6} fill={C.pot} />
          <circle cx={x + j} cy={y - j * 0.6} r={2} fill="#fff" />
        </g>
      );
    })}
  </g>
);

const wireD = (pts: P[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');

export const Capacitor: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  // ---------------- bagian A: pengisian ----------------
  const t0 = cue(0) + 0.6;
  const tau = 1.3;
  const t1 = wordOf(1, 'sebanding') - 0.2;
  const vf = 1 - 0.45 * Math.pow(Math.sin(0.55 * Math.max(0, t - t1)), 2) * ramp(t, t1, t1 + 1.2);
  const charge = t < t0 ? 0 : 1 - Math.exp(-(t - t0) / tau);
  const q = vf * charge;
  const rate = t < t0 ? 0 : Math.exp(-(t - t0) / tau);
  const flowOp = clamp01(rate * 1.6);
  const partA = Math.min(ramp(t, -0.4, 0.7), 1 - ramp(t, cue(2) - 0.4, cue(2) + 0.3, EASE_IN_OUT));
  const shift = 220 * (1 - ramp(t, cue(1) - 0.2, cue(1) + 1.2, EASE_IN_OUT));
  const graph = ramp(t, cue(1) + 0.6, cue(1) + 1.6);

  const XP = 760;
  const XN = 920;
  const WL: P[] = [
    [XP - 11, 470],
    [520, 470],
    [520, 498],
  ];
  const WR: P[] = [
    [520, 622],
    [520, 790],
    [1100, 790],
    [1100, 470],
    [XN + 11, 470],
  ];

  // ---------------- bagian B: luas & celah ----------------
  const partB = Math.min(ramp(t, cue(2) - 0.1, cue(2) + 0.7), 1 - ramp(t, cue(3) - 0.4, cue(3) + 0.3, EASE_IN_OUT));
  const pA = ramp(t, wordOf(2, 'luas') - 0.4, wordOf(2, 'luas') + 0.9, EASE_IN_OUT);
  const pD = ramp(t, wordOf(2, 'sempit') - 0.5, wordOf(2, 'sempit') + 0.8, EASE_IN_OUT);
  const hR = mix(200, 400, pA);
  const dR = mix(200, 100, pD);
  const nL = 3;
  const nR = 3 * (hR / 200) * (200 / dR);

  // ---------------- bagian C: lampu kilat ----------------
  const partC = ramp(t, cue(3) - 0.1, cue(3) + 0.8);
  const tF1 = wordOf(3, 'sekejap');
  const tF2 = wordOf(3, 'kamera') + 0.25;
  const D = (tf: number) => (t < tf ? 0 : (1 - Math.exp(-(t - tf) / 0.07)) * Math.exp(-(t - tf) / 1.5));
  const qC = clamp01(1 - D(tF1) - D(tF2));
  const B = (tf: number) => (t < tf - 0.04 ? 0 : ramp(t, tf - 0.04, tf + 0.02) * Math.exp(-Math.max(0, t - tf) / 0.28));
  const flash = Math.min(1, B(tF1) + B(tF2));
  const dis = Math.min(1, B(tF1) * 1.3 + B(tF2) * 1.3);

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <linearGradient id="cap-en" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.kin} stopOpacity={0.1} />
            <stop offset="50%" stopColor={C.kin} stopOpacity={0.55} />
            <stop offset="100%" stopColor={C.kin} stopOpacity={0.1} />
          </linearGradient>
        </defs>

        {/* ===================== A: dua pelat diisi baterai ===================== */}
        <g opacity={partA} transform={`translate(${shift},0)`}>
          <path d={wireD(WL)} fill="none" stroke="#5f6fa8" strokeWidth={6} strokeLinejoin="round" />
          <path d={wireD(WR)} fill="none" stroke="#5f6fa8" strokeWidth={6} strokeLinejoin="round" />
          <BatteryV x={520} y={560} />
          {/* batang tegangan baterai */}
          <rect x={430} y={500} width={22} height={120} rx={8} fill="#0d1430" stroke={C.spr} strokeWidth={2} />
          <rect x={434} y={616 - 112 * vf} width={14} height={112 * vf} rx={6} fill={C.spr} opacity={0.85} />
          <Label x={441} y={470} size={30} font="serif" italic weight={600} color={C.spr}>
            V
          </Label>
          {/* medan antar-pelat */}
          <Glow x={(XP + XN) / 2} y={470} r={170} color="force" opacity={0.5 * q} />
          {Array.from({length: 6}, (_, i) => {
            const y = 340 + i * 52;
            return (
              <g key={i} opacity={q}>
                <line x1={XP + 30} y1={y} x2={XN - 30} y2={y} stroke={C.force} strokeWidth={2.4} opacity={0.8} />
                <path d={`M${(XP + XN) / 2 + 8},${y} l-14,-8 l4,8 l-4,8 Z`} fill={C.force} />
                {[0, 1].map((k) => {
                  const ph = (t * 0.6 + k / 2 + i * 0.17) % 1;
                  return <circle key={k} cx={mix(XP + 32, XN - 32, ph)} cy={y} r={3.5} fill="#fff6d0" opacity={cyc(ph) * 0.8} />;
                })}
              </g>
            );
          })}
          <Plate x={XP} y={470} h={340} sign={1} q={q} nMax={8} />
          <Plate x={XN} y={470} h={340} sign={-1} q={q} nMax={8} />
          <Electrons pts={WR} n={16} u={q * 0.35} t={t} />
          <Electrons pts={WL} n={7} u={q * 0.9} t={t} seed={0.3} />
          <Arrow x1={640} y1={440} x2={710} y2={440} color="cyan" width={5} opacity={flowOp} pulse={false} />
          <Arrow x1={1130} y1={560} x2={1130} y2={720} color="cyan" width={5} opacity={flowOp} />
          <Label x={675} y={410} size={26} font="serif" italic weight={600} color={C.cyan} opacity={flowOp}>
            I
          </Label>
          <Label x={(XP + XN) / 2} y={680} size={28} font="serif" italic weight={600} color={C.force} opacity={q}>
            E
          </Label>
          <Label x={(XP + XN) / 2} y={262} size={30} weight={600} color={C.ink} opacity={ramp(t, wordOf(0, 'kapasitor') - 0.3, wordOf(0, 'kapasitor') + 0.4)}>
            kapasitor
          </Label>
          <Label x={(XP + XN) / 2} y={720} size={24} color={C.muted} opacity={ramp(t, wordOf(0, 'celah') - 0.3, wordOf(0, 'celah') + 0.4) * (1 - graph)}>
            ← celah →
          </Label>
          <Motes x={(XP + XN) / 2} y={470} rx={200} ry={200} n={14} color="force" opacity={0.35 * q} seed={2} />
          <Ripple x={(XP + XN) / 2} y={470} p={ramp(t, wordOf(0, 'kapasitor') - 0.2, wordOf(0, 'kapasitor') + 1.4)} r={200} color="force" />
        </g>

        {/* grafik Q–V */}
        <g opacity={partA * graph}>
          <line x1={1300} y1={760} x2={1740} y2={760} stroke={C.muted} strokeWidth={2.5} />
          <line x1={1300} y1={760} x2={1300} y2={380} stroke={C.muted} strokeWidth={2.5} />
          <Label x={1755} y={760} size={30} font="serif" italic weight={600} color={C.spr} anchor="start">
            V
          </Label>
          <Label x={1300} y={355} size={30} font="serif" italic weight={600} color={C.heat}>
            Q
          </Label>
          <line x1={1300} y1={760} x2={1700} y2={420} stroke={C.gold} strokeWidth={4} />
          <Label x={1620} y={440} size={26} color={C.gold} anchor="end">
            kemiringan = <tspan fontFamily={FONT.serif} fontStyle="italic">C</tspan>
          </Label>
          {(() => {
            const gx = 1300 + 360 * q;
            const gy = 760 - 306 * q;
            return (
              <g>
                <line x1={gx} y1={760} x2={gx} y2={gy} stroke={C.spr} strokeWidth={2} strokeDasharray="5 6" />
                <line x1={1300} y1={gy} x2={gx} y2={gy} stroke={C.heat} strokeWidth={2} strokeDasharray="5 6" />
                <Glow x={gx} y={gy} r={50} color="gold" />
                <circle cx={gx} cy={gy} r={10} fill="#fff" stroke={C.gold} strokeWidth={3} />
              </g>
            );
          })()}
        </g>

        {/* ===================== B: luas lebih besar & celah lebih sempit ===================== */}
        <g opacity={partB}>
          {[
            {cx: 560, h: 200, d: 200, n: nL, k: 0},
            {cx: 1360, h: hR, d: dR, n: nR, k: 1},
          ].map((c) => {
            const qq = c.n / 12;
            const xp = c.cx - c.d / 2;
            const xn = c.cx + c.d / 2;
            const nf = Math.max(2, Math.round(c.h / 60));
            return (
              <g key={c.k}>
                <Glow x={c.cx} y={520} r={120 + c.h * 0.35} color="force" opacity={0.25 + 0.5 * qq} />
                {Array.from({length: nf}, (_, i) => {
                  const y = 520 - c.h / 2 + ((i + 0.5) * c.h) / nf;
                  return (
                    <g key={i}>
                      <line x1={xp + 28} y1={y} x2={xn - 28} y2={y} stroke={C.force} strokeWidth={2.2} opacity={0.4 + 0.5 * qq} />
                      {(() => {
                        const ph = (t * 0.7 + i * 0.23 + c.k * 0.4) % 1;
                        return <circle cx={mix(xp + 30, xn - 30, ph)} cy={y} r={3.4} fill="#fff6d0" opacity={cyc(ph) * 0.8} />;
                      })()}
                    </g>
                  );
                })}
                <Plate x={xp} y={520} h={c.h} sign={1} q={1} nMax={c.n} />
                <Plate x={xn} y={520} h={c.h} sign={-1} q={1} nMax={c.n} />
                {/* kawat ke baterai yang sama */}
                <path d={`M${xp},${520 + c.h / 2} L${xp},812 L${c.cx - 34},812`} fill="none" stroke="#5f6fa8" strokeWidth={5} />
                <path d={`M${xn},${520 + c.h / 2} L${xn},812 L${c.cx + 34},812`} fill="none" stroke="#5f6fa8" strokeWidth={5} />
                <g transform={`translate(${c.cx},812) rotate(90)`}>
                  <rect x={-22} y={-34} width={44} height={68} rx={8} fill="#1b2550" stroke="#5a6aa8" strokeWidth={2} />
                  <rect x={-22} y={-34} width={44} height={22} rx={8} fill={C.heat} opacity={0.75} />
                </g>
                {/* batang muatan Q */}
                <rect x={c.cx - 150} y={846} width={300} height={16} rx={8} fill="#0d1430" stroke={C.heat} strokeWidth={1.5} />
                <rect x={c.cx - 148} y={848} width={296 * qq} height={12} rx={6} fill={C.heat} opacity={0.85} />
                <Label x={c.cx - 175} y={854} size={26} font="serif" italic weight={600} color={C.heat}>
                  Q
                </Label>
              </g>
            );
          })}
          <Label x={560} y={385} size={28} color={C.muted}>
            pelat kecil, celah lebar
          </Label>
          <Label x={1500} y={470} size={28} weight={600} color={C.gold} opacity={pA} anchor="start">
            lebih luas
          </Label>
          <Label x={1500} y={510} size={28} weight={600} color={C.gold} opacity={pD} anchor="start">
            + celah lebih sempit
          </Label>
          {/* penanda celah */}
          <g opacity={pD}>
            <Arrow x1={1360 - dR / 2 + 14} y1={520 + hR / 2 + 26} x2={1360 + dR / 2 - 14} y2={520 + hR / 2 + 26} color="muted" width={3} both pulse={false} />
            <Label x={1400 + dR / 2} y={520 + hR / 2 + 26} size={26} font="serif" italic color={C.muted}>
              d
            </Label>
          </g>
          <Ripple x={1360} y={520} p={ramp(t, wordOf(2, 'sempit') + 0.4, wordOf(2, 'sempit') + 1.8)} r={260} color="heat" />
          <Twinkles x={1360} y={854} rx={160} ry={14} n={4} color="heat" opacity={pD} />
        </g>

        {/* ===================== C: energi di medan → lampu kilat ===================== */}
        <g opacity={partC}>
          {/* kawat */}
          <path d="M611,400 L611,330 L1315,330 L1315,432" fill="none" stroke="#5f6fa8" strokeWidth={6} strokeLinejoin="round" />
          <path d="M711,680 L711,760 L1170,760 L1170,640 L1250,640" fill="none" stroke="#5f6fa8" strokeWidth={6} strokeLinejoin="round" />
          {/* energi di medan */}
          <rect x={622} y={404} width={78} height={272} fill="url(#cap-en)" opacity={qC * qC * (0.8 + 0.2 * Math.sin(t * 3))} />
          <Glow x={661} y={540} r={170} color="kin" opacity={qC * qC * 0.8} />
          {Array.from({length: 5}, (_, i) => {
            const y = 430 + i * 55;
            return <line key={i} x1={636} y1={y} x2={686} y2={y} stroke={C.force} strokeWidth={2} opacity={0.8 * qC} />;
          })}
          <Plate x={600} y={540} h={280} sign={1} q={qC} nMax={6} />
          <Plate x={722} y={540} h={280} sign={-1} q={qC} nMax={6} />
          <Label x={661} y={290} size={28} weight={600} color={C.kin} opacity={qC}>
            energi di dalam medan
          </Label>
          <Motes x={661} y={540} rx={140} ry={170} n={14} color="kin" opacity={0.5 * qC} seed={5} />
          <Stream
            pts={[
              [611, 400],
              [611, 330],
              [1315, 330],
              [1315, 432],
            ]}
            color="kin"
            n={14}
            speed={2.4}
            r={7}
            opacity={dis}
          />

          {/* kamera */}
          <ellipse cx={1405} cy={710} rx={190} ry={16} fill="#000" opacity={0.35} />
          <rect x={1250} y={470} width={310} height={220} rx={26} fill="#1b2550" stroke="#5a6aa8" strokeWidth={3} />
          <rect x={1460} y={448} width={60} height={26} rx={8} fill="#2c3a6c" />
          <rect x={1268} y={488} width={274} height={10} rx={5} fill="#fff" opacity={0.1} />
          {[70, 54, 36, 18].map((r, i) => (
            <circle key={r} cx={1405} cy={590} r={r} fill={i === 3 ? '#4a6ab8' : '#0d1430'} stroke="#5a6aa8" strokeWidth={i === 0 ? 4 : 2} />
          ))}
          <circle cx={1392} cy={576} r={8} fill="#fff" opacity={0.5} />
          <rect x={1270} y={432} width={90} height={40} rx={8} fill="#3a4770" stroke="#c8cfe6" strokeWidth={2} opacity={1} />
          <rect x={1270} y={432} width={90} height={40} rx={8} fill="#fff" opacity={flash} />
          <Label x={1405} y={760 + 30} size={26} color={C.muted}>
            lampu kilat kamera
          </Label>
          {/* semburan kilat */}
          <g opacity={flash}>
            <Glow x={1315} y={452} r={420} color="white" still />
            {Array.from({length: 12}, (_, i) => {
              const a = (i / 12) * 2 * Math.PI;
              const r1 = 60;
              const r2 = 60 + 200 * (0.6 + 0.4 * flash);
              return <line key={i} x1={1315 + r1 * Math.cos(a)} y1={452 + r1 * Math.sin(a)} x2={1315 + r2 * Math.cos(a)} y2={452 + r2 * Math.sin(a)} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.8} />;
            })}
          </g>
          <Ripple x={1315} y={452} p={ramp(t, tF1, tF1 + 1.3)} r={300} color="white" />
          <Ripple x={1315} y={452} p={ramp(t, tF2, tF2 + 1.3)} r={300} color="white" />
          <Label x={960} y={250} size={26} color={C.kin} opacity={dis}>
            dilepas dalam sekejap
          </Label>
        </g>
        <rect x={0} y={0} width={1920} height={1080} fill="#fff" opacity={0.22 * flash * partC} />
      </Stage>

      {/* ===================== kartu rumus ===================== */}
      <Formula x={1520} y={250} p={slot(t, wordOf(1, 'muatan') - 0.2, cue(2) + 0.1)} accent={C.heat} size={66} caption="C = kapasitansi (farad, F)">
        <V color="heat">Q</V> = <V color="gold">C</V>
        <V color="spr">V</V>
      </Formula>
      <Formula x={960} y={235} p={slot(t, wordOf(2, 'luas') - 0.3, cue(3) + 0.1)} accent={C.gold} size={58} caption="A luas pelat, d lebar celah">
        <V color="gold">C</V> = <Frac n={<><V>ε</V><Sub>0</Sub><V>A</V></>} d={<V>d</V>} />
      </Formula>
    </AbsoluteFill>
  );
};
