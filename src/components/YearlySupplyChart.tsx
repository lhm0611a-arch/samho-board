import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IndividualData, RequestData } from '../types';
import { getIndividualStatus } from '../utils';
import { WEEK_MAP } from '../constants';
import { CalendarDays, TrendingUp } from 'lucide-react';

interface YearlySupplyChartProps {
  individuals: IndividualData[];
  requestDB?: RequestData[];
  currentWeek?: number;
}

export const YearlySupplyChart: React.FC<YearlySupplyChartProps> = ({ individuals, requestDB, currentWeek = 86 }) => {
  const currentYear = 2025 + Math.floor((currentWeek - 1) / 52);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const chartData = useMemo(() => {
    // Initialize data for 12 months
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      name: `${i + 1}월`,
      actual: 0 as number | null,
      target: 0
    }));

    // Calculate targets from requestDB
    if (requestDB && requestDB.length > 0) {
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
      monthlyData.forEach(item => {
        item.target = 0;
      });
    }

    // Calculate actuals: only individuals whose entryPassWeek <= currentWeek (actually arrived)
    individuals.forEach(ind => {
      if (typeof ind.entryPassWeek === 'number' && ind.entryPassWeek <= currentWeek) {
        const year = 2025 + Math.floor((ind.entryPassWeek - 1) / 52);
        if (year === selectedYear) {
          const weekInYear = ((ind.entryPassWeek - 1) % 52) + 1;
          const month = WEEK_MAP[weekInYear - 1]?.m;
          if (month && month >= 1 && month <= 12) {
            monthlyData[month - 1].actual = ((monthlyData[month - 1].actual as number) || 0) + 1;
          }
        }
      }
    });

    // Make it cumulative
    let cumulativeActual = 0;
    let cumulativeTarget = 0;
    
    // Determine the current month if we are in the selected year, so we don't draw actuals into the future
    const currentWeekInYear = ((currentWeek - 1) % 52) + 1;
    const currentMonthOfTimeline = WEEK_MAP[currentWeekInYear - 1]?.m || 8;
    const isFutureYear = selectedYear > currentYear;
    const isCurrentYear = selectedYear === currentYear;

    monthlyData.forEach(item => {
      cumulativeTarget += item.target;
      item.target = Math.round(cumulativeTarget);

      if (isFutureYear) {
        // Future year has no actuals yet
        item.actual = null;
      } else if (isCurrentYear) {
        if (item.month > currentMonthOfTimeline) {
          item.actual = null;
        } else {
          cumulativeActual += (item.actual as number) || 0;
          item.actual = cumulativeActual;
        }
      } else {
        // Past year
        cumulativeActual += (item.actual as number) || 0;
        item.actual = cumulativeActual;
      }
    });

    return monthlyData;
  }, [individuals, selectedYear, requestDB, currentWeek, currentYear]);

  const yearTarget = useMemo(() => {
    if (requestDB && requestDB.length > 0) {
      return requestDB.reduce((sum, req) => {
        const reqYear = 2025 + Math.floor((req.reqWeek - 1) / 52);
        return reqYear === selectedYear ? sum + req.reqCount : sum;
      }, 0);
    }
    return 0;
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
        <div className="bg-[#0a0f18]/95 backdrop-blur-md border border-[#232f43] p-3.5 rounded-xl shadow-2xl">
          <p className="text-slate-200 text-xs font-semibold mb-2">{`${selectedYear}년 ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs mt-1">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300 w-12">{entry.name}:</span>
              <span className="text-white font-bold tabular-nums">{entry.value}명</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0a0f18]/60 backdrop-blur-md rounded-2xl border border-[#3b4a6b] shadow-[0_0_15px_rgba(59,130,246,0.1)] overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 h-full" style={{ animationDelay: '400ms' }}>
      <div className="absolute inset-0 z-0 opacity-[0.1] mix-blend-screen pointer-events-none" style={{ backgroundImage: "url('/yard.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="relative z-10">
        <div className="px-4 sm:px-5 py-2 sm:py-2.5 h-auto sm:h-[52px] border-b border-[#232f43] flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#151c28]/60 gap-3 sm:gap-0">
          <h3 className="font-bold text-white text-sm sm:text-base tracking-wide flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400 hidden sm:block" /> 연도별 누적 현황
          </h3>
          <div className="flex bg-[#0a0f18]/80 p-1 rounded-xl border border-[#232f43] overflow-x-auto hide-scrollbar w-full sm:w-auto">
            {[2025, 2026, 2027].map(year => (
              <button 
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${selectedYear === year ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 shadow-sm' : 'text-slate-300 hover:text-white'}`}
              >
                {year}년
              </button>
            ))}
          </div>
        </div>
        
        <div className="px-4 sm:px-5 py-4 h-auto border-t border-[#3b4a6b]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3.5 gap-4">
            <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <p className="text-xs text-slate-300 font-medium mb-1">목표 인원</p>
                <p className="text-xl md:text-2xl font-bold text-slate-100 tabular-nums">{yearTarget}<span className="text-xs text-slate-400 font-normal ml-1">명</span></p>
              </div>
              <div className="h-8 w-[1px] bg-[#232f43]"></div>
              <div className="flex-1 sm:flex-none">
                <p className="text-xs text-emerald-400 font-semibold mb-1">현재 누적 달성</p>
                <p className="text-xl md:text-2xl font-bold text-emerald-300 tabular-nums">{currentActual}<span className="text-xs text-emerald-400/80 font-normal ml-1">명</span></p>
              </div>
            </div>
            
            <div className="bg-[#151c28]/90 px-4 py-2 rounded-xl border border-[#232f43] flex flex-col items-end justify-center w-full sm:w-auto">
              <span className="text-xs text-slate-300 font-medium mb-0.5">달성률</span>
              <span className="text-xl font-bold text-white tabular-nums">{achievementRate}<span className="text-xs text-slate-300 font-normal ml-1">%</span></span>
            </div>
          </div>

          <div className="h-[175px] sm:h-[210px] w-full mt-4 md:mt-2 min-h-[175px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={175}>
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
