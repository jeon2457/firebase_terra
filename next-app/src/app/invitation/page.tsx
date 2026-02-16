"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function InvitationPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'obituary' | 'wedding'>('obituary');
    const [scrollToTopVisible, setScrollToTopVisible] = useState(false);

    // 부고장 상태
    const [obTitle, setObTitle] = useState('[訃 告]');
    const [obMain, setObMain] = useState(`삼가 고인의 명복을 빕니다.

당사 홍길동님의 [부친/모친] 故 OOO 님께서
202X년 O월 O일(요일) 별세하셨기에 삼가 알려드립니다.`);
    const [obInfo, setObInfo] = useState(`■ 빈소 : OO병원 장례식장 O호실
   (서울시 OO구 OO동 123-45)
■ 발인 : 202X년 O월 O일(요일) 오전 O시
■ 장지 : OOO 추모공원
■ 마음 전하실 곳 : OO은행 123-456-789012 (예금주 : 홍길동)
■ 연락처 : 010-0000-0000 (상주)`);
    const [obFooter, setObFooter] = useState('바쁘신 가운데 따뜻한 위로와 격려 부탁드립니다.');

    // 청첩장 상태
    const [wedTitle, setWedTitle] = useState('[청첩장]');
    const [wedMain, setWedMain] = useState(`ㅇㅇㅇ 자녀 ㅇㅇㅇ 혼례를 올립니다.
바쁘시더라도 오셔서 축복해 주시면 큰 기쁨이 되겠습니다.`);
    const [wedInfo, setWedInfo] = useState(`■ 일시 : 202X년 O월 O일(요일) 오후 O시
■ 장소 : OOO 웨딩홀 OO층 OO홀 (서울시 OO구 OO동 123-45)
■ 주차 : 주차권 제공 / 대중교통 이용 권장`);
    const [wedContact, setWedContact] = useState(`■ 신랑 : 홍길동 010-0000-0000
■ 신부 : 홍길순 010-0000-0000
■ 마음 전하실 곳 : OO은행 123-456-789012 (예금주 : 홍길동)`);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const handleScroll = () => {
            setScrollToTopVisible(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderObituary = () => {
        return `${obTitle}

${obMain}

${obInfo}

${obFooter}`;
    };

    const renderWedding = () => {
        const contact = wedContact.trim() ? `\n\n${wedContact}` : '';
        return `${wedTitle}

${wedMain}

${wedInfo}${contact}`;
    };

    const copyText = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('복사되었습니다. 카카오톡/문자에 붙여넣기 하세요.');
        } catch {
            alert('복사되었습니다.');
        }
    };

    const resetObituary = () => {
        setObTitle('[訃 告]');
        setObMain(`삼가 고인의 명복을 빕니다.

당사 홍길동님의 [부친/모친] 故 OOO 님께서
202X년 O월 O일(요일) 별세하셨기에 삼가 알려드립니다.`);
        setObInfo(`■ 빈소 : OO병원 장례식장 O호실
   (서울시 OO구 OO동 123-45)
■ 발인 : 202X년 O월 O일(요일) 오전 O시
■ 장지 : OOO 추모공원
■ 마음 전하실 곳 : OO은행 123-456-789012 (예금주 : 홍길동)
■ 연락처 : 010-0000-0000 (상주)`);
        setObFooter('바쁘신 가운데 따뜻한 위로와 격려 부탁드립니다.');
    };

    const resetWedding = () => {
        setWedTitle('[청첩장]');
        setWedMain(`ㅇㅇㅇ 자녀 ㅇㅇㅇ 혼례를 올립니다.
바쁘시더라도 오셔서 축복해 주시면 큰 기쁨이 되겠습니다.`);
        setWedInfo(`■ 일시 : 202X년 O월 O일(요일) 오후 O시
■ 장소 : OOO 웨딩홀 OO층 OO홀 (서울시 OO구 OO동 123-45)
■ 주차 : 주차권 제공 / 대중교통 이용 권장`);
        setWedContact(`■ 신랑 : 홍길동 010-0000-0000
■ 신부 : 홍길순 010-0000-0000
■ 마음 전하실 곳 : OO은행 123-456-789012 (예금주 : 홍길동)`);
    };

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <>
            <style jsx global>{`
                :root {
                    --bg: #f7f7f8;
                    --card: #ffffff;
                    --text: #222;
                    --muted: #666;
                    --accent: #2f6feb;
                    --border: #e5e7eb;
                }
                body {
                    background: var(--bg);
                    color: var(--text);
                }
                .invitation-container {
                    max-width: 760px;
                    margin: 0 auto;
                    padding: 16px;
                }
                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-top: 16px;
                }
                .card {
                    background: var(--card);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 14px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .card:hover {
                    border-color: #d8dae0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
                }
                .card .icon {
                    width: 40px;
                    height: 40px;
                    display: grid;
                    place-items: center;
                    border-radius: 10px;
                    background: #eef2ff;
                    color: var(--accent);
                    font-size: 20px;
                }
                .tabs {
                    margin-top: 20px;
                    display: flex;
                    gap: 8px;
                }
                .tab {
                    flex: 1;
                    background: var(--card);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 10px 12px;
                    font-size: 14px;
                    cursor: pointer;
                }
                .tab.active {
                    border-color: var(--accent);
                    color: var(--accent);
                    font-weight: 600;
                }
                .panel {
                    margin-top: 12px;
                    background: var(--card);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 14px;
                }
                .form-row {
                    display: grid;
                    gap: 10px;
                    margin-bottom: 12px;
                }
                label {
                    font-size: 13px;
                    color: var(--muted);
                    display: block;
                    margin-bottom: 6px;
                }
                input[type="text"], textarea {
                    width: 100%;
                    padding: 10px 12px;
                    font-size: 14px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    outline: none;
                }
                input[type="text"]:focus, textarea:focus {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px rgba(47, 111, 235, 0.12);
                }
                textarea {
                    min-height: 180px;
                    resize: vertical;
                    white-space: pre-wrap;
                }
                .actions {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-top: 8px;
                }
                .btn {
                    padding: 10px 12px;
                    font-size: 14px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: #fff;
                    cursor: pointer;
                }
                .btn.primary {
                    background: var(--accent);
                    color: #fff;
                    border-color: var(--accent);
                }
                .hint {
                    font-size: 12px;
                    color: var(--muted);
                    margin-top: 6px;
                }
                .preview {
                    margin-top: 10px;
                    padding: 12px;
                    border: 1px dashed var(--border);
                    border-radius: 8px;
                    background: #fafafa;
                    font-size: 14px;
                    white-space: pre-wrap;
                }
                .scroll-top {
                    position: fixed;
                    bottom: 20px;
                    right: 30px;
                    width: 40px;
                    height: 40px;
                    background: rgba(13, 202, 240, 0.8);
                    color: white;
                    border: 2px solid #0dcaf0;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    z-index: 1000;
                    transition: all 0.3s;
                }
                .scroll-top:hover {
                    background: #0dcaf0;
                    transform: translateY(-5px);
                }
                @media (max-width: 560px) {
                    .grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="invitation-container">
                <header style={{ padding: '8px 0 16px' }}>
                    <h1 style={{ fontSize: '20px', margin: '0 0 8px' }}>부고장 · 청첩장 만들기</h1>
                    <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14px' }}>
                        모바일에 맞춘 심플한 디자인으로 내용을 작성하고 복사/공유하세요.
                    </p>
                </header>

                <div className="grid">
                    <div className="card" onClick={() => setActiveTab('obituary')}>
                        <div className="icon">🌼</div>
                        <div>
                            <h3 style={{ fontSize: '16px', margin: 0 }}>부고장 만들기</h3>
                            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                                단정한 문구와 항목으로 빠르게 구성
                            </p>
                        </div>
                    </div>
                    <div className="card" onClick={() => setActiveTab('wedding')}>
                        <div className="icon">💍</div>
                        <div>
                            <h3 style={{ fontSize: '16px', margin: 0 }}>청첩장 만들기</h3>
                            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                                일시·장소·주요 안내를 깔끔하게
                            </p>
                        </div>
                    </div>
                </div>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'obituary' ? 'active' : ''}`}
                        onClick={() => setActiveTab('obituary')}
                    >
                        부고장
                    </button>
                    <button
                        className={`tab ${activeTab === 'wedding' ? 'active' : ''}`}
                        onClick={() => setActiveTab('wedding')}
                    >
                        청첩장
                    </button>
                </div>

                {activeTab === 'obituary' && (
                    <section className="panel">
                        <div className="form-row">
                            <div>
                                <label htmlFor="obTitle">제목</label>
                                <input
                                    type="text"
                                    id="obTitle"
                                    value={obTitle}
                                    onChange={(e) => setObTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="obMain">본문</label>
                                <textarea
                                    id="obMain"
                                    value={obMain}
                                    onChange={(e) => setObMain(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="obInfo">안내 항목</label>
                                <textarea
                                    id="obInfo"
                                    value={obInfo}
                                    onChange={(e) => setObInfo(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="obFooter">마무리 문구</label>
                                <input
                                    type="text"
                                    id="obFooter"
                                    value={obFooter}
                                    onChange={(e) => setObFooter(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="actions">
                            <button className="btn primary" onClick={() => copyText(renderObituary())}>
                                부고장 복사
                            </button>
                            <button className="btn" onClick={resetObituary}>
                                초기화
                            </button>
                        </div>
                        <p className="hint">
                            복사한 내용을 카카오톡/문자에 붙여넣기 하세요. 이모지를 원하면 제목 앞에 🌼 를 추가해도 좋습니다.
                        </p>
                        <div className="preview">{renderObituary()}</div>
                    </section>
                )}

                {activeTab === 'wedding' && (
                    <section className="panel">
                        <div className="form-row">
                            <div>
                                <label htmlFor="wedTitle">제목</label>
                                <input
                                    type="text"
                                    id="wedTitle"
                                    value={wedTitle}
                                    onChange={(e) => setWedTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="wedMain">본문</label>
                                <textarea
                                    id="wedMain"
                                    value={wedMain}
                                    onChange={(e) => setWedMain(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="wedInfo">일시 · 장소</label>
                                <textarea
                                    id="wedInfo"
                                    value={wedInfo}
                                    onChange={(e) => setWedInfo(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="wedContact">연락/마음 전하실 곳 (선택)</label>
                                <textarea
                                    id="wedContact"
                                    value={wedContact}
                                    onChange={(e) => setWedContact(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="actions">
                            <button className="btn primary" onClick={() => copyText(renderWedding())}>
                                청첩장 복사
                            </button>
                            <button className="btn" onClick={resetWedding}>
                                초기화
                            </button>
                        </div>
                        <p className="hint">
                            제목 앞에 💍 또는 💐 이모지를 붙이면 모바일에서 더 따뜻한 느낌을 줍니다.
                        </p>
                        <div className="preview">{renderWedding()}</div>
                    </section>
                )}

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                        <button
                            className="btn"
                            style={{
                                padding: '18px',
                                background: 'white',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}
                            onClick={() => router.push('/obituary-sms')}
                        >
                            <span style={{ fontSize: '24px' }}>🌼</span>
                            <span>부고장 문자로보내기</span>
                        </button>

                        <button
                            className="btn"
                            style={{
                                padding: '18px',
                                background: 'white',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                            onClick={() => alert('이 기능은 추후 구현 예정입니다.')}
                        >
                            <span style={{ fontSize: '24px' }}>💍</span>
                            <span>청첩장 문자로보내기</span>
                        </button>

                        <button
                            className="btn"
                            style={{
                                padding: '18px',
                                background: 'white',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                            onClick={() => router.push('/obituary-create')}
                        >
                            <span style={{ fontSize: '24px' }}>🌼</span>
                            <span>부고장 홈페이지로 만들기</span>
                        </button>
                    </div>

                    <button
                        className="btn"
                        style={{ padding: '14px 30px', fontSize: '16px' }}
                        onClick={() => router.push('/activities')}
                    >
                        ⏪ 돌아가기
                    </button>
                </div>

            </div>

            {scrollToTopVisible && (
                <div className="scroll-top" onClick={scrollToTop}>
                    ▲
                </div>
            )}
        </>
    );
}