export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string; // Código de identificación
  quantity: number;
  minStock: number; // Para alertas
  unit: string; // pza, kg, lt, caja
  updatedAt: number;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string; // ISO String
  timestamp: number;
  notes?: string;
}

export type ViewState = 'DASHBOARD' | 'INVENTORY' | 'HISTORY';

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
  VIH_SIFILIS = 'VIH / Sífilis',
  ANTIGENO_PROSTATICO = 'Antígeno Prostático',
}

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  date: string;
  timestamp: number;
  type: TransactionType;
  material: string;
  subtype?: string | null;
  lot: string;
  quantity: number;
  origin?: string;
  destination?: string;
  observations?: string;
}

export interface StockItem {
  id: string;
  material: string;
  subtype?: string;
  lot: string;
  quantity: number;
}