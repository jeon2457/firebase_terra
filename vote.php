<?php
// vote.php
// ✅ MongoDB DB 연결
require_once __DIR__ . '/php/db-connect-mongo.php';

// ★ 중요: 투표용 컬렉션 설정 (없을 경우 자동 생성됨)
$poll_collection = $database->poll_options;

// 1. [중복 방지] 쿠키 확인 (이미 투표했다면 튕겨내기)
if (isset($_COOKIE['voted_2026_picnic'])) {
    echo "<script>
        alert('이미 투표에 참여하셨습니다. (중복 투표 불가)');
        location.href = 'results.php';
    </script>";
    exit();
}

// POST 요청인지 확인
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 사용자가 선택한 옵션 ID 받기
    $date_id = isset($_POST['date_id']) ? (int) $_POST['date_id'] : 0;
    $place_id = isset($_POST['place_id']) ? (int) $_POST['place_id'] : 0;

    // 유효성 검사 (MongoDB에서는 정수형 ID 또는 별도의 고유 키 사용 가능)
    if ($date_id > 0 && $place_id > 0) {

        try {
            // 1. 날짜 투표 업데이트 ($inc 연산자로 원자적 증가)
            $poll_collection->updateOne(
                ['id' => $date_id],
                ['$inc' => ['votes' => 1]]
            );

            // 2. 장소 투표 업데이트
            $poll_collection->updateOne(
                ['id' => $place_id],
                ['$inc' => ['votes' => 1]]
            );

            // [참고] MongoDB에서 트랜잭션이 꼭 필요한 경우 세션을 사용할 수 있으나, 
            // 단순 카운트 증가는 $inc로도 충분히 원자성이 보장됩니다.

            // 2. [중복 방지] 투표 성공 시 쿠키 생성 (유효기간: 30일)
            setcookie('voted_2026_picnic', 'yes', time() + (86400 * 30), "/");

            // 투표 완료 후 결과 페이지로 이동
            echo "<script>
                alert('소중한 한 표 감사합니다!');
                location.href = 'results.php';
            </script>";

        } catch (Exception $e) {
            echo "오류가 발생했습니다: " . $e->getMessage();
        }

    } else {
        echo "<script>
            alert('모든 항목을 선택해주세요.');
            history.back();
        </script>";
    }
} else {
    header("Location: vote.html");
    exit();
}
?>