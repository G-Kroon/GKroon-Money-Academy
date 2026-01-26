/* app.js
   Purpose: Minimal client-side logic to power the pilot site.
   - Renders course list from in-memory data
   - Handles enrolment, progress tracking (localStorage)
   - Simple quiz and worksheet submission simulation
   - Modal for course details
   Accessibility: keyboard focus management and ARIA attributes included
*/

/* -------------------------
   Sample course data (3 modules)
   ------------------------- */
const COURSES = [
  {
    id: "m1",
    title: "Budgeting & Cashflow",
    level: "beginner",
    language: "en",
    duration: "2 weeks",
    summary: "Create a realistic monthly budget, set financial goals and build an emergency fund.",
    lessons: [
      { id: "m1-l1", title: "Why budgets matter", length: "6:12" },
      { id: "m1-l2", title: "Zero-based budgeting", length: "7:05" },
      { id: "m1-l3", title: "Cutting expenses without pain", length: "5:30" },
      { id: "m1-l4", title: "Emergency funds and priorities", length: "6:40" }
    ],
    quiz: {
      questions: [
        { q: "What is a zero-based budget?", choices: ["Every rand assigned a purpose", "Spend everything", "Only track income"], a: 0 },
        { q: "Recommended emergency fund length", choices: ["1 week", "3 months", "2 years"], a: 1 }
      ]
    },
    worksheet: {
      id: "m1-w1",
      title: "One-page budget plan",
      instructions: "Map your monthly income and list fixed vs variable expenses. Identify 3 expense cuts."
    }
  },
  {
    id: "m2",
    title: "Credit & Debt Management",
    level: "beginner",
    language: "en",
    duration: "2 weeks",
    summary: "Understand credit scores, loan types and practical strategies to reduce debt costs.",
    lessons: [
      { id: "m2-l1", title: "How credit works", length: "6:00" },
      { id: "m2-l2", title: "Managing loan repayments", length: "7:20" },
      { id: "m2-l3", title: "Negotiating with lenders", length: "5:50" }
    ],
    quiz: {
      questions: [
        { q: "Which factor affects your credit score most?", choices: ["Payment history", "Age", "Favourite bank"], a: 0 },
        { q: "A good first step to reduce debt", choices: ["Ignore it", "Make a repayment plan", "Take another loan"], a: 1 }
      ]
    },
    worksheet: {
      id: "m2-w1",
      title: "Debt reduction plan",
      instructions: "List debts, interest rates and propose a monthly repayment plan to reduce interest costs."
    }
  },
  {
    id: "m3",
    title: "Savings & Basic Investing",
    level: "beginner",
    language: "en",
    duration: "2 weeks",
    summary: "Short-term saving strategies and an introduction to unit trusts and ETFs in South Africa.",
    lessons: [
      { id: "m3-l1", title: "Why save first", length: "5:40" },
      { id: "m3-l2", title: "Intro to unit trusts and ETFs", length: "8:10" },
      { id: "m3-l3", title: "Simple savings plans", length: "6:00" }
    ],
    quiz: {
      questions: [
        { q: "What is diversification?", choices: ["Putting all money in one stock", "Spreading risk across assets", "Saving under a mattress"], a: 1 },
        { q: "ETFs are", choices: ["A type of bank account", "Exchange traded funds", "Insurance"], a: 1 }
      ]
    },
    worksheet: {
      id: "m3-w1",
      title: "Savings plan",
      instructions: "Set a short-term and medium-term savings goal and a monthly contribution plan."
    }
  }
];

/* -------------------------
   Utilities and storage
   ------------------------- */
