import React from 'react';
import { StockItem } from '../types';
import { Package, Search } from 'lucide-react';

interface InventoryListProps {
  stock: StockItem[];
}

const InventoryList: React.FC<InventoryListProps> = ({ stock }) => {
  const [search, setSearch] = React.useState('');

  const filteredStock = stock.filter(item => {
    const term = search.toUpperCase();
    return item.material.toUpperCase().includes(term) || 
           item.lot.includes(term) || 
           (item.subtype && item.subtype.toUpperCase().includes(term));
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Inventario Actual</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar en inventario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-medical-500 outline-none w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStock.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-medical-50 rounded-xl group-hover:bg-medical-100 transition-colors">
                  <Package className="text-medical-600" size={24} />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.quantity === 0 ? 'bg-red-100 text-red-700' :
                  item.quantity < 10 ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {item.quantity === 0 ? 'AGOTADO' : item.quantity < 10 ? 'STOCK BAJO' : 'DISPONIBLE'}
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-slate-800 leading-tight">{item.material}</h3>
              {item.subtype && (
                <p className="text-sm font-medium text-medical-600 mt-1">{item.subtype}</p>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
                <div>
                   <p className="text-xs text-slate-400 uppercase tracking-wider">Lote</p>
                   <p className="font-mono font-medium text-slate-600">{item.lot}</p>
                </div>
                 <div className="text-right">
                   <p className="text-3xl font-bold text-slate-800">{item.quantity}</p>
                   <p className="text-xs text-slate-400">Unidades</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredStock.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No se encontraron materiales en el inventario.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;