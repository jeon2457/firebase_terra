// src/app/fee/status/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// 타입 정의 (필요에 따라 수정)
type Member = { _id: string; name: string; };
type FeeStatus = { [memberId: string]: { [month: number]: number } };

export default function FeeStatusPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [year, setYear] = useState(new Date().getFullYear());
  const [members, setMembers] = useState<Member[]>([]);
  const [statusMap, setStatusMap] = useState<FeeStatus>({});
  const [loading, setLoading] = useState(true);

  // 1. 데이터 가져오기 (PHP 상단 로직 대체)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/fee/status?year=${year}`);
        const data = await res.json();
        
        if (data.error) {
           alert(data.error);
           return;
        }
        setMembers(data.members);
        setStatusMap(data.passMap);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [year]);

  // 2. 납부 상태 변경 (PHP의 togglePaidStatus 대체)
  const togglePaidStatus = async (memberId: string, month: number, currentStatus: number) => {
    // 관리자 권한 체크 (클라이언트 측)
    if ((session?.user as any)?.user_level < 10) return;
    
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    try {
      const res = await fetch('/api/fee/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId, year, month, paid: newStatus }),
      });
      const result = await res.json();
      
      if (result.success) {
        // UI 즉시 업데이트
        setStatusMap(prev => ({
          ...prev,
          [memberId]: {
            ...prev[memberId],
            [month]: newStatus
          }
        }));
      }
    } catch (err) {
      alert('업데이트 실패');
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="container py-4">
      <h2>{year}년도 회비납부 현황</h2>
      {/* 여기에 PHP의 table HTML 코드를 JSX로 변환해서 넣으세요 */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>이름</th>
            {Array.from({length: 12}, (_, i) => <th key={i}>{i+1}월</th>)}
          </tr>
        </thead>
        <tbody>
          {members.map(mem => (
            <tr key={mem._id}>
              <td>{mem.name}</td>
              {Array.from({length: 12}, (_, i) => {
                const month = i + 1;
                const paid = statusMap[mem._id]?.[month] || 0;
                return (
                  <td key={month} onClick={() => togglePaidStatus(mem._id, month, paid)}>
                     {/* O, X 표시 */}
                     {paid ? 'O' : 'X'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}