# GKroon-Money-Academy — DEMO‑Module Financial Literacy Website

**Overview**

This repository contains a lightweight, client-side prototype for a South Africa‑focused financial literacy pilot. It includes a 3‑module course catalog (Budgeting, Credit & Debt, Savings & Investing), enrolment, simple quizzes, worksheet submission simulation, and a printable certificate. The prototype is intentionally offline‑friendly and uses `localStorage` to persist learner state.

**Files**

- `index.html` — Main HTML page with site structure, hero, course catalog, dashboard, contact form and modal.
- `styles.css` — Responsive CSS with variables and accessible components.
- `app.js` — Vanilla JavaScript powering course rendering, enrolment, quizzes, progress tracking and certificate generation.
- `README.md` — This file.

**How to run**

1. Place all files in the same folder.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari).
3. No server is required for the prototype. For production, serve via HTTPS.

**Key features**

- **3 pilot modules**: Budgeting & Cashflow, Credit & Debt Management, Savings & Basic Investing.
- **Micro‑lessons**: Each course contains short lesson metadata (video placeholders).
- **Quiz engine**: Simple multiple‑choice quiz with pass threshold (70%).
- **Worksheet simulation**: Submit a worksheet to mark progress.
- **Progress tracking**: Stored in `localStorage` under key `mma_pilot_v1`.
- **Certificate**: Printable certificate opens in a new window when requirements are met.
- **Accessibility**: ARIA attributes, keyboard modal close, semantic HTML.
- **Low bandwidth**: Minimal assets, inline SVG logo, no external JS frameworks.

**Customization**

- **Add languages**: Extend `COURSES` with `language` values and add UI language toggles.
- **Replace video placeholders**: Integrate a video provider (hosted MP4, Vimeo, YouTube) and update lesson items to include `videoUrl`.
- **Persist to backend**: Replace `localStorage` calls with API calls to your server for real user accounts, authentication and analytics.
- **Payments**: Integrate PayFast or Stripe server-side for paid courses; keep the education content and disclaimers separate from regulated advice.

**Production considerations**

- **Regulatory compliance**: This prototype is educational only. Before public launch, include FSCA‑aligned disclaimers and ensure content does not constitute personalised financial advice. Consult a legal/regulatory advisor for compliance with South African financial conduct rules.
- **Security**: Move from `localStorage` to secure server-side storage with authentication. Use HTTPS and follow OWASP best practices.
- **Scalability**: For more learners, adopt an LMS (Moodle, LearnDash) or a custom backend (Node/Express + database) and a CDN for media.
- **Localization**: Provide translations (Afrikaans, isiXhosa) and adapt examples to local contexts (SARS, UIF, typical household budgets).
- **Accessibility audit**: Run an accessibility audit (WCAG 2.1) and address any issues.

**Extending the prototype**

- Add a simple backend API to store users and progress.
- Add scheduled SMS reminders using a provider (e.g., Twilio) for low‑bandwidth learners.
- Add downloadable PDF worksheets generated server-side for offline use.
- Add analytics to measure completion rates and quiz performance.

**Notes for developers**

- The prototype intentionally avoids external JS frameworks to keep the bundle small and easy to inspect.
- All state is stored under `localStorage` key `mma_pilot_v1`. Clearing browser storage will reset the pilot data.
- Feedback messages are stored under `mma_feedback` in `localStorage`.

**License**

This prototype is provided as-is for demonstration and pilot use. Adapt and extend under your organisation's licensing and compliance policies.

**Contact**

For help adapting this prototype into a production site, prepare:
- A content plan (scripts for micro‑videos, worksheets)
- A compliance checklist (FSCA review)
- A hosting and payment plan (hosting, CDN, payment gateway)

Good luck with your pilot!
