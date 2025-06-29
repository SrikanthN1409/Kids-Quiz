document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('slateDialog');
  const canvas = document.getElementById('slateCanvas');
  const ctx = canvas.getContext('2d');
  const prompt = document.getElementById('letterPrompt');
  const letterImg = document.getElementById('letterImage');
  const referenceImage = document.getElementById('referenceImage');
  const hintIcon = document.getElementById('hintIcon');
  const hintImageContainer = document.getElementById('hintImageContainer');
  const drawingResult = document.getElementById('drawingResult');
  const speakBtn = document.getElementById('speakLetterBtn');
  const clearBtn = document.getElementById('clearDrawing');
  const checkBtn = document.getElementById('checkDrawing');
  const closeBtn = document.getElementById('closeSlateContent');
  const prevBtn = document.getElementById('prevLetterBtn');
  const nextBtn = document.getElementById('nextLetterBtn');
  const progressText = document.getElementById('progressStatus');
  const progressBar = document.getElementById('progressBar');
  const progressDisplay = document.getElementById('progressDisplay');
  const langButtons = document.querySelectorAll('.lang-btn');
  const languageScreen = document.getElementById('languageSelect');
  const slateContent = document.getElementById('slateContent');
  const voice = document.getElementById('voiceInstruction');
  const startPracticeBtn = document.getElementById('startPractice');
  const closeDialogBtn = document.getElementById('closeSlate');

  const alphabetSets = {
    english: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    hindi: ['अ','आ','इ','ई','उ','ऊ','ऋ','ए','ऐ','ओ','औ','अं','अः'],
    telugu: ['అ','ఆ','ఇ','ఈ','ఉ','ఊ','ఎ','ఏ','ఐ','ఒ','ఓ','ఔ','అం','అః']
  };

  let lang = 'english';
  let letters = [];
  let index = 0;
  let drawing = false;

  const progressKey = 'letterProgress';

  function loadProgress() {
    const saved = localStorage.getItem(progressKey);
    return saved ? JSON.parse(saved) : {};
  }

  function saveProgress(progress) {
    localStorage.setItem(progressKey, JSON.stringify(progress));
  }

  function updateProgressBar() {
    const progress = loadProgress();
    const done = letters.filter(l => progress[`${lang}_${l}`]);
    const percent = Math.round((done.length / letters.length) * 100);
    progressText.textContent = `Progress: ${percent}%`;
    progressBar.value = percent;
    progressDisplay.innerHTML = `✅ Completed: ${done.length}/${letters.length}`;
  }

  function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();

  if (lang === 'hindi') {
    utter.lang = 'hi-IN';
  } else if (lang === 'telugu') {
    utter.lang = 'te-IN';
  } else {
    utter.lang = 'en-US';
  }

  // Try to find a matching voice
  const voice = voices.find(v => v.lang === utter.lang);

  if (voice) {
    utter.voice = voice;
    speechSynthesis.speak(utter);
  } else if (lang === 'telugu') {
    // 🗣️ Fallback to audio file if Telugu voice is missing
    const audio = new Audio(`/audio/telugu/${text}.mp3`);
    audio.play().catch(err => console.warn('⚠️ Telugu audio fallback failed:', err));
  } else {
    // Fallback to default
    speechSynthesis.speak(utter);
  }
}


  function showLetter() {
    const letter = letters[index];
    prompt.textContent = `Draw the letter: ${letter}`;
    speak(letter);

    // Letter drawing image
    letterImg.src = `/images/${lang}/${letter}.png`;
    letterImg.onerror = () => {
      letterImg.src = '/images/fallback.png';
    };

    // Static reference image per language
    referenceImage.src = `/images/${lang}/Aref.png`;

    drawingResult.textContent = '';
    drawingResult.className = 'feedback-box';

    updateProgressBar();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function validateDrawing() {
    Tesseract.recognize(canvas, lang === 'hindi' ? 'hin' : lang === 'telugu' ? 'tel' : 'eng', {
      tessedit_char_whitelist: letters.join(''),
      langPath: '/tessdata'
    }).then(result => {
      const text = result.data.text.replace(/\s/g, '');
      const best = text[0] || 'nothing';
      const confidence = result.data.confidence.toFixed(2);
      const expected = letters[index];
      const correct = best === expected;

      drawingResult.textContent = correct
        ? `✅ Good job! You wrote "${best}" with (${confidence}% confidence).`
        : `❌ You wrote "${best}", try "${expected}". Try with ${100-confidence}% Confidence.`;

      drawingResult.style.color = correct ? 'green' : 'red';
      new Audio(correct ? '/sounds/correct.mp3' : '/sounds/wrong.mp3').play();

      if (correct) {
        const progress = loadProgress();
        progress[`${lang}_${expected}`] = true;
        saveProgress(progress);
        updateProgressBar();
      }
    }).catch(err => {
      drawingResult.textContent = '❌ Error recognizing text.';
      drawingResult.style.color = 'red';
      console.error(err);
    });
  }

  function setupDrawing() {
    let lastX = 0, lastY = 0;
    const draw = (x, y) => {
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      [lastX, lastY] = [x, y];
    };

    canvas.addEventListener('mousedown', e => {
      drawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    });
    canvas.addEventListener('mousemove', e => {
      if (!drawing) return;
      draw(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseleave', () => drawing = false);

    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      drawing = true;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      [lastX, lastY] = [touch.clientX - rect.left, touch.clientY - rect.top];
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
      if (!drawing) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      draw(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    canvas.addEventListener('touchend', () => drawing = false);
  }

  setupDrawing();

  // Event handlers
  checkBtn.onclick = validateDrawing;

  clearBtn.onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingResult.textContent = '';
  };

  closeBtn.onclick = () => {
    slateContent.hidden = true;
    languageScreen.hidden = false;
  };

  speakBtn.onclick = () => speak(letters[index]);

  prevBtn.onclick = () => {
    if (index > 0) {
      index--;
      showLetter();
    }
  };

  nextBtn.onclick = () => {
    if (index < letters.length - 1) {
      index++;
      showLetter();
    }
  };

  hintIcon.addEventListener('mouseenter', () => {
    hintImageContainer.style.display = 'block';
  });
  hintIcon.addEventListener('mouseleave', () => {
    hintImageContainer.style.display = 'none';
  });

  langButtons.forEach(btn => {
    btn.onclick = () => {
      lang = btn.dataset.lang;
      letters = alphabetSets[lang];
      index = 0;
      languageScreen.hidden = true;
      slateContent.hidden = false;
      showLetter();
    };
  });

  document.getElementById('startPractice').onclick = () => {
    dialog.showModal();
    languageScreen.hidden = false;
    slateContent.hidden = true;
  };

  closeDialogBtn.onclick = () => {
    dialog.close();
  };
});

