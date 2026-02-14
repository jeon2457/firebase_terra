<!-- ✅ 이페이지는 tel_edit.php(연락망 수정/삭제) 에서 수정버튼을 클릭하면 개인정보수정에 관한 입력창을 보여준다. 수정처리하면 여기서 데이터베이스(DB)로 넘겨서 수정된다. -->

<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="직지35회" />
  <meta name="format-detection" content="telephone=no">
  <title>☏연락망 편집</title>

  <!-- 파비콘 아이콘들 -->
  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="/favicons/android-icon-36x36.png" />
  <link rel="icon" type="image/png" sizes="48x48" href="/favicons/android-icon-48x48.png" />
  <link rel="icon" type="image/png" sizes="72x72" href="/favicons/android-icon-72x72.png" />
  <link rel="apple-touch-icon" sizes="32x32" href="/favicons/apple-icon-32x32.png">
  <link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-icon-72x72.png">

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossorigin="anonymous" />

  <style>
    body {
      font-size: 18px;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      background-color: #f8f9fa;
      min-height: 100vh;
      /* 전체 화면 높이 확보 */
    }

    .container {
      max-width: 700px;
      margin: 20px auto;
      padding: 20px;
      border: 2px solid #ddd;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      background-color: #fff;
      min-height: 80vh;
      box-sizing: border-box;
    }

    .jikji35 {
      color: #007bff;
      font-weight: bold;
      font-size: 28px;
      text-align: center;
      margin-top: 40px;
      margin-bottom: 40px;
    }

    form#member_tel {
      position: relative;
      margin-top: 20px;
      padding: 0 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      font-size: 18px;
      font-weight: bold;
      display: block;
      text-align: center;
      color: #333;
    }

    .jikji_input {
      margin-top: 2px;
      width: 100%;
      max-width: 300px;
      height: 40px;
      font-size: 16px;
      text-align: center;
      display: block;
      margin-left: auto;
      margin-right: auto;
      border: 1px solid #ced4da;
      border-radius: 5px;
      padding: 5px;
    }

    .jikji_edit {
      width: 187px;
      font-size: 20px;
      background-color: #007bff;
      color: #fff;
      border: none;
      padding: 10px;
      border-radius: 5px;
      display: block;
      margin: 40px auto 20px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .jikji_edit:hover {
      background-color: #0056b3;
    }

    input#sms_2 {
      width: 100%;
      max-width: 300px;
      height: 100px;
      text-align: left;
      padding: 5px;
      line-height: 1.5;
      font-size: 16px;
      display: block;
      margin: 15px auto 0;
      border: 1px solid #ced4da;
      border-radius: 5px;
    }





    /* 테블릿 반응형 */
    @media (max-width: 675px) {
      body {
        display: flex;
        /* Flexbox로 수직 중앙 정렬 */
        justify-content: center;
        align-items: center;
      }

      .container {
        max-width: 100%;
        margin: 0;
        /* 기본 마진 제거 */
        padding: 10px;
        min-height: auto;
        /* 높이를 내용에 맞춤 */
        height: auto;
        /* 내용에 따라 동적 조정 */
      }

      .jikji35 {
        font-size: 24px;
        margin-top: 20px;
        margin-bottom: 30px;
      }

      .form-group {
        margin-bottom: 15px;
      }

      label {
        font-size: 16px;
      }


      .jikji_edit {
        width: 150px;
        font-size: 16px;
        margin-top: 30px;
        margin-bottom: 15px;
      }

      input#sms_2 {
        height: 80px;
        font-size: 14px;
        margin-top: 10px;
        max-width: 100%;
      }
    }




    /* 모바일 반응형에 최적(480px) */
    @media (max-width: 480px) {
      body {
        display: flex;
        /* Flexbox로 수직 중앙 정렬 */
        justify-content: center;
        align-items: center;
      }

      .container {
        max-width: 100%;
        margin: 0;
        /* 기본 마진 제거 */
        padding: 10px;
        min-height: auto;
        /* 높이를 내용에 맞춤 */
        height: auto;
        /* 내용에 따라 동적 조정 */
      }

      .jikji35 {
        font-size: 20px;
        margin-top: 15px;
        margin-bottom: 20px;
        /* 모바일에서 하단 여백 줄임 */
      }

      label {
        font-size: 14px;
      }

      .jikji_input {
        margin-top: 1px;
        height: 30px;
        font-size: 12px;
      }

      .jikji_edit {
        width: 120px;
        font-size: 14px;
        margin-top: 20px;
        /* 버튼 상단 여백 줄임 */
        margin-bottom: 10px;
      }

      input#sms_2 {
        height: 70px;
        font-size: 12px;
        margin-top: 8px;
      }
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-8 col-md-6">
        <h2 class="jikji35">개인정보 수정</h2>

        <?php

        // ✅ 파일명 주의!  
// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
        require_once __DIR__ . '/php/auth_check.php';
        require_once __DIR__ . '/php/db-connect-mongo.php';

        try {
          if (isset($_GET['id']) && !empty($_GET['id'])) {
            $id = $_GET['id'];

            // MongoDB findOne by _id
            $row = $database->members->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);

            if ($row) {
              $name = $row['name'] ?? '';
              $tel = $row['tel'] ?? '';
              $addr = $row['addr'] ?? '';
              $remark = $row['remark'] ?? '';
              $sms = $row['sms'] ?? '';
              $sms_2 = $row['sms_2'] ?? '';

              echo "<form id='member_tel' method='POST' action='update.php' onsubmit='return checkForm(this)'>";
              echo "<div class='form-group'>";
              echo "<input type='hidden' class='jikji_input' id='id' name='id' value='" . (string) $row['_id'] . "'>";
              echo "</div>";
              echo "<div class='form-group'>";
              echo "<label for='name'>이름:</label>";
              echo "<input type='text' class='jikji_input' id='name' name='name' value='$name'>";
              echo "</div>";
              echo "<div class='form-group'>";
              echo "<label for='tel'>전번:</label>";
              echo "<input type='text' class='jikji_input' id='tel' name='tel' value='$tel' oninput='autoHyphen(this)' maxlength='13' autocomplete='off' placeholder='' - '없이 전화번호 입력...'>";
              echo "</div>";
              echo "<div class='form-group'>";
              echo "<label for='addr'>주소:</label>";
              echo "<input type='text' class='jikji_input' id='addr' name='addr' value='$addr'>";
              echo "</div>";
              echo "<div class='form-group'>";
              echo "<label for='remark'>비고(직책):</label>";
              echo "<input type='text' class='jikji_input' id='remark' name='remark' value='$remark'>";
              echo "</div>";
              echo "<div class='form-group'>";
              echo "<label for='sms'>SMS:</label>";
              echo "<input type='text' class='jikji_input' id='sms' name='sms' value='$sms'>";
              echo "</div>";
              echo "<div class='form-group'>";
              echo "<label for='sms_2'>SMS_2:</label>";
              echo "<input type='text' class='jikji_input' id='sms_2' name='sms_2' value='$sms_2'>";
              echo "</div>";
              echo "<input type='submit' class='jikji_edit' value='수정'>";
              echo "</form>";
            } else {
              echo "수정할 데이터를 찾을 수 없습니다. (ID: $id)";
              echo "<br>";
              echo "<a href='./tel_edit.php'>목록으로 돌아가기</a>";
            }
          } else {
            echo "ID가 전달되지 않았습니다.";
            echo "<br>";
            echo "<a href='./tel_edit.php'>목록으로 돌아가기</a>";
          }
        } catch (Exception $e) {
          echo "오류: " . $e->getMessage();
          echo "<br>";
          echo "<a href='./tel_edit.php'>목록으로 돌아가기</a>";
        }
        ?>

      </div>
    </div>
  </div>

  <script>
    function checkForm(form) {
      if (form.submitted) {
        alert("이미 전송된 데이터입니다.");
        return false;
      }
      form.submitted = true;
      return true;
    }

    const autoHyphen = (target) => {
      target.value = target.value
        .replace(/[^0-9]/g, '')
        .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
    }

    const telInput = document.getElementById('tel');
    const smsInput = document.getElementById('sms');
    if (telInput && smsInput) {
      telInput.addEventListener('input', () => {
        const telValue = telInput.value.replace(/[^0-9]/g, '');
        smsInput.value = telValue.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
      });
    }
  </script>

  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe"
    crossorigin="anonymous"></script>
</body>

</html>