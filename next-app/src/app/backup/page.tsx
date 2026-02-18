"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function BackupPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [log, setLog] = useState<string[]>(["준비됨..."]);
    const [isBackupLoading, setIsBackupLoading] = useState(false);
    const [isRestoreLoading, setIsRestoreLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const addLog = (message: string, color: string = "#0f0") => {
        const timestamp = new Date().toLocaleTimeString();
        setLog(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const handleBackup = async () => {
        try {
            setIsBackupLoading(true);
            addLog("백업을 시작합니다. 전체 데이터를 수집 중...");

            const response = await fetch('/api/backup');
            const result = await response.json();

            if (result.success) {
                // 파일 다운로드 트리거
                const jsonString = JSON.stringify(result.data, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

                a.href = url;
                a.download = `mongodb_backup_${dateStr}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                addLog("✅ 백업 파일 다운로드가 시작되었습니다!");
            } else {
                addLog(`❌ 백업 실패: ${result.error}`, "red");
            }
        } catch (error) {
            console.error(error);
            addLog(`❌ 백업 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, "red");
        } finally {
            setIsBackupLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!selectedFile) {
            alert("먼저 복구할 JSON 파일을 선택해 주세요.");
            return;
        }

        const confirmMsg = "정말로 데이터베이스를 복구하시겠습니까?\n현재 모든 데이터가 삭제되고 파일 내용으로 대체됩니다.";
        if (!confirm(confirmMsg)) return;

        try {
            setIsRestoreLoading(true);
            addLog("파일을 읽는 중...");

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);

                    addLog("데이터 업로드 중... 잠시만 기다려 주세요.");

                    const response = await fetch('/api/restore', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ data }),
                    });

                    const result = await response.json();

                    if (result.success) {
                        addLog("✅ 복구가 완료되었습니다! 데이터베이스가 최신 상태로 갱신되었습니다.", "#fff");
                        alert("데이터 복구가 성공적으로 완료되었습니다.");
                    } else {
                        addLog(`❌ 복구 실패: ${result.error}`, "red");
                    }
                } catch (parseErr) {
                    addLog("❌ 파일 형식 오류: JSON 형식이 아닙니다.", "red");
                } finally {
                    setIsRestoreLoading(false);
                }
            };
            reader.readAsText(selectedFile);

        } catch (error) {
            console.error(error);
            addLog(`❌ 복구 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, "red");
            setIsRestoreLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <>
            <style jsx global>{`
                body {
                    background: #f0f2f5;
                    padding: 50px 20px;
                    font-family: 'Noto Sans KR', sans-serif;
                }

                .container {
                    max-width: 700px;
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    margin: 0 auto;
                }

                h2 {
                    color: #4e73df;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 30px;
                }

                .utility-card {
                    border: 1px solid #e3e6f0;
                    border-radius: 15px;
                    padding: 25px;
                    margin-bottom: 25px;
                    background: #f8f9fc;
                }

                .btn-action {
                    width: 100%;
                    padding: 12px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    border-radius: 10px;
                    margin-bottom: 10px;
                    transition: 0.3s;
                    border: none;
                    cursor: pointer;
                }

                #log {
                    height: 200px;
                    overflow-y: auto;
                    background: #212529;
                    color: #0f0;
                    padding: 15px;
                    border-radius: 10px;
                    font-family: monospace;
                    font-size: 13px;
                    margin-top: 20px;
                }

                .warning-box {
                    background: #fff3cd;
                    border-left: 5px solid #ffc107;
                    padding: 15px;
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                }

                .danger-box {
                    background: #f8d7da;
                    border-left: 5px solid #dc3545;
                    padding: 15px;
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                    color: #721c24;
                }

                .btn-action:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>

            <div className="container">
                <h2>🛠️ MongoDB 데이터베이스 관리 도구</h2>

                <div className="warning-box">
                    <strong>💡 정보:</strong> '백업' 기능을 사용하면 MongoDB의 모든 데이터를 JSON 파일로 다운로드할 수 있습니다.
                </div>

                {/* 백업 영역 */}
                <div className="utility-card">
                    <h5>📥 데이터 백업 (내보내기)</h5>
                    <p className="text-muted small">현재 DB 상태를 .json 파일로 저장합니다.</p>
                    <button 
                        className="btn btn-primary btn-action"
                        onClick={handleBackup}
                        disabled={isBackupLoading}
                    >
                        {isBackupLoading ? "백업 중..." : "내 컴퓨터로 백업 받기"}
                    </button>
                </div>

                <div className="danger-box">
                    <strong>⚠️ 주의:</strong> '복구' 기능을 사용하면 현재 데이터베이스의 <strong>모든 데이터가 삭제되고</strong> 선택한 파일의 내용으로 완전히 대체됩니다!
                    반드시 백업 후 신중하게 진행하세요.
                </div>

                {/* 복구 영역 */}
                <div className="utility-card">
                    <h5>📤 데이터 복구 (가져오기)</h5>
                    <p className="text-muted small">백업된 .json 파일을 선택하여 DB를 이전 상태로 돌립니다.</p>
                    <input 
                        type="file" 
                        className="form-control mb-3" 
                        accept=".json"
                        onChange={handleFileChange}
                    />
                    <button 
                        className="btn btn-danger btn-action"
                        onClick={handleRestore}
                        disabled={isRestoreLoading || !selectedFile}
                    >
                        {isRestoreLoading ? "복구 중..." : "선택한 파일로 DB 복구하기"}
                    </button>
                </div>

                <div id="log">
                    {log.map((message, index) => (
                        <div key={index} style={{ color: message.includes("❌") ? "red" : message.includes("✅") ? "#fff" : "#0f0" }}>
                            {message}
                        </div>
                    ))}
                </div>

                <div className="mt-4 text-center">
                    <button 
                        className="btn btn-outline-secondary"
                        onClick={() => router.push("/dashboard")}
                    >
                        메인으로 돌아가기
                    </button>
                </div>
            </div>
        </>
    );
}
