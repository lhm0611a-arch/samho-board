import { WEEK_MAP } from './constants';
import { IndividualData, RequestData, AgencySupplyData, IndividualStatus } from './types';

export const getWeekStr = (w: number | string | null): string => {
  if (w === null || w === '탈락') return '';
  const absWeek = typeof w === 'string' ? parseInt(w, 10) : w;
  if (isNaN(absWeek) || absWeek <= 0) return '';
  
  const year = 2025 + Math.floor((absWeek - 1) / 52);
  const weekInYear = ((absWeek - 1) % 52) + 1;
  
  return WEEK_MAP[weekInYear - 1] ? `${year}년 ${WEEK_MAP[weekInYear - 1].m}월 ${WEEK_MAP[weekInYear - 1].w}주차` : `${year}년 W${weekInYear}`;
};

export const getMonthStr = (w: number | null): string => {
  if (w === null || w <= 0) return '';
  const year = 2025 + Math.floor((w - 1) / 52);
  const weekInYear = ((w - 1) % 52) + 1;
  return WEEK_MAP[weekInYear - 1] ? `${year}년 ${WEEK_MAP[weekInYear - 1].m}월` : `${year}년`;
};

export const isMonthStart = (w: number | null): boolean => {
  if (w === null || w <= 0) return false;
  const weekInYear = ((w - 1) % 52) + 1;
  return WEEK_MAP[weekInYear - 1] && WEEK_MAP[weekInYear - 1].w === 1;
};

export const getIsoWeek = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekInYear = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return (d.getUTCFullYear() - 2025) * 52 + weekInYear;
};

export const parseCSVText = (text: string): string[][] => {
  const result: string[][] = [];
  let currentLine: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentValue += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentLine.push(currentValue.trim());
      currentValue = '';
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !insideQuotes) {
      if (char === '\r') i++;
      currentLine.push(currentValue.trim());
      result.push(currentLine);
      currentLine = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  if (currentValue !== '' || currentLine.length > 0) {
    currentLine.push(currentValue.trim());
    result.push(currentLine);
  }
  return result;
};

export const parseWeekInfo = (val: string | undefined): number | '탈락' | null => {
  if (!val) return null;
  const rawStr = String(val).replace(/\s+/g, '');
  if (rawStr === '' || rawStr === '-') return null;
  if (rawStr.includes('탈락')) return '탈락';
  const dateMatch = rawStr.match(/(\d{2,4})[-\.\/년](\d{1,2})[-\.\/월](\d{1,2})[일]?/);
  if (dateMatch) {
    let year = parseInt(dateMatch[1]);
    if (year < 100) year += 2000;
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    return getIsoWeek(new Date(year, month, day));
  }
  const shortDateMatch = rawStr.match(/^(\d{1,2})[-\.\/](\d{1,2})$/);
  if (shortDateMatch) return getIsoWeek(new Date(2026, parseInt(shortDateMatch[1]) - 1, parseInt(shortDateMatch[2])));
  const numMatch = rawStr.match(/^(\d+)$/);
  if (numMatch) return Number(numMatch[1]);
  return null;
};

export const parsePreRow = (cols: string[], rowIndex: number): IndividualData | null => {
  if (!cols || cols.length < 5) return null;
  const uid = cols[1] ? String(cols[1]).trim() : '';
  const name = cols[3] ? String(cols[3]).trim() : '';
  if (uid === '응시번호' || name === '성 명' || name === '이름') return null;
  if (!uid && !name) return null;

  const dob = cols[4] ? String(cols[4]).trim() : '';
  const job = cols[2] ? String(cols[2]).trim() : '';
  return {
    uid: uid || `N/A-pre-${rowIndex}`, job: job || '미지정', name, dob, age: cols[6] || '',
    isE9: cols[5] ? /[oO○]/.test(String(cols[5])) : false,
    preKrScore: String(cols[13] || '').replace(/[^0-9]/g, ''),
    preChibuScore: String(cols[17] || '').replace(/[^0-9]/g, ''),
    preWeldScore: String(cols[19] || '').replace(/[^0-9]/g, ''),
    country: cols[22] || '미지정', agency: cols[23] || '미지정',
    preTestWeek: parseWeekInfo(cols[24]), prePassWeek: parseWeekInfo(cols[25]), preDropWeek: parseWeekInfo(cols[26])
  };
};

