"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function OllamaClinePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const promptSymbol = "\u003E\u003E\u003E"; // >>> prompt symbol

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if (!session) {
        router.push("/login");
        return null;
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "30px 0" }}>
            <style dangerouslySetInnerHTML={{__html: `
                .oc-container {
                    max-width: 900px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                }
                .oc-title {
                    text-align: center;
                    color: #2563eb;
                    font-size: clamp(1.5rem, 4vw, 2.2rem);
                    border-bottom: 4px solid #2563eb;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                .oc-intro {
                    text-align: center;
                    margin-bottom: 30px;
                    color: #475569;
                }
                .oc-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 25px 0;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .oc-table th {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 12px;
                    text-align: center;
                    font-weight: 600;
                    font-size: clamp(0.9rem, 2vw, 1rem);
                }
                .oc-table td {
                    padding: 14px 12px;
                    text-align: center;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: clamp(0.85rem, 1.5vw, 0.95rem);
                }
                .oc-table tr:last-child td { border-bottom: none; }
                .oc-table tr:nth-child(even) { background: #f8fafc; }
                .oc-table tr:hover { background: #eff6ff; }
                .oc-table td:first-child {
                    text-align: left;
                    font-weight: 600;
                    background: #f1f5f9;
                }
                .oc-ollama { color: #7c3aed; font-weight: 700; }
                .oc-cline { color: #0891b2; font-weight: 700; }
                .oc-why {
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-radius: 15px;
                    padding: 25px;
                    margin: 25px 0;
                    text-align: center;
                }
                .oc-why h3 { color: #92400e; margin-bottom: 15px; }
                .oc-why p { color: #78350f; line-height: 1.9; }
                .oc-brain { color: #7c3aed; font-weight: 700; }
                .oc-hands { color: #0891b2; font-weight: 700; }
                .oc-step {
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                    background: #fff;
                    position: relative;
                }
                .oc-step-num {
                    position: absolute;
                    top: -15px;
                    left: 20px;
                    background: #2563eb;
                    color: white;
                    padding: 2px 15px;
                    border-radius: 20px;
                    font-weight: bold;
                }
                .oc-step h3 {
                    background: #eff6ff;
                    padding: 10px 20px;
                    border-radius: 10px;
                    color: #2563eb;
                    margin-top: 10px;
                }
                .oc-step ul { padding-left: 20px; }
                .oc-step li { margin-bottom: 10px; }
                .oc-code {
                    background: #1e1e1e;
                    color: #76c7ff;
                    padding: 3px 8px;
                    border-radius: 5px;
                    font-family: 'Consolas', monospace;
                    font-size: 0.9em;
                }
                .oc-tip {
                    background: #f0fdf4;
                    border-left: 5px solid #22c55e;
                    padding: 15px;
                    margin: 15px 0;
                }
                .oc-error {
                    background: #fef2f2;
                    border-left: 5px solid #ef4444;
                    padding: 15px;
                    margin: 15px 0;
                }
                .oc-highlight { color: #e11d48; font-weight: bold; }
                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: white;
                    border: 2px solid #2563eb;
                    border-radius: 30px;
                    color: #2563eb;
                    font-weight: 600;
                    margin-bottom: 30px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .back-btn:hover {
                    background: #2563eb;
                    color: white;
                }
                @media (max-width: 600px) {
                    .oc-container { padding: 20px 15px; margin: 0 10px; }
                    .oc-table th, .oc-table td { padding: 10px 6px; }
                }
            `}} />

            <div className="oc-container">
                <button className="back-btn" onClick={() => router.push("/learn")}>
                    <ArrowLeft size={18} /> 학습하기로
                </button>

                <h1 className="oc-title">🚀 Ollama & Cline 설치 완벽 가이드</h1>

                <div className="oc-intro">
                    <p>Ollama와 Cline은 Visual Studio Code(이하 VS Code)에서 AI를 활용해 개발 생산성을 높이기 위한 도구들입니다.</p>
                </div>

                <table className="oc-table">
                    <thead>
                        <tr>
                            <th>도구</th>
                            <th>용도</th>
                            <th>특징</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span className="oc-ollama">Ollama</span></td>
                            <td>로컬 환경에서 대규모 언어 모델(LLM)을 실행하는 플랫폼</td>
                            <td>
                                • GPT, LLaMA, Code Llama 같은 다양한 모델을 다운로드 후 내 PC에서 직접 실행 가능<br />
                                • 클라우드 의존 없이 로컬에서 AI를 돌리므로 데이터 프라이버시 보장<br />
                                • API 형태로 VS Code 같은 개발 툴과 연동 가능
                            </td>
                        </tr>
                        <tr>
                            <td><span className="oc-cline">Cline</span></td>
                            <td>VS Code용 AI 코딩 어시스턴트 확장 프로그램</td>
                            <td>
                                • Ollama 같은 로컬 LLM과 연결해 코드 자동완성, 코드 생성, 디버깅 지원<br />
                                • 채팅 인터페이스를 통해 AI에게 코드 관련 질문 가능<br />
                                • GitHub Copilot과 유사하지만, 로컬 모델 기반으로 동작
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="oc-why">
                    <h3>왜 같이 쓰는가?</h3>
                    <p>
                        Ollama는 <span className="oc-brain">"AI 엔진"</span> 역할을 하고,<br />
                        Cline은 VS Code에서 Ollama를 불러와 개발자 친화적인 인터페이스를 제공하는 확장 프로그램입니다.
                    </p>
                    <p>
                        즉, Ollama가 <strong>두뇌(모델 실행기)</strong>라면, Cline은 <strong>손과 눈(IDE 확장)</strong> 역할을 하는 셈이죠.<br />
                        개발자는 클라우드 비용 없이, 로컬에서 강력한 AI 코딩 지원을 받을 수 있습니다.
                    </p>
                </div>

                <p style={{ textAlign: "center", color: "#64748b" }}>이 문서는 실제 설치 과정을 바탕으로 작성된 학습용 가이드입니다.</p>

                <div className="oc-step">
                    <div className="oc-step-num">단계 1</div>
                    <h3>STEP 1. Ollama 설치 및 서버 실행</h3>
                    <ul>
                        <li><strong>엔진 다운로드:</strong> <a href="https://ollama.com" target="_blank" rel="noopener noreferrer">Ollama 공식 홈페이지</a>에서 Windows용 설치 파일을 받습니다.</li>
                        <li><strong>프로그램 설치:</strong> 다운로드된 파일을 실행하고 <span className="oc-code">Install</span> 버튼을 누릅니다.</li>
                        <li><strong>상태 확인:</strong> 윈도우 우측 하단 <strong>작업 표시줄</strong>에 라마 아이콘이 떠 있어야 합니다. 이 아이콘이 없으면 AI가 작동하지 않습니다.</li>
                    </ul>
                </div>

                <div className="oc-step">
                    <div className="oc-step-num">단계 2</div>
                    <h3>STEP 2. 터미널(Git Bash)을 이용한 모델 구축</h3>
                    <ul>
                        <li><strong>Git Bash 실행:</strong> 명령어를 입력하기 위해 터미널을 엽니다.</li>
                        <li><strong>모델 설치 명령어 입력:</strong> 
                            <br /><span className="oc-code">ollama run qwen2.5-coder:7b</span>
                        </li>
                        <li className="oc-error"><strong>⚠️ 주의했던 에러:</strong> 웹에서 명령어를 복사해 붙여넣으면 보이지 않는 공백문자가 섞여 <span className="oc-code">command not found</span>가 발생할 수 있습니다. <strong>반드시 직접 타이핑</strong>하는 습관을 들입시다.</li>
                        <li><strong>완료 확인:</strong> 다운로드가 100% 완료되고 <span className="oc-code">{promptSymbol}</span>가 뜨면 성공입니다. <span className="oc-code">/exit</span>로 빠져나옵니다.</li>
                    </ul>
                </div>

                <div className="oc-step">
                    <div className="oc-step-num">단계 3</div>
                    <h3>STEP 3. VS Code 확장 프로그램(Cline) 세팅</h3>
                    <ul>
                        <li><strong>Extension 설치:</strong> VS Code 왼쪽 블록 아이콘에서 <span className="oc-code">Cline</span>을 검색하여 설치합니다. (유사품 주의: 200만 명 이상이 쓰는 정식 버전을 선택!)</li>
                        <li><strong>아이콘 고정:</strong> 아이콘이 안 보인다면 왼쪽 메뉴 바 빈 곳에서 <strong>마우스 오른쪽 클릭</strong> 후 <span className="oc-code">Cline</span>을 체크하여 활성화합니다.</li>
                        <li><strong>초기 화면 진입:</strong> <span className="oc-code">Bring my own API key</span>를 선택하고 <span className="oc-code">Continue</span>를 눌러 설정 창으로 이동합니다.</li>
                    </ul>
                </div>

                <div className="oc-step">
                    <div className="oc-step-num">단계 4</div>
                    <h3>STEP 4. Cline과 Ollama 연동 설정</h3>
                    <p>Cline 화면 우측 상단의 <span className="oc-highlight">톱니바퀴(⚙️)</span>를 눌러 아래와 같이 설정합니다.</p>
                    <ul>
                        <li><strong>API Provider:</strong> <span className="oc-code">Ollama</span> 선택</li>
                        <li><strong>Model:</strong> <span className="oc-code">qwen2.5-coder:7b</span> (목록에서 선택하거나 직접 입력)</li>
                        <li className="oc-tip"><strong>💡 참고:</strong> "Does not support Mcp" 같은 붉은 글씨는 로컬 AI의 제약사항일 뿐, 사용에 전혀 문제가 없는 정상 상태입니다.</li>
                        <li><strong>저장:</strong> 맨 아래 <span className="oc-code">Done</span> 또는 <span className="oc-code">Continue</span>를 눌러 채팅창으로 나갑니다.</li>
                    </ul>
                </div>

                <div className="oc-step">
                    <div className="oc-step-num">단계 5</div>
                    <h3>STEP 5. 실제 활용 및 유지보수</h3>
                    <ul>
                        <li><strong>프로젝트 분석:</strong> 채팅창에 <span className="oc-code">@codebase</span>를 입력하고 질문하면 내 폴더 전체를 읽습니다.</li>
                        <li><strong>버전 업데이트:</strong> Ollama 모델은 자동으로 업데이트되지 않으므로, 가끔 터미널에서 <span className="oc-code">ollama pull qwen2.5-coder:7b</span>를 입력해 최신화합니다.</li>
                        <li><strong>창 닫기:</strong> VS Code를 닫아도 Ollama(라마 아이콘)가 켜져 있다면 다음 실행 시 바로 사용할 수 있습니다.</li>
                    </ul>
                </div>

                <p style={{ textAlign: "center", fontWeight: "bold", marginTop: 50 }}>이제 AI와 함께 스마트한 코딩을 시작해보세요! 🎉</p>
            </div>
        </div>
    );
}
