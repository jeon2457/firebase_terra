"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ManualPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        document.title = "시스템 매뉴얼";
    }, [status, router]);

    const copyTree = () => {
        const treeContent = `C:\\GitHub\\vercel_mongodb\\vercel_mongodb
│
├─ .git/
├─ next-app/
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ api/
│  │  │  │  ├─ auth/
│  │  │  │  ├─ backup/
│  │  │  │  ├─ members/
│  │  │  │  ├─ obituary/
│  │  │  │  └─ restore/
│  │  │  ├─ (auth)/
│  │  │  ├─ dashboard/
│  │  │  ├─ invitation/
│  │  │  ├─ manual/
│  │  │  ├─ obituary-create/
│  │  │  ├─ obituary-sms/
│  │  │  ├─ obituary-view/
│  │  │  ├─ sms-obituary/
│  │  │  ├─ sms-wedding/
│  │  │  └─ backup/
│  │  ├─ components/
│  │  ├─ lib/
│  │  ├─ models/
│  │  └─ styles/
│  ├─ public/
│  ├─ package.json
│  └─ next.config.js
├─ vendor/
│  └─ mongodb/
└─ (기타 PHP 파일들)`;
        
        navigator.clipboard.writeText(treeContent).then(() => {
            alert('프로젝트 구조가 복사되었습니다.');
        });
    };

    useEffect(() => {
        const topBtn = document.getElementById('scrollToTop');
        
        const handleScroll = () => {
            if (!topBtn) return;
            if (window.scrollY > 300) {
                topBtn.style.display = 'flex';
            } else {
                topBtn.style.display = 'none';
            }
        };

        const scrollToTop = () => {
            const duration = 1000;
            const start = window.scrollY;
            const startTime = performance.now();

            function easeInOutCubic(t: number) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }

            function animateScroll(currentTime: number) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = easeInOutCubic(progress);

                window.scrollTo(0, start * (1 - easeProgress));

                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                }
            }

            requestAnimationFrame(animateScroll);
        };

        window.addEventListener('scroll', handleScroll);
        topBtn?.addEventListener('click', scrollToTop);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            topBtn?.removeEventListener('click', scrollToTop);
        };
    }, []);

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <>
            <style jsx global>{`
                :root {
                    --bg: #f8f9fa;
                    --fg: #333;
                    --dim: #666;
                    --accent: #4e73df;
                    --border: #e3e6f0;
                    --header-border: #667eea;
                    --secondary-color: #764ba2;
                }

                body {
                    background-color: var(--bg);
                    font-family: 'Noto Sans KR', sans-serif;
                    line-height: 1.6;
                    color: var(--fg);
                    word-break: break-word;
                    overflow-x: hidden;
                    margin: 0;
                    padding: 0;
                }

                .container {
                    max-width: 1000px;
                    margin: 40px auto;
                    padding: 0 16px;
                    box-sizing: border-box;
                }

                .manual-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid var(--header-border);
                }

                .manual-header h1 {
                    font-weight: 900;
                    color: #4a4a4a;
                    word-break: keep-all;
                }

                .manual-header p {
                    color: #666;
                    font-size: 1.1rem;
                }

                .section-card {
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                    padding: 30px;
                    margin-bottom: 30px;
                    border-left: 5px solid var(--header-border);
                    overflow-wrap: break-word;
                    min-width: 0;
                }

                @media (max-width: 576px) {
                    .container {
                        padding: 0 12px;
                    }
                    .section-card {
                        padding: 20px 15px;
                    }
                    .manual-header h1 {
                        font-size: 1.6rem;
                    }
                    .code-box {
                        padding: 15px 10px !important;
                        font-size: 12.5px !important;
                    }
                }

                .section-title {
                    font-size: 1.35rem;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    word-break: keep-all;
                    flex-wrap: wrap;
                }

                .code-box {
                    background: #282c34;
                    color: #abb2bf;
                    padding: 18px;
                    border-radius: 8px;
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 0.9rem;
                    margin: 15px 0;
                    white-space: pre-wrap;
                    word-break: break-all;
                    overflow-wrap: break-word;
                    line-height: 1.5;
                    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
                }

                .code-box::-webkit-scrollbar {
                    display: none;
                }

                .cmd {
                    color: #61afef;
                    font-weight: bold;
                }

                .path {
                    color: #98c379;
                    word-break: break-all;
                }

                .comment {
                    color: #7f848e;
                    font-style: italic;
                }

                .keyword {
                    color: #c678dd;
                }

                .string {
                    color: #98c379;
                    word-break: break-all;
                }

                .note {
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 15px 0;
                    font-size: 0.95rem;
                }

                .alert-custom {
                    background: #eef2ff;
                    border: 1px solid var(--header-border);
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    word-break: keep-all;
                }

                .db-tree {
                    list-style: none;
                    padding-left: 10px;
                    border-left: 2px solid #ddd;
                    font-family: 'Consolas', monospace;
                    font-size: 0.9rem;
                    word-break: break-all;
                }

                .db-tree li {
                    margin: 5px 0;
                    position: relative;
                    padding-left: 15px;
                }

                .db-tree li::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 12px;
                    width: 10px;
                    height: 2px;
                    background: #ddd;
                }

                .table-custom {
                    font-size: 0.9rem;
                    vertical-align: middle;
                    width: 100%;
                    table-layout: fixed;
                }

                .table-custom th,
                .table-custom td {
                    word-break: break-all;
                    overflow-wrap: break-word;
                }

                .table-custom thead {
                    background: var(--header-border);
                    color: white;
                }

                .url-link {
                    font-family: 'Consolas', monospace;
                    font-size: 0.85rem;
                    text-decoration: none;
                    color: #1976d2;
                    display: inline-block;
                }

                .account-info {
                    background: #f1f3f9;
                    padding: 15px;
                    border-radius: 10px;
                    border: 1px dashed var(--header-border);
                    height: 100%;
                    word-break: break-all;
                }

                .account-label {
                    font-weight: bold;
                    color: var(--header-border);
                    font-size: 0.9rem;
                    margin-bottom: 5px;
                    display: block;
                }

                .caption {
                    color: var(--dim);
                    margin: 10px 0 6px;
                    font-size: 0.95rem;
                }

                .btn-row {
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                }

                .btn-copy {
                    background: #16213a;
                    color: #e2e8f0;
                    border: 1px solid #1f2937;
                    border-radius: 8px;
                    padding: 8px 12px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background 0.2s;
                    width: 100%;
                }

                .btn-copy:hover {
                    background: #1a2545;
                }

                .tree-link {
                    color: #61afef;
                    text-decoration: none;
                }

                .tree-link:hover {
                    text-decoration: underline;
                    color: #98c379;
                }

                #scrollToTop {
                    position: fixed;
                    bottom: 25px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    background: white;
                    color: var(--secondary-color);
                    border: 2px solid var(--secondary-color);
                    border-radius: 50%;
                    display: none;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    z-index: 1000;
                    transition: all 0.3s ease;
                    font-size: 20px;
                }

                #scrollToTop:hover {
                    background: var(--secondary-color);
                    color: white;
                    transform: translateY(-5px);
                }

                .btn-back {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px 30px;
                    background: white;
                    color: #667eea;
                    border: 2px solid #667eea;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 16px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                    margin: 40px auto 20px;
                    width: 100%;
                    max-width: 220px;
                }

                .btn-back:hover {
                    background: #667eea;
                    color: #fff;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
                    text-decoration: none;
                }

                .center-wrapper {
                    text-align: center;
                    margin-bottom: 50px;
                }

                .full-width-image {
                    width: 100vw;
                    position: relative;
                    left: 50%;
                    right: 50%;
                    margin-left: -50vw;
                    margin-right: -50vw;
                    margin-bottom: 30px;
                }

                .full-width-image img {
                    width: 100%;
                    height: auto;
                    display: block;
                }
            `}</style>

            <div className="container">
                <div className="manual-header">
                    <h1>🛠️ TerraOne 시스템 운영 매뉴얼</h1>
                    <p>Next.js 14 + Vercel + MongoDB 기반 웹 서버 운영 가이드</p>
                </div>

                {/* 1번 */}
                <div className="section-card">
                    <div className="section-title">
                        <i className="bi bi-cloud-check"></i> 1. 서버 환경 및 연동 정보
                    </div>
                    <div className="alert-custom">
                        <i className="bi bi-info-circle-fill text-primary"></i>{' '}
                        <strong>[알림]</strong> 이 시스템은 <strong>Next.js 14 (App Router)</strong>와{' '}
                        <strong>MongoDB Atlas</strong>를 기반으로 가동됩니다.
                    </div>
                    <p>
                        이 웹사이트는 기존 PHP 방식에서 Next.js + Vercel + MongoDB로 마이그레이션되었습니다.
                        데이터베이스는 MongoDB Atlas에서 관리되고, Vercel을 통해 자동 배포됩니다.
                        코드는 GitHub 저장소와 연동되어 지속적인 통합/배포(CI/CD)가 이루어집니다. <span style={{ color: 'red' }}>
                        즉,내컴퓨터에 원본데이타가 있고 데이타가 생성되거나 수정되면 곧바로 깃허브에 커밋,푸시로 업로드하면 
                        깃허브에서 변경된 데이타가 Vercel로 자동으로 푸시되면 Vercel에서 자동으로 배포됩니다.</span>
                    </p>
                    <ul>
                        <li>
                            <strong>로컬 작업 경로:</strong>{' '}
                            <code className="path">c:\GitHub_vercel_mongodb\vercel_mongodb\next-app</code>{' '}
                            (Next.js 프로젝트)
                        </li>
                        <li>
                            <strong>GitHub 저장소:</strong>{' '}
                            <span className="badge bg-secondary">jeon2457/vercel_mongodb</span>
                        </li>
                        <li>
                            <strong>Vercel 배포 주소:</strong>{' '}
                            <a href="https://vercel.com/jeon2457/vercel-mongodb" target="_blank">
                                Vercel Dashboard
                            </a>
                        </li>
                        <li>
                            <strong>MongoDB Atlas:</strong>{' '}
                            <a href="https://cloud.mongodb.com/" target="_blank">
                                MongoDB Atlas Console
                            </a>
                        </li>
                    </ul>
                </div>

                {/* 2번 */}
                <div className="section-card">
                    <div className="section-title">
                        <i className="bi bi-git"></i> 2. Next.js 특징 및 코드 구조 이해
                    </div>
                    
                    <h6>🔷 Next.js란?</h6>
                    <p>
                        <strong>Next.js</strong>는 React 기반의 프레임워크로, 서버 사이드 렌더링(SSR)과 
                        정적 사이트 생성(SSG)을 지원합니다. 이점으로 SEO 최적화, 빠른 페이지 로딩, 
                        개발 생산성 향상을 얻을 수 있습니다.
                    </p>
                    <ul>
                        <li><strong>App Router:</strong> 최신 라우팅 방식 (폴더 기반)</li>
                        <li><strong>Server Components:</strong> 기본적으로 서버에서 렌더링</li>
                        <li><strong>API Routes:</strong> 별도 백엔드 서버 없이 API 생성 가능</li>
                        <li><strong>Automatic Code Splitting:</strong> 필요한 코드만 로드</li>
                    </ul>

                    <h6>🔷 순수 HTML과 Next.js의 차이점</h6>
                    <div className="table-responsive">
                        <table className="table table-bordered table-custom">
                            <thead>
                                <tr>
                                    <th>구분</th>
                                    <th>순수 HTML/PHP</th>
                                    <th>Next.js</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>렌더링</td>
                                    <td>클라이언트 사이드 (브라우저)</td>
                                    <td>서버 사이드 + 클라이언트 하이브리드</td>
                                </tr>
                                <tr>
                                    <td>데이터 처리</td>
                                    <td>페이지 새로고침 필요</td>
                                    <td>AJAX로 비동기 처리 (SPA)</td>
                                </tr>
                                <tr>
                                    <td>SEO</td>
                                    <td>완벽함 (완전한 HTML 제공)</td>
                                    <td>우수함 (서버 렌더링 가능)</td>
                                </tr>
                                <tr>
                                    <td>개발 구조</td>
                                    <td>파일별 독립적</td>
                                    <td>컴포넌트 기반 (재사용성)</td>
                                </tr>
                                <tr>
                                    <td>빌드 필요</td>
                                    <td>불필요 (그대로 제공)</td>
                                    <td>필요 (번들링/최적화)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h6>🔷 파일 확장자 (.ts vs .tsx)</h6>
                    <ul>
                        <li>
                            <strong>.ts (TypeScript):</strong>{' '}
                            JavaScript에 타입 기능만 추가. JSX(HTML 태그) 사용 불가.
                        </li>
                        <li>
                            <strong>.tsx (TypeScript + JSX):</strong>{ ' '}
                            TypeScript와 JSX 모두 사용 가능. React 컴포넌트 작성에 필수.
                        </li>
                    </ul>
                    <div className="code-box">
                        <span className="comment">// .ts 예시 - 타입 정의만 있는 파일</span>
                        <br />
                        <span className="keyword">export</span> <span className="keyword">interface</span> Member {'{'}
                        <br />
                        &nbsp;&nbsp;_id: <span className="string">string</span>;
                        <br />
                        &nbsp;&nbsp;name: <span className="string">string</span>;
                        <br />
                        &nbsp;&nbsp;tel: <span className="string">string</span>;
                        <br />
                        {'}'}
                        <br /><br />
                        <span className="comment">// .tsx 예시 - React 컴포넌트 (JSX 포함)</span>
                        <br />
                        <span className="keyword">export default</span> <span className="keyword">function</span> Page() {'{'}
                        <br />
                        &nbsp;&nbsp;<span className="keyword">return</span> (<div>안녕하세요</div>);
                        <br />
                        {'}'}
                    </div>

                    <h6>🔷 프로젝트 파일 구조 및 배치</h6>
                    <div className="table-responsive">
                        <table className="table table-bordered table-custom">
                            <thead>
                                <tr>
                                    <th>디렉토리/파일</th>
                                    <th>역할</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><code>src/app/</code></td>
                                    <td>Next.js 페이지 및 API 라우트 (App Router)</td>
                                </tr>
                                <tr>
                                    <td><code>src/components/</code></td>
                                    <td>재사용 가능한 React 컴포넌트</td>
                                </tr>
                                <tr>
                                    <td><code>src/lib/</code></td>
                                    <td>유틸리티 함수, DB 연결 등</td>
                                </tr>
                                <tr>
                                    <td><code>src/models/</code></td>
                                    <td>Mongoose 데이터 모델 (스키마 정의)</td>
                                </tr>
                                <tr>
                                    <td><code>public/</code></td>
                                    <td>정적 파일 (이미지, 폰트 등)</td>
                                </tr>
                                <tr>
                                    <td><code>package.json</code></td>
                                    <td>프로젝트 의존성 및 스크립트</td>
                                </tr>
                                <tr>
                                    <td><code>next.config.ts</code></td>
                                    <td>Next.js 설정 파일</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h6>🔷 주요 import 코드 및 역할</h6>
                    <div className="code-box">
                        <span className="comment">// ========== 페이지/컴포넌트 관련 import ==========</span>
                        <br />
                        <span className="keyword">import</span> {'{ useState, useEffect }'} <span className="keyword">from</span> <span className="string">"react"</span>; 
                        <span className="comment"> // React Hooks (상태관리, 부수효과)</span>
                        <br />
                        <span className="keyword">import</span> {'{ useSession }'} <span className="keyword">from</span> <span className="string">"next-auth/react"</span>; 
                        <span className="comment"> // 인증 세션 관리</span>
                        <br />
                        <span className="keyword">import</span> {'{ useRouter }'} <span className="keyword">from</span> <span className="string">"next/navigation"</span>; 
                        <span className="comment"> // 페이지 이동</span>
                        <br /><br />
                        <span className="comment">// ========== UI 프레임워크 ==========</span>
                        <br />
                        <span className="keyword">import</span> <span className="string">"bootstrap/dist/css/bootstrap.min.css"</span>; 
                        <span className="comment"> // Bootstrap 스타일</span>
                        <br /><br />
                        <span className="comment">// ========== 데이터베이스 관련 ==========</span>
                        <br />
                        <span className="keyword">import</span> dbConnect <span className="keyword">from</span> <span className="string">"@/lib/mongodb"</span>; 
                        <span className="comment"> // Mongoose MongoDB 연결</span>
                        <br />
                        <span className="keyword">import</span> Member <span className="keyword">from</span> <span className="string">"@/models/Member"</span>; 
                        <span className="comment"> // 회원 데이터 모델</span>
                        <br /><br />
                        <span className="comment">// ========== API 호출 ==========</span>
                        <br />
                        <span className="keyword">import</span> axios <span className="keyword">from</span> <span className="string">"axios"</span>; 
                        <span className="comment"> // HTTP 클라이언트</span>
                    </div>

                    <h6>🔷 접속정보 저장 위치</h6>
                    <div className="table-responsive">
                        <table className="table table-bordered table-custom">
                            <thead>
                                <tr>
                                    <th>종류</th>
                                    <th>저장 위치</th>
                                    <th>파일 경로</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>MongoDB URI</td>
                                    <td>Vercel Dashboard</td>
                                    <td><code>Settings → Environment Variables</code></td>
                                </tr>
                                <tr>
                                    <td>NextAuth Secret</td>
                                    <td>Vercel Dashboard</td>
                                    <td><code>Settings → Environment Variables</code></td>
                                </tr>
                                <tr>
                                    <td>GitHub 연동</td>
                                    <td>Vercel Dashboard</td>
                                    <td><code>Settings → Git</code></td>
                                </tr>
                                <tr>
                                    <td>DB 연결 코드</td>
                                    <td>로컬/서버 코드</td>
                                    <td><code>src/lib/mongodb.ts</code></td>
                                </tr>
                                <tr>
                                    <td>MongoDB 클라이언트</td>
                                    <td>로컬/서버 코드</td>
                                    <td><code>src/lib/db.ts</code></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="note">
                        <strong>💡 핵심 포인트:</strong> 민감한 접속정보(MONGODDB_URI, NEXTAUTH_SECRET 등)는 
                        절대로 코드에 직접 입력하지 마세요. 반드시 Vercel 환경변수로 관리하고, 
                        코드에서는 <code>process.env.변수명</code>으로 접근합니다. 그러므로 내컴퓨터 원본코드가 있는
                        Vercel_Mongodb폴더내에 있는 .git 폴더는 절대로 깃허브로 업로드하면 안된다.
                    </div>

                    <h6 className="mt-4">🔷 DB 연결 코드 예시 (src/lib/mongodb.ts)</h6>
                    <div className="code-box">
                        <span className="keyword">import</span> mongoose <span className="keyword">from</span> <span className="string">'mongoose'</span>;
                        <br /><br />
                        <span className="keyword">const</span> MONGODB_URI = <span className="keyword">process.env</span>.MONGODB_URI!;
                        <br /><br />
                        <span className="keyword">async function</span> dbConnect() {'{'}
                        <br />
                        &nbsp;&nbsp;<span className="comment">// 캐시된 연결이 있으면 재사용</span>
                        <br />
                        &nbsp;&nbsp;<span className="keyword">if</span> (cached.conn) {'{'}
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span> cached.conn;
                        <br />
                        &nbsp;&nbsp;{'}'}
                        <br /><br />
                        &nbsp;&nbsp;<span className="comment">// 새 연결 생성</span>
                        <br />
                        &nbsp;&nbsp;cached.promise = mongoose.connect(MONGODB_URI, {'{'}
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;dbName: <span className="string">'terraone_mongo'</span>
                        <br />
                        &nbsp;&nbsp;{'}'});
                        <br />
                        &nbsp;&nbsp;cached.conn = <span className="keyword">await</span> cached.promise;
                        <br />
                        &nbsp;&nbsp;<span className="keyword">return</span> cached.conn;
                        <br />
                        {'}'}
                    </div>

                    <h6 className="mt-4">🔷 서버 업데이트 및 배포 (CI/CD)</h6>
                    <p>
                        코드를 수정한 후 서버에 업데이트할 때는 <strong>Git 명령어</strong>를 통해 GitHub에
                        푸시하면 Vercel에서 자동으로 배포됩니다.
                    </p>

                    <h6>Step 1: 작업 경로 이동</h6>
                    <div className="code-box">
                        <span className="cmd">cd c:\GitHub_vercel_mongodb\vercel_mongodb</span>
                        <span className="comment">
                            # Next.js 프로젝트 루트 디렉토리로 이동
                        </span>
                    </div>

                    <h6>Step 2: Git 상태 확인 및 커밋</h6>
                    <div className="code-box">
                        <span className="cmd">git status</span>
                        <span className="comment"># 수정된 파일 확인</span>
                        <br />
                        <span className="cmd">git add .</span>
                        <span className="comment"># 모든 변경사항 스테이징</span>
                        <br />
                        <span className="cmd">git commit -m "커밋 메시지"</span>
                        <span className="comment"># 변경사항 커밋</span>
                    </div>

                    <h6>Step 3: GitHub에 푸시</h6>
                    <div className="code-box">
                        <span className="cmd">git push origin main</span>
                        <span className="comment"># GitHub에 변경사항 푸시</span>
                    </div>

                    <div className="note">
                        <strong>핵심 개념:</strong> GitHub에 푸시하면 Vercel Webhook이 자동으로 감지하여
                        빌드 및 배포를 시작합니다. 수동 배포는 필요 없습니다.
                    </div>
                </div>

                {/* 3번 */}
                <div className="section-card">
                    <div className="section-title">
                        <i className="bi bi-diagram-3-fill"></i> 3. 시스템 아키텍처 및 데이터 흐름
                    </div>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="account-info">
                                <span className="account-label">프론트엔드 (Next.js)</span>
                                <strong>Framework:</strong> Next.js 14 (App Router)
                                <br />
                                <strong>Styling:</strong> Tailwind CSS + Bootstrap 5
                                <br />
                                <strong>Auth:</strong> NextAuth.js
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="account-info">
                                <span className="account-label">백엔드 (MongoDB)</span>
                                <strong>Database:</strong> MongoDB Atlas
                                <br />
                                <strong>ODM:</strong> Mongoose
                                <br />
                                <strong>API:</strong> Next.js API Routes
                            </div>
                        </div>
                    </div>

                    <h6 className="mt-4">데이터 흐름도</h6>
                    <div className="code-box">
                        <span className="comment"># 사용자 요청 처리 흐름</span>
                        <br />
                        1. 사용자 → Vercel 배포 사이트 접속
                        <br />
                        2. Next.js 페이지 렌더링 (SSR/SSG)
                        <br />
                        3. API Routes 호출 (/api/*)
                        <br />
                        4. MongoDB Atlas 데이터 CRUD
                        <br />
                        5. 결과 반환 및 UI 업데이트
                    </div>
                </div>

                {/* 4번 */}
                <div className="section-card">
                    <div className="section-title">
                        <i className="bi bi-hdd-network"></i> 4. 데이터베이스 스키마 구조
                    </div>
                    <p>MongoDB는 아래와 같은 컬렉션(Collection) 구조로 이루어져 있습니다.</p>

                    <ul className="db-tree">
                        <li>
                            <strong>members</strong>: 회원 정보 (id, name, tel, addr, user_level 등)
                        </li>
                        <li>
                            <strong>obituaries</strong>: 부고장 정보 (intro, deceasedName, funeralInfo 등)
                        </li>
                        <li>
                            <strong>users</strong>: NextAuth.js 사용자 인증 정보
                        </li>
                    </ul>

                    <div className="note">
                        <i className="bi bi-database"></i>{' '}
                        <strong>MongoDB 특징:</strong> NoSQL 기반으로 유연한 스키마를 가지며,
                        Mongoose ODM을 통해 타입 안정성을 확보합니다.
                    </div>
                </div>

                {/* 5번 */}
                <div className="section-card">
                    <div className="section-title">
                        <i className="bi bi-shield-check"></i> 5. Vercel과 GitHub 연동 관계
                    </div>
                    <div className="alert-custom">
                        <i className="bi bi-link-45deg text-warning"></i>{' '}
                        <strong>CI/CD 파이프라인</strong>
                    </div>
                    <p>
                        Vercel은 GitHub 저장소와 직접 연동되어 자동 배포를 수행합니다.
                    </p>
                    <ul>
                        <li>
                            <strong>트리거:</strong> GitHub main 브랜치에 푸시 시 자동 배포
                        </li>
                        <li>
                            <strong>빌드:</strong> Next.js 프로젝트 자동 빌드 및 최적화
                        </li>
                        <li>
                            <strong>배포:</strong> Vercel CDN을 통한 전 세계 배포
                        </li>
                        <li>
                            <strong>환경변수:</strong> Vercel Dashboard에서 관리 (MONGODB_URI, NEXTAUTH_SECRET 등)
                        </li>
                    </ul>

                    <h6 className="mt-4">주의사항</h6>
                    <ul>
                        <li>
                            <span className="text-danger fw-bold">환경변수 관리:</span> MongoDB 연결 문자열,
                            NextAuth 시크릿키 등은 Vercel 환경변수에만 저장해야 합니다.
                        </li>
                        <li>
                            <span className="text-danger fw-bold">보안:</span> 코드에 민감 정보를
                            절대 포함하지 마세요. GitHub에 공개됩니다.
                        </li>
                    </ul>
                </div>

                {/* 6번 */}
                <div className="section-card">
                    <div className="section-title">
                        <i className="bi bi-list-columns-reverse"></i> 6. 시스템 전체 페이지 목록
                    </div>
                    <p>Next.js App Router 기반 주요 페이지 목록입니다.</p>

                    <div className="table-responsive">
                        <table className="table table-bordered table-custom">
                            <thead>
                                <tr>
                                    <th style={{ width: '35%' }}>구분 / 페이지 명칭</th>
                                    <th>URL 주소</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="table-light">
                                    <td colSpan={2} className="fw-bold text-center bg-light">
                                        🌐 기본 진입 & 허브
                                    </td>
                                </tr>
                                <tr>
                                    <td>🏠 대시보드 (관리자)</td>
                                    <td>
                                        <a href="/dashboard" className="url-link" target="_blank">
                                            /dashboard
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>🔐 로그인 페이지</td>
                                    <td>
                                        <a href="/login" className="url-link" target="_blank">
                                            /login
                                        </a>
                                    </td>
                                </tr>
                                <tr className="table-info">
                                    <td>
                                        <strong>💌 초대장 만들기</strong>
                                    </td>
                                    <td>
                                        <a href="/invitation" className="url-link" target="_blank">
                                            /invitation
                                        </a>
                                    </td>
                                </tr>

                                <tr className="table-light">
                                    <td colSpan={2} className="fw-bold text-center bg-light">
                                        👤 회원 관리 시스템
                                    </td>
                                </tr>
                                <tr>
                                    <td>회원연락망 열람</td>
                                    <td>
                                        <a href="/tel-view" className="url-link" target="_blank">
                                            /tel-view
                                        </a>
                                    </td>
                                </tr>
                                <tr className="table-info">
                                    <td>회원 관리 (수정/삭제)</td>
                                    <td>
                                        <a href="/members" className="url-link" target="_blank">
                                            /members
                                        </a>
                                    </td>
                                </tr>

                                <tr className="table-light">
                                    <td colSpan={2} className="fw-bold text-center bg-light">
                                        📋 부고장 관리
                                    </td>
                                </tr>
                                <tr>
                                    <td>부고장 생성</td>
                                    <td>
                                        <a href="/obituary-create" className="url-link" target="_blank">
                                            /obituary-create
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>부고장 조회</td>
                                    <td>
                                        <a href="/obituary-view" className="url-link" target="_blank">
                                            /obituary-view
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>부고장 문자 발송</td>
                                    <td>
                                        <a href="/sms-obituary" className="url-link" target="_blank">
                                            /sms-obituary
                                        </a>
                                    </td>
                                </tr>

                                <tr className="table-light">
                                    <td colSpan={2} className="fw-bold text-center bg-light">
                                        💍 청첩장 관리
                                    </td>
                                </tr>
                                <tr>
                                    <td>청첩장 문자 발송</td>
                                    <td>
                                        <a href="/sms-wedding" className="url-link" target="_blank">
                                            /sms-wedding
                                        </a>
                                    </td>
                                </tr>

                                <tr className="table-light">
                                    <td colSpan={2} className="fw-bold text-center bg-light">
                                        🛠️ 시스템 관리
                                    </td>
                                </tr>
                                <tr>
                                    <td>데이터베이스 백업/복구</td>
                                    <td>
                                        <a href="/backup" className="url-link" target="_blank">
                                            /backup
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>시스템 매뉴얼</td>
                                    <td>
                                        <a href="/manual" className="url-link" target="_blank">
                                            /manual
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 7번 */}
                <div className="section-card">
                    <div className="section-title">
                        <i className="bi bi-folder2-open"></i> 7. 프로젝트 폴더 구조
                    </div>

                    <div className="caption">Next.js 프로젝트 디렉터리 구조</div>

                    <div className="code-box" id="tree" tabIndex={0}>
                        {`C:\\GitHub_vercel_mongodb\\vercel_mongodb
│
├─ .git/
├─ next-app/
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ api/
│  │  │  │  ├─ auth/
│  │  │  │  ├─ backup/
│  │  │  │  ├─ members/
│  │  │  │  ├─ obituary/
│  │  │  │  └─ restore/
│  │  │  ├─ (auth)/
│  │  │  ├─ dashboard/
│  │  │  ├─ invitation/
│  │  │  ├─ manual/
│  │  │  ├─ obituary-create/
│  │  │  ├─ obituary-sms/
│  │  │  ├─ obituary-view/
│  │  │  ├─ sms-obituary/
│  │  │  ├─ sms-wedding/
│  │  │  └─ backup/
│  │  ├─ components/
│  │  ├─ lib/
│  │  ├─ models/
│  │  └─ styles/
│  ├─ public/
│  ├─ package.json
│  └─ next.config.js
├─ vendor/
│  └─ mongodb/
└─ (기타 PHP 파일들)`}
                    </div>

                    <div className="btn-row">
                        <button className="btn-copy" onClick={copyTree}>
                            전체 텍스트 복사하기
                        </button>
                    </div>
                </div>

                {/* 8번 */}
                <div className="section-card">
                    <div className="section-title">
                        <i className="bi bi-shield-lock"></i> 8. 인증 시스템 및 보안
                    </div>
                    <p>
                        보안을 위해 NextAuth.js를 사용하며, 비밀번호는{' '}
                        <code>bcrypt</code>로 해시하여 저장됩니다.
                    </p>
                    <div className="code-box">
                        <span className="comment">// 비밀번호 해시 예시</span>
                        <br />
                        "password": "$2a$10$..."
                    </div>
                    <div className="note">
                        <strong>관리자 권한:</strong> DB 내{' '}
                        <code>user_level</code> 값이 <strong>5</strong> 이상일 때 관리자 메뉴가
                        활성화됩니다.
                    </div>
                </div>

                {/* 9번 */}
                <div className="section-card">
                    <div className="section-title">
                        <i className="bi bi-exclamation-triangle-fill text-danger"></i> 9. 주의사항 및 문제 해결
                    </div>
                    <div className="alert alert-danger alert-custom">
                        <strong>🚨 Vercel 배포 시 주의사항</strong>
                    </div>
                    <ul>
                        <li>
                            <strong>환경변수 설정:</strong> Vercel Dashboard에서{' '}
                            <code>MONGODB_URI</code>, <code>NEXTAUTH_SECRET</code> 등을 설정해야 합니다.
                        </li>
                        <li>
                            <strong>Build 오류:</strong> TypeScript 타입 오류나 import 오류 시 배포가 실패합니다.
                        </li>
                        <li>
                            <strong>Suspense 경고:</strong>{' '}
                            <code>useSearchParams()</code> 등은 반드시 Suspense로 감싸야 합니다.
                        </li>
                    </ul>

                    <h6 className="mt-4">자주 발생하는 문제 해결</h6>
                    <div className="code-box">
                        <span className="comment">// 1. MongoDB 연결 오류</span>
                        <br />
                        MONGODB_URI 환경변수 확인 및 IP 허용 목록 확인
                        <br />
                        <br />
                        <span className="comment">// 2. NextAuth 세션 오류</span>
                        <br />
                        NEXTAUTH_SECRET 환경변수 설정 확인
                        <br />
                        <br />
                        <span className="comment">// 3. TypeScript 빌드 오류</span>
                        <br />
                        타입 정의 확인 및 any 타입 임시 사용
                    </div>
                </div>

                

                {/* 풀화면 이미지 */}
                <div className="full-width-image">
                    <img src="/images/diagram-vercel.png" alt="Vercel 배포 다이어그램" />
                </div>
            </div>

            <div id="scrollToTop" title="맨 위로">
                ▲
            </div>

            <div className="center-wrapper">
                <a href="/dashboard" className="btn-back">
                    ⏪ 돌아가기
                </a>
            </div>
        </>
    );
}
