// 어스컴퍼니 포트폴리오 - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 현재 페이지 활성화 표시
    setActiveNavLink();
    
    // 모바일 네비게이션 토글
    setupMobileNav();
    
    // 스크롤 애니메이션
    setupScrollAnimations();
});

// 현재 페이지에 해당하는 네비게이션 링크 활성화
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// 모바일 네비게이션 설정
function setupMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // 네비게이션 링크 클릭 시 메뉴 닫기
        navLinks.addEventListener('click', function() {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    }
}

// 스크롤 애니메이션 설정
function setupScrollAnimations() {
    const animateElements = document.querySelectorAll('.card, .skill-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// 타이핑 효과 (메인 페이지용)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// 부드러운 스크롤
function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 이메일 복사 기능
function copyEmail() {
    const email = 'yoonjae790510@gmail.com';
    navigator.clipboard.writeText(email).then(function() {
        alert('이메일 주소가 복사되었습니다!');
    }).catch(function(err) {
        console.error('복사 실패:', err);
    });
}

// 프로젝트 링크 열기
function openProject(url) {
    window.open(url, '_blank');
}