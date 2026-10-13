import { WEEK_MAP } from './constants';
import { IndividualData, RequestData, AgencySupplyData, IndividualStatus, KrSpeakingDetail } from './types';

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
  const year = date.getFullYear();
  const d = new Date(Date.UTC(year, date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  let weekInYear = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  
  if (d.getUTCFullYear() > year) {
    weekInYear = 52;
  } else if (d.getUTCFullYear() < year) {
    weekInYear = 1;
  }
  
  if (weekInYear > 52) weekInYear = 52;
  if (weekInYear < 1) weekInYear = 1;
  
  return (year - 2025) * 52 + weekInYear;
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

export const parseWeekInfo = (val: string | undefined | null): number | '탈락' | null => {
  if (!val) return null;
  const rawStr = String(val).replace(/\s+/g, '');
  if (rawStr === '' || rawStr === '-' || rawStr.toLowerCase() === 'n/a') return null;
  if (rawStr.includes('탈락') || rawStr.includes('불합격')) return '탈락';
  
  // Format: (YY|YYYY년|.) M월 W주차 e.g. 25.11월4주차, 25년11월4주차, 11월4주차, 25.11.4주차
  const mwMatch = rawStr.match(/^(?:(\d{2,4})[-\.\/년]?)?(\d{1,2})[월\.\-\/](\d{1,2})(?:주차|주)?$/);
  if (mwMatch && rawStr.includes('주')) {
    let year = mwMatch[1] ? parseInt(mwMatch[1], 10) : 2025;
    if (year < 100) year += 2000;
    const month = parseInt(mwMatch[2], 10);
    const week = parseInt(mwMatch[3], 10);
    const idx = WEEK_MAP.findIndex(wm => wm.m === month && wm.w === week);
    if (idx !== -1) {
      return (year - 2025) * 52 + (idx + 1);
    } else {
      const weekInYear = Math.min(52, Math.max(1, (month - 1) * 4 + week));
      return (year - 2025) * 52 + weekInYear;
    }
  }

  // Format: YYYY.MM.DD or YYYY-MM-DD or YYYY/MM/DD or YYYY년MM월DD일
  const dateMatch = rawStr.match(/(\d{2,4})[-\.\/년](\d{1,2})[-\.\/월](\d{1,2})[일]?/);
  if (dateMatch) {
    let year = parseInt(dateMatch[1]);
    if (year < 100) year += 2000;
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    return getIsoWeek(new Date(year, month, day));
  }
  
  // Format: YYYY.MM or YYYY-MM or YYYY년MM월
  const ymMatch = rawStr.match(/^(\d{2,4})[-\.\/년](\d{1,2})[월]?$/);
  if (ymMatch) {
    let year = parseInt(ymMatch[1]);
    if (year < 100) year += 2000;
    const month = parseInt(ymMatch[2]) - 1;
    return getIsoWeek(new Date(year, month, 1));
  }

  // Format: MM.DD (assume 2025/2026 based on month)
  const shortDateMatch = rawStr.match(/^(\d{1,2})[-\.\/](\d{1,2})$/);
  if (shortDateMatch) {
    const month = parseInt(shortDateMatch[1]);
    const day = parseInt(shortDateMatch[2]);
    const year = month >= 10 ? 2025 : 2026;
    return getIsoWeek(new Date(year, month - 1, day));
  }

  // Format: W52 or 52주차 or 52
  const numMatch = rawStr.match(/^[Ww]?(\d+)(주차)?$/);
  if (numMatch) {
     const w = Number(numMatch[1]);
     if (w > 0 && w <= 200) return w;
  }
  return null;
};

export const normalizeUID = (uid: string | undefined | null): string => {
  if (!uid) return '';
  const cleaned = String(uid).replace(/\s+/g, '').toUpperCase();
  if (!cleaned || cleaned.includes('N/A') || cleaned === '응시번호') return '';
  // Normalize leading zeros in IDs like D-004 -> D-4, VJ-001 -> VJ-1, TM011 -> TM-11
  return cleaned.replace(/^([A-Z]+)-?0*(\d+)$/, '$1-$2');
};

export const normalizeName = (name: string | undefined | null): string => {
  if (!name) return '';
  return String(name).toLowerCase().replace(/\s+/g, '');
};

/**
 * 이름을 단어(토큰) 단위로 분리하고 특수문자 제거
 * 예: "YANUARY MUHAMMAD" -> ["yanuary", "muhammad"]
 */
export const cleanAndTokenizeName = (name: string | undefined | null): string[] => {
  if (!name) return [];
  const cleaned = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, ' ')
    .trim();
  if (!cleaned) return [];
  return cleaned.split(/\s+/).filter(Boolean);
};

/**
 * 이름 동일 여부 판단:
 * 1. 공백 제거 후 완전 일치 (예: "김진우" == "김 진우")
 * 2. 띄어쓰기 기준 이름/중간이름/성의 순서가 바뀌어도 단어별 스펠링이 일치하면 동일인
 *    (예: "YANUARY MUHAMMAD" == "MUHAMMAD YANUARY", "AHMAD TAUFIQ HIDAYAT" == "HIDAYAT AHMAD TAUFIQ")
 */
export const isSameName = (nameA?: string, nameB?: string): boolean => {
  if (!nameA || !nameB) return false;
  const normA = normalizeName(nameA);
  const normB = normalizeName(nameB);
  if (normA && normB && normA === normB) return true;

  const tokensA = cleanAndTokenizeName(nameA);
  const tokensB = cleanAndTokenizeName(nameB);
  if (tokensA.length === 0 || tokensB.length === 0) return false;
  if (tokensA.length !== tokensB.length) return false;

  const sortedA = [...tokensA].sort().join(' ');
  const sortedB = [...tokensB].sort().join(' ');
  return sortedA === sortedB;
};

export const normalizeBirthMonth = (dob: string | undefined | null): string => {
  if (!dob) return '';
  const str = String(dob).trim();
  const parts = str.split(/[-./\s]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    let y = parts[0];
    let m = parts[1];
    // DD/MM/YYYY 형태 처리 (마지막 요소가 4자리 연도인 경우)
    if (parts.length >= 3 && parts[parts.length - 1].length === 4) {
      y = parts[parts.length - 1];
      m = parts[1];
    } else if (y.length === 2) {
      y = `19${y}`;
    }
    return `${y}${m.padStart(2, '0')}`;
  }
  const digits = str.replace(/[^0-9]/g, '');
  if (digits.length >= 6) {
    return digits.slice(0, 6);
  }
  return digits;
};

export const normalizeDOB = (dob: string | undefined | null): string => {
  if (!dob) return '';
  const str = String(dob).trim();
  const parts = str.split(/[-./\s]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    let y = parts[0];
    let m = parts[1];
    let d = parts[2];
    // DD/MM/YYYY 형태 처리 (마지막 요소가 4자리 연도인 경우)
    if (parts[2].length === 4) {
      y = parts[2];
      m = parts[1];
      d = parts[0];
    } else if (y.length === 2) {
      y = `19${y}`;
    }
    return `${y}${m.padStart(2, '0')}${d.padStart(2, '0')}`;
  }
  const digits = str.replace(/[^0-9]/g, '');
  if (digits.length === 8) {
    return digits;
  }
  if (digits.length === 6) {
    return `19${digits}`;
  }
  return digits;
};

export const isSameDOB = (dobA?: string, dobB?: string): boolean => {
  if (!dobA && !dobB) return true;
  if (!dobA || !dobB) return true;
  const dA = normalizeDOB(dobA);
  const dB = normalizeDOB(dobB);
  if (dA && dB) {
    if (dA === dB) return true;
    const ymA = normalizeBirthMonth(dobA);
    const ymB = normalizeBirthMonth(dobB);
    if (ymA && ymB) {
      return ymA === ymB;
    }
    return false;
  }
  return true;
};

/**
 * 단계별 수급 진행 현황 동일인 판별:
 * - 응시번호는 무시
 * - 띄어쓰기 기준 성/이름/중간이름 위치가 바뀌어 있어도 동일 스펠링이면 동일인
 * - 생년월일(DOB) 일치 확인
 */
export const isSameIndividual = (
  ind1: { uid?: string; name?: string; dob?: string },
  ind2: { uid?: string; name?: string; dob?: string }
): boolean => {
  if (!ind1 || !ind2) return false;
  if (!isSameName(ind1.name, ind2.name)) return false;

  const dobA = normalizeDOB(ind1.dob);
  const dobB = normalizeDOB(ind2.dob);
  if (dobA && dobB) {
    if (dobA === dobB) return true;
    const ymA = normalizeBirthMonth(ind1.dob);
    const ymB = normalizeBirthMonth(ind2.dob);
    if (ymA && ymB) {
      return ymA === ymB;
    }
    return false;
  }

  return true;
};


export const createHeaderMap = (headerRows: string[][]): Record<string, number> => {
  const map: Record<string, number> = {};
  if (!headerRows || headerRows.length === 0) return map;
  
  for (let r = 0; r < Math.min(4, headerRows.length); r++) {
    const row = headerRows[r];
    if (!row) continue;
    row.forEach((col, idx) => {
      const clean = col.replace(/\s+/g, '').replace(/"/g, '');
      if (clean && map[clean] === undefined) {
        map[clean] = idx;
      }
    });
  }
  return map;
};

const cleanStr = (s: any): string => String(s || '').trim();

/**
 * Robust Pre-Test Row Parser (사전기량검증)
 */
export const parsePreRow = (cols: string[], rowIndex: number, map?: Record<string, number>): IndividualData | null => {
  if (!cols || cols.length < 5) return null;
  
  const getCol = (names: string[], defIdx: number): string => {
    if (map) {
      for (const n of names) {
        const cleanN = n.replace(/\s+/g, '').replace(/"/g, '');
        if (map[cleanN] !== undefined && cols[map[cleanN]] !== undefined) {
          return cleanStr(cols[map[cleanN]]);
        }
      }
    }
    return cleanStr(cols[defIdx]);
  };

  const uid = getCol(['응시번호', 'UID', 'NO'], 1);
  const name = getCol(['성명', '성 명', '이름'], 3);
  if (!uid || uid === '응시번호' || uid === 'NO' || name === '성명' || name === '성 명') return null;

  const job = getCol(['직종', '직무'], 2) || '미지정';
  const dob = getCol(['생년월일', 'DOB'], 4);
  const isE9 = /[oO○0]/.test(getCol(['E9여부', 'E9', 'E-9'], 5));
  const age = getCol(['나이', '연령'], 6);

  // Speaking evaluation details
  const krComprehension = cleanStr(cols[7]);
  const krPronunciation = cleanStr(cols[8]);
  const krGrammar = cleanStr(cols[9]);
  const krVocabulary = cleanStr(cols[10]);
  const krExpression = cleanStr(cols[11]);
  const krAttitude = cleanStr(cols[12]);
  
  // Scores
  const krScore = cleanStr(cols[13]);
  const krGrade = cleanStr(cols[14]);
  const krStatus = cleanStr(cols[15]);
  
  const chibuScore = cleanStr(cols[17]);
  const chibuGrade = cleanStr(cols[18]);
  const weldScore = cleanStr(cols[19]);
  const weldGrade = cleanStr(cols[20]);

  const resultStr = getCol(['기량검증결과', '기량검증 결과', '검증결과'], 21);
  const country = getCol(['국적', '국가'], 22) || '미지정';
  const agency = getCol(['송출업체', '업체', '송출사'], 23) || '미지정';

  const testWeek = parseWeekInfo(getCol(['응시일시', '응시일자', '시험일자', '사전기량응시일시', '사전기량응시일자'], 24));
  const passWeek = parseWeekInfo(getCol(['합격일자', '사전기량합격일자'], 25));
  const dropWeek = parseWeekInfo(getCol(['사전기량탈락일자', '탈락일자', '사전기량불합격일자', '불합격일자'], 26));

  // Determine Pass / Drop status accurately:
  // '기량검증 결과' 텍스트로 판단하지 않고 오직 '합격일자', '사전기량 탈락일자' 일자 컬럼으로만 판단!
  let finalPassWeek: number | '탈락' | null = null;
  let finalDropWeek: number | '탈락' | null = null;

  if (passWeek !== null) {
    finalPassWeek = passWeek;
  } else if (dropWeek !== null) {
    finalDropWeek = dropWeek;
  }

  const track = getCol(['트랙', '구분'], 27) || '민간업체';
  const notes = cols.slice(28).map(cleanStr).filter(Boolean).join(' | ');

  const krDetail: KrSpeakingDetail = {
    comprehension: krComprehension,
    pronunciation: krPronunciation,
    grammar: krGrammar,
    vocabulary: krVocabulary,
    expression: krExpression,
    attitude: krAttitude,
  };

  return {
    uid,
    name,
    job,
    dob,
    isE9,
    age,
    country,
    agency,
    track,
    notes,
    preKrScore: krScore,
    preKrGrade: krGrade,
    preKrStatus: krStatus,
    preChibuScore: chibuScore,
    preChibuGrade: chibuGrade,
    preWeldScore: weldScore,
    preWeldGrade: weldGrade,
    preResult: resultStr,
    preTestWeek: testWeek,
    prePassWeek: finalPassWeek,
    preDropWeek: finalDropWeek,
    preKrDetail: krDetail,
  };
};

/**
 * Robust Main-Test Row Parser (본기량검증)
 */
export const parseMainRow = (cols: string[], rowIndex: number, map?: Record<string, number>): IndividualData | null => {
  if (!cols || cols.length < 5) return null;
  
  const getCol = (names: string[], defIdx: number): string => {
    if (map) {
      for (const n of names) {
        const cleanN = n.replace(/\s+/g, '').replace(/"/g, '');
        if (map[cleanN] !== undefined && cols[map[cleanN]] !== undefined) {
          return cleanStr(cols[map[cleanN]]);
        }
      }
    }
    return cleanStr(cols[defIdx]);
  };

  const uid = getCol(['응시번호', 'UID', 'NO'], 1);
  const name = getCol(['성명', '성 명', '이름'], 3);
  if (!uid || uid === '응시번호' || uid === 'NO' || name === '성명' || name === '성 명') return null;

  const job = getCol(['직종', '직무'], 2) || '미지정';
  const dob = getCol(['생년월일', 'DOB'], 4);
  const isE9 = /[oO○0]/.test(getCol(['E9여부', 'E9', 'E-9'], 5));
  const age = getCol(['나이', '연령'], 6);

  // Speaking evaluation details
  const krComprehension = cleanStr(cols[7]);
  const krPronunciation = cleanStr(cols[8]);
  const krGrammar = cleanStr(cols[9]);
  const krVocabulary = cleanStr(cols[10]);
  const krExpression = cleanStr(cols[11]);
  const krAttitude = cleanStr(cols[12]);

  // Scores
  const krScore = cleanStr(cols[13]);
  const krGrade = cleanStr(cols[14]);
  const krStatus = cleanStr(cols[15]);

  const chibuScore = cleanStr(cols[17]);
  const chibuGrade = cleanStr(cols[18]);
  const weldScore = cleanStr(cols[19]);
  const weldGrade = cleanStr(cols[20]);

  const resultStr = getCol(['기량검증결과', '기량검증 결과', '검증결과'], 21);
  const country = getCol(['국적', '국가'], 22) || '미지정';
  const agency = getCol(['송출업체', '업체', '송출사'], 23) || '미지정';

  const testWeek = parseWeekInfo(getCol(['응시일시', '응시일자', '시험일자', '본기량응시일시', '본기량응시일자'], 24));
  const passWeek = parseWeekInfo(getCol(['합격일자', '본기량합격일자'], 25));
  const dropWeek = parseWeekInfo(getCol(['본기량탈락일자', '탈락일자', '본기량불합격일자', '불합격일자'], 26));
  const entryPassWeek = parseWeekInfo(getCol(['입국일자', '입국일시'], 27));
  const entryDropWeek = parseWeekInfo(getCol(['입국탈락일자', '입국불합격일자'], 28));

  let finalPassWeek: number | '탈락' | null = null;
  let finalDropWeek: number | '탈락' | null = null;
  let finalEntryPassWeek: number | '탈락' | null = null;
  let finalEntryDropWeek: number | '탈락' | null = null;

  // 1. Entry priority: 입국일자가 있으면 입국합격, 입국탈락일자가 있으면 입국탈락
  if (entryPassWeek !== null) {
    finalEntryPassWeek = entryPassWeek;
  } else if (entryDropWeek !== null) {
    finalEntryDropWeek = entryDropWeek;
  }

  // 2. Main pass/drop priority: '기량검증 결과' 텍스트로 판단하지 않고 오직 '합격일자', '본기량 탈락일자' (또는 확정된 입국일자)로만 판단!
  if (passWeek !== null) {
    finalPassWeek = passWeek;
  } else if (dropWeek !== null) {
    finalDropWeek = dropWeek;
  } else if (entryPassWeek !== null) {
    // 입국일자가 부여되어 있는 인원은 이미 본기량을 합격한 상태
    finalPassWeek = entryPassWeek;
  }

  const track = getCol(['트랙', '구분'], 29) || '민간업체';
  const assignedDept = getCol(['배치부서', '부서'], 30);
  const videoUrl = getCol(['동영상링크', '영상링크', '동영상'], 31);
  const personalityTestUrl = getCol(['인성검사링크', '인성검사'], 32);
  const notes = cols.slice(33).map(cleanStr).filter(Boolean).join(' | ');

  const krDetail: KrSpeakingDetail = {
    comprehension: krComprehension,
    pronunciation: krPronunciation,
    grammar: krGrammar,
    vocabulary: krVocabulary,
    expression: krExpression,
    attitude: krAttitude,
  };

  return {
    uid,
    name,
    job,
    dob,
    isE9,
    age,
    country,
    agency,
    track,
    assignedDept,
    videoUrl,
    personalityTestUrl,
    notes,
    mainKrScore: krScore,
    mainKrGrade: krGrade,
    mainKrStatus: krStatus,
    mainChibuScore: chibuScore,
    mainChibuGrade: chibuGrade,
    mainWeldScore: weldScore,
    mainWeldGrade: weldGrade,
    mainResult: resultStr,
    mainTestWeek: testWeek,
    mainPassWeek: finalPassWeek,
    mainDropWeek: finalDropWeek,
    entryPassWeek: finalEntryPassWeek,
    entryDropWeek: finalEntryDropWeek,
    mainKrDetail: krDetail,
  };
};

/**
 * Speaking Log Row Parser (말하기 평가 로그 시트)
 * Format: 응시번호,평가자,점수,저장일시,"이해,응답능력","발음,억양","문법,문장구성",어휘활용,"표현력,확장성","태도,자신감",이름,검증단계
 */
export const parseSpeakingLogRow = (cols: string[]): {
  uid: string;
  evaluator: string;
  score: string;
  saveTime: string;
  comprehension: string;
  pronunciation: string;
  grammar: string;
  vocabulary: string;
  expression: string;
  attitude: string;
  name: string;
  stage: string;
} | null => {
  if (!cols || cols.length < 4) return null;
  const uid = cleanStr(cols[0]);
  if (!uid || uid === '응시번호' || uid === 'UID') return null;

  return {
    uid,
    evaluator: cleanStr(cols[1]),
    score: cleanStr(cols[2]),
    saveTime: cleanStr(cols[3]),
    comprehension: cleanStr(cols[4]),
    pronunciation: cleanStr(cols[5]),
    grammar: cleanStr(cols[6]),
    vocabulary: cleanStr(cols[7]),
    expression: cleanStr(cols[8]),
    attitude: cleanStr(cols[9]),
    name: cleanStr(cols[10]),
    stage: cleanStr(cols[11]),
  };
};

export const getIndividualStatus = (ind: IndividualData, currentWeek: number): IndividualStatus => {
  const isPast = (w: number | '탈락' | null | undefined) =>
    w === '탈락' || (typeof w === 'number' && currentWeek >= w);

  // 1. Pre test check (사전기량 검증: 일자 기반 판정)
  const preTested = typeof ind.preTestWeek === 'number' && currentWeek >= ind.preTestWeek;
  const preDropped = isPast(ind.preDropWeek);
  const prePassed = typeof ind.prePassWeek === 'number' && currentWeek >= ind.prePassWeek && !preDropped;
  const preWaiting = preTested && !prePassed && !preDropped;

  // 2. Main test check (본기량 검증: 일자 기반 판정)
  const mainTested = typeof ind.mainTestWeek === 'number' && currentWeek >= ind.mainTestWeek;
  const mainDropped = isPast(ind.mainDropWeek);
  const mainPassed = typeof ind.mainPassWeek === 'number' && currentWeek >= ind.mainPassWeek && !mainDropped;
  const mainWaiting = mainTested && !mainPassed && !mainDropped;

  // 3. Entry check (입국 여부: 일자 기반 판정)
  const entryDropped = isPast(ind.entryDropWeek) && (!ind.entryPassWeek || (typeof ind.entryPassWeek === 'number' && typeof ind.entryDropWeek === 'number' && ind.entryDropWeek >= ind.entryPassWeek));
  const entryPassed = typeof ind.entryPassWeek === 'number' && currentWeek >= ind.entryPassWeek && !entryDropped;

  // Determine current active stage at currentWeek (single exclusive stage for active person)
  let currentStage = '진행예정';

  if (entryDropped || entryPassed) {
    currentStage = '입국';
  } else if (mainPassed) {
    currentStage = '2차 육성(기량,한국어)';
  } else if (mainDropped || mainWaiting) {
    currentStage = '본기량검증완료';
  } else if (prePassed && !mainTested) {
    currentStage = '1차 육성(기량,한국어)';
  } else if (preDropped || preWaiting) {
    currentStage = '사전기량검증완료';
  } else {
    currentStage = '진행예정';
  }

  const isCurrentDropped =
    currentStage === '입국' ? Boolean(entryDropped) :
    currentStage === '본기량검증완료' ? Boolean(mainDropped) :
    currentStage === '사전기량검증완료' ? Boolean(preDropped) :
    false;

  return {
    stage: currentStage,
    currentStage,
    isDropped: isCurrentDropped,
    preTested,
    prePassed,
    preDropped,
    preWaiting,
    mainTested,
    mainPassed,
    mainDropped,
    mainWaiting,
    entryPassed,
    entryDropped,
  };
};

export const normalizeAgency = (name: string | undefined): string => {
  if (!name) return "";
  return name.replace(/\s+/g, "").replace(/서비스|service|pt\.|pt/gi, "").toLowerCase();
};

export const assignPlannedSupplyWeeks = (individuals: IndividualData[], supplies: AgencySupplyData[]): IndividualData[] => {
  let supplyPool = supplies.map(s => ({ ...s, remaining: s.count }));
  let inds = individuals.map(ind => ({ ...ind }));
  
  const groups: Record<string, { job: string, country: string, agency: string, members: IndividualData[] }> = {};
  inds.forEach(ind => {
    const normGAgency = normalizeAgency(ind.agency);
    const key = `${ind.job}_${ind.country}_${normGAgency}`;
    if (!groups[key]) groups[key] = { job: ind.job, country: ind.country, agency: normGAgency, members: [] };
    groups[key].members.push(ind);
  });

  Object.values(groups).forEach(g => {
    g.members.sort((a, b) => {
       const aWeek = typeof a.entryPassWeek === 'number' ? a.entryPassWeek : 999;
       const bWeek = typeof b.entryPassWeek === 'number' ? b.entryPassWeek : 999;
       return aWeek - bWeek;
    });

    let validSupplies = supplyPool.filter(s => s.job === g.job && s.country === g.country && normalizeAgency(s.agency) === g.agency);
    validSupplies.sort((a, b) => (a.supplyWeek || 999) - (b.supplyWeek || 999));
    
    let memberIdx = 0;
    for (let s of validSupplies) {
       while (s.remaining > 0 && memberIdx < g.members.length) {
          g.members[memberIdx].plannedSupplyWeek = s.supplyWeek || undefined;
          s.remaining--;
          memberIdx++;
       }
    }
  });
  
  return inds;
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
        ind.matchedReqWeek = req.reqWeek;
      }
      ind.displayDept = assigned;
      ind.isDeptFixed = true;
    } else {
      ind.isDeptFixed = false;
    }
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
        const normGAgency = normalizeAgency(g.agency);
        const aHasAgency = Array.from(a.assignedAgencies || []).some(ag => normalizeAgency(ag) === normGAgency);
        const bHasAgency = Array.from(b.assignedAgencies || []).some(ag => normalizeAgency(ag) === normGAgency);
        if (aHasAgency !== bHasAgency) return aHasAgency ? -1 : 1;

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
      g.members.forEach(m => m.matchedReqWeek = bestReq.reqWeek);
      for (let i = 0; i < assignCount; i++) {
        const member = g.members.shift();
        if (member) member.displayDept = bestReq.dept;
      }
      if (bestReq.remaining !== undefined) bestReq.remaining -= assignCount; 
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
        targetDemand.assignedCountries.add(s.country);
        targetDemand.assignedAgencies.add(s.agency);
        if (s.remaining !== undefined) s.remaining -= take; 
        if (targetDemand.remaining !== undefined) targetDemand.remaining -= take;
      } else {
        let newDemand: RequestData = {
          id: demandPool.length + 1000,
          dept: assigned,
          job: s.job,
          reqCount: 0,
          reqWeek: s.supplyWeek || 52,
          remaining: -take,
          fulfillments: [{ count: take, supplyWeek: s.supplyWeek, agency: s.agency, country: s.country, isFixed: true }],
          assignedCountries: new Set([s.country]),
          assignedAgencies: new Set([s.agency]),
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
      targetDemand.assignedCountries.add(s.country);
      targetDemand.assignedAgencies.add(s.agency);
      if (s.remaining !== undefined) s.remaining -= take; 
      if (targetDemand.remaining !== undefined) targetDemand.remaining -= take;
    }
  });

  return demandPool.map(req => ({
    ...req,
    fulfilledCount: req.reqCount - Math.max(0, req.remaining || 0),
    unfulfilledCount: Math.max(0, req.remaining || 0),
  })).sort((a, b) => a.id - b.id);
};

