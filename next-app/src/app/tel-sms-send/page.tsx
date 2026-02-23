"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function TelSmsSendPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const listParam = searchParams.get('list') || '';
    const fromTel = searchParams.get('from') || '';
    
    const targetNumbers = listParam
        .split(',')
        .map(n => n.trim())
        .filter(n => n && n !== fromTel);

    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCount, setSelectedCount] = useState(0);
    const [selectAll, setSelectAll] = useState(true);

    useEffect(() => {
        document.title = "단체문자발송";
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await axios.get("/api/members");
            if (res.data.success) {
                const filteredMembers = res.data.data
                    .filter((m: any) => m.name !== '공용계정' && m.id !== 'jikji35')
                    .map((m: any) => {
                        const tel = m.tel?.replace(/[^0-9]/g, '') || '';
                        return { ...m, tel, telFormatted: formatPhoneNumber(m.tel) };
                    })
                    .filter((m: any) => targetNumbers.includes(m.tel));
                
                // 이름 기준 가나다순 정렬
                filteredMembers.sort((a: any, b: any) => a.name.localeCompare(b.name, 'ko'));
                
                setMembers(filteredMembers);
                setSelectedCount(filteredMembers.length);
            }
        } catch (error) {
            console.error("Failed to fetch members", error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        const checkboxes = document.querySelectorAll('.member-check') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach(cb => {
            cb.checked = checked;
        });
        setSelectedCount(checked ? members.length : 0);
    };

    const handleIndividualChange = () => {
        const checkedBoxes = document.querySelectorAll('.member-check:checked');
        setSelectedCount(checkedBoxes.length);
        setSelectAll(checkedBoxes.length === members.length);
    };

    const handleSend = () => {
        const checkedBoxes = document.querySelectorAll('.member-check:checked') as NodeListOf<HTMLInputElement>;
        const selectedNumbers = Array.from(checkedBoxes).map(cb => cb.value);

        if (selectedNumbers.length === 0) {
            alert('발송할 회원을 선택해주세요.');
            return;
        }

        if (!confirm(`${selectedNumbers.length}명에게 단체문자를 보내시겠습니까?`)) return;

        // SMS 앱 실행
        location.href = 'sms:' + selectedNumbers.join(',');
    };

    if (loading) {
        return (
            <div style={{ background: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                Loading...
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
                body {
                    background: #f5f6fa;
                    margin: 0;
                    font-family: 'Noto Sans KR', sans-serif;
                }
            `}</style>
            <style jsx>{`
                .container {
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 20px 15px 50px 15px;
                }
                .title {
                    text-align: center;
                    background: #f0f4ff;
                    padding: 16px 0;
                    margin: 20px auto 30px auto;
                    width: 90%;
                    max-width: 500px;
                    border-radius: 25px;
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #2a3d7c;
                }
                .count-area {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    max-width: 700px;
                    margin: 0 auto 10px auto;
                    padding: 0 10px;
                }
                .count {
                    font-size: 1rem;
                }
                .count .number {
                    color: #1a73e8;
                    font-weight: 700;
                }
                .select-all-area {
                    font-weight: bold;
                    font-size: 0.95rem;
                    color: #333;
                }
                .scroll-box {
                    border: 1px solid #e6e9ee;
                    border-radius: 10px;
                    padding: 10px;
                    max-height: 70vh;
                    overflow-y: auto;
                    background: #fafafa;
                }
                .grid-box {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }
                .grid-item {
                    background: white;
                    padding: 10px;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    font-size: 0.9rem;
                    line-height: 1.4rem;
                    border: 1px solid #eee;
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                }
                .item-info {
                    flex: 1;
                    word-break: break-word;
                }
                .controls {
                    margin-top: 20px;
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .btn-send {
                    background: #1a73e8;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 14px 40px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .btn-send:hover {
                    background: #1557b0;
                    transform: translateY(-2px);
                }
                .btn-back {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 30px;
                    background: white;
                    color: #6c757d;
                    border: 1px solid #6c757d;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .btn-back:hover {
                    background: #6c757d;
                    color: #fff;
                }
                @media (max-width: 768px) {
                    .grid-box {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 576px) {
                    .controls {
                        flex-direction: column;
                        width: 100%;
                    }
                    .controls .btn {
                        width: 100%;
                    }
                    .btn-back {
                        width: 100%;
                    }
                }
            `}</style>

            <div className="container">
                <div className="title">단체 문자 발송</div>

                <div className="count-area">
                    <div className="count">
                        선택된 발송 인원: <span className="number">{selectedCount}</span> 명
                    </div>
                    <div className="select-all-area">
                        <input 
                            type="checkbox" 
                            id="checkAll" 
                            className="form-check-input" 
                            checked={selectAll}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <label htmlFor="checkAll" style={{ cursor: 'pointer', marginLeft: '8px' }}>전체선택</label>
                    </div>
                </div>

                <div className="scroll-box">
                    <div className="grid-box" id="memberList">
                        {members.map((m, idx) => (
                            <div className="grid-item" key={m._id || idx}>
                                <input 
                                    type="checkbox" 
                                    className="form-check-input member-check" 
                                    value={m.tel} 
                                    defaultChecked={true}
                                    onChange={handleIndividualChange}
                                />
                                <div className="item-info">
                                    <strong>{idx + 1}. {m.name}</strong><br />
                                    ({m.remark})<br />
                                    📞 {m.telFormatted}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="controls">
                    <button type="button" className="btn-send" onClick={handleSend}>
                        단체문자보내기
                    </button>
                    <button type="button" className="btn-back" onClick={() => router.back()}>
                        ⏪ 돌아가기
                    </button>
                </div>
            </div>
        </>
    );
}
