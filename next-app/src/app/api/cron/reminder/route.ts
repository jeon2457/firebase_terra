import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

// Vercel Cron Job API
// 25일마다 자동으로 이메일 발송
export async function GET() {
  try {
    const to = 'jeon2457@gmail.com';
    const subject = 'MongoDB 정기 로그인 권장';
    const html = `
      <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1976d2; text-align: center;">📧 MongoDB 정기 접속 알림</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 16px; line-height: 1.6;">
            안녕하세요, 관리자님.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            이 이메일은 <strong>MongoDB Atlas 무료 티어</strong>를 유지하기 위해 자동으로 발송됩니다.
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <strong>⚠️ 중요 알림:</strong>
            <p style="margin: 10px 0 0 0;">
              MongoDB Atlas 무료 티어(Free Tier)는 <strong>3개월간 활동이 없으면 데이터베이스가 삭제</strong>될 수 있습니다.
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            아래 버튼을 클릭하여 MongoDB activity를 발생시켜주세요.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://vercel-terraone.vercel.app/guest/members/view" 
               style="display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              🗂️ MongoDB activity 활동 체크 →
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            * 버튼을 클릭하면 회원연락망 페이지가 열리며, 데이터베이스 읽기 활동이 발생합니다.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #888; text-align: center;">
            이 이메일은 Vercel Cron Job에 의해 자동으로 발송됩니다.<br>
            발송 주기: 매월 25일
          </p>
        </div>
      </div>
    `;

    const result = await sendEmail({ to, subject, html });
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: '이메일이 성공적으로 발송되었습니다.',
        sentAt: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: '이메일 발송에 실패했습니다.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Cron Job 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
