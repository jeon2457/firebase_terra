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
            console.log('API Response:', res.data); // 디버깅용
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
        <div className="container py-4" style={{ background: "#f9f9fa", minHeight: "100vh" }}>
            <style jsx>{`
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
                }
                .fee-btn {
                    background: #eee;
                    padding: 8px 15px;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .help-btn {
                    background: #fff3e0;
                    color: #f57c00;
                    border: 1px solid #ffe0b2;
                    padding: 8px 15px;
                    border-radius: 15px;
                    font-weight: bold;
                }
                .ox {
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 18px;
                    padding: 8px;
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
                }
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .modal-content-custom {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 400px;
                }
            `}</style>

            <div className="admin-info">
                {isAdmin ? (
                    <>
                        <span className="badge bg-primary">관리자 모드</span>
                        👤 관리자: <strong>{(session?.user as any)?.user_id || 'Admin'}</strong> (Level {(session?.user as any)?.user_level})
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
                <div className="d-flex gap-2">
                    <button className="help-btn" onClick={() => setShowGuideModal(true)}>❓ 보는법</button>
                    <div className={isAdmin ? 'fee-btn' : 'fee-btn no-access'} onClick={() => isAdmin && setShowFeeModal(true)}>
                        월회비: {currentMonthFee.toLocaleString()}원
                    </div>
                </div>
            </div>

            <div className="mb-2" style={{ fontSize: '14px', fontWeight: 700, color: '#555' }}>
                전체 회원 수: {members.length}명
            </div>

            {members.length === 0 ? (
                <div className="alert alert-warning text-center">
                    회원 데이터가 없습니다. MongoDB에 회원을 추가해주세요.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered text-center align-middle">
                        <thead>
                            <tr>
                                {isAdmin && <th rowSpan={2} style={{ width: '40px' }}><input type="checkbox" checked={checkAll} onChange={handleCheckAll} /></th>}
                                <th rowSpan={2}>이름</th>
                                <th colSpan={6}>상반기</th>
                                <th colSpan={6}>하반기</th>
                                <th rowSpan={2}>입금합계</th>
                                <th rowSpan={2}>미납금</th>
                            </tr>
                            <tr>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                    <th key={m}>{m}월</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(member => {
                                const { totalPaid, unpaidTotal } = calculateTotals(member._id);
                                return (
                                    <tr key={member._id}>
                                        {isAdmin && (
                                            <td>
                                                <input 
                                                    type="checkbox" 
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
                    <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '10px' }}>
                        {currentTarget?.month}월 - {currentTarget?.paid === 1 ? '미납(X)으로 변경?' : '납부(O)로 변경?'}
                    </p>
                    <div className="d-flex gap-2">
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
                        <div style={{ background: '#fff5f8', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
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

            {/* 안내 모달 */}
            {showGuideModal && (
                <div className="modal-overlay" onClick={() => setShowGuideModal(false)}>
                    <div className="modal-content-custom" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
                        <h5 style={{ fontWeight: 800, textAlign: 'center', marginBottom: '15px', color: '#1976d2' }}>
                            📋 회비납부 현황 보는법 안내
                        </h5>
                        <p style={{ fontSize: '14px', textAlign: 'center', color: '#666', marginBottom: '15px' }}>
                            월별 납부 현황이 표시됩니다.<br />
                            <span style={{ color: 'green', fontWeight: 'bold' }}>O (납부)</span> / <span style={{ color: 'red', fontWeight: 'bold' }}>X (미납)</span>
                        </p>
                        <div className="text-center mt-4">
                            <button className="btn btn-dark w-100" onClick={() => setShowGuideModal(false)}>확인 및 닫기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 팝업 외부 클릭 시 닫기 */}
            {showPopup && <div style={{ position: 'fixed', inset: 0, zIndex: 1999 }} onClick={() => setShowPopup(false)} />}

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        </div>
    );
}
