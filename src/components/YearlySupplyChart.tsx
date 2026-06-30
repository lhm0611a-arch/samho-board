import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IndividualData, RequestData } from '../types';
import { getIndividualStatus } from '../utils';
import { WEEK_MAP } from '../constants';
import { CalendarDays, TrendingUp } from 'lucide-react';

interface YearlySupplyChartProps {
  individuals: IndividualData[];
  requestDB?: RequestData[];
}

export const YearlySupplyChart: React.FC<YearlySupplyChartProps> = ({ individuals, requestDB }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const chartData = useMemo(() => {
    // Initialize data for 12 months
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      name: `${i + 1}월`,
      actual: 0,
      target: 0
    }));

    // Calculate targets from requestDB
    if (requestDB) {
      requestDB.forEach(req => {
        const reqYear = 2025 + Math.floor((req.reqWeek - 1) / 52);
        if (reqYear === selectedYear) {
          const weekInYear = ((req.reqWeek - 1) % 52) + 1;
          const month = WEEK_MAP[weekInYear - 1]?.m;
          if (month && month >= 1 && month <= 12) {
            monthlyData[month - 1].target += req.reqCount;
          }
        }
      });
    } else {
      const baseTargets: Record<number, number> = {
        2024: 34,
        2025: 34,
        2026: 281,
        2027: 135
      };
      const yearTarget = baseTargets[selectedYear] || 0;
      monthlyData.forEach(item => {
        item.target = yearTarget / 12; // Flat distribution if no DB
      });
    }

    // Calculate actuals
    individuals.forEach(ind => {
      if (ind.entryPassWeek && typeof ind.entryPassWeek === 'number') {
        const year = 2025 + Math.floor((ind.entryPassWeek - 1) / 52);
        if (year === selectedYear) {
          const weekInYear = ((ind.entryPassWeek - 1) % 52) + 1;
          const month = WEEK_MAP[weekInYear - 1]?.m;
          if (month && month >= 1 && month <= 12) {
            monthlyData[month - 1].actual += 1;
          }
        }
      }
    });

    // Mock data for years without DB data (e.g., 2025 and 2027) as requested
    if (selectedYear === 2025 && monthlyData.every(d => d.actual === 0)) {
      // Last year mock
      const mock2025 = [2, 3, 2, 4, 3, 2, 3, 4, 3, 2, 3, 3];
      mock2025.forEach((val, i) => monthlyData[i].actual = val);
    } else if (selectedYear === 2027 && monthlyData.every(d => d.actual === 0)) {
      // Next year mock
      monthlyData[0].actual = 5;
      monthlyData[1].actual = 4;
    }

    // Make it cumulative
    let cumulativeActual = 0;
    let cumulativeTarget = 0;
    
    // Determine the current month if we are in the selected year, so we don't draw actuals into the future
    const currentDate = new Date();
    const currentMonth = currentDate.getFullYear() === selectedYear ? currentDate.getMonth() + 1 : (currentDate.getFullYear() > selectedYear ? 12 : 0);

    monthlyData.forEach(item => {
      cumulativeTarget += item.target;
      item.target = Math.round(cumulativeTarget);

      cumulativeActual += item.actual;
      
      if (item.month > currentMonth && currentDate.getFullYear() === selectedYear) {
        (item as any).actual = null;
      } else {
        item.actual = cumulativeActual;
      }
    });

    return monthlyData;
  }, [individuals, selectedYear, requestDB]);

  const yearTarget = useMemo(() => {
    if (requestDB) {
      return requestDB.reduce((sum, req) => {
        const reqYear = 2025 + Math.floor((req.reqWeek - 1) / 52);
        return reqYear === selectedYear ? sum + req.reqCount : sum;
      }, 0);
    }
    const baseTargets: Record<number, number> = {
      2024: 34,
      2025: 34,
      2026: 281,
      2027: 135
    };
    return baseTargets[selectedYear] || 0;
  }, [selectedYear, requestDB]);

  const currentActual = useMemo(() => {
    // Get the last non-null actual
    const validActuals = chartData.filter(d => d.actual !== null);
    if (validActuals.length > 0) {
      return validActuals[validActuals.length - 1].actual;
    }
    return 0;
  }, [chartData]);

  const achievementRate = yearTarget > 0 ? ((currentActual / yearTarget) * 100).toFixed(1) : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0f18]/90 backdrop-blur-md border border-[#232f43] p-4 rounded-xl shadow-xl">
          <p className="text-slate-300 font-mono font-bold mb-2">{`${selectedYear}년 ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm font-mono mt-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400 w-16">{entry.name}:</span>
              <span className="text-white font-bold">{entry.value}명</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0a0f18]/60 backdrop-blur-md rounded-2xl border border-[#2a3750] shadow-[0_0_15px_rgba(59,130,246,0.1)] overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 h-full" style={{ animationDelay: '400ms' }}>
      <div className="absolute inset-0 z-0 opacity-[0.1] mix-blend-screen pointer-events-none" style={{ backgroundImage: "url('/yard.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="relative z-10">
        <div className="px-4 sm:px-5 py-2 sm:py-[5px] mt-0 h-auto sm:h-[52px] border-b border-[#232f43] flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#151c28]/60 gap-3 sm:gap-0">
          <h3 className="font-bold text-white text-[13px] sm:text-[15px] tracking-wide flex items-center gap-1.5 sm:gap-2">
            <TrendingUp size={16} className="text-emerald-500 hidden sm:block" /> 연도별 누적 현황
          </h3>
          <div className="flex bg-[#0a0f18]/80 p-1 pt-1 rounded-xl border border-[#232f43] overflow-x-auto hide-scrollbar w-full sm:w-auto">
            {[2025, 2026, 2027].map(year => (
              <button 
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedYear === year ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {year}년
              </button>
            ))}
          </div>
        </div>
        
        <div className="px-3 md:px-[15px] py-[15px] h-auto border-t border-[#2a3750]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-[13px] gap-4">
            <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-1">목표 인원</p>
                <p className="text-xl md:text-2xl font-display font-black text-slate-300">{yearTarget}<span className="text-sm text-slate-500 font-medium ml-1">명</span></p>
              </div>
              <div className="h-10 w-[1px] bg-[#232f43]"></div>
              <div className="flex-1 sm:flex-none">
                <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-widest font-mono mb-1">현재 누적 달성</p>
                <p className="text-xl md:text-2xl font-display font-black text-emerald-400">{currentActual}<span className="text-sm text-slate-500 font-medium ml-1">명</span></p>
              </div>
            </div>
            
            <div className="bg-[#151c28]/80 px-4 py-2 rounded-xl border border-[#232f43] flex flex-col items-end justify-center w-full sm:w-auto">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">달성률</span>
              <span className="text-xl font-display font-black text-white">{achievementRate}<span className="text-xs text-slate-400 font-medium ml-1">%</span></span>
            </div>
          </div>

          <div className="h-[220px] sm:h-[265px] w-full mt-4 md:mt-2 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232f43" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1' }}
                />
                <Area type="monotone" dataKey="target" name="목표" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorTarget)" />
                <Area type="monotone" dataKey="actual" name="실적" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" activeDot={{ r: 6, fill: '#10b981', stroke: '#0a0f18', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
