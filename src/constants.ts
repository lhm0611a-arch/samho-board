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

export const REQUEST_DB_DEFAULT: RequestData[] = [
  {
    "id": 1,
    "dept": "건조1",
    "job": "선각취부",
    "detailJob": "건조취부",
    "reqCount": 7,
    "reqWeek": 48
  },
  {
    "id": 2,
    "dept": "건조2",
    "job": "선각취부",
    "detailJob": "건조취부",
    "reqCount": 7,
    "reqWeek": 48
  },
  {
    "id": 3,
    "dept": "대조",
    "job": "선각취부",
    "detailJob": "조립취부",
    "reqCount": 13,
    "reqWeek": 48
  },
  {
    "id": 4,
    "dept": "선행의장",
    "job": "의장취부",
    "detailJob": "의장설치취부",
    "reqCount": 7,
    "reqWeek": 48
  },
  {
    "id": 5,
    "dept": "가공",
    "job": "용접",
    "detailJob": "소중조용접",
    "reqCount": 6,
    "reqWeek": 79
  },
  {
    "id": 6,
    "dept": "가공",
    "job": "선각취부",
    "detailJob": "소종조취부",
    "reqCount": 12,
    "reqWeek": 74
  },
  {
    "id": 7,
    "dept": "판넬",
    "job": "용접",
    "detailJob": "판넬조립용접",
    "reqCount": 26,
    "reqWeek": 79
  },
  {
    "id": 8,
    "dept": "판넬",
    "job": "선각취부",
    "detailJob": "판넬조립취부",
    "reqCount": 11,
    "reqWeek": 74
  },
  {
    "id": 9,
    "dept": "대조",
    "job": "용접",
    "detailJob": "조립용접",
    "reqCount": 10,
    "reqWeek": 74
  },
  {
    "id": 10,
    "dept": "대조",
    "job": "용접",
    "detailJob": "조립용접",
    "reqCount": 17,
    "reqWeek": 79
  },
  {
    "id": 11,
    "dept": "선행의장",
    "job": "의장취부",
    "detailJob": "의장설치취부",
    "reqCount": 6,
    "reqWeek": 74
  },
  {
    "id": 12,
    "dept": "선행의장",
    "job": "의장취부",
    "detailJob": "의장설치취부",
    "reqCount": 26,
    "reqWeek": 79
  },
  {
    "id": 13,
    "dept": "선행도장",
    "job": "도장",
    "detailJob": "블라스팅",
    "reqCount": 29,
    "reqWeek": 104
  },
  {
    "id": 14,
    "dept": "건조1",
    "job": "용접",
    "detailJob": "건조용접",
    "reqCount": 15,
    "reqWeek": 79
  },
  {
    "id": 15,
    "dept": "건조2",
    "job": "용접",
    "detailJob": "건조용접",
    "reqCount": 13,
    "reqWeek": 74
  },
  {
    "id": 16,
    "dept": "건조3",
    "job": "용접",
    "detailJob": "건조취부",
    "reqCount": 1,
    "reqWeek": 101
  },
  {
    "id": 17,
    "dept": "건조3",
    "job": "용접",
    "detailJob": "건조용접",
    "reqCount": 8,
    "reqWeek": 79
  },
  {
    "id": 18,
    "dept": "의장1",
    "job": "의장취부",
    "detailJob": "배관설치",
    "reqCount": 15,
    "reqWeek": 74
  },
  {
    "id": 19,
    "dept": "의장2",
    "job": "의장취부",
    "detailJob": "배관설치",
    "reqCount": 10,
    "reqWeek": 74
  },
  {
    "id": 20,
    "dept": "의장2",
    "job": "전기",
    "detailJob": "전기전자",
    "reqCount": 10,
    "reqWeek": 104
  },
  {
    "id": 21,
    "dept": "의장3",
    "job": "의장취부",
    "detailJob": "배관설치",
    "reqCount": 10,
    "reqWeek": 74
  },
  {
    "id": 22,
    "dept": "의장3",
    "job": "전기",
    "detailJob": "전기전자",
    "reqCount": 7,
    "reqWeek": 104
  },
  {
    "id": 23,
    "dept": "커미셔닝",
    "job": "전기",
    "detailJob": "전기시운전",
    "reqCount": 13,
    "reqWeek": 104
  },
  {
    "id": 24,
    "dept": "가공",
    "job": "선각취부",
    "detailJob": "소종조취부",
    "reqCount": 2,
    "reqWeek": 101
  },
  {
    "id": 25,
    "dept": "대조",
    "job": "선각취부",
    "detailJob": "조립취부",
    "reqCount": 10,
    "reqWeek": 101
  },
  {
    "id": 26,
    "dept": "건조1",
    "job": "선각취부",
    "detailJob": "건조취부",
    "reqCount": 9,
    "reqWeek": 101
  },
  {
    "id": 27,
    "dept": "건조2",
    "job": "선각취부",
    "detailJob": "건조취부",
    "reqCount": 8,
    "reqWeek": 101
  },
  {
    "id": 28,
    "dept": "판넬",
    "job": "용접",
    "detailJob": "판넬조립취부",
    "reqCount": 1,
    "reqWeek": 101
  },
  {
    "id": 29,
    "dept": "대조",
    "job": "용접",
    "detailJob": "조립용접",
    "reqCount": 2,
    "reqWeek": 101
  },
  {
    "id": 30,
    "dept": "건조2",
    "job": "용접",
    "detailJob": "건조용접",
    "reqCount": 2,
    "reqWeek": 101
  },
  {
    "id": 31,
    "dept": "선행의장",
    "job": "의장취부",
    "detailJob": "의장설치취부",
    "reqCount": 2,
    "reqWeek": 101
  }
];

