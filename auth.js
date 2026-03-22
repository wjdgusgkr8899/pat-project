// Supabase Configuration - 이곳에 자신의 정보를 입력하세요.
const SUPABASE_URL = 'https://spopgxbmsjwosmqsdyzs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3BneGJtc2p3b3NtcXNkeXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTE0NTgsImV4cCI6MjA4OTE2NzQ1OH0.lNwaLDQXwhWIkPX_u5Jm3O-pe9OUAlTkT2Tcog86n3w';

// supabase 전역 객체로부터 클라이언트를 생성합니다.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const toggleMode = document.getElementById('toggle-mode');
const authTitle = document.getElementById('auth-title');
const authDesc = document.getElementById('auth-desc');
const toggleText = document.getElementById('toggle-text');
const authActionBtn = document.getElementById('auth-action-btn');
const userEmailSpan = document.getElementById('user-email');

let isLoginMode = true;

// 1. 초기 실행: 로그인 상태 확인
async function checkUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  
  if (user) {
    if (authActionBtn) {
      authActionBtn.textContent = '로그아웃';
      authActionBtn.onclick = handleLogout;
    }
    if (userEmailSpan) {
      userEmailSpan.textContent = `${user.email.split('@')[0]}님 환영합니다!`;
    }
    // 로그인 페이지에 있다면 홈으로 리다이렉트
    if (window.location.pathname.includes('login.html')) {
      window.location.href = './index.html';
    }
  } else {
    if (authActionBtn) {
      authActionBtn.textContent = '로그인';
      authActionBtn.onclick = () => window.location.href = './login.html';
    }
    if (userEmailSpan) {
      userEmailSpan.textContent = '';
    }
  }
}

// 2. 로그인/회원가입 모드 전환
if (toggleMode) {
  toggleMode.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
      authTitle.textContent = '로그인';
      authDesc.textContent = '멍.찾.사에 오신 것을 환영합니다!';
      submitBtn.textContent = '로그인';
      toggleText.textContent = '계정이 없으신가요?';
      toggleMode.textContent = '회원가입';
    } else {
      authTitle.textContent = '회원가입';
      authDesc.textContent = '새로운 계정을 만들고 반려동물을 찾아보세요!';
      submitBtn.textContent = '가입하기';
      toggleText.textContent = '이미 계정이 있으신가요?';
      toggleMode.textContent = '로그인';
    }
  });
}

// 3. 폼 제출 처리 (로그인/회원가입)
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    
    // 버튼 비활성화 (중복 클릭 방지)
    submitBtn.disabled = true;
    submitBtn.textContent = isLoginMode ? '로그인 중...' : '가입 중...';
    
    try {
      let result;
      if (isLoginMode) {
        result = await supabaseClient.auth.signInWithPassword({ email, password });
      } else {
        result = await supabaseClient.auth.signUp({ email, password });
        if (!result.error) alert('회원가입 요청이 전송되었습니다! 이메일 인증을 확인하시거나 로그인을 시도해 주세요.');
      }
      
      if (result.error) throw result.error;
      
      if (isLoginMode && result.data.user) {
        window.location.href = './index.html';
      }
    } catch (error) {
      alert(`에러: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isLoginMode ? '로그인' : '가입하기';
    }
  });
}

// 4. 로그아웃 처리
async function handleLogout(e) {
  if(e) e.preventDefault();
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    alert(error.message);
  } else {
    window.location.reload();
  }
}

// 초기 로드 시 상태 확인
checkUser();
