<?php
session_start();
require './php/auth_check.php';
// ✅ MongoDB DB 연결
require './php/db-connect-mongo.php';

// [수정 1] 데이터를 미리 불러옵니다. (회원 수를 미리 알기 위함)
$members = $collection->find([], ['sort' => ['name' => 1]])->toArray();
$total_count = count($members); // 전체 회원 수 계산
?>
<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>회원편집</title>
  <link rel="manifest" href="manifest.json">
  <meta name="msapplication-config" content="/browserconfig.xml">

  <!-- 파비콘 아이콘들 -->
  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />
  <link rel="icon" type="image/png" sizes="48x48" href="./favicons/2/android-icon-48x48.png" />
  <link rel="icon" type="image/png" sizes="72x72" href="./favicons/2/android-icon-72x72.png" />
  <link rel="apple-touch-icon" sizes="32x32" href="./favicons/2/apple-icon-32x32.png">
  <link rel="apple-touch-icon" sizes="57x57" href="./favicons/2/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="./favicons/2/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="./favicons/2/apple-icon-72x72.png">

  <!-- 부트스트랩 5.3.3  -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    .section-title {
      text-align: center;
      color: #007bff;
      font-weight: 700;
      margin-bottom: 30px;
      padding: 10px;
      background: #e9f3ff;
      border-radius: 10px;
      border: 1px solid #c9e3ff;
    }
  </style>

</head>

<body>
  <div class="container mt-4 mb-2">
    <h3 class="section-title mb-4">📋 회원편집 / 삭제</h3>

    <form action="tel_update.php" method="post">

      <!-- [수정 2] 테이블 위 우측 정렬된 회원 수 표시 -->
      <div class="text-end mb-2">
        <span class="fw-bold">전체회원수: <?php echo $total_count; ?> 명</span>
      </div>

      <table class="table table-bordered table-hover text-center align-middle">
        <thead class="table-light">
          <tr>
            <th>선택</th>
            <!-- <th>아이디</th> -->
            <th>이름</th>
            <th>전화번호</th>
            <th>주소</th>
            <!-- <th>비고</th> -->
          </tr>
        </thead>
        <tbody>
          <?php
          // [수정 3] 위에서 미리 가져온 배열($members)을 반복문으로 출력
          if ($total_count > 0) {
            foreach ($members as $row) {
              echo "<tr>";
              echo "<td><input type='radio' name='edit_id' value='{$row['_id']}'></td>";
              // echo "<td>{$row['id']}</td>";
              $displayName = ($row['name'] === '공용계정') ? "<span style='color: #fd7e14; font-weight: bold;'>{$row['name']}</span>" : $row['name'];
              echo "<td>$displayName</td>";
              echo "<td>{$row['tel']}</td>";
              echo "<td>{$row['addr']}</td>";
              // echo "<td>{$row['remark']}</td>";
              echo "</tr>";
            }
          } else {
            // 데이터가 없을 경우 표시 (선택사항)
            echo "<tr><td colspan='4'>등록된 회원이 없습니다.</td></tr>";
          }
          ?>
        </tbody>
      </table>

      <div class="text-center mt-4 mb-5">
        <button type="submit" formaction="tel_update.php" class="btn btn-warning">수정하기</button>
        <button type="submit" formaction="tel_delete.php" class="btn btn-danger">삭제하기</button>
        <a href="tel_select_1.php" class="btn btn-secondary">⏪ 돌아가기</a>
      </div>
    </form>
  </div>
</body>

</html>