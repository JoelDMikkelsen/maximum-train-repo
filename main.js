const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

function gameLoop(timestamp) {
  const dt = timestamp - lastTime;
  lastTime = timestamp;
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
console.log('[MaximumTrain] Foundation loaded');
