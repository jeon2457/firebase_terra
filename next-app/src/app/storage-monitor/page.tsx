'use client';

import { useEffect, useState } from 'react';
import { HardDrive, AlertTriangle, CheckCircle, Database } from 'lucide-react';

interface StorageInfo {
  usedBytes: number;
  storageBytes: number;
  indexBytes: number;
  usedMB: string;
  maxMB: string;
  usagePercent: string;
  alertThreshold: number;
  isAlert: boolean;
  alertSent: boolean;
  database: string;
  collections: number;
  objects: number;
  avgObjSize: number;
}

export default function StorageMonitorPage() {
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStorage = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/storage-monitor');
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setStorage(data);
      }
    } catch (err) {
      setError('스토리지 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorage();
  }, []);

  const usagePercent = storage ? parseFloat(storage.usagePercent) : 0;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex align-items-center">
              <HardDrive className="me-2" size={24} />
              <h4 className="mb-0">MongoDB 스토리지 모니터</h4>
            </div>
            
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">로딩 중...</span>
                  </div>
                  <p className="mt-2">스토리지 정보를 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <AlertTriangle className="me-2" />
                  {error}
                </div>
              ) : storage ? (
                <>
                  {/* 사용량 바 */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span>
                        <strong>사용량</strong>
                      </span>
                      <span>
                        {storage.usedMB} MB / {storage.maxMB} MB ({storage.usagePercent}%)
                      </span>
                    </div>
                    <div className="progress" style={{ height: '25px' }}>
                      <div 
                        className={`progress-bar ${usagePercent >= 90 ? 'bg-danger' : usagePercent >= 70 ? 'bg-warning' : 'bg-success'}`}
                        role="progressbar"
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      >
                        {storage.usagePercent}%
                      </div>
                    </div>
                  </div>

                  {/* 상태 표시 */}
                  <div className="alert alert-light border mb-4">
                    <div className="d-flex align-items-center">
                      {storage.isAlert ? (
                        <>
                          <AlertTriangle className="text-danger me-2" size={24} />
                          <span className="text-danger fw-bold">
                            ⚠️ 스토리지 사용량이 {storage.alertThreshold}%를 초과했습니다!
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="text-success me-2" size={24} />
                          <span className="text-success fw-bold">
                            ✅ 스토리지 상태 정상
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 상세 정보 */}
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th className="table-light" style={{ width: '40%' }}>
                          <Database className="me-2" size={16} />
                          데이터베이스
                        </th>
                        <td>{storage.database}</td>
                      </tr>
                      <tr>
                        <th className="table-light">컬렉션 수</th>
                        <td>{storage.collections}개</td>
                      </tr>
                      <tr>
                        <th className="table-light">문서 수</th>
                        <td>{storage.objects?.toLocaleString()}개</td>
                      </tr>
                      <tr>
                        <th className="table-light">데이터 크기</th>
                        <td>{storage.usedMB} MB</td>
                      </tr>
                      <tr>
                        <th className="table-light">인덱스 크기</th>
                        <td>{(storage.indexBytes / (1024 * 1024)).toFixed(2)} MB</td>
                      </tr>
                      <tr>
                        <th className="table-light">평균 문서 크기</th>
                        <td>{(storage.avgObjSize / 1024).toFixed(2)} KB</td>
                      </tr>
                      <tr>
                        <th className="table-light">최대 용량</th>
                        <td>{storage.maxMB} MB (무료 티어 M0)</td>
                      </tr>
                      {storage.alertSent && (
                        <tr>
                          <th className="table-light">이메일 알림</th>
                          <td className="text-danger">
                            ✅ jeon2457@gmail.com으로 경고 이메일이 발송되었습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* 새로고침 버튼 */}
                  <div className="text-center mt-3">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={fetchStorage}
                      disabled={loading}
                    >
                      🔄 새로고침
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* 도움말 */}
          <div className="card mt-3">
            <div className="card-body">
              <h6>📌 안내사항</h6>
              <ul className="mb-0 small text-muted">
                <li>MongoDB Atlas 무료 티어(M0)는 최대 512MB까지 사용 가능합니다.</li>
                <li>저장 용량이 90%(460MB)를 초과하면 자동으로 이메일 알림이 전송됩니다.</li>
                <li>용량 초과 시 데이터를 정리하거나付费 플랜으로 업그레이드해야 합니다.</li>
                <li>이미지, 영상 등 대용량 파일은 Cloudinary에 저장하고 DB에는 URL만 저장하세요.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
