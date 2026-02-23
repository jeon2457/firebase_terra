"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Database, Github, Cloud, Server, GitBranch, Code, Settings } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function VercelMongodbPage() {
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
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "30px 0" }}>
            <style>{`
                .vm-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    borderRadius: 20px;
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    overflow: "hidden"
                }
                .vm-header {
                    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                    color: white;
                    padding: 40px 20px;
                    textAlign: "center"
                }
                .vm-header h1 {
                    fontSize: "clamp(1.5rem, 4vw, 2.5em)";
                    marginBottom: 10px;
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
                }
                .vm-header p {
                    fontSize: "clamp(0.9rem, 2vw, 1.1em)";
                    opacity: 0.9
                }
                .vm-content {
                    padding: 30px 20px
                }
                .vm-section {
                    marginBottom: 40px
                }
                .vm-section h2 {
                    color: #1976d2;
                    fontSize: "clamp(1.2rem, 3vw, 2em)";
                    marginBottom: 20px;
                    paddingBottom: 10px;
                    borderBottom: "3px solid #1976d2"
                }
                .vm-section h3 {
                    color: #333;
                    fontSize: "clamp(1rem, 2.5vw, 1.5em)";
                    margin: "25px 0 15px 0",
                    paddingLeft: 15px,
                    borderLeft: "5px solid #764ba2"
                }
                .vm-card {
                    background: #f8f9fa;
                    borderRadius: 15px;
                    padding: 20px;
                    margin: "15px 0";
                    border: "2px solid #e0e0e0"
                }
                .vm-card h4 {
                    color: #1976d2;
                    fontSize: "clamp(0.95rem, 2vw, 1.2em)";
                    marginBottom: 10px
                }
                .vm-code {
                    background: #2d2d2d;
                    color: #f8f8f2;
                    padding: 15px;
                    borderRadius: 10px;
                    overflowX: "auto",
                    margin: "10px 0",
                    fontFamily: "'Consolas', 'Monaco', monospace",
                    fontSize: "clamp(0.7rem, 1.5vw, 0.9em)",
                    lineHeight: "1.5"
                }
                .vm-code .keyword { color: #66d9ef; }
                .vm-code .string { color: #a6e22e; }
                .vm-code .comment { color: #75715e; fontStyle: "italic" }
                .vm-warning {
                    background: #fff3cd;
                    border: "2px solid #ffc107";
                    borderRadius: 10px;
                    padding: 20px;
                    margin: "20px 0"
                }
                .vm-warning h4 { color: #856404; marginBottom: 10px }
                .vm-tip {
                    background: #d1ecf1;
                    border: "2px solid #17a2b8";
                    borderRadius: 10px;
                    padding: 20px;
                    margin: "20px 0"
                }
                .vm-tip h4 { color: #0c5460; marginBottom: 10px }
                .vm-success {
                    background: #d4edda;
                    border: "2px solid #28a745";
                    borderRadius: 10px;
                    padding: 20px;
                    margin: "20px 0"
                }
                .vm-success h4 { color: #155724; marginBottom: 10px }
                .vm-tag {
                    display: "inline-block",
                    background: #764ba2;
                    color: white;
                    padding: "5px 12px",
                    borderRadius: 20px,
                    fontSize: "0.85em",
                    margin: "3px",
                    fontWeight: "600"
                }
                .vm-table {
                    width: 100%;
                    borderCollapse: "collapse";
                    margin: "15px 0";
                    background: white;
                    borderRadius: 10px;
                    overflow: "hidden",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)"
                }
                .vm-table th {
                    background: #1976d2;
                    color: white;
                    padding: 12px;
                    textAlign: "left",
                    fontWeight: 600
                }
                .vm-table td {
                    padding: 12px;
                    borderBottom: "1px solid #e0e0e0"
                }
                .vm-table tr:hover { background: #f8f9fa }
                .vm-flow-step {
                    background: white;
                    padding: 15px;
                    margin: "10px 0";
                    borderRadius: 10px;
                    borderLeft: "5px solid #1976d2",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                }
                .vm-flow-step h4 {
                    color: #1976d2;
                    fontSize: "clamp(0.9rem, 2vw, 1.2em)",
                    marginBottom: 8px
                }
                .vm-arrow {
                    textAlign: "center",
                    fontSize: "1.5em",
                    color: #1976d2,
                    margin: "5px 0"
                }
                .back-btn {
                    display: inline-flex;
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    background: "white",
                    border: "2px solid #1976d2",
                    borderRadius: "30px",
                    color: "#1976d2",
                    fontWeight: "600",
                    textDecoration: "none",
                    margin: "20px",
                    transition: "all 0.3s",
                    cursor: "pointer"
                }
                .back-btn:hover {
                    background: "#1976d2",
                    color: "white"
                }
                .vm-nav {
                    background: #f8f9fa;
                    padding: 15px;
                    borderBottom: "3px solid #1976d2",
                    overflowX: "auto"
                }
                .vm-nav ul {
                    listStyle: "none",
                    display: "flex",
                    flexWrap: "nowrap",
                    gap: 10,
                    padding: 0,
                    margin: 0,
                    justifyContent: "flex-start"
                }
                .vm-nav a {
                    textDecoration: "none",
                    color: #1976d2,
                    padding: "8px 15px",
                    background: white,
                    borderRadius: 20px,
                    fontWeight: 600,
                    fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
                    transition: "all 0.3s",
                    border: "2px solid #1976d2",
                    whiteSpace: "nowrap"
                }
                .vm-nav a:hover {
                    background: #1976d2;
                    color: white
                }
                .vm-footer {
                    background: #2d2d2d;
                    color: white;
                    padding: 25px;
                    textAlign: "center"
                }
                .vm-footer p { opacity: 0.8 }
                .red-text { color: red }
                .blue-text { color: blue }
                @media (max-width: 768px) {
                    .vm-container {
                        margin: 10px
                    }
                    .vm-header {
                        padding: 30px 15px
                    }
                    .vm-content {
                        padding: 20px 15px
                    }
                    .vm-card {
                        padding: 15px
                    }
                }
            `}</style>

            <div className="vm-container">
                <div className="vm-header">
                    <h1>🚀 Vercel + Next.js + MongoDB 프로젝트 구조</h1>
                    <p>GitHub 저장소에서 Vercel 배포까지의 전체 흐름도</p>
                </div>

                <nav className="vm-nav">
                    <ul>
                        <li><a href="#overview">📋 개요</a></li>
                        <li><a href="#structure">📂 구조</a></li>
                        <li><a href="#flow">🔄 흐름</a></li>
                        <li><a href="#deployment">🚀 배포</a></li>
                        <li><a href="#github">🔧 GitHub</a></li>
                    </ul>
                </nav>

                <div className="vm-content">
                    <button className="back-btn" onClick={() => router.push("/learn")}>
                        <ArrowLeft size={18} /> 학습하기로
                    </button>

                    <section id="overview" className="vm-section">
                        <h2>📋 프로젝트 개요</h2>
                        
                        <div className="vm-success">
                            <h4>✅ 프로젝트 정보</h4>
                            <p><strong>프로젝트명:</strong> vercel_mongodb</p>
                            <p><strong>GitHub 저장소:</strong> https://github.com/jeon2457/vercel_mongodb</p>
                            <p><strong>Vercel URL:</strong> https://firebase-terra.vercel.app</p>
                            
                            <p className="blue-text">
                                <span className="red-text">[안내]</span> 이미지와 영상은 Cloudinary에 저장되고 URL만 MongoDB에 저장되도록 코드가 잘 설계되어 있습니다!
                            </p>
                            <ul>
                                <li>영수증 이미지 업로드 ( receipts )</li>
                                <li>Image 모델: Cloudinary URL만 저장</li>
                                <li>Cloud Name: dghx4ciwc / Upload Preset: direct_upload</li>
                                <li>무료 티어: MongoDB 512MB, Cloudinary 25GB</li>
                            </ul>
                        </div>

                        <h3>기술 스택</h3>
                        <div className="vm-card">
                            <span className="vm-tag">Next.js 14</span>
                            <span className="vm-tag">App Router</span>
                            <span className="vm-tag">TypeScript</span>
                            <span className="vm-tag">MongoDB</span>
                            <span className="vm-tag">NextAuth.js</span>
                            <span className="vm-tag">Vercel</span>
                            <span className="vm-tag">GitHub</span>
                            <span className="vm-tag">Bootstrap 5</span>
                        </div>
                    </section>

                    <section id="flow" className="vm-section">
                        <h2>🔄 데이터 흐름도</h2>

                        <h3>1. 사용자 인증 흐름</h3>
                        <div className="vm-card">
                            <div className="vm-flow-step">
                                <h4>Step 1: 로그인 요청</h4>
                                <p>사용자가 로그인 페이지에서 이메일/비밀번호 입력</p>
                            </div>
                            <div className="vm-arrow">⬇️</div>
                            <div className="vm-flow-step">
                                <h4>Step 2: NextAuth 인증 처리</h4>
                                <p>API 라우트에서 MongoDB 회원 정보 확인</p>
                            </div>
                            <div className="vm-arrow">⬇️</div>
                            <div className="vm-flow-step">
                                <h4>Step 3: 세션 생성 및 리다이렉트</h4>
                                <p>인증 성공 시 세션 생성 → 대시보드로 이동</p>
                            </div>
                        </div>

                        <h3>2. 회비납부 현황 조회 흐름</h3>
                        <div className="vm-card">
                            <div className="vm-flow-step">
                                <h4>Step 1: 페이지 접속</h4>
                                <p>사용자가 /fee/status 페이지 접속</p>
                            </div>
                            <div className="vm-arrow">⬇️</div>
                            <div className="vm-flow-step">
                                <h4>Step 2: 권한 확인</h4>
                                <p>세션에서 user_level 확인 (Level 10 이상만 수정 가능)</p>
                            </div>
                            <div className="vm-arrow">⬇️</div>
                            <div className="vm-flow-step">
                                <h4>Step 3: MongoDB 조회</h4>
                                <p>3개 컬렉션에서 데이터 가져오기 (members, account_pass, monthly_fee_history)</p>
                            </div>
                        </div>
                    </section>

                    <section id="deployment" className="vm-section">
                        <h2>🚀 배포 프로세스</h2>

                        <h3>자동 배포 흐름</h3>
                        <div className="vm-card">
                            <div className="vm-flow-step">
                                <h4>1. 로컬 개발</h4>
                                <div className="vm-code">
