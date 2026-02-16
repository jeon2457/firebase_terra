"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LoginPage() {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            if ((session.user as any).user_level >= 10) {
                router.push("/dashboard");
            } else {
                router.push("/guest");
            }
        }
    }, [session, router]);

    useEffect(() => {
        // 로고 애니메이션
        const logo = document.getElementById("logoImg");
        if (logo) {
            // 1. 흔들기 시작 (1.5초)
            logo.classList.add("animate-shake");

            // 2. 1.5초 후 흔들기 멈추고 회전 시작
            setTimeout(() => {
                logo.classList.remove("animate-shake");
                logo.classList.add("animate-spin");
            }, 1500);

            // 3. 회전 끝난 후 (1.5초 뒤) 클래스 제거 (총 3초 후 정지)
            setTimeout(() => {
                logo.classList.remove("animate-spin");
            }, 3000);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const result = await signIn("credentials", {
            id,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError(result.error);
        }
    };

    return (
        <>
            <style jsx global>{`
                html, body {
                    height: 100%;
                    margin: 0;
                    font-family: 'Noto Sans KR', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: auto;
                }

                /* 브라우저 자체 비밀번호 표시 아이콘 숨기기 */
                input::-ms-reveal,
                input::-ms-clear {
                    display: none;
                }

                .login-wrapper {
                    width: 100%;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .login-container {
                    width: 100%;
                    max-width: 420px;
                    margin: 0 auto;
                }

                .login-card {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .login-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
                }

                .card-header {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    padding: 40px 30px;
                    text-align: center;
                    color: white;
                }

                .login-icon img {
                    width: 90px;
                    height: 90px;
                    border-radius: 50%;
                    border: 5px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                }

                /* 로고 애니메이션 */
                @keyframes shake {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(-15deg); }
                    50% { transform: rotate(15deg); }
                    75% { transform: rotate(-15deg); }
                    100% { transform: rotate(0deg); }
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .animate-shake {
                    animation: shake 0.5s ease-in-out 3;
                }

                .animate-spin {
                    animation: spin 1.5s linear 1;
                }

                .card-title {
                    margin-top: 20px;
                    font-size: 1.8rem;
                    font-weight: 700;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .card-body {
                    padding: 40px 35px;
                }

                .form-label {
                    font-weight: 600;
                    color: #444;
                    margin-bottom: 8px;
                }

                .input-group .form-control {
                    border: none;
                    border-bottom: 2px solid #ddd;
                    border-radius: 0;
                    padding: 12px 0;
                    font-size: 1rem;
                    background: transparent;
                    transition: all 0.3s ease;
                }

                .form-control:not(.input-group > .form-control) {
                    border: none;
                    border-bottom: 2px solid #ddd;
                    border-radius: 0;
                    padding: 12px 0;
                    font-size: 1rem;
                    background: transparent;
                    transition: all 0.3s ease;
                }

                .form-control:focus {
                    box-shadow: none;
                    border-bottom-color: #667eea;
                    background: transparent;
                    transform: translateY(-2px);
                    outline: none;
                }

                .form-control::placeholder {
                    color: #aaa;
                }

                /* 눈 아이콘 버튼 */
                .toggle-password-btn {
                    border: none;
                    background: transparent;
                    border-bottom: 2px solid #ddd;
                    border-radius: 0;
                    color: #6c757d;
                    cursor: pointer;
                    padding: 12px 0;
                    transition: color 0.3s ease;
                }

                .toggle-password-btn:hover {
                    color: #667eea;
                }

                .btn-login {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border: none;
                    border-radius: 50px;
                    padding: 14px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: white;
                    margin-top: 30px;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
                }

                .btn-login:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
                    background: linear-gradient(135deg, #5a6fd8, #6a4190);
                }

                .btn-login:active {
                    transform: translateY(0);
                }

                .error-msg {
                    margin-top: 20px;
                    font-weight: 600;
                    text-align: center;
                    padding: 10px;
                    border-radius: 10px;
                }

                @media (max-width: 576px) {
                    .login-wrapper {
                        padding: 15px;
                    }

                    .login-container {
                        max-width: 100%;
                    }

                    .card-header {
                        padding: 30px 20px;
                    }

                    .card-body {
                        padding: 30px 25px;
                    }

                    .card-title {
                        font-size: 1.6rem;
                    }

                    .login-icon img {
                        width: 80px;
                        height: 80px;
                    }

                    .btn-login {
                        font-size: 1rem;
                        padding: 12px;
                    }
                }

                @media (max-width: 400px) {
                    .card-body {
                        padding: 25px 20px;
                    }

                    .card-header {
                        padding: 25px 15px;
                    }

                    .login-icon img {
                        width: 70px;
                        height: 70px;
                    }

                    .card-title {
                        font-size: 1.4rem;
                    }
                }
            `}</style>

            <div className="login-wrapper">
                <div className="login-container">
                    <div className="login-card">
                        <div className="card-header">
                            <div className="login-icon">
                                <img 
                                    src="/images/clova.png" 
                                    alt="로고" 
                                    id="logoImg"
                                />
                            </div>
                            <h2 className="card-title">로그인</h2>
                        </div>
                        
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="inputId" className="form-label">
                                        아이디 또는 이메일
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="inputId"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        placeholder="아이디 또는 이메일을 입력하세요"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="inputPassword" className="form-label">
                                        비밀번호
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control"
                                            id="inputPassword"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="비밀번호를 입력하세요"
                                            required
                                            autoComplete="current-password"
                                        />
                                        <button
                                            className="toggle-password-btn"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-login w-100">
                                    로그인
                                </button>
                            </form>

                            {error && (
                                <div className="error-msg alert alert-danger">
                                    ❌ {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}