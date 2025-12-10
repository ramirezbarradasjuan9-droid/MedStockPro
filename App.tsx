import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import InventoryList from './components/InventoryList';
import Reports from './components/Reports';
import { Transaction, StockItem } from './types';
import { INITIAL_TRANSACTIONS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('medistock_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Calculate stock based on transactions
  const [stock, setStock] = useState<StockItem[]>([]);
  const [inventoryMap, setInventoryMap] = useState<Record<string, number>>({});

  useEffect(() => {
    // Logic to derive stock from transaction history
    const stockMap: Record<string, StockItem> = {};
    const simpleMap: Record<string, number> = {};

    // Sort by date old to new to replay history correctly (though order doesn't affect final sum, helpful for debugging)
    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);

    sorted.forEach(t => {
      // Key defines a unique stock bucket: Material + Subtype + Lot
      const key = `${t.material}-${t.subtype || 'NA'}-${t.lot}`;
      
      if (!stockMap[key]) {
        stockMap[key] = {
          id: key,
          material: t.material,
          subtype: t.subtype,
          lot: t.lot,
          quantity: 0,
          lastUpdated: t.date
        };
      }

      if (t.type === 'IN') {
        stockMap[key].quantity += t.quantity;
      } else {
        stockMap[key].quantity -= t.quantity;
      }
      stockMap[key].lastUpdated = t.date;
    });

    // Convert map to array and filter out 0 or negative quantities if we only want to show positive stock
    // Or keep them to show history of empty lots. Let's keep >= 0.
    const stockArray = Object.values(stockMap).filter(item => item.quantity > 0);
    
    // Create simple map for quick lookup during validation
    stockArray.forEach(item => {
      simpleMap[item.id] = item.quantity;
    });

    setStock(stockArray);
    setInventoryMap(simpleMap);

    // Save to local storage
    localStorage.setItem('medistock_transactions', JSON.stringify(transactions));

  }, [transactions]);

  const handleSaveTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
  };

  const handleUpdateTransaction = (updatedT: Transaction) => {
     setTransactions(prev => prev.map(t => t.id === updatedT.id ? updatedT : t));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard stock={stock} transactions={transactions} />;
      case 'entry':
        return <TransactionForm type="IN" onSave={handleSaveTransaction} inventoryMap={inventoryMap} />;
      case 'exit':
        return <TransactionForm type="OUT" onSave={handleSaveTransaction} inventoryMap={inventoryMap} />;
      case 'inventory':
        return <InventoryList stock={stock} />;
      case 'reports':
        return <Reports transactions={transactions} onUpdateTransaction={handleUpdateTransaction} />;
      default:
        return <Dashboard stock={stock} transactions={transactions} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            {currentView === 'entry' ? 'Ingreso de Material' : 
             currentView === 'exit' ? 'Salida de Material' : 
             currentView === 'inventory' ? 'Inventario General' : 
             currentView}
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">Admin Usuario</p>
                <p className="text-xs text-slate-500">Medicina Preventiva</p>
             </div>
             <div className="h-10 w-10 bg-medical-100 rounded-full flex items-center justify-center text-medical-700 font-bold">
                MP
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;