const slatePopup = document.getElementById('slateDialog');
const languageSelect = document.getElementById('languageSelect');
const slateContent = document.getElementById('slateContent');
const canvas = document.getElementById('slateCanvas');
const ctx = canvas.getContext('2d');

const checkBtn = document.getElementById('checkDrawing');
const clearBtn = document.getElementById('clearDrawing');
const closeLangBtn = document.getElementById('closeSlate');
const closeSlateBtn = document.getElementById('closeSlateContent');
const resultText = document.getElementById('drawingResult');
const voiceAudio = document.getElementById('voiceInstruction');
const nextBtn = document.getElementById('nextLetterBtn');
const prevBtn = document.getElementById('prevLetterBtn');
const playAudioBtn = document.getElementById('speakLetterBtn');
const progressBar = document.getElementById('progressBar');
const progressStatus = document.getElementById('progressStatus');
const letterPrompt = document.getElementById('letterPrompt');

let drawing = false;
let selectedLanguage = '';
let currentIndex = 0;
let progressMap = {};

const lettersByLang = {
  english: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  hindi: ['अ','आ','इ','ई','उ','ऊ','ऋ','ए','ऐ','ओ','औ','अं','अः'],
  telugu: [...'అఆఇఈఉఊఋఎఏఐఒఓఔఅంఅః']
};
const tesseractLangCodes = {
  english: 'eng',
  hindi: 'hin',
  telugu: 'tel'
};

// === Setup Canvas ===
function setupCanvas() {
  canvas.width = 512;
  canvas.height = 512;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 25;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'black';
}
function bindCanvasEvents() {
  canvas.onmousedown = e => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  };
  canvas.onmousemove = e => {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  };
  canvas.onmouseup = () => drawing = false;
  canvas.onmouseleave = () => drawing = false;
}
function clearCanvas() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
clearBtn.onclick = clearCanvas;

// === Drawing Bounds Helper ===
function getDrawingBounds(imageData) {
  const { data, width, height } = imageData;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 10) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

// === Speech Hint ===
function speakLetter(text, langCode) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.8;
  utter.pitch = 1;
  utter.volume = 1;
  if (langCode === 'hindi') utter.lang = 'hi-IN';
  else if (langCode === 'telugu') utter.lang = 'te-IN';
  else utter.lang = 'en-US';
}
playAudioBtn.onclick = () => speakLetter(getExpectedLetter(), selectedLanguage);

// === OCR Validation ===
checkBtn.onclick = () => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(canvas, 0, 0);
  const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
  const { minX, minY, maxX, maxY } = getDrawingBounds(imageData);

  if ((maxX - minX) <= 0 || (maxY - minY) <= 0) {
    resultText.textContent = "⚠️ Please draw something.";
    return;
  }

  const offsetX = (canvas.width - (maxX - minX)) / 2 - minX;
  const offsetY = (canvas.height - (maxY - minY)) / 2 - minY;

  const centeredCanvas = document.createElement('canvas');
  centeredCanvas.width = canvas.width;
  centeredCanvas.height = canvas.height;
  const centeredCtx = centeredCanvas.getContext('2d');
  centeredCtx.fillStyle = 'white';
  centeredCtx.fillRect(0, 0, canvas.width, canvas.height);
  centeredCtx.drawImage(canvas, minX, minY, maxX - minX, maxY - minY, offsetX, offsetY, maxX - minX, maxY - minY);

  centeredCanvas.toBlob(async (blob) => {
    try {
      const { data } = await Tesseract.recognize(blob, tesseractLangCodes[selectedLanguage], {
        langPath: '/tessdata',
       logger: () => {}

      });
      const raw = data.text || '';
      const cleaned = raw.replace(/\s/g, '').trim();
      const expected = getExpectedLetter();
      const confidence = data.confidence?.toFixed(2);
      const normalizedCleaned = cleaned.normalize('NFC');
      const normalizedExpected = expected.normalize('NFC');

      const correct = normalizedCleaned.includes(normalizedExpected);

      resultText.textContent = correct
        ? `✅ Correct! Confidence: ${confidence}%`
        : `❌ You wrote "${cleaned || 'nothing'}", try "${expected}". Try with ${confidence}% Confidence.`;

      new Audio(correct ? '/sounds/correct.mp3' : '/sounds/wrong.mp3').play();

      if (correct) {
        progressMap[expected] = true;
        saveProgress();
        updateProgressUI();
      }
    } catch (err) {
      console.error("OCR Error:", err);
      resultText.textContent = "⚠️ Couldn’t recognize the letter. Try again.";
    }
  });
};

// === Navigation ===
nextBtn.onclick = () => {
  if (currentIndex < lettersByLang[selectedLanguage].length - 1) {
    currentIndex++;
    setupSlateContent();
  } else {
    alert("🎉 You’ve completed all letters!");
  }
};
prevBtn.onclick = () => {
  if (currentIndex > 0) {
    currentIndex--;
    setupSlateContent();
  }
};

// === Helper Functions ===
function getExpectedLetter() {
  return lettersByLang[selectedLanguage][currentIndex];
}
function saveProgress() {
  localStorage.setItem("letterProgress", JSON.stringify(progressMap));
}
function loadProgress() {
  const stored = localStorage.getItem("letterProgress");
  progressMap = stored ? JSON.parse(stored) : {};
}
function updateProgressUI() {
  const total = lettersByLang[selectedLanguage].length;
  const completed = lettersByLang[selectedLanguage].filter(letter => progressMap[letter]).length;
  progressBar.max = total;
  progressBar.value = completed;
  progressStatus.textContent = `Progress: ${Math.round((completed / total) * 100)}%`;

  const current = getExpectedLetter();
  letterPrompt.textContent = `Draw the letter: ${current}` + (progressMap[current] ? " ✅" : "");
}

// === Setup Content ===
function setupSlateContent() {
  setupCanvas();
  bindCanvasEvents();

  const letter = getExpectedLetter();
  document.getElementById('letterImage').src = `/images/${selectedLanguage}/${letter}.png`;
  document.getElementById('letterImage').onerror = () => {
    document.getElementById('letterImage').src = '/images/fallback.png';
  };

  speakLetter(letter, selectedLanguage);
  updateProgressUI();
  resultText.textContent = '';
}

// === Open Slate Dialog ===
document.getElementById('startPractice').onclick = () => {
  slatePopup.showModal();
  languageSelect.hidden = false;
  slateContent.hidden = true;
  resultText.textContent = '';
  currentIndex = 0;
  loadProgress();
};

// === Language Selection ===
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.onclick = () => {
    selectedLanguage = btn.dataset.lang;
    languageSelect.hidden = true;
    slateContent.hidden = false;
    currentIndex = 0;
    setupSlateContent();
  };
});

// === Close Buttons ===
closeLangBtn.onclick = closeSlateBtn.onclick = () => {
  slatePopup.close();
  clearCanvas();
  resultText.textContent = '';
  slateContent.hidden = true;
  languageSelect.hidden = false;
};
