"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

export default function ObituaryCreatePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // 상태 관리
    const [intro, setIntro] = useState('{상주이름}의 [관계] {고인성함} 님께서{별세일} {별세시간}경에 별세 하셨기에 삼가 알려드립니다.');
    const [deceasedName, setDeceasedName] = useState('');
    const [deceasedRelation, setDeceasedRelation] = useState('');
    const [age, setAge] = useState('');
    const [deathDate, setDeathDate] = useState('');
    const [deathTime, setDeathTime] = useState('');
    const [funeralHome, setFuneralHome] = useState('');
    const [funeralAddress, setFuneralAddress] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [cemetery, setCemetery] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [message, setMessage] = useState('삼가 고인의 명복을 빕니다.');
    
    const [mourners, setMourners] = useState([
        { id: 1, relation: '장남', name: '', phone: '' }
    ]);
    const [mournerCount, setMournerCount] = useState(1);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        // 오늘 날짜를 기본값으로 설정
        const today = new Date().toISOString().split('T')[0];
        setDeathDate(today);
    }, []);

    useEffect(() => {
        updateIntroText();
    }, [mourners, deceasedName, deceasedRelation, deathDate, deathTime]);

    const updateIntroText = () => {
        const firstMournerName = mourners[0]?.name || '{상주이름}';
        const name = deceasedName || '{고인성함}';
        const relation = deceasedRelation || '[관계]';
        let dateStr = deathDate || '{별세일}';
        let timeStr = deathTime || '{별세시간}';

        if (deathDate) {
            const parts = deathDate.split('-');
            dateStr = ` ${parts[0]}년 ${parts[1]}월 ${parts[2]}일`;
        }

        if (deathTime) {
            const parts = deathTime.split(':');
            timeStr = ` ${parts[0]}시 ${parts[1]}분`;
        }

        setIntro(`${firstMournerName}의 ${relation} ${name} 님께서${dateStr}${timeStr}경에 별세 하셨기에 삼가 알려드립니다.`);
    };

    const addMourner = () => {
        const newId = mournerCount + 1;
        setMournerCount(newId);
        setMourners([...mourners, { id: newId, relation: '장남', name: '', phone: '' }]);
    };

    const removeMourner = (id: number) => {
        setMourners(mourners.filter(m => m.id !== id));
    };

    const updateMourner = (id: number, field: string, value: string) => {
        setMourners(mourners.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 상주 정보 문자열 변환
        let mournersText = "";
        mourners.forEach(m => {
            if (m.name) {
                mournersText += `${m.relation} ${m.name}`;
                if (m.phone) mournersText += ` (☎ ${m.phone})`;
                mournersText += "\n";
            }
        });

        // 계좌 정보 문자열 변환
        let bankInfoText = "";
        if (bankName || accountNumber) {
            bankInfoText = `${bankName} ${accountNumber}`;
            if (accountHolder) bankInfoText += ` (예금주: ${accountHolder})`;
        }

        const obData = {
            intro,
            deceasedName,
            deceasedRelation,
            firstMournerName: mourners[0]?.name || '',
            age,
            deathDate,
            deathTime,
            funeralHome,
            funeralAddress,
            departureTime,
            cemetery,
            mourners: mournersText,
            bankInfo: bankInfoText,
            message
        };

        try {
            // MongoDB 저장
            const response = await fetch('/api/obituary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obData)
            });

            const result = await response.json();
            
            if (result.success) {
                // 생성된 부고장 페이지로 이동
                router.push(`/obituary-view?id=${result.id}`);
            } else {
                alert('부고장 생성에 실패했습니다: ' + (result.error || '알 수 없는 오류'));
            }
        } catch (error) {
            console.error('부고장 생성 오류:', error);
            alert('부고장 생성에 실패했습니다.');
        }
    };

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <>
            <style jsx global>{`
                body {
                    background: linear-gradient(135deg, #434343 0%, #000000 100%);
                    min-height: 100vh;
                    font-family: 'Nanum Myeongjo', serif;
                }
                .obituary-container {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 10px;
                }
                .obituary-card {
                    border: 3px solid #333;
                    border-radius: 0;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    background: #fefefe;
                }
                .card-header {
                    background: #1a1a1a;
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                    border-bottom: 3px solid #333;
                }
                .card-header h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0;
                    letter-spacing: 3px;
                }
                .section-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 30px 0 20px 0;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #333;
                }
                .mourner-group {
                    background: #f8f8f8;
                    padding: 20px;
                    border-radius: 5px;
                    margin-bottom: 15px;
                    border: 1px solid #ddd;
                    position: relative;
                }
                .btn-remove {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 5px 15px;
                    border-radius: 5px;
                    font-size: 0.85rem;
                    cursor: pointer;
                }
                .btn-custom {
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
                    cursor: pointer;
                }
                .btn-custom:hover {
                    background: #333;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
                .notice {
                    margin: 12px 0;
                    padding: 12px;
                    border: 1px solid #e5eaf0;
                    border-radius: 8px;
                    background: #f8fbff;
                }
                .notice-badge {
                    display: inline-block;
                    margin-bottom: 8px;
                    padding: 2px 8px;
                    border-radius: 12px;
                    background: #1a73e8;
                    color: #ffffff;
                    font-weight: 600;
                    font-size: 11px;
                }
                .notice-text {
                    margin: 0;
                    color: #1a73e8;
                    font-size: 13px;
                    line-height: 1.6;
                }
            `}</style>

            <div className="obituary-container">
                <div className="obituary-card">
                    <div className="card-header">
                        <h1>訃 告 作 成</h1>
                        <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', letterSpacing: '1px' }}>
                            부고장 작성
                        </p>
                    </div>

                    <div className="card-body" style={{ padding: '40px 30px', background: 'white' }}>
                        <form onSubmit={handleSubmit}>
                            {/* 인삿말 섹션 */}
                            <div className="section-title">■ 인삿말</div>
                            <div className="mb-3">
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={intro}
                                    readOnly
                                    style={{ background: '#f8f8f8' }}
                                />
                            </div>

                            {/* 안내 블록 */}
                            <div className="notice">
                                <span className="notice-badge">[안내]</span>
                                <p className="notice-text">
                                    &lt;망자를 지칭하는 말&gt;<br />
                                    할아버지(조부), 할머니(조모), 아버지(부친), 어머니(모친), 
                                    장인어른(빙부), 장모님(빙모), 시아버지(시부), 시어머니(시모) 등...
                                </p>
                            </div>

                            {/* 고인과의 관계 */}
                            <div className="mb-4">
                                <div className="section-title">■ 고인과의 관계</div>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={deceasedRelation}
                                    onChange={(e) => setDeceasedRelation(e.target.value)}
                                    placeholder="고인과 상주의 관계를 입력하세요. ex)부친,모친,조부,조모.."
                                />
                            </div>

                            {/* 고인 정보 */}
                            <div className="section-title">■ 고인 정보</div>
                            <div className="row">
                                <div className="col-md-8 mb-3">
                                    <label className="form-label">故人 성함 *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={deceasedName}
                                        onChange={(e) => setDeceasedName(e.target.value)}
                                        required
                                        placeholder="예: 홍길동"
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">향년 *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        required
                                        placeholder="예: 85"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">별세일 *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={deathDate}
                                        onChange={(e) => setDeathDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">별세시간</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        value={deathTime}
                                        onChange={(e) => setDeathTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* 빈소 정보 */}
                            <div className="section-title">■ 빈소 정보</div>
                            <div className="mb-3">
                                <label className="form-label">빈소 위치 *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={funeralHome}
                                    onChange={(e) => setFuneralHome(e.target.value)}
                                    required
                                    placeholder="예: 서울대학교병원 장례식장 3호실"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">빈소 주소</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={funeralAddress}
                                    onChange={(e) => setFuneralAddress(e.target.value)}
                                    placeholder="예: 서울시 종로구 대학로 101"
                                />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">발인일시 *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={departureTime}
                                        onChange={(e) => setDepartureTime(e.target.value)}
                                        required
                                        placeholder="예: 2024년 5월 20일 오전 8시"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">장지 *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cemetery}
                                        onChange={(e) => setCemetery(e.target.value)}
                                        required
                                        placeholder="예: 서울추모공원"
                                    />
                                </div>
                            </div>

                            {/* 상주 정보 */}
                            <div className="section-title">■ 상주 정보</div>
                            {mourners.map((mourner, index) => (
                                <div key={mourner.id} className="mourner-group">
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            className="btn-remove"
                                            onClick={() => removeMourner(mourner.id)}
                                        >
                                            삭제
                                        </button>
                                    )}
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">관계</label>
                                            <select
                                                className="form-select"
                                                value={mourner.relation}
                                                onChange={(e) => updateMourner(mourner.id, 'relation', e.target.value)}
                                            >
                                                <option value="장남">장남</option>
                                                <option value="차남">차남</option>
                                                <option value="삼남">삼남</option>
                                                <option value="장녀">장녀</option>
                                                <option value="차녀">차녀</option>
                                                <option value="배우자">배우자</option>
                                                <option value="기타">기타</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">성함</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={mourner.name}
                                                onChange={(e) => updateMourner(mourner.id, 'name', e.target.value)}
                                                placeholder="예: 홍○○"
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">연락처</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={mourner.phone}
                                                onChange={(e) => updateMourner(mourner.id, 'phone', e.target.value)}
                                                placeholder="010-0000-0000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ marginTop: '10px' }}
                                onClick={addMourner}
                            >
                                + 상주 추가
                            </button>

                            {/* 조의금 정보 */}
                            <div className="section-title">■ 마음 전하실 곳</div>
                            <div className="mb-3">
                                <label className="form-label">은행명</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="예: 국민은행"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">계좌번호</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="예: 123456-78-901234"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">예금주</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={accountHolder}
                                    onChange={(e) => setAccountHolder(e.target.value)}
                                    placeholder="예: 홍길동"
                                />
                            </div>

                            {/* 인사말 */}
                            <div className="section-title">■ 인사말</div>
                            <div className="mb-3">
                                <label className="form-label">인사말 (선택)</label>
                                <textarea
                                    className="form-control"
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <div className="info-text" style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px' }}>
                                    ※ 비워두실 경우 표준 조문 문구가 자동으로 들어갑니다.
                                </div>
                            </div>

                            <button type="submit" className="btn-custom">
                                부고장 생성하기
                            </button>

                            <button
                                type="button"
                                className="btn-custom"
                                style={{ background: '#6c757d', marginTop: '10px' }}
                                onClick={() => router.push('/obituary-view')}
                            >
                                📋 부고장 보러가기
                            </button>

                            <button
                                type="button"
                                className="btn-custom"
                                style={{ background: '#6c757d', marginTop: '10px' }}
                                onClick={() => router.push('/invitation')}
                            >
                                ⏪ 돌아가기
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}