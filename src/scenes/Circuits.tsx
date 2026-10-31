import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, ramp} from '../anim';
import {Formula, Glow, Label, Motes, Ripple, Stage, Sub, Twinkles, V, pointAlong} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Rangkaian (AUDIT): seri: I sama, R_total = ΣR; paralel: V sama, I terbagi; instalasi rumah paralel.
// Angka (tidak diucapkan): baterai 12 V, tiap lampu 4 Ω.
//   seri: R = 12 Ω → I = 1 A, P tiap lampu = I²R = 4 W (redup)
//   paralel: tiap cabang 12 V / 4 Ω = 3 A, total 9 A, P tiap lampu = 36 W (terang)
// Kecepatan butir arus ∝ I (jarak antar-butir sama), arah konvensional + → −.

type P = [number, number];
const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const intRamp = (t: number, a: number, L: number) => (t < a ? 0 : t < a + L ? ((t - a) * (t - a)) / (2 * L) : L / 2 + (t - a - L));
const VPA = 30; // px/s per ampere
const GAP = 38;

const lenOf = (pts: P[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const dOf = (pts: P[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');

/** Butir arus (toska) sepanjang ruas; `dist` = jarak tempuh (px), memudar di ujung ruas agar tidak meloncat. */
const Flow: React.FC<{pts: P[]; dist: number; op?: number; seed?: number}> = ({pts, dist, op = 1, seed = 0}) => {
  const L = lenOf(pts);
  const n = Math.max(1, Math.floor(L / GAP));
  const g = L / n;
  if (op <= 0.001) return null;
  return (
    <g opacity={op}>
      {Array.from({length: n}, (_, k) => {
        const s = (((k * g + dist + seed * 13) % L) + L) % L;
        const [x, y] = pointAlong(pts, s / L);
        const f = Math.min(1, s / 14, (L - s) / 14);
        return (
          <g key={k} opacity={f}>
            <circle cx={x} cy={y} r={11} fill="url(#soft-cyan)" />
            <circle cx={x} cy={y} r={4.4} fill={C.cyan} />
            <circle cx={x} cy={y} r={1.8} fill="#fff" />
          </g>
        );
      })}
    </g>
  );
};

const Bulb: React.FC<{x: number; y: number; b: number; r?: number}> = ({x, y, b, r = 34}) => (
  <g>
    <Glow x={x} y={y} r={r * (2.4 + 3.2 * b)} color="gold" opacity={Math.min(1, b * 1.4)} />
    <circle cx={x} cy={y} r={r} fill="#1b2550" stroke="#c8cfe6" strokeWidth={3} />
    <circle cx={x} cy={y} r={r} fill={C.gold} opacity={0.85 * b} />
    <path
      d={`M${x - r * 0.42},${y + r * 0.5} L${x - r * 0.42},${y} Q${x - r * 0.21},${y - r * 0.55} ${x},${y} Q${x + r * 0.21},${y - r * 0.55} ${x + r * 0.42},${y} L${x + r * 0.42},${y + r * 0.5}`}
      fill="none"
      stroke="#fff"
      strokeWidth={2.6}
      opacity={0.45 + 0.55 * b}
    />
    <circle cx={x - r * 0.35} cy={y - r * 0.4} r={r * 0.22} fill="#fff" opacity={0.25} />
  </g>
);

const Battery: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-36} y={-62} width={72} height={124} rx={12} fill="#1b2550" stroke="#5a6aa8" strokeWidth={2.5} />
    <rect x={-36} y={-62} width={72} height={40} rx={12} fill={C.heat} opacity={0.75} />
    <rect x={-26} y={-52} width={8} height={100} rx={4} fill="#fff" opacity={0.15} />
    <text x={0} y={-42} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={26} fill="#fff">
      +
    </text>
    <text x={0} y={34} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={30} fill={C.pot}>
      −
    </text>
  </g>
);

const Tag: React.FC<{x: number; y: number; text: string; color: string; op?: number; size?: number}> = ({x, y, text, color, op = 1, size = 24}) =>
  op <= 0.001 ? null : (
    <g opacity={op}>
      <rect x={x - (text.length * size * 0.32 + 14)} y={y - size * 0.7} width={text.length * size * 0.64 + 28} height={size * 1.4} rx={size * 0.7} fill="#0a1022" stroke={color} strokeWidth={2} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontSize={size} fontWeight={600} fill={color}>
        {text}
      </text>
    </g>
  );

// ---------- seri ----------
const S_LOOP: P[] = [
  [200, 498],
  [200, 360],
  [840, 360],
  [840, 760],
  [200, 760],
  [200, 622],
];
const S_BULBS = [360, 520, 680];

// ---------- paralel ----------
const PX = [1300, 1500, 1700];
const P_SEG: {pts: P[]; I: number}[] = [
  {pts: [[1080, 498], [1080, 360], [1300, 360]], I: 9},
  {pts: [[1300, 360], [1500, 360]], I: 6},
  {pts: [[1500, 360], [1700, 360]], I: 3},
  ...PX.map((x) => ({pts: [[x, 360], [x, 760]] as P[], I: 3})),
  {pts: [[1700, 760], [1500, 760]], I: 3},
  {pts: [[1500, 760], [1300, 760]], I: 6},
  {pts: [[1300, 760], [1080, 760], [1080, 622]], I: 9},
];

// ---------- rumah ----------
const HX = [666, 960, 1254];
const TOP = 470;
const BOT = 800;

export const Circuits: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  const sIn = ramp(t, wordOf(0, 'berderet') - 0.6, wordOf(0, 'berderet') + 0.4);
  const pIn = ramp(t, wordOf(0, 'bercabang') - 0.6, wordOf(0, 'bercabang') + 0.4);
  const out = 1 - ramp(t, cue(3) - 0.4, cue(3) + 0.3, EASE_IN_OUT);
  const focS = ramp(t, cue(1) - 0.3, cue(1) + 0.5) * (1 - ramp(t, cue(2) - 0.3, cue(2) + 0.5, EASE_IN_OUT));
  const focP = ramp(t, cue(2) - 0.3, cue(2) + 0.5);
  const dimS = 1 - 0.6 * focP;
  const dimP = 1 - 0.6 * focS;
  const tS = Math.max(0, t - (wordOf(0, 'berderet') - 0.6));
  const tP = Math.max(0, t - (wordOf(0, 'bercabang') - 0.6));
  const tagS = ramp(t, wordOf(1, 'arusnya') - 0.3, wordOf(1, 'arusnya') + 0.4);
  const tagSR = ramp(t, wordOf(1, 'hambatan', 1) - 0.4, wordOf(1, 'hambatan', 1) + 0.4);
  const tagPV = ramp(t, wordOf(2, 'tegangannya') - 0.3, wordOf(2, 'tegangannya') + 0.4);
  const tagPI = ramp(t, wordOf(2, 'terbagi') - 0.5, wordOf(2, 'terbagi') + 0.4);

  // rumah
  const house = ramp(t, cue(3) - 0.1, cue(3) + 0.9);
  const tOff = wordOf(3, 'padam') - 0.2;
  const off = ramp(t, tOff, tOff + 0.35, EASE_IN_OUT);
  const lampB = [1, 1 - off, 1];
  const vH = 55; // px/s per lampu
  const tH = Math.max(0, t - (cue(3) - 0.1));
  // jarak tempuh tertutup: ruas dengan arus berubah dari a ke b saat sakelar dibuka
  const distH = (a: number, b: number) => vH * (a * tH + (b - a) * intRamp(t, tOff, 0.35));

  return (
    <AbsoluteFill>
      <Stage>
        {/* ===================== SERI ===================== */}
        <g opacity={sIn * out * dimS}>
          <Glow x={520} y={560} r={360} color="cyan" opacity={0.18 + 0.3 * focS} />
          <path d={dOf(S_LOOP)} fill="none" stroke="#5f6fa8" strokeWidth={7} strokeLinejoin="round" />
          <Flow pts={S_LOOP} dist={VPA * 1 * tS} />
          <Battery x={200} y={560} />
          <Label x={118} y={560} size={28} weight={600} color={C.spr}>
            12 V
          </Label>
          {S_BULBS.map((x, i) => (
            <g key={x}>
              <Bulb x={x} y={360} b={0.33 + 0.03 * Math.sin(t * 3 + i)} />
              <Label x={x} y={414} size={24} color={C.press} opacity={tagSR}>
                4 Ω
              </Label>
            </g>
          ))}
          {[
            [440, 404],
            [600, 404],
            [886, 560],
            [520, 806],
          ].map(([x, y], i) => (
            <Tag key={i} x={x} y={y} text="1 A" color={C.cyan} op={ramp(tagS, i * 0.15, i * 0.15 + 0.5)} />
          ))}
          <Label x={520} y={560} size={32} weight={600} color={C.ink} opacity={1 - tagS * 0.5}>
            seri
          </Label>
          <Label x={520} y={600} size={24} color={C.cyan} opacity={tagS}>
            arus sama di semua lampu
          </Label>
          <Motes x={520} y={560} rx={320} ry={200} n={14} color="cyan" opacity={0.35 * focS} seed={2} />
        </g>

        {/* ===================== PARALEL ===================== */}
        <g opacity={pIn * out * dimP}>
          <Glow x={1400} y={560} r={380} color="cyan" opacity={0.18 + 0.3 * focP} />
          {P_SEG.map((s, i) => (
            <path key={i} d={dOf(s.pts)} fill="none" stroke="#5f6fa8" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {P_SEG.map((s, i) => (
            <Flow key={i} pts={s.pts} dist={VPA * s.I * tP} seed={i} />
          ))}
          <Battery x={1080} y={560} />
          {PX.map((x, i) => (
            <g key={x}>
              <Bulb x={x} y={560} b={0.94 + 0.06 * Math.sin(t * 3 + i)} />
              <Label x={x + 50} y={496} size={24} color={C.press} anchor="start" opacity={tagPV}>
                4 Ω
              </Label>
              <Tag x={x - 62} y={560} text="12 V" color={C.spr} op={ramp(tagPV, i * 0.15, i * 0.15 + 0.5)} size={20} />
              <Tag x={x} y={650} text="3 A" color={C.cyan} op={ramp(tagPI, 0.2 + i * 0.15, 0.7 + i * 0.15)} />
            </g>
          ))}
          <Tag x={1190} y={336} text="9 A" color={C.cyan} op={tagPI} />
          <Tag x={1400} y={336} text="6 A" color={C.cyan} op={ramp(tagPI, 0.2, 0.7)} />
          <Tag x={1600} y={336} text="3 A" color={C.cyan} op={ramp(tagPI, 0.4, 0.9)} />
          <Label x={1400} y={820} size={32} weight={600} color={C.ink}>
            paralel
          </Label>
          <Motes x={1400} y={560} rx={340} ry={200} n={14} color="gold" opacity={0.35 * focP} seed={4} />
        </g>

        {/* ===================== RUMAH ===================== */}
        <g opacity={house} transform={`translate(0,${(1 - house) * 24})`}>
          {/* rumah */}
          <path d="M470,410 L960,205 L1450,410" fill="none" stroke="#7d8cc4" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
          <path d="M470,410 L960,205 L1450,410 Z" fill="#141d40" opacity={0.6} />
          <rect x={520} y={410} width={880} height={440} fill="#0f1733" stroke="#7d8cc4" strokeWidth={4} />
          {HX.map((x, i) => (
            <rect key={i} x={520 + i * 293.3 + 4} y={414} width={285} height={432} fill={C.gold} opacity={0.1 * lampB[i] * (0.9 + 0.1 * Math.sin(t * 2 + i))} />
          ))}
          <line x1={813} y1={410} x2={813} y2={850} stroke="#7d8cc4" strokeWidth={3} opacity={0.6} />
          <line x1={1107} y1={410} x2={1107} y2={850} stroke="#7d8cc4" strokeWidth={3} opacity={0.6} />
          <circle cx={960} cy={320} r={34} fill="none" stroke="#7d8cc4" strokeWidth={3} opacity={0.6} />
          {/* sumber */}
          <rect x={230} y={560} width={110} height={150} rx={14} fill="#1b2550" stroke={C.spr} strokeWidth={3} />
          <Label x={285} y={612} size={24} color={C.spr} weight={600}>
            sumber
          </Label>
          <path d="M285,650 l-14,24 h12 l-6,22 l22,-30 h-12 l8,-16 Z" fill={C.force} opacity={0.9} />
          {/* kabel */}
          <path d={`M340,590 L420,590 L420,${TOP} L${HX[2]},${TOP}`} fill="none" stroke="#5f6fa8" strokeWidth={6} strokeLinejoin="round" />
          <path d={`M340,680 L420,680 L420,${BOT} L${HX[2]},${BOT}`} fill="none" stroke="#5f6fa8" strokeWidth={6} strokeLinejoin="round" />
          {HX.map((x) => (
            <path key={x} d={`M${x},${TOP} L${x},${BOT}`} fill="none" stroke="#5f6fa8" strokeWidth={5} />
          ))}
          {/* butir arus */}
          <Flow pts={[[340, 590], [420, 590], [420, TOP], [HX[0], TOP]]} dist={distH(3, 2)} />
          <Flow pts={[[HX[0], TOP], [HX[1], TOP]]} dist={distH(2, 1)} seed={1} />
          <Flow pts={[[HX[1], TOP], [HX[2], TOP]]} dist={distH(1, 1)} seed={2} />
          {HX.map((x, i) => (
            <Flow key={x} pts={[[x, TOP], [x, BOT]]} dist={distH(1, i === 1 ? 0 : 1)} op={i === 1 ? 1 - off : 1} seed={3 + i} />
          ))}
          <Flow pts={[[HX[2], BOT], [HX[1], BOT]]} dist={distH(1, 1)} seed={6} />
          <Flow pts={[[HX[1], BOT], [HX[0], BOT]]} dist={distH(2, 1)} seed={7} />
          <Flow pts={[[HX[0], BOT], [420, BOT], [420, 680], [340, 680]]} dist={distH(3, 2)} seed={8} />
          {/* sakelar & lampu tiap ruangan */}
          {HX.map((x, i) => {
            const open = i === 1 ? off : 0;
            const ang = (-38 * open * Math.PI) / 180;
            return (
              <g key={x}>
                <rect x={x - 14} y={520} width={28} height={50} fill="#0f1733" />
                <circle cx={x} cy={525} r={6} fill="#c8cfe6" />
                <circle cx={x} cy={567} r={6} fill="#c8cfe6" />
                <line x1={x} y1={525} x2={x + 42 * Math.sin(-ang)} y2={525 + 42 * Math.cos(ang)} stroke="#e6ebff" strokeWidth={6} strokeLinecap="round" />
                <Bulb x={x} y={665} b={lampB[i] * (0.92 + 0.08 * Math.sin(t * 2.5 + i))} r={36} />
                <Tag x={x} y={445} text="tegangan penuh" color={C.spr} size={18} op={ramp(t, wordOf(3, 'tegangan') - 0.3 + i * 0.15, wordOf(3, 'tegangan') + 0.3 + i * 0.15)} />
              </g>
            );
          })}
          <Ripple x={HX[0]} y={665} p={ramp(t, tOff + 0.3, tOff + 1.6)} r={130} color="gold" />
          <Ripple x={HX[2]} y={665} p={ramp(t, tOff + 0.3, tOff + 1.6)} r={130} color="gold" />
          <Label x={HX[0]} y={760} size={24} weight={600} color={C.gold} opacity={ramp(t, tOff + 0.3, tOff + 0.9)}>
            tetap menyala
          </Label>
          <Label x={HX[2]} y={760} size={24} weight={600} color={C.gold} opacity={ramp(t, tOff + 0.3, tOff + 0.9)}>
            tetap menyala
          </Label>
          <Label x={HX[1]} y={760} size={24} weight={600} color={C.muted} opacity={off}>
            padam
          </Label>
          <Twinkles x={HX[0]} y={665} rx={60} ry={50} n={3} opacity={ramp(t, tOff + 0.3, tOff + 0.9)} />
          <Twinkles x={HX[2]} y={665} rx={60} ry={50} n={3} opacity={ramp(t, tOff + 0.3, tOff + 0.9)} seed={5} />
          <Label x={1640} y={540} size={30} weight={600} color={C.ink}>
            dirangkai
          </Label>
          <Label x={1640} y={580} size={30} weight={600} color={C.cyan}>
            paralel
          </Label>
          <Motes x={960} y={600} rx={520} ry={260} n={18} color="gold" opacity={0.3} seed={9} />
        </g>
      </Stage>

      {/* ===================== kartu rumus ===================== */}
      <Formula x={520} y={228} p={slot(t, wordOf(1, 'hambatan', 1) - 0.4, cue(3) - 0.1) * dimS} accent={C.press} size={56} caption="4 Ω + 4 Ω + 4 Ω = 12 Ω  →  I = 1 A">
        <V color="press">R</V>
        <Sub>total</Sub> = <V color="press">R</V>
        <Sub>1</Sub> + <V color="press">R</V>
        <Sub>2</Sub> + <V color="press">R</V>
        <Sub>3</Sub>
      </Formula>
      <Formula x={1400} y={228} p={slot(t, wordOf(2, 'terbagi') - 0.4, cue(3) - 0.1)} accent={C.cyan} size={56} caption="3 A + 3 A + 3 A = 9 A">
        <V color="cyan">I</V> = <V color="cyan">I</V>
        <Sub>1</Sub> + <V color="cyan">I</V>
        <Sub>2</Sub> + <V color="cyan">I</V>
        <Sub>3</Sub>
      </Formula>
    </AbsoluteFill>
  );
};

