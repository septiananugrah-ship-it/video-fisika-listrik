import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp, smoothPath} from '../anim';
import {Arrow, Formula, Frac, Glow, Label, Motes, Ripple, Spark, Stage, Twinkles, V, pointAlong} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Medan listrik (AUDIT): E = F/q; garis keluar dari + masuk ke −; pelat sejajar → medan seragam.
// Garis medan dipol dihitung dari E = Σ q·r̂/r² (integrasi RK2), bukan bentuk hiasan.

type P = [number, number];
const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));

const PP: P = [700, 540];
const PN: P = [1220, 540];
const BOX = {x0: 110, x1: 1810, y0: 175, y1: 880};
const DIP = [
  {p: PP, q: 1},
  {p: PN, q: -1},
];

const efield = (x: number, y: number): P => {
  let ex = 0;
  let ey = 0;
  for (const c of DIP) {
    const dx = x - c.p[0];
    const dy = y - c.p[1];
    const r2 = dx * dx + dy * dy + 1;
    const r3 = r2 * Math.sqrt(r2);
    ex += (c.q * dx) / r3;
    ey += (c.q * dy) / r3;
  }
  return [ex, ey];
};

const trace = (a: number): P[] => {
  let x = PP[0] + 28 * Math.cos(a);
  let y = PP[1] + 28 * Math.sin(a);
  const pts: P[] = [[x, y]];
  const h = 4;
  for (let i = 0; i < 1200; i++) {
    const [e1x, e1y] = efield(x, y);
    const m1 = Math.hypot(e1x, e1y);
    const [e2x, e2y] = efield(x + (0.5 * h * e1x) / m1, y + (0.5 * h * e1y) / m1);
    const m2 = Math.hypot(e2x, e2y);
    x += (h * e2x) / m2;
    y += (h * e2y) / m2;
    if (Math.hypot(x - PN[0], y - PN[1]) < 28) {
      pts.push([x, y]);
      break;
    }
    if (i % 4 === 3) pts.push([x, y]);
    if (x < BOX.x0 - 60 || x > BOX.x1 + 60 || y < BOX.y0 - 60 || y > BOX.y1 + 60) break;
  }
  return pts;
};

const NL = 16;
const DLINES: P[][] = Array.from({length: NL}, (_, i) => trace((2 * Math.PI * (i + 0.5)) / NL));
const DPATHS = DLINES.map((l) => smoothPath(l));
const DHEADS = DLINES.map((l) => {
  const a = pointAlong(l, 0.42);
  const b = pointAlong(l, 0.44);
  return {x: a[0], y: a[1], ang: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI};
});

// kisi panah arah medan dipol (arah dihitung per titik)
const GRID = (() => {
  const out: {x: number; y: number; ang: number; s: number}[] = [];
  for (let gx = 180; gx <= 1760; gx += 120) {
    for (let gy = 230; gy <= 850; gy += 104) {
      if (Math.hypot(gx - PP[0], gy - PP[1]) < 70 || Math.hypot(gx - PN[0], gy - PN[1]) < 70) continue;
      const [ex, ey] = efield(gx, gy);
      const m = Math.hypot(ex, ey);
      const s = Math.min(1, Math.sqrt(m * 200 * 200));
      out.push({x: gx, y: gy, ang: (Math.atan2(ey, ex) * 180) / Math.PI, s});
    }
  }
  return out;
})();

const Head: React.FC<{x: number; y: number; ang: number; color: string; s?: number; op?: number}> = ({x, y, ang, color, s = 11, op = 1}) => (
  <path d={`M${s},0 L${-s * 0.8},${-s * 0.75} L${-s * 0.35},0 L${-s * 0.8},${s * 0.75} Z`} fill={color} opacity={op} transform={`translate(${x},${y}) rotate(${ang})`} />
);

const Charge: React.FC<{x: number; y: number; r?: number; sign: 1 | -1; op?: number; t: number}> = ({x, y, r = 30, sign, op = 1, t}) => {
  if (op <= 0.001) return null;
  const col = sign > 0 ? C.heat : C.pot;
  const b = 1 + 0.04 * Math.sin(t * 2.2 + x * 0.01);
  return (
    <g opacity={op}>
      <Glow x={x} y={y} r={r * 3.6} color={sign > 0 ? 'heat' : 'pot'} />
      <circle cx={x} cy={y} r={r * b} fill={col} stroke="#fff" strokeOpacity={0.55} strokeWidth={2.5} />
      <circle cx={x - r * 0.32} cy={y - r * 0.36} r={r * 0.34} fill="#fff" opacity={0.28} />
      <line x1={x - r * 0.45} y1={y} x2={x + r * 0.45} y2={y} stroke="#fff" strokeWidth={r * 0.17} strokeLinecap="round" />
      {sign > 0 ? <line x1={x} y1={y - r * 0.45} x2={x} y2={y + r * 0.45} stroke="#fff" strokeWidth={r * 0.17} strokeLinecap="round" /> : null}
    </g>
  );
};