const STORAGE_KEY = "mma_pilot_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { users: {}, currentUser: null };
  } catch (e) {
    console.error("Failed to load state", e);
    return { users: {}, currentUser: null };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

/* -------------------------
   DOM helpers
   ------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* -------------------------
   Render course list
   ------------------------- */
function renderCourses(filter = {}) {
  const root = $("#course-list");
  root.innerHTML = "";
  const list = COURSES.filter(c => {
    if (filter.level && filter.level !== "all" && c.level !== filter.level) return false;
    if (filter.language && filter.language !== "all" && c.language !== filter.language) return false;
    if (filter.q && !c.title.toLowerCase().includes(filter.q.toLowerCase()) && !c.summary.toLowerCase().includes(filter.q.toLowerCase())) return false;
    return true;
  });

  list.forEach(course => {
    const card = document.createElement("article");
    card.className = "course-card";
    card.setAttribute("role", "listitem");
    card.innerHTML = `
      <h3>${escapeHtml(course.title)}</h3>
      <p class="course-meta">${escapeHtml(course.summary)}</p>
      <p class="course-meta"><strong>Duration</strong> ${course.duration} • <strong>Level</strong> ${course.level}</p>
      <div class="course-actions">
        <button class="btn outline" data-action="details" data-id="${course.id}">Details</button>
        <button class="btn primary" data-action="enrol" data-id="${course.id}">Enrol</button>
      </div>
    `;
    root.appendChild(card);
  });
}

/* -------------------------
   Modal handling
   ------------------------- */
const modal = $("#course-modal");
const modalBody = $("#modal-body");
const modalClose = $("#modal-close");

function openModal(html) {
  modalBody.innerHTML = html;
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "flex";
  modalClose.focus();
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
  $("#start-learning").focus();
}

/* -------------------------
   Course detail view
   ------------------------- */
function showCourseDetails(id) {
  const course = COURSES.find(c => c.id === id);
  if (!course) return;
  const lessonsHtml = course.lessons.map(l => `<li>${escapeHtml(l.title)} <span class="muted">(${l.length})</span></li>`).join("");
  const html = `
    <h2>${escapeHtml(course.title)}</h2>
    <p class="muted">${escapeHtml(course.summary)}</p>
    <h3>Lessons</h3>
    <ul>${lessonsHtml}</ul>
    <h3>Worksheet</h3>
    <p>${escapeHtml(course.worksheet.title)} — ${escapeHtml(course.worksheet.instructions)}</p>
    <div style="margin-top:12px;">
      <button class="btn primary" data-action="enrol" data-id="${course.id}">Enrol in this course</button>
      <button class="btn outline" id="modal-quiz" data-id="${course.id}">Try sample quiz</button>
    </div>
  `;
  openModal(html);
}

/* -------------------------
   Enrolment and user flow
   ------------------------- */
function ensureUser(email, name = "") {
  if (!email) return null;
  if (!state.users[email]) {
    state.users[email] = { name: name || email.split("@")[0], email, enrolments: {} };
    saveState(state);
  }
  state.currentUser = email;
  saveState(state);
  return state.users[email];
}

function enrolUserInCourse(email, courseId) {
  const user = ensureUser(email);
  if (!user) return false;
  if (!user.enrolments[courseId]) {
    user.enrolments[courseId] = { progress: 0, completed: false, quizPassed: false, worksheetSubmitted: false };
    saveState(state);
  }
  return true;
}

/* -------------------------
   Dashboard rendering
   ------------------------- */
function renderDashboard() {
  const root = $("#dashboard-root");
  const current = state.currentUser ? state.users[state.currentUser] : null;
  if (!current) {
    root.innerHTML = `<p class="muted">You are not signed in. Enrol in a course to create a learner profile.</p>`;
    return;
  }

  const enrolments = Object.keys(current.enrolments);
  if (enrolments.length === 0) {
    root.innerHTML = `<p class="muted">No enrolments yet. Browse courses and enrol to start learning.</p>`;
    return;
  }

  const items = enrolments.map(cid => {
    const course = COURSES.find(c => c.id === cid);
    const e = current.enrolments[cid];
    const pct = Math.round(e.progress);
    return `
      <div class="card" style="margin-bottom:12px;">
        <h3>${escapeHtml(course.title)}</h3>
        <p class="muted">${escapeHtml(course.summary)}</p>
        <div class="progress" aria-hidden="true"><div class="progress-bar" style="width:${pct}%"></div></div>
        <p class="muted">Progress: ${pct}% • Quiz: ${e.quizPassed ? "Passed" : "Not passed"} • Worksheet: ${e.worksheetSubmitted ? "Submitted" : "Not submitted"}</p>
        <div style="margin-top:8px;">
          <button class="btn outline" data-action="resume" data-id="${cid}">Resume</button>
          ${e.quizPassed && e.worksheetSubmitted ? /*`<button class="btn primary" data-action="certificate" data-id="${cid}">Download certificate</button>` : ""}*/
        </div>
      </div>
    `;
  }).join("");

  root.innerHTML = items;
}

/* -------------------------
   Quiz flow (simple)
   ------------------------- */
function renderQuiz(courseId) {
  const course = COURSES.find(c => c.id === courseId);
  if (!course) return;
  const q = course.quiz.questions;
  let html = `<h2>Sample quiz — ${escapeHtml(course.title)}</h2><form id="quiz-form">`;
  q.forEach((item, idx) => {
    html += `<fieldset><legend>${escapeHtml(item.q)}</legend>`;
    item.choices.forEach((ch, i) => {
      html += `<label><input type="radio" name="q${idx}" value="${i}" required /> ${escapeHtml(ch)}</label><br/>`;
    });
    html += `</fieldset>`;
  });
  html += `<div style="margin-top:12px;"><button class="btn primary" type="submit">Submit quiz</button></div></form>`;
  openModal(html);

  $("#quiz-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const form = ev.target;
    let correct = 0;
    q.forEach((item, idx) => {
      const val = form[`q${idx}`].value;
      if (parseInt(val, 10) === item.a) correct++;
    });
    const score = Math.round((correct / q.length) * 100);
    const passed = score >= 70;
    // update state if user enrolled
    if (state.currentUser && state.users[state.currentUser].enrolments[courseId]) {
      const enrol = state.users[state.currentUser].enrolments[courseId];
      enrol.quizPassed = passed;
      enrol.progress = Math.min(100, enrol.progress + 40);
      saveState(state);
      renderDashboard();
    }
    modalBody.innerHTML = `<h3>Score: ${score}%</h3><p>${passed ? "Well done — you passed the quiz." : "You did not pass. Review the lessons and try again."}</p><div style="margin-top:12px;"><button class="btn primary" id="close-after-quiz">Close</button></div>`;
    $("#close-after-quiz").focus();
    $("#close-after-quiz").addEventListener("click", closeModal);
  });
}

