// 모바일 스와이프 기능 구현
// 터치 후 옆으로 밀면 페이지 이동

(function() {
  'use strict';

  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  const minSwipeDistance = 50; // 최소 스와이프 거리 (픽셀)

  // 터치 시작
  document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
  }, false);

  // 터치 종료
  document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    handleSwipe();
  }, false);

  function handleSwipe() {
    const swipeDistanceX = touchEndX - touchStartX;
    const swipeDistanceY = touchEndY - touchStartY;

    // 수평 스와이프가 수직 스와이프보다 큰 경우에만 처리
    if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
      // 왼쪽으로 스와이프 (다음 페이지)
      if (swipeDistanceX < -minSwipeDistance) {
        navigateToNextPage();
      }
      // 오른쪽으로 스와이프 (이전 페이지)
      else if (swipeDistanceX > minSwipeDistance) {
        navigateToPreviousPage();
      }
    }
  }

  function navigateToNextPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // 현재 페이지에 따라 다음 페이지로 이동
    if (currentPage === 'index.html' || currentPage === '') {
      window.location.href = 'index-1.html';
    }
    // 필요한 경우 추가 페이지 네비게이션 로직 추가
  }

  function navigateToPreviousPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // 현재 페이지에 따라 이전 페이지로 이동
    if (currentPage === 'index-1.html') {
      window.location.href = 'index.html';
    } else {
      // 기본적으로 브라우저 뒤로가기
      window.history.back();
    }
  }

  // 디버깅용 (필요시 주석 해제)
  // console.log('Swipe.js loaded successfully');
})();
