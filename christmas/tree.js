(function () {
  const canvas = document.getElementById("tree");
  const ctx = canvas.getContext("2d");

  const top = 100;
  const level = 6;
  const topWidth = 100;
  const widthStep = 80;
  const topHeight = 80;
  const heightStep = 20;
  const topCurve = 10;
  const curveStep = 5;

  const getX = () => canvas.width / 2;
  const getY = (index) =>
    Array(index - 1)
      .fill(0)
      .map((_, i) => i + 1)
      .reduce((current, next) => current + (getHeight(next) * 3) / 5, 0) + top;

  const getWidth = (index) => topWidth + (index - 1) * widthStep;
  const getHeight = (index) => topHeight + (index - 1) * heightStep;
  const getCurve = (index) => topCurve + (index - 1) * curveStep;

  // 从下面开始画，上面的好盖住下面的
  let x;
  let y;
  let width;
  let height;
  let curve;

  function drawLayer(index) {
    if (index <= 0) return;

    x = getX(index);
    y = getY(index);
    width = getWidth(index);
    height = getHeight(index);
    curve = getCurve(index);

    const leftEndX = x - width / 2;
    const leftEndY = y + height;
    const leftControlX = (x + leftEndX) / 2 + curve;
    const leftControlY = (y + leftEndY) / 2 + curve;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(leftControlX, leftControlY, leftEndX, leftEndY);

    const rightEndX = x + width / 2;
    const rightEndY = leftEndY;
    ctx.quadraticCurveTo(x, leftEndY + curve * 2, rightEndX, rightEndY);

    const rightControlX = (x + rightEndX) / 2 - curve;
    const rightControlY = (y + rightEndY) / 2 + curve;
    ctx.quadraticCurveTo(rightControlX, rightControlY, x, y);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    drawLayer(index - 1);
  }

  ctx.save();
  ctx.fillStyle = "green";
  ctx.strokeStyle = "rgb(0,110,0)";
  drawLayer(level);
  ctx.restore();

  function drawTrunk() {
    ctx.beginPath();

    const x = getX(level);
    const y = getY(level);
    const height = 150;
    const width = 40;

    ctx.rect(x - width / 2, y + getHeight(level), width, height);
    ctx.closePath();
    ctx.fillStyle = "brown";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.globalCompositeOperation = "destination-over";
    ctx.fill();
    ctx.stroke();
  }
  ctx.save();
  drawTrunk();
  ctx.restore();

  function drawStar() {
    const cx = getX(1);
    const cy = getY(1);
    const outerRadius = 36;
    const innerRadius = 22;
    const spikes = 5;

    const step = Math.PI / spikes;
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (index = 0; index < spikes; index++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();

    ctx.fillStyle = "#F7C21D";
    ctx.fill();
  }
  ctx.save();
  drawStar();
  ctx.restore();

  function drawRope() {
    for (let index = 1; index <= level;) {
      ctx.beginPath()

      const starX = getX(index) - getWidth(index) / 2 + 5;
      const endX = getX(index + 1) + getWidth(index + 1) / 2 - 5;
      const startY = getY(index) + getHeight(index);
      const endY = getY(index + 1) + getHeight(index + 1);
      const controlX = (starX + endX) / 2 - index * 15;
      const controlY = (startY + endY) / 2 + index * 25;

      ctx.moveTo(starX, startY);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.stroke();
      ctx.closePath()

      index += 2
    }
    for (let index = 2; index < level;) {
      ctx.beginPath()

      const starX = getX(index) + getWidth(index) / 2 - 5;
      const endX = getX(index + 1) - getWidth(index + 1) / 2 + 5;
      const startY = getY(index) + getHeight(index);
      const endY = getY(index + 1) + getHeight(index + 1);
      const controlX = (starX + endX) / 2 - index * 15;
      const controlY = (startY + endY) / 2 + index * 25;

      ctx.moveTo(starX, startY);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.stroke();
      ctx.closePath()

      index += 2
    }
  }
  ctx.save();
  ctx.strokeStyle = "rgba(205, 190, 85)";
  ctx.lineWidth = 3
  drawRope()
  ctx.restore();

  function drawDecorators() {
    const width = getWidth(level);
    const height = getHeight(level);
    const x1 = getX(1);
    const y1 = getY(1);
    const x2 = getX(level) - width / 2;
    const y2 = getY(level) + height;
    const x3 = getX(level) + width / 2;
    const y3 = getY(level) + height;
    let count = 60;

    const minX = x2;
    const maxX = x3;
    const minY = y1;
    const maxY = y2;
    const pointInTree = pointInTriangle(x1, y1, x2, y2, x3, y3);

    for (let y = maxY; y >= minY; ) {
      for (let x = minX; x < maxX; ) {
        if (count === 0) {
          return;
        }
        if (pointInTree(x, y)) {
          // 错落有致
          const realX = x + ~~random(-30, 30)
          const realY = y + ~~random(-30, 30)
          drawDecorator(realX, realY);
          count -= 1;
        }
        x += 60
      }
      y -= 60
    }
  }
  function drawDecorator(x, y) {
    const count = 13;
    const index = ~~random(0, count);
    const size = ~~random(20, 70);
    const decoratorSrc = `./decorators/${index}.png`;
    loadImage(decoratorSrc).then((img) => {
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const imageElement = new Image();
      imageElement.src = src;
      imageElement.onload = function () {
        resolve(this);
      };
      imageElement.onerror = function (error) {
        reject(error);
      };
    });
  }
  ctx.save();
  drawDecorators();
  ctx.restore();
})();

function pointInTriangle(x1, y1, x2, y2, x3, y3) {
  return (x0, y0) => {
    const divisor = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
    const a = ((y2 - y3) * (x0 - x3) + (x3 - x2) * (y0 - y3)) / divisor;
    const b = ((y3 - y1) * (x0 - x3) + (x1 - x3) * (y0 - y3)) / divisor;
    const c = 1 - a - b;

    return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
  };
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}