/* -------------------------
   Worksheet submission (simulated)
   ------------------------- */
function submitWorksheet(courseId) {
  if (!state.currentUser) {
    alert("Please enrol and sign in to submit the worksheet.");
    return;
  }
  const user = state.users[state.currentUser];
  if (!user.enrolments[courseId]) {
    alert("You are not enrolled in this course.");
    return;
  }
  // Simulate submission
  user.enrolments[courseId].worksheetSubmitted = true;
  user.enrolments[courseId].progress = Math.min(100, user.enrolments[courseId].progress + 60);
  user.enrolments[courseId].completed = user.enrolments[courseId].quizPassed && user.enrolments[courseId].worksheetSubmitted;
  saveState(state);
  renderDashboard();
  alert("Worksheet submitted. If you passed the quiz and submitted the worksheet, you will be eligible for a certificate.");
}

/* -------------------------
   Certificate generation (simple)
   ------------------------- */
function generateCertificate(courseId) {
  const user = state.currentUser ? state.users[state.currentUser] : null;
  if (!user || !user.enrolments[courseId]) {
    alert("No certificate available.");
    return;
  }
  const enrol = user.enrolments[courseId];
  if (!(enrol.quizPassed && enrol.worksheetSubmitted)) {
    alert("Complete the quiz and submit the worksheet to get a certificate.");
    return;
  }
  // Simple printable certificate window
  const course = COURSES.find(c => c.id === courseId);
  const certHtml = `
    <html><head><title>Certificate</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
      .cert{border:8px solid #e6f3fb;padding:36px;border-radius:12px;text-align:center;width:800px}
      h1{color:#006aa7}
      .meta{margin-top:12px;color:#333}
    </style>
    </head><body>
      <div class="cert">
        <h1>Certificate of Completion</h1>
        <p>This certifies that</p>
        <h2>${escapeHtml(user.name)}</h2>
        <p class="meta">has completed the course</p>
        <h3>${escapeHtml(course.title)}</h3>
        <p class="meta">Date: ${new Date().toLocaleDateString()}</p>
        <p class="meta">Mzansi Money Academy — Pilot</p>
      </div>
    </body></html>
  `;
  const w = window.open("", "_blank", "noopener");
  w.document.write(certHtml);
  w.document.close();
}

/* -------------------------
   Event delegation and UI wiring
   ------------------------- */
