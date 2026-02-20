"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ObituarySmsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // 상태 관리
    const [intro, setIntro] = useState('{상주이름}의 [관계:수작업 기재] {고인성함} 님께서{별세일} {별세시간}경에 별세 하셨기에 삼가 알려드립니다.');
    const [deceasedName, setDeceasedName] = useState('');
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
    const [message, setMessage] = useState('💐 삼가 고인의 명복을 빕니다.');
    
    const [mourners, setMourners] = useState([
        { id: 1, relation: '장남', name: '', phone: '' }
    ]);
    const [mournerCount, setMournerCount] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        document.title = "경조사 문자보내기";
    }, [status, router]);

    useEffect(() => {
        // 오늘 날짜를 기본값으로 설정
        const today = new Date().toISOString().split('T')[0];
        setDeathDate(today);
    }, []);

    useEffect(() => {
        updateIntroText();
    }, [mourners, deceasedName, deathDate, deathTime]);

    const updateIntroText = () => {
        const firstMournerName = mourners[0]?.name || '{상주이름}';
        const name = deceasedName || '{고인성함}';
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

        setIntro(`${firstMournerName}의 [관계:수작업 기재] ${name} 님께서${dateStr} ${timeStr}경에 별세 하셨기에 삼가 알려드립니다.`);
    };

    const addMourner = () => {
        const newId = mournerCount + 1;
        setMournerCount(newId);
        setMourners([...mourners, { id: newId, relation: '장남', name: '', phone: '' }]);
    };

    const removeMourner = (id: number) => {
        setMourners(mourners.filter(m => m.id !== id));
        updateIntroText();
    };

    const updateMourner = (id: number, field: string, value: string) => {
        setMourners(mourners.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

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
            age,
            deathDate,
            deathTime,
            funeralHome,
            funeralAddress,
            departureTime,
            cemetery,
            mourners: mournersText,
            bankInfo: bankInfoText,
            message,
            createdAt: new Date().toISOString()
        };

        try {
            // MongoDB 저장 API 호출 (추후 구현)
            const response = await fetch('/api/obituary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obData),
            });

            if (response.ok) {
                const result = await response.json();
                localStorage.setItem('lastObituaryId', result.id);
                alert('부고장이 생성되었습니다.');
                router.push(`/obituary-view?id=${result.id}`);
            } else {
                throw new Error('저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('부고장 저장 오류:', error);
            alert('부고장 생성에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const goToViewPage = () => {
        const lastId = localStorage.getItem('lastObituaryId');
        if (lastId) {
            router.push(`/obituary-view?id=${lastId}`);
        } else {
            alert("생성된 부고장이 없습니다.");
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

                .card-body {
                    padding: 40px 30px;
                    background: white;
                }

                .notice {
                    display: block;
                    max-width: 720px;
                    margin: 12px auto;
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
                    line-height: 1.4;
                }

                .notice-text {
                    margin: 0;
                    color: #1a73e8;
                    font-size: 10px;
                    line-height: 1.6;
                    word-break: keep-all;
                }

                .form-label {
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 8px;
                    font-size: 0.95rem;
                }

                .form-control,
                .form-select {
                    border: 2px solid #ddd;
                    border-radius: 5px;
                    padding: 12px;
                    font-size: 1rem;
                }

                .form-control:focus,
                .form-select:focus {
                    border-color: #333;
                    box-shadow: 0 0 0 0.2rem rgba(0, 0, 0, 0.1);
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

                .info-text {
                    color: #666;
                    font-size: 0.85rem;
                    margin-top: 5px;
                }

                .mourner-group {
                    background: #f8f8f8;
                    padding: 20px;
                    border-radius: 5px;
                    margin-bottom: 15px;
                    border: 1px solid #ddd;
                }

                .btn-add-mourner {
                    background: #555;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    font-weight: 600;
                    margin-top: 10px;
                }

                .btn-remove {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 5px 15px;
                    border-radius: 5px;
                    font-size: 0.85rem;
                    float: right;
                }

                .btn-kakao-chat {
                    background-color: #FEE500;
                    color: #3C1E1E;
                    font-weight: bold;
                    border: none;
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
            `}</style>

            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <h1>訃 告 作 成</h1>
                        <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', letterSpacing: '1px' }}>부고장 작성</p>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="section-title">■ 인삿말</div>
                            <div className="mb-3">
                                <textarea 
                                    className="form-control" 
                                    id="intro"
                                    rows={3}
                                    value={intro}
                                    readOnly
                                    style={{ backgroundColor: '#f8f8f8' }}
                                />
                            </div>

                            <section className="notice">
                                <span className="notice-badge">[안내]</span>
                                <p className="notice-text">
                                    할아버지(조부), 할머니(조모), 아버지(부친), 어머니(모친), 장인어른(빙부), 장모님(빙모), 시아버지(시부), 시어머니(시모) 등...
                                </p>
                            </section>

                            <div className="section-title">■ 고인 정보</div>
                            <div className="row">
                                <div className="col-md-8 mb-3">
                                    <label className="form-label">故人 성함 *</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="deceasedName"
                                        value={deceasedName}
                                        onChange={(e) => setDeceasedName(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">향년 *</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="age"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">별세일 *</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        id="deathDate"
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
                                        id="deathTime"
                                        value={deathTime}
                                        onChange={(e) => setDeathTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="section-title">■ 빈소 정보</div>
                            <div className="mb-3">
                                <label className="form-label">빈소 위치 *</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="funeralHome"
                                    value={funeralHome}
                                    onChange={(e) => setFuneralHome(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">빈소 주소</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="funeralAddress"
                                    value={funeralAddress}
                                    onChange={(e) => setFuneralAddress(e.target.value)}
                                />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">발인일시 *</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="departureTime"
                                        value={departureTime}
                                        onChange={(e) => setDepartureTime(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">장지 *</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="cemetery"
                                        value={cemetery}
                                        onChange={(e) => setCemetery(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="section-title">■ 상주 정보</div>
                            <div id="mournersContainer">
                                {mourners.map((mourner) => (
                                    <div key={mourner.id} className="mourner-group" id={`mourner-${mourner.id}`}>
                                        {mourners.length > 1 && (
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
                                                    className="form-select mourner-relation"
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
                                                    className="form-control mourner-name"
                                                    value={mourner.name}
                                                    onChange={(e) => updateMourner(mourner.id, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">연락처</label>
                                                <input 
                                                    type="tel" 
                                                    className="form-control mourner-phone"
                                                    value={mourner.phone}
                                                    onChange={(e) => updateMourner(mourner.id, 'phone', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="btn-add-mourner" onClick={addMourner}>+ 상주 추가</button>

                            <div className="section-title">■ 마음 전하실 곳</div>
                            <div className="mb-3">
                                <label className="form-label">은행명</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="bankName"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">계좌번호</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="accountNumber"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">예금주</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="accountHolder"
                                    value={accountHolder}
                                    onChange={(e) => setAccountHolder(e.target.value)}
                                />
                            </div>

                            <div className="section-title">■ 인사말</div>
                            <div className="mb-3">
                                <textarea 
                                    className="form-control" 
                                    id="message" 
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <button type="submit" className="btn-custom" id="submitBtn" disabled={isSubmitting}>
                                {isSubmitting ? '저장 중...' : '부고장 생성하기'}
                            </button>
                            <button type="button" className="btn-custom" onClick={goToViewPage}>부고장 보러가기</button>

                            <a href="https://open.kakao.com/o/gWWWIK5h" target="_blank" className="btn-custom btn-kakao-chat">🔗 카톡 공유방</a>
                            <a href="/invitation" className="btn-back">⏪ 돌아가기</a>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
