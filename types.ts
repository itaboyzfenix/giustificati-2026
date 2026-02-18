export interface Member {
  id: string;
  name: string;
  isPermanent: boolean; // "Giustificato fisso"
  role?: string; // Optional: Maestro, Apprendista, etc.
}

export interface AttendanceRecord {
  [dateIsoString: string]: string[]; // Array of Member IDs
}

export interface AppState {
  members: Member[];
  attendance: AttendanceRecord;
}