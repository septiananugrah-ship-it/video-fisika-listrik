import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE, EASE_IN_OUT, cyc, mix, pathOf, ramp, win} from '../anim';
import {Arrow, Formula, Glow, Label, Motes, Ripple, Spark, Stage, Sup, Twinkles, pointAlong} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// 01 Muatan listrik (semua gerak analitik per frame):
// (0) tiga panel: (+ +) dan (− −) tolak-menolak, (+ −) tarik-menarik — garis medan dihitung langsung (RK2) dari
//     medan dua muatan, panah gaya (di atas muatan) ∝ 1/r² dengan skala sama;
// (1) proton + dan elektron − (mengorbit): batang |+e| dan |−e| sama panjang;
// (2) kartu e = 1,6×10⁻¹⁹ C; garis bilangan q = n·e: penanda melangkah bulat, keping +e bertambah satu-satu;
// (3) balon digosok: elektron pindah rambut → balon; penghitung rambut +ne, balon −ne, total 0 (kekal);
// (4) balon − mendekati dinding: awan elektron molekul dinding terdorong menjauh (polarisasi), sisi dekat +, balon menempel.
const fr = (v: number) => ((v % 1) + 1) % 1;
const lin = (x: number) => x;

type Q = {x: number; y: number; q: number};
const trace = (qs: Q[], x0: number, y0: number, dir: number, steps: number, ds: number, stopR: number, box: number[]): [number, number][] => {
  const E = (x: number, y: number) => {
    let ex = 0;
    let ey = 0;
    for (const c of qs) {
      const dx = x - c.x;
      const dy = y - c.y;
      const r2 = dx * dx + dy * dy + 1e-3;
      const r3 = r2 * Math.sqrt(r2);
      ex += (c.q * dx) / r3;
      ey += (c.q * dy) / r3;
    }
    const m = Math.hypot(ex, ey) || 1;
    return [(dir * ex) / m, (dir * ey) / m];
  };
  const pts: [number, number][] = [[x0, y0]];
  let x = x0;
  let y = y0;
  for (let i = 0; i < steps; i++) {
    const [ax, ay] = E(x, y);
    const [bx, by] = E(x + ax * ds * 0.5, y + ay * ds * 0.5);
    x += bx * ds;
    y += by * ds;
    pts.push([x, y]);
    if (qs.some((c) => c.q * dir < 0 && Math.hypot(x - c.x, y - c.y) < stopR)) break;
    if (x < box[0] || x > box[1] || y < box[2] || y > box[3]) break;
  }
  return pts;
};

