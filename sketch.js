const CELL = 24;

let btn;
let imgBtn;

let wallColor;
let roadColor;
let vroadColor;
let pathColor;
let startColor;
let endColor;
let playerColor;

let rainbowMode;
let rainbowSlider;
let autoMode;

let shortestPathMode;
let shortestPathUnlocked = false;
let shortestPath = [];
let shortestPathIndex = 0;

let settingsPanel;
let settingsOpen = false;

let storePanel;
let storeOpen = false;

let money = 0;
let money_level = 1;
let moneyText;

let givemoney = 1;
let c_speed = 5;

let errorMessage = "";
let errorTime = 0;

let mode = "auto";

let directions = [
  [2, 0],
  [-2, 0],
  [0, 2],
  [0, -2]
];

let storeItems = [
  { name: "이동 속도", price: 50, type: 1 },
  { name: "보상 증가", price: 100, type: 2 },
  { name: "돈 버튼 강화", price: 200, type: 3 },
  { name: "최단거리 모드", price: 500, type: 4 }
];

let w = 25;
let h = 15;

let mapData = [];
let visited = [];
let path = [];

let isFinished = false;

let start = { r: 1, c: 1 };
let goal = { r: h - 2, c: w - 2 };

let lastStepTime = 0;
let lastManualStepTime = 0;


function setup() {
  createCanvas(600, 400);

  moneyText = createElement("span", `자금 : ${money}원`);
  moneyText.position(500, 370);

  createElement(
    "style",
    `
    input[type="color"] {
      width: 40px;
      height: 28px;
      padding: 2px;
      border: 1px solid #aaa;
      border-radius: 6px;
      cursor: pointer;
    }

    input[type="range"] {
      cursor: pointer;
    }

    button {
      cursor: pointer;
    }

    input[type="checkbox"] {
      cursor: pointer;
    }
    `
  );

  btn = createButton("상점");
  btn.position(10, 367);
  btn.mousePressed(toggleStore);

  let moneyBtn = createButton("돈");
  moneyBtn.position(80, 367);
  moneyBtn.mousePressed(() => {
    money += 0.5 * givemoney;
  });

  imgBtn = createButton("⚙️ 설정");
  imgBtn.position(300, 365);
  imgBtn.size(70, 30);
  imgBtn.mousePressed(toggleSettings);

  createSettings();
  createStore();

  newMap();
}


