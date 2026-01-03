/**
 * Testing Module - Інтерактивний тест на рівень англійської
 * Містить логіку для 3 етапів тестування: вибір слів (2 етапи) + тест на часи
 */

// Конфігурація (без SDK)
const defaultConfig = {
  game_title: 'Тест на рівень англійської',
  correct_text: 'Правильно! 🎉',
  wrong_text: 'Неправильно! 😔',
};

const config = { ...defaultConfig };

// State
let currentStage = 1;
let currentQuestion = 0;
let stageScore = 0;
let totalScore = 0;
let answered = false;
let selectedWords1 = new Set();
let selectedWords2 = new Set();
let stageScores = [0, 0, 0];

// Stage 1: First Word Set (20 words)
const stage1Words = [
  { word: "cat", level: "A1" },
  { word: "dog", level: "A1" },
  { word: "house", level: "A1" },
  { word: "water", level: "A1" },
  { word: "book", level: "A1" },
  { word: "beautiful", level: "A2" },
  { word: "yesterday", level: "A2" },
  { word: "breakfast", level: "A2" },
  { word: "expensive", level: "A2" },
  { word: "remember", level: "A2" },
  { word: "achieve", level: "B1" },
  { word: "environment", level: "B1" },
  { word: "opportunity", level: "B1" },
  { word: "confident", level: "B1" },
  { word: "responsibility", level: "B1" },
  { word: "persuade", level: "B2" },
  { word: "consequences", level: "B2" },
  { word: "negotiate", level: "B2" },
  { word: "tremendous", level: "B2" },
  { word: "acknowledge", level: "B2" }
];

// Stage 2: Second Word Set (20 different words)
const stage2Words = [
  { word: "sun", level: "A1" },
  { word: "tree", level: "A1" },
  { word: "food", level: "A1" },
  { word: "friend", level: "A1" },
  { word: "happy", level: "A1" },
  { word: "weather", level: "A2" },
  { word: "holiday", level: "A2" },
  { word: "different", level: "A2" },
  { word: "important", level: "A2" },
  { word: "understand", level: "A2" },
  { word: "experience", level: "B1" },
  { word: "decision", level: "B1" },
  { word: "improve", level: "B1" },
  { word: "knowledge", level: "B1" },
  { word: "successful", level: "B1" },
  { word: "reluctant", level: "B2" },
  { word: "ambitious", level: "B2" },
  { word: "inevitable", level: "B2" },
  { word: "comprehensive", level: "B2" },
  { word: "distinguish", level: "B2" }
];

// Stage 3: Tenses (4 questions)
const tensesQuestions = [
  {
    question: "She _____ to the gym every morning.",
    explanation: "Present Simple — регулярні дії та звички",
    correct: 0,
    options: [
      { text: "goes", tense: "Present Simple", emoji: "🏃‍♀️", desc: "Щоденна звичка" },
      { text: "is going", tense: "Present Continuous", emoji: "🚶‍♀️", desc: "Прямо зараз" },
      { text: "has gone", tense: "Present Perfect", emoji: "✅", desc: "Вже сходила" }
    ]
  },
  {
    question: "Look! The children _____ in the park.",
    explanation: "Present Continuous — дія в момент мовлення",
    correct: 1,
    options: [
      { text: "play", tense: "Present Simple", emoji: "⚽", desc: "Грають щодня" },
      { text: "are playing", tense: "Present Continuous", emoji: "🎮", desc: "Граються зараз" },
      { text: "played", tense: "Past Simple", emoji: "🕐", desc: "Грали вчора" }
    ]
  },
  {
    question: "I _____ this movie three times already.",
    explanation: "Present Perfect — досвід до теперішнього моменту",
    correct: 2,
    options: [
      { text: "watch", tense: "Present Simple", emoji: "📺", desc: "Дивлюсь регулярно" },
      { text: "watched", tense: "Past Simple", emoji: "🎬", desc: "Подивився колись" },
      { text: "have watched", tense: "Present Perfect", emoji: "🔄", desc: "Вже переглянув" }
    ]
  },
  {
    question: "Yesterday, we _____ a delicious dinner.",
    explanation: "Past Simple — завершена дія в минулому",
    correct: 0,
    options: [
      { text: "had", tense: "Past Simple", emoji: "🍽️", desc: "Вечеряли вчора" },
      { text: "have had", tense: "Present Perfect", emoji: "✨", desc: "Вже вечеряли" },
      { text: "were having", tense: "Past Continuous", emoji: "🍴", desc: "Вечеряли в процесі" }
    ]
  }
];

