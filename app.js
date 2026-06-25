// ==========================================
// 1. Firebase 설정 및 초기화
// ==========================================
// 교사 계정 및 파이어베이스 데이터 저장을 위해 실제 프로젝트 자격 증명으로 교체해 주세요.
const firebaseConfig = {
  apiKey: "AIzaSyA4HnLYEgwq-qOAqW3M-g4fqYqf6SE3gvk",
  authDomain: "alphabet-review-db.firebaseapp.com",
  projectId: "alphabet-review-db",
  storageBucket: "alphabet-review-db.firebasestorage.app",
  messagingSenderId: "1052348558368",
  appId: "1:1052348558368:web:405941f60893eb45326045"
};

let db = null;
let isFirebaseActive = false;

try {
  // 기본 설정값이 변경되었는지 검사 (임시 설정 방지)
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    isFirebaseActive = true;
    console.log("Firebase Firestore가 정상 연결되었습니다.");
  } else {
    console.warn("Firebase API Key가 비어 있습니다. 로컬 저장소(localStorage) 모드로 실행됩니다.");
  }
} catch (error) {
  console.error("Firebase 초기화 중 에러 발생, 로컬 저장소 모드로 전환:", error);
}

// ==========================================
// 2. 단어 및 알파벳 파닉스 데이터베이스
// ==========================================
const ALPHABET_DATA = {
  A: { name: "A", phonicsTTS: "eh, eh", phonicsDisp: "eh" },
  B: { name: "B", phonicsTTS: "buh, buh", phonicsDisp: "buh" },
  C: { name: "C", phonicsTTS: "kuh, kuh", phonicsDisp: "kuh" },
  D: { name: "D", phonicsTTS: "duh, duh", phonicsDisp: "duh" },
  E: { name: "E", phonicsTTS: "eh, eh", phonicsDisp: "eh" },
  F: { name: "F", phonicsTTS: "ff, ff", phonicsDisp: "f" },
  G: { name: "G", phonicsTTS: "guh, guh", phonicsDisp: "guh" },
  H: { name: "H", phonicsTTS: "huh, huh", phonicsDisp: "huh" },
  I: { name: "I", phonicsTTS: "ih, ih", phonicsDisp: "ih" },
  J: { name: "J", phonicsTTS: "juh, juh", phonicsDisp: "juh" },
  K: { name: "K", phonicsTTS: "kuh, kuh", phonicsDisp: "kuh" },
  L: { name: "L", phonicsTTS: "luh, luh", phonicsDisp: "l" },
  M: { name: "M", phonicsTTS: "muh, muh", phonicsDisp: "m" },
  N: { name: "N", phonicsTTS: "nuh, nuh", phonicsDisp: "n" },
  O: { name: "O", phonicsTTS: "oh, oh", phonicsDisp: "oh" },
  P: { name: "P", phonicsTTS: "puh, puh", phonicsDisp: "puh" },
  Q: { name: "Q", phonicsTTS: "kwuh, kwuh", phonicsDisp: "kwuh" },
  R: { name: "R", phonicsTTS: "ruh, ruh", phonicsDisp: "ruh" },
  S: { name: "S", phonicsTTS: "ss, ss", phonicsDisp: "s" },
  T: { name: "T", phonicsTTS: "tuh, tuh", phonicsDisp: "tuh" },
  U: { name: "U", phonicsTTS: "uh, uh", phonicsDisp: "uh" },
  V: { name: "V", phonicsTTS: "vuh, vuh", phonicsDisp: "vuh" },
  W: { name: "W", phonicsTTS: "wuh, wuh", phonicsDisp: "wuh" },
  X: { name: "X", phonicsTTS: "ks, ks", phonicsDisp: "ks" },
  Y: { name: "Y", phonicsTTS: "yuh, yuh", phonicsDisp: "yuh" },
  Z: { name: "Z", phonicsTTS: "zuh, zuh", phonicsDisp: "z" }
};

