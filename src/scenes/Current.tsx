import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp, rand} from '../anim';
import {Arrow, Formula, Frac, Glow, Label, Motes, Ripple, Spark, Stage, Stream, Twinkles, V, pointAlong} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Arus (AUDIT): I = Q/t; V = IR; P = VI; kecepatan hanyut elektron di Cu ≈ 0,02–0,1 mm/s ("sepersekian mm/s").
// Elektron: lintasan zig-zag antar-tabrakan (titik acak per segmen) + hanyut D(t) yang dihitung tertutup.
// Arus konvensional (toska) + → −, elektron (biru) berlawanan.

type P = [number, number];
const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const X0 = 140;
const X1 = 1780;
const LEN = X1 - X0;
const YC = 530;
const HALF = 80;

const IONS: P[] = [];
for (let r = 0; r < 3; r++) for (let i = 0; i < 18; i++) IONS.push([185 + i * 90 + (r % 2) * 45, YC - 46 + r * 46]);
const NE = 36;

const intRamp = (t: number, a: number, L: number) => (t < a ? 0 : t < a + L ? ((t - a) * (t - a)) / (2 * L) : L / 2 + (t - a - L));
const bumpInt = (t: number, a: number, L: number, amp: number) => {
  const u = clamp01((t - a) / L);
  return amp * L * (u / 2 - Math.sin(2 * Math.PI * u) / (4 * Math.PI));
};

// rangkaian baris 4 (urutan arah arus konvensional dari kutub +)
const LOOP: P[] = [
  [360, 488],
  [360, 330],
  [1560, 330],
  [1560, 770],
  [360, 770],
  [360, 612],
];
const partial = (u: number): P[] => Array.from({length: 61}, (_, i) => pointAlong(LOOP, (u * i) / 60));