const stageNames = ['', 'Перший блок слів', 'Другий блок слів', 'Англійські часи'];
const stageEmojis = ['', '🤚', '✋', '⏰'];

/**
 * Оновлення загального прогресу
 */
function updateOverallProgress() {
  const totalQuestions = 44; // 20 + 20 + 4

  let questionsCompleted = 0;
  if (currentStage === 1) {
    questionsCompleted = 0;
  } else if (currentStage === 2) {
    questionsCompleted = 20;
  } else if (currentStage === 3) {
    questionsCompleted = 40 + currentQuestion;
  }

  const progressBar = document.getElementById('overallProgress');
  const stageLabel = document.getElementById('stageLabel');
  const stageInfo = document.getElementById('stageInfo');
  const totalScoreEl = document.getElementById('totalScore');

  if (progressBar) {
    progressBar.style.width = `${(questionsCompleted / totalQuestions) * 100}%`;
  }
  if (stageLabel) {
    stageLabel.textContent = `Етап ${currentStage} з 3`;
  }
  if (stageInfo) {
    stageInfo.textContent = `${stageEmojis[currentStage]} ${stageNames[currentStage]}`;
  }
  if (totalScoreEl) {
    totalScoreEl.textContent = totalScore;
  }
}

/**
 * Ініціалізація етапу 1 - вибір слів (перший блок)
 */
function initStage1() {
  const grid = document.getElementById('wordsGrid1');
  if (!grid) return;

  grid.innerHTML = stage1Words.map((item) => `
    <div class="word-chip"
         data-word="${item.word}"
         data-level="${item.level}"
         data-stage="1"
         tabindex="0"
         role="button"
         aria-pressed="false">
      ${item.word}
    </div>
  `).join('');

  const selectedCount = document.getElementById('selectedCount1');
  if (selectedCount) {
    selectedCount.textContent = '0';
  }
  updateOverallProgress();
}

/**
 * Перемикання вибору слова в етапі 1
 */
function toggleWord1(el) {
  if (!el) return;

  const word = el.dataset.word;
  if (selectedWords1.has(word)) {
    selectedWords1.delete(word);
    el.classList.remove('selected');
    el.setAttribute('aria-pressed', 'false');
  } else {
    selectedWords1.add(word);
    el.classList.add('selected');
    el.setAttribute('aria-pressed', 'true');
  }

  const selectedCount = document.getElementById('selectedCount1');
  if (selectedCount) {
    selectedCount.textContent = selectedWords1.size;
  }
}

/**
 * Обробка клавіатури для слова в етапі 1
 */
function handleWord1Keydown(event, el) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleWord1(el);
  }
}

/**
 * Підтвердження етапу 1
 */
function submitStage1() {
  stageScores[0] = selectedWords1.size;
  totalScore += selectedWords1.size;
  goToStage(2);
}

/**
 * Пропуск етапу 1
 */
function skipStage1() {
  stageScores[0] = 0;
  goToStage(2);
}

/**
 * Ініціалізація етапу 2 - вибір слів (другий блок)
 */
function initStage2() {
  const grid = document.getElementById('wordsGrid2');
  if (!grid) return;

  grid.innerHTML = stage2Words.map((item) => `
    <div class="word-chip"
         data-word="${item.word}"
         data-level="${item.level}"
         data-stage="2"
         tabindex="0"
         role="button"
         aria-pressed="false">
      ${item.word}
    </div>
  `).join('');

  const selectedCount = document.getElementById('selectedCount2');
  if (selectedCount) {
    selectedCount.textContent = '0';
  }
  updateOverallProgress();
}

/**
 * Перемикання вибору слова в етапі 2
 */
