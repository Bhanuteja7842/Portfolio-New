document.addEventListener('DOMContentLoaded', () => {
  // Initialize icons
  lucide.createIcons();

  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('userInput');
  const typingIndicator = document.getElementById('typingIndicator');
  const suggestedQueries = document.getElementById('suggestedQueries');
  const clearChat = document.getElementById('clearChat');

  // Query Suggestion Click
  suggestedQueries.addEventListener('click', (e) => {
    const btn = e.target.closest('.suggest-btn');
    if (!btn) return;
    const query = btn.getAttribute('data-query');
    sendUserMessage(query);
  });

  // Clear Chat History
  clearChat.addEventListener('click', () => {
    if (confirm("Reset conversation?")) {
      chatMessages.innerHTML = `
        <div class="message bot">
          <div class="msg-avatar"><i data-lucide="cpu"></i></div>
          <div class="msg-content">
            <p>Hello! I am **Aether**, Gundeti Bhanuteja's portfolio AI. I can tell you about his programming skills, education, work experience, or explain concepts in web development and cybersecurity! What would you like to know?</p>
            <span class="msg-time">Just now</span>
          </div>
        </div>
      `;
      lucide.createIcons();
    }
  });

  // Submit handler
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = userInput.value.trim();
    if (query) {
      sendUserMessage(query);
      userInput.value = '';
    }
  });

  function sendUserMessage(text) {
    appendMessage(text, 'user');
    showTypingIndicator();
    
    // Simulate AI response delay
    const delay = 1000 + Math.random() * 800;
    setTimeout(() => {
      hideTypingIndicator();
      const reply = getAIResponse(text);
      appendMessage(reply, 'bot');
    }, delay);
  }

  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const avatarIcon = sender === 'user' ? 'user' : 'cpu';

    msgDiv.innerHTML = `
      <div class="msg-avatar"><i data-lucide="${avatarIcon}"></i></div>
      <div class="msg-content">
        <p>${parseMarkdown(text)}</p>
        <span class="msg-time">${time}</span>
      </div>
    `;

    chatMessages.appendChild(msgDiv);
    lucide.createIcons();
    scrollToBottom();
  }

  function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
  }

  function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function parseMarkdown(text) {
    // Simple markdown Bold parsing (**text**)
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  // Conversation AI Engine
  function getAIResponse(input) {
    const clean = input.toLowerCase();

    if (contains(clean, ['bhanu', 'bhanuteja', 'who is', 'about'])) {
      return "**Gundeti Bhanuteja** is a motivated and detail-oriented **Bachelor of Computer Applications (BCA)** student at KIMS Degree & PG College, Karimnagar. He specializes in **Fullstack Web Development** and **Ethical Hacking**, building secure, modern digital applications.";
    }

    if (contains(clean, ['skills', 'skill', 'programming', 'languages', 'know', 'tech'])) {
      return "Bhanuteja's technology stack includes:\n\n" +
             "• **Languages**: C, JavaScript, Java (Learning), Python (Learning)\n" +
             "• **Web Development**: HTML, CSS, React, Node.js\n" +
             "• **Databases**: MySQL, MongoDB\n" +
             "• **Tools**: Git, GitHub, VS Code, Linux bash commands.";
    }

    if (contains(clean, ['education', 'study', 'college', 'school', 'qualifications'])) {
      return "Here is Bhanuteja's educational record:\n\n" +
             "1. **BCA (2nd Year)** — KIMS Degree & PG College, Karimnagar (Affiliated to Satavahana University) [2025 — 2028]\n" +
             "2. **Intermediate MPC** — Telangana Minority Residential Junior College (Score: **497/1000**) [2022 — 2024]\n" +
             "3. **Secondary School Certificate (SSC)** — ZPHS Choppadandi Boys (GPA: **7.2**) [2022]";
    }

    if (contains(clean, ['experience', 'work', 'intern', 'internship', 'cognifyz'])) {
      return "He worked as a **Fullstack Developer Intern** at **Cognifyz Technologies** from September to October 2025. During his time there, he worked on developing responsive web UI features using **React** and secure server-side logic in **Node.js**.";
    }

    if (contains(clean, ['hacking', 'hack', 'cyber', 'security', 'ethical', 'tip'])) {
      return "**Ethical Hacking / Cyber Security Tip**:\n\n" +
             "Never trust user input! Always validate, sanitize, and filter all incoming data on the backend (not just client-side) to prevent vulnerabilities like **SQL Injection (SQLi)** and **Cross-Site Scripting (XSS)**. Use parameterized queries for databases and audit your APIs regularly.";
    }

    if (contains(clean, ['fullstack', 'development', 'web dev', 'react', 'node'])) {
      return "**Fullstack Web Development** means working on both the front-end (what users see, e.g., HTML, CSS, React) and the back-end (servers, routing, database APIs, e.g., Node.js, Express, MySQL). Building secure fullstack apps requires secure data transmission, robust database query sanitization, and stateful session security.";
    }

    if (contains(clean, ['hi', 'hello', 'hey', 'greetings'])) {
      return "Hello! How can I help you today? Ask me about Bhanuteja's **skills**, **projects**, **internships**, or ask for a **cybersecurity tip**!";
    }

    if (contains(clean, ['project', 'projects'])) {
      return "He has built several projects: a **Student Management System** (MySQL/Node.js), a **Calculator App** (Scientific modes), a **To-Do App** (Category planners), and this **AI Chatbot**! You can test them all in the **Projects** section of this site.";
    }

    // Default Fallback
    return "I am not sure I understand that query. Try asking: **Who is Bhanuteja?**, **What are his skills?**, or ask for a **hacking tip**!";
  }

  function contains(str, keywords) {
    return keywords.some(k => str.includes(k));
  }
});
