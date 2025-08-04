# Fidakune Project: GitHub Launch To-Do List

**Objective:** Prepare the Fidakune language project for a public, open-source launch on GitHub by finalizing foundational documents and establishing a clear framework for community contribution, ensuring accessibility for a diverse global audience.

**Target Date:** Before public announcement, aligned with Month 6 testing phase (Section 7.2 of Fidakune Requirements v0.13).

This to-do list ensures the repository is professional, transparent, and welcoming to speakers of diverse languages, people with disabilities, and non-technical users.

## Phase 1: Foundational Document Finalization
- [ ] **Convert Primary Requirements Document**
  - **Task:** Convert `Fidakune_Requirements_v0.13.pdf` to `REQUIREMENTS.md`.
  - **Details:** Use Pandoc (`pandoc -s Fidakune_Requirements_v0.13.pdf -o REQUIREMENTS.md`) or manually reformat, preserving examples (e.g., `kore-pet`). Include accessibility tags (e.g., alt text for charts) per WCAG 2.1 (Section 2).
  - **How:** Create `REQUIREMENTS.md` via **Add file > Create new file**, commit with “Add REQUIREMENTS.md.”
  - **Reason:** Enables easy access and edits, per Section 8.3.

- [ ] **Draft Initial Governance Model**
  - **Task:** Create `GOVERNANCE.md`.
  - **Content:** Define council composition (“1 linguist, 1 accessibility expert, 3 community representatives”), initial selection (“appointed by core team”), term limits (“2-year terms, elections in Year 3”), and transparency (“decisions documented publicly”).
  - **How:** Create `GOVERNANCE.md`, commit with “Add GOVERNANCE.md.”
  - **Reason:** Aligns with Section 4.4’s governance model.

- [ ] **Create Contribution Guidelines**
  - **Task:** Create `CONTRIBUTING.md`.
  - **Content:** Include issue formatting (“[VOCAB PROPOSAL], [BUG REPORT]”), pull request process, and code of conduct (“Be respectful, inclusive”).
  - **How:** Create `CONTRIBUTING.md`, commit with “Add CONTRIBUTING.md.”
  - **Reason:** Structures contributions, per Section 8.3.

- [ ] **Finalize the README.md**
  - **Task:** Update `README.md` (use revised version from previous response).
  - **Checklist:** Verify links to `REQUIREMENTS.md`, `GOVERNANCE.md`, `CONTRIBUTING.md`, `Fidakune_Requirements_v0.13.pdf`; replace `yourusername`; confirm status as “Version 0.13, Months 1-6.”
  - **How:** Edit `README.md`, commit with “Update README.md.”
  - **Reason:** Ensures a welcoming landing page.

- [ ] * **Add Transliteration and IPA Guides**
  - **Task:** Create `TRANSLITERATION.md` with guides for non-Latin scripts (e.g., Arabic, Devanagari) and IPA notation.
  - **Details:** Include a table mapping phonemes (e.g., /ɾ/ to Arabic ر). Reference Section 4.1.
  - **How:** Create `TRANSLITERATION.md`, commit with “Add transliteration and IPA guides.”
  - **Reason:** Supports non-Latin script users, per Section 4.1.

- [ ] * **Translate Key Markdown Files**
  - **Task:** Create translated summaries of `README.md` and `CONTRIBUTING.md` in English, Mandarin, Spanish, Arabic, Hindi.
  - **Details:** Create a `translations` folder with files like `README_es.md`, summarizing key sections.
  - **How:** Create folder and files, commit with “Add translated summaries.”
  - **Reason:** Aligns with Section 7.1’s multilingual goal.

## Phase 2: Content and Language Refinement
- [ ] **Refine "Cultural Neutrality" Framing**
  - **Task:** Replace “culturally neutral gestures” with “gestures designed for maximum cross-cultural clarity and minimal known offense” in `REQUIREMENTS.md`.
  - **Details:** Add: “Gestures tested with 50 learners from 10 language families (Section 8.1).”
  - **How:** Edit `REQUIREMENTS.md`, commit with “Refine cultural neutrality wording.”
  - **Reason:** Frames neutrality realistically, per Section 4.5.

