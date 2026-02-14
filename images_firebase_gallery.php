<?php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// ⭐ 맨 위에 반드시 이 코드가 있어야 합니다!
// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';

?>

<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Firebase 이미지 갤러리</title>

<link rel="icon" href="1/favicons/favicon.png?v=2" />
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
    font-family: 'Segoe UI', 'Noto Sans KR', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    min-height: 100vh;
}
.container {
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 20px;
}
h1 { color: #2c3e50; font-size: 2rem; display: flex; align-items: center; gap: 15px; }

.stats {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    padding: 15px 25px;
    border-radius: 12px;
    font-weight: 600;
    color: #1565c0;
    font-size: 1.1rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.toolbar {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 30px;
    border: 2px solid #e0e0e0;
}

.toolbar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap;
}

.month-grid {
    display: grid;
    grid-template-columns: repeat(13, 1fr);
    gap: 8px;
    margin-top: 15px;
}

.filter-btn {
    padding: 10px 5px;
    border: 2px solid #e0e0e0;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s;
    text-align: center;
}

.filter-btn:hover, .filter-btn.active {
    background: #3498db;
    color: white;
    border-color: #3498db;
}

.action-bar {
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 30px;
    border-left: 4px solid #ff9800;
}

.action-buttons { display: flex; gap: 10px; flex-wrap: wrap; }

.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
    margin-top: 30px;
}

.image-card {
    border: 2px solid #e0e0e0;
    border-radius: 15px;
    padding: 15px;
    background: white;
    transition: all 0.3s;
    position: relative;
}

