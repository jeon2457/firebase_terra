import nodemailer from 'nodemailer';

// 이메일 발송 함수
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Gmail SMTP 설정 (PHPMailer와 동일한 설정)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS 사용
    auth: {
      user: 'jeon2457@gmail.com', // 보내는 사람 이메일
      pass: 'hbbs xbma zjmk xexj', // 앱 비밀번호
    },
  });

  const mailOptions = {
    from: '"투표관리자" <jeon2457@gmail.com>',
    to: to,
    subject: subject,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    return { success: false, error };
  }
}
