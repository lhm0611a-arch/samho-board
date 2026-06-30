import { RequestData, AgencySupplyData, IndividualData } from './types';

export const COLORS = ['#0284c7', '#06b6d4', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];
export const MONTH_MAP_DISPLAY: Record<number, string> = { 1: 'JAN', 2: 'FEB', 3: 'MAR', 4: 'APR', 5: 'MAY', 6: 'JUN', 7: 'JUL', 8: 'AUG', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DEC' };
export const WEEK_MAP = [
  {m:1, w:1}, {m:1, w:2}, {m:1, w:3}, {m:1, w:4}, {m:2, w:1}, {m:2, w:2}, {m:2, w:3}, {m:2, w:4}, {m:3, w:1}, {m:3, w:2}, {m:3, w:3}, {m:3, w:4}, {m:3, w:5}, {m:4, w:1}, {m:4, w:2}, {m:4, w:3}, {m:4, w:4}, {m:5, w:1}, {m:5, w:2}, {m:5, w:3}, {m:5, w:4}, {m:5, w:5}, {m:6, w:1}, {m:6, w:2}, {m:6, w:3}, {m:6, w:4}, {m:7, w:1}, {m:7, w:2}, {m:7, w:3}, {m:7, w:4}, {m:7, w:5}, {m:8, w:1}, {m:8, w:2}, {m:8, w:3}, {m:8, w:4}, {m:9, w:1}, {m:9, w:2}, {m:9, w:3}, {m:9, w:4}, {m:10, w:1}, {m:10, w:2}, {m:10, w:3}, {m:10, w:4}, {m:10, w:5}, {m:11, w:1}, {m:11, w:2}, {m:11, w:3}, {m:11, w:4}, {m:12, w:1}, {m:12, w:2}, {m:12, w:3}, {m:12, w:4}
];

export const DEPT_REQUEST_DB_DEFAULT: RequestData[] = [
  { id: 1, dept: '대조', job: '용접', reqCount: 18, reqWeek: 13 },
  { id: 2, dept: '선행의장', job: '선각의장', reqCount: 35, reqWeek: 13 },
  { id: 3, dept: '대조', job: '선각취부', reqCount: 19, reqWeek: 26 },
  { id: 4, dept: '가공', job: '선각취부', reqCount: 14, reqWeek: 26 },
  { id: 5, dept: '가공', job: '용접', reqCount: 10, reqWeek: 26 }, 
  { id: 6, dept: '판넬', job: '용접', reqCount: 24, reqWeek: 26 },
  { id: 7, dept: '의장1', job: '의장취부', reqCount: 15, reqWeek: 26 },
  { id: 8, dept: '선행도장', job: '도장', reqCount: 29, reqWeek: 26 },
  { id: 9, dept: '커미셔닝', job: '전기', reqCount: 30, reqWeek: 26 }, 
];

export const AGENCY_SUPPLY_DB_DEFAULT: AgencySupplyData[] = [
  { country: '베트남', track: '공공/협회', agency: 'Koshipa3', job: '용접', count: 40, supplyWeek: 31 }, 
  { country: '인도네시아', track: '공공/협회', agency: '조선협회', job: '선각의장', count: 29, supplyWeek: 26 }, 
  { country: '인도네시아', track: '민간 중개', agency: '코인파워', job: '용접', count: 18, supplyWeek: 17 }, 
  { country: '베트남', track: '민간 중개', agency: 'TM글로벌', job: '전기', count: 35, supplyWeek: 17 }, 
  { country: '베트남', track: '민간 중개', agency: '가나교역', job: '선각취부', count: 40, supplyWeek: 17 }, 
];

export const INDIVIDUAL_DB_DEFAULT: IndividualData[] = [
  { uid: 'H-01', name: 'BUI MINH DAI', dob: '950101', age: '31', country: '베트남', agency: '가나교역', job: '선각취부', preKrScore: 20, preChibuScore: 80, preWeldScore: '-', preTestWeek: 1, prePassWeek: 2, hasPreData: true, hasMainData: false }
];
