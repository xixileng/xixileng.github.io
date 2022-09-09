function drawPenguin() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  // 黑色的头
  ctx.beginPath();
  ctx.moveTo(100, 200);
  ctx.bezierCurveTo(80, 90, 240, 90, 220, 200);
  ctx.moveTo(100, 200);
  ctx.bezierCurveTo(110, 220, 210, 220, 220, 200);
  ctx.fillStyle = "#070000";
  ctx.fill();
  ctx.closePath();

  // 眼睛
  ctx.beginPath();
  ctx.ellipse(140, 165, 11, 15, (-2 * Math.PI) / 180, 0, 2 * Math.PI);
  ctx.ellipse(180, 165, 11, 15, (2 * Math.PI) / 180, 0, 2 * Math.PI);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.closePath();

  // 左眼球
  ctx.beginPath();
  ctx.ellipse(143, 167, 5, 7, 0, 0, 2 * Math.PI);
  ctx.fillStyle = "#070000";
  ctx.fill();
  ctx.closePath();

  // 右眼球
  ctx.beginPath();
  ctx.moveTo(172, 168);
  ctx.bezierCurveTo(172, 163, 182, 161, 187, 165);
  ctx.bezierCurveTo(188, 165, 186, 168, 185, 168);
  ctx.bezierCurveTo(181, 163, 171, 168, 174, 169);
  ctx.bezierCurveTo(173, 169, 171, 168, 172, 168);
  ctx.strokeStyle = "#e60036";
  ctx.fill();
  ctx.closePath();

  // 嘴巴
  ctx.beginPath();
  ctx.moveTo(130, 195);
  ctx.bezierCurveTo(130, 188, 190, 188, 190, 195);
  ctx.moveTo(130, 195);
  ctx.bezierCurveTo(145, 205, 175, 205, 190, 195);
  ctx.fillStyle = "#fabd00";
  ctx.fill();
  ctx.closePath();

  // 脚丫
  ctx.beginPath();
  ctx.moveTo(120, 428);
  ctx.bezierCurveTo(80, 440, 90, 451, 168, 428);
  ctx.moveTo(200, 428);
  ctx.bezierCurveTo(240, 440, 230, 451, 152, 428);
  ctx.fillStyle = "#fabd00";
  ctx.fill();
  ctx.closePath();

  // 身体轮廓
  ctx.beginPath();
  // 左手
  ctx.moveTo(95, 220);
  ctx.bezierCurveTo(70, 255, 69, 274, 70, 280);
  ctx.bezierCurveTo(77, 284, 91, 263, 97, 250);
  // 身体
  ctx.bezierCurveTo(90, 500, 230, 500, 223, 250);
  // 右手
  ctx.bezierCurveTo(229, 263, 243, 284, 250, 280);
  ctx.bezierCurveTo(251, 274, 250, 255, 225, 220);
  // 脖颈下围
  ctx.bezierCurveTo(215, 240, 105, 240, 95, 220);
  ctx.fillStyle = "#070000";
  ctx.fill();
  ctx.closePath();

  // 白色肚子
  ctx.beginPath();
  ctx.moveTo(115, 225);
  ctx.bezierCurveTo(100, 495, 220, 495, 205, 225);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.closePath();

  // 红色围巾
  ctx.beginPath();
  ctx.moveTo(100, 200);
  ctx.bezierCurveTo(110, 220, 210, 220, 220, 200);
  ctx.lineTo(225, 220);
  ctx.bezierCurveTo(215, 240, 105, 240, 95, 220);
  ctx.lineTo(100, 200);
  ctx.fillStyle = "#e60036";
  ctx.fill();
  ctx.closePath();

  // 围巾下摆
  ctx.beginPath();
  ctx.moveTo(125, 225);
  ctx.lineTo(125, 253);
  ctx.bezierCurveTo(127, 255, 143, 255, 145, 253);
  ctx.lineTo(145, 225);
  ctx.fillStyle = "#e60036";
  ctx.fill();
  ctx.beginPath();
  ctx.save();
  ctx.translate(100, 100);
}