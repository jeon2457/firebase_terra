"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function StocksPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if (!session) {
        router.push("/login");
        return null;
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f4f6f9", padding: "30px 0" }}>
            <style>{`
                .stocks-container {
                    max-width: 900px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    boxSizing: "border-box"
                }
                .stocks-header {
                    background: linear-gradient(135deg, #004080, #0073e6);
                    color: white;
                    text-align: center;
                    padding: 60px 20px;
                    borderRadius: "12px 12px 0 0",
                    margin: "-40px -40px 30px -40px",
                }
                .stocks-header h1 {
                    margin: 0;
                    font-size: clamp(1.5rem, 4vw, 2rem);
                    wordBreak: "keep-all"
                }
                .stocks-section {
                    margin-bottom: 30px;
                }
                .stocks-section h2 {
                    color: #004080;
                    marginTop: "35px",
                    borderBottom: "2px solid #f0f4f8",
                    paddingBottom: "10px",
                    fontSize: "clamp(1.1rem, 3vw, 1.5rem)"
                }
                .stocks-section p {
                    marginBottom: "15px",
                    lineHeight: "1.7"
                }
                .brand-red {
                    color: #e60000;
                    fontWeight: "800"
                }
                .highlight {
                    background: #fff5f5;
                    padding: 25px;
                    borderLeft: "5px solid #e60000",
                    margin: "30px 0",
                    borderRadius: "4px"
                }
                .highlight h2 {
                    color: #c00;
                    marginTop: "0",
                    borderBottom: "none",
                    fontSize: "1.3rem"
                }
                .stocks-footer {
                    textAlign: "center",
                    padding: "30px 20px",
                    background: "#e9ecef",
                    color: "#666",
                    fontSize: "0.9rem",
                    margin: "30px -40px -40px -40px",
                    borderRadius: "0 0 12px 12px"
                }
                .back-btn {
                    display: inline-flex;
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    background: "white",
                    border: "2px solid #dee2e6",
                    borderRadius: "30px",
                    color: "#6c757d",
                    fontWeight: "600",
                    textDecoration: "none",
                    marginBottom: "30px",
                    transition: "all 0.3s",
                    cursor: "pointer"
                }
                .back-btn:hover {
                    background: "#f8f9fa",
                    borderColor: "#adb5bd",
                    color: "#495057"
                }
                @media (max-width: 768px) {
                    .stocks-container {
                        padding: 25px 20px;
                        margin: 0 10px;
                        borderRadius: "12px"
                    }
                    .stocks-header {
                        padding: 40px 15px;
                        margin: "-25px -20px 25px -20px";
                        borderRadius: "12px 12px 0 0"
                    }
                    .stocks-footer {
                        margin: "25px -20px -25px -20px";
                        borderRadius: "0 0 12px 12px"
                    }
                    .highlight {
                        padding: 20px 15px
                    }
                }
            `}</style>

            <div className="stocks-container">
                <div className="stocks-header">
                    <h1>대한민국 통일후 주식시장 유망주</h1>
                </div>

                <button className="back-btn" onClick={() => router.push("/learn")}>
                    <ArrowLeft size={18} /> 학습하기로 돌아가기
                </button>

                <div className="stocks-section">
                    <p>
                        남북 통일이라는 가정 하에는 북한의 낙후된 인프라(도로, 철도, 주택, 발전소)를 재건하는 
                        <strong> 대규모 토목 및 건설 사업</strong>이 핵심이 될 것입니다. 과거 독일 사례와 한국의 건설 시장 구조를 고려할 때, 
                        다음과 같은 특성을 가진 기업들이 유망할 것으로 분석됩니다.
                    </p>

                    <h2>1. 인프라 및 토목 최강자: <span className="brand-red">현대건설</span></h2>
                    <p><strong>이유:</strong> 현대그룹은 과거 '현대아산'을 통해 대북 사업(금강산 관광, 개성공단 등)을 주도했던 경험과 노하우가 독보적입니다.</p>
                    <p><strong>강점:</strong> 도로, 철도, 교량 등 대규모 토목 공사 역량이 국내 최고 수준이며, 북한 내 주요 부지에 대한 우선권이나 네트워크를 활용할 가능성이 큽니다.</p>

                    <h2>2. 철도 및 물류 네트워크: GS건설 & 대우건설</h2>
                    <p><strong>이유:</strong> 유라시아 철도 연결 프로젝트가 가동되면 철도 및 터널 공사 경험이 많은 대형 건설사들이 필수적입니다.</p>
                    <p><strong>강점:</strong> GS건설과 대우건설은 고난도 토목 설계와 플랜트 경험이 풍부하여, 북한의 노후화된 산업 단지 재건과 에너지 망 구축에 유리합니다.</p>

                    <h2>3. 주택 및 신도시 개발: DL이앤씨 & HDC현대산업개발</h2>
                    <p><strong>이유:</strong> 평양을 비롯하여 主要 거점 도시에 한국형 아파트와 신도시 모델을 이식하는 사업이 전개될 것입니다.</p>
                    <p><strong>강점:</strong> 'e편한세상', '아이파크' 등 강력한 브랜드 파워와 대단지 아파트 시공 노하우를 가진 기업들이 주거 공급 사업을 독점할 가능성이 높습니다.</p>

                    <h2>4. 건자재 및 기초 소재: 쌍용C&E & 성신양회 (시멘트)</h2>
                    <p><strong>이유:</strong> 건물을 지으려면 시멘트, 철강, 골재가 필요합니다. 북한은 원자재는 많지만 이를 가공할 시설이 부족합니다.</p>
                    <p><strong>강점:</strong> 시멘트 수요가 폭증할 때 물류 비용을 절감하며 적기에 공급할 수 있는 국내 시멘트 상위 업체들이 직접적인 수혜를 입게 됩니다.</p>

                    <div className="highlight">
                        <h2>⚠️ 투자 관점에서의 주의사항</h2>
                        <p><strong>정치적 리스크:</strong> 통일의 방식(급진적 vs 점진적)에 따라 사업의 속도가 완전히 다릅니다.</p>
                        <p><strong>재원 조달:</strong> 수백 조 원에 달할 것으로 예상되는 통일 비용을 어떻게 감당하느냐에 따라 건설사의 수익성이 결정됩니다.</p>
                        <p><strong>현지 인력 활용:</strong> 북한 내 저렴한 노동력과 한국의 기술력이 어떻게 결합될.</p>
                   지가 관건입니다 </div>

                    <p style={{ textAlign: "center", marginTop: "40px", fontWeight: "bold" }}>
                        결론적으로, 역사적 상징성과 대북 사업 경험을 중시한다면 <span className="brand-red">현대건설</span>이, <br className="d-none d-sm-block" />
                        실질적인 인프라 구축과 원자재 공급 측면을 본다면 대형 토목 건설사와 시멘트 관련주가 가장 유망할 것으로 보입니다.
                    </p>
                </div>

                <div className="stocks-footer">
                    © 2026 대한民国統一後株券시장 分析
                </div>
            </div>
        </div>
    );
}
