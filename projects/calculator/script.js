// ========== SAFE STORAGE WRAPPERS ==========
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access denied. Using in-memory fallback.");
      return safeStorage.fallbackStore[key] || null;
    }
  },
  setItem: (key, val) => {
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      console.warn("Storage access denied. Using in-memory fallback.");
      safeStorage.fallbackStore[key] = val;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage access denied. Using in-memory fallback.");
      delete safeStorage.fallbackStore[key];
    }
  },
  fallbackStore: {}
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Theme Logic
  const savedTheme = safeStorage.getItem('calc-theme') || 'dark';
  if (body) body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (!body) return;
      const current = body.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', next);
      safeStorage.setItem('calc-theme', next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (!icon) return;
    if (theme === 'light') {
      icon.setAttribute('data-lucide', 'sun');
    } else {
      icon.setAttribute('data-lucide', 'moon');
    }
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // Calculator State
  let expr = '0';
  let shouldReset = false;
  let history;
  try {
    history = JSON.parse(safeStorage.getItem('calc-history') || '[]');
  } catch (e) {
    console.error("Failed to parse calc-history. Resetting to empty array.", e);
    history = [];
  }
  if (!Array.isArray(history)) {
    history = [];
  }

  // Elements
  const displayExpr = document.getElementById('expression');
  const displayResult = document.getElementById('result');
  const displayPreview = document.getElementById('historyPreview');
  const keypad = document.getElementById('keypad');
  const historyPanel = document.getElementById('historyPanel');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistory');

  // Tabs
  const btnStandard = document.getElementById('btnStandard');
  const btnScientific = document.getElementById('btnScientific');
  const btnHistory = document.getElementById('btnHistory');

  if (btnStandard) btnStandard.addEventListener('click', () => switchTab('standard'));
  if (btnScientific) btnScientific.addEventListener('click', () => switchTab('scientific'));
  if (btnHistory) btnHistory.addEventListener('click', () => switchTab('history'));

  function switchTab(mode) {
    [btnStandard, btnScientific, btnHistory].forEach(b => {
      if (b) b.classList.remove('active');
    });
    
    if (mode === 'standard') {
      if (btnStandard) btnStandard.classList.add('active');
      if (keypad) { keypad.style.display = 'grid'; keypad.classList.remove('sci-active'); }
      if (historyPanel) historyPanel.style.display = 'none';
    } else if (mode === 'scientific') {
      if (btnScientific) btnScientific.classList.add('active');
      if (keypad) { keypad.style.display = 'grid'; keypad.classList.add('sci-active'); }
      if (historyPanel) historyPanel.style.display = 'none';
    } else if (mode === 'history') {
      if (btnHistory) btnHistory.classList.add('active');
      if (keypad) keypad.style.display = 'none';
      if (historyPanel) historyPanel.style.display = 'flex';
      renderHistory();
    }
  }

  // Keypad Click Event
  if (keypad) {
    keypad.addEventListener('click', (e) => {
      const key = e.target.closest('.key');
      if (!key) return;

      const val = key.getAttribute('data-val');
      const op = key.getAttribute('data-op');

      if (val) {
        handleValue(val);
      } else if (op) {
        handleOperator(op);
      }
      updateDisplay();
    });
  }

  function handleValue(val) {
    if (expr === '0' || shouldReset) {
      expr = val;
      shouldReset = false;
    } else {
      expr += val;
    }
  }

  function handleOperator(op) {
    if (shouldReset && op !== 'equal') {
      shouldReset = false;
    }

    switch (op) {
      case 'clear':
        expr = '0';
        if (displayResult) displayResult.textContent = '';
        if (displayPreview) displayPreview.textContent = '';
        break;
      case 'backspace':
        if (expr.length > 1) {
          expr = expr.slice(0, -1);
        } else {
          expr = '0';
        }
        break;
      case 'percent':
        expr += '%';
        break;
      case 'brackets':
        handleBrackets();
        break;
      case 'add': expr += '+'; break;
      case 'sub': expr += '-'; break;
      case 'mul': expr += '×'; break;
      case 'div': expr += '÷'; break;
      case 'equal':
        evaluateExpression();
        break;
      // Scientific keys
      case 'sin': appendSciFunc('sin('); break;
      case 'cos': appendSciFunc('cos('); break;
      case 'tan': appendSciFunc('tan('); break;
      case 'log': appendSciFunc('log('); break;
      case 'ln': appendSciFunc('ln('); break;
      case 'pi':
        if (expr === '0' || shouldReset) { expr = 'π'; shouldReset = false; }
        else { expr += 'π'; }
        break;
      case 'e':
        if (expr === '0' || shouldReset) { expr = 'e'; shouldReset = false; }
        else { expr += 'e'; }
        break;
      case 'pow':
        expr += '^';
        break;
      case 'sqrt':
        appendSciFunc('√(');
        break;
      case 'exp':
        expr += 'e';
        break;
    }
  }

  function appendSciFunc(func) {
    if (expr === '0' || shouldReset) {
      expr = func;
      shouldReset = false;
    } else {
      expr += func;
    }
  }

  function handleBrackets() {
    const openCount = (expr.match(/\(/g) || []).length;
    const closeCount = (expr.match(/\)/g) || []).length;
    const lastChar = expr.slice(-1);

    if (expr === '0' || shouldReset) {
      expr = '(';
      shouldReset = false;
    } else if (openCount > closeCount && !'+-×÷^('.includes(lastChar)) {
      expr += ')';
    } else {
      expr += '(';
    }
  }

  function evaluateExpression() {
    let mathExpr = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/');

    // Replace Euler's 'e' while preserving scientific notations (like 2e3 or 1.5e-5)
    mathExpr = mathExpr.replace(/([0-9.]*)e([+-]?[0-9]*)/g, (match, p1, p2) => {
      if (p1 === '') {
        return 'Math.E' + p2;
      }
      return match;
    });

    mathExpr = mathExpr
      .replace(/π/g, 'Math.PI')
      .replace(/%/g, '/100')
      .replace(/\^/g, '**')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/√\(/g, 'Math.sqrt(');

    try {
      let mathResult = new Function(`return ${mathExpr}`)();
      
      if (mathResult === undefined || isNaN(mathResult)) {
        if (displayResult) displayResult.textContent = 'Error';
        return;
      }

      // Format result
      if (typeof mathResult === 'number' && !Number.isInteger(mathResult)) {
        mathResult = Math.round(mathResult * 100000000) / 100000000;
      }

      if (displayResult) displayResult.textContent = mathResult;
      if (displayPreview) displayPreview.textContent = expr + ' =';
      
      // Save to History
      saveHistory(expr, mathResult);
      
      expr = mathResult.toString();
      shouldReset = true;
    } catch (err) {
      if (displayResult) displayResult.textContent = 'Error';
    }
  }

  function updateDisplay() {
    if (!displayExpr) return;
    displayExpr.textContent = expr;
    // Auto scale font size if expression is too long
    if (expr.length > 10) {
      displayExpr.style.fontSize = '1.6rem';
    } else {
      displayExpr.style.fontSize = '2.2rem';
    }
  }

  function saveHistory(expression, resultVal) {
    if (expression === resultVal.toString()) return;
    const item = { expr: expression, res: resultVal };
    history.unshift(item);
    if (history.length > 20) history.pop();
    safeStorage.setItem('calc-history', JSON.stringify(history));
  }

  function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = '';
    if (history.length === 0) {
      historyList.innerHTML = '<p class="no-history">No history yet</p>';
      return;
    }

    history.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <span class="hist-expr">${escapeHTML(item.expr)}</span>
        <span class="hist-res">${escapeHTML(item.res.toString())}</span>
      `;
      div.addEventListener('click', () => {
        expr = item.expr;
        if (displayResult) displayResult.textContent = '';
        if (displayPreview) displayPreview.textContent = '';
        switchTab('standard');
        updateDisplay();
      });
      historyList.appendChild(div);
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      history = [];
      safeStorage.removeItem('calc-history');
      renderHistory();
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});
