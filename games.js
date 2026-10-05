// =============================================================
// CARMEL ARKIN — Games
// Tic-Tac-Toe (with real minimax on Impossible) + Snake (with
// localStorage best-score, speed control, swipe support).
// =============================================================

(function () {
  // ---- TAB SWITCHER --------------------------------------------------------
  const tabs = document.querySelectorAll(".game-tab");
  const panes = document.querySelectorAll(".game-pane");
  tabs.forEach((t) => {
    t.addEventListener("click", () => {
      tabs.forEach((x) => { x.classList.remove("active"); x.setAttribute("aria-selected", "false"); });
      panes.forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      t.setAttribute("aria-selected", "true");
      document.getElementById("game-" + t.dataset.game).classList.add("active");
      if (t.dataset.game === "snake") drawSnakeIdle();
    });
  });

  // ============================================================
  // TIC-TAC-TOE
  // ============================================================
  const X = "X", O = "O", EMPTY = "";
  const LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];

  let board = Array(9).fill(EMPTY);
  let active = true;
  let difficulty = 1; // 1=easy, 2=medium, 3=hard, 4=impossible (minimax)
  let aiMoveCount = 0;
  const stats = loadStats();
  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("tic-status");
  const newGameBtn = document.getElementById("tic-new");
  const winsEl = document.getElementById("tic-wins");
  const lossEl = document.getElementById("tic-losses");
  const drawEl = document.getElementById("tic-draws");

  function loadStats() {
    try {
      const s = JSON.parse(localStorage.getItem("ca_tic_stats") || "{}");
      return { wins: s.wins | 0, losses: s.losses | 0, draws: s.draws | 0 };
    } catch { return { wins: 0, losses: 0, draws: 0 }; }
  }
  function saveStats() {
    try { localStorage.setItem("ca_tic_stats", JSON.stringify(stats)); } catch {}
  }
  function renderStats() {
    winsEl.textContent = stats.wins;
    lossEl.textContent = stats.losses;
    drawEl.textContent = stats.draws;
  }
  renderStats();

  document.querySelectorAll(".diff-btn").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll(".diff-btn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      difficulty = parseInt(b.dataset.diff, 10);
      newGame();
    });
  });

  function newGame() {
    board = Array(9).fill(EMPTY);
    active = true;
    aiMoveCount = 0;
    boardEl.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const c = document.createElement("button");
      c.className = "cell";
      c.dataset.i = i;
      c.setAttribute("aria-label", "Cell " + (i + 1));
      c.addEventListener("click", onCellClick);
      boardEl.appendChild(c);
    }
    statusEl.textContent = "Your turn";
    statusEl.style.color = "";
  }
  newGameBtn.addEventListener("click", newGame);

  function onCellClick(e) {
    const i = parseInt(e.currentTarget.dataset.i, 10);
    if (!active || board[i] !== EMPTY) return;
    place(i, X);
    if (finishCheck(X)) return;
    statusEl.textContent = "AI is thinking…";
    setTimeout(aiTurn, 300);
  }

  function place(i, player) {
    board[i] = player;
    const c = boardEl.children[i];
    c.textContent = player;
    c.classList.add(player.toLowerCase(), "full");
  }

  function finishCheck(player) {
    const winLine = winningLine(player);
    if (winLine) {
      active = false;
      winLine.forEach((i) => boardEl.children[i].classList.add(player === X ? "win" : "lose"));
      if (player === X) { stats.wins++; statusEl.textContent = "You win 🎉"; statusEl.style.color = "var(--accent)"; }
      else { stats.losses++; statusEl.textContent = "AI wins"; statusEl.style.color = "var(--accent-red)"; }
      saveStats(); renderStats();
      return true;
    }
    if (board.every((v) => v !== EMPTY)) {
      active = false;
      stats.draws++; saveStats(); renderStats();
      statusEl.textContent = "Draw";
      statusEl.style.color = "var(--accent-gold)";
      return true;
    }
    return false;
  }

  function winningLine(player) {
    for (const L of LINES) {
      if (board[L[0]] === player && board[L[1]] === player && board[L[2]] === player) return L;
    }
    return null;
  }

  function aiTurn() {
    if (!active) return;
    let move;
    if (difficulty === 1) move = randomMove();
    else if (difficulty === 2) move = mediumMove();
    else if (difficulty === 3) move = hardMove();
    else move = minimaxMove(); // Impossible
    if (move == null || move < 0) return;
    place(move, O);
    aiMoveCount++;
    if (finishCheck(O)) return;
    statusEl.textContent = "Your turn";
  }

  function emptyCells() { return board.map((v, i) => v === EMPTY ? i : -1).filter((i) => i >= 0); }

  function randomMove() {
    const e = emptyCells();
    return e[Math.floor(Math.random() * e.length)];
  }
  function findThreat(player) {
    for (const L of LINES) {
      const vals = L.map((i) => board[i]);
      if (vals.filter((v) => v === player).length === 2 && vals.filter((v) => v === EMPTY).length === 1) {
        return L[vals.indexOf(EMPTY)];
      }
    }
    return -1;
  }
  function mediumMove() {
    const w = findThreat(O); if (w >= 0) return w;
    const b = findThreat(X); if (b >= 0) return b;
    return randomMove();
  }
  function hardMove() {
    // Strong heuristic — wins, blocks, center, corners. Beatable with optimal play.
    const w = findThreat(O); if (w >= 0) return w;
    const b = findThreat(X); if (b >= 0) return b;
    if (board[4] === EMPTY) return 4;
    const corners = [0, 2, 6, 8].filter((c) => board[c] === EMPTY);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return randomMove();
  }

  // Real minimax for Impossible — never loses.
  function minimaxMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    for (const i of emptyCells()) {
      board[i] = O;
      const score = minimax(board, 0, false);
      board[i] = EMPTY;
      if (score > bestScore) { bestScore = score; bestMove = i; }
    }
    return bestMove;
  }
  function minimax(b, depth, isMax) {
    const winner = staticWinner(b);
    if (winner === O) return 10 - depth;
    if (winner === X) return depth - 10;
    if (b.every((v) => v !== EMPTY)) return 0;

    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) if (b[i] === EMPTY) {
        b[i] = O;
        best = Math.max(best, minimax(b, depth + 1, false));
        b[i] = EMPTY;
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) if (b[i] === EMPTY) {
        b[i] = X;
        best = Math.min(best, minimax(b, depth + 1, true));
        b[i] = EMPTY;
      }
      return best;
    }
  }
  function staticWinner(b) {
    for (const L of LINES) {
      if (b[L[0]] !== EMPTY && b[L[0]] === b[L[1]] && b[L[1]] === b[L[2]]) return b[L[0]];
    }
    return null;
  }

  newGame();

  // ============================================================
  // SNAKE
  // ============================================================
  const canvas = document.getElementById("snakeCanvas");
  const ctx = canvas.getContext("2d");
  const GRID = 20; // 20x20 cells
  const CELL = canvas.width / GRID;
  let snake, dir, nextDir, food, snakeInterval = null, snakeScore = 0, snakeRunning = false;
  let snakeBest = parseInt(localStorage.getItem("ca_snake_best") || "0", 10);

  const snakeScoreEl = document.getElementById("snake-score");
  const snakeBestEl = document.getElementById("snake-best");
  const snakeStatus = document.getElementById("snake-status");
  const snakeSpeed = document.getElementById("snake-speed");
  snakeBestEl.textContent = snakeBest;

  function drawSnakeIdle() {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--bg-card") || "#151515";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawSubtleGrid();
    ctx.fillStyle = "#888";
    ctx.font = "600 16px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Press Start to play", canvas.width / 2, canvas.height / 2);
  }
  function drawSubtleGrid() {
    ctx.strokeStyle = "rgba(255,255,255,0.025)";
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(canvas.width, i * CELL); ctx.stroke();
    }
  }

  function startSnake() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = dir;
    food = newFood();
    snakeScore = 0;
    snakeRunning = true;
    snakeScoreEl.textContent = "0";
    snakeStatus.textContent = "Don't hit the wall, don't bite yourself.";
    snakeStatus.style.color = "";
    if (snakeInterval) clearInterval(snakeInterval);
    snakeInterval = setInterval(tick, parseInt(snakeSpeed.value, 10));
    drawSnake();
  }

  function newFood() {
    while (true) {
      const f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
      if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
    }
  }

  function tick() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || snake.some((s) => s.x === head.x && s.y === head.y)) {
      gameOver(); return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      snakeScore++;
      snakeScoreEl.textContent = String(snakeScore);
      food = newFood();
    } else {
      snake.pop();
    }
    drawSnake();
  }

  function drawSnake() {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--bg-card") || "#151515";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawSubtleGrid();
    // food (pulse)
    const p = Math.sin(Date.now() / 200) * 2;
    ctx.fillStyle = "var(--accent-red)";
    ctx.fillStyle = getCss("--accent-red");
    ctx.fillRect(food.x * CELL + 4 - p, food.y * CELL + 4 - p, CELL - 8 + p * 2, CELL - 8 + p * 2);
    // snake
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? getCss("--accent") : "rgba(74, 222, 128, 0.6)";
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }
  function getCss(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim() || "#4ade80";
  }

  function gameOver() {
    clearInterval(snakeInterval);
    snakeInterval = null;
    snakeRunning = false;
    if (snakeScore > snakeBest) {
      snakeBest = snakeScore;
      localStorage.setItem("ca_snake_best", String(snakeBest));
      snakeBestEl.textContent = snakeBest;
      snakeStatus.textContent = "New best! " + snakeScore + " 🏆";
      snakeStatus.style.color = "var(--accent-gold)";
    } else {
      snakeStatus.textContent = "Game over — score " + snakeScore + ". Press Start to retry.";
      snakeStatus.style.color = "var(--accent-red)";
    }
  }

  document.getElementById("snake-start").addEventListener("click", startSnake);
  snakeSpeed.addEventListener("change", () => {
    if (snakeRunning) {
      clearInterval(snakeInterval);
      snakeInterval = setInterval(tick, parseInt(snakeSpeed.value, 10));
    }
  });

  // ---- INPUT --------------------------------------------------------------
  function turn(d) {
    if (!snakeRunning) return;
    if (d === "up"    && dir.y === 0) nextDir = { x: 0, y: -1 };
    if (d === "down"  && dir.y === 0) nextDir = { x: 0, y: 1 };
    if (d === "left"  && dir.x === 0) nextDir = { x: -1, y: 0 };
    if (d === "right" && dir.x === 0) nextDir = { x: 1, y: 0 };
  }

  document.querySelectorAll("#games .snake-controls button[data-dir]").forEach((b) => {
    b.addEventListener("click", () => turn(b.dataset.dir));
  });

  window.addEventListener("keydown", (e) => {
    // Only intercept when snake pane is active
    const pane = document.getElementById("game-snake");
    if (!pane || !pane.classList.contains("active")) return;
    const k = e.key;
    if (k === "ArrowUp"    || k === "w" || k === "W") { e.preventDefault(); turn("up"); }
    if (k === "ArrowDown"  || k === "s" || k === "S") { e.preventDefault(); turn("down"); }
    if (k === "ArrowLeft"  || k === "a" || k === "A") { e.preventDefault(); turn("left"); }
    if (k === "ArrowRight" || k === "d" || k === "D") { e.preventDefault(); turn("right"); }
  });

  // Swipe gestures on the canvas
  let touchStart = null;
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  canvas.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
      if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? "right" : "left");
      else turn(dy > 0 ? "down" : "up");
    }
    touchStart = null;
  });

  drawSnakeIdle();
})();
