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
      <div className="bg-[#0a0f18]/95 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-[#232f43]">
        <div className="border-b border-[#232f43] p-5 sm:p-6 flex justify-between items-center bg-[#151c28] shrink-0 gap-4">
          <div className="flex items-center space-x-4 min-w-0">
            <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30 shrink-0">
              <Factory size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold truncate break-keep tracking-tight text-white">{dept} 부서 상세 매칭 (예측)</h2>
            </div>
            <span className="hidden sm:inline-flex items-center bg-[#151c28] text-slate-200 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ml-2 border border-[#232f43] tabular-nums">
              총 요청: {totalReq}명
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-[#1a2332] transition-all shrink-0"><X size={24} /></button>
        </div>
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 hide-scrollbar">
          <div className="overflow-x-auto rounded-xl border border-[#232f43] bg-[#0a0f18]">
            <table className="w-full text-center border-collapse min-w-[750px]">
              <thead className="bg-[#151c28] text-slate-200 text-xs border-b border-[#232f43]">
                <tr>
                  <th className="p-3.5 sm:p-4 font-semibold break-keep w-[280px] align-middle text-center tracking-wider">투입 직무 (요청일자)</th>
                  <th className="p-3.5 sm:p-4 font-semibold break-keep w-[120px] align-middle text-center tracking-wider">요청 인원</th>
                  <th className="p-3.5 sm:p-4 font-semibold break-keep w-2/5 align-middle text-center tracking-wider">자동 매칭 결과 ({statusLabel})</th>
                  <th className="p-3.5 sm:p-4 font-semibold break-keep w-1/6 align-middle text-center leading-tight tracking-wider">
                    진행 상태<br/>
                    <span className="text-xs text-slate-400 font-normal">({getWeekStr(currentWeek)} 기준)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm">
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
                    <tr key={idx} className="border-b border-[#232f43]/40 hover:bg-[#151c28] transition-colors">
                      <td className="p-3.5 sm:p-4 text-white font-semibold break-keep align-middle w-[280px]">
                        <div className="flex items-center justify-center space-x-2.5">
                          <Briefcase size={18} className="text-blue-400 shrink-0" />
                          <span className="text-sm sm:text-base whitespace-nowrap">{item.job} <span className="text-slate-300 font-normal ml-1 whitespace-nowrap text-xs">({getWeekStr(item.reqWeek)})</span></span>
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4 text-blue-300 font-bold text-lg sm:text-xl whitespace-nowrap align-middle text-center tabular-nums w-[120px]">{item.reqCount}명</td>
                      <td className="p-3.5 sm:p-4 align-middle text-center">
                        {filteredFulfillments.length === 0 ? (
                          <span className="text-slate-400 font-medium bg-[#151c28] px-3 py-1.5 rounded-lg break-keep border border-[#232f43] text-xs">해당 인원 없음</span>
                        ) : (
                          <div className="space-y-2 flex flex-col items-center">
                            {filteredFulfillments.map((f, fIdx) => (
                              <div key={fIdx} className={`flex items-center justify-center flex-wrap gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border ${f.supplyWeek !== null && f.supplyWeek <= currentWeek ? 'bg-blue-950/60 border-blue-500/50 text-blue-200 shadow-sm' : 'bg-[#0a0f18] border-[#232f43] text-slate-200'}`}>
                                <span className={`whitespace-nowrap ${f.supplyWeek !== null && f.supplyWeek <= currentWeek ? 'text-blue-300' : 'text-slate-300'}`}>{f.supplyWeek ? getWeekStr(f.supplyWeek) : '입국주차 미정'}</span> 
                                <span className="text-slate-500 mx-1">➔</span>
                                <span className="text-sm whitespace-nowrap font-bold text-white tabular-nums">{f.count}명</span>
                                {f.isFixed && <span className="text-xs bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700 font-medium whitespace-nowrap">배치확정</span>}
                                <span className="flex items-center text-xs bg-black/60 py-0.5 px-2 rounded-lg text-slate-300 border border-[#232f43] break-keep ml-1.5">
                                  <span className={`text-xs px-1.5 py-0.5 rounded flex items-center ${authRole === 'production' ? '' : 'mr-1.5'} font-semibold whitespace-nowrap ${f.country === '베트남' ? 'bg-red-950/60 text-red-300' : 'bg-emerald-950/60 text-emerald-300'}`}>
                                    {f.country}
                                  </span>
                                  {authRole !== 'production' && f.agency}
                                </span>
                              </div>
                            ))}
                            {(filterStatus === null || filterStatus === 'planned') && (item.unfulfilledCount || 0) > 0 && (
                              <div className="text-xs text-red-300 font-semibold mt-1 px-2 break-keep whitespace-nowrap flex items-center"><AlertCircle size={13} className="mr-1"/> {item.unfulfilledCount}명 매칭 대기중</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 sm:p-4 align-middle text-center">
                        {isFullyArrived ? 
                          <span className="px-3 py-1 rounded-lg font-semibold bg-blue-950/60 text-sky-300 text-xs break-keep whitespace-nowrap border border-blue-500/40">배치완료</span> : 
                          arrivedCount > 0 ? 
                          <span className="px-3 py-1 rounded-lg font-semibold bg-indigo-950/60 text-indigo-300 text-xs break-keep whitespace-nowrap border border-indigo-500/40 tabular-nums">부분 ({arrivedCount}/{item.reqCount})</span> :
                          <span className="px-3 py-1 rounded-lg font-semibold bg-[#151c28] text-slate-300 text-xs break-keep whitespace-nowrap border border-[#232f43]">입국대기</span>
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
