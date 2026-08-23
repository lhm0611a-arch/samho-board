export interface RequestData {
  id: number;
  dept: string;
  job: string;
  detailJob?: string;
  reqCount: number;
  reqWeek: number;
  remaining?: number;
  assignedCountries?: Set<string>;
  assignedAgencies?: Set<string>;
  assignedWeeks?: Set<number>;
  fulfillments?: Fulfillment[];
  fulfilledCount?: number;
  unfulfilledCount?: number;
}

export interface Fulfillment {
  count: number;
  supplyWeek: number | null;
  agency: string;
  country: string;
  isFixed: boolean;
}

export interface AgencySupplyData {
  country: string;
  track: string;
  agency: string;
  job: string;
  detailJob?: string;
  count: number;
  preTestWeek?: number | null;
  mainTestWeek?: number | null;
  visaWeek?: number | null;
  supplyWeek: number | null;
  fixedDept?: string | null;
  fixedCount?: number;
  remaining?: number;
}

export interface KrSpeakingDetail {
  comprehension?: string | number; // 이해,응답능력 (20)
  pronunciation?: string | number; // 발음,억양 (10)
  grammar?: string | number;       // 문법,문장구성 (20)
  vocabulary?: string | number;    // 어휘활용 (20)
  expression?: string | number;    // 표현력,확장성 (20)
  attitude?: string | number;      // 태도,자신감 (10)
  evaluator?: string;              // 평가자
  saveTime?: string;               // 평가일시
}

export interface IndividualData {
  uid: string;
  name: string;
  dob: string;
  age: string | number;
  country: string;
  agency?: string;
  track?: string;
  job: string;
  isE9?: boolean;
  
  // Pre-test
  preKrScore?: string | number;
  preKrGrade?: string;
  preKrStatus?: string;
  preChibuScore?: string | number;
  preChibuGrade?: string;
  preWeldScore?: string | number;
  preWeldGrade?: string;
  preResult?: string;
  preTestWeek?: number | null | '탈락';
  prePassWeek?: number | null | '탈락';
  preDropWeek?: number | null | '탈락';
  preKrDetail?: KrSpeakingDetail;

  // Main-test
  mainKrScore?: string | number;
  mainKrGrade?: string;
  mainKrStatus?: string;
  mainChibuScore?: string | number;
  mainChibuGrade?: string;
  mainWeldScore?: string | number;
  mainWeldGrade?: string;
  mainResult?: string;
  mainTestWeek?: number | null | '탈락';
  mainPassWeek?: number | null | '탈락';
  mainDropWeek?: number | null | '탈락';
  mainKrDetail?: KrSpeakingDetail;

  // Entry
  entryPassWeek?: number | null | '탈락';
  entryDropWeek?: number | null | '탈락';
  assignedDept?: string;
  videoUrl?: string;
  personalityTestUrl?: string;
  notes?: string;

  // System flags
  hasPreData?: boolean;
  hasMainData?: boolean;
  displayDept?: string;
  matchedReqWeek?: number;
  plannedSupplyWeek?: number;
  isDeptFixed?: boolean;
  _mergeKey?: string;
}

export interface IndividualStatus {
  preTested: boolean;
  prePassed: boolean;
  preDropped: boolean;
  preWaiting: boolean;
  mainTested: boolean;
  mainPassed: boolean;
  mainDropped: boolean;
  mainWaiting: boolean;
  entryPassed: boolean;
  entryDropped: boolean;
  currentStage: string;
  stage: string;
  isDropped: boolean;
}
