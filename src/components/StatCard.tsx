import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  colorClass: string;
  onClick: () => void;
  isSelected: boolean;
  activeStatus: boolean;
  badge?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  colorClass, 
  onClick, 
  isSelected, 
  activeStatus, 
  badge 
}) => (
  <div 
    onClick={onClick} 
    className={`bg-[#0a0f18]/80 backdrop-blur-md p-5 sm:p-6 rounded-2xl transition-all duration-300 cursor-pointer flex items-center space-x-4 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] relative overflow-hidden group ${
      isSelected 
        ? 'border border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-blue-900/20' 
        : `border border-[#232f43] ${activeStatus && !isSelected ? 'opacity-50 grayscale' : ''}`
    }`}
  >
    <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 text-white pointer-events-none">
      <Icon size={120} />
    </div>
    <div className={`p-3.5 rounded-xl shadow-md shrink-0 relative z-10 ${isSelected ? colorClass : 'bg-[#151c28] border border-[#232f43]'}`}>
      <Icon size={24} className={isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white transition-colors'} />
    </div>
    <div className="flex flex-col justify-center min-w-0 relative z-10 flex-1">
      <div className="flex justify-between items-start mb-1 w-full gap-2">
        <h3 className="text-slate-300 text-xs sm:text-sm font-semibold tracking-wider uppercase truncate">{title}</h3>
        {badge && badge}
      </div>
      <div className="flex items-baseline space-x-2 flex-wrap">
        <span className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${isSelected ? 'text-white' : 'text-slate-100'}`}>{value}</span>
        <span className="text-xs font-medium text-slate-300 tracking-wide">{subtitle}</span>
      </div>
    </div>
  </div>
);