export const Current: React.FC = () => {
  const {t, cue, cueEnd, wordOf} = useScene();

  // ---------- waktu ----------
  const tWire = wordOf(0, 'kawat');
  const wireP = ramp(t, tWire - 0.5, tWire + 0.8, EASE_IN_OUT);
  const tGo = wordOf(0, 'mengalir') - 0.3;
  const b0 = wordOf(2, 'sebanding') - 0.2;
  const bL = Math.max(2, cueEnd(2) + 0.5 - b0);
  const bu = clamp01((t - b0) / bL);
  const bump = 0.9 * Math.pow(Math.sin(Math.PI * bu), 2);
  const D = 46 * (intRamp(t, tGo, 1.2) + bumpInt(t, b0, bL, 0.9));
  const zoom = 1 + 0.45 * ramp(t, cue(1) - 0.3, cue(1) + 1.4, EASE_IN_OUT);
  const heat = ramp(t, cue(3) - 0.2, cue(3) + 2);
  const partW = Math.min(ramp(t, -0.4, 0.6), 1 - ramp(t, cue(4) - 0.4, cue(4) + 0.4, EASE_IN_OUT));
  const partL = ramp(t, cue(4) - 0.1, cue(4) + 0.8);
  const arrows = slot(t, wordOf(0, 'mengalir') + 0.3, cue(3) + 0.4, 0.6, 0.6);
  const lab1 = slot(t, wordOf(1, 'elektron') - 0.3, cue(3), 0.5, 0.5);
  const tabrak = wordOf(1, 'menabrak');

  // ---------- baris 4 ----------
  const tSw = cue(4) + 1.0;
  const sw = ramp(t, tSw - 0.25, tSw, EASE_IN_OUT);
  const front = ramp(t, tSw, tSw + 0.45, (x) => x);
  const lamp = ramp(t, tSw + 0.2, tSw + 0.32);
  const crawl = Math.max(0, t - tSw) * 0.0028;
  const tMedan = wordOf(4, 'medannya');
  const fieldEmph = ramp(t, tMedan - 0.6, tMedan + 0.3);

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <linearGradient id="cur-tube" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a4a80" />
            <stop offset="45%" stopColor="#1a2550" />
            <stop offset="100%" stopColor="#0e1634" />
          </linearGradient>
          <clipPath id="cur-clip">
            <rect x={X0} y={YC - HALF} width={LEN} height={2 * HALF} rx={HALF} />
          </clipPath>
        </defs>

        {/* ===================== kawat: elektron & ion ===================== */}
        <g opacity={partW}>
          <g transform={`translate(960,${YC}) scale(${zoom}) translate(-960,${-YC})`}>
            {/* ujung berbeda potensial */}
            <rect x={X0 - 52} y={YC - 110} width={56} height={220} rx={14} fill={C.heat} opacity={0.85} />
            <rect x={X1 - 4} y={YC - 110} width={56} height={220} rx={14} fill={C.pot} opacity={0.85} />
            <Label x={X0 - 24} y={YC} size={44} weight={700} color="#fff">
              +
            </Label>
            <Label x={X1 + 24} y={YC} size={48} weight={700} color="#fff">
              −
            </Label>
            <Label x={X0 - 24} y={YC - 140} size={26} weight={600} color={C.spr}>
              V tinggi
            </Label>
            <Label x={X1 + 24} y={YC - 140} size={26} weight={600} color={C.spr}>
              V rendah
            </Label>
            {/* tabung kawat yang tergambar */}
            <g clipPath="url(#cur-clip)">
              <rect x={X0} y={YC - HALF} width={LEN * wireP} height={2 * HALF} fill="url(#cur-tube)" />
              <rect x={X0} y={YC - HALF} width={LEN * wireP} height={2 * HALF} fill={C.press} opacity={0.22 * heat * (0.85 + 0.15 * Math.sin(t * 2.3))} />
              <rect x={X0} y={YC - HALF + 10} width={LEN * wireP} height={12} fill="#fff" opacity={0.1} />
              <g opacity={wireP}>
                {IONS.map(([x, y], i) => {
                  const a = 1.6 + 5 * heat;
                  const ix = x + a * Math.sin(t * (9 + (i % 5)) + i * 1.7);
                  const iy = y + a * Math.cos(t * (8 + (i % 4)) + i * 2.3);
                  return (
                    <g key={i}>
                      <circle cx={ix} cy={iy} r={16} fill={`url(#soft-work)`} opacity={0.7} />
                      <circle cx={ix} cy={iy} r={11} fill={C.work} opacity={0.85} />
                      <line x1={ix - 4.5} y1={iy} x2={ix + 4.5} y2={iy} stroke="#0b2a1c" strokeWidth={2.2} />
                      <line x1={ix} y1={iy - 4.5} x2={ix} y2={iy + 4.5} stroke="#0b2a1c" strokeWidth={2.2} />
                    </g>
                  );
                })}
                {Array.from({length: NE}, (_, i) => {
                  const tau = 0.3 + 0.22 * rand(i + 0.5);
                  const T = t / tau + rand(i + 7.1) * 10;
                  const k = Math.floor(T);
                  const fr = T - k;
                  const jx = (m: number) => (rand(i * 31.7 + m * 7.13) - 0.5) * 90;
                  const jy = (m: number) => YC - 66 + rand(i * 17.3 + m * 3.71) * 132;
                  const base = X0 + rand(i + 2.2) * LEN - D;
                  const xr = base + mix(jx(k), jx(k + 1), fr);
                  const yr = mix(jy(k), jy(k + 1), fr);
                  const xw = X0 + ((((xr - X0) % LEN) + LEN) % LEN);
                  const edge = clamp01(Math.min(xw - X0, X1 - xw) / 70);
                  const cxw = X0 + ((((base + jx(k) - X0) % LEN) + LEN) % LEN);
                  const flashOp = Math.exp(-fr * 5) * (0.35 + 0.65 * heat) * ramp(t, tabrak - 0.6, tabrak) * clamp01(Math.min(cxw - X0, X1 - cxw) / 70);
                  return (
                    <g key={i}>
                      <circle cx={cxw} cy={jy(k)} r={10 + 10 * fr} fill={`url(#soft-press)`} opacity={flashOp} />
                      <circle cx={cxw} cy={jy(k)} r={3 + 6 * fr} fill="none" stroke={C.press} strokeWidth={2} opacity={flashOp * 0.8} />
                      <g opacity={edge}>
                        <circle cx={xw} cy={yr} r={12} fill={`url(#soft-pot)`} />
                        <circle cx={xw} cy={yr} r={5.5} fill={C.pot} />
                        <circle cx={xw} cy={yr} r={2.3} fill="#fff" />
                      </g>
                    </g>
                  );
                })}
              </g>
            </g>
            <rect x={X0} y={YC - HALF} width={LEN * wireP} height={2 * HALF} rx={Math.min(HALF, (LEN * wireP) / 2)} fill="none" stroke="#7d8cc4" strokeWidth={3} opacity={0.8} />
            {/* penampang tempat muatan dihitung */}
            <g opacity={slot(t, wordOf(0, 'aliran') - 0.3, cue(1) + 0.6)}>
              <ellipse cx={960} cy={YC} rx={22} ry={HALF + 6} fill={C.cyan} opacity={0.12} />
              <ellipse cx={960} cy={YC} rx={22} ry={HALF + 6} fill="none" stroke={C.cyan} strokeWidth={3} strokeDasharray="8 7" strokeDashoffset={-t * 20} />
            </g>
            {/* panas naik dari kawat */}
            {Array.from({length: 9}, (_, i) => {
              const ph = (t * 0.45 + i / 9 + rand(i) * 0.3) % 1;
              const xx = 360 + i * 150 + 20 * Math.sin(t + i);
              const yy = YC - HALF - 10 - ph * 120;
              return (
                <path
                  key={i}
                  d={`M${xx},${yy + 34} q12,-9 0,-17 q-12,-9 0,-17`}
                  fill="none"
                  stroke={C.press}
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={heat * cyc(ph) * 0.75}
                />
              );
            })}
          </g>

          {/* panah: arus konvensional vs hanyut elektron */}
          <g opacity={arrows}>
            <Arrow x1={1250} y1={372} x2={760} y2={372} color="pot" width={6} />
            <Label x={740} y={372} size={28} weight={600} color={C.pot} anchor="end">
              hanyut elektron
            </Label>
            <Arrow x1={700} y1={770} x2={1220} y2={770} color="cyan" width={7} />
            <Label x={1240} y={770} size={28} weight={600} color={C.cyan} anchor="start">
              arus <tspan fontFamily={FONT.serif} fontStyle="italic">I</tspan> (+ → −)
            </Label>
          </g>
          <g opacity={lab1}>
            <Label x={360} y={700} size={26} weight={600} color={C.work}>
              ion logam
            </Label>
            <Label x={1560} y={700} size={26} weight={600} color={C.pot}>
              elektron bebas
            </Label>
          </g>
          <Label x={960} y={700} size={26} weight={600} color={C.press} opacity={slot(t, wordOf(1, 'menabrak') - 0.2, cue(2) + 0.3)}>
            tabrakan → menghambat
          </Label>
          <Label x={960} y={700} size={26} weight={600} color={C.press} opacity={slot(t, wordOf(2, 'hambatan') - 0.4, cue(3) + 0.3)}>
            <tspan fontFamily={FONT.serif} fontStyle="italic">R</tspan> = hambatan kawat (tetap)
          </Label>
          <Label x={960} y={700} size={26} weight={600} color={C.press} opacity={slot(t, wordOf(3, 'panas') - 0.4, cue(4) + 0.2)}>
            energi listrik → panas
          </Label>

          {/* pengukur V dan I (baris 2–3) */}
          {(() => {
            const op = slot(t, b0 - 0.5, cue(4) + 0.2, 0.6, 0.5);
            const lv = (1 + bump) / 1.9;
            return (
              <g opacity={op}>
                {[
                  {x: 300, c: C.spr, l: 'V'},
                  {x: 1620, c: C.cyan, l: 'I'},
                ].map((g) => (
                  <g key={g.l}>
                    <rect x={g.x - 20} y={190} width={40} height={150} rx={12} fill="#0d1430" stroke={g.c} strokeWidth={2.5} />
                    <rect x={g.x - 13} y={333 - 136 * lv} width={26} height={136 * lv} rx={8} fill={g.c} opacity={0.88} />
                    <Label x={g.x + 46} y={265} size={36} font="serif" italic weight={600} color={g.c} anchor="start">
                      {g.l}
                    </Label>
                  </g>
                ))}
                <Label x={1620} y={366} size={22} color={C.muted}>
                  ikut naik
                </Label>
              </g>
            );
          })()}
          <Motes x={960} y={YC} rx={760} ry={150} n={22} color="press" opacity={0.45 * heat} seed={6} />
        </g>

        {/* ===================== baris 4: medan cepat, elektron lambat ===================== */}
        <g opacity={partL}>
          <path d={`M${LOOP.map((p) => p.join(',')).join(' L')}`} fill="none" stroke="#5f6fa8" strokeWidth={7} strokeLinejoin="round" />
          {/* jejak medan yang sudah terbentuk */}
          {front > 0 ? (
            <>
              <path d={`M${partial(front).map((p) => p.join(',')).join(' L')}`} fill="none" stroke={C.force} strokeWidth={16} strokeOpacity={0.18} strokeLinejoin="round" />
              <path d={`M${partial(front).map((p) => p.join(',')).join(' L')}`} fill="none" stroke={C.force} strokeWidth={4} strokeOpacity={0.75} strokeLinejoin="round" />
            </>
          ) : null}
          {(() => {
            const [fx, fy] = pointAlong(LOOP, front);
            return <Spark x={fx} y={fy} r={12} color="force" opacity={Math.min(1, front * 20, (1 - front) * 12)} />;
          })()}
          <Stream pts={LOOP} color="force" n={14} speed={1.1} r={5} opacity={ramp(t, tSw + 0.5, tSw + 1.2) * (0.35 + 0.55 * fieldEmph)} jitter={0} />
          {/* elektron merayap (berlawanan arus) */}
          {Array.from({length: 30}, (_, k) => {
            const u = (((k / 30 - crawl) % 1) + 1) % 1;
            const [x, y] = pointAlong(LOOP, u);
            const j = 2 * Math.sin(t * 6 + k * 1.9);
            return <circle key={k} cx={x + j} cy={y - j} r={5} fill={C.pot} opacity={0.55} />;
          })}
          {(() => {
            const u0 = 0.74 - crawl;
            const [x, y] = pointAlong(LOOP, u0);
            const trail: P[] = [1, 2, 3, 4, 5].map((i) => pointAlong(LOOP, u0 + i * 0.0016));
            return (
              <g opacity={ramp(t, cue(4) + 0.8, cue(4) + 1.6)}>
                <Spark x={x} y={y} r={11} color="pot" trail={trail} />
                <Label x={x} y={y + 46} size={26} weight={600} color={C.pot}>
                  elektron: sepersekian mm/s
                </Label>
              </g>
            );
          })()}
          {/* baterai */}
          <g transform="translate(360,550)">
            <rect x={-38} y={-62} width={76} height={124} rx={12} fill="#1b2550" stroke="#5a6aa8" strokeWidth={2.5} />
            <rect x={-38} y={-62} width={76} height={40} rx={12} fill={C.heat} opacity={0.75} />
            <text x={0} y={-42} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={26} fill="#fff">
              +
            </text>
            <text x={0} y={34} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={30} fill={C.pot}>
              −
            </text>
          </g>
          {/* sakelar */}
          <rect x={590} y={318} width={110} height={24} fill="#0d1430" />
          <circle cx={600} cy={330} r={8} fill="#c8cfe6" />
          <circle cx={690} cy={330} r={8} fill="#c8cfe6" />
          <line x1={600} y1={330} x2={600 + 92 * Math.cos((-32 * (1 - sw) * Math.PI) / 180)} y2={330 + 92 * Math.sin((-32 * (1 - sw) * Math.PI) / 180)} stroke="#e6ebff" strokeWidth={7} strokeLinecap="round" />
          <Label x={645} y={270} size={24} color={C.muted}>
            sakelar
          </Label>
          {/* lampu */}
          <rect x={1530} y={500} width={60} height={110} fill="#0d1430" />
          <Glow x={1560} y={540} r={260} color="gold" opacity={lamp} />
          <circle cx={1560} cy={540} r={50} fill="#1b2550" stroke="#c8cfe6" strokeWidth={3} />
          <circle cx={1560} cy={540} r={50} fill={C.gold} opacity={0.8 * lamp} />
          <path d="M1544,580 L1544,548 Q1552,524 1560,548 Q1568,524 1576,548 L1576,580" fill="none" stroke="#fff" strokeWidth={3} opacity={0.5 + 0.5 * lamp} />
          <rect x={1536} y={586} width={48} height={30} rx={6} fill="#5a6aa8" />
          <Ripple x={1560} y={540} p={ramp(t, tSw + 0.25, tSw + 1.6)} r={220} color="gold" />
          <Label x={1560} y={460} size={26} weight={600} color={C.gold} opacity={lamp}>
            langsung menyala
          </Label>
          <Label x={960} y={270} size={30} weight={600} color={C.force} opacity={fieldEmph}>
            medan merambat sangat cepat →
          </Label>
          <Twinkles x={960} y={270} rx={260} ry={24} n={4} color="force" opacity={fieldEmph} />
          <Motes x={960} y={550} rx={600} ry={220} n={18} color="force" opacity={0.3} seed={11} />
        </g>
      </Stage>

      {/* ===================== kartu rumus ===================== */}
      <Formula x={1490} y={250} p={slot(t, wordOf(0, 'aliran') - 0.2, cue(1) + 0.8)} accent={C.cyan} size={64} caption="satuan: ampere (A) = C/s">
        <V color="cyan">I</V> = <Frac n={<V color="heat">Q</V>} d={<V>t</V>} />
      </Formula>
      <Formula x={960} y={250} p={slot(t, wordOf(2, 'sebanding') - 0.3, wordOf(3, 'daya') - 0.3)} accent={C.press} size={66} caption="hukum Ohm, R dalam ohm (Ω)">
        <V color="spr">V</V> = <V color="cyan">I</V>
        <V color="press">R</V>
      </Formula>
      <Formula x={960} y={250} p={slot(t, wordOf(3, 'daya') - 0.3, cue(4) + 0.2)} accent={C.kin} size={66} caption="daya listrik, dalam watt (W)">
        <V color="kin">P</V> = <V color="spr">V</V>
        <V color="cyan">I</V>
      </Formula>
    </AbsoluteFill>
  );
};
