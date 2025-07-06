
// Drawing Canvas Logic
let drawing = false, erasing = false, drawCanvas, drawCtx, lastX, lastY;

function setupDrawCanvas() {
  drawCanvas = document.getElementById('drawCanvas');
  drawCtx = drawCanvas.getContext('2d'); // ✅ Correct context type

  drawCanvas.width = window.innerWidth * 0.9;
  drawCanvas.height = window.innerHeight * 0.6;

  // ✅ Now apply the white background
  drawCtx.fillStyle = '#ffffff';
  drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

  drawCtx.lineCap = 'round';
  drawCtx.lineJoin = 'round';
  drawCtx.lineWidth = document.getElementById('brushSize').value;
  drawCtx.strokeStyle = document.getElementById('brushColor').value;
  drawCanvas.onmousedown = e => {
    drawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  };
  drawCanvas.onmousemove = e => {
    if (!drawing) return;
    drawCtx.beginPath();
    drawCtx.moveTo(lastX, lastY);
    drawCtx.lineTo(e.offsetX, e.offsetY);
    drawCtx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
  };
  drawCanvas.onmouseup = () => drawing = false;
  drawCanvas.onmouseout = () => drawing = false;

  drawCanvas.ontouchstart = e => {
    drawing = true;
    const touch = e.touches[0];
    const rect = drawCanvas.getBoundingClientRect();
    [lastX, lastY] = [touch.clientX - rect.left, touch.clientY - rect.top];
  };
  drawCanvas.ontouchmove = e => {
    if (!drawing) return;
    const touch = e.touches[0];
    const rect = drawCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    drawCtx.beginPath();
    drawCtx.moveTo(lastX, lastY);
    drawCtx.lineTo(x, y);
    drawCtx.stroke();
    [lastX, lastY] = [x, y];
    e.preventDefault();
  };
  drawCanvas.ontouchend = () => drawing = false;

  // Controls
 
  document.body.style.overflow = 'hidden'; // Prevent background scroll
  document.getElementById('brushSize').oninput = e => drawCtx.lineWidth = e.target.value;
  document.getElementById('brushColor').oninput = e => {
    drawCtx.strokeStyle = e.target.value;
    erasing = false;
  };
 let isErasing = false;
let brushColor = document.getElementById('brushColor').value;
let previousColor = brushColor;

document.getElementById('brushColor').oninput = e => {
  brushColor = e.target.value;

  if (isErasing) {
    isErasing = false;
    document.getElementById('eraserBtn').classList.remove('active');
  }

  drawCtx.strokeStyle = brushColor;
};

document.getElementById('eraserBtn').onclick = () => {
  isErasing = !isErasing;

  if (isErasing) {
    previousColor = brushColor;
    drawCtx.strokeStyle = "#FFFFFF"; // assuming white canvas background
    document.getElementById('eraserBtn').classList.add('active');
  } else {
    drawCtx.strokeStyle = previousColor;
    document.getElementById('eraserBtn').classList.remove('active');
  }
};
  document.getElementById('clearDrawBtn').onclick = () => {
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  };
  document.getElementById('downloadDrawBtn').onclick = () => {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = drawCanvas.toDataURL('image/png');
    link.click();
  };
  document.getElementById('closeDrawBtn').onclick = () => {
    document.getElementById('drawPopup').classList.add('hidden');
  };
}

document.getElementById('openDrawCanvasBtn').addEventListener('click', () => {
   const drawPopup = document.getElementById('drawPopup');
  drawPopup.showModal(); // ✅ works only with <dialog>
  setupDrawCanvas(); // ✅ resize and prepare canvas with white background
  document.body.style.overflow = 'hidden';
  setTimeout(setupDrawCanvas, 50);
});

document.getElementById('closeDrawBtn').addEventListener('click', () => {
  document.getElementById('drawPopup').close();
  document.body.style.overflow = '';
});

