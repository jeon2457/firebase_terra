"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    ArrowLeft,
    Download,
    Maximize2,
    X,
    FileText
} from "lucide-react";
import axios from "axios";

function ReceiptViewContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchImages();
        }
        document.title = "영수증 열람";
    }, [status, currentYear, currentMonth]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/receipts?year=${currentYear}&month=${currentMonth}`);
            if (res.data.success) {
                setImages(res.data.images);
            }
        } catch (error) {
            console.error("Failed to fetch images", error);
        } finally {
            setLoading(false);
        }
    };

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (yearDropdownOpen) {
                const dropdown = document.querySelector('.year-dropdown-container');
                if (dropdown && !dropdown.contains(event.target as Node)) {
                    setYearDropdownOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [yearDropdownOpen]);

    const years = [];
    
    // 5년 전부터 현재까지의 년도 생성, 그리고 다음 해까지 포함
    const currentDate = new Date();
    const currentYearValue = currentDate.getFullYear();
    
    // 5년 전부터 현재까지
    for (let i = 5; i >= 0; i--) {
        years.push(currentYearValue - i);
    }
    
    // 12월 1일 이후에만 다음 해 자동 추가
    if (currentDate.getMonth() === 11 && currentDate.getDate() >= 1) {
        years.push(currentYearValue + 1);
    }
    
    // 중복 제거 및 정렬
    const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    if (!mounted) return <div className="text-center mt-5">Loading...</div>;
    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container-fluid p-0 pb-5" style={{ background: "#f4f6f9", minHeight: "100vh" }}>
            <style jsx>{`
                .header-section {
                    background: #fff;
                    padding: 20px;
                    border-bottom: 2px solid #e9ecef;
                    margin-bottom: 30px;
                }
                .mobile-month-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 8px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                @media (max-width: 576px) {
                    .mobile-month-grid {
                        grid-template-columns: repeat(6, 1fr);
                        gap: 5px;
                    }
                }
                .month-btn {
                    padding: 8px;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    background: #fff;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .month-btn.active {
                    background: #007bff;
                    color: white;
                    border-color: #007bff;
                }
                .receipt-card {
                    background: #fff;
                    border-radius: 12px;
                    border: 1px solid #dee2e6;
                    overflow: hidden;
                    transition: transform 0.2s;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }
                .receipt-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
                .thumbnail-wrapper {
                    position: relative;
                    height: 200px;
                    background: #eee;
                    cursor: pointer;
                }
                .thumbnail-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .thumbnail-wrapper:hover .overlay { opacity: 1; }
                
                .modal-backdrop {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.9);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .modal-image {
                    max-width: 100%;
                    max-height: 90vh;
                    border-radius: 5px;
                }
            `}</style>

            <div className="header-section shadow-sm sticky-top">
                <div className="container" style={{ maxWidth: '800px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="m-0 fw-bold text-primary">영수증 보관함</h4>
                        <div className="position-relative year-dropdown-container">
                            <button className="btn btn-dark btn-sm dropdown-toggle rounded-pill px-3" 
                                    onClick={() => setYearDropdownOpen(!yearDropdownOpen)}>
                                {currentYear}년
                            </button>
                            {yearDropdownOpen && (
                                <ul className="dropdown-menu show">
                                    {uniqueYears.map(y => (
                                        <li key={y}><button className="dropdown-item" onClick={() => {
                                            setCurrentYear(y);
                                            setYearDropdownOpen(false);
                                        }}>{y}년</button></li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="mobile-month-grid">
                        {months.map(m => (
                            <button key={m}
                                className={`month-btn ${m === currentMonth ? 'active' : ''}`}
                                onClick={() => setCurrentMonth(m)}
                            >
                                {m}월
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '1000px' }}>
                {loading ? (
                    <div className="text-center p-5">Loading...</div>
                ) : images.length === 0 ? (
                    <div className="text-center p-5 text-muted">
                        <FileText size={48} className="mb-3 opacity-25" />
                        <h5>해당 월의 영수증이 없습니다.</h5>
                    </div>
                ) : (
                    <div className="row g-4">
                        {images.map(img => (
                            <div key={img._id} className="col-sm-6 col-md-4 col-lg-3">
                                <div className="receipt-card">
                                    <div className="thumbnail-wrapper" onClick={() => setSelectedImg(img.url)}>
                                        <img src={img.url} alt="Receipt" />
                                        <div className="overlay">
                                            <Maximize2 color="#fff" />
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <div className="small text-muted mb-2">{img.date.split(' ')[0]}</div>
                                        <div className="fw-bold mb-3 text-truncate" title={img.notice}>
                                            {img.notice || "설명 없음"}
                                        </div>
                                        <a href={img.url} target="_blank" className="btn btn-primary btn-sm w-100 rounded-pill">
                                            <Download size={14} className="me-1" /> 다운로드
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Back Button */}
            <div className="container pb-5 mt-5" style={{ maxWidth: '800px' }}>
                <button className="btn btn-secondary w-100 py-2 fw-bold" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft size={18} className="me-2" /> 돌아가기
                </button>
            </div>

            {selectedImg && (
                <div className="modal-backdrop" onClick={() => setSelectedImg(null)}>
                    <button className="btn btn-link link-light position-fixed top-0 end-0 p-4" onClick={() => setSelectedImg(null)}>
                        <X size={48} />
                    </button>
                    <img src={selectedImg} className="modal-image shadow-lg" onClick={e => e.stopPropagation()} alt="Enlarged" />
                </div>
            )}
        </div>
    );
}

export default function ReceiptViewPage() {
    return (
        <Suspense fallback={<div className="text-center mt-5">Loading Dashboard...</div>}>
            <ReceiptViewContent />
        </Suspense>
    );
}
