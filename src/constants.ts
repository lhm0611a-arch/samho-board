import { RequestData, AgencySupplyData, IndividualData } from './types';
import { DEFAULT_MERGED_INDIVIDUALS } from './defaultData';

export const COLORS = ['#0284c7', '#06b6d4', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];
export const MONTH_MAP_DISPLAY: Record<number, string> = { 1: 'JAN', 2: 'FEB', 3: 'MAR', 4: 'APR', 5: 'MAY', 6: 'JUN', 7: 'JUL', 8: 'AUG', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DEC' };

export const COUNTRY_FLAG: Record<string, string> = {
  '베트남': '🇻🇳',
  '인도네시아': '🇮🇩',
  '필리핀': '🇵🇭',
  '우즈베키스탄': '🇺🇿',
  '우즈벡': '🇺🇿',
  '스리랑카': '🇱🇰',
  '태국': '🇹🇭',
  '미얀마': '🇲🇲',
  '중국': '🇨🇳',
  '네팔': '🇳🇵',
  '몽골': '🇲🇳',
  '캄보디아': '🇰🇭'
};

export const WEEK_MAP: { m: number; w: number; start: string; end: string }[] = [
  { m: 1, w: 1, start: '01.01', end: '01.04' }, { m: 1, w: 2, start: '01.05', end: '01.11' }, { m: 1, w: 3, start: '01.12', end: '01.18' }, { m: 1, w: 4, start: '01.19', end: '01.25' }, { m: 1, w: 5, start: '01.26', end: '02.01' },
  { m: 2, w: 1, start: '02.02', end: '02.08' }, { m: 2, w: 2, start: '02.09', end: '02.15' }, { m: 2, w: 3, start: '02.16', end: '02.22' }, { m: 2, w: 4, start: '02.23', end: '03.01' },
  { m: 3, w: 1, start: '03.02', end: '03.08' }, { m: 3, w: 2, start: '03.09', end: '03.15' }, { m: 3, w: 3, start: '03.16', end: '03.22' }, { m: 3, w: 4, start: '03.23', end: '03.29' }, { m: 3, w: 5, start: '03.30', end: '04.05' },
  { m: 4, w: 1, start: '04.06', end: '04.12' }, { m: 4, w: 2, start: '04.13', end: '04.19' }, { m: 4, w: 3, start: '04.20', end: '04.26' }, { m: 4, w: 4, start: '04.27', end: '05.03' },
  { m: 5, w: 1, start: '05.04', end: '05.10' }, { m: 5, w: 2, start: '05.11', end: '05.17' }, { m: 5, w: 3, start: '05.18', end: '05.24' }, { m: 5, w: 4, start: '05.25', end: '05.31' },
  { m: 6, w: 1, start: '06.01', end: '06.07' }, { m: 6, w: 2, start: '06.08', end: '06.14' }, { m: 6, w: 3, start: '06.15', end: '06.21' }, { m: 6, w: 4, start: '06.22', end: '06.28' }, { m: 6, w: 5, start: '06.29', end: '07.05' },
  { m: 7, w: 1, start: '07.06', end: '07.12' }, { m: 7, w: 2, start: '07.13', end: '07.19' }, { m: 7, w: 3, start: '07.20', end: '07.26' }, { m: 7, w: 4, start: '07.27', end: '08.02' },
  { m: 8, w: 1, start: '08.03', end: '08.09' }, { m: 8, w: 2, start: '08.10', end: '08.16' }, { m: 8, w: 3, start: '08.17', end: '08.23' }, { m: 8, w: 4, start: '08.24', end: '08.30' }, { m: 8, w: 5, start: '08.31', end: '09.06' },
  { m: 9, w: 1, start: '09.07', end: '09.13' }, { m: 9, w: 2, start: '09.14', end: '09.20' }, { m: 9, w: 3, start: '09.21', end: '09.27' }, { m: 9, w: 4, start: '09.28', end: '10.04' },
  { m: 10, w: 1, start: '10.05', end: '10.11' }, { m: 10, w: 2, start: '10.12', end: '10.18' }, { m: 10, w: 3, start: '10.19', end: '10.25' }, { m: 10, w: 4, start: '10.26', end: '11.01' },
  { m: 11, w: 1, start: '11.02', end: '11.08' }, { m: 11, w: 2, start: '11.09', end: '11.15' }, { m: 11, w: 3, start: '11.16', end: '11.22' }, { m: 11, w: 4, start: '11.23', end: '11.30' },
  { m: 12, w: 1, start: '12.01', end: '12.07' }, { m: 12, w: 2, start: '12.08', end: '12.14' }, { m: 12, w: 3, start: '12.15', end: '12.21' }, { m: 12, w: 4, start: '12.22', end: '12.31' }
];

export const REQUEST_DB_DEFAULT: RequestData[] = [];
export const AGENCY_SUPPLY_DB_DEFAULT: AgencySupplyData[] = [];
export const INDIVIDUAL_DB_DEFAULT: IndividualData[] = DEFAULT_MERGED_INDIVIDUALS;
export const DEPT_REQUEST_DB_DEFAULT: RequestData[] = REQUEST_DB_DEFAULT;
