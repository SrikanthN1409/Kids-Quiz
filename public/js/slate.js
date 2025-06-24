const canvas = document.getElementById('slateCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', e => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', e => {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);
function checkDrawing() {
  const dataURL = canvas.toDataURL('image/png');

  // Later, you'll POST this to your backend or a cloud function:
  console.log('Sending this image:', dataURL);
  alert("This would now be sent to ML model for recognition!");
}
