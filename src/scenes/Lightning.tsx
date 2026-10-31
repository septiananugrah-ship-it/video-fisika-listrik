import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp, rand, smoothPath, win} from '../anim';
import {Arrow, Formula, Glow, Label, Motes, Note, Ripple, Spark, Stage, Twinkles, V, pointAlong} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Petir (penampang awan badai, semua analitik per frame):
// tumbukan es (naik) & graupel (turun) memisahkan muatan → atas +, bawah −, tanah terinduksi +;
// beda potensial ratusan MV (garis medan kuning dari tanah + ke dasar awan −);
// pemimpin bertangga bercabang turun, pita naik dari pohon, sambaran balik (pendar terbatas, bukan kilat layar penuh), I ≈ 30 kA
// (arus konvensional ke atas, elektron turun); kanal ≈ 30 000 K ≈ 5× permukaan Matahari (5800 K); udara memuai → cincin kejut (guntur).

const GY = 830; // permukaan tanah
const TREE = {x: 1000, top: 740};
const fr = (v: number) => ((v % 1) + 1) % 1;
const lin = (x: number) => x;
const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.6), 1 - ramp(t, b - 0.55, b - 0.05, EASE_IN_OUT));

const CLOUD: [number, number][] = [
  [470, 250], [560, 206], [700, 190], [860, 184], [1020, 190], [1160, 200], [1272, 232], [1240, 262], [1150, 276], [1180, 322],
  [1206, 372], [1186, 422], [1128, 458], [1000, 472], [860, 474], [720, 466], [620, 446], [562, 404], [566, 350], [600, 302],
  [640, 274], [540, 270], [470, 250],
];

// pemimpin bertangga: simpul utama + cabang (deterministik)
const N = 12;
const A0: [number, number] = [862, 476];
const B0: [number, number] = [990, 690];
const NODES: [number, number][] = Array.from({length: N + 1}, (_, i) => {
  const inner = i > 0 && i < N;
  return [mix(A0[0], B0[0], i / N) + (inner ? (rand(i * 3.7 + 1) - 0.5) * 60 : 0), mix(A0[1], B0[1], i / N) + (inner ? (rand(i * 5.1 + 2) - 0.5) * 10 : 0)];
});
const CHANNEL: [number, number][] = [...NODES, [TREE.x, TREE.top]];
const BRANCHES = [
  {at: 2, dir: -1, len: 4},
  {at: 4, dir: 1, len: 3},
  {at: 6, dir: -1, len: 4},
  {at: 8, dir: 1, len: 3},
  {at: 9, dir: -1, len: 2},
].map((b, k) => {
  const pts: [number, number][] = [NODES[b.at]];
  for (let j = 0; j < b.len; j++) {
    const [x, y] = pts[pts.length - 1];
    pts.push([x + b.dir * (20 + rand(k * 9 + j) * 20), y + 14 + rand(k * 7 + j * 3) * 14]);
  }
  return {...b, pts};
});

/** Polyline sampai fraksi indeks k (0..n-1). */
const partial = (pts: [number, number][], k: number): [number, number][] => {
  if (k <= 0) return [pts[0]];
  const i = Math.min(pts.length - 2, Math.floor(k));
  const f = Math.min(1, k - i);
  const out = pts.slice(0, i + 1);
  out.push([mix(pts[i][0], pts[i + 1][0], f), mix(pts[i][1], pts[i + 1][1], f)]);
  return out;
};
const ptsStr = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/** Muatan kecil (lingkaran + tanda). */
const Q: React.FC<{x: number; y: number; pos: boolean; o?: number; r?: number}> = ({x, y, pos, o = 1, r = 12}) =>
  o <= 0.01 ? null : (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r * 1.9} fill={`url(#soft-${pos ? 'heat' : 'pot'})`} />
      <circle cx={x} cy={y} r={r} fill={pos ? C.heat : C.pot} fillOpacity={0.3} stroke={pos ? C.heat : C.pot} strokeWidth={2} />
      <line x1={x - r * 0.55} y1={y} x2={x + r * 0.55} y2={y} stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
      {pos ? <line x1={x} y1={y - r * 0.55} x2={x} y2={y + r * 0.55} stroke="#fff" strokeWidth={2.4} strokeLinecap="round" /> : null}
    </g>
  );

