import React from 'react';
import { Building, X, Briefcase, Clock, CheckCircle2 } from 'lucide-react';
import { AgencySupplyData, IndividualData } from '../types';
import { getWeekStr, normalizeAgency } from '../utils';

interface AgencyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyName: string | null;
  agencySupplyDB: AgencySupplyData[];
  individuals: IndividualData[];
}

export const AgencyDetailModal: React.FC<AgencyDetailModalProps> = ({
  isOpen,
  onClose,
  agencyName,
  agencySupplyDB,
  individuals,
}) => {
  const normAgency = agencyName ? normalizeAgency(agencyName) : '';
  const sampleAgency = normAgency
    ? agencySupplyDB.find((a) => normalizeAgency(a.agency) === normAgency)
    : null;
  const country = sampleAgency ? sampleAgency.country : '';

  const jobMap: Record<
    string,
    {
      expected: { week: number | null; count: number }[];
      confirmed: { week: number | null; count: number }[];
      totalExpected: number;
      totalConfirmed: number;
    }
  > = {};

  if (normAgency) {
    agencySupplyDB
      .filter((a) => normalizeAgency(a.agency) === normAgency)
      .forEach((a) => {
        if (!jobMap[a.job]) {
          jobMap[a.job] = { expected: [], confirmed: [], totalExpected: 0, totalConfirmed: 0 };
        }
        const existingExp = jobMap[a.job].expected.find((e) => e.week === a.supplyWeek);
        if (existingExp) {
          existingExp.count += a.count;
        } else {
          jobMap[a.job].expected.push({ week: a.supplyWeek, count: a.count });
        }
        jobMap[a.job].totalExpected += a.count;
      });

    individuals
      .filter(
        (ind) =>
          normalizeAgency(ind.agency) === normAgency &&
          typeof ind.entryPassWeek === 'number'
      )
      .forEach((ind) => {
        if (!jobMap[ind.job]) {
          jobMap[ind.job] = { expected: [], confirmed: [], totalExpected: 0, totalConfirmed: 0 };
        }
        const existingConf = jobMap[ind.job].confirmed.find((c) => c.week === ind.entryPassWeek);
        if (existingConf) {
          existingConf.count++;
        } else {
          jobMap[ind.job].confirmed.push({ week: ind.entryPassWeek, count: 1 });
        }
        jobMap[ind.job].totalConfirmed += 1;
      });
  }

  const sortWeeks = (
    a: { week: number | null; count: number },
    b: { week: number | null; count: number }
  ) => (a.week || 999) - (b.week || 999);

  const getEarliestWeek = (jobData: {
    expected: { week: number | null; count: number }[];
    confirmed: { week: number | null; count: number }[];
  }) => {
    const expectedWeeks = jobData.expected.map((e) => e.week || 999);
    const confirmedWeeks = jobData.confirmed.map((c) => c.week || 999);
    return Math.min(...expectedWeeks, ...confirmedWeeks, 999);
  };

  const renderWeekBadge = (
    week: number | null,
    count: number,
    type: 'expected' | 'confirmed',
    key: number
  ) => (
    <div
      key={key}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
        type === 'confirmed'
          ? 'bg-blue-950/60 border-blue-500/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
          : 'bg-[#0a0f18] border-[#232f43] text-slate-200'
      }`}
    >
      <span>{week ? getWeekStr(week) : '일정 미정'}</span>
      <span
        className={`w-px h-3.5 ${
          type === 'confirmed' ? 'bg-blue-500/40' : 'bg-slate-700'
        }`}
      ></span>
      <span className="text-sm sm:text-base font-extrabold tabular-nums text-white">
        {count}명
      </span>
    </div>
  );

  const jobs = Object.keys(jobMap).sort(
    (a, b) => getEarliestWeek(jobMap[a]) - getEarliestWeek(jobMap[b])
  );

  return isOpen && agencyName ? (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0a0f18]/95 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-[#232f43]">
        {/* Modal Header */}
        <div className="border-b border-[#232f43] p-5 sm:p-6 flex justify-between items-center bg-[#151c28] shrink-0 gap-4">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30 shrink-0">
              <Building size={22} className="text-blue-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate break-keep tracking-tight text-white flex items-center gap-2">
                <span>{agencyName}</span>
                {country && (
                  <span className="text-xs sm:text-sm font-semibold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                    {country}
                  </span>
                )}
                <span className="text-slate-300 text-sm font-medium hidden sm:inline">
                  세부 공급 현황
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-[#1a2332] transition-colors shrink-0"
            title="닫기"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 hide-scrollbar">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Briefcase size={44} className="mb-3 text-slate-600 opacity-60" />
              <p className="font-semibold text-base text-slate-300">
                해당 업체의 배정 데이터가 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const { expected, confirmed, totalExpected, totalConfirmed } = jobMap[job];
                return (
                  <div
                    key={job}
                    className="bg-[#151c28]/70 border border-[#232f43] rounded-xl p-5 sm:p-6 hover:border-blue-500/40 transition-all flex flex-col group shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between mb-4 gap-3 border-b border-[#232f43]/70 pb-3">
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center tracking-tight">
                        <Briefcase
                          size={18}
                          className="text-blue-400 mr-2 shrink-0 group-hover:text-blue-300 transition-colors"
                        />
                        <span>{job}</span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-slate-300 bg-[#0a0f18] px-3 py-1.5 rounded-lg border border-[#232f43] flex items-center">
                          계획
                          <span className="ml-1.5 font-bold text-white tabular-nums">
                            {totalExpected}
                          </span>
                          명
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-blue-300 bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-500/40 flex items-center shadow-sm">
                          확정
                          <span className="ml-1.5 font-extrabold text-white tabular-nums">
                            {totalConfirmed}
                          </span>
                          명
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      {/* 예상 일정 */}
                      <div className="flex-1 bg-[#0a0f18]/80 p-4 rounded-xl border border-[#232f43] flex flex-col">
                        <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center tracking-wider">
                          <Clock size={15} className="mr-1.5 text-slate-400" />
                          <span>입국 예상 (공급계획)</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {expected.length > 0 ? (
                            expected
                              .sort(sortWeeks)
                              .map((e, i) => renderWeekBadge(e.week, e.count, 'expected', i))
                          ) : (
                            <span className="text-xs sm:text-sm text-slate-400 font-medium py-1">
                              예상 일정 없음
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 확정 일정 */}
                      <div className="flex-1 bg-blue-950/20 p-4 rounded-xl border border-blue-500/25 flex flex-col">
                        <h4 className="text-xs font-bold text-blue-300 mb-3 flex items-center tracking-wider">
                          <CheckCircle2 size={15} className="mr-1.5 text-blue-400" />
                          <span>입국 확정 (실제명단)</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {confirmed.length > 0 ? (
                            confirmed
                              .sort(sortWeeks)
                              .map((c, i) => renderWeekBadge(c.week, c.count, 'confirmed', i))
                          ) : (
                            <span className="text-xs sm:text-sm text-slate-400 font-medium py-1">
                              확정된 인원 없음
                            </span>
                          )}
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