export const parseMainRow = (cols: string[], rowIndex: number): IndividualData | null => {
  if (!cols || cols.length < 5) return null;
  const uid = cols[1] ? String(cols[1]).trim() : '';
  const name = cols[3] ? String(cols[3]).trim() : '';
  if (uid === '응시번호' || name === '성 명' || name === '이름') return null;
  if (!uid && !name) return null;

  const dob = cols[4] ? String(cols[4]).trim() : '';
  const job = cols[2] ? String(cols[2]).trim() : '';
  return {
    uid: uid || `N/A-main-${rowIndex}`, job: job || '미지정', name, dob, age: cols[6] || '',
    isE9: cols[5] ? /[oO○]/.test(String(cols[5])) : false,
    country: cols[22] || '미지정', agency: cols[23] || '미지정',
    mainKrScore: String(cols[13] || '').replace(/[^0-9]/g, ''),
    mainChibuScore: String(cols[17] || '').replace(/[^0-9]/g, ''),
    mainWeldScore: String(cols[19] || '').replace(/[^0-9]/g, ''),
    mainTestWeek: parseWeekInfo(cols[24]), mainPassWeek: parseWeekInfo(cols[25]), mainDropWeek: parseWeekInfo(cols[26]),
    entryPassWeek: parseWeekInfo(cols[27]), entryDropWeek: parseWeekInfo(cols[28]),
    assignedDept: cols[30], videoUrl: cols[31], personalityTestUrl: cols[32]
  };
};

export const getIndividualStatus = (ind: IndividualData, currentWeek: number): IndividualStatus => {
  let st = { preTested: false, prePassed: false, preDropped: false, preWaiting: false, mainTested: false, mainPassed: false, mainDropped: false, mainWaiting: false, entryPassed: false, entryDropped: false, currentStage: '진행예정' };
  const isPast = (w: number | '탈락' | null | undefined) => w === '탈락' || (typeof w === 'number' && currentWeek >= w);

  const hasMain = ind.hasMainData;
  const hasPre = ind.hasPreData;
  const hasEntry = ind.entryPassWeek || ind.entryDropWeek;

  if (hasPre) {
    if (ind.preDropWeek && isPast(ind.preDropWeek)) { st.preTested = true; st.preDropped = true; }
    else if (ind.prePassWeek && isPast(ind.prePassWeek)) { st.preTested = true; st.prePassed = true; }
    else if (ind.preTestWeek && isPast(ind.preTestWeek)) { st.preTested = true; st.preWaiting = true; }
    else { st.preTested = true; st.preWaiting = true; }
  }

  if (hasPre && hasMain) {
    st.preTested = true;
    st.prePassed = true;
    st.preDropped = false;
    st.preWaiting = false;
  }

  if (hasMain) {
    if (ind.mainDropWeek && isPast(ind.mainDropWeek)) { st.mainTested = true; st.mainDropped = true; }
    else if (ind.mainPassWeek && isPast(ind.mainPassWeek)) { st.mainTested = true; st.mainPassed = true; }
    else if (ind.mainTestWeek && isPast(ind.mainTestWeek)) { st.mainTested = true; st.mainWaiting = true; }
    else { st.mainTested = true; st.mainWaiting = true; }
  }

  if (hasMain && hasEntry) {
    st.mainTested = true;
    st.mainPassed = true;
    st.mainDropped = false;
    st.mainWaiting = false;
  }
  if (hasPre && hasEntry) {
    st.preTested = true;
    st.prePassed = true;
    st.preDropped = false;
    st.preWaiting = false;
  }

  if (ind.entryDropWeek && isPast(ind.entryDropWeek)) st.entryDropped = true;
  else if (ind.entryPassWeek && isPast(ind.entryPassWeek)) st.entryPassed = true;

  if (st.entryDropped || st.entryPassed) st.currentStage = '입국';
  else if (st.mainPassed) st.currentStage = '2차 육성(기량,한국어)';
  else if (st.mainDropped || st.mainWaiting) st.currentStage = '본기량검증완료';
  else if (st.prePassed) st.currentStage = '1차 육성(기량,한국어)';
  else if (st.preDropped || st.preWaiting) st.currentStage = '사전기량검증완료';
  else if (hasPre || hasMain) st.currentStage = '진행예정';

  return { stage: st.currentStage, isDropped: st.preDropped || st.mainDropped || st.entryDropped, ...st };
};

