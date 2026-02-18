'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Alert, Badge, Table } from 'react-bootstrap';

interface CleanupStats {
    totalIncome: number;
    totalExpense: number;
    deletableByPeriod: {
        [key: string]: {
            income: number;
            expense: number;
        };
    };
}

export default function DataCleanupDashboard() {
    const [stats, setStats] = useState<CleanupStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [cleanupResult, setCleanupResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/cleanup/financial');
            const data = await response.json();
            
            if (data.success) {
                setStats(data.statistics);
            } else {
                setError('통계 조회 실패: ' + data.error);
            }
        } catch (err) {
            setError('통계 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCleanup = async (yearsToKeep: number = 2) => {
        if (!confirm(`정말로 ${yearsToKeep}년 이전의 모든 재무 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            setCleanupResult(null);

            const response = await fetch('/api/cleanup/financial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ yearsToKeep }),
            });

            const data = await response.json();
            
            if (data.success) {
                setCleanupResult(data);
                fetchStats(); // 통계 새로고침
            } else {
                setError('정리 실패: ' + data.error);
            }
        } catch (err) {
            setError('데이터 정리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-12">
                    <h2 className="mb-4">📊 데이터베이스 정리 대시보드</h2>
                    
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {cleanupResult && (
                        <Alert variant="success" dismissible onClose={() => setCleanupResult(null)}>
                            <strong>정리 완료!</strong> {cleanupResult.message}
                        </Alert>
                    )}

                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">📈 현재 데이터 현황</h5>
                        </Card.Header>
                        <Card.Body>
                            {loading && !stats ? (
                                <div className="text-center">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : stats ? (
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                                            <h3 className="text-primary">{stats.totalIncome.toLocaleString()}</h3>
                                            <p className="mb-0">총 수입 기록</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-center p-3 bg-danger bg-opacity-10 rounded">
                                            <h3 className="text-danger">{stats.totalExpense.toLocaleString()}</h3>
                                            <p className="mb-0">총 지출 기록</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                                            <h3 className="text-info">{(stats.totalIncome + stats.totalExpense).toLocaleString()}</h3>
                                            <p className="mb-0">전체 레코드</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted">데이터를 불러올 수 없습니다.</p>
                            )}
                        </Card.Body>
                    </Card>

                    {stats && (
                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">🗑️ 삭제 가능 데이터</h5>
                            </Card.Header>
                            <Card.Body>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>보관 기간</th>
                                            <th>수입 (건)</th>
                                            <th>지출 (건)</th>
                                            <th>합계</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(stats.deletableByPeriod).map(([period, data]) => (
                                            <tr key={period}>
                                                <td>{period}</td>
                                                <td>{data.income.toLocaleString()}</td>
                                                <td>{data.expense.toLocaleString()}</td>
                                                <td><strong>{(data.income + data.expense).toLocaleString()}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    )}

                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">⚠️ 데이터 정리 작업</h5>
                        </Card.Header>
                        <Card.Body>
                            <Alert variant="warning">
                                <strong>주의:</strong> 이 작업은 되돌릴 수 없습니다. 중요한 데이터는 백업해주세요.
                            </Alert>
                            
                            <div className="d-flex gap-2 flex-wrap">
                                <Button 
                                    variant="outline-primary" 
                                    onClick={() => handleCleanup(1)}
                                    disabled={loading}
                                >
                                    1년 이전 데이터 삭제
                                </Button>
                                <Button 
                                    variant="outline-warning" 
                                    onClick={() => handleCleanup(2)}
                                    disabled={loading}
                                >
                                    2년 이전 데이터 삭제
                                </Button>
                                <Button 
                                    variant="outline-danger" 
                                    onClick={() => handleCleanup(3)}
                                    disabled={loading}
                                >
                                    3년 이전 데이터 삭제
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    onClick={fetchStats}
                                    disabled={loading}
                                >
                                    통계 새로고침
                                </Button>
                            </div>

                            <div className="mt-3">
                                <small className="text-muted">
                                    💡 <strong>권장사항:</strong> MongoDB Atlas 무료 티어(512MB) 제한을 방지하기 위해 
                                    정기적으로 오래된 데이터를 정리하세요.
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
}