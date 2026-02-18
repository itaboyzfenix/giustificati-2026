import { Member } from './types';

// Lista estratta dal documento PDF fornito
export const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Agus Stefano', isPermanent: false, role: 'Maestro' },
  { id: '2', name: 'Ambu Pierpaolo', isPermanent: false, role: 'Maestro' },
  { id: '3', name: 'Balia Giuseppe', isPermanent: false, role: 'Maestro' },
  { id: '4', name: 'Concu Mauro', isPermanent: false, role: 'Maestro' },
  { id: '5', name: 'Concu Pierluigi', isPermanent: false, role: 'Compagno' },
  { id: '6', name: 'Corda Gian Paolo', isPermanent: false, role: 'Maestro' },
  { id: '7', name: 'Deiana Giorgio', isPermanent: false, role: 'Maestro' },
  { id: '8', name: 'Dessena Efisio', isPermanent: false, role: 'Compagno' },
  { id: '9', name: 'Dore Antonello', isPermanent: false, role: 'Apprendista' },
  { id: '10', name: 'Gaviano Roberto', isPermanent: false, role: 'Maestro' },
  { id: '11', name: 'Gravellino Giampaolo', isPermanent: false, role: 'Maestro' },
  { id: '12', name: 'Longobardi Gennaro', isPermanent: false, role: 'Maestro' },
  { id: '13', name: 'Mancini Angelo', isPermanent: false, role: 'Maestro' },
  { id: '14', name: 'Manunza GianLuigi', isPermanent: false, role: 'Maestro' },
  { id: '15', name: 'Massidda Simone', isPermanent: false, role: 'Maestro' },
  { id: '16', name: 'Melis Antonello', isPermanent: false, role: 'Maestro' },
  { id: '17', name: 'Melis Giuseppe', isPermanent: false, role: 'Maestro' },
  { id: '18', name: 'Milonopoulos Konstantinos', isPermanent: false, role: 'Maestro' },
  { id: '19', name: 'Mossa Jacopo', isPermanent: false, role: 'Apprendista' },
  { id: '20', name: 'Obino Nicola', isPermanent: false, role: 'Maestro' },
  { id: '21', name: 'Orrù Giuseppe', isPermanent: false, role: 'Apprendista' },
  { id: '22', name: 'Pani Michele', isPermanent: false, role: 'Maestro' },
  { id: '23', name: 'Piras Gabriele', isPermanent: false, role: 'Maestro' },
  { id: '24', name: 'Podda Marco', isPermanent: false, role: 'Maestro' },
  { id: '25', name: 'Rundeddu Francesco', isPermanent: false, role: 'Maestro' },
  { id: '26', name: 'Solla Antonio', isPermanent: false, role: 'Maestro' },
  { id: '27', name: 'Tilocca Pierpaolo', isPermanent: false, role: 'Maestro' },
  { id: '28', name: 'Tuveri Riccardo', isPermanent: false, role: 'Maestro' },
  { id: '29', name: 'Zuddas Bruno', isPermanent: false, role: 'Maestro' },
  { id: '30', name: 'Nugnes Giovanni', isPermanent: false, role: 'Maestro' },
  { id: '31', name: 'Pusceddu Alberto', isPermanent: false, role: 'Apprendista' },
  { id: '32', name: 'Trudu Luigi', isPermanent: false, role: 'Maestro' },
];

// Changed key to v2 to force update of initial data for the user
export const STORAGE_KEY = 'lodgekeeper_data_v2';

export const GEMINI_MODEL = 'gemini-3-flash-preview';