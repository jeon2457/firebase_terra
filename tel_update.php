<?php
session_start();
// ✅ 관리자 인증
require './php/auth_check.php';

// ✅ MongoDB DB 연결
require './php/db-connect-mongo.php';

if (!isset($_POST['edit_id'])) {
  echo "<script>alert('수정할 회원을 선택하세요.'); history.back();</script>";
  exit;
}

$id_val = $_POST['edit_id'];

try {
  $objectId = new MongoDB\BSON\ObjectId($id_val);
  $row = $collection->findOne(['_id' => $objectId]);

  if (!$row) {
    echo "<script>alert('회원정보를 찾을 수 없습니다.'); history.back();</script>";
    exit;
  }
} catch (Exception $e) {
  echo "<script>alert('잘못된 ID 형식입니다.'); history.back();</script>";
  exit;
}
?>

<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>회원정보 수정</title>

  <!-- 파비콘 설정 -->
  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="/favicons/android-icon-36x36.png" />

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">

  <style>
    .mobile-container {
      padding: 15px !important;
      width: 100%;
      max-width: 600px;
      margin: auto;
    }

    input.form-control {
      height: 45px;
      font-size: 1.1rem;
    }

    label {
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    label i {
      color: #667eea;
      font-size: 1.1rem;
    }

    button,
    a.btn {
      width: 45%;
      height: 45px;
      font-size: 1.1rem;
    }

    #sms_2_field.auto-generated {
      background-color: #f0f0f0;
      cursor: not-allowed;
    }

    .info-badge {
      font-size: 0.85rem;
      margin-left: 8px;
    }

    h3 {
      color: #667eea;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 30px;
    }

    @media (max-width: 768px) {
      h3 {
        font-size: 1.5rem;
      }
    }
  </style>
</head>