<span className="comment"># 로컬 개발 서버 실행</span>
npm run dev
<span className="comment"># http://localhost:3000 에서 테스트</span>
                                </div>
                            </div>
                            <div className="vm-arrow">⬇️</div>
                            <div className="vm-flow-step">
                                <h4>2. Git 커밋</h4>
                                <div className="vm-code">
git add .
git commit -m <span className="string">"feat: 새 기능 추가"</span>
                                </div>
                            </div>
                            <div className="vm-arrow">⬇️</div>
                            <div className="vm-flow-step">
                                <h4>3. GitHub 푸시</h4>
                                <div className="vm-code">git push origin main</div>
                            </div>
                            <div className="vm-arrow">⬇️</div>
                            <div className="vm-flow-step">
                                <h4>4. Vercel 자동 감지</h4>
                                <p>GitHub 저장소의 변경사항을 Vercel이 자동으로 감지하고 배포</p>
                            </div>
                        </div>

                        <div className="vm-tip">
                            <h4>💡 배포 확인 방법</h4>
                            <ol>
                                <li>Vercel 대시보드(https://vercel.com) 접속</li>
                                <li>프로젝트 선택</li>
                                <li>Deployments 탭에서 빌드 로그 확인</li>
                                <li>성공 시 자동으로 프로덕션에 반영됨</li>
                            </ol>
                        </div>
                    </section>

                    <section id="tips" className="vm-section">
                        <h2>⚠️ 주의사항 및 팁</h2>

                        <div className="vm-warning">
                            <h4>⚠️ 환경변수 관리 - 절대 Git에 커밋하지 말 것!</h4>
                            <p><strong>.env.local</strong> 파일은 반드시 .gitignore에 포함되어야 합니다.</p>
                            <div className="vm-code">
<span className="comment"># .gitignore</span>
.env.local
.env*.local
                            </div>
                        </div>

                        <div className="vm-tip">
                            <h4>💡 Vercel 환경변수 설정</h4>
                            <ol>
                                <li>Vercel 대시보드 {'>'} 프로젝트 선택</li>
                                <li>Settings {'>'} Environment Variables</li>
                                <li>필요한 변수 추가:
                                    <ul>
                                        <li>MONGODB_URI</li>
                                        <li>NEXTAUTH_SECRET</li>
                                        <li>CLOUDINARY_CLOUD_NAME</li>
                                        <li>CLOUDINARY_API_KEY</li>
                                        <li>CLOUDINARY_API_SECRET</li>
                                    </ul>
                                </li>
                            </ol>
                        </div>

                        <h3>빌드 에러 대처법</h3>
                        <table className="vm-table">
                            <thead>
                                <tr>
                                    <th>항목</th>
                                    <th>주의사항</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>TypeScript 에러</td>
                                    <td>타입 정의 확인, (session?.user as any) 타입 단언 사용</td>
                                </tr>
                                <tr>
                                    <td>import 에러</td>
                                    <td>경로 확인, 파일 확장자 확인, 대소문자 확인</td>
                                </tr>
                                <tr>
                                    <td>MongoDB 연결 에러</td>
                                    <td>MONGODB_URI 확인, Atlas 네트워크 접근 설정 확인</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section id="schema" className="vm-section">
                        <h2>🗄️ MongoDB 컬렉션 스키마</h2>

                        <h3>members (회원)</h3>
                        <div className="vm-code">
{`{
  _id: ObjectId,
  name: String,           // 회원명
  email: String,         // 이메일
  password: String,      // 암호화된 비밀번호
  user_level: Number,    // 권한 레벨 (1~10)
  createdAt: Date,
  updatedAt: Date
}`}
                        </div>

                        <h3>account_pass (회비 납부 기록)</h3>
                        <div className="vm-code">
{`{
  _id: ObjectId,
  member_id: ObjectId,   // members._id 참조
  pay_year: Number,      // 납부 연도 (2026)
  pay_month: Number,     // 납부 월 (1~12)
  paid: Number,          // 0: 미납, 1: 납부
  createdAt: Date,
  updatedAt: Date
}`}
                        </div>
                    </section>
                </div>

                <div className="vm-footer">
                    <p>📚 Vercel + Next.js + MongoDB 프로젝트 가이드</p>
                    <p>Last Updated: 2026년 2월</p>
                </div>
            </div>
        </div>
    );
}
