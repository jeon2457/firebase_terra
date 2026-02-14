<?php
// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/db-connect-mongo.php';

$year = isset($_GET['year']) ? (int) $_GET['year'] : (int) date('Y');

/* 월별 총 납입액 */
$monthPipeline = [
  ['$match' => ['pay_year' => $year]],
  [
    '$group' => [
      '_id' => '$pay_month',
      'total' => ['$sum' => '$amount']
    ]
  ],
  ['$sort' => ['_id' => 1]]
];
$monthResults = $database->account_pass->aggregate($monthPipeline);
$monthStats = [];
foreach ($monthResults as $res) {
  $monthStats[$res['_id']] = $res['total'];
}

/* 연도별 총 회비 */
$yearPipeline = [
  [
    '$group' => [
      '_id' => '$pay_year',
      'total' => ['$sum' => '$amount']
    ]
  ],
  ['$sort' => ['_id' => -1]]
];
$yearResults = $database->account_pass->aggregate($yearPipeline);
$yearStats = [];
foreach ($yearResults as $res) {
  $yearStats[] = [
    'pay_year' => $res['_id'],
    'total' => $res['total']
  ];
}
?>