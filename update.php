<?php
// update.php
// ✅ 관리자 인증
require_once __DIR__ . '/php/auth_check.php';

// ✅ MongoDB DB 연결
require_once __DIR__ . '/php/db-connect-mongo.php';

try {
  if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $mongo_id = $_POST['id'] ?? ''; // edit.php에서 보낸 MongoDB _id
    $name = $_POST['name'] ?? '';
    $tel = $_POST['tel'] ?? '';
    $addr = $_POST['addr'] ?? '';
    $remark = $_POST['remark'] ?? '';
    $sms = $_POST['sms'] ?? '';
    $sms_2 = $_POST['sms_2'] ?? '';

    if (empty($mongo_id)) {
      die("잘못된 접근입니다. 수정할 ID가 없습니다.");
    }

    $objectId = new MongoDB\BSON\ObjectId($mongo_id);

    $result = $collection->updateOne(
      ['_id' => $objectId],
      [
        '$set' => [
          'name' => $name,
          'tel' => $tel,
          'addr' => $addr,
          'remark' => $remark,
          'sms' => $sms,
          'sms_2' => $sms_2,
          'updated_at' => new MongoDB\BSON\UTCDateTime()
        ]
      ]
    );

    if ($result->getModifiedCount() >= 0) {
      echo "<script>alert('회원 정보가 수정되었습니다.'); location.href='tel_edit.php';</script>";
      exit;
    } else {
      throw new Exception("수정 처리에 실패했습니다.");
    }
  }
} catch (Exception $e) {
  echo "오류: " . $e->getMessage();
}
?>