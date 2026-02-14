<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>8-Frame Robot Animation (Fixed)</title>
    <style>
        /* 1. 배경 설정 (우주 공간) */
        body {
            margin: 0;
            padding: 0;
            background-color: #000;
            height: 100vh;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        /* 2. 로봇 컨테이너 */
        .stage {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;             /* 정중앙 정렬 */
            justify-content: center;
            align-items: center;
        }

        /* 3. 로봇 이미지 스타일 */
        #robot-img {
            /* 이미지 크기 고정 */
            width: 400px; 
            height: auto;
            
            /* 앞으로 다가오는 애니메이션 제거됨 */
        }
    </style>
</head>
<body>

    <div class="stage">
        <!-- 첫 번째 이미지를 기본으로 보여줌 -->
        <img src="image/robot1.png" alt="Walking Robot" id="robot-img">
    </div>

    <script>
        /* ==========================================
           [설정 영역] 속도를 여기서 조절하세요.
           ========================================== */
        const totalFrames = 8;          // 이미지 개수 (8장)
        
        // ★ 속도 조절 (숫자가 클수록 느려집니다)
        // 100 = 0.1초 (빠름)
        // 250 = 0.25초 (적당함)
        // 500 = 0.5초 (느림)
        const speed = 350;              
        
        const path = "image/robot";     // 이미지 경로 및 앞부분 이름
        const ext = ".png";             // 확장자
        /* ========================================== */

        const imgElement = document.getElementById('robot-img');
        let currentFrame = 1;

        // 1. 깜빡임 방지를 위한 이미지 미리 불러오기 (Preloading)
        const preloadImages = [];
        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            img.src = `${path}${i}${ext}`; 
            preloadImages.push(img);
        }

        // 2. 애니메이션 실행 함수
        function animateFrame() {
            // 이미지 주소 변경
            imgElement.src = `${path}${currentFrame}${ext}`;
            
            // 다음 프레임 번호 계산
            currentFrame++;
            
            // 8번을 넘어가면 다시 1번으로 리셋
            if (currentFrame > totalFrames) {
                currentFrame = 1;
            }
        }

        // 3. 설정한 속도(speed)마다 함수 실행
        setInterval(animateFrame, speed);

    </script>
</body>
</html>