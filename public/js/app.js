const tabs   = document.querySelectorAll('#tabs li');
const quizDlg = document.getElementById('quiz');      // dialog now
const questionEl = document.getElementById('question');
const choicesEl  = document.getElementById('choices');
const resultDlg  = document.getElementById('result');
let questions = [], idx = 0, score = 0;

tabs.forEach(tab => tab.onclick = async () => {
  const cat = tab.dataset.cat;
  questions = await fetch(`/api/questions?category=${cat}&limit=10`).then(r => r.json());

  if (!questions || questions.length === 0) {
    alert(`No questions available for category: ${cat}`);
    return;
  }

  idx = score = 0;
  showQuestion();
  quizDlg.showModal();  // ✅ Show the quiz in popup
});

function showQuestion() {
  const q = questions[idx];

  // ✅ If no more questions, close quiz and show result
  if (!q) {
    quizDlg.close(); // close quiz popup
    resultDlg.showModal(); // open result
    document.getElementById('score').textContent = `${score}/${questions.length}`;
    return;
  }
  questionEl.textContent = q.body;
  choicesEl.innerHTML = '';

  ['a','b','c','d'].forEach(letter => {
    const li = document.createElement('li');
    li.textContent = q['choice_' + letter];

    li.onclick = () => {
      const sound = document.getElementById('clickSound');
      if (sound) {
        sound.currentTime = 0;
        sound.play();
      }

      document.querySelectorAll('#choices li').forEach(item => item.onclick = null);

      const isCorrect = (letter.toUpperCase() === q.correct.toUpperCase());

      if (isCorrect) {
        li.innerHTML += ' ✅';
        li.classList.add('correct');
        score++;
      } else {
        li.innerHTML += ' ❌';
        li.classList.add('wrong');

        document.querySelectorAll('#choices li').forEach(otherLi => {
          if (otherLi.textContent.trim() === q['choice_' + q.correct.toLowerCase()]) {
            otherLi.innerHTML += ' ✅';
            otherLi.classList.add('correct');
          }
        });
      }

      setTimeout(() => {
        idx++;
        showQuestion();
      }, 1000);
    };

    choicesEl.append(li);
  });
} 

// ✅ Quit closes quiz and opens score popup
document.getElementById('quit').onclick = () => {
  quizDlg.close();       // close quiz dialog
  resultDlg.showModal(); // open result dialog
  document.getElementById('score').textContent = `${score}/${questions.length}`;
};

document.getElementById('home').onclick = () => {
  resultDlg.close();
};

const facts = [
  "Octopuses have three hearts!",
  "Bananas are berries, but strawberries are not!",
  "A group of flamingos is called a 'flamboyance'.",
  "Sharks existed before trees!",
  "There are more stars in the universe than grains of sand on Earth."
];
document.getElementById('factBox').textContent = facts[Math.floor(Math.random() * facts.length)];

const quotes = [
  "You can do anything if you try!",
  "Every expert was once a beginner.",
  "Mistakes are proof that you are learning.",
  "Be curious. Be brave. Be kind.",
  "The more you learn, the more fun it becomes!"
];
document.getElementById('factBox').textContent = quotes[Math.floor(Math.random() * quotes.length)];

const showQuotes = Math.random() < 0.5;
const content = showQuotes ? quotes : facts;
document.getElementById('factBox').textContent = content[Math.floor(Math.random() * content.length)];
