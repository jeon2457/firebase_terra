<?php
/**
 * MongoDB 연결 테스트 파일
 * 브라우저에서 이 파일을 실행하여 MongoDB 연결 상태 확인
 */

require './php/db-connect-mongo.php';
?>
<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MongoDB 연결 테스트</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .test-card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 600px;
        }

        .success-icon {
            font-size: 64px;
            color: #28a745;
        }

        .info-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
    </style>
</head>

<body>
    <div class="test-card">
        <div class="text-center mb-4">
            <div class="success-icon">✅</div>
            <h2 class="mt-3">MongoDB 연결 성공!</h2>
        </div>

        <div class="info-box">
            <strong>📊 연결 정보</strong><br>
            <small class="text-muted">
                데이터베이스: <strong>
                    <?php echo $database->getDatabaseName(); ?>
                </strong><br>
                컬렉션: <strong>members</strong><br>
                현재 문서 수: <strong>
                    <?php echo $collection->countDocuments([]); ?>
                </strong>개
            </small>
        </div>

        <div class="info-box">
            <strong>🔧 서버 정보</strong><br>
            <small class="text-muted">
                <?php
                try {
                    $buildInfo = $client->admin->command(['buildInfo' => 1])->toArray();
                    echo "MongoDB 버전: <strong>" . $buildInfo[0]['version'] . "</strong><br>";
                } catch (Exception $e) {
                    echo "서버 정보를 가져올 수 없습니다.";
                }
                ?>
            </small>
        </div>

        <div class="alert alert-success mt-4" role="alert">
            <strong>✨ 준비 완료!</strong><br>
            MongoDB가 정상적으로 작동하고 있습니다. 이제 회원 관리 시스템을 사용할 수 있습니다.
        </div>

        <div class="text-center mt-4">
            <a href="tel_input.php" class="btn btn-primary btn-lg">회원 등록하기</a>
            <a href="tel_view.php" class="btn btn-secondary btn-lg">회원 목록 보기</a>
        </div>
    </div>
</body>

</html>