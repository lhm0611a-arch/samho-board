import React from 'react';
import { Factory, X, Briefcase, AlertCircle } from 'lucide-react';
import { RequestData } from '../types';
import { getWeekStr } from '../utils';

interface DeptModalProps {
  isOpen: boolean;
  onClose: () => void;
  dept: string | null;
  data: RequestData[];
  currentWeek: number;
  filterStatus: string | null;
  authRole: string | null;
}

export const DeptModal: React.FC<DeptModalProps> = ({ isOpen, onClose, dept, data, currentWeek, filterStatus, authRole }) => {
  if (!isOpen || !dept) return null;
  const totalReq = data.reduce((sum, item) => sum + item.reqCount, 0);
  
  let statusLabel = '매칭 합계';
  if (filterStatus === 'completed') statusLabel = '입국 완료';
  else if (filterStatus === 'planned') statusLabel = '입국 예정';
  else if (filterStatus === 'current_wave') statusLabel = '당해 입국';

  return isOpen && dept ? (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-[#232f43] ">
        <div className="border-b border-[#232f43] p-5 sm:p-6 flex justify-between items-center bg-[#151c28] shrink-0 gap-4">
          <div className="flex items-center space-x-4 min-w-0">
            <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30 shrink-0">
              <Factory size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-black truncate break-keep tracking-tight text-white">{dept} 부서 상세 매칭 (예측)</h2>
            </div>
            <span className="hidden sm:inline-flex items-center bg-[#151c28] text-slate-300 px-3 py-1 rounded-lg text-xs font-extrabold font-mono whitespace-nowrap ml-2 border border-[#232f43]">
              총 요청: {totalReq}명
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-[#1a2332] transition-all shrink-0"><X size={24} /></button>
        </div>
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 hide-scrollbar">
          <div className="overflow-x-auto rounded-xl border border-[#232f43] bg-[#0a0f18]">
            <table className="w-full text-center border-collapse min-w-[750px]">
              <thead className="bg-[#151c28] text-slate-400 text-sm sm:text-base border-b border-[#232f43] font-mono">
                <tr>
                  <th className="p-4 sm:p-5 font-extrabold break-keep w-[300px] align-middle text-center uppercase tracking-widest text-[11px]">투입 직무 (요청일자)</th>
                  <th className="p-4 sm:p-5 font-extrabold break-keep w-[120px] align-middle text-center uppercase tracking-widest text-[11px]">요청 인원</th>
                  <th className="p-4 sm:p-5 font-extrabold pl-8 break-keep w-2/5 align-middle text-center uppercase tracking-widest text-[11px]">자동 매칭 결과 ({statusLabel})</th>
                  <th className="p-4 sm:p-5 font-extrabold break-keep w-1/6 align-middle text-center leading-tight uppercase tracking-widest text-[11px]">
                    진행 상태<br/>
                    <span className="text-[9px] font-bold text-slate-500 tracking-tight">({getWeekStr(currentWeek)} 기준)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm sm:text-base">
                {data.map((item, idx) => {
                  const arrivedCount = item.fulfillments?.filter(f => f.supplyWeek !== null && f.supplyWeek <= currentWeek).reduce((sum, f) => sum + f.count, 0) || 0;
                  const isFullyArrived = arrivedCount >= item.reqCount && item.reqCount > 0;

                  const filteredFulfillments = item.fulfillments?.filter(f => {
                    if (filterStatus === 'completed') return f.supplyWeek !== null && f.supplyWeek <= currentWeek;
                    if (filterStatus === 'planned') return f.supplyWeek === null || f.supplyWeek > currentWeek;
                    if (filterStatus === 'current_wave') return f.supplyWeek === currentWeek;
                    return true;
                  }) || [];

                  if (filterStatus !== null && filteredFulfillments.length === 0) return null;

                  return (
                    <tr key={idx} className="border-b border-white/5 hover:bg-[#151c28] transition-colors">
                      <td className="p-4 sm:p-5 text-white font-extrabold break-keep align-middle w-[300px]">
                        <div className="flex items-center justify-center space-x-3">
                          <Briefcase size={20} className="text-blue-500 shrink-0" />
                          <span className="text-base sm:text-lg whitespace-nowrap font-mono">{item.job} <span className="text-slate-500 font-bold ml-1 whitespace-nowrap text-sm">({getWeekStr(item.reqWeek)})</span></span>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 text-blue-400 font-display font-black text-xl sm:text-2xl whitespace-nowrap align-middle text-center tracking-tighter w-[120px]">{item.reqCount}명</td>
                      <td className="p-4 sm:p-5 align-middle text-center">
                        {filteredFulfillments.length === 0 ? (
                          <span className="text-slate-400 font-extrabold font-mono bg-[#151c28] px-3 py-1.5 rounded-lg break-keep border border-[#232f43] text-xs">해당 인원 없음</span>
                        ) : (
                          <div className="space-y-2 flex flex-col items-center">
                            {filteredFulfillments.map((f, fIdx) => (
                              <div key={fIdx} className={`flex items-center justify-center flex-wrap gap-2 font-extrabold font-mono px-3 py-2 rounded-xl border ${f.supplyWeek !== null && f.supplyWeek <= currentWeek ? 'bg-blue-900/30 border-blue-500/50 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-[#0a0f18] border-[#232f43] text-slate-300'}`}>
                                <span className={`font-black whitespace-nowrap ${f.supplyWeek !== null && f.supplyWeek <= currentWeek ? 'text-blue-400' : 'text-slate-400'}`}>{f.supplyWeek ? getWeekStr(f.supplyWeek) : '입국주차 미정'}</span> 
                                <span className="text-slate-600 mx-1">➔</span>
                                <span className="text-base whitespace-nowrap font-display font-black text-white">{f.count}명</span>
                                {f.isFixed && <span className="text-[10px] bg-[#1a2332] text-slate-300 px-1.5 py-0.5 rounded border border-[#232f43] font-bold whitespace-nowrap">배치확정</span>}
                                <span className="flex items-center text-xs bg-black/60 py-1 px-2 rounded-lg text-slate-400 border border-[#232f43] break-keep ml-2">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center ${authRole === 'production' ? '' : 'mr-1.5'} font-black whitespace-nowrap ${f.country === '베트남' ? 'bg-red-900/50 text-red-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                                    {f.country}
                                  </span>
                                  {authRole !== 'production' && f.agency}
                                </span>
                              </div>
                            ))}
                            {(filterStatus === null || filterStatus === 'planned') && (item.unfulfilledCount || 0) > 0 && (
                              <div className="text-xs sm:text-sm text-red-400 font-extrabold font-mono mt-2 px-2 break-keep whitespace-nowrap flex items-center"><AlertCircle size={14} className="mr-1"/> {item.unfulfilledCount}명 매칭 대기중</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 sm:p-5 align-middle text-center">
                        {isFullyArrived ? 
                          <span className="px-4 py-1.5 rounded-lg font-extrabold font-mono bg-blue-600/20 text-blue-400 text-xs break-keep whitespace-nowrap border border-blue-500/30">배치완료</span> : 
                          arrivedCount > 0 ? 
                          <span className="px-4 py-1.5 rounded-lg font-extrabold font-mono bg-indigo-900/30 text-indigo-400 text-xs break-keep whitespace-nowrap border border-indigo-500/30">부분 ({arrivedCount}/{item.reqCount})</span> :
                          <span className="px-4 py-1.5 rounded-lg font-extrabold font-mono bg-[#151c28] text-slate-400 text-xs break-keep whitespace-nowrap border border-[#232f43]">입국대기</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
