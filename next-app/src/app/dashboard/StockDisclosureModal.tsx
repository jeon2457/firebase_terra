"use client";

import { useState } from "react";
import { X, Bell, TrendingUp, Search, ExternalLink, RefreshCw, Copy, Check, Mail, MessageCircle } from "lucide-react";

interface StockDisclosureModalProps {
    onClose: () => void;
}

/**
 * 실시간 주식 공시 모니터링 모달
 * 
 * DART(금융감독원) API를 활용한 주권공시 시스템
 * - 정기공시 및 수시공시 모니터링
 * - 최대 3개 종목까지 등록 가능
 * - 새 공시 발생 시 알림 설정
 * 
 * [DART API 사용을 위한 인증키 발급 방법]
 * 1. https://dart.fss.or.kr/ 접속
 * 2. 로그인 → Open API 메뉴 → 이용신청
 * 3. API 키 발급 후 아래 API_KEY 변수에 입력
 * 
 * [카카오톡/이메일 알림 연동]
 * - 아래 설정에서 알림 받을 방법을 선택하세요
 * - 실제로 알림을 받으려면 별도의 서버 구축 필요
 */
export default function StockDisclosureModal({ onClose }: StockDisclosureModalProps) {
    // 사용자 입력 상태
    const [stockCodes, setStockCodes] = useState<string[]>(["", "", ""]);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [monitoringInterval, setMonitoringInterval] = useState<number | null>(null);
    const [disclosureResults, setDisclosureResults] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // 뉴스 상태 및 탭 상태
    const [newsResults, setNewsResults] = useState<{ [code: string]: any[] }>({});
    const [isNewsLoading, setIsNewsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'disclosure' | 'news'>('disclosure');

    // 알림 설정 상태
    const [notificationSettings, setNotificationSettings] = useState({
        enableEmail: true,
        email: "jeon2457@gmail.com",
        enableKakao: true,
        kakaoUrl: "https://open.kakao.com/o/gWWWIK5h"
    });

    // DART API 인증키 - 아래 값을 실제 API 키로 변경하세요
    // [중요] 이 키는 안전하게 관리해야 합니다 (환경변수 사용 권장)
    const DART_API_KEY = "0d94210772f23d373648909c617a0501f6fa1461";  // YOUR_DART_API_KEY_입력하기

    const getDateString = (daysAgo: number): string => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    const handleStockCodeChange = (index: number, value: string) => {
        const newCodes = [...stockCodes];
        newCodes[index] = value.replace(/[^0-9]/g, ""); // 숫자만 입력 가능
        setStockCodes(newCodes);
    };

    const startMonitoring = () => {
        const validCodes = stockCodes.filter(code => code.length === 6);
        if (validCodes.length === 0) {
            alert("모니터링할 종목코드를 6자리로 입력해주세요.\n(예: 005930 = 삼성전자)");
            return;
        }

        setIsMonitoring(true);
        fetchDisclosures(validCodes);

        // 1분마다 자동 새로고침
        const interval = setInterval(() => {
            fetchDisclosures(validCodes);
        }, 60000);

        setMonitoringInterval(interval as unknown as number);
    };

    const stopMonitoring = () => {
        setIsMonitoring(false);
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            setMonitoringInterval(null);
        }
    };

    const sendNotification = async (newItems: any[], type: 'disclosure' | 'news') => {
        if (newItems.length === 0) return;

        const title = type === 'disclosure' ? '주식 공시 알림' : '주식 뉴스 알림';
        const emoji = type === 'disclosure' ? '📢' : '📰';

        // 알림 메시지 생성
        let notificationMessage = "";
        if (type === 'disclosure') {
            notificationMessage = newItems.map(d =>
                `📢 [${d.crpNm}] ${d.flnmNtc}\n구분: ${d.rm || '일반'}\n날짜: ${d.rceptDt?.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}\n링크: https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${d.rceptNo}`
            ).join("\n\n");
        } else {
            // 뉴스 알림 (주요 뉴스 3개만)
            notificationMessage = newItems.slice(0, 3).map(n =>
                `📰 [뉴스] ${n.title.replace(/<[^>]*>?/gm, '')}\n출처: ${n.source}\n링크: ${n.link}`
            ).join("\n\n");
        }

        const htmlMessage = `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #28a745;">${emoji} ${title}</h2>
                <div style="white-space: pre-wrap; line-height: 1.6;">
                    ${notificationMessage.replace(/\n/g, '<br>')}
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888;">본 알림은 설정에 의해 자동으로 발송되었습니다.</p>
            </div>
        `;

        // 이메일 알림 (설정이 활성화된 경우)
        if (notificationSettings.enableEmail && notificationSettings.email) {
            try {
                await fetch('/api/notify/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: notificationSettings.email,
                        subject: `[${emoji}${title}] ${newItems[0].crpNm || '관심종목'} 관련 알림`,
                        html: htmlMessage
                    })
                });
            } catch (error) {
                console.error("이메일 발송 실패:", error);
            }
        }

        // 카카오톡 알림 (설정이 활성화된 경우)
        if (notificationSettings.enableKakao) {
            try {
                await fetch('/api/notify/kakao', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: `[${emoji}${title}]\n\n${notificationMessage}`
                    })
                });
            } catch (error) {
                console.error("카카오톡 발송 실패:", error);
            }
        }

        // 브라우저 알림 (공시일 때만 또는 중요 뉴스일 때)
        if (type === 'disclosure') {
            alert(`📢 새로운 공시가 ${newItems.length}건 발생했습니다!\n\n${newItems[0].crpNm}: ${newItems[0].flnmNtc}`);
        }
    };

    const fetchDisclosures = async (codes: string[]) => {
        setIsLoading(true);
        setIsNewsLoading(true);

        // 기업공시 및 뉴스 동시 검색
        try {
            // 1. 기업공시 unified 검색 API
            const response = await fetch(
                `https://dart.fss.or.kr/api/search.json?auth=${DART_API_KEY}&crpCd=${codes.join(",")}&startDate=${getDateString(7)}&endDate=${getDateString(0)}&pageNo=1&pageSize=100`
            );
            const data = await response.json();

            const list = data.list || (data.result && data.result.list) || [];

            // 새 공시 확인 (rceptNo 기준)
            if (list.length > 0) {
                const existingIds = new Set(disclosureResults.map(d => d.rceptNo));
                const newItems = list.filter((d: any) => !existingIds.has(d.rceptNo));

                if (newItems.length > 0 && disclosureResults.length > 0) {
                    sendNotification(newItems, 'disclosure');
                }

                setDisclosureResults(list);
            } else {
                setDisclosureResults([]);
            }
            setLastUpdated(new Date());
        } catch (error) {
            console.error("DART API 오류:", error);
        }

        try {
            // 2. 뉴스 검색 API
            const newNewsData: { [code: string]: any[] } = {};
            let hasNewNews = false;
            const newlyDetectedNews: any[] = [];

            for (const code of codes) {
                if (code.length === 6) {
                    const stockName = getStockName(code);
                    const res = await fetch(`/api/news?q=${encodeURIComponent(stockName)}`);
                    if (res.ok) {
                        const json = await res.json();
                        const items = json.items || [];
                        newNewsData[code] = items;

                        // 새 뉴스 확인 (link 기준)
                        const existingLinks = new Set((newsResults[code] || []).map(n => n.link));
                        const newItems = items.filter((n: any) => !existingLinks.has(n.link));

                        if (newItems.length > 0 && newsResults[code]) {
                            hasNewNews = true;
                            newlyDetectedNews.push(...newItems.map((n: any) => ({ ...n, crpNm: stockName })));
                        }
                    }
                }
            }

            if (hasNewNews) {
                sendNotification(newlyDetectedNews, 'news');
            }
            setNewsResults(newNewsData);
        } catch (error) {
            console.error("News API 오류:", error);
        }

        setIsLoading(false);
        setIsNewsLoading(false);
    };


    const getStockName = (code: string): string => {
        const stockNames: { [key: string]: string } = {
            // 코스피 대형주
            "005930": "삼성전자",
            "000660": "SK하이닉스",
            "035420": "NAVER",
            "005380": "현대차",
            "068270": "셀트리온",
            "051910": "LG화학",
            "373220": "LG에너지솔루션",
            "012330": "현대모비스",
            "000270": "기아",
            "207940": "삼성바이오로직스",
            "005490": "POSCO홀딩스",
            "011200": "HMM",
            "326030": "SK바이오팜",
            "105560": "KB금융지주",
            "055550": "신한지주",
            "003550": "LG",
            "066570": "LG전자",
            "003670": "포스코인터내셔널",
            "032830": "삼성생명",
            "048260": "삼성화재해상보험",
            "024110": "기업은행",
            "009540": "한국조선해양",
            "010140": "삼성중공업",
            "010130": "현대중공업",
            "096770": "SK이노베이션",
            "096690": "SK디스커버리",
            "006400": "삼성SDI",
            "004020": "현대제철",
            // 성장주/중소형주
            "352820": "HD현대중공업",
            "394360": "알테오젠",
            "950180": "카카오페이",
            "293490": "카카오",
            "035900": "JYP Ent.",
            "018260": "삼성에스디에스",
            "241560": "두산테스나",
            "095570": "AJ네트웍스",
            "006280": "녹십자",
            "271980": "대상",
            // biotech
            "207750": "원바이오젠",
            "068760": "셀트리온제약",
            "225570": "유나이티드제약",
            // REIT
            "357250": "ESR켄달스퀘어리츠",
            "344790": "CRE",
            // 금융
            "138930": "BNK금융지주",
            "030200": "KT",
            "030190": "LGU+",
            "057050": "카카오Bank",
            // 기타 많이 거래되는 종목
            "042660": "대우조선해양",
            "011210": "현대미포조선",
            "008770": "호텔신라",
            "001040": "CJ",
            "001120": "LG상사",
            "023590": "DB손해보험",
            "026960": "동양",
            // KOSDAQ
            "340570": "티앤엘",
            "145020": "휴젤",
            "041960": "ellas_one",
            "048470": "JYP Ent.",
            "122450": "KT",
            "066900": "드래곤플라이",
        };

        // 정확한 매핑이 있으면 반환, 없으면 입력코드 기반 생성
        if (stockNames[code]) {
            return stockNames[code];
        }

        // 알 수 없는 코드의 경우 그대로 표시
        return `${code}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getDisclosureTypeColor = (type: string) => {
        if (type.includes("사업보고서") || type.includes("분기")) return "bg-primary";
        if (type.includes("수시")) return "bg-warning";
        if (type.includes("주요사항")) return "bg-info";
        return "bg-secondary";
    };

    return (
        <div className="custom-modal-overlay" onClick={onClose}>
            <div className="custom-modal" style={{ maxWidth: '800px', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <div className="d-flex align-items-center gap-3">
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #00C853 0%, #00E676 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(0, 200, 83, 0.3)'
                        }}>
                            <TrendingUp size={24} color="white" />
                        </div>
                        <div>
                            <h4 className="fw-bold m-0">실시간 주식 공시 모니터</h4>
                            <small className="text-muted">DART 금융감독원 공시 알림</small>
                        </div>
                    </div>
                    <button className="btn btn-link link-dark p-0" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* 알림 설정 카드 */}
                <div className="alert alert-success mb-4" style={{ borderRadius: 12 }}>
                    <div className="d-flex align-items-start gap-2">
                        <Bell size={18} className="mt-1 flex-shrink-0" />
                        <div>
                            <strong>🔔 알림 설정</strong>
                            <p className="mb-2 small">
                                새로운 공시가 등록되면 알림을 받을 방법을 선택하세요.
                            </p>

                            {/* 이메일 알림 */}
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="emailNotify"
                                    checked={notificationSettings.enableEmail}
                                    onChange={(e) => setNotificationSettings({
                                        ...notificationSettings,
                                        enableEmail: e.target.checked
                                    })}
                                />
                                <label className="form-check-label" htmlFor="emailNotify">
                                    <Mail size={14} className="me-1" />
                                    이메일 알림
                                </label>
                            </div>

                            {/* 카카오톡 알림 */}
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="kakaoNotify"
                                    checked={notificationSettings.enableKakao}
                                    onChange={(e) => setNotificationSettings({
                                        ...notificationSettings,
                                        enableKakao: e.target.checked
                                    })}
                                />
                                <label className="form-check-label" htmlFor="kakaoNotify">
                                    <MessageCircle size={14} className="me-1" />
                                    카카오톡 알림
                                </label>
                            </div>

                            {/* 알림 상태 표시 */}
                            <div className="mt-2 p-2 bg-white bg-opacity-25 rounded small">
                                <div className="d-flex align-items-center gap-2">
                                    {notificationSettings.enableEmail && (
                                        <span className="badge bg-success">
                                            📧 {notificationSettings.email}
                                        </span>
                                    )}
                                    {notificationSettings.enableKakao && (
                                        <a
                                            href={notificationSettings.kakaoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="badge bg-warning text-dark text-decoration-none"
                                        >
                                            💬 오픈채팅방
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 종목 코드 입력 */}
                <div className="mb-4">
                    <label className="form-label fw-bold d-flex align-items-center gap-2">
                        <Search size={16} />
                        모니터링할 종목 코드 (6자리)
                        <span className="badge bg-secondary ms-auto">최대 3개</span>
                    </label>
                    <div className="row g-2">
                        {[0, 1, 2].map((idx) => (
                            <div className="col-4" key={idx}>
                                <div className="input-group">
                                    <span className="input-group-text bg-light">
                                        {idx + 1}번
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="005930"
                                        maxLength={6}
                                        value={stockCodes[idx]}
                                        onChange={(e) => handleStockCodeChange(idx, e.target.value)}
                                        disabled={isMonitoring}
                                    />
                                </div>
                                {stockCodes[idx] && (
                                    <small className="text-muted ms-1">
                                        {getStockName(stockCodes[idx])}
                                    </small>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-2">
                        <small className="text-muted">
                            💡 종가코드 예시: 삼성전자(005930), SK하이닉스(000660), NAVER(035420), 티앤엘(340570)
                        </small>
                    </div>
                </div>

                {/* 모니터링 컨트롤 */}
                <div className="d-flex gap-2 mb-4">
                    {!isMonitoring ? (
                        <button
                            className="btn btn-success flex-fill d-flex align-items-center justify-content-center gap-2"
                            style={{ borderRadius: 12, padding: '12px 20px' }}
                            onClick={startMonitoring}
                        >
                            <Bell size={18} />
                            모니터링 시작
                        </button>
                    ) : (
                        <button
                            className="btn btn-danger flex-fill d-flex align-items-center justify-content-center gap-2"
                            style={{ borderRadius: 12, padding: '12px 20px' }}
                            onClick={stopMonitoring}
                        >
                            <Bell size={18} />
                            모니터링 중지
                        </button>
                    )}
                    {isMonitoring && (
                        <button
                            className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                            style={{ borderRadius: 12 }}
                            onClick={() => fetchDisclosures(stockCodes.filter(c => c.length === 6))}
                            disabled={isLoading}
                        >
                            <RefreshCw size={18} className={isLoading ? "spin" : ""} />
                        </button>
                    )}
                </div>

                {/* 네비게이션 탭 */}
                {isMonitoring && (
                    <ul className="nav nav-tabs mb-3 gap-2 border-bottom-0 pb-1" style={{ fontSize: '15px' }}>
                        <li className="nav-item">
                            <button
                                className={`nav-link border-0 ${activeTab === 'disclosure' ? 'active fw-bold text-success border-bottom border-success border-3 bg-transparent' : 'text-muted'}`}
                                onClick={() => setActiveTab('disclosure')}
                                style={{ borderRadius: 0, paddingBottom: '10px' }}
                            >
                                공시 목록
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link border-0 ${activeTab === 'news' ? 'active fw-bold text-success border-bottom border-success border-3 bg-transparent' : 'text-muted'}`}
                                onClick={() => setActiveTab('news')}
                                style={{ borderRadius: 0, paddingBottom: '10px' }}
                            >
                                최신 뉴스
                                {Object.keys(newsResults).length > 0 && <span className="ms-1 badge bg-success rounded-pill" style={{ fontSize: '10px' }}>New</span>}
                            </button>
                        </li>
                    </ul>
                )}

                {/* 모니터링 상태 */}
                {isMonitoring && (
                    <div className="d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded">
                        <div className="d-flex align-items-center gap-2">
                            <div className="spinner-grow spinner-grow-sm text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="fw-bold text-success">모니터링 활성화</span>
                        </div>
                        {lastUpdated && (
                            <small className="text-muted">
                                마지막 업데이트: {lastUpdated.toLocaleTimeString()}
                            </small>
                        )}
                    </div>
                )}

                {/* 공시 및 뉴스 컨텐츠 영역 */}
                {isMonitoring && activeTab === 'disclosure' && (
                    disclosureResults.length > 0 ? (
                        <div className="mb-4">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                <Bell size={16} />
                                공시 목록 ({disclosureResults.length}건)
                            </h6>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {disclosureResults.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="card mb-2 border-0 shadow-sm"
                                        style={{ borderRadius: 10 }}
                                    >
                                        <div className="card-body py-3">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <span className="fw-bold">{item.crpNm}</span>
                                                        <span className={`badge ${getDisclosureTypeColor(item.flnmNtc)}`}>
                                                            {item.flnmNtc}
                                                        </span>
                                                    </div>
                                                    <div className="text-muted small">
                                                        {item.rm} • {item.rceptDt?.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}
                                                    </div>
                                                </div>
                                                <a
                                                    href={`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rceptNo}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                                    style={{ borderRadius: 8 }}
                                                >
                                                    <ExternalLink size={14} />
                                                    확인
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <Bell size={48} className="mb-3 opacity-25" />
                            <p>조회된 공시가 없습니다</p>
                        </div>
                    )
                )}

                {isMonitoring && activeTab === 'news' && (
                    <div className="mb-4">
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                            <TrendingUp size={16} />
                            최신 관련 뉴스
                        </h6>
                        {isNewsLoading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted mt-2">뉴스를 불러오는 중입니다...</p>
                            </div>
                        ) : Object.keys(newsResults).length > 0 && Object.values(newsResults).some(arr => arr.length > 0) ? (
                            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                                {Object.entries(newsResults).map(([code, items]) => {
                                    if (items.length === 0) return null;
                                    const stockName = getStockName(code);
                                    return (
                                        <div key={code} className="mb-4">
                                            <h6 className="fw-bold text-success mb-2 border-bottom pb-1">{stockName}</h6>
                                            <ul className="list-unstyled ps-1">
                                                {items.map((newsItem, idx) => (
                                                    <li key={idx} className="mb-3 bg-white p-3 rounded shadow-sm border">
                                                        <a href={newsItem.link} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-dark d-block">
                                                            <div className="fw-bold mb-1 lh-sm" dangerouslySetInnerHTML={{ __html: newsItem.title }} />
                                                            <div className="d-flex justify-content-between text-muted mt-2" style={{ fontSize: '12px' }}>
                                                                <span>{newsItem.source || '디지털 경제'}</span>
                                                                <span>{new Date(newsItem.pubDate).toLocaleDateString()}</span>
                                                            </div>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <TrendingUp size={48} className="mb-3 opacity-25" />
                                <p>관련된 뉴스를 찾을 수 없습니다</p>
                            </div>
                        )}
                    </div>
                )}

                {/* API 키 가이드 */}
                <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-bold mb-2">
                        🔑 DART API 인증키 설정 방법
                    </h6>
                    <div className="bg-dark text-light p-3 rounded" style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span>// API 키를 아래 변수에 입력하세요</span>
                            <button
                                className="btn btn-sm btn-outline-light"
                                onClick={() => copyToClipboard('const DART_API_KEY = "YOUR_API_KEY";')}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                        <code>const DART_API_KEY = "YOUR_API_KEY";</code>
                    </div>
                    <div className="mt-3">
                        <ol className="small text-muted mb-0">
                            <li><a href="https://dart.fss.or.kr/" target="_blank" rel="noopener">DART 전자공시</a> 접속</li>
                            <li>로그인 → Open API → 이용신청</li>
                            <li>발급된 API 키를 코드에 입력</li>
                            <li>실제 사용 시 환경변수(NEXT_PUBLIC_DART_API_KEY) 사용 권장</li>
                        </ol>
                    </div>
                </div>

                {/* 반응형 스타일 */}
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .spin {
                        animation: spin 1s linear infinite;
                    }
                    @media (max-width: 576px) {
                        .custom-modal .row.g-2 .col-4 {
                            width: 100%;
                            margin-bottom: 8px;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}




// ## 🔧 버셀에서의 Vercel 환경변수 설정 방법

// ### 단계 1: 프로젝트 설정으로 이동

// 1. Vercel 대시보드에서 __프로젝트 클릭__
// 2. __Settings__ 탭 클릭 (톱니바퀴 아이콘)

// ### 단계 2: 환경변수 추가

// 1. 왼쪽 메뉴에서 __Environment Variables__ 클릭

// 2. 아래처럼 입력:

//    - __Name:__ `NEXT_PUBLIC_DART_API_KEY`
//    - __Value:__ `발급받은_API_키_여기에_입력`
//    - __Environment:__ `Production`, `Development`, `Preview` 모두 선택

// 3. __Add__ 버튼 클릭

// ### 단계 3:Redeploy (재배치)

// 1. __Deployments__ 탭으로 이동
// 2. 가장 최신 배포의 __... 버튼__ 클릭
// 3. __Redeploy__ 클릭

// ---

// ## 📝 코드 수정 (이미 되어있음)

// 코드에서는 이미 환경변수를 사용하도록 되어있습니다:

// ```javascript
// // StockDisclosureModal.tsx 약 80번째 줄
// const DART_API_KEY = process.env.NEXT_PUBLIC_DART_API_KEY;
// ```

// Redeploy하시면 바로 작동합니다!

// ---

// ## 💡 참고

// 환경변수 이름은 반드시 `NEXT_PUBLIC_`으로 시작해야 합니다 (클라이언트에서 사용하기 때문)

