"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ArrowLeft, Upload, Image as ImageIcon, Link as LinkIcon, Trash2, CheckCircle, Info } from "lucide-react";
import axios from "axios";

export default function ReceiptUploadPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const [notice, setNotice] = useState("");

    const cloudName = "dghx4ciwc";
    const uploadPreset = "direct_upload";

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        document.title = "영수증 업로드";
    }, [status, router]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("tags", "terraone_gallery");

        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                formData
            );
            const data = res.data;
            if (data.secure_url) {
                setUrlInput(data.secure_url);
                setPreviewUrl(data.secure_url);
                alert("🚀 Cloudinary 업로드 성공!");
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("업로드 실패");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveToDB = async () => {
        if (!urlInput) {
            alert("이미지 URL을 입력하거나 파일을 업로드해주세요.");
            return;
        }

        try {

            const res = await axios.post("/api/receipts", {
                url: urlInput,
                notice: notice
                // createdAt는 서버에서 자동으로 생성하도록 제거
            });

            if (res.data.success) {
                alert("✅ DB 전송 성공 완료!");
                router.push("/receipt/view");
            }
        } catch (error) {
            alert("저장 실패");
        }
    };

    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container-fluid py-5" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh", color: "#333" }}>
            <style jsx>{`
                .upload-card {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                .page-header {
                    text-align: center;
                    margin-bottom: 40px;
                    background: #2c3e50;
                    color: white;
                    padding: 30px;
                    border-radius: 15px;
                }
                .section-box {
                    background: #f8f9fa;
                    border: 2px solid #e9ecef;
                    border-radius: 15px;
                    padding: 25px;
                    margin-bottom: 30px;
                }
                .preview-box {
                    border: 2px dashed #3498db;
                    border-radius: 15px;
                    padding: 20px;
                    text-align: center;
                    margin-top: 20px;
                }
                .info-box {
                    background: #e3f2fd;
                    border-left: 4px solid #3498db;
                    padding: 15px;
                    font-size: 14px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
            `}</style>

            <div className="upload-card">
                <div className="page-header">
                    <h1 className="fw-bold m-0"><ImageIcon size={32} className="me-2" /> 영수증 업로드</h1>
                    <p className="small opacity-75 mt-2" style={{ color: 'orange' }}>Cloudinary 및 DB 전송 시스템</p>
                </div>

                <div className="section-box">
                    <h5 className="fw-bold mb-3">① 파일 직접 업로드 (Cloudinary)</h5>
                    <div className="mb-3">
                        <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" disabled={uploading} />
                        {uploading && <div className="text-primary mt-2 small">업로드 중...</div>}
                    </div>
                </div>

                <div className="section-box">
                    <h5 className="fw-bold mb-3">② 링크 및 상세 정보 입력</h5>
                    <div className="mb-3">
                        <label className="small fw-bold mb-1">이미지 URL</label>
                        <div className="input-group">
                            <span className="input-group-text"><LinkIcon size={16} /></span>
                            <input type="text" className="form-control" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://..." />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="small fw-bold mb-1">요약(비고) 입력</label>
                        <input type="text" className="form-control" value={notice} onChange={e => setNotice(e.target.value)} placeholder="이미지 또는 영수증 설명을 입력하세요" />
                    </div>

                    {previewUrl && (
                        <div className="preview-box">
                            <div className="small fw-bold text-primary mb-2">📷 미리보기</div>
                            <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "10px" }} />
                        </div>
                    )}

                    <div className="info-box">
                        <Info size={16} className="me-2 text-primary" />
                        <strong>안내:</strong><br />
                        이미지를 Cloudinary에 업로드한 후 "DB에 저장" 버튼을 눌러야 영수증 열람 페이지에서 확인이 가능합니다.
                        - Cloudinary파일크기 제한: 이미지 최대 10MB
                        - MongoDB Atlas 저장 용량: 최대 512MB

                    </div>

                    <div className="d-flex gap-3">
                        <button className="btn btn-success flex-grow-1 p-3 fw-bold rounded-pill" onClick={handleSaveToDB}>
                            <CheckCircle size={18} className="me-1" /> MongoDB에 저장하기
                        </button>
                    </div>
                </div>

                <button className="btn btn-outline-secondary w-100 p-3 rounded-pill fw-bold" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft size={18} className="me-1" /> 돌아가기
                </button>
            </div>
        </div>
    );
}
