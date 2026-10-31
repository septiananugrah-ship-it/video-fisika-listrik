import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp, rand} from '../anim';
import {Arrow, DrawPath, Formula, Frac, Glow, Label, Motes, Note, Ripple, Spark, Stage, Stream, Sub, Sup, Tint, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Atom hidrogen (AUDIT): a₀ = 0,0529 nm ("≈ 0,053"); U = −ke²/a₀ = −27,2 eV; K = +13,6 eV; E = U/2 = −13,6 eV = energi ionisasi H.
// Diagram energi: U(r) = −1,44 eV·nm / r. Skala: r 3400 px/nm, E 9,69 px/eV. Titik balik klasik di r = 2a₀ (U = E).
// Awan 1s: P(r) ∝ r² e^(−2r/a₀) → r = −(a₀/2)·ln(u₁u₂u₃) (distribusi gamma k = 3), a₀ = 88 px di awan.

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const TAU = Math.PI * 2;

// ---------- diagram energi ----------
const PL = 1080;
const PR = 1760;
const PT = 200;
const PB = 830;
const RX = 3400; // px/nm
const EY = 9.69; // px/eV
const Y0E = PT + 20 * EY; // E = 0
const rx = (r: number) => PL + r * RX;
const ey = (e: number) => Y0E - e * EY;
const U = (r: number) => -1.44 / r;
const A0 = 0.0529;
const XA = rx(A0);

// ---------- awan 1s ----------
const NCLOUD = 520;
const CLOUD = Array.from({length: NCLOUD}, (_, i) => ({per: 1.8 + rand(i * 3.1 + 1) * 1.6, off: rand(i * 5.7 + 2), blue: rand(i * 1.3 + 9) > 0.5}));
const cloudPt = (i: number, cy: number, a: number): [number, number] => {
  const s = i * 17.3 + cy * 101.7;
  const u1 = 0.002 + 0.998 * rand(s + 1);
  const u2 = 0.002 + 0.998 * rand(s + 2);
  const u3 = 0.002 + 0.998 * rand(s + 3);
  const r = -(a / 2) * Math.log(u1 * u2 * u3);
  const z = 2 * rand(s + 4) - 1;
  const ph = TAU * rand(s + 5);
  const q = Math.sqrt(1 - z * z);
  return [r * q * Math.cos(ph), r * q * Math.sin(ph)];
};

export const Hydrogen: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  const ph12 = 1 - ramp(t, cue(4) - 0.6, cue(4) - 0.05, EASE_IN_OUT);
  const ph3 = ramp(t, cue(4) - 0.3, cue(4) + 0.4);
  const diag = ramp(t, cue(2) - 0.2, cue(2) + 0.8);

  // ================= atom (fase 1–2) =================
  const move = ramp(t, cue(2) - 0.4, cue(2) + 1.0, EASE_IN_OUT);
  const AX = mix(960, 440, move);
  const AY = 480 + 5 * Math.sin(t * 0.8);
  const R = 170;
  const atomOn = ramp(t, 0.1, 1.1);
  const w = 1.1;
  const th = w * t;
  const ex = AX + R * Math.cos(th);
  const eyy = AY - R * Math.sin(th);
  const trail = Array.from({length: 9}, (_, k) => {
    const a = th - 0.07 * (k + 1);
    return [AX + R * Math.cos(a), AY - R * Math.sin(a)] as [number, number];
  });
  const lblOn = ramp(t, wordOf(0, 'elektron') - 0.3, wordOf(0, 'elektron') + 0.4);
  const pLbl = ramp(t, wordOf(0, 'proton') - 0.3, wordOf(0, 'proton') + 0.4);
  const forceOn = ramp(t, cue(1) - 0.2, cue(1) + 0.5);
  const holdOn = ramp(t, wordOf(1, 'menahan') - 0.3, wordOf(1, 'menahan') + 0.5);
  const cardF = slot(t, cue(1) + 0.1, cue(2) - 0.3);
  const ux = (AX - ex) / R;
  const uy = (AY - eyy) / R;
  const a0On = ramp(t, wordOf(2, 'jarak') - 0.3, wordOf(2, 'jarak') + 0.5);
  const rays = Array.from({length: 12}, (_, i) => {
    const a = (i * TAU) / 12 + 0.13;
    return [
      [AX + 46 * Math.cos(a), AY + 46 * Math.sin(a)],
      [AX + 330 * Math.cos(a), AY + 330 * Math.sin(a)],
    ] as [number, number][];
  });

  // ================= diagram energi =================
  const curveP = ramp(t, cue(2) + 0.2, cue(2) + 1.8, EASE_IN_OUT);
  const curvePts: [number, number][] = [];
  for (let r = 0.032; r <= 0.2001; r += 0.002) curvePts.push([rx(r), ey(U(r))]);
  const curveD = curvePts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const uOn = ramp(t, wordOf(2, 'minus') - 0.4, wordOf(2, 'minus') + 0.4);
  const kOn = ramp(t, wordOf(3, 'kinetik') - 0.4, wordOf(3, 'kinetik') + 0.5, EASE_IN_OUT);
  const eOn = ramp(t, wordOf(3, 'totalnya') - 0.3, wordOf(3, 'totalnya') + 0.5);
  const ionOn = ramp(t, wordOf(3, 'mengionkan') - 0.6, wordOf(3, 'mengionkan') + 0.4, EASE_IN_OUT);
  const cardU = slot(t, wordOf(2, 'energi') - 0.2, cue(3) + 0.2);
  const cardE = slot(t, cue(3) + 0.3, cue(4) - 0.4);
  const XT = rx(2 * A0); // titik balik klasik
  const XI = 1400;
  // elektron pada garis E: bergetar kecil di sekitar a₀
  const eDotX = XA + 10 * Math.sin(t * 2.2);
  const ionPh = ((t - wordOf(3, 'mengionkan')) / 1.6) % 1;
  const ionDot = t > wordOf(3, 'mengionkan') ? ionPh : -1;

  // ================= fase 3: spiral klasik → awan kuantum =================
  const SCX = 760;
  const SCY = 490;
  const R0 = 220;
  const tSp = wordOf(4, 'Mengapa') + 0.2;
  const tSpEnd = wordOf(4, 'inti') + 0.6;
  const uS = ramp(t, tSp, tSpEnd, (x) => x);
  const TH0 = 0.4;
  const THM = TAU * 4.5;
  const spPt = (u: number): [number, number] => {
    const r = R0 * Math.cbrt(Math.max(0, 1 - u));
    const a = TH0 + THM * (1 - Math.sqrt(Math.max(0, 1 - u)));
    return [SCX + r * Math.cos(a), SCY - r * Math.sin(a)];
  };
  const spPts: [number, number][] = [];
  const NS = 260;
  for (let k = 0; k <= NS; k++) {
    const u = (k / NS) * Math.min(uS, 0.995);
    spPts.push(spPt(u));
  }
  const spD = spPts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const eSp = spPt(Math.min(uS, 0.995));
  const eSpTrail = Array.from({length: 8}, (_, k) => spPt(Math.max(0, Math.min(uS, 0.995) - 0.012 * (k + 1))));
  const qOn = ramp(t, wordOf(4, 'Mengapa') - 0.3, wordOf(4, 'Mengapa') + 0.4);
  const tX = wordOf(4, 'klasik');
  const xP1 = ramp(t, tX - 0.1, tX + 0.4, EASE_IN_OUT);
  const xP2 = ramp(t, tX + 0.25, tX + 0.75, EASE_IN_OUT);
  const tQ = wordOf(4, 'Jawabannya');
  const dissolve = ramp(t, tQ - 0.4, tQ + 1.2, EASE_IN_OUT);
  const cloudOn = ramp(t, tQ - 0.2, tQ + 1.6, EASE_IN_OUT);
  const qmOn = ramp(t, wordOf(4, 'mekanika') - 0.3, wordOf(4, 'mekanika') + 0.5);
  const classLbl = ramp(t, tX - 0.2, tX + 0.4) * (1 - dissolve);
  const radPhases = [0, 1, 2].map((k) => (t > tSp ? ((t - tSp) / 0.75 + k / 3) % 1 : -1));

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <radialGradient id="hy-cloud">
            <stop offset="0%" stopColor="#c9b6ff" stopOpacity="0.75" />
            <stop offset="25%" stopColor={C.spr} stopOpacity="0.45" />
            <stop offset="60%" stopColor={C.pot} stopOpacity="0.14" />
            <stop offset="100%" stopColor={C.pot} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hy-shade" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        {/* ============ fase 1–2: atom ============ */}
        {ph12 > 0.001 ? (
          <g opacity={ph12 * atomOn}>
            <Motes x={AX} y={AY} rx={330} ry={280} n={24} color="ink" opacity={0.35} seed={2} />
            {/* garis medan proton: keluar dari + */}
            <g opacity={0.55}>
              {rays.map((pts, i) => (
                <line key={i} x1={pts[0][0]} y1={pts[0][1]} x2={pts[1][0]} y2={pts[1][1]} stroke={C.force} strokeWidth={1.6} opacity={0.22} />
              ))}
              {rays.map((pts, i) => (
                <Stream key={`s${i}`} pts={pts} color="force" n={2} speed={0.35} r={2.6} jitter={0} seed={i} />
              ))}
            </g>
            <circle cx={AX} cy={AY} r={R} fill="none" stroke={C.pot} strokeWidth={1.8} strokeDasharray="5 9" opacity={0.45} />
            <Glow x={AX} y={AY} r={110} color="heat" opacity={0.8} />
            <circle cx={AX} cy={AY} r={30} fill={C.heat} />
            <circle cx={AX} cy={AY} r={30} fill="url(#hy-shade)" />
            <text x={AX} y={AY + 1} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={700} fill="#fff" fontFamily="Inter">
              +
            </text>
            {/* tali tarik Coulomb */}
            <line x1={AX} y1={AY} x2={ex} y2={eyy} stroke={C.force} strokeWidth={3} opacity={holdOn * (0.25 + 0.2 * Math.sin(t * 5))} />
            <Spark x={ex} y={eyy} r={11} color="pot" trail={trail} />
            <g opacity={forceOn}>
              <Arrow x1={ex + ux * 18} y1={eyy + uy * 18} x2={ex + ux * 92} y2={eyy + uy * 92} color="force" width={5} pulse={false} />
            </g>
            <Label x={AX} y={AY + 62} size={26} color={C.heat} weight={600} opacity={pLbl}>
              proton
            </Label>
            <Label x={ex + 44 * Math.cos(th)} y={eyy - 44 * Math.sin(th)} size={24} color={C.pot} weight={600} opacity={lblOn * (1 - a0On)}>
              e⁻
            </Label>
            <Label x={AX} y={AY - R - 50} size={26} color={C.pot} opacity={lblOn * (1 - a0On)}>
              satu elektron
            </Label>
            {/* a₀ */}
            <g opacity={a0On}>
              <line x1={AX} y1={AY} x2={ex} y2={eyy} stroke={C.ink} strokeWidth={2.5} strokeDasharray="6 5" />
              <Label x={AX} y={AY - R - 52} size={30} weight={600} font="mono">
                a₀ ≈ 0,053 nm
              </Label>
            </g>
          </g>
        ) : null}

        {/* ============ diagram energi U(r) ============ */}
        {ph12 * diag > 0.001 ? (
          <g opacity={ph12 * diag}>
            <rect x={PL - 140} y={PT - 30} width={PR - PL + 180} height={PB - PT + 50} rx={18} fill="#0a1230" opacity={0.55} />
            <line x1={PL} y1={PT} x2={PL} y2={PB} stroke={C.muted} strokeWidth={2} />
            <line x1={PL} y1={Y0E} x2={PR} y2={Y0E} stroke={C.muted} strokeWidth={2} />
            <Label x={PL + 14} y={PT + 4} size={22} color={C.muted} anchor="start" font="sans">
              E (eV)
            </Label>
            <Label x={PR + 4} y={Y0E - 22} size={24} color={C.muted} anchor="end" font="serif" italic>
              r
            </Label>
            {[
              [0, '0'],
              [-13.6, '−13,6'],
              [-27.2, '−27,2'],
            ].map(([e, s]) => (
              <g key={s as string}>
                <line x1={PL - 8} y1={ey(e as number)} x2={PL} y2={ey(e as number)} stroke={C.muted} strokeWidth={2} />
                <Label x={PL - 14} y={ey(e as number)} size={22} color={C.ink} anchor="end" font="mono">
                  {s}
                </Label>
              </g>
            ))}
            {/* sumur −ke²/r */}
            <path d={`${curveD} L${PR},${PB} L${rx(0.032)},${PB} Z`} fill={C.spr} opacity={0.07 * curveP} />
            <DrawPath d={curveD} p={curveP} stroke="spr" width={5} halo />
            <Label x={1640} y={440} size={28} color={C.spr} weight={600} opacity={curveP} font="serif" italic>
              U(r)
            </Label>
            {/* a₀ */}
            <line x1={XA} y1={Y0E} x2={XA} y2={ey(-27.2)} stroke={C.ink} strokeWidth={2} strokeDasharray="5 6" opacity={0.6 * a0On} />
            <Label x={XA} y={Y0E - 26} size={24} font="serif" italic opacity={a0On}>
              a₀
            </Label>
            {/* U di a₀ */}
            <g opacity={uOn}>
              <Glow x={XA} y={ey(-27.2)} r={50} color="spr" />
              <circle cx={XA} cy={ey(-27.2)} r={8} fill={C.spr} />
              <Label x={XA + 22} y={ey(-27.2) + 34} size={26} color={C.spr} anchor="start" weight={600}>
                U = −27,2 eV
              </Label>
            </g>
            {/* K ke atas */}
            <g opacity={kOn}>
              <Arrow x1={XA} y1={ey(-27.2) - 8} x2={XA} y2={ey(-27.2) + (ey(-13.6) - ey(-27.2)) * kOn + 4} color="kin" width={6} />
              <Label x={XA - 18} y={(ey(-27.2) + ey(-13.6)) / 2} size={24} color={C.kin} anchor="end" weight={600}>
                K = +13,6 eV
              </Label>
            </g>
            {/* E total */}
            <g opacity={eOn}>
              <line x1={PL} y1={ey(-13.6)} x2={PL + (XT - PL) * eOn} y2={ey(-13.6)} stroke={C.gold} strokeWidth={4} />
              <line x1={XT} y1={ey(-13.6)} x2={PR} y2={ey(-13.6)} stroke={C.gold} strokeWidth={2} strokeDasharray="6 8" opacity={0.4} />
              <Label x={PL + 40} y={ey(-13.6) - 24} size={26} color={C.gold} weight={600} anchor="start">
                E
              </Label>
              <Spark x={eDotX} y={ey(-13.6)} r={10} color="pot" />
              <Twinkles x={XA} y={ey(-13.6)} rx={120} ry={40} n={4} color="gold" seed={5} />
            </g>
            {/* ionisasi */}
            <g opacity={ionOn}>
              <Arrow x1={XI} y1={ey(-13.6) - 6} x2={XI} y2={ey(-13.6) - 6 - (ey(-13.6) - Y0E - 10) * ionOn} color="work" width={6} />
              <Label x={XI + 20} y={455} size={24} color={C.work} anchor="start" weight={600}>
                ionisasi: 13,6 eV
              </Label>
              {ionDot >= 0 ? <Spark x={XI} y={mix(ey(-13.6), Y0E - 60, ionDot)} r={7} color="pot" opacity={cyc(ionDot)} /> : null}
            </g>
          </g>
        ) : null}

        {/* ============ fase 3: spiral klasik → awan kuantum ============ */}
        {ph3 > 0.001 ? (
          <g opacity={ph3}>
            <Motes x={SCX} y={SCY} rx={320} ry={260} n={24} color="spr" opacity={0.4} seed={8} />
            {/* awan 1s */}
            <g opacity={cloudOn}>
              <circle cx={SCX} cy={SCY} r={300 * (1 + 0.03 * Math.sin(t * 1.3))} fill="url(#hy-cloud)" />
              {CLOUD.map((c, i) => {
                const raw = t / c.per + c.off;
                const cy = Math.floor(raw);
                const ph = raw - cy;
                const [dx, dy] = cloudPt(i, cy, 88);
                return <circle key={i} cx={SCX + dx} cy={SCY + dy} r={2.4} fill={c.blue ? '#8fc6ff' : '#cdb4ff'} opacity={0.85 * cyc(ph)} />;
              })}
            </g>
            {/* spiral klasik */}
            <g opacity={1 - dissolve}>
              <circle cx={SCX} cy={SCY} r={R0} fill="none" stroke={C.pot} strokeWidth={1.5} strokeDasharray="4 9" opacity={0.35} />
              <path d={spD} fill="none" stroke={C.pot} strokeWidth={3} opacity={0.7} strokeLinecap="round" />
              {radPhases.map((p, k) => (
                <Ripple key={k} x={spPt(Math.min(uS, 0.99))[0]} y={spPt(Math.min(uS, 0.99))[1]} p={uS < 0.97 ? p : 2} r={90} color="force" rings={2} width={2} />
              ))}
              <Spark x={eSp[0]} y={eSp[1]} r={10} color="pot" trail={uS > 0 && uS < 1 ? eSpTrail : undefined} opacity={1 - ramp(t, tSpEnd - 0.1, tSpEnd + 0.3)} />
              <Ripple x={SCX} y={SCY} p={(t - tSpEnd + 0.1) / 1.0} r={140} color="heat" />
              <DrawPath d={`M${SCX - 250},${SCY - 250} L${SCX + 250},${SCY + 250}`} p={xP1} stroke="heat" width={12} halo />
              <DrawPath d={`M${SCX + 250},${SCY - 250} L${SCX - 250},${SCY + 250}`} p={xP2} stroke="heat" width={12} halo />
            </g>
            <Glow x={SCX} y={SCY} r={70} color="heat" opacity={0.8} />
            <circle cx={SCX} cy={SCY} r={20} fill={C.heat} />
            <circle cx={SCX} cy={SCY} r={20} fill="url(#hy-shade)" />
            <Label x={SCX} y={SCY + 300} size={28} color={C.heat} weight={600} opacity={classLbl}>
              fisika klasik: elektron memancar → spiral jatuh
            </Label>
            <Label x={SCX} y={SCY + 300} size={28} color="#cdb4ff" weight={600} opacity={cloudOn}>
              awan elektron 1s
            </Label>
            {/* tanda tanya */}
            <g opacity={qOn} transform={`translate(1330 400) scale(${1 + 0.04 * Math.sin(t * 2)}) rotate(${4 * Math.sin(t * 1.1)})`}>
              <Glow x={0} y={0} r={170} color="gold" opacity={0.5} />
              <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fontSize={230} fontWeight={700} fill={C.gold} fontFamily="Space Grotesk">
                ?
              </text>
            </g>
            <Twinkles x={1330} y={640} rx={240} ry={60} n={6} color="spr" opacity={qmOn} seed={4} />
          </g>
        ) : null}
      </Stage>

      {/* ============ kartu HTML ============ */}
      <Formula x={960} y={790} p={cardF} accent={C.force} size={60} caption="gaya Coulomb proton–elektron">
        <V>F</V> = <Frac n={<><V>k</V><V>e</V><Sup>2</Sup></>} d={<><V>r</V><Sup>2</Sup></>} />
      </Formula>
      <Formula x={440} y={790} p={cardU} accent={C.spr} size={58} caption="energi potensial listrik pada r = a₀">
        <V>U</V> = −<Frac n={<><V>k</V><V>e</V><Sup>2</Sup></>} d={<><V>a</V><Sub>0</Sub></>} /> ≈ <Tint c="spr">−27,2 eV</Tint>
      </Formula>
      <Formula x={440} y={790} p={cardE} accent={C.gold} size={58} caption="= energi ionisasi atom hidrogen">
        <V>E</V> = <Tint c="kin"><V>K</V></Tint> + <Tint c="spr"><V>U</V></Tint> = <Tint c="gold">−13,6 eV</Tint>
      </Formula>
      <Note x={1330} y={650} p={qmOn * ph3} color={C.spr} size={40}>
        <span style={{color: '#cdb4ff'}}>mekanika kuantum</span>
      </Note>
    </AbsoluteFill>
  );
};