function toggleWord2(el) {
  if (!el) return;

  const word = el.dataset.word;
  if (selectedWords2.has(word)) {
    selectedWords2.delete(word);
    el.classList.remove('selected');
    el.setAttribute('aria-pressed', 'false');
  } else {
    selectedWords2.add(word);
    el.classList.add('selected');
    el.setAttribute('aria-pressed', 'true');
  }

  const selectedCount = document.getElementById('selectedCount2');
  if (selectedCount) {
    selectedCount.textContent = selectedWords2.size;
  }
}

/**
 * Обробка клавіатури для слова в етапі 2
 */
function handleWord2Keydown(event, el) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleWord2(el);
  }
}

/**
 * Підтвердження етапу 2
 */
function submitStage2() {
  stageScores[1] = selectedWords2.size;
  totalScore += selectedWords2.size;
  goToStage(3);
}

/**
 * Пропуск етапу 2
 */
function skipStage2() {
  stageScores[1] = 0;
  goToStage(3);
}

/**
 * Навігація між етапами
 */
function goToStage(stage) {
  currentStage = stage;
  currentQuestion = 0;
  stageScore = 0;
  answered = false;

  // Приховати всі етапи
  const stage1 = document.getElementById('stage1');
  const stage2 = document.getElementById('stage2');
  const quizStage = document.getElementById('quizStage');
  const resultsScreen = document.getElementById('resultsScreen');

  if (stage1) stage1.classList.add('testing-hidden');
  if (stage2) stage2.classList.add('testing-hidden');
  if (quizStage) quizStage.classList.add('testing-hidden');
  if (resultsScreen) resultsScreen.classList.add('testing-hidden');

  if (stage === 1) {
    if (stage1) stage1.classList.remove('testing-hidden');
    initStage1();
  } else if (stage === 2) {
    if (stage2) stage2.classList.remove('testing-hidden');
    initStage2();
  } else if (stage === 3) {
    if (quizStage) quizStage.classList.remove('testing-hidden');
    const stageScoreEl = document.getElementById('stageScore');
    if (stageScoreEl) {
      stageScoreEl.textContent = '0';
    }
    updateOverallProgress();
    renderQuestion();
  } else {
    showFinalResults();
  }
}

/**
 * Відображення питання тесту на часи
 */
function renderQuestion() {
  const q = tensesQuestions[currentQuestion];
  if (!q) return;

  answered = false;

  const currentQEl = document.getElementById('currentQ');
  const totalQEl = document.getElementById('totalQ');
  const stageProgressEl = document.getElementById('stageProgress');
  const feedbackEl = document.getElementById('feedback');
  const skipAreaEl = document.getElementById('skipArea');
  const questionTextEl = document.getElementById('questionText');
  const answersGridEl = document.getElementById('answersGrid');

  if (currentQEl) {
    currentQEl.textContent = currentQuestion + 1;
  }
  if (totalQEl) {
    totalQEl.textContent = tensesQuestions.length;
  }
  if (stageProgressEl) {
    stageProgressEl.style.width = `${(currentQuestion / tensesQuestions.length) * 100}%`;
  }
  if (feedbackEl) {
    feedbackEl.classList.add('testing-hidden');
  }
  if (skipAreaEl) {
    skipAreaEl.classList.remove('testing-hidden');
  }

  updateOverallProgress();

  if (questionTextEl) {
    questionTextEl.textContent = q.question;
  }

  if (answersGridEl) {
    answersGridEl.innerHTML = q.options.map((opt, i) => `
      <div class="card-option"
           data-index="${i}"
           data-action="answer-tense"
           tabindex="0"
           role="button"
           aria-label="Варіант ${i + 1}: ${opt.text}">
        <div class="emoji-icon">${opt.emoji}</div>
        <p class="card-option__text">${opt.text}</p>
        <p class="card-option__tense">${opt.tense}</p>
        <p class="card-option__desc">${opt.desc}</p>
      </div>
    `).join('');

    // Анімація появи карток
    const cards = answersGridEl.querySelectorAll('.card-option');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.animationDelay = `${i * 0.1}s`;
      card.classList.add('slide-in');
    });
  }
}

/**
 * Обробка відповіді на питання про часи
 */
