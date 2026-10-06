/* ── State ──────────────────────────────────────────────────────── */
let gridData   = [];   // 2-D array of cell types
let startPos   = [];   // [row, col]
let targetPos  = [];   // [row, col]
let isRunning  = false;
let animTimers = [];   // keep track of setTimeout handles for cancel

const results = { bfs: null, dfs: null };

/* ── Boot ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadGrid();
});

async function loadGrid() {
  try {
    const res  = await fetch('/api/grid');
    const data = await res.json();
    gridData  = data.grid;
    startPos  = data.start;
    targetPos = data.target;
    renderGrid();
  } catch (err) {
    setStatus('Failed to load grid from server.');
  }
}

/* ── Grid Rendering ─────────────────────────────────────────────── */
function renderGrid() {
  const container = document.getElementById('grid-container');
  container.innerHTML = '';

  gridData.forEach((row, r) => {
    row.forEach((cell, c) => {
      const div = document.createElement('div');
      div.className = 'cell';
      div.id = cellId(r, c);

      if (cell === '#') {
        div.classList.add('wall');
      } else if (cell === 'S') {
        div.classList.add('start');
        div.textContent = 'S';
      } else if (cell === 'T') {
        div.classList.add('treasure');
        div.textContent = 'T';
      }

      container.appendChild(div);
    });
  });
}

function cellId(r, c) {
  return `cell-${r}-${c}`;
}

function getCell(r, c) {
  return document.getElementById(cellId(r, c));
}

/* ── Algorithm Runner ───────────────────────────────────────────── */
async function runAlgorithm(algo) {
  if (isRunning) return;

  clearAnimation();
  isRunning = true;
  setButtonsDisabled(true);
  setStatus('Running…');
  updateInfoPanel(algo);

  try {
    const res  = await fetch(`/api/${algo}`, { method: 'POST' });
    const data = await res.json();

    // Update stats
    document.getElementById('stat-algo').textContent  = data.algorithm;
    document.getElementById('stat-nodes').textContent = data.nodes_visited;
    document.getElementById('stat-path').textContent  = data.found ? data.path_length : 'N/A';

    // Store for comparison
    results[algo] = data;

    if (!data.found) {
      animate(data.visited_order, [], () => {
        setStatus('Treasure cannot be reached from the starting position.');
        finishRun();
      });
      return;
    }

    animate(data.visited_order, data.path, () => {
      setStatus(`${data.algorithm} complete — path found!`);
      updateComparisonTable();
      finishRun();
    });

  } catch (err) {
    setStatus('Server error. Please try again.');
    finishRun();
  }
}

/* ── Animation ──────────────────────────────────────────────────── */
const VISIT_DELAY = 120;  // ms between each visited node
const PATH_DELAY  = 80;   // ms between each path node

function animate(visitedOrder, path, onComplete) {
  let t = 0;

  visitedOrder.forEach(([r, c]) => {
    const cell = getCell(r, c);
    if (!cell) return;

    // Light up as "exploring"
    animTimers.push(setTimeout(() => {
      if (!cell.classList.contains('start') && !cell.classList.contains('treasure')) {
        cell.classList.add('visiting');
      }
    }, t));

    // Settle to "visited"
    animTimers.push(setTimeout(() => {
      if (!cell.classList.contains('start') && !cell.classList.contains('treasure')) {
        cell.classList.remove('visiting');
        cell.classList.add('visited');
      }
    }, t + VISIT_DELAY * 0.8));

    t += VISIT_DELAY;
  });

  // After all visits, animate the path
  if (path.length > 0) {
    path.forEach(([r, c], i) => {
      animTimers.push(setTimeout(() => {
        const cell = getCell(r, c);
        if (!cell) return;
        if (!cell.classList.contains('start') && !cell.classList.contains('treasure')) {
          cell.classList.remove('visited', 'visiting');
          cell.classList.add('path');
        }
      }, t + i * PATH_DELAY));
    });
    t += path.length * PATH_DELAY;
  }

  animTimers.push(setTimeout(onComplete, t + 200));
}

/* ── Reset ──────────────────────────────────────────────────────── */
function resetGrid() {
  clearAnimation();
  renderGrid();
  document.getElementById('stat-algo').textContent   = '—';
  document.getElementById('stat-nodes').textContent  = '—';
  document.getElementById('stat-path').textContent   = '—';
  setStatus('Ready to search for treasure.');
  setButtonsDisabled(false);
  isRunning = false;
}

function clearAnimation() {
  animTimers.forEach(clearTimeout);
  animTimers = [];
}

function finishRun() {
  isRunning = false;
  setButtonsDisabled(false);
}

/* ── Info Panel ─────────────────────────────────────────────────── */
const INFO = {
  bfs: {
    title:    'BFS – Breadth First Search',
    desc:     'Explores the graph level by level, visiting all neighbours before moving deeper.',
    struct:   'Queue (FIFO)',
    time:     'O(V + E)',
    space:    'O(V)',
    property: 'Finds the shortest path in an unweighted graph.',
  },
  dfs: {
    title:    'DFS – Depth First Search',
    desc:     'Explores one branch as deeply as possible before backtracking.',
    struct:   'Stack (LIFO)',
    time:     'O(V + E)',
    space:    'O(V)',
    property: 'Does not guarantee the shortest path.',
  },
};

function updateInfoPanel(algo) {
  const info = INFO[algo];
  const el   = document.getElementById('info-content');
  el.innerHTML = `
    <p class="info-title">${info.title}</p>
    <p style="margin-bottom:.8rem;font-size:.88rem;color:var(--muted)">${info.desc}</p>
    <div class="info-row"><span class="info-label">Data Structure</span><span>${info.struct}</span></div>
    <div class="info-row"><span class="info-label">Time Complexity</span><span>${info.time}</span></div>
    <div class="info-row"><span class="info-label">Space Complexity</span><span>${info.space}</span></div>
    <div class="info-row"><span class="info-label">Property</span><span>${info.property}</span></div>
  `;
}

/* ── Comparison Table ───────────────────────────────────────────── */
function updateComparisonTable() {
  const { bfs: b, dfs: d } = results;
  if (!b && !d) return;

  const msg   = document.getElementById('compare-msg');
  const table = document.getElementById('compare-table');

  if (b && d) {
    msg.classList.add('hidden');
    table.classList.remove('hidden');
    document.getElementById('c-bfs-nodes').textContent = b.nodes_visited;
    document.getElementById('c-dfs-nodes').textContent = d.nodes_visited;
    document.getElementById('c-bfs-path').textContent  = b.found ? b.path_length : 'N/A';
    document.getElementById('c-dfs-path').textContent  = d.found ? d.path_length : 'N/A';
  } else {
    msg.textContent = 'Run both BFS and DFS to compare results.';
    msg.classList.remove('hidden');
  }
}

/* ── Helpers ────────────────────────────────────────────────────── */
function setStatus(msg) {
  document.getElementById('stat-status').textContent = msg;
}

function setButtonsDisabled(disabled) {
  document.getElementById('btn-bfs').disabled   = disabled;
  document.getElementById('btn-dfs').disabled   = disabled;
  document.getElementById('btn-reset').disabled = disabled;
}