const PHONICS_WORDS = [
  { word: "apple", emoji: "🍎", blank: "_ p p l e", answer: "a" },
  { word: "banana", emoji: "🍌", blank: "_ a n a n a", answer: "b" },
  { word: "cat", emoji: "🐱", blank: "_ a t", answer: "c" },
  { word: "dog", emoji: "🐶", blank: "_ o g", answer: "d" },
  { word: "elephant", emoji: "🐘", blank: "_ l e p h a n t", answer: "e" },
  { word: "fish", emoji: "🐟", blank: "_ i s h", answer: "f" },
  { word: "grapes", emoji: "🍇", blank: "_ r a p e s", answer: "g" },
  { word: "hat", emoji: "👒", blank: "_ a t", answer: "h" },
  { word: "igloo", emoji: "⛺", blank: "_ g l o o", answer: "i" },
  { word: "jam", emoji: "🍯", blank: "_ a m", answer: "j" },
  { word: "kite", emoji: "🪁", blank: "_ i t e", answer: "k" },
  { word: "lion", emoji: "🦁", blank: "_ i o n", answer: "l" },
  { word: "monkey", emoji: "🐵", blank: "_ o n k e y", answer: "m" },
  { word: "net", emoji: "🕸️", blank: "_ e t", answer: "n" },
  { word: "orange", emoji: "🍊", blank: "_ r a n g e", answer: "o" },
  { word: "pig", emoji: "🐷", blank: "_ i g", answer: "p" },
  { word: "queen", emoji: "👑", blank: "_ u e e n", answer: "q" },
  { word: "rabbit", emoji: "🐰", blank: "_ a b b i t", answer: "r" },
  { word: "sun", emoji: "☀️", blank: "_ u n", answer: "s" },
  { word: "tiger", emoji: "🐯", blank: "_ i g e r", answer: "t" },
  { word: "umbrella", emoji: "☂️", blank: "_ m b r e l l a", answer: "u" },
  { word: "van", emoji: "🚐", blank: "_ a n", answer: "v" },
  { word: "water", emoji: "💧", blank: "_ a t e r", answer: "w" },
  { word: "yo-yo", emoji: "🪀", blank: "_ o - y o", answer: "y" },
  { word: "zebra", emoji: "🦓", blank: "_ e b r a", answer: "z" }
];

const ALPHABET_LIST = Object.keys(ALPHABET_DATA);

// ==========================================
// 3. Web Audio API 신디사이저 효과음 엔진
// ==========================================
const SoundEffect = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  correct() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    // 딩동댕 (C5 -> E5 -> G5 짧은 화음)
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16); // G5
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  },
  incorrect() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sawtooth';
    // 삑- (낮은 주파수 하강음)
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  },
  fanfare() {
    this.init();
    const playTone = (freq, start, duration) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.start(start);
      osc.stop(start + duration);
    };
    
    const now = this.ctx.currentTime;
    // C5 -> E5 -> G5 -> C6 경쾌한 아르페지오 팡파르
    playTone(523.25, now, 0.15);
    playTone(659.25, now + 0.1, 0.15);
    playTone(783.99, now + 0.2, 0.15);
    playTone(1046.50, now + 0.3, 0.5);
  }
};

