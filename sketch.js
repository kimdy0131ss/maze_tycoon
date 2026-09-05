const CELL_BASE = 24;

let CELL;
let mazeX = 0;
let mazeY = 0;

let btn;
let moneyBtn;
let imgBtn;

let wallColor;
let roadColor;
let vroadColor;
let pathColor;
let startColor;
let endColor;
let playerColor;
let shortestPathColor;

let rainbowMode;
let rainbowSlider;
let autoMode;

let shortestPathMode = null;
let shortestPathRow = null;
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


// ========================================
// SETUP
// ========================================

function setup() {
  createCanvas(windowWidth, windowHeight);

  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";

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

    span {
      font-family: sans-serif;
    }
    `
  );


  // ========================================
  // 자금
  // ========================================

  moneyText = createElement(
    "span",
    `자금 : ${money.toFixed(1)}원`
  );

  moneyText.style("font-size", "18px");
  moneyText.style("font-weight", "bold");
  moneyText.style("user-select", "none");


  // ========================================
  // 상점 버튼
  // ========================================

  btn = createButton("상점");

  btn.size(60, 30);

  btn.mousePressed(toggleStore);


  // ========================================
  // 돈 버튼
  // ========================================

  moneyBtn = createButton("돈");

  moneyBtn.size(60, 30);

  moneyBtn.mousePressed(() => {
    money += 0.5 * givemoney;
  });


  // ========================================
  // 설정 버튼
  // ========================================

  imgBtn = createButton("⚙️ 설정");

  imgBtn.size(80, 30);

  imgBtn.mousePressed(toggleSettings);


  createSettings();
  createStore();

  calculateCellSize();

  positionUI();

  newMap();
}


// ========================================
// 화면 크기 변경
// ========================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  calculateCellSize();
  positionUI();

  if (settingsPanel) {
    positionSettingsPanel();
  }

  if (storePanel) {
    positionStorePanel();
  }
}


// ========================================
// 미로 크기 계산
// ========================================

function calculateCellSize() {

  let bottomSpace = 60;

  let availableWidth = windowWidth - 20;

  let availableHeight =
    windowHeight - bottomSpace - 20;

  CELL = min(
    availableWidth / w,
    availableHeight / h
  );

  CELL = max(CELL, 10);

  let mazeWidth = CELL * w;
  let mazeHeight = CELL * h;

  mazeX =
    (windowWidth - mazeWidth) / 2;

  mazeY =
    (availableHeight - mazeHeight) / 2 + 10;
}


// ========================================
// UI 위치
// ========================================

function positionUI() {

  if (!moneyText) {
    return;
  }

  let bottomY =
    windowHeight - 40;

  btn.position(
    10,
    bottomY
  );

  moneyBtn.position(
    80,
    bottomY
  );

  imgBtn.position(
    windowWidth / 2 - 40,
    bottomY
  );

  moneyText.position(
    windowWidth - 150,
    15
  );
}


// ========================================
// 설정창 생성
// ========================================

function createSettings() {

  settingsPanel = createDiv();

  settingsPanel.size(
    260,
    390
  );

  settingsPanel.style(
    "background",
    "white"
  );

  settingsPanel.style(
    "border",
    "2px solid #333"
  );

  settingsPanel.style(
    "border-radius",
    "10px"
  );

  settingsPanel.style(
    "padding",
    "15px"
  );

  settingsPanel.style(
    "box-sizing",
    "border-box"
  );

  settingsPanel.style(
    "box-shadow",
    "0 4px 15px rgba(0, 0, 0, 0.3)"
  );

  settingsPanel.style(
    "overflow-y",
    "auto"
  );


  let title =
    createElement(
      "h3",
      "설정"
    );

  title.parent(
    settingsPanel
  );

  title.style(
    "margin",
    "0 0 15px 0"
  );


  // ========================================
  // 색상
  // ========================================

  wallColor =
    createColorRow(
      "벽 색",
      "#282828"
    ).color;

  roadColor =
    createColorRow(
      "길 색",
      "#ffffff"
    ).color;

  vroadColor =
    createColorRow(
      "방문 색",
      "#b4d2ff"
    ).color;

  pathColor =
    createColorRow(
      "경로 색",
      "#ffc832"
    ).color;

  playerColor =
    createColorRow(
      "플레이어 색",
      "#ff3399"
    ).color;

  startColor =
    createColorRow(
      "출발점 색",
      "#00c850"
    ).color;

  endColor =
    createColorRow(
      "도착점 색",
      "#e63c3c"
    ).color;


  // ========================================
  // 무지개 모드
  // ========================================

  let rainbowRow = createDiv();

  rainbowRow.parent(
    settingsPanel
  );

  rainbowRow.style(
    "display",
    "flex"
  );

  rainbowRow.style(
    "align-items",
    "center"
  );

  rainbowRow.style(
    "justify-content",
    "space-between"
  );

  rainbowRow.style(
    "width",
    "100%"
  );

  rainbowRow.style(
    "margin-top",
    "15px"
  );

  rainbowRow.style(
    "padding-top",
    "10px"
  );

  rainbowRow.style(
    "border-top",
    "1px solid #ddd"
  );

  rainbowRow.style(
    "margin-bottom",
    "10px"
  );


  let rainbowText =
    createElement(
      "span",
      "염병 모드"
    );

  rainbowText.parent(
    rainbowRow
  );


  rainbowMode =
    createCheckbox(
      "",
      false
    );

  rainbowMode.parent(
    rainbowRow
  );


  // ========================================
  // 무지개 속도
  // ========================================

  let rainbowSpeedRow =
    createDiv();

  rainbowSpeedRow.parent(
    settingsPanel
  );

  rainbowSpeedRow.style(
    "display",
    "flex"
  );

  rainbowSpeedRow.style(
    "align-items",
    "center"
  );

  rainbowSpeedRow.style(
    "justify-content",
    "space-between"
  );

  rainbowSpeedRow.style(
    "width",
    "100%"
  );

  rainbowSpeedRow.style(
    "margin-bottom",
    "15px"
  );


  let rainbowSpeedText =
    createElement(
      "span",
      "염병 속도"
    );

  rainbowSpeedText.parent(
    rainbowSpeedRow
  );


  rainbowSlider =
    createSlider(
      0,
      100,
      50
    );

  rainbowSlider.parent(
    rainbowSpeedRow
  );

  rainbowSlider.size(90);


  // ========================================
  // 탐색 방식
  // ========================================

  let modeRow =
    createDiv();

  modeRow.parent(
    settingsPanel
  );

  modeRow.style(
    "margin-bottom",
    "15px"
  );


  let modeText =
    createElement(
      "span",
      "탐색 방식"
    );

  modeText.parent(
    modeRow
  );


  autoMode =
    createRadio();

  autoMode.parent(
    modeRow
  );

  autoMode.option(
    "auto",
    "자동 탐색"
  );

  autoMode.option(
    "manual",
    "수동 탐색"
  );

  autoMode.selected(
    "auto"
  );


  autoMode.changed(() => {

    mode =
      autoMode.value();

    lastStepTime =
      millis();

    lastManualStepTime =
      millis();
  });


  // ========================================
  // 여기에는 처음에는 최단거리 모드가 없음
  // ========================================


  // ========================================
  // 닫기 버튼
  // ========================================

  let closeBtn =
    createButton("닫기");

  closeBtn.parent(
    settingsPanel
  );

  closeBtn.size(
    225,
    30
  );

  closeBtn.mousePressed(
    toggleSettings
  );


  positionSettingsPanel();

  settingsPanel.hide();
}


// ========================================
// 최단거리 설정 생성
// 구매했을 때만 호출됨
// ========================================

function createShortestPathSetting() {

  // 이미 생성되어 있으면 다시 만들지 않음
  if (shortestPathRow) {
    return;
  }


  shortestPathRow =
    createDiv();

  shortestPathRow.parent(
    settingsPanel
  );

  shortestPathRow.style(
    "display",
    "flex"
  );

  shortestPathRow.style(
    "align-items",
    "center"
  );

  shortestPathRow.style(
    "justify-content",
    "space-between"
  );

  shortestPathRow.style(
    "width",
    "100%"
  );

  shortestPathRow.style(
    "padding-top",
    "10px"
  );

  shortestPathRow.style(
    "border-top",
    "1px solid #ddd"
  );

  shortestPathRow.style(
    "margin-bottom",
    "15px"
  );


  let shortestPathText =
    createElement(
      "span",
      "최단거리 모드"
    );

  shortestPathText.parent(
    shortestPathRow
  );


  shortestPathMode =
    createCheckbox(
      "",
      false
    );

  shortestPathMode.parent(
    shortestPathRow
  );


  shortestPathMode.changed(() => {

    shortestPathIndex = 0;

    shortestPath = [];


    if (
      shortestPathMode.checked()
    ) {

      calculateShortestPath();

    } else {

      shortestPath = [];

      shortestPathIndex = 0;
    }
  });


  // 최단거리 색상 설정도 구매 후에만 등장
  shortestPathColor =
    createColorRow(
      "최단거리 색",
      "#9b5de5"
    ).color;


  positionSettingsPanel();
}


// ========================================
// 색상 선택
// ========================================

function createColorRow(
  label,
  defaultColor
) {

  let row = createDiv();

  row.parent(
    settingsPanel
  );

  row.style(
    "display",
    "flex"
  );

  row.style(
    "align-items",
    "center"
  );

  row.style(
    "justify-content",
    "space-between"
  );

  row.style(
    "width",
    "100%"
  );

  row.style(
    "margin-bottom",
    "10px"
  );


  let t =
    createElement(
      "span",
      label
    );

  t.parent(row);


  let color =
    createColorPicker(
      defaultColor
    );

  color.parent(row);


  return {
    row: row,
    color: color
  };
}


// ========================================
// 설정창 위치
// ========================================

function positionSettingsPanel() {

  if (!settingsPanel) {
    return;
  }

  let panelHeight =
    shortestPathUnlocked
      ? 440
      : 390;


  settingsPanel.size(
    260,
    panelHeight
  );


  settingsPanel.position(
    (windowWidth - 260) / 2,
    (windowHeight - panelHeight) / 2
  );
}


// ========================================
// 설정 토글
// ========================================

function toggleSettings() {

  settingsOpen =
    !settingsOpen;


  if (settingsOpen) {

    storeOpen = false;

    storePanel.hide();

    positionSettingsPanel();

    settingsPanel.show();

  } else {

    settingsPanel.hide();
  }
}


// ========================================
// 상점
// ========================================

function createStore() {

  storePanel =
    createDiv();

  storePanel.size(
    420,
    300
  );

  storePanel.style(
    "background",
    "white"
  );

  storePanel.style(
    "border",
    "2px solid #333"
  );

  storePanel.style(
    "border-radius",
    "10px"
  );

  storePanel.style(
    "padding",
    "15px"
  );

  storePanel.style(
    "box-sizing",
    "border-box"
  );

  storePanel.style(
    "box-shadow",
    "0 4px 15px rgba(0, 0, 0, 0.3)"
  );

  storePanel.style(
    "overflow-y",
    "auto"
  );


  let title =
    createElement(
      "h3",
      "상점"
    );

  title.parent(
    storePanel
  );

  title.style(
    "margin",
    "0 0 15px 0"
  );


  for (
    let item of storeItems
  ) {

    let row =
      createDiv();

    row.parent(
      storePanel
    );

    row.style(
      "display",
      "flex"
    );

    row.style(
      "align-items",
      "center"
    );

    row.style(
      "justify-content",
      "space-between"
    );

    row.style(
      "width",
      "100%"
    );

    row.style(
      "margin-bottom",
      "10px"
    );


    let t =
      createElement(
        "span",
        `${item.name} - ${item.price}원`
      );

    t.parent(row);

    item.priceText = t;


    let buyBtn =
      createButton(
        "구매하기"
      );

    buyBtn.parent(row);

    buyBtn.mousePressed(
      () => buyItem(item)
    );
  }


  let closeBtn =
    createButton("닫기");

  closeBtn.parent(
    storePanel
  );

  closeBtn.size(
    390,
    30
  );

  closeBtn.mousePressed(
    toggleStore
  );


  positionStorePanel();

  storePanel.hide();
}


// ========================================
// 상점 위치
// ========================================

function positionStorePanel() {

  if (!storePanel) {
    return;
  }

  storePanel.position(
    (windowWidth - 420) / 2,
    (windowHeight - 300) / 2
  );
}


// ========================================
// 아이템 구매
// ========================================

function buyItem(item) {

  // 이미 최단거리 모드를 구매한 경우
  if (
    item.type === 4 &&
    shortestPathUnlocked
  ) {

    errorMessage =
      "이미 구매한 아이템입니다!";

    errorTime =
      millis();

    return;
  }


  if (
    money < item.price
  ) {

    errorMessage =
      "돈이 부족합니다!";

    errorTime =
      millis();

    return;
  }


  money -= item.price;


  // ========================================
  // 이동 속도
  // ========================================

  if (
    item.type === 1
  ) {

    c_speed += 3;

    item.price += 50;
  }


  // ========================================
  // 보상 증가
  // ========================================

  else if (
    item.type === 2
  ) {

    money_level += 0.5;

    item.price *= 2;
  }


  // ========================================
  // 돈 버튼 강화
  // ========================================

  else if (
    item.type === 3
  ) {

    givemoney *= 2;

    item.price += 100;
  }


  // ========================================
  // 최단거리 모드
  // ========================================

  else if (
    item.type === 4
  ) {

    shortestPathUnlocked =
      true;


    // 상점 표시 변경
    item.priceText.html(
      `${item.name} - 구매 완료`
    );


    // ★ 구매한 순간 설정에 추가
    createShortestPathSetting();


    // 최단거리 계산
    calculateShortestPath();
  }


  if (
    item.type !== 4
  ) {

    item.priceText.html(
      `${item.name} - ${item.price}원`
    );
  }
}


// ========================================
// 상점 토글
// ========================================

function toggleStore() {

  storeOpen =
    !storeOpen;


  if (storeOpen) {

    settingsOpen = false;

    settingsPanel.hide();

    positionStorePanel();

    storePanel.show();

  } else {

    storePanel.hide();
  }
}


// ========================================
// 미로 생성
// ========================================

function generateMaze(x, y) {

  let shuffledDirections =
    shuffle([
      ...directions
    ]);


  for (
    let direction of shuffledDirections
  ) {

    let nx =
      x + direction[0];

    let ny =
      y + direction[1];


    if (
      nx >= 1 &&
      nx < w - 1 &&
      ny >= 1 &&
      ny < h - 1 &&
      mapData[ny][nx] === 1
    ) {

      let wallX =
        x +
        direction[0] / 2;

      let wallY =
        y +
        direction[1] / 2;


      mapData[wallY][wallX] =
        0;

      mapData[ny][nx] =
        0;


      generateMaze(
        nx,
        ny
      );
    }
  }
}


// ========================================
// 새 미로
// ========================================

function newMap() {

  mapData = [];


  for (
    let r = 0;
    r < h;
    r++
  ) {

    mapData[r] = [];


    for (
      let c = 0;
      c < w;
      c++
    ) {

      mapData[r][c] = 1;
    }
  }


  mapData[start.r][start.c] =
    0;


  generateMaze(
    start.c,
    start.r
  );


  initMaze();


  lastStepTime =
    millis();

  lastManualStepTime =
    millis();


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


// ========================================
// 미로 초기화
// ========================================

function initMaze() {

  isFinished = false;

  path = [];
  visited = [];


  for (
    let r = 0;
    r < h;
    r++
  ) {

    visited[r] = [];


    for (
      let c = 0;
      c < w;
      c++
    ) {

      visited[r][c] =
        false;
    }
  }


  path.push({
    r: start.r,
    c: start.c
  });


  visited[start.r][start.c] =
    true;
}


// ========================================
// BFS 최단거리 계산
// ========================================

function calculateShortestPath() {

  shortestPath = [];

  shortestPathIndex = 0;


  if (
    !mapData.length
  ) {

    return;
  }


  let queue = [];

  let visitedBFS = [];

  let parent = [];


  for (
    let r = 0;
    r < h;
    r++
  ) {

    visitedBFS[r] = [];
    parent[r] = [];


    for (
      let c = 0;
      c < w;
      c++
    ) {

      visitedBFS[r][c] =
        false;

      parent[r][c] =
        null;
    }
  }


  queue.push({
    r: start.r,
    c: start.c
  });


  visitedBFS[start.r][start.c] =
    true;


  let found = false;


  while (
    queue.length > 0
  ) {

    let current =
      queue.shift();


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


    for (
      let d of bfsDirections
    ) {

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
        !visitedBFS[nextR][nextC]
      ) {

        visitedBFS[nextR][nextC] =
          true;


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


  let current = {
    r: goal.r,
    c: goal.c
  };


  while (
    current !== null
  ) {

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


    current =
      parent[
        current.r
      ][
        current.c
      ];
  }


  shortestPath.reverse();
}


// ========================================
// 무지개 색상
// ========================================

function getRainbowColor(
  offset
) {

  let rainbowSpeed =
    rainbowSlider.value();


  let hueVal =
    (
      frameCount *
      rainbowSpeed *
      0.024 +
      offset
    ) % 360;


  return color(
    hueVal,
    100,
    100
  );
}


// ========================================
// DRAW
// ========================================

function draw() {

  colorMode(
    RGB,
    255
  );

  background(240);


  // ========================================
  // 자금
  // ========================================

  moneyText.html(
    `자금 : ${money.toFixed(1)}원`
  );


  // ========================================
  // 자동 탐색
  // ========================================

  if (
    mode === "auto" &&
    !isFinished &&
    !settingsOpen &&
    !storeOpen &&
    c_speed > 0
  ) {

    let stepsPerSecond =
      map(
        c_speed,
        1,
        50,
        1,
        120
      );


    let stepInterval =
      1000 /
      stepsPerSecond;


    if (
      millis() -
      lastStepTime >=
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


      lastStepTime =
        millis();
    }
  }


  // ========================================
  // 수동 탐색
  // ========================================

  if (
    mode === "manual" &&
    !isFinished &&
    !settingsOpen &&
    !storeOpen
  ) {

    let stepsPerSecond =
      map(
        c_speed,
        1,
        50,
        1,
        120
      );


    let stepInterval =
      1000 /
      stepsPerSecond;


    if (
      millis() -
      lastManualStepTime >=
      stepInterval
    ) {

      let dr = 0;
      let dc = 0;


      if (
        keyIsDown(UP_ARROW) ||
        keyIsDown(87)
      ) {

        dr = -1;

      } else if (
        keyIsDown(DOWN_ARROW) ||
        keyIsDown(83)
      ) {

        dr = 1;

      } else if (
        keyIsDown(LEFT_ARROW) ||
        keyIsDown(65)
      ) {

        dc = -1;

      } else if (
        keyIsDown(RIGHT_ARROW) ||
        keyIsDown(68)
      ) {

        dc = 1;
      }


      if (
        dr !== 0 ||
        dc !== 0
      ) {

        manualMove(
          dr,
          dc
        );
      }
    }
  }


  // ========================================
  // 미로
  // ========================================

  push();

  colorMode(
    HSB,
    360,
    100,
    100,
    255
  );


  for (
    let r = 0;
    r < h;
    r++
  ) {

    for (
      let c = 0;
      c < w;
      c++
    ) {

      let x =
        mazeX +
        c * CELL;

      let y =
        mazeY +
        r * CELL;


      // 벽 / 길

      if (
        mapData[r][c] === 1
      ) {

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


      // 방문

      if (
        visited[r][c]
      ) {

        fill(
          rainbowMode.checked()
            ? getRainbowColor(60)
            : vroadColor.value()
        );


        rect(
          x + CELL * 0.08,
          y + CELL * 0.08,
          CELL * 0.84,
          CELL * 0.84
        );
      }
    }
  }


  // ========================================
  // 최단거리
  // ========================================

  if (
    shortestPathUnlocked &&
    shortestPathMode &&
    shortestPathMode.checked()
  ) {

    drawShortestPath();
  }


  // ========================================
  // 지나온 경로
  // ========================================

  for (
    let i = 0;
    i < path.length - 1;
    i++
  ) {

    let p =
      path[i];


    fill(
      rainbowMode.checked()
        ? getRainbowColor(120)
        : pathColor.value()
    );


    rect(
      mazeX +
      p.c * CELL +
      CELL * 0.17,

      mazeY +
      p.r * CELL +
      CELL * 0.17,

      CELL * 0.66,

      CELL * 0.66
    );
  }


  // ========================================
  // 출발점
  // ========================================

  fill(
    rainbowMode.checked()
      ? getRainbowColor(240)
      : startColor.value()
  );


  rect(
    mazeX +
    start.c * CELL +
    CELL * 0.17,

    mazeY +
    start.r * CELL +
    CELL * 0.17,

    CELL * 0.66,

    CELL * 0.66
  );


  // ========================================
  // 도착점
  // ========================================

  fill(
    rainbowMode.checked()
      ? getRainbowColor(300)
      : endColor.value()
  );


  rect(
    mazeX +
    goal.c * CELL +
    CELL * 0.17,

    mazeY +
    goal.r * CELL +
    CELL * 0.17,

    CELL * 0.66,

    CELL * 0.66
  );


  // ========================================
  // 플레이어
  // ========================================

  if (
    path.length > 0
  ) {

    let player =
      path[path.length - 1];


    fill(
      rainbowMode.checked()
        ? getRainbowColor(150)
        : playerColor.value()
    );


    rect(
      mazeX +
      player.c * CELL +
      CELL * 0.125,

      mazeY +
      player.r * CELL +
      CELL * 0.125,

      CELL * 0.75,

      CELL * 0.75
    );
  }


  pop();


  // ========================================
  // 오류 메시지
  // ========================================

  if (
    millis() -
    errorTime <
    1500
  ) {

    fill(
      230,
      60,
      60
    );

    textSize(16);

    text(
      errorMessage,
      10,
      windowHeight - 65
    );
  }
}


// ========================================
// 최단거리 그리기
// ========================================

function drawShortestPath() {

  if (
    shortestPath.length === 0
  ) {

    return;
  }


  fill(
    rainbowMode.checked()
      ? getRainbowColor(90)
      : shortestPathColor.value()
  );


  noStroke();


  for (
    let p of shortestPath
  ) {

    rect(
      mazeX +
      p.c * CELL +
      CELL * 0.29,

      mazeY +
      p.r * CELL +
      CELL * 0.29,

      CELL * 0.42,

      CELL * 0.42
    );
  }


  stroke(180);
}


// ========================================
// DFS 탐색
// ========================================

function dfsStep() {

  if (
    path.length === 0
  ) {

    isFinished = true;

    return;
  }


  let current =
    path[path.length - 1];


  // 도착

  if (
    current.r === goal.r &&
    current.c === goal.c
  ) {

    money +=
      10 * money_level;


    newMap();

    return;
  }


  let dirs =
    shuffle([
      { r: 0, c: 1 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
      { r: -1, c: 0 }
    ]);


  for (
    let d of dirs
  ) {

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

      visited[nextR][nextC] =
        true;


      path.push({
        r: nextR,
        c: nextC
      });


      return;
    }
  }


  // 백트래킹

  path.pop();
}


// ========================================
// BFS 탐색
// ========================================

function bfsStep() {

  if (
    shortestPath.length === 0
  ) {

    calculateShortestPath();


    if (
      shortestPath.length === 0
    ) {

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
    shortestPath[
      shortestPathIndex
    ];


  path.push({
    r: current.r,
    c: current.c
  });


  visited[
    current.r
  ][
    current.c
  ] = true;


  shortestPathIndex++;


  // 도착

  if (
    current.r === goal.r &&
    current.c === goal.c
  ) {

    money +=
      10 * money_level;


    newMap();
  }
}


// ========================================
// 수동 이동
// ========================================

function manualMove(
  dr,
  dc
) {

  if (
    path.length === 0
  ) {

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


  if (
    mapData[nextR][nextC] === 1
  ) {

    return;
  }


  // 뒤로 이동

  if (
    path.length >= 2 &&
    path[path.length - 2].r === nextR &&
    path[path.length - 2].c === nextC
  ) {

    path.pop();

    lastManualStepTime =
      millis();

    return;
  }


  visited[nextR][nextC] =
    true;


  path.push({
    r: nextR,
    c: nextC
  });


  lastManualStepTime =
    millis();


  // 도착

  if (
    nextR === goal.r &&
    nextC === goal.c
  ) {

    money +=
      10 * money_level;


    newMap();
  }
}
