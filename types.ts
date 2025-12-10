export type TransactionType = 'IN' | 'OUT';

export enum MaterialType {
  VIDA_SUERO_ORAL = 'Vida Suero Oral',
  ESPEJOS_VAGINALES = 'Espejos Vaginales',
  LAMINILLAS = 'Laminillas',
  CITOBRUSH = 'Citobrush',
  PRUEBAS_RAPIDAS = 'Pruebas Rápidas',
}

export enum PruebaSubtype {
  HEPATITIS_B = 'Hepatitis B',
  HEPATITIS_C = 'Hepatitis C',
  VIH_SIFILIS = 'VIH/Sífilis',
  ANTIGENO_PROSTATICO = 'Antígeno Prostático',
}

export interface Transaction {
  id: string;
  date: string; // ISO String
  timestamp: number;
  type: TransactionType;
  material: MaterialType | string;
  subtype?: PruebaSubtype | string | null; // Nullable if not applicable
  lot: string;
  quantity: number;
  origin?: string; // Only for IN
  destination?: string; // Only for OUT
  observations?: string;
}

export interface StockItem {
  id: string; // Composite key usually: Material + Subtype + Lot
  material: string;
  subtype?: string | null;
  lot: string;
  quantity: number;
  lastUpdated: string;
}

export interface FilterState {
  search: string;
  material: string;
  lot: string;
  destination: string; // For history
  origin: string; // For history
}