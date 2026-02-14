<?php
// obituary_sms.php : 부고장 문자 발송 페이지 (청첩장용 수정본)
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

// 1. 전체 회원 목록 조회 (이름순 정렬)
$membersCursor = $database->members->find(
  [
    'name' => ['$ne' => '공용계정'],
    'tel' => ['$ne' => '', '$exists' => true]
  ],
  ['sort' => ['name' => 1]]
);
$members = iterator_to_array($membersCursor);
?>

<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>청첩장 문자발송</title>

  <!-- 파비콘 -->
  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: #f4f6f9;
      min-height: 100vh;
      font-family: 'Noto Sans KR', sans-serif;
    }

    .main-container {
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: 40px;
    }

    /* 헤더 스타일 */
    .header-section {
      background: white;
      padding: 30px 20px;
      text-align: center;
      border-bottom: 1px solid #ddd;
      margin-bottom: 20px;
    }

    /* 🔥 [수정됨] 제목 글자색 -> 파란색 */
    .header-section h4 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0d6efd;
      margin: 0;
    }

    /* 카드 스타일 */
    .card {
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      margin: 20px;
      background: white;
      overflow: hidden;
    }

    /* 🔥 [수정됨] 카드 헤더 배경색 -> 파란색 */
    .card-header {
      background: #0d6efd;
      color: white;
      font-weight: 700;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* 회원 리스트 스타일 */
    .member-list {
      max-height: 300px;
      overflow-y: auto;
      padding: 10px;
      background: #fafafa;
    }

    .form-check {
      padding: 10px 15px;
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
    }

    .form-check:hover {
      background-color: #f1f3f5;
    }

    .form-check-input {
      width: 20px;
      height: 20px;
      margin-right: 10px;
      cursor: pointer;
      border: 2px solid #adb5bd;
    }

    /* 체크박스 체크 시 색상도 파란색 계열로 맞춤 */
    .form-check-input:checked {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }

    .form-check-label {
      cursor: pointer;
      font-size: 0.95rem;
      color: #333;
      flex: 1;
    }

    .tel-info {
      color: #666;
      font-size: 0.85rem;
      margin-left: 5px;
    }

    .addr-info {
      color: #888;
      font-size: 0.8rem;
      display: block;
      margin-top: 2px;
    }

    /* 텍스트 영역 */
    textarea.form-control {
      border: 1px solid #ccc;
      border-radius: 0;
      padding: 15px;
      font-size: 0.95rem;
      line-height: 1.6;
      min-height: 350px;
      resize: none;
      background-color: #fff;
    }

    /* 버튼 영역 */
    .button-section {
      padding: 0 20px;
      text-align: center;
    }

    .btn {
      border-radius: 8px;
      padding: 12px 30px;
      font-size: 1rem;
      font-weight: 700;
      margin: 5px;
      min-width: 140px;
    }

    /* 🔥 [수정됨] 문자 보내기 버튼 배경색 -> 파란색 */
    .btn-primary-custom {
      background-color: #0d6efd;
      color: white;
      border: none;
    }

    .btn-primary-custom:hover {
      background-color: #0b5ed7;
      color: white;
    }

    .btn-secondary {
      background-color: #6c757d;
      border: none;
      color: white;
    }

    .kakao-buttons {
      display: flex;
      gap: 10px;
      padding: 20px;
      justify-content: center;
    }

    /* 카카오 고유 색상 및 아이콘 스타일링 */
    .btn-kakao-chat {
      background-color: #FEE500;
      color: #3C1E1E;
      font-weight: bold;
      border: none;
      display: flex;
      align-items: center;
    }

    .btn-kakao-chat:hover {
      background-color: #f7d200;
    }

    .kakao-icon {
      margin-right: 5px;
      font-size: 1.2em;
      /* 아이콘 크기 조정 */
    }

    /* 버튼들을 감싸는 컨테이너 */
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 10px;
      flex-wrap: wrap;
      /* 모바일 대응 */
    }


    /* 전체선택 체크박스 */
    #checkAll {
      transform: scale(1.2);
      cursor: pointer;
    }
  </style>
</head>