const Q0: React.FC<{x: number; y: number; r: number; s: number; op?: number; sc?: number}> = ({x, y, r, s, op = 1, sc = 1}) =>
  op <= 0.001 ? null : (
    <g opacity={op} transform={`translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>
      <circle cx={x} cy={y} r={r * 2.6} fill={`url(#soft-${s > 0 ? 'heat' : 'pot'})`} />
      <circle cx={x} cy={y} r={r} fill={s > 0 ? C.heat : C.pot} stroke={s > 0 ? '#ffc2ca' : '#c8e4ff'} strokeWidth={r * 0.08} />
      <circle cx={x - r * 0.32} cy={y - r * 0.36} r={r * 0.34} fill="#fff" opacity={0.3} />
      <line x1={x - r * 0.45} y1={y} x2={x + r * 0.45} y2={y} stroke="#fff" strokeWidth={r * 0.16} strokeLinecap="round" />
      {s > 0 ? <line x1={x} y1={y - r * 0.45} x2={x} y2={y + r * 0.45} stroke="#fff" strokeWidth={r * 0.16} strokeLinecap="round" /> : null}
    </g>
  );

/** Garis medan + butir yang merambat dari + ke −. */
const FieldLines: React.FC<{lines: [number, number][][]; t: number; op: number}> = ({lines, t, op}) =>
  op <= 0.001 ? null : (
    <g opacity={op}>
      {lines.map((pts, k) => (
        <g key={k}>
          <path d={pathOf(pts)} fill="none" stroke={C.force} strokeWidth={2.5} opacity={0.5} />
          {[0, 0.5].map((o) => {
            const ph = fr(t * 0.32 + o + k * 0.19);
            const [x, y] = pointAlong(pts, ph);
            return <circle key={o} cx={x} cy={y} r={4} fill={C.force} opacity={cyc(ph)} />;
          })}
        </g>
      ))}
    </g>
  );

// panel fase 0
const PX = [400, 960, 1520];
const PYc = 520;
const PW = 480;
const PH = 400;
// fase 3–4
const HEAD = {x: 470, y: 520, r: 105};
const BR = 80;
const NE = 6;
const STR = Array.from({length: 13}, (_, i) => -2.9 + (i / 12) * 2.5);
const WX = 1460;
const WALLM = Array.from({length: 7 * 13}, (_, i) => ({x: WX + 32 + (i % 7) * 50, y: 230 + Math.floor(i / 7) * 50}));
// garis bilangan fase 2
const NX0 = 360;
const NSTEP = 200;
const NY = 640;

export const Charge: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const c = [0, 1, 2, 3, 4].map(cue);
  const end = 1 - ramp(t, dur - 0.6, dur + 0.4, EASE_IN_OUT);

  // ---------- fase 0: tolak & tarik ----------
  const ph0 = win(t, c[0] - 0.6, c[1] - 0.5, 0.6, 0.6);
  const pos = ramp(t, wordOf(0, 'positif') - 0.3, wordOf(0, 'positif') + 0.4, EASE);
  const neg = ramp(t, wordOf(0, 'negatif') - 0.3, wordOf(0, 'negatif') + 0.4, EASE);
  const rep = ramp(t, wordOf(0, 'sejenis') - 0.2, wordOf(0, 'tolak') + 0.9, EASE_IN_OUT);
  const att = ramp(t, wordOf(0, 'berlawanan') - 0.2, wordOf(0, 'tarik') + 0.9, EASE_IN_OUT);
  const panels = PX.map((cx, k) => {
    const repel = k < 2;
    const d = repel ? 150 + 120 * rep + 10 * Math.sin(t * 1.3 + k) : 320 - 130 * att + 10 * Math.sin(t * 1.3 + 2);
    const s1 = k === 1 ? -1 : 1;
    const s2 = k === 0 ? 1 : -1;
    const qs: Q[] = [
      {x: cx - d / 2, y: PYc, q: s1},
      {x: cx + d / 2, y: PYc, q: s2},
    ];
    const box = [cx - PW / 2 + 8, cx + PW / 2 - 8, PYc - PH / 2 + 8, PYc + PH / 2 - 8];
    const on = repel ? rep : att;
    let lines: [number, number][][] = [];
    if (on > 0.01) {
      const angs = [0, 0.6, 1.2, 1.9, 2.55, 3.14159, -0.6, -1.2, -1.9, -2.55];
      if (k === 1) {
        // − −: telusuri mundur dari tiap muatan negatif, lalu balik agar arah + → −
        lines = qs.flatMap((qq) => angs.map((a) => trace(qs, qq.x + 32 * Math.cos(a), PYc + 32 * Math.sin(a), -1, 70, 7, 26, box).reverse()));
      } else if (k === 0) {
        lines = qs.flatMap((qq) => angs.map((a) => trace(qs, qq.x + 32 * Math.cos(a), PYc + 32 * Math.sin(a), 1, 70, 7, 26, box)));
      } else {
        lines = [0, 0.45, 0.9, 1.4, 2.0, 2.6, 3.14159, -0.45, -0.9, -1.4, -2.0, -2.6].map((a) => trace(qs, qs[0].x + 32 * Math.cos(a), PYc + 32 * Math.sin(a), 1, 110, 7, 26, box));
      }
    }
    const F = repel ? 55 * (240 / d) ** 2 : 55 * (240 / d) ** 2;
    return {cx, d, qs, lines, on, F, repel, s1, s2};
  });

  // ---------- fase 1: proton & elektron ----------
  const ph1 = win(t, c[1] - 0.4, c[2] - 0.5, 0.7, 0.6);
  const pr = ramp(t, wordOf(1, 'proton') - 0.3, wordOf(1, 'proton') + 0.4);
  const el = ramp(t, wordOf(1, 'elektron') - 0.3, wordOf(1, 'elektron') + 0.4);
  const same = ramp(t, wordOf(1, 'persis') - 0.4, wordOf(1, 'persis') + 0.5, EASE_IN_OUT);
  const ea = (t - c[1]) * 1.25;
  const ex = 960 + 300 * Math.cos(ea);
  const ey = 450 + 105 * Math.sin(ea);
  const eTrail = [1, 2, 3, 4, 5].map((k) => [960 + 300 * Math.cos(ea - k * 0.06), 450 + 105 * Math.sin(ea - k * 0.06)] as [number, number]);
  const barL = 290;

  // ---------- fase 2: muatan elementer & kelipatan bulat ----------
  const ph2 = win(t, c[2] - 0.4, c[3] - 0.5, 0.7, 0.6);
  const card = ramp(t, wordOf(2, 'elementer') - 0.4, wordOf(2, 'elementer') + 0.4);
  const s0 = wordOf(2, 'satu') - 0.2;
  const dstep = (c[3] - 1.0 - s0) / 6;
  const u = Math.max(0, Math.min(6, (t - s0) / dstep));
  const nfl = Math.min(5, Math.floor(u));
  const n = u >= 6 ? 6 : nfl + EASE(Math.min(1, (u - nfl) * 2.5));
  const numLine = ramp(t, c[2] - 0.2, c[2] + 0.6);
  const bulat = ramp(t, wordOf(2, 'kelipatan') - 0.3, wordOf(2, 'kelipatan') + 0.5);

  // ---------- fase 3–4: balon, rambut, dinding ----------
  const ph3 = ramp(t, c[3] - 0.5, c[3] + 0.4);
  const rub0 = c[3] + 0.2;
  const rub1 = wordOf(3, 'diciptakan') - 0.2;
  const rubbing = ramp(t, rub0 - 0.2, rub0 + 0.2) * (1 - ramp(t, rub1 - 0.3, rub1));
  const hop0 = wordOf(3, 'elektron') - 0.1;
  const hop1 = wordOf(3, 'diciptakan') - 0.3;
  const hops = Array.from({length: NE}, (_, k) => {
    const tk = hop0 + ((hop1 - hop0) * k) / NE;
    return ramp(t, tk, tk + 0.5, EASE);
  });
  const nGone = hops.reduce((a, b) => a + b, 0);
  const mid = ramp(t, rub1, rub1 + 1.2, EASE_IN_OUT);
  const toWall = ramp(t, c[4] - 0.1, wordOf(4, 'dinding') + 0.4, EASE_IN_OUT);
  const stick = ramp(t, wordOf(4, 'menempel') - 0.3, wordOf(4, 'menempel') + 0.3);
  const wall = ramp(t, c[4] - 0.6, c[4] + 0.4);
  const counters = win(t, c[3] + 0.3, c[4] - 0.3, 0.6, 0.6);
  const kekal = ramp(t, wordOf(3, 'kekal') - 0.4, wordOf(3, 'kekal') + 0.3);
  const pushE = ramp(t, wordOf(4, 'mendorong') - 0.3, wordOf(4, 'mendorong') + 0.5);
  const plus = ramp(t, wordOf(4, 'positif') - 0.3, wordOf(4, 'positif') + 0.4);
  const rubA = -0.8;
  const rbx = HEAD.x + (HEAD.r + BR - 6) * Math.cos(rubA);
  const rby = HEAD.y + (HEAD.r + BR - 6) * Math.sin(rubA);
  const tang = 34 * Math.sin(Math.PI * 2 * 1.8 * t) * rubbing;
  const b1x = rbx - Math.sin(rubA) * tang;
  const b1y = rby + Math.cos(rubA) * tang;
  const b2x = mix(b1x, 960, mid);
  const b2y = mix(b1y, 450, mid);
  const bob = (1 - stick) * 4 * Math.sin(t * 1.8);
  const bx = mix(b2x, WX - BR - 3, toWall);
  const by = mix(b2y, 470, toWall) + bob;
  const headOp = ph3 * (1 - 0.15 * toWall);
  const polAmt = toWall * (0.4 + 0.6 * pushE);

  const nLbl = (k: number) => Math.max(0, 1 - Math.abs(nGone - k) * 2.2);

  return (
    <AbsoluteFill style={{opacity: end}}>
      <Stage>
        <Motes x={960} y={520} rx={880} ry={330} n={30} color="pot" opacity={0.35} seed={4} />

        {/* fase 0 */}
        <g opacity={ph0}>
          {panels.map((p, k) => (
            <g key={k}>
              <rect x={p.cx - PW / 2} y={PYc - PH / 2} width={PW} height={PH} rx={24} fill="rgba(14,22,50,0.5)" stroke={k < 2 ? C.muted : C.force} strokeOpacity={0.3 + 0.3 * p.on} strokeWidth={2} />
              <FieldLines lines={p.lines} t={t} op={p.on} />
              <Q0 x={p.qs[0].x} y={PYc} r={32} s={p.s1} op={p.s1 > 0 ? pos : neg} sc={0.6 + 0.4 * (p.s1 > 0 ? pos : neg)} />
              <Q0 x={p.qs[1].x} y={PYc} r={32} s={p.s2} op={p.s2 > 0 ? pos : neg} sc={0.6 + 0.4 * (p.s2 > 0 ? pos : neg)} />
              {p.repel ? (
                <>
                  <Arrow x1={p.qs[0].x} y1={PYc - 62} x2={p.qs[0].x - p.F} y2={PYc - 62} color="force" width={6} opacity={p.on} pulse={false} />
                  <Arrow x1={p.qs[1].x} y1={PYc - 62} x2={p.qs[1].x + p.F} y2={PYc - 62} color="force" width={6} opacity={p.on} pulse={false} />
                </>
              ) : (
                <>
                  <Arrow x1={p.qs[0].x} y1={PYc - 62} x2={p.qs[0].x + p.F} y2={PYc - 62} color="force" width={6} opacity={p.on} pulse={false} />
                  <Arrow x1={p.qs[1].x} y1={PYc - 62} x2={p.qs[1].x - p.F} y2={PYc - 62} color="force" width={6} opacity={p.on} pulse={false} />
                </>
              )}
              <Label x={p.cx} y={PYc + PH / 2 + 46} size={36} weight={700} color={k < 2 ? C.ink : C.force} opacity={p.on}>
                {k < 2 ? 'tolak-menolak' : 'tarik-menarik'}
              </Label>
              <Label x={p.cx} y={PYc - PH / 2 - 36} size={30} weight={600} font="mono" color={C.muted} opacity={k === 1 ? neg : pos * (k === 2 ? neg : 1)}>
                {k === 0 ? 'positif · positif' : k === 1 ? 'negatif · negatif' : 'positif · negatif'}
              </Label>
            </g>
          ))}
        </g>

        {/* fase 1 */}
        <g opacity={ph1}>
          <ellipse cx={960} cy={450} rx={300} ry={105} fill="none" stroke={C.pot} strokeOpacity={0.3} strokeWidth={2} strokeDasharray="6 10" opacity={el} />
          <Q0 x={960} y={450} r={50} s={1} op={pr} sc={0.6 + 0.4 * pr} />
          <Label x={960} y={450 + 84} size={30} weight={600} color={C.heat} opacity={pr}>
            proton
          </Label>
          <g opacity={el}>
            <Spark x={ex} y={ey} r={13} color="pot" trail={eTrail} />
            <path d={`M${ex - 6},${ey} h12`} stroke="#fff" strokeWidth={2.5} />
            <Label x={ex} y={ey - 40} size={28} weight={600} color={C.pot}>
              elektron
            </Label>
          </g>
          {/* batang besar muatan */}
          <g opacity={Math.max(pr, el) * 0.999}>
            <line x1={960} y1={640} x2={960} y2={800} stroke={C.muted} strokeWidth={2.5} />
            <rect x={960} y={662} width={barL * pr} height={40} rx={8} fill={C.heat} opacity={0.85} />
            <rect x={960 - barL * el} y={730} width={barL * el} height={40} rx={8} fill={C.pot} opacity={0.85} />
            <text x={960 + barL * pr + 16} y={682} dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontSize={36} fill={C.heat} opacity={pr}>
              +e
            </text>
            <text x={960 - barL * el - 16} y={750} dominantBaseline="central" textAnchor="end" fontFamily={FONT.serif} fontStyle="italic" fontSize={36} fill={C.pot} opacity={el}>
              −e
            </text>
            {/* bayangan cermin: panjang sama */}
            <rect x={960 - barL} y={662} width={barL} height={40} rx={8} fill="none" stroke={C.heat} strokeWidth={2} strokeDasharray="6 6" opacity={same * 0.8} />
            <rect x={960} y={730} width={barL} height={40} rx={8} fill="none" stroke={C.pot} strokeWidth={2} strokeDasharray="6 6" opacity={same * 0.8} />
            <Label x={960} y={835} size={32} weight={700} color={C.force} opacity={same}>
              besarnya persis sama
            </Label>
            <Ripple x={960} y={716} p={ramp(t, wordOf(1, 'persis') - 0.1, wordOf(1, 'persis') + 1.4, lin)} r={260} color="force" />
          </g>
        </g>

        {/* fase 2 */}
        <g opacity={ph2}>
          <g opacity={numLine}>
            <line x1={NX0 - 30} y1={NY} x2={NX0 + 6 * NSTEP + 40} y2={NY} stroke={C.muted} strokeWidth={3} />
            {Array.from({length: 7}, (_, k) => (
              <g key={k}>
                <line x1={NX0 + k * NSTEP} y1={NY - 14} x2={NX0 + k * NSTEP} y2={NY + 14} stroke={C.muted} strokeWidth={3} />
                <text x={NX0 + k * NSTEP} y={NY + 48} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={34} fill={C.ink} opacity={0.4 + 0.6 * Math.max(0, 1 - Math.abs(n - k) * 1.5)}>
                  {k === 0 ? '0' : k === 1 ? 'e' : `${k}e`}
                </text>
              </g>
            ))}
            <rect x={NX0} y={NY - 9} width={n * NSTEP} height={18} rx={9} fill={C.heat} opacity={0.75} />
            {Array.from({length: 6}, (_, k) => {
              const o = Math.max(0, Math.min(1, n - k));
              const x = NX0 + (k + 0.5) * NSTEP;
              const y = NY - 92 + 6 * Math.sin(t * 2 + k) - (1 - o) * 40;
              return (
                <g key={k} opacity={o}>
                  <Q0 x={x} y={y} r={30} s={1} />
                  <text x={x} y={y + 52} textAnchor="middle" fontFamily={FONT.mono} fontSize={20} fill={C.heat}>
                    +e
                  </text>
                </g>
              );
            })}
            <circle cx={NX0 + n * NSTEP} cy={NY} r={16 + 3 * Math.sin(t * 4)} fill={`url(#soft-force)`} />
            <circle cx={NX0 + n * NSTEP} cy={NY} r={9} fill={C.force} />
            {/* q = n e */}
            <text x={890} y={815} textAnchor="end" dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontSize={48} fill={C.ink}>
              q =
            </text>
            {Array.from({length: 7}, (_, k) => {
              const o = Math.max(0, 1 - Math.abs(n - k) * 2.2);
              return o > 0.001 ? (
                <text key={k} x={910} y={815} dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontSize={48} fill={C.force} opacity={o}>
                  {k === 0 ? '0' : k === 1 ? 'e' : `${k}e`}
                </text>
              ) : null;
            })}
            {/* bukan kelipatan bulat: tidak ada */}
            <g opacity={bulat * (0.7 + 0.3 * Math.sin(t * 3))}>
              <circle cx={NX0 + 2.5 * NSTEP} cy={NY} r={12} fill="none" stroke={C.muted} strokeWidth={2.5} strokeDasharray="4 4" />
              <line x1={NX0 + 2.5 * NSTEP} y1={NY + 14} x2={NX0 + 2.5 * NSTEP} y2={NY + 84} stroke={C.muted} strokeWidth={2} strokeDasharray="4 5" />
              <path d={`M${NX0 + 2.5 * NSTEP - 13},${NY + 92} l26,26 M${NX0 + 2.5 * NSTEP + 13},${NY + 92} l-26,26`} stroke={C.heat} strokeWidth={4} strokeLinecap="round" />
              <text x={NX0 + 2.5 * NSTEP + 30} y={NY + 106} dominantBaseline="central" fontFamily={FONT.mono} fontSize={24} fill={C.muted}>
                2,5e
              </text>
            </g>
          </g>
          <Glow x={960} y={300} r={340} color="heat" opacity={0.4 * card} />
        </g>

        {/* fase 3–4 */}
        <g opacity={ph3}>
          {/* dinding */}
          <g opacity={wall}>
            <rect x={WX} y={200} width={1840 - WX} height={660} rx={12} fill="#1b2546" stroke="#56628f" strokeWidth={3} />
            {Array.from({length: 8}, (_, k) => (
              <line key={k} x1={WX + 8} y1={250 + k * 82} x2={1832} y2={250 + k * 82} stroke="#2c3966" strokeWidth={2} />
            ))}
            <rect x={WX - 3} y={200} width={14} height={660} rx={6} fill={C.heat} opacity={0.4 * plus} />
            <Glow x={WX + 10} y={by} r={160} color="heat" opacity={0.6 * plus} />
            {WALLM.map((m, i) => {
              const d = Math.hypot(m.x - bx, m.y - by);
              const pol = (polAmt * 19) / (1 + (Math.max(0, d - BR) / 120) ** 2);
              const ux = (m.x - bx) / (d || 1);
              const uy = (m.y - by) / (d || 1);
              const jig = Math.sin(t * 3 + i * 1.7);
              return (
                <g key={i}>
                  <circle cx={m.x + ux * pol + jig} cy={m.y + uy * pol} r={7.5} fill={C.pot} opacity={0.7} />
                  <circle cx={m.x - ux * pol * 0.2} cy={m.y - uy * pol * 0.2} r={4} fill={C.heat} />
                </g>
              );
            })}
            <Label x={1650} y={176} size={30} weight={600} color={C.muted}>
              dinding
            </Label>
          </g>
          {/* kepala & rambut */}
          <g opacity={headOp}>
            <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill="#f1bf9e" stroke="#c98f6e" strokeWidth={3} />
            <circle cx={HEAD.x + 44} cy={HEAD.y + 8} r={6} fill="#3a2a2a" />
            <path d={`M${HEAD.x + 28},${HEAD.y + 50} q20,12 38,-2`} fill="none" stroke="#a5604c" strokeWidth={3.5} strokeLinecap="round" />
            {STR.map((a, i) => {
              const rx = HEAD.x + HEAD.r * Math.cos(a);
              const ry = HEAD.y + HEAD.r * Math.sin(a);
              const tx0 = rx + 56 * Math.cos(a - 0.5);
              const ty0 = ry + 56 * Math.sin(a - 0.5) + 16;
              const toB = Math.atan2(by - ry, bx - rx);
              const lift = Math.min(1, nGone / NE) * (1 - 0.6 * toWall) * (0.7 + 0.3 * Math.sin(t * 2.3 + i));
              const tx = mix(tx0, rx + 70 * Math.cos(toB), lift * 0.7);
              const ty = mix(ty0, ry + 70 * Math.sin(toB), lift * 0.7);
              return <path key={i} d={`M${rx},${ry} Q${(rx + tx) / 2 + 10 * Math.sin(t * 1.6 + i)},${(ry + ty) / 2 - 10} ${tx},${ty}`} fill="none" stroke="#5a3b2a" strokeWidth={7} strokeLinecap="round" />;
            })}
            <path d={`M${HEAD.x - 100},${HEAD.y - 26} Q${HEAD.x - 90},${HEAD.y - 122} ${HEAD.x},${HEAD.y - 112} Q${HEAD.x + 82},${HEAD.y - 108} ${HEAD.x + 94},${HEAD.y - 36} Q${HEAD.x + 26},${HEAD.y - 80} ${HEAD.x - 100},${HEAD.y - 26} Z`} fill="#5a3b2a" />
            {hops.map((h, k) => {
              const a = STR[2 + k * 2];
              const x = HEAD.x + (HEAD.r + 46) * Math.cos(a - 0.25);
              const y = HEAD.y + (HEAD.r + 46) * Math.sin(a - 0.25);
              return h > 0.01 ? <Q0 key={k} x={x} y={y} r={11} s={1} op={h} /> : null;
            })}
          </g>
          {/* balon */}
          <path d={`M${bx},${by + BR * 1.12 + 10} q${-16 + 8 * Math.sin(t * 1.6)},50 ${4 + 6 * Math.sin(t * 1.2)},100 q14,36 -6,72`} fill="none" stroke="#c9d2f0" strokeWidth={2.5} opacity={0.75} />
          <ellipse cx={bx} cy={by} rx={BR} ry={BR * 1.12} fill="#c7cff4" opacity={0.92} stroke="#eef2ff" strokeWidth={3} />
          <ellipse cx={bx - BR * 0.34} cy={by - BR * 0.42} rx={BR * 0.2} ry={BR * 0.3} fill="#fff" opacity={0.55} transform={`rotate(-20 ${bx - BR * 0.34} ${by - BR * 0.42})`} />
          <path d={`M${bx - 9},${by + BR * 1.12 + 12} l9,-13 l9,13 Z`} fill="#c7cff4" />
          {hops.map((h, k) => {
            if (h <= 0.001) return null;
            const a = STR[2 + k * 2];
            const sx = HEAD.x + (HEAD.r + 56) * Math.cos(a - 0.25);
            const sy = HEAD.y + (HEAD.r + 56) * Math.sin(a - 0.25);
            const th = 1.9 + k * 0.55 + 0.12 * Math.sin(t * 1.3 + k);
            const ox = bx + BR * 0.6 * Math.cos(th);
            const oy = by + BR * 0.68 * Math.sin(th);
            return <Spark key={k} x={mix(sx, ox, h)} y={mix(sy, oy, h) - 50 * Math.sin(Math.PI * h)} r={8} color="pot" />;
          })}
          <Ripple x={WX} y={by} p={ramp(t, wordOf(4, 'menempel') - 0.1, wordOf(4, 'menempel') + 1.4, lin)} r={200} color="force" />
          <Arrow x1={bx + 20} y1={by} x2={WX - 8} y2={by} color="force" width={6} opacity={stick} pulse={false} />
          <Label x={1250} y={330} size={27} weight={600} color={C.pot} opacity={pushE * (1 - stick * 0.3)}>
            elektron dinding terdorong →
          </Label>
          <Label x={1250} y={640} size={27} weight={600} color={C.heat} opacity={plus}>
            sisi dekat: sedikit +
          </Label>
          <Label x={bx - BR - 24} y={by} size={34} weight={700} color={C.force} anchor="end" opacity={stick}>
            menempel
          </Label>
          {/* penghitung muatan */}
          <g opacity={counters}>
            {[
              {x: 470, lbl: 'rambut', col: C.heat, sign: '+'},
              {x: 870, lbl: 'balon', col: C.pot, sign: '−'},
              {x: 1270, lbl: 'total', col: C.force, sign: ''},
            ].map((b, k) => (
              <g key={k}>
                <rect x={b.x - 130} y={762} width={260} height={78} rx={16} fill="rgba(10,16,36,0.88)" stroke={b.col} strokeWidth={2.5} strokeOpacity={k === 2 ? 0.5 + 0.5 * kekal : 0.7} />
                <text x={b.x} y={738} textAnchor="middle" fontFamily={FONT.mono} fontSize={22} fill={b.col}>
                  {b.lbl}
                </text>
                {k < 2 ? (
                  Array.from({length: NE + 1}, (_, j) => {
                    const o = nLbl(j);
                    return o > 0.001 ? (
                      <text key={j} x={b.x} y={803} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontSize={42} fill={b.col} opacity={o}>
                        {j === 0 ? '0' : `${b.sign}${j === 1 ? '' : j}e`}
                      </text>
                    ) : null;
                  })
                ) : (
                  <text x={b.x} y={803} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontSize={42} fill={b.col}>
                    0
                  </text>
                )}
              </g>
            ))}
            <text x={670} y={803} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontSize={46} fill={C.muted}>
              +
            </text>
            <text x={1070} y={803} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontSize={46} fill={C.muted}>
              =
            </text>
            <Glow x={1270} y={800} r={190} color="force" opacity={0.5 * kekal} />
            <Ripple x={1270} y={800} p={ramp(t, wordOf(3, 'kekal') - 0.1, wordOf(3, 'kekal') + 1.4, lin)} r={180} color="force" />
            <Twinkles x={1270} y={800} rx={150} ry={50} n={5} color="force" opacity={kekal} seed={5} />
            <Label x={1270} y={690} size={34} weight={700} color={C.force} opacity={kekal}>
              kekal
            </Label>
          </g>
        </g>
      </Stage>
      <Formula x={960} y={300} p={ph2 * card} accent={C.heat} size={64} caption="muatan elementer">
        <span>
          <span style={{color: C.heat}}>e</span> = 1,6 × 10<Sup>−19</Sup> C
        </span>
      </Formula>
    </AbsoluteFill>
  );
};
