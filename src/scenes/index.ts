import type React from 'react';
import {Battery} from './Battery';
import {Capacitor} from './Capacitor';
import {Charge} from './Charge';
import {Circuits} from './Circuits';
import {Coulomb} from './Coulomb';
import {Current} from './Current';
import {EV} from './EV';
import {Electrolysis} from './Electrolysis';
import {Electrophoresis} from './Electrophoresis';
import {Field} from './Field';
import {Hook} from './Hook';
import {Hydrogen} from './Hydrogen';
import {Ionic} from './Ionic';
import {Lightning} from './Lightning';
import {Outro} from './Outro';
import {Potential} from './Potential';
import {Recap} from './Recap';
import {Roadmap} from './Roadmap';
import {Title} from './Title';

// Pemetaan id adegan di naskah → komponen visual.
export const SCENES: Record<string, React.FC> = {
  hook: Hook,
  title: Title,
  roadmap: Roadmap,
  charge: Charge,
  coulomb: Coulomb,
  field: Field,
  potential: Potential,
  capacitor: Capacitor,
  current: Current,
  circuits: Circuits,
  ionic: Ionic,
  hydrogen: Hydrogen,
  ev: EV,
  electrolysis: Electrolysis,
  lightning: Lightning,
  battery: Battery,
  electrophoresis: Electrophoresis,
  recap: Recap,
  outro: Outro,
};