- [ ] **Add a Call-to-Action for Testing**
  - **Task:** Add a “Testing Call-to-Action” to `REQUIREMENTS.md` and `CONTRIBUTING.md`.
  - **Content:** “Invite speakers of tonal/non-alphabetic languages to test phonology (e.g., /ɾ/) and gestures (e.g., nod for ‘Yes’). Submit feedback via Issues.”
  - **How:** Edit files, commit with “Add testing call-to-action.”
  - **Reason:** Engages diverse contributors, per Section 8.1.

- [ ] **Perform Final Consistency Check**
  - **Task:** Verify examples (e.g., `kore-pet`, `sky-net`) in all markdown files adhere to phonotactics (Section 4.2) and grammar (Section 4.3).
  - **How:** Review files, commit corrections with “Fix example consistency.”
  - **Reason:** Ensures credibility.

- [ ] * **Optimize for Low-Bandwidth Access**
  - **Task:** Add to `REQUIREMENTS.md` and `CONTRIBUTING.md`: “Digital tools will offer lightweight versions (e.g., text-only interfaces) for low-bandwidth regions.”
  - **How:** Edit files, commit with “Add low-bandwidth accessibility note.”
  - **Reason:** Enhances global reach.

- [ ] * **Add Accessibility for Visual/Auditory Impairments**
  - **Task:** Add alt text for diagrams and note auditory gesture alternatives in `REQUIREMENTS.md`.
  - **Details:** Include alt text (e.g., “Diagram of 15 consonants, 5 vowels”) and “Gestures include audio descriptions (e.g., ‘nod for Yes’ as spoken cue).”
  - **How:** Edit `REQUIREMENTS.md`, commit with “Add accessibility for visual/auditory impairments.”
  - **Reason:** Complies with Section 8.2.

## Phase 3: Community Engagement Setup (GitHub Specific)
- [ ] **Create GitHub Issue Templates**
  - **Task:** Create templates for Vocabulary Proposal, Bug Report, General Feedback.
  - **Details:** Use YAML frontmatter with clear headings (e.g., “## Proposed Word”). Test with NVDA for screen-reader compatibility.
  - **How:** Create `.github/ISSUE_TEMPLATE` folder and files, commit with “Add issue templates.”
  - **Reason:** Structures feedback, per Section 4.4.

- [ ] **Draft a "Welcome" Pinned Issue**
  - **Task:** Create a pinned issue titled “Welcome to Fidakune!”
  - **Content:** “Fidakune fosters global communication. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [REQUIREMENTS.md](REQUIREMENTS.md) to start.”
  - **How:** Create issue, pin it, commit with “Add welcome pinned issue.”
  - **Reason:** Welcomes contributors.

- [ ] * **Simplify Contribution for Non-Technical Users**
  - **Task:** Add to `CONTRIBUTING.md`: “Non-technical users can submit feedback via [fidakune-contact@example.com] or digital lexicon platform.”
  - **How:** Edit `CONTRIBUTING.md`, commit with “Add non-technical contribution option.”
  - **Reason:** Includes non-technical users, per Section 8.3.

- [ ] * **Create Accessible Issue Templates**
  - **Task:** Ensure issue templates use clear headings and are screen-reader-friendly.
  - **How:** Edit `.github/ISSUE_TEMPLATE` files, commit with “Enhance issue template accessibility.”
  - **Reason:** Aligns with Section 2’s WCAG 2.1.

## Phase 4: Pre-Launch Final Review
- [ ] **Final Proofread**
  - **Task:** Assign two team members to proofread all markdown files using Grammarly or VS Code extensions.
  - **How:** Commit corrections with “Final proofread corrections.”
  - **Reason:** Ensures professionalism.

- [ ] **Internal Go/No-Go Meeting**
  - **Task:** Hold a meeting to review checklist.
  - **Checklist:** Confirm documents, links, issue templates, pinned issue, and team readiness.
  - **How:** Document in `docs/meeting_notes.md`, commit with “Add go/no-go meeting notes.”
  - **Reason:** Confirms launch readiness.

- [ ] * **Test Accessibility Features**
  - **Task:** Test `REQUIREMENTS.md`, `README.md`, and issue templates with NVDA/VoiceOver and verify text-only rendering.
  - **Details:** Document in `docs/accessibility_test.md`.
  - **How:** Commit with “Add accessibility test results.”
  - **Reason:** Ensures Section 2 and 8.2 compliance.

## Completion
This to-do list ensures a transparent, accessible, and community-ready launch, supporting Fidakune’s goals (Sections 1, 4.4, 8.1-8.3).