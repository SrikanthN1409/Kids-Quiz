document.addEventListener('DOMContentLoaded', () => {
  
  // Image error handling (moved from HTML)
  const img = document.getElementById('letterImage');
  if (img) {
    img.onerror = () => {
      console.warn("⚠️ Image failed to load");
      img.alt = "⚠️ Image not found";
      img.src = "/images/fallback.png";
    };
  }

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
    // Hindi
    hindi: ['अ','आ','इ','ई','उ','ऊ','ऋ','ए','ऐ','ओ','औ','अं','अः','क','ख','ग','घ','ङ',
  'च','छ','ज','झ','ञ','ट','ठ','ड','ढ','ण','त','थ','द','ध','न','प','फ','ब','भ','म',
  'य','र','ल','व','श','ष','स','ह','क्ष','त्र','ज्ञ'],
  // Kannada
    kannada: ['ಅ','ಆ','ಇ','ಈ','ಉ','ಊ','ಋ','ಎ','ಏ','ಐ','ಒ','ಓ','ಔ','ಅಂ','ಅಃ','ಕ','ಖ','ಗ','ಘ','ಙ',
  'ಚ','ಛ','ಜ','ಝ','ಞ','ಟ','ಠ','ಡ','ಢ','ಣ','ತ','ಥ','ದ','ಧ','ನ','ಪ','ಫ','ಬ','ಭ','ಮ',
  'ಯ','ರ','ಲ','ವ','ಶ','ಷ','ಸ','ಹ','ಳ','ಕ್ಷ','ಜ್ಞ'],
  // Tamil
    tamil: ['அ','ஆ','இ','ஈ','உ','ஊ','எ','ஏ','ஐ','ஒ','ஓ','ஔ','அம்','அஃ','க','ங','ச','ஞ','ட','ண','த','ந','ப','ம',
  'ய','ர','ல','வ','ழ','ள','ற','ன'],
  // malayalam
    malayalam: ['അ','ആ','ഇ','ഈ','ഉ','ഊ','ഋ','എ','ഏ','ഐ','ഒ','ഓ','ഔ','അം','അഃ','ക','ഖ','ഗ','ഘ','ങ',
  'ച','ഛ','ജ','ഝ','ഞ','ട','ഠ','ഡ','ഢ','ണ', 'ത','ഥ','ദ','ധ','ന','പ','ഫ','ബ','ഭ','മ',
  'യ','ര','ല','വ','ശ','ഷ','സ','ഹ','ള','ഴ','റ'],

    oriya: ['ଅ','ଆ','ଇ','ଈ','ଉ','ଊ','ଋ','ଏ','ଐ','ଓ','ଔ','ଅଂ','ଅଃ','କ','ଖ','ଗ','ଘ','ଙ','ଚ','ଛ','ଜ','ଝ','ଞ',
  'ଟ','ଠ','ଡ','ଢ','ଣ','ତ','ଥ','ଦ','ଧ','ନ','ପ','ଫ','ବ','ଭ','ମ','ଯ','ର','ଲ','ଳ','ଵ','ଶ','ଷ','ସ','ହ','କ୍ଷ','ଞ୍ଚ','ଞ୍ଜ'],
  // Bengali
    bengali: ['অ','আ','ই','ঈ','উ','ঊ','ঋ','এ','ঐ','ও','ঔ','অং','অঃ','ক','খ','গ','ঘ','ঙ',
  'চ','ছ','জ','ঝ','ঞ','ট','ঠ','ড','ঢ','ণ','ত','থ','দ','ধ','ন','প','ফ','ব','ভ','ম',
  'য','র','ল','শ','ষ','স','হ','ড়','ঢ়','য়','ক্ষ','জ্ঞ'],

    // punjabi: ['ਅ','ਆ','ਇ','ਈ','ਉ','ਊ','ਏ','ਐ','ਓ','ਔ','ਅੰ','ਅঃ'],

    // Gujarati
    gujarati: ['અ','આ','ઇ','ઈ','ઉ','ઊ','એ','ઐ','ઓ','ઔ','અં','અઃ','ક','ખ','ગ','ઘ','ઙ',
  'ચ','છ','જ','ઝ','ઞ','ટ','ઠ','ડ','ઢ','ણ','ત','થ','દ','ધ','ન','પ','ફ','બ','ભ','મ',
  'ય','ર','લ','વ','શ','ષ','સ','હ','ળ','ક્ષ','જ્ઞ'],
  // Assamese
    assamese: ['অ','আ','ই','ঈ','উ','ঊ','এ','ঐ','ও','ঔ','অং','অঃ','ক','খ','গ','ঘ','ঙ',
  'চ','ছ','জ','ঝ','ঞ','ট','ঠ','ড','ঢ','ণ','ত','থ','দ','ধ','ন','প','ফ','ব','ভ','ম',
  'য','ৰ','ল','ৱ','শ','ষ','স','হ','ক্ষ','জ্ঞ'],

    // maithili: ['अ','आ','इ','ई','उ','ऊ','ए','ऐ','ओ','औ','अं','अः'],
    // santali: ['ᱟ','ᱠ','ᱤ','ᱡ','ᱚ','ᱜ','ᱚ','ᱪ','ᱷ','ᱰ','ᱱ','ᱥ','ᱚ','ᱱ'],
    // urdu: ['ا','آ','ب','پ','ت','ٹ','ث','ج','چ','ح','خ','د','ذ','ر','ز','ژ','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ک','گ','ل','م','ن','و'],
    // Telegu
    telugu: ['అ','ఆ','ఇ','ఈ','ఉ','ఊ','ఎ','ఏ','ఐ','ఒ','ఓ','ఔ','అం','అః','క','ఖ','గ','ఘ','ఙ',
  'చ','ఛ','జ','ఝ','ఞ','ట','ఠ','డ','ఢ','ణ','త','థ','ద','ధ','న','ప','ఫ','బ','భ','మ','య',
  'ర','ల','వ','శ','ష','స','హ','ళ','క్ష','ఱ']
  };

  let tracingActive = false;
  let hasShownTrace = false;
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
    utter.lang = 'hin-IN';
  } else if (lang === 'telugu') {
    utter.lang = 'tel-IN';
  } else if (lang === 'english') {
    utter.lang = 'eg-US';
  } else if (lang === 'kannada') {
    utter.lang = 'kan-IN';
  } else if (lang === 'tamil') {
    utter.lang = 'tam-IN';
  } else if (lang === 'gujarati') {
    utter.lang = 'guj-IN';
  } else if (lang === 'assamese') {
    utter.lang = 'asm-IN';
  } else if (lang === 'bengali') {
    utter.lang = 'ben-IN';
  } else if (lang === 'malayalam') {
    utter.lang = 'mal-IN';
  } else {
    utter.lang = 'ori-IN';
  } 

  // Try to find a matching voice

  const voice = voices.find(v => v.lang === utter.lang);

  if (voice) {
    utter.voice = voice;
    speechSynthesis.speak(utter);
 } else if (['telugu', 'hindi', 'gujarati', 'assamese','kannada','tamil','malayalam'].includes(lang)) {
  const audio = new Audio(`/audio/${lang}/${text}.mp3`);
  audio.play().catch(err => console.warn(`⚠️ ${lang} audio fallback failed:`, err));
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

     hasShownTrace = false;
tracingActive = false;

    updateProgressBar();
    canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

 function validateDrawing() {
  const tesseractLang = {
    hindi: 'hin',
    telugu: 'tel',
    kannada: 'kan',
    tamil: 'tam',
    malayalam: 'mal',
    oriya: 'or',
    bengali: 'ben',
    gujarati: 'guj',
    assamese: 'asm',
    english: 'eng'
  }[lang] || 'eng';

  Tesseract.recognize(canvas, tesseractLang, {
    tessedit_char_whitelist: letters.join(''),
    langPath: '/tessdata'
  }).then(result => {
    const text = result.data.text.replace(/\s/g, '');
    const best = text[0] || 'nothing';
    const confidence = result.data.confidence.toFixed(2);
    const expected = letters[index];
    const correct = best === expected;

    if (correct) {
      if (typeof confetti === 'function') confetti();
      drawingResult.textContent = `✅ Good job! You wrote "${expected}" with ${confidence}% confidence.`;
      drawingResult.style.color = 'green';
      new Audio('/sounds/correct.mp3').play();

      const progress = loadProgress();
      progress[`${lang}_${expected}`] = true;
      saveProgress(progress);
      updateProgressBar();

      hasShownTrace = false;
      tracingActive = false;
    } else {
      if (!hasShownTrace) {
  showTracingOverlay(expected);
  drawingResult.textContent = `✍️ Try tracing the faded letter above. We'll auto-check in a moment...`;
  drawingResult.style.color = 'orange';
  hasShownTrace = true;
  tracingActive = true;

  // Auto-check again in 3 seconds
  setTimeout(() => {
    validateDrawing();
  }, 15000);
} else {
         drawingResult.textContent = `You tried "${expected}" But with ${confidence}% confidence.`;
      drawingResult.style.color = 'green';
      new Audio('/sounds/correct.mp3').play();

      const progress = loadProgress();
      progress[`${lang}_${expected}`] = true;
      saveProgress(progress);
      updateProgressBar();
      hasShownTrace = false;
      tracingActive = false;
      }
      new Audio('/sounds/wrong.mp3').play();
    }
  }).catch(err => {
    drawingResult.textContent = '❌ Error recognizing text.';
    drawingResult.style.color = 'red';
    console.error(err);
  });
}
function showTracingOverlay(letter) {
  const traceImg = new Image();
  traceImg.src = `/images/${lang}/${letter}.png`;

  traceImg.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 20;
    const imgW = canvas.width - 2 * padding;
    const imgH = canvas.height - 2 * padding;
    const x = padding;
    const y = padding;

    // Draw image to an offscreen canvas first
    const offscreen = document.createElement('canvas');
    offscreen.width = imgW;
    offscreen.height = imgH;
    const offCtx = offscreen.getContext('2d');
    offCtx.drawImage(traceImg, 0, 0, imgW, imgH);

    const imageData = offCtx.getImageData(0, 0, imgW, imgH);
    const pixels = imageData.data;

    let step = 0;
    const total = imgW * imgH;

    function drawAnimatedTrace() {
      const batch = 200; // How many pixels to draw per frame
      for (let i = 0; i < batch && step < total; i++, step++) {
        const px = step * 4;
        const r = pixels[px], g = pixels[px + 1], b = pixels[px + 2], a = pixels[px + 3];
        if (a > 128) {
          const col = `rgba(${r},${g},${b},0.1)`; // faded pixel
          const xPos = step % imgW;
          const yPos = Math.floor(step / imgW);
          ctx.fillStyle = col;
          ctx.fillRect(x + xPos, y + yPos, 1, 1);
        }
      }

      if (step < total) {
        requestAnimationFrame(drawAnimatedTrace);
      } else {
        tracingActive = true;
        drawingResult.textContent = '🔁 Try tracing this letter over the canvas. We’ll auto-check shortly.';
        drawingResult.style.color = 'blue';
      }
    }

    drawAnimatedTrace();
  };
}


clearBtn.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawingResult.textContent = '';
  hasShownTrace = false;
  tracingActive = false;
};


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
      const slateSection = document.getElementById('slateSection');
    if (slateSection) {
      slateSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

