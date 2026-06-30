export interface RequestData {
  id: number;
  dept: string;
  job: string;
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
  count: number;
  supplyWeek: number | null;
  fixedDept?: string | null;
  fixedCount?: number;
  remaining?: number;
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
  preKrScore?: string | number;
  preChibuScore?: string | number;
  preWeldScore?: string | number;
  preTestWeek?: number | null | '탈락';
  prePassWeek?: number | null | '탈락';
  preDropWeek?: number | null | '탈락';
  mainKrScore?: string | number;
  mainChibuScore?: string | number;
  mainWeldScore?: string | number;
  mainTestWeek?: number | null | '탈락';
  mainPassWeek?: number | null | '탈락';
  mainDropWeek?: number | null | '탈락';
  entryPassWeek?: number | null | '탈락';
  entryDropWeek?: number | null | '탈락';
  assignedDept?: string;
  videoUrl?: string;
  personalityTestUrl?: string;
  hasPreData?: boolean;
  hasMainData?: boolean;
  displayDept?: string;
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