function handleTenseAnswer(index) {
  if (answered) return;
  answered = true;

  const q = tensesQuestions[currentQuestion];
  if (!q) return;

  const isCorrect = index === q.correct;
  const cards = document.querySelectorAll('.card-option');
  const skipAreaEl = document.getElementById('skipArea');

  if (skipAreaEl) {
    skipAreaEl.classList.add('testing-hidden');
  }

  if (isCorrect) {
    stageScore++;
    totalScore++;
    const stageScoreEl = document.getElementById('stageScore');
    const totalScoreEl = document.getElementById('totalScore');
    if (stageScoreEl) {
      stageScoreEl.textContent = stageScore;
    }
    if (totalScoreEl) {
      totalScoreEl.textContent = totalScore;
    }
    if (cards[index]) {
      cards[index].classList.add('card-correct');
      cards[index].style.borderColor = '#22c55e';
      cards[index].style.background = 'linear-gradient(135deg, #dcfce7, #bbf7d0)';
    }
  } else {
    if (cards[index]) {
      cards[index].classList.add('card-wrong');
      cards[index].style.borderColor = '#ef4444';
      cards[index].style.background = 'linear-gradient(135deg, #fee2e2, #fecaca)';
    }
    if (cards[q.correct]) {
      cards[q.correct].style.borderColor = '#22c55e';
      cards[q.correct].style.background = 'linear-gradient(135deg, #dcfce7, #bbf7d0)';
    }
  }

  showFeedback(isCorrect, q.explanation);
}

/**
 * Пропуск питання
 */
function skipQuestion() {
  answered = true;
  const skipAreaEl = document.getElementById('skipArea');
  if (skipAreaEl) {
    skipAreaEl.classList.add('testing-hidden');
  }

  const q = tensesQuestions[currentQuestion];
  if (!q) return;

  const cards = document.querySelectorAll('.card-option');
  if (cards[q.correct]) {
    cards[q.correct].style.borderColor = '#22c55e';
    cards[q.correct].style.background = 'linear-gradient(135deg, #dcfce7, #bbf7d0)';
  }
  showFeedback(false, q.explanation);
}

/**
 * Показ фідбеку після відповіді
 */
function showFeedback(isCorrect, explanation) {
  const feedbackEl = document.getElementById('feedback');
  const feedbackTextEl = document.getElementById('feedbackText');
  const feedbackExplanationEl = document.getElementById('feedbackExplanation');

  if (!feedbackEl) return;

  if (feedbackTextEl) {
    feedbackTextEl.textContent = isCorrect ? config.correct_text : 'Пропущено ⏭️';
  }
  if (feedbackExplanationEl) {
    feedbackExplanationEl.textContent = explanation;
  }

  feedbackEl.classList.remove('testing-hidden');
  feedbackEl.classList.add('fade-in');
}

/**
 * Перехід до наступного питання
 */
function nextQuestion() {
  currentQuestion++;

  if (currentQuestion >= tensesQuestions.length) {
    stageScores[2] = stageScore;
    goToStage(4);
  } else {
    renderQuestion();
  }
}

/**
 * Показ фінальних результатів
 */
