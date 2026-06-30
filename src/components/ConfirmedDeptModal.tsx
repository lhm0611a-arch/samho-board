import React from 'react';
import { UserCheck, X, ShieldCheck, MapPin, PlayCircle, FileText, Users } from 'lucide-react';
import { getWeekStr } from '../utils';

interface ConfirmedDeptModalProps {
  isOpen: boolean;
  onClose: () => void;
  selection: { dept: string; job: string | null } | null;
  confirmedDeptSummary: any[];
  filterStatus: string | null;
  authRole: string | null;
}

export const ConfirmedDeptModal: React.FC<ConfirmedDeptModalProps> = ({ isOpen, onClose, selection, confirmedDeptSummary, filterStatus, authRole }) => {
  const deptData = (confirmedDeptSummary && selection) ? confirmedDeptSummary.find(d => d.name === selection.dept) : null;

  let displayInds: any[] = [];
  if (deptData && selection) {
    if (selection.job) {
       displayInds = deptData.jobs[selection.job]?.inds || [];
    } else {
       Object.values(deptData.jobs).forEach((j: any) => displayInds.push(...j.inds));
    }
  }

  let statusLabel = '총 인원';
  if (filterStatus === 'completed') statusLabel = '입국 완료';
  else if (filterStatus === 'planned') statusLabel = '입국 예정';
  else if (filterStatus === 'current_wave') statusLabel = '당해 입국';

  return isOpen && selection && deptData ? (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] w-full max-w-6xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-[#232f43] ">
        <div className="border-b border-[#232f43] p-5 sm:p-6 flex justify-between items-center bg-[#151c28] shrink-0 gap-4">
          <div className="flex items-center space-x-4 min-w-0">
            <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30 shrink-0">
               <UserCheck size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-black tracking-tight truncate break-keep text-white">
                {selection.dept} 부서 확정 명단 {selection.job && <span className="text-blue-500/70 ml-2 font-bold font-mono">- {selection.job}</span>}
              </h2>
            </div>
            <span className="hidden sm:inline-flex items-center bg-[#151c28] text-slate-300 px-3 py-1 rounded-lg text-xs font-extrabold font-mono whitespace-nowrap ml-4 border border-[#232f43]">
              {statusLabel}: {displayInds.length}명
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-[#1a2332] transition-all shrink-0"><X size={24} /></button>
        </div>
        <div className="p-0 sm:p-6 overflow-y-auto flex-1 hide-scrollbar">
          {displayInds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Users size={64} className="mb-4 opacity-20" />
              <p className="font-extrabold font-mono text-lg">해당 조건에 부합하는 확정(입국) 명단이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto sm:rounded-xl border border-[#232f43] bg-[#0a0f18]">
              <table className="w-full text-center border-collapse min-w-[850px]">
                <thead className="bg-[#151c28] text-slate-400 text-xs sm:text-sm border-b border-[#232f43] font-mono">
                  <tr>
                    <th className="p-2 sm:p-3 font-extrabold align-middle w-10 border-r border-white/5 text-[11px] uppercase tracking-widest">No.</th>
                    <th className="p-2 sm:p-3 font-extrabold align-middle text-center border-r border-white/5 text-[11px] uppercase tracking-widest">
                      <div className="flex items-center justify-center">응시번호 (성명)</div>
                    </th>
                    <th className="p-2 sm:p-3 font-extrabold align-middle border-r border-white/5 text-center text-[11px] uppercase tracking-widest">{authRole === 'production' ? '국가' : '국가 / 업체'}</th>
                    <th className="p-2 sm:p-3 font-extrabold align-middle border-r border-white/5 text-center text-[11px] uppercase tracking-widest">투입 직무</th>
                    <th className="p-2 sm:p-3 font-extrabold align-middle border-r border-white/5 bg-blue-900/20 text-blue-400 text-center text-[11px] uppercase tracking-widest">
                      본기량 상세 점수<br/>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold tracking-tight">취부 / 용접 / 한국어</span>
                    </th>
                    <th className="p-2 sm:p-3 font-extrabold align-middle text-center border-r border-white/5 text-[11px] uppercase tracking-widest">첨부 (영상/인성)</th>
                    <th className="p-2 sm:p-3 font-extrabold align-middle text-center text-[11px] uppercase tracking-widest">입국 주차</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] sm:text-sm font-medium">
                  {displayInds.map((ind, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-[#151c28] transition-colors">
                      <td className="p-2 sm:p-3 text-slate-500 font-bold border-r border-white/5 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 sm:p-3 text-white align-middle border-r border-white/5">
                        <div className="flex items-center justify-start gap-2 pl-2 sm:pl-6">
                          <span className="font-mono text-[10px] sm:text-[11px] font-black text-slate-400 bg-[#151c28] px-1.5 py-0.5 rounded border border-[#232f43] shrink-0">{ind.uid}</span>
                          <span className="font-extrabold whitespace-nowrap tracking-tight text-xs sm:text-sm font-mono">{ind.name}</span>
                          {ind.isE9 && <span className="bg-amber-900/30 text-amber-500 text-[9px] px-1.5 py-0.5 rounded font-black border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] flex items-center shrink-0 font-mono"><ShieldCheck size={10} className="mr-0.5"/>E-9</span>}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 align-middle text-center border-r border-white/5">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <MapPin size={12} className={ind.country === '베트남' ? 'text-red-400' : 'text-emerald-400'} />
                          <span className="font-bold text-slate-300 text-xs font-mono">{ind.country}</span>
                        </div>
                        {authRole !== 'production' && (
                          <div className="text-[10px] text-slate-500 font-bold font-mono">{ind.agency} <span className="font-normal text-slate-600">({ind.track})</span></div>
                        )}
                      </td>
                      <td className="p-2 sm:p-3 text-slate-300 font-extrabold border-r border-white/5 text-xs text-center font-mono">{ind.job}</td>
                      
                      <td className="p-2 sm:p-3 align-middle text-center border-r border-white/5 bg-blue-900/10">
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                          <div className="flex flex-col items-center w-7 sm:w-8">
                            <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold mb-0.5 font-mono">취부</span>
                            <span className={`font-display font-black tracking-tighter ${Number(ind.mainChibuScore) >= 80 ? 'text-blue-400 text-base shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-slate-400 text-sm'}`}>{ind.mainChibuScore || '-'}</span>
                          </div>
                          <div className="w-px h-5 bg-[#1a2332]"></div>
                          <div className="flex flex-col items-center w-7 sm:w-8">
                            <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold mb-0.5 font-mono">용접</span>
                            <span className={`font-display font-black tracking-tighter ${Number(ind.mainWeldScore) >= 80 ? 'text-blue-400 text-base shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-slate-400 text-sm'}`}>{ind.mainWeldScore || '-'}</span>
                          </div>
                          <div className="w-px h-5 bg-[#1a2332]"></div>
                          <div className="flex flex-col items-center w-7 sm:w-8">
                            <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold mb-0.5 font-mono">한국어</span>
                            <span className={`font-display font-black tracking-tighter ${Number(ind.mainKrScore) >= 15 ? 'text-emerald-400 text-base shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'text-slate-400 text-sm'}`}>{ind.mainKrScore || '-'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-2 sm:p-3 align-middle text-center border-r border-white/5">
                         <div className="flex flex-row gap-1.5 items-center justify-center">
                            {ind.videoUrl ? (
                              <a 
                                href={ind.videoUrl.startsWith('http') ? ind.videoUrl : `https://${ind.videoUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center px-2 py-1 bg-[#1a2332] text-white border border-white/20 rounded text-[10px] sm:text-[11px] font-extrabold hover:bg-white/20 transition-all shadow-[0_0_10px_rgba(255,255,255,0.1)] active:scale-95 whitespace-nowrap font-mono"
                              >
                                <PlayCircle size={12} className="mr-1 text-blue-400" /> 영상
                              </a>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2 py-1 bg-[#0a0f18] text-slate-600 border border-white/5 rounded text-[10px] sm:text-[11px] font-bold whitespace-nowrap font-mono">-</span>
                            )}
                            {ind.personalityTestUrl ? (
                              <a 
                                href={ind.personalityTestUrl.startsWith('http') ? ind.personalityTestUrl : `https://${ind.personalityTestUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center px-2 py-1 bg-white text-slate-900 border border-transparent rounded text-[10px] sm:text-[11px] font-extrabold hover:bg-blue-100 transition-all shadow-[0_0_10px_rgba(255,255,255,0.5)] active:scale-95 whitespace-nowrap font-mono"
                              >
                                <FileText size={12} className="mr-1 text-blue-600" /> 인성
                              </a>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2 py-1 bg-[#0a0f18] text-slate-600 border border-white/5 rounded text-[10px] sm:text-[11px] font-bold whitespace-nowrap font-mono">-</span>
                            )}
                         </div>
                      </td>
                      <td className="p-2 sm:p-3 text-blue-400 font-black text-center font-mono">{ind.entryPassWeek ? getWeekStr(ind.entryPassWeek) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;
};
