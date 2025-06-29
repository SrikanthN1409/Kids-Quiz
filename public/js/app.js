document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('#tabs li');
  const quizDlg = document.getElementById('quiz');
  const questionEl = document.getElementById('question');
  const choicesEl = document.getElementById('choices');
  const resultDlg = document.getElementById('result');
  const startBtn = document.getElementById('startPractice');
  const slateDialog = document.getElementById('slateDialog');
  const scoreEl = document.getElementById('score');

  let questions = [], idx = 0, score = 0;

  const playSound = (src) => {
    try {
      new Audio(src).play().catch(() => {});
    } catch (e) {}
  };

  tabs.forEach(tab => {
    tab.onclick = async () => {
      playSound('/sounds/start.mp3');
      const cat = tab.dataset.cat;
      try {
        const res = await fetch(`/api/questions?category=${cat}`);
        if (!res.ok) throw new Error("Failed to fetch questions");
        questions = await res.json();
      } catch (err) {
        console.error(err);
        alert("❌ Could not load questions. Try again later.");
        return;
      }

      if (!questions || questions.length === 0) {
        alert(`No questions available for category: ${cat}`);
        return;
      }

      idx = score = 0;
      showQuestion();
      quizDlg.showModal();
    };
  });

  function showQuestion() {
    const q = questions[idx];
    if (!q) return quit();

    const createdAt = new Date(q.created_at);
    const isNew = (Date.now() - createdAt.getTime()) < (24 * 60 * 60 * 1000);
    questionEl.innerHTML = q.body + (isNew ? ' <span class="new-badge">🆕 New Today!</span>' : '');

    choicesEl.innerHTML = '';
    ['a', 'b', 'c', 'd'].forEach(letter => {
      const li = document.createElement('li');
      li.textContent = q['choice_' + letter];

      li.onclick = () => {
        const correctLetter = q.correct.toLowerCase();
        const isCorrect = letter.toLowerCase() === correctLetter;

        playSound(isCorrect ? '/sounds/correct.mp3' : '/sounds/wrong.mp3');

        Array.from(choicesEl.children).forEach((option, i) => {
          const optLetter = ['a', 'b', 'c', 'd'][i];
          option.style.pointerEvents = 'none';
          if (optLetter === correctLetter) {
            option.innerHTML += ' ✅';
            option.style.backgroundColor = '#d4fcd4';
          } else if (option === li) {
            option.innerHTML += ' ❌';
            option.style.backgroundColor = '#ffd4d4';
          }
        });

        if (isCorrect) {
          score++;
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 } });
          document.body.classList.add('popup-celebrate');
          setTimeout(() => document.body.classList.remove('popup-celebrate'), 800);
        }

        setTimeout(() => {
          idx++;
          if (idx >= questions.length) {
            quizDlg.close();
            playSound('/sounds/success.mp3');
            resultDlg.showModal();
            scoreEl.textContent = `${score}/${questions.length}`;
          } else {
            showQuestion();
          }
        }, 1000);
      };

      choicesEl.appendChild(li);
    });
  }

  const quit = () => {
    quizDlg.close();
    playSound('/sounds/success.mp3');
    resultDlg.showModal();
    if (scoreEl) scoreEl.textContent = `${score}/${questions.length}`;
  };

  document.getElementById('quit').onclick = quit;
  document.getElementById('home').onclick = () => resultDlg.close();

  if (startBtn && slateDialog) {
    startBtn.onclick = () => {
      slateDialog.showModal();
    };
  }

  const factBox = document.getElementById('factBox');
  if (factBox) {
    const facts = [
      "Octopuses have three hearts!",
      "Bananas are berries, but strawberries are not!",
      "Sharks existed before trees!",
      "Flamingos are naturally white but turn pink from food!",
      "Honey never spoils — it lasts forever!",
      "Shrimp's hearts are in their heads!",
      "A group of flamingos is called a 'flamboyance'!",
      "Cows have best friends and get stressed when separated!",
      "A snail can sleep for three years!",
      "A jiffy is an actual unit of time: 1/100th of a second!",
      "Butterflies taste with their feet!",
      "A group of owls is called a 'parliament'!",
      "Koalas have fingerprints almost identical to humans!",
      "A blue whale's heart is as big as a small car!",
      "Sloths can hold their breath longer than dolphins!",
      "The Eiffel Tower can be 15 cm taller during summer!",
      "A group of jellyfish is called a 'smack'!",
      "A day on Mercury lasts 59 Earth days!",
      "Cheetahs can't roar, but they can purr!",
      "A group of frogs is called an 'army'!",
      "A group of crows is called a 'murder'."


    ];
    const quotes = [
      "You can do anything if you try!",
      "Every expert was once a beginner.",
      "Mistakes are proof that you are learning.",
      "Be curious. Be brave. Be kind.",
      "The more you learn, the more fun it becomes!",
      "Believe in yourself and all that you are.",
      "You are capable of amazing things.",
      "Your only limit is your mind.",
      "Dream big and dare to fail.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "Success is not the key to happiness. Happiness is the key to success.",
      "Keep going. Your hardest times often lead to the greatest moments of your life.",
      "Believe you can and you're halfway there.",
      "Don't watch the clock; do what it does. Keep going.",
      "The only way to do great work is to love what you do.",
      "The best time to plant a tree was 20 years ago. The second best time is now.",
      "You are never too old to set another goal or to dream a new dream.",
      "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
      "The only limit to our realization of tomorrow will be our doubts of today.", 
      "Act as if what you do makes a difference. It does.",
      "Success usually comes to those who are too busy to be looking for it.",
      "The only way to achieve the impossible is to believe it is possible.",
      "You are braver than you believe, stronger than you seem, and smarter than you think.",
      "The future belongs to those who prepare for it today.",
      "Your life is your story, and the adventure ahead of you is the journey to fulfill your own purpose and potential.",
      "The best way to predict the future is to create it."
    ];
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    factBox.innerHTML = `<li>💡 Fun Fact: ${randomFact}</li><li>💡 Quote: ${randomQuote}</li>`;
  }
});

window.addEventListener('load', () => {
  console.log("✅ Page fully loaded");
});
