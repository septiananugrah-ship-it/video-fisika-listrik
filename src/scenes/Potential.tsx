import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp, smoothPath} from '../anim';
import {Arrow, Formula, Frac, Glow, Label, Motes, Ripple, Spark, Stage, Stream, Sub, Tint, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Potensial (AUDIT): V = U/q, 1 V = 1 J/C; muatan + bergerak ke V rendah; beda potensial = tegangan.
// Bukit potensial = V(r) ∝ 1/r di sekitar muatan + (dilunakkan di puncak).

type P = [number, number];
const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));

// ---------- bukit potensial (proyeksi miring) ----------
const fV = (r: number) => 1 / Math.sqrt(r * r + 0.06);
const F0 = fV(0);
const F1 = fV(1.45);
const hn = (x: number, z: number) => (fV(Math.hypot(x, z)) - F1) / (F0 - F1);
const proj = (x: number, z: number, lift = 0): P => [960 + 470 * x, 610 + 175 * z - 330 * hn(x, z) - lift];

const NG = 17;
const MESH_Z = Array.from({length: NG}, (_, i) => {
  const z = -1 + (2 * i) / (NG - 1);
  return smoothPath(Array.from({length: 41}, (_, k) => proj(-1 + k / 20, z)));
});
const MESH_X = Array.from({length: NG}, (_, i) => {
  const x = -1 + (2 * i) / (NG - 1);
  return smoothPath(Array.from({length: 41}, (_, k) => proj(x, -1 + k / 20)));
});
const RINGS = [0.2, 0.38, 0.62].map((r) => smoothPath(Array.from({length: 73}, (_, k) => proj(r * Math.cos((k / 72) * 2 * Math.PI), r * Math.sin((k / 72) * 2 * Math.PI)))));
const PA = proj(0.2 * Math.cos(0.5), 0.2 * Math.sin(0.5));
const PB = proj(0.62 * Math.cos(0.35), 0.62 * Math.sin(0.35));

// ---------- medan seragam (baris 0–1) ----------
const XL = 250; // pelat +
const XR = 1010; // pelat −

