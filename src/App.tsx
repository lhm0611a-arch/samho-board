import React, { useState, useMemo, useEffect } from "react";
import {
  Ship,
  Users,
  CalendarClock,
  Factory,
  Building2,
  Globe,
  Database,
  Lock,
  Settings2,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Upload,
  LayoutDashboard,
  Power,
  Key,
} from "lucide-react";
import CryptoJS from "crypto-js";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

import {
  getIsoWeek,
  getWeekStr,
  isMonthStart,
  getMonthStr,
  parseCSVText,
  parsePreRow,
  parseMainRow,
  assignDepartments,
  autoAllocate,
  getSheetId,
  getIndividualStatus,
  parseWeekInfo,
} from "./utils";
import {
  DEPT_REQUEST_DB_DEFAULT,
  AGENCY_SUPPLY_DB_DEFAULT,
  INDIVIDUAL_DB_DEFAULT,
  MONTH_MAP_DISPLAY,
  WEEK_MAP,
} from "./constants";
import { RequestData, AgencySupplyData, IndividualData } from "./types";

import { ActualStagePipeline } from "./components/ActualStagePipeline";
import { YearlySupplyChart } from "./components/YearlySupplyChart";
import { SkillAnalysisChart } from "./components/SkillAnalysisChart";
import { IndividualDetailModal } from "./components/IndividualDetailModal";
import { DeptModal } from "./components/DeptModal";
import { ConfirmedDeptModal } from "./components/ConfirmedDeptModal";
import { AgencyDetailModal } from "./components/AgencyDetailModal";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "./firebase";

enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
}

