import React, { useMemo } from 'react';
import { Building, X, Briefcase, Clock, CheckCircle2, MapPin } from 'lucide-react';
import { AgencySupplyData, IndividualData } from '../types';
import { getWeekStr } from '../utils';

interface AgencyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyName: string | null;
  agencySupplyDB: AgencySupplyData[];
  individuals: IndividualData[];
}

export const AgencyDetailModal: React.FC<AgencyDetailModalProps> = ({ isOpen, onClose, agencyName, agencySupplyDB, individuals }) => {
  const sampleAgency = agencyName ? agencySupplyDB.find(a => a.agency === agencyName) : null;
  const country = sampleAgency ? sampleAgency.country : '';

  const jobMap: Record<string, { expected: any[], confirmed: any[], totalExpected: number, totalConfirmed: number }> = {};

  if (agencyName) {
    agencySupplyDB.filter(a => a.agency === agencyName).forEach(a => {
      if (!jobMap[a.job]) jobMap[a.job] = { expected: [], confirmed: [], totalExpected: 0, totalConfirmed: 0 };
      const existingExp = jobMap[a.job].expected.find(e => e.week === a.supplyWeek);
      if (existingExp) {
        existingExp.count += a.count;
      } else {
        jobMap[a.job].expected.push({ week: a.supplyWeek, count: a.count });
      }
      jobMap[a.job].totalExpected += a.count;
    });

    individuals.filter(ind => ind.agency === agencyName && typeof ind.entryPassWeek === 'number').forEach(ind => {
      if (!jobMap[ind.job]) jobMap[ind.job] = { expected: [], confirmed: [], totalExpected: 0, totalConfirmed: 0 };
      const existingConf = jobMap[ind.job].confirmed.find(c => c.week === ind.entryPassWeek);
      if (existingConf) {
        existingConf.count++;
      } else {
        jobMap[ind.job].confirmed.push({ week: ind.entryPassWeek, count: 1 });
      }
      jobMap[ind.job].totalConfirmed += 1;
    });
  }

  const sortWeeks = (a: any, b: any) => (a.week || 999) - (b.week || 999);

  const getEarliestWeek = (jobData: any) => {
    const expectedWeeks = jobData.expected.map((e: any) => e.week || 999);
    const confirmedWeeks = jobData.confirmed.map((c: any) => c.week || 999);
    return Math.min(...expectedWeeks, ...confirmedWeeks, 999);
  };

  const renderWeekBadge = (week: number | null, count: number, type: 'expected' | 'confirmed', key: number) => (
    <div key={key} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold font-mono border ${type === 'confirmed' ? 'bg-blue-900/30 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-[#0a0f18] border-[#232f43] text-slate-300'}`}>
       <span>{week ? getWeekStr(week) : '일정 미정'}</span>
       <span className={`w-px h-4 ${type === 'confirmed' ? 'bg-blue-500/50' : 'bg-white/20'}`}></span>
       <span className="text-sm sm:text-base font-black tracking-tighter text-white">{count}명</span>
    </div>
  );

  const jobs = Object.keys(jobMap).sort((a, b) => getEarliestWeek(jobMap[a]) - getEarliestWeek(jobMap[b]));

  return isOpen && agencyName ? (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-[#232f43] ">
        <div className="border-b border-[#232f43] p-5 sm:p-6 flex justify-between items-center bg-[#151c28] shrink-0 gap-4">
          <div className="flex items-center space-x-4 min-w-0">
            <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30 shrink-0">
              <Building size={24} className="text-blue-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-display font-black truncate break-keep tracking-tight text-white">
              {agencyName} <span className="text-slate-500 text-base font-bold font-mono">({country})</span> 세부 공급 현황
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-[#1a2332] transition-all shrink-0"><X size={24} /></button>
        </div>
        
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 hide-scrollbar">
          {jobs.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-slate-500">
               <Briefcase size={48} className="mb-4 opacity-20" />
               <p className="font-extrabold font-mono text-lg">해당 업체의 배정 데이터가 없습니다.</p>
             </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => {
                const { expected, confirmed, totalExpected, totalConfirmed } = jobMap[job];
                return (
                  <div key={job} className="bg-[#0a0f18] border border-[#232f43] rounded-xl p-6 hover:border-blue-500/50 transition-all flex flex-col group hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="flex flex-wrap items-center justify-between mb-6 gap-3 border-b border-[#232f43] pb-5">
                      <h3 className="text-lg font-display font-black text-white flex items-center tracking-tight">
                        <Briefcase size={20} className="text-blue-500 mr-2 group-hover:animate-pulse" /> {job}
                      </h3>
                      <div className="flex gap-3">
                        <span className="text-sm font-extrabold font-mono text-slate-400 bg-[#151c28] px-4 py-2 rounded-lg border border-[#232f43] flex items-center">계획 <span className="ml-2 font-black text-white">{totalExpected}</span>명</span>
                        <span className="text-sm font-extrabold font-mono text-blue-400 bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-500/50 flex items-center shadow-[0_0_10px_rgba(59,130,246,0.2)]">확정 <span className="ml-2 font-black text-white">{totalConfirmed}</span>명</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-5">
                      {/* 예상 일정 */}
                      <div className="flex-1 bg-[#151c28] p-5 rounded-xl border border-[#232f43] flex flex-col">
                        <h4 className="text-xs font-extrabold text-slate-400 mb-4 flex items-center uppercase tracking-widest font-mono">
                          <Clock size={16} className="mr-2"/> 입국 예상 (공급계획)
                        </h4>
                        <div className="flex flex-wrap gap-2.5">
                          {expected.length > 0 
                            ? expected.sort(sortWeeks).map((e, i) => renderWeekBadge(e.week, e.count, 'expected', i))
                            : <span className="text-sm text-slate-500 font-bold p-2 font-mono">예상 일정 없음</span>}
                        </div>
                      </div>
                      
                      {/* 확정 일정 */}
                      <div className="flex-1 bg-blue-900/10 p-5 rounded-xl border border-blue-500/20 flex flex-col">
                        <h4 className="text-xs font-extrabold text-blue-400 mb-4 flex items-center uppercase tracking-widest font-mono">
                          <CheckCircle2 size={16} className="mr-2"/> 입국 확정 (실제명단)
                        </h4>
                        <div className="flex flex-wrap gap-2.5">
                          {confirmed.length > 0 
                            ? confirmed.sort(sortWeeks).map((c, i) => renderWeekBadge(c.week, c.count, 'confirmed', i))
                            : <span className="text-sm text-slate-500 font-bold p-2 font-mono">확정된 인원 없음</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;
};