// ==========================================
// 4. Web Speech API (TTS) 제어 모듈
// ==========================================
const TTSManager = {
  voice: null,
  speechTimeout: null,
  audioElement: null,

  init() {
    this.audioElement = new Audio();
    
    if ('speechSynthesis' in window) {
      const findVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        
        // 1. Google Neural, Edge Natural, Apple Siri, 또는 더 부드러운 Zira 목소리 우선 선점 (스펠링 읊는 버그 방지)
        let chosen = voices.find(v => v.lang.startsWith('en') && 
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Zira'))
        );
        
        // 2. 없으면 일반 미국/영국식 영어 목소리 선점
        if (!chosen) {
          chosen = voices.find(v => v.lang.startsWith('en') && (v.lang.includes('US') || v.lang.includes('GB') || v.lang.includes('UK')));
        }
        
        // 3. 그것도 없으면 아무 영어 목소리
        if (!chosen) {
          chosen = voices.find(v => v.lang.startsWith('en'));
        }
        
        this.voice = chosen || voices[0];
      };
      
      findVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = findVoice;
      }
    }
  },

  speak(text, callback) {
    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    
    // 1. Google Translate TTS (고품질 Neural Voice) 시도
    const encodedText = encodeURIComponent(text);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodedText}`;
    
    this.audioElement.pause();
    this.audioElement.src = googleTtsUrl;
    
    this.audioElement.onended = () => {
      if (callback) callback();
    };

    // 로딩 실패 또는 차단 시 로컬 Web Speech API로 백업 작동
    this.audioElement.onerror = () => {
      console.warn("Google TTS 로드 실패. 브라우저 내장 TTS로 대체합니다.");
      this.speakFallback(text, callback);
    };

    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("오디오 재생 오류, 내장 TTS로 대체합니다:", error);
        this.speakFallback(text, callback);
      });
    }
  },

  // 브라우저 내장 Web Speech API 백업용 speak
  speakFallback(text, callback) {
    if (!('speechSynthesis' in window)) {
      if (callback) callback();
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = 0.8;
    utterance.lang = 'en-US';

    if (callback) {
      utterance.onend = () => callback();
    }
    window.speechSynthesis.speak(utterance);
  },

  // 1초 간격으로 자동으로 총 2번 읽기 구현
  speakDouble(text) {
    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    
    this.speak(text, () => {
      this.speechTimeout = setTimeout(() => {
        this.speak(text);
      }, 1000); // 1초 대기 후 한 번 더 재생
    });
  },

  stop() {
    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};

// ==========================================
// 5. 게임 상태 관리 엔진
// ==========================================
const Game = {
  student: {
    grade: '',
    classGroup: '',
    number: '',
    name: ''
  },
  currentLevel: 1,
  successCount: 0,
  incorrectAnswers: [],
  currentQuestion: null,
  level5Round: 0,
  levelLettersPool: [],
  levelWordsPool: [],

  // 각 단계별 문제 은행 풀 초기화
  initLevelPool() {
    this.levelLettersPool = [...ALPHABET_LIST];
    this.levelLettersPool.sort(() => Math.random() - 0.5);
    
    this.levelWordsPool = [...PHONICS_WORDS];
    this.levelWordsPool.sort(() => Math.random() - 0.5);
  },

  // 중복 없이 다음 알파벳 꺼내기
  getNextLetter() {
    if (this.levelLettersPool.length === 0) {
      this.levelLettersPool = [...ALPHABET_LIST];
      this.levelLettersPool.sort(() => Math.random() - 0.5);
    }
    return this.levelLettersPool.pop();
  },

  // 중복 없이 다음 단어 꺼내기
  getNextWord() {
    if (this.levelWordsPool.length === 0) {
      this.levelWordsPool = [...PHONICS_WORDS];
      this.levelWordsPool.sort(() => Math.random() - 0.5);
    }
    return this.levelWordsPool.pop();
  },

  // 게임 시작
  start(grade, classGroup, number, name) {
    this.student = { grade, classGroup, number, name };
    this.currentLevel = 1;
    this.successCount = 0;
    this.incorrectAnswers = [];
    this.level5Round = 0;
    this.initLevelPool();
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    
    this.loadQuestion();
  },

  // 현재 레벨에 맞춰 새로운 문제 생성
  loadQuestion() {
    TTSManager.stop();
    this.updateStatusBar();
    
    if (this.currentLevel === 4) {
      this.setupWritingLevel();
      return;
    }

    // Level 1 ~ 3 구성
    document.getElementById('choice-container').classList.add('hidden');
    document.getElementById('phonics-word-container').classList.add('hidden');
    document.getElementById('writing-container').classList.add('hidden');

    // 다시 듣기 버튼 보이기/숨기기 (Level 2는 음성 지원 안 함)
    if (this.currentLevel === 2) {
      document.getElementById('btn-replay').classList.add('invisible');
    } else {
      document.getElementById('btn-replay').classList.remove('invisible');
    }

    let correctLetter = this.getNextLetter();
    let choices = this.generateChoices(correctLetter);

    if (this.currentLevel === 1) {
      // Level 1: [알파벳 - 듣기] 알파벳 구별
      document.getElementById('choice-container').classList.remove('hidden');
      document.getElementById('question-instruction').textContent = "소리를 듣고 알맞은 알파벳 카드를 고르세요.";
      
      this.currentQuestion = {
        correct: correctLetter,
        choices: choices,
        speechText: correctLetter
      };

      this.renderChoices(choices, (choice) => choice);
      TTSManager.speakDouble(this.currentQuestion.speechText);

    } else if (this.currentLevel === 2) {
      // Level 2: [알파벳 - 읽기] 대소문자 구별 (50% 확률로 교차, 음성 없음)
      document.getElementById('choice-container').classList.remove('hidden');
      const isUpperToLower = Math.random() < 0.5;

      if (isUpperToLower) {
        document.getElementById('question-instruction').textContent = `대문자 [ ${correctLetter} ] 에 알맞은 소문자를 고르세요.`;
        this.currentQuestion = {
          correct: correctLetter.toLowerCase(),
          choices: choices.map(c => c.toLowerCase()),
          speechText: correctLetter,
          displayText: correctLetter
        };
        this.renderChoices(this.currentQuestion.choices, (choice) => choice);
      } else {
        document.getElementById('question-instruction').textContent = `소문자 [ ${correctLetter.toLowerCase()} ] 에 알맞은 대문자를 고르세요.`;
        this.currentQuestion = {
          correct: correctLetter,
          choices: choices,
          speechText: correctLetter,
          displayText: correctLetter.toLowerCase()
        };
        this.renderChoices(this.currentQuestion.choices, (choice) => choice);
      }
      // Level 2는 음성 재생 안 함

    } else if (this.currentLevel === 3) {
      // Level 3: [파닉스 - 심화] 단어 속 파닉스
      document.getElementById('phonics-word-container').classList.remove('hidden');
      document.getElementById('question-instruction').textContent = "그림을 보고 첫 글자에 알맞은 알파벳을 고르세요.";

      // 무작위 단어 선택 (중복 제외 풀에서 추출)
      const wordObj = this.getNextWord();
      const choicesL4 = this.generateChoices(wordObj.answer.toUpperCase()).map(c => c.toLowerCase());

      this.currentQuestion = {
        correct: wordObj.answer,
        choices: choicesL4,
        speechText: wordObj.word
      };

      // UI 갱신
      document.getElementById('word-emoji').textContent = wordObj.emoji;
      document.getElementById('word-blank').textContent = wordObj.blank;

      const choicesBox = document.getElementById('level4-choices');
      choicesBox.innerHTML = '';
      choicesL4.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'py-4 bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-300 font-extrabold text-3xl rounded-2xl game-btn shadow';
        btn.textContent = choice;
        btn.onclick = () => this.handleAnswer(choice, btn);
        choicesBox.appendChild(btn);
      });

      TTSManager.speakDouble(this.currentQuestion.speechText);
    }
  },

  // 4지선다 보기 배열 생성 (정답 포함 무작위 4개 추출)
  generateChoices(correct) {
    let list = ALPHABET_LIST.filter(item => item !== correct);
    // 무작위로 3개 섞어서 추출
    list.sort(() => Math.random() - 0.5);
    let chosen = list.slice(0, 3);
    chosen.push(correct);
    // 최종 4개 무작위 배치
    chosen.sort(() => Math.random() - 0.5);
    return chosen;
  },

  // 보기 버튼 렌더링 (Level 1, 2, 3 공통)
  renderChoices(choicesArray, textFormatter) {
    const container = document.getElementById('choice-container');
    container.innerHTML = '';
    
    // 아동 친화적인 알록달록한 파스텔 배경 색상 배열
    const colors = [
      'bg-red-100 hover:bg-red-200 text-red-900 border-red-300',
      'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300',
      'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300',
      'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-indigo-300'
    ];

    choicesArray.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className = `py-8 font-black text-6xl rounded-3xl game-btn shadow-md ${colors[index % colors.length]}`;
      btn.textContent = textFormatter(choice);
      btn.onclick = () => this.handleAnswer(choice, btn);
      container.appendChild(btn);
    });
  },

  // 사용자의 정오답 응답 처리
  handleAnswer(selected, buttonElement) {
    // 모든 보기 버튼 비활성화 (더블클릭 방지)
    const buttons = document.querySelectorAll('#choice-container button, #level4-choices button');
    buttons.forEach(btn => btn.disabled = true);

    const isCorrect = (selected === this.currentQuestion.correct);

    if (isCorrect) {
      SoundEffect.correct();
      buttonElement.classList.add('animate-correct', '!bg-green-400', '!text-white', '!border-green-600');
      this.successCount++;
      
      // 꽃가루 파티클 효과
      createClickExplosion(buttonElement);

      setTimeout(() => {
        if (this.successCount >= 5) {
          this.levelUp();
        } else {
          this.loadQuestion();
        }
      }, 1000);

    } else {
      SoundEffect.incorrect();
      buttonElement.classList.add('animate-incorrect', '!bg-rose-400', '!text-white', '!border-rose-600');
      
      // 오답 목록에 기록
      let levelName = '';
      if (this.currentLevel === 1) levelName = 'Level 1 [알파벳 듣기]';
      else if (this.currentLevel === 2) levelName = 'Level 2 [대소문자 구별]';
      else if (this.currentLevel === 3) levelName = 'Level 3 [단어 완성]';

      this.incorrectAnswers.push({
        level: this.currentLevel,
        levelName: levelName,
        target: this.currentQuestion.correct,
        selected: selected,
        speechText: this.currentQuestion.speechText
      });

      // 약간의 대기 후 새 문제 출제 (틀려도 다음으로 넘어감, 단 성공 횟수는 그대로 유지)
      setTimeout(() => {
        this.loadQuestion();
      }, 1200);
    }
  },

  // 레벨 상승 처리
  levelUp() {
    SoundEffect.fanfare();
    launchConfetti();
    
    // 스테이지 변경 알림 오버레이
    const playScreen = document.getElementById('play-screen');
    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center text-white z-50 level-clear-overlay';
    overlay.innerHTML = `
      <span class="text-7xl mb-4">🏆</span>
      <h3 class="text-4xl font-extrabold mb-2">Level ${this.currentLevel} 완료!</h3>
      <p class="text-lg font-medium opacity-90">대단해요! 다음 단계로 레벨 업합니다!</p>
    `;
    playScreen.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      this.currentLevel++;
      this.successCount = 0;
      this.initLevelPool(); // 새 단계를 위한 문제 은행 풀 재설정
      this.loadQuestion();
    }, 2000);
  },

  // 알파벳 쓰기 셋업 (Level 4)
  setupWritingLevel() {
    document.getElementById('choice-container').classList.add('hidden');
    document.getElementById('phonics-word-container').classList.add('hidden');
    document.getElementById('writing-container').classList.remove('hidden');
    
    document.getElementById('question-instruction').textContent = "왼쪽 카드의 알파벳을 확인하고 오른쪽 공책에 손가락이나 마우스로 써보세요.";
    
    // 5번 반복을 위한 타겟 선정 (중복 제외 풀에서 추출)
    const targetAlphabet = this.getNextLetter();

    this.currentQuestion = {
      correct: targetAlphabet,
      speechText: `Write the letter ${targetAlphabet}`
    };

    CanvasDrawing.resize(targetAlphabet);
    TTSManager.speakDouble(this.currentQuestion.speechText);
  },

  // 쓰기 완료 클릭 시
  submitWriting() {
    this.level5Round++;
    this.successCount++;
    this.updateStatusBar();
    
    SoundEffect.correct();
    createClickExplosion(document.getElementById('btn-canvas-done'));

    if (this.level5Round >= 5) {
      // 모든 레벨 완료 -> 결과 저장 및 리포트 이동
      this.completeGame();
    } else {
      this.setupWritingLevel();
    }
  },

  // 상태 표시바 동그라미 업데이트
  updateStatusBar() {
    // 뱃지 업데이트
    document.getElementById('level-badge').textContent = `Level ${this.currentLevel}`;
    
    // 레벨별 텍스트 타이틀
    const titles = {
      1: "[알파벳 - 듣기] 알파벳 구별",
      2: "[알파벳 - 읽기] 알파벳 대소문자 구별",
      3: "[파닉스 - 심화] 단어 속 파닉스",
      4: "[알파벳 - 쓰기] 알파벳 쓰기 연습"
    };
    document.getElementById('level-title').textContent = titles[this.currentLevel] || "";

    // 원형 진행 바 채우기 (⚪ -> 🟢)
    const indicators = document.getElementById('success-indicators');
    indicators.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement('span');
      dot.textContent = i < this.successCount ? '🟢' : '⚪';
      indicators.appendChild(dot);
    }
  },

  // 최종 학습 종료
  completeGame() {
    TTSManager.stop();
    SoundEffect.fanfare();
    launchConfetti();

    // 결과 데이터 구조 작성
    const studentReport = {
      grade: this.student.grade,
      classGroup: this.student.classGroup,
      number: this.student.number,
      studentName: this.student.name,
      timestamp: isFirebaseActive ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
      level1Completed: true,
      level2Completed: true,
      level3Completed: true,
      level4Completed: true,
      incorrectAnswers: this.incorrectAnswers
    };

    // 데이터 저장
    saveStudentData(studentReport);

    // 화면 전환
    document.getElementById('play-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');

    // 학생 정보 세팅
    document.getElementById('result-student-info').textContent = `${this.student.grade}학년 ${this.student.classGroup}반 ${this.student.number}번 ${this.student.name} 학생`;

    // 오답 리스트 렌더링
    const tableBody = document.getElementById('incorrect-table-body');
    tableBody.innerHTML = '';

    if (this.incorrectAnswers.length === 0) {
      document.getElementById('perfect-card').classList.remove('hidden');
      document.getElementById('review-card').classList.add('hidden');
    } else {
      document.getElementById('perfect-card').classList.add('hidden');
      document.getElementById('review-card').classList.remove('hidden');
      
      this.incorrectAnswers.forEach((ans, idx) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-rose-100 hover:bg-rose-100/50 transition';
        row.innerHTML = `
          <td class="py-3 px-3 font-bold text-rose-800">${ans.levelName}</td>
          <td class="py-3 px-3 text-center text-rose-500 font-extrabold text-lg">${ans.selected}</td>
          <td class="py-3 px-3 text-center text-emerald-600 font-extrabold text-lg">${ans.target}</td>
          <td class="py-3 px-3 text-right">
            <button class="p-2 bg-rose-200 hover:bg-rose-300 text-rose-800 rounded-full transition shadow-sm" onclick="TTSManager.speak('${ans.speechText.replace(/'/g, "\\'")}')">
              🔊
            </button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }

    lucide.createIcons();
  }
};

