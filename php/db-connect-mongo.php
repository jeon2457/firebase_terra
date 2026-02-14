<?php
/**
 * MongoDB 연결 파일
 * MySQL PDO 방식에서 MongoDB로 전환
 */

// 한국 시간대 설정
date_default_timezone_set('Asia/Seoul');

// MongoDB PHP Library 사용
require_once __DIR__ . '/../vendor/autoload.php';

try {
    // MongoDB 연결 설정
    // 로컬 MongoDB 서버 사용 (기본 포트 27017)
    //$mongoUri = 'mongodb://localhost:27017';

    // MongoDB Atlas (클라우드) 사용 시 아래 주석 해제하고 URI 입력
    $mongoUri = 'mongodb+srv://admin:jsj84325285%23@cluster0.uccncdj.mongodb.net/?appName=Cluster0';

    // MongoDB Client 생성
    $client = new MongoDB\Client($mongoUri);

    // 데이터베이스 선택 (MySQL의 dbname과 동일한 개념)
    $database = $client->terraone_mongo;

    // 컬렉션 선택 (MySQL의 table과 동일한 개념)
    // 'members' 컬렉션 = MySQL의 'tel' 테이블
    $collection = $database->members;

    // 연결 테스트 (ping 명령)
    $client->admin->command(['ping' => 1]);

} catch (Exception $e) {
    die("MongoDB 연결 실패: " . $e->getMessage());
}

// 전역 변수로 사용 가능하도록 설정
// $client: MongoDB 클라이언트
// $database: 데이터베이스 객체
// $collection: members 컬렉션 (기본)
?>