<body>

  <div class="main-container">
    <div class="header-section">
      <h4>💍 [청첩장] 문자발송</h4>
    </div>

    <form id="smsForm">

      <!-- 1. 발송 대상 선택 -->
      <div class="card">
        <div class="card-header">
          <span>발송 대상 선택 (<?= count($members) ?>명)</span>
          <label style="cursor:pointer; font-size:0.9rem;">
            <input type="checkbox" id="checkAll" checked> 전체 선택
          </label>
        </div>
        <div class="member-list">
          <?php foreach ($members as $m):
            $m_id_str = (string) $m['_id'];
            ?>
            <div class="form-check">
              <input class="form-check-input sms-check" type="checkbox" value="<?= htmlspecialchars($m['tel']) ?>"
                id="m<?= $m_id_str ?>" checked>
              <label class="form-check-label" for="m<?= $m_id_str ?>">
                <strong><?= htmlspecialchars($m['name']) ?></strong>
                <span class="tel-info">(<?= htmlspecialchars($m['tel']) ?>)</span>
                <?php if (!empty($m['addr'])): ?>
                  <span class="addr-info">📍 <?= htmlspecialchars($m['addr']) ?></span>
                <?php endif; ?>
              </label>
            </div>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- 2. 문자 내용 입력 -->
      <div class="card">
        <div class="card-header">문자 내용 (청첩장 알림)</div>
        <textarea id="smsMessage" class="form-control">💍[청첩장 알림]

저희 두 사람, 오랜 인연을 사랑으로 이어
새로운 출발을 맞이하고자 합니다.

귀한 걸음 하셔서 따뜻한 축복과 격려로
저희의 앞날을 빛내 주시면 큰 기쁨이 되겠습니다.

■ 일시 : 202X년 O월 O일(요일) 오후 O시
■ 장소 : OOO 웨딩홀 OO층 OO홀 (서울시 OO구 OO동 123-45)

■ 신랑 : 홍길동 010-0000-0000
■ 신부 : 홍길순 010-0000-0000

■ 마음 전하실 곳 :
   OO은행 123-456-789012 (예금주 : 홍길동)

사랑과 감사의 마음을 담아
소중한 분들을 모시고자 합니다.


</textarea>
      </div>

    </form>

    <div class="button-section">
      <!-- 1행: 문자 보내기 + 카카오톡 공유방 -->
      <div class="action-buttons">
        <!-- 🔥 [수정됨] 클래스 변경: btn-dark -> btn-primary-custom -->
        <button type="button" class="btn btn-primary-custom" onclick="sendSMS()">📩 문자 보내기</button>
        <a href="https://open.kakao.com/o/gWWWIK5h" target="_blank" class="btn btn-kakao-chat">
          <span class="kakao-icon">🔗</span> 카카오톡 공유방
        </a>
      </div>

      <!-- 2행: 돌아가기 -->
      <a href="invitation_tool.php" class="btn btn-secondary" style="width: 100%; max-width: 300px;">⏪ 돌아가기</a>
    </div>
  </div>

  <script>
    // 전체 선택/해제 기능
    document.getElementById('checkAll').addEventListener('change', function () {
      const isChecked = this.checked;
      document.querySelectorAll('.sms-check').forEach(cb => {
        cb.checked = isChecked;
      });
    });

    // SMS 발송 기능
    function sendSMS() {
      const checked = document.querySelectorAll('.sms-check:checked');

      if (checked.length === 0) {
        alert('문자를 보낼 회원을 선택하세요.');
        return;
      }

      const msg = document.getElementById('smsMessage').value.trim();
      if (!msg) {
        alert('문자 내용을 입력하세요.');
        return;
      }

      // 전화번호 추출 및 정제 (숫자만 남김)
      const numbers = Array.from(checked)
        .map(el => el.value.replace(/[^0-9]/g, ''))
        .filter(num => num.length > 0)
        .join(',');

      if (!numbers) {
        alert('유효한 전화번호가 없습니다.');
        return;
      }

      // 모바일 OS에 따른 SMS 링크 생성
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

      // iOS는 &body=, 안드로이드는 ?body= 형식이 호환성이 좋음
      let smsLink = isIOS
        ? `sms:${numbers}&body=${encodeURIComponent(msg)}`
        : `sms:${numbers}?body=${encodeURIComponent(msg)}`;

      // 문자 앱 실행
      window.location.href = smsLink;
    }
  </script>

</body>

</html>