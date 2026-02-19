import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { sendEmail } from '@/lib/email';

// 무료 티어 최대 용량 (0.5GB = 512MB)
const MAX_STORAGE_BYTES = 512 * 1024 * 1024;
// 알림 임계값 (90%)
const ALERT_THRESHOLD = 90;

export async function GET() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: 'MONGODB_URI가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // MongoDB Atlas에 연결
    const conn = await mongoose.connect(MONGODB_URI);
    
    // dbStats 명령으로 스토리지 사용량 조회
    if (!conn.connection.db) {
      return NextResponse.json(
        { error: '데이터베이스 연결 실패' },
        { status: 500 }
      );
    }

    const admin = conn.connection.db.admin();
    const stats = await admin.command({ dbStats: 1 });
    
    // 사용량 계산 (바이트 단위)
    const usedBytes = stats.dataSize || 0;
    const storageBytes = stats.storageSize || 0;
    const indexBytes = stats.indexSize || 0;
    
    // MB 단위로 변환
    const usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
    const maxMB = (MAX_STORAGE_BYTES / (1024 * 1024)).toFixed(2);
    const usagePercent = ((usedBytes / MAX_STORAGE_BYTES) * 100).toFixed(2);
    
    let alertSent = false;

    // 90% 이상 사용 시 이메일 알림
    if (parseFloat(usagePercent) >= ALERT_THRESHOLD) {
      const alertHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">⚠️ MongoDB 스토리지 경고</h2>
          <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>데이터베이스:</strong> terraone_mongo</p>
            <p style="margin: 5px 0;"><strong>사용량:</strong> ${usedMB} MB / ${maxMB} MB</p>
            <p style="margin: 5px 0;"><strong>사용률:</strong> <span style="color: #d32f2f; font-weight: bold;">${usagePercent}%</span></p>
            <p style="margin: 5px 0;"><strong>컬렉션 수:</strong> ${stats.collections}</p>
            <p style="margin: 5px 0;"><strong>문서 수:</strong> ${stats.objects}</p>
          </div>
          <p style="color: #666; font-size: 14px;">
            MongoDB Atlas 무료 티어(M0)의 저장 용량이 ${ALERT_THRESHOLD}% 이상 사용되었습니다.<br/>
            데이터를 정리하거나付费 플랜으로 업그레이드하는 것을 권장합니다.
          </p>
        </div>
      `;

      await sendEmail({
        to: 'jeon2457@gmail.com',
        subject: `⚠️ MongoDB 스토리지 경고 - 사용률 ${usagePercent}%`,
        html: alertHtml,
      });

      alertSent = true;
    }

    return NextResponse.json({
      usedBytes,
      storageBytes,
      indexBytes,
      usedMB,
      maxMB,
      usagePercent,
      alertThreshold: ALERT_THRESHOLD,
      isAlert: parseFloat(usagePercent) >= ALERT_THRESHOLD,
      alertSent,
      database: stats.db,
      collections: stats.collections,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
    });
  } catch (error) {
    console.error('스토리지 모니터링 오류:', error);
    return NextResponse.json(
      { error: '스토리지 조회 실패', details: String(error) },
      { status: 500 }
    );
  }
}
