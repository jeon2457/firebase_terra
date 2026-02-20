"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

export default function GuestMembersViewPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Clock State
    const [timeStr, setTimeStr] = useState("");
    const [dateStr, setDateStr] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchMembers();
        }
    }, [status, router]);

    // Clock Timer
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const week = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');

            setDateStr(`${year}/${month}/${day}(${week})`);
            setTimeStr(`${hours}:${minutes}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '';
        const numbers = phone.replace(/[^0-9]/g, '');
        if (numbers.length === 11) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        } else if (numbers.length === 10) {
            if (numbers.startsWith('02')) {
                return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
            } else {
                return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
            }
        }
        return numbers;
    };

    const formatName = (name: string) => {
        if (!name) return '';
        return name.trim(); 
    };

    const fetchMembers = async () => {
        try {
            const res = await axios.get("/api/members");
            if (res.data.success) {
                const filteredMembers = res.data.data
                    .filter((m: any) => m.name !== '공용계정' && m.id !== 'jikji35')
                    .map((m: any) => ({
                        ...m,
                        tel: formatPhoneNumber(m.tel),
                        name: formatName(m.name)
                    }));
                setMembers(filteredMembers);
            }
        } catch (error) {
            console.error("Failed to fetch members", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div style={{ background: "#000", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff" }}>
                Loading...
            </div>
        );
    }

    const userLevel = (session?.user as any)?.user_level || 0;
    const userName = (session?.user as any)?.name || "Guest";
    const userDisplayText = userLevel >= 10 ? `관리자: ${userName}님` : `회원: ${userName}님`;

    return (
        <div className="wrapper">
            <style jsx global>{`
                body {
                    background: linear-gradient(to right, #232526, #414345);
                    margin: 0;
                    padding: 3px 0;
                    font-family: 'Noto Sans KR', sans-serif;
                    color: #ffffff;
                }
            `}</style>
            <style jsx>{`
                .wrapper {
                    width: 100%;
                    min-height: 100vh;
                    background: transparent;
                }
                a { text-decoration: none !important; }
                
                /* Container */
                .container {
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 0;
                }

                /* Header */
                .header {
                    width: 100%;
                    max-width: 700px;
                    height: 3.5rem;
                    margin: 0 auto;
                    text-align: center;
                    color: #f4f4f4;
                    background-color: rgba(0, 0, 0);
                    padding: 0 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    box-sizing: border-box; 
                }

                .header-left { display: flex; align-items: center; gap: 10px; }
                .date-text { color: #cea71bff; font-size: 1.5rem; }
                .time-text { color: #4A9EFF; font-size: 1.5rem; line-height: 1.1; }
                .header-right { display: flex; align-items: center; gap: 10px; }
                .user-info-box {
                    font-size: 12px;
                    color: #E3EFFA !important;
                    background: #333;
                    padding: 4px 8px;
                    border-radius: 5px;
                    border: 1px solid #555;
                    white-space: nowrap;
                }
                .back-btn {
                    font-size: 12px;
                    color: #fff;
                    background: #4A9EFF;
                    padding: 4px 10px;
                    border-radius: 5px;
                    border: none;
                    cursor: pointer;
                }

                /* Marquee Section */
                .wrap2 {
                    position: fixed;
                    top: 3.5rem;
                    left: 0;
                    right: 0;
                    z-index: 999;
                    width: 100%;
                    max-width: 700px;
                    margin: 0 auto;
                    overflow: hidden;
                    background-color: #333;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                }
                
                .marquee-text {
                    color: #ffffff;
                    font-size: 18px;
                    font-weight: bold;
                }

                /* Table */
                .table-container {
                    padding-top: calc(3.25rem + 30px);
                    padding-bottom: 2px;
                }
                .custom-table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed; 
                    border: 1px solid #eedca6;
                    max-width: 700px;
                    margin: 0 auto; 
                }
                .custom-table thead th {
                    position: sticky;
                    top: calc(3.5rem + 39px);
                    z-index: 998;
                    background: #444;
                    color: #cea71bff !important;
                    font-weight: bold;
                    border: 1px solid #eedca6 !important;
                    text-align: center;
                    vertical-align: middle;
                    padding: 0.44rem 0;
                    font-size: 0.9em;
                }
                .custom-table tbody tr {
                    background-color: transparent;
                    color: #ffffff;
                    border: 1px solid #eedca6 !important;
                }
                .custom-table tbody tr:hover { background: rgba(255,255,255,0.06); }

                .custom-table td {
                    border: 1px solid #eedca6 !important;
                    text-align: center;
                    vertical-align: middle;
                    padding: 0.44rem 0;
                    word-break: break-all;
                    line-height: 1.1;
                }

                .name-link {
                    color: #ffffff !important; 
                    text-decoration: none !important;
                    display: block;
                    width: 100%;
                    text-align: center;
                    font-size: 15px;
                }
                .name-link:hover { color: #4A9EFF !important; }

                .tel-link {
                    color: #4A9EFF !important;
                    text-decoration: none !important;
                }
                
                /* Mobile */
                @media (max-width: 768px) {
                    .header { height: 60px; padding: 5px 10px; }
                    .date-text { font-size: 1.1rem; }
                    .time-text { font-size: 1.1rem; }
                    .user-info-box { font-size: 10px; }
                    .wrap2 { top: 3.5rem; height: 40px; }
                    .marquee-text { font-size: 14px; }
                    .custom-table thead th { font-size: 13px; }
                }
            `}</style>

            <div className="container">
                {/* Header */}
                <div className="header">
                    <div className="header-left">
                        <span className="date-text">{dateStr}</span>
                        <span className="time-text">{timeStr}</span>
                    </div>
                    <div className="header-right">
                        <div className="user-info-box">{userDisplayText}</div>
                        <button className="back-btn" onClick={() => router.push('/dashboard')}>←뒤로</button>
                    </div>
                </div>

                <div className="table-container">
                    <div className="wrap2">
                        <span className="marquee-text">📱 전화연락망 (열람 전용)</span>
                    </div>

                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th style={{width: '15%'}}>NO</th>
                                <th style={{width: '30%'}}>이름</th>
                                <th style={{width: '55%'}}>전화번호</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member, index) => (
                                <tr key={member._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className="name-link">{member.name}</span>
                                    </td>
                                    <td>
                                        <a href={`tel:${member.tel}`} className="tel-link">
                                            {member.tel}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floating Back Button */}
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 2000 }}>
                <button
                    onClick={() => router.push('/dashboard')}
                    style={{
                        width: '50px', height: '50px', borderRadius: '50%', border: 'none',
                        background: 'rgba(10, 132, 255, 0.8)', color: '#fff', fontSize: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                >
                    <i className="bi bi-arrow-left"></i>
                </button>
            </div>
        </div>
    );
}
