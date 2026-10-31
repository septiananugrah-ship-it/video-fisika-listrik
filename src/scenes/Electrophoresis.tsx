import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp, rand, win} from '../anim';
import {Arrow, Glow, Label, Motes, Note, Ripple, Spark, Stage, Twinkles} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Elektroforesis gel (tampak atas): sumur di kutub − (kiri), kutub + di kanan; medan E (kuning) dari + ke −.
// DNA bermuatan negatif (gugus fosfat) bergerak berlawanan medan, menuju +.
// Jarak tempuh ≈ a − b·log(panjang) (kualitatif): x = s · 860 · (4,35 − log₁₀ L)/2,4, s = kemajuan elektroforesis.
// Akhirnya gel disinari UV → pita berpendar; lajur TKP cocok dengan S2 (forensik), ikon genetika.

const GX0 = 330;
const GX1 = 1250;
const GY0 = 320;
const GY1 = 690;
const WELL = 362;
const LANES = [372, 440, 508, 576, 644];
const NAMES = ['M', 'TKP', 'S1', 'S2', 'S3'];
const SIZES: number[][] = [
  [10000, 3000, 1000, 500, 200, 100],
  [6000, 1500, 400, 150],
  [8000, 2500, 700, 250],
  [6000, 1500, 400, 150],
  [5000, 1200, 300],
];
const LADDER_TXT = ['10k', '3k', '1k', '500', '200', '100'];
const travel = (L: number) => (860 * (4.35 - Math.log10(L))) / 2.4;
const UVB = '#ffc4ec';
const fr = (v: number) => ((v % 1) + 1) % 1;
const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.6), 1 - ramp(t, b - 0.55, b - 0.05, EASE_IN_OUT));

/** Panel sisipan kanan. */
const PX = 1400;
const PW = 430;
const PY = 300;
const PH = 330;

