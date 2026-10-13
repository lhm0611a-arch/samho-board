import React from "react";
import {
  CheckSquare,
  BookOpen,
  Milestone,
  GraduationCap,
  PlaneLanding,
  Users,
  FileSpreadsheet,
  UserX,
  CheckCircle2,
} from "lucide-react";
import { IndividualData } from "../types";
import { getIndividualStatus, getWeekStr } from "../utils";

interface ActualStagePipelineProps {
  individuals: IndividualData[];
  onStageClick: (stage: string, viewType: string) => void;
  currentWeek: number;
  startWeekForYear?: number;
  endWeekForYear?: number;
}

export const ActualStagePipeline: React.FC<ActualStagePipelineProps> = ({
  individuals,
  onStageClick,
  currentWeek,
  startWeekForYear = 1,
  endWeekForYear = 5200,
}) => {
  const steps = [
    {
      key: "사전기량검증완료",
      icon: CheckSquare,
      tag: "1차 평가",
      color: "text-purple-400",
      hoverColor: "group-hover:text-purple-300",
      glowBg: "bg-purple-500/30",
      glowHover: "group-hover:bg-purple-500/50",
      border: "border-purple-500/50",
      hoverBorder: "group-hover:border-purple-400",
    },
    {
      key: "1차 육성(기량,한국어)",
      icon: BookOpen,
      tag: "현지 교육",
      color: "text-indigo-400",
      hoverColor: "group-hover:text-indigo-300",
      glowBg: "bg-indigo-500/30",
      glowHover: "group-hover:bg-indigo-500/50",
      border: "border-indigo-500/50",
      hoverBorder: "group-hover:border-indigo-400",
    },
    {
      key: "본기량검증완료",
      icon: Milestone,
      tag: "최종 평가",
      color: "text-blue-400",
      hoverColor: "group-hover:text-blue-300",
      glowBg: "bg-blue-500/30",
      glowHover: "group-hover:bg-blue-500/50",
      border: "border-blue-500/50",
      hoverBorder: "group-hover:border-blue-400",
    },
    {
      key: "2차 육성(기량,한국어)",
      icon: GraduationCap,
      tag: "서류/비자",
      color: "text-teal-400",
      hoverColor: "group-hover:text-teal-300",
      glowBg: "bg-teal-500/30",
      glowHover: "group-hover:bg-teal-500/50",
      border: "border-teal-500/50",
      hoverBorder: "group-hover:border-teal-400",
    },
    {
      key: "입국",
      icon: PlaneLanding,
      tag: "한국 도착",
      color: "text-cyan-400",
      hoverColor: "group-hover:text-cyan-300",
      glowBg: "bg-cyan-500/30",
      glowHover: "group-hover:bg-cyan-500/50",
      border: "border-cyan-500/50",
      hoverBorder: "group-hover:border-cyan-400",
    },
  ];

  const stats: Record<string, any> = {
    사전기량검증완료: { waiting: 0, passed: 0, dropped: 0 },
    "1차 육성(기량,한국어)": { current: 0 },
    본기량검증완료: { waiting: 0, passed: 0, dropped: 0 },
    "2차 육성(기량,한국어)": { current: 0 },
    입국: { passed: 0, dropped: 0 },
  };

  let totalPreTested = 0;
  let totalMainTested = 0;
  let totalAllPreTested = 0;
  let totalAllMainTested = 0;

  individuals.forEach((ind) => {
    const isPreInYear =
      typeof ind.preTestWeek === "number" &&
      ind.preTestWeek >= startWeekForYear &&
      ind.preTestWeek <= endWeekForYear;
    const isMainInYear =
      typeof ind.mainTestWeek === "number" &&
      ind.mainTestWeek >= startWeekForYear &&
      ind.mainTestWeek <= endWeekForYear;

    if (
      isPreInYear ||
      (startWeekForYear === 1 && endWeekForYear >= 5000 && ind.hasPreData)
    ) {
      totalAllPreTested++;
    }
    if (
      isMainInYear ||
      (startWeekForYear === 1 && endWeekForYear >= 5000 && ind.hasMainData)
    ) {
      totalAllMainTested++;
    }

    const st = getIndividualStatus(ind, currentWeek);

    // 1. 사전기량 통계 (해당 연도 사전기량 대상자)
    if (
      st.preTested &&
      (isPreInYear ||
        (startWeekForYear === 1 && endWeekForYear >= 5000 && ind.hasPreData))
    ) {
      totalPreTested++;
      if (st.preWaiting) stats["사전기량검증완료"].waiting++;
      if (st.prePassed) stats["사전기량검증완료"].passed++;
      if (st.preDropped) stats["사전기량검증완료"].dropped++;
    }

    // 2. 1차 육성 (사전합격 후 본기량 전 현재 체류 교육 중 - 연도 연속 연계)
    if (st.currentStage === "1차 육성(기량,한국어)") {
      stats["1차 육성(기량,한국어)"].current++;
    }

    // 3. 본기량 통계 (해당 연도 본기량 대상자)
    if (
      st.mainTested &&
      (isMainInYear ||
        (startWeekForYear === 1 && endWeekForYear >= 5000 && ind.hasMainData))
    ) {
      totalMainTested++;
      if (st.mainWaiting) stats["본기량검증완료"].waiting++;
      if (st.mainPassed) stats["본기량검증완료"].passed++;
      if (st.mainDropped) stats["본기량검증완료"].dropped++;
    }

    // 4. 2차 육성 (본기량합격 후 입국 전 현재 체류/비자수속 중 - 연도 연속 연계)
    if (st.currentStage === "2차 육성(기량,한국어)") {
      stats["2차 육성(기량,한국어)"].current++;
    }

    // 5. 입국 통계 (해당 연도 입국 대상자)
    const isEntryInYear =
      typeof ind.entryPassWeek === "number" &&
      ind.entryPassWeek >= startWeekForYear &&
      ind.entryPassWeek <= endWeekForYear;
    const isEntryDropInYear =
      typeof ind.entryDropWeek === "number" &&
      ind.entryDropWeek >= startWeekForYear &&
      ind.entryDropWeek <= endWeekForYear;

    if (
      st.entryPassed &&
      (isEntryInYear || (startWeekForYear === 1 && endWeekForYear >= 5000))
    ) {
      stats["입국"].passed++;
    }
    if (
      st.entryDropped &&
      (isEntryDropInYear || (startWeekForYear === 1 && endWeekForYear >= 5000))
    ) {
      stats["입국"].dropped++;
    }
  });

  return (
    <div className="bg-transparent p-3 sm:p-[15px] relative overflow-hidden min-h-[330px] h-auto">
      <div className="absolute -right-10 -top-10 text-white/5 pointer-events-none">
        <Users size={250} />
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-4 relative z-10 border-b border-[#232f43] pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center tracking-tight break-keep">
            <FileSpreadsheet
              size={20}
              className="mr-2 text-blue-400 shrink-0"
            />
            단계별 수급 진행 현황
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
            선택한 타임라인 주차(
            <strong className="text-blue-300 font-semibold">
              {getWeekStr(currentWeek)}
            </strong>
            )를 기준으로 누적된 각 단계별 인원 현황입니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="text-xs sm:text-sm font-semibold text-slate-200 bg-[#151c28] px-3 py-1.5 rounded-xl border border-[#232f43] flex items-center">
            <CheckSquare size={14} className="mr-1.5 text-purple-400" />
            사전기량:{" "}
            <span className="text-white font-bold ml-1 tabular-nums">
              {totalPreTested}명
            </span>
            <span className="text-xs text-slate-400 ml-1 font-normal tabular-nums">
              / 총 {totalAllPreTested}명
            </span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-200 bg-[#151c28] px-3 py-1.5 rounded-xl border border-[#232f43] flex items-center">
            <Milestone size={14} className="mr-1.5 text-blue-400" />
            본기량:{" "}
            <span className="text-white font-bold ml-1 tabular-nums">
              {totalMainTested}명
            </span>
            <span className="text-xs text-slate-400 ml-1 font-normal tabular-nums">
              / 총 {totalAllMainTested}명
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-stretch justify-between w-full relative pt-2 pb-2 overflow-x-visible hide-scrollbar gap-1 sm:gap-2">
        <div className="hidden sm:block absolute top-[90px] lg:top-[128px] left-0 w-full h-[1px] bg-[#232f43] z-0"></div>
        {steps.map((step, idx) => {
          const isTest = ["사전기량검증완료", "본기량검증완료"].includes(
            step.key,
          );
          const isEntry = step.key === "입국";
          const s = stats[step.key];

          let bigNumber = 0;
          let bigLabel = "";
          let mainViewType = "";

          if (isTest) {
            bigNumber = s.waiting;
            bigLabel = "결과 대기";
            mainViewType = "waiting";
          } else if (isEntry) {
            bigNumber = s.passed;
            bigLabel = "입국 완료";
            mainViewType = "passed";
          } else {
            bigNumber = s.current;
            bigLabel = "체류(교육중)";
            mainViewType = "current";
          }

          return (
            <div
              key={idx}
              onClick={() => onStageClick(step.key, mainViewType)}
              className={`flex flex-col items-center justify-between relative z-10 flex-1 min-w-0 px-0.5 sm:px-1.5 transition-all duration-300 cursor-pointer group animate-in slide-in-from-bottom-4 fade-in pt-6 pb-1 min-h-[250px] h-auto`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div
                className={`absolute top-0 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#050b14]/90 backdrop-blur-sm border ${step.border} ${step.color} z-20 whitespace-nowrap sm:group-hover:scale-105 transition-transform shadow-md`}
              >
                {step.tag}
              </div>

              <div className="flex flex-col items-center w-full">
                <div
                  className={`w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mb-2.5 sm:mb-3 mt-4 sm:mt-5 relative sm:group-hover:-translate-y-1.5 transition-transform duration-300 shrink-0`}
                >
                  <div
                    className={`absolute inset-0 rounded-full border border-solid ${step.border} ${step.hoverBorder} transition-colors duration-300 z-10 bg-[#0a0f18]/80 backdrop-blur-sm`}
                  ></div>
                  <div
                    className={`absolute inset-0 rounded-full ${step.glowBg} ${step.glowHover} blur-[8px] sm:blur-[16px] transition-all duration-300 animate-pulse z-0`}
                  ></div>

                  <step.icon
                    size={32}
                    strokeWidth={1.5}
                    className={`relative z-20 ${step.color} ${step.hoverColor} drop-shadow-[0_0_8px_currentColor] transition-colors duration-300 w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10`}
                  />
                </div>

                <span className="text-xs sm:text-sm font-semibold text-slate-200 text-center mb-1.5 px-0.5 leading-snug break-keep flex items-center justify-center tracking-tight">
                  {step.key}
                </span>

                <div className="flex flex-col items-center">
                  <span
                    className={`text-2xl sm:text-3xl font-bold transition-colors tracking-tight tabular-nums ${bigNumber > 0 ? "text-white" : "text-slate-400"}`}
                  >
                    {bigNumber}명
                  </span>
                  <span className="text-xs text-sky-400 font-semibold tracking-wide mt-0.5 whitespace-nowrap">
                    {bigLabel}
                  </span>
                </div>
              </div>

              <div className="w-full mt-3 flex flex-col items-center justify-center min-h-[32px]">
                {isTest && (
                  <div className="flex flex-wrap gap-1.5 items-center justify-center relative z-30">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (s.dropped > 0) onStageClick(step.key, "dropped");
                      }}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-lg flex items-center transition-all duration-200 whitespace-nowrap ${s.dropped > 0 ? "bg-red-950/60 border border-red-500/50 text-red-300 hover:bg-red-900/50 cursor-pointer shadow-sm" : "bg-[#151c28] border border-[#232f43] text-slate-400"}`}
                    >
                      <UserX size={12} className="mr-1 shrink-0" /> 탈락 {s.dropped}
                    </div>
                    {s.passed > 0 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onStageClick(step.key, "passed");
                        }}
                        className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-blue-950/60 text-blue-300 border border-blue-500/50 flex items-center cursor-pointer hover:bg-blue-900/60 whitespace-nowrap shadow-sm"
                      >
                        <CheckCircle2 size={12} className="mr-1 shrink-0" /> 누적합격{" "}
                        {s.passed}
                      </div>
                    )}
                  </div>
                )}
                {isEntry && (
                  <div className="flex flex-wrap gap-1.5 items-center justify-center relative z-30">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (s.dropped > 0) onStageClick(step.key, "dropped");
                      }}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-lg flex items-center transition-all duration-200 whitespace-nowrap ${s.dropped > 0 ? "bg-red-950/60 border border-red-500/50 text-red-300 hover:bg-red-900/50 cursor-pointer shadow-sm" : "bg-[#151c28] border border-[#232f43] text-slate-400"}`}
                    >
                      <UserX size={12} className="mr-1 shrink-0" /> 탈락 {s.dropped}
                    </div>
                  </div>
                )}
                {!isTest && !isEntry && (
                  <div className="text-xs font-medium text-slate-300 bg-[#151c28] px-2.5 py-0.5 rounded-lg border border-[#232f43] flex items-center relative z-30 whitespace-nowrap">
                    해당 단계 체류중
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
