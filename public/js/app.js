const tabs   = document.querySelectorAll('#tabs li');
const quizDlg = document.getElementById('quiz');
const questionEl = document.getElementById('question');
const choicesEl  = document.getElementById('choices');
const resultDlg  = document.getElementById('result');
const startSound = new Audio('/sounds/start.mp3');
let questions = [], idx = 0, score = 0;

// ✅ When user selects a category
tabs.forEach(tab => tab.onclick = async () => {
  startSound.currentTime = 0;
  startSound.play();

  const cat = tab.dataset.cat;
  questions = await fetch(`/api/questions?category=${cat}`)
    .then(r => r.json());

  if (!questions || questions.length === 0) {
    alert(`No questions available for category: ${cat}`);
    return;
  }

  idx = score = 0;
  showQuestion();
  quizDlg.showModal();
});

// ✅ Show one question at a time
function showQuestion() {
  const q = questions[idx];
  if (!q) return quit();

  const createdAt = new Date(q.created_at);
  const isNew = (Date.now() - createdAt.getTime()) < (24 * 60 * 60 * 1000);

  questionEl.innerHTML = q.body + (isNew ? ' <span class="new-badge">🆕 New Today!</span>' : '');

  choicesEl.innerHTML = '';
  ['a','b','c','d'].forEach(letter => {
    const li = document.createElement('li');
    li.textContent = q['choice_' + letter];

    li.onclick = () => {
      const correctLetter = q.correct.toLowerCase();

      const audio = new Audio(
        letter.toUpperCase() === q.correct.toUpperCase()
          ? '/sounds/correct.mp3'
          : '/sounds/wrong.mp3'
      );
      audio.play();

      if (letter.toUpperCase() === q.correct.toUpperCase()) {
        score++;
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 } });
      }

      Array.from(choicesEl.children).forEach((liOption, i) => {
        const optLetter = ['a', 'b', 'c', 'd'][i];
        liOption.style.pointerEvents = 'none';

        if (optLetter === correctLetter) {
          liOption.innerHTML += ' ✅';
          liOption.style.backgroundColor = '#d4fcd4';
        } else if (liOption === li) {
          liOption.innerHTML += ' ❌';
          liOption.style.backgroundColor = '#ffd4d4';
        }
      });

      setTimeout(() => {
        idx++;
        if (idx >= questions.length) {
          quizDlg.close();
          const finish = new Audio('/sounds/success.mp3');
          finish.play();
          resultDlg.showModal();
          document.getElementById('score').textContent = `${score}/${questions.length}`;
        } else {
          showQuestion();
        }
      }, 1000);
    };

    choicesEl.append(li);
  });
}

// ✅ Quit button
document.getElementById('quit').onclick = () => {
  quizDlg.close();
  const finish = new Audio('/sounds/success.mp3');
  finish.play();
  resultDlg.showModal();
  document.getElementById('score').textContent = `${score}/${questions.length}`;
};

// ✅ Home button
document.getElementById('home').onclick = () => {
  resultDlg.close();
};

// ✅ Fun facts and quotes
const facts = [
  "Octopuses have three hearts!",
  "Bananas are berries, but strawberries are not!",
  "A group of flamingos is called a 'flamboyance'.",
  "Sharks existed before trees!",
  "There are more stars in the universe than grains of sand on Earth."
];

const quotes = [
  "You can do anything if you try!",
  "Every expert was once a beginner.",
  "Mistakes are proof that you are learning.",
  "Be curious. Be brave. Be kind.",
  "The more you learn, the more fun it becomes!"
];

const randomFact = facts[Math.floor(Math.random() * facts.length)];
const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
document.getElementById('factBox').innerHTML = `<li>🌟 Fun Fact: ${randomFact}</li><li>💡 Quote: ${randomQuote}</li>`;
