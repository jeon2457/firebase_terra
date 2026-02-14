<?php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/db-connect-mongo.php';

// 1. 전체 회원수 가져오기 (members 컬렉션 - 구 tel)
$total_members = 0;
try {
    $total_members = $database->members->countDocuments();
} catch (Exception $e) {
    $total_members = 0;
}

// 과반수 계산
$majority_limit = ($total_members > 0) ? floor($total_members / 2) : 999999;
$is_majority_reached = false;
$alert_message = "";

// ★ 이메일 발송 로직 처리 (세션으로 중복 발송 방지)
include 'send_email_gmail.php';
// $is_majority_reached 는 아래 루프에서 계산됨
// 일단 아래 루프 먼저 돌려서 $is_majority_reached 확정 후 이메일/SMS 처리하는 것이 좋으나, 
// 기존 코드 구조를 최대한 유지하며 나중에 처리

// --- 투표 데이터 가져오기 로직 시작 ---
$polls = [];
try {
    $pollsCursor = $database->polls->find([], ['sort' => ['id' => 1]]);
    $polls = iterator_to_array($pollsCursor);
} catch (Exception $e) {
    // 테이블 로드 실패 처리
}

$processedPolls = [];
if (count($polls) > 0) {
    foreach ($polls as $poll) {
        $poll_id = $poll['id'];
        $poll_title = $poll['title'];

        // 해당 주제의 총 투표수 계산 (poll_options)
        $total_votes = 0;
        $optionsCursor = $database->poll_options->find(['poll_id' => $poll_id]);
        $options = iterator_to_array($optionsCursor);
        foreach ($options as $opt) {
            $total_votes += ($opt['votes'] ?? 0);
        }

        if ($total_votes > $majority_limit) {
            $is_majority_reached = true;
        }

        $processedPolls[] = [
            'id' => $poll_id,
            'title' => $poll_title,
            'total_votes' => $total_votes,
            'options' => $options
        ];
    }
}

// 이메일 및 SMS 처리 (과반수 도달 시)
if ($is_majority_reached) {
    if (!isset($_SESSION['email_sent_alert'])) {
        $subject = "[긴급 알림] 투표 참여 인원이 과반수를 넘었습니다!";
        $content = "<h2>📊 2026년 야유회 투표 현황 알림</h2><p>안녕하세요, 관리자님.</p><p>현재 투표 참여 인원이 과반수(<strong>" . number_format($majority_limit + 1) . "명</strong>)를 달성했습니다.</p><p>투표 결과를 확인하고 후속 조치를 진행해주세요.</p><hr><a href='http://본인홈페이지주소/results.php'>결과 페이지 바로가기</a>";
        $result = send_gmail_alert('jeon2457@gmail.com', $subject, $content);
        if ($result) {
            $alert_message = "참여인원이 과반수를 넘겨 관리자 이메일로 알림을 보냈습니다!";
            $_SESSION['email_sent_alert'] = true;
        }
    }

    if (!isset($_SESSION['sms_sent_alert'])) {
        include 'send_sms_aligo.php';
        $sms_message = "[투표 알림] 야유회 투표 참여 인원이 과반수(" . number_format($majority_limit + 1) . "명)를 넘었습니다. 결과를 확인해주세요.";
        $sms_result = send_aligo_sms('01096091688', $sms_message);
        if ($sms_result['result_code'] == 1) {
            $alert_message = ($alert_message ? $alert_message . "\\n" : "") . "참여인원이 과반수를 넘겨 관리자에게 문자를 발송했습니다!";
            $_SESSION['sms_sent_alert'] = true;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>투표 결과</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
        }

        .result-card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            padding: 30px;
            margin-bottom: 30px;
        }

        .progress {
            height: 25px;
            border-radius: 12px;
            background-color: #e9ecef;
            margin-top: 5px;
        }

        .progress-bar {
            line-height: 25px;
            font-weight: bold;
            font-size: 0.9rem;
        }

        .member-count-box {
            font-size: 1.1rem;
            color: #495057;
            background-color: #fff;
            padding: 10px 20px;
            border-radius: 50px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            display: inline-block;
        }
    </style>
</head>

<body>

    <div class="container py-5">
        <h2 class="text-center mb-4 fw-bold text-dark">📊 투표 결과 현황</h2>

        <!-- 전체 회원수 표시 (우측 정렬) -->
        <div class="d-flex justify-content-end mb-4">
            <div class="member-count-box">
                <span class="fw-bold">전체 회원수:</span>
                <span class="text-primary fw-bold"><?php echo number_format($total_members); ?>명</span>
            </div>
        </div>

        <?php
        if (count($processedPolls) > 0) {
            foreach ($processedPolls as $poll) {
                $poll_id = $poll['id'];
                $poll_title = $poll['title'];
                $total_votes = $poll['total_votes'];
                $options = $poll['options'];

                // 정렬: 투표수 많은 순
                usort($options, function ($a, $b) {
                    return ($b['votes'] ?? 0) <=> ($a['votes'] ?? 0);
                });
                ?>
                <div class="result-card">
                    <h4 class="border-bottom pb-2 mb-4 d-flex justify-content-between">
                        <span><?php echo htmlspecialchars($poll_title); ?></span>
                        <div class="d-flex align-items-center gap-2">
                            <?php if ($total_votes > $majority_limit): ?>
                                <span class="badge bg-danger">과반수 달성!</span>
                            <?php endif; ?>
                            <span class="badge bg-secondary fs-6">총 <?php echo $total_votes; ?>표</span>
                        </div>
                    </h4>

                    <?php
                    foreach ($options as $opt) {
                        $opt_text = $opt['option_text'] ?? ($opt['text'] ?? '');
                        $votes = $opt['votes'] ?? 0;

                        // 퍼센트 계산
                        $percent = ($total_votes > 0) ? round(($votes / $total_votes) * 100, 1) : 0;

                        // 색상 디자인
                        $colorClass = ($poll_id == 1) ? 'bg-primary' : 'bg-success';
                        ?>
                        <div class="mb-4">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="fw-bold"><?php echo htmlspecialchars($opt_text); ?></span>
                                <span><?php echo $votes; ?>표 (<?php echo $percent; ?>%)</span>
                            </div>
                            <div class="progress shadow-sm">
                                <div class="progress-bar <?php echo $colorClass; ?> progress-bar-striped progress-bar-animated"
                                    role="progressbar" style="width: <?php echo $percent; ?>%;"
                                    aria-valuenow="<?php echo $percent; ?>" aria-valuemin="0" aria-valuemax="100">
                                    <?php echo ($percent > 5) ? $percent . '%' : ''; ?>
                                </div>
                            </div>
                        </div>
                    <?php
                    }
                    ?>
                </div>
                <?php
            }
        } else {
            echo "<div class='alert alert-warning text-center'>진행 중인 투표가 없습니다.</div>";
        }
        ?>

        <div class="text-center mt-4">
            <a href="vote.html" class="btn btn-dark px-4 py-2">⬅️ 투표 화면으로 돌아가기</a>
        </div>
    </div>

    <!-- 자동 문자 발송 알림 스크립트 -->
    <?php if ($alert_message): ?>
        <script>
            // 페이지 로드 후 알림 표시
            window.onload = function () {
                alert("<?php echo $alert_message; ?>");
            }
        </script>
    <?php endif; ?>

</body>

</html>