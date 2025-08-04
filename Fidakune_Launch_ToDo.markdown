# Fidakune Project: GitHub Launch To-Do List

**Objective:** Prepare the Fidakune language project for a public, open-source launch on GitHub by finalizing foundational documents and establishing a clear framework for community contribution, ensuring accessibility for a diverse global audience.

**Target Date:** Before public announcement, aligned with Month 6 testing phase (Section 7.2 of Fidakune Requirements v0.13).

This to-do list ensures the repository is professional, transparent, and welcoming to speakers of diverse languages, people with disabilities, and non-technical users.

## Phase 1: Foundational Document Finalization
- [x] **Convert Primary Requirements Document**
  - **Task:** Convert `Fidakune_Requirements_v0.13.pdf` to `REQUIREMENTS.md`.
  - **Details:** Use Pandoc (`pandoc -s Fidakune_Requirements_v0.13.pdf -o REQUIREMENTS.md`) or manually reformat, preserving examples (e.g., `kore-pet`). Include accessibility tags (e.g., alt text for charts) per WCAG 2.1 (Section 2).
  - **How:** Create `REQUIREMENTS.md` via **Add file > Create new file**, commit with "Add REQUIREMENTS.md."
  - **Reason:** Enables easy access and edits, per Section 8.3.

- [x] **Draft Initial Governance Model**
  - **Task:** Create `GOVERNANCE.md`.
  - **Content:** Define council composition ("1 linguist, 1 accessibility expert, 3 community representatives"), initial selection ("appointed by core team"), term limits ("2-year terms, elections in Year 3"), and transparency ("decisions documented publicly").
  - **How:** Create `GOVERNANCE.md`, commit with "Add GOVERNANCE.md."
  - **Reason:** Aligns with Section 4.4's governance model.

- [x] **Create Contribution Guidelines**
  - **Task:** Create `CONTRIBUTING.md`.
  - **Content:** Include issue formatting ("[VOCAB PROPOSAL], [BUG REPORT]"), pull request process, and code of conduct ("Be respectful, inclusive").
  - **How:** Create `CONTRIBUTING.md`, commit with "Add CONTRIBUTING.md."
  - **Reason:** Structures contributions, per Section 8.3.

- [x] **Finalize the README.md**
  - **Task:** Update `README.md` (use revised version from previous response).
  - **Checklist:** Verify links to `REQUIREMENTS.md`, `GOVERNANCE.md`, `CONTRIBUTING.md`, `Fidakune_Requirements_v0.13.pdf`; replace `yourusername`; confirm status as "Version 0.13, Months 1-6."
  - **How:** Edit `README.md`, commit with "Update README.md."
  - **Reason:** Ensures a welcoming landing page.

- [x] **Add Transliteration and IPA Guides**
  - **Task:** Create `TRANSLITERATION.md` with guides for non-Latin scripts (e.g., Arabic, Devanagari) and IPA notation.
  - **Details:** Include a table mapping phonemes (e.g., /ɾ/ to Arabic ر). Reference Section 4.1.
  - **How:** Create `TRANSLITERATION.md`, commit with "Add transliteration and IPA guides."
  - **Reason:** Supports non-Latin script users, per Section 4.1.

- [x] **Translate Key Markdown Files**
  - **Task:** Create translated summaries of `README.md` and `CONTRIBUTING.md` in English, Mandarin, Spanish, Arabic, Hindi.
  - **Details:** Create a `translations` folder with files like `README_es.md`, summarizing key sections.
  - **How:** Create folder and files, commit with "Add translated summaries."
  - **Reason:** Aligns with Section 7.1's multilingual goal.

## Phase 2: Content and Language Refinement
- [x] **Refine "Cultural Neutrality" Framing**
  - **Task:** Replace "culturally neutral gestures" with "gestures designed for maximum cross-cultural clarity and minimal known offense" in `REQUIREMENTS.md`.
  - **Details:** Add: "Gestures tested with 50 learners from 10 language families (Section 8.1)."
  - **How:** Edit `REQUIREMENTS.md`, commit with "Refine cultural neutrality wording."
  - **Reason:** Frames neutrality realistically, per Section 4.5.

- [x] **Add a Call-to-Action for Testing**
  - **Task:** Add a "Testing Call-to-Action" to `REQUIREMENTS.md` and `CONTRIBUTING.md`.
  - **Content:** "Invite speakers of tonal/non-alphabetic languages to test phonology (e.g., /ɾ/) and gestures (e.g., nod for 'Yes'). Submit feedback via Issues."
  - **How:** Edit files, commit with "Add testing call-to-action."
  - **Reason:** Engages diverse contributors, per Section 8.1.

- [x] **Improve Vocabulary Organization**
  - **Task:** Add vocabulary structure guidelines to `REQUIREMENTS.md`.
  - **Content:** Include semantic domains (e.g., "Nature: aqua (water), terra (earth)"), compounding rules (e.g., "sky-net for internet"), and a word proposal template with IPA and domain.
  - **How:** Edit `REQUIREMENTS.md`, commit with "Add vocabulary structure guidelines."
  - **Reason:** Structures vocabulary development for community contributors.

