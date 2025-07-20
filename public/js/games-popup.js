document.addEventListener('DOMContentLoaded', () => {
  // === Global Variables ===
  let solutionGrid = [];
  let currentSudokuLevel = 'easy';
  let currentSudokuTimer = null;
let sudokuTimerInterval;
let sudokuSeconds = 0;
let flipTimerInterval;
let flipSeconds = 0;
const flipTimer = document.getElementById('flipTimer'); // You’ll need to add this element in HTML

  // === DOM References ===
  const sudokuOpenBtn = document.getElementById('openSudokuBtn');
  const sudokuPopup = document.getElementById('sudokuPopup');
  const sudokuCloseBtn = document.getElementById('closeSudokuPopupBtn');
  const sudokuContainer = document.getElementById('sudokuGameContainer');
  const sudokuTimer = document.getElementById('sudokuTimer');
  const resetBtn = document.getElementById('resetSudokuBtn');

  const flipOpenBtn = document.getElementById('openFlipCardBtn');
  const flipPopup = document.getElementById('flipCardPopup');
  const flipCloseBtn = document.getElementById('closeFlipCardsPopupBtn');
  const flipContainer = document.getElementById('flipCardsGameContainer');

  // === Sudoku Popup Logic ===

  sudokuOpenBtn.addEventListener('click', () => {
    sudokuPopup.style.display = 'block';
    generateSudoku(currentSudokuLevel);
  });

  sudokuCloseBtn.addEventListener('click', () => {
    sudokuPopup.style.display = 'none';
    sudokuContainer.textContent = '';
    clearInterval(currentSudokuTimer);
    sudokuTimer.textContent = '';
  });

  document.querySelectorAll('.sudoku-level').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSudokuLevel = btn.dataset.level;
      generateSudoku(currentSudokuLevel);
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      generateSudoku(currentSudokuLevel);
    });
  }

function generateSudoku(level) {
  sudokuContainer.textContent = '';
  clearInterval(currentSudokuTimer);
  clearInterval(sudokuTimerInterval);
  sudokuSeconds = 0;
  sudokuTimer.textContent = `⏱️ Time: 0s`;

  sudokuTimerInterval = setInterval(() => {
    sudokuSeconds++;
    sudokuTimer.textContent = `⏱️ Time: ${sudokuSeconds}s`;
  }, 1000);

  const { puzzle, solution } = generateDynamicSudoku(level);
  solutionGrid = solution;

  const table = document.createElement('table');
  table.classList.add('table', 'table-bordered', 'text-center', 'mx-auto');
  table.style.maxWidth = '400px';

  for (let r = 0; r < 4; r++) {
    const row = document.createElement('tr');
    for (let c = 0; c < 4; c++) {
      const cell = document.createElement('td');
      if (puzzle[r][c] === 0) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 1;
        input.max = 4;
        input.className = 'form-control text-center';
        input.dataset.row = r;
        input.dataset.col = c;

        input.addEventListener('input', () => {
          if (input.value < 1 || input.value > 4) input.value = '';
          validateSudoku();
        });

        cell.appendChild(input);
      } else {
        cell.textContent = puzzle[r][c];
        cell.style.backgroundColor = '#eee';
      }
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  sudokuContainer.appendChild(table);
}


  function generateDynamicSudoku(level) {
    const fullGrid = [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [4, 1, 2, 3],
      [2, 3, 4, 1]
    ];

    const cloneGrid = JSON.parse(JSON.stringify(fullGrid));
    let blanks = level === 'medium' ? 6 : level === 'hard' ? 8 : 4;

    let removed = 0;
    while (removed < blanks) {
      const r = Math.floor(Math.random() * 4);
      const c = Math.floor(Math.random() * 4);
      if (cloneGrid[r][c] !== 0) {
        cloneGrid[r][c] = 0;
        removed++;
      }
    }

    return { puzzle: cloneGrid, solution: fullGrid };
  }

function validateSudoku() {
  const inputs = sudokuContainer.querySelectorAll('input');
  let correct = true;
  let allFilled = true;

  inputs.forEach(input => {
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);
    const val = parseInt(input.value);

    if (!val) {
      allFilled = false;
      input.classList.remove('is-valid', 'is-invalid');
      return;
    }

    if (val !== solutionGrid[row][col]) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      correct = false;
    } else {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    }
  });

if (allFilled && correct) {
  inputs.forEach(input => input.disabled = true);
  clearInterval(sudokuTimerInterval);

  const msg = document.getElementById("successMessage");
  if (msg) {
    msg.style.display = "block";
    msg.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
      msg.style.display = "none";
    }, 3000);
  }
  showMessage("🎉 Great job! Puzzle solved!");
  confetti();
}

}

  function showMessage(message, type = 'success') {
    Swal.fire({
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 2000
    });
  }

  // === Flip Card Popup Logic ===
  flipOpenBtn.addEventListener('click', () => {
    flipPopup.style.display = 'block';
    generateFlipCards('easy');
  });

  flipCloseBtn.addEventListener('click', () => {
    flipPopup.style.display = 'none';
    flipContainer.textContent = '';
  });

  document.querySelectorAll('.flip-level').forEach(btn => {
    btn.addEventListener('click', () => {
      const level = btn.dataset.level;
      generateFlipCards(level);
    });
  });

  function generateFlipCards(level) {
    flipContainer.textContent = '';
   const emojis = ['🍇','🍌', '🍉','🍍', '🥝', '🍒'];
    let cards = [...emojis, ...emojis];
    cards.sort(() => 0.5 - Math.random());
flipSeconds = 0;
clearInterval(flipTimerInterval);

flipTimer.textContent = `⏱️ Time: 0s`;
flipTimerInterval = setInterval(() => {
  flipSeconds++;
  flipTimer.textContent = `⏱️ Time: ${flipSeconds}s`;
}, 1000);

    const gameBoard = document.createElement('div');
    gameBoard.className = 'flip-cards-container';

    let firstCard = null;
    let lock = false;

    cards.forEach((emoji, index) => {
      const card = document.createElement('div');
      card.className = 'card m-2 p-3 text-center';
      card.style.width = '60px';
      card.style.height = '60px';
      card.style.fontSize = '30px';
      card.style.backgroundColor = '#ccc';
      card.style.cursor = 'pointer';
      card.dataset.emoji = emoji;
      card.textContent = '';

      card.addEventListener('click', () => {
        if (lock || card.textContent !== '') return;
        card.textContent = emoji;

        if (!firstCard) {
          firstCard = card;
        } else {
          lock = true;
          if (firstCard.dataset.emoji === card.dataset.emoji) {
            firstCard = null;
            lock = false;
              // Check if all cards are matched
  const allRevealed = [...gameBoard.children].every(c => c.textContent !== '');
  if (allRevealed) {
    clearInterval(flipTimerInterval);
    showMessage(`🎉 You matched all pairs in ${flipSeconds} seconds!`);
    confetti(); // Optional celebration
  }

          } else {
            setTimeout(() => {
              firstCard.textContent = '';
              card.textContent = '';
              firstCard = null;
              lock = false;
            }, 800);
          }
        }
      });

      gameBoard.appendChild(card);
    });

    flipContainer.appendChild(gameBoard);
  }
});
