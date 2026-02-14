<?php
require_once __DIR__ . '/php/db-connect-mongo.php';
header("Content-Type: application/vnd.ms-excel; charset=utf-8");
header("Content-Disposition: attachment; filename=account.xls");

// 엑셀에서 한글 깨짐 방지를 위한 BOM 출력
echo "\xEF\xBB\xBF";

echo "이름\t월\t납부여부\t금액\n";

try {
  $pipeline = [
    [
      '$addFields' => [
        'member_oid' => [
          '$cond' => [
            'if' => ['$ne' => ['$member_id', '']],
            'then' => ['$toObjectId' => '$member_id'],
            'else' => null
          ]
        ]
      ]
    ],
    [
      '$lookup' => [
        'from' => 'members',
        'localField' => 'member_oid',
        'foreignField' => '_id',
        'as' => 'm'
      ]
    ],
    ['$unwind' => '$m'],
    [
      '$project' => [
        'name' => '$m.name',
        'pay_month' => 1,
        'paid' => 1,
        'amount' => 1
      ]
    ],
    ['$sort' => ['name' => 1, 'pay_month' => 1]]
  ];

  $cursor = $database->account_pass->aggregate($pipeline);

  foreach ($cursor as $r) {
    $status = $r['paid'] ? '납부' : '미납';
    echo "{$r['name']}\t{$r['pay_month']}\t{$status}\t{$r['amount']}\n";
  }
} catch (Exception $e) {
  // 에러 발생 시 처리 (엑셀 내용으로 출력됨)
  echo "Error: " . $e->getMessage() . "\n";
}
?>