- [x] **Create Testing Metrics Framework**
  - **Task:** Create comprehensive testing framework with Tier 1/Tier 2 proficiency metrics.
  - **Content:** Define success metrics for phonology testing (e.g., "90% pronunciation accuracy across 10 language families"), gesture testing (e.g., "80% comprehension without explanation"), and accessibility testing (e.g., "WCAG 2.1 AA compliance").
  - **How:** Create `TESTING.md` with detailed metrics framework, commit with "Add TESTING.md for testing metrics framework."
  - **Reason:** Ensures objective evaluation, per Section 8.1. **✅ COMPLETED - Created TESTING.md**

## Phase 3: Community Setup and Outreach
- [ ] **Enable GitHub Discussions**
  - **Task:** Activate GitHub Discussions for the repository.
  - **Categories:** Create categories like "General," "Vocabulary Proposals," "Learning Feedback," "Technical Questions," and "Cultural Sensitivity."
  - **How:** Go to **Settings > General > Features > Discussions**, enable, and configure categories.
  - **Reason:** Provides a forum for deeper community engagement beyond Issues.

- [ ] **Create Issue Templates**
  - **Task:** Add GitHub issue templates for common contribution types.
  - **Templates:** `VOCAB_PROPOSAL.md` (fields: word, IPA, semantic domain, justification), `BUG_REPORT.md` (fields: description, steps to reproduce, expected vs. actual), `FEEDBACK.md` (fields: topic, suggestion, cultural context).
  - **How:** Create `.github/ISSUE_TEMPLATE/` folder with template files.
  - **Reason:** Standardizes issue submission and improves organization.

- [ ] **Set Up GitHub Pages**
  - **Task:** Enable GitHub Pages to host the project website.
  - **Content:** Use `README.md` as the homepage, link to all core documents, and embed `Fidakune_Requirements_v0.13.pdf` if available.
  - **How:** Go to **Settings > Pages**, select "Deploy from branch," choose `main` branch.
  - **Reason:** Provides a professional website at `jlillywh.github.io/Fidakune-Language`.

- [ ] **Draft Public Announcement**
  - **Task:** Create a public announcement for posting on X, Reddit (r/conlangs), or other platforms.
  - **Content:** "🌍 Fidakune Language Project is now open-source! A universal second language designed for cognitive simplicity, cultural neutrality, and global communication. Seeking feedback from linguists, educators, and enthusiasts. [GitHub Link] #Fidakune #Conlang #GlobalCommunication"
  - **How:** Create `ANNOUNCEMENT.md` with social media posts and forum content.
  - **Reason:** Attracts initial contributors and testing participants.

## Phase 4: Final Review and Launch Preparation
- [ ] **Accessibility Audit**
  - **Task:** Test repository and documents with screen readers (e.g., NVDA) and accessibility tools.
  - **Checklist:** Verify alt text for images, proper heading structure in markdown files, keyboard navigation for GitHub interface, and high contrast for readability.
  - **How:** Use NVDA or similar tools to navigate the repository and documents, documenting any issues.
  - **Reason:** Ensures WCAG 2.1 compliance and inclusive access, per Section 2.

- [ ] **Beta Testing Coordination**
  - **Task:** Recruit 10 initial beta testers from diverse linguistic backgrounds.
  - **Method:** Post in r/conlangs, linguistics forums, or personal networks. Provide a testing guide (e.g., "Try pronouncing these 20 core words and gestures, then submit feedback via Issues").
  - **How:** Create `BETA_TESTING.md` with instructions and a feedback form.
  - **Reason:** Validates design assumptions before broader announcement.

- [ ] **Legal and Licensing Review**
  - **Task:** Verify the GNU General Public License is appropriate and properly applied.
  - **Checklist:** Ensure all files include appropriate copyright notices, the license is correctly referenced, and contributor agreements (if needed) are in place.
  - **How:** Review `LICENSE` file and add copyright notices to key files.
  - **Reason:** Protects the project and clarifies usage rights.

- [ ] **Launch Checklist Completion**
  - **Task:** Complete a final pre-launch checklist.
  - **Items:** All links functional, placeholder text removed, core documents complete, translations available, testing framework ready, community guidelines clear.
  - **How:** Manually review each document and link, ensuring professional presentation.
  - **Reason:** Ensures a polished, error-free launch.

---

**Notes:**
- Tasks marked with `*` are optional but recommended for enhanced accessibility and global reach.
- The timeline assumes 1-2 weeks for Phase 1, 2-3 weeks for Phase 2, 1-2 weeks for Phase 3, and 1 week for Phase 4.
- Phase 1 completion enables internal testing and feedback gathering, while Phase 4 completion enables full public launch.