.image-card.selected { border-color: #27ae60; background: #e8f5e9; }

.checkbox-wrapper { position: absolute; top: 20px; left: 20px; z-index: 10; }
.checkbox-wrapper input { width: 22px; height: 22px; cursor: pointer; }

.image-wrapper {
    width: 100%; height: 220px;
    overflow: hidden; border-radius: 10px;
    background: #f5f5f5;
    display: flex; align-items: center; justify-content: center;
}
.image-wrapper img { width: 100%; height: 100%; object-fit: cover; }

.image-info { margin-top: 12px; }
.image-name { font-weight: 600; font-size: 14px; margin-bottom: 5px; color: #2c3e50; }
.badge-date { background: #fff3e0; color: #e65100; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }

.image-url {
    background: #f5f5f5; padding: 8px; border-radius: 6px;
    font-size: 11px; word-break: break-all; margin: 10px 0;
    color: #666; cursor: pointer; border: 1px solid #ddd;
}

.card-actions { display: flex; gap: 8px; }
.btn-small { flex: 1; padding: 8px; font-size: 12px; font-weight: 600; border-radius: 6px; border:none; cursor:pointer;}
.btn-view { background: #e3f2fd; color: #1976d2; }
.btn-delete { background: #ffebee; color: #c62828; }

.btn-nav { 
    display: block; width: 100%; padding: 15px; border-radius: 12px;
    background: linear-gradient(135deg, #5B7FFF 0%, #4A6DE8 100%);
    color: white; font-weight: 700; text-align: center; text-decoration: none;
}

/* 📱 모바일 반응형 조정 */
@media (max-width: 768px) {
    .container { padding: 20px; }
    .header { flex-direction: column; align-items: center; text-align: center; }
    .stats { width: 100%; text-align: center; }
    
    .toolbar-header { flex-direction: column; text-align: center; gap: 10px; }
    .month-grid { grid-template-columns: repeat(6, 1fr); }
    .gallery { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
}

#loadingLayer {
    position: fixed; inset: 0; background: rgba(255,255,255,0.9);
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    z-index: 9999;
}
</style>
</head>
<body>

<div id="loadingLayer">
    <div class="spinner-border text-primary mb-3"></div>
    <strong>데이터베이스에서 목록을 가져오는 중...</strong>
</div>

<div class="container">
    <div class="header">
        <h1>🖼️ Firebase 실시간 갤러리</h1>
        <div class="stats">📊 총 <span id="totalCountDisplay">0</span>개 이미지</div>
    </div>

    <div class="toolbar">
        <div class="toolbar-header">
            <h3 style="font-size: 1rem; color: #666; margin: 0;">📅 월별 분류 (전체 연도 데이터)</h3>
            <select id="yearFilter" class="form-select form-select-sm" style="width: 120px;">
                <option value="all">전체연도</option>
                <option value="2026" selected>2026년</option>
                <option value="2025">2025년</option>
            </select>
        </div>
        <div class="month-grid">
            <button class="filter-btn active" onclick="filterByMonth('all', this)">전체</button>
            <?php for($i=1; $i<=12; $i++): ?>
                <button class="filter-btn" onclick="filterByMonth(<?= $i ?>, this)"><?= $i ?>월</button>
            <?php endfor; ?>
        </div>
        <!-- 엔터키 지원을 위해 type="search" 권장하지만 로직으로 처리함 -->
        <input type="text" id="searchInput" class="form-control mt-3" placeholder="메모 내용으로 검색...">
    </div>

    <div class="action-bar">
        <div class="action-buttons">
            <button class="btn btn-primary" onclick="selectAll()">📌 전체 선택</button>
            <button class="btn btn-secondary" onclick="deselectAll()">🔄 선택 해제</button>
            <button class="btn btn-success" onclick="copySelectedURLs()">📋 선택 URL 복사</button>
            <button class="btn btn-warning" onclick="location.href='images_upload.php'">⏪ 업로드 페이지</button>
        </div>
    </div>

    <div class="gallery" id="galleryContainer"></div>

    <div class="mt-5">
        <a href="images_upload.php" class="btn-nav">⏪ 돌아가기</a>
    </div>
</div>

<script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

    const firebaseConfig = {
      apiKey: "AIzaSyAF7AD1d54k21-stmb0Hpg9OMEECvzFHpQ",
      authDomain: "terraone-d0318.firebaseapp.com",
      databaseURL: "https://terraone-d0318-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "terraone-d0318",
      storageBucket: "terraone-d0318.firebasestorage.app",
      messagingSenderId: "1082807340877",
      appId: "1:1082807340877:web:6e2b49c04562d800e87104"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    let allImagesData = [];

    // 1. DB에서 데이터 불러오기
    async function loadImagesFromDB() {
        const dbRef = ref(db, 'images_table');
        try {
            const snapshot = await get(dbRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                allImagesData = [];

                Object.keys(data).forEach(year => {
                    Object.keys(data[year]).forEach(key => {
                        const item = data[year][key];
                        const dateObj = new Date(item.date);
                        allImagesData.push({
                            id: key,
                            year: year,
                            url: item.url,
                            date: item.date,
                            notice: item.notice || '설명 없음',
                            month: dateObj.getMonth() + 1,
                            dbPath: `images_table/${year}/${key}`
                        });
                    });
                });

                allImagesData.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                document.getElementById('totalCountDisplay').innerText = allImagesData.length;
                renderGallery(allImagesData);
            } else {
                document.getElementById('galleryContainer').innerHTML = "<p class='text-center w-100'>데이터가 없습니다.</p>";
            }
            document.getElementById('loadingLayer').style.display = 'none';
        } catch (error) {
            console.error(error);
            alert("DB 로드 실패");
        }
    }

    window.renderGallery = function(data) {
        const container = document.getElementById('galleryContainer');
        container.innerHTML = '';
        
        data.forEach(img => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.innerHTML = `
                <div class="checkbox-wrapper"><input type="checkbox" class="img-chk" value="${img.url}"></div>
                <div class="image-wrapper"><img src="${img.url}" loading="lazy" onerror="this.src='https://placehold.co/300x200?text=Error'"></div>
                <div class="image-info">
                    <div class="image-name">📝 ${img.notice}</div>
                    <div class="mb-2"><span class="badge-date">📅 ${img.date}</span></div>
                    <div class="image-url" onclick="copyText('${img.url}')">${img.url}</div>
                    <div class="card-actions">
                        <button class="btn-small btn-view" onclick="window.open('${img.url}')">👁️ 보기</button>
                        <button class="btn-small btn-delete" onclick="deleteFromDB('${img.dbPath}', '${img.id}')">🗑️ 삭제</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    };

    window.filterByMonth = function(month, btn) {
        if(btn) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
        
        const selectedYear = document.getElementById('yearFilter').value;
        const activeMonthBtn = document.querySelector('.filter-btn.active');
        const currentMonth = activeMonthBtn.innerText === '전체' ? 'all' : parseInt(activeMonthBtn.innerText);

        let filtered = allImagesData;
        if (selectedYear !== 'all') filtered = filtered.filter(img => img.year === selectedYear);
        if (currentMonth !== 'all') filtered = filtered.filter(img => img.month === currentMonth);
        
        renderGallery(filtered);
    };

    document.getElementById('yearFilter').addEventListener('change', () => filterByMonth());

    window.deleteFromDB = async function(path, id) {
        if(!confirm("이 데이터를 DB에서 삭제할까요?\n(실제 저장소 파일은 별도로 삭제해야 합니다)")) return;
        try {
            await remove(ref(db, path));
            alert("삭제되었습니다.");
            allImagesData = allImagesData.filter(item => item.id !== id);
            renderGallery(allImagesData);
        } catch (e) { alert("삭제 실패"); }
    };

    // 검색 실행 로직 공통화
    function executeSearch(val) {
        const query = val.toLowerCase();
        const filtered = allImagesData.filter(img => img.notice.toLowerCase().includes(query));
        renderGallery(filtered);
    }

    // 1. 실시간 입력 검색
    document.getElementById('searchInput').addEventListener('input', (e) => {
        executeSearch(e.target.value);
    });

    // 2. 엔터키 입력 시 반응 추가 (모바일 키보드 닫기 포함)
    document.getElementById('searchInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 엔터 기본 동작 방지
            executeSearch(e.target.value);
            e.target.blur(); // 모바일에서 키보드 숨기기
        }
    });

    loadImagesFromDB();
</script>

<script>
    // 3. 복사 기능 (모바일 호환성 강화)
    function copyText(t) { 
        const textArea = document.createElement("textarea");
        textArea.value = t;
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, 99999); 
        
        try {
            document.execCommand('copy');
            alert("URL 복사완료");
        } catch (err) {
            console.error('복사 실패', err);
            alert("복사 기능이 지원되지 않는 환경입니다.");
        }
        document.body.removeChild(textArea);
    }

    function selectAll() { 
        document.querySelectorAll('.img-chk').forEach(c => { 
            c.checked = true; 
            c.closest('.image-card').classList.add('selected'); 
        }); 
    }
    
    function deselectAll() { 
        document.querySelectorAll('.img-chk').forEach(c => { 
            c.checked = false; 
            c.closest('.image-card').classList.remove('selected'); 
        }); 
    }

    function copySelectedURLs() {
        const sel = Array.from(document.querySelectorAll('.img-chk:checked')).map(c => c.value);
        if(sel.length === 0) return alert("선택된 이미지가 없습니다.");
        copyText(sel.join('\n'));
    }

    document.addEventListener('change', e => { 
        if(e.target.classList.contains('img-chk')) {
            e.target.closest('.image-card').classList.toggle('selected', e.target.checked); 
        }
    });
</script>

</body>
</html>