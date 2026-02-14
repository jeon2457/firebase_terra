<?php
// ✅ MongoDB DB 연결
require_once __DIR__ . '/php/db-connect-mongo.php';
?>

<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="직지황악회" />
  <title>회원연락망</title>
  <meta name="format-detection" content="telephone=no">

  <link rel="manifest" href="./manifest.json" />
  <meta name="msapplication-config" content="./browserconfig.xml">
  <meta name="msapplication-TileColor" content="#ffffff" />
  <meta name="msapplication-TileImage" content="./ms-icon-144x144.png" />
  <meta name="theme-color" content="#ffffff" />

  <!-- 파비콘 아이콘들 -->
  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />
  <link rel="icon" type="image/png" sizes="48x48" href="./favicons/2/android-icon-48x48.png" />
  <link rel="icon" type="image/png" sizes="72x72" href="./favicons/2/android-icon-72x72.png" />
  <link rel="apple-touch-icon" sizes="32x32" href="./favicons/2/apple-icon-32x32.png">
  <link rel="apple-touch-icon" sizes="57x57" href="./favicons/2/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="./favicons/2/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="./favicons/2/apple-icon-72x72.png">

  <style>
    /* ==========================================
       전역 설정 (다크 모드 적용)
       ========================================== */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
      /* 배경: 검정색 */
      background: #000000;
      color: #fff;
      overflow-x: hidden;
    }

    a {
      text-decoration: none;
      color: inherit;
    }

    /* ==========================================
       로딩 화면 (동영상 적용)
       ========================================== */
    #loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000;
      /* 배경 검정 */
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: opacity 0.8s ease;
      /* 서서히 사라짐 */
    }

    /* 동영상 스타일 */
    #loading-screen video {
      width: 350px;
      max-width: 80%;
      /* 모바일 대응 */
      height: auto;
      object-fit: contain;
    }

    /* ==========================================
       컨테이너
       ========================================== */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
      display: none;
      position: relative;
    }

    /* ==========================================
       상단 고정 영역 래퍼
       ========================================== */
    .sticky-wrapper {
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
      background: transparent;
    }

    /* ==========================================
       헤더 (시계) - [수정] 검정 배경, 노란/주황 텍스트
       ========================================== */
    .header {
      width: 100%;
      background: #000000;
      /* 검정색 */
      color: #cea71bff;
      /* 노란색 텍스트 */
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      /* box-shadow 제거 또는 어둡게 */
      border-bottom: 1px solid #333;
      font-weight: bold;
    }

    #Clockday {
      font-size: 16px;
      letter-spacing: 1px;
      color: #cea71bff;
      /* 날짜 노란색 */
    }

    #Clock {
      font-size: 20px;
      letter-spacing: 2px;
      color: #4A9EFF;
      /* 시간 주황색 */
    }

    /* ==========================================
       전광판 영역 (wrap2)
       ========================================== */
    .wrap2 {
      position: relative;
      width: 100%;
      height: 50px;

      background-image: url('./images/bg.gif');
      background-size: auto;
      background-repeat: repeat;
      background-position: center;

      display: flex;
      align-items: center;
      overflow: hidden;
      border-bottom: 1px solid #444;
      /* 구분선 */
    }

    /* 큐브 컨테이너 */
    .wrap1 {
      position: absolute;
      left: 5px;
      top: 50%;
      transform: translateY(-50%);
      width: 50px;
      height: 50px;
      perspective: 500px;
      z-index: 10;
    }

    .cube {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transform: rotateX(0deg);
      transition: transform 0.6s ease;
    }

    .cube img {
      position: absolute;
      width: 50px;
      height: 50px;
      object-fit: cover;
    }

    .cube img:nth-child(1) {
      transform: rotateX(0deg) translateZ(25px);
    }

    .cube img:nth-child(2) {
      transform: rotateX(90deg) translateZ(25px);
    }

    .cube img:nth-child(3) {
      transform: rotateX(180deg) translateZ(25px);
    }

    .cube img:nth-child(4) {
      transform: rotateX(270deg) translateZ(25px);
    }

    /* 전광판 텍스트 영역 */
    #billboard-container {
      position: absolute;
      left: 114px;
      right: 67px;
      height: 100%;
      overflow: hidden;
    }

    #billboard {
      position: absolute;
      white-space: nowrap;
      display: flex;
      align-items: center;
      height: 100%;
      animation: marquee 15s linear infinite;
    }

    @keyframes marquee {
      0% {
        transform: translateX(100%);
      }

      100% {
        transform: translateX(-100%);
      }
    }

    #billboard img {
      margin: 0 5px;
    }

    .custom-span {
      color: #ccc;
      /* 전광판 글씨 밝은 회색 */
      font-size: 20px;
      font-weight: bold;
      margin: 0 10px;
      text-shadow: 1px 1px 2px #000;
    }

    /* ==========================================
       테이블 영역 - [수정] 다크 모드 스타일
       ========================================== */
    .table-container {
      margin-top: 3px;
      background: #333;
      /* 컨테이너 어두운 색 */
      border-radius: 10px;
      overflow: hidden;
      /* 그림자 제거 혹은 어둡게 */
      box-shadow: none;
      border: 1px solid #444;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    /* 헤더 스타일: 검정 배경 + 노란 글씨 */
    .table thead {
      background: #000;
      /* 완전 검정 */
      color: #cea71bff;
      /* 노란색 텍스트 */
    }

    .table thead th {
      padding: 12px 8px;
      text-align: center;
      font-weight: bold;
      border: 1px solid #555;
      /* 테두리 회색 */
    }

    /* 본문 스타일: 어두운 회색 배경 + 흰색 글씨 */
    .table tbody tr {
      background-color: #333;
      /* 어두운 회색 */
      color: #fff;
      /* 흰색 글씨 */
      border-bottom: 1px solid #555;
      transition: background 0.2s;
    }

    .table tbody tr:hover {
      background: #444;
      /* 호버 시 약간 밝은 회색 */
    }

    .table tbody td {
      padding: 10px 8px;
      text-align: center;
      border: 1px solid #555;
      /* 테두리 회색 */
      vertical-align: middle;
      word-break: break-word;
    }

    /* [PC 화면 비율 설정] */
    th.no {
      width: 5%;
    }

    th.name {
      width: 25%;
    }

    th.tel {
      width: 30%;
    }

    th.address {
      width: 15%;
    }

    th.remark {
      width: 15%;
    }

    th.sms {
      width: 10%;
    }

    /* 글자 크기 유지 */
    th.no span {
      font-size: 0.6rem;
    }

    th.name span {
      font-size: 1.2rem;
    }

    th.tel span {
      font-size: 1.2rem;
    }

    th.address span {
      font-size: 0.8rem;
    }

    th.remark span {
      font-size: 1rem;
    }

    th.sms span {
      font-size: 0.9rem;
    }

    /* 셀 링크 스타일 (이름, 전화번호) - 흰색 */
    .name-cell a,
    .tel-cell a {
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
      /* 흰색 */
    }

    .name-cell a:hover,
    .tel-cell a:hover {
      color: #ffd700;
      /* 호버 시 노란색 */
      text-decoration: underline;
    }

    td.tel-cell {
      white-space: nowrap;
    }

    .sms-icon {
      width: 28px;
      height: 28px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .sms-icon:hover {
      transform: scale(1.2);
    }

    .leader-sms-link {
      color: inherit;
      text-decoration: none;
      cursor: pointer;
    }

    .leader-sms-link:hover {
      color: #ffd700;
      text-decoration: underline;
    }

    /* ==========================================
       푸터 - [수정] 다크 모드
       ========================================== */
    .foot {
      text-align: center;
      padding: 20px;
      background: #222;
      /* 어두운 배경 */
      margin-top: 6px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border: 1px solid #444;
    }

    .jik a {
      color: #ccc;
      /* 연한 회색 */
      font-weight: bold;
      font-size: 14px;
    }

    .jik a:hover {
      color: #fff;
      text-decoration: underline;
    }

    /* ==========================================
       맨 위로 이동 버튼 (FAB 스타일)
       ========================================== */
    .gototop {
      position: fixed;
      bottom: 20px;
      right: 198px;
      z-index: 2000;
    }

    .fab-btn {
      width: 27px;
      height: 27px;
      border-radius: 50%;
      border: none;
      background-color: #0A84FF;
      color: #fff;
      font-size: 20px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .fab-btn:hover {
      transform: scale(1.1);
    }

    /* ==========================================
       반응형 (모바일)
       ========================================== */
    @media (max-width: 768px) {

      /* 컨테이너 여백 최소화 */
      .container {
        padding: 0 5px;
      }

      /* 헤더 */
      .header {
        font-size: 14px;
        padding: 8px 10px;
        justify-content: center;
        flex-direction: column;
        gap: 2px;
      }

      #Clockday {
        font-size: 13px;
      }

      #Clock {
        font-size: 16px;
      }

      /* 전광판 - 배경 이미지 */
      .wrap2 {
        height: 50px;
        background-image: url('./images/bg.gif');
        background-size: auto;
        background-repeat: repeat;
        background-position: center;
      }

      /* 큐브 컨테이너 */
      .wrap1 {
        width: 24px;
        height: 24px;
        left: 4px;
      }

      .cube img {
        width: 24px;
        height: 24px;
      }

      .cube img:nth-child(1) {
        transform: rotateX(0deg) translateZ(12px);
      }

      .cube img:nth-child(2) {
        transform: rotateX(90deg) translateZ(12px);
      }

      .cube img:nth-child(3) {
        transform: rotateX(180deg) translateZ(12px);
      }

      .cube img:nth-child(4) {
        transform: rotateX(270deg) translateZ(12px);
      }

      #billboard-container {
        left: 62px;
        right: 45px;
      }

      .custom-span {
        font-size: 15px;
        color: #fff;
        /* 모바일 전광판 글씨 흰색 */
      }

      /* 테이블 */
      .table-container {
        margin-top: 2px;
        overflow-x: auto;
      }

      .table {
        font-size: 11px;
      }

      .table thead th {
        padding: 6px 2px;
      }

      .table tbody td {
        padding: 6px 2px;
      }

      /* [모바일 전용 너비 설정] */
      th.no {
        width: 28px !important;
      }

      th.name {
        width: 75px !important;
      }

      th.tel {
        width: auto !important;
      }

      th.address {
        width: 50px !important;
      }

      th.remark,
      td.remark-cell {
        display: none !important;
      }

      th.sms {
        width: 45px !important;
      }

      .name-cell a,
      .tel-cell a {
        font-size: 0.95rem;
      }

      .sms-icon {
        width: 22px;
        height: 22px;
      }

      #goTopBtn img {
        width: 30px;
        height: 30px;
      }

      /* 푸터 */
      .foot {
        padding: 15px 5px;
        font-size: 12px;
      }

      .jik a {
        font-size: 11px;
      }
    }

    .gototop {
      bottom: 11px;
      right: 15px;
    }
  </style>

  <script type="text/javascript">
    document.oncontextmenu = function () { return false; };
  </script>

  <script type="text/javascript">
    window.onload = () => {
      // 큐브 회전
      let deg = 0;
      const cube = document.querySelector('.cube');
      if (cube) {
        setInterval(() => {
          deg -= 90;
          cube.style.transform = `rotateX(${deg}deg)`;
        }, 1000);
      }

      // 시계 업데이트
      let lastTimeString = '';
      function updateClock() {
        var date = new Date();
        var YYYY = String(date.getFullYear());
        var MM = String(date.getMonth() + 1).padStart(2, '0');
        var DD = String(date.getDate()).padStart(2, '0');
        var hh = String(date.getHours()).padStart(2, '0');
        var mm = String(date.getMinutes()).padStart(2, '0');
        var week = getWeekday(date);

        const currentTimeString = `${YYYY}/${MM}/${DD}(${week}) ${hh}:${mm}`;
        if (currentTimeString !== lastTimeString) {
          var Clockday = document.getElementById('Clockday');
          var Clock = document.getElementById('Clock');
          if (Clockday) Clockday.innerText = `${YYYY}/${MM}/${DD}(${week})`;
          if (Clock) Clock.innerText = `${hh}:${mm}`;
          lastTimeString = currentTimeString;
        }
      }

      function getWeekday(date) {
        var weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        return weekDays[date.getDay()];
      }

      setInterval(updateClock, 1000);
      updateClock();

      // ✅ [수정됨] 로딩 화면 처리 (동영상 및 시간 변경)
      setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
          loadingScreen.style.opacity = '0';
          setTimeout(() => {
            loadingScreen.style.display = 'none';
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
              mainContent.style.display = 'block';
            }
          }, 800); // 페이드 아웃 후 메인 표시
        }
      }, 2500); // 2500ms(2.5초) 대기
    };
  </script>
