export interface Member {
  id: string;
  name: string;
  isPermanent: boolean; // "Giustificato fisso"
  role?: string; // Optional: Maestro, Apprendista, etc.
}

export interface DayData {
  justifiedIds: string[];
  sickBrethren: string[];
  program: string;
}

export interface AttendanceRecord {
  [dateIsoString: string]: DayData;
}

export interface AppState {
  members: Member[];
  attendance: AttendanceRecord;
}