// ==========================================
// 6. HTML5 Canvas 필기 그리기 제어 모듈
// ==========================================
const CanvasDrawing = {
  canvas: null,
  ctx: null,
  guideCanvas: null,
  guideCtx: null,
  isDrawing: false,
  lastX: 0,
  lastY: 0,
  currentTarget: '',

  init() {
    this.canvas = document.getElementById('writing-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.guideCanvas = document.getElementById('guide-canvas');
    this.guideCtx = this.guideCanvas.getContext('2d');

    // 이벤트 리스너 바인딩 (마우스)
    this.canvas.addEventListener('mousedown', (e) => this.start(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stop());
    this.canvas.addEventListener('mouseout', () => this.stop());

    // 이벤트 리스너 바인딩 (터치 패드)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.start(e);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.draw(e);
    });
    this.canvas.addEventListener('touchend', () => this.stop());
  },

  resize(targetLetter) {
    const dpr = window.devicePixelRatio || 1;
    
    // 1. 우측 그리기 캔버스 리사이즈
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    }
    
    // 2. 좌측 가이드 캔버스 리사이즈
    const guideRect = this.guideCanvas.getBoundingClientRect();
    if (guideRect.width > 0 && guideRect.height > 0) {
      this.guideCanvas.width = guideRect.width * dpr;
      this.guideCanvas.height = guideRect.height * dpr;
      this.guideCtx.setTransform(1, 0, 0, 1, 0, 0);
      this.guideCtx.scale(dpr, dpr);
    }
    
    this.clear(targetLetter);
  },

  clear(targetLetter) {
    // 두 캔버스 모두 비우기
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.guideCtx.clearRect(0, 0, this.guideCanvas.width, this.guideCanvas.height);
    
    // 두 캔버스 모두 4선 노트선 그리기
    this.drawNotebookLines(this.canvas, this.ctx);
    this.drawNotebookLines(this.guideCanvas, this.guideCtx);
    
    if (targetLetter) {
      this.currentTarget = targetLetter;
    }
    
    if (this.currentTarget) {
      this.drawGuideLetters(this.currentTarget);
    }
  },

  // 4선 가이드라인 그리기 (빨강, 파랑, 파랑, 빨강)
  drawNotebookLines(canvas, ctx) {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    
    const startY = height * 0.2; // 4선 시작 오프셋 (60px)
    const spacing = height * 0.2; // 4선 간격 (60px)

    const colors = ['#f87171', '#60a5fa', '#60a5fa', '#f87171']; // 빨강, 파랑, 파랑, 빨강
    const lineStyles = [false, true, false, false]; // 두번째 선만 파란색 점선 처리

    ctx.save();
    for (let i = 0; i < 4; i++) {
      const y = startY + (i * spacing);
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(width - 10, y);
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = i === 0 || i === 3 ? 2 : 1.5;

      if (lineStyles[i]) {
        ctx.setLineDash([6, 6]); // 파랑 점선
      } else {
        ctx.setLineDash([]);
      }
      
      ctx.stroke();
    }
    ctx.restore();
  },

  // 캔버스 가이드 글자 그리기
  drawGuideLetters(letter) {
    const upper = letter.toUpperCase();
    const lower = letter.toLowerCase();
    const fontName = "Fredoka, Outfit, sans-serif";
    
    // 1. 대문자 폰트 크기 계산 (ascent = 120px가 되도록)
    let trialUpperSize = 100;
    this.guideCtx.save();
    this.guideCtx.font = `bold ${trialUpperSize}px ${fontName}`;
    let upperMetrics = this.guideCtx.measureText(upper);
    let upperAscent = upperMetrics.actualBoundingBoxAscent;
    let upperFontSize = (upperAscent && upperAscent > 0) ? trialUpperSize * (120 / upperAscent) : 110;
    this.guideCtx.restore();
    
    // 2. 소문자 폰트 크기 계산 (x-height인 'x'의 ascent = 60px가 되도록)
    let trialLowerSize = 100;
    this.guideCtx.save();
    this.guideCtx.font = `bold ${trialLowerSize}px ${fontName}`;
    let xMetrics = this.guideCtx.measureText("x");
    let xAscent = xMetrics.actualBoundingBoxAscent;
    let lowerFontSize = (xAscent && xAscent > 0) ? trialLowerSize * (60 / xAscent) : 80;
    this.guideCtx.restore();

    // 좌측 가이드 캔버스 그리기 (선명한 보라색 가이드)
    this.guideCtx.save();
    this.guideCtx.textAlign = "center";
    this.guideCtx.textBaseline = "alphabetic";
    this.guideCtx.fillStyle = "#7c3aed"; // 진보라색
    
    // 대문자 (x=70, y=180 baseline)
    this.guideCtx.font = `bold ${upperFontSize}px ${fontName}`;
    this.guideCtx.fillText(upper, 70, 180);
    
    // 소문자 (x=170, y=180 baseline)
    this.guideCtx.font = `bold ${lowerFontSize}px ${fontName}`;
    this.guideCtx.fillText(lower, 170, 180);
    this.guideCtx.restore();
    
    // 우측 필기 캔버스 그리기 (연한 회색 따라 쓰기 가이드라인)
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "alphabetic";
    this.ctx.fillStyle = "#cbd5e1"; // 아주 연한 회색 실루엣
    
    // 대문자 따라쓰기 가이드 (x=120, y=180 baseline)
    this.ctx.font = `bold ${upperFontSize}px ${fontName}`;
    this.ctx.fillText(upper, 120, 180);
    
    // 소문자 따라쓰기 가이드 (x=280, y=180 baseline)
    this.ctx.font = `bold ${lowerFontSize}px ${fontName}`;
    this.ctx.fillText(lower, 280, 180);
    this.ctx.restore();
  },

  start(e) {
    this.isDrawing = true;
    const coords = this.getCoords(e);
    this.lastX = coords.x;
    this.lastY = coords.y;
  },

  draw(e) {
    if (!this.isDrawing) return;
    const coords = this.getCoords(e);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.strokeStyle = '#475569'; // 진회색 브러쉬
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();

    this.lastX = coords.x;
    this.lastY = coords.y;
  },

  stop() {
    this.isDrawing = false;
  },

  // 뷰포트 크기에 따른 마우스/터치 좌표 보정
  getCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * (this.canvas.width / rect.width) / dpr,
      y: (clientY - rect.top) * (this.canvas.height / rect.height) / dpr
    };
  }
};

