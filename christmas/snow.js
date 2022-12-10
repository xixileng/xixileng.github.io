(function () {
  const canvas = document.getElementById("snow");
  const ctx = canvas.getContext("2d");
  const PI = Math.PI;
  const cos = Math.cos;
  const sin = Math.sin;
  const sideNum = 6; // 雪花形状（正N边形）
  const snowCount = 80; // 雪花总数量
  const snowSize = [4, 12]; // 雪花的大小范围
  const threshold = 8; // 显示第三层棱角的阈值
  const speed = [1, 3]; // 雪花的速度
  const width = canvas.width; // 画布宽度
  const height = canvas.height; // 画布高度
  const space = ~~(((height / ((speed[0] + speed[1]) / 2)) * 16.6) / snowCount); // 雪花出现时间间隔
  let snows = []; // 存放雪花的数组
  let timeouts = []; // 雪花的定时器数组

  const Snow = function () {};
  Snow.prototype = {
    init(x = random(0, width), y = 0) {
      this.x = x;
      this.y = y;
      this.r = random(...snowSize);
      this._x = random(0.2, 2);
      this._y = random(...speed);
      this.rotateSpeed = this._y / 2;
      this.angle = 0;
    },
    draw() {
      ctx.save();
      ctx.translate(
        this.x + this.snowCanvas.width / 2,
        this.y + this.snowCanvas.height / 2
      );
      ctx.rotate(((this.angle % 360) * PI) / 180);
      ctx.drawImage(
        this.snowCanvas,
        -this.snowCanvas.width / 2,
        -this.snowCanvas.height / 2
      );
      ctx.restore();
      this.update();
    },
    update() {
      if (this.y < height - this.r) {
        this.y += this._y;
        if (this.x < width - this.r) {
          this.x += this._x;
        } else {
          this.init(0, this.y);
        }
      } else {
        this.init();
      }
      this.angle += this.rotateSpeed;
    },
  };

  function drawSnows() {
    snows = snows.slice(0, snowCount);
    timeouts = [];
    for (let i = snows.length; i < snowCount; i += 1) {
      let timeout = setTimeout(function () {
        const snow = new Snow();
        snow.init();
        snow.snowCanvas = drawCanvas(snow.r);
        snows.push(snow);
      }, space * i);
      timeouts.push(timeout);
    }
  }

  function drawCanvas(size) {
    let coord = [[2 * size, 2 * size]];
    const canvasSnow = document.createElement("canvas");
    canvasSnow.setAttribute("width", coord[0][0] + size * 2);
    canvasSnow.setAttribute("height", coord[0][1] + size * 2);
    const ctxSnow = canvasSnow.getContext("2d");

    ctxSnow.save();
    ctxSnow.strokeStyle = "#FFFFFF";
    ctxSnow.lineWidth = 2;
    let coords = drawSnow(ctxSnow, coord, size);
    ctxSnow.lineWidth = 1;
    coords = drawSnow(ctxSnow, coords, size / 2.5);
    size > threshold && drawSnow(ctxSnow, coords, size / 6);
    ctxSnow.restore();
    return canvasSnow;
  }

  function drawSnow(ctxSnow, coord, size) {
    const coords = [];
    for (let i = 0, length = coord.length; i < length; i += 1) {
      for (let j = 0; j < sideNum; j += 1) {
        const { x2, y2 } = drawSide(
          ctxSnow,
          coord[i][0],
          coord[i][1],
          size,
          2 * PI * (j / sideNum)
        );
        coords.push([x2, y2]);
      }
    }
    return coords;
  }

  function drawSide(ctxSnow, x, y, size, radian) {
    const x2 = size * cos(radian) + x;
    const y2 = size * sin(radian) + y;
    drawLine(ctxSnow, x, y, x2, y2);
    return { x2, y2 };
  }

  function drawLine(ctxSnow, x1, y1, x2, y2) {
    ctxSnow.beginPath();
    ctxSnow.lineTo(x1, y1);
    ctxSnow.lineTo(x2, y2);
    ctxSnow.stroke();
  }

  function move() {
    ctx.clearRect(0, 0, width, height);
    let length = snows.length;
    for (let i = 0; i < length; i++) {
      snows[i].draw();
    }
    requestAnimationFrame(move);
  }

  
  drawSnows();
  move();
})();

function random(min, max) {
  return Math.random() * (max - min) + min;
}