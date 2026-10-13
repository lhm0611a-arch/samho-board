import React, { useState, useMemo, useEffect } from 'react';
import { UserCheck, X, ShieldCheck, MapPin, PlayCircle, FileText, Users, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getWeekStr } from '../utils';
import { COUNTRY_FLAG } from '../constants';
import { IndividualData } from '../types';
import { MediaViewerModal, MediaViewerTarget } from './MediaViewerModal';

interface ConfirmedDeptModalProps {
  isOpen: boolean;
  onClose: () => void;
  selection: { dept: string; job: string | null } | null;
  confirmedDeptSummary: any[];
  filterStatus: string | null;
  authRole: string | null;
}

type SortKey =
  | 'uid'
  | 'name'
  | 'age'
  | 'isE9'
  | 'country'
  | 'job'
  | 'mainChibuScore'
  | 'mainWeldScore'
  | 'mainKrScore'
  | 'entryPassWeek';

export const ConfirmedDeptModal: React.FC<ConfirmedDeptModalProps> = ({
  isOpen,
  onClose,
  selection,
  confirmedDeptSummary,
  filterStatus,
  authRole,
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'uid',
    direction: 'asc',
  });
  const [activeMedia, setActiveMedia] = useState<MediaViewerTarget | null>(null);

  // Reset sorting when selection changes
  useEffect(() => {
    setSortConfig({ key: 'uid', direction: 'asc' });
  }, [selection?.dept, selection?.job]);

  const deptData = confirmedDeptSummary && selection ? confirmedDeptSummary.find((d) => d.name === selection.dept) : null;

  const rawInds: IndividualData[] = useMemo(() => {
    if (!deptData || !selection) return [];
    if (selection.job) {
      return deptData.jobs[selection.job]?.inds || [];
    } else {
      const list: IndividualData[] = [];
      Object.values(deptData.jobs).forEach((j: any) => {
        if (j.inds) list.push(...j.inds);
      });
      return list;
    }
  }, [deptData, selection]);

  const countryCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {};
    rawInds.forEach((ind) => {
      const c = ind.country || '기타';
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [rawInds]);

  const sortedInds = useMemo(() => {
    const list = [...rawInds];
    if (!sortConfig.key) return list;

    list.sort((a, b) => {
      let aVal: string | number | boolean = a[sortConfig.key] as any;
      let bVal: string | number | boolean = b[sortConfig.key] as any;

      if (sortConfig.key === 'age') {
        const aAge = typeof aVal === 'number' ? aVal : parseInt(String(aVal || '0'), 10) || 0;
        const bAge = typeof bVal === 'number' ? bVal : parseInt(String(bVal || '0'), 10) || 0;
        return sortConfig.direction === 'asc' ? aAge - bAge : bAge - aAge;
      }

      if (['mainChibuScore', 'mainWeldScore', 'mainKrScore', 'entryPassWeek'].includes(sortConfig.key)) {
        const aNum = Number(aVal) || 0;
        const bNum = Number(bVal) || 0;
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      if (sortConfig.key === 'isE9') {
        const aE9 = a.isE9 ? 1 : 0;
        const bE9 = b.isE9 ? 1 : 0;
        return sortConfig.direction === 'asc' ? aE9 - bE9 : bE9 - aE9;
      }

      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [rawInds, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      // For scores or dates, default to descending on first click
      const defaultDesc = ['mainChibuScore', 'mainWeldScore', 'mainKrScore', 'age'].includes(key);
      return { key, direction: defaultDesc ? 'desc' : 'asc' };
    });
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-80 transition-opacity ml-1 shrink-0" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={12} className="text-blue-400 ml-1 shrink-0" />
    ) : (
      <ArrowDown size={12} className="text-blue-400 ml-1 shrink-0" />
    );
  };

  const statusLabel = '배치 확정 인원';

  return isOpen && selection && deptData ? (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0e1420]/95 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8),0_0_20px_rgba(59,130,246,0.15)] w-full max-w-6xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-[#232f43]">
        {/* Modal Header */}
        <div className="border-b border-[#232f43] p-5 sm:p-6 flex justify-between items-center bg-[#151c28] shrink-0 gap-4">
          <div className="flex items-center space-x-3.5 min-w-0 flex-wrap gap-y-2">
            <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30 shrink-0">
              <UserCheck size={22} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight truncate break-keep text-white flex items-center gap-2">
                <span>{selection.dept} 부서 확정 명단</span>
                {selection.job && (
                  <span className="text-blue-300 text-xs sm:text-sm font-semibold bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-500/40">
                    {selection.job}
                  </span>
                )}
              </h2>
            </div>
            <span className="inline-flex items-center bg-[#0a0f18] text-slate-200 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border border-[#232f43] tabular-nums">
              {statusLabel}: <span className="text-blue-300 font-bold ml-1">{rawInds.length}명</span>
            </span>
            {Object.keys(countryCounts).length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {Object.entries(countryCounts).map(([country, count]) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold"
                  >
                    <span>{country}</span>
                    <span className="text-emerald-300 font-bold tabular-nums">{count}명</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-[#1a2332] transition-all shrink-0"
            title="닫기"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body / Table */}
        <div className="p-0 sm:p-5 overflow-y-auto flex-1 hide-scrollbar">
          {sortedInds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Users size={56} className="mb-3 opacity-30" />
              <p className="font-semibold text-sm sm:text-base text-slate-300">해당 조건에 부합하는 확정(입국) 명단이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto sm:rounded-xl border border-[#232f43] bg-[#0a0f18]">
              <table className="w-full text-center border-collapse min-w-[980px]">
                <thead className="bg-[#151c28] text-slate-200 text-xs border-b border-[#232f43] select-none">
                  <tr>
                    <th className="py-3 px-2 font-semibold w-12 border-r border-[#232f43]/60 text-center whitespace-nowrap">
                      No.
                    </th>
                    <th
                      onClick={() => handleSort('uid')}
                      className="py-3 px-3 font-semibold text-center border-r border-[#232f43]/60 cursor-pointer hover:bg-[#1c2638] hover:text-white transition-colors group whitespace-nowrap"
                    >
                      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                        <span>응시번호 / 성명</span>
                        <SortIcon columnKey="uid" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('age')}
                      className="py-3 px-2 font-semibold text-center border-r border-[#232f43]/60 w-16 cursor-pointer hover:bg-[#1c2638] hover:text-white transition-colors group whitespace-nowrap"
                    >
                      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                        <span>나이</span>
                        <SortIcon columnKey="age" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('isE9')}
                      className="py-3 px-2 font-semibold text-center border-r border-[#232f43]/60 w-20 cursor-pointer hover:bg-[#1c2638] hover:text-white transition-colors group whitespace-nowrap"
                    >
                      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                        <span>E-9 출신</span>
                        <SortIcon columnKey="isE9" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('country')}
                      className="py-3 px-3 font-semibold text-center border-r border-[#232f43]/60 cursor-pointer hover:bg-[#1c2638] hover:text-white transition-colors group whitespace-nowrap"
                    >
                      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                        <span>{authRole === 'production' ? '국가' : '국가 / 업체'}</span>
                        <SortIcon columnKey="country" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('job')}
                      className="py-3 px-3 font-semibold text-center border-r border-[#232f43]/60 w-24 cursor-pointer hover:bg-[#1c2638] hover:text-white transition-colors group whitespace-nowrap"
                    >
                      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                        <span>투입 직무</span>
                        <SortIcon columnKey="job" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3 font-semibold border-r border-[#232f43]/60 bg-blue-950/20 text-blue-300 text-center w-44 whitespace-nowrap">
                      <div className="text-xs text-blue-300 font-semibold mb-1 whitespace-nowrap">본기량 상세 점수</div>
                      <div className="flex items-center justify-center gap-2 text-xs whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSort('mainChibuScore')}
                          className="flex items-center gap-0.5 hover:text-white transition-colors text-slate-300"
                          title="취부점수로 정렬"
                        >
                          <span>취부</span>
                          <SortIcon columnKey="mainChibuScore" />
                        </button>
                        <span className="text-slate-500">/</span>
                        <button
                          type="button"
                          onClick={() => handleSort('mainWeldScore')}
                          className="flex items-center gap-0.5 hover:text-white transition-colors text-slate-300"
                          title="용접점수로 정렬"
                        >
                          <span>용접</span>
                          <SortIcon columnKey="mainWeldScore" />
                        </button>
                        <span className="text-slate-500">/</span>
                        <button
                          type="button"
                          onClick={() => handleSort('mainKrScore')}
                          className="flex items-center gap-0.5 hover:text-white transition-colors text-slate-300"
                          title="한국어점수로 정렬"
                        >
                          <span>한국어</span>
                          <SortIcon columnKey="mainKrScore" />
                        </button>
                      </div>
                    </th>
                    <th className="py-3 px-2 font-semibold text-center border-r border-[#232f43]/60 text-slate-200 w-28 whitespace-nowrap">
                      첨부 (영상/인성)
                    </th>
                    <th
                      onClick={() => handleSort('entryPassWeek')}
                      className="py-3 px-4 font-semibold text-center cursor-pointer hover:bg-[#1c2638] hover:text-white transition-colors group min-w-[130px] whitespace-nowrap"
                    >
                      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                        <span>입국 주차</span>
                        <SortIcon columnKey="entryPassWeek" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm">
                  {sortedInds.map((ind, idx) => {
                    const isE9 = Boolean(ind.isE9);
                    const ageNum = ind.age ? (typeof ind.age === 'number' ? ind.age : parseInt(String(ind.age), 10)) : null;

                    return (
                      <tr
                        key={ind.uid || idx}
                        className="border-b border-[#232f43]/40 hover:bg-[#151c28]/70 transition-colors"
                      >
                        {/* No. */}
                        <td className="py-2.5 px-2 text-slate-400 font-medium tabular-nums text-center border-r border-[#232f43]/40">
                          {idx + 1}
                        </td>

                        {/* 응시번호 / 성명 */}
                        <td className="py-2.5 px-3 text-white border-r border-[#232f43]/40">
                          <div className="flex items-center justify-start gap-2">
                            <span className="font-mono text-xs font-semibold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/40 shrink-0">
                              {ind.uid}
                            </span>
                            <span className="font-semibold text-white whitespace-nowrap text-xs sm:text-sm truncate max-w-[220px]">
                              {ind.name}
                            </span>
                          </div>
                        </td>

                        {/* 나이 */}
                        <td className="py-2.5 px-2 text-center border-r border-[#232f43]/40 whitespace-nowrap tabular-nums text-xs sm:text-sm text-slate-200">
                          {ageNum ? `${ageNum}세` : '-'}
                        </td>

                        {/* E-9 출신 여부 */}
                        <td className="py-2.5 px-2 text-center border-r border-[#232f43]/40 whitespace-nowrap">
                          {isE9 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 text-amber-200 border border-amber-500/40 text-xs font-semibold">
                              <ShieldCheck size={12} className="text-amber-300" />
                              <span>E-9</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* 국가 / 업체 */}
                        <td className="py-2.5 px-3 text-center border-r border-[#232f43]/40">
                          <div className="flex items-center justify-center gap-1 text-xs sm:text-sm text-slate-200">
                            <span className="font-semibold">{ind.country}</span>
                          </div>
                          {authRole !== 'production' && ind.agency && (
                            <div className="text-xs text-slate-300 mt-0.5">
                              {ind.agency} {ind.track && <span className="text-slate-400">({ind.track})</span>}
                            </div>
                          )}
                        </td>

                        {/* 투입 직무 */}
                        <td className="py-2.5 px-3 text-slate-200 font-semibold border-r border-[#232f43]/40 text-xs sm:text-sm text-center">
                          {ind.job}
                        </td>

                        {/* 본기량 상세 점수 */}
                        <td className="py-2 px-3 text-center border-r border-[#232f43]/40 bg-blue-950/10">
                          <div className="flex items-center justify-center gap-2 text-xs">
                            {/* 취부 */}
                            <div className="flex flex-col items-center min-w-[2.2rem]">
                              <span className="text-xs text-slate-400">취부</span>
                              <span
                                className={`font-semibold tabular-nums ${
                                  Number(ind.mainChibuScore) >= 80
                                    ? 'text-blue-300 font-bold'
                                    : 'text-slate-200'
                                }`}
                              >
                                {ind.mainChibuScore ?? '-'}
                              </span>
                            </div>
                            <span className="text-[#232f43]">|</span>
                            {/* 용접 */}
                            <div className="flex flex-col items-center min-w-[2.2rem]">
                              <span className="text-xs text-slate-400">용접</span>
                              <span
                                className={`font-semibold tabular-nums ${
                                  Number(ind.mainWeldScore) >= 80
                                    ? 'text-blue-300 font-bold'
                                    : 'text-slate-200'
                                }`}
                              >
                                {ind.mainWeldScore ?? '-'}
                              </span>
                            </div>
                            <span className="text-[#232f43]">|</span>
                            {/* 한국어 */}
                            <div className="flex flex-col items-center min-w-[2.2rem]">
                              <span className="text-xs text-slate-400">한국어</span>
                              <span
                                className={`font-semibold tabular-nums ${
                                  Number(ind.mainKrScore) >= 70 || Number(ind.mainKrScore) >= 15
                                    ? 'text-emerald-300 font-bold'
                                    : 'text-slate-200'
                                }`}
                              >
                                {ind.mainKrScore ?? '-'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 첨부 (영상/인성) */}
                        <td className="py-2.5 px-2 text-center border-r border-[#232f43]/40 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
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
                                    candidateDept: ind.assignedDept || ind.dept || selection?.dept,
                                    scoreInfo: ind.mainWeldScore || ind.mainKrScore ? `용접 ${ind.mainWeldScore ?? '-'}점 / 한국어 ${ind.mainKrScore ?? '-'}점` : undefined,
                                  });
                                }}
                                title="프로그램 내에서 영상 바로 실행"
                                className="inline-flex items-center justify-center px-2 py-1 bg-sky-950/60 text-sky-300 border border-sky-500/40 hover:bg-sky-900/60 hover:border-sky-400 rounded text-xs font-semibold transition-all active:scale-95 whitespace-nowrap shadow-sm cursor-pointer"
                              >
                                <PlayCircle size={13} className="mr-1 text-sky-400" /> 영상
                              </button>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2 py-1 bg-[#0a0f18] text-slate-500 border border-white/5 rounded text-xs">
                                -
                              </span>
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
                                    candidateDept: ind.assignedDept || ind.dept || selection?.dept,
                                    scoreInfo: ind.mainWeldScore || ind.mainKrScore ? `용접 ${ind.mainWeldScore ?? '-'}점 / 한국어 ${ind.mainKrScore ?? '-'}점` : undefined,
                                  });
                                }}
                                title="프로그램 내에서 인성 검사 결과 바로 실행"
                                className="inline-flex items-center justify-center px-2 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60 hover:border-emerald-400 rounded text-xs font-semibold transition-all active:scale-95 whitespace-nowrap shadow-sm cursor-pointer"
                              >
                                <FileText size={13} className="mr-1 text-emerald-400" /> 인성
                              </button>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2 py-1 bg-[#0a0f18] text-slate-500 border border-white/5 rounded text-xs">
                                -
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 입국 주차 */}
                        <td className="py-2.5 px-3 text-blue-300 font-semibold text-center tabular-nums text-xs sm:text-sm whitespace-nowrap min-w-[130px]">
                          {ind.entryPassWeek ? getWeekStr(Number(ind.entryPassWeek)) : '-'}
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