// ==========================================
// 7. 교사용 데이터 핸들링 및 내보내기 모듈
// ==========================================

// 로컬 및 파이어베이스 데이터 통합 저장
function saveStudentData(data) {
  // 1. LocalStorage 저장
  const localList = JSON.parse(localStorage.getItem('student_records') || '[]');
  localList.push(data);
  localStorage.setItem('student_records', JSON.stringify(localList));

  // 2. Firestore 저장
  if (isFirebaseActive && db) {
    db.collection('student_records').add(data)
      .then(() => console.log("Firestore 저장 성공!"))
      .catch((err) => console.error("Firestore 저장 실패, 로컬에 저장됨:", err));
  }
}

// 교사용 테이블 데이터 패치
async function fetchTeacherData() {
  if (isFirebaseActive && db) {
    document.getElementById('db-mode-badge').textContent = "Firestore 실시간 연결됨 🟢";
    document.getElementById('db-mode-badge').className = "text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded";
    
    try {
      const snapshot = await db.collection('student_records').orderBy('timestamp', 'desc').get();
      return snapshot.docs.map(doc => {
        const item = doc.data();
        let formattedDate = '미기록';
        if (item.timestamp) {
          const d = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
          formattedDate = d.toLocaleString('ko-KR');
        }
        return { ...item, dateStr: formattedDate };
      });
    } catch (e) {
      console.error("Firestore 로딩 에러, 로컬 백업을 불러옵니다:", e);
    }
  }

  // 로컬 저장소 모드 상태 뱃지 전환
  document.getElementById('db-mode-badge').textContent = "로컬 브라우저 저장소 모드 🟡";
  document.getElementById('db-mode-badge').className = "text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded";

  const localList = JSON.parse(localStorage.getItem('student_records') || '[]');
  // 내림차순(최신순) 정렬
  localList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return localList.map(item => ({
    ...item,
    dateStr: item.timestamp ? new Date(item.timestamp).toLocaleString('ko-KR') : '미기록'
  }));
}

