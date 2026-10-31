import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp, rand, win} from '../anim';
import {Arrow, DrawPath, Formula, Glow, Label, Motes, Note, Ripple, Spark, Stage, Sub, Sup, TSup, Twinkles, V, pointAlong} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Sel Daniell (semua analitik per frame):
// anoda Zn dalam ZnSO₄: atom Zn lepas sebagai Zn²⁺ (hijau) dan meninggalkan 2e⁻ yang naik ke kawat;
// katoda Cu dalam CuSO₄: Cu²⁺ mendekat, menangkap 2e⁻ yang turun dari kawat, lalu mengendap (warna tembaga).
// Elektron (biru) mengalir Zn → Cu lewat kawat luar dan menyalakan lampu; arus konvensional (toska) berlawanan.
// Jembatan garam KNO₃: K⁺ ke sisi Cu, NO₃⁻ ke sisi Zn (menyeimbangkan muatan). Voltmeter 1,10 V; E° = 0,34 − (−0,76) = 1,10 V.

const ZX = 620; // elektroda Zn
const CX = 1300; // elektroda Cu
const TOP = 420; // ujung atas elektroda
const BOT = 770;
const SURF = 600; // permukaan larutan
const BK = {top: 540, bot: 820, half: 150};
const WY = 240; // kawat atas
const WIRE: [number, number][] = [
  [ZX, TOP],
  [ZX, WY],
  [CX, WY],
  [CX, TOP],
];
const BRIDGE: [number, number][] = [
  [722, 720],
  [722, 506],
  [748, 480],
  [1172, 480],
  [1198, 506],
  [1198, 720],
];
const fr = (v: number) => ((v % 1) + 1) % 1;
const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.6), 1 - ramp(t, b - 0.55, b - 0.05, EASE_IN_OUT));

/** Ion kecil: lingkaran hijau dengan tanda. */
const Ion: React.FC<{x: number; y: number; sign: '+' | '−'; o: number; r?: number; fill?: string}> = ({x, y, sign, o, r = 11, fill = C.work}) =>
  o <= 0.01 ? null : (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r * 2} fill="url(#soft-work)" />
      <circle cx={x} cy={y} r={r} fill={fill} fillOpacity={0.85} stroke="#eafff4" strokeWidth={1.2} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={r * 1.25} fill="#06210f">
        {sign}
      </text>
    </g>
  );

const Beaker: React.FC<{x: number; fill: string; fillOp: number; o: number; t: number}> = ({x, fill, fillOp, o, t}) => {
  const l = x - BK.half;
  const r = x + BK.half;
  const wave = Array.from({length: 13}, (_, i) => {
    const xx = l + 4 + ((r - l - 8) * i) / 12;
    return `${xx.toFixed(1)},${(SURF + 2.5 * Math.sin(t * 2 + i * 0.9)).toFixed(1)}`;
  });
  return (
    <g opacity={o}>
      <ellipse cx={x} cy={BK.bot + 10} rx={BK.half + 30} ry={12} fill="#000" opacity={0.3} />
      <polygon points={`${l + 4},${SURF} ${wave.join(' ')} ${r - 4},${SURF} ${r - 4},${BK.bot - 18} ${r - 22},${BK.bot - 4} ${l + 22},${BK.bot - 4} ${l + 4},${BK.bot - 18}`} fill={fill} opacity={fillOp} />
      <polyline points={wave.join(' ')} fill="none" stroke="#dfeaff" strokeOpacity={0.5} strokeWidth={2} />
      <path d={`M${l - 8},${BK.top} L${l},${BK.top + 8} L${l},${BK.bot - 18} Q${l},${BK.bot} ${l + 20},${BK.bot} L${r - 20},${BK.bot} Q${r},${BK.bot} ${r},${BK.bot - 18} L${r},${BK.top + 8} L${r + 8},${BK.top}`} fill="none" stroke="#a9bbef" strokeOpacity={0.8} strokeWidth={3.5} strokeLinejoin="round" />
      <rect x={l + 10} y={BK.top + 30} width={9} height={BK.bot - BK.top - 70} rx={4.5} fill="#fff" opacity={0.1} />
    </g>
  );
};

