<?php
// bugo_view.php : 부고장 확인 및 단체문자 발송 페이지
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// mode=view 파라미터가 있으면(공개용) 로그인 체크를 하지 않습니다.
if (!isset($_GET['mode']) || $_GET['mode'] !== 'view') {
  if (file_exists('./php/auth_check.php')) {
    require './php/auth_check.php';
  }
}

require_once __DIR__ . '/php/db-connect-mongo.php';

try {
  // 1. 전체 회원 목록 조회 (이름순) - 관리자용 발송 리스트용
  // '공용계정' 제외 및 전화번호 있는 회원만
  $membersCursor = $database->members->find(
    [
      'name' => ['$ne' => '공용계정'],
      'tel' => ['$ne' => '', '$exists' => true]
    ],
    ['sort' => ['name' => 1]]
  );
  $members = iterator_to_array($membersCursor);
} catch (Exception $e) {
  $members = [];
  $error_msg = $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>🙏 부고 안내 - 삼가 고인의 명복을 빕니다</title>

  <!-- Open Graph 메타태그 (공유 시 표시될 기본값) -->
  <meta property="og:title" id="ogTitle" content="부고 안내 - 삼가 고인의 명복을 빕니다">
  <meta property="og:description" id="ogDesc" content="빈소 위치 및 발인 일정을 확인하시기 바랍니다.">
  <meta property="og:type" content="website">
  <meta property="og:image" content="image/gughwak.jpg">

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap');

    body {
      background: #2a2a2a;
      min-height: 100vh;
      padding: 10px;
      font-family: 'Nanum Gothic', sans-serif;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    /* --- 회원 목록 섹션 --- */
    .member-card {
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #ddd;
      margin-bottom: 20px;
      overflow: hidden;
    }

    .member-header {
      background: #343a40;
      color: white;
      padding: 12px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }

    .member-list {
      max-height: 250px;
      overflow-y: auto;
      padding: 10px;
      display: none;
      /* 기본값 숨김 */
    }

    .form-check {
      background: white;
      padding: 8px 12px;
      border: 1px solid #eee;
      border-radius: 6px;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
    }

    .form-check-input {
      width: 18px;
      height: 18px;
      margin-right: 10px;
    }

    .form-check-label {
      font-size: 0.9rem;
      flex: 1;
    }

    .sms-btn-group {
      padding: 10px;
      background: #eee;
      text-align: center;
    }

    /* --- 부고장 카드 스타일 --- */
    .obituary-card {
      background: white;
      border: 5px double #000;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
      margin-bottom: 30px;
      position: relative;
    }

    .obituary-header {
      position: relative;
      background-color: #000;
      background-image: url('image/gughwak.jpg');
      background-size: cover;
      background-position: center;
      padding: 60px 20px;
      text-align: center;
      overflow: hidden;
    }

    .obituary-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 1;
    }

    .obituary-title {
      position: relative;
      z-index: 2;
      font-size: 3rem;
      font-weight: 800;
      letter-spacing: 15px;
      margin: 0;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .obituary-subtitle {
      position: relative;
      z-index: 2;
      font-size: 1.1rem;
      letter-spacing: 5px;
      margin-top: 10px;
      color: white;
      opacity: 0.9;
    }

    .obituary-body {
      padding: 40px 20px;
      background: #fafafa;
    }

    .deceased-info {
      text-align: center;
      padding: 30px 15px;
      background: white;
      border: 2px solid #000;
      margin-bottom: 30px;
    }

    .deceased-name {
      font-size: 2.2rem;
      font-weight: 800;
      margin: 15px 0 5px 0;
      letter-spacing: 5px;
    }

    .deceased-age {
      font-size: 1.2rem;
      color: #555;
      margin-bottom: 20px;
    }

    .deceased-date {
      font-size: 1rem;
      line-height: 1.7;
      color: #333;
      white-space: pre-line;
      font-weight: 600;
    }

    .info-section {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid #ddd;
      border-left: 5px solid #000;
    }

    .info-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #000;
    }

    .info-row {
      display: flex;
      margin-bottom: 10px;
      border-bottom: 1px dotted #ddd;
      padding-bottom: 5px;
    }

    .info-label {
      font-weight: 700;
      min-width: 80px;
      color: #000;
      font-size: 0.9rem;
    }

    .info-value {
      flex: 1;
      color: #333;
      font-size: 0.9rem;
      white-space: pre-line;
    }

    .message-section {
      background: #fff;
      padding: 30px 20px;
      margin: 20px 0;
      border: 2px dashed #999;
      text-align: center;
      line-height: 1.8;
      font-size: 0.95rem;
      white-space: pre-line;
    }

    .condolence-section {
      background: #f5f5f5;
      padding: 25px;
      border: 2px solid #000;
      text-align: center;
    }

    .account-text {
      font-size: 1rem;
      line-height: 1.6;
      font-weight: bold;
    }

    .ribbon {
      position: absolute;
      top: 20px;
      left: -10px;
      background: #000;
      color: white;
      padding: 5px 20px;
      z-index: 3;
      font-size: 0.8rem;
    }

    .btn-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 20px;
      align-items: center;
    }

    .btn-custom {
      display: block;
      width: 100%;
      padding: 15px;
      background: #1a1a1a;
      color: white;
      border: none;
      font-size: 1.1rem;
      font-weight: 700;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
    }

    .btn-kakao {
      background-color: #FEE500;
      color: #3C1E1E;
    }

    .btn-back {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 30px;
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 700;
      width: 100%;
      max-width: 220px;
    }

    @media (max-width: 576px) {
      .obituary-title {
        font-size: 2.2rem;
        letter-spacing: 10px;
      }

      .deceased-name {
        font-size: 1.8rem;
      }

      .obituary-body {
        padding: 25px 15px;
      }
    }
  </style>
