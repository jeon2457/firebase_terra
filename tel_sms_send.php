<?php
// tel_sms_send.php(단체문자메시지 발송 페이지)
require_once __DIR__ . '/php/session.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

// 🔹 [추가] 보안 스위치 상태 가져오기
$auth_enabled = 1; // 기본값 보안 ON
try {
    $settings_col = $database->site_settings;
    $status_doc = $settings_col->findOne(['setting_name' => 'auth_switch']);
    if ($status_doc) {
        $auth_enabled = (int) $status_doc['is_active'];
    }
} catch (Exception $e) {
    $auth_enabled = 1;
}

// 🔹 스위치가 1(ON)일 때만 로그인 체크 실행
if ($auth_enabled == 1) {
    if (file_exists('./php/auth_check.php')) {
        require './php/auth_check.php';
    }
}

// GET 파라미터로 제외할 전화번호 확인
$exclude_tel = $_GET['exclude_tel'] ?? '';

// 전체 회원 중 제외 전화번호를 제외하고 전화번호가 유효한 회원만 조회
try {
    $query = [
        'tel' => ['$exists' => true, '$nin' => [null, '']],
        'name' => ['$ne' => '공용계정']
    ];
    if ($exclude_tel) {
        $query['tel'] = ['$not' => ['$eq' => $exclude_tel], '$exists' => true, '$ne' => ''];
    }

    $cursor = $collection->find($query, ['sort' => ['name' => 1]]);
    $rows = iterator_to_array($cursor);
} catch (Exception $e) {
    $rows = [];
}

$total_count = count($rows);

// 초기 전체 리스트 (JS에서 초기 인원수 계산용)
$temp_tels = [];
foreach ($rows as $r) {
    if (!empty($r['tel']))
        $temp_tels[] = $r['tel'];
}
$sms_list_js = implode(',', $temp_tels);
?>

<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>단체문자 발송</title>

    <!-- 파비콘 아이콘들 -->
    <link rel="icon" href="/favicon.png?v=2" />
    <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />
    <link rel="icon" type="image/png" sizes="48x48" href="./favicons/2/android-icon-48x48.png" />
    <link rel="icon" type="image/png" sizes="72x72" href="./favicons/2/android-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="32x32" href="./favicons/2/apple-icon-32x32.png">
    <link rel="apple-touch-icon" sizes="57x57" href="./favicons/2/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="./favicons/2/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="./favicons/2/apple-icon-72x72.png">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        .scroll-box {
            border: 1px solid #e6e9ee;
            border-radius: 10px;
            padding: 10px;
            max-height: 700px;
            overflow-y: auto;
            background: #fafafa;
        }

        .grid-box {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }

        .controls {
            margin-top: 16px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .title {
            text-align: center;
            background: #f0f4ff;
            padding: 16px 0;
            margin: 20px auto 30px auto;
            width: 90%;
            max-width: 500px;
            border-radius: 25px;
            font-size: 1.4rem;
            font-weight: 700;
            color: #2a3d7c;
            box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15);
        }

        .count-area {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 14px;
            margin-bottom: 10px;
        }

        .count {
            font-size: 1rem;
        }

        .count .number {
            color: #1a73e8;
            /* 파랑색 */
            font-weight: 700;
        }

        .btn-wide {
            flex: 1 1 auto;
            min-width: 150px;
            max-width: 250px;
        }

        @media (max-width: 768px) {
            .grid-box {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        @media (max-width: 520px) {
            .grid-box {
                grid-template-columns: repeat(2, 1fr);
            }

            .controls {
                flex-direction: column;
                align-items: center;
            }

            .btn-wide {
                width: 100%;
                max-width: 280px;
            }
        }

        .grid-item {
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            font-size: 0.9rem;
            line-height: 1.3rem;
            border: 1px solid #eee;
            display: flex;
            align-items: flex-start;
            gap: 8px;
        }

        .grid-item .item-content {
            flex: 1;
        }

        .grid-item strong {
            font-weight: 600;
        }

        /* 체크박스 디자인 */
        .form-check-input {
            width: 1.2rem;
            height: 1.2rem;
            cursor: pointer;
        }
    </style>

    <script>
        // 전체 선택/해제 토글 함수
        function toggleAll(source) {
            const checkboxes = document.querySelectorAll('.sms-member-check');
            checkboxes.forEach(cb => {
                cb.checked = source.checked;
            });
            updateSelectedCount();
        }

        // 선택된 인원수 업데이트 함수
        function updateSelectedCount() {
            const checkedCount = document.querySelectorAll('.sms-member-check:checked').length;
            document.getElementById('selected-count').innerText = checkedCount;
        }

        // 문자 보내기 실행 함수
        function confirmSend() {
            const checkedCheckboxes = document.querySelectorAll('.sms-member-check:checked');
            const total = checkedCheckboxes.length;

            if (total === 0) {
                alert('발송할 회원을 선택해주세요.');
                return;
            }

            const ok = confirm('선택한 회원 ' + total + '명에게 단체문자메시지를 보내겠습니까?');
            if (!ok) return;

            // 선택된 번호들을 콤마로 연결
            const smsList = Array.from(checkedCheckboxes).map(cb => cb.value).join(',');

            // SMS 앱 실행
            window.location.href = 'sms:' + smsList;
        }

        // 페이지 로드 시 인원수 초기화
        window.onload = updateSelectedCount;
    </script>
</head>

<body>
    <div class="container-card">
        <div class="header">
            <div class="title">단체 문자 발송</div>

            <div class="count-area">
                <div class="count">
                    문자메시지 보낼 인원수: <span class="number" id="selected-count">0</span> 명
                    <span style="font-size:0.8rem; color:#888;">(총 <?php echo $total_count; ?>명)</span>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="selectAll" onclick="toggleAll(this)" checked>
                    <label class="form-check-label ms-1" for="selectAll"
                        style="font-weight:bold; cursor:pointer;">전체선택</label>
                </div>
            </div>
        </div>

        <div class="scroll-box mt-3" aria-label="문자 수신자 목록">
            <div class="grid-box">
                <?php
                if ($total_count === 0) {
                    echo '<div class="grid-item">목록이 비어 있습니다.</div>';
                } else {
                    foreach ($rows as $i => $row) {
                        $name = htmlspecialchars($row['name'], ENT_QUOTES, 'UTF-8');
                        $remark = htmlspecialchars($row['remark'], ENT_QUOTES, 'UTF-8');
                        $tel = htmlspecialchars($row['tel'], ENT_QUOTES, 'UTF-8');

                        echo "
            <div class='grid-item'>
                <input type='checkbox' class='form-check-input sms-member-check' value='$tel' onclick='updateSelectedCount()' checked>
                <div class='item-content'>
                    <strong>" . ($i + 1) . ". $name</strong><br>
                    ($remark)<br>
                    📞 $tel
                </div>
            </div>";
                    }
                }
                ?>
            </div>
        </div>

        <div class="controls mt-5">
            <button type="button" class="btn btn-primary btn-wide" onclick="confirmSend()">
                단체문자보내기
            </button>

            <button type="button" class="btn btn-success btn-wide" onclick="location.href='tel_edit.php'">회원 직책
                변경</button>
            <button type="button" class="btn btn-secondary btn-wide"
                onclick="location.href='tel_view.php'">돌아가기</button>
        </div>

        <div style="margin:12px 0 0 30px; font-size:0.9rem; color:#666;">
            ※ 모바일에서 잘 동작합니다. PC 브라우저는 sms: 링크가 작동하지 않을 수 있습니다.
        </div>
    </div>
</body>

</html>