export const Battery: React.FC = () => {
  const {t, cue, cueEnd, wordOf, dur} = useScene();
  const intro = ramp(t, -0.4, 0.9);
  const out = 1 - ramp(t, dur - 0.9, dur, EASE_IN_OUT);
  const c1 = cue(1);
  const c2 = cue(2);
  const c3 = cue(3);
  const tSeng = Math.max(c1 + 0.8, wordOf(1, 'seng') - 0.3);
  const tTemb = Math.max(tSeng + 1.6, wordOf(1, 'tembaga') - 0.3);
  const tFlow = Math.max(c2 + 0.2, wordOf(2, 'mengalir') - 0.3);
  const tBridge = Math.max(tFlow + 1.2, wordOf(2, 'jembatan') - 0.3);
  const tVolt = Math.max(c3 + 0.5, wordOf(3, 'volt') - 0.6);
  const tKec = Math.max(tVolt + 1.2, wordOf(3, 'kecenderungan') - 0.3);

  // perakitan sel
  const bk = ramp(t, 0, 1.0);
  const el = ramp(t, 0.4, 1.5);
  const wire = ramp(t, cue(0) + 1.4, cue(0) + 3.0, EASE_IN_OUT);
  const run = ramp(t, cue(0) + 2.6, cue(0) + 3.8); // elektron mulai mengalir
  const bright = run * (0.75 + 0.25 * ramp(t, tFlow, tFlow + 1)) * (0.92 + 0.08 * Math.sin(t * 3.1));
  const act = 0.35 + 0.65 * ramp(t, c1 - 0.2, c1 + 1); // laju reaksi di elektroda (tampilan)
  const bridgeOn = 0.3 + 0.7 * ramp(t, tBridge - 0.2, tBridge + 0.8);
  const arrows = ramp(t, tFlow, tFlow + 0.7);
  const vm = ramp(t, c3 - 0.2, c3 + 0.6);
  const needle = 1.1 * ramp(t, c3 + 0.4, tVolt + 0.6, (x) => 1 - Math.pow(1 - x, 3)) + 0.004 * Math.sin(t * 7);
  const readout = ramp(t, tVolt + 0.3, tVolt + 1.0);

  // massa elektroda berubah perlahan: Zn menipis, Cu menebal
  const prog = ramp(t, c1, dur, (x) => x);
  const zw = 40 - 7 * prog;
  const cw = 40 + 6 * prog;

  // kamera: dorong ke Zn lalu ke Cu saat baris sel Daniell
  const camK = win(t, c1 + 0.2, cueEnd(1), 1.2, 1.2);
  const cam = 1 + 0.07 * camK;
  const fxc = mix(ZX, CX, ramp(t, tTemb - 0.6, tTemb + 0.6, EASE_IN_OUT));
  const fyc = 640;

  const sNote0 = win(t, cue(0) + 0.6, c2 - 0.4, 0.7, 0.6);
  const sZn = ramp(t, tSeng - 0.2, tSeng + 0.6) * (1 - 0.45 * ramp(t, c3, c3 + 0.8));
  const sCu = ramp(t, tTemb - 0.2, tTemb + 0.6) * (1 - 0.45 * ramp(t, c3, c3 + 0.8));
  const fE = slot(t, tVolt - 0.2, dur + 5);

  const cuSol = interpolateColors(prog, [0, 1], ['#2a7fe0', '#4f8fd8']);

  return (
    <AbsoluteFill style={{opacity: intro * out}}>
      <Stage>
        <g transform={`translate(${fxc},${fyc}) scale(${cam}) translate(${-fxc},${-fyc})`}>
          <Glow x={ZX} y={680} r={260} color="water" opacity={0.12 * bk} />
          <Glow x={CX} y={680} r={260} color="pot" opacity={0.22 * bk} />
          <Beaker x={ZX} fill="#8fa6d6" fillOp={0.22} o={bk} t={t} />
          <Beaker x={CX} fill={cuSol} fillOp={0.42} o={bk} t={t + 1} />
          <Label x={ZX + 80} y={792} size={22} color="#c9d6ff" font="mono" opacity={bk * 0.9}>
            ZnSO₄
          </Label>
          <Label x={CX + 80} y={792} size={22} color="#c9e3ff" font="mono" opacity={bk * 0.9}>
            CuSO₄
          </Label>

          {/* ion penonton SO₄²⁻ melayang pelan */}
          {[ZX, CX].map((bx, s) =>
            Array.from({length: 4}, (_, i) => {
              const x = bx + (i % 2 ? 1 : -1) * (60 + rand(i * 3 + s) * 70) + 12 * Math.sin(t * 0.6 + i + s);
              const y = 640 + rand(i * 7 + s * 5) * 140 + 10 * Math.cos(t * 0.5 + i * 2);
              return <Ion key={`${s}-${i}`} x={x} y={y} sign="−" r={8} o={0.35 * bk} fill="#3fae7e" />;
            }),
          )}

          {/* jembatan garam */}
          <g opacity={bk}>
            <path d={`M722,720 L722,506 Q722,480 748,480 L1172,480 Q1198,480 1198,506 L1198,720`} fill="none" stroke="#b9c8f5" strokeOpacity={0.35} strokeWidth={40} strokeLinejoin="round" />
            <path d={`M722,720 L722,506 Q722,480 748,480 L1172,480 Q1198,480 1198,506 L1198,720`} fill="none" stroke="#1b2a55" strokeWidth={30} strokeLinejoin="round" />
            {Array.from({length: 6}, (_, i) => {
              const p = fr(t * 0.07 * bridgeOn + i / 6);
              const [x, y] = pointAlong(BRIDGE, p);
              return <Ion key={`k${i}`} x={x} y={y - 6} sign="+" r={8} o={cyc(p) * bridgeOn} />;
            })}
            {Array.from({length: 6}, (_, i) => {
              const p = fr(t * 0.07 * bridgeOn + i / 6 + 0.08);
              const [x, y] = pointAlong(BRIDGE, 1 - p);
              return <Ion key={`n${i}`} x={x} y={y + 6} sign="−" r={8} o={cyc(p) * bridgeOn} fill="#3fae7e" />;
            })}
          </g>
          <Label x={960} y={530} size={24} color={C.work} opacity={bk * (0.55 + 0.45 * ramp(t, tBridge - 0.2, tBridge + 0.6))}>
            jembatan garam (KNO₃)
          </Label>
          <g opacity={ramp(t, tBridge, tBridge + 0.7)}>
            <Label x={1060} y={580} size={24} color={C.work} font="mono">
              K⁺ →
            </Label>
            <Label x={860} y={620} size={24} color={C.work} font="mono">
              ← NO₃⁻
            </Label>
            <Ripple x={960} y={480} p={(t - tBridge) / 1.4} r={180} color="work" rings={2} />
          </g>

          {/* elektroda */}
          <g opacity={el} transform={`translate(0 ${(1 - el) * -60})`}>
            <rect x={ZX - zw / 2} y={TOP} width={zw} height={BOT - TOP} rx={4} fill="#8e98ad" stroke="#d3dae8" strokeWidth={2} />
            {Array.from({length: 14}, (_, i) => (
              <circle key={i} cx={ZX - zw / 2 + 8 + (i % 3) * ((zw - 16) / 2)} cy={TOP + 200 + Math.floor(i / 3) * 34} r={4} fill="#c4ccdb" opacity={0.5} />
            ))}
            <rect x={CX - cw / 2} y={TOP} width={cw} height={BOT - TOP} rx={4} fill="#c87a44" stroke="#f0b98d" strokeWidth={2} />
            {Array.from({length: 8}, (_, i) => (
              <circle key={i} cx={CX + (i % 2 ? 1 : -1) * cw * 0.5} cy={630 + i * 17} r={3 + 3 * prog} fill="#e08d50" opacity={0.85 * prog} />
            ))}
            <Label x={ZX} y={TOP + 120} size={30} color="#1a2140" weight={700}>
              Zn
            </Label>
            <Label x={CX} y={TOP + 120} size={30} color="#2a1608" weight={700}>
              Cu
            </Label>
          </g>
          {/* kutub: Zn negatif (anoda), Cu positif (katoda) */}
          <g opacity={el}>
            <circle cx={ZX - 52} cy={TOP + 30} r={17} fill={C.pot} fillOpacity={0.25} stroke={C.pot} strokeWidth={2} />
            <line x1={ZX - 60} y1={TOP + 30} x2={ZX - 44} y2={TOP + 30} stroke="#fff" strokeWidth={3} />
            <circle cx={CX + 52} cy={TOP + 30} r={17} fill={C.heat} fillOpacity={0.25} stroke={C.heat} strokeWidth={2} />
            <line x1={CX + 44} y1={TOP + 30} x2={CX + 60} y2={TOP + 30} stroke="#fff" strokeWidth={3} />
            <line x1={CX + 52} y1={TOP + 22} x2={CX + 52} y2={TOP + 38} stroke="#fff" strokeWidth={3} />
            <Label x={ZX} y={850} size={22} color={C.pot} font="mono">
              anoda (−) · oksidasi
            </Label>
            <Label x={CX} y={850} size={22} color={C.heat} font="mono">
              katoda (+) · reduksi
            </Label>
          </g>

          {/* Zn → Zn²⁺ + 2e⁻ : ion lepas ke larutan, dua elektron naik ke kawat */}
          {Array.from({length: 5}, (_, i) => {
            const u = fr(t / 3.4 + i / 5);
            const side = i % 2 ? 1 : -1;
            const y0 = 640 + rand(i * 4.3) * 110;
            const sx = ZX + side * zw * 0.5;
            const x = sx + side * (6 + 120 * ramp(u, 0.1, 1, (z) => Math.sqrt(z)));
            const y = y0 + 22 * Math.sin(u * 5 + i);
            const g = ramp(u, 0.04, 0.2);
            const o = Math.min(1, u * 12) * Math.min(1, (1 - u) * 5) * act;
            return (
              <g key={`z${i}`}>
                <circle cx={sx} cy={y0} r={11} fill="#b7c0d3" opacity={(1 - g) * Math.min(1, u * 12) * act} />
                <Ion x={x} y={y} sign="+" o={o * g} />
                {[0, 1].map((k) => {
                  const ue = ramp(u, 0.08 + k * 0.06, 0.48 + k * 0.06, (z) => z);
                  return ue > 0 && ue < 1 ? <Spark key={k} x={ZX + (k ? 6 : -6)} y={mix(y0, TOP, ue)} r={4.5} color="pot" opacity={cyc(ue) * 1.4 * act} /> : null;
                })}
              </g>
            );
          })}
          <Label x={ZX - 92} y={624} size={22} color={C.work} font="mono" opacity={ramp(t, tSeng, tSeng + 0.6)}>
            Zn<TSup>2+</TSup>
          </Label>

          {/* Cu²⁺ + 2e⁻ → Cu : ion mendekat, elektron turun dari kawat, ion mengendap */}
          {Array.from({length: 5}, (_, i) => {
            const u = fr(t / 3.6 + i / 5 + 0.1);
            const side = i % 2 ? 1 : -1;
            const y0 = 640 + rand(i * 6.1 + 3) * 110;
            const sx = CX + side * (cw * 0.5 + 9);
            const appr = ramp(u, 0, 0.55, (z) => 1 - (1 - z) * (1 - z));
            const x = mix(sx + side * 130, sx, appr);
            const y = y0 + 18 * Math.sin(u * 4 + i) * (1 - appr);
            const dep = ramp(u, 0.55, 0.7);
            const o = Math.min(1, u * 10) * (1 - ramp(u, 0.85, 1)) * act;
            return (
              <g key={`c${i}`}>
                <Ion x={x} y={y} sign="+" o={o * (1 - dep)} />
                <circle cx={x} cy={y} r={11} fill="#e08d50" stroke="#ffd2ad" strokeWidth={1.2} opacity={o * dep} />
                <Ripple x={sx} y={y0} p={(u - 0.55) / 0.3} r={34} color="kin" rings={1} width={2} />
                {[0, 1].map((k) => {
                  const ue = ramp(u, 0.15 + k * 0.06, 0.55 + k * 0.03, (z) => z);
                  return ue > 0 && ue < 1 ? <Spark key={k} x={CX + (k ? 6 : -6)} y={mix(TOP, y0, ue)} r={4.5} color="pot" opacity={cyc(ue) * 1.4 * act} /> : null;
                })}
              </g>
            );
          })}
          <Label x={CX + 92} y={624} size={22} color={C.work} font="mono" opacity={ramp(t, tTemb, tTemb + 0.6)}>
            Cu<TSup>2+</TSup>
          </Label>
        </g>

        {/* kawat luar, lampu, aliran elektron (Zn → Cu) & arus konvensional (Cu → Zn) */}
        <DrawPath d={`M${ZX},${TOP} L${ZX},${WY} L${CX},${WY} L${CX},${TOP}`} p={wire} stroke="#c3cdf0" width={6} />
        <Glow x={960} y={WY - 6} r={200} color="kin" opacity={0.75 * bright} />
        <g opacity={wire}>
          <circle cx={960} cy={WY - 8} r={40} fill="#1a2550" stroke="#dfe7ff" strokeWidth={3} />
          <circle cx={960} cy={WY - 8} r={36} fill={C.kin} opacity={0.55 * bright} />
          <path d={`M936,${WY + 6} L944,${WY - 22} L952,${WY - 6} L960,${WY - 26} L968,${WY - 6} L976,${WY - 22} L984,${WY + 6}`} fill="none" stroke={interpolateColors(bright, [0, 1], ['#8a92b0', '#fff4d6'])} strokeWidth={3} strokeLinejoin="round" />
          {Array.from({length: 8}, (_, i) => {
            const a = (i / 8) * Math.PI * 2 + t * 0.4;
            const l = 10 + 6 * Math.sin(t * 4 + i);
            return <line key={i} x1={960 + Math.cos(a) * 50} y1={WY - 8 + Math.sin(a) * 50} x2={960 + Math.cos(a) * (50 + l)} y2={WY - 8 + Math.sin(a) * (50 + l)} stroke={C.kin} strokeWidth={3} strokeLinecap="round" opacity={0.7 * bright} />;
          })}
        </g>
        {Array.from({length: 16}, (_, i) => {
          const p = fr(0.11 * Math.max(0, t - cue(0) - 2.6) + i / 16);
          const [x, y] = pointAlong(WIRE, p);
          return <Spark key={i} x={x} y={y} r={5} color="pot" opacity={cyc(p) * run} />;
        })}
        <g opacity={arrows}>
          <Arrow x1={700} y1={WY + 34} x2={830} y2={WY + 34} color="pot" width={5} />
          <Label x={765} y={WY + 66} size={24} color={C.pot} font="mono">
            e⁻
          </Label>
          <Arrow x1={1220} y1={WY + 34} x2={1090} y2={WY + 34} color="cyan" width={5} />
          <Label x={1155} y={WY + 66} size={28} color={C.cyan} font="serif" italic weight={600}>
            I
          </Label>
        </g>

        {/* voltmeter paralel dengan lampu */}
        <g opacity={vm}>
          <DrawPath d={`M880,${WY} L880,318 L900,318`} p={vm} stroke="#9aa7d6" width={3} />
          <DrawPath d={`M1040,${WY} L1040,318 L1020,318`} p={vm} stroke="#9aa7d6" width={3} />
          <circle cx={880} cy={WY} r={5} fill="#c3cdf0" />
          <circle cx={1040} cy={WY} r={5} fill="#c3cdf0" />
          <rect x={860} y={300} width={200} height={134} rx={14} fill="#0e1736" stroke={C.spr} strokeWidth={2.5} />
          <path d="M915,388 A45,45 0 0 1 1005,388" fill="none" stroke="#6b7bb0" strokeWidth={3} />
          {Array.from({length: 7}, (_, i) => {
            const a = ((-60 + i * 20) * Math.PI) / 180;
            return <line key={i} x1={960 + Math.sin(a) * 40} y1={388 - Math.cos(a) * 40} x2={960 + Math.sin(a) * 47} y2={388 - Math.cos(a) * 47} stroke="#9aa7d6" strokeWidth={2} />;
          })}
          {(() => {
            const a = ((-60 + (needle / 1.5) * 120) * Math.PI) / 180;
            return <line x1={960} y1={388} x2={960 + Math.sin(a) * 44} y2={388 - Math.cos(a) * 44} stroke={C.spr} strokeWidth={3.5} strokeLinecap="round" />;
          })()}
          <circle cx={960} cy={388} r={5} fill={C.spr} />
          <text x={960} y={418} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontSize={24} fontWeight={600} fill={C.spr} opacity={readout}>
            1,10 V
          </text>
          <text x={960} y={418} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontSize={24} fill="#5b6a9e" opacity={1 - readout}>
            V
          </text>
          <Twinkles x={960} y={410} rx={90} ry={20} n={4} color="spr" opacity={readout} seed={2} />
        </g>
        <Ripple x={960} y={380} p={(t - tVolt - 0.3) / 1.3} r={200} color="spr" rings={2} />

        {/* tangga kecenderungan melepas elektron (E° reduksi) */}
        <g opacity={ramp(t, tKec - 0.2, tKec + 0.7)}>
          <line x1={1500} y1={480} x2={1500} y2={720} stroke={C.spr} strokeWidth={3} opacity={0.6} />
          <line x1={1488} y1={520} x2={1512} y2={520} stroke={C.heat} strokeWidth={4} />
          <line x1={1488} y1={690} x2={1512} y2={690} stroke={C.pot} strokeWidth={4} />
          <Label x={1528} y={520} anchor="start" size={22} color={C.heat} font="mono">
            Cu²⁺/Cu  +0,34 V
          </Label>
          <Label x={1528} y={690} anchor="start" size={22} color={C.pot} font="mono">
            Zn²⁺/Zn  −0,76 V
          </Label>
          <Arrow x1={1560} y1={668} x2={1560} y2={548} color="spr" width={4} />
          <Label x={1578} y={605} anchor="start" size={22} color={C.spr} font="mono">
            Zn lebih mudah
          </Label>
          <Label x={1578} y={633} anchor="start" size={22} color={C.spr} font="mono">
            melepas e⁻
          </Label>
        </g>
        <Motes x={960} y={560} rx={760} ry={260} n={28} color="pot" opacity={0.3} seed={8} />
      </Stage>

      {/* catatan & rumus (HTML di luar Stage) */}
      <Card0 p={sNote0} />
      <Note x={250} y={640} p={sZn} color={C.pot}>
        <div style={{fontFamily: FONT.serif, fontSize: 34}}>
          Zn → Zn<Sup>2+</Sup> + 2e<Sup>−</Sup>
        </div>
        <div style={{fontSize: 20, color: C.muted}}>seng larut, elektron ditinggal</div>
      </Note>
      <Note x={1660} y={640} p={sCu * (1 - ramp(t, tKec - 0.6, tKec, EASE_IN_OUT))} color={C.heat}>
        <div style={{fontFamily: FONT.serif, fontSize: 34}}>
          Cu<Sup>2+</Sup> + 2e<Sup>−</Sup> → Cu
        </div>
        <div style={{fontSize: 20, color: C.muted}}>tembaga mengendap</div>
      </Note>
      <Formula x={1640} y={330} p={fE} accent={C.spr} size={56} caption="0,34 V − (−0,76 V)">
        <V color={C.spr}>E</V>°<Sub>sel</Sub> ≈ 1,10 V
      </Formula>
    </AbsoluteFill>
  );
};

/** Catatan kecil: baterai vs elektrolisis (arah berlawanan). */
const Card0: React.FC<{p: number}> = ({p}) => (
  <Note x={90} y={330} p={p} anchor="left" size={24} color={C.kin}>
    <div>
      <span style={{color: C.kin}}>baterai</span>: kimia → listrik <span style={{color: C.muted}}>(spontan)</span>
    </div>
    <div>
      <span style={{color: C.work}}>elektrolisis</span>: listrik → kimia <span style={{color: C.muted}}>(dipaksa)</span>
    </div>
  </Note>
);
