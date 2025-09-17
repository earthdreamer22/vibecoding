// MovieTMDB API 관련 JavaScript

const API_KEY = '47002dd1671e6f17539c811fe492c235';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let totalPages = 1;

// DOM 요소들
const loadingElement = document.getElementById('loading');
const moviesGrid = document.getElementById('moviesGrid');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

// 페이지 로드 시 영화 데이터 가져오기
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('movieTMDB.html')) {
        fetchNowPlayingMovies(currentPage);
        setupPagination();
    }
});

// 현재 상영중인 영화 데이터 가져오기
async function fetchNowPlayingMovies(page = 1) {
    try {
        showLoading(true);
        
        const url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ko-KR&page=${page}&region=KR`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        totalPages = data.total_pages;
        currentPage = page;
        
        displayMovies(data.results);
        updatePagination();
        
    } catch (error) {
        console.error('영화 데이터를 가져오는데 실패했습니다:', error);
        showError();
    } finally {
        showLoading(false);
    }
}

// 영화 목록 표시
function displayMovies(movies) {
    moviesGrid.innerHTML = '';
    
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        moviesGrid.appendChild(movieCard);
    });
}

// 영화 카드 생성
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => openMovieModal(movie);
    
    const posterPath = movie.poster_path 
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : 'https://via.placeholder.com/500x750/e5e7eb/374151?text=포스터+없음';
    
    const releaseDate = movie.release_date 
        ? new Date(movie.release_date).toLocaleDateString('ko-KR')
        : '개봉일 미정';
    
    const rating = movie.vote_average.toFixed(1);
    
    card.innerHTML = `
        <img src="${posterPath}" alt="${movie.title}" class="movie-poster" loading="lazy">
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-release">개봉일: ${releaseDate}</p>
            <div class="movie-rating">
                <span class="rating-star">⭐</span>
                <span class="rating-score">${rating}</span>
                <span style="color: var(--gray-700); font-size: 0.9rem;">(${movie.vote_count}명 평가)</span>
            </div>
            <p class="movie-overview">${movie.overview || '줄거리 정보가 없습니다.'}</p>
        </div>
    `;
    
    return card;
}

// 영화 상세 모달 열기
function openMovieModal(movie) {
    // 모달이 이미 존재하면 제거
    const existingModal = document.querySelector('.movie-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'movie-modal';
    modal.style.display = 'flex';
    
    const posterPath = movie.poster_path 
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : 'https://via.placeholder.com/500x750/e5e7eb/374151?text=포스터+없음';
    
    const releaseDate = movie.release_date 
        ? new Date(movie.release_date).toLocaleDateString('ko-KR')
        : '개봉일 미정';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeMovieModal()">&times;</button>
            <img src="${posterPath}" alt="${movie.title}" class="modal-poster">
            <div class="modal-info">
                <h2 class="modal-title">${movie.title}</h2>
                <div class="modal-details">
                    <div class="detail-item">
                        <span class="detail-label">개봉일</span>
                        <span class="detail-value">${releaseDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">평점</span>
                        <span class="detail-value">⭐ ${movie.vote_average.toFixed(1)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">평가 수</span>
                        <span class="detail-value">${movie.vote_count.toLocaleString()}명</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">인기도</span>
                        <span class="detail-value">${movie.popularity.toFixed(0)}</span>
                    </div>
                </div>
                <div class="modal-overview">
                    <h4 style="color: var(--deep-blue); margin-bottom: 1rem;">줄거리</h4>
                    <p>${movie.overview || '줄거리 정보가 없습니다.'}</p>
                </div>
            </div>
        </div>
    `;
    
    // 모달 외부 클릭 시 닫기
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeMovieModal();
        }
    };
    
    document.body.appendChild(modal);
}

// 영화 모달 닫기
function closeMovieModal() {
    const modal = document.querySelector('.movie-modal');
    if (modal) {
        modal.remove();
    }
}

// 페이지네이션 설정
function setupPagination() {
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            fetchNowPlayingMovies(currentPage - 1);
        }
    };
    
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            fetchNowPlayingMovies(currentPage + 1);
        }
    };
}

// 페이지네이션 업데이트
function updatePagination() {
    pageInfo.textContent = `${currentPage} / ${totalPages} 페이지`;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

// 로딩 상태 표시
function showLoading(show) {
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
    if (moviesGrid) {
        moviesGrid.style.display = show ? 'none' : 'grid';
    }
}

// 에러 표시
function showError() {
    moviesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <h3 style="color: var(--deep-blue); margin-bottom: 1rem;">오류가 발생했습니다</h3>
            <p style="color: var(--gray-700); margin-bottom: 2rem;">영화 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</p>
            <button onclick="fetchNowPlayingMovies(1)" class="btn">다시 시도</button>
        </div>
    `;
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMovieModal();
    }
});