function showFinalResults() {
  const quizStage = document.getElementById('quizStage');
  const resultsScreen = document.getElementById('resultsScreen');
  const overallProgress = document.getElementById('overallProgress');

  if (quizStage) quizStage.classList.add('testing-hidden');
  if (resultsScreen) resultsScreen.classList.remove('testing-hidden');
  if (overallProgress) overallProgress.style.width = '100%';

  const maxScore = 44; // 20 + 20 + 4
  const percent = (totalScore / maxScore) * 100;

  let level, desc, emoji;
  if (percent >= 90) {
    emoji = '🏆';
    level = 'Advanced (C1)';
    desc = 'Чудово! Ти маєш просунутий рівень англійської. Словниковий запас багатий, граматика на високому рівні!';
  } else if (percent >= 75) {
    emoji = '🥈';
    level = 'Upper-Intermediate (B2)';
    desc = 'Дуже добре! Ти впевнено володієш англійською на рівні вище середнього.';
  } else if (percent >= 60) {
    emoji = '🥉';
    level = 'Intermediate (B1)';
    desc = 'Непогано! Ти маєш середній рівень. Продовжуй вдосконалюватись!';
  } else if (percent >= 40) {
    emoji = '📚';
    level = 'Pre-Intermediate (A2)';
    desc = 'Є базові знання! Рекомендую більше практики зі словником та граматикою.';
  } else {
    emoji = '🌱';
    level = 'Beginner (A1)';
    desc = 'Початковий рівень. Час активно вивчати англійську! Почни з базових слів та простих часів.';
  }

  const resultEmoji = document.getElementById('resultEmoji');
  const resultScore = document.getElementById('resultScore');
  const resultLevel = document.getElementById('resultLevel');
  const levelDescription = document.getElementById('levelDescription');
  const res1 = document.getElementById('res1');
  const res2 = document.getElementById('res2');
  const res3 = document.getElementById('res3');

  if (resultEmoji) resultEmoji.textContent = emoji;
  if (resultScore) resultScore.textContent = `${totalScore}/${maxScore}`;
  if (resultLevel) resultLevel.textContent = level;
  if (levelDescription) levelDescription.textContent = desc;
  if (res1) res1.textContent = `${stageScores[0]}/20`;
  if (res2) res2.textContent = `${stageScores[1]}/20`;
  if (res3) res3.textContent = `${stageScores[2]}/4`;
}

/**
 * Перезапуск тесту
 */
function restartAll() {
  currentStage = 1;
  currentQuestion = 0;
  stageScore = 0;
  totalScore = 0;
  answered = false;
  selectedWords1 = new Set();
  selectedWords2 = new Set();
  stageScores = [0, 0, 0];

  const resultsScreen = document.getElementById('resultsScreen');
  const stage1 = document.getElementById('stage1');

  if (resultsScreen) resultsScreen.classList.add('testing-hidden');
  if (stage1) stage1.classList.remove('testing-hidden');

  initStage1();
}

/**
 * Ініціалізація event listeners для кнопок та event delegation для динамічних елементів
 */
function initEventListeners() {
  const app = document.getElementById('app');
  if (!app) return;

  // Event delegation для кнопок з data-action
  app.addEventListener('click', function(e) {
    const button = e.target.closest('[data-action]');
    if (!button) return;

    const action = button.getAttribute('data-action');

    switch (action) {
      case 'skip-stage1':
        skipStage1();
        break;
      case 'submit-stage1':
        submitStage1();
        break;
      case 'skip-stage2':
        skipStage2();
        break;
      case 'submit-stage2':
        submitStage2();
        break;
      case 'skip-question':
        skipQuestion();
        break;
      case 'next-question':
        nextQuestion();
        break;
      case 'restart-all':
        restartAll();
        break;
      case 'answer-tense': {
        const index = parseInt(button.getAttribute('data-index'), 10);
        if (!isNaN(index)) {
          handleTenseAnswer(index);
        }
        break;
      }
    }
  });

  // Event delegation для word chips
  app.addEventListener('click', function(e) {
    const chip = e.target.closest('.word-chip');
    if (!chip) return;

    const stage = chip.getAttribute('data-stage');
    if (stage === '1') {
      toggleWord1(chip);
    } else if (stage === '2') {
      toggleWord2(chip);
    }
  });

  // Event delegation для keyboard navigation на word chips
  app.addEventListener('keydown', function(e) {
    const chip = e.target.closest('.word-chip');
    if (!chip) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const stage = chip.getAttribute('data-stage');
      if (stage === '1') {
        toggleWord1(chip);
      } else if (stage === '2') {
        toggleWord2(chip);
      }
    }
  });
}

// Експорт функцій для глобального доступу
window.testingModule = {
  toggleWord1,
  toggleWord2,
  handleWord1Keydown,
  handleWord2Keydown,
  submitStage1,
  submitStage2,
  skipStage1,
  skipStage2,
  handleTenseAnswer,
  skipQuestion,
  nextQuestion,
  restartAll,
  init: function() {
    // Ініціалізація event listeners
    initEventListeners();

    // Ініціалізація при завантаженні сторінки
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initStage1();
      });
    } else {
      initStage1();
    }
  }
};

// Автоматична ініціалізація
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.testingModule.init();
  });
} else {
  window.testingModule.init();
}

