import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BRAND} from './brand';
import {C, FONT} from './theme';

// Muatan + (kiri) dan − (kanan); garis medan keluar dari + menuju −.
const PX = 1800;
const NX = 2260;
const CY = 690;

/** Busur garis medan antara + dan − dengan lengkungan h (negatif = ke atas). */
const fieldPath = (h: number) => `M ${PX} ${CY} Q ${(PX + NX) / 2} ${CY + 2 * h} ${NX} ${CY}`;

const Arrowhead: React.FC<{x: number; y: number; ang: number; color: string}> = ({x, y, ang, color}) => (
  <path d="M -20 -13 L 6 0 L -20 13 Z" fill={color} transform={`translate(${x} ${y}) rotate(${ang})`} />
);

const Charge: React.FC<{x: number; color: string; sign: '+' | '−'}> = ({x, color, sign}) => (
  <g>
    <circle cx={x} cy={CY} r={190} fill={color} opacity={0.1} />
    <circle cx={x} cy={CY} r={130} fill={color} opacity={0.14} />
    <circle cx={x} cy={CY} r={86} fill={color} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={5} />
    <text x={x} y={CY + 40} textAnchor="middle" fontFamily={FONT.head} fontWeight={700} fontSize={120} fill="#ffffff">
      {sign}
    </text>
  </g>
);

/** Gambar mini 2K untuk YouTube/LMS. */
export const Thumbnail: React.FC = () => {
  const hs = [-420, -270, -140, 0, 140, 270, 420];
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 30% 40%, #20305e 0%, ${C.bg} 70%)`, fontFamily: FONT.head}}>
      <svg width={2560} height={1440} style={{position: 'absolute', inset: 0}}>
        {/* garis medan dari + ke − */}
        {hs.map((h) => (
          <g key={h}>
            <path d={fieldPath(h)} fill="none" stroke={C.force} strokeWidth={h === 0 ? 7 : 5} opacity={0.85 - Math.abs(h) / 1100} />
            {/* panah di puncak busur (arah ke kanan = menuju −) */}
            <Arrowhead x={(PX + NX) / 2} y={CY + h} ang={0} color={C.force} />
          </g>
        ))}
        {/* garis medan yang keluar dari + ke kiri dan masuk ke − dari kanan */}
        {[-1, 1].map((s) => (
          <g key={s} opacity={0.55}>
            <path d={`M ${PX} ${CY} Q ${PX - 180} ${CY + s * 120} ${PX - 230} ${CY + s * 380}`} fill="none" stroke={C.force} strokeWidth={5} />
            <Arrowhead x={PX - 169} y={CY + s * 194} ang={s > 0 ? 117 : -117} color={C.force} />
            <path d={`M ${NX + 230} ${CY + s * 380} Q ${NX + 180} ${CY + s * 120} ${NX} ${CY}`} fill="none" stroke={C.force} strokeWidth={5} />
            <Arrowhead x={NX + 169} y={CY + s * 194} ang={s > 0 ? -117 : 117} color={C.force} />
          </g>
        ))}
        <Charge x={PX} color={C.heat} sign="+" />
        <Charge x={NX} color={C.pot} sign="−" />
        <text x={(PX + NX) / 2} y={1200} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={64} fill={C.ink}>
          F = k q₁q₂ / r²
        </text>
      </svg>
      <div style={{position: 'absolute', left: 140, top: 180, color: C.gold, fontSize: 54, letterSpacing: 10, fontWeight: 600}}>{BRAND.series.toUpperCase()}</div>
      <div style={{position: 'absolute', left: 130, top: 280, color: C.ink, fontSize: 168, fontWeight: 700, lineHeight: 1, letterSpacing: -5}}>
        Gaya yang
        <br />
        <span style={{color: C.force}}>Menyatukan</span>
        <br />
        <span style={{color: C.force}}>Atom</span>
      </div>
      <div style={{position: 'absolute', left: 140, top: 830, color: C.muted, fontSize: 70, fontWeight: 500}}>{BRAND.subtitle}</div>
      <div style={{position: 'absolute', left: 140, bottom: 140, color: C.ink, fontSize: 44, letterSpacing: 8, fontWeight: 600}}>
        {BRAND.channel} <span style={{color: C.muted, letterSpacing: 2, fontWeight: 400}}>· {BRAND.tagline}</span>
      </div>
    </AbsoluteFill>
  );
};
