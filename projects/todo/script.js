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
  const html = document.documentElement;

  // Theme Logic
  const savedTheme = safeStorage.getItem('todo-theme') || 'dark';
  if (html) html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (!html) return;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      safeStorage.setItem('todo-theme', next);
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

  // Set Date
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString(undefined, options);
  }

  // App State
  let tasks;
  try {
    tasks = JSON.parse(safeStorage.getItem('todo-tasks') || '[]');
  } catch (e) {
    console.error("Failed to parse todo-tasks. Resetting to empty list.", e);
    tasks = [];
  }
  if (!Array.isArray(tasks)) {
    tasks = [];
  }
  let currentCategory = 'all';
  let currentStatusFilter = 'all';
  let searchQuery = '';

  // Elements
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const taskCategory = document.getElementById('taskCategory');
  const taskPriority = document.getElementById('taskPriority');
  const taskDueDate = document.getElementById('taskDueDate');
  const tasksContainer = document.getElementById('tasksContainer');
  const searchTask = document.getElementById('searchTask');

  // Badges & Progress
  const countAll = document.getElementById('countAll');
  const countWork = document.getElementById('countWork');
  const countPersonal = document.getElementById('countPersonal');
  const countStudy = document.getElementById('countStudy');
  const progressFill = document.getElementById('progressFill');
  const completedPercentage = document.getElementById('completedPercentage');

  // Category and Status filters
  const categoryTitle = document.getElementById('categoryTitle');
  const catLinks = document.querySelectorAll('.cat-link');
  const filterBtns = document.querySelectorAll('.filter-btn');

  catLinks.forEach(link => {
    link.addEventListener('click', () => {
      catLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      currentCategory = link.getAttribute('data-cat');
      if (categoryTitle) categoryTitle.textContent = currentCategory === 'all' ? 'All Tasks' : capitalize(currentCategory);
      renderTasks();
    });
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatusFilter = btn.getAttribute('data-filter');
      renderTasks();
    });
  });

  if (searchTask) {
    searchTask.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderTasks();
    });
  }

  // Task Submission
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!taskInput) return;
      const text = taskInput.value.trim();
      if (!text) return;

      const newTask = {
        id: Date.now().toString(),
        title: text,
        category: taskCategory ? taskCategory.value : 'personal',
        priority: taskPriority ? taskPriority.value : 'medium',
        dueDate: taskDueDate ? (taskDueDate.value || null) : null,
        completed: false
      };

      tasks.push(newTask);
      saveTasks();
      taskForm.reset();
      renderTasks();
    });
  }

  function saveTasks() {
    safeStorage.setItem('todo-tasks', JSON.stringify(tasks));
    updateStats();
  }

  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    
    // Percent
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (progressFill) progressFill.style.width = percent + '%';
    if (completedPercentage) completedPercentage.textContent = percent + '%';

    // Counts
    if (countAll) countAll.textContent = total;
    if (countWork) countWork.textContent = tasks.filter(t => t.category === 'work').length;
    if (countPersonal) countPersonal.textContent = tasks.filter(t => t.category === 'personal').length;
    if (countStudy) countStudy.textContent = tasks.filter(t => t.category === 'study').length;
  }

  function renderTasks() {
    if (!tasksContainer) return;
    tasksContainer.innerHTML = '';
    
    let filtered = tasks;

    // Category filter
    if (currentCategory !== 'all') {
      filtered = filtered.filter(t => t.category === currentCategory);
    }

    // Status filter
    if (currentStatusFilter === 'active') {
      filtered = filtered.filter(t => !t.completed);
    } else if (currentStatusFilter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => t.title && t.title.toLowerCase().includes(searchQuery));
    }

    if (filtered.length === 0) {
      tasksContainer.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 40px 0;">No tasks found.</p>';
      return;
    }

    // Sort: incomplete first, then by priority (high > medium > low) safely
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const weightA = priorityWeight[a.priority] || 2;
      const weightB = priorityWeight[b.priority] || 2;
      return weightB - weightA;
    });

    filtered.forEach(task => {
      const card = document.createElement('div');
      card.className = `task-card ${task.completed ? 'completed' : ''}`;
      
      let dateString = '';
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        dateString = `<span class="meta-date"><i data-lucide="calendar"></i> ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>`;
      }

      card.innerHTML = `
        <div class="task-left">
          <button class="checkbox-btn ${task.completed ? 'checked' : ''}" aria-label="Toggle Complete">
            <i data-lucide="check"></i>
          </button>
          <div class="task-details">
            <span class="task-title">${escapeHTML(task.title)}</span>
            <div class="task-meta">
              <span class="meta-tag cat-tag">${capitalize(task.category)}</span>
              <span class="meta-tag pri-${task.priority}">${task.priority}</span>
              ${dateString}
            </div>
          </div>
        </div>
        <div class="task-right">
          <button class="action-btn delete" aria-label="Delete Task"><i data-lucide="trash-2"></i></button>
        </div>
      `;

      // Checkbox Toggle
      const checkBtn = card.querySelector('.checkbox-btn');
      if (checkBtn) {
        checkBtn.addEventListener('click', () => {
          task.completed = !task.completed;
          saveTasks();
          renderTasks();
        });
      }

      // Delete Toggle
      const deleteBtn = card.querySelector('.action-btn.delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          tasks = tasks.filter(t => t.id !== task.id);
          saveTasks();
          renderTasks();
        });
      }

      tasksContainer.appendChild(card);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Initial render
  updateStats();
  renderTasks();
});