export const Electrophoresis: React.FC = () => {
  const {t, cue, cueEnd, wordOf, dur} = useScene();
  const intro = ramp(t, -0.4, 0.9);
  const out = 1 - ramp(t, dur - 0.9, dur, EASE_IN_OUT);
  const c1 = cue(1);
  const c2 = cue(2);
  const c3 = cue(3);
  const tNeg = Math.max(c1 + 0.2, wordOf(1, 'negatif') - 0.4);
  const tGo = Math.max(tNeg + 1.0, wordOf(1, 'bergerak') - 0.4);
  const tPend = Math.max(c2 + 0.2, wordOf(2, 'pendek') - 0.3);
  const tPanj = Math.max(tPend + 1.4, wordOf(2, 'panjang') - 0.3);
  const tFor = Math.max(c3 + 1.2, wordOf(3, 'forensik') - 0.3);
  const tGen = Math.max(tFor + 1.0, wordOf(3, 'genetika') - 0.4);

  const setup = ramp(t, 0, 1.1);
  const power = ramp(t, c1 - 0.3, c1 + 0.3);
  const s = ramp(t, tGo, cueEnd(2) + 0.4, EASE_IN_OUT);
  const uv = ramp(t, c3 - 0.2, c3 + 1.0, EASE_IN_OUT);
  const match = ramp(t, tFor - 0.1, tFor + 0.6);

  // pemuatan sampel: pipet bergerak dari lajur ke lajur
  const L0 = cue(0) + 0.8;
  const pk = Math.max(0, Math.min(4.999, (t - L0) / 0.75));
  const li = Math.floor(pk);
  const lf = pk - li;
  const pipY = mix(LANES[li], LANES[Math.min(4, li + 1)], ramp(lf, 0.6, 1, EASE_IN_OUT));
  const dip = Math.sin(Math.PI * ramp(lf, 0.1, 0.55, (x) => x)) * 10;
  const pipO = win(t, L0 - 0.5, L0 + 3.75, 0.5, 0.5);
  const loaded = (k: number) => ramp(t, L0 + k * 0.75 + 0.15, L0 + k * 0.75 + 0.45);

  const insDNA = slot(t, tNeg - 0.2, c2 + 0.1);
  const insPore = slot(t, c2 + 0.1, c3 + 0.3);
  const insIcons = slot(t, c3 + 0.3, dur + 5);
  const fieldO = 0.6 * ramp(t, c1, c1 + 0.8) * (1 - 0.6 * uv);

  const gelFill = interpolateColors(uv, [0, 1], ['#c9d8ff', '#3a1e6e']);

  return (
    <AbsoluteFill style={{opacity: intro * out}}>
      <Stage>
        <defs>
          <clipPath id="ep-panel">
            <rect x={PX} y={PY} width={PW} height={PH} rx={18} />
          </clipPath>
        </defs>
        <Glow x={790} y={505} r={560} color="spr" opacity={0.35 * uv} />

        {/* catu daya & kabel */}
        <g opacity={setup}>
          <rect x={660} y={168} width={260} height={84} rx={12} fill="#141d40" stroke="#7d8fcc" strokeWidth={2.5} />
          <rect x={690} y={184} width={120} height={40} rx={6} fill="#0a1026" stroke="#3a4a80" strokeWidth={1.5} />
          {Array.from({length: 10}, (_, i) => (
            <rect key={i} x={696 + i * 11} y={210 - 18 * (0.3 + 0.7 * Math.abs(Math.sin(t * 2 + i * 0.6))) * power} width={7} height={18 * (0.3 + 0.7 * Math.abs(Math.sin(t * 2 + i * 0.6))) * power + 2} fill={C.work} opacity={0.8} />
          ))}
          <text x={750} y={238} textAnchor="middle" fontFamily={FONT.mono} fontSize={13} fill={C.muted}>
            DC
          </text>
          <circle cx={845} cy={196} r={7} fill={C.work} opacity={0.15 + 0.85 * power * (0.8 + 0.2 * Math.sin(t * 4))} />
          <circle cx={845} cy={196} r={16} fill="url(#soft-work)" opacity={power} />
          <circle cx={830} cy={232} r={10} fill={C.pot} stroke="#fff" strokeWidth={1.5} />
          <circle cx={890} cy={232} r={10} fill={C.heat} stroke="#fff" strokeWidth={1.5} />
          <path d={`M830,242 L830,262 L285,262 L285,300`} fill="none" stroke={C.pot} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M890,242 L890,262 L1295,262 L1295,300`} fill="none" stroke={C.heat} strokeWidth={4} strokeLinejoin="round" />
        </g>

        {/* tangki buffer & gel */}
        <g opacity={setup}>
          <rect x={250} y={288} width={1080} height={434} rx={16} fill={C.water} fillOpacity={0.1} stroke="#7d8fcc" strokeWidth={3} />
          <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} rx={8} fill={gelFill} fillOpacity={0.1 + 0.75 * uv} stroke="#a9bbef" strokeOpacity={0.6} strokeWidth={2} />
          {/* elektroda kawat */}
          <line x1={285} y1={300} x2={285} y2={710} stroke={C.pot} strokeWidth={4} />
          <line x1={1295} y1={300} x2={1295} y2={710} stroke={C.heat} strokeWidth={4} />
          <circle cx={285} cy={740} r={18} fill={C.pot} fillOpacity={0.25} stroke={C.pot} strokeWidth={2} />
          <line x1={276} y1={740} x2={294} y2={740} stroke="#fff" strokeWidth={3} />
          <circle cx={1295} cy={740} r={18} fill={C.heat} fillOpacity={0.25} stroke={C.heat} strokeWidth={2} />
          <line x1={1286} y1={740} x2={1304} y2={740} stroke="#fff" strokeWidth={3} />
          <line x1={1295} y1={731} x2={1295} y2={749} stroke="#fff" strokeWidth={3} />
        </g>
        {/* gelembung gas di kedua elektroda saat arus mengalir */}
        {[285, 1295].map((ex, s0) =>
          Array.from({length: 9}, (_, i) => {
            const p = fr(t / (1.4 + rand(i + s0) * 0.8) + rand(i * 3.3 + s0));
            const y = 310 + rand(i * 7.1 + s0 * 2) * 390;
            return <circle key={`${s0}-${i}`} cx={ex + (s0 ? -1 : 1) * (4 + p * 16)} cy={y - p * 10} r={2 + 4 * p} fill="none" stroke="#cfe0ff" strokeWidth={1.2} opacity={cyc(p) * 0.6 * power} />;
          }),
        )}

        {/* medan E: dari + (kanan) ke − (kiri) */}
        <g opacity={fieldO}>
          {[304, 706].map((y) => (
            <g key={y}>
              <line x1={1240} y1={y} x2={360} y2={y} stroke={C.force} strokeWidth={2} strokeDasharray="10 16" strokeDashoffset={-t * 40} opacity={0.6} />
              {[0, 1, 2, 3].map((k) => {
                const p = fr(t * 0.18 + k / 4);
                const x = 1220 - p * 840;
                return <polygon key={k} points={`${x + 8},${y - 7} ${x + 8},${y + 7} ${x - 7},${y}`} fill={C.force} opacity={cyc(p)} />;
              })}
            </g>
          ))}
          <Label x={1222} y={304} size={24} color={C.force} font="serif" italic weight={600}>
            E
          </Label>
        </g>

        {/* lajur: label, sumur, pita */}
        {LANES.map((ly, k) => (
          <g key={k} opacity={setup}>
            <Label x={238} y={ly} anchor="end" size={22} color={k === 0 ? C.muted : C.ink} font="mono">
              {NAMES[k]}
            </Label>
            <rect x={WELL - 8} y={ly - 22} width={14} height={44} rx={3} fill="#0a1026" stroke="#8fa0d8" strokeWidth={1.5} />
            <rect x={WELL - 6} y={ly - 20} width={10} height={40} rx={2} fill={C.pot} opacity={0.75 * loaded(k) * (1 - 0.8 * ramp(s, 0, 0.08))} />
            {SIZES[k].map((L, j) => {
              const x = WELL + s * travel(L);
              const wob = 1.5 * Math.sin(t * 2 + j + k);
              const lo = loaded(k) * ramp(s, 0, 0.05);
              return (
                <g key={j}>
                  <rect x={x - 5} y={ly - 19 + wob * 0.3} width={10 + 4 * s} height={38} rx={4} fill={C.pot} opacity={lo * 0.6 * (1 - uv)} />
                  <rect x={x - 9} y={ly - 21} width={18 + 4 * s} height={42} rx={6} fill={UVB} opacity={lo * uv * 0.35 * (0.85 + 0.15 * Math.sin(t * 2.5 + j))} />
                  <rect x={x - 5} y={ly - 19} width={10 + 4 * s} height={38} rx={4} fill={UVB} opacity={lo * uv * (0.85 + 0.15 * Math.sin(t * 2.5 + j))} />
                </g>
              );
            })}
          </g>
        ))}
        {/* label ukuran tangga DNA (UV) */}
        {SIZES[0].map((L, j) => (
          <Label key={j} x={WELL + travel(L) + 5} y={340} size={15} color={UVB} font="mono" opacity={uv * ramp(t, c3 + 0.6, c3 + 1.3)}>
            {LADDER_TXT[j]}
          </Label>
        ))}
        {/* forensik: TKP = S2 */}
        <g opacity={match}>
          {[LANES[1], LANES[3]].map((ly) => (
            <rect key={ly} x={GX0 + 6} y={ly - 28} width={GX1 - GX0 - 12} height={56} rx={10} fill="none" stroke={C.gold} strokeWidth={2.5} strokeDasharray="12 8" strokeDashoffset={-t * 20} />
          ))}
          <path d={`M${GX1 - 4},${LANES[1]} Q${GX1 + 26},${(LANES[1] + LANES[3]) / 2} ${GX1 - 4},${LANES[3]}`} fill="none" stroke={C.gold} strokeWidth={2.5} />
          <Twinkles x={900} y={(LANES[1] + LANES[3]) / 2} rx={300} ry={70} n={5} color="gold" seed={6} />
        </g>
        <Ripple x={GX1} y={(LANES[1] + LANES[3]) / 2} p={(t - tFor) / 1.3} r={160} color="gold" rings={2} />

        {/* pipet */}
        <g opacity={pipO} transform={`translate(${WELL - 2} ${pipY + dip - 16})`}>
          <path d="M0,0 L-14,-30 L-60,-110 L-46,-118 L-4,-36 Z" fill="#d7e2ff" fillOpacity={0.75} stroke="#ffffff" strokeWidth={1.5} />
          <rect x={-84} y={-160} width={30} height={50} rx={6} transform="rotate(-30 -69 -135)" fill="#7d8fcc" />
          <circle cx={0} cy={2} r={4} fill={C.pot} opacity={0.9} />
        </g>

        {/* DNA (−) bergerak ke + */}
        <g opacity={win(t, tGo - 0.2, c2 + 0.1, 0.6, 0.6)}>
          <Arrow x1={460} y1={780} x2={900} y2={780} color="pot" width={6} />
          <Label x={930} y={780} anchor="start" size={26} color={C.pot}>
            DNA (−) → kutub <tspan fill={C.heat}>+</tspan>
          </Label>
        </g>

        {/* sisipan kanan: (A) DNA & fosfat, (B) pori gel, (C) ikon */}
        <g opacity={Math.max(insDNA, insPore, insIcons)}>
          <rect x={PX} y={PY} width={PW} height={PH} rx={18} fill="#0e1736" stroke="#7d8fcc" strokeOpacity={0.7} strokeWidth={2} />
        </g>
        <g clipPath="url(#ep-panel)">
          <g opacity={insDNA}>
            {(() => {
              const cy = PY + 150;
              const phase = t * 1.6;
              const pts = (sg: number) =>
                Array.from({length: 41}, (_, i) => {
                  const x = PX + 20 + i * 10;
                  return `${x},${(cy + sg * 50 * Math.sin(i * 0.33 - phase)).toFixed(1)}`;
                }).join(' ');
              return (
                <g>
                  {Array.from({length: 13}, (_, i) => {
                    const x = PX + 30 + i * 31;
                    const a = 50 * Math.sin((x - PX - 20) * 0.033 - phase);
                    return <line key={i} x1={x} y1={cy - a} x2={x} y2={cy + a} stroke={C.work} strokeOpacity={0.45} strokeWidth={4} />;
                  })}
                  <polyline points={pts(1)} fill="none" stroke="#8fb3ff" strokeWidth={4} />
                  <polyline points={pts(-1)} fill="none" stroke="#8fb3ff" strokeWidth={4} />
                  {Array.from({length: 9}, (_, i) => {
                    const x = PX + 40 + i * 46;
                    const sg = i % 2 ? 1 : -1;
                    const y = cy + sg * 50 * Math.sin((x - PX - 20) * 0.033 - phase);
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r={11} fill={C.pot} stroke="#e4efff" strokeWidth={1.2} />
                        <line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke="#fff" strokeWidth={2.4} />
                      </g>
                    );
                  })}
                </g>
              );
            })()}
            <Label x={PX + PW / 2} y={PY + 40} size={24} color={C.ink}>
              gugus fosfat bermuatan <tspan fill={C.pot}>−</tspan>
            </Label>
            <Arrow x1={PX + 120} y1={PY + 280} x2={PX + 310} y2={PY + 280} color="pot" width={5} />
            <Label x={PX + 345} y={PY + 280} size={30} color={C.heat} weight={700}>
              +
            </Label>
          </g>
          <g opacity={insPore}>
            {/* jaring serat gel */}
            {Array.from({length: 26}, (_, i) => {
              const x = PX + rand(i * 2.7) * PW;
              const y = PY + 60 + rand(i * 5.3) * 220;
              const a = rand(i * 9.1) * Math.PI;
              const l = 40 + rand(i * 1.9) * 50;
              return <line key={i} x1={x - Math.cos(a) * l} y1={y - Math.sin(a) * l} x2={x + Math.cos(a) * l} y2={y + Math.sin(a) * l} stroke="#6b7bb0" strokeWidth={2.5} opacity={0.55} />;
            })}
            {(() => {
              const chain = (n: number, period: number, y0: number, off: number, col: string) => {
                const p = fr(t / period + off);
                const head = PX - 40 + p * (PW + 80 + n * 14);
                return (
                  <g opacity={cyc(p) * 1.2}>
                    {Array.from({length: n}, (_, j) => {
                      const x = head - j * 14;
                      const y = y0 + 9 * Math.sin(x * 0.06 + j * 0.8 + t * 3);
                      return <circle key={j} cx={x} cy={y} r={6} fill={col} stroke="#e4efff" strokeWidth={1} />;
                    })}
                  </g>
                );
              };
              return (
                <g>
                  {chain(3, 2.0, PY + 130, 0, C.cyan)}
                  {chain(3, 2.0, PY + 175, 0.5, C.cyan)}
                  {chain(11, 6.5, PY + 235, 0.2, C.pot)}
                </g>
              );
            })()}
            <Label x={PX + 24} y={PY + 34} anchor="start" size={22} color={C.cyan} opacity={ramp(t, tPend, tPend + 0.5)}>
              pendek: menyelinap cepat
            </Label>
            <Label x={PX + 24} y={PY + 300} anchor="start" size={22} color={C.pot} opacity={ramp(t, tPanj, tPanj + 0.5)}>
              panjang: tertinggal
            </Label>
          </g>
          <g opacity={insIcons}>
            {/* ikon forensik: sidik jari + kaca pembesar */}
            {Array.from({length: 6}, (_, i) => (
              <path key={i} d={`M${PX + 90 - 10 - i * 8},${PY + 110 + i * 3} A${12 + i * 8},${16 + i * 9} 0 1 1 ${PX + 90 + 10 + i * 8},${PY + 110 + i * 3}`} fill="none" stroke={C.gold} strokeWidth={2.5} opacity={0.5 + 0.4 * Math.sin(t * 2 - i * 0.6)} />
            ))}
            <circle cx={PX + 130 + 4 * Math.sin(t)} cy={PY + 125} r={26} fill="none" stroke="#dfe7ff" strokeWidth={4} />
            <line x1={PX + 150 + 4 * Math.sin(t)} y1={PY + 145} x2={PX + 170 + 4 * Math.sin(t)} y2={PY + 165} stroke="#dfe7ff" strokeWidth={6} strokeLinecap="round" />
            <Label x={PX + 200} y={PY + 95} anchor="start" size={26} color={C.gold} opacity={ramp(t, tFor - 0.2, tFor + 0.5)}>
              forensik
            </Label>
            <Label x={PX + 200} y={PY + 132} anchor="start" size={22} color={C.ink} font="mono" opacity={ramp(t, tFor, tFor + 0.6)}>
              TKP = S2 ✓
            </Label>
            {/* ikon genetika: heliks kecil berputar */}
            {Array.from({length: 9}, (_, i) => {
              const y = PY + 200 + i * 13;
              const a = 22 * Math.sin(i * 0.7 + t * 2.2);
              return (
                <g key={i}>
                  <line x1={PX + 90 - a} y1={y} x2={PX + 90 + a} y2={y} stroke={C.work} strokeWidth={3} opacity={0.6} />
                  <circle cx={PX + 90 - a} cy={y} r={4.5} fill={C.pot} />
                  <circle cx={PX + 90 + a} cy={y} r={4.5} fill={C.cyan} />
                </g>
              );
            })}
            <Label x={PX + 200} y={PY + 235} anchor="start" size={26} color={C.work} opacity={ramp(t, tGen - 0.2, tGen + 0.5)}>
              genetika
            </Label>
            <Label x={PX + 200} y={PY + 272} anchor="start" size={22} color={C.ink} font="mono" opacity={ramp(t, tGen, tGen + 0.6)}>
              peta & uji gen
            </Label>
          </g>
        </g>
        {/* titik DNA kecil di ujung pita saat berjalan */}
        {LANES.map((ly, k) => {
          const L = SIZES[k][SIZES[k].length - 1];
          const x = WELL + s * travel(L) + 14;
          return <Spark key={k} x={x} y={ly} r={3.5} color="pot" opacity={win(t, tGo, cueEnd(2), 0.5, 0.8) * 0.8} />;
        })}
        <Motes x={790} y={505} rx={560} ry={240} n={26} color="pot" opacity={0.3 * (1 - uv)} seed={9} />
        <Motes x={790} y={505} rx={560} ry={240} n={26} color="spr" opacity={0.3 * uv} seed={9} />
      </Stage>
      <Note x={790} y={790} p={slot(t, c2 + 0.2, c3 + 0.2)} color={C.cyan} size={26}>
        jarak tempuh ≈ <span style={{fontFamily: FONT.serif, fontStyle: 'italic'}}>a</span> − <span style={{fontFamily: FONT.serif, fontStyle: 'italic'}}>b</span> · log(panjang)
        <span style={{color: C.muted}}> — pendek lebih jauh</span>
      </Note>
      <Note x={790} y={790} p={slot(t, c3 + 0.6, dur + 5)} color={UVB} size={26}>
        pita tersusun menurut ukuran · disinari UV
      </Note>
    </AbsoluteFill>
  );
};
