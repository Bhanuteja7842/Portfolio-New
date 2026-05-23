/* ============================================
   PORTFOLIO SITE — MAIN JAVASCRIPT
   ============================================ */

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

const safeSession = {
  getItem: (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      return safeSession.fallbackStore[key] || null;
    }
  },
  setItem: (key, val) => {
    try {
      sessionStorage.setItem(key, val);
    } catch (e) {
      safeSession.fallbackStore[key] = val;
    }
  },
  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      delete safeSession.fallbackStore[key];
    }
  },
  fallbackStore: {}
};

document.addEventListener('DOMContentLoaded', () => {

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ========== LOADING SCREEN ==========
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
      if (typeof animateStats === 'function') animateStats();
    }, 800);
  });
  // Fallback to hide loader after 3 seconds
  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
    if (typeof animateStats === 'function') animateStats();
  }, 3000);

  // ========== CUSTOM CURSOR ==========
  const cursorDot = document.getElementById('cursorDot');
  const cursorOutline = document.getElementById('cursorOutline');
  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    }
  });

  function animateCursor() {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    if (cursorOutline) {
      cursorOutline.style.left = outlineX + 'px';
      cursorOutline.style.top = outlineY + 'px';
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Cursor hover effects
  const hoverElements = document.querySelectorAll('a, button, .project-card, .filter-btn, .social-link, input, textarea, .chat-float, .close-chat');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (cursorDot) cursorDot.classList.add('hover');
      if (cursorOutline) cursorOutline.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      if (cursorDot) cursorDot.classList.remove('hover');
      if (cursorOutline) cursorOutline.classList.remove('hover');
    });
  });

  // ========== NAVBAR ==========
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  // Hamburger toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('open');
    });
  }

  // Close menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (hamburger) hamburger.classList.remove('active');
      if (navMenu) navMenu.classList.remove('open');
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  function updateActiveNav() {
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[data-section="${id}"]`);
      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav);

  // ========== THEME TOGGLE ==========
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const savedTheme = safeStorage.getItem('portfolio-theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      safeStorage.setItem('portfolio-theme', next);
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }

  // ========== TYPING EFFECT ==========
  const typedTextEl = document.getElementById('typedText');
  const words = ['BCA Student', 'Fullstack Developer', 'Ethical Hacking', 'Problem Solver'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    if (!typedTextEl) return;
    const currentWord = words[wordIndex];
    if (isDeleting) {
      typedTextEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 50;
    } else {
      typedTextEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 400; // Pause before new word
    }

    setTimeout(type, typeSpeed);
  }
  if (typedTextEl) type();

  // ========== SCROLL REVEAL ==========
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  revealElements.forEach(el => revealObserver.observe(el));

  // ========== SKILL BARS ANIMATION ==========
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  const skillsSection = document.getElementById('skills');
  let skillsAnimated = false;

  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !skillsAnimated) {
        skillsAnimated = true;
        skillBars.forEach((bar, index) => {
          setTimeout(() => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
            bar.classList.add('animated');
          }, index * 100);
        });
        skillsObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });
  if (skillsSection) skillsObserver.observe(skillsSection);

  // ========== STAT COUNTER ANIMATION ==========
  const statNumbers = document.querySelectorAll('.stat-number');
  
  function animateStats() {
    statNumbers.forEach(target => {
      if (target.classList.contains('animated')) return;
      target.classList.add('animated');
      const count = parseInt(target.getAttribute('data-count')) || 0;
      let current = 0;
      const duration = 1500; // 1.5 seconds total duration
      const steps = 40;
      const stepTime = duration / steps;
      const increment = count / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= count) {
          current = count;
          clearInterval(timer);
        }
        target.textContent = Math.floor(current);
      }, stepTime);
    });
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  statNumbers.forEach(el => statsObserver.observe(el));

  // ========== PROJECT FILTERING ==========
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeInUp 0.5s ease-out forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ========== CONTACT FORM ==========
  const contactForm = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('.btn-submit');
      if (submitBtn) submitBtn.classList.add('loading');

      // Simulate form submission
      setTimeout(() => {
        if (submitBtn) submitBtn.classList.remove('loading');
        contactForm.reset();
        showToast('Message sent successfully! I\'ll get back to you soon.');
      }, 1500);
    });
  }

  function showToast(message) {
    if (toast && toastMessage) {
      toastMessage.textContent = message;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
    }
  }

  // ========== BACK TO TOP ==========
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (backToTop) {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  });
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========== SMOOTH ANCHOR LINKS ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ========== PARALLAX ORBS ON MOUSE MOVE ==========
  const heroSection = document.getElementById('hero');
  const orbs = document.querySelectorAll('.hero-orb');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 15;
        orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    });
  }

  // ========== CODING BACKGROUND MATRIX EFFECT ==========
  const canvas = document.getElementById('coding-bg');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const matrixWords = ["Java", "Python", "Bhanu", "Hacking", "Fullstack", "JS", "Binary", "0101"];
    let w = canvas.width = canvas.parentElement.offsetWidth;
    let h = canvas.height = canvas.parentElement.offsetHeight;
    const cols = Math.floor(w / 100);
    const drops = Array(cols).fill(0).map(() => Math.random() * -50);

    function drawMatrix() {
      // Draw semi-transparent background to create trailing effect
      const isLight = html.getAttribute('data-theme') === 'light';
      ctx.fillStyle = isLight ? "rgba(248, 250, 252, 0.12)" : "rgba(11, 15, 25, 0.12)";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = isLight ? "rgba(99, 102, 241, 0.15)" : "rgba(167, 139, 250, 0.22)";
      ctx.font = "14px monospace";

      drops.forEach((y, i) => {
        const text = matrixWords[Math.floor(Math.random() * matrixWords.length)];
        ctx.fillText(text, i * 100 + 10, y * 20);
        if (y * 20 > h && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      });
    }
    setInterval(drawMatrix, 60);

    window.addEventListener('resize', () => {
      if (canvas && canvas.parentElement) {
        w = canvas.width = canvas.parentElement.offsetWidth;
        h = canvas.height = canvas.parentElement.offsetHeight;
      }
    });
  }

  // ========== CHAT WIDGET LOGIC ==========
  const chatWidget = document.getElementById('chat-widget');
  const openChatBtn = document.getElementById('open-chat');
  const closeChatBtn = document.getElementById('close-chat');
  const dmForm = document.getElementById('directMessageForm');
  const dmSuccess = document.getElementById('dm-success');

  if (openChatBtn && chatWidget) {
    openChatBtn.addEventListener('click', () => {
      chatWidget.style.display = chatWidget.style.display === 'flex' ? 'none' : 'flex';
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }

  if (closeChatBtn && chatWidget) {
    closeChatBtn.addEventListener('click', () => {
      chatWidget.style.display = 'none';
    });
  }

  if (dmForm) {
    dmForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('dm-name').value;
      const email = document.getElementById('dm-email').value;
      const message = document.getElementById('dm-message').value;
      const date = new Date().toLocaleString();

      const newMessage = { name, email, message, date };
      let messages = JSON.parse(safeStorage.getItem('site_messages') || '[]');
      messages.unshift(newMessage);
      safeStorage.setItem('site_messages', JSON.stringify(messages));

      dmForm.style.display = 'none';
      if (dmSuccess) dmSuccess.style.display = 'flex';

      // Reload admin messages if currently viewing them
      if (safeSession.getItem('admin_logged_in') === 'true') {
        loadMessages();
      }

      setTimeout(() => {
        dmForm.reset();
        dmForm.style.display = 'block';
        if (dmSuccess) dmSuccess.style.display = 'none';
        chatWidget.style.display = 'none';
        showToast("Message sent to Local Database!");
      }, 2000);
    });
  }

  // ========== ADMIN INBOX LOGIC ==========
  const adminLogin = document.getElementById('admin-login');
  const adminContent = document.getElementById('admin-content');
  const adminPassInput = document.getElementById('admin-password');
  const loginError = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const clearMessagesBtn = document.getElementById('clear-messages');
  const messagesContainer = document.getElementById('messages-container');

  const ADMIN_PASSWORD = "LAHARI";
  let autoLockTimer;

  function resetTimer() {
    if (safeSession.getItem('admin_logged_in') === 'true') {
      clearTimeout(autoLockTimer);
      autoLockTimer = setTimeout(() => {
        lockInbox();
        showToast("Inbox auto-locked due to inactivity.");
      }, 30000); // 30s auto-lock
    }
  }

  function lockInbox() {
    if (adminLogin && adminContent) {
      adminLogin.style.display = 'block';
      adminContent.style.display = 'none';
      safeSession.removeItem('admin_logged_in');
      if (adminPassInput) adminPassInput.value = '';
    }
  }

  function unlockInbox() {
    if (adminLogin && adminContent) {
      adminLogin.style.display = 'none';
      adminContent.style.display = 'block';
      safeSession.setItem('admin_logged_in', 'true');
      loadMessages();
      resetTimer();
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }

  function loadMessages() {
    if (!messagesContainer) return;
    const msgs = JSON.parse(safeStorage.getItem('site_messages') || '[]');
    if (msgs.length === 0) {
      messagesContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-tertiary); padding: 20px 0;">No messages received yet.</p>';
    } else {
      messagesContainer.innerHTML = msgs.map(m => `
        <div class="message-card">
          <div class="message-header">
            <strong>${escapeHTML(m.name)}</strong>
            <span>${escapeHTML(m.date)}</span>
          </div>
          <p>${escapeHTML(m.message)}</p>
          <small><i data-lucide="mail" style="width:12px;height:12px;vertical-align:middle;"></i> ${escapeHTML(m.email)}</small>
        </div>
      `).join('');
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (adminPassInput && adminPassInput.value === ADMIN_PASSWORD) {
        if (loginError) loginError.style.display = 'none';
        unlockInbox();
      } else {
        if (loginError) loginError.style.display = 'block';
      }
    });
  }

  // Allow enter key to submit password
  if (adminPassInput) {
    adminPassInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (loginBtn) loginBtn.click();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      lockInbox();
    });
  }

  if (clearMessagesBtn) {
    clearMessagesBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to delete all messages? This action cannot be undone.")) {
        safeStorage.removeItem('site_messages');
        loadMessages();
        showToast("Inbox cleared.");
      }
    });
  }

  // Auto-login check on page load
  if (safeSession.getItem('admin_logged_in') === 'true') {
    unlockInbox();
  }

  // Reset auto-lock timers on activity
  ['mousemove', 'mousedown', 'keypress', 'scroll'].forEach(e => {
    window.addEventListener(e, resetTimer);
  });

});