<body>
  <div class="container-fluid mobile-container mt-3">

    <h3><i class="bi bi-person-gear"></i> 회원정보 수정</h3>

    <form action="tel_update_action.php" method="post">
      <input type="hidden" name="edit_id" value="<?= $row['_id'] ?>">

      <!-- 1. 아이디 -->
      <div class="mb-3">
        <label class="form-label"><i class="bi bi-person-badge"></i> 아이디 (id)</label>
        <input type="text" name="id" class="form-control" value="<?= htmlspecialchars($row['id']) ?>" required>
      </div>

      <!-- 2. 비밀번호 (신규 추가됨) -->
      <div class="mb-3">
        <label class="form-label"><i class="bi bi-key"></i> 비밀번호 (Password)</label>
        <!-- 보안상 기존 비밀번호는 보여주지 않고, 입력 시에만 변경되도록 placeholder 처리 -->
        <input type="text" name="password" class="form-control" placeholder="변경할 경우에만 입력하세요 (비워두면 유지됨)">
      </div>

      <!-- 3. 이름 -->
      <div class="mb-3">
        <label class="form-label"><i class="bi bi-person"></i> 이름</label>
        <input type="text" name="name" class="form-control" value="<?= htmlspecialchars($row['name']) ?>" required>
      </div>

      <!-- 4. 전화번호 -->
      <div class="mb-3">
        <label class="form-label"><i class="bi bi-telephone"></i> 전화번호</label>
        <input type="text" name="tel" class="form-control" value="<?= htmlspecialchars($row['tel']) ?>" required>
      </div>

      <!-- 5. 주소 -->
      <div class="mb-3">
        <label class="form-label"><i class="bi bi-geo-alt"></i> 주소</label>
        <input type="text" name="addr" class="form-control" value="<?= htmlspecialchars($row['addr']) ?>">
      </div>

      <!-- 6. 비고 -->
      <div class="mb-3">
        <label class="form-label">
          <i class="bi bi-journal-text"></i> 비고 (직책)
          <span class="badge bg-info info-badge">회장/총무 입력 시 SMS_2 자동생성</span>
        </label>
        <input type="text" name="remark" id="remark_field" class="form-control"
          value="<?= htmlspecialchars($row['remark']) ?>">
      </div>

      <!-- 7. SMS -->
      <div class="mb-3">
        <label class="form-label"><i class="bi bi-chat-dots"></i> SMS</label>
        <input type="text" name="sms" class="form-control" value="<?= htmlspecialchars($row['sms']) ?>">
      </div>

      <!-- 8. SMS_2 -->
      <div class="mb-3">
        <label class="form-label">
          <i class="bi bi-chat-square-dots"></i> SMS_2 (다중발송)
          <span class="badge bg-warning info-badge" id="auto_badge" style="display:none;">자동생성됨</span>
        </label>
        <input type="text" name="sms_2" id="sms_2_field" class="form-control"
          value="<?= htmlspecialchars($row['sms_2']) ?>">
        <small class="text-muted">회장/총무가 아닌 경우 수동입력 가능</small>
      </div>

      <!-- 9. 권한 -->
      <div class="mb-3">
        <label class="form-label"><i class="bi bi-shield-check"></i> 권한 (user_level)<span
            class="badge bg-info info-badge">회장,총무일경우 레벨 '5' 부여!</span>
        </label>

        <input type="text" name="user_level" class="form-control" value="<?= htmlspecialchars($row['user_level']) ?>">
      </div>

      <div class="text-center mt-4 d-flex justify-content-between">
        <button type="submit" class="btn btn-primary">저장</button>
        <a href="tel_edit.php" class="btn btn-secondary">취소</a>
      </div>
    </form>
  </div>

  <script>
    function formatPhoneNumber(value) {
      value = value.replace(/[^0-9]/g, '');
      if (value.length < 4) return value;
      if (value.length < 7) return value.replace(/(\d{3})(\d+)/, '$1-$2');
      return value.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
    }

    document.addEventListener("DOMContentLoaded", () => {
      const telInput = document.querySelector("input[name='tel']");
      const smsInput = document.querySelector("input[name='sms']");
      const sms2Input = document.getElementById("sms_2_field");
      const remarkInput = document.getElementById("remark_field");
      const autoBadge = document.getElementById("auto_badge");
      const currentIdx = "<?= $row['_id'] ?>";

      // TEL -> SMS 자동복사
      telInput.addEventListener("input", () => {
        let digits = telInput.value.replace(/[^0-9]/g, '');
        if (digits.length > 11) digits = digits.slice(0, 11);
        telInput.value = formatPhoneNumber(digits);
        smsInput.value = telInput.value;
      });

      // Remark 변경 시 SMS_2 로직
      remarkInput.addEventListener("input", checkAndGenerateSms2);

      async function checkAndGenerateSms2() {
        const remarkValue = remarkInput.value.trim();
        if (remarkValue.includes('회장') || remarkValue.includes('총무')) {
          try {
            const response = await fetch('get_all_phones.php?exclude_id=' + currentIdx);
            const data = await response.json();
            if (data.success) {
              sms2Input.value = data.phones.join(',');
              sms2Input.classList.add('auto-generated');
              sms2Input.readOnly = true;
              autoBadge.style.display = 'inline-block';
            }
          } catch (error) { console.error('전화번호 가져오기 실패:', error); }
        } else {
          sms2Input.classList.remove('auto-generated');
          sms2Input.readOnly = false;
          autoBadge.style.display = 'none';
        }
      }
      checkAndGenerateSms2();

      // SMS_2 수동 입력 포맷팅
      sms2Input.addEventListener("input", () => {
        if (sms2Input.readOnly) return;
        let raw = sms2Input.value.replace(/[^0-9,]/g, '');
        let numbers = raw.split(',').filter(n => n.length > 0);
        let result = [];
        numbers.forEach(num => {
          if (num.length === 11) result.push(formatPhoneNumber(num));
          else result.push(num);
        });
        sms2Input.value = result.join(',');
      });
    });
  </script>
</body>

</html>