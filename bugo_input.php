<?php
// bugo_input.php : 부고장 작성 도구 (관리자 전용)
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// 🔹 [추가] 관리자 보안 로직: Level 10 미만은 접근 차단 및 로그인 유도
if (!isset($_SESSION['user_level']) || $_SESSION['user_level'] < 10) {
  // 현재 접속한 페이지 주소를 세션에 저장 (로그인 성공 후 다시 돌아오기 위함)
  $_SESSION['redirect_url'] = $_SERVER['REQUEST_URI'];

  echo "<script>
        alert('관리자 전용 페이지입니다. 로그인이 필요합니다.');
        location.href = 'login.php';
    </script>";
  exit;
}
?>
<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>부고장 작성</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      background: linear-gradient(135deg, #434343 0%, #000000 100%);
      min-height: 100vh;
      padding: 20px 10px;
      font-family: 'Nanum Myeongjo', serif;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .card {
      border: 3px solid #333;
      border-radius: 0;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      background: #fefefe;
    }

    .card-header {
      background: #1a1a1a;
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-bottom: 3px solid #333;
    }

    .card-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: 3px;
    }

    .card-body {
      padding: 40px 30px;
      background: white;
    }

    .notice {
      display: block;
      max-width: 720px;
      margin: 12px auto;
      padding: 12px;
      border: 1px solid #e5eaf0;
      border-radius: 8px;
      background: #f8fbff;
    }

    .notice-badge {
      display: inline-block;
      margin-bottom: 8px;
      padding: 2px 8px;
      border-radius: 12px;
      background: #1a73e8;
      color: #ffffff;
      font-weight: 600;
      font-size: 11px;
      line-height: 1.4;
    }

    .notice-text {
      margin: 0;
      color: #1a73e8;
      font-size: 10px;
      line-height: 1.6;
      word-break: keep-all;
    }

    .form-label {
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
      font-size: 0.95rem;
    }

    .form-control,
    .form-select {
      border: 2px solid #ddd;
      border-radius: 5px;
      padding: 12px;
      font-size: 1rem;
    }

    .form-control:focus,
    .form-select:focus {
      border-color: #333;
      box-shadow: 0 0 0 0.2rem rgba(0, 0, 0, 0.1);
    }

    .section-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 30px 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #333;
    }

    .btn-custom {
      display: block;
      width: 100%;
      padding: 18px;
      background: #1a1a1a;
      color: white;
      border: none;
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 2px;
      margin-top: 15px;
      transition: all 0.3s;
      text-align: center;
      text-decoration: none;
      border-radius: 0;
      cursor: pointer;
    }

    .btn-custom:hover {
      background: #333;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }

    .info-text {
      color: #666;
      font-size: 0.85rem;
      margin-top: 5px;
    }

    .mourner-group {
      background: #f8f8f8;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 15px;
      border: 1px solid #ddd;
    }

    .btn-add-mourner {
      background: #555;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      font-weight: 600;
      margin-top: 10px;
    }

    .btn-remove {
      background: #dc3545;
      color: white;
      border: none;
      padding: 5px 15px;
      border-radius: 5px;
      font-size: 0.85rem;
      float: right;
    }

    .btn-kakao-chat {
      background-color: #FEE500;
      color: #3C1E1E;
      font-weight: bold;
      border: none;
    }

    .btn-back {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 30px;
      background: rgba(255, 255, 255, 0.9);
      color: #667eea;
      border: 2px solid #667eea;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      margin: 30px auto 0;
      width: 100%;
      max-width: 220px;
    }

    .btn-back:hover {
      background: #667eea;
      color: #fff;
      transform: translateY(-2px);
    }
  </style>
</head>

<body>

  <div class="container">
    <div class="card">
      <div class="card-header">
        <h1>訃 告 作 成</h1>
        <p style="margin: 10px 0 0 0; font-size: 0.9rem; letter-spacing: 1px;">부고장 작성</p>
      </div>

      <div class="card-body">
        <form id="obituaryForm">
          <div class="section-title">■ 인삿말</div>
          <div class="mb-3">
            <textarea class="form-control" id="intro"
              rows="3">{상주이름}의 [관계:수작업 기재] {고인성함} 님께서{별세일} {별세시간}경에 별세 하셨기에 삼가 알려드립니다.</textarea>
          </div>

          <section class="notice">
            <span class="notice-badge">[안내]</span>
            <p class="notice-text">
              할아버지(조부), 할머니(조모), 아버지(부친), 어머니(모친), 장인어른(빙부), 장모님(빙모), 시아버지(시부), 시어머니(시모) 등...
            </p>
          </section>

          <div class="section-title">■ 고인 정보</div>
          <div class="row">
            <div class="col-md-8 mb-3">
              <label class="form-label">故人 성함 *</label>
              <input type="text" class="form-control" id="deceasedName" required>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">향년 *</label>
              <input type="text" class="form-control" id="age" required>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">별세일 *</label>
              <input type="date" class="form-control" id="deathDate" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">별세시간</label>
              <input type="time" class="form-control" id="deathTime">
            </div>
          </div>

          <div class="section-title">■ 빈소 정보</div>
          <div class="mb-3">
            <label class="form-label">빈소 위치 *</label>
            <input type="text" class="form-control" id="funeralHome" required>
          </div>
          <div class="mb-3">
            <label class="form-label">빈소 주소</label>
            <input type="text" class="form-control" id="funeralAddress">
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">발인일시 *</label>
              <input type="text" class="form-control" id="departureTime" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">장지 *</label>
              <input type="text" class="form-control" id="cemetery" required>
            </div>
          </div>

          <div class="section-title">■ 상주 정보</div>
          <div id="mournersContainer">
            <div class="mourner-group" id="mourner-1">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">관계</label>
                  <select class="form-select mourner-relation">
                    <option value="장남">장남</option>
                    <option value="차남">차남</option>
                    <option value="삼남">삼남</option>
                    <option value="장녀">장녀</option>
                    <option value="차녀">차녀</option>
                    <option value="배우자">배우자</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">성함</label>
                  <input type="text" class="form-control mourner-name">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">연락처</label>
                  <input type="tel" class="form-control mourner-phone">
                </div>
              </div>
            </div>
          </div>
          <button type="button" class="btn-add-mourner" onclick="addMourner()">+ 상주 추가</button>

          <div class="section-title">■ 마음 전하실 곳</div>
          <div class="mb-3">
            <label class="form-label">은행명</label>
            <input type="text" class="form-control" id="bankName">
          </div>
          <div class="mb-3">
            <label class="form-label">계좌번호</label>
            <input type="text" class="form-control" id="accountNumber">
          </div>
          <div class="mb-3">
            <label class="form-label">예금주</label>
            <input type="text" class="form-control" id="accountHolder">
          </div>

          <div class="section-title">■ 인사말</div>
          <div class="mb-3">
            <textarea class="form-control" id="message" rows="5">💐 삼가 고인의 명복을 빕니다.</textarea>
          </div>

          <button type="submit" class="btn-custom" id="submitBtn">부고장 생성하기</button>
          <button type="button" class="btn-custom" onclick="goToViewPage()">부고장 보러가기</button>

          <a href="https://open.kakao.com/o/gWWWIK5h" target="_blank" class="btn-custom btn-kakao-chat">🔗 카톡 공유방</a>
          <a href="invitation_tool.php" class="btn-back">⏪ 돌아가기</a>
        </form>
      </div>
    </div>
  </div>

  <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
    import { getDatabase, ref, push } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

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

    // --- [추가 코드 시작] 실시간 인삿말 매칭 로직 ---
    const introEl = document.getElementById('intro');
    const dNameEl = document.getElementById('deceasedName');
    const dDateEl = document.getElementById('deathDate');
    const dTimeEl = document.getElementById('deathTime');

    function updateIntro() {
      // 첫 번째 상주의 성함 가져오기
      const firstMournerName = document.querySelector('.mourner-name')?.value || "{상주이름}";
      const deceasedName = dNameEl.value || "{고인성함}";
      let deathDate = dDateEl.value || "{별세일}";
      let deathTime = dTimeEl.value || "{별세시간}";

      // 날짜 가독성 처리 (YYYY-MM-DD -> YYYY년 MM월 DD일)
      if (dDateEl.value) {
        const dates = dDateEl.value.split('-');
        deathDate = ` ${dates[0]}년 ${dates[1]}월 ${dates[2]}일`;
      }

      // 시간 가독성 처리 (HH:MM -> HH시 MM분)
      if (dTimeEl.value) {
        const times = dTimeEl.value.split(':');
        deathTime = ` ${times[0]}시 ${times[1]}분`;
      }

      introEl.value = `${firstMournerName}의 [관계:수작업 기재] ${deceasedName} 님께서${deathDate} ${deathTime}경에 별세 하셨기에 삼가 알려드립니다.`;
    }

    // 각 입력 필드에 이벤트 리스너 등록
    [dNameEl, dDateEl, dTimeEl].forEach(el => {
      el.addEventListener('input', updateIntro);
    });

    // 상주 성함은 동적 생성이므로 document 레벨에서 위임 처리
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('mourner-name')) {
        updateIntro();
      }
    });
    // --- [추가 코드 끝] ---

    window.mournerCount = 1;
    window.addMourner = function () {
      window.mournerCount++;
      const container = document.getElementById('mournersContainer');
      const mournerHTML = `
      <div class="mourner-group" id="mourner-${window.mournerCount}">
        <button type="button" class="btn-remove" onclick="removeMourner(${window.mournerCount})">삭제</button>
        <div class="row">
          <div class="col-md-4 mb-3">
            <label class="form-label">관계</label>
            <select class="form-select mourner-relation">
              <option value="장남">장남</option><option value="차남">차남</option>
              <option value="삼남">삼남</option><option value="장녀">장녀</option>
              <option value="차녀">차녀</option><option value="배우자">배우자</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">성함</label>
            <input type="text" class="form-control mourner-name">
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">연락처</label>
            <input type="tel" class="form-control mourner-phone">
          </div>
        </div>
      </div>`;
      container.insertAdjacentHTML('beforeend', mournerHTML);
    }

    window.removeMourner = function (id) {
      const element = document.getElementById(`mourner-${id}`);
      if (element) {
        element.remove();
        updateIntro(); // 삭제 시에도 인삿말 갱신
      }
    }

    document.getElementById('deathDate').valueAsDate = new Date();
    updateIntro(); // 초기 실행

    document.getElementById('obituaryForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.innerText = "저장 중...";

      let mournersText = "";
      document.querySelectorAll('.mourner-group').forEach(group => {
        const relation = group.querySelector('.mourner-relation').value;
        const name = group.querySelector('.mourner-name').value;
        const phone = group.querySelector('.mourner-phone').value;
        if (name) {
          mournersText += `${relation} ${name}${phone ? ' (☎ ' + phone + ')' : ''}\n`;
        }
      });

      const bankName = document.getElementById('bankName').value;
      const accountNumber = document.getElementById('accountNumber').value;
      const accountHolder = document.getElementById('accountHolder').value;
      let bankInfoText = (bankName || accountNumber) ? `${bankName} ${accountNumber}${accountHolder ? ' (예금주: ' + accountHolder + ')' : ''}` : "";

      const obData = {
        intro: document.getElementById('intro').value,
        deceasedName: document.getElementById('deceasedName').value,
        age: document.getElementById('age').value,
        deathDate: document.getElementById('deathDate').value,
        deathTime: document.getElementById('deathTime').value,
        funeralHome: document.getElementById('funeralHome').value,
        funeralAddress: document.getElementById('funeralAddress').value,
        departureTime: document.getElementById('departureTime').value,
        cemetery: document.getElementById('cemetery').value,
        mourners: mournersText,
        bankInfo: bankInfoText,
        message: document.getElementById('message').value,
        createdAt: new Date().toISOString()
      };


      // 📌 구글의 firebase 데이터베이스에 저장된다.
      try {
        const newRef = await push(ref(db, 'event_cards'), obData);
        localStorage.setItem('lastObituaryId', newRef.key);
        alert('부고장이 생성되었습니다.');
        window.location.href = `bugo_view.php?id=${newRef.key}`;
      } catch (error) {
        alert("오류: " + error.message);
        submitBtn.disabled = false;
        submitBtn.innerText = "부고장 생성하기";
      }
    });

    window.goToViewPage = function () {
      const lastId = localStorage.getItem('lastObituaryId');
      if (lastId) window.location.href = `bugo_view.php?id=${lastId}`;
      else alert("생성된 부고장이 없습니다.");
    }
  </script>
</body>

</html>