// 엑셀(CSV) 포맷 컨버터 및 파일 자동 다운로드
function downloadCSV(records) {
  const headers = ['학년', '반', '번호', '이름', '학습 일시', '레벨1', '레벨2', '레벨3', '레벨4', '오답 정보'];
  const csvRows = [headers.join(',')];

  records.forEach(row => {
    // 오답 정리 (A(선택:B); C(선택:E) 형태)
    const incorrectStr = row.incorrectAnswers && row.incorrectAnswers.length > 0
      ? row.incorrectAnswers.map(ans => `${ans.target}(선택:${ans.selected})`).join('; ')
      : '없음';

    const rowData = [
      `"${row.grade || ''}"`,
      `"${row.classGroup || ''}"`,
      `"${row.number || ''}"`,
      `"${row.studentName || ''}"`,
      `"${row.dateStr || ''}"`,
      `"${row.level1Completed ? '성공' : '미완료'}"`,
      `"${row.level2Completed ? '성공' : '미완료'}"`,
      `"${row.level3Completed ? '성공' : '미완료'}"`,
      `"${row.level4Completed ? '성공' : '미완료'}"`,
      `"${incorrectStr.replace(/"/g, '""')}"`
    ];
    csvRows.push(rowData.join(','));
  });

  // UTF-8 BOM 접두사 추가하여 엑셀에서 한글 인코딩이 정상 작동하도록 보장
  const csvString = "\uFEFF" + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const dateTag = new Date().toISOString().slice(0, 10);
  link.setAttribute("download", `알파벳_복습결과_리포트_${dateTag}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 교사용 테이블 빌드
async function buildTeacherTable() {
  const tableBody = document.getElementById('student-table-body');
  const noDataMsg = document.getElementById('no-data-msg');
  tableBody.innerHTML = '';

  const records = await fetchTeacherData();

  if (records.length === 0) {
    noDataMsg.classList.remove('hidden');
    return;
  }
  noDataMsg.classList.add('hidden');

  records.forEach(row => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-100 transition';

    const incorrectCells = row.incorrectAnswers && row.incorrectAnswers.length > 0
      ? row.incorrectAnswers.map(ans => `<span class="inline-block px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-xs mr-1 mb-1">${ans.target}(선택:${ans.selected})</span>`).join('')
      : '<span class="text-emerald-600 font-bold">오답 없음 💯</span>';

    tr.innerHTML = `
      <td class="py-3 px-4 font-bold">${row.grade}학년</td>
      <td class="py-3 px-4">${row.classGroup}반</td>
      <td class="py-3 px-4">${row.number}번</td>
      <td class="py-3 px-4 font-semibold text-slate-800">${row.studentName}</td>
      <td class="py-3 px-4 text-xs text-slate-400 font-mono">${row.dateStr}</td>
      <td class="py-3 px-4 text-center font-bold ${row.level1Completed ? 'text-green-500' : 'text-slate-300'}">${row.level1Completed ? '🟢' : '⚪'}</td>
      <td class="py-3 px-4 text-center font-bold ${row.level2Completed ? 'text-green-500' : 'text-slate-300'}">${row.level2Completed ? '🟢' : '⚪'}</td>
      <td class="py-3 px-4 text-center font-bold ${row.level3Completed ? 'text-green-500' : 'text-slate-300'}">${row.level3Completed ? '🟢' : '⚪'}</td>
      <td class="py-3 px-4 text-center font-bold ${row.level4Completed ? 'text-green-500' : 'text-slate-300'}">${row.level4Completed ? '🟢' : '⚪'}</td>
      <td class="py-3 px-4 max-w-xs overflow-x-auto custom-scrollbar">${incorrectCells}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// ==========================================
// 8. 꽃가루 & 파티클 애니메이션 도우미
// ==========================================
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#ec4899'];
  for (let i = 0; i < 70; i++) {
    const particle = document.createElement('div');
    particle.className = 'confetti';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDuration = Math.random() * 1.5 + 1.5 + 's';
    particle.style.width = Math.random() * 12 + 6 + 'px';
    particle.style.height = particle.style.width;
    // 둥글거나 네모난 다양한 꽃가루 구성
    if (Math.random() < 0.5) particle.style.borderRadius = '50%';
    particle.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 3000);
  }
}