export const getSheetId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

export const parseDemandRow = (cols: string[], rowIndex: number): RequestData | null => {
  if (!cols || cols.length < 3) return null;
  const dept = cleanStr(cols[0]);
  const job = cleanStr(cols[1]);
  if (!dept || !job || dept === '부서명' || dept === '부서') return null;

  const isShifted = (!cols[2] || cols[2].trim() === '') && cols[3] && !isNaN(Number(cols[3].replace(/,/g, '')));
  const countCol = isShifted ? 3 : 2;
  const weekCol = isShifted ? 4 : 3;
  const detailCol = isShifted ? 5 : 4;

  const reqCount = parseInt(String(cols[countCol] || '0').replace(/[^0-9]/g, ''), 10);
  if (isNaN(reqCount) || reqCount <= 0) return null;

  const reqWeek = parseWeekInfo(cols[weekCol]);
  const detailJob = cleanStr(cols[detailCol]);

  return {
    id: rowIndex + 1,
    dept,
    job,
    detailJob,
    reqCount,
    reqWeek: typeof reqWeek === 'number' ? reqWeek : 52,
  };
};

export const parseSupplyRow = (cols: string[], rowIndex: number): AgencySupplyData | null => {
  if (!cols || cols.length < 4) return null;
  const country = cleanStr(cols[0]);
  const track = cleanStr(cols[1]);
  const agency = cleanStr(cols[2]);
  const job = cleanStr(cols[3]);
  if (!country || !agency || country === '국가' || agency === '업체명') return null;

  const count = parseInt(String(cols[4] || '0').replace(/[^0-9]/g, ''), 10);
  if (isNaN(count) || count <= 0) return null;

  const preTestWeek = parseWeekInfo(cols[5]);
  const mainTestWeek = parseWeekInfo(cols[6]);
  const visaWeek = parseWeekInfo(cols[7]);
  const supplyWeek = parseWeekInfo(cols[8]); // 입국 예정 주차

  const fixedDeptRaw = cleanStr(cols[9]);
  const fixedDept = fixedDeptRaw && fixedDeptRaw !== '미확정' && fixedDeptRaw !== '-' ? fixedDeptRaw : undefined;
  const fixedCount = cols[10] ? parseInt(String(cols[10]).replace(/[^0-9]/g, ''), 10) : (fixedDept ? count : undefined);

  return {
    country,
    track,
    agency,
    job,
    count,
    preTestWeek: typeof preTestWeek === 'number' ? preTestWeek : null,
    mainTestWeek: typeof mainTestWeek === 'number' ? mainTestWeek : null,
    visaWeek: typeof visaWeek === 'number' ? visaWeek : null,
    supplyWeek: typeof supplyWeek === 'number' ? supplyWeek : null,
    fixedDept,
    fixedCount: isNaN(fixedCount as number) ? (fixedDept ? count : undefined) : fixedCount,
  };
};