export const assignDepartments = (individuals: IndividualData[], requests: RequestData[]): IndividualData[] => {
  let needs = requests.map(r => ({ ...r, remaining: r.reqCount, assignedCountries: new Set<string>(), assignedAgencies: new Set<string>(), assignedWeeks: new Set<number>() }));
  let inds = individuals.map(ind => ({ ...ind }));
  const availableDepts = [...new Set(needs.map(n => n.dept))].sort((a, b) => b.length - a.length);

  inds.forEach(ind => {
    if (ind.assignedDept && ind.assignedDept.trim() !== '') {
      let assigned = ind.assignedDept.trim();
      if (!needs.some(n => n.dept === assigned)) {
        const matchedDept = availableDepts.find(dept => assigned.includes(dept));
        if (matchedDept) assigned = matchedDept;
      }
      let req = needs.find(n => n.dept === assigned && n.job === ind.job);
      if (req && req.remaining !== undefined && req.remaining > 0) {
        req.remaining--;
        req.assignedCountries?.add(ind.country);
        if (ind.agency) req.assignedAgencies?.add(ind.agency);
        if (typeof ind.entryPassWeek === 'number') req.assignedWeeks?.add(ind.entryPassWeek);
        else req.assignedWeeks?.add(999);
      }
      ind.displayDept = assigned; ind.isDeptFixed = true;
    } else { ind.isDeptFixed = false; }
  });

  const pendingInds = inds.filter(i => !i.isDeptFixed);
  const groups: Record<string, { job: string, country: string, agency?: string, week: number, members: IndividualData[] }> = {};
  pendingInds.forEach(ind => {
    const week = (typeof ind.entryPassWeek === 'number' ? ind.entryPassWeek : 999);
    const key = `${ind.job}_${ind.country}_${ind.agency}_${week}`;
    if (!groups[key]) groups[key] = { job: ind.job, country: ind.country, agency: ind.agency, week: week, members: [] };
    groups[key].members.push(ind);
  });

  Object.values(groups).sort((a, b) => b.members.length - a.members.length).forEach(g => {
    let remainingToAssign = g.members.length;
    while (remainingToAssign > 0) {
      let validReqs = needs.filter(n => n.job === g.job && (n.remaining || 0) > 0);
      if (validReqs.length === 0) break;
      validReqs.sort((a, b) => {
        const aHasC = a.assignedCountries?.has(g.country) || false;
        const bHasC = b.assignedCountries?.has(g.country) || false;
        if (aHasC !== bHasC) return aHasC ? -1 : 1;

        const aCanTakeAll = (a.remaining || 0) >= remainingToAssign;
        const bCanTakeAll = (b.remaining || 0) >= remainingToAssign;
        if (aCanTakeAll !== bCanTakeAll) return aCanTakeAll ? -1 : 1;

        const diffA = Math.abs((g.week === 999 ? 52 : g.week) - a.reqWeek);
        const diffB = Math.abs((g.week === 999 ? 52 : g.week) - b.reqWeek);
        if (Math.abs(diffA - diffB) > 2) return diffA - diffB;

        return (b.remaining || 0) - (a.remaining || 0);
      });
      let bestReq = validReqs[0];
      const assignCount = Math.min(remainingToAssign, bestReq.remaining || 0);
      bestReq.assignedCountries?.add(g.country);
      if (g.agency) bestReq.assignedAgencies?.add(g.agency);
      bestReq.assignedWeeks?.add(g.week);
      for (let i = 0; i < assignCount; i++) { const member = g.members.shift(); if (member) member.displayDept = bestReq.dept; }
      if(bestReq.remaining !== undefined) bestReq.remaining -= assignCount; 
      remainingToAssign -= assignCount;
    }
  });

  inds.forEach(ind => { 
      if (!ind.displayDept) ind.displayDept = (typeof ind.entryPassWeek === 'number' && ind.entryPassWeek <= 0) ? '배치제외(25년입국)' : '대기(TBD)'; 
  });
  return inds;
};