// 정답을 눌렀을 때 버튼 주변에서 작은 폭죽처럼 터지는 연출
function createClickExplosion(element) {
  const rect = element.getBoundingClientRect();
  const container = document.getElementById('confetti-container');
  const colors = ['#4ade80', '#22c55e', '#a7f3d0', '#fef08a'];

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'absolute pointer-events-none rounded-full z-[9999]';
    particle.style.width = Math.random() * 8 + 4 + 'px';
    particle.style.height = particle.style.width;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // 폭발 물리 연출 계산
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 60 + 30;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity;

    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    container.appendChild(particle);

    particle.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 }
    ], {
      duration: 600,
      easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
    });

    setTimeout(() => particle.remove(), 600);
  }
}

// ==========================================
// 9. 브라우저 이벤트 바인딩 및 흐름 초기화
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  TTSManager.init();
  CanvasDrawing.init();
  lucide.createIcons();

  // 시작 버튼 전송
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const grade = document.getElementById('student-grade').value;
    const classGroup = document.getElementById('student-class').value;
    const number = document.getElementById('student-number').value;
    const name = document.getElementById('student-name').value;
    
    // Web Audio API 오디오 컨텍스트 락 획득
    SoundEffect.init();
    
    Game.start(grade, classGroup, number, name);
  });

  // TTS 오디오 다시 재생 버튼 클릭 시
  document.getElementById('btn-replay').addEventListener('click', () => {
    if (Game.currentLevel !== 2 && Game.currentQuestion && Game.currentQuestion.speechText) {
      TTSManager.speakDouble(Game.currentQuestion.speechText);
    }
  });

  // Level 5 드로잉 제어
  document.getElementById('btn-canvas-clear').addEventListener('click', () => {
    CanvasDrawing.clear();
  });

  document.getElementById('btn-canvas-done').addEventListener('click', () => {
    Game.submitWriting();
  });

  // 오답노트에서 재시작 버튼 클릭 시
  document.getElementById('btn-restart').addEventListener('click', () => {
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('login-form').reset();
  });

  // 교사 모달 열기 트리거
  document.getElementById('teacher-trigger').addEventListener('click', () => {
    const modal = document.getElementById('teacher-modal');
    modal.classList.remove('hidden');
    document.getElementById('teacher-auth-card').classList.remove('hidden');
    document.getElementById('teacher-dashboard-card').classList.add('hidden');
    document.getElementById('teacher-password').value = '';
    document.getElementById('auth-error-msg').classList.add('hidden');
    document.getElementById('teacher-password').focus();
  });

  // 교사 비밀번호 인증 취소
  document.getElementById('btn-auth-cancel').addEventListener('click', () => {
    document.getElementById('teacher-modal').classList.add('hidden');
  });

  // 교사 비밀번호 인증 확인
  const confirmAuth = () => {
    const pwd = document.getElementById('teacher-password').value;
    const errorMsg = document.getElementById('auth-error-msg');
    
    if (pwd === '0951') {
      document.getElementById('teacher-auth-card').classList.add('hidden');
      document.getElementById('teacher-dashboard-card').classList.remove('hidden');
      buildTeacherTable();
    } else {
      errorMsg.classList.remove('hidden');
      document.getElementById('teacher-auth-card').classList.add('animate-incorrect');
      setTimeout(() => {
        document.getElementById('teacher-auth-card').classList.remove('animate-incorrect');
      }, 500);
    }
  };

  document.getElementById('btn-auth-confirm').addEventListener('click', confirmAuth);
  document.getElementById('teacher-password').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') confirmAuth();
  });

  // 교사 대시보드 닫기
  document.getElementById('btn-dashboard-close').addEventListener('click', () => {
    document.getElementById('teacher-modal').classList.add('hidden');
  });

  // 교사 대시보드 CSV 다운로드
  document.getElementById('btn-csv-download').addEventListener('click', async () => {
    const records = await fetchTeacherData();
    if (records.length > 0) {
      downloadCSV(records);
    } else {
      alert("다운로드할 학습 데이터가 아직 없습니다!");
    }
  });
});
