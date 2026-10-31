import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN, EASE_IN_OUT, cyc, mix, ramp} from '../anim';
import {Arrow, Badge, Formula, Frac, Glow, Label, Motes, Note, Ripple, Spark, Stage, Stream, Sup, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Ikatan ion (AUDIT): Na → Na⁺ + e⁻, Cl + e⁻ → Cl⁻; d(Na–Cl) = 0,282 nm → ke²/r = 8,18×10⁻¹⁹ J = 5,1 eV ("≈ 5 eV");
// bilangan koordinasi 6 (oktahedron); titik leleh NaCl 801 °C.
// Skala pasangan ion: 700 px/nm → jari-jari ion Na⁺ 0,102 nm = 71 px, Cl⁻ 0,181 nm = 127 px, jumlahnya = 198 px ≈ d.
// Atom netral: Na 0,186 nm = 130 px (besar), Cl 0,099 nm = 70 px (kecil) → setelah serah elektron ukurannya bertukar.

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const TAU = Math.PI * 2;
const NEUT = '#8f9bc4';
const Y0 = 470;
const NA_X0 = 600;
const CL_X0 = 1320;
const D_PX = 198;
const NA_X1 = 960 - D_PX / 2 - 30;
const CL_X1 = NA_X1 + D_PX;

/** Bola ion bergradien dengan tanda muatan. */
const Ball: React.FC<{x: number; y: number; r: number; color: string; op?: number; sign?: string; signOp?: number}> = ({x, y, r, color, op = 1, sign, signOp = 1}) =>
  op <= 0.01 ? null : (
    <g opacity={op}>
      <circle cx={x} cy={y} r={r} fill={color} />
      <circle cx={x} cy={y} r={r} fill="url(#io-shade)" />
      <circle cx={x - r * 0.34} cy={y - r * 0.38} r={r * 0.26} fill="#fff" opacity={0.42} />
      {sign && signOp > 0.01 ? (
        <text x={x} y={y + r * 0.04} textAnchor="middle" dominantBaseline="central" fontSize={r * 0.95} fontWeight={700} fill="#fff" opacity={signOp * 0.92} fontFamily="Inter">
          {sign}
        </text>
      ) : null}
    </g>
  );

/** Proyeksi 3D sederhana (yaw–pitch + perspektif). */
const proj = (x: number, y: number, z: number, yaw: number, pitch: number, cx: number, cy: number) => {
  const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
  const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
  const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
  const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
  const f = 1400 / (1400 + z2);
  return {x: cx + x1 * f, y: cy + y2 * f, z: z2, f};
};

export const Ionic: React.FC = () => {
  const {t, cue, cueEnd, wordOf} = useScene();

  const phA0 = 1 - ramp(t, cue(1) - 0.6, cue(1) - 0.05, EASE_IN_OUT);
  const phA = Math.min(ramp(t, cue(1) - 0.4, cue(1) + 0.3), 1 - ramp(t, cue(3) - 0.6, cue(3) - 0.1, EASE_IN_OUT));
  const phB = Math.min(ramp(t, cue(3) - 0.3, cue(3) + 0.5), 1 - ramp(t, cue(4) - 0.6, cue(4) - 0.1, EASE_IN_OUT));
  const phC = ramp(t, cue(4) - 0.3, cue(4) + 0.5);

  // ================= A0: butir garam & kaca pembesar =================
  const lensOn = ramp(t, 0.3, 1.4);
  const lensZoom = ramp(t, wordOf(0, 'kacamata') - 0.4, wordOf(0, 'kacamata') + 0.6, EASE_IN_OUT);
  const LX = 1250;
  const LY = 500;
  const LR = 230;
  const lensIons: React.ReactNode[] = [];
  if (phA0 > 0) {
    const sp = mix(60, 84, lensZoom);
    const ox = (t * 14) % (sp * 2);
    for (let i = -4; i <= 4; i++)
      for (let j = -4; j <= 4; j++) {
        const x = LX + i * sp + ox - sp;
        const y = LY + j * sp;
        if (Math.hypot(x - LX, y - LY) > LR + 40) continue;
        const plus = ((i + j) % 2 + 2) % 2 === 0;
        const jx = 2 * Math.sin(t * 5 + i * 1.3 + j * 2.1);
        lensIons.push(<Ball key={`${i},${j}`} x={x + jx} y={y} r={plus ? sp * 0.22 : sp * 0.36} color={plus ? C.heat : C.pot} sign={plus ? '+' : '−'} />);
      }
  }

  // ================= A: serah elektron → pasangan ion =================
  const tGive = wordOf(1, 'menyerahkan') + 0.1;
  const tArrive = tGive + 1.6;
  const ion = ramp(t, tArrive - 0.1, tArrive + 1.0, EASE_IN_OUT);
  const tApp0 = Math.max(tArrive + 1.2, wordOf(1, 'saling') - 1.4);
  const tApp1 = cueEnd(1) + 0.3;
  const app = ramp(t, tApp0, tApp1, EASE_IN);
  const vib = 3 * Math.sin(t * 4.2) * ramp(t, tApp1, tApp1 + 0.5);
  const naX = mix(NA_X0, NA_X1, app) - vib;
  const clX = mix(CL_X0, CL_X1, app) + vib;
  const bobA = 6 * Math.sin(t * 0.9);
  const naR = mix(71, 71, ion);
  const naShell = 130;
  const clR = mix(70, 127, ion);
  // elektron valensi Na
  const wNa = 1.25;
  const naE = (tt: number): [number, number] => [NA_X0 + naShell * Math.cos(wNa * tt), Y0 + bobA - naShell * Math.sin(wNa * tt)];
  // cincin Cl: 8 slot, slot ke-7 kosong (diisi elektron Na)
  const wCl = -0.7;
  const clSlot = (k: number, tt: number, rr: number, cx: number): [number, number] => {
    const a = wCl * tt + (k * TAU) / 8 + Math.PI;
    return [cx + (rr + 0) * Math.cos(a), Y0 + bobA - (rr + 0) * Math.sin(a)];
  };
  const P0 = naE(tGive);
  const P1 = clSlot(7, tArrive, 70, CL_X0);
  const ePos = (tt: number): [number, number] => {
    if (tt <= tGive) return naE(tt);
    if (tt >= tArrive) return clSlot(7, tt, clR, clX);
    const u = EASE_IN_OUT((tt - tGive) / (tArrive - tGive));
    const cx = 960;
    const cy = 200;
    return [(1 - u) ** 2 * P0[0] + 2 * u * (1 - u) * cx + u * u * P1[0], (1 - u) ** 2 * P0[1] + 2 * u * (1 - u) * cy + u * u * P1[1]];
  };
  const eNow = ePos(t);
  const flying = t > tGive && t < tArrive + 0.2;
  const eTrail = flying ? Array.from({length: 7}, (_, k) => ePos(t - 0.035 * (k + 1))) : undefined;
  const shellFade = 1 - ion; // kulit luar Na & elektron Cl melebur ke bola ion
  const naLbl = 1 - ramp(t, tArrive, tArrive + 0.7);
  const ionLbl = ramp(t, tArrive + 0.2, tArrive + 0.9);
  const pullOn = ramp(t, wordOf(1, 'saling') - 1.2, wordOf(1, 'saling') - 0.4) * (1 - ramp(t, tApp1 - 0.5, tApp1 - 0.1, EASE_IN_OUT));
  const dNow = clX - naX;
  const fLen = Math.min(170, 2.6e7 / (dNow * dNow));
  const fieldOn = ionLbl * phA;
  const contactRip = (t - tApp1) / 1.1;
  const rOn = ramp(t, wordOf(2, 'nol') - 0.3, wordOf(2, 'nol') + 0.5);
  const card1 = slot(t, wordOf(2, 'energi') - 0.4, cue(3) - 0.5);
  const fiveOn = ramp(t, wordOf(2, 'lima') - 0.2, wordOf(2, 'lima') + 0.6);
  const midX = (naX + clX) / 2;
  const fieldArcs = [-70, -35, 0, 35, 70].map((h) => {
    const pts: [number, number][] = [];
    for (let k = 0; k <= 12; k++) {
      const u = k / 12;
      const x = mix(naX + naR * 0.9, clX - clR * 0.9, u);
      pts.push([x, Y0 + bobA + h * Math.sin(Math.PI * u) * (1 + 0.6 * (1 - app))]);
    }
    return pts;
  });

  // ================= B: kisi 3D =================
  const tB = cue(3);
  const S = 165;
  const LCX = 820;
  const LCY = 520;
  const yaw = 0.78 + 0.4 * Math.sin(0.3 * (t - tB));
  const pitch = 0.42 + 0.05 * Math.sin(0.5 * t);
  const tSix = wordOf(3, 'enam');
  const hl = ramp(t, tSix - 0.4, tSix + 0.6);
  const tLock = wordOf(3, 'mengunci');
  const lock = ramp(t, tLock - 0.5, tLock + 0.8, EASE_IN_OUT);
  const coul = ramp(t, wordOf(3, 'gaya') - 0.3, wordOf(3, 'gaya') + 0.6);
  type A3 = {x: number; y: number; z: number; f: number; na: boolean; key: string; nb: number; ctr: boolean};
  const atoms: A3[] = [];
  const P: Record<string, A3> = {};
  if (phB > 0) {
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        for (let k = 0; k < 3; k++) {
          const key = `${i}${j}${k}`;
          const amp = mix(5, 1.2, lock);
          const jx = amp * Math.sin(t * 6.1 + i * 2.3 + j * 1.1 + k * 0.7);
          const jy = amp * Math.sin(t * 5.3 + i * 1.7 + j * 2.9 + k * 1.3);
          const p = proj((i - 1) * S + jx, (j - 1) * S + jy, (k - 1) * S, yaw, pitch, LCX, LCY);
          const off = Math.abs(i - 1) + Math.abs(j - 1) + Math.abs(k - 1);
          const nbIdx = off === 1 ? (i !== 1 ? (i === 0 ? 0 : 1) : j !== 1 ? (j === 0 ? 2 : 3) : k === 0 ? 4 : 5) : -1;
          const a: A3 = {...p, na: (i + j + k) % 2 === 1, key, nb: nbIdx, ctr: off === 0};
          atoms.push(a);
          P[key] = a;
        }
  }
  const sorted = [...atoms].sort((a, b) => b.z - a.z);
  const bonds: {a: A3; b: A3; d: number}[] = [];
  if (phB > 0)
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        for (let k = 0; k < 3; k++) {
          const a = P[`${i}${j}${k}`];
          const d = Math.abs(i - 1) + Math.abs(j - 1) + Math.abs(k - 1);
          if (i < 2) bonds.push({a, b: P[`${i + 1}${j}${k}`], d});
          if (j < 2) bonds.push({a, b: P[`${i}${j + 1}${k}`], d});
          if (k < 2) bonds.push({a, b: P[`${i}${j}${k + 1}`], d});
        }
  const nbs = atoms.filter((a) => a.nb >= 0).sort((a, b) => a.nb - b.nb);
  const octEdges: [A3, A3][] = [];
  for (let p = 0; p < nbs.length; p++) for (let q = p + 1; q < nbs.length; q++) if (Math.floor(nbs[p].nb / 2) !== Math.floor(nbs[q].nb / 2)) octEdges.push([nbs[p], nbs[q]]);
  const ctr = P['111'];
  const wave = (d: number) => 0.5 + 0.5 * Math.sin(t * 3.2 - d * 1.4);

  // ================= C: keras, getas, titik leleh =================
  const tKeras = wordOf(4, 'keras');
  const tGetas = wordOf(4, 'getas');
  const tMelt = wordOf(4, 'titik');
  const SX = 96;
  const SL0 = 250;
  const ST0 = 330;
  const press = ramp(t, tKeras - 0.4, tKeras + 0.1, EASE_IN) * (1 - ramp(t, tKeras + 0.25, tKeras + 0.9, EASE_IN_OUT));
  const shift = ramp(t, tGetas - 0.2, tGetas + 0.6, EASE_IN_OUT) * SX;
  const crack = ramp(t, tGetas + 0.55, tGetas + 1.4, EASE_IN_OUT);
  const repel = ramp(t, tGetas + 0.2, tGetas + 0.6) * (1 - 0.6 * crack);
  const tempF = ramp(t, tMelt - 0.2, wordOf(4, 'Celsius') + 0.4, EASE_IN_OUT);
  const tempC = 25 + (801 - 25) * tempF;
  const TH_X = 1210;
  const TH_TOP = 300;
  const TH_BOT = 745;
  const tY = (T: number) => TH_BOT - (T / 1000) * 420;
  const card2 = ramp(t, wordOf(4, 'delapan') - 0.4, wordOf(4, 'delapan') + 0.4);
  const slab: React.ReactNode[] = [];
  const slabBonds: React.ReactNode[] = [];
  if (phC > 0) {
    const pos = (i: number, j: number): [number, number] => {
      const top = j < 2;
      const amp = 1.6 + 5 * tempF;
      const jx = amp * Math.sin(t * 6.7 + i * 2.1 + j * 1.3);
      const jy = amp * Math.sin(t * 5.9 + i * 1.4 + j * 2.7) + (j === 0 ? press * 6 : 0);
      return [SL0 + i * SX + (top ? shift : 0) + jx + 0, ST0 + j * SX + jy - (top ? 55 * crack : 0)];
    };
    for (let j = 0; j < 5; j++)
      for (let i = 0; i < 7; i++) {
        const [x, y] = pos(i, j);
        if (i < 6) {
          const [x2, y2] = pos(i + 1, j);
          slabBonds.push(<line key={`h${i}${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke="#7d8ab8" strokeWidth={2} opacity={0.35} />);
        }
        if (j < 4) {
          const [x2, y2] = pos(i, j + 1);
          const brk = j === 1 ? 1 - ramp(t, tGetas - 0.2, tGetas + 0.2) : 1;
          if (brk > 0.01) slabBonds.push(<line key={`v${i}${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke="#7d8ab8" strokeWidth={2} opacity={0.35 * brk} />);
        }
        const na = (i + j) % 2 === 0;
        slab.push(<Ball key={`s${i}${j}`} x={x} y={y} r={na ? 20 : 32} color={na ? C.heat : C.pot} sign={na ? '+' : '−'} />);
      }
  }

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <radialGradient id="io-shade" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
          <clipPath id="io-lens">
            <circle cx={LX} cy={LY} r={LR} />
          </clipPath>
        </defs>

        {/* ============ A0: garam di bawah kaca pembesar ============ */}
        {phA0 > 0.001 ? (
          <g opacity={phA0 * lensOn}>
            <Glow x={560} y={540} r={200} color="white" opacity={0.3} />
            <g transform={`translate(560 520) scale(2.2) rotate(${5 * Math.sin(t * 0.7)})`}>
              <path d="M-60,-20 L0,-50 L60,-20 L0,10 Z" fill="#f4f7ff" />
              <path d="M-60,-20 L0,10 L0,80 L-60,50 Z" fill="#c9d2ee" />
              <path d="M60,-20 L0,10 L0,80 L60,50 Z" fill="#a3afd4" />
            </g>
            <Twinkles x={560} y={520} rx={120} ry={110} n={5} color="white" seed={3} />
            <Label x={560} y={720} size={30} weight={600}>
              garam dapur · NaCl
            </Label>
            <line x1={640} y1={430} x2={LX - LR * 0.75} y2={LY - LR * 0.66} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.6} />
            <line x1={640} y1={620} x2={LX - LR * 0.75} y2={LY + LR * 0.66} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.6} />
            <circle cx={LX} cy={LY} r={LR} fill="#0a1230" opacity={0.9} />
            <g clipPath="url(#io-lens)">
              <Glow x={LX} y={LY} r={LR * 1.2} color="spr" opacity={0.35} still />
              {lensIons}
            </g>
            <line x1={LX + LR * 0.72} y1={LY + LR * 0.72} x2={LX + LR * 1.1} y2={LY + LR * 1.1} stroke="#5b6890" strokeWidth={26} strokeLinecap="round" />
            <circle cx={LX} cy={LY} r={LR} fill="none" stroke="#c8d2f0" strokeWidth={12} />
            <circle cx={LX} cy={LY} r={LR - 9} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={3} />
            <Label x={LX} y={LY - LR - 40} size={28} color={C.force} weight={600}>
              kacamata hukum Coulomb
            </Label>
          </g>
        ) : null}

        {/* ============ A: Na + Cl → Na⁺ Cl⁻ ============ */}
        {phA > 0.001 ? (
          <g opacity={phA}>
            <Motes x={960} y={Y0} rx={620} ry={260} n={26} color="ink" opacity={0.35} seed={4} />
            {/* garis medan + → − */}
            <g opacity={fieldOn * 0.8}>
              {fieldArcs.map((pts, i) => (
                <path key={i} d={pts.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} fill="none" stroke={C.force} strokeWidth={2} opacity={0.35} />
              ))}
              {fieldArcs.map((pts, i) => (
                <Stream key={`s${i}`} pts={pts} color="force" n={3} speed={0.45} r={3.2} jitter={0} seed={i} />
              ))}
            </g>
            {/* Na */}
            <Glow x={naX} y={Y0 + bobA} r={naShell * 1.3} color="spr" opacity={0.3 * (1 - ion)} />
            <Glow x={naX} y={Y0 + bobA} r={naShell * 1.3} color="heat" opacity={0.45 * ion} />
            <circle cx={naX} cy={Y0 + bobA} r={naShell} fill={NEUT} opacity={0.12 * shellFade} />
            <circle cx={naX} cy={Y0 + bobA} r={naShell} fill="none" stroke={C.pot} strokeWidth={2} strokeDasharray="4 7" opacity={0.6 * shellFade} />
            <Ball x={naX} y={Y0 + bobA} r={naR} color={NEUT} op={1 - ion} />
            <Ball x={naX} y={Y0 + bobA} r={naR} color={C.heat} op={ion} sign="+" />
            {/* Cl */}
            <Glow x={clX} y={Y0 + bobA} r={clR * 1.7} color="pot" opacity={0.25 + 0.3 * ion} />
            <Ball x={clX} y={Y0 + bobA} r={clR} color={NEUT} op={1 - ion} />
            <Ball x={clX} y={Y0 + bobA} r={clR} color={C.pot} op={ion} sign="−" />
            {Array.from({length: 7}, (_, k) => {
              const [x, y] = clSlot(k, t, clR, clX);
              return <Spark key={k} x={x} y={y} r={6} color="pot" opacity={0.9 * shellFade} />;
            })}
            {/* elektron yang berpindah */}
            <Spark x={eNow[0]} y={eNow[1]} r={flying ? 9 : 7} color="pot" opacity={t < tArrive ? 1 : shellFade} trail={eTrail} />
            <Ripple x={P1[0]} y={P1[1]} p={(t - tArrive + 0.1) / 1.0} r={90} color="pot" />
            <Label x={960} y={235} size={26} color={C.pot} opacity={ramp(t, tGive - 0.2, tGive + 0.3) * (1 - ramp(t, tArrive + 0.4, tArrive + 1, EASE_IN_OUT))}>
              e⁻
            </Label>
            {/* label atom / ion */}
            <Label x={naX} y={Y0 + bobA + naShell + 46} size={32} weight={600} opacity={naLbl}>
              atom Na
            </Label>
            <Label x={clX} y={Y0 + bobA + 150} size={32} weight={600} opacity={naLbl}>
              atom Cl
            </Label>
            <Label x={naX - 40 * app} y={Y0 + bobA + 175} size={34} weight={700} color={C.heat} opacity={ionLbl}>
              Na⁺
            </Label>
            <Label x={clX + 40 * app} y={Y0 + bobA + 175} size={34} weight={700} color={C.pot} opacity={ionLbl}>
              Cl⁻
            </Label>
            <Label x={naX - 40 * app} y={Y0 + bobA + 215} size={22} color={C.work} opacity={ionLbl * (1 - ramp(t, wordOf(2, 'energi') - 0.5, wordOf(2, 'energi')))}>
              ion natrium
            </Label>
            <Label x={clX + 40 * app} y={Y0 + bobA + 215} size={22} color={C.work} opacity={ionLbl * (1 - ramp(t, wordOf(2, 'energi') - 0.5, wordOf(2, 'energi')))}>
              ion klorida
            </Label>
            {/* gaya tarik ∝ 1/r² */}
            <g opacity={pullOn}>
              <Arrow x1={naX + naR + 8} y1={Y0 + bobA} x2={naX + naR + 8 + fLen} y2={Y0 + bobA} color="force" width={6} />
              <Arrow x1={clX - clR - 8} y1={Y0 + bobA} x2={clX - clR - 8 - fLen} y2={Y0 + bobA} color="force" width={6} />
              <Label x={(naX + clX) / 2} y={Y0 + bobA - 70} size={26} color={C.force} weight={600}>
                saling menarik
              </Label>
            </g>
            <Ripple x={NA_X1 + naR + 2} y={Y0 + bobA} p={contactRip} r={160} color="force" />
            {/* jarak r */}
            <g opacity={rOn}>
              <line x1={NA_X1} y1={Y0 - 150} x2={CL_X1} y2={Y0 - 150} stroke={C.ink} strokeWidth={2.5} />
              <line x1={NA_X1} y1={Y0 - 165} x2={NA_X1} y2={Y0 - 80} stroke={C.ink} strokeWidth={2} opacity={0.7} />
              <line x1={CL_X1} y1={Y0 - 165} x2={CL_X1} y2={Y0 - 135} stroke={C.ink} strokeWidth={2} opacity={0.7} />
              <Label x={(NA_X1 + CL_X1) / 2} y={Y0 - 190} size={30} weight={600} font="mono">
                r = 0,282 nm
              </Label>
            </g>
            <Glow x={midX} y={Y0} r={150} color="kin" opacity={0.6 * fiveOn} />
            <Twinkles x={midX} y={Y0} rx={160} ry={110} n={6} color="kin" opacity={fiveOn} seed={7} />
          </g>
        ) : null}

        {/* ============ B: kisi kristal 3D ============ */}
        {phB > 0.001 ? (
          <g opacity={phB}>
            <Glow x={LCX} y={LCY} r={380} color="spr" opacity={0.3} />
            <Motes x={LCX} y={LCY} rx={360} ry={300} n={24} color="ink" opacity={0.35} seed={9} />
            {bonds.map(({a, b, d}, i) => (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#8e9cc8" strokeWidth={2} opacity={0.3} />
                {lock > 0.01 ? <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.force} strokeWidth={3} opacity={lock * (0.2 + 0.5 * wave(d))} /> : null}
              </g>
            ))}
            {/* oktahedron 6 tetangga */}
            <g opacity={hl}>
              {octEdges.map(([a, b], i) => (
                <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.gold} strokeWidth={2.5} strokeDasharray="7 6" opacity={0.75} />
              ))}
            </g>
            {sorted.map((a) => {
              const isNb = a.nb >= 0;
              const lit = isNb ? ramp(t, tSix - 0.5 + a.nb * 0.16, tSix - 0.1 + a.nb * 0.16) : 0;
              const dim = isNb || a.ctr ? 1 : 1 - 0.45 * hl;
              return (
                <g key={a.key}>
                  {isNb ? <Glow x={a.x} y={a.y} r={70 * a.f} color="pot" opacity={lit} /> : null}
                  {a.ctr ? <Glow x={a.x} y={a.y} r={90} color="heat" opacity={0.3 + 0.7 * hl} /> : null}
                  <Ball x={a.x} y={a.y} r={(a.na ? 26 : 42) * a.f} color={a.na ? C.heat : C.pot} op={dim} sign={a.na ? '+' : '−'} signOp={a.f > 0.95 ? 1 : 0.6} />
                  {isNb ? <Ripple x={a.x} y={a.y} p={(t - (tSix - 0.3 + a.nb * 0.16)) / 0.9} r={60} color="pot" rings={2} /> : null}
                </g>
              );
            })}
            {/* tarikan Coulomb dari pusat ke 6 tetangga */}
            <g opacity={coul * hl}>
              {nbs.map((n, i) => {
                const k = 0.42;
                return <Arrow key={i} x1={n.x} y1={n.y} x2={mix(n.x, ctr.x, k)} y2={mix(n.y, ctr.y, k)} color="force" width={4} pulse={false} />;
              })}
            </g>
            <Ripple x={ctr.x} y={ctr.y} p={(t - tLock) / 1.4} r={330} color="force" />
          </g>
        ) : null}

        {/* ============ C: keras, getas, titik leleh ============ */}
        {phC > 0.001 ? (
          <g opacity={phC}>
            <Glow x={540} y={520} r={360} color="spr" opacity={0.22} />
            {slabBonds}
            {slab}
            {/* tekanan palu (keras) */}
            <g opacity={ramp(t, tKeras - 0.6, tKeras - 0.3) * (1 - ramp(t, tKeras + 0.8, tKeras + 1.3, EASE_IN_OUT))}>
              <Arrow x1={538} y1={210 + 30 * press} x2={538} y2={265 + 30 * press} color="force" width={7} pulse={false} />
            </g>
            <Ripple x={538} y={300} p={(t - tKeras) / 0.9} r={120} color="force" />
            {/* tolakan sejenis setelah lapisan bergeser */}
            <g opacity={repel}>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const x = SL0 + (i + 1) * SX;
                const yA = ST0 + SX - 55 * crack;
                const yB = ST0 + 2 * SX;
                return (
                  <g key={i}>
                    <Arrow x1={x} y1={yA - 10} x2={x} y2={yA - 52} color="force" width={4} pulse={false} />
                    <Arrow x1={x} y1={yB + 10} x2={x} y2={yB + 52} color="force" width={4} pulse={false} />
                  </g>
                );
              })}
            </g>
            <path
              d={`M${SL0 - 40},${ST0 + 1.5 * SX - 10 * crack} l60,14 l50,-18 l60,20 l55,-16 l60,18 l55,-20 l60,16 l55,-14 l60,18 l40,-10`}
              fill="none"
              stroke={C.press}
              strokeWidth={4}
              strokeLinejoin="round"
              opacity={crack}
            />
            <Ripple x={SL0 + 3 * SX} y={ST0 + 1.5 * SX} p={(t - tGetas - 0.6) / 1.1} r={260} color="press" />
            <Label x={548} y={820} size={26} color={C.ink} opacity={repel * 0.85}>
              lapisan bergeser → muatan sejenis berhadapan → tolak → retak
            </Label>
            {/* termometer */}
            <Glow x={TH_X} y={tY(tempC)} r={120} color="heat" opacity={0.35 * tempF} />
            <rect x={TH_X - 20} y={TH_TOP - 20} width={40} height={TH_BOT - TH_TOP + 40} rx={20} fill="#0d1534" stroke="#9aa6d6" strokeWidth={3} />
            <rect x={TH_X - 9} y={tY(tempC)} width={18} height={TH_BOT - tY(tempC) + 20} rx={9} fill={C.heat} />
            <circle cx={TH_X} cy={TH_BOT + 40} r={40} fill={C.heat} stroke="#9aa6d6" strokeWidth={3} />
            <circle cx={TH_X - 12} cy={TH_BOT + 28} r={10} fill="#fff" opacity={0.4} />
            {[0, 200, 400, 600, 800, 1000].map((T) => (
              <g key={T}>
                <line x1={TH_X - 34} y1={tY(T)} x2={TH_X - 22} y2={tY(T)} stroke={C.muted} strokeWidth={2} />
                <Label x={TH_X - 44} y={tY(T)} size={20} color={C.muted} anchor="end" font="mono">
                  {T}
                </Label>
              </g>
            ))}
            <g opacity={card2}>
              <line x1={TH_X + 24} y1={tY(801)} x2={TH_X + 120} y2={tY(801)} stroke={C.gold} strokeWidth={2.5} strokeDasharray="7 6" />
            </g>
            <Label x={TH_X} y={TH_TOP - 52} size={26} color={C.heat} font="mono" weight={600} opacity={ramp(t, tMelt - 0.4, tMelt)}>
              {`${Math.round(tempC)} °C`}
            </Label>
            {[0, 1, 2, 3].map((i) => {
              const ph = (t * 0.5 + i / 4) % 1;
              return <circle key={i} cx={TH_X + 30 * Math.sin(ph * 6 + i)} cy={TH_BOT - 40 - ph * 380} r={5} fill={C.heat} opacity={0.5 * cyc(ph) * tempF} />;
            })}
            <Twinkles x={1580} y={430} rx={230} ry={90} n={6} color="gold" opacity={card2} seed={11} />
          </g>
        ) : null}
      </Stage>

      {/* ============ kartu HTML ============ */}
      <Badge x={420} y={208} text="keras" color={C.force} opacity={ramp(t, tKeras - 0.2, tKeras + 0.3) * phC} size={28} />
      <Badge x={680} y={208} text="getas" color={C.press} opacity={ramp(t, tGetas - 0.2, tGetas + 0.3) * phC} size={28} />
      <Formula x={960} y={800} p={card1} accent={C.kin} size={60} caption={<>r = 0,282 nm → 8,2 × 10<Sup>−19</Sup> J</>}>
        |<V>U</V>| = <Frac n={<><V>k</V><V>e</V><Sup>2</Sup></>} d={<V>r</V>} /> ≈ <span style={{color: C.kin}}>5 eV</span>
      </Formula>
      <Note x={1500} y={330} p={slot(t, tSix - 0.3, wordOf(3, 'gaya') - 0.2) * phB} color={C.gold} size={30}>
        setiap ion: <span style={{color: C.gold}}>6 tetangga</span> berlawanan
      </Note>
      <Note x={1500} y={330} p={slot(t, wordOf(3, 'gaya') - 0.2, cue(4) - 0.5) * phB} color={C.force} size={30}>
        gaya Coulomb seluruh kisi
        <br />
        <span style={{color: C.force}}>mengunci</span> ion di tempatnya
      </Note>
      <Formula x={1580} y={430} p={card2 * phC} accent={C.heat} size={60} caption="titik leleh garam dapur">
        <V>T</V>
        <sub style={{fontSize: '0.5em', verticalAlign: '-0.3em', lineHeight: 0, fontFamily: 'Inter', fontStyle: 'normal'}}>leleh</sub> ≈ <span style={{color: C.heat}}>801 °C</span>
      </Formula>
    </AbsoluteFill>
  );
};
