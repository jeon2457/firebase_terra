"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface ObituaryData {
    intro: string;
    deceasedName: string;
    age: string;
    deathDate: string;
    deathTime: string;
    funeralHome: string;
    funeralAddress: string;
    departureTime: string;
    cemetery: string;
    mourners: string;
    bankInfo: string;
    message: string;
    createdAt: string;
}

function ObituaryViewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [obituary, setObituary] = useState<ObituaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(true);
    const [showMemberList, setShowMemberList] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);

    useEffect(() => {
        if (id) {
            fetchObituary();
            fetchMembers();
            // URL에서 mode=view 파라미터 확인
            const urlParams = new URLSearchParams(window.location.search);
            setIsViewMode(urlParams.get('mode') === 'view');
        } else {
            setError('부고장 ID가 없습니다.');
            setLoading(false);
        }
    }, [id]);

    const fetchObituary = async () => {
        try {
            const response = await fetch(`/api/obituary?id=${id}`);
            const result = await response.json();
            
            if (result.success) {
                setObituary(result.data);
            } else {
                setError(result.error || '부고장을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            setError('부고장을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await fetch('/api/members');
            const result = await response.json();
            if (result.success && result.data) {
                const membersData = result.data || [];
                setMembers(membersData);
                // 기본적으로 모든 멤버 선택
                const allMemberIds: Set<string> = new Set(membersData.map((m: any) => m._id.toString()));
                setSelectedMembers(allMemberIds);
            }
        } catch (error) {
            console.error('회원 목록 조회 오류:', error);
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
        setSelectAll(newSelected.size === (members || []).length);
    };

    const toggleSelectAll = () => {
        setSelectAll(!selectAll);
    };

    useEffect(() => {
        if (selectAll) {
            const allMemberIds: Set<string> = new Set(members.map((m: any) => m._id.toString()));
            setSelectedMembers(allMemberIds);
        } else {
            setSelectedMembers(new Set());
        }
    }, [selectAll, members]);

    const sendBulkSMS = () => {
        if (selectedMembers.size === 0) {
            alert('대상자를 선택하세요.');
            return;
        }

        // 선택된 멤버들의 전화번호 추출
        const selectedMembersList = (members || []).filter(m => selectedMembers.has(m._id.toString()));
        const numbers = selectedMembersList
            .map(m => m.tel.replace(/[^0-9]/g, ''))
            .filter(num => num.length > 0)
            .join(',');

        if (!numbers) {
            alert('유효한 전화번호가 없습니다.');
            return;
        }

        // 공개용 부고장 링크 생성 (mode=view 파라미터 추가)
        const shareLink = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.search.includes('?') ? '&' : '?'}mode=view`;

        // SMS 메시지 내용 구성
        const msg = `[부고알림-김천 황악회]\n故 ${obituary?.deceasedName || 'OOO'}님께서 별세하셨기에 알려드립니다.\n\n아래 링크에서 자세한 내용을 확인하세요.\n${shareLink}`;

        // 모바일 OS에 따른 SMS 링크 생성
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const subject = encodeURIComponent('부고 알림: 김천 황악회');

        let smsLink = isIOS
            ? `sms:${numbers}&subject=${subject}&body=${encodeURIComponent(msg)}`
            : `sms:${numbers}?subject=${subject}&body=${encodeURIComponent(msg)}`;

        // 문자 앱 실행
        window.location.href = smsLink;
    };

    const copyToClipboard = async () => {
        // 현재 페이지의 URL을 복사
        const url = window.location.href;
        
        try {
            await navigator.clipboard.writeText(url);
            alert('부고장 주소가 복사되었습니다. 카카오톡/문자에 붙여넣기 하세요.');
        } catch {
            // 폴백: 다른 브라우저를 위한 방법
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('부고장 주소가 복사되었습니다. 카카오톡/문자에 붙여넣기 하세요.');
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !obituary) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    {error || '부고장을 찾을 수 없습니다.'}
                </div>
                <button 
                    className="btn btn-secondary" 
                    onClick={() => router.push('/invitation')}
                >
                    돌아가기
                </button>
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
                body {
                    background: linear-gradient(135deg, #434343 0%, #000000 100%);
                    min-height: 100vh;
                    padding: 20px 10px;
                    font-family: 'Nanum Myeongjo', serif;
                }

                .container {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .card {
                    border: 3px solid #333;
                    border-radius: 0;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    background: #fefefe;
                }

                .card-header {
                    background: #1a1a1a;
                    background-image: url('/images/gughwak.jpg');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    color: white;
                    padding: 45px 20px; /* 높이 15px 추가 (30px -> 45px) */
                    text-align: center;
                    border-bottom: 3px solid #333;
                    position: relative;
                    min-height: 120px; /* 최소 높이 설정 */
                }

                .card-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 1;
                }

                .card-header h1,
                .card-header p {
                    position: relative;
                    z-index: 2;
                }

                .card-header h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0;
                    letter-spacing: 3px;
                }

                .card-body {
                    padding: 40px 30px;
                    background: white;
                    line-height: 1.8;
                    white-space: pre-wrap;
                }

                .section-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 30px 0 20px 0;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #333;
                }

                .btn-custom {
                    display: block;
                    width: 100%;
                    padding: 18px;
                    background: #1a1a1a;
                    color: white;
                    border: none;
                    font-size: 1.2rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    margin-top: 15px;
                    transition: all 0.3s;
                    text-align: center;
                    text-decoration: none;
                    border-radius: 0;
                    cursor: pointer;
                }

                .btn-custom:hover {
                    background: #333;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }

                .btn-back {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px 30px;
                    background: rgba(255, 255, 255, 0.9);
                    color: #667eea;
                    border: 2px solid #667eea;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 16px;
                    margin: 30px auto 0;
                    width: 100%;
                    max-width: 220px;
                }

                .btn-back:hover {
                    background: #667eea;
                    color: #fff;
                    transform: translateY(-2px);
                }

                .obituary-content {
                    font-size: 1.1rem;
                    line-height: 2;
                    color: #333;
                }

                .info-item {
                    margin: 10px 0;
                }

                .info-label {
                    font-weight: 700;
                    color: #1a1a1a;
                }

                .member-card {
                    background: #f8f9fa;
                    border-radius: 12px;
                    border: 1px solid #ddd;
                    margin-bottom: 20px;
                    overflow: hidden;
                }

                .member-header {
                    background: #343a40;
                    color: white;
                    padding: 12px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                }

                .member-list {
                    max-height: 250px;
                    overflow-y: auto;
                    padding: 10px;
                    display: none;
                }

                .member-list.show {
                    display: block;
                }

                .form-check {
                    background: white;
                    padding: 8px 12px;
                    border: 1px solid #eee;
                    border-radius: 6px;
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                }

                .form-check-input {
                    width: 18px;
                    height: 18px;
                    margin-right: 10px;
                }

                .form-check-label {
                    font-size: 0.9rem;
                    flex: 1;
                }

                .sms-btn-group {
                    padding: 10px;
                    background: #eee;
                    text-align: center;
                }
            `}</style>

            <div className="container">
                {/* 발송 대상 선택 섹션 - view 모드일 때 숨김 */}
                {!isViewMode && (
                    <div className="member-card">
                        <div className="member-header" onClick={() => setShowMemberList(!showMemberList)}>
                            <span>📱 발송 대상 선택 ({(members || []).length}명)</span>
                            <span>{showMemberList ? '▲' : '▼'}</span>
                        </div>
                        <div className={`member-list ${showMemberList ? 'show' : ''}`}>
                            <div className="form-check" style={{ background: '#e9ecef', position: 'sticky', top: 0, zIndex: 10 }}>
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    checked={selectAll}
                                    onChange={toggleSelectAll}
                                />
                                <label className="form-check-label">
                                    <strong>전체 선택/해제</strong>
                                </label>
                            </div>
                            {(members || []).map((member) => (
                                <div key={member._id} className="form-check">
                                    <input 
                                        className="form-check-input sms-check" 
                                        type="checkbox" 
                                        value={member.tel}
                                        id={`m${member._id}`}
                                        checked={selectedMembers.has(member._id.toString())}
                                        onChange={() => toggleMember(member._id.toString())}
                                    />
                                    <label className="form-check-label" htmlFor={`m${member._id}`}>
                                        {member.name} <span style={{ fontSize: '0.8rem', color: '#666' }}>({member.tel})</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="sms-btn-group">
                            <button 
                                type="button" 
                                className="btn btn-dark w-100"
                                onClick={sendBulkSMS}
                            >
                                📱 선택된 회원에게 부고장 링크 발송
                            </button>
                        </div>
                    </div>
                )}

                <div className="card">
                    <div className="card-header">
                        <h1>訃 告</h1>
                        <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', letterSpacing: '1px' }}>
                            부고장
                        </p>
                    </div>

                    <div className="card-body">
                        <div className="obituary-content">
                            <div style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.2rem' }}>
                                {obituary.intro}
                            </div>

                            <div className="section-title">■ 고인 정보</div>
                            <div className="info-item">
                                <span className="info-label">故人 성함:</span> {obituary.deceasedName}
                            </div>
                            <div className="info-item">
                                <span className="info-label">향년:</span> {obituary.age}세
                            </div>
                            <div className="info-item">
                                <span className="info-label">별세일:</span> {obituary.deathDate}
                            </div>
                            {obituary.deathTime && (
                                <div className="info-item">
                                    <span className="info-label">별세시간:</span> {obituary.deathTime}
                                </div>
                            )}

                            <div className="section-title">■ 빈소 정보</div>
                            <div className="info-item">
                                <span className="info-label">빈소 위치:</span> {obituary.funeralHome}
                            </div>
                            {obituary.funeralAddress && (
                                <div className="info-item">
                                    <span className="info-label">빈소 주소:</span> {obituary.funeralAddress}
                                </div>
                            )}
                            <div className="info-item">
                                <span className="info-label">발인일시:</span> {obituary.departureTime}
                            </div>
                            <div className="info-item">
                                <span className="info-label">장지:</span> {obituary.cemetery}
                            </div>

                            <div className="section-title">■ 상주 정보</div>
                            <div style={{ whiteSpace: 'pre-line' }}>
                                {obituary.mourners}
                            </div>

                            {obituary.bankInfo && (
                                <>
                                    <div className="section-title">■ 마음 전하실 곳</div>
                                    <div>{obituary.bankInfo}</div>
                                </>
                            )}

                            <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '1.1rem' }}>
                                {obituary.message}
                            </div>
                        </div>

                        {/* 하단 메뉴 - view 모드일 때 숨김 */}
                        {!isViewMode && (
                            <>
                                <button 
                                    type="button" 
                                    className="btn-custom"
                                    onClick={copyToClipboard}
                                >
                                    📋 부고장 복사하기
                                </button>

                                <a 
                                    href="https://open.kakao.com/o/gWWWIK5h" 
                                    target="_blank" 
                                    className="btn-custom"
                                    style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
                                >
                                    🔗 카톡 공유방
                                </a>

                                <a href="/obituary-sms" className="btn-back">
                                    ⏪ 돌아가기
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default function ObituaryViewPage() {
    // 로그인 없이所有人都能看到 부고장 (공개 페이지)
    return (
        <Suspense fallback={<div className="text-center mt-5">Loading...</div>}>
            <ObituaryViewContent />
        </Suspense>
    );
}
