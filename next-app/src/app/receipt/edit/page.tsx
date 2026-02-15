"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    ArrowLeft,
    Trash2,
    Save,
    Maximize2,
    X,
    FileText
} from "lucide-react";
import axios from "axios";

function ReceiptEditContent() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Track editing notices
    const [notices, setNotices] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            if ((session?.user as any).user_level < 5) {
                alert("권한이 없습니다.");
                router.push("/dashboard");
                return;
            }
            fetchImages();
        }
    }, [status, currentYear, currentMonth]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/receipts?year=${currentYear}&month=${currentMonth}`);
            if (res.data.success) {
                setImages(res.data.images);
                const noticeMap: any = {};
                res.data.images.forEach((img: any) => {
                    noticeMap[img._id] = img.notice || "";
                });
                setNotices(noticeMap);
            }
        } catch (error) {
            console.error("Failed to fetch images", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateNotice = async (id: string) => {
        try {
            const res = await axios.put('/api/receipts', { id, notice: notices[id] });
            if (res.data.success) {
                alert("저장되었습니다.");
            }
        } catch (error) {
            alert("저장 실패");
        }
    };

    const handleDelete = async (id: string, publicId?: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            const res = await axios.delete(`/api/receipts?id=${id}&public_id=${publicId || ''}`);
            if (res.data.success) {
                alert("삭제되었습니다.");
                fetchImages();
            }
        } catch (error) {
            alert("삭제 실패");
        }
    };

    const years = [0, 1, 2, 3].map(i => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    if (!mounted) return <div className="text-center mt-5">Loading...</div>;
    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container py-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
            <div className="max-w-4xl mx-auto" style={{ maxWidth: '800px' }}>
                <style jsx>{`
                    .edit-card {
                        background: white;
                        border-radius: 12px;
                        border: 1px solid #dee2e6;
                        margin-bottom: 20px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    }
                    .thumbnail-box {
                        width: 100px;
                        height: 100px;
                        background: #eee;
                        cursor: pointer;
                        position: relative;
                        flex-shrink: 0;
                    }
                    .thumbnail-box img {
                        width: 100%; height: 100%; object-fit: cover;
                    }
                    .modal-backdrop {
                        position: fixed;
                        top: 0; left: 0; width: 100%; height: 100%;
                        background: rgba(0,0,0,0.9);
                        z-index: 2000;
                        display: flex; align-items: center; justify-content: center;
                        padding: 20px;
                    }
                    .mobile-month-grid {
                        display: grid;
                        grid-template-columns: repeat(6, 1fr);
                        gap: 5px;
                    }
                    @media (max-width: 576px) {
                        .mobile-month-grid {
                            grid-template-columns: repeat(6, 1fr);
                        }
                    }
                `}</style>

                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <h3 className="m-0 fw-bold text-danger">✂️ 영수증 편집기</h3>
                    <div className="dropdown">
                        <button className="btn btn-dark btn-sm dropdown-toggle rounded-pill px-3" data-bs-toggle="dropdown">
                            {currentYear}년
                        </button>
                        <ul className="dropdown-menu">
                            {years.map(y => (
                                <li key={y}><button className="dropdown-item" onClick={() => setCurrentYear(y)}>{y}년</button></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="mobile-month-grid">
                        {months.map(m => (
                            <button key={m}
                                className={`btn btn-sm ${m === currentMonth ? 'btn-primary' : 'btn-outline-secondary'}`}
                                style={{ padding: '6px 0', fontSize: '12px' }}
                                onClick={() => setCurrentMonth(m)}
                            >
                                {m}월
                            </button>
                        ))}
                    </div>
                </div>

                <div className="container p-0">
                    {loading ? (
                        <div className="text-center p-5">Loading...</div>
                    ) : images.length === 0 ? (
                        <div className="text-center p-5 text-muted">
                            <FileText size={48} className="mb-3 opacity-25" />
                            <h5>해당 월의 영수증이 없습니다.</h5>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {images.map(img => (
                                <div key={img._id} className="col-12">
                                    <div className="edit-card p-3 d-flex flex-column flex-md-row gap-3 align-items-center">
                                        <div className="thumbnail-box rounded-3" onClick={() => setSelectedImg(img.url)}>
                                            <img src={img.url} alt="Receipt" />
                                            <div className="position-absolute top-0 end-0 p-1">
                                                <Maximize2 size={12} color="#fff" style={{ filter: 'drop-shadow(0 0 2px black)' }} />
                                            </div>
                                        </div>

                                        <div className="flex-fill w-100">
                                            <div className="small text-muted mb-1">
                                                {img.date}
                                            </div>
                                            <textarea
                                                className="form-control form-control-sm"
                                                rows={2}
                                                value={notices[img._id] || ""}
                                                onChange={e => setNotices({ ...notices, [img._id]: e.target.value })}
                                                placeholder="간단한 메모 입력..."
                                            />
                                        </div>

                                        <div className="d-flex flex-md-column gap-2 w-100 w-md-auto">
                                            <button className="btn btn-success btn-sm px-3 flex-fill" onClick={() => handleUpdateNotice(img._id)}>
                                                <Save size={14} className="me-1" /> 저장
                                            </button>
                                            <button className="btn btn-danger btn-sm px-3 flex-fill" onClick={() => handleDelete(img._id, img.public_id)}>
                                                <Trash2 size={14} className="me-1" /> 삭제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Back Button */}
                <div className="mt-4 mb-5 pb-5">
                    <button className="btn btn-secondary w-100 py-2 fw-bold" onClick={() => router.push("/dashboard")}>
                        <ArrowLeft size={18} className="me-2" /> 돌아가기
                    </button>
                </div>

                {selectedImg && (
                    <div className="modal-backdrop" onClick={() => setSelectedImg(null)}>
                        <button className="btn btn-link link-light position-fixed top-0 end-0 p-4" onClick={() => setSelectedImg(null)}>
                            <X size={48} />
                        </button>
                        <img src={selectedImg} className="modal-content shadow-lg w-auto h-auto max-vw-100 max-vh-100" onClick={e => e.stopPropagation()} alt="Enlarged" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ReceiptEditPage() {
    return (
        <Suspense fallback={<div className="text-center mt-5">Loading Dashboard...</div>}>
            <ReceiptEditContent />
        </Suspense>
    );
}