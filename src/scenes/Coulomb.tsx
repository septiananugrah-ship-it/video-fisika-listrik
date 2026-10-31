import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, ramp, win} from '../anim';
import {Arrow, Formula, Frac, Glow, Label, Motes, Part, Ripple, Spark, Stage, Sub, Sup, TSup, Twinkles} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// 02 Hukum Coulomb (gerak analitik per frame):
// (0) neraca puntir Coulomb (1785): batang menggantung pada serat; bola bermuatan + ditolak bola tetap +,
//     batang berputar ke sudut setimbang dengan osilasi teredam δ(τ) = δ∞[1 − e^(−τ/1,8)·cos(2πτ/2,2)], tombol serat ikut terpuntir;
// (1–3) dua muatan + di lintasan: panah gaya keluar (tolak) dengan panjang ∝ q₁q₂/r² (skala sama sepanjang adegan);
//     q₂ dua kali → F dua kali; r × 2 → F/4; r/2 → 4F;
// (4) atom hidrogen: gaya listrik vs gravitasi ≈ 10³⁹ (AUDIT: 2,3×10³⁹) sebagai batang logaritmik yang tumbuh 39 dekade.
const lin = (x: number) => x;
const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));

const Charge: React.FC<{x: number; y: number; r: number; s: number; op?: number}> = ({x, y, r, s, op = 1}) =>
  op <= 0.001 ? null : (
    <g opacity={op}>
      <circle cx={x} cy={y} r={r * 2.6} fill={`url(#soft-${s > 0 ? 'heat' : 'pot'})`} />
      <circle cx={x} cy={y} r={r} fill={s > 0 ? C.heat : C.pot} stroke={s > 0 ? '#ffc2ca' : '#c8e4ff'} strokeWidth={r * 0.08} />
      <circle cx={x - r * 0.32} cy={y - r * 0.36} r={r * 0.34} fill="#fff" opacity={0.3} />
      <line x1={x - r * 0.45} y1={y} x2={x + r * 0.45} y2={y} stroke="#fff" strokeWidth={r * 0.16} strokeLinecap="round" />
      {s > 0 ? <line x1={x} y1={y - r * 0.45} x2={x} y2={y + r * 0.45} stroke="#fff" strokeWidth={r * 0.16} strokeLinecap="round" /> : null}
    </g>
  );

// neraca puntir
const BX = 960;
const TOPY = 340;
const BOTY = 790;
const RODY = 610;
const RR = 175;
const PHI0 = 0.55;
const onRod = (phi: number, rr = RR): [number, number] => [BX + rr * Math.cos(phi), RODY + rr * 0.26 * Math.sin(phi)];

// lintasan muatan
const TY = 620;
const R0 = 400;
const L0 = 70;

// batang log
const LX0 = 880;
const LX1 = 1720;
const DEC = (LX1 - LX0) / 40;
const AX = 470;
const AY = 560;

