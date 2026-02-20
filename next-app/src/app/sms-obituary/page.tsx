"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface Member {
    _id: string; // MongoDB ObjectId
    id: string;
    name: string;
    tel: string;
    addr?: string;
    remark?: string;
    sms?: string;
    sms_2?: string;
    email?: string;
    user_level?: number;
    createdAt?: string;
    updatedAt?: string;
}

export default function SmsObituaryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(true);
    const [message, setMessage] = useState(`🌼[부고 알림]

삼가 고인의 명복을 빕니다.

당사 홍길동님의 [부친/모친] 故 OOO 님께서
202X년 O월 O일(요일) 별세하셨기에 삼가 알려드립니다.

■ 빈소 : OO병원 장례식장 O호실
   (서울시 OO구 OO동 123-45)

■ 발인 : 202X년 O월 O일(요일) 오전 O시
■ 장지 : OOO 추모공원

■ 마음 전하실 곳 :
   OO은행 123-456-789012 (예금주 : 홍길동)

■ 연락처 : 010-0000-0000 (상주)

바쁘신 가운데 따뜻한 위로와 격려를 보내주시면
유족에게 큰 힘이 될 것입니다.

`);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        document.title = "부고장 문자발송";
    }, [status, router]);

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        // 전체 선택 상태에 따라 모든 멤버 선택/해제
        if (selectAll) {
            const allMemberIds = new Set(members.map((m: Member) => m._id));
            setSelectedMembers(allMemberIds);
        } else {
            setSelectedMembers(new Set());
        }
    }, [selectAll, members]);

    const fetchMembers = async () => {
        try {
            const response = await fetch('/api/members');
            const result = await response.json();
            if (result.success && result.data) {
                const membersData: Member[] = result.data || [];
                setMembers(membersData);
                // 기본적으로 모든 멤버 선택
                const allMemberIds = new Set(membersData.map((m: Member) => m._id));
                setSelectedMembers(allMemberIds);
            } else {
                console.error('회원 목록 조회 실패:', result.message);
                setMembers([]);
            }
        } catch (error) {
            console.error('회원 목록 조회 오류:', error);
            setMembers([]);
        }
    };

    const toggleMember = (memberId: string) => {
        const newSelected = new Set(selectedMembers);
        if (newSelected.has(memberId)) {
            newSelected.delete(memberId);
        } else {
            newSelected.add(memberId);
        }
        setSelectedMembers(newSelected);
        
        // 전체 선택 체크박스 상태 업데이트
        setSelectAll(newSelected.size === (members || []).length);
    };

    const toggleSelectAll = () => {
        setSelectAll(!selectAll);
    };

    const sendSMS = () => {
        if (selectedMembers.size === 0) {
            alert('문자를 보낼 회원을 선택하세요.');
            return;
        }

        const msg = message.trim();
        if (!msg) {
            alert('문자 내용을 입력하세요.');
            return;
        }

        // 선택된 멤버들의 전화번호 추출
        const selectedMembersList = (members || []).filter(m => selectedMembers.has(m._id));
        const numbers = selectedMembersList
            .map(m => m.tel.replace(/[^0-9]/g, ''))
            .filter(num => num.length > 0)
            .join(',');

        if (!numbers) {
            alert('유효한 전화번호가 없습니다.');
            return;
        }

        // 모바일 OS에 따른 SMS 링크 생성
        // ==========================================
        // SMS 제목 설정: "제목없음" 문제 해결을 위해 subject 파라미터 추가
        // ==========================================
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const subject = encodeURIComponent('부고 알림: 김천 황악회'); // SMS 제목 설정부분

        // iOS와 Android의 SMS 링크 형식 차이:
        // iOS: sms:번호&subject=제목&body=내용 (& 파라미터)
        // Android: sms:번호?subject=제목&body=내용 (? 파라미터)
        // ==========================================
        let smsLink = isIOS
            ? `sms:${numbers}&subject=${subject}&body=${encodeURIComponent(msg)}`  // iOS용 링크
            : `sms:${numbers}?subject=${subject}&body=${encodeURIComponent(msg)}`; // Android용 링크

        // 문자 앱 실행
        window.location.href = smsLink;
    };

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <>
            <style jsx global>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    background: #f4f6f9;
                    min-height: 100vh;
                    font-family: 'Noto Sans KR', sans-serif;
                }

                .main-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding-bottom: 40px;
                }

                /* 헤더 스타일 */
                .header-section {
                    background: white;
                    padding: 30px 20px;
                    text-align: center;
                    border-bottom: 1px solid #ddd;
                    margin-bottom: 20px;
                }

                .header-section h4 {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #333;
                    margin: 0;
                }

                /* 카드 스타일 */
                .card {
                    border-radius: 12px;
                    border: 1px solid #e0e0e0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    margin: 20px;
                    background: white;
                    overflow: hidden;
                }

                .card-header {
                    background: #343a40;
                    color: white;
                    font-weight: 700;
                    padding: 12px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                /* 회원 리스트 스타일 */
                .member-list {
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 10px;
                    background: #fafafa;
                }

                .form-check {
                    padding: 10px 15px;
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                }

                .form-check:hover {
                    background-color: #f1f3f5;
                }

                .form-check-input {
                    width: 20px;
                    height: 20px;
                    margin-right: 10px;
                    cursor: pointer;
                    border: 2px solid #adb5bd;
                }

                .form-check-input:checked {
                    background-color: #343a40;
                    border-color: #343a40;
                }

                .form-check-label {
                    cursor: pointer;
                    font-size: 0.95rem;
                    color: #333;
                    flex: 1;
                }

                .tel-info {
                    color: #666;
                    font-size: 0.85rem;
                    margin-left: 5px;
                }

                .addr-info {
                    color: #888;
                    font-size: 0.8rem;
                    display: block;
                    margin-top: 2px;
                }

                /* 텍스트 영역 */
                textarea.form-control {
                    border: 1px solid #ccc;
                    border-radius: 0;
                    padding: 15px;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    min-height: 350px;
                    resize: none;
                    background-color: #fff;
                }

                /* 버튼 영역 */
                .button-section {
                    padding: 0 20px;
                    text-align: center;
                }

                .btn {
                    border-radius: 8px;
                    padding: 12px 20px;
                    font-size: 1rem;
                    font-weight: 700;
                    margin: 5px;
                    min-width: 140px;
                    border: none;
                    cursor: pointer;
                }

                .btn-dark {
                    background-color: #343a40;
                    color: white;
                }

                .btn-secondary {
                    background-color: #6c757d;
                    color: white;
                }

                /* 카카오톡 공유 버튼 */
                .btn-kakao-chat {
                    background-color: #FEE500;
                    color: #3C1E1E;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                }

                .btn-kakao-chat:hover {
                    background-color: #f7d200;
                    color: #3C1E1E;
                }

                .kakao-icon {
                    margin-right: 5px;
                    font-size: 1.2em;
                }

                /* 버튼들을 감싸는 컨테이너 */
                .action-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 10px;
                    flex-wrap: wrap;
                }

                /* 전체선택 체크박스 */
                #checkAll {
                    transform: scale(1.2);
                    cursor: pointer;
                }
            `}</style>

            <div className="main-container">
                <div className="header-section">
                    <h4>📋 부고장 문자 발송</h4>
                </div>

                <form id="smsForm">
                    {/* 1. 발송 대상 선택 */}
                    <div className="card">
                        <div className="card-header">
                            <span>발송 대상 선택 ({(members || []).length}명)</span>
                            <label style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="checkAll" 
                                    checked={selectAll}
                                    onChange={toggleSelectAll}
                                /> 전체 선택
                            </label>
                        </div>
                        <div className="member-list">
                            {(members || []).map((member) => (
                                <div key={member._id} className="form-check">
                                    <input 
                                        className="form-check-input sms-check" 
                                        type="checkbox" 
                                        value={member.tel}
                                        id={`m${member._id}`}
                                        checked={selectedMembers.has(member._id)}
                                        onChange={() => toggleMember(member._id)}
                                    />
                                    <label className="form-check-label" htmlFor={`m${member._id}`}>
                                        <strong>{member.name}</strong>
                                        <span className="tel-info">({member.tel})</span>
                                        {member.addr && (
                                            <span className="addr-info">📍 {member.addr}</span>
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. 문자 내용 입력 */}
                    <div className="card">
                        <div className="card-header">문자 내용 (부고 알림)</div>
                        <textarea 
                            id="smsMessage" 
                            className="form-control"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </form>

                <div className="button-section">
                    {/* 1행: 문자 보내기 + 카카오톡 공유방 */}
                    <div className="action-buttons">
                        <button type="button" className="btn btn-dark" onClick={sendSMS}>
                            📩 문자 보내기
                        </button>
                        <a 
                            href="https://open.kakao.com/o/gWWWIK5h" 
                            target="_blank" 
                            className="btn btn-kakao-chat"
                        >
                            <span className="kakao-icon">🔗</span> 카카오톡 공유방
                        </a>
                    </div>

                    {/* 2행: 돌아가기 */}
                    <a 
                        href="/invitation" 
                        className="btn btn-secondary" 
                        style={{ width: '100%', maxWidth: '300px' }}
                    >
                        ⏪ 돌아가기
                    </a>
                </div>
            </div>
        </>
    );
}
