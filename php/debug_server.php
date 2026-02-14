<?php
/**
 * debug_server.php
 * 웹 서버의 PHP 환경 및 MongoDB 연동 상태를 진단합니다.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>웹 서버 환경 진단 리포트</h2>";

// 1. PHP 버전 확인
echo "🐘 PHP 버전: " . PHP_VERSION . "<br>";

// 2. MongoDB 익스텐션 설치 여부 확인
if (extension_loaded('mongodb')) {
    echo "✅ <b>[성공]</b> MongoDB 익스텐션이 설치되어 있습니다.<br>";
} else {
    echo "❌ <b>[실패]</b> MongoDB 익스텐션이 설치되어 있지 않습니다.<br>";
    echo "<blockquote>도움말: 호스팅 관리 페이지에서 PHP 버전 설정 또는 확장 기능(Extensions) 메뉴를 통해 'mongodb' 항목을 활성화해야 합니다. 만약 활성화가 불가능한 호스팅이라면 클라우드 DB 사용이 어려울 수 있습니다.</blockquote>";
}

// 3. vendor/autoload.php 파일 존재 확인
$autoloadPath = __DIR__ . '/../vendor/autoload.php';
if (file_exists($autoloadPath)) {
    echo "✅ <b>[성공]</b> vendor/autoload.php 파일을 찾았습니다.<br>";
} else {
    echo "❌ <b>[실패]</b> vendor/autoload.php 파일을 찾을 수 없습니다.<br>";
    echo "<blockquote>도움말: 로컬의 'vendor' 폴더를 서버의 루트 폴더에 FTP로 업로드했는지 확인해 주세요.</blockquote>";
}

// 4. Atlas 연결 시도
if (extension_loaded('mongodb') && file_exists($autoloadPath)) {
    echo "📡 <b>Atlas 연결 시도 중...</b><br>";
    try {
        require_once __DIR__ . '/db-connect-mongo.php';
        $client->admin->command(['ping' => 1]);
        echo "🎉 <b>[축하합니다]</b> 서버에서도 Atlas와 완벽하게 연동됩니다!";
    } catch (Exception $e) {
        echo "❌ <b>[연결 실패]</b> " . $e->getMessage() . "<br>";
        echo "<blockquote>도움말: Atlas 웹사이트의 'Network Access' 메뉴에서 웹 서버의 IP 주소를 추가했는지 확인해 주세요.</blockquote>";
    }
}
?>