export const Coulomb: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const c = [0, 1, 2, 3, 4].map(cue);
  const end = 1 - ramp(t, dur - 0.6, dur + 0.4, EASE_IN_OUT);

  // ---------- fase 0: neraca puntir ----------
  const ph0 = win(t, c[0] - 0.7, c[1] - 0.4, 0.7, 0.6);
  const charged = ramp(t, wordOf(0, 'neraca') - 0.4, wordOf(0, 'neraca') + 0.2);
  const tq = wordOf(0, 'neraca');
  const tau = Math.max(0, t - tq);
  const delta = 0.85 * (1 - Math.exp(-tau / 1.8) * Math.cos((2 * Math.PI * tau) / 2.2)) * (t > tq ? 1 : 0) + 0.015 * Math.sin(t * 1.7);
  const phi = PHI0 + 0.45 + delta;
  const [ax, ay] = onRod(phi);
  const [cwx, cwy] = onRod(phi + Math.PI);
  const [fx, fy] = onRod(PHI0);
  const lblA = ramp(t, wordOf(0, 'puntir') - 0.3, wordOf(0, 'puntir') + 0.4);
  const lblC = ramp(t, wordOf(0, 'coulomb') - 0.3, wordOf(0, 'coulomb') + 0.4);

  // ---------- fase 1–3: dua muatan ----------
  const ph1 = win(t, c[1] - 0.3, c[4] - 0.4, 0.7, 0.6);
  const qBump = win(t, wordOf(1, 'hasil') - 0.2, wordOf(1, 'berbanding') - 0.1, 0.6, 0.6);
  const q2 = 1 + qBump;
  const oscEnv = win(t, wordOf(1, 'terbalik') - 0.2, c[2] - 0.2, 0.6, 0.8);
  const r2x = ramp(t, wordOf(3, 'dua') - 0.4, wordOf(3, 'dua') + 0.6, EASE_IN_OUT) * (1 - ramp(t, wordOf(3, 'setengah') - 0.4, wordOf(3, 'setengah') + 0.6, EASE_IN_OUT));
  const rhalf = ramp(t, wordOf(3, 'setengah') - 0.4, wordOf(3, 'setengah') + 0.6, EASE_IN_OUT) * (1 - ramp(t, c[4] - 1.0, c[4] - 0.2, EASE_IN_OUT));
  const r = R0 * (1 + r2x - 0.5 * rhalf) + 150 * Math.sin((t - wordOf(1, 'terbalik')) * 1.6) * oscEnv + 12 * Math.sin(t * 1.1);
  const F = L0 * q2 * (R0 / r) ** 2;
  const xA = BX - r / 2;
  const xB = BX + r / 2;
  const rq2 = 30 * Math.sqrt(q2);
  const fQuart = ramp(t, wordOf(3, 'seperempat') - 0.4, wordOf(3, 'seperempat') + 0.3) * (1 - ramp(t, wordOf(3, 'setengah') - 0.3, wordOf(3, 'setengah') + 0.3, EASE_IN_OUT));
  const f4 = ramp(t, wordOf(3, 'empat', 1) - 0.4, wordOf(3, 'empat', 1) + 0.3);
  const f2 = qBump;
  const fBase = Math.max(0, 1 - fQuart - f4 - f2);
  const rl2 = r2x;
  const rlh = rhalf;
  const rl1 = Math.max(0, 1 - rl2 - rlh);
  const hasil = ramp(t, wordOf(1, 'hasil') - 0.3, wordOf(1, 'hasil') + 0.4);
  const kuad = ramp(t, wordOf(1, 'terbalik') - 0.3, wordOf(1, 'terbalik') + 0.4);
  const kPart = ramp(t, wordOf(1, 'F') - 0.3, wordOf(1, 'F') + 0.4);

  // ---------- fase 4: atom hidrogen, listrik vs gravitasi ----------
  const ph4 = ramp(t, c[4] - 0.3, c[4] + 0.6);
  const eL = ramp(t, wordOf(4, 'listrik') - 0.3, wordOf(4, 'listrik') + 0.4);
  const eG = ramp(t, wordOf(4, 'gravitasi') - 0.3, wordOf(4, 'gravitasi') + 0.4);
  const grow = ramp(t, wordOf(4, 'sepuluh') - 0.3, wordOf(4, 'sembilan') + 0.4, EASE_IN_OUT);
  const eG0 = ramp(t, wordOf(4, 'sepuluh') - 0.8, wordOf(4, 'sepuluh') - 0.1);
  const m = 39 * grow;
  const mf = Math.floor(m);
  const done = ramp(t, wordOf(4, 'sembilan') + 0.1, wordOf(4, 'sembilan') + 0.7);
  const ea = (t - c[4]) * 1.5;
  const rot = (u: number, v: number): [number, number] => [AX + u * Math.cos(-0.35) - v * Math.sin(-0.35), AY + u * Math.sin(-0.35) + v * Math.cos(-0.35)];
  const [ex, ey] = rot(185 * Math.cos(ea), 78 * Math.sin(ea));
  const eTrail = [1, 2, 3, 4, 5].map((k) => rot(185 * Math.cos(ea - k * 0.07), 78 * Math.sin(ea - k * 0.07)));
  const de = Math.hypot(ex - AX, ey - AY);
  const ux = (AX - ex) / de;
  const uy = (AY - ey) / de;

  return (
    <AbsoluteFill style={{opacity: end}}>
      <Stage>
        <defs>
          <linearGradient id="cl-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9fc4ff" stopOpacity={0.16} />
            <stop offset="30%" stopColor="#9fc4ff" stopOpacity={0.04} />
            <stop offset="80%" stopColor="#9fc4ff" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#9fc4ff" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <Motes x={960} y={520} rx={880} ry={330} n={30} color="force" opacity={0.3} seed={8} />

        {/* fase 0: neraca puntir */}
        <g opacity={ph0}>
          <Glow x={BX} y={RODY} r={420} color="pot" opacity={0.3} />
          {/* tabung atas + tombol puntir */}
          <rect x={BX - 16} y={196} width={32} height={TOPY - 196} fill="url(#cl-glass)" stroke="#9fb3e0" strokeOpacity={0.6} strokeWidth={2} />
          <ellipse cx={BX} cy={192} rx={44} ry={13} fill="#3b4a7a" stroke="#9fb3e0" strokeWidth={2} />
          <line x1={BX} y1={192} x2={BX + 40 * Math.cos(-delta * 2.2)} y2={192 + 12 * Math.sin(-delta * 2.2)} stroke={C.force} strokeWidth={3.5} strokeLinecap="round" />
          {/* serat */}
          <line x1={BX} y1={194} x2={BX} y2={RODY} stroke="#e8eeff" strokeWidth={1.8} opacity={0.85} />
          {/* tabung kaca */}
          <ellipse cx={BX} cy={BOTY} rx={220} ry={56} fill="#0d1838" stroke="#9fb3e0" strokeOpacity={0.6} strokeWidth={2.5} />
          {Array.from({length: 36}, (_, k) => {
            const a = (k / 36) * Math.PI * 2;
            if (Math.sin(a) < 0) return null;
            const [x1, y1] = [BX + 220 * Math.cos(a), RODY + 220 * 0.26 * Math.sin(a)];
            return <line key={k} x1={x1} y1={y1} x2={x1} y2={y1 + (k % 3 === 0 ? 16 : 9)} stroke="#cfe0ff" strokeOpacity={0.55} strokeWidth={2} />;
          })}
          <ellipse cx={BX} cy={RODY} rx={220} ry={57} fill="none" stroke="#cfe0ff" strokeOpacity={0.25} strokeWidth={2} strokeDasharray="5 8" />
          {/* bola tetap pada tangkai */}
          <line x1={fx} y1={TOPY} x2={fx} y2={fy} stroke="#c8d2ee" strokeWidth={3} />
          {/* batang & bola bergerak */}
          <line x1={cwx} y1={cwy} x2={ax} y2={ay} stroke="#e7d6a6" strokeWidth={4} />
          <ellipse cx={cwx} cy={cwy} rx={14} ry={8} fill="#a9b4d8" />
          <Charge x={fx} y={fy} r={20} s={1} op={0.35 + 0.65 * charged} />
          <Charge x={ax} y={ay} r={20} s={1} op={0.35 + 0.65 * charged} />
          <Arrow x1={ax + (ax - fx) * 0.12} y1={ay + (ay - fy) * 0.12} x2={ax + (ax - fx) * 0.12 + ((ax - fx) / Math.hypot(ax - fx, ay - fy)) * 60} y2={ay + (ay - fy) * 0.12 + ((ay - fy) / Math.hypot(ax - fx, ay - fy)) * 60} color="force" width={5} opacity={charged} pulse={false} />
          <rect x={BX - 220} y={TOPY} width={440} height={BOTY - TOPY} fill="url(#cl-glass)" />
          <line x1={BX - 220} y1={TOPY} x2={BX - 220} y2={BOTY} stroke="#9fb3e0" strokeOpacity={0.55} strokeWidth={2.5} />
          <line x1={BX + 220} y1={TOPY} x2={BX + 220} y2={BOTY} stroke="#9fb3e0" strokeOpacity={0.55} strokeWidth={2.5} />
          <ellipse cx={BX} cy={TOPY} rx={220} ry={56} fill="#1a2650" fillOpacity={0.5} stroke="#9fb3e0" strokeOpacity={0.8} strokeWidth={2.5} />
          <ellipse cx={BX} cy={BOTY} rx={220} ry={56} fill="none" stroke="#9fb3e0" strokeOpacity={0.8} strokeWidth={2.5} />
          {/* label */}
          <path d={`M${BX + 8},250 L${BX + 120},236`} stroke={C.muted} strokeWidth={2} opacity={lblA} />
          <Label x={BX + 130} y={234} size={28} color={C.ink} anchor="start" opacity={lblA}>
            serat puntir
          </Label>
          <path d={`M${BX + 222},${RODY + 30} L${BX + 300},${RODY + 70}`} stroke={C.muted} strokeWidth={2} opacity={lblA} />
          <Label x={BX + 310} y={RODY + 76} size={28} color={C.ink} anchor="start" opacity={lblA}>
            skala sudut
          </Label>
          <path d={`M${fx + 18},${fy - 14} L${BX + 290},${RODY - 90}`} stroke={C.muted} strokeWidth={2} opacity={charged} />
          <Label x={BX + 300} y={RODY - 96} size={28} color={C.heat} anchor="start" opacity={charged}>
            bola bermuatan +
          </Label>
          <Label x={BX - 330} y={RODY + 140} size={26} color={C.muted} font="mono" anchor="end" opacity={lblC}>
            Coulomb, 1785
          </Label>
        </g>

        {/* fase 1–3: F ∝ q₁q₂/r² */}
        <g opacity={ph1}>
          <line x1={140} y1={TY + 52} x2={1780} y2={TY + 52} stroke={C.line} strokeWidth={3} />
          {Array.from({length: 33}, (_, k) => (
            <line key={k} x1={160 + k * 50} y1={TY + 52} x2={160 + k * 50} y2={TY + 60} stroke={C.line} strokeWidth={2} />
          ))}
          <Charge x={xA} y={TY} r={30} s={1} />
          <Charge x={xB} y={TY} r={rq2} s={1} />
          <Arrow x1={xA - 40} y1={TY} x2={xA - 40 - F} y2={TY} color="force" width={7} pulse={F > 60} />
          <Arrow x1={xB + rq2 + 10} y1={TY} x2={xB + rq2 + 10 + F} y2={TY} color="force" width={7} pulse={F > 60} />
          {/* label F */}
          {[
            {s: 'F', o: fBase},
            {s: '2F', o: f2},
            {s: 'F/4', o: fQuart},
            {s: '4F', o: f4},
          ].map((l) =>
            l.o > 0.001 ? (
              <g key={l.s} opacity={l.o}>
                <Label x={xA - 40 - Math.max(F, 30) / 2} y={TY - 62} size={40} color={C.force} weight={700} font="serif" italic>
                  {l.s}
                </Label>
                <Label x={xB + rq2 + 10 + Math.max(F, 30) / 2} y={TY - 62} size={40} color={C.force} weight={700} font="serif" italic>
                  {l.s}
                </Label>
              </g>
            ) : null,
          )}
          <Label x={xA} y={TY + 92} size={32} color={C.heat} font="serif" italic>
            <tspan>q</tspan>
            <tspan baselineShift="sub" fontSize="0.65em">1</tspan>
          </Label>
          <Label x={xB} y={TY + 92} size={32} color={C.heat} font="serif" italic opacity={1 - qBump}>
            <tspan>q</tspan>
            <tspan baselineShift="sub" fontSize="0.65em">2</tspan>
          </Label>
          <Label x={xB} y={TY + 92} size={32} color={C.heat} font="serif" italic opacity={qBump}>
            <tspan>2q</tspan>
            <tspan baselineShift="sub" fontSize="0.65em">2</tspan>
          </Label>
          {/* garis jarak r */}
          <g>
            <line x1={xA} y1={TY + 140} x2={xB} y2={TY + 140} stroke={C.muted} strokeWidth={2.5} />
            <line x1={xA} y1={TY + 126} x2={xA} y2={TY + 154} stroke={C.muted} strokeWidth={2.5} />
            <line x1={xB} y1={TY + 126} x2={xB} y2={TY + 154} stroke={C.muted} strokeWidth={2.5} />
            {[
              {s: 'r', o: rl1},
              {s: '2r', o: rl2},
              {s: 'r/2', o: rlh},
            ].map((l) => (
              <Label key={l.s} x={BX} y={TY + 176} size={34} color={C.ink} font="serif" italic opacity={l.o}>
                {l.s}
              </Label>
            ))}
          </g>
          <Ripple x={xA} y={TY} p={ramp(t, wordOf(3, 'empat', 1) - 0.1, wordOf(3, 'empat', 1) + 1.3, lin)} r={160} color="force" />
          <Ripple x={xB} y={TY} p={ramp(t, wordOf(3, 'empat', 1) - 0.1, wordOf(3, 'empat', 1) + 1.3, lin)} r={160} color="force" />
          <Glow x={960} y={290} r={340} color="force" opacity={0.3 * ramp(t, c[1], c[1] + 0.8) * (1 - ramp(t, c[4] - 1, c[4]))} />
        </g>

        {/* fase 4: atom hidrogen & batang log */}
        <g opacity={ph4}>
          <Glow x={AX} y={AY} r={330} color="pot" opacity={0.35} />
          <ellipse cx={AX} cy={AY} rx={185} ry={78} fill="none" stroke={C.pot} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 10" transform={`rotate(${(-0.35 * 180) / Math.PI} ${AX} ${AY})`} />
          <Charge x={AX} y={AY} r={32} s={1} />
          <Arrow x1={ex + ux * 16} y1={ey + uy * 16} x2={ex + ux * 96} y2={ey + uy * 96} color="force" width={6} opacity={eL} pulse={false} />
          <Spark x={ex} y={ey} r={11} color="pot" trail={eTrail} />
          <Label x={AX} y={AY - 170} size={30} weight={600} color={C.ink}>
            atom hidrogen
          </Label>
          <Label x={AX} y={AY + 160} size={26} color={C.force} font="mono" opacity={eL}>
            tarikan listrik
          </Label>
          <Label x={AX} y={AY + 200} size={26} color={C.muted} font="mono" opacity={eG}>
            gravitasi: nyaris nol
          </Label>

          {/* batang logaritmik */}
          <line x1={LX0} y1={720} x2={LX1 + 20} y2={720} stroke={C.muted} strokeWidth={2.5} />
          {Array.from({length: 41}, (_, k) => (
            <line key={k} x1={LX0 + k * DEC} y1={720} x2={LX0 + k * DEC} y2={720 + (k % 10 === 0 ? 16 : 7)} stroke={C.muted} strokeWidth={k % 10 === 0 ? 2.5 : 1.5} opacity={k % 10 === 0 ? 1 : 0.6} />
          ))}
          {[0, 10, 20, 30, 40].map((k) => (
            <text key={k} x={LX0 + k * DEC} y={762} textAnchor="middle" fontFamily={FONT.mono} fontSize={22} fill={C.muted}>
              10<TSup>{k}</TSup>
            </text>
          ))}
          <text x={(LX0 + LX1) / 2} y={806} textAnchor="middle" fontFamily={FONT.mono} fontSize={21} fill={C.muted} opacity={0.8}>
            skala log: tiap garis = ×10
          </text>
          <Label x={LX0} y={470} size={28} weight={600} color={C.force} anchor="start" opacity={eL}>
            gaya listrik
          </Label>
          <rect x={LX0} y={500} width={Math.max(4, m * DEC)} height={50} rx={8} fill={C.force} opacity={0.85 * eL} />
          {Array.from({length: 8}, (_, k) => {
            const ph = (t * 0.6 + k / 8) % 1;
            return <circle key={k} cx={LX0 + ph * Math.max(4, m * DEC)} cy={525 + 14 * Math.sin(k * 2.3 + t * 2)} r={3} fill="#fff" opacity={0.6 * cyc(ph) * eL} />;
          })}
          {[mf, mf + 1].map((k) => {
            const o = k === mf ? 1 - (m - mf) : m - mf;
            if (o <= 0.01 || k > 39) return null;
            return (
              <text key={k} x={LX0 + m * DEC + 16} y={538} fontFamily={FONT.serif} fontSize={36} fill={C.force} opacity={o * eL}>
                10<TSup>{k}</TSup>
              </text>
            );
          })}
          <Label x={LX0} y={610} size={28} weight={600} color={C.muted} anchor="start" opacity={eG0}>
            gaya gravitasi
          </Label>
          <rect x={LX0} y={638} width={4} height={40} rx={2} fill={C.muted} opacity={eG0} />
          <text x={LX0 + 18} y={668} fontFamily={FONT.serif} fontSize={30} fill={C.muted} opacity={eG0}>
            1
          </text>
          <Ripple x={LX0 + 39 * DEC} y={525} p={ramp(t, wordOf(4, 'sembilan') + 0.2, wordOf(4, 'sembilan') + 1.6, lin)} r={160} color="force" />
          <Twinkles x={LX0 + 36 * DEC} y={525} rx={90} ry={50} n={5} color="force" opacity={done} seed={9} />
        </g>
      </Stage>

      <Formula x={960} y={290} p={slot(t, c[1] + 0.2, c[2] + 0.1)} accent={C.force} size={66} caption="hukum Coulomb">
        <span>
          <span style={{color: C.force}}>F</span> = <Part p={0.3 + 0.7 * kPart}>k</Part>
          <Frac
            n={
              <Part p={0.35 + 0.65 * hasil} color={C.heat}>
                q<Sub>1</Sub>q<Sub>2</Sub>
              </Part>
            }
            d={<Part p={0.35 + 0.65 * kuad}>r<Sup>2</Sup></Part>}
          />
        </span>
      </Formula>
      <Formula x={960} y={290} p={slot(t, c[2] + 0.1, c[3] + 0.1)} accent={C.force} size={60} caption="tetapan Coulomb — angka yang sangat besar">
        <span>
          k ≈ 9 × 10<Sup>9</Sup> <span style={{fontSize: '0.62em', fontStyle: 'normal'}}>N·m²/C²</span>
        </span>
      </Formula>
      <Formula x={960} y={290} p={slot(t, c[3] + 0.1, c[4] + 0.1)} accent={C.force} size={62} caption="r × 2 → F/4   ·   r ÷ 2 → 4F">
        <span>
          <span style={{color: C.force}}>F</span> ∝ <Frac n="1" d={<span>r<Sup>2</Sup></span>} />
        </span>
      </Formula>
      <Formula x={1300} y={290} p={slot(t, wordOf(4, 'sepuluh') - 0.6, dur + 2)} accent={C.force} size={58} caption="di dalam atom hidrogen">
        <span>
          <Frac n={<span style={{color: C.force}}>F<Sub>listrik</Sub></span>} d={<span style={{color: C.muted}}>F<Sub>gravitasi</Sub></span>} /> ≈ 10<Sup>39</Sup>
        </span>
      </Formula>
    </AbsoluteFill>
  );
};