function createSettings() {
  settingsPanel = createDiv();

  settingsPanel.position(180, 50);
  settingsPanel.size(240, 320);

  settingsPanel.style("background", "white");
  settingsPanel.style("border", "2px solid #333");
  settingsPanel.style("border-radius", "10px");
  settingsPanel.style("padding", "15px");
  settingsPanel.style("box-sizing", "border-box");
  settingsPanel.style(
    "box-shadow",
    "0 4px 15px rgba(0, 0, 0, 0.3)"
  );
  settingsPanel.style("overflow-y", "auto");

  let title = createElement("h3", "설정");
  title.parent(settingsPanel);
  title.style("margin", "0 0 15px 0");

  wallColor = createColorRow("벽 색", "#282828").color;
  roadColor = createColorRow("길 색", "#ffffff").color;
  vroadColor = createColorRow("방문 색", "#b4d2ff").color;
  pathColor = createColorRow("경로 색", "#ffc832").color;
  playerColor = createColorRow("플레이어 색", "#ff3399").color;
  startColor = createColorRow("출발점 색", "#00c850").color;
  endColor = createColorRow("도착점 색", "#e63c3c").color;

  let rainbowRow = createDiv();
  rainbowRow.parent(settingsPanel);

  rainbowRow.style("display", "flex");
  rainbowRow.style("align-items", "center");
  rainbowRow.style("justify-content", "space-between");
  rainbowRow.style("width", "100%");
  rainbowRow.style("margin-top", "15px");
  rainbowRow.style("padding-top", "10px");
  rainbowRow.style("border-top", "1px solid #ddd");
  rainbowRow.style("margin-bottom", "10px");

  let rainbowText = createElement("span", "염병 모드");
  rainbowText.parent(rainbowRow);

  rainbowMode = createCheckbox("", false);
  rainbowMode.parent(rainbowRow);

  let rainbowSpeedRow = createDiv();
  rainbowSpeedRow.parent(settingsPanel);

  rainbowSpeedRow.style("display", "flex");
  rainbowSpeedRow.style("align-items", "center");
  rainbowSpeedRow.style("justify-content", "space-between");
  rainbowSpeedRow.style("width", "100%");
  rainbowSpeedRow.style("margin-bottom", "15px");

  let rainbowSpeedText = createElement("span", "염병 속도");
  rainbowSpeedText.parent(rainbowSpeedRow);

  rainbowSlider = createSlider(0, 100, 50);
  rainbowSlider.parent(rainbowSpeedRow);
  rainbowSlider.size(90);

  let modeRow = createDiv();
  modeRow.parent(settingsPanel);

  modeRow.style("margin-bottom", "15px");

  let modeText = createElement("span", "탐색 방식");
  modeText.parent(modeRow);

  autoMode = createRadio();
  autoMode.parent(modeRow);

  autoMode.option("auto", "자동 탐색");
  autoMode.option("manual", "수동 탐색");
  autoMode.selected("auto");

  autoMode.changed(() => {
    mode = autoMode.value();

    lastStepTime = millis();
    lastManualStepTime = millis();
  });

  // 최단거리 모드
  let shortestPathRow = createDiv();
  shortestPathRow.parent(settingsPanel);

  shortestPathRow.style("display", "flex");
  shortestPathRow.style("align-items", "center");
  shortestPathRow.style("justify-content", "space-between");
  shortestPathRow.style("width", "100%");
  shortestPathRow.style("padding-top", "10px");
  shortestPathRow.style("border-top", "1px solid #ddd");
  shortestPathRow.style("margin-bottom", "15px");

  let shortestPathText = createElement(
    "span",
    "최단거리 모드"
  );
  shortestPathText.parent(shortestPathRow);

  shortestPathMode = createCheckbox("", false);
  shortestPathMode.parent(shortestPathRow);

  // 처음에는 잠금
  shortestPathMode.attribute("disabled", "");

  shortestPathMode.changed(() => {
    if (!shortestPathUnlocked) {
      shortestPathMode.checked(false);
      return;
    }

    shortestPathIndex = 0;
    shortestPath = [];

    if (shortestPathMode.checked()) {
      calculateShortestPath();
    }
  });

  let closeBtn = createButton("닫기");
  closeBtn.parent(settingsPanel);
  closeBtn.size(210, 30);
  closeBtn.mousePressed(toggleSettings);

  settingsPanel.hide();
}


function createColorRow(label, defaultColor) {
  let row = createDiv();
  row.parent(settingsPanel);

  row.style("display", "flex");
  row.style("align-items", "center");
  row.style("justify-content", "space-between");
  row.style("width", "100%");
  row.style("margin-bottom", "10px");

  let t = createElement("span", label);
  t.parent(row);

  let color = createColorPicker(defaultColor);
  color.parent(row);

  return {
    row: row,
    color: color
  };
}


function toggleSettings() {
  settingsOpen = !settingsOpen;

  if (settingsOpen) {
    settingsPanel.show();
  } else {
    settingsPanel.hide();
  }
}


function createStore() {
  storePanel = createDiv();

  storePanel.position(100, 50);
  storePanel.size(400, 300);

  storePanel.style("background", "white");
  storePanel.style("border", "2px solid #333");
  storePanel.style("border-radius", "10px");
  storePanel.style("padding", "15px");
  storePanel.style("box-sizing", "border-box");
  storePanel.style(
    "box-shadow",
    "0 4px 15px rgba(0, 0, 0, 0.3)"
  );
  storePanel.style("overflow-y", "auto");

  let title = createElement("h3", "상점");
  title.parent(storePanel);
  title.style("margin", "0 0 15px 0");

  for (let item of storeItems) {
    let row = createDiv();
    row.parent(storePanel);

    row.style("display", "flex");
    row.style("align-items", "center");
    row.style("justify-content", "space-between");
    row.style("width", "100%");
    row.style("margin-bottom", "10px");

    let t = createElement(
      "span",
      `${item.name} - ${item.price}원`
    );

    t.parent(row);
    item.priceText = t;

    let buyBtn = createButton("구매하기");
    buyBtn.parent(row);

    buyBtn.mousePressed(() => buyItem(item));
  }

  let closeBtn = createButton("닫기");
  closeBtn.parent(storePanel);
  closeBtn.size(370, 30);
  closeBtn.mousePressed(toggleStore);

  storePanel.hide();
}