export const autoAllocate = (requests: RequestData[], supplies: AgencySupplyData[]): RequestData[] => {
  const demandPool: RequestData[] = requests.map(r => ({ ...r, remaining: r.reqCount, fulfillments: [], assignedCountries: new Set<string>(), assignedAgencies: new Set<string>() }));
  const supplyPool = supplies.map(s => ({ ...s, remaining: s.count }));
  const availableDepts = [...new Set(demandPool.map(d => d.dept))].sort((a, b) => b.length - a.length);

  supplyPool.sort((a, b) => b.count - a.count);

  supplyPool.forEach(s => {
    if (s.fixedDept && (s.fixedCount || 0) > 0) {
      let assigned = s.fixedDept.trim();
      if (!demandPool.some(d => d.dept === assigned)) {
        const matchedDept = availableDepts.find(dept => assigned.includes(dept));
        if (matchedDept) assigned = matchedDept;
      }
      let take = Math.min(s.remaining || 0, s.fixedCount || 0);
      let validDemands = demandPool.filter(d => d.dept === assigned && d.job === s.job);
      if (validDemands.length > 0) {
        let targetDemand = validDemands[0];
        targetDemand.fulfillments.push({ count: take, supplyWeek: s.supplyWeek, agency: s.agency, country: s.country, isFixed: true });
        targetDemand.assignedCountries.add(s.country); targetDemand.assignedAgencies.add(s.agency);
        if (s.remaining !== undefined) s.remaining -= take; 
        if (targetDemand.remaining !== undefined) targetDemand.remaining -= take;
      } else {
        let newDemand: RequestData = {
          id: demandPool.length + 1000, dept: assigned, job: s.job, reqCount: 0, reqWeek: s.supplyWeek || 52,
          remaining: -take,
          fulfillments: [{ count: take, supplyWeek: s.supplyWeek, agency: s.agency, country: s.country, isFixed: true }],
          assignedCountries: new Set([s.country]), assignedAgencies: new Set([s.agency])
        };
        demandPool.push(newDemand);
        if (s.remaining !== undefined) s.remaining -= take;
      }
    }
  });

  supplyPool.forEach(s => {
    while ((s.remaining || 0) > 0) {
      let validDemands = demandPool.filter(d => d.job === s.job && (d.remaining || 0) > 0);
      if (validDemands.length === 0) break;
      validDemands.sort((a, b) => {
        const aHasC = a.assignedCountries.has(s.country);
        const bHasC = b.assignedCountries.has(s.country);
        if (aHasC !== bHasC) return aHasC ? -1 : 1;

        const aCanTakeAll = (a.remaining || 0) >= (s.remaining || 0);
        const bCanTakeAll = (b.remaining || 0) >= (s.remaining || 0);
        if (aCanTakeAll !== bCanTakeAll) return aCanTakeAll ? -1 : 1;

        const diffA = Math.abs((s.supplyWeek || 52) - a.reqWeek);
        const diffB = Math.abs((s.supplyWeek || 52) - b.reqWeek);
        if (Math.abs(diffA - diffB) > 2) return diffA - diffB;

        return (b.remaining || 0) - (a.remaining || 0);
      });
      let targetDemand = validDemands[0];
      let take = Math.min((s.remaining || 0), (targetDemand.remaining || 0));
      targetDemand.fulfillments.push({ count: take, supplyWeek: s.supplyWeek, agency: s.agency, country: s.country, isFixed: false });
      targetDemand.assignedCountries.add(s.country); targetDemand.assignedAgencies.add(s.agency);
      if(s.remaining !== undefined) s.remaining -= take; 
      if(targetDemand.remaining !== undefined) targetDemand.remaining -= take;
    }
  });

  return demandPool.map(req => ({ ...req, fulfilledCount: req.reqCount - Math.max(0, req.remaining || 0), unfulfilledCount: Math.max(0, req.remaining || 0) })).sort((a, b) => a.id - b.id);
};

export const getSheetId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};