</head>

<body>

  <div class="container">

    <!-- 1. 단체 문자 발송용 회원 목록 섹션 (공개모드 mode=view 일 때는 자동 숨김) -->
    <div class="member-card" id="memberSection">
      <div class="member-header" onclick="toggleMemberList()">
        <span><i class="bi bi-people-fill"></i> 발송 대상 선택 (<?= count($members) ?>명)</span>
        <span id="toggleIcon"><i class="bi bi-chevron-down"></i></span>
      </div>
      <div class="member-list" id="memberListArea">
        <div class="form-check" style="background:#e9ecef; position: sticky; top: 0; z-index: 10;">
          <input class="form-check-input" type="checkbox" id="checkAll" checked>
          <label class="form-check-label" for="checkAll"><strong>전체 선택/해제</strong></label>
        </div>
        <?php foreach ($members as $m):
          $mId = (string) $m['_id'];
          ?>
          <div class="form-check">
            <input class="form-check-input sms-check" type="checkbox" value="<?= htmlspecialchars($m['tel']) ?>"
              id="m<?= $mId ?>" checked>
            <label class="form-check-label" for="m<?= $mId ?>">
              <?= htmlspecialchars($m['name']) ?> <span class="text-muted"
                style="font-size:0.8rem;">(<?= htmlspecialchars($m['tel']) ?>)</span>
            </label>
          </div>
        <?php endforeach; ?>
      </div>
      <div class="sms-btn-group">
        <button type="button" class="btn btn-dark w-100" onclick="sendBulkSMS()">
          <i class="bi bi-chat-fill"></i> 선택된 회원에게 부고장 링크 발송
        </button>
      </div>
    </div>

    <!-- 2. 부고장 카드 섹션 -->
    <div class="obituary-card" id="obituaryContent">
      <div class="ribbon">訃告</div>
      <div class="obituary-header">
        <h1 class="obituary-title">訃 告</h1>
        <p class="obituary-subtitle">부 고</p>
      </div>
      <div class="obituary-body">
        <div id="loading" style="text-align:center; padding:50px;">
          <div class="spinner-border"></div>
          <p>데이터 로딩 중...</p>
        </div>
        <div id="contentArea" style="display:none;">
          <div class="deceased-info">
            <div style="font-size: 1.1rem; color: #666;">故</div>
            <h2 class="deceased-name" id="viewDeceasedName"></h2>
            <p class="deceased-age" id="viewAge"></p>
            <div class="deceased-date" id="viewIntro"></div>
          </div>
          <div class="info-section">
            <h3 class="info-title">■ 빈소 안내</h3>
            <div class="info-row"><span class="info-label">빈소:</span><span class="info-value"
                id="viewFuneralHome"></span></div>
            <div class="info-row"><span class="info-label">주소:</span><span class="info-value"
                id="viewFuneralAddress"></span></div>
            <div class="info-row"><span class="info-label">발인:</span><span class="info-value"
                id="viewDepartureTime"></span></div>
            <div class="info-row"><span class="info-label">장지:</span><span class="info-value" id="viewCemetery"></span>
            </div>
          </div>
          <div class="info-section">
            <h3 class="info-title">■ 상주</h3>
            <div id="viewMourners" style="white-space: pre-line;"></div>
          </div>
          <div class="message-section" id="viewMessage"></div>
          <div class="condolence-section" id="condolenceSection" style="display: none;">
            <h3 class="info-title">마음 전하실 곳</h3>
            <p class="account-text" id="viewBankInfo"></p>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 하단 버튼 영역 -->
    <div class="btn-container" id="controlButtons">
      <button class="btn-custom" onclick="copyLink()">🔗 부고 주소 복사하기</button>
      <a href="https://open.kakao.com/o/gWWWIK5h" target="_blank" class="btn-custom btn-kakao">🔗 카톡 공유방 이동</a>
      <a href="bugo_input.html" style="color:#aaa; text-decoration:none; font-size:0.9rem; margin-top:10px;">✏️ 새 부고장
        작성하기</a>
      <a href="invitation_tool.php" class="btn-back">⏪ 돌아가기</a>
    </div>
  </div>

  <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
    import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

    const firebaseConfig = {
      apiKey: "AIzaSyAF7AD1d54k21-stmb0Hpg9OMEECvzFHpQ",
      authDomain: "terraone-d0318.firebaseapp.com",
      databaseURL: "https://terraone-d0318-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "terraone-d0318",
      storageBucket: "terraone-d0318.appspot.com",
      messagingSenderId: "1082807340877",
      appId: "1:1082807340877:web:6e2b49c04562d800e87104",
      measurementId: "G-7HMJEV832S"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const dataId = new URLSearchParams(window.location.search).get('id');

    if (dataId) {
      get(ref(db, 'event_cards/' + dataId)).then((snapshot) => {
        if (snapshot.exists()) renderData(snapshot.val());
        else alert("데이터를 찾을 수 없습니다.");
      }).catch((error) => {
        console.error(error);
        alert("데이터 로드 중 오류가 발생했습니다.");
      });
    }

    function renderData(data) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('contentArea').style.display = 'block';
      document.getElementById('viewDeceasedName').innerText = data.deceasedName;
      document.getElementById('viewAge').innerText = data.age ? `(享年 ${data.age}세)` : '';
      document.getElementById('viewIntro').innerText = data.intro;
      document.getElementById('viewFuneralHome').innerText = data.funeralHome;
      document.getElementById('viewFuneralAddress').innerText = data.funeralAddress;
      document.getElementById('viewDepartureTime').innerText = data.departureTime;
      document.getElementById('viewCemetery').innerText = data.cemetery;
      document.getElementById('viewMourners').innerText = data.mourners;
      document.getElementById('viewMessage').innerText = data.message;
      if (data.bankInfo) {
        document.getElementById('condolenceSection').style.display = 'block';
        document.getElementById('viewBankInfo').innerText = data.bankInfo;
      }
      // SMS 전송을 위해 고인 성함 전역 저장
      window.deceasedName = data.deceasedName;

      // 동적 미리보기 정보 갱신 시도
      const dynamicTitle = `[부고] 故 ${data.deceasedName}님께서 별세하셨기에 삼가 알려드립니다.`;
      document.title = dynamicTitle;
      document.querySelector('meta[property="og:title"]').setAttribute('content', dynamicTitle);
    }
  </script>

  <script>
    // 회원 목록 토글
    function toggleMemberList() {
      const list = document.getElementById('memberListArea');
      const icon = document.getElementById('toggleIcon');
      if (list.style.display === 'block') {
        list.style.display = 'none';
        icon.innerHTML = '<i class="bi bi-chevron-down"></i>';
      } else {
        list.style.display = 'block';
        icon.innerHTML = '<i class="bi bi-chevron-up"></i>';
      }
    }

    // 전체 선택 기능
    document.getElementById('checkAll').addEventListener('change', function () {
      const checked = this.checked;
      document.querySelectorAll('.sms-check').forEach(cb => cb.checked = checked);
    });

    // 단체 SMS 발송
    function sendBulkSMS() {
      const checked = document.querySelectorAll('.sms-check:checked');
      if (checked.length === 0) { alert('대상자를 선택하세요.'); return; }

      const numbers = Array.from(checked).map(cb => cb.value.replace(/[^0-9]/g, '')).join(',');

      // 부고 전용 보기 모드 링크 생성
      let shareLink = window.location.origin + window.location.pathname + window.location.search;
      if (shareLink.indexOf('mode=view') === -1) shareLink += '&mode=view';

      // SMS 메시지 내용 구성
      const msg = `[부고알림-직지35]\n故 ${window.deceasedName || 'OOO'}님께서 별세하셨기에 알려드립니다.\n\n아래 링크에서 자세한 내용을 확인하세요.\n${shareLink}`;

      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      const smsLink = isIOS ? `sms:${numbers}&body=${encodeURIComponent(msg)}` : `sms:${numbers}?body=${encodeURIComponent(msg)}`;

      window.location.href = smsLink;
    }

    // 주소 복사 (HTTPS/HTTP 대응 및 문구 포함 수정)
    function copyLink() {
      let currentUrl = window.location.origin + window.location.pathname + window.location.search;
      if (currentUrl.indexOf('mode=view') === -1) {
        currentUrl += '&mode=view';
      }

      // 복사할 전체 문구 구성
      const fullMsg = `[부고알림-직지35]\n故 ${window.deceasedName || 'OOO'}님께서 별세하셨기에 알려드립니다.\n\n아래 링크에서 자세한 내용을 확인하세요.\n${currentUrl}`;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(fullMsg).then(() => alert('부고 안내 문구와 주소가 복사되었습니다.\n문자나 카톡에 붙여넣기 하세요.')).catch(() => fallbackCopy(fullMsg));
      } else {
        fallbackCopy(fullMsg);
      }
    }

    function fallbackCopy(text) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        alert('부고 안내 문구와 주소가 복사되었습니다.');
      } catch (err) {
        prompt("아래 내용을 복사하세요:", text);
      }
      document.body.removeChild(ta);
    }

    // 공유 모드일 때 발송 리스트와 버튼 숨김
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'view') {
      if (document.getElementById('memberSection')) document.getElementById('memberSection').style.display = 'none';
      if (document.getElementById('controlButtons')) document.getElementById('controlButtons').style.display = 'none';
      // 배경색을 조금 더 차분하게 변경 (옵션)
      document.body.style.background = "#1a1a1a";
    }
  </script>
</body>

</html>