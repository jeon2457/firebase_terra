function checkPassword() {
  const correctPassword = '77777'; // 설정된 비밀번호
  let userInput = '';

  while (userInput !== correctPassword) {
    userInput = prompt('비밀번호를 입력하세요:');
    if (userInput === null) {
      alert('취소되었습니다.');
      return false;
    } else if (userInput.trim() === '') {
      alert('비밀번호를 입력해야합니다.');
    } else if (userInput !== correctPassword) {
      alert('비밀번호가 틀렸습니다. 다시 시도하세요.');
    }
  }

  // (방법-1) 비밀번호 맞으면 새 창으로 열기(파일 메뉴에서 웹에 게시로 들어가서 받은 공유링크 사용-실시간 반영 속도가 느림_5분소요)
  // window.open(
  //   'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGfU7cZiYmJe_kHfmsdUu5EFlOJCF5BL5BcAsI0c8Xq8ei5gWxXLsWY6SB8qGBys3ve3pK4mmpXS7a/pubhtml',
  //   '_blank'
  // );
  // return false; 





  // (방법-2) 강력추천! 비밀번호 맞으면 새 창으로 열기
  // [알림!] 스프레드시트 우측 상단 [공유] -> [링크가 있는 모든 사용자 - 뷰어]로 설정 필수!
  // 주소 끝을 /htmlview 로 끝내면 메뉴바 없이 깔끔하게 실시간 반영본이 열립니다.
  // 실제로 공유받은 주소: https://docs.google.com/spreadsheets/d/1w1-6-u5-EU70MrBERrv-xBid1GC4Q50VhxqsMISpECs/edit?usp=sharing 여기에서,
  // /edit?usp=sharing 부분을 /htmlview 로 바꾸면 됩니다.
  window.open(
    'https://docs.google.com/spreadsheets/d/1w1-6-u5-EU70MrBERrv-xBid1GC4Q50VhxqsMISpECs/htmlview',
    '_blank'
  );

  return false; // a 태그로 호출할 경우 페이지 이동을 막기 위해 필수입니다.
}



