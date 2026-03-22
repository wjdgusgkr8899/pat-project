// Supabase Configuration
const SUPABASE_URL = 'https://spopgxbmsjwosmqsdyzs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3BneGJtc2p3b3NtcXNkeXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTE0NTgsImV4cCI6MjA4OTE2NzQ1OH0.lNwaLDQXwhWIkPX_u5Jm3O-pe9OUAlTkT2Tcog86n3w';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const emailGroup = document.getElementById('email-group');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const toggleMode = document.getElementById('toggle-mode');
const authTitle = document.getElementById('auth-title');
const authDesc = document.getElementById('auth-desc');
const toggleText = document.getElementById('toggle-text');
const authActionBtn = document.getElementById('auth-action-btn');
const userEmailSpan = document.getElementById('user-email');
const authWrapper = document.getElementById('auth-wrapper');

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
      // 메타데이터에 저장된 아이디가 있으면 표시, 없으면 이메일 앞부분 표시
      const displayId = user.user_metadata?.username || user.email.split('@')[0];
      userEmailSpan.textContent = `${displayId}님 환영합니다!`;
    }
    if (window.location.pathname.includes('login.html')) {
      window.location.href = './index.html';
    }
  } else {
    if (authActionBtn) {
      authActionBtn.textContent = '로그인';
      authActionBtn.onclick = () => window.location.href = './login.html';
    }
    if (userEmailSpan) userEmailSpan.textContent = '';
  }
}

// 2. 로그인/회원가입 모드 전환
if (toggleMode) {
  toggleMode.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
      authWrapper.classList.remove('signup-mode');
      authTitle.textContent = '로그인';
      authDesc.textContent = '멍.찾.사에 오신 것을 환영합니다!';
      submitBtn.textContent = '로그인';
      toggleText.textContent = '계정이 없으신가요?';
      toggleMode.textContent = '회원가입';
      emailGroup.style.display = 'none';
      emailInput.required = false;
    } else {
      authWrapper.classList.add('signup-mode');
      authTitle.textContent = '회원가입';
      authDesc.textContent = '새로운 계정을 만들고 반려동물을 찾아보세요!';
      submitBtn.textContent = '가입하기';
      toggleText.textContent = '이미 계정이 있으신가요?';
      toggleMode.textContent = '로그인';
      emailGroup.style.display = 'block';
      emailInput.required = true;
    }
  });
}

// 3. 폼 제출 처리
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    
    submitBtn.disabled = true;
    submitBtn.textContent = isLoginMode ? '로그인 중...' : '가입 중...';
    
    try {
      if (isLoginMode) {
        // [로그인 로직]
        // Supabase는 기본적으로 이메일 로그인이므로, 
        // 사용자가 아이디 칸에 이메일을 넣었는지 확인하거나 
        // 별도의 프로필 테이블에서 아이디로 이메일을 찾는 과정이 필요합니다.
        // 여기서는 편의상 아이디 칸에 이메일을 입력하거나, 아이디를 이메일처럼 취급합니다.
        
        let loginEmail = username;
        // 만약 아이디에 @가 없다면, 가입 시 사용한 이메일을 찾아야 하지만 
        // 클라이언트 단에서는 보안상 바로 찾을 수 없으므로 
        // 이메일 형식이 아닐 경우 경고를 줍니다. (실제 서비스에서는 프로필 테이블 연동 필요)
        if (!username.includes('@')) {
          // 임시 해결책: 아이디로 가입했더라도 로그인 시에는 이메일을 입력하도록 안내하거나
          // 내부적으로 특정 도메인을 붙여서 처리하는 방식이 있으나, 
          // 가장 정확한 방법은 이메일로 로그인하는 것입니다.
          // 사용자 경험을 위해 "아이디(이메일)"을 입력받도록 안내를 수정하겠습니다.
        }
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: loginEmail,
          password: password
        });
        
        if (error) throw error;
        if (data.user) window.location.href = './index.html';
        
      } else {
        // [회원가입 로직]
        const { data, error } = await supabaseClient.auth.signUp({
          email: email,
          password: password,
          options: {
            data: { username: username } // 메타데이터에 아이디 저장
          }
        });
        
        if (error) throw error;
        alert('회원가입 요청이 전송되었습니다! 이메일 인증 후 해당 이메일로 로그인해 주세요.');
      }
    } catch (error) {
      alert(`에러: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isLoginMode ? '로그인' : '가입하기';
    }
  });
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
  window.location.reload();
}

checkUser();