function buyItem(item) {
  // 이미 구매한 최단거리 모드
  if (item.type === 4 && shortestPathUnlocked) {
    errorMessage = "이미 구매한 아이템입니다!";
    errorTime = millis();
    return;
  }

  if (money < item.price) {
    errorMessage = "돈이 부족합니다!";
    errorTime = millis();

    toggleStore();
    return;
  }

  money -= item.price;

  if (item.type === 1) {
    c_speed += 3;
    item.price += 50;

  } else if (item.type === 2) {
    money_level += 0.5;
    item.price *= 2;

  } else if (item.type === 3) {
    givemoney *= 2;
    item.price += 100;

  } else if (item.type === 4) {
    // 최단거리 모드 잠금 해제
    shortestPathUnlocked = true;

    shortestPathMode.removeAttribute("disabled");

    item.priceText.html(
      `${item.name} - 구매 완료`
    );

    calculateShortestPath();
  }

  if (item.type !== 4) {
    item.priceText.html(
      `${item.name} - ${item.price}원`
    );
  }
}


function toggleStore() {
  storeOpen = !storeOpen;

  if (storeOpen) {
    storePanel.show();
  } else {
    storePanel.hide();
  }
}


function generateMaze(x, y) {
  let shuffledDirections = shuffle([...directions]);

  for (let direction of shuffledDirections) {
    let nx = x + direction[0];
    let ny = y + direction[1];

    if (
      nx >= 1 &&
      nx < w - 1 &&
      ny >= 1 &&
      ny < h - 1 &&
      mapData[ny][nx] === 1
    ) {
      let wallX = x + direction[0] / 2;
      let wallY = y + direction[1] / 2;

      mapData[wallY][wallX] = 0;
      mapData[ny][nx] = 0;

      generateMaze(nx, ny);
    }
  }
}


function newMap() {
  mapData = [];

  for (let r = 0; r < h; r++) {
    mapData[r] = [];

    for (let c = 0; c < w; c++) {
      mapData[r][c] = 1;
    }
  }

  mapData[start.r][start.c] = 0;

  generateMaze(start.c, start.r);

  initMaze();

  lastStepTime = millis();
  lastManualStepTime = millis();

  shortestPath = [];
  shortestPathIndex = 0;

  if (
    shortestPathUnlocked &&
    shortestPathMode &&
    shortestPathMode.checked()
  ) {
    calculateShortestPath();
  }
}


function initMaze() {
  isFinished = false;

  path = [];
  visited = [];

  for (let r = 0; r < h; r++) {
    visited[r] = [];

    for (let c = 0; c < w; c++) {
      visited[r][c] = false;
    }
  }

  path.push({
    r: start.r,
    c: start.c
  });

  visited[start.r][start.c] = true;
}


