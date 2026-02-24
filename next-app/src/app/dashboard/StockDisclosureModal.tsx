"use client";

import { useState } from "react";
import { X, Bell, TrendingUp, Search, ExternalLink, RefreshCw, Copy, Check } from "lucide-react";

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
 * [카카오톡 알림 연동]
 * - 알림을 받으려면 별도의 웹훅 또는 서버 설정 필요
 * - 구현 예시: 서버에서 DART API를 주기적으로 호출하여 공시 확인 후推送알림
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

    // DART API 인증키 - 아래 값을 실제 API 키로 변경하세요
    // [중요] 이 키는 안전하게 관리해야 합니다 (환경변수 사용 권장)
    // const DART_API_KEY = "YOUR_DART_API_KEY_HERE"; 

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

    const fetchDisclosures = async (codes: string[]) => {
        setIsLoading(true);
        
        // ============================================================
        // [DART API 연동 코드 예시]
        // 아래 코드는 실제 API 연동을 위한 예시입니다.
        // 실제 사용 시에는 환경변수에 저장한 API 키를 사용하세요.
        // 
        // const DART_API_KEY = process.env.NEXT_PUBLIC_DART_API_KEY;
        // 
        // try {
        //     // 기업공시 unified 검색 API
        //     const response = await fetch(
        //         `https://dart.fss.or.kr/api/search.json?auth=${DART_API_KEY}&crpCd=${codes.join(",")}&startDate=${getDateString(7)}&endDate=${getDateString(0)}&pageNo=1&pageSize=100`
        //     );
        //     const data = await response.json();
        //     
        //     if (data.result && data.result.list) {
        //         setDisclosureResults(data.result.list);
        //         setLastUpdated(new Date());
        //         
        //         // 새 공시가 있으면 알림
        //         if (data.result.list.length > 0) {
        //             sendNotification(data.result.list);
        //         }
        //     }
        // } catch (error) {
        //     console.error("DART API 오류:", error);
        // }
        // ============================================================

        // 데모 데이터 (API 연결 전 테스트용)
        // 실제 DART API 연동 시에는 아래 코드를 주석 해제하고 사용하세요
        setTimeout(() => {
            // 사용자가 입력한 각 종시에 대한 데모 공시 데이터 생성
            const demoResults: any[] = [];
            
            codes.forEach((code, idx) => {
                if (code.length === 6) {
                    const stockName = getStockName(code);
                    const disclosureTypes = [
                        { type: "사업보고서 (연결)", desc: "연간 결산 보고" },
                        { type: "수시공고", desc: "주식취소 및 실권발행" },
                        { type: "주요사항보고서", desc: "임원임면" },
                        { type: "분기보고서", desc: "분기별 영업 실적" },
                        { type: "공시공고", desc: "기타 공시 사항" }
                    ];
                    
                    // 각 종목마다 1~2개의 공시 예시 생성
                    const numDisclosures = Math.floor(Math.random() * 2) + 1;
                    for (let i = 0; i < numDisclosures; i++) {
                        const disclosure = disclosureTypes[Math.floor(Math.random() * disclosureTypes.length)];
                        const date = new Date();
                        date.setDate(date.getDate() - Math.floor(Math.random() * 7));
                        
                        demoResults.push({
                            crpNm: stockName,
                            crpCd: code,
                            rceptNo: `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}0000${idx}${i}`,
                            flnmNtc: disclosure.type,
                            rceptDt: date.toISOString().split("T")[0].replace(/-/g, ""),
                            rm: disclosure.desc
                        });
                    }
                }
            });

            setDisclosureResults(demoResults);
            setLastUpdated(new Date());
            setIsLoading(false);
        }, 1000);
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

                {/* 설명 카드 */}
                <div className="alert alert-info mb-4" style={{ borderRadius: 12 }}>
                    <div className="d-flex align-items-start gap-2">
                        <Bell size={18} className="mt-1 flex-shrink-0" />
                        <div>
                            <strong>주식 공시 모니터링</strong>
                            <p className="mb-0 small">
                                입력한 종목의 정기공시 및 수시공시 소식을 확인하세요.<br />
                                <span className="text-danger">※ DART API 키가 필요합니다. 아래 가이드 참조</span>
                            </p>
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
                            💡 종가코드 예시: 삼성전자(005930), SK하이닉스(000660), NAVER(035420)
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

                {/* 공시 결과 */}
                {disclosureResults.length > 0 ? (
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
                ) : isMonitoring ? (
                    <div className="text-center py-5 text-muted">
                        <Bell size={48} className="mb-3 opacity-25" />
                        <p>새로운 공시가 없습니다</p>
                    </div>
                ) : null}

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
