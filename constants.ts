import { MaterialType, PruebaSubtype } from './types';

export const MATERIALS_LIST = [
  MaterialType.VIDA_SUERO_ORAL,
  MaterialType.ESPEJOS_VAGINALES,
  MaterialType.LAMINILLAS,
  MaterialType.CITOBRUSH,
  MaterialType.PRUEBAS_RAPIDAS,
];

export const PRUEBAS_SUBTYPES = [
  PruebaSubtype.HEPATITIS_B,
  PruebaSubtype.HEPATITIS_C,
  PruebaSubtype.VIH_SIFILIS,
  PruebaSubtype.ANTIGENO_PROSTATICO,
];

export const INITIAL_TRANSACTIONS = []; 
// We start empty, data will be saved to localStorage
