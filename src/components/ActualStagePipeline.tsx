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
}

export const ActualStagePipeline: React.FC<ActualStagePipelineProps> = ({
  individuals,
  onStageClick,
  currentWeek,
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

  let totalPreTested = individuals.filter((ind) => ind.hasPreData).length;
  let totalMainTested = individuals.filter((ind) => ind.hasMainData).length;

  individuals.forEach((ind) => {
    const st = getIndividualStatus(ind, currentWeek);

    if (ind.hasPreData && st.preTested) {
      if (st.prePassed) stats["사전기량검증완료"].passed++;
      if (st.preDropped) stats["사전기량검증완료"].dropped++;
      if (st.preWaiting) stats["사전기량검증완료"].waiting++;
    }

    if (ind.hasMainData && st.mainTested) {
      if (st.mainPassed) stats["본기량검증완료"].passed++;
      if (st.mainDropped) stats["본기량검증완료"].dropped++;
      if (st.mainWaiting) stats["본기량검증완료"].waiting++;
    }

    if (st.entryPassed) stats["입국"].passed++;
    if (st.entryDropped) stats["입국"].dropped++;

    if (st.currentStage === "1차 육성(기량,한국어)")
      stats["1차 육성(기량,한국어)"].current++;
    if (st.currentStage === "2차 육성(기량,한국어)")
      stats["2차 육성(기량,한국어)"].current++;
  });

  return (
    <div className="bg-transparent p-3 sm:p-[15px] relative overflow-hidden min-h-[330px] h-auto">
      <div className="absolute -right-10 -top-10 text-white/5 pointer-events-none">
        <Users size={250} />
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-[3px] gap-4 relative z-10 border-b border-[#232f43] pb-[7px]">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center tracking-tight break-keep">
            <FileSpreadsheet
              size={20}
              className="mr-2 text-blue-500 shrink-0"
            />
            단계별 수급 진행 현황
          </h3>
          <p
            className="text-slate-400 font-medium mt-1.5 font-mono"
            style={{ fontSize: "13px", fontFamily: "system-ui" }}
          >
            선택한 타임라인 주차(
            <strong className="text-blue-400 font-extrabold">
              {getWeekStr(currentWeek)}
            </strong>
            )를 기준으로 누적된 각 단계별 인원 현황입니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="text-xs sm:text-sm font-extrabold text-slate-300 bg-[#151c28] px-3 py-1.5 rounded-xl border border-[#232f43] flex items-center font-mono">
            <CheckSquare size={14} className="mr-1.5 text-purple-400" />
            사전기량:{" "}
            <span className="text-white font-black ml-1">
              {totalPreTested}명
            </span>
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-slate-300 bg-[#151c28] px-3 py-1.5 rounded-xl border border-[#232f43] flex items-center font-mono">
            <Milestone size={14} className="mr-1.5 text-blue-400" />
            본기량:{" "}
            <span className="text-white font-black ml-1">
              {totalMainTested}명
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-stretch justify-between w-full relative pt-[10px] pb-[10px] overflow-x-visible hide-scrollbar">
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
              className={`flex flex-col items-center relative z-10 flex-1 min-w-0 px-0.5 sm:px-2 transition-all duration-500 cursor-pointer group animate-in slide-in-from-bottom-4 fade-in pt-6 h-auto min-h-[180px] sm:h-[232px]`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div
                className={`absolute top-0 text-[9px] sm:text-[12px] font-extrabold font-mono pl-1 sm:pl-[12px] pb-[2px] sm:pb-[4px] pr-1 sm:pr-3 pt-1 mt-0 rounded-full bg-[#050b14]/80 backdrop-blur-sm border ${step.border} ${step.color} z-20 whitespace-nowrap sm:group-hover:scale-110 transition-transform shadow-lg`}
              >
                {step.tag}
              </div>

              <div
                className={`w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mb-3 sm:mb-4 mt-5 sm:mt-6 relative sm:group-hover:-translate-y-2 transition-transform duration-500`}
              >
                <div
                  className={`absolute inset-0 rounded-full border border-solid ${step.border} ${step.hoverBorder} transition-colors duration-500 z-10 bg-[#0a0f18]/80 backdrop-blur-sm ml-0 mt-0`}
                ></div>
                <div
                  className={`absolute inset-0 rounded-full ${step.glowBg} ${step.glowHover} blur-[8px] sm:blur-[16px] transition-all duration-500 animate-pulse z-0`}
                ></div>

                <step.icon
                  size={32}
                  strokeWidth={1.5}
                  className={`relative z-20 ${step.color} ${step.hoverColor} drop-shadow-[0_0_8px_currentColor] transition-colors duration-500 w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10`}
                />
              </div>

              <span className="text-[9px] sm:text-[11px] lg:text-xs font-bold text-slate-400 text-center mb-1.5 px-0.5 sm:px-1 leading-tight sm:leading-normal break-keep flex items-center justify-center tracking-tight font-mono">
                {step.key}
              </span>

              <div className="flex flex-col items-center">
                <span
                  className={`text-lg sm:text-2xl lg:text-3xl font-display font-black transition-colors tracking-tighter ${bigNumber > 0 ? "text-white" : "text-slate-600"}`}
                >
                  {bigNumber}명
                </span>
                <span className="text-[9px] sm:text-[11px] text-[#2bb6ff] font-sans font-extrabold uppercase tracking-widest mt-0 sm:mt-0.5">
                  {bigLabel}
                </span>
              </div>

              {isTest && (
                <div className="flex flex-col sm:flex-row gap-1.5 mt-3 flex-wrap justify-center min-h-[28px] relative z-30">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (s.dropped > 0) onStageClick(step.key, "dropped");
                    }}
                    className={`text-[12px] font-normal pt-1 font-mono px-2 py-1 rounded-lg flex items-center transition-all duration-300 ${s.dropped > 0 ? "bg-red-900/30 border border-red-500/50 text-red-400 hover:bg-red-900/50 cursor-pointer" : "bg-[#151c28] border border-[#232f43] text-slate-600"}`}
                  >
                    <UserX size={10} className="mr-1" /> 탈락 {s.dropped}
                  </div>
                  {s.passed > 0 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onStageClick(step.key, "passed");
                      }}
                      className="text-[12px] font-normal font-mono px-2 py-1 rounded-lg bg-blue-900/30 text-blue-400 border border-blue-500/50 flex items-center cursor-pointer hover:bg-blue-900/50"
                    >
                      <CheckCircle2 size={10} className="mr-1" /> 누적합격{" "}
                      {s.passed}
                    </div>
                  )}
                </div>
              )}
              {isEntry && (
                <div className="flex flex-col sm:flex-row gap-1.5 mt-3 flex-wrap justify-center min-h-[28px] relative z-30">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (s.dropped > 0) onStageClick(step.key, "dropped");
                    }}
                    className={`text-[12px] font-normal pt-1 font-mono px-2 py-1 rounded-lg flex items-center transition-all duration-300 ${s.dropped > 0 ? "bg-red-900/30 border border-red-500/50 text-red-400 hover:bg-red-900/50 cursor-pointer" : "bg-[#151c28] border border-[#232f43] text-slate-600"}`}
                  >
                    <UserX size={10} className="mr-1" /> 탈락 {s.dropped}
                  </div>
                </div>
              )}
              {!isTest && !isEntry && (
                <div className="mt-3 text-[12px] font-normal pt-1 text-slate-500 bg-[#151c28] px-2 py-1 rounded-lg border border-[#232f43] font-mono flex items-center relative z-30">
                  해당 단계 체류중
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