export default function App() {
  const [authRole, setAuthRole] = useState<string | null>(null);
  const [authDept, setAuthDept] = useState<string | null>(null);
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  const [newDeptAccountId, setNewDeptAccountId] = useState("");
  const [newDeptAccountPw, setNewDeptAccountPw] = useState("");
  const [newDeptAccountDept, setNewDeptAccountDept] = useState("");
  const [newDeptAccountRole, setNewDeptAccountRole] = useState("production");

  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [passwordChangeCurrent, setPasswordChangeCurrent] = useState("");
  const [passwordChangeNew, setPasswordChangeNew] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentWeek, setCurrentWeek] = useState(() => getIsoWeek(new Date()));

  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const [selectedStageModal, setSelectedStageModal] = useState<{
    stage: string;
    viewType: string;
  } | null>(null);
  const [selectedConfirmedDept, setSelectedConfirmedDept] = useState<{
    dept: string;
    job: string | null;
  } | null>(null);
  const [selectedAgencyModal, setSelectedAgencyModal] = useState<string | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [selectedJobFilter, setSelectedJobFilter] = useState("전체");
  const [selectedCountryFilter, setSelectedCountryFilter] = useState("전체");
  const [allocationMode, setAllocationMode] = useState("predicted");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const showAlert = (msg: string) => setAlertMessage(msg);

  const [baseSheetUrl, setBaseSheetUrl] = useState(
    () =>
      localStorage.getItem("baseSheetUrl") ||
      "https://docs.google.com/spreadsheets/d/1AvAw-npblbj1es0bG3Ef43hZWM4F6Q2AzKgFvuocjAU/edit?gid=0#gid=0",
  );
  const [individualSheetUrl, setIndividualSheetUrl] = useState(
    () =>
      localStorage.getItem("individualSheetUrl") ||
      "https://docs.google.com/spreadsheets/d/1njMTMyaioVS7bb_h_StFUHMRjsYg44woXSLs53KWZ8g/edit?gid=0#gid=0",
  );

  const [deptTabName, setDeptTabName] = useState(
    () => localStorage.getItem("deptTabName") || "Sheet1",
  );
  const [agencyTabName, setAgencyTabName] = useState(
    () => localStorage.getItem("agencyTabName") || "Sheet2",
  );

  const [individualTabName1, setIndividualTabName1] = useState(
    () => localStorage.getItem("individualTabName1") || "사전기량검증",
  );
  const [individualTabName2, setIndividualTabName2] = useState(
    () => localStorage.getItem("individualTabName2") || "본기량검증",
  );

  const [requestDB, setRequestDB] = useState<RequestData[]>(
    DEPT_REQUEST_DB_DEFAULT,
  );
  const [agencySupplyDB, setAgencySupplyDB] = useState<AgencySupplyData[]>(
    AGENCY_SUPPLY_DB_DEFAULT,
  );
  const [individualsDB, setIndividualsDB] = useState<IndividualData[]>(
    INDIVIDUAL_DB_DEFAULT,
  );

  const uniqueDepts = useMemo(() => {
    const depts = new Set<string>();
    requestDB.forEach((r) => {
      if (r.dept) depts.add(r.dept);
    });
    return Array.from(depts).sort();
  }, [requestDB]);

  const hashPassword = (password: string) => {
    return CryptoJS.SHA256(password.trim()).toString();
  };

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError(true);
      return;
    }
    const inputHash = hashPassword(loginPassword);

    try {
      const userDoc = await getDoc(doc(db, "users", loginId.trim()));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (
          userData.passwordHash === inputHash ||
          loginPassword.trim() === userData.rawPassword
        ) {
          setAuthRole(userData.role);
          setAuthDept(userData.deptName || null);
          setLoginError(false);
          setLoginPassword("");
          setLoginId("");
          return;
        }
      }
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.GET, `users/${loginId.trim()}`);
    }

    // Fallback logic for hardcoded superusers if Firebase lookup fails or doc doesn't exist
    if (
      loginId === "admin" &&
      loginPassword.trim() === (import.meta.env.VITE_MASTER_PW || "123456789")
    ) {
      setAuthRole("admin");
      setLoginError(false);
      setLoginPassword("");
      setLoginId("");
      return;
    } else if (
      loginId === "hr" &&
      loginPassword.trim() === (import.meta.env.VITE_USER1_PW || "hr")
    ) {
      setAuthRole("management");
      setAuthDept("경영지원본부");
      setLoginError(false);
      setLoginPassword("");
      setLoginId("");
      return;
    }

    setLoginError(true);
  };

  const handleCreateDeptAccount = async () => {
    if (!newDeptAccountId || !newDeptAccountPw || !newDeptAccountDept) {
      return showAlert("아이디, 비밀번호, 부서를 모두 입력해주세요.");
    }
    const idStr = newDeptAccountId.trim();
    if (!/^[a-zA-Z0-9]+$/.test(idStr)) {
      return showAlert("아이디는 영문, 숫자만 가능합니다.");
    }

    try {
      const newHash = hashPassword(newDeptAccountPw);
      await setDoc(doc(db, "users", idStr), {
        id: idStr,
        passwordHash: newHash,
        rawPassword: newDeptAccountPw.trim(),
        role: newDeptAccountRole,
        deptName: newDeptAccountDept.trim(),
      });
      showAlert(
        `✅ [${newDeptAccountDept}] 부서의 계정(${idStr})이 성공적으로 생성/수정되었습니다.`,
      );
      setNewDeptAccountId("");
      setNewDeptAccountPw("");
      setNewDeptAccountDept("");
      setNewDeptAccountRole("production");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${idStr}`);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordChangeCurrent || !passwordChangeNew) {
      return showAlert("현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
    }
    try {
      const userDoc = await getDoc(doc(db, "users", loginId));
      if (!userDoc.exists()) {
        return showAlert("사용자를 찾을 수 없습니다.");
      }
      const data = userDoc.data();
      const currentHash = hashPassword(passwordChangeCurrent);
      if (data.passwordHash !== currentHash) {
        return showAlert("현재 비밀번호가 일치하지 않습니다.");
      }
      const newHash = hashPassword(passwordChangeNew);
      await setDoc(doc(db, "users", loginId), {
        ...data,
        passwordHash: newHash,
        rawPassword: passwordChangeNew.trim(),
      });
      showAlert("비밀번호가 성공적으로 변경되었습니다.");
      setIsPasswordChangeOpen(false);
      setPasswordChangeCurrent("");
      setPasswordChangeNew("");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${loginId}`);
    }
  };

  const mergeAndSetIndDB = (
    preList: IndividualData[],
    mainList: IndividualData[],
  ) => {
    const mergedMap = new Map<string, IndividualData>();

    const makeKey = (ind: IndividualData, index: number, prefix: string) => {
      let uid = String(ind.uid || "")
        .replace(/\s+/g, "")
        .toUpperCase();
      if (!uid || uid.includes("N/A")) {
        uid = `UNKNOWN_${prefix}_${index}`;
      }
      return uid;
    };

    preList.forEach((ind, i) => {
      const key = makeKey(ind, i, "PRE");
      let finalKey = key;
      let dupCounter = 1;
      while (mergedMap.has(finalKey)) {
        finalKey = `${key}_dup_${dupCounter++}`;
      }

      mergedMap.set(finalKey, {
        ...ind,
        hasPreData: true,
        hasMainData: false,
        mainKrScore: "",
        mainChibuScore: "",
        mainWeldScore: "",
        mainTestWeek: null,
        mainPassWeek: null,
        mainDropWeek: null,
        entryPassWeek: null,
        entryDropWeek: null,
        assignedDept: "",
        videoUrl: undefined,
        personalityTestUrl: undefined,
        _mergeKey: key,
      });
    });

    mainList.forEach((ind2, i) => {
      const key = makeKey(ind2, i, "MAIN");
      let matchedExistingKey = null;
      if (mergedMap.has(key) && !mergedMap.get(key)!.hasMainData) {
        matchedExistingKey = key;
      } else {
        for (let [k, v] of mergedMap.entries()) {
          if (v._mergeKey === key && !v.hasMainData) {
            matchedExistingKey = k;
            break;
          }
        }
      }

      if (matchedExistingKey) {
        const existing = mergedMap.get(matchedExistingKey)!;
        mergedMap.set(matchedExistingKey, {
          ...existing,
          ...ind2,
          hasPreData: true,
          hasMainData: true,
          job: ind2.job || existing.job,
          name: ind2.name || existing.name,
          dob: ind2.dob || existing.dob,
          age: ind2.age || existing.age,
          isE9: ind2.isE9 || existing.isE9,
          mainChibuScore: ind2.mainChibuScore || existing.mainChibuScore,
          mainWeldScore: ind2.mainWeldScore || existing.mainWeldScore,
          preDropWeek: existing.preDropWeek,
          entryPassWeek: ind2.entryPassWeek,
          entryDropWeek: ind2.entryDropWeek,
          videoUrl: ind2.videoUrl || existing.videoUrl,
          personalityTestUrl:
            ind2.personalityTestUrl || existing.personalityTestUrl,
        });
      } else {
        let finalKey = key;
        let dupCounter = 1;
        while (mergedMap.has(finalKey)) {
          finalKey = `${key}_dup_${dupCounter++}`;
        }
        mergedMap.set(finalKey, {
          preKrScore: "",
          preChibuScore: "",
          preWeldScore: "",
          preTestWeek: null,
          prePassWeek: null,
          preDropWeek: null,
          ...ind2,
          hasPreData: false,
          hasMainData: true,
          entryPassWeek: ind2.entryPassWeek,
          entryDropWeek: ind2.entryDropWeek,
          videoUrl: ind2.videoUrl,
          personalityTestUrl: ind2.personalityTestUrl,
          _mergeKey: key,
        });
      }
    });

    setIndividualsDB([...Array.from(mergedMap.values())]);
  };

  const fetchGoogleSheets = async (isManual = false) => {
    if (!baseSheetUrl || !individualSheetUrl) {
      if (isManual) showAlert("구글 시트 링크를 모두 입력해주세요.");
      return;
    }

    const baseSheetId = getSheetId(baseSheetUrl);
    const indSheetId = getSheetId(individualSheetUrl);

    if (!baseSheetId || !indSheetId) {
      if (isManual)
        showAlert(
          "올바른 구글 시트 링크가 아닙니다. 공유 링크를 다시 확인해주세요.",
        );
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let errorDetails: string[] = [];

    let finalDept: RequestData[] = [];
    let finalAgency: AgencySupplyData[] = [];

    const checkCsvError = (text: string, tabName: string) => {
      const lowerText = text.trim().toLowerCase();
      if (
        lowerText.startsWith("<!doctype html>") ||
        lowerText.startsWith("<html")
      )
        throw new Error("AUTH_REQUIRED");
      if (text.includes('"status","error"') && text.includes("reqId"))
        throw new Error(`SHEET_NOT_FOUND:${tabName}`);
    };

    try {
      const deptRes = await fetch(
        `https://docs.google.com/spreadsheets/d/${baseSheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(deptTabName)}`,
      );
      if (deptRes.ok) {
        const text = await deptRes.text();
        checkCsvError(text, deptTabName);
        const parsedRows = parseCSVText(text);
        finalDept = parsedRows
          .slice(1)
          .map((cols, idx) => ({
            id: idx + 1,
            dept: cols[0],
            job: cols[1],
            reqCount: Number(cols[2]),
            reqWeek:
              typeof parseWeekInfo(cols[3]) === "number"
                ? (parseWeekInfo(cols[3]) as number)
                : 52,
          }))
          .filter((item) => item.dept && !isNaN(item.reqCount));
        if (finalDept.length > 0) {
          setRequestDB(finalDept);
          successCount++;
          errorDetails.push(`✅ [${deptTabName}] ${finalDept.length}건 연동`);
        } else {
          errorDetails.push(`❌ [${deptTabName}] 데이터를 찾을 수 없습니다.`);
        }
      }

      const agencyRes = await fetch(
        `https://docs.google.com/spreadsheets/d/${baseSheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(agencyTabName)}`,
      );
      if (agencyRes.ok) {
        const text = await agencyRes.text();
        checkCsvError(text, agencyTabName);
        const parsedRows = parseCSVText(text);
        finalAgency = parsedRows
          .slice(1)
          .map((cols) => ({
            country: cols[0],
            track: cols[1],
            agency: cols[2],
            job: cols[3],
            count: Number(cols[4]),
            supplyWeek:
              typeof parseWeekInfo(cols[8]) === "number"
                ? (parseWeekInfo(cols[8]) as number)
                : null,
            fixedDept:
              cols[9] && cols[9].trim() !== "미확정" && cols[9].trim() !== ""
                ? cols[9].trim()
                : null,
            fixedCount:
              cols[10] && !isNaN(Number(cols[10]))
                ? Number(cols[10])
                : Number(cols[4]),
          }))
          .filter((item) => item.agency && !isNaN(item.count));

        if (finalAgency.length > 0) {
          setAgencySupplyDB(finalAgency);
          successCount++;
          errorDetails.push(
            `✅ [${agencyTabName}] ${finalAgency.length}건 연동`,
          );
        }
      }

      let indFetchUrl1 = `https://docs.google.com/spreadsheets/d/${indSheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(individualTabName1)}`;
      let indFetchUrl2 = `https://docs.google.com/spreadsheets/d/${indSheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(individualTabName2)}`;

      const indRes1 = await fetch(indFetchUrl1);
      const indRes2 = await fetch(indFetchUrl2);

      let mergedPre: IndividualData[] = [];
      let mergedMain: IndividualData[] = [];
      let ind1Success = false;
      let ind2Success = false;

      if (indRes1.ok) {
        const text1 = await indRes1.text();
        checkCsvError(text1, individualTabName1);

        if (text1.includes("배치부서") || text1.includes("입국일자")) {
          errorDetails.push(
            `❌ [사전기량 탭 오류] 탭 이름이 정확하지 않아 본기량 시트가 중복으로 불러와졌습니다. 관리자 설정에서 탭 이름의 띄어쓰기를 정확히 맞춰주세요.`,
          );
        } else {
          mergedPre = parseCSVText(text1)
            .map((cols, i) => parsePreRow(cols, i))
            .filter(Boolean) as IndividualData[];
          if (mergedPre.length > 0) ind1Success = true;
        }
      }
      if (indRes2.ok) {
        const text2 = await indRes2.text();
        checkCsvError(text2, individualTabName2);

        if (!text2.includes("배치부서") && !text2.includes("입국일자")) {
          errorDetails.push(
            `❌ [본기량 탭 오류] 탭 이름이 정확하지 않아 사전기량 시트가 잘못 불러와졌습니다. 관리자 설정에서 탭 이름의 띄어쓰기를 정확히 맞춰주세요.`,
          );
        } else {
          mergedMain = parseCSVText(text2)
            .map((cols, i) => parseMainRow(cols, i))
            .filter(Boolean) as IndividualData[];
          if (mergedMain.length > 0) ind2Success = true;
        }
      }

      if (ind1Success || ind2Success) {
        mergeAndSetIndDB(mergedPre, mergedMain);
        successCount += (ind1Success ? 1 : 0) + (ind2Success ? 1 : 0);
        errorDetails.push(
          `✅ [명단 연동] 사전평가 ${mergedPre.length}명, 본평가 ${mergedMain.length}명 병합 완료`,
        );
      } else {
        errorDetails.push(
          `❌ [명단 연동] 개인 명단 데이터를 양쪽 탭에서 모두 찾을 수 없습니다.`,
        );
      }

      if (isManual) {
        try {
          const batch = writeBatch(db);
          batch.set(doc(db, "cache", "request"), {
            data: JSON.stringify(finalDept || []),
          });
          batch.set(doc(db, "cache", "agency"), {
            data: JSON.stringify(finalAgency || []),
          });
          batch.set(doc(db, "cache", "individual_pre"), {
            data: JSON.stringify(mergedPre || []),
          });
          batch.set(doc(db, "cache", "individual_main"), {
            data: JSON.stringify(mergedMain || []),
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `cache`);
        }
      }

      if (successCount >= 3) {
        if (isManual) {
          showAlert(
            `🎉 모든 데이터가 완벽하게 동기화되었습니다!\n\n${errorDetails.join("\n")}`,
          );
        }
        localStorage.setItem("baseSheetUrl", baseSheetUrl);
        localStorage.setItem("individualSheetUrl", individualSheetUrl);
        localStorage.setItem("deptTabName", deptTabName);
        localStorage.setItem("agencyTabName", agencyTabName);
        localStorage.setItem("individualTabName1", individualTabName1);
        localStorage.setItem("individualTabName2", individualTabName2);
      } else {
        if (isManual || successCount === 0) {
          showAlert(
            `⚠️ 동기화 부분 실패 또는 오류 발생\n\n${errorDetails.join("\n")}\n\n※ 접근 권한, 탭 이름, 또는 시트의 '필터' 적용 여부를 확인해주세요.`,
          );
        }
      }
    } catch (err: any) {
      if (isManual) {
        if (err.message === "AUTH_REQUIRED") {
          showAlert(
            '❌ [권한 오류] 구글 시트 접근 권한이 없습니다.\n시트 우측 상단의 [공유] 설정에서 "제한됨"을 "링크가 있는 모든 사용자(뷰어)"로 변경해 주세요.',
          );
        } else if (err.message.includes("SHEET_NOT_FOUND")) {
          showAlert(
            `❌ [탭 이름 오류] 탭을 찾을 수 없습니다.\n화면 하단의 탭 이름이 정확한지 확인해 주세요.`,
          );
        } else {
          showAlert(`❌ 예상치 못한 오류 발생:\n${err.message}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadFromCache = async () => {
      try {
        setIsLoading(true);
        const [reqSnap, agencySnap, preSnap, mainSnap] = await Promise.all([
          getDoc(doc(db, "cache", "request")),
          getDoc(doc(db, "cache", "agency")),
          getDoc(doc(db, "cache", "individual_pre")),
          getDoc(doc(db, "cache", "individual_main")),
        ]);

        let loadedFromCache = false;

        if (reqSnap.exists()) {
          const reqData = JSON.parse(reqSnap.data().data);
          if (reqData && reqData.length > 0) {
            setRequestDB(reqData);
            loadedFromCache = true;
          }
        }
        if (agencySnap.exists()) {
          const agencyData = JSON.parse(agencySnap.data().data);
          if (agencyData && agencyData.length > 0) {
            setAgencySupplyDB(agencyData);
            loadedFromCache = true;
          }
        }

        let preData: IndividualData[] = [];
        let mainData: IndividualData[] = [];
        if (preSnap.exists()) {
          preData = JSON.parse(preSnap.data().data);
        }
        if (mainSnap.exists()) {
          mainData = JSON.parse(mainSnap.data().data);
        }

        if (preData.length > 0 || mainData.length > 0) {
          mergeAndSetIndDB(preData, mainData);
          loadedFromCache = true;
        }

        if (!loadedFromCache && baseSheetUrl && individualSheetUrl) {
          fetchGoogleSheets(false);
        }
      } catch (e) {
        if (baseSheetUrl && individualSheetUrl) fetchGoogleSheets(false);
        handleFirestoreError(e, OperationType.GET, `cache`);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromCache();

    const currentIsoWeek = getIsoWeek(new Date());
    setCurrentWeek(currentIsoWeek > 156 ? 156 : currentIsoWeek);
  }, []);

  const individualsWithDept = useMemo(() => {
    const assigned = assignDepartments(individualsDB, requestDB);
    if (authRole === "production" && authDept) {
      return assigned.filter(
        (ind) => ind.displayDept === authDept || ind.assignedDept === authDept,
      );
    }
    return assigned;
  }, [individualsDB, requestDB, authRole, authDept]);
  const allocatedResults = useMemo(() => {
    const results = autoAllocate(requestDB, agencySupplyDB);
    if (authRole === "production" && authDept) {
      return results.filter((item) => item.dept === authDept);
    }
    return results;
  }, [requestDB, agencySupplyDB, authRole, authDept]);

  const filteredRequestDB = useMemo(() => {
    if (authRole === "production" && authDept) {
      return requestDB.filter((r) => r.dept === authDept);
    }
    return requestDB;
  }, [authRole, authDept, requestDB]);

  const overviewTotal = useMemo(
    () => agencySupplyDB.reduce((sum, item) => sum + item.count, 0),
    [agencySupplyDB],
  );
  const completedCount = useMemo(
    () =>
      agencySupplyDB
        .filter(
          (item) => item.supplyWeek !== null && item.supplyWeek <= currentWeek,
        )
        .reduce((sum, item) => sum + item.count, 0),
    [currentWeek, agencySupplyDB],
  );
  const plannedCount = overviewTotal - completedCount;

  const sortedSupplyWeeks = useMemo(() => {
    const weeks = agencySupplyDB
      .map((item) => item.supplyWeek)
      .filter((w) => w !== null) as number[];
    return Array.from(new Set(weeks)).sort((a, b) => a - b);
  }, [agencySupplyDB]);

  const currentWaveIndex = sortedSupplyWeeks.indexOf(currentWeek);
  const currentWaveEntryCount = useMemo(() => {
    if (currentWaveIndex === -1) return 0;
    return agencySupplyDB
      .filter((item) => item.supplyWeek === currentWeek)
      .reduce((sum, item) => sum + item.count, 0);
  }, [currentWeek, agencySupplyDB, currentWaveIndex]);

  const deptSummary = useMemo(() => {
    const summary: Record<string, any> = {};
    allocatedResults.forEach((item) => {
      let matchedCount = 0;
      let arrivedCount = 0;
      let plannedArrivalCount = 0;
      let currentWaveCount = 0;

      item.fulfillments?.forEach((f) => {
        matchedCount += f.count;
        if (f.supplyWeek !== null && f.supplyWeek <= currentWeek)
          arrivedCount += f.count;
        else plannedArrivalCount += f.count;

        if (f.supplyWeek === currentWeek) currentWaveCount += f.count;
      });

      if (filterStatus === "completed" && arrivedCount === 0) return;
      if (filterStatus === "planned" && plannedArrivalCount === 0) return;
      if (filterStatus === "current_wave" && currentWaveCount === 0) return;

      if (!summary[item.dept])
        summary[item.dept] = {
          name: item.dept,
          totalReq: 0,
          totalMatched: 0,
          totalArrived: 0,
          totalPlanned: 0,
          totalCurrentWave: 0,
          jobs: {},
        };

      summary[item.dept].totalReq += item.reqCount;
      summary[item.dept].totalMatched += matchedCount;
      summary[item.dept].totalArrived += arrivedCount;
      summary[item.dept].totalPlanned += plannedArrivalCount;
      summary[item.dept].totalCurrentWave += currentWaveCount;

      if (!summary[item.dept].jobs[item.job])
        summary[item.dept].jobs[item.job] = {
          req: 0,
          matched: 0,
          arr: 0,
          plan: 0,
          wave: 0,
        };
      summary[item.dept].jobs[item.job].req += item.reqCount;
      summary[item.dept].jobs[item.job].matched += matchedCount;
      summary[item.dept].jobs[item.job].arr += arrivedCount;
      summary[item.dept].jobs[item.job].plan += plannedArrivalCount;
      summary[item.dept].jobs[item.job].wave += currentWaveCount;
    });
    return Object.values(summary).sort((a, b) => b.totalReq - a.totalReq);
  }, [currentWeek, filterStatus, allocatedResults]);

  const confirmedDeptSummary = useMemo(() => {
    const summary: Record<string, any> = {};
    const arrivedInds = individualsWithDept.filter((ind) => {
      const status = getIndividualStatus(ind, currentWeek);
      const isConfirmed =
        status.stage === "입국" &&
        !status.isDropped &&
        typeof ind.entryPassWeek === "number" &&
        ind.entryPassWeek > 0;

      if (filterStatus === "completed") {
        return isConfirmed;
      } else if (filterStatus === "planned") {
        return (
          typeof ind.entryPassWeek === "number" &&
          ind.entryPassWeek > currentWeek &&
          !status.isDropped &&
          ind.entryPassWeek > 0
        );
      } else if (filterStatus === "current_wave") {
        return (
          typeof ind.entryPassWeek === "number" &&
          ind.entryPassWeek === currentWeek &&
          !status.isDropped &&
          ind.entryPassWeek > 0
        );
      }
      return (
        isConfirmed ||
        (typeof ind.entryPassWeek === "number" &&
          ind.entryPassWeek > currentWeek &&
          !status.isDropped &&
          ind.entryPassWeek > 0)
      );
    });

    requestDB.forEach((req) => {
      if (!summary[req.dept]) {
        summary[req.dept] = {
          name: req.dept,
          totalReq: 0,
          totalArrived: 0,
          jobs: {},
        };
      }
      summary[req.dept].totalReq += req.reqCount;
      if (!summary[req.dept].jobs[req.job]) {
        summary[req.dept].jobs[req.job] = { req: 0, arr: 0, inds: [] };
      }
      summary[req.dept].jobs[req.job].req += req.reqCount;
    });

    arrivedInds.forEach((ind) => {
      const dept = ind.displayDept || "대기(TBD)";
      if (!summary[dept]) {
        summary[dept] = { name: dept, totalReq: 0, totalArrived: 0, jobs: {} };
      }
      summary[dept].totalArrived += 1;

      if (!summary[dept].jobs[ind.job]) {
        summary[dept].jobs[ind.job] = { req: 0, arr: 0, inds: [] };
      }
      summary[dept].jobs[ind.job].arr += 1;
      summary[dept].jobs[ind.job].inds.push(ind);
    });

    let result = Object.values(summary);
    if (filterStatus !== null) {
      result = result.filter((d) => d.totalArrived > 0);
    }
    return result.sort((a, b) => b.totalReq - a.totalReq);
  }, [individualsWithDept, currentWeek, requestDB, filterStatus]);

  const filteredAgenciesByStatus = useMemo(
    () =>
      agencySupplyDB.filter((item) => {
        if (filterStatus === "completed")
          return item.supplyWeek !== null && item.supplyWeek <= currentWeek;
        if (filterStatus === "planned")
          return item.supplyWeek === null || item.supplyWeek > currentWeek;
        if (filterStatus === "current_wave")
          return item.supplyWeek === currentWeek;
        return true;
      }),
    [currentWeek, filterStatus, agencySupplyDB],
  );

  const availableJobs = useMemo(
    () => [
      "전체",
      ...Array.from(new Set(filteredAgenciesByStatus.map((item) => item.job))),
    ],
    [filteredAgenciesByStatus],
  );
  const availableCountries = useMemo(
    () => [
      "전체",
      ...Array.from(
        new Set(filteredAgenciesByStatus.map((item) => item.country)),
      ),
    ],
    [filteredAgenciesByStatus],
  );

  const sourceSummary = useMemo(() => {
    const sum: Record<string, any> = { country: {}, track: {}, agency: {} };
    const agenciesToProcess = filteredAgenciesByStatus.filter(
      (item) =>
        (selectedJobFilter === "전체" || item.job === selectedJobFilter) &&
        (selectedCountryFilter === "전체" ||
          item.country === selectedCountryFilter),
    );
    agenciesToProcess.forEach((item) => {
      sum.country[item.country] = (sum.country[item.country] || 0) + item.count;
      sum.track[item.track] = (sum.track[item.track] || 0) + item.count;
      if (!sum.agency[item.agency])
        sum.agency[item.agency] = { count: 0, country: item.country };
      sum.agency[item.agency].count += item.count;
    });
    return {
      totalCount: agenciesToProcess.reduce((acc, curr) => acc + curr.count, 0),
      country: Object.entries(sum.country).map(([n, v]) => ({
        name: n,
        value: v,
      })),
      track: Object.entries(sum.track).map(([n, v]) => ({ name: n, value: v })),
      agency: Object.entries(sum.agency)
        .map(([n, data]: any) => ({
          name: n,
          value: data.count,
          country: data.country,
        }))
        .sort((a: any, b: any) => b.value - a.value),
    };
  }, [filteredAgenciesByStatus, selectedJobFilter, selectedCountryFilter]);

  const toggleFilter = (status: string | null) =>
    setFilterStatus(filterStatus === status ? null : status);

  // Geometric Balance Login View -> Family Look Login View
  if (!authRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-300 select-none antialiased relative">
        {/* Background Image Setup */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/yard.png')",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0a0f18]/60 z-0"></div>

        <div className="relative z-10 bg-[#0a0f18]/60 backdrop-blur-md shadow-2xl relative flex flex-col items-center" style={{ width: '550px', height: '600px', padding: '30px' }}>
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400"></div>

          {/* Badge */}
          <div className="mt-8 mb-6 px-4 py-1.5 border border-[#232f43] rounded-full flex items-center gap-2 bg-[#151c28]/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-bold text-white uppercase tracking-widest font-mono">
              WORKFORCE_SUPPLY_SYSTEM
            </span>
          </div>

          {/* CI and Title */}
          <div className="flex flex-col items-center mb-6 text-center">
            <img src="/ci.png" alt="HD현대삼호" className="h-10 object-contain mb-8" />

            <h2 className="text-[34px] font-bold text-white tracking-tight mb-3">
              E-7 수급 관리 시스템
            </h2>
            <p className="text-base text-slate-300 font-medium mt-1">
              접속 권한 확인을 위해
              <br />
              비밀번호를 입력해주세요.
            </p>
          </div>

          <form
            onSubmit={handleInitialLogin}
            className="w-full max-w-md mt-2"
            noValidate
            style={{ height: '186.5px' }}
          >
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  inputMode="email"
                  autoCapitalize="off"
                  autoComplete="username"
                  style={{ imeMode: "inactive" } as any}
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    setLoginError(false);
                  }}
                  className={`w-full px-4 py-[12px] pl-12 bg-[#050b14] border border-[#1a2332] focus:border-cyan-500/50 text-white placeholder-slate-500 rounded-lg outline-none transition-all font-mono`}
                  placeholder="아이디 입력"
                  autoFocus
                />
                <Users
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500"
                />
              </div>
              {/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(loginId) && (
                <p className="text-xs text-orange-400 mt-2 ml-1">
                  영문으로 변환하여 입력해주세요.
                </p>
              )}
            </div>
            <div className="mb-4">
              <div className="relative">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError(false);
                  }}
                  className={`w-full px-4 py-[12px] pl-12 bg-[#050b14] border ${loginError ? "border-red-500/50" : "border-[#1a2332] focus:border-cyan-500/50"} text-white placeholder-slate-500 rounded-lg outline-none transition-all font-mono`}
                  placeholder="비밀번호 입력"
                />
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500"
                />
              </div>
              {loginError && (
                <p className="text-xs text-red-400 font-medium mt-2 pl-2">
                  아이디 또는 비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-red-900 via-slate-800 to-blue-900 hover:from-red-800 hover:via-slate-700 hover:to-blue-800 text-white rounded-lg font-bold shadow-lg transition-all text-[15px] tracking-wide flex justify-center items-center gap-2 border border-white/5"
              style={{ marginTop: '11px' }}
            >
              시스템 접속
            </button>
          </form>

          {/* Footer inside card */}
          <div className="w-full flex justify-end items-center mt-12 mb-2 px-2 text-[10px] font-bold font-mono tracking-widest">
            <div className="text-cyan-500/50">SECURE CONNECTION (ONLINE)</div>
          </div>
        </div>
      </div>
    );
  }

  // Geometric Balance Main App View
  return (
    <div
      className="min-h-screen text-slate-300 flex flex-col font-sans select-none antialiased relative"
      style={{
        backgroundImage: "url('/yard.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: "#030305",
      }}
    >
      <div className="absolute inset-0 bg-[#030305]/60 pointer-events-none z-0" />
      <div className="absolute inset-0 grid-pattern pointer-events-none z-0 opacity-30" />
      <div className="absolute inset-0 scanline pointer-events-none z-0 opacity-50" />
      <div className="relative z-10 flex flex-col flex-1 h-full overflow-hidden">
        {/* Header Section (Geometric Balance Theme -> Family Look) */}
        <header className="h-[72px] bg-[#0a0f18]/80 backdrop-blur-md border-b border-[#1a2332]/50 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 relative overflow-x-auto hide-scrollbar z-20" style={{ backgroundColor: '#0b5aad' }}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#163085]"></div>

          <div className="flex items-center gap-4 sm:gap-8 md:gap-14">
            <div className="flex flex-row items-center gap-2 sm:gap-4 min-w-max">
              <img src="/ci.png" alt="HD현대삼호" className="h-5 sm:h-7 object-contain" />
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  스마트 수급 플랫폼
                </h1>
                <p className="text-[9px] sm:text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest font-mono mt-0.5">
                  GLOBAL WORKFORCE SUPPLY
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === "dashboard" ? "bg-[#059669] hover:bg-[#047857] text-white shadow-sm" : "bg-[#151c28] text-slate-400 hover:text-white border border-[#232f43]"}`}
              >
                <LayoutDashboard size={16} /> 대시보드
              </button>
              {authRole === "admin" && (
                <button
                  onClick={() => setActiveTab("data")}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === "data" ? "bg-[#059669] hover:bg-[#047857] text-white shadow-sm" : "bg-[#151c28] text-slate-400 hover:text-white border border-[#232f43]"}`}
                >
                  <Database size={16} /> 시스템 관리
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 min-w-max ml-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white uppercase tracking-wider">
                {authRole === "admin" ? "SYSTEM ADMIN" : "HD현대삼호"}
              </p>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-0.5">
                공급망 관제 센터
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex w-10 h-10 rounded-full border border-[#232f43] items-center justify-center text-slate-400 bg-[#151c28]">
                <ShieldCheck size={20} />
              </div>

              <div className="hidden sm:block w-px h-6 bg-[#232f43] mx-1"></div>

              <button
                onClick={() => fetchGoogleSheets(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Google Sheets 동기화"
              >
                <RefreshCw
                  size={18}
                  className={isLoading ? "animate-spin text-emerald-400" : ""}
                />
              </button>

              <button
                onClick={() => setIsPasswordChangeOpen(true)}
                className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                title="비밀번호 변경"
              >
                <Key size={20} />
              </button>

              <button
                onClick={() => {
                  setAuthRole(null);
                  setActiveTab("dashboard");
                }}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                title="로그아웃"
              >
                <Power size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8">
          {activeTab === "dashboard" && (
            <div className="max-w-[1400px] mx-auto space-y-6">
              {/* KPI Summary Row (Family Look) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <div
                  className={`rounded-2xl p-5 flex flex-col justify-between shadow-lg cursor-pointer transition-all duration-300 border relative overflow-hidden group h-[180px] animate-in fade-in zoom-in-95 hover:-translate-y-1 backdrop-blur-md ${filterStatus === null ? "border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-blue-900/30" : "border-[#232f43] hover:border-blue-500/30 bg-[#0a0f18]/60 hover:bg-[#151c28]/70"}`}
                  style={{ animationDelay: "0ms" }}
                  onClick={() => toggleFilter(null)}
                >
                  <div
                    className="absolute inset-0 z-0 opacity-30 transition-opacity group-hover:opacity-40 mix-blend-overlay"
                    style={{
                      backgroundImage: "url('/1.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div
                    className={`absolute top-0 left-0 right-0 h-[3px] transition-all z-10 ${filterStatus === null ? "bg-blue-500" : "bg-transparent group-hover:bg-blue-500/50"}`}
                  ></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono mb-0.5">
                        TOTAL PLANNED
                      </span>
                      <span className="text-lg font-bold text-white tracking-tight">
                        총 공급 계획 인원
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-6">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono mr-2">
                        올해 목표
                      </span>
                      <span className="text-3xl font-display font-black text-white tracking-tighter">
                        {overviewTotal}
                        <span className="text-sm font-medium text-slate-500 ml-1">
                          명
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-2xl p-5 flex flex-col justify-between shadow-lg cursor-pointer transition-all duration-300 border relative overflow-hidden group h-[180px] animate-in fade-in zoom-in-95 hover:-translate-y-1 backdrop-blur-md ${filterStatus === "completed" || filterStatus === "current_wave" ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-900/30" : "border-[#232f43] hover:border-emerald-500/30 bg-[#0a0f18]/60 hover:bg-[#151c28]/70"}`}
                  style={{ animationDelay: "100ms" }}
                  onClick={() => toggleFilter("completed")}
                >
                  <div
                    className="absolute inset-0 z-0 opacity-20 transition-opacity group-hover:opacity-30 mix-blend-overlay"
                    style={{
                      backgroundImage: "url('/2.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div
                    className={`absolute top-0 left-0 right-0 h-[3px] transition-all z-10 ${filterStatus === "completed" || filterStatus === "current_wave" ? "bg-emerald-500" : "bg-transparent group-hover:bg-emerald-500/50"}`}
                  ></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono mb-0.5">
                        MATCHED & ARRIVED
                      </span>
                      <span className="text-lg font-bold text-white tracking-tight">
                        매칭 및 입국 완료
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <ShieldCheck size={16} />
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-4 relative z-10">
                    <div className="flex flex-col">
                      {currentWaveIndex !== -1 && currentWaveEntryCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFilter("current_wave");
                          }}
                          className={`mb-2 text-[10px] font-extrabold px-2 py-0.5 rounded border transition-all flex items-center font-mono self-start ${filterStatus === "current_wave" ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" : "bg-[#151c28] text-slate-400 border-[#232f43] hover:bg-[#1a2332]"}`}
                        >
                          {currentWaveIndex + 1}차 당해: +
                          {currentWaveEntryCount}명
                        </button>
                      )}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono mr-2">
                          {getWeekStr(currentWeek)} 누적
                        </span>
                        <span className="text-3xl font-display font-black text-emerald-400 tracking-tighter">
                          {completedCount}
                          <span className="text-sm font-medium text-emerald-500/50 ml-1">
                            명
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-2xl p-5 flex flex-col justify-between shadow-lg cursor-pointer transition-all duration-300 border relative overflow-hidden group h-[180px] animate-in fade-in zoom-in-95 hover:-translate-y-1 backdrop-blur-md ${filterStatus === "planned" ? "border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-purple-900/30" : "border-[#232f43] hover:border-purple-500/30 bg-[#0a0f18]/60 hover:bg-[#151c28]/70"}`}
                  style={{ animationDelay: "200ms" }}
                  onClick={() => toggleFilter("planned")}
                >
                  <div
                    className="absolute inset-0 z-0 opacity-20 transition-opacity group-hover:opacity-30 mix-blend-overlay"
                    style={{
                      backgroundImage: "url('/3.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div
                    className={`absolute top-0 left-0 right-0 h-[3px] transition-all z-10 ${filterStatus === "planned" ? "bg-purple-500" : "bg-transparent group-hover:bg-purple-500/50"}`}
                  ></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest font-mono mb-0.5">
                        FUTURE ARRIVALS
                      </span>
                      <span className="text-lg font-bold text-white tracking-tight">
                        향후 입국 예정
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <CalendarClock size={16} />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-6">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono mr-2">
                        {getWeekStr(currentWeek)} 이후
                      </span>
                      <span className="text-3xl font-display font-black text-white tracking-tighter">
                        {plannedCount}
                        <span className="text-sm font-medium text-slate-500 ml-1">
                          명
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Slider embedded as a KPI Card */}
                <div
                  className="bg-[#0a0f18]/60 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between shadow-lg border border-[#232f43] text-white h-[180px] animate-in fade-in zoom-in-95 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: "300ms" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-transparent group-hover:bg-amber-500/50 transition-all"></div>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono mb-0.5">
                        TIMELINE
                      </span>
                      <span className="text-lg font-bold text-white tracking-tight">
                        주차별 타임라인
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex bg-[#151c28] rounded-lg border border-[#232f43] p-0.5">
                        {[2025, 2026, 2027].map((year) => {
                          const isSelected =
                            2025 + Math.floor((currentWeek - 1) / 52) === year;
                          return (
                            <button
                              key={year}
                              onClick={() =>
                                setCurrentWeek(
                                  (year - 2025) * 52 +
                                    (((currentWeek - 1) % 52) + 1),
                                )
                              }
                              className={`text-[10px] px-2 py-1 rounded transition-colors font-bold font-mono tracking-wider ${isSelected ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
                            >
                              {year}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentWeek(getIsoWeek(new Date()))}
                        className="text-[10px] bg-[#151c28] hover:bg-[#1a2332] px-2 py-1.5 rounded transition-colors text-amber-400 font-bold border border-[#232f43] font-mono uppercase tracking-widest shadow-sm"
                      >
                        현재 주차
                      </button>
                    </div>
                  </div>
                  <div className="relative mt-[2px]">
                    {(() => {
                      const selectedYear =
                        2025 + Math.floor((currentWeek - 1) / 52);
                      const minW = (selectedYear - 2025) * 52 + 1;
                      const maxW = (selectedYear - 2025) * 52 + 52;
                      return (
                        <input
                          type="range"
                          min={minW}
                          max={maxW}
                          step="1"
                          value={currentWeek}
                          onChange={(e) =>
                            setCurrentWeek(Number(e.target.value))
                          }
                          className="w-full h-2 bg-[#1a2332] rounded-full appearance-none cursor-pointer accent-amber-500 outline-none"
                        />
                      );
                    })()}
                    <div className="flex items-baseline justify-between mt-3">
                      <span
                        className="font-display font-black text-white tracking-tighter"
                        style={{ fontSize: "25px" }}
                      >
                        {getWeekStr(currentWeek)}
                      </span>
                      <span className="text-sm text-amber-500 font-mono font-bold self-end tracking-wider">
                        W{((currentWeek - 1) % 52) + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stages Pipeline */}
              <div className="bg-[#0a0f18]/60 backdrop-blur-md rounded-2xl border border-[#3b4a6b] shadow-[0_0_15px_rgba(59,130,246,0.1)] overflow-hidden relative group transition-all duration-300">
                <div
                  className="absolute inset-0 z-0 opacity-20 transition-opacity group-hover:opacity-30 mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: "url('/yard.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="relative z-10">
                  <div className="px-5 border-b border-[#232f43] flex items-center justify-between bg-[#151c28]/60 h-[50px]">
                    <h3 className="font-bold text-white text-[15px] tracking-wide">
                      단계별 수급 진행 현황
                    </h3>
                  </div>
                  <div className="p-[15px]">
                    <ActualStagePipeline
                      individuals={individualsWithDept}
                      onStageClick={(stage, viewType) =>
                        setSelectedStageModal({ stage, viewType })
                      }
                      currentWeek={currentWeek}
                    />
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mt-6">
                <div className="min-w-0 h-full">
                  <YearlySupplyChart
                    individuals={individualsWithDept}
                    requestDB={filteredRequestDB}
                  />
                </div>
                <div className="min-w-0 h-full">
                  <SkillAnalysisChart individuals={individualsWithDept} />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 sm:gap-6 mt-6">
                {/* Department Allocation */}
                <div
                  className={`col-span-12 ${authRole !== "production" ? "lg:col-span-8 xl:col-span-8" : ""} bg-[#0a0f18]/60 backdrop-blur-md rounded-2xl border border-[#3b4a6b] shadow-[0_0_15px_rgba(59,130,246,0.1)] flex flex-col min-h-[500px] animate-in fade-in slide-in-from-bottom-4`}
                    style={{ animationDelay: "400ms" }}
                  >
                    <div className="px-4 sm:px-5 border-b border-[#232f43] flex flex-row items-center justify-between bg-[#151c28]/60 h-[61px] gap-2 sm:gap-0">
                      <h3 className="font-bold text-white text-[13px] sm:text-[15px] tracking-wide flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                        <Building2
                          size={16}
                          className="text-blue-500 hidden sm:block"
                        />{" "}
                        부서 배치 현황
                      </h3>
                      <div className="flex bg-[#0a0f18]/80 p-1 rounded-xl border border-[#232f43] overflow-x-auto hide-scrollbar flex-shrink-0">
                        <button
                          onClick={() => setAllocationMode("predicted")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${allocationMode === "predicted" ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(37,99,235,0.2)]" : "text-slate-400 hover:text-slate-200"}`}
                        >
                          예측 (공급계획)
                        </button>
                        <button
                          onClick={() => setAllocationMode("confirmed")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${allocationMode === "confirmed" ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(37,99,235,0.2)]" : "text-slate-400 hover:text-slate-200"}`}
                        >
                          확정 (실제명단)
                        </button>
                      </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto hide-scrollbar">
                      {allocationMode === "predicted"
                        ? deptSummary
                            .filter(
                              (dept) =>
                                authRole !== "production" ||
                                !authDept ||
                                dept.name === authDept,
                            )
                            .map((dept, idx) => {
                              const displayTotal =
                                filterStatus === "completed"
                                  ? dept.totalArrived
                                  : filterStatus === "planned"
                                    ? dept.totalPlanned
                                    : filterStatus === "current_wave"
                                      ? dept.totalCurrentWave
                                      : dept.totalMatched;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => setSelectedDept(dept.name)}
                                  className="bg-[#151c28]/60 backdrop-blur-sm border border-[#232f43] rounded-xl p-4 cursor-pointer hover:border-blue-500/50 transition-all hover:bg-[#1a2332]/80 hover:-translate-y-1 animate-in zoom-in-95"
                                  style={{
                                    animationDelay: `${500 + idx * 50}ms`,
                                  }}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-extrabold text-white tracking-wide font-mono">
                                      {dept.name}
                                    </h4>
                                    <span className="text-lg font-display font-black text-blue-400">
                                      {displayTotal}
                                      <span className="text-xs text-slate-500 font-mono font-medium ml-1">
                                        / {dept.totalReq}
                                      </span>
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                                    <div
                                      className="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] h-full rounded-full transition-all duration-1000 ease-out"
                                      style={{
                                        width: `${Math.min(100, (displayTotal / dept.totalReq) * 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(dept.jobs).map(
                                      ([job, stats]: any) => {
                                        const jobDisplay =
                                          filterStatus === "completed"
                                            ? stats.arr
                                            : filterStatus === "planned"
                                              ? stats.plan
                                              : filterStatus === "current_wave"
                                                ? stats.wave
                                                : stats.matched;
                                        return (
                                          <span
                                            key={job}
                                            className="text-[10px] font-extrabold bg-[#0a0f18] border border-[#232f43] text-slate-300 px-2 py-0.5 rounded-lg font-mono"
                                          >
                                            {job}{" "}
                                            <span className="text-blue-400 ml-1">
                                              {jobDisplay}/{stats.req}
                                            </span>
                                          </span>
                                        );
                                      },
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        : confirmedDeptSummary
                            .filter(
                              (dept) =>
                                authRole !== "production" ||
                                !authDept ||
                                dept.name === authDept,
                            )
                            .map((dept, idx) => (
                              <div
                                key={idx}
                                onClick={() =>
                                  setSelectedConfirmedDept({
                                    dept: dept.name,
                                    job: null,
                                  })
                                }
                                className="bg-[#151c28]/60 backdrop-blur-sm border border-[#232f43] rounded-xl p-4 cursor-pointer hover:border-blue-500/50 transition-all hover:bg-[#1a2332]/80 hover:-translate-y-1 animate-in zoom-in-95"
                                style={{ animationDelay: `${500 + idx * 50}ms` }}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-sm font-extrabold text-white tracking-wide font-mono">
                                    {dept.name}
                                  </h4>
                                  <span className="text-lg font-display font-black text-blue-400">
                                    {dept.totalArrived}
                                    <span className="text-xs text-slate-500 font-mono font-medium ml-1">
                                      / {dept.totalReq}
                                    </span>
                                  </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                                  <div
                                    className="bg-slate-400 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                      width: `${Math.min(100, (dept.totalArrived / dept.totalReq) * 100)}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {Object.entries(dept.jobs).map(
                                    ([job, stats]: any) => (
                                      <button
                                        key={job}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedConfirmedDept({
                                            dept: dept.name,
                                            job: job,
                                          });
                                        }}
                                        className="text-[10px] font-extrabold bg-[#0a0f18]/80 border border-[#232f43] text-slate-300 px-2 py-0.5 rounded-lg hover:bg-[#1a2332]/80 transition-all font-mono"
                                      >
                                        {job}{" "}
                                        <span className="text-blue-400 ml-1">
                                          {stats.arr}/{stats.req}
                                        </span>
                                      </button>
                                    ),
                                  )}
                                </div>
                              </div>
                            ))}
                    </div>
                  </div>

                {/* Source Agency Monitoring */}
                {authRole !== "production" && (
                  <div
                    className="col-span-12 lg:col-span-4 xl:col-span-4 bg-[#0a0f18]/60 backdrop-blur-md rounded-2xl border border-[#3b4a6b] shadow-[0_0_15px_rgba(59,130,246,0.1)] flex flex-col overflow-hidden max-h-[700px] animate-in fade-in slide-in-from-bottom-4 relative"
                    style={{ animationDelay: "500ms" }}
                  >
                    <div className="absolute inset-0 z-0 opacity-[0.1] mix-blend-screen pointer-events-none" style={{ backgroundImage: "url('/yard.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div className="relative z-10 p-5 border-b border-[#232f43] bg-[#151c28]/60 h-[64px] flex items-center">
                      <h3 className="font-bold text-white text-[15px] tracking-wide flex items-center gap-2">
                        <Globe size={18} className="text-blue-500" /> 공급 출처
                        관제
                      </h3>
                    </div>
                    <div className="relative z-10 p-4 border-b border-[#232f43] flex flex-col gap-3">
                      <select
                        value={selectedJobFilter}
                        onChange={(e) => setSelectedJobFilter(e.target.value)}
                        className="w-full text-xs font-mono font-bold bg-[#0a0f18]/80 border border-[#232f43] rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all"
                      >
                        {availableJobs.map((job) => (
                          <option
                            key={job}
                            value={job}
                            className="bg-slate-900"
                          >
                            직무: {job}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedCountryFilter}
                        onChange={(e) =>
                          setSelectedCountryFilter(e.target.value)
                        }
                        className="w-full text-xs font-mono font-bold bg-[#0a0f18]/80 border border-[#232f43] rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all"
                      >
                        {availableCountries.map((country) => (
                          <option
                            key={country}
                            value={country}
                            className="bg-slate-900"
                          >
                            국가: {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto hide-scrollbar">
                      <div className="space-y-3">
                        {sourceSummary.agency.map((agency: any, idx) => {
                          const width = `${(agency.value / sourceSummary.agency[0].value) * 100}%`;
                          return (
                            <div
                              key={idx}
                              onClick={() =>
                                setSelectedAgencyModal(agency.name)
                              }
                              className="bg-[#151c28] p-4 rounded-xl border border-[#232f43] cursor-pointer hover:border-blue-500/50 hover:bg-[#1a2332] transition-all hover:-translate-y-1 animate-in zoom-in-95"
                              style={{ animationDelay: `${600 + idx * 50}ms` }}
                            >
                              <div className="flex justify-between items-center text-sm font-extrabold text-white mb-2 font-mono">
                                <span>
                                  {agency.name}{" "}
                                  <span className="text-[10px] text-blue-500/70 font-normal tracking-widest ml-1">
                                    ({agency.country})
                                  </span>
                                </span>
                                <span className="text-blue-400">
                                  {agency.value}
                                </span>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                                <div
                                  className="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] h-full transition-all duration-1000 ease-out"
                                  style={{ width }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Admin Tab */}
          {activeTab === "data" && authRole === "admin" && (
            <div className="max-w-[1000px] mx-auto space-y-6">
              <div className="bg-[#0a0f18]/60 backdrop-blur-md rounded-2xl border border-[#232f43] p-6 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <h2 className="text-lg font-display font-black text-white mb-6 flex items-center border-b border-[#232f43] pb-4 tracking-tight">
                  <Settings2 className="mr-2 text-blue-500" /> 시스템 관리자
                  설정
                </h2>

                <div className="mb-8">
                  <h3 className="text-sm font-extrabold text-white mb-4 uppercase tracking-widest font-mono">
                    신규 부서 계정 관리
                  </h3>
                  <div className="border border-[#232f43] rounded-xl p-4 bg-[#151c28]">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div>
                        <label className="text-xs font-extrabold text-blue-500/70 mb-2 block font-mono">
                          권한
                        </label>
                        <select
                          value={newDeptAccountRole}
                          onChange={(e) =>
                            setNewDeptAccountRole(e.target.value)
                          }
                          className="w-full p-2 text-sm bg-[#0a0f18] border border-[#232f43] text-white rounded-lg outline-none focus:border-blue-500 transition-all font-mono"
                        >
                          <option value="production">
                            생산부서 (소속 데이터 열람)
                          </option>
                          <option value="general">
                            일반부서 (전체 데이터 열람)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-extrabold text-blue-500/70 mb-2 block font-mono">
                          부서명
                        </label>
                        <input
                          type="text"
                          list="dept-list"
                          value={newDeptAccountDept}
                          onChange={(e) =>
                            setNewDeptAccountDept(e.target.value)
                          }
                          className="w-full p-2 text-sm bg-[#0a0f18] border border-[#232f43] text-white placeholder-slate-500 rounded-lg outline-none focus:border-blue-500 transition-all font-mono"
                          placeholder="직접 입력 또는 선택"
                        />
                        <datalist id="dept-list">
                          {uniqueDepts.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <label className="text-xs font-extrabold text-blue-500/70 mb-2 block font-mono">
                          새 아이디 (영문/숫자)
                        </label>
                        <input
                          type="text"
                          value={newDeptAccountId}
                          onChange={(e) =>
                            setNewDeptAccountId(
                              e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
                            )
                          }
                          className="w-full p-2 text-sm bg-[#0a0f18] border border-[#232f43] text-white placeholder-slate-500 rounded-lg outline-none focus:border-blue-500 transition-all font-mono"
                          placeholder="아이디 입력"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-extrabold text-blue-500/70 mb-2 block font-mono">
                          새 비밀번호
                        </label>
                        <input
                          type="password"
                          value={newDeptAccountPw}
                          onChange={(e) => setNewDeptAccountPw(e.target.value)}
                          className="w-full p-2 text-sm bg-[#0a0f18] border border-[#232f43] text-white placeholder-slate-500 rounded-lg outline-none focus:border-blue-500 transition-all font-mono"
                          placeholder="새 비밀번호"
                        />
                      </div>
                      <div>
                        <button
                          onClick={handleCreateDeptAccount}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold py-2.5 rounded-lg transition-all font-mono shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                        >
                          생성 / 수정
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-extrabold text-white mb-4 uppercase tracking-widest font-mono">
                    데이터 동기화
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-[#151c28] border border-[#232f43] rounded-xl p-6 text-center">
                      <p className="text-sm text-slate-400 mb-4 font-mono">
                        Google Sheets에 연결된 마스터 DB와 로우 DB의 최신
                        데이터를 가져옵니다.
                      </p>
                      <button
                        onClick={() => fetchGoogleSheets(true)}
                        className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20 text-sm inline-flex items-center justify-center font-mono"
                      >
                        <RefreshCw
                          size={16}
                          className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
                        />{" "}
                        데이터 최신화 동기화
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer Bar (Geometric Balance Theme) */}
        <footer className="h-8 bg-[#0a0f18]/80 backdrop-blur-md border-t border-[#232f43] px-8 flex items-center justify-between text-[10px] text-blue-500/50 flex-shrink-0 font-mono z-20">
          <span className="uppercase tracking-widest font-extrabold">
            System Identity: E7-DASHBOARD-STABLE-v4
          </span>
          <div className="flex gap-4 font-mono font-extrabold uppercase">
            <span>Status: Nominal</span>
            <span>Role: {authRole?.toUpperCase()}</span>
          </div>
        </footer>

        {/* Modals */}
        {isPasswordChangeOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#0a0f18]/90 backdrop-blur-xl rounded-2xl border border-[#232f43] p-6 max-w-sm w-full shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
                <Key size={24} className="text-blue-400" />
              </div>
              <h2 className="text-lg font-black text-white mb-2 font-display">
                비밀번호 변경
              </h2>
              <p className="text-xs text-slate-400 mb-6 text-center">
                보안을 위해 주기적으로 비밀번호를 변경해주세요.
              </p>

              <div className="w-full space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    value={passwordChangeCurrent}
                    onChange={(e) => setPasswordChangeCurrent(e.target.value)}
                    className="w-full p-3 text-sm bg-[#151c28] border border-[#232f43] text-white placeholder-slate-500 rounded-xl outline-none focus:border-blue-500 transition-all focus:ring-1 focus:ring-blue-500/50 font-mono"
                    placeholder="현재 비밀번호 입력"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    value={passwordChangeNew}
                    onChange={(e) => setPasswordChangeNew(e.target.value)}
                    className="w-full p-3 text-sm bg-[#151c28] border border-[#232f43] text-white placeholder-slate-500 rounded-xl outline-none focus:border-blue-500 transition-all focus:ring-1 focus:ring-blue-500/50 font-mono"
                    placeholder="새 비밀번호 입력"
                  />
                </div>
              </div>

              <div className="flex gap-3 w-full mt-8">
                <button
                  onClick={() => {
                    setIsPasswordChangeOpen(false);
                    setPasswordChangeCurrent("");
                    setPasswordChangeNew("");
                  }}
                  className="flex-1 bg-[#151c28] hover:bg-[#232f43] text-slate-300 text-sm font-bold py-3 rounded-xl transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                  변경 완료
                </button>
              </div>
            </div>
          </div>
        )}

        <DeptModal
          isOpen={!!selectedDept}
          onClose={() => setSelectedDept(null)}
          dept={selectedDept}
          currentWeek={currentWeek}
          data={allocatedResults.filter((item) => item.dept === selectedDept)}
          filterStatus={filterStatus}
          authRole={authRole}
        />
        <ConfirmedDeptModal
          isOpen={!!selectedConfirmedDept}
          onClose={() => setSelectedConfirmedDept(null)}
          selection={selectedConfirmedDept}
          confirmedDeptSummary={confirmedDeptSummary}
          filterStatus={filterStatus}
          authRole={authRole}
        />
        <AgencyDetailModal
          isOpen={!!selectedAgencyModal}
          onClose={() => setSelectedAgencyModal(null)}
          agencyName={selectedAgencyModal}
          agencySupplyDB={agencySupplyDB}
          individuals={individualsWithDept}
        />
        <IndividualDetailModal
          isOpen={!!selectedStageModal}
          onClose={() => setSelectedStageModal(null)}
          stage={selectedStageModal?.stage}
          viewType={selectedStageModal?.viewType}
          individuals={individualsWithDept}
          currentWeek={currentWeek}
          authRole={authRole}
        />

        {/* Alert Modal */}
        {alertMessage && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0a0f18] backdrop-blur-md rounded-2xl p-6 max-w-sm w-full shadow-[0_0_15px_rgba(59,130,246,0.1)] border border-[#232f43]  text-center">
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl border border-blue-500/30 flex items-center justify-center">
                  <AlertCircle className="text-blue-400 w-6 h-6" />
                </div>
              </div>
              <div className="whitespace-pre-wrap text-white font-medium text-sm mb-6">
                {alertMessage}
              </div>
              <button
                onClick={() => setAlertMessage(null)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20 transition-all text-sm w-full font-mono"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
