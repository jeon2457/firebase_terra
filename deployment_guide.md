# MongoDB Atlas 및 웹 서버 배포 가이드

로컬에서 테스트 완료된 코드를 실제 웹 서버에 배포하고 MongoDB Atlas(클라우드)와 연동하는 단계별 절차입니다.

## 1. 사전 준비 (Server Requirements)

### ✅ PHP Extension 확인
웹 호스팅 서버에서 **MongoDB PHP 드라이버(`mongodb` extension)**가 설치 및 활성화되어 있어야 합니다.
- 호스팅 관리 페이지(cPanel, DirectAdmin 등)에서 `PHP Selector` 또는 `Extensions` 메뉴를 찾아 `mongodb` 항목에 체크하세요.
- 만약 직접 서버를 운영한다면 `php.ini`에 `extension=mongodb.so` (리눅스) 또는 `extension=php_mongodb.dll` (윈도우) 설정이 필요합니다.

---

## 2. MongoDB Atlas 설정 (Cloud Setup)

1. **Atlas 로그인**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)에 로그인합니다.
2. **Database User 생성**: `Database Access` 메뉴에서 데이터베이스 사용자를 생성합니다. (비밀번호는 특수문자를 피하는 것이 좋습니다.)
3. **네트워크 접근 허용 (Whitelist)**: `Network Access` 메뉴에서 웹 서버의 IP를 추가합니다.
    > [!IMPORTANT]
    > 호스팅 서버의 IP를 모를 경우 임시로 `0.0.0.0/0` (접근 허용)을 추가할 수 있으나, 보안을 위해 나중에 서버 IP만 허용하도록 바꾸는 것을 권장합니다.
4. **연결 문자열(Connection String) 복사**:
    - `Clusters` -> `Connect` -> `Connect your application` 선택
    - PHP 드라이버 버전 선택 후 제공되는 `mongodb+srv://...` 주소를 복사합니다.

---

## 3. 코드 수정 및 업로드 (Code Deployment)

### ✅ db-connect-mongo.php 수정
`php/db-connect-mongo.php` 파일을 열어 Atlas 주소로 교체합니다.

```php
// 기존 로컬 주소 주석 처리
// $mongoUri = 'mongodb://localhost:27017';

// Atlas 주소 입력 (username, password, cluster-url 부분을 자신의 정보로 수정)
$mongoUri = 'mongodb+srv://USER:PASSWORD@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority';
```

### ✅ FTP 업로드 주의사항
- **vendor 폴더**: 라이브러리가 포함된 `vendor` 폴더를 반드시 함께 업로드해야 합니다.
- **Node.js**: `node_modules` 폴더는 업로드할 필요 없습니다. (PHP 애플리케이션인 경우)
- **파일 경로**: 로컬의 `C:\xampp\htdocs\...` 경로와 서버의 실제 경로가 다르더라도 `__DIR__` 예약어를 사용했으므로 대부분 문제없이 작동합니다.

---

## 4. 데이터 이관 (Data Migration)

로컬의 데이터를 Atlas로 옮기는 가장 쉬운 방법은 **MongoDB Compass**를 사용하는 것입니다.

1. **로컬 접속**: Compass로 로컬 호스트(`mongodb://localhost:27017`)에 접속합니다.
2. **데이터 내보내기 (Export)**: `terraone_mongo` 데이터베이스의 각 컬렉션을 JSON 파일로 내보냅니다.
3. **Atlas 접속**: Compass 테마 상단의 `New Connection`을 눌러 Atlas 연결 문자열로 접속합니다.
4. **데이터 가져오기 (Import)**: Atlas에 데이터베이스(`terraone_mongo`) 및 컬렉션을 생성하고, 저장해둔 JSON 파일을 가져오기 합니다.

---

## 5. 최종 점검 (Testing)

배포 후 사이트에 접속했을 때 다음 에러가 발생한다면 확인하세요:
- **"Class 'MongoDB\Client' not found"**: PHP 드라이버 익스텐션이 설치되지 않았거나 `vendor/autoload.php` 경로가 잘못된 경우입니다.
- **"Connection Timeout"**: Atlas `Network Access`에서 IP 허용 설정이 누락된 경우입니다.
- **"Authentication Failed"**: Atlas Database User의 아이디/비밀번호가 틀린 경우입니다.
