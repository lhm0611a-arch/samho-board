import React, { useState, useMemo, useEffect } from 'react';
import { UserX, Clock, UserCheck, Download, X, Users, MapPin, ShieldCheck, PlayCircle, FileText, BookOpen, CheckCircle2 } from 'lucide-react';
import { IndividualData } from '../types';
import { getIndividualStatus, getWeekStr } from '../utils';

interface IndividualDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage?: string;
  viewType?: string;
  individuals: IndividualData[];
  currentWeek: number;
  authRole: string | null;
}

export const IndividualDetailModal: React.FC<IndividualDetailModalProps> = ({ isOpen, onClose, stage, viewType, individuals, currentWeek, authRole }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'uid', direction: 'asc' });

  useEffect(() => {
    setSortConfig({ key: 'uid', direction: 'asc' });
  }, [stage, viewType]);

  const filteredIndividuals = useMemo(() => {
      if (!isOpen || !stage) return [];
      return individuals.filter(ind => {
          const st = getIndividualStatus(ind, currentWeek);
          const isPreArea = ['사전기량검증완료', '1차 육성(기량,한국어)'].includes(stage);
          const isMainStage = ['본기량검증완료', '2차 육성(기량,한국어)', '입국'].includes(stage);
          
          if (isPreArea && !ind.hasPreData) return false;
          if (isMainStage && !ind.hasMainData) return false;

          if (viewType === 'dropped') {
              if (stage === '사전기량검증완료') return st.preDropped;
              if (stage === '본기량검증완료') return st.mainDropped;
              if (stage === '입국') return st.entryDropped;
          } else if (viewType === 'waiting') {
              if (stage === '사전기량검증완료') return st.preWaiting;
              if (stage === '본기량검증완료') return st.mainWaiting;
          } else if (viewType === 'passed') {
              if (stage === '사전기량검증완료') return st.prePassed;
              if (stage === '본기량검증완료') return st.mainPassed;
              if (stage === '입국') return st.entryPassed;
          } else if (viewType === 'current') {
              if (stage === '1차 육성(기량,한국어)') return st.currentStage === '1차 육성(기량,한국어)';
              if (stage === '2차 육성(기량,한국어)') return st.currentStage === '2차 육성(기량,한국어)';
          }
          return false;
      });
  }, [isOpen, stage, viewType, individuals, currentWeek]);

  const sortedIndividuals = useMemo(() => {
    if (!isOpen || !stage) return [];
    let sortable = [...filteredIndividuals];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal: string | number = (a as any)[sortConfig.key];
        let bVal: string | number = (b as any)[sortConfig.key];

        if (['preChibuScore', 'preWeldScore', 'preKrScore', 'mainChibuScore', 'mainWeldScore', 'mainKrScore', 'age'].includes(sortConfig.key)) {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        } else {
          aVal = String(aVal || '');
          bVal = String(bVal || '');
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [isOpen, stage, filteredIndividuals, sortConfig]);

  const requestSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return <span className="opacity-30 ml-1 text-[10px]">↕</span>;
    return sortConfig.direction === 'asc' ? <span className="text-blue-400 ml-1 font-black text-[10px]">↑</span> : <span className="text-blue-400 ml-1 font-black text-[10px]">↓</span>;
  };

  const handleDownloadExcel = () => {
    const headers = [
      "응시번호", "직무", "성명", "생년월일", "E-9여부", "나이",
      "한국어점수", "취부점수", "용접점수",
      "국가"
    ];
    if (authRole !== 'production') {
        headers.push("송출업체");
    }
    headers.push(
      "본평가일자(주차)", "본기량합격(주차)", "본기량탈락(주차)",
      "입국일자(주차)", "입국탈락(주차)",
      "배치부서", "영상URL", "인성검사URL"
    );

    const rows = sortedIndividuals.map(ind => {
        const row = [
          ind.uid || '',
          ind.job || '',
          ind.name || '',
          ind.dob || '',
          ind.isE9 ? 'O' : 'X',
          ind.age || '',
          ind.mainKrScore || '',
          ind.mainChibuScore || '',
          ind.mainWeldScore || '',
          ind.country || ''
        ];
        if (authRole !== 'production') {
            row.push(ind.agency || '');
        }
        row.push(
          ind.mainTestWeek ? `${ind.mainTestWeek}주차` : '',
          ind.mainPassWeek ? `${ind.mainPassWeek}주차` : '',
          ind.mainDropWeek ? `${ind.mainDropWeek}주차` : '',
          ind.entryPassWeek ? `${ind.entryPassWeek}주차` : '',
          ind.entryDropWeek ? `${ind.entryDropWeek}주차` : '',
          ind.isDeptFixed ? ind.displayDept || '' : '대기',
          ind.videoUrl || '',
          ind.personalityTestUrl || ''
        );
        return row;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${stage}_명단.csv`;
    link.click();
  };

  const isPreArea = stage ? ['사전기량검증완료', '1차 육성(기량,한국어)'].includes(stage) : false;
  const isMainStage = stage ? ['본기량검증완료', '2차 육성(기량,한국어)', '입국'].includes(stage) : false;
  const showExtraColumns = isMainStage;
  
  let titleLabel = '진행(완료)';
  if (viewType === 'dropped') titleLabel = '탈락자';
  else if (viewType === 'waiting') titleLabel = '결과 대기';
  else if (viewType === 'passed') titleLabel = '합격(완료)';
  else if (viewType === 'current') titleLabel = '체류(교육중)';

  return isOpen && stage ? (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] w-full max-w-7xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-[#232f43] ">
        <div className="border-b border-[#232f43] p-5 sm:p-6 flex justify-between items-center bg-[#151c28] shrink-0 gap-4">
          <div className="flex items-center space-x-4 min-w-0">
            <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30 shrink-0">
              {viewType === 'dropped' ? <UserX size={24} className="text-red-400" /> : (viewType === 'waiting' ? <Clock size={24} className="text-blue-400" /> : <UserCheck size={24} className="text-emerald-400" />)}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-black tracking-tight truncate break-keep text-white">
                [{stage}] {titleLabel} 명단
              </h2>
              <p className="text-xs font-extrabold text-slate-400 mt-1 whitespace-nowrap font-mono uppercase tracking-widest">
                타임라인 기준: {getWeekStr(currentWeek)}
              </p>
            </div>
            <div className="hidden sm:flex ml-4 shrink-0 items-center gap-2">
              <span className="bg-[#151c28] text-slate-300 px-3 py-1 rounded-lg text-xs font-extrabold font-mono whitespace-nowrap border border-[#232f43]">
                총 인원: {filteredIndividuals.length}명
              </span>
              {(stage === '2차 육성(기량,한국어)' || stage === '입국') && (
                <button 
                  onClick={handleDownloadExcel}
                  className="flex items-center bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded-lg text-xs font-extrabold border border-emerald-500/50 transition-colors font-mono shadow-[0_0_10px_rgba(52,211,153,0.2)]"
                >
                  <Download size={14} className="mr-1.5" /> 엑셀 다운로드
                </button>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-[#1a2332] transition-all shrink-0"><X size={24} /></button>
        </div>
        <div className="p-0 sm:p-6 overflow-y-auto flex-1 hide-scrollbar">
          {filteredIndividuals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Users size={64} className="mb-4 opacity-20" />
              <p className="font-extrabold font-mono text-lg">해당 조건에 일치하는 명단이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto sm:rounded-xl border border-[#232f43] bg-[#0a0f18]">
              <table className={`w-full text-center border-collapse ${isMainStage ? 'min-w-[1000px]' : 'min-w-[750px]'}`}>
                <thead className="bg-[#151c28] text-slate-400 text-xs sm:text-sm border-b border-[#232f43] font-mono">
                  <tr>
                    <th className="p-2 sm:p-3 font-extrabold align-middle text-center w-10 border-r border-white/5 text-[11px] uppercase tracking-widest">No.</th>
                    <th className="p-2 sm:p-3 font-extrabold align-middle text-center border-r border-white/5 cursor-pointer hover:bg-[#1a2332] transition-colors text-[11px] uppercase tracking-widest" onClick={() => requestSort('uid')}>
                      <div className="flex items-center justify-center">응시번호 (성명) <SortIcon columnKey="uid" /></div>
                    </th>
                    <th className="p-2 sm:p-3 font-extrabold align-middle text-center border-r border-white/5 cursor-pointer hover:bg-[#1a2332] transition-colors text-[11px] uppercase tracking-widest" onClick={() => requestSort('age')}>
                      <div className="flex items-center justify-center">나이 <SortIcon columnKey="age" /></div>
                    </th>
                    <th className="p-2 sm:p-3 font-extrabold align-middle text-center border-r border-white/5 cursor-pointer hover:bg-[#1a2332] transition-colors text-[11px] uppercase tracking-widest" onClick={() => requestSort('country')}>
                      <div className="flex items-center justify-center">{authRole === 'production' ? '국가' : '국가 / 업체명'} <SortIcon columnKey="country" /></div>
                    </th>
                    <th className="p-2 sm:p-3 font-extrabold align-middle text-center border-r border-white/5 cursor-pointer hover:bg-[#1a2332] transition-colors text-[11px] uppercase tracking-widest" onClick={() => requestSort('job')}>
                      <div className="flex items-center justify-center">직무 / <span className="text-blue-400 ml-1">배치부서</span> <SortIcon columnKey="job" /></div>
                    </th>
                    
                    <th className="p-2 sm:p-3 font-extrabold align-middle text-center border-r border-white/5 bg-purple-900/20 text-[11px] uppercase tracking-widest">
                      <div className="text-purple-400">{isPreArea ? '사전기량' : '본기량'} 상세 점수</div>
                      <div className="text-[10px] font-bold text-slate-500 mt-0.5 flex justify-center gap-3">
                        <span className="cursor-pointer hover:text-purple-400 flex items-center" onClick={() => requestSort(isPreArea ? 'preChibuScore' : 'mainChibuScore')}>취부<SortIcon columnKey={isPreArea ? 'preChibuScore' : 'mainChibuScore'} /></span>
                        <span>/</span>
                        <span className="cursor-pointer hover:text-purple-400 flex items-center" onClick={() => requestSort(isPreArea ? 'preWeldScore' : 'mainWeldScore')}>용접<SortIcon columnKey={isPreArea ? 'preWeldScore' : 'mainWeldScore'} /></span>
                        <span>/</span>
                        <span className="cursor-pointer hover:text-purple-400 flex items-center" onClick={() => requestSort(isPreArea ? 'preKrScore' : 'mainKrScore')}>한국어<SortIcon columnKey={isPreArea ? 'preKrScore' : 'mainKrScore'} /></span>
                      </div>
                    </th>
                    
                    {showExtraColumns && (
                      <th className="p-2 sm:p-3 font-extrabold align-middle text-center border-r border-white/5 text-[11px] uppercase tracking-widest">
                        첨부 (영상/인성)
                        <div className="mt-1.5 flex justify-center">
                          <a 
                            href="https://drive.google.com/file/d/1JvxYQqmevHsnp7CWW200Oup50j64sZWR/view?usp=sharing" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border border-blue-500/50 px-2 py-1 rounded text-[10px] font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <BookOpen size={10} className="mr-1" /> 인성검사설명서
                          </a>
                        </div>
                      </th>
                    )}
                    <th className="p-2 sm:p-3 font-extrabold align-middle text-center text-[11px] uppercase tracking-widest">진행 상태</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] sm:text-sm font-medium">
                  {sortedIndividuals.map((ind, idx) => {
                    const status = getIndividualStatus(ind, currentWeek);
                    const scores = isPreArea ? { c: ind.preChibuScore, w: ind.preWeldScore, k: ind.preKrScore } : { c: ind.mainChibuScore, w: ind.mainWeldScore, k: ind.mainKrScore };
                    return (
                      <tr key={idx} className={`border-b border-white/5 hover:bg-[#151c28] transition-colors ${status.isDropped ? 'bg-red-900/10' : ''}`}>
                        <td className="p-2 sm:p-3 text-slate-500 align-middle text-center font-bold border-r border-white/5 font-mono">{idx + 1}</td>
                        <td className="p-2 sm:p-3 text-white align-middle border-r border-white/5">
                          <div className="flex items-center justify-start gap-2 pl-2 sm:pl-6">
                            <span className="font-mono text-[10px] sm:text-[11px] font-black text-slate-400 bg-[#151c28] px-1.5 py-0.5 rounded border border-[#232f43] shrink-0">{ind.uid}</span>
                            <span className="font-bold text-xs sm:text-sm whitespace-nowrap tracking-tight font-mono">{ind.name || '이름없음'}</span>
                            {ind.isE9 && <span className="bg-amber-900/30 text-amber-500 text-[9px] px-1.5 py-0.5 rounded font-black border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] flex items-center shrink-0 font-mono"><ShieldCheck size={10} className="mr-0.5"/>E-9</span>}
                          </div>
                        </td>
                        <td className="p-2 sm:p-3 align-middle text-center border-r border-white/5 whitespace-nowrap">
                          <span className="font-extrabold text-slate-300 text-xs font-mono">{ind.age ? `${ind.age}세` : '-'}</span>
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
                        
                        <td className="p-2 sm:p-3 text-white align-middle text-center border-r border-white/5 whitespace-nowrap">
                          <div className="font-extrabold mb-1 text-xs font-mono">{ind.job}</div>
                          <div className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex justify-center items-center font-mono ${ind.isDeptFixed ? 'bg-blue-900/30 text-blue-400 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-[#151c28] text-slate-400 border border-[#232f43]'}`}>
                            {ind.isDeptFixed ? `${ind.displayDept} (확정)` : '대기'}
                          </div>
                        </td>
                        
                        <td className="p-2 sm:p-3 align-middle text-center border-r border-white/5 bg-blue-900/10">
                            <div className="flex items-center justify-center gap-2 sm:gap-3">
                              <div className="flex flex-col items-center w-7 sm:w-8">
                                <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold mb-0.5 font-mono">취부</span>
                                <span className={`font-display font-black tracking-tighter ${Number(scores.c) >= 80 ? 'text-blue-400 text-base shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-slate-400 text-sm'}`}>{scores.c || '-'}</span>
                              </div>
                              <div className="w-px h-5 bg-[#1a2332]"></div>
                              <div className="flex flex-col items-center w-7 sm:w-8">
                                <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold mb-0.5 font-mono">용접</span>
                                <span className={`font-display font-black tracking-tighter ${Number(scores.w) >= 80 ? 'text-blue-400 text-base shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-slate-400 text-sm'}`}>{scores.w || '-'}</span>
                              </div>
                              <div className="w-px h-5 bg-[#1a2332]"></div>
                              <div className="flex flex-col items-center w-7 sm:w-8">
                                <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold mb-0.5 font-mono">한국어</span>
                                <span className={`font-display font-black tracking-tighter ${Number(scores.k) >= 15 ? 'text-emerald-400 text-base shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'text-slate-400 text-sm'}`}>{scores.k || '-'}</span>
                              </div>
                            </div>
                        </td>

                        {showExtraColumns && (
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
                        )}

                        <td className="p-2 sm:p-3 align-middle text-center whitespace-nowrap">
                          {status.isDropped ? (
                            <span className="inline-flex items-center bg-red-900/30 text-red-400 px-2 py-1 rounded text-[11px] sm:text-xs font-bold border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)] font-mono">
                              <UserX size={14} className="mr-1" /> 탈락
                            </span>
                          ) : status.stage === '입국' ? (
                            <span className="inline-flex items-center bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-[11px] sm:text-xs font-bold border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] font-mono">
                              <CheckCircle2 size={14} className="mr-1" /> 완료
                            </span>
                          ) : (
                            <span className="inline-flex items-center bg-[#151c28] text-slate-300 px-2 py-1 rounded text-[11px] sm:text-xs font-bold border border-[#232f43] font-mono">
                              <CheckCircle2 size={14} className="mr-1" /> 진행 ({status.stage})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;
};
