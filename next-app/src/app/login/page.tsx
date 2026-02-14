"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

// Using useRouter from next/navigation for App Router
import { useRouter as useAppRouter } from "next/navigation";

export default function LoginPage() {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useAppRouter();
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
        <div className="login-wrapper">
            <style jsx global>{`
        html, body {
          height: 100%;
          margin: 0;
          font-family: 'Pretendard', sans-serif;
          background: linear-gradient(135deg, #e9efff, #f7f9fc);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-container {
          width: 520px;
          padding: 40px 35px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 18px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          text-align: center;
          position: relative;
        }
        .login-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, #3f6ad8, #6f9cff);
        }
        .login_text {
          font-size: 24px;
          font-weight: 600;
          color: #2f3a4f;
          margin-bottom: 25px;
        }
        .form-control {
          height: 52px;
          border-radius: 12px;
        }
        .btn-primary {
          height: 54px;
          border-radius: 14px;
          background: linear-gradient(135deg, #4c6fff, #6f8dff);
          border: none;
          font-weight: 600;
        }
      `}</style>

            <div className="login-container">
                <p className="login_text">회원 로그인</p>

                <div className="mb-4">
                    <img src="/images/clova.png" alt="Logo" style={{ width: '72px' }} />
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3 text-start">
                        <label className="form-label">아이디</label>
                        <input
                            type="text"
                            className="form-control"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            placeholder="아이디를 입력하세요"
                            required
                        />
                    </div>
                    <div className="mb-3 text-start">
                        <label className="form-label">비밀번호</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    <div className="d-grid mt-4">
                        <button type="submit" className="btn btn-primary">로그인</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
