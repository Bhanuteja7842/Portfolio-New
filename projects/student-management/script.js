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
  const savedTheme = safeStorage.getItem('sms-theme') || 'dark';
  if (html) html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (!html) return;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      safeStorage.setItem('sms-theme', next);
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

  // Initial Mock Database
  const initialStudents = [
    {
      id: "1",
      rollNo: "SU-2025-101",
      name: "Gundeti Bhanuteja",
      course: "bca",
      email: "gundetibhanute012@gmail.com",
      date: "2025-06-15"
    },
    {
      id: "2",
      rollNo: "SU-2025-102",
      name: "Anjali Sharma",
      course: "bsc",
      email: "anjali@university.com",
      date: "2025-06-18"
    },
    {
      id: "3",
      rollNo: "SU-2025-103",
      name: "Rohan Varma",
      course: "btech",
      email: "rohan@university.com",
      date: "2025-06-20"
    }
  ];

  // App State
  let students;
  try {
    students = JSON.parse(safeStorage.getItem('sms-students'));
  } catch (e) {
    console.error("Failed to parse sms-students. Resetting to initial list.", e);
    students = null;
  }
  if (!students || !Array.isArray(students)) {
    students = initialStudents;
    safeStorage.setItem('sms-students', JSON.stringify(students));
  }

  let searchQuery = '';
  let courseFilterVal = 'all';

  // Elements
  const studentsTableBody = document.getElementById('studentsTableBody');
  const searchStudent = document.getElementById('searchStudent');
  const courseFilter = document.getElementById('courseFilter');
  
  const studentModal = document.getElementById('studentModal');
  const addStudentBtn = document.getElementById('addStudentBtn');
  const closeModal = document.getElementById('closeModal');
  const cancelForm = document.getElementById('cancelForm');
  const studentForm = document.getElementById('studentForm');

  const editStudentId = document.getElementById('editStudentId');
  const rollNoInput = document.getElementById('rollNo');
  const fullNameInput = document.getElementById('fullName');
  const courseInput = document.getElementById('studentCourse');
  const emailInput = document.getElementById('studentEmail');
  const dateInput = document.getElementById('admissionDate');

  const statTotal = document.getElementById('statTotal');
  const statCourses = document.getElementById('statCourses');

  // Modal Toggles
  if (addStudentBtn) {
    addStudentBtn.addEventListener('click', () => {
      openModalForm();
    });
  }

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      closeModalForm();
    });
  }

  if (cancelForm) {
    cancelForm.addEventListener('click', () => {
      closeModalForm();
    });
  }

  function openModalForm(student = null) {
    if (!studentForm) return;
    studentForm.reset();
    if (student) {
      const modalTitleEl = document.getElementById('modalTitle');
      if (modalTitleEl) modalTitleEl.textContent = 'Edit Student Details';
      if (editStudentId) editStudentId.value = student.id;
      if (rollNoInput) {
        rollNoInput.value = student.rollNo;
        rollNoInput.setAttribute('disabled', 'true');
      }
      if (fullNameInput) fullNameInput.value = student.name;
      if (courseInput) courseInput.value = student.course;
      if (emailInput) emailInput.value = student.email;
      if (dateInput) dateInput.value = student.date;
    } else {
      const modalTitleEl = document.getElementById('modalTitle');
      if (modalTitleEl) modalTitleEl.textContent = 'Register Student';
      if (editStudentId) editStudentId.value = '';
      if (rollNoInput) {
        rollNoInput.removeAttribute('disabled');
      }
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }
    }
    if (studentModal) studentModal.style.display = 'flex';
  }

  function closeModalForm() {
    if (studentModal) studentModal.style.display = 'none';
  }

  // Form Submit (Add / Edit)
  if (studentForm) {
    studentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = editStudentId ? editStudentId.value : '';
      const studentData = {
        rollNo: rollNoInput ? rollNoInput.value.trim() : '',
        name: fullNameInput ? fullNameInput.value.trim() : '',
        course: courseInput ? courseInput.value : 'bca',
        email: emailInput ? emailInput.value.trim() : '',
        date: dateInput ? dateInput.value : ''
      };

      if (id) {
        // Edit mode
        const idx = students.findIndex(s => s.id === id);
        if (idx !== -1) {
          students[idx] = { ...students[idx], ...studentData };
        }
      } else {
        // Add mode
        // Check duplicate roll number
        const rollExists = students.some(s => s.rollNo.toLowerCase() === studentData.rollNo.toLowerCase());
        if (rollExists) {
          alert("A student with this Roll Number is already registered!");
          return;
        }
        studentData.id = Date.now().toString();
        students.push(studentData);
      }

      saveStudents();
      closeModalForm();
      renderTable();
    });
  }

  function saveStudents() {
    safeStorage.setItem('sms-students', JSON.stringify(students));
    updateStats();
  }

  function updateStats() {
    if (statTotal) statTotal.textContent = students.length;
    // Calculate course count
    const uniqueCourses = new Set(students.map(s => s.course));
    if (statCourses) statCourses.textContent = Math.max(3, uniqueCourses.size);
  }

  // Filter Event Listeners
  if (searchStudent) {
    searchStudent.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderTable();
    });
  }

  if (courseFilter) {
    courseFilter.addEventListener('change', (e) => {
      courseFilterVal = e.target.value;
      renderTable();
    });
  }

  // Table Render
  function renderTable() {
    if (!studentsTableBody) return;
    studentsTableBody.innerHTML = '';
    
    let filtered = students.filter(s => {
      const nameStr = s.name ? s.name.toLowerCase() : '';
      const rollStr = s.rollNo ? s.rollNo.toLowerCase() : '';
      const emailStr = s.email ? s.email.toLowerCase() : '';

      const matchesSearch = nameStr.includes(searchQuery) ||
                            rollStr.includes(searchQuery) ||
                            emailStr.includes(searchQuery);
                            
      const matchesCourse = courseFilterVal === 'all' || s.course === courseFilterVal;
      
      return matchesSearch && matchesCourse;
    });

    if (filtered.length === 0) {
      studentsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 40px;">
            No students found.
          </td>
        </tr>
      `;
      return;
    }

    // Sort by roll number ascending safely
    filtered.sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || ''));

    filtered.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 500;">${escapeHTML(s.rollNo)}</td>
        <td style="font-weight: 600;">${escapeHTML(s.name)}</td>
        <td style="text-transform: uppercase; font-size: 0.8rem; font-weight: bold; color: var(--accent-1);">${s.course}</td>
        <td>${escapeHTML(s.email)}</td>
        <td>${escapeHTML(s.date)}</td>
        <td class="table-row-actions">
          <button class="action-btn edit-btn" aria-label="Edit student"><i data-lucide="edit-3"></i></button>
          <button class="action-btn delete-btn" aria-label="Delete student"><i data-lucide="trash-2"></i></button>
        </td>
      `;

      // Edit Event
      tr.querySelector('.edit-btn').addEventListener('click', () => {
        openModalForm(s);
      });

      // Delete Event
      tr.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm(`Are you sure you want to remove student "${s.name}"?`)) {
          students = students.filter(item => item.id !== s.id);
          saveStudents();
          renderTable();
        }
      });

      studentsTableBody.appendChild(tr);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Initial runs
  updateStats();
  renderTable();
});
