# 영수증 갤러리 및 재무 관리 시스템의 Next.js 전환 안내

이 문서는 기존 PHP 기반의 영수증 관리 및 재무 시스템을 Next.js로 성공적으로 전환한 결과를 요약합니다.

## 📁 주요 전환 메뉴

### 1. 영수증 관리 (Receipt Management)
- **영수증 보기 ([Receipt View](file:///src/app/receipt/view/page.tsx))**
  - 연도 및 월별 필터링 기능 제공.
  - 마우스 클릭 시 고화질 모달 미리보기 지원.
  - 외부 저장소(Cloudinary) 연동을 통한 최적화된 이미지 로드.
- **영수증 편집 ([Receipt Edit](file:///src/app/receipt/edit/page.tsx))**
  - 영수증 요약(메모) 내용 수정 가능.
  - 불필요한 영수증 삭제 시 DB와 Cloudinary에서 동시 삭제 처리.
- **영수증 업로드 ([Receipt Upload](file:///src/app/receipt/upload/page.tsx))**
  - Cloudinary로의 직접 업로드 및 MongoDB 메타데이터 저장 자동화.

### 2. 재무 관리 시스템 (Account Management)
- **사용내역서 열람 ([Account View](file:///src/app/account/view/page.tsx))**
  - 수입/지출 내역의 자동 정렬 및 테이블 표시.
  - **월 합계** 및 **1월부터 선택월까지의 누계 잔액** 자동 계산.
  - Neumorphic 디자인의 간편 **계산기** 위젯 포함.
- **사용내역서 편집 ([Account Edit](file:///src/app/account/edit/page.tsx))**
  - 수입/지출 개별 항목의 수정 및 삭제 (관리자 권한 필요).
  - 전체 목록에서 실시간 CRUD(생성, 읽기, 수정, 삭제) 작업 가능.
- **사용내역서 입력 ([Account Input](file:///src/app/account/input/page.tsx))**
  - 수입과 지출 유형을 선택하여 간편하게 데이터 입력.

### 3. 대시보드 및 공통 기능
- **메인 대시보드**: 새로운 Next.js 페이지들로의 내비게이션 링크가 모두 업데이트되었습니다.
- **통합 API**: `/api/financial` 및 `/api/receipts`를 통해 데이터 정합성을 유지합니다.
- **보안**: NextAuth.js 기반의 세션 체크 및 `user_level`에 따른 접근 제어가 적용되었습니다.

## 🛠️ 기술 스택
- **Framework**: Next.js 15+ (App Router)
- **Database**: MongoDB Atlas (Mongoose)
- **Storage**: Cloudinary
- **Styling**: Bootstrap 5 + Vanilla CSS (Custom Neumorphic UI)
- **Icons**: Lucide React

---
모든 작업이 완료되었으며, 현재 시스템은 로컬 및 서버 환경에서 정상적으로 작동하도록 구성되어 있습니다.
