import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Package, History, Plus, Minus, Search, 
  AlertTriangle, ArrowUpRight, ArrowDownLeft, Trash2, Save, X 
} from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Product, Movement, ViewState } from './types';

// --- COMPONENTS ---

// 1. Sidebar Component
const Sidebar = ({ view, setView }: { view: ViewState, setView: (v: ViewState) => void }) => (
  <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl z-10">
    <div className="p-6 border-b border-slate-800 flex items-center gap-3">
      <div className="bg-brand-600 p-2 rounded-lg text-white">
        <Package size={24} />
      </div>
      <div>
        <h1 className="font-bold text-white text-lg tracking-tight">MateInv</h1>
        <p className="text-xs text-slate-500">Gestión de Materiales</p>
      </div>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      <button 
        onClick={() => setView('DASHBOARD')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'DASHBOARD' ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
      >
        <LayoutDashboard size={20} />
        <span className="font-medium">Dashboard</span>
      </button>
      <button 
        onClick={() => setView('INVENTORY')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'INVENTORY' ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
      >
        <Package size={20} />
        <span className="font-medium">Inventario</span>
      </button>
      <button 
        onClick={() => setView('HISTORY')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'HISTORY' ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
      >
        <History size={20} />
        <span className="font-medium">Historial</span>
      </button>
    </nav>
    <div className="p-4 border-t border-slate-800 text-xs text-center text-slate-600">
      v2.0.0 Stable Build
    </div>
  </aside>
);

// 2. Dashboard View
const DashboardView = ({ products, movements }: { products: Product[], movements: Movement[] }) => {
  const totalItems = products.length;
  const lowStock = products.filter(p => p.quantity <= p.minStock).length;
  const totalStock = products.reduce((acc, curr) => acc + curr.quantity, 0);
  
  // Calculate recent activity
  const recentIn = movements.filter(m => m.type === 'IN').slice(0, 5);
  const recentOut = movements.filter(m => m.type === 'OUT').slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800">Resumen General</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Package size={32} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Productos Únicos</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalItems}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowUpRight size={32} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Unidades</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalStock}</h3>
          </div>
        </div>

        <div className={`bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 ${lowStock > 0 ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>
          <div className={`p-4 rounded-xl ${lowStock > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
            <AlertTriangle size={32} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Stock Bajo</p>
            <h3 className={`text-3xl font-bold ${lowStock > 0 ? 'text-amber-700' : 'text-slate-800'}`}>{lowStock}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Alertas de Stock</h3>
          {lowStock === 0 ? (
            <div className="text-center py-8 text-slate-400">Todo el inventario está saludable.</div>
          ) : (
            <div className="space-y-3">
              {products.filter(p => p.quantity <= p.minStock).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div>
                    <div className="font-semibold text-amber-900">{p.name}</div>
                    <div className="text-xs text-amber-700">Min: {p.minStock} {p.unit}</div>
                  </div>
                  <div className="font-bold text-amber-700 text-lg">
                    {p.quantity} <span className="text-sm font-normal">{p.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-4">Actividad Reciente</h3>
           <div className="space-y-4">
             {movements.slice(0, 5).map(m => (
               <div key={m.id} className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-3">
                   <div className={`p-1.5 rounded-full ${m.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                     {m.type === 'IN' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                   </div>
                   <div>
                     <span className="font-medium text-slate-700">{m.productName}</span>
                     <span className="text-slate-400 text-xs ml-2">{new Date(m.timestamp).toLocaleDateString()}</span>
                   </div>
                 </div>
                 <span className={`font-bold ${m.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {m.type === 'IN' ? '+' : '-'}{m.quantity}
                 </span>
               </div>
             ))}
             {movements.length === 0 && <p className="text-slate-400 text-center py-4">Sin movimientos registrados</p>}
           </div>
        </div>
      </div>
    </div>
  );
};

// 3. Inventory View (The Core)
const InventoryView = ({ products }: { products: Product[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Quick Action State
  const [actionItem, setActionItem] = useState<{product: Product, type: 'IN' | 'OUT'} | null>(null);
  const [actionQty, setActionQty] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  // New Product Form State
  const [newItem, setNewItem] = useState({ name: '', category: '', sku: '', minStock: 5, unit: 'pza' });

  // Filter products
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), {
        ...newItem,
        quantity: 0,
        updatedAt: Date.now()
      });
      setIsModalOpen(false);
      setNewItem({ name: '', category: '', sku: '', minStock: 5, unit: 'pza' });
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const executeMovement = async () => {
    if (!actionItem || !actionQty) return;
    const qty = parseInt(actionQty);
    if (isNaN(qty) || qty <= 0) return;

    try {
      // 1. Record Movement
      await addDoc(collection(db, 'movements'), {
        productId: actionItem.product.id,
        productName: actionItem.product.name,
        type: actionItem.type,
        quantity: qty,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        notes: actionNotes
      });

      // 2. Update Stock
      const newQty = actionItem.type === 'IN' 
        ? actionItem.product.quantity + qty 
        : actionItem.product.quantity - qty;

      if (newQty < 0) {
        alert("Error: El stock no puede ser negativo.");
        return;
      }

      await updateDoc(doc(db, 'products', actionItem.product.id), {
        quantity: newQty,
        updatedAt: Date.now()
      });

      // Reset
      setActionItem(null);
      setActionQty('');
      setActionNotes('');

    } catch (error) {
      console.error("Error executing movement:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("¿Estás seguro de eliminar este producto? Se perderá el historial asociado visualmente pero permanecerá en base de datos.")){
        await deleteDoc(doc(db, 'products', id));
    }
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Inventario de Materiales</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-brand-200"
        >
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre, SKU o categoría..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 border-b border-slate-100">Material</th>
                <th className="px-6 py-4 border-b border-slate-100">Categoría</th>
                <th className="px-6 py-4 border-b border-slate-100">SKU</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center">Stock</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500 text-sm">{item.sku}</td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${item.quantity <= item.minStock ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                       {item.quantity} <span className="text-[10px] ml-1 opacity-70 uppercase">{item.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setActionItem({ product: item, type: 'IN' })}
                        className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200" title="Entrada"
                      >
                        <Plus size={16} />
                      </button>
                      <button 
                         onClick={() => setActionItem({ product: item, type: 'OUT' })}
                        className="p-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200" title="Salida"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="w-px h-4 bg-slate-300 mx-1"></div>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg" title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Registrar Nuevo Material</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Material</label>
                <input required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none" 
                  value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="Ej. Guantes Latex" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <input required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none" 
                    value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} placeholder="Ej. EPP" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">SKU / Código</label>
                   <input required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none" 
                    value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} placeholder="A-001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Unidad Medida</label>
                   <select className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                    value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}>
                      <option value="pza">Pieza</option>
                      <option value="caja">Caja</option>
                      <option value="kg">Kg</option>
                      <option value="lt">Litro</option>
                      <option value="par">Par</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
                   <input type="number" min="1" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none" 
                    value={newItem.minStock} onChange={e => setNewItem({...newItem, minStock: parseInt(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow mt-4 transition-colors">
                Guardar Producto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Movement Action Modal */}
      {actionItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${actionItem.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {actionItem.type === 'IN' ? <Plus size={24}/> : <Minus size={24}/>}
             </div>
             <h3 className="text-xl font-bold text-slate-800">
               {actionItem.type === 'IN' ? 'Entrada de Stock' : 'Salida de Stock'}
             </h3>
             <p className="text-slate-500 mb-6">
               {actionItem.product.name} (Actual: {actionItem.product.quantity} {actionItem.product.unit})
             </p>

             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Cantidad</label>
                 <input 
                  type="number" 
                  autoFocus
                  min="1"
                  className="w-full text-2xl font-bold p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-center"
                  placeholder="0"
                  value={actionQty}
                  onChange={(e) => setActionQty(e.target.value)}
                 />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notas / Referencia</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    placeholder="Opcional (Ej. Factura 123)"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                  />
               </div>
               
               <div className="flex gap-3 pt-2">
                 <button onClick={() => setActionItem(null)} className="flex-1 py-3 border border-slate-300 rounded-xl font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
                 <button 
                  onClick={executeMovement}
                  disabled={!actionQty}
                  className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 ${actionItem.type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
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

// 4. History View
const HistoryView = ({ movements }: { movements: Movement[] }) => (
  <div className="space-y-6 h-full flex flex-col">
    <h2 className="text-2xl font-bold text-slate-800">Historial de Movimientos</h2>
    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
       <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Cantidad</th>
                <th className="px-6 py-4">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {movements.map(m => (
                 <tr key={m.id} className="hover:bg-slate-50">
                   <td className="px-6 py-4 text-sm text-slate-500">
                     {new Date(m.timestamp).toLocaleString()}
                   </td>
                   <td className="px-6 py-4 font-medium text-slate-800">{m.productName}</td>
                   <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${m.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                       {m.type === 'IN' ? 'ENTRADA' : 'SALIDA'}
                     </span>
                   </td>
                   <td className={`px-6 py-4 text-right font-bold ${m.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.type === 'IN' ? '+' : '-'}{m.quantity}
                   </td>
                   <td className="px-6 py-4 text-sm text-slate-400 italic">
                     {m.notes || '-'}
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
       </div>
    </div>
  </div>
);

// --- MAIN APP ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
      setProducts(data);
    });

    // Listen to Movements (Ordered by date desc)
    const qMovements = query(collection(db, 'movements'), orderBy('timestamp', 'desc'));
    const unsubMovements = onSnapshot(qMovements, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Movement));
      setMovements(data);
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubMovements();
    };
  }, []);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-brand-600"><Package className="animate-bounce" size={48}/></div>;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar view={view} setView={setView} />
      <main className="flex-1 min-w-0 flex flex-col h-full">
        <div className="flex-1 p-8 overflow-hidden">
           {view === 'DASHBOARD' && <DashboardView products={products} movements={movements} />}
           {view === 'INVENTORY' && <InventoryView products={products} />}
           {view === 'HISTORY' && <HistoryView movements={movements} />}
        </div>
      </main>
    </div>
  );
};

export default App;