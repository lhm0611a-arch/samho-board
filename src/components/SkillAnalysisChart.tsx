import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Award } from 'lucide-react';
import { IndividualData } from '../types';

interface Props {
  individuals: IndividualData[];
}

export function SkillAnalysisChart({ individuals }: Props) {
  const [chartView, setChartView] = useState<'type' | 'country'>('type');

  const { stats, statsByCountry, countriesList } = useMemo(() => {
    let totalKr = 0, totalSkill = 0;
    let countKr = 0, countSkill = 0;

    let e9Kr = 0, e9Skill = 0;
    let e9CountKr = 0, e9CountSkill = 0;

    let genKr = 0, genSkill = 0;
    let genCountKr = 0, genCountSkill = 0;

    const cStats: Record<string, { krTotal: number, krCount: number, skillTotal: number, skillCount: number }> = {};

    individuals.forEach(ind => {
      // Use main score if available, else pre score
      let kr = parseInt(ind.mainKrScore as string, 10);
      if (isNaN(kr)) kr = parseInt(ind.preKrScore as string, 10);

      let chibu = parseInt(ind.mainChibuScore as string, 10);
      if (isNaN(chibu)) chibu = parseInt(ind.preChibuScore as string, 10);

      let weld = parseInt(ind.mainWeldScore as string, 10);
      if (isNaN(weld)) weld = parseInt(ind.preWeldScore as string, 10);

      // Average skill score if both exist, else the one that exists.
      let skill = NaN;
      if (!isNaN(chibu) && !isNaN(weld)) {
        skill = Math.max(chibu, weld); // takes highest between chibu and weld
      } else if (!isNaN(chibu)) {
        skill = chibu;
      } else if (!isNaN(weld)) {
        skill = weld;
      }

      const isE9 = ind.isE9 === true;

      if (!isNaN(kr)) {
        totalKr += kr;
        countKr++;
        if (isE9) { e9Kr += kr; e9CountKr++; }
        else { genKr += kr; genCountKr++; }
      }

      if (!isNaN(skill)) {
        totalSkill += skill;
        countSkill++;
        if (isE9) { e9Skill += skill; e9CountSkill++; }
        else { genSkill += skill; genCountSkill++; }
      }

      const country = ind.country || '기타';
      if (!cStats[country]) {
        cStats[country] = { krTotal: 0, krCount: 0, skillTotal: 0, skillCount: 0 };
      }
      
      if (!isNaN(kr)) {
        cStats[country].krTotal += kr;
        cStats[country].krCount++;
      }
      if (!isNaN(skill)) {
        cStats[country].skillTotal += skill;
        cStats[country].skillCount++;
      }
    });

    const avg = (val: number, cnt: number) => cnt > 0 ? Math.round(val / cnt) : 0;

    const countryArr = Object.entries(cStats)
      .filter(([_, data]) => data.krCount > 0 || data.skillCount > 0)
      .map(([country, data]) => ({
        country,
        kr: avg(data.krTotal, data.krCount),
        skill: avg(data.skillTotal, data.skillCount),
      }))
      .sort((a, b) => b.skill - a.skill);

    const statsByCountry = [
      {
        group: '한국어 수준',
        ...countryArr.reduce((acc, c) => ({ ...acc, [c.country]: c.kr }), {})
      },
      {
        group: '직무 기량',
        ...countryArr.reduce((acc, c) => ({ ...acc, [c.country]: c.skill }), {})
      }
    ];

    return {
      stats: {
        total: { kr: avg(totalKr, countKr), skill: avg(totalSkill, countSkill) },
        e9: { kr: avg(e9Kr, e9CountKr), skill: avg(e9Skill, e9CountSkill) },
        gen: { kr: avg(genKr, genCountKr), skill: avg(genSkill, genCountSkill) }
      },
      statsByCountry,
      countriesList: countryArr.map(c => c.country)
    };
  }, [individuals]);

  const typeData = [
    {
      group: '한국어 수준',
      '전체 인원': stats.total.kr,
      'E-9 출신': stats.e9.kr,
      '일반 외국인': stats.gen.kr,
    },
    {
      group: '직무 기량',
      '전체 인원': stats.total.skill,
      'E-9 출신': stats.e9.skill,
      '일반 외국인': stats.gen.skill,
    }
  ];

  if (individuals.length === 0) {
    return null;
  }

  const chartData = chartView === 'type' ? typeData : statsByCountry;
  const COUNTRY_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444', '#f97316'];

  return (
    <div className="bg-[#0a0f18]/60 backdrop-blur-md rounded-2xl border border-[#2a3750] shadow-[0_0_15px_rgba(59,130,246,0.1)] overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 h-full" style={{ animationDelay: '500ms' }}>
      <div className="absolute inset-0 z-0 opacity-[0.1] mix-blend-screen pointer-events-none" style={{ backgroundImage: "url('/yard.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="relative z-10">
        <div className="px-4 sm:px-5 py-2 sm:py-[5px] mt-0 h-auto sm:h-[52px] border-b border-[#232f43] flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#151c28]/60 gap-3 sm:gap-0">
          <h3 className="font-bold text-white text-[13px] sm:text-[15px] tracking-wide flex items-center gap-1.5 sm:gap-2">
            <Award size={16} className="text-purple-500 hidden sm:block" /> 기량 및 한국어 수준 분석
          </h3>
          <div className="flex bg-[#0a0f18]/80 p-1 rounded-xl border border-[#232f43] overflow-x-auto hide-scrollbar w-full sm:w-auto">
            <button onClick={() => setChartView('type')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartView === 'type' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-slate-400 hover:text-slate-200'}`}>종류별 분석</button>
            <button onClick={() => setChartView('country')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartView === 'country' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-slate-400 hover:text-slate-200'}`}>국가별 분석</button>
          </div>
        </div>
        
        <div className="px-3 md:px-[15px] py-[15px] h-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-[13px] gap-4">
            <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">E-9 한국어 평균</span>
                <span className="text-xl font-display font-black text-white block">{stats.e9.kr}<span className="text-xs text-slate-400 font-medium ml-1">점</span></span>
              </div>
              <div className="w-[1px] h-8 bg-[#232f43] hidden sm:block"></div>
              <div className="flex-1 sm:flex-none">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">E-9 기량 평균</span>
                <span className="text-xl font-display font-black text-white block">{stats.e9.skill}<span className="text-xs text-slate-400 font-medium ml-1">점</span></span>
              </div>
            </div>
            
            <div className="bg-[#151c28]/80 border border-[#232f43] rounded-xl px-4 py-2 flex flex-col items-end w-full sm:w-auto">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">전체 기량 평균</span>
              <span className="text-xl font-display font-black text-white">{stats.total.skill}<span className="text-xs text-slate-400 font-medium ml-1">점</span></span>
            </div>
          </div>

          <div className="h-[220px] sm:h-[265px] w-full mt-4 md:mt-2 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232f43" vertical={false} />
                <XAxis dataKey="group" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '12px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px', padding: '2px 0' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {chartView === 'type' ? (
                  <>
                    <Bar dataKey="E-9 출신" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="일반 외국인" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="전체 인원" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  </>
                ) : (
                  countriesList.map((country, idx) => (
                    <Bar key={country} dataKey={country} fill={COUNTRY_COLORS[idx % COUNTRY_COLORS.length]} radius={[4, 4, 0, 0]} barSize={15} />
                  ))
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