function calculateShortestPath() {
  shortestPath = [];
  shortestPathIndex = 0;

  if (!mapData.length) return;

  let queue = [];

  let visitedBFS = [];

  let parent = [];

  for (let r = 0; r < h; r++) {
    visitedBFS[r] = [];
    parent[r] = [];

    for (let c = 0; c < w; c++) {
      visitedBFS[r][c] = false;
      parent[r][c] = null;
    }
  }

  queue.push({
    r: start.r,
    c: start.c
  });

  visitedBFS[start.r][start.c] = true;

  let found = false;

  while (queue.length > 0) {
    let current = queue.shift();

    if (
      current.r === goal.r &&
      current.c === goal.c
    ) {
      found = true;
      break;
    }

    let bfsDirections = [
      { r: 0, c: 1 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
      { r: -1, c: 0 }
    ];

    for (let d of bfsDirections) {
      let nextR = current.r + d.r;
      let nextC = current.c + d.c;

      if (
        nextR >= 0 &&
        nextR < h &&
        nextC >= 0 &&
        nextC < w &&
        mapData[nextR][nextC] === 0 &&
        !visitedBFS[nextR][nextC]
      ) {
        visitedBFS[nextR][nextC] = true;

        parent[nextR][nextC] = {
          r: current.r,
          c: current.c
        };

        queue.push({
          r: nextR,
          c: nextC
        });
      }
    }
  }

  if (!found) {
    return;
  }

  // 도착점부터 부모를 따라가며 경로 복원
  let current = {
    r: goal.r,
    c: goal.c
  };

  while (current !== null) {
    shortestPath.push({
      r: current.r,
      c: current.c
    });

    if (
      current.r === start.r &&
      current.c === start.c
    ) {
      break;
    }

    current = parent[current.r][current.c];
  }

  // 시작점 -> 도착점 순서로 변경
  shortestPath.reverse();
}


function getRainbowColor(offset) {
  let rainbowSpeed = rainbowSlider.value();

  let hueVal =
    (frameCount * rainbowSpeed * 0.024 + offset) % 360;

  return color(hueVal, 100, 100);
}


function draw() {
  colorMode(RGB, 255);
  background(240);

  moneyText.html(
    `자금 : ${money}원`
  );

  // 자동 탐색
  if (
    mode === "auto" &&
    !isFinished &&
    !settingsOpen &&
    !storeOpen &&
    c_speed > 0
  ) {
    let stepsPerSecond =
      map(c_speed, 1, 50, 1, 120);

    let stepInterval =
      1000 / stepsPerSecond;

    if (
      millis() - lastStepTime >=
      stepInterval
    ) {
      if (
        shortestPathUnlocked &&
        shortestPathMode &&
        shortestPathMode.checked()
      ) {
        bfsStep();
      } else {
        dfsStep();
      }

      lastStepTime = millis();
    }
  }

  // 수동 탐색
  if (
    mode === "manual" &&
    !isFinished &&
    !settingsOpen &&
    !storeOpen
  ) {
    let stepsPerSecond =
      map(c_speed, 1, 50, 1, 120);

    let stepInterval =
      1000 / stepsPerSecond;

    if (
      millis() - lastManualStepTime >=
      stepInterval
    ) {
      let dr = 0;
      let dc = 0;

      // WASD / 방향키
      if (
        keyIsDown(UP_ARROW) ||
        keyIsDown(87) ||
        (
          keyIsPressed &&
          (
            key === "w" ||
            key === "W" ||
            key === "ㅈ"
          )
        )
      ) {
        dr = -1;

      } else if (
        keyIsDown(DOWN_ARROW) ||
        keyIsDown(83) ||
        (
          keyIsPressed &&
          (
            key === "s" ||
            key === "S" ||
            key === "ㄴ"
          )
        )
      ) {
        dr = 1;

      } else if (
        keyIsDown(LEFT_ARROW) ||
        keyIsDown(65) ||
        (
          keyIsPressed &&
          (
            key === "a" ||
            key === "A" ||
            key === "ㅁ"
          )
        )
      ) {
        dc = -1;

      } else if (
        keyIsDown(RIGHT_ARROW) ||
        keyIsDown(68) ||
        (
          keyIsPressed &&
          (
            key === "d" ||
            key === "D" ||
            key === "ㅇ"
          )
        )
      ) {
        dc = 1;
      }

      if (dr !== 0 || dc !== 0) {
        manualMove(dr, dc);
      }
    }
  }

  // 미로 그리기
  push();

  colorMode(
    HSB,
    360,
    100,
    100,
    255
  );

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      let x = c * CELL;
      let y = r * CELL;

      if (mapData[r][c] === 1) {
        fill(
          rainbowMode.checked()
            ? getRainbowColor(0)
            : wallColor.value()
        );
      } else {
        fill(
          rainbowMode.checked()
            ? getRainbowColor(180)
            : roadColor.value()
        );
      }

      stroke(180);

      rect(
        x,
        y,
        CELL,
        CELL
      );

      if (visited[r][c]) {
        fill(
          rainbowMode.checked()
            ? getRainbowColor(60)
            : vroadColor.value()
        );

        rect(
          x + 2,
          y + 2,
          CELL - 4,
          CELL - 4
        );
      }
    }
  }

  // 최단거리 경로 표시
  if (
    shortestPathUnlocked &&
    shortestPathMode &&
    shortestPathMode.checked()
  ) {
    drawShortestPath();
  }

  // 지나온 경로
  for (let i = 0; i < path.length - 1; i++) {
    let p = path[i];

    fill(
      rainbowMode.checked()
        ? getRainbowColor(120)
        : pathColor.value()
    );

    rect(
      p.c * CELL + 4,
      p.r * CELL + 4,
      CELL - 8,
      CELL - 8
    );
  }

  // 출발점
  fill(
    rainbowMode.checked()
      ? getRainbowColor(240)
      : startColor.value()
  );

  rect(
    start.c * CELL + 4,
    start.r * CELL + 4,
    CELL - 8,
    CELL - 8
  );

  // 도착점
  fill(
    rainbowMode.checked()
      ? getRainbowColor(300)
      : endColor.value()
  );

  rect(
    goal.c * CELL + 4,
    goal.r * CELL + 4,
    CELL - 8,
    CELL - 8
  );

  // 플레이어
  if (path.length > 0) {
    let player =
      path[path.length - 1];

    fill(
      rainbowMode.checked()
        ? getRainbowColor(150)
        : playerColor.value()
    );

    rect(
      player.c * CELL + 3,
      player.r * CELL + 3,
      CELL - 6,
      CELL - 6
    );
  }

  pop();

  // 오류 메시지
  if (millis() - errorTime < 1500) {
    fill(230, 60, 60);

    textSize(16);

    text(
      errorMessage,
      10,
      345
    );
  }
}