/** Kristal es (bintang enam). */
const Ice: React.FC<{x: number; y: number; r: number; o: number; rot?: number}> = ({x, y, r, o, rot = 0}) => (
  <g opacity={o} transform={`translate(${x},${y}) rotate(${rot})`}>
    {[0, 60, 120].map((a) => (
      <line key={a} x1={-r * Math.cos((a * Math.PI) / 180)} y1={-r * Math.sin((a * Math.PI) / 180)} x2={r * Math.cos((a * Math.PI) / 180)} y2={r * Math.sin((a * Math.PI) / 180)} stroke="#e8f4ff" strokeWidth={Math.max(1.5, r * 0.22)} strokeLinecap="round" />
    ))}
  </g>
);

export const Lightning: React.FC = () => {
  const {t, cue, cueEnd, wordOf, dur} = useScene();
  const intro = ramp(t, -0.4, 0.9);
  const out = 1 - ramp(t, dur - 0.9, dur, EASE_IN_OUT);

  const c1 = cue(1);
  const c2 = cue(2);
  const c3 = cue(3);
  const tAtas = wordOf(0, 'atas');
  const tF1 = Math.max(c1 + 0.2, wordOf(1, 'ratusan') - 0.6);
  const tS = Math.max(c2 + 3, wordOf(2, 'Arus') - 0.05); // sambaran balik
  const tHot = Math.max(c3 + 0.3, wordOf(3, 'tiga') - 0.3);
  const tSun = Math.max(tHot + 1.2, wordOf(3, 'matahari') - 0.4);
  const tBoom = Math.max(tSun + 1.0, wordOf(3, 'memuai') - 0.2);
  const tGuntur = wordOf(3, 'guntur');

  // pemisahan muatan
  const sep = ramp(t, cue(0) + 1.2, cueEnd(0) - 0.4, EASE_IN_OUT);
  const ind = ramp(t, cueEnd(0) - 1.6, c1 + 1.2);
  const neut = 1 - 0.55 * ramp(t, tS, tS + 0.9, EASE_IN_OUT);
  const recharge = 0.55 * ramp(t, tS + 6, dur, lin) * 0.6;
  const negK = neut + recharge;

  // pemimpin bertangga
  const raw = ramp(t, c2 + 0.5, tS - 0.15, lin) * N;
  const P = Math.floor(raw) + ramp(raw - Math.floor(raw), 0, 0.35, lin);
  const leaderOn = ramp(t, c2 + 0.4, c2 + 0.7) * (1 - ramp(t, tS + 0.5, tS + 1.6, EASE_IN_OUT));
  const streamer = ramp(P, N - 2.5, N, lin);

  // sambaran balik + sambaran susulan: denyut terang yang meluruh
  const env = (u: number) => (u <= 0 ? 0 : Math.min(1, u / 0.07) * Math.exp(-u / 0.3));
  const b = Math.min(1.2, env(t - tS) + 0.55 * env(t - tS - 0.6) + 0.35 * env(t - tS - 1.2));
  const hot = ramp(t, tS, tS + 0.25) * (0.35 + 0.35 * ramp(t, tHot - 0.2, tHot + 0.8)) * (1 - ramp(t, tBoom + 0.6, cueEnd(3) + 0.9, EASE_IN_OUT));
  const chOn = Math.min(1, b + hot);

  // kamera: dorongan halus ke awan saat pemisahan muatan, lalu ke kanal saat sambaran
  const camA = 0.035 * win(t, cue(0) + 0.4, c1 - 0.3, 1.6, 1.4);
  const camB = 0.03 * win(t, tS - 0.6, c3 + 1, 1.2, 1.5);
  const cam = 1 + camA + camB;
  const fx = mix(860, 940, camB / 0.03 || 0);
  const fy = mix(330, 620, camB / 0.03 || 0);

  // slot panel kanan
  const s0 = slot(t, tAtas - 0.3, tF1);
  const s1 = slot(t, tF1, tS);
  const s2 = slot(t, tS + 0.1, c3);
  const s3 = slot(t, c3, dur + 5);
  const inset = win(t, cue(0) + 0.8, c3 - 0.1, 0.8, 0.7);
  const insA = 1 - ramp(t, c2 - 0.2, c2 + 0.5, EASE_IN_OUT);
  const insB = ramp(t, c2 + 0.2, c2 + 0.9);
  const field = win(t, c1 + 0.3, tS - 0.2, 0.8, 0.4) * 0.55;
  const ruler = win(t, tF1 - 0.2, tS, 0.7, 0.5);

  // titik muatan awan (mula-mula tercampur di tengah, lalu terpisah)
  const posQ = Array.from({length: 9}, (_, i) => {
    const mx = 660 + rand(i * 2.3) * 460;
    const my = 330 + rand(i * 4.1) * 70;
    const tx = 640 + i * 60 + 10 * Math.sin(t * 0.7 + i);
    const ty = 222 + (i % 3) * 18 + 5 * Math.sin(t * 0.9 + i * 1.7);
    const e = ramp(sep, i * 0.04, 0.6 + i * 0.04);
    return {x: mix(mx, tx, e), y: mix(my, ty, e)};
  });
  const negQ = Array.from({length: 10}, (_, i) => {
    const mx = 650 + rand(i * 3.9 + 5) * 480;
    const my = 320 + rand(i * 6.7 + 1) * 80;
    const tx = 650 + i * 52 + 8 * Math.sin(t * 0.8 + i * 2);
    const ty = 420 + (i % 2) * 22 + 5 * Math.sin(t * 1.1 + i);
    const e = ramp(sep, 0.05 + i * 0.035, 0.65 + i * 0.035);
    return {x: mix(mx, tx, e), y: mix(my, ty, e)};
  });

  const cloudD = smoothPath(CLOUD.map(([x, y], i) => [x + 3 * Math.sin(t * 0.5 + i * 1.3), y + 4 * Math.sin(t * 0.6 + i)] as [number, number]));
  const chMid = pointAlong(CHANNEL, 0.5);

  // inset
  const IX = 270;
  const IY = 560;
  const IR = 132;
  const qc = fr(t / 3.2);
  const meet = ramp(qc, 0.46, 0.56);
  const fadeC = Math.min(1, qc * 8) * Math.min(1, (1 - qc) * 8);

  // batang suhu
  const BX = 1390;
  const BW = 430;
  const sunW = (5800 / 30000) * BW;
  const pSun = ramp(t, tSun - 0.2, tSun + 0.8);
  const pBolt = ramp(t, tHot - 0.2, tHot + 1.2);
  const five = ramp(t, tSun + 0.6, tSun + 1.6);

  return (
    <AbsoluteFill style={{opacity: intro * out}}>
      <Stage>
        <defs>
          <linearGradient id="lt-cloud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a4778" />
            <stop offset="60%" stopColor="#222c55" />
            <stop offset="100%" stopColor="#151c3a" />
          </linearGradient>
          <linearGradient id="lt-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b2a4c" />
            <stop offset="100%" stopColor="#0a1124" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lt-dv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.pot} />
            <stop offset="100%" stopColor={C.heat} />
          </linearGradient>
          <clipPath id="lt-ins">
            <circle cx={IX} cy={IY} r={IR - 3} />
          </clipPath>
        </defs>

        <g transform={`translate(${fx},${fy}) scale(${cam}) translate(${-fx},${-fy})`}>
          {/* pendar sambaran: terang tetapi terbatas (radial), bukan kilat layar penuh */}
          <Glow x={chMid[0]} y={chMid[1]} r={420} color="spr" opacity={0.55 * b} still />
          <Glow x={880} y={440} r={340} color="white" opacity={0.4 * b} still />
          <Glow x={chMid[0]} y={chMid[1]} r={200} color="press" opacity={0.6 * hot} />

          {/* hujan tipis */}
          {Array.from({length: 34}, (_, i) => {
            const x0 = 560 + rand(i * 1.7) * 700;
            const p = fr(t * (0.9 + 0.3 * rand(i + 4)) + rand(i * 2.9));
            const y = 480 + p * (GY - 500);
            return <line key={i} x1={x0 - p * 30} y1={y} x2={x0 - p * 30 - 5} y2={y + 18} stroke="#9fb4e6" strokeWidth={1.4} opacity={cyc(p) * 0.25 * intro} />;
          })}

          {/* tanah, pohon, rumah */}
          <path d={`M80,${GY} Q300,${GY - 14} 520,${GY - 4} T980,${GY} T1440,${GY - 6} T1840,${GY} L1840,880 L80,880 Z`} fill="url(#lt-ground)" />
          <path d={`M80,${GY} Q300,${GY - 14} 520,${GY - 4} T980,${GY} T1440,${GY - 6} T1840,${GY}`} fill="none" stroke="#3d5288" strokeWidth={2.5} />
          <rect x={TREE.x - 6} y={TREE.top + 40} width={12} height={GY - TREE.top - 40} fill="#3a3550" />
          <ellipse cx={TREE.x} cy={TREE.top + 30} rx={34 + 1.5 * Math.sin(t * 2)} ry={32} fill="#1f3b44" stroke="#3f6a6e" strokeWidth={2} transform={`rotate(${2 * Math.sin(t * 1.3)} ${TREE.x} ${GY})`} />
          {[1460, 1560].map((hx, k) => (
            <g key={hx} opacity={0.8}>
              <rect x={hx} y={GY - 48 + k * 8} width={70 - k * 10} height={48 - k * 8} fill="#202c52" stroke="#4a5d94" strokeWidth={2} />
              <path d={`M${hx - 8},${GY - 48 + k * 8} L${hx + 35 - k * 5},${GY - 78 + k * 10} L${hx + 78 - k * 10},${GY - 48 + k * 8} Z`} fill="#2a3866" stroke="#4a5d94" strokeWidth={2} />
              <rect x={hx + 22 - k * 3} y={GY - 32 + k * 6} width={14} height={14} fill={C.gold} opacity={0.35 + 0.25 * Math.sin(t * 1.7 + k) + 0.4 * b} />
            </g>
          ))}
          {/* muatan induksi + di tanah */}
          {Array.from({length: 9}, (_, i) => (
            <Q key={i} x={680 + i * 62} y={GY + 20 + 3 * Math.sin(t * 1.2 + i)} pos r={10} o={ind * negK * (i === 5 ? 0.6 : 1)} />
          ))}
          <Label x={560} y={GY + 22} anchor="end" size={22} color={C.heat} opacity={ind * win(t, cueEnd(0) - 1.2, tS, 0.6, 0.6)}>
            tanah: + terinduksi
          </Label>

          {/* garis medan: dari tanah (+) ke dasar awan (−), butir mengalir ke atas */}
          <g opacity={field}>
            {[700, 790, 880, 1080, 1160].map((x, i) => (
              <g key={x}>
                <line x1={x} y1={GY - 8} x2={x + 6 * Math.sin(i)} y2={478} stroke={C.force} strokeWidth={2} strokeDasharray="10 14" strokeDashoffset={t * 50} opacity={0.7} />
                {[0, 1, 2].map((k) => {
                  const p = fr(t * 0.45 + k / 3 + i * 0.13);
                  return <polygon key={k} points={`${x - 7},${GY - 30 - p * 300 + 8} ${x + 7},${GY - 30 - p * 300 + 8} ${x},${GY - 30 - p * 300 - 6}`} fill={C.force} opacity={cyc(p)} />;
                })}
              </g>
            ))}
            <Label x={735} y={640} size={30} color={C.force} font="serif" italic weight={600}>
              E
            </Label>
          </g>

          {/* penggaris beda potensial */}
          <g opacity={ruler}>
            <line x1={1150} y1={476} x2={1330} y2={476} stroke={C.spr} strokeWidth={1.5} strokeDasharray="5 8" opacity={0.7} />
            <rect x={1318} y={480} width={24} height={GY - 490} rx={12} fill="url(#lt-dv)" opacity={0.35} />
            <Arrow x1={1330} y1={488} x2={1330} y2={GY - 12} color="spr" width={5} both pulse={false} />
            <Label x={1362} y={655} anchor="start" size={38} color={C.spr} font="serif" italic weight={600}>
              ΔV
            </Label>
          </g>

          {/* awan */}
          <Glow x={860} y={330} r={420} color="pot" opacity={0.18 * intro} />
          <path d={cloudD} fill="url(#lt-cloud)" stroke="#6576b4" strokeOpacity={0.55} strokeWidth={2.5} />
          {[[700, 250, 70], [900, 230, 90], [1080, 245, 70], [760, 360, 80], [1000, 380, 90]].map(([x, y, r], i) => (
            <ellipse key={i} cx={x + 6 * Math.sin(t * 0.4 + i)} cy={y} rx={r} ry={r * 0.45} fill="#6a7cc0" opacity={0.08 + 0.03 * Math.sin(t * 0.8 + i)} />
          ))}
          {/* arus naik di dalam awan: es naik, graupel turun, sesekali bertumbukan */}
          {Array.from({length: 9}, (_, i) => {
            const p = fr(t / (3.6 + rand(i) * 1.6) + rand(i * 7.7));
            const x = 650 + rand(i * 3.3) * 470 + 10 * Math.sin(t * 1.4 + i);
            return <Ice key={`i${i}`} x={x} y={445 - p * 220} r={5 + rand(i) * 2} o={cyc(p) * 0.8} rot={t * 40 + i * 20} />;
          })}
          {Array.from({length: 7}, (_, i) => {
            const p = fr(t / (4.4 + rand(i + 9) * 1.5) + rand(i * 5.9));
            const x = 670 + rand(i * 8.1) * 430 + 8 * Math.sin(t + i);
            return <circle key={`g${i}`} cx={x} cy={235 + p * 210} r={7} fill="#a9b4cf" stroke="#dfe6ff" strokeWidth={1} opacity={cyc(p) * 0.75} />;
          })}
          {Array.from({length: 5}, (_, i) => {
            const p = fr(t / 1.7 + rand(i * 4.4));
            const x = 680 + rand(i * 2.2 + Math.floor(t / 1.7 + rand(i * 4.4))) * 420;
            const y = 300 + rand(i * 3.1 + Math.floor(t / 1.7 + rand(i * 4.4))) * 90;
            return <circle key={`c${i}`} cx={x} cy={y} r={3 + 10 * p} fill="none" stroke="#fff" strokeWidth={1.5} opacity={cyc(p) * 0.5 * (0.4 + 0.6 * win(t, cue(0), c2, 0.6, 1))} />;
          })}
          {posQ.map((q, i) => (
            <Q key={`p${i}`} x={q.x} y={q.y} pos o={ramp(t, cue(0) + 0.6 + i * 0.05, cue(0) + 1.2 + i * 0.05)} />
          ))}
          {negQ.map((q, i) => (
            <Q key={`n${i}`} x={q.x} y={q.y} pos={false} o={ramp(t, cue(0) + 0.6 + i * 0.05, cue(0) + 1.2 + i * 0.05) * (i % 3 === 1 ? negK : 1) * (0.55 + 0.45 * negK)} />
          ))}
          <Label x={1290} y={210} anchor="start" size={30} color={C.heat} weight={700} opacity={ramp(t, tAtas - 0.2, tAtas + 0.5)}>
            +
          </Label>
          <Label x={1215} y={440} anchor="start" size={34} color={C.pot} weight={700} opacity={ramp(t, tAtas + 0.5, tAtas + 1.2)}>
            −
          </Label>

          {/* pemimpin bertangga & cabang */}
          <g opacity={leaderOn}>
            <polyline points={ptsStr(partial(NODES, P))} fill="none" stroke="#c9b8ff" strokeOpacity={0.25} strokeWidth={10} strokeLinejoin="round" />
            <polyline points={ptsStr(partial(NODES, P))} fill="none" stroke="#e6ddff" strokeWidth={2.6} strokeLinejoin="round" />
            {BRANCHES.map((br, k) => {
              const bp = Math.max(0, Math.min(1, (P - br.at) / 2.2)) * (br.pts.length - 1);
              return bp > 0 ? <polyline key={k} points={ptsStr(partial(br.pts, bp))} fill="none" stroke="#d8ccff" strokeWidth={1.8} strokeLinejoin="round" opacity={0.75} /> : null;
            })}
            {P > 0.05 && P < N - 0.02 ? (() => {
              const tip = partial(NODES, P).slice(-1)[0];
              return <Spark x={tip[0]} y={tip[1]} r={5} color="spr" opacity={0.6 + 0.4 * Math.sin(t * 20)} />;
            })() : null}
            {streamer > 0 ? (
              <polyline points={ptsStr(partial([[TREE.x, TREE.top], NODES[N]], streamer))} fill="none" stroke="#e6ddff" strokeWidth={2.4} opacity={0.85} />
            ) : null}
          </g>

          {/* kanal sambaran balik: inti putih (kilat) + inti merah muda (panas) yang bersilang-pudar */}
          {chOn > 0.01 ? (
            <g>
              <polyline points={ptsStr(CHANNEL)} fill="none" stroke="#cdbdff" strokeOpacity={0.28 * chOn} strokeWidth={28} strokeLinejoin="round" strokeLinecap="round" />
              <polyline points={ptsStr(CHANNEL)} fill="none" stroke={C.press} strokeWidth={7} strokeLinejoin="round" opacity={hot * (0.75 + 0.25 * Math.sin(t * 9))} />
              <polyline points={ptsStr(CHANNEL)} fill="none" stroke="#ffffff" strokeWidth={6} strokeLinejoin="round" opacity={Math.min(1, b)} />
              {BRANCHES.map((br, k) => (
                <polyline key={k} points={ptsStr(br.pts)} fill="none" stroke="#f1ebff" strokeWidth={2.4} strokeLinejoin="round" opacity={0.7 * Math.min(1, b)} />
              ))}
            </g>
          ) : null}
          <Ripple x={TREE.x} y={TREE.top + 10} p={(t - tS) / 1.1} r={170} color="white" rings={2} />
          {/* elektron turun di kanal */}
          {Array.from({length: 7}, (_, i) => {
            const p = fr(t * 0.9 + i / 7);
            const [x, y] = pointAlong(CHANNEL, p);
            return <Spark key={i} x={x} y={y} r={5} color="pot" opacity={cyc(p) * win(t, tS + 0.05, tS + 2.6, 0.2, 0.8)} />;
          })}
          <g opacity={win(t, tS + 0.3, c3 + 0.3, 0.5, 0.6)}>
            <Arrow x1={1064} y1={690} x2={1064} y2={540} color="cyan" width={6} />
            <Label x={1090} y={600} anchor="start" size={34} color={C.cyan} font="serif" italic weight={600}>
              I
            </Label>
            <Label x={1090} y={642} anchor="start" size={20} color={C.cyan} font="mono">
              arus ↑
            </Label>
            <Label x={790} y={600} anchor="end" size={22} color={C.pot} font="mono">
              e⁻ ↓
            </Label>
          </g>

          {/* guntur: cincin kejut dari kanal yang memuai mendadak */}
          {[0, 1, 2].map((k) => {
            const u = (t - tBoom - k * 0.38) / 2.4;
            if (u <= 0 || u >= 1) return null;
            return <circle key={k} cx={chMid[0]} cy={chMid[1]} r={30 + 820 * u} fill="none" stroke="#dfe6ff" strokeWidth={8 * (1 - u) + 1} opacity={Math.min(1, u * 8) * (1 - u) * 0.6} />;
          })}
          <Ripple x={chMid[0]} y={chMid[1]} p={(t - tBoom) / 1.2} r={200} color="press" rings={2} />
        </g>

        {/* inset kiri: (A) tumbukan es–graupel memisahkan muatan, (B) udara terionisasi */}
        <g opacity={inset}>
          <line x1={IX + IR * 0.8} y1={IY - IR * 0.6} x2={650} y2={380} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 7" opacity={0.6 * insA} />
          <circle cx={IX} cy={IY} r={IR} fill="#0c1430" stroke="#7d8fcc" strokeWidth={2.5} />
          <g clipPath="url(#lt-ins)">
            <g opacity={insA * fadeC}>
              {/* graupel turun, es naik; setelah bersentuhan: es +, graupel − */}
              {(() => {
                const iy = IY + 95 - 190 * qc;
                const gy = IY - 95 + 190 * qc;
                return (
                  <g>
                    <circle cx={IX + 18} cy={gy} r={30} fill="#a9b4cf" stroke="#e8eeff" strokeWidth={2} />
                    <Ice x={IX - 22} y={iy} r={18} o={1} rot={t * 50} />
                    <Q x={IX + 18} y={gy} pos={false} r={11} o={meet} />
                    <Q x={IX - 22} y={iy - 30} pos r={10} o={meet} />
                    <Arrow x1={IX + 70} y1={gy - 20} x2={IX + 70} y2={gy + 25} color="pot" width={3} pulse={false} opacity={0.7} />
                    <Arrow x1={IX - 72} y1={iy + 20} x2={IX - 72} y2={iy - 25} color="heat" width={3} pulse={false} opacity={0.7} />
                  </g>
                );
              })()}
              <Ripple x={IX} y={IY} p={(qc - 0.46) / 0.4} r={70} color="white" rings={2} width={2} />
            </g>
            <g opacity={insB}>
              {/* molekul udara: elektron (biru) tertarik turun (berlawanan E), ion + (hijau) tertinggal */}
              {[0, 1, 2, 3].map((k) => {
                const q = fr(t / 2.6 + k * 0.27);
                const mx = IX - 60 + (k % 2) * 110 + 6 * Math.sin(t + k);
                const my = IY - 50 + Math.floor(k / 2) * 80 + 4 * Math.cos(t * 1.3 + k);
                const ion = ramp(q, 0.3, 0.45);
                return (
                  <g key={k}>
                    <circle cx={mx - 10} cy={my} r={13} fill={C.work} opacity={0.25 + 0.6 * ion} />
                    <circle cx={mx + 10} cy={my} r={13} fill="#7f8bb0" opacity={0.85 * (1 - ion) + 0.2} />
                    <circle cx={mx - 10} cy={my} r={13} fill="#7f8bb0" opacity={0.85 * (1 - ion)} />
                    <Spark x={mx + 4} y={my + 18 + Math.max(0, q - 0.35) * 220} r={4.5} color="pot" opacity={cyc(q)} />
                  </g>
                );
              })}
              <Arrow x1={IX + 100} y1={IY + 60} x2={IX + 100} y2={IY - 60} color="force" width={4} pulse={false} />
            </g>
          </g>
          <Label x={IX} y={IY + IR + 30} size={22} color={C.ink} opacity={insA}>
            es naik → +  ·  graupel turun → −
          </Label>
          <Label x={IX} y={IY + IR + 30} size={22} color={C.ink} opacity={insB}>
            udara terionisasi → penghantar
          </Label>
        </g>

        {/* panel kanan (3): batang suhu */}
        <g opacity={s3}>
          <rect x={BX - 30} y={330} width={BW + 60} height={300} rx={18} fill="#0e1736" fillOpacity={0.9} stroke={C.press} strokeOpacity={0.45} strokeWidth={2} />
          <Label x={BX} y={366} anchor="start" size={22} color={C.muted} font="mono" spacing={2}>
            SUHU
          </Label>
          <Label x={BX} y={412} anchor="start" size={24} color={C.gold}>
            permukaan Matahari ≈ 5800 K
          </Label>
          <rect x={BX} y={432} width={BW} height={30} rx={8} fill="#1a2550" />
          <rect x={BX} y={432} width={sunW * pSun} height={30} rx={8} fill={C.gold} opacity={0.9} />
          <Label x={BX} y={500} anchor="start" size={24} color={C.press}>
            kanal petir ≈ 30 000 K
          </Label>
          <rect x={BX} y={520} width={BW} height={34} rx={8} fill="#1a2550" />
          <rect x={BX} y={520} width={BW * pBolt} height={34} rx={8} fill={C.press} opacity={0.85 + 0.15 * Math.sin(t * 6)} />
          {[1, 2, 3, 4].map((k) => (
            <line key={k} x1={BX + sunW * k} y1={522} x2={BX + sunW * k} y2={552} stroke="#0e1736" strokeWidth={3} opacity={five} />
          ))}
          <Label x={BX + BW / 2} y={596} size={34} color={C.ink} weight={700} opacity={five}>
            ≈ 5 × lebih panas
          </Label>
          <Twinkles x={BX + BW / 2} y={537} rx={200} ry={20} n={4} color="press" opacity={five} seed={3} />
        </g>
        <Motes x={860} y={340} rx={420} ry={150} n={26} color="pot" opacity={0.35} seed={4} />
      </Stage>

      {/* panel kanan (0–2): HTML di luar Stage */}
      <Note x={1600} y={400} p={s0}>
        <div>
          awan atas: <span style={{color: C.heat}}>+</span>
        </div>
        <div>
          awan bawah: <span style={{color: C.pot}}>−</span>
        </div>
      </Note>
      <Formula x={1610} y={400} p={s1} accent={C.spr} size={56} caption="1 MV = 1 juta volt">
        Δ<V color={C.spr}>V</V> ≈ ratusan MV
      </Formula>
      <Formula x={1610} y={400} p={s2} accent={C.cyan} caption="puluhan ribu ampere">
        <V color={C.cyan}>I</V> ≈ 30 kA
      </Formula>
      <Note x={90} y={470} p={win(t, Math.min(tBoom + 0.3, tGuntur - 0.4), dur + 5)} color={C.press} anchor="left" size={26}>
        <div>udara memuai mendadak</div>
        <div style={{color: C.muted}}>→ gelombang kejut → guntur</div>
      </Note>
    </AbsoluteFill>
  );
};
