// 不規則曲線電流急急棒 - 優化版
let topPoints = [];       
let bottomPoints = [];    
let state = 'waiting';    
let startCircleRadius = 30;
let startCirclePos;
let flashTimer = 0;       
let playerColor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  generatePath(); 
  startCirclePos = createVector(40, height / 2);
  playerColor = color(0, 255, 255); // 預設螢光藍
  textSize(32);
}

function draw() {
  background(10); // 深色背景更有霓虹感

  if (state === 'waiting') {
    drawPath();
    drawStartPoint();
    showUI("點擊黃色圓圈開始遊戲", [255, 255, 255]);
  } 
  
  else if (state === 'playing') {
    drawPath();
    drawPlayer();    // 核心修正：畫出隨鼠移動的感應點
    checkCollision();
    checkSuccess();
  } 
  
  else if (state === 'gameover') {
    if (flashTimer > 0) {
      background(150, 0, 0); // 失敗時的震懾感
      flashTimer--;
    }
    drawPath();
    showUI("GAME OVER\n點擊畫面重新開始", [255, 100, 100]);
  } 
  
  else if (state === 'success') {
    drawPath();
    showUI("SUCCESS!\n妳成功抵達終點", [100, 255, 100]);
  }
}

// 產生更精細的邊界 (增加點的數量以縮小判定誤差)
function generatePath() {
  topPoints = [];
  bottomPoints = [];
  let segments = 20; // 增加分段，讓直線判定趨近曲線視覺
  let spacing = width / segments;
  
  for (let i = 0; i <= segments + 1; i++) {
    let x = i * spacing;
    // 確保起點與終點有足夠空間
    let padding = (i === 0 || i === segments) ? 0.2 : 0; 
    let topY = random(height * 0.25, height * (0.48 - padding));
    let bottomY = random(height * (0.52 + padding), height * 0.75);
    topPoints.push(createVector(x, topY));
    bottomPoints.push(createVector(x, bottomY));
  }
}

function drawPath() {
  push();
  noFill();
  strokeWeight(5);
  // 增加設計感的發光效果
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(0, 255, 255, 0.5)';
  stroke(0, 255, 255);

  // 上邊界
  beginShape();
  for (let p of topPoints) curveVertex(p.x, p.y);
  endShape();

  // 下邊界
  beginShape();
  for (let p of bottomPoints) curveVertex(p.x, p.y);
  endShape();
  pop();
}

function drawStartPoint() {
  fill(255, 255, 0);
  noStroke();
  ellipse(startCirclePos.x, startCirclePos.y, startCircleRadius * 2);
}

function drawPlayer() {
  // 畫出玩家正在操控的小圓點
  fill(255);
  noStroke();
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'white';
  ellipse(mouseX, mouseY, 15, 15);
  
  // 畫一條淡淡的虛線連回起點（增加連結感）
  stroke(255, 50);
  strokeWeight(1);
  line(mouseX, mouseY, startCirclePos.x, startCirclePos.y);
}

function mousePressed() {
  if (state === 'waiting') {
    let d = dist(mouseX, mouseY, startCirclePos.x, startCirclePos.y);
    if (d < startCircleRadius) {
      state = 'playing';
    }
  } else if (state === 'success' || state === 'gameover') {
    generatePath(); // 重新玩時換地圖
    state = 'waiting';
  }
}

function checkCollision() {
  if (mouseX < 0 || mouseX > width) return;

  let topY = getBoundaryY(topPoints, mouseX);
  let bottomY = getBoundaryY(bottomPoints, mouseX);

  if (mouseY < topY || mouseY > bottomY) {
    state = 'gameover';
    flashTimer = 15;
  }
}

function getBoundaryY(points, x) {
  for (let i = 0; i < points.length - 1; i++) {
    let x1 = points[i].x;
    let x2 = points[i + 1].x;
    if (x >= x1 && x <= x2) {
      let t = (x - x1) / (x2 - x1);
      return lerp(points[i].y, points[i + 1].y, t);
    }
  }
  return points[points.length - 1].y;
}

function checkSuccess() {
  if (mouseX >= width - 20) {
    state = 'success';
  }
}

function showUI(msg, col) {
  textAlign(CENTER, CENTER);
  fill(col);
  noStroke();
  drawingContext.shadowBlur = 0; // 文字不發光以免模糊
  text(msg, width / 2, height / 2);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generatePath();
  startCirclePos = createVector(40, height / 2);
}