</head>

<body>
  <!-- ✅ [수정됨] 로딩 화면: 동영상 적용 -->
  <div id="loading-screen">
    <video src="./images/clova.mp4" autoplay muted playsinline loop></video>
  </div>

  <div class="container" id="main-content">
    <section>

      <!-- 헤더 및 전광판 고정 래퍼 -->
      <div class="sticky-wrapper">
        <!-- 헤더 (시계) -->
        <div class="header">
          <div id="Clockday"><a>0000/00/00(일)</a></div>
          <div id="Clock"><a>00:00</a></div>
        </div>

        <!-- 전광판 -->
        <div class="wrap2" id="wrap2">
          <div class="wrap1">
            <div class="cube">
              <img src="./images/mail_1.png" alt="이메일 아이콘" />
              <img src="./images/chat_1.png" alt="채팅 아이콘" />
              <img src="./images/phone_1.png" alt="전화 아이콘" />
              <img src="./images/sms_1.png" alt="문자 아이콘" />
            </div>
          </div>

          <div id="billboard-container">
            <div id="billboard">
              <img src="./images/aa.gif" width="25" height="25" border="0" alt="">
              <img src="./images/dd.gif" width="25" height="25" border="0" alt="">
              <span class="custom-span">직지초35회 김천지부 동기연락망</span>
              <img src="./images/dd.gif" width="25" height="25" border="0" alt="">
              <img src="./images/aa.gif" width="25" height="25" border="0" alt="">
            </div>
          </div>
        </div>
      </div>
      <!-- // sticky-wrapper 끝 -->

      <!-- 테이블 -->
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th class="no"><span>NO</span></th>
              <th class="name"><span>이름</span></th>
              <th class="tel"><span>전화번호</span></th>
              <th class="address"><span>거주지</span></th>
              <th class="remark"><span>비고</span></th>
              <th class="sms"><span>SMS</span></th>
            </tr>
          </thead>
          <tbody>
            <?php
            // ✅ MongoDB 쿼리 실행
            $cursor = $collection->find(
              ['id' => ['$ne' => '']],
              ['sort' => ['name' => 1]]
            );
            $count = 1;

            foreach ($cursor as $row) {
              $name = htmlspecialchars($row['name'] ?? '', ENT_QUOTES, 'UTF-8');
              $tel_link = htmlspecialchars($row['tel'] ?? '', ENT_QUOTES, 'UTF-8');
              $tel_display = htmlspecialchars($row['tel'] ?? '', ENT_QUOTES, 'UTF-8');
              $addr = htmlspecialchars($row['addr'] ?? '', ENT_QUOTES, 'UTF-8');
              $remark = htmlspecialchars($row['remark'] ?? '', ENT_QUOTES, 'UTF-8');
              $sms_link = htmlspecialchars($row['sms'] ?? '', ENT_QUOTES, 'UTF-8');

              $is_leader = (mb_stripos($remark, '회장') !== false || mb_stripos($remark, '총무') !== false);

              $sms_2_link = '';
              if ($is_leader) {
                if (!empty($row['sms_2'])) {
                  $sms_2_link = htmlspecialchars($row['sms_2'], ENT_QUOTES, 'UTF-8');
                } else {
                  // MongoDB에서 본인 제외 전화번호 목록 추출
                  $all_tels_cursor = $collection->find(
                    [
                      'tel' => ['$ne' => $row['tel'], '$exists' => true, '$ne' => '']
                    ],
                    ['sort' => ['name' => 1]]
                  );
                  $temp_tels = [];
                  foreach ($all_tels_cursor as $t_row) {
                    $temp_tels[] = $t_row['tel'];
                  }
                  $sms_2_link = implode(',', $temp_tels);
                }
              }

              echo "<tr>";
              echo "<td>{$count}</td>";
              echo "<td class='name-cell'><a href='tel:{$tel_link}'>{$name}</a></td>";
              echo "<td class='tel-cell'><a href='tel:{$tel_link}'>{$tel_display}</a></td>";

              if ($is_leader) {
                echo "<td><a href='tel_sms_send.php?exclude_tel={$tel_link}' class='leader-sms-link'>{$addr}</a></td>";
              } else {
                echo "<td>{$addr}</td>";
              }

              echo "<td class='remark-cell'>{$remark}</td>";
              echo "<td><a href='sms:{$sms_link}'><img src='./images/sms-4.png' alt='SMS 보내기' class='sms-icon'></a></td>";
              echo "</tr>";
              $count++;
            }
            ?>
          </tbody>
        </table>
      </div>

      <!-- 푸터 -->
      <div class="foot">
        <img src="image/anicircle03_green.gif" />&nbsp;&nbsp;<span class="jik"><a href="../../book/index.html"
            target="_blank">https://terraone-d0318.web.app/</a></span>&nbsp;
        <img src="image/anicircle03_green.gif" />
      </div>

      <!-- 맨 위로 버튼 (FAB 스타일) -->
      <div class="gototop">
        <button id="goTopBtn" type="button" aria-label="맨 위로 이동" class="fab-btn">
          ⬆️
        </button>
      </div>

    </section>
  </div>

  <script>
    document.getElementById("goTopBtn").addEventListener("click", function () {
      const start = window.scrollY;
      const duration = 1500;
      const startTime = performance.now();

      function scrollStep(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const ease = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

        window.scrollTo(0, start * (1 - ease));

        if (progress < 1) {
          requestAnimationFrame(scrollStep);
        }
      }

      requestAnimationFrame(scrollStep);
    });
  </script>
</body>

</html>