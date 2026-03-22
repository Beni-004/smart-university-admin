const DEMO_API = 'http://localhost:8000/api';

// DOM refs
const tabChat   = document.getElementById('tab-chat');
const tabDemo   = document.getElementById('tab-demo');
const chatPanel = document.getElementById('chat-panel');
const demoPanel = document.getElementById('demo-panel');

// Presenter state
let allCategories   = [];
let allQueries      = [];
let currentIndex    = 0;
let categoryData    = {};
let demoInitialised = false;

// ── Tab switching ──
tabChat.addEventListener('click', () => {
  tabChat.classList.add('active');
  tabDemo.classList.remove('active');
  chatPanel.style.display = '';
  demoPanel.style.display = 'none';
});

tabDemo.addEventListener('click', () => {
  tabDemo.classList.add('active');
  tabChat.classList.remove('active');
  chatPanel.style.display = 'none';
  demoPanel.style.display = '';
  if (!demoInitialised) { demoInitialised = true; initPresenter(); }
});

// Keyboard nav
document.addEventListener('keydown', (e) => {
  if (demoPanel.style.display === 'none') return;
  if (e.key === 'ArrowRight') presenterNext();
  if (e.key === 'ArrowLeft')  presenterPrev();
});

// ── Init ──
async function initPresenter() {
  try {
    const res  = await fetch(`${DEMO_API}/demo/categories`);
    const data = await res.json();
    allCategories = data.categories;
    renderCategoryPills();
    await Promise.all(allCategories.map(cat => loadCategory(cat.id)));
    buildFlatList();
    showQuery(0);
  } catch (err) {
    document.getElementById('presenter-card').style.display = 'none';
    document.getElementById('demo-loading').style.display   = 'none';
    document.getElementById('presenter-view').innerHTML =
      `<p class="demo-error-msg">⚠️ Failed to load: ${err.message}</p>`;
  }
}

async function loadCategory(id) {
  const res  = await fetch(`${DEMO_API}/demo/${id}`);
  const data = await res.json();
  categoryData[id] = data;
}

function buildFlatList() {
  allQueries = [];
  allCategories.forEach(cat => {
    const data = categoryData[cat.id];
    if (!data) return;
    data.queries.forEach(q => {
      allQueries.push({ catId: cat.id, label: cat.label,
                        section: data.section, query: q });
    });
  });
}

function renderCategoryPills() {
  const bar = document.getElementById('demo-category-pills');
  bar.innerHTML = '';
  allCategories.forEach(cat => {
    const pill = document.createElement('button');
    pill.className = `cat-pill badge-${cat.section.replace('.', '-')}`;
    pill.dataset.id = cat.id;
    pill.textContent = cat.label;
    pill.addEventListener('click', () => jumpToCategory(cat.id));
    bar.appendChild(pill);
  });
}

function jumpToCategory(id) {
  const idx = allQueries.findIndex(q => q.catId === id);
  if (idx !== -1) showQuery(idx);
}

function presenterNext() {
  if (currentIndex < allQueries.length - 1) showQuery(currentIndex + 1);
}

function presenterPrev() {
  if (currentIndex > 0) showQuery(currentIndex - 1);
}

function showQuery(idx) {
  currentIndex = idx;
  const item = allQueries[idx];

  // Counter
  document.getElementById('presenter-counter').textContent =
    `${idx + 1} / ${allQueries.length}`;

  // Prev/next
  document.getElementById('prev-btn').disabled = idx === 0;
  document.getElementById('next-btn').disabled = idx === allQueries.length - 1;

  // Highlight active pill
  document.querySelectorAll('.cat-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.id === item.catId);
  });

  // Badge
  const badgeClass = `badge-${item.section.replace('.', '-')}`;
  const badge = document.getElementById('presenter-badge');
  badge.className = `pill-badge ${badgeClass}`;
  badge.textContent = item.section;

  document.getElementById('presenter-title').textContent    = item.query.title;
  document.getElementById('presenter-question').textContent = item.query.question;
  document.getElementById('presenter-sql').textContent      = item.query.sql;

  // Table
  const wrap  = document.getElementById('presenter-table-wrap');
  const errEl = document.getElementById('presenter-error');

  if (item.query.error) {
    wrap.innerHTML = '';
    errEl.style.display = 'block';
    errEl.textContent   = '⚠️ ' + item.query.error;
  } else {
    errEl.style.display = 'none';
    if (item.query.columns.length > 0 && item.query.rows.length > 0) {
      wrap.innerHTML = buildDemoTable(item.query.columns,
                                      item.query.rows,
                                      item.query.row_count);
    } else {
      wrap.innerHTML = '<p class="demo-empty">No rows returned.</p>';
    }
  }

  document.getElementById('presenter-card').style.display = 'block';
}

function buildDemoTable(columns, rows, rowCount) {
  let html = `<div class="demo-table-wrap">`;
  html += `<div class="demo-table-header">
    <span class="demo-row-count">${rowCount} row${rowCount !== 1 ? 's' : ''}</span>
  </div>`;
  html += `<div class="demo-table-scroll"><table class="demo-table"><thead><tr>`;
  columns.forEach(col => { html += `<th>${escapeHtml(col)}</th>`; });
  html += `</tr></thead><tbody>`;
  rows.forEach(row => {
    html += '<tr>';
    row.forEach(val => {
      html += `<td>${val !== null && val !== '' ? escapeHtml(String(val)) : '-'}</td>`;
    });
    html += '</tr>';
  });
  html += `</tbody></table></div></div>`;
  return html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
