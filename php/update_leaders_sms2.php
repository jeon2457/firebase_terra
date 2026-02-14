<?php
/**
 * 모든 회장/총무의 SMS_2를 자동 업데이트하는 함수 (MongoDB 버전)
 * 회원 추가/수정/삭제 시 호출
 * 
 * @param MongoDB\Database $database - 데이터베이스 연결 객체
 * @param MongoDB\Collection $collection - members 컬렉션 객체
 * @return bool - 성공 여부
 */
function updateLeadersSms2($database, $collection)
{
    try {
        // 전체 회원 전화번호 조회 (tel이 비어있지 않은 문서)
        $cursor_all = $collection->find(
            ['tel' => ['$ne' => '']],
            ['projection' => ['tel' => 1], 'sort' => ['name' => 1]]
        );
        $all_numbers = [];
        foreach ($cursor_all as $doc) {
            if (!empty($doc['tel'])) {
                $all_numbers[] = (string) $doc['tel'];
            }
        }

        if (empty($all_numbers))
            return true;

        // 회장/총무 목록 조회 (remark 필드에 "회장" 또는 "총무" 포함)
        $leaders = $collection->find([
            '$or' => [
                ['remark' => ['$regex' => '회장']],
                ['remark' => ['$regex' => '총무']]
            ]
        ])->toArray();

        if (empty($leaders))
            return true;

        foreach ($leaders as $leader) {
            // 본인 번호 제외하고 콤마로 연결
            $filtered = array_filter($all_numbers, fn($num) => $num !== (string) $leader['tel']);
            $sms_2 = implode(',', $filtered);

            $collection->updateOne(
                ['_id' => $leader['_id']],
                ['$set' => ['sms_2' => $sms_2]]
            );
        }

        return true;

    } catch (Exception $e) {
        error_log("SMS_2 업데이트 오류: " . $e->getMessage());
        return false;
    }
}
?>