export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export const PLATFORM_USERS: PlatformUser[] = [
  { id: 'u-mr', name: 'Dr. M. Rossi', email: 'm.rossi@clinic.org', avatar: 'MR', role: 'Investigator' },
  { id: 'u-lb', name: 'Dr. L. Bianchi', email: 'l.bianchi@clinic.org', avatar: 'LB', role: 'Data Manager' },
  { id: 'u-av', name: 'Dr. A. Verdi', email: 'a.verdi@clinic.org', avatar: 'AV', role: 'Biostatistician' },
  { id: 'u-sr', name: 'Dr. S. Russo', email: 's.russo@clinic.org', avatar: 'SR', role: 'Investigator' },
  { id: 'u-pm', name: 'Dr. P. Marino', email: 'p.marino@clinic.org', avatar: 'PM', role: 'Monitor' },
  { id: 'u-ab', name: 'A. Bianchi', email: 'a.bianchi@partner.io', avatar: 'AB', role: 'External Partner' },
  { id: 'u-fn', name: 'F. Neri', email: 'f.neri@clinic.org', avatar: 'FN', role: 'Admin' },
  { id: 'u-gc', name: 'G. Colombo', email: 'g.colombo@clinic.org', avatar: 'GC', role: 'Data Manager' },
];