export const AGENCY_SUPPLY_DB_DEFAULT: AgencySupplyData[] = [
  {
    "country": "인도네시아",
    "track": "공공기관",
    "agency": "유학생",
    "job": "전기",
    "count": 7,
    "preTestWeek": null,
    "mainTestWeek": null,
    "visaWeek": 92,
    "supplyWeek": 104
  },
  {
    "country": "인도네시아",
    "track": "공공기관",
    "agency": "유학생",
    "job": "도장",
    "count": 14,
    "preTestWeek": null,
    "mainTestWeek": null,
    "visaWeek": 92,
    "supplyWeek": 104
  },
  {
    "country": "인도네시아",
    "track": "민간업체",
    "agency": "KESL",
    "job": "선각취부",
    "count": 29,
    "preTestWeek": 67,
    "mainTestWeek": 87,
    "visaWeek": 92,
    "supplyWeek": 101
  },
  {
    "country": "인도네시아",
    "track": "공공기관",
    "agency": "조선협회-인니",
    "job": "용접",
    "count": 3,
    "preTestWeek": 59,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 80,
    "fixedDept": "가공",
    "fixedCount": 3
  },
  {
    "country": "인도네시아",
    "track": "공공기관",
    "agency": "조선협회-인니",
    "job": "용접",
    "count": 2,
    "preTestWeek": 59,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 80,
    "fixedDept": "대조",
    "fixedCount": 2
  },
  {
    "country": "인도네시아",
    "track": "공공기관",
    "agency": "조선협회-인니",
    "job": "용접",
    "count": 17,
    "preTestWeek": 59,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 80,
    "fixedDept": "판넬조립",
    "fixedCount": 17
  },
  {
    "country": "인도네시아",
    "track": "민간업체",
    "agency": "코인파워",
    "job": "용접",
    "count": 10,
    "preTestWeek": null,
    "mainTestWeek": 58,
    "visaWeek": 59,
    "supplyWeek": 73,
    "fixedDept": "대조",
    "fixedCount": 10
  },
  {
    "country": "인도네시아",
    "track": "민간업체",
    "agency": "코인파워",
    "job": "의장취부",
    "count": 10,
    "preTestWeek": null,
    "mainTestWeek": 58,
    "visaWeek": 59,
    "supplyWeek": 73,
    "fixedDept": "의장2",
    "fixedCount": 10
  },
  {
    "country": "인도네시아",
    "track": "민간업체",
    "agency": "코인파워",
    "job": "의장취부",
    "count": 10,
    "preTestWeek": null,
    "mainTestWeek": 58,
    "visaWeek": 59,
    "supplyWeek": 73,
    "fixedDept": "의장3",
    "fixedCount": 10
  },
  {
    "country": "인도네시아",
    "track": "민간업체",
    "agency": "코인파워",
    "job": "의장취부",
    "count": 20,
    "preTestWeek": null,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 80,
    "fixedDept": "선행의장",
    "fixedCount": 20
  },
  {
    "country": "인도네시아",
    "track": "공공기관",
    "agency": "유학생",
    "job": "전기",
    "count": 10,
    "preTestWeek": null,
    "mainTestWeek": null,
    "visaWeek": 92,
    "supplyWeek": 104
  },
  {
    "country": "인도네시아",
    "track": "민간업체",
    "agency": "KESL",
    "job": "선각취부",
    "count": 3,
    "preTestWeek": 58,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 80,
    "fixedDept": "가공",
    "fixedCount": 3
  },
  {
    "country": "인도네시아",
    "track": "민간업체",
    "agency": "KESL",
    "job": "의장취부",
    "count": 6,
    "preTestWeek": 58,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 80,
    "fixedDept": "선행의장",
    "fixedCount": 6
  },
  {
    "country": "인도네시아",
    "track": "민간업체",
    "agency": "KESL",
    "job": "선각취부",
    "count": 9,
    "preTestWeek": 58,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 80,
    "fixedDept": "판넬조립",
    "fixedCount": 9
  },
  {
    "country": "베트남",
    "track": "공공기관",
    "agency": "KOICA",
    "job": "용접",
    "count": 7,
    "preTestWeek": null,
    "mainTestWeek": 61,
    "visaWeek": 62,
    "supplyWeek": 78,
    "fixedDept": "건조1",
    "fixedCount": 7
  },
  {
    "country": "베트남",
    "track": "공공기관",
    "agency": "KOICA",
    "job": "용접",
    "count": 3,
    "preTestWeek": null,
    "mainTestWeek": 61,
    "visaWeek": 62,
    "supplyWeek": 78,
    "fixedDept": "건조3",
    "fixedCount": 3
  },
  {
    "country": "베트남",
    "track": "공공기관",
    "agency": "KOICA",
    "job": "용접",
    "count": 6,
    "preTestWeek": null,
    "mainTestWeek": 61,
    "visaWeek": 62,
    "supplyWeek": 78,
    "fixedDept": "대조",
    "fixedCount": 6
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "TM글로벌",
    "job": "의장취부",
    "count": 6,
    "preTestWeek": null,
    "mainTestWeek": 58,
    "visaWeek": 59,
    "supplyWeek": 73,
    "fixedDept": "선행의장",
    "fixedCount": 6
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "TM글로벌",
    "job": "의장취부",
    "count": 15,
    "preTestWeek": null,
    "mainTestWeek": 58,
    "visaWeek": 59,
    "supplyWeek": 73,
    "fixedDept": "의장1",
    "fixedCount": 15
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "TM글로벌",
    "job": "선각취부",
    "count": 3,
    "preTestWeek": null,
    "mainTestWeek": 58,
    "visaWeek": 59,
    "supplyWeek": 73,
    "fixedDept": "판넬",
    "fixedCount": 3
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "TM글로벌",
    "job": "용접",
    "count": 7,
    "preTestWeek": null,
    "mainTestWeek": 58,
    "visaWeek": 59,
    "supplyWeek": 73,
    "fixedDept": "건조2",
    "fixedCount": 7
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "TM글로벌",
    "job": "선각취부",
    "count": 4,
    "preTestWeek": null,
    "mainTestWeek": 58,
    "visaWeek": 59,
    "supplyWeek": 73,
    "fixedDept": "가공",
    "fixedCount": 4
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "TM글로벌",
    "job": "용접",
    "count": 2,
    "preTestWeek": 58,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 78,
    "fixedDept": "건조1",
    "fixedCount": 2
  },
  {
    "country": "베트남",
    "track": "공공기관",
    "agency": "유학생",
    "job": "전기",
    "count": 13,
    "preTestWeek": null,
    "mainTestWeek": null,
    "visaWeek": 92,
    "supplyWeek": 104
  },
  {
    "country": "베트남",
    "track": "공공기관",
    "agency": "유학생",
    "job": "도장",
    "count": 15,
    "preTestWeek": null,
    "mainTestWeek": null,
    "visaWeek": 92,
    "supplyWeek": 104
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "TM글로벌",
    "job": "용접",
    "count": 1,
    "preTestWeek": null,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 78,
    "fixedDept": "건조3",
    "fixedCount": 1
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "TM글로벌",
    "job": "용접",
    "count": 3,
    "preTestWeek": null,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 78,
    "fixedDept": "대조",
    "fixedCount": 3
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "드림써비스",
    "job": "선각취부",
    "count": 8,
    "preTestWeek": null,
    "mainTestWeek": 58,
    "visaWeek": 59,
    "supplyWeek": 73,
    "fixedDept": "가공",
    "fixedCount": 8
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "드림써비스",
    "job": "선각취부",
    "count": 6,
    "preTestWeek": null,
    "mainTestWeek": 58,
    "visaWeek": 59,
    "supplyWeek": 73,
    "fixedDept": "건조2",
    "fixedCount": 6
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "드림써비스",
    "job": "용접",
    "count": 3,
    "preTestWeek": null,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 78,
    "fixedDept": "건조1",
    "fixedCount": 3
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "드림써비스",
    "job": "용접",
    "count": 3,
    "preTestWeek": null,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 78,
    "fixedDept": "대조",
    "fixedCount": 3
  },
  {
    "country": "인도네시아",
    "track": "민간업체",
    "agency": "코인파워",
    "job": "용접",
    "count": 6,
    "preTestWeek": null,
    "mainTestWeek": null,
    "visaWeek": 92,
    "supplyWeek": 101
  },
  {
    "country": "인도네시아",
    "track": "민간업체",
    "agency": "코인파워",
    "job": "의장취부",
    "count": 2,
    "preTestWeek": null,
    "mainTestWeek": null,
    "visaWeek": 92,
    "supplyWeek": 101
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "가나교역",
    "job": "용접",
    "count": 8,
    "preTestWeek": null,
    "mainTestWeek": 58,
    "visaWeek": 63,
    "supplyWeek": 73,
    "fixedDept": "판넬조립",
    "fixedCount": 8
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "가나교역",
    "job": "용접",
    "count": 2,
    "preTestWeek": null,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 78,
    "fixedDept": "건조1",
    "fixedCount": 2
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "가나교역",
    "job": "용접",
    "count": 1,
    "preTestWeek": null,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 78,
    "fixedDept": "건조3",
    "fixedCount": 1
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "가나교역",
    "job": "용접",
    "count": 1,
    "preTestWeek": null,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 78,
    "fixedDept": "대조",
    "fixedCount": 1
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "휴먼스파트너",
    "job": "선각취부",
    "count": 1,
    "preTestWeek": 58,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 78,
    "fixedDept": "건조1",
    "fixedCount": 1
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "휴먼스파트너",
    "job": "용접",
    "count": 3,
    "preTestWeek": 58,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 78,
    "fixedDept": "건조3",
    "fixedCount": 3
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "휴먼스파트너",
    "job": "용접",
    "count": 2,
    "preTestWeek": 58,
    "mainTestWeek": 68,
    "visaWeek": 69,
    "supplyWeek": 78,
    "fixedDept": "대조",
    "fixedCount": 2
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "TM글로벌",
    "job": "선각취부",
    "count": 7,
    "preTestWeek": 20,
    "mainTestWeek": 36,
    "visaWeek": 43,
    "supplyWeek": 48,
    "fixedDept": "건조1",
    "fixedCount": 7
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "TM글로벌",
    "job": "선각취부",
    "count": 7,
    "preTestWeek": 20,
    "mainTestWeek": 36,
    "visaWeek": 43,
    "supplyWeek": 48,
    "fixedDept": "건조2",
    "fixedCount": 7
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "TM글로벌",
    "job": "선각취부",
    "count": 13,
    "preTestWeek": 20,
    "mainTestWeek": 36,
    "visaWeek": 43,
    "supplyWeek": 48,
    "fixedDept": "대조",
    "fixedCount": 13
  },
  {
    "country": "베트남",
    "track": "민간업체",
    "agency": "TM글로벌",
    "job": "의장취부",
    "count": 7,
    "preTestWeek": 20,
    "mainTestWeek": 36,
    "visaWeek": 43,
    "supplyWeek": 48,
    "fixedDept": "선행의장",
    "fixedCount": 7
  }
];

export const INDIVIDUAL_DB_DEFAULT: IndividualData[] = DEFAULT_MERGED_INDIVIDUALS;
export const DEPT_REQUEST_DB_DEFAULT: RequestData[] = REQUEST_DB_DEFAULT;
