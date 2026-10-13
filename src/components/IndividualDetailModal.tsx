import React, { useState, useMemo, useEffect } from 'react';
import { UserX, Clock, UserCheck, Download, X, Users, MapPin, ShieldCheck, PlayCircle, FileText, BookOpen, CheckCircle2 } from 'lucide-react';
import { IndividualData } from '../types';
import { getIndividualStatus, getWeekStr } from '../utils';
import { MediaViewerModal, MediaViewerTarget } from './MediaViewerModal';

interface IndividualDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage?: string;
  viewType?: string;
  individuals: IndividualData[];
  currentWeek: number;
  authRole: string | null;
  startWeekForYear?: number;
  endWeekForYear?: number;
}

export const IndividualDetailModal: React.FC<IndividualDetailModalProps> = ({
  isOpen,
  onClose,
  stage,
  viewType,
  individuals,
  currentWeek,
  authRole,
  startWeekForYear = 1,
  endWeekForYear = 5200,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'uid', direction: 'asc' });
  const [activeMedia, setActiveMedia] = useState<MediaViewerTarget | null>(null);

  useEffect(() => {
    setSortConfig({ key: 'uid', direction: 'asc' });
  }, [stage, viewType]);

  const filteredIndividuals = useMemo(() => {
      if (!isOpen || !stage) return [];
      return individuals.filter(ind => {
          const isPreInYear = typeof ind.preTestWeek === 'number' && ind.preTestWeek >= startWeekForYear && ind.preTestWeek <= endWeekForYear;
          const isMainInYear = typeof ind.mainTestWeek === 'number' && ind.mainTestWeek >= startWeekForYear && ind.mainTestWeek <= endWeekForYear;
          const isEntryInYear = typeof ind.entryPassWeek === 'number' && ind.entryPassWeek >= startWeekForYear && ind.entryPassWeek <= endWeekForYear;
          const isEntryDropInYear = typeof ind.entryDropWeek === 'number' && ind.entryDropWeek >= startWeekForYear && ind.entryDropWeek <= endWeekForYear;

          const st = getIndividualStatus(ind, currentWeek);
          const isPreArea = ['사전기량검증완료', '1차 육성(기량,한국어)'].includes(stage);
          const isMainStage = ['본기량검증완료', '2차 육성(기량,한국어)', '입국'].includes(stage);
          
          if (isPreArea && !ind.hasPreData) return false;
          if (isMainStage && !ind.hasMainData) return false;

          if (viewType === 'dropped') {
              if (stage === '사전기량검증완료') return st.preDropped && (isPreInYear || startWeekForYear === 1 && endWeekForYear >= 5000);
              if (stage === '본기량검증완료') return st.mainDropped && (isMainInYear || startWeekForYear === 1 && endWeekForYear >= 5000);
              if (stage === '입국') return st.entryDropped && (isEntryDropInYear || startWeekForYear === 1 && endWeekForYear >= 5000);
          } else if (viewType === 'waiting') {
              if (stage === '사전기량검증완료') return st.preWaiting && (isPreInYear || startWeekForYear === 1 && endWeekForYear >= 5000);
              if (stage === '본기량검증완료') return st.mainWaiting && (isMainInYear || startWeekForYear === 1 && endWeekForYear >= 5000);
          } else if (viewType === 'passed') {
              if (stage === '사전기량검증완료') return st.prePassed && (isPreInYear || startWeekForYear === 1 && endWeekForYear >= 5000);
              if (stage === '본기량검증완료') return st.mainPassed && (isMainInYear || startWeekForYear === 1 && endWeekForYear >= 5000);
              if (stage === '입국') return st.entryPassed && (isEntryInYear || startWeekForYear === 1 && endWeekForYear >= 5000);
          } else if (viewType === 'current') {
              if (stage === '1차 육성(기량,한국어)') {
                return st.currentStage === '1차 육성(기량,한국어)';
              }
              if (stage === '2차 육성(기량,한국어)') {
                return st.currentStage === '2차 육성(기량,한국어)';
              }
          }
          return false;
      });
  }, [isOpen, stage, viewType, individuals, currentWeek, startWeekForYear, endWeekForYear]);

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
      <div className="bg-[#0a0f18]/95 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] w-full max-w-7xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-[#232f43]">
        <div className="border-b border-[#232f43] p-5 sm:p-6 flex justify-between items-center bg-[#151c28] shrink-0 gap-4">
          <div className="flex items-center space-x-4 min-w-0">
            <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30 shrink-0">
              {viewType === 'dropped' ? <UserX size={24} className="text-red-400" /> : (viewType === 'waiting' ? <Clock size={24} className="text-blue-400" /> : <UserCheck size={24} className="text-emerald-400" />)}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight truncate break-keep text-white">
                [{stage}] {titleLabel} 명단
              </h2>
              <p className="text-xs font-medium text-slate-300 mt-1 whitespace-nowrap">
                타임라인 기준: {getWeekStr(currentWeek)}
              </p>
            </div>
            <div className="hidden sm:flex ml-4 shrink-0 items-center gap-2">
              <span className="bg-[#151c28] text-slate-200 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border border-[#232f43] tabular-nums">
                총 인원: {filteredIndividuals.length}명
              </span>
              {(stage === '2차 육성(기량,한국어)' || stage === '입국') && (
                <button 
                  onClick={handleDownloadExcel}
                  className="flex items-center bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 px-3 py-1 rounded-lg text-xs font-semibold border border-emerald-500/50 transition-colors shadow-sm"
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
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Users size={64} className="mb-4 opacity-30" />
              <p className="font-semibold text-base sm:text-lg text-slate-300">해당 조건에 일치하는 명단이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto sm:rounded-xl border border-[#232f43] bg-[#0a0f18]">
              <table className="w-full text-center border-collapse min-w-[980px]">
                <thead className="bg-[#151c28] text-slate-200 text-xs border-b border-[#232f43]">
                  <tr>
                    <th className="py-3 px-2 font-semibold text-center w-12 border-r border-[#232f43]/40 tracking-wider whitespace-nowrap">No.</th>
                    <th className="py-3 px-3 font-semibold text-center border-r border-[#232f43]/40 cursor-pointer hover:bg-[#1a2332] transition-colors tracking-wider whitespace-nowrap" onClick={() => requestSort('uid')}>
                      <div className="inline-flex items-center justify-center gap-1 whitespace-nowrap">응시번호 (성명) <SortIcon columnKey="uid" /></div>
                    </th>
                    <th className="py-3 px-2 font-semibold text-center border-r border-[#232f43]/40 cursor-pointer hover:bg-[#1a2332] transition-colors tracking-wider whitespace-nowrap w-16" onClick={() => requestSort('age')}>
                      <div className="inline-flex items-center justify-center gap-1 whitespace-nowrap">나이 <SortIcon columnKey="age" /></div>
                    </th>
                    <th className="py-3 px-3 font-semibold text-center border-r border-[#232f43]/40 cursor-pointer hover:bg-[#1a2332] transition-colors tracking-wider whitespace-nowrap" onClick={() => requestSort('country')}>
                      <div className="inline-flex items-center justify-center gap-1 whitespace-nowrap">{authRole === 'production' ? '국가' : '국가 / 업체명'} <SortIcon columnKey="country" /></div>
                    </th>
                    <th className="py-3 px-3 font-semibold text-center border-r border-[#232f43]/40 cursor-pointer hover:bg-[#1a2332] transition-colors tracking-wider whitespace-nowrap" onClick={() => requestSort('job')}>
                      <div className="inline-flex items-center justify-center gap-1 whitespace-nowrap">직무 / <span className="text-sky-300">배치부서</span> <SortIcon columnKey="job" /></div>
                    </th>
                    
                    <th className="py-2.5 px-3 font-semibold text-center border-r border-[#232f43]/40 bg-purple-950/20 text-xs tracking-wider whitespace-nowrap">
                      <div className="text-purple-300 font-semibold whitespace-nowrap">{isPreArea ? '사전기량' : '본기량'} 상세 점수</div>
                      <div className="text-xs font-normal text-slate-300 mt-0.5 flex justify-center items-center gap-1.5 whitespace-nowrap">
                        <span className="cursor-pointer hover:text-purple-300 inline-flex items-center" onClick={() => requestSort(isPreArea ? 'preChibuScore' : 'mainChibuScore')}>취부<SortIcon columnKey={isPreArea ? 'preChibuScore' : 'mainChibuScore'} /></span>
                        <span className="text-slate-500">/</span>
                        <span className="cursor-pointer hover:text-purple-300 inline-flex items-center" onClick={() => requestSort(isPreArea ? 'preWeldScore' : 'mainWeldScore')}>용접<SortIcon columnKey={isPreArea ? 'preWeldScore' : 'mainWeldScore'} /></span>
                        <span className="text-slate-500">/</span>
                        <span className="cursor-pointer hover:text-purple-300 inline-flex items-center" onClick={() => requestSort(isPreArea ? 'preKrScore' : 'mainKrScore')}>한국어<SortIcon columnKey={isPreArea ? 'preKrScore' : 'mainKrScore'} /></span>
                      </div>
                    </th>
                    
                    {showExtraColumns && (
                      <th className="py-2.5 px-3 font-semibold text-center border-r border-[#232f43]/40 text-xs tracking-wider whitespace-nowrap">
                        <div className="whitespace-nowrap">첨부 (영상/인성)</div>
                        <div className="mt-0.5 flex justify-center whitespace-nowrap">
                          <a 
                            href="https://drive.google.com/file/d/1JvxYQqmevHsnp7CWW200Oup50j64sZWR/view?usp=sharing" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center bg-blue-950/60 text-sky-300 hover:bg-blue-900/60 border border-blue-500/40 px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                          >
                            <BookOpen size={11} className="mr-1" /> 인성검사설명서
                          </a>
                        </div>
                      </th>
                    )}
                    <th className="py-3 px-3 font-semibold text-center text-xs tracking-wider whitespace-nowrap">진행 상태</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm">
                  {sortedIndividuals.map((ind, idx) => {
                    const status = getIndividualStatus(ind, currentWeek);
                    const scores = isPreArea ? { c: ind.preChibuScore, w: ind.preWeldScore, k: ind.preKrScore } : { c: ind.mainChibuScore, w: ind.mainWeldScore, k: ind.mainKrScore };
                    return (
                      <tr key={idx} className={`border-b border-[#232f43]/40 hover:bg-[#151c28] transition-colors ${viewType === 'dropped' || status.isDropped ? 'bg-red-950/15' : ''}`}>
                        <td className="py-2.5 px-2 text-slate-400 align-middle text-center font-medium tabular-nums border-r border-[#232f43]/40">{idx + 1}</td>
                        <td className="py-2.5 px-3 text-white align-middle text-center border-r border-[#232f43]/40 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                            <span className="font-mono text-xs font-semibold text-slate-300 bg-[#151c28] px-1.5 py-0.5 rounded border border-[#232f43] shrink-0">{ind.uid}</span>
                            <span className="font-semibold text-xs sm:text-sm text-white whitespace-nowrap">{ind.name || '이름없음'}</span>
                            {ind.isE9 && <span className="bg-amber-950/60 text-amber-300 text-xs px-1.5 py-0.5 rounded font-semibold border border-amber-500/40 flex items-center shrink-0"><ShieldCheck size={11} className="mr-0.5"/>E-9</span>}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 align-middle text-center border-r border-[#232f43]/40 whitespace-nowrap">
                          <span className="font-medium text-slate-200 text-xs sm:text-sm tabular-nums whitespace-nowrap">{ind.age ? `${ind.age}세` : '-'}</span>
                        </td>
                        <td className="py-2.5 px-3 align-middle text-center border-r border-[#232f43]/40 whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1 mb-0.5 whitespace-nowrap">
                            <MapPin size={12} className={ind.country === '베트남' ? 'text-red-400' : 'text-emerald-400'} />
                            <span className="font-semibold text-slate-200 text-xs sm:text-sm whitespace-nowrap">{ind.country}</span>
                          </div>
                          {authRole !== 'production' && (
                            <div className="text-xs text-slate-300 font-normal whitespace-nowrap">{ind.agency} <span className="text-slate-400">({ind.track})</span></div>
                          )}
                        </td>
                        
                        <td className="py-2.5 px-3 text-white align-middle text-center border-r border-[#232f43]/40 whitespace-nowrap">
                          <div className="font-semibold text-xs sm:text-sm mb-1 text-slate-200 whitespace-nowrap">{ind.job}</div>
                          <div className={`text-xs font-semibold px-2 py-0.5 rounded inline-flex justify-center items-center whitespace-nowrap ${ind.isDeptFixed ? 'bg-blue-950/60 text-sky-300 border border-blue-500/40' : 'bg-[#151c28] text-slate-400 border border-[#232f43]'}`}>
                            {ind.isDeptFixed ? `${ind.displayDept} (확정)` : '대기'}
                          </div>
                        </td>
                        
                        <td className="py-2.5 px-3 align-middle text-center border-r border-[#232f43]/40 bg-purple-950/10">
                          {ind.job === '전기' || ind.job === '도장' ? (
                            <div className="flex flex-col items-center justify-center py-0.5">
                              <span className="text-xs text-amber-300 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40 mb-1 whitespace-nowrap">
                                직무검증 비대상 (한국어 전형)
                              </span>
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-slate-300 font-medium">한국어:</span>
                                <span className={`font-bold tabular-nums ${Number(scores.k) >= 15 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                  {scores.k ? `${scores.k}점` : '평가대기'}
                                </span>
                                {(ind.mainKrGrade || ind.preKrGrade) && (
                                  <span className="text-xs font-bold text-sky-300 bg-blue-950/60 px-1 rounded border border-blue-500/40">
                                    {ind.mainKrGrade || ind.preKrGrade}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2.5 text-xs">
                              <div className="flex flex-col items-center w-8">
                                <span className="text-xs text-slate-400 mb-0.5">취부</span>
                                <span className={`font-bold tabular-nums ${Number(scores.c) >= 80 ? 'text-sky-300' : 'text-slate-200'}`}>{scores.c || '-'}</span>
                              </div>
                              <div className="w-px h-4 bg-slate-700/60"></div>
                              <div className="flex flex-col items-center w-8">
                                <span className="text-xs text-slate-400 mb-0.5">용접</span>
                                <span className={`font-bold tabular-nums ${Number(scores.w) >= 80 ? 'text-sky-300' : 'text-slate-200'}`}>{scores.w || '-'}</span>
                              </div>
                              <div className="w-px h-4 bg-slate-700/60"></div>
                              <div className="flex flex-col items-center w-8">
                                <span className="text-xs text-slate-400 mb-0.5">한국어</span>
                                <span className={`font-bold tabular-nums ${Number(scores.k) >= 15 ? 'text-emerald-300' : 'text-slate-200'}`}>{scores.k || '-'}</span>
                              </div>
                            </div>
                          )}
                        </td>

                        {showExtraColumns && (
                          <td className="py-2.5 px-3 align-middle text-center border-r border-[#232f43]/40">
                             <div className="flex flex-row gap-1.5 items-center justify-center">
                                {ind.videoUrl ? (
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMedia({
                                        url: ind.videoUrl,
                                        type: 'video',
                                        title: '기량 평가 및 인터뷰 영상',
                                        candidateName: ind.name,
                                        candidateUid: ind.uid,
                                        candidateJob: ind.job,
                                        candidateAgency: ind.agency,
                                        candidateDept: ind.assignedDept || ind.dept,
                                        scoreInfo: (scores.w || scores.k) ? `용접 ${scores.w || '-'}점 / 한국어 ${scores.k || '-'}점` : undefined,
                                      });
                                    }}
                                    title="프로그램 내에서 영상 바로 실행"
                                    className="inline-flex items-center justify-center px-2 py-1 bg-sky-950/60 text-sky-300 border border-sky-500/40 hover:bg-sky-900/60 hover:border-sky-400 rounded text-xs font-semibold transition-all active:scale-95 whitespace-nowrap shadow-sm cursor-pointer"
                                  >
                                    <PlayCircle size={13} className="mr-1 text-sky-400" /> 영상
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center justify-center px-2 py-1 bg-[#0a0f18] text-slate-500 border border-white/5 rounded text-xs">-</span>
                                )}
                                {ind.personalityTestUrl ? (
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMedia({
                                        url: ind.personalityTestUrl,
                                        type: 'personality',
                                        title: '인성 검사 결과 보고서',
                                        candidateName: ind.name,
                                        candidateUid: ind.uid,
                                        candidateJob: ind.job,
                                        candidateAgency: ind.agency,
                                        candidateDept: ind.assignedDept || ind.dept,
                                        scoreInfo: (scores.w || scores.k) ? `용접 ${scores.w || '-'}점 / 한국어 ${scores.k || '-'}점` : undefined,
                                      });
                                    }}
                                    title="프로그램 내에서 인성 검사 결과 바로 실행"
                                    className="inline-flex items-center justify-center px-2 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60 hover:border-emerald-400 rounded text-xs font-semibold transition-all active:scale-95 whitespace-nowrap shadow-sm cursor-pointer"
                                  >
                                    <FileText size={13} className="mr-1 text-emerald-400" /> 인성
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center justify-center px-2 py-1 bg-[#0a0f18] text-slate-500 border border-white/5 rounded text-xs">-</span>
                                )}
                             </div>
                          </td>
                        )}

                        <td className="py-2.5 px-3 align-middle text-center whitespace-nowrap">
                          {viewType === 'dropped' || status.isDropped ? (
                            <span className="inline-flex items-center bg-red-950/60 text-red-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-red-500/50">
                              <UserX size={13} className="mr-1" /> 탈락
                            </span>
                          ) : stage === '입국' || (viewType === 'passed' && status.entryPassed) ? (
                            <span className="inline-flex items-center bg-blue-950/60 text-sky-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-500/50">
                              <CheckCircle2 size={13} className="mr-1" /> 완료
                            </span>
                          ) : viewType === 'passed' ? (
                            <span className="inline-flex items-center bg-emerald-950/60 text-emerald-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-emerald-500/50">
                              <CheckCircle2 size={13} className="mr-1" /> 합격
                            </span>
                          ) : (
                            <span className="inline-flex items-center bg-[#151c28] text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold border border-[#232f43]">
                              <CheckCircle2 size={13} className="mr-1 text-blue-400" /> 진행 ({status.stage})
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

      <MediaViewerModal
        isOpen={!!activeMedia}
        onClose={() => setActiveMedia(null)}
        media={activeMedia}
      />
    </div>
  ) : null;
};
