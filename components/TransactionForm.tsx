import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MaterialType, PruebaSubtype, Transaction, TransactionType } from '../types';
import { MATERIALS_LIST, PRUEBAS_SUBTYPES } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// Simple UUID generator fallback if package not available, though ideally we use a library
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

interface TransactionFormProps {
  type: TransactionType;
  onSave: (transaction: Transaction) => void;
  inventoryMap: Record<string, number>; // To check stock for exits
}

const TransactionForm: React.FC<TransactionFormProps> = ({ type, onSave, inventoryMap }) => {
  const [material, setMaterial] = useState<string>(MATERIALS_LIST[0]);
  const [subtype, setSubtype] = useState<string>('');
  const [lot, setLot] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [sourceDest, setSourceDest] = useState<string>(''); // Origin or Destination
  const [observations, setObservations] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset subtype if material changes
  useEffect(() => {
    if (material !== MaterialType.PRUEBAS_RAPIDAS) {
      setSubtype('');
    } else if (!subtype) {
      setSubtype(PRUEBAS_SUBTYPES[0]);
    }
  }, [material, subtype]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Normalize Data
    const cleanLot = lot.trim().toUpperCase();
    const cleanSourceDest = sourceDest.trim().toUpperCase();
    const qty = parseInt(quantity);

    // Validation
    if (!cleanLot) return setError("El lote es obligatorio.");
    if (!cleanSourceDest) return setError(type === 'IN' ? "La procedencia es obligatoria." : "El destino es obligatorio.");
    if (isNaN(qty) || qty <= 0) return setError("La cantidad debe ser mayor a 0.");
    
    // Check Stock for Outgoing
    if (type === 'OUT') {
      const stockKey = `${material}-${subtype || 'NA'}-${cleanLot}`;
      const currentStock = inventoryMap[stockKey] || 0;
      if (qty > currentStock) {
        return setError(`Stock insuficiente. Disponible en Lote ${cleanLot}: ${currentStock}`);
      }
    }

    const newTransaction: Transaction = {
      id: generateId(),
      date: new Date().toISOString(),
      timestamp: Date.now(),
      type,
      material,
      subtype: material === MaterialType.PRUEBAS_RAPIDAS ? subtype : null,
      lot: cleanLot,
      quantity: qty,
      origin: type === 'IN' ? cleanSourceDest : undefined,
      destination: type === 'OUT' ? cleanSourceDest : undefined,
      observations: observations.trim(),
    };

    onSave(newTransaction);
    setSuccess(`Registro guardado correctamente: ${material} (${qty})`);
    
    // Reset form
    setLot('');
    setQuantity('');
    setSourceDest('');
    setObservations('');
  };

  const isPruebas = material === MaterialType.PRUEBAS_RAPIDAS;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className={`p-6 border-b border-slate-100 ${type === 'IN' ? 'bg-emerald-50/50' : 'bg-amber-50/50'}`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${type === 'IN' ? 'text-emerald-700' : 'text-amber-700'}`}>
            {type === 'IN' ? 'Registrar Ingreso de Material' : 'Registrar Salida de Material'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {type === 'IN' 
              ? 'Ingrese los detalles del material recibido para actualizar el inventario.' 
              : 'Registre la entrega de material a departamentos o destinos.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100 animate-fade-in">
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100 animate-fade-in">
              <CheckCircle2 size={20} />
              <span className="font-medium">{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Material Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Material</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
              >
                {MATERIALS_LIST.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Subtype Select (Conditional) */}
            <div className={`space-y-2 transition-opacity duration-300 ${isPruebas ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label className="text-sm font-semibold text-slate-700">Tipo de Reactivo</label>
              <select
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                disabled={!isPruebas}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all disabled:bg-slate-100"
              >
                {PRUEBAS_SUBTYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Lot */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Lote</label>
              <input
                type="text"
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                placeholder="Ej. A12345"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all uppercase"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Cantidad</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Origin/Destination */}
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                {type === 'IN' ? 'Procedencia (Origen)' : 'Destino (Área solicitante)'}
              </label>
              <input
                type="text"
                value={sourceDest}
                onChange={(e) => setSourceDest(e.target.value)}
                placeholder={type === 'IN' ? "Ej. Almacén Central" : "Ej. Consultorio 1"}
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all uppercase"
              />
            </div>

            {/* Observations */}
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Observaciones</label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                placeholder="Notas adicionales..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                type === 'IN' 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
              }`}
            >
              <Save size={20} />
              {type === 'IN' ? 'Guardar Ingreso' : 'Registrar Salida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;