const API_BASE_URL = (window.APP_CONFIG?.apiBase) ?? 'http://localhost:8000/api';

// DOM Elements
const userInput     = document.getElementById('user-input');
const sendBtn       = document.getElementById('send-btn');
const chatMessages  = document.getElementById('chat-messages');
const resultsContainer = document.getElementById('results-container');
const resultsEmpty  = document.getElementById('results-empty');
const sqlCode       = document.getElementById('sql-code');
const resultsTable  = document.getElementById('results-table');
const loadingDiv    = document.getElementById('loading');
const loadingMessage = document.getElementById('loading-message');
const executionTime = document.getElementById('execution-time');
const cacheStatusEl = document.getElementById('cache-status');
const cacheSize     = document.getElementById('cache-size');

// Enter key to send
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendQuery();
});

// Send query to backend
async function sendQuery() {
    const question = userInput.value.trim();
    if (!question) return;

    // Add user message to chat
    addMessage(question, 'user');

    // Clear input
    userInput.value = '';

    // Show loading, hide results
    showLoading('Analyzing your question...');
    hideResults();
    disableInput(true);

    try {
        setTimeout(() => updateLoadingMessage('Finding relevant tables...'), 500);
        setTimeout(() => updateLoadingMessage('Generating SQL query...'), 1500);
        setTimeout(() => updateLoadingMessage('Executing query...'), 3000);

        const response = await fetch(`${API_BASE_URL}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Query failed');
        }

        const data = await response.json();
        displayResults(data);
        addMessage(`✅ Query executed successfully! Found ${data.results.row_count} rows.`, 'bot');
    } catch (error) {
        console.error('Error:', error);
        addMessage(`❌ Error: ${error.message}`, 'error');
        hideResults();
    } finally {
        hideLoading();
        disableInput(false);
        updateCacheStats();
    }
}

// Display query results
function displayResults(data) {
    resultsEmpty.style.display = 'none';
    resultsContainer.style.display = 'flex';

    sqlCode.textContent = data.sql;

    executionTime.textContent = `⏱ Execution Time: ${data.execution_time.toFixed(2)}s`;

    if (data.cached) {
        cacheStatusEl.textContent = '💾 Cached Result';
        cacheStatusEl.style.background = '#D1FAE5';
        cacheStatusEl.style.color = '#059669';
    } else {
        cacheStatusEl.textContent = '🔄 Fresh Result';
        cacheStatusEl.style.background = '#EEF2FF';
        cacheStatusEl.style.color = '#4F46E5';
    }

    buildTable(data.results);
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Build HTML table from results
function buildTable(results) {
    const { columns, rows } = results;

    if (!rows || rows.length === 0) {
        resultsTable.innerHTML = '<tbody><tr><td style="padding:20px;text-align:center;color:#9CA3AF;">No results found</td></tr></tbody>';
        return;
    }

    let html = '<thead><tr>';
    columns.forEach(col => { html += `<th>${col}</th>`; });
    html += '</tr></thead><tbody>';

    rows.forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
            const value = row[col];
            html += `<td>${value !== null && value !== undefined ? value : '-'}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody>';
    resultsTable.innerHTML = html;
}

// Add message to chat
function addMessage(text, type) {
    const div = document.createElement('div');

    if (type === 'user') {
        div.className = 'msg msg-user';
        div.innerHTML = `
            <div class="msg-label">User:</div>
            <div class="msg-bubble user-bubble">${escapeHTML(text)}</div>
        `;
    } else if (type === 'error') {
        div.className = 'msg msg-error';
        div.innerHTML = `
            <div class="msg-label">AI:</div>
            <div class="msg-bubble">${escapeHTML(text)}</div>
        `;
    } else {
        div.className = 'msg msg-bot';
        div.innerHTML = `
            <div class="msg-label">AI:</div>
            <div class="msg-bubble bot-bubble">${escapeHTML(text)}</div>
        `;
    }

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHTML(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Loading helpers
function showLoading(message) {
    resultsEmpty.style.display = 'none';
    loadingDiv.style.display = 'flex';
    loadingMessage.textContent = message;
}

function hideLoading() {
    loadingDiv.style.display = 'none';
}

function updateLoadingMessage(message) {
    loadingMessage.textContent = message;
}

function hideResults() {
    resultsContainer.style.display = 'none';
    resultsEmpty.style.display = 'flex';
}

// Enable/disable input
function disableInput(disabled) {
    userInput.disabled = disabled;
    sendBtn.disabled = disabled;
}

// Copy SQL to clipboard
function copySQL() {
    const sql = sqlCode.textContent;
    const btn = document.getElementById('copy-sql-btn');
    navigator.clipboard.writeText(sql).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy SQL'; }, 1500);
    });
}

// Clear chat
function clearChat() {
    chatMessages.innerHTML = `
        <div class="msg msg-bot">
            <div class="msg-label">AI:</div>
            <div class="msg-bubble bot-bubble">Chat cleared. Ask a new question!</div>
        </div>
    `;
    hideResults();
}

// Clear cache
async function clearCache() {
    try {
        const response = await fetch(`${API_BASE_URL}/cache/clear`, { method: 'DELETE' });
        if (response.ok) {
            updateCacheStats();
        }
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
}

// Update cache stats
async function updateCacheStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/cache/stats`);
        const data = await response.json();
        cacheSize.textContent = data.cache_size;
    } catch (error) {
        console.error('Error fetching cache stats:', error);
    }
}

// Init
window.addEventListener('load', () => {
    updateCacheStats();
    userInput.focus();
});