export const Field: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  // ---------- waktu ----------
  const tMedan = wordOf(0, 'medan');
  const radialDraw = ramp(t, tMedan - 0.6, tMedan + 1.4);
  const pDip = ramp(t, wordOf(2, 'masuk') - 0.4, wordOf(2, 'masuk') + 1.6, EASE_IN_OUT);
  const radialOp = 1 - ramp(t, wordOf(2, 'masuk') - 0.3, wordOf(2, 'masuk') + 0.8, EASE_IN_OUT);
  const tPlate = cue(3);
  const dipOut = 1 - ramp(t, tPlate - 0.4, tPlate + 0.5, EASE_IN_OUT);
  const plateIn = ramp(t, tPlate + 0.1, tPlate + 1.2);
  const singleOp = Math.min(1, ramp(t, -0.4, 0.8)) * dipOut;

  // kamera: dorongan halus ke muatan saat bab dimulai, lalu kembali
  const push = ramp(t, 0.5, cue(1), EASE_IN_OUT) * (1 - ramp(t, cue(1) + 0.5, cue(2), EASE_IN_OUT));
  const cam = 1 + 0.05 * push;

  // muatan uji (baris 1)
  const testOp = slot(t, wordOf(1, 'uji') - 0.6, cue(2) + 0.2, 0.6, 0.5);
  const th = -0.2 + 0.42 * Math.sin(0.55 * t);
  const rr = 290 + 85 * Math.sin(0.41 * t + 1.1);
  const qx = PP[0] + rr * Math.cos(th);
  const qy = PP[1] + rr * Math.sin(th);
  const fl = (110 * 290 * 290) / (rr * rr); // ∝ 1/r²
  const fx = qx + (fl + 22) * Math.cos(th);
  const fy = qy + (fl + 22) * Math.sin(th);

  // muatan jauh (baris 0: "di kejauhan")
  const farOp = slot(t, wordOf(0, 'kejauhan') - 0.5, cue(1), 0.6, 0.6);

  // rapat/renggang
  const denseOp = slot(t, wordOf(2, 'rapat') - 0.3, tPlate, 0.5, 0.45);

  const nOp = ramp(t, wordOf(2, 'masuk') - 0.5, wordOf(2, 'masuk') + 0.3) * dipOut;

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <radialGradient id="fld-fade-g" cx="50%" cy="49%" r="50%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="78%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <mask id="fld-fade" maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>
            <ellipse cx={960} cy={528} rx={900} ry={370} fill="url(#fld-fade-g)" />
          </mask>
          <linearGradient id="fld-plp" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7a1e2c" />
            <stop offset="100%" stopColor={C.heat} />
          </linearGradient>
          <linearGradient id="fld-pln" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.pot} />
            <stop offset="100%" stopColor="#173a6a" />
          </linearGradient>
        </defs>

        <g transform={`translate(${PP[0]},${PP[1]}) scale(${cam}) translate(${-PP[0]},${-PP[1]})`}>
          {/* ===================== muatan tunggal + garis radial ===================== */}
          <g opacity={singleOp * radialOp} mask="url(#fld-fade)">
            {Array.from({length: NL}, (_, i) => {
              const a = (2 * Math.PI * (i + 0.5)) / NL;
              const r1 = 34;
              const r2 = mix(r1, 1000, radialDraw);
              const ca = Math.cos(a);
              const sa = Math.sin(a);
              return (
                <g key={i}>
                  <line x1={PP[0] + r1 * ca} y1={PP[1] + r1 * sa} x2={PP[0] + r2 * ca} y2={PP[1] + r2 * sa} stroke={C.force} strokeWidth={2.4} opacity={0.55} />
                  {[150, 330].map((r, k) =>
                    r2 > r + 20 ? <Head key={k} x={PP[0] + r * ca} y={PP[1] + r * sa} ang={(a * 180) / Math.PI} color={C.force} op={0.8} s={10} /> : null,
                  )}
                  {[0, 1, 2].map((k) => {
                    const ph = (t * 0.28 + k / 3 + i * 0.071) % 1;
                    const r = r1 + ph * 640;
                    if (r > r2) return null;
                    return <circle key={k} cx={PP[0] + r * ca} cy={PP[1] + r * sa} r={4} fill="#fff6d0" opacity={cyc(ph) * 0.85} />;
                  })}
                </g>
              );
            })}
          </g>
          {/* gelombang "medan" yang menyebar dari muatan */}
          {[0, 1, 2].map((k) => {
            const ph = (t * 0.32 + k / 3) % 1;
            return (
              <circle
                key={k}
                cx={PP[0]}
                cy={PP[1]}
                r={40 + ph * 520}
                fill="none"
                stroke={C.force}
                strokeWidth={2}
                opacity={cyc(ph) * 0.22 * radialDraw * singleOp * radialOp}
              />
            );
          })}

          {/* muatan jauh yang "merasakan" medan */}
          <g opacity={farOp}>
            <Charge x={1560} y={700} r={20} sign={-1} t={t} />
            <Label x={1560} y={640 + 6 * Math.sin(t * 3)} size={40} weight={700} color={C.force}>
              ?
            </Label>
            <Ripple x={1560} y={700} p={ramp(t, tMedan + 0.6, tMedan + 2.2)} r={90} color="force" />
          </g>

          {/* ===================== muatan uji (baris 1) ===================== */}
          <g opacity={testOp}>
            <circle cx={PP[0]} cy={PP[1]} r={rr} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 10" opacity={0.35} />
            <Arrow x1={qx + 20 * Math.cos(th)} y1={qy + 20 * Math.sin(th)} x2={fx} y2={fy} color="force" width={7} />
            <Spark x={qx} y={qy} r={11} color="heat" />
            <Label x={qx - 4} y={qy + 38} size={30} font="serif" italic weight={600} color={C.heat}>
              q
            </Label>
            <Label x={fx + 30 * Math.cos(th)} y={fy + 30 * Math.sin(th) - 6} size={34} font="serif" italic weight={600} color={C.force}>
              F
            </Label>
          </g>

          {/* ===================== dipol: garis medan terhitung ===================== */}
          <g opacity={dipOut}>
            <g mask="url(#fld-fade)" opacity={pDip}>
              {GRID.map((g, i) => {
                const s = 12;
                const a = (g.ang * Math.PI) / 180;
                return (
                  <g key={i} opacity={(0.12 + 0.3 * g.s) * (0.8 + 0.2 * Math.sin(t * 2 + i))}>
                    <line x1={g.x - s * Math.cos(a)} y1={g.y - s * Math.sin(a)} x2={g.x + s * Math.cos(a)} y2={g.y + s * Math.sin(a)} stroke={C.force} strokeWidth={2} />
                    <Head x={g.x + s * Math.cos(a)} y={g.y + s * Math.sin(a)} ang={g.ang} color={C.force} s={6} />
                  </g>
                );
              })}
            </g>
            <g mask="url(#fld-fade)">
              {DPATHS.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={C.force}
                  strokeWidth={2.6}
                  opacity={0.7}
                  pathLength={1000}
                  strokeDasharray="1000 1000"
                  strokeDashoffset={1000 * (1 - pDip)}
                />
              ))}
              {DHEADS.map((h, i) => (
                <Head key={i} x={h.x} y={h.y} ang={h.ang} color={C.force} op={ramp(pDip, 0.5, 0.9)} />
              ))}
              {DLINES.map((l, i) =>
                [0, 1, 2].map((k) => {
                  const ph = (t * 0.2 + k / 3 + i * 0.137) % 1;
                  if (ph > pDip) return null;
                  const [x, y] = pointAlong(l, ph);
                  return <circle key={`${i}-${k}`} cx={x} cy={y} r={4.2} fill="#fff6d0" opacity={cyc(ph) * 0.9} />;
                }),
              )}
            </g>
            {/* rapat = kuat, renggang = lemah */}
            <g opacity={denseOp}>
              <circle cx={600} cy={470} r={44} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="7 7" strokeDashoffset={-t * 20} />
              <Label x={540} y={430} size={30} weight={600} color={C.gold} anchor="end">
                rapat → kuat
              </Label>
              <circle cx={960} cy={262} r={44} fill="none" stroke={C.muted} strokeWidth={3} strokeDasharray="7 7" strokeDashoffset={-t * 20} />
              <Label x={1020} y={232} size={30} weight={600} color={C.muted} anchor="start">
                renggang → lemah
              </Label>
            </g>
            <Charge x={PN[0]} y={PN[1]} sign={-1} op={nOp} t={t} />
            <Ripple x={PN[0]} y={PN[1]} p={ramp(t, wordOf(2, 'masuk') - 0.3, wordOf(2, 'masuk') + 1.3)} r={140} color="pot" />
            <Label x={PP[0]} y={PP[1] + 72} size={28} color={C.heat} opacity={ramp(t, wordOf(2, 'keluar') - 0.2, wordOf(2, 'keluar') + 0.4) * nOp}>
              keluar
            </Label>
            <Label x={PN[0]} y={PN[1] + 72} size={28} color={C.pot} opacity={nOp}>
              masuk
            </Label>
          </g>
          <Charge x={PP[0]} y={PP[1]} sign={1} op={singleOp} t={t} />
          <Motes x={PP[0]} y={PP[1]} rx={260} ry={200} n={18} color="force" opacity={0.4 * singleOp} seed={3} />
        </g>

        {/* ===================== pelat sejajar: medan seragam ===================== */}
        <g opacity={plateIn} transform={`translate(0,${(1 - plateIn) * 30})`}>
          <Glow x={960} y={540} r={360} color="force" opacity={0.35} />
          {/* garis tepi melengkung (fringing) */}
          {[-1, 1].map((sg) => (
            <path
              key={sg}
              d={`M772,${540 + sg * 214} Q960,${540 + sg * 286} 1148,${540 + sg * 214}`}
              fill="none"
              stroke={C.force}
              strokeWidth={2}
              opacity={0.35}
            />
          ))}
          {Array.from({length: 9}, (_, i) => {
            const y = 345 + i * 48.75;
            return (
              <g key={i}>
                <line x1={772} y1={y} x2={1148} y2={y} stroke={C.force} strokeWidth={2.6} opacity={0.75} />
                <Head x={968} y={y} ang={0} color={C.force} />
                {[0, 1, 2].map((k) => {
                  const ph = (t * 0.45 + k / 3 + i * 0.11) % 1;
                  return <circle key={k} cx={mix(776, 1144, ph)} cy={y} r={4.2} fill="#fff6d0" opacity={cyc(ph) * 0.85} />;
                })}
              </g>
            );
          })}
          {/* pelat */}
          <rect x={732} y={300} width={34} height={480} rx={8} fill="url(#fld-plp)" stroke={C.heat} strokeWidth={2} />
          <rect x={1154} y={300} width={34} height={480} rx={8} fill="url(#fld-pln)" stroke={C.pot} strokeWidth={2} />
          {Array.from({length: 8}, (_, i) => (
            <g key={i}>
              <Label x={710} y={330 + i * 60} size={30} weight={700} color={C.heat}>
                +
              </Label>
              <Label x={1210} y={330 + i * 60} size={34} weight={700} color={C.pot}>
                −
              </Label>
            </g>
          ))}
          {/* muatan uji: gaya sama di mana pun */}
          {(() => {
            const tx = 905 + 75 * Math.sin(0.75 * t);
            const ty = 540 + 150 * Math.sin(0.52 * t + 1);
            return (
              <g opacity={ramp(t, tPlate + 1.4, tPlate + 2.2)}>
                <Arrow x1={tx + 16} y1={ty} x2={tx + 120} y2={ty} color="force" width={6} />
                <Spark x={tx} y={ty} r={10} color="heat" />
                <Label x={tx + 140} y={ty - 26} size={28} font="serif" italic weight={600} color={C.force}>
                  F
                </Label>
              </g>
            );
          })()}
          <Label x={960} y={215} size={34} weight={600} color={C.force} opacity={ramp(t, wordOf(3, 'seragam') - 0.4, wordOf(3, 'seragam') + 0.4)}>
            medan seragam: <tspan fontFamily="Source Serif 4" fontStyle="italic">E</tspan> sama di semua titik
          </Label>
          <Twinkles x={960} y={215} rx={260} ry={26} n={4} color="force" opacity={ramp(t, wordOf(3, 'seragam'), wordOf(3, 'seragam') + 0.6)} />
          <Motes x={960} y={540} rx={420} ry={300} n={20} color="force" opacity={0.35} seed={9} />
          <Label x={560} y={540} size={30} color={C.heat} weight={600}>
            pelat +
          </Label>
          <Label x={1360} y={540} size={30} color={C.pot} weight={600}>
            pelat −
          </Label>
        </g>
      </Stage>

      <Formula x={1480} y={300} p={slot(t, wordOf(1, 'gaya') - 0.3, wordOf(1, 'merasakan') - 0.2)} accent={C.force} size={66} caption="gaya per satuan muatan">
        <V color="force">E</V> = <Frac n={<V color="force">F</V>} d={<V color="heat">q</V>} />
      </Formula>
      <Formula x={1480} y={300} p={slot(t, wordOf(1, 'merasakan') - 0.2, cue(2) + 0.2)} accent={C.force} size={66} caption="muatan uji merasakan gaya searah medan">
        <V color="force">F</V> = <V color="heat">q</V>
        <V color="force">E</V>
      </Formula>
    </AbsoluteFill>
  );
};
