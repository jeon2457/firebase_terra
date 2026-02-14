<?php
// tel_delete.php - MongoDB 버전
session_start();
require './php/auth_check.php';
require './php/db-connect-mongo.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $edit_id = $_POST['edit_id'] ?? '';

  if (empty($edit_id)) {
    echo "<script>alert('삭제할 회원을 선택해주세요.'); history.back();</script>";
    exit;
  }

  try {
    // MongoDB ObjectId로 변환
    $objectId = new MongoDB\BSON\ObjectId($edit_id);

    // 회원 삭제
    $result = $collection->deleteOne(['_id' => $objectId]);

    if ($result->getDeletedCount() > 0) {
      echo "<script>alert('회원이 삭제되었습니다.'); location.href='tel_edit.php';</script>";
    } else {
      echo "<script>alert('삭제할 회원을 찾을 수 없습니다.'); history.back();</script>";
    }

  } catch (Exception $e) {
    die("삭제 오류: " . $e->getMessage());
  }
} else {
  echo "<script>alert('잘못된 접근입니다.'); location.href='tel_edit.php';</script>";
  exit;
}
?>