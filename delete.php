<!-- ✅ 이페이지는 tel_edit.php(연락망 수정/삭제) 에서 삭제버튼을 클릭하면 정말로 삭제할것인지 확인을 묻고나면  여기서 데이타베이스(DB)로 넘겨서 삭제 처리된다.-->

<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="직지35회" />
    <meta name="format-detection" content="telephone=no">
    <title>UPDATE</title>
</head>

<body>

    <?php
    // ✅ 파일명 주의!  
// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
    require_once __DIR__ . '/php/auth_check.php';
    require_once __DIR__ . '/php/db-connect-mongo.php';

    try {
        // 전달된 id 값 확인
        if (isset($_POST['id'])) {
            $id = $_POST['id'];

            // MongoDB deleteOne by _id
            $result = $database->members->deleteOne(['_id' => new MongoDB\BSON\ObjectId($id)]);

            if ($result->getDeletedCount() > 0) {
                echo "레코드가 삭제되었습니다.";
            } else {
                echo "삭제된 레코드가 없거나 이미 삭제되었습니다.";
            }

            echo "<br><br><br>";
            echo "<a href='./tel_edit.php'>목록으로 돌아가기</a>";
            exit;
        } else {
            echo "삭제할 레코드를 찾을 수 없습니다.";
            echo "<br><br><br>";
            echo "<a href='./tel_edit.php'>목록으로 돌아가기</a>";
            exit;
        }
    } catch (Exception $e) {
        echo "오류: " . $e->getMessage();
        exit;
    }
    ?>

</body>

</html>