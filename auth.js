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
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    submitBtn.disabled = true;
    submitBtn.textContent = isLoginMode ? '로그인 중...' : '가입 중...';
    
    try {
      if (isLoginMode) {
        // [로그인 로직]
        // 1. profiles 테이블에서 아이디로 이메일 찾기
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('email')
          .eq('username', username)
          .single();
        
        if (profileError || !profile) {
          throw new Error('존재하지 않는 아이디입니다.');
        }

        // 2. 찾은 이메일로 로그인 시도
        const { data, error: loginError } = await supabaseClient.auth.signInWithPassword({
          email: profile.email,
          password: password
        });
        
        if (loginError) throw loginError;
        if (data.user) window.location.href = './index.html';
        
      } else {
        // [회원가입 로직]
        // 1. 먼저 아이디 중복 체크
        const { data: existing } = await supabaseClient
          .from('profiles')
          .select('username')
          .eq('username', username)
          .single();
        
        if (existing) throw new Error('이미 사용 중인 아이디입니다.');

        // 2. Auth 회원가입
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
          email: email,
          password: password,
          options: {
            data: { username: username }
          }
        });
        
        if (authError) throw authError;

        // 3. profiles 테이블에 아이디-이메일 매핑 저장
        if (authData.user) {
          const { error: dbError } = await supabaseClient
            .from('profiles')
            .insert([{ id: authData.user.id, username: username, email: email }]);
          
          if (dbError) console.error('프로필 저장 에러:', dbError);
        }
        
        alert('회원가입이 완료되었습니다! 이메일 인증 후 로그인해 주세요.');
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
