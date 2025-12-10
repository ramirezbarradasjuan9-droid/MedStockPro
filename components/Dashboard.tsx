import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend 
} from 'recharts';
import { Transaction, StockItem, MaterialType } from '../types';
import { MATERIALS_LIST } from '../constants';
import { 
  Package, TrendingUp, TrendingDown, AlertTriangle, 
  History, ArrowRight, ArrowLeft, Search, Calendar 
} from 'lucide-react';

interface DashboardProps {
  stock: StockItem[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ stock, transactions }) => {
  const [selectedMaterialHistory, setSelectedMaterialHistory] = useState<string>(MATERIALS_LIST[0]);

  // 1. Calculate Aggregated Stock by Material Name (ignoring lots for the high-level chart)
  const aggregatedStock = useMemo(() => {
    const map: Record<string, number> = {};
    MATERIALS_LIST.forEach(m => map[m] = 0); // Initialize with 0
    
    stock.forEach(item => {
      if (map[item.material] !== undefined) {
        map[item.material] += item.quantity;
      }
    });

    return Object.entries(map)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => a.quantity - b.quantity) // Ascending order (lowest first)
      .slice(0, 5); // Take top 5 lowest
  }, [stock]);

  // 2. Recent Transactions (Last 10)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [transactions]);

  // 3. Filtered History for Selected Material
  const materialHistory = useMemo(() => {
    return transactions
      .filter(t => t.material === selectedMaterialHistory)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, selectedMaterialHistory]);

  // 4. General Stats
  const totalStockCount = stock.reduce((acc, item) => acc + item.quantity, 0);
  const totalTransactions = transactions.length;
  const lowStockCount = stock.filter(item => item.quantity < 10).length;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-2 bg-blue-500 group-hover:w-full transition-all duration-500 opacity-10"></div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Package size={32} />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Total Materiales (Unidades)</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalStockCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-2 bg-emerald-500 group-hover:w-full transition-all duration-500 opacity-10"></div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <History size={32} />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Transacciones Registradas</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalTransactions}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-2 bg-amber-500 group-hover:w-full transition-all duration-500 opacity-10"></div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle size={32} />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Lotes con Stock Bajo</p>
            <h3 className="text-3xl font-bold text-slate-800">{lowStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Charts & Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Low Stock Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingDown className="text-rose-500" size={20} />
              Materiales con Menor Existencia
            </h3>
            <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-500">Top 5 Críticos</span>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregatedStock} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150} 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="quantity" radius={[0, 6, 6, 0]} barSize={24}>
                  {aggregatedStock.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.quantity < 20 ? '#ef4444' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <History className="text-blue-500" size={20} />
            Últimos Movimientos
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar max-h-[300px]">
            {recentTransactions.length === 0 ? (
              <p className="text-slate-400 text-center py-10 text-sm">No hay movimientos recientes</p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 items-start">
                  <div className={`mt-1 p-1.5 rounded-full shrink-0 ${t.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {t.type === 'IN' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-semibold text-slate-700 truncate">{t.material}</p>
                      <span className="text-xs font-bold text-slate-600 ml-2">{t.quantity} u.</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {t.type === 'IN' ? `Origen: ${t.origin}` : `Destino: ${t.destination}`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(t.date).toLocaleDateString()} • {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Material History Detail Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Search className="text-medical-600" size={20} />
              Historial Detallado por Material
            </h3>
            <p className="text-sm text-slate-500 mt-1">Consulta la trazabilidad completa de cada insumo</p>
          </div>
          
          <div className="w-full md:w-72">
            <select
              value={selectedMaterialHistory}
              onChange={(e) => setSelectedMaterialHistory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none text-sm font-medium shadow-sm cursor-pointer hover:border-medical-300 transition-colors"
            >
              {MATERIALS_LIST.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Fecha / Hora</th>
                <th className="px-6 py-4">Movimiento</th>
                <th className="px-6 py-4">Detalle</th>
                <th className="px-6 py-4">Lote</th>
                <th className="px-6 py-4">Origen / Destino</th>
                <th className="px-6 py-4 text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materialHistory.length > 0 ? (
                materialHistory.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{new Date(t.date).toLocaleDateString()}</span>
                        <span className="text-xs text-slate-400 ml-1">{new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                        t.type === 'IN' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {t.type === 'IN' ? <ArrowRight size={12} /> : <ArrowLeft size={12} />}
                        {t.type === 'IN' ? 'ENTRADA' : 'SALIDA'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{t.material}</div>
                      {t.subtype && (
                        <div className="text-xs text-medical-600 bg-medical-50 inline-block px-2 py-0.5 rounded mt-1">
                          {t.subtype}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">{t.lot}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {t.type === 'IN' ? (
                        <span className="flex flex-col">
                          <span className="text-[10px] uppercase text-slate-400">Procedencia</span>
                          <span className="font-medium">{t.origin}</span>
                        </span>
                      ) : (
                        <span className="flex flex-col">
                          <span className="text-[10px] uppercase text-slate-400">Destino</span>
                          <span className="font-medium">{t.destination}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-base font-bold text-slate-800">{t.quantity}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <History size={48} className="mb-3 opacity-20" />
                      <p>No se encontraron movimientos para {selectedMaterialHistory}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;