document.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;

  // Nav toggle
  if (btn.id === "nav-toggle") {
    const list = $("#nav-list");
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    list.classList.toggle("show");
    return;
  }

  // Enrol from hero
  if (btn.id === "join-pilot" || btn.id === "enrol-now") {
    openEnrolModal();
    return;
  }

  // Course actions
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (action === "details") {
    showCourseDetails(id);
    return;
  }
  if (action === "enrol") {
    openEnrolModal(id);
    return;
  }
  if (action === "resume") {
    openCourseResume(id);
    return;
  }
  if (action === "certificate") {
    generateCertificate(id);
    return;
  }
  if (btn.id === "modal-close") {
    closeModal();
    return;
  }
  if (btn.id === "modal-quiz") {
    const cid = btn.dataset.id;
    renderQuiz(cid);
    return;
  }
});

/* Modal close on background click */
modal.addEventListener("click", (ev) => {
  if (ev.target === modal) closeModal();
});

/* Contact form */
$("#contact-form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const name = $("#name").value.trim();
  const email = $("#email").value.trim();
  const message = $("#message").value.trim();
  // For pilot: store as simple feedback
  const feedback = JSON.parse(localStorage.getItem("mma_feedback") || "[]");
  feedback.push({ name, email, message, date: new Date().toISOString() });
  localStorage.setItem("mma_feedback", JSON.stringify(feedback));
  alert("Thanks for your message. We'll review it as part of the pilot.");
  ev.target.reset();
});

/* Search and filters */
$("#filter-level").addEventListener("change", () => applyFilters());
$("#filter-language").addEventListener("change", () => applyFilters());
$("#search").addEventListener("input", () => applyFilters());

function applyFilters() {
  const level = $("#filter-level").value;
  const language = $("#filter-language").value;
  const q = $("#search").value.trim();
  renderCourses({ level, language, q });
}

/* Enrol modal */
function openEnrolModal(courseId = null) {
  const course = courseId ? COURSES.find(c => c.id === courseId) : null;
  const html = `
    <h2>${course ? escapeHtml(course.title) : "Join the pilot"}</h2>
    <form id="enrol-form">
      <label for="enrol-name">Full name</label>
      <input id="enrol-name" name="name" required />
      <label for="enrol-email">Email</label>
      <input id="enrol-email" name="email" type="email" required />
      <div style="margin-top:12px;">
        <button class="btn primary" type="submit">Enrol</button>
        <button class="btn outline" type="button" id="enrol-cancel">Cancel</button>
      </div>
    </form>
  `;
  openModal(html);

  $("#enrol-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const name = $("#enrol-name").value.trim();
    const email = $("#enrol-email").value.trim().toLowerCase();
    ensureUser(email, name);
    if (courseId) enrolUserInCourse(email, courseId);
    saveState(state);
    renderDashboard();
    closeModal();
    alert(`Enrolled as ${name}. Check the dashboard to continue.`);
  });

  $("#enrol-cancel").addEventListener("click", closeModal);
}

/* Resume course (simple flow) */
function openCourseResume(courseId) {
  const course = COURSES.find(c => c.id === courseId);
  if (!course) return;
  const html = `
    <h2>Resume ${escapeHtml(course.title)}</h2>
    <p class="muted">${escapeHtml(course.summary)}</p>
    <div>
      <button class="btn primary" id="start-quiz" data-id="${courseId}">Take quiz</button>
      <button class="btn outline" id="submit-worksheet" data-id="${courseId}">Submit worksheet</button>
    </div>
  `;
  openModal(html);

  $("#start-quiz").addEventListener("click", (ev) => {
    renderQuiz(ev.target.dataset.id);
  });

  $("#submit-worksheet").addEventListener("click", (ev) => {
    submitWorksheet(ev.target.dataset.id);
    closeModal();
  });
}

/* Escape helper */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* Init */
function init() {
  document.getElementById("year").textContent = new Date().getFullYear();
  renderCourses({});
  renderDashboard();

  // If a user exists in state, set currentUser to first user for demo convenience
  if (!state.currentUser && Object.keys(state.users).length > 0) {
    state.currentUser = Object.keys(state.users)[0];
    saveState(state);
  }

  // Keyboard: close modal on Escape
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });

  // Example: prefill with demo user for quick testing (only if no users)
  if (Object.keys(state.users).length === 0) {
    ensureUser("pilot@example.com", "Pilot Learner");
  }
}

init();
