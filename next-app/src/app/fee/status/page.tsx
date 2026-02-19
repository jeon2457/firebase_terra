"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

type Member = {
    _id: string;
    name: string;
};

type PassMap = {
    [memberId: string]: {
        [month: number]: number;
    };
};

export default function FeeStatusPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [year, setYear] = useState(new Date().getFullYear());
    const [members, setMembers] = useState<Member[]>([]);
    const [passMap, setPassMap] = useState<PassMap>({});
    const [monthlyFees, setMonthlyFees] = useState<{ [month: number]: number }>({});
    const [currentMonthFee, setCurrentMonthFee] = useState(20000);
    const [lastApplyYear, setLastApplyYear] = useState(new Date().getFullYear());
    const [lastApplyMonth, setLastApplyMonth] = useState(1);
    const [loading, setLoading] = useState(true);

    const [showFeeModal, setShowFeeModal] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [feeYear, setFeeYear] = useState(new Date().getFullYear());
    const [feeMonth, setFeeMonth] = useState(new Date().getMonth() + 1);
    const [feeAmount, setFeeAmount] = useState(20000);

    const [showPopup, setShowPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [currentTarget, setCurrentTarget] = useState<any>(null);

    const [checkedMembers, setCheckedMembers] = useState<string[]>([]);
    const [checkAll, setCheckAll] = useState(false);

    const isAdmin = (session?.user as any)?.user_level >= 10;
    const todayMonth = new Date().getMonth() + 1;
    const todayYear = new Date().getFullYear();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchData();
        }
    }, [status, year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/fee/status?year=${year}`);
            if (res.data.success) {
                setMembers(res.data.members);
                setPassMap(res.data.passMap);
                setMonthlyFees(res.data.monthlyFees);
                setCurrentMonthFee(res.data.currentMonthFee);
                setLastApplyYear(res.data.lastApplyYear);
                setLastApplyMonth(res.data.lastApplyMonth);
                setFeeAmount(res.data.currentMonthFee);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            alert('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const showChangePopup = (e: React.MouseEvent, memberId: string, month: number, paid: number) => {
        if (!isAdmin) return;
        e.stopPropagation();

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        setPopupPosition({
            top: rect.bottom + scrollTop + 8,
            left: rect.left + scrollLeft - 80
        });
        setCurrentTarget({ memberId, month, paid });
        setShowPopup(true);
    };

    const confirmChange = async () => {
        if (!currentTarget) return;

        const { memberId, month, paid } = currentTarget;
        const newPaid = paid === 1 ? 0 : 1;

        try {
            const res = await axios.post('/api/fee/update', {
                memberId,
                year,
                month,
                paid: newPaid
            });

            if (res.data.success) {
                setPassMap(prev => ({
                    ...prev,
                    [memberId]: {
                        ...prev[memberId],
                        [month]: newPaid
                    }
                }));
            }
        } catch (error) {
            alert('업데이트 실패');
        }

        setShowPopup(false);
        setCurrentTarget(null);
    };

    const saveFee = async () => {
        try {
            const res = await axios.post('/api/fee/update-amount', {
                year: feeYear,
                month: feeMonth,
                amount: feeAmount
            });

            if (res.data.success) {
                alert('저장되었습니다.');
                setShowFeeModal(false);
                fetchData();
            } else {
                alert('저장에 실패했습니다.');
            }
        } catch (error) {
            alert('오류가 발생했습니다.');
        }
    };

    const calculateTotals = (memberId: string) => {
        let totalPaid = 0;
        let unpaidTotal = 0;

        for (let m = 1; m <= 12; m++) {
            const paid = passMap[memberId]?.[m] || 0;
            const monthFee = monthlyFees[m] || 20000;

            if (paid) {
                totalPaid += monthFee;
            } else {
                if (year < todayYear || (year === todayYear && m <= todayMonth)) {
                    unpaidTotal += monthFee;
                }
            }
        }

        return { totalPaid, unpaidTotal };
    };

    const handleCheckAll = () => {
        if (checkAll) {
            setCheckedMembers([]);
        } else {
            setCheckedMembers(members.map(m => m._id));
        }
        setCheckAll(!checkAll);
    };

    const handleCheckMember = (memberId: string) => {
        if (checkedMembers.includes(memberId)) {
            setCheckedMembers(checkedMembers.filter(id => id !== memberId));
        } else {
            setCheckedMembers([...checkedMembers, memberId]);
        }
    };

    const goMemberCheck = () => {
        if (checkedMembers.length === 0) {
            alert('회원을 선택하세요.');
            return;
        }
        const ids = checkedMembers.join(',');
        router.push(`/account/member-check?members=${ids}&year=${year}`);
    };

    if (status === "loading" || loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    const years = [0, 1, 2, 3].map(i => new Date().getFullYear() - i);

    return (
        <div className="container-fluid py-4" style={{ background: "#f9f9fa", minHeight: "100vh" }}>
            <style jsx>{`
                body { background: #f9f9f9; margin: 20px 5px 10px 5px; }
                
                .admin-info {
                    text-align: right;
                    font-size: 15px;
                    color: #6c757d;
                    margin-bottom: 20px;
                }
                
                .header-box {
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    align-items: center;
                    margin-bottom: 10px;
                    gap: 10px;
                }
                
                .title-btn {
                    background: #1976d2;
                    color: #fff;
                    padding: 14px 28px;
                    border-radius: 30px;
                    font-weight: 800;
                    font-size: 18px;
                    white-space: nowrap;
                }
                
                .fee-btn {
                    background: #eee;
                    padding: 8px 15px;
                    border-radius: 6px;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .fee-btn:hover { background: #ddd; }
                
                .help-btn {
                    background: #fff3e0;
                    color: #f57c00;
                    border: 1px solid #ffe0b2;
                    padding: 8px 15px;
                    border-radius: 15px;
                    font-weight: bold;
                    cursor: pointer;
                    white-space: nowrap;
                }
                
                .help-btn:hover { background: #ffe0b2; }
                
                .ox {
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 18px;
                    padding: 8px;
                    display: inline-block;
                    min-width: 32px;
                }
                
                .ox.o { color: green; }
                .ox.x { color: red; }
                .ox.no-access { cursor: default; opacity: 0.8; }
                
                .status-popup {
                    position: absolute;
                    background: white;
                    border: 1px solid #999;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    padding: 12px;
                    z-index: 2000;
                    width: 180px;
                    text-align: center;
                }
                
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                .modal-content-custom {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 400px;
                }
                
                .total-members-info {
                    font-size: 14px;
                    color: #555;
                    font-weight: 700;
                    margin-bottom: 8px;
                    margin-left: 5px;
                }

                /* [추가] 안내 모달 전용 스타일 */
                .guide-legend {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 15px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 14px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .legend-o { background: #e8f5e9; border: 1px solid #c8e6c9; color: #2e7d32; }
                .legend-x { background: #ffebee; border: 1px solid #ffcdd2; color: #c62828; }
                
                .guide-desc-box {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 15px;
                    font-size: 13px;
                    color: #444;
                    margin-top: 15px;
                    text-align: left;
                }
                .guide-desc-box ul { margin: 0; padding-left: 20px; }
                .guide-desc-box li { margin-bottom: 5px; }

                /* 모바일 반응형 */
                @media (max-width: 768px) {
                    body { margin: 10px 3px; }
                    
                    .header-box {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        margin-bottom: 15px;
                        align-items: stretch;
                    }
                    
                    /* 제목을 맨 위에 중앙정렬 */
                    .header-box > div:nth-child(2) {
                        order: 1;
                        display: flex;
                        justify-content: center;
                    }
                    
                    /* 연도 선택을 두 번째로 */
                    .header-box > div:nth-child(1) {
                        order: 2;
                        display: flex;
                        justify-content: flex-start;
                    }
                    
                    /* 보는법, 월회비를 세 번째로 */
                    .header-box > div:nth-child(3) {
                        order: 3;
                        display: flex;
                        justify-content: flex-end;
                        gap: 8px;
                    }
                    
                    .admin-info {
                        text-align: right;
                        font-size: 12px;
                        margin-bottom: 20px;
                    }
                    
                    .help-btn {
                        padding: 6px 10px;
                        font-size: 12px;
                        border-radius: 12px;
                    }
                    
                    .title-btn {
                        font-size: 16px;
                        padding: 10px 20px;
                        text-align: center;
                        width: 100%;
                    }
                    
                    .fee-btn {
                        font-size: 11px;
                        padding: 6px 10px;
                        white-space: nowrap;
                    }
                    
                    /* 모달창 모바일 크기 조정 */
                    .modal-content-custom {
                        width: 95%;
                        max-width: 350px;
                        padding: 20px;
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                    
                    .modal-content-custom h5 {
                        font-size: 16px;
                    }
                    
                    .modal-content-custom .form-label {
                        font-size: 13px;
                    }
                    
                    .modal-content-custom .form-control,
                    .modal-content-custom .form-select {
                        font-size: 13px;
                    }
                    
                    /* 테이블을 카드 형식으로 변경 */
                    .list-table { display: block; border: none; }
                    .list-table thead { display: block; margin-bottom: 10px; }
                    .list-table tbody { display: block; }
                    .list-table thead tr:nth-child(2) { display: none !important; }
                    
                    /* 관리자 모드 */
                    .list-table.mode-admin thead tr:first-child,
                    .list-table.mode-admin tbody tr {
                        display: grid;
                        grid-template-columns: 35px 70px repeat(6, 1fr);
                        grid-template-rows: auto auto;
                        gap: 1px;
                        background: white;
                    }
                    
                    .list-table.mode-admin thead tr:first-child {
                        background: #f8f9fa;
                    }
                    
                    .list-table.mode-admin tbody tr {
                        grid-template-rows: auto auto auto;
                        padding: 10px 5px;
                        margin-bottom: 12px;
                        border-radius: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.08);
                        border: 1px solid #e0e0e0;
                    }
                    
                    /* 체크박스 */
                    .list-table.mode-admin thead th:nth-child(1) {
                        grid-column: 1;
                        grid-row: 1/3;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    /* 이름 */
                    .list-table.mode-admin thead th:nth-child(2) {
                        grid-column: 2;
                        grid-row: 1/3;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 13px;
                        font-weight: 700;
                    }
                    
                    /* 상반기 */
                    .list-table.mode-admin thead th:nth-child(3) {
                        grid-column: 3/9;
                        grid-row: 1;
                        background: #e3f2fd;
                        border-radius: 4px;
                        padding: 4px;
                        font-size: 12px;
                        font-weight: 700;
                        color: #1976d2;
                    }
                    
                    /* 하반기 */
                    .list-table.mode-admin thead th:nth-child(4) {
                        grid-column: 3/9;
                        grid-row: 2;
                        background: #fff3e0;
                        border-radius: 4px;
                        padding: 4px;
                        font-size: 12px;
                        font-weight: 700;
                        color: #f57c00;
                        display: block !important;
                    }
                    
                    /* 입금합계, 미납금 헤더 숨김 */
                    .list-table.mode-admin thead th:nth-last-child(2),
                    .list-table.mode-admin thead th:nth-last-child(1) {
                        display: none !important;
                    }
                    
                    /* Body - 체크박스 */
                    .list-table.mode-admin tbody td:nth-child(1) {
                        grid-column: 1;
                        grid-row: 1/4;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    /* Body - 이름 */
                    .list-table.mode-admin tbody td:nth-child(2) {
                        grid-column: 2;
                        grid-row: 1/4;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 700;
                        font-size: 14px;
                        color: #333;
                        word-break: keep-all;
                    }
                    
                    /* 1~6월 (상반기) */
                    .list-table.mode-admin tbody td:nth-child(3) { grid-column: 3; grid-row: 1; background: #f0f8ff; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-admin tbody td:nth-child(4) { grid-column: 4; grid-row: 1; background: #f0f8ff; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-admin tbody td:nth-child(5) { grid-column: 5; grid-row: 1; background: #f0f8ff; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-admin tbody td:nth-child(6) { grid-column: 6; grid-row: 1; background: #f0f8ff; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-admin tbody td:nth-child(7) { grid-column: 7; grid-row: 1; background: #f0f8ff; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-admin tbody td:nth-child(8) { grid-column: 8; grid-row: 1; background: #f0f8ff; border-radius: 4px; padding: 6px 2px; }
                    
                    /* 7~12월 (하반기) */
                    .list-table.mode-admin tbody td:nth-child(9) { grid-column: 3; grid-row: 2; background: #fff8f0; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-admin tbody td:nth-child(10) { grid-column: 4; grid-row: 2; background: #fff8f0; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-admin tbody td:nth-child(11) { grid-column: 5; grid-row: 2; background: #fff8f0; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-admin tbody td:nth-child(12) { grid-column: 6; grid-row: 2; background: #fff8f0; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-admin tbody td:nth-child(13) { grid-column: 7; grid-row: 2; background: #fff8f0; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-admin tbody td:nth-child(14) { grid-column: 8; grid-row: 2; background: #fff8f0; border-radius: 4px; padding: 6px 2px; }
                    
                    /* 입금합계 */
                    .list-table.mode-admin tbody td:nth-child(15) {
                        grid-column: 3/6;
                        grid-row: 3;
                        background: #e8f5e9;
                        border-radius: 4px;
                        padding: 8px;
                        font-weight: 700;
                        font-size: 13px;
                        color: #2e7d32;
                    }
                    .list-table.mode-admin tbody td:nth-child(15)::before {
                        content: '입금: ';
                        font-weight: 500;
                        color: #666;
                    }
                    
                    /* 미납금 */
                    .list-table.mode-admin tbody td:nth-child(16) {
                        grid-column: 6/9;
                        grid-row: 3;
                        background: #ffebee;
                        border-radius: 4px;
                        padding: 8px;
                        font-weight: 700;
                        font-size: 13px;
                        color: #c62828;
                    }
                    .list-table.mode-admin tbody td:nth-child(16)::before {
                        content: '미납: ';
                        font-weight: 500;
                        color: #666;
                    }
                    
                    /* 일반 모드 (게스트) */
                    .list-table.mode-guest thead tr:first-child,
                    .list-table.mode-guest tbody tr {
                        display: grid;
                        grid-template-columns: 80px repeat(6, 1fr);
                        grid-template-rows: auto auto;
                        gap: 1px;
                        background: white;
                    }
                    
                    .list-table.mode-guest thead tr:first-child {
                        background: #f8f9fa;
                    }
                    
                    .list-table.mode-guest tbody tr {
                        grid-template-rows: auto auto auto;
                        padding: 10px 5px;
                        margin-bottom: 12px;
                        border-radius: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.08);
                        border: 1px solid #e0e0e0;
                    }
                    
                    /* 입금합계, 미납금 헤더 숨김 */
                    .list-table.mode-guest thead th:nth-last-child(2),
                    .list-table.mode-guest thead th:nth-last-child(1) {
                        display: none !important;
                    }
                    
                    .list-table.mode-guest thead th:nth-child(1) {
                        grid-column: 1;
                        grid-row: 1/3;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 13px;
                        font-weight: 700;
                    }
                    
                    .list-table.mode-guest thead th:nth-child(2) {
                        grid-column: 2/8;
                        grid-row: 1;
                        background: #e3f2fd;
                        border-radius: 4px;
                        padding: 4px;
                        font-size: 12px;
                        font-weight: 700;
                        color: #1976d2;
                    }
                    
                    .list-table.mode-guest thead th:nth-child(3) {
                        grid-column: 2/8;
                        grid-row: 2;
                        background: #fff3e0;
                        border-radius: 4px;
                        padding: 4px;
                        font-size: 12px;
                        font-weight: 700;
                        color: #f57c00;
                        display: block !important;
                    }
                    
                    .list-table.mode-guest tbody td:nth-child(1) {
                        grid-column: 1;
                        grid-row: 1/4;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 700;
                        font-size: 14px;
                        color: #333;
                        word-break: keep-all;
                    }
                    
                    .list-table.mode-guest tbody td:nth-child(2) { grid-column: 2; grid-row: 1; background: #f0f8ff; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-guest tbody td:nth-child(3) { grid-column: 3; grid-row: 1; background: #f0f8ff; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-guest tbody td:nth-child(4) { grid-column: 4; grid-row: 1; background: #f0f8ff; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-guest tbody td:nth-child(5) { grid-column: 5; grid-row: 1; background: #f0f8ff; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-guest tbody td:nth-child(6) { grid-column: 6; grid-row: 1; background: #f0f8ff; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-guest tbody td:nth-child(7) { grid-column: 7; grid-row: 1; background: #f0f8ff; border-radius: 4px; padding: 6px 2px; }
                    
                    .list-table.mode-guest tbody td:nth-child(8) { grid-column: 2; grid-row: 2; background: #fff8f0; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-guest tbody td:nth-child(9) { grid-column: 3; grid-row: 2; background: #fff8f0; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-guest tbody td:nth-child(10) { grid-column: 4; grid-row: 2; background: #fff8f0; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-guest tbody td:nth-child(11) { grid-column: 5; grid-row: 2; background: #fff8f0; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-guest tbody td:nth-child(12) { grid-column: 6; grid-row: 2; background: #fff8f0; border-radius: 4px; padding: 6px 2px; }
                    .list-table.mode-guest tbody td:nth-child(13) { grid-column: 7; grid-row: 2; background: #fff8f0; border-radius: 4px; padding: 6px 2px; }
                    
                    .list-table.mode-guest tbody td:nth-child(14) {
                        grid-column: 2/5;
                        grid-row: 3;
                        background: #e8f5e9;
                        border-radius: 4px;
                        padding: 8px;
                        font-weight: 700;
                        font-size: 13px;
                        color: #2e7d32;
                    }
                    .list-table.mode-guest tbody td:nth-child(14)::before {
                        content: '입금: ';
                        font-weight: 500;
                        color: #666;
                    }
                    
                    .list-table.mode-guest tbody td:nth-child(15) {
                        grid-column: 5/8;
                        grid-row: 3;
                        background: #ffebee;
                        border-radius: 4px;
                        padding: 8px;
                        font-weight: 700;
                        font-size: 13px;
                        color: #c62828;
                    }
                    .list-table.mode-guest tbody td:nth-child(15)::before {
                        content: '미납: ';
                        font-weight: 500;
                        color: #666;
                    }
                    
                    .ox {
                        font-size: 15px;
                        padding: 4px;
                        min-width: 28px;
                    }

                    /* [추가] 모바일 안내 모달 내 폰트 조정 */
                    .legend-item { padding: 8px 12px; font-size: 13px; }
                    .guide-desc-box { font-size: 12px; padding: 12px; }
                }
            `}</style>

            <div className="admin-info">
                {isAdmin ? (
                    <>
                        <span className="badge bg-primary">관리자 모드</span>
                        👤 관리자: <strong>{(session?.user as any)?.user_id || 'terraone'}</strong> (Level {(session?.user as any)?.user_level})
                    </>
                ) : (
                    <>
                        <span className="badge bg-dark">전용 열람 모드</span>
                        👤 <strong>회원</strong> (데이터 조회 가능)
                    </>
                )}
            </div>

            <div className="header-box">
                <div>
                    <div className="dropdown">
                        <button className="btn btn-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                            {year}년 선택
                        </button>
                        <ul className="dropdown-menu">
                            {years.map(y => (
                                <li key={y}>
                                    <button className={`dropdown-item ${y === year ? 'active' : ''}`} onClick={() => setYear(y)}>
                                        {y}년
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="text-center">
                    <div className="title-btn">{year}년도 회비납부 현황</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button className="help-btn" onClick={() => setShowGuideModal(true)}>❓ 보는법</button>
                    <div className={isAdmin ? 'fee-btn' : 'fee-btn'} onClick={() => isAdmin && setShowFeeModal(true)} style={{ cursor: isAdmin ? 'pointer' : 'default' }}>
                        월회비: {currentMonthFee.toLocaleString()}원
                    </div>
                </div>
            </div>

            <div className="total-members-info">
                전체 회원 수: {members.length}명
            </div>

            {/* 메인 테이블 렌더링 영역 */}
            {members.length === 0 ? (
                <div className="alert alert-warning text-center">
                    회원 데이터가 없습니다. MongoDB에 회원을 추가해주세요.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className={`table table-bordered text-center align-middle list-table ${isAdmin ? 'mode-admin' : 'mode-guest'}`}>
                        <thead>
                            <tr>
                                {isAdmin && <th rowSpan={2} style={{ width: '40px' }}><input type="checkbox" checked={checkAll} onChange={handleCheckAll} /></th>}
                                <th rowSpan={2}>이름</th>
                                <th colSpan={6} className="month-group">상반기</th>
                                <th colSpan={6} className="month-group second-half">하반기</th>
                                <th rowSpan={2}>입금합계</th>
                                <th rowSpan={2}>미납금</th>
                            </tr>
                            <tr>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                    <th key={m} className={`month-col month-${m}`}>{m}월</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(member => {
                                const { totalPaid, unpaidTotal } = calculateTotals(member._id);
                                return (
                                    <tr key={member._id} data-id={member._id}>
                                        {isAdmin && (
                                            <td>
                                                <input 
                                                    type="checkbox" 
                                                    className="member-check"
                                                    checked={checkedMembers.includes(member._id)}
                                                    onChange={() => handleCheckMember(member._id)}
                                                />
                                            </td>
                                        )}
                                        <td>{member.name}</td>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
                                            const paid = passMap[member._id]?.[m] || 0;
                                            return (
                                                <td key={m}>
                                                    <span 
                                                        className={`ox ${paid ? 'o' : 'x'} ${!isAdmin ? 'no-access' : ''}`}
                                                        data-month={m}
                                                        data-paid={paid}
                                                        onClick={(e) => isAdmin && showChangePopup(e, member._id, m, paid)}
                                                    >
                                                        {paid ? 'O' : 'X'}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                        <td>{totalPaid.toLocaleString()}</td>
                                        <td>{unpaidTotal.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {isAdmin && members.length > 0 && (
                <div className="d-flex justify-content-center gap-2 mt-4">
                    <button className="btn btn-primary btn-lg" onClick={goMemberCheck}>회원 체크하기</button>
                </div>
            )}

            <div className="d-flex justify-content-center mt-3 mb-4">
                <button className="btn btn-secondary btn-lg" onClick={() => router.push('/dashboard')}>⏪ 돌아가기</button>
            </div>

            {/* 납부 상태 변경 팝업 */}
            {showPopup && (
                <div className="status-popup" style={{ top: popupPosition.top, left: popupPosition.left }}>
                    <div style={{ marginBottom: '8px' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '13px', margin: 0 }}>
                            {currentTarget?.month}월 선택 -
                        </p>
                        <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>
                            {currentTarget?.paid === 1 ? '미납(X)으로 변경?' : '납부(O)로 변경?'}
                        </p>
                    </div>
                    <div className="d-flex gap-2 justify-content-center">
                        <button className="btn btn-primary btn-sm" onClick={confirmChange}>변경</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowPopup(false)}>취소</button>
                    </div>
                </div>
            )}

            {/* 월회비 변경 모달 */}
            {showFeeModal && (
                <div className="modal-overlay" onClick={() => setShowFeeModal(false)}>
                    <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                        <h5>💰 월회비 변경</h5>
                        <div className="mb-3">
                            <label className="form-label">적용 연도/월</label>
                            <div className="d-flex gap-2">
                                <input type="number" className="form-control" value={feeYear} onChange={(e) => setFeeYear(parseInt(e.target.value))} />
                                <select className="form-select" value={feeMonth} onChange={(e) => setFeeMonth(parseInt(e.target.value))}>
                                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                                        <option key={m} value={m}>{m}월</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">변경할 월회비 (원)</label>
                            <input type="number" className="form-control" value={feeAmount} onChange={(e) => setFeeAmount(parseInt(e.target.value))} />
                        </div>
                        <div style={{ background: '#fff5f8', border: '1px solid #ffe3e3', padding: '12px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
                            <p style={{ color: '#d63384', fontWeight: 700, margin: 0, fontSize: '14px' }}>
                                👉 {lastApplyYear}년 {lastApplyMonth}월부터 월회비가 {currentMonthFee.toLocaleString()}원으로 변경되었습니다.
                            </p>
                        </div>
                        <div className="d-flex gap-2 justify-content-end">
                            <button className="btn btn-secondary" onClick={() => setShowFeeModal(false)}>취소</button>
                            <button className="btn btn-primary" onClick={saveFee}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* [수정됨] 안내 모달: 예시와 스타일이 강화됨 */}
            {/* ======================================================== */}
            {showGuideModal && (
                <div className="modal-overlay" onClick={() => setShowGuideModal(false)}>
                    <div className="modal-content-custom" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
                        <h5 style={{ fontWeight: 800, textAlign: 'center', marginBottom: '20px', color: '#1976d2' }}>
                            📋 현황표 보는법
                        </h5>
                        
                        {/* 1. 범례 (O/X) */}
                        <div className="guide-legend">
                            <div className="legend-item legend-o">
                                <span style={{ fontSize: '18px' }}>O</span> 납부 완료
                            </div>
                            <div className="legend-item legend-x">
                                <span style={{ fontSize: '18px' }}>X</span> 미납
                            </div>
                        </div>

                        {/* 2. 예시 테이블 */}
                        <div style={{ marginBottom: '20px' }}>
                            <h6 style={{ fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '8px' }}>👇 표 예시</h6>
                            <table className="table table-bordered table-sm text-center mb-0" style={{ fontSize: '13px' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th>이름</th>
                                        <th>1월</th>
                                        <th>2월</th>
                                        <th>...</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>홍길동</td>
                                        <td style={{ color: 'green', fontWeight: 'bold' }}>O</td>
                                        <td style={{ color: 'red', fontWeight: 'bold' }}>X</td>
                                        <td style={{ color: '#999' }}>...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 3. 상세 설명 */}
                        <div className="guide-desc-box">
                            <ul>
                                <li>
                                    <strong>입금합계</strong> : {year}년도에 납부한 총 금액
                                </li>
                                <li style={{ marginTop: '5px' }}>
                                    <strong>미납금</strong> : 오늘({todayMonth}월)까지 안 낸 금액<br/>
                                    <span style={{ fontSize: '11px', color: '#d63384' }}>* 미래의 회비는 미납금에 포함되지 않습니다.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="text-center mt-4">
                            <button className="btn btn-dark w-100" onClick={() => setShowGuideModal(false)}>확인 및 닫기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 팝업 외부 클릭 시 닫기 */}
            {showPopup && <div style={{ position: 'fixed', inset: 0, zIndex: 1999 }} onClick={() => setShowPopup(false)} />}
        </div>
    );
}