export const Potential: React.FC = () => {
  const {t, cue, cueEnd, wordOf} = useScene();

  const part1 = Math.min(ramp(t, -0.4, 0.8), 1 - ramp(t, cue(2) - 0.4, cue(2) + 0.4, EASE_IN_OUT));
  const part2 = ramp(t, cue(2) - 0.1, cue(2) + 1.0);

  // dorong muatan melawan medan
  const s = ramp(t, wordOf(0, 'memindahkan') + 0.2, cueEnd(0) + 0.4, EASE_IN_OUT);
  const cx = mix(900, 400, s) + 3 * Math.sin(t * 3.1);
  const cy = 540 + 5 * Math.sin(t * 1.7);
  const moving = Math.min(ramp(t, wordOf(0, 'memindahkan'), wordOf(0, 'memindahkan') + 0.4), 1 - ramp(t, cueEnd(0) + 0.1, cueEnd(0) + 0.7, EASE_IN_OUT));
  const uH = 360 * s;
  const vShade = ramp(t, wordOf(1, 'potensial') - 0.4, wordOf(1, 'potensial') + 0.8);

  // tegangan
  const tBeda = wordOf(3, 'beda');
  const vm = ramp(t, tBeda - 0.8, tBeda + 0.3);
  const bob = 34 * Math.sin(Math.max(0, t - tBeda) * 1.3) * ramp(t, tBeda, tBeda + 1.2);

  const tBola = wordOf(2, 'bola');

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <linearGradient id="pot-shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.spr} stopOpacity={0.5} />
            <stop offset="100%" stopColor={C.spr} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="pot-mesh" gradientUnits="userSpaceOnUse" x1="0" y1="270" x2="0" y2="800">
            <stop offset="0%" stopColor="#f0d8ff" />
            <stop offset="35%" stopColor={C.spr} />
            <stop offset="100%" stopColor="#3b2a78" />
          </linearGradient>
          <linearGradient id="pot-plp" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7a1e2c" />
            <stop offset="100%" stopColor={C.heat} />
          </linearGradient>
          <linearGradient id="pot-pln" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.pot} />
            <stop offset="100%" stopColor="#173a6a" />
          </linearGradient>
        </defs>

        {/* ===================== bagian 1: usaha melawan medan ===================== */}
        <g opacity={part1}>
          <rect x={XL + 30} y={310} width={XR - XL - 34} height={460} fill="url(#pot-shade)" opacity={vShade} />
          {Array.from({length: 7}, (_, i) => {
            const y = 340 + i * 66;
            return (
              <g key={i}>
                <line x1={XL + 40} y1={y} x2={XR - 10} y2={y} stroke={C.force} strokeWidth={2} opacity={0.45} />
                {[0, 1].map((k) => {
                  const ph = (t * 0.35 + k / 2 + i * 0.13) % 1;
                  return <circle key={k} cx={mix(XL + 44, XR - 14, ph)} cy={y} r={3.6} fill="#fff6d0" opacity={cyc(ph) * 0.7} />;
                })}
                <path d={`M${640 + 10},${y} l-16,-9 l5,9 l-5,9 Z`} fill={C.force} opacity={0.6} />
              </g>
            );
          })}
          {/* garis ekuipotensial */}
          {[420, 580, 740, 900].map((x, i) => (
            <line key={x} x1={x} y1={318} x2={x} y2={762} stroke={C.spr} strokeWidth={2.5} strokeDasharray="10 9" strokeDashoffset={-t * 12} opacity={vShade * (0.75 - i * 0.12)} />
          ))}
          <Label x={420} y={800} size={28} weight={600} color={C.spr} opacity={vShade}>
            V tinggi
          </Label>
          <Label x={900} y={800} size={28} weight={600} color={C.spr} opacity={vShade * 0.8}>
            V rendah
          </Label>
          <rect x={XL - 6} y={300} width={34} height={480} rx={8} fill="url(#pot-plp)" stroke={C.heat} strokeWidth={2} />
          <rect x={XR - 6} y={300} width={34} height={480} rx={8} fill="url(#pot-pln)" stroke={C.pot} strokeWidth={2} />
          {Array.from({length: 7}, (_, i) => (
            <g key={i}>
              <Label x={XL - 34} y={340 + i * 66} size={28} weight={700} color={C.heat}>
                +
              </Label>
              <Label x={XR + 50} y={340 + i * 66} size={32} weight={700} color={C.pot}>
                −
              </Label>
            </g>
          ))}
          <Label x={640} y={262} size={30} weight={600} color={C.force}>
            medan <tspan fontFamily={FONT.serif} fontStyle="italic">E</tspan> →
          </Label>

          {/* muatan + dan gaya */}
          <Glow x={cx} y={cy} r={110} color="heat" />
          <Arrow x1={cx - 26} y1={cy} x2={cx - 140} y2={cy} color="ink" width={6} opacity={moving} />
          <Arrow x1={cx + 26} y1={cy} x2={cx + 140} y2={cy} color="force" width={6} opacity={Math.max(moving, 0.35)} />
          <Label x={cx - 84} y={cy - 34} size={26} color={C.ink} opacity={moving}>
            dorongan
          </Label>
          <Label x={cx + 84} y={cy - 34} size={28} font="serif" italic weight={600} color={C.force}>
            qE
          </Label>
          <circle cx={cx} cy={cy} r={24} fill={C.heat} stroke="#fff" strokeOpacity={0.5} strokeWidth={2} />
          <line x1={cx - 11} y1={cy} x2={cx + 11} y2={cy} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
          <line x1={cx} y1={cy - 11} x2={cx} y2={cy + 11} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
          {/* garis gerak */}
          {[0, 1, 2].map((k) => (
            <line key={k} x1={cx + 34} y1={cy - 12 + k * 12} x2={cx + 34 + 50 * moving} y2={cy - 12 + k * 12} stroke={C.ink} strokeWidth={2} opacity={0.3 * moving} />
          ))}
          <line x1={900} y1={590} x2={cx} y2={590} stroke={C.kin} strokeWidth={2} strokeDasharray="6 8" opacity={0.6 * ramp(s, 0.02, 0.1)} />

          {/* batang energi U */}
          <rect x={1120} y={400} width={70} height={360} rx={14} fill="#0d1430" stroke={C.kin} strokeWidth={2.5} />
          <rect x={1128} y={752 - uH * 0.98} width={54} height={uH * 0.98} rx={10} fill={C.kin} opacity={0.88} />
          {Array.from({length: 4}, (_, i) => {
            const ph = (t * 0.5 + i / 4) % 1;
            return <circle key={i} cx={1140 + ((i * 17) % 32)} cy={752 - ph * uH * 0.95} r={4} fill="#fff" opacity={cyc(ph) * 0.5 * ramp(s, 0.05, 0.2)} />;
          })}
          <Label x={1155} y={366} size={36} font="serif" italic weight={600} color={C.kin}>
            U
          </Label>
          <Label x={1155} y={800} size={24} color={C.kin}>
            tersimpan
          </Label>
          <Stream
            pts={[
              [cx, cy - 30],
              [mix(cx, 1155, 0.5), 330],
              [1155, 752 - uH],
            ]}
            color="kin"
            n={9}
            speed={0.8}
            opacity={moving}
          />
          <Twinkles x={1155} y={760 - uH} rx={50} ry={30} n={4} color="kin" opacity={ramp(t, cueEnd(0), cueEnd(0) + 0.6) * part1} />
        </g>

        {/* ===================== bagian 2: bukit potensial ===================== */}
        <g opacity={part2} transform={`translate(0,${bob})`}>
          <Glow x={960} y={330} r={300} color="spr" opacity={0.55} />
          {MESH_Z.map((d, i) => (
            <path key={`z${i}`} d={d} fill="none" stroke="url(#pot-mesh)" strokeWidth={1.6} opacity={0.32 + 0.3 * (i / NG)} />
          ))}
          {MESH_X.map((d, i) => (
            <path key={`x${i}`} d={d} fill="none" stroke="url(#pot-mesh)" strokeWidth={1.6} opacity={0.45} />
          ))}
          {RINGS.map((d, i) => (
            <path key={`r${i}`} d={d} fill="none" stroke={C.spr} strokeWidth={3.2} strokeDasharray="12 8" strokeDashoffset={-t * 18 * (i % 2 ? 1 : -1)} opacity={0.85} />
          ))}
          {/* muatan + di puncak */}
          <Glow x={960} y={262} r={90} color="heat" />
          <circle cx={960} cy={262} r={16} fill={C.heat} stroke="#fff" strokeOpacity={0.6} strokeWidth={2} />
          <line x1={952} y1={262} x2={968} y2={262} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
          <line x1={960} y1={254} x2={960} y2={270} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
          <Label x={1060} y={228} size={30} weight={600} color={C.spr}>
            V tinggi
          </Label>
          <Label x={1530} y={690} size={30} weight={600} color={C.spr} opacity={0.85}>
            V rendah
          </Label>

          {/* bola bermuatan + menggelinding turun */}
          {[0.25, 1.05, 1.85, 2.65].map((th, k) => {
            const per = 3.4;
            const ph = (((t - tBola + 0.6 + k * 0.85) / per) % 1 + 1) % 1;
            const on = ramp(t, tBola - 1.2 + k * 0.3, tBola - 0.4 + k * 0.3);
            const rr = 0.07 + 0.88 * ph * ph;
            const [x, y] = proj(rr * Math.cos(th), rr * Math.sin(th), 14);
            const trail: P[] = [1, 2, 3, 4].map((j) => {
              const q = Math.max(0, ph - j * 0.025);
              const r2 = 0.07 + 0.88 * q * q;
              return proj(r2 * Math.cos(th), r2 * Math.sin(th), 14);
            });
            return <Spark key={k} x={x} y={y} r={15} color="heat" trail={trail} opacity={on * Math.min(1, cyc(ph) * 1.6)} />;
          })}
          <Motes x={960} y={520} rx={520} ry={260} n={22} color="spr" opacity={0.35} seed={4} />

          {/* titik ukur A dan B */}
          <g opacity={vm}>
            <circle cx={PA[0]} cy={PA[1]} r={9} fill="#fff" stroke={C.spr} strokeWidth={3} />
            <circle cx={PB[0]} cy={PB[1]} r={9} fill="#fff" stroke={C.spr} strokeWidth={3} />
            <Label x={PA[0] - 34} y={PA[1] - 26} size={32} font="serif" italic weight={600} color={C.spr}>
              A
            </Label>
            <Label x={PB[0] - 30} y={PB[1] + 34} size={32} font="serif" italic weight={600} color={C.spr}>
              B
            </Label>
            <path d={`M${PA[0]},${PA[1]} C${PA[0] + 220},${PA[1] - 160} 1520,300 1600,${448 - bob}`} fill="none" stroke={C.heat} strokeWidth={4} opacity={0.85} />
            <path d={`M${PB[0]},${PB[1]} C${PB[0] + 180},${PB[1] + 40} 1640,640 1690,${448 - bob}`} fill="none" stroke="#c8cfe6" strokeWidth={4} opacity={0.85} />
            <Ripple x={PA[0]} y={PA[1]} p={ramp(t, tBeda - 0.4, tBeda + 1.2)} r={70} color="spr" />
            <Ripple x={PB[0]} y={PB[1]} p={ramp(t, tBeda - 0.2, tBeda + 1.4)} r={70} color="spr" />
          </g>
          <Label x={360} y={700 - 0} size={24} color={C.muted} opacity={vm} anchor="middle">
            acuan 0 V bergeser…
          </Label>
          <line x1={250} y1={740} x2={470} y2={740} stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" opacity={vm * 0.7} />
        </g>

        {/* voltmeter (tidak ikut bergeser: bacaannya tetap) */}
        <g opacity={vm * part2}>
          <Glow x={1645} y={400} r={170} color="spr" opacity={0.4} />
          <rect x={1530} y={290} width={230} height={190} rx={22} fill="#141d40" stroke={C.spr} strokeWidth={3} />
          <rect x={1552} y={312} width={186} height={86} rx={10} fill="#0a1022" stroke="#2c3a6c" strokeWidth={2} />
          <text x={1645} y={357} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontSize={44} fontWeight={600} fill={C.spr}>
            6,0 V
          </text>
          <circle cx={1600} cy={448} r={11} fill={C.heat} />
          <circle cx={1690} cy={448} r={11} fill="#c8cfe6" />
          <Label x={1645} y={448} size={30} weight={700} color={C.spr}>
            V
          </Label>
          <Twinkles x={1645} y={357} rx={110} ry={40} n={4} color="spr" opacity={ramp(t, tBeda + 0.5, tBeda + 1.2)} />
          <Label x={1645} y={250} size={26} color={C.spr}>
            tegangan = beda potensial
          </Label>
        </g>
      </Stage>

      {/* ===================== kartu rumus ===================== */}
      <Formula x={1520} y={290} p={slot(t, wordOf(1, 'potensial') - 0.2, wordOf(1, 'joule') - 1.2)} accent={C.spr} size={66} caption="potensial listrik = energi per muatan">
        <V color="spr">V</V> = <Frac n={<V color="kin">U</V>} d={<V color="heat">q</V>} />
      </Formula>
      <Formula x={1520} y={290} p={slot(t, wordOf(1, 'joule') - 1.2, cue(2) + 0.1)} accent={C.spr} size={62} caption="satuan potensial: volt">
        <Tint c="spr">1 V</Tint> = <Frac n={<Tint c="kin">1 J</Tint>} d={<Tint c="heat">1 C</Tint>} />
      </Formula>
      <Formula x={360} y={260} p={slot(t, tBeda - 0.3, cue(4) + 3)} accent={C.spr} size={58} caption="tegangan antara A dan B">
        Δ<V color="spr">V</V> = <V color="spr">V</V>
        <Sub color={C.spr}>A</Sub> − <V color="spr">V</V>
        <Sub color={C.spr}>B</Sub>
      </Formula>
    </AbsoluteFill>
  );
};
