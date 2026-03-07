"use client";

import React, { useState, useEffect } from 'react';
import { X, Activity, Users, Percent, LogIn, Award, RotateCcw, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ActivityDashboardModalProps {
    onClose: () => void;
    theme?: string;
}

export default function ActivityDashboardModal({ onClose, theme }: ActivityDashboardModalProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/dashboard/activity?year=${selectedYear}`);
            if (res.data.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch activity data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="custom-modal-overlay">
                <div className="custom-modal d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    const lineData = {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        datasets: [
            {
                label: '월별 납부/활동 인원',
                data: data?.monthlyActivity || Array(12).fill(0),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointRadius: 4,
            }
        ]
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 13 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { stepSize: 3 }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    const years = [];
    const currentYearVal = new Date().getFullYear();
    for (let i = 5; i >= 0; i--) {
        years.push(currentYearVal - i);
    }
    if (new Date().getMonth() === 11 && new Date().getDate() >= 1) {
        years.push(currentYearVal + 1);
    }
    const yearList = [...new Set(years)].sort((a, b) => b - a);

    return (
        <div className="custom-modal-overlay" onClick={onClose}>
            <div className="custom-modal activity-dashboard-container" onClick={e => e.stopPropagation()} style={{ background: '#f8fafc', padding: 0, overflow: 'hidden' }}>
                {/* Header Section */}
                <div className="dashboard-header p-4" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="fw-bold m-0 d-flex align-items-center">
                            <Activity className="me-2" /> 회원 활동 대시보드
                        </h4>
                        <button className="btn btn-link text-white p-0" onClick={onClose}><X size={24} /></button>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <select
                            className="form-select w-auto bg-white bg-opacity-20 border-0 text-white fw-bold"
                            style={{ cursor: 'pointer' }}
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {yearList.map(y => <option key={y} value={y} className="text-dark">{y}년</option>)}
                        </select>
                        <span className="opacity-80">회비 납부 및 로그인 활동 분석 ({selectedYear}년)</span>
                    </div>
                </div>

                <div className="p-4" style={{ maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
                    {/* Summary Cards */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 text-center h-100">
                                <div className="text-primary mb-2"><Users size={24} /></div>
                                <div className="h3 fw-bold m-0">{data?.summary.totalMembers}</div>
                                <div className="small text-muted">총 회원 수</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 text-center h-100">
                                <div className="text-success mb-2"><Percent size={24} /></div>
                                <div className="h3 fw-bold m-0">{data?.summary.avgPaymentRate}%</div>
                                <div className="small text-muted">평균 활동률 (납부)</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 text-center h-100 position-relative">
                                <div className="text-warning mb-2"><LogIn size={24} /></div>
                                <div className="h3 fw-bold m-0">{data?.summary.totalLogins}</div>
                                <div className="small text-muted">총 누적 로그인</div>
                                <button className="btn btn-sm btn-outline-danger py-0 px-2 position-absolute" style={{ bottom: '10px', right: '10px', fontSize: '10px' }}>초기화</button>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 text-center h-100">
                                <div className="text-info mb-2"><Award size={24} /></div>
                                <div className="h3 fw-bold m-0">{data?.summary.topPerformers}</div>
                                <div className="small text-muted">우수 활동 (100%)</div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4 mb-4">
                        {/* Chart */}
                        <div className="col-lg-7">
                            <div className="card border-0 shadow-sm p-4 h-100">
                                <h6 className="fw-bold mb-4 d-flex align-items-center">
                                    📊 월별 납부/활동 추이
                                </h6>
                                <div style={{ height: '300px' }}>
                                    <Line data={lineData} options={lineOptions} />
                                </div>
                            </div>
                        </div>

                        {/* Top 5 Ranking */}
                        <div className="col-lg-5">
                            <div className="card border-0 shadow-sm p-4 h-100">
                                <h6 className="fw-bold mb-4 d-flex align-items-center">
                                    🏆 활동 우수 회원 (Top 5)
                                </h6>
                                <div className="ranking-list">
                                    {data?.top5.map((m: any, idx: number) => (
                                        <div key={m.id} className="d-flex align-items-center mb-3">
                                            <div className={`rank-badge me-3 ${idx === 0 ? 'bg-warning' : 'bg-secondary bg-opacity-25 text-dark'}`}
                                                style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="fw-bold">{m.name}</div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-primary">{m.totalScore}점</div>
                                                <div className="small text-muted" style={{ fontSize: '10px' }}>납({m.paymentRate}%) 로({m.loginCount})</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Member List Table */}
                    <div className="card border-0 shadow-sm overflow-hidden">
                        <div className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold m-0">📋 전체 회원 활동 현황</h6>
                            <button className="btn btn-sm btn-outline-secondary px-3" onClick={onClose}>돌아가기</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4">No</th>
                                        <th>이름</th>
                                        <th>전화번호</th>
                                        <th style={{ width: '35%' }}>활동률 (납부)</th>
                                        <th>로그인</th>
                                        <th className="text-center px-4">상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.allMembers.map((m: any, idx: number) => (
                                        <tr key={m.id}>
                                            <td className="px-4 text-muted">{idx + 1}</td>
                                            <td className="fw-bold">{m.name}</td>
                                            <td className="text-muted small">{m.tel}</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <span className="small fw-bold" style={{ width: '35px' }}>{m.paymentRate}%</span>
                                                    <div className="progress flex-grow-1" style={{ height: '8px', borderRadius: '10px' }}>
                                                        <div
                                                            className={`progress-bar ${m.paymentRate > 80 ? 'bg-success' : m.paymentRate > 50 ? 'bg-warning' : 'bg-danger'}`}
                                                            style={{ width: `${m.paymentRate}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="fw-bold">{m.loginCount}회</td>
                                            <td className="text-center px-4">
                                                <span className={`badge rounded-pill ${m.paymentRate >= 100 ? 'bg-success' : 'bg-warning'} px-3 py-2`}>
                                                    {m.paymentRate >= 100 ? '우수' : '보통'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="text-center mt-5 mb-4">
                        <button className="btn btn-secondary px-5 py-2 rounded-pill shadow-sm" onClick={onClose}>
                            <ChevronLeft className="me-2" size={18} /> 돌아가기 (관리자 홈)
                        </button>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .activity-dashboard-container {
                    max-width: 1000px !important;
                    width: 95%;
                    border-radius: 24px;
                }
                .rank-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .dashboard-header .form-select:focus {
                    box-shadow: none;
                }
                .ranking-list {
                    height: 300px;
                    overflow-y: auto;
                }
            `}</style>
        </div>
    );
}
