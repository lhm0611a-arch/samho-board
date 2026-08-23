import React, { useMemo, useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award } from 'lucide-react';
import { IndividualData } from '../types';

interface Props {
  individuals: IndividualData[];
}

type ChartViewType = 'type' | 'korean_detail' | 'grade' | 'country';

export function SkillAnalysisChart({ individuals }: Props) {
  const [chartView, setChartView] = useState<ChartViewType>('type');

  const {
    stats,
    statsByCountry,
    countriesList,
    koreanDetailData,
    gradeData,
    topWeldCountry,
    topKrCountry,
    krBestItem,
    krWeakItem
  } = useMemo(() => {
    // Only include individuals who have entered the country
    const enteredIndividuals = individuals.filter(ind => typeof ind.entryPassWeek === 'number');

    let totalKr = 0, totalWeld = 0, totalChibu = 0;
    let countKr = 0, countWeld = 0, countChibu = 0;

    let e9Kr = 0, e9Weld = 0, e9Chibu = 0;
    let e9CountKr = 0, e9CountWeld = 0, e9CountChibu = 0;

    let genKr = 0, genWeld = 0, genChibu = 0;
    let genCountKr = 0, genCountWeld = 0, genCountChibu = 0;

    const grades: Record<'A' | 'B' | 'C' | 'D' | 'E', number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    const detailSums = {
      comprehension: 0, // max 20
      pronunciation: 0, // max 10
      grammar: 0,       // max 20
      vocabulary: 0,    // max 20
      expression: 0,    // max 20
      attitude: 0,      // max 10
      count: 0
    };

    const cStats: Record<string, { krTotal: number, krCount: number, weldTotal: number, weldCount: number, chibuTotal: number, chibuCount: number }> = {};

    enteredIndividuals.forEach(ind => {
      // Use main score if available, else pre score
      let kr = parseInt(ind.mainKrScore as string, 10);
      if (isNaN(kr)) kr = parseInt(ind.preKrScore as string, 10);

      let chibu = parseInt(ind.mainChibuScore as string, 10);
      if (isNaN(chibu)) chibu = parseInt(ind.preChibuScore as string, 10);

      let weld = parseInt(ind.mainWeldScore as string, 10);
      if (isNaN(weld)) weld = parseInt(ind.preWeldScore as string, 10);

      const isE9 = ind.isE9 === true;
      const country = ind.country || '기타';
      if (!cStats[country]) {
        cStats[country] = { krTotal: 0, krCount: 0, weldTotal: 0, weldCount: 0, chibuTotal: 0, chibuCount: 0 };
      }

      if (!isNaN(kr)) {
        totalKr += kr;
        countKr++;
        if (isE9) { e9Kr += kr; e9CountKr++; }
        else { genKr += kr; genCountKr++; }
        cStats[country].krTotal += kr;
        cStats[country].krCount++;

        let grade = (ind.mainKrGrade || ind.preKrGrade || '').trim().toUpperCase();
        if (!['A', 'B', 'C', 'D', 'E'].includes(grade)) {
          if (kr >= 80) grade = 'A';
          else if (kr >= 70) grade = 'B';
          else if (kr >= 60) grade = 'C';
          else if (kr >= 50) grade = 'D';
          else grade = 'E';
        }
        if (grade in grades) {
          grades[grade as 'A' | 'B' | 'C' | 'D' | 'E']++;
        }
      }

      if (!isNaN(weld)) {
        totalWeld += weld;
        countWeld++;
        if (isE9) { e9Weld += weld; e9CountWeld++; }
        else { genWeld += weld; genCountWeld++; }
        cStats[country].weldTotal += weld;
        cStats[country].weldCount++;
      }

      if (!isNaN(chibu)) {
        totalChibu += chibu;
        countChibu++;
        if (isE9) { e9Chibu += chibu; e9CountChibu++; }
        else { genChibu += chibu; genCountChibu++; }
        cStats[country].chibuTotal += chibu;
        cStats[country].chibuCount++;
      }

      const d = ind.mainKrDetail || ind.preKrDetail;
      if (d && (d.comprehension !== undefined || d.attitude !== undefined)) {
        detailSums.comprehension += Number(d.comprehension) || 0;
        detailSums.pronunciation += Number(d.pronunciation) || 0;
        detailSums.grammar += Number(d.grammar) || 0;
        detailSums.vocabulary += Number(d.vocabulary) || 0;
        detailSums.expression += Number(d.expression) || 0;
        detailSums.attitude += Number(d.attitude) || 0;
        detailSums.count++;
      }
    });

    const avg = (val: number, cnt: number) => cnt > 0 ? Math.round(val / cnt) : 0;
    const avgFloat = (val: number, cnt: number) => cnt > 0 ? Math.round((val / cnt) * 10) / 10 : 0;

    const countryArr = Object.entries(cStats)
      .filter(([_, data]) => data.krCount > 0 || data.weldCount > 0 || data.chibuCount > 0)
      .map(([country, data]) => ({
        country,
        kr: avg(data.krTotal, data.krCount),
        weld: avg(data.weldTotal, data.weldCount),
        chibu: avg(data.chibuTotal, data.chibuCount),
      }))
      .sort((a, b) => (b.weld + b.chibu) - (a.weld + a.chibu));

    const topWeldCountry = [...countryArr].sort((a, b) => b.weld - a.weld)[0] || { country: '-', weld: 0 };
    const topKrCountry = [...countryArr].sort((a, b) => b.kr - a.kr)[0] || { country: '-', kr: 0 };

    const statsByCountry = [
      {
        group: '한국어 수준',
        ...countryArr.reduce((acc, c) => ({ ...acc, [c.country]: c.kr }), {})
      },
      {
        group: '용접 기량',
        ...countryArr.reduce((acc, c) => ({ ...acc, [c.country]: c.weld }), {})
      },
      {
        group: '취부 기량',
        ...countryArr.reduce((acc, c) => ({ ...acc, [c.country]: c.chibu }), {})
      }
    ];

    const dCount = detailSums.count > 0 ? detailSums.count : 1;
    const rawKoreanDetail = [
      { name: '발음·억양', rawAvg: avgFloat(detailSums.pronunciation, dCount), max: 10, rate: Math.round((detailSums.pronunciation / (dCount * 10)) * 100) },
      { name: '태도·자신감', rawAvg: avgFloat(detailSums.attitude, dCount), max: 10, rate: Math.round((detailSums.attitude / (dCount * 10)) * 100) },
      { name: '이해·응답', rawAvg: avgFloat(detailSums.comprehension, dCount), max: 20, rate: Math.round((detailSums.comprehension / (dCount * 20)) * 100) },
      { name: '어휘 활용', rawAvg: avgFloat(detailSums.vocabulary, dCount), max: 20, rate: Math.round((detailSums.vocabulary / (dCount * 20)) * 100) },
      { name: '문법 구성', rawAvg: avgFloat(detailSums.grammar, dCount), max: 20, rate: Math.round((detailSums.grammar / (dCount * 20)) * 100) },
      { name: '표현·확장', rawAvg: avgFloat(detailSums.expression, dCount), max: 20, rate: Math.round((detailSums.expression / (dCount * 20)) * 100) },
    ];

    const sortedByRate = [...rawKoreanDetail].sort((a, b) => b.rate - a.rate);
    const krBestItem = sortedByRate[0] || { name: '-', rate: 0 };
    const krWeakItem = sortedByRate[sortedByRate.length - 1] || { name: '-', rate: 0 };

    const koreanDetailData = rawKoreanDetail.map(item => ({
      group: item.name,
      '달성률 (%)': item.rate,
      '평균 점수': item.rawAvg,
      '만점': item.max
    }));

    const totalGraded = countKr > 0 ? countKr : 1;
    const gradeData = [
      { group: 'A (80+ 우수)', '인원수': grades.A, '비율 (%)': Math.round((grades.A / totalGraded) * 100), fill: '#10b981' },
      { group: 'B (70~79 원활)', '인원수': grades.B, '비율 (%)': Math.round((grades.B / totalGraded) * 100), fill: '#3b82f6' },
      { group: 'C (60~69 소통)', '인원수': grades.C, '비율 (%)': Math.round((grades.C / totalGraded) * 100), fill: '#06b6d4' },
      { group: 'D (50~59 기초)', '인원수': grades.D, '비율 (%)': Math.round((grades.D / totalGraded) * 100), fill: '#f59e0b' },
      { group: 'E (<50 미흡)', '인원수': grades.E, '비율 (%)': Math.round((grades.E / totalGraded) * 100), fill: '#ef4444' },
    ];

    const communicationPassCount = grades.A + grades.B + grades.C;
    const communicationPassRate = countKr > 0 ? Math.round((communicationPassCount / countKr) * 100) : 0;

    return {
      stats: {
        total: { kr: avg(totalKr, countKr), weld: avg(totalWeld, countWeld), chibu: avg(totalChibu, countChibu) },
        e9: { kr: avg(e9Kr, e9CountKr), weld: avg(e9Weld, e9CountWeld), chibu: avg(e9Chibu, e9CountChibu) },
        gen: { kr: avg(genKr, genCountKr), weld: avg(genWeld, genCountWeld), chibu: avg(genChibu, genCountChibu) },
        grades,
        totalKrCount: countKr,
        communicationPassCount,
        communicationPassRate
      },
      statsByCountry,
      countriesList: countryArr.map(c => c.country),
      koreanDetailData,
      gradeData,
      topWeldCountry,
      topKrCountry,
      krBestItem,
      krWeakItem
    };
  }, [individuals]);

  const typeData = [
    {
      group: '한국어 수준',
      'E-9 출신': stats.e9.kr,
      '일반 외국인': stats.gen.kr,
      '전체 인원': stats.total.kr,
    },
    {
      group: '용접 기량',
      'E-9 출신': stats.e9.weld,
      '일반 외국인': stats.gen.weld,
      '전체 인원': stats.total.weld,
    },
    {
      group: '취부 기량',
      'E-9 출신': stats.e9.chibu,
      '일반 외국인': stats.gen.chibu,
      '전체 인원': stats.total.chibu,
    }
  ];

  if (individuals.length === 0) {
    return null;
  }

  const COUNTRY_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444', '#f97316'];

  return (
    <div className="bg-[#0a0f18]/60 backdrop-blur-md rounded-2xl border border-[#3b4a6b] shadow-[0_0_15px_rgba(59,130,246,0.1)] overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 h-full" style={{ animationDelay: '500ms' }}>
      <div className="absolute inset-0 z-0 opacity-[0.1] mix-blend-screen pointer-events-none" style={{ backgroundImage: "url('/yard.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="relative z-10">
        <div className="px-4 sm:px-5 py-2 sm:py-[5px] mt-0 h-auto sm:h-[52px] border-b border-[#232f43] flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#151c28]/60 gap-3 sm:gap-0">
          <h3 className="font-bold text-white text-[13px] sm:text-[15px] tracking-wide flex items-center gap-1.5 sm:gap-2">
            <Award size={16} className="text-purple-500 hidden sm:block" /> 입국자 기량 및 한국어 분석
          </h3>
          <div className="flex bg-[#0a0f18]/80 p-1 rounded-xl border border-[#232f43] overflow-x-auto hide-scrollbar w-full sm:w-auto gap-0.5">
            <button onClick={() => setChartView('type')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${chartView === 'type' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-slate-400 hover:text-slate-200'}`}>종류별 비교</button>
            <button onClick={() => setChartView('korean_detail')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${chartView === 'korean_detail' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-slate-400 hover:text-slate-200'}`}>한국어 6대 영역</button>
            <button onClick={() => setChartView('grade')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${chartView === 'grade' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-slate-400 hover:text-slate-200'}`}>등급 분포</button>
            <button onClick={() => setChartView('country')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${chartView === 'country' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-slate-400 hover:text-slate-200'}`}>국가별 비교</button>
          </div>
        </div>
        
        <div className="px-3 md:px-[15px] py-[15px] h-auto">
          {/* Dynamic Insight KPI Header */}
          {chartView === 'type' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-[13px] gap-3 sm:gap-4">
              <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">E-9 용접 평균</span>
                  <span className="text-xl font-display font-black text-purple-400 block">
                    {stats.e9.weld}<span className="text-xs text-slate-400 font-medium ml-1">점</span>
                    <span className="text-[10px] text-purple-300/80 font-mono font-bold ml-1.5">
                      (+{(stats.e9.weld - stats.gen.weld > 0 ? stats.e9.weld - stats.gen.weld : 0)}점 우수)
                    </span>
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-[#232f43] hidden sm:block"></div>
                <div className="flex-1 sm:flex-none">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">E-9 한국어 평균</span>
                  <span className="text-xl font-display font-black text-white block">
                    {stats.e9.kr}<span className="text-xs text-slate-400 font-medium ml-1">점</span>
                  </span>
                </div>
              </div>
              
              <div className="bg-[#151c28]/80 border border-[#232f43] rounded-xl px-3.5 py-1.5 flex flex-col items-end w-full sm:w-auto">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">현장 소통 가능(C등급↑)</span>
                <span className="text-lg font-display font-black text-emerald-400">
                  {stats.communicationPassRate}%<span className="text-xs text-slate-400 font-medium ml-1">({stats.communicationPassCount}명)</span>
                </span>
              </div>
            </div>
          )}

          {chartView === 'korean_detail' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-[13px] gap-3 sm:gap-4">
              <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">최우수 항목</span>
                  <span className="text-lg font-display font-black text-emerald-400 block">
                    {krBestItem.name}<span className="text-xs text-slate-400 font-medium ml-1.5 font-mono">{krBestItem.rate}%</span>
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-[#232f43] hidden sm:block"></div>
                <div className="flex-1 sm:flex-none">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">집중 보완 항목</span>
                  <span className="text-lg font-display font-black text-amber-400 block">
                    {krWeakItem.name}<span className="text-xs text-slate-400 font-medium ml-1.5 font-mono">{krWeakItem.rate}%</span>
                  </span>
                </div>
              </div>
              
              <div className="bg-[#151c28]/80 border border-[#232f43] rounded-xl px-3.5 py-1.5 flex flex-col items-end w-full sm:w-auto">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">구술 평가 평균</span>
                <span className="text-lg font-display font-black text-purple-400">
                  {stats.total.kr}<span className="text-xs text-slate-400 font-medium ml-1">/ 100점</span>
                </span>
              </div>
            </div>
          )}

          {chartView === 'grade' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-[13px] gap-3 sm:gap-4">
              <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">우수 회화 (A·B)</span>
                  <span className="text-lg font-display font-black text-emerald-400 block">
                    {stats.grades.A + stats.grades.B}명
                    <span className="text-xs text-slate-400 font-medium ml-1 font-mono">
                      ({stats.totalKrCount > 0 ? Math.round(((stats.grades.A + stats.grades.B) / stats.totalKrCount) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-[#232f43] hidden sm:block"></div>
                <div className="flex-1 sm:flex-none">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">기초 소통 (C)</span>
                  <span className="text-lg font-display font-black text-cyan-400 block">
                    {stats.grades.C}명
                    <span className="text-xs text-slate-400 font-medium ml-1 font-mono">
                      ({stats.totalKrCount > 0 ? Math.round((stats.grades.C / stats.totalKrCount) * 100) : 0}%)
                    </span>
                  </span>
                </div>
              </div>
              
              <div className="bg-[#151c28]/80 border border-[#232f43] rounded-xl px-3.5 py-1.5 flex flex-col items-end w-full sm:w-auto">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">보충 교육 필요 (D·E)</span>
                <span className="text-lg font-display font-black text-amber-400">
                  {stats.grades.D + stats.grades.E}명
                  <span className="text-xs text-slate-400 font-medium ml-1 font-mono">
                    ({stats.totalKrCount > 0 ? Math.round(((stats.grades.D + stats.grades.E) / stats.totalKrCount) * 100) : 0}%)
                  </span>
                </span>
              </div>
            </div>
          )}

          {chartView === 'country' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-[13px] gap-3 sm:gap-4">
              <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">최고 용접 기량 국가</span>
                  <span className="text-lg font-display font-black text-blue-400 block">
                    {topWeldCountry.country}<span className="text-xs text-slate-400 font-medium ml-1.5 font-mono">{topWeldCountry.weld}점</span>
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-[#232f43] hidden sm:block"></div>
                <div className="flex-1 sm:flex-none">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">최고 한국어 국가</span>
                  <span className="text-lg font-display font-black text-purple-400 block">
                    {topKrCountry.country}<span className="text-xs text-slate-400 font-medium ml-1.5 font-mono">{topKrCountry.kr}점</span>
                  </span>
                </div>
              </div>
              
              <div className="bg-[#151c28]/80 border border-[#232f43] rounded-xl px-3.5 py-1.5 flex flex-col items-end w-full sm:w-auto">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-0.5">입국 대상 국적 수</span>
                <span className="text-lg font-display font-black text-emerald-400">
                  {countriesList.length}<span className="text-xs text-slate-400 font-medium ml-1">개국</span>
                </span>
              </div>
            </div>
          )}

          {/* Chart Viewport */}
          <div className="h-[175px] sm:h-[210px] w-full mt-4 md:mt-2 min-h-[175px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={175}>
              {chartView === 'type' ? (
                <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232f43" vertical={false} />
                  <XAxis dataKey="group" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '12px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    itemStyle={{ color: '#e2e8f0', fontSize: '12px', padding: '2px 0' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}
                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="E-9 출신" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="일반 외국인" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="전체 인원" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              ) : chartView === 'korean_detail' ? (
                <BarChart data={koreanDetailData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232f43" vertical={false} />
                  <XAxis dataKey="group" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '12px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    itemStyle={{ color: '#e2e8f0', fontSize: '12px', padding: '2px 0' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}
                    formatter={(value: any, name: any, item: any) => [`${value}% (${item.payload['평균 점수']}/${item.payload['만점']}점)`, name]}
                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="달성률 (%)" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              ) : chartView === 'grade' ? (
                <BarChart data={gradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232f43" vertical={false} />
                  <XAxis dataKey="group" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '12px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    itemStyle={{ color: '#e2e8f0', fontSize: '12px', padding: '2px 0' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}
                    formatter={(value: any, name: any, item: any) => [`${value}명 (${item.payload['비율 (%)']}%)`, name]}
                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="인원수" radius={[4, 4, 0, 0]} barSize={26}>
                    {gradeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart data={statsByCountry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232f43" vertical={false} />
                  <XAxis dataKey="group" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '12px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    itemStyle={{ color: '#e2e8f0', fontSize: '12px', padding: '2px 0' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}
                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  {countriesList.map((country, idx) => (
                    <Bar key={country} dataKey={country} fill={COUNTRY_COLORS[idx % COUNTRY_COLORS.length]} radius={[4, 4, 0, 0]} barSize={15} />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
