import React from 'react';
import { LayoutDashboard, PlusCircle, MinusCircle, FileText, Package, Settings, Activity } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'entry', label: 'Ingreso Material', icon: PlusCircle },
    { id: 'exit', label: 'Salida Material', icon: MinusCircle },
    { id: 'inventory', label: 'Inventario Actual', icon: Package },
    { id: 'reports', label: 'Reportes y Datos', icon: FileText },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-full flex flex-col shadow-xl z-20 transition-all duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-medical-500 p-2 rounded-lg">
          <Activity size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">MediStock Pro</h1>
          <p className="text-xs text-slate-400">Medicina Preventiva</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-medical-600 text-white shadow-lg shadow-medical-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} className={currentView === item.id ? 'animate-pulse' : ''} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-4 text-xs text-slate-400 text-center">
          <p>v1.0.0 Stable</p>
          <p className="mt-1">Dpto. Medicina Preventiva</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;