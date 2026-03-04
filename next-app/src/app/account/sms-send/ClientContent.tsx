"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

type Member = {
    _id: string;
    name: string;
    tel?: string;
};

type UnpaidInfo = {
    name: string;
    tel: string;
    months: string;
    total: number;
};

interface ClientContentProps {
    memberIds: string;
    year: number;
}

export default function ClientContent({ memberIds, year }: ClientContentProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [members, setMembers] = useState<Member[]>([]);
    const [unpaidInfo, setUnpaidInfo] = useState<{ [key: string]: UnpaidInfo }>({});
    const [loading, setLoading] = useState(true);
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [smsMessage, setSmsMessage] = useState("");

    const todayYear = new Date().getFullYear();
    const todayMonth = new Date().getMonth() + 1;

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchData();
        }
    }, [status, memberIds, year]);

    const fetchData = async () => {
        if (!memberIds || memberIds.trim() === '') {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // 1. 회원 정보 가져오기
            console.log('=== SMS Send Debug ===');
            console.log('Fetching members with IDs:', memberIds);
            console.log('Year:', year);

            const membersRes = await axios.get(`/api/account/member-check?members=${encodeURIComponent(memberIds)}&year=${year}`);

            console.log('API Response:', membersRes.data);
            console.log('Members data:', membersRes.data.members);

            if (membersRes.data.success) {
                const membersData = membersRes.data.members;
                console.log('Members with phone numbers:', membersData.map((m: any) => ({ name: m.name, tel: m.tel })));
                setMembers(membersData);

                console.log('Members data after setting state:', membersData);
                console.log('Sample member phone numbers:', membersData.slice(0, 3).map((m: any) => ({ name: m.name, tel: m.tel })));

                // 2. 미납 정보 계산
                const unpaidData: { [key: string]: UnpaidInfo } = {};
                const passMap = membersRes.data.passMap;
                const monthlyFees = membersRes.data.monthlyFees;

                membersData.forEach((member: Member) => {
                    const unpaidMonths: string[] = [];
                    let unpaidTotal = 0;

                    for (let m = 1; m <= 12; m++) {
                        // 미래 월은 제외
                        if (year === todayYear && m > todayMonth) continue;
                        if (year > todayYear) continue;

                        const isPaid = passMap[member._id]?.[m] === 1;

                        if (!isPaid) {
                            const fee = monthlyFees[m] || 20000;
                            unpaidMonths.push(`${m}월`);
                            unpaidTotal += fee;
                        }
                    }

                    unpaidData[member._id] = {
                        name: member.name,
                        tel: member.tel || '',
                        months: unpaidMonths.length > 0 ? unpaidMonths.join(',') : '없음',
                        total: unpaidTotal
                    };
                });

                setUnpaidInfo(unpaidData);

                // 3. 기본적으로 미납자 선택
                const defaultSelected = new Set<string>();
                membersData.forEach((member: Member) => {
                    if (unpaidData[member._id].total > 0) {
                        defaultSelected.add(member._id);
                    }
                });
                setSelectedMembers(defaultSelected);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            alert('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const updateMessage = () => {
        if (selectedMembers.size === 0) {
            setSmsMessage("");
            return;
        }

        const memberDetails = Array.from(selectedMembers).map(memberId => {
            const member = members.find(m => m._id === memberId);
            const info = unpaidInfo[memberId];

            if (!member || !info || info.total === 0) return null;

            return `[📩 직지황악회 발송] 미납금 안내문자 입니다.\n\n 💞[${member.name}]님이 ${year}년도 [${info.months}]분\n월회비(합계:${info.total.toLocaleString()}원)를 아직 미납중입니다.`;
        }).filter(msg => msg !== null);

        if (memberDetails.length === 0) {
            setSmsMessage("선택하신 회원들은 미납 내역이 없습니다.");
            return;
        }

        const messageBody = memberDetails.join('\n\n');

        const footer = `\n이른 시일 내에 입금해주시면 감사하겠습니다.\n\n입금은행: ㅇㅇ은행\n예금주: ㅇㅇㅇ\n계좌번호: xxx-xxxx-xxxx-xxx`;

        setSmsMessage(messageBody + "\n" + footer);
    };

    useEffect(() => {
        updateMessage();
    }, [selectedMembers]);

    const toggleMember = (memberId: string) => {
        const newSelected = new Set(selectedMembers);
        if (newSelected.has(memberId)) {
            newSelected.delete(memberId);
        } else {
            newSelected.add(memberId);
        }
        setSelectedMembers(newSelected);
    };

    const toggleAll = () => {
        if (members.length === 0) return;

        if (selectedMembers.size === members.length) {
            setSelectedMembers(new Set());
        } else {
            setSelectedMembers(new Set(members.map(m => m._id)));
        }
    };

    const sendSMS = () => {
        if (selectedMembers.size === 0) {
            alert('문자를 보낼 회원을 선택하세요.');
            return;
        }

        const msg = smsMessage.trim();
        if (!msg) {
            alert('문자 내용을 입력하세요.');
            return;
        }

        const numbers = Array.from(selectedMembers)
            .map(memberId => {
                const member = members.find(m => m._id === memberId);
                return member?.tel?.replace(/[^0-9]/g, '') || '';
            })
            .filter(num => num.length > 0);

        if (numbers.length === 0) {
            alert('유효한 전화번호가 없습니다.');
            return;
        }

        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const smsLink = isIOS
            ? `sms:${numbers.join(',')}&body=${encodeURIComponent(msg)}`
            : `sms:${numbers.join(',')}?body=${encodeURIComponent(msg)}`;

        window.location.href = smsLink;
    };

    if (status === "loading" || loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className="container-fluid py-4" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh" }}>
            <style jsx global>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Noto Sans KR', sans-serif;
                }

                .main-container {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .header-section {
                    background: white;
                    padding: 40px 20px 30px;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    border-radius: 16px 16px 0 0;
                }

                .header-section h4 {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #667eea;
                    margin: 0;
                }

                .content-section {
                    padding: 20px 15px;
                }

                .card {
                    border-radius: 16px;
                    border: none;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    margin-bottom: 20px;
                    overflow: hidden;
                }

                .card-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-weight: 700;
                    font-size: 1.1rem;
                    padding: 15px 20px;
                }

                .card-body {
                    padding: 20px;
                    background: white;
                }

                .form-check {
                    padding: 12px 15px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    margin-bottom: 10px !important;
                }

                .form-check-input {
                    width: 22px;
                    height: 22px;
                    margin-top: 0;
                    cursor: pointer;
                    border: 2px solid #667eea;
                }

                .form-check-input:checked {
                    background-color: #667eea;
                    border-color: #667eea;
                }

                .form-check-label {
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 500;
                    color: #333;
                    margin-left: 8px;
                }

                textarea.form-control {
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 15px;
                    font-size: 1rem;
                    line-height: 1.7;
                    min-height: 280px;
                }

                textarea.form-control:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
                }

                .button-section {
                    padding: 20px 15px 30px;
                    text-align: center;
                }

                .btn {
                    border-radius: 12px;
                    padding: 14px 32px;
                    font-size: 1.05rem;
                    font-weight: 700;
                    margin: 5px;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                }

                .btn-secondary {
                    background: #6c757d;
                    color: white;
                    border: none;
                }

                @media (max-width: 768px) {
                    .header-section {
                        padding: 35px 15px 25px;
                    }

                    .btn {
                        width: 100%;
                        max-width: 300px;
                        margin: 5px 0;
                    }
                }
            `}</style>

            <div className="main-container">
                <div className="header-section">
                    <h4>📩 미납자 문자 발송</h4>
                </div>

                <div className="content-section">
                    {/* 회원 선택 */}
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <span>문자 발송 대상 선택</span>
                            {members.length > 0 && (
                                <div className="form-check mb-0 bg-transparent p-0 d-flex align-items-center" style={{ minHeight: 'auto' }}>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="selectAll"
                                        checked={selectedMembers.size === members.length}
                                        onChange={toggleAll}
                                        style={{ width: '20px', height: '20px', margin: 0 }}
                                    />
                                    <label className="form-check-label text-white ms-2" htmlFor="selectAll" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                                        전체 선택
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="card-body">
                            {members.length === 0 ? (
                                <div className="alert alert-warning text-center">
                                    선택된 회원이 없습니다.
                                </div>
                            ) : (
                                members.map(member => {
                                    const info = unpaidInfo[member._id];
                                    const isSelected = selectedMembers.has(member._id);

                                    return (
                                        <div key={member._id} className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleMember(member._id)}
                                                id={`m${member._id}`}
                                            />
                                            <label className="form-check-label" htmlFor={`m${member._id}`}>
                                                {member.name} ({member.tel || '연락처 없음'})
                                                <br />
                                                <small className="text-danger">
                                                    미납: {info.total.toLocaleString()}원 ({info.months})
                                                </small>
                                            </label>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* 문자 내용 */}
                    <div className="card">
                        <div className="card-header">문자 내용</div>
                        <div className="card-body">
                            <textarea
                                className="form-control"
                                value={smsMessage}
                                onChange={(e) => setSmsMessage(e.target.value)}
                                placeholder="내용이 자동으로 생성됩니다."
                            />
                        </div>
                    </div>
                </div>

                <div className="button-section">
                    <button type="button" className="btn btn-primary" onClick={sendSMS}>
                        📤 문자 보내기
                    </button>
                    <button className="btn btn-secondary" onClick={() => router.back()}>
                        ⏪ 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
}
