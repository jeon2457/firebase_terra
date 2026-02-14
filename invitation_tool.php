<?php
// invitation_tool.php : 부고장/청첩장 만들기 도구 (관리자 전용)
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
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>부고장/청첩장 만들기</title>
  
  <!-- 파비콘 아이콘들 -->
  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />
  <link rel="icon" type="image/png" sizes="48x48" href="./favicons/2/android-icon-48x48.png" />
  <link rel="icon" type="image/png" sizes="72x72" href="./favicons/2/android-icon-72x72.png" />
  <link rel="apple-touch-icon" sizes="32x32" href="./favicons/2/apple-icon-32x32.png">
  <link rel="apple-touch-icon" sizes="57x57" href="./favicons/2/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="./favicons/2/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="./favicons/2/apple-icon-72x72.png">

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <style>
    :root {
      --bg: #f7f7f8;
      --card: #ffffff;
      --text: #222;
      --muted: #666;
      --accent: #2f6feb;
      --border: #e5e7eb;
      --secondary-color: #0dcaf0; /* 버튼 테두리 색상 */
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;
      line-height: 1.6;
    }

    .container {
      max-width: 760px;
      margin: 0 auto;
      padding: 16px;
    }

    header {
      padding: 8px 0 16px;
    }
    header h1 {
      font-size: 20px;
      margin: 0 0 8px;
    }
    header p {
      color: var(--muted);
      margin: 0;
      font-size: 14px;
    }

    /* 메뉴 카드 */
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 16px;
    }

    /* 🔥 [추가] SMS 발송 버튼 CSS */
    .sms-buttons-container {
      max-width: 760px;
      margin: 24px auto;
      padding: 0 16px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .sms-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 20px 16px;
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: 12px;
      text-decoration: none;
      color: var(--text);
      font-weight: 600;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .sms-btn:hover {
      border-color: var(--accent);
      box-shadow: 0 4px 12px rgba(47,111,235,0.15);
      transform: translateY(-2px);
    }

    .sms-btn:active {
      transform: translateY(0);
    }

    .sms-icon {
      font-size: 32px;
      line-height: 1;
    }

    .sms-text {
      font-size: 15px;
      letter-spacing: -0.3px;
    }

    .sms-btn-obituary:hover {
      background: linear-gradient(135deg, #fef9ff 0%, #f5f3ff 100%);
    }

    .sms-btn-wedding:hover {
      background: linear-gradient(135deg, #fff9f5 0%, #fff3f0 100%);
    }

    .my-btn {
      background-color: #a4c5e2ff !important; /* 강제 적용 */
      color: #fff;
      font-size: 15px !important; /* 강제 적용 */
    }
    .my-btn:hover {
      background-color: #5a6268;
      color: #fff;
      font-size: 16px !important;
    }

    /* ⭐ [수정됨] 위로가기 버튼 디자인 */
    #scrollToTop {
      position: fixed;
      bottom: 19px;
      right: 30px;
      width: 40px;   /* 크기 살짝 키움 (정렬 용이) */
      height: 40px;
      
      /* ✅ 배경 투명도 적용 (rgba: 검정색 50% 투명 or 흰색 등 취향껏) */
      /* 여기서는 기존 버튼색인 cyan 계열을 반투명하게 적용 */
      background: rgba(13, 202, 240, 0.6); 
      
      color: blue; /* 화살표 색상 */
      border: 2px solid var(--secondary-color);
      border-radius: 50%;
      display: none; /* 스크롤 전에는 숨김 */
      
      /* ✅ 중앙 정렬 핵심 (Flexbox) */
      display: flex; /* (JS에서 block으로 바뀌는 것 주의, 아래 JS 수정 없음) */
      justify-content: center;
      align-items: center;
      
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 1000;
      transition: all 0.3s ease;
      font-size: 20px;
      padding-bottom: 3px; /* 시각적 중앙 보정 (화살표 모양에 따라 필요할 수 있음) */
    }

    /* 초기엔 숨김 처리 (JS에서 flex로 변경함) */
    #scrollToTop { display: none; }

    #scrollToTop:hover {
      background: rgba(13, 202, 240, 1); /* 호버 시 불투명 */
      color: white;
      transform: translateY(-5px);
    }

    @media (max-width: 560px) {
      .grid { grid-template-columns: 1fr; }
    }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: border-color .15s, box-shadow .15s, transform .05s;
    }
    .card:active { transform: scale(0.995); }
    .card:hover {
      border-color: #d8dae0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    }
    .card .icon {
      width: 40px; height: 40px;
      display: grid; place-items: center;
      border-radius: 10px;
      background: #eef2ff;
      color: var(--accent);
      font-size: 20px;
    }
    .card h3 {
      margin: 0;
      font-size: 16px;
    }
    .card p {
      margin: 2px 0 0;
      font-size: 13px;
      color: var(--muted);
    }

    /* 탭 상태 */
    .tabs {
      margin-top: 20px;
      display: flex;
      gap: 8px;
    }
    .tab {
      flex: 1;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 14px;
      cursor: pointer;
    }
    .tab.active {
      border-color: var(--accent);
      color: var(--accent);
      font-weight: 600;
    }

    /* 폼/미리보기 */
    .panel {
      margin-top: 12px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    label {
      font-size: 13px;
      color: var(--muted);
      display: block;
      margin-bottom: 6px;
    }
    input[type="text"], textarea {
      width: 100%;
      padding: 10px 12px;
      font-size: 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      outline: none;
      background: #fff;
      transition: border-color .15s, box-shadow .15s;
    }
    input[type="text"]:focus, textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(47,111,235,0.12);
    }
    textarea {
      min-height: 180px;
      resize: vertical;
      white-space: pre-wrap;
    }

    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    .btn {
      padding: 10px 12px;
      font-size: 14px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: #fff;
      cursor: pointer;
    }
    .btn.primary {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    .hint {
      font-size: 12px;
      color: var(--muted);
      margin-top: 6px;
    }

    .preview {
      margin-top: 10px;
      padding: 12px;
      border: 1px dashed var(--border);
      border-radius: 8px;
      background: #fafafa;
      font-size: 14px;
      white-space: pre-wrap;
    }
    .sms-buttons-container {
    grid-template-columns: 1fr;
    gap: 10px;
    margin: 20px auto;
    }

    .sms-btn {
    flex-direction: row;
    justify-content: center;
    padding: 16px;
    gap: 10px;
    }

    .sms-icon {
    font-size: 28px;
    }

    .sms-text {
    font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>부고장 · 청첩장 만들기</h1>
      <p>모바일에 맞춘 심플한 디자인으로 내용을 작성하고 복사/공유하세요.</p>
    </header>

    <!-- 메뉴 카드 -->
    <div class="grid" id="menuGrid">
      <div class="card" data-target="obituary">
        <div class="icon">🌼</div>
        <div>
          <h3>부고장 만들기</h3>
          <p>단정한 문구와 항목으로 빠르게 구성</p>
        </div>
      </div>
      <div class="card" data-target="wedding">
        <div class="icon">💍</div>
        <div>
          <h3>청첩장 만들기</h3>
          <p>일시·장소·주요 안내를 깔끔하게</p>
        </div>
      </div>
    </div>

    <!-- 탭 버튼 (선택 상태 표시) -->
    <div class="tabs">
      <button class="tab active" id="tab-obituary">부고장</button>
      <button class="tab" id="tab-wedding">청첩장</button>
    </div>

    <!-- 부고장 패널 -->
    <section class="panel" id="panel-obituary" aria-label="부고장 만들기">
      <div class="form-row">
        <div>
          <label for="obTitle">제목</label>
          <input type="text" id="obTitle" placeholder="[訃 告]" value="[訃 告]" />
        </div>
        <div>
          <label for="obMain">본문</label>
          <textarea id="obMain">삼가 고인의 명복을 빕니다.

당사 홍길동님의 [부친/모친] 故 OOO 님께서
202X년 O월 O일(요일) 별세하셨기에 삼가 알려드립니다.</textarea>
        </div>
        <div>
          <label for="obInfo">안내 항목</label>
          <textarea id="obInfo">■ 빈소 : OO병원 장례식장 O호실
   (서울시 OO구 OO동 123-45)
■ 발인 : 202X년 O월 O일(요일) 오전 O시
■ 장지 : OOO 추모공원
■ 마음 전하실 곳 : OO은행 123-456-789012 (예금주 : 홍길동)
■ 연락처 : 010-0000-0000 (상주)</textarea>
        </div>
        <div>
          <label for="obFooter">마무리 문구</label>
          <input type="text" id="obFooter" placeholder="따뜻한 위로와 격려 부탁드립니다." value="바쁘신 가운데 따뜻한 위로와 격려 부탁드립니다." />
        </div>
      </div>
      <div class="actions">
        <button class="btn primary" id="copyObituary">부고장 복사</button>
        <button class="btn" id="resetObituary">초기화</button>
      </div>
      <p class="hint">복사한 내용을 카카오톡/문자에 붙여넣기 하세요. 이모지를 원하면 제목 앞에 🌼 를 추가해도 좋습니다.</p>
      <div class="preview" id="previewObituary"></div>
    </section>

    <!-- 청첩장 패널 -->
    <section class="panel" id="panel-wedding" aria-label="청첩장 만들기" hidden>
      <div class="form-row">
        <div>
          <label for="wedTitle">제목</label>
          <input type="text" id="wedTitle" placeholder="[청첩장]" value="[청첩장]" />
        </div>
        <div>
          <label for="wedMain">본문</label>
          <textarea id="wedMain">ㅇㅇㅇ 자녀 ㅇㅇㅇ 혼례를 올립니다.
바쁘시더라도 오셔서 축복해 주시면 큰 기쁨이 되겠습니다.</textarea>
        </div>
        <div>
          <label for="wedInfo">일시 · 장소</label>
          <textarea id="wedInfo">■ 일시 : 202X년 O월 O일(요일) 오후 O시
■ 장소 : OOO 웨딩홀 OO층 OO홀 (서울시 OO구 OO동 123-45)
■ 주차 : 주차권 제공 / 대중교통 이용 권장</textarea>
        </div>
        <div>
          <label for="wedContact">연락/마음 전하실 곳 (선택)</label>
          <textarea id="wedContact">■ 신랑 : 홍길동 010-0000-0000
■ 신부 : 홍길순 010-0000-0000
■ 마음 전하실 곳 : OO은행 123-456-789012 (예금주 : 홍길동)</textarea>
        </div>
      </div>
      <div class="actions">
        <button class="btn primary" id="copyWedding">청첩장 복사</button>
        <button class="btn" id="resetWedding">초기화</button>
      </div>
      <p class="hint">제목 앞에 💍 또는 💐 이모지를 붙이면 모바일에서 더 따뜻한 느낌을 줍니다.</p>
      <div class="preview" id="previewWedding"></div>
    </section>
  </div>

  <!-- SMS 발송 버튼 섹션 -->
  <div class="sms-buttons-container">
    <a href="sms_send_1.php" class="sms-btn sms-btn-obituary">
      <span class="sms-icon">🌼</span>
      <span class="sms-text">부고장 문자로보내기</span>
    </a>
    <a href="sms_send_2.php" class="sms-btn sms-btn-wedding">
      <span class="sms-icon">💍</span>
      <span class="sms-text">청첩장 문자로보내기</span>
    </a>

    <a href="bugo_input.php" class="sms-btn sms-btn-wedding">
      <span class="sms-icon">🌼</span>
      <span class="sms-text">부고장 홈페이지로 만들기</span>
    </a>
    <a href="select_1.php" class="btn btn-secondary my-btn">⏪ 돌아가기</a>

  </div>

  <div id="scrollToTop" title="맨 위로">▲</div>

  <script>
    // 탭/카드 전환
    const tabOb = document.getElementById('tab-obituary');
    const tabWe = document.getElementById('tab-wedding');
    const panelOb = document.getElementById('panel-obituary');
    const panelWe = document.getElementById('panel-wedding');
    const cards = document.querySelectorAll('.card');

    function showPanel(panel) {
      const isOb = panel === 'obituary';
      tabOb.classList.toggle('active', isOb);
      tabWe.classList.toggle('active', !isOb);
      panelOb.hidden = !isOb;
      panelWe.hidden = isOb;
      window.scrollTo({ top: document.querySelector('.tabs').offsetTop, behavior: 'smooth' });
    }
    tabOb.addEventListener('click', () => showPanel('obituary'));
    tabWe.addEventListener('click', () => showPanel('wedding'));
    cards.forEach(c => c.addEventListener('click', () => showPanel(c.dataset.target)));

    // 실시간 미리보기 (부고장)
    const obTitle = document.getElementById('obTitle');
    const obMain = document.getElementById('obMain');
    const obInfo = document.getElementById('obInfo');
    const obFooter = document.getElementById('obFooter');
    const previewOb = document.getElementById('previewObituary');

    function renderObituary() {
      const text = `${obTitle.value}

${obMain.value}

${obInfo.value}

${obFooter.value}`;
      previewOb.textContent = text;
      return text;
    }
    ['input','change','keyup'].forEach(evt => {
      obTitle.addEventListener(evt, renderObituary);
      obMain.addEventListener(evt, renderObituary);
      obInfo.addEventListener(evt, renderObituary);
      obFooter.addEventListener(evt, renderObituary);
    });
    renderObituary();

    // 실시간 미리보기 (청첩장)
    const wedTitle = document.getElementById('wedTitle');
    const wedMain = document.getElementById('wedMain');
    const wedInfo = document.getElementById('wedInfo');
    const wedContact = document.getElementById('wedContact');
    const previewWe = document.getElementById('previewWedding');

    function renderWedding() {
      const contact = wedContact.value.trim() ? `\n\n${wedContact.value}` : '';
      const text = `${wedTitle.value}

${wedMain.value}

${wedInfo.value}${contact}`;
      previewWe.textContent = text;
      return text;
    }
    ['input','change','keyup'].forEach(evt => {
      wedTitle.addEventListener(evt, renderWedding);
      wedMain.addEventListener(evt, renderWedding);
      wedInfo.addEventListener(evt, renderWedding);
      wedContact.addEventListener(evt, renderWedding);
    });
    renderWedding();

    // 복사/초기화
    async function copyText(getTextFn) {
      try {
        const text = getTextFn();
        await navigator.clipboard.writeText(text);
        alert('복사되었습니다. 카카오톡/문자에 붙여넣기 하세요.');
      } catch {
        // 폴백: 임시 textarea 사용
        const ta = document.createElement('textarea');
        ta.value = getTextFn();
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('복사되었습니다. 카카오톡/문자에 붙여넣기 하세요.');
      }
    }
    document.getElementById('copyObituary').addEventListener('click', () => copyText(renderObituary));
    document.getElementById('copyWedding').addEventListener('click', () => copyText(renderWedding));

    document.getElementById('resetObituary').addEventListener('click', () => {
      obTitle.value = '[訃 告]';
      obMain.value = `삼가 고인의 명복을 빕니다.

당사 홍길동님의 [부친/모친] 故 OOO 님께서
202X년 O월 O일(요일) 별세하셨기에 삼가 알려드립니다.`;
      obInfo.value = `■ 빈소 : OO병원 장례식장 O호실
   (서울시 OO구 OO동 123-45)
■ 발인 : 202X년 O월 O일(요일) 오전 O시
■ 장지 : OOO 추모공원
■ 마음 전하실 곳 : OO은행 123-456-789012 (예금주 : 홍길동)
■ 연락처 : 010-0000-0000 (상주)`;
      obFooter.value = '바쁘신 가운데 따뜻한 위로와 격려 부탁드립니다.';
      renderObituary();
    });

    document.getElementById('resetWedding').addEventListener('click', () => {
      wedTitle.value = '[청첩장]';
      wedMain.value = `ㅇㅇㅇ 자녀 ㅇㅇㅇ 혼례를 올립니다.
바쁘시더라도 오셔서 축복해 주시면 큰 기쁨이 되겠습니다.`;
      wedInfo.value = `■ 일시 : 202X년 O월 O일(요일) 오후 O시
■ 장소 : OOO 웨딩홀 OO층 OO홀 (서울시 OO구 OO동 123-45)
■ 주차 : 주차권 제공 / 대중교통 이용 권장`;
      wedContact.value = `■ 신랑 : 홍길동 010-0000-0000
■ 신부 : 홍길순 010-0000-0000
■ 마음 전하실 곳 : OO은행 123-456-789012 (예금주 : 홍길동)`;
      renderWedding();
    });


    // 2. 위로가기 버튼 로직
    const topBtn = document.getElementById('scrollToTop');

    window.addEventListener('scroll', () => {
      // 300px 이상 스크롤 시 버튼 노출
      if (window.scrollY > 300) {
        // topBtn.style.display = 'flex'; // ✅ 수정됨
        topBtn.style.display = 'flex';
      } else {
        topBtn.style.display = 'none';
      }
    });

    topBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // 부드러운 스크롤 효과
      });
    });



    // 🔥 [중요] SMS 발송 버튼 클릭 시 데이터 저장 로직
    // 부고장 보내기 버튼 클릭 시
    document.querySelector('.sms-btn-obituary').addEventListener('click', function(e) {
        // 현재 미리보기 내용(텍스트)을 가져옴
        const text = document.getElementById('previewObituary').innerText;
        // localStorage에 'sms_content'라는 이름으로 저장
        localStorage.setItem('sms_content', text);
    });

    // 청첩장 보내기 버튼 클릭 시
    document.querySelector('.sms-btn-wedding').addEventListener('click', function(e) {
        // 현재 미리보기 내용(텍스트)을 가져옴
        const text = document.getElementById('previewWedding').innerText;
        // localStorage에 'sms_content'라는 이름으로 저장
        localStorage.setItem('sms_content', text);
    });
  </script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>