function drawShortestPath() {
  if (shortestPath.length === 0) {
    return;
  }

  // 최단거리 경로를 연한 초록색으로 표시
  fill(
    rainbowMode.checked()
      ? getRainbowColor(90)
      : color(100, 220, 140, 150)
  );

  noStroke();

  for (let p of shortestPath) {
    rect(
      p.c * CELL + 7,
      p.r * CELL + 7,
      CELL - 14,
      CELL - 14
    );
  }

  stroke(180);
}


function dfsStep() {
  if (path.length === 0) {
    isFinished = true;
    return;
  }

  let current =
    path[path.length - 1];

  if (
    current.r === goal.r &&
    current.c === goal.c
  ) {
    money += 10 * money_level;

    newMap();

    return;
  }

  let dirs = shuffle([
    { r: 0, c: 1 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: -1, c: 0 }
  ]);

  for (let d of dirs) {
    let nextR =
      current.r + d.r;

    let nextC =
      current.c + d.c;

    if (
      nextR >= 0 &&
      nextR < h &&
      nextC >= 0 &&
      nextC < w &&
      mapData[nextR][nextC] === 0 &&
      !visited[nextR][nextC]
    ) {
      visited[nextR][nextC] = true;

      path.push({
        r: nextR,
        c: nextC
      });

      return;
    }
  }

  // 더 이상 갈 곳이 없으면 되돌아감
  path.pop();
}


function bfsStep() {
  if (shortestPath.length === 0) {
    calculateShortestPath();

    if (shortestPath.length === 0) {
      isFinished = true;
      return;
    }
  }

  if (
    shortestPathIndex >=
    shortestPath.length
  ) {
    return;
  }

  let current =
    shortestPath[shortestPathIndex];

  // 플레이어 경로를 최단거리 경로에 맞춤
  path.push({
    r: current.r,
    c: current.c
  });

  visited[current.r][current.c] = true;

  shortestPathIndex++;

  // 도착
  if (
    current.r === goal.r &&
    current.c === goal.c
  ) {
    money += 10 * money_level;

    newMap();
  }
}


function manualMove(dr, dc) {
  if (path.length === 0) {
    return;
  }

  let current =
    path[path.length - 1];

  let nextR =
    current.r + dr;

  let nextC =
    current.c + dc;

  if (
    nextR < 0 ||
    nextR >= h ||
    nextC < 0 ||
    nextC >= w
  ) {
    return;
  }

  if (mapData[nextR][nextC] === 1) {
    return;
  }

  // 뒤로 이동
  if (
    path.length >= 2 &&
    path[path.length - 2].r === nextR &&
    path[path.length - 2].c === nextC
  ) {
    path.pop();

    lastManualStepTime = millis();

    return;
  }

  visited[nextR][nextC] = true;

  path.push({
    r: nextR,
    c: nextC
  });

  lastManualStepTime = millis();

  // 도착
  if (
    nextR === goal.r &&
    nextC === goal.c
  ) {
    money += 10 * money_level;

    newMap();
  }
}