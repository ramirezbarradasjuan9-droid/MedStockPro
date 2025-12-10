import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Search, Filter, Download, Edit2, ArrowUpCircle, ArrowDownCircle, Calendar, X, AlertTriangle } from 'lucide-react';
import { Transaction, MaterialType, TransactionType } from '../types';
import { MATERIALS_LIST } from '../constants';

interface ReportsProps {
  transactions: Transaction[];
  onUpdateTransaction: (updated: Transaction) => void;
}

const Reports: React.FC<ReportsProps> = ({ transactions, onUpdateTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.lot.includes(searchTerm.toUpperCase()) ||
        (t.origin && t.origin.includes(searchTerm.toUpperCase())) ||
        (t.destination && t.destination.includes(searchTerm.toUpperCase()));
      
      const matchesMaterial = filterMaterial === 'ALL' || t.material === filterMaterial;
      const matchesType = filterType === 'ALL' || t.type === filterType;

      // Date Range Logic
      let matchesDate = true;
      if (startDate || endDate) {
        const txDate = new Date(t.date);
        
        if (startDate) {
          // Construct local start of day
          const start = new Date(`${startDate}T00:00:00`);
          if (txDate < start) matchesDate = false;
        }
        
        if (matchesDate && endDate) {
          // Construct local end of day
          const end = new Date(`${endDate}T23:59:59.999`);
          if (txDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesMaterial && matchesType && matchesDate;
    }).sort((a, b) => b.timestamp - a.timestamp); // Newest first
  }, [transactions, searchTerm, filterMaterial, filterType, startDate, endDate]);

  const handleExport = () => {
    const dataToExport = filteredTransactions.map(t => ({
      ID: t.id,
      Fecha: new Date(t.date).toLocaleDateString(),
      Hora: new Date(t.date).toLocaleTimeString(),
      Tipo: t.type === 'IN' ? 'INGRESO' : 'SALIDA',
      Material: t.material,
      Subtipo: t.subtype || 'N/A',
      Lote: t.lot,
      Cantidad: t.quantity,
      Procedencia: t.origin || '-',
      Destino: t.destination || '-',
      Observaciones: t.observations
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Inventario");
    XLSX.writeFile(wb, "Reporte_Medicina_Preventiva.xlsx");
  };

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditForm({ ...t });
  };

  const initiateSave = () => {
    if (!editForm.quantity || editForm.quantity <= 0) {
      alert("Cantidad inválida");
      return;
    }
    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const executeSave = () => {
    if (editingId && editForm) {
      const original = transactions.find(t => t.id === editingId);
      if (original) {
        onUpdateTransaction({ ...original, ...editForm } as Transaction);
      }
      setEditingId(null);
      setShowConfirmModal(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowConfirmModal(false);
  };

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6 relative">
      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
        
        {/* Top Row: Search and Export */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por lote, origen, destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-medical-500 outline-none w-full bg-slate-50 focus:bg-white transition-colors"
            />
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium text-sm whitespace-nowrap w-full md:w-auto justify-center"
          >
            <Download size={18} />
            Exportar Excel
          </button>
        </div>

        {/* Bottom Row: Detailed Filters */}
        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-2 w-full">
            
            {/* Material Filter */}
            <select
              value={filterMaterial}
              onChange={(e) => setFilterMaterial(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-medical-500 bg-white"
            >
              <option value="ALL">Todos los Materiales</option>
              {MATERIALS_LIST.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-medical-500 bg-white"
            >
              <option value="ALL">Todos los Movimientos</option>
              <option value="IN">Ingresos</option>
              <option value="OUT">Salidas</option>
            </select>

            {/* Date Range Filters */}
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <div className="relative flex items-center">
                <Calendar size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-8 pr-2 py-1.5 rounded-md border-none bg-transparent text-sm focus:ring-0 outline-none text-slate-600 w-32"
                  placeholder="Desde"
                />
              </div>
              <span className="text-slate-400 text-xs">a</span>
              <div className="relative flex items-center">
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-2 pr-2 py-1.5 rounded-md border-none bg-transparent text-sm focus:ring-0 outline-none text-slate-600 w-32"
                  placeholder="Hasta"
                />
              </div>
              {(startDate || endDate) && (
                <button 
                  onClick={clearDates}
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                  title="Limpiar fechas"
                >
                  <X size={14} />
                </button>
              )}
            </div>

          </div>
          
          <div className="text-xs text-slate-400 whitespace-nowrap ml-auto">
            Mostrando {filteredTransactions.length} registros
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4">Lote</th>
                <th className="px-6 py-4 text-center">Cantidad</th>
                <th className="px-6 py-4">Origen / Destino</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  {editingId === t.id ? (
                    // Edit Mode Row
                    <>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${t.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {t.type === 'IN' ? 'INGRESO' : 'SALIDA'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{t.material}</td>
                      <td className="px-6 py-4">
                        <input 
                          value={editForm.lot} 
                          onChange={e => setEditForm({...editForm, lot: e.target.value.toUpperCase()})}
                          className="w-24 border rounded px-2 py-1" 
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                         <input 
                          type="number"
                          value={editForm.quantity} 
                          onChange={e => setEditForm({...editForm, quantity: parseInt(e.target.value)})}
                          className="w-20 border rounded px-2 py-1 text-center" 
                        />
                      </td>
                       <td className="px-6 py-4">
                        {t.type === 'IN' ? (
                           <input 
                            value={editForm.origin} 
                            onChange={e => setEditForm({...editForm, origin: e.target.value.toUpperCase()})}
                            className="w-full border rounded px-2 py-1" 
                          />
                        ) : (
                          <input 
                            value={editForm.destination} 
                            onChange={e => setEditForm({...editForm, destination: e.target.value.toUpperCase()})}
                            className="w-full border rounded px-2 py-1" 
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                         <button onClick={initiateSave} className="text-emerald-600 font-bold hover:underline mr-2">Guardar</button>
                         <button onClick={cancelEdit} className="text-slate-400 hover:underline">Cancelar</button>
                      </td>
                    </>
                  ) : (
                    // Read Mode Row
                    <>
                      <td className="px-6 py-4">
                        <div className="font-medium">{new Date(t.date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-400">{new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${t.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {t.type === 'IN' ? <ArrowDownCircle size={12}/> : <ArrowUpCircle size={12}/>}
                          {t.type === 'IN' ? 'INGRESO' : 'SALIDA'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700">{t.material}</div>
                        {t.subtype && <div className="text-xs text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">{t.subtype}</div>}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">{t.lot}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{t.quantity}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-0.5">
                          {t.type === 'IN' ? 'De:' : 'Para:'}
                        </div>
                        {t.type === 'IN' ? t.origin : t.destination}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => startEdit(t)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                          title="Editar Registro"
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron registros con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="bg-amber-100 p-3 rounded-full text-amber-600 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">¿Confirmar modificaciones?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Está a punto de actualizar un registro histórico. Esta acción afectará los reportes y el cálculo del inventario actual.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={executeSave}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;