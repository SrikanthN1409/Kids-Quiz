const tabs   = document.querySelectorAll('#tabs li');
const quiz   = document.getElementById('quiz');
const questionEl = document.getElementById('question');
const choicesEl  = document.getElementById('choices');
const resultDlg  = document.getElementById('result');
let questions = [], idx = 0, score = 0;

tabs.forEach(tab => tab.onclick = async () => {
  const cat = tab.dataset.cat;
  questions = await fetch(`/api/questions?category=${cat}&limit=10`).then(r=>r.json());
  idx = score = 0;
  showQuestion();
  quiz.hidden = false;
});

function showQuestion() {
  const q = questions[idx];
  if (!q) return quit();
  questionEl.textContent = q.body;
  choicesEl.innerHTML = '';

  ['a','b','c','d'].forEach(letter => {
    const li = document.createElement('li');
    li.textContent = q['choice_'+letter];
   li.onclick = () => {
  if (letter.toUpperCase() === q.correct.toUpperCase()) score++;
  idx++;
  showQuestion();
};

    choicesEl.append(li);
  });
}


document.getElementById('quit').onclick = quit;
function quit() {
  resultDlg.showModal();
  document.getElementById('score').textContent = `${score}/${questions.length}`;
}

document.getElementById('home').onclick = () => {
  resultDlg.close();
  quiz.hidden = true;
};
