# Fidakune Language Requirements Document
**Version:** 0.13
**Date:** 8/4/2025 

---

## 1. Purpose
Fidakune is a constructed language designed as a shared second language to facilitate global communication, trust, and collaboration. It prioritizes efficiency based on human biological and cognitive abilities, ensuring it is easy to learn, speak, and process for speakers of any linguistic background.

Unlike many constructed languages that prioritize vocabulary from specific language families (e.g., **Esperanto’s Eurocentric vocabulary**), Fidakune’s design is rooted in universal principles. It uses phonemes and structures common across global language families to ensure universal accessibility, and its unique strengths lie in its minimal phoneme inventory and an integrated set of culturally neutral gestures.

Fidakune is intended for practical application in various domains, including **international diplomacy, scientific collaboration, online gaming communities, grassroots activism, and as a starter language in multilingual education**.

---

## 2. Scope
The Fidakune project includes a simplified phonological system, a minimal analytic grammar, a foundational vocabulary of approximately 1,200 words, a limited set of standardized gestures, and all supporting tools for learning and adoption. The foundational vocabulary is designed to be **expandable post-launch through a clear governance model** (see Section 4.4) to ensure the language remains adaptable.

All digital learning tools will be designed for global accessibility, supporting localization into **at least 10 major world languages** and complying with accessibility standards such as **WCAG 2.1 for screen reader support**.

---

## 3. Design Principles 💡
- **Articulatory Ease:** Phonemes are selected for ease of production across all human speakers.
- **Acoustic Distinctiveness:** Sounds are chosen to be clearly distinguishable to minimize confusion.
- **Cognitive Load:** Grammar is simple, regular, and predictable, with no irregularities.
- **Information Clarity:** Structures prevent ambiguity through consistent rules and minimal exceptions.
- **Expressive Capacity:** The language's structural simplicity serves as a foundation for rich expression. Nuance is achieved through techniques like metaphorical compounding (e.g., **`kore-pet` for "grief" or "heart-stone"**).
- **Cultural Neutrality:** Fidakune avoids bias toward any specific language family or culture to ensure universal accessibility. This is achieved through:
  - **Phonology**: The 20-phoneme inventory (15 consonants, 5 vowels) includes sounds common across global languages (e.g., /a/, /s/, /m/), avoiding phonemes tied to specific regions (e.g., clicks or uvular stops). The alveolar tap /ɾ/ can be approximated as /d/ or /r/ to accommodate diverse speakers.
  - **Vocabulary**: Words are derived from universal concepts (e.g., `aqua` for water, `sole` for sun) rather than loanwords from dominant languages like English or Mandarin. Proper nouns adapt to Fidakune phonotactics (e.g., `Pa-ris` for Paris) to maintain neutrality.
  - **Gestures**: The 20 standardized gestures (e.g., single nod for "Yes," shoulder shrug for "Question") are designed for maximum cross-cultural clarity and minimal known offense, tested with diverse groups to avoid misinterpretation (e.g., avoiding pointing gestures that may be offensive in some cultures). Accessibility alternatives (e.g., facial expressions) ensure inclusivity.
  - **Community Feedback**: To maintain neutrality, we invite feedback on phonemes, words, and gestures via [Issues](https://github.com/jlillywh/Fidakune-Language/issues) or [fidakune.contact@gmail.com], especially from speakers of tonal or non-alphabetic languages.
- **Adaptability:** Fidakune is designed to evolve through community governance, ensuring it remains relevant without introducing complexity (e.g., **new terms like `sky-net` (internet) can be added to address emerging technologies**).

---

## 4. Functional Requirements

### 4.1 Writing System
- Fidakune will use the **Latin alphabet** with a simplified, phonetic orthography (one letter per phoneme).
- **Transliteration guides** will be provided for learners from non-Latin script backgrounds. See [TRANSLITERATION.md](TRANSLITERATION.md) for detailed phoneme mappings. An optional **IPA-based notation** will be provided in the guidebook for learners unfamiliar with the Latin alphabet.

### 4.2 Phonology
- **Phoneme Inventory:** Fidakune uses 20 phonemes (15 consonants, 5 vowels).

| Phoneme Type | Symbols |
|--------------|---------|
| Consonants   | /p/, /t/, /k/, /b/, /d/, /g/, /m/, /n/, /s/, /h/, /f/, /l/, /ɾ/, /w/, /j/ |
| Vowels       | /a/, /e/, /i/, /o/, /u/ |

*Diagram: Phoneme inventory showing 15 consonants and 5 vowels arranged by articulatory position (visual aid for pronunciation guidance)*

- **/ɾ/ Accessibility:** Learners who find the alveolar tap difficult may approximate it as a quick /d/ or a common /r/ sound.
- **Tones and Length:** Fidakune is **non-tonal** and does not use phonemic vowel or consonant length to distinguish words.
- **Phonotactics:** Two-syllable words may include simple consonant clusters. Permitted clusters include **/st/, /pl/, /pr/, /tr/, /sp/** in the onset of the second syllable.
- **Pedagogy:** The guidebook will include **audio recordings and visual articulatory diagrams** to teach phoneme pronunciation.

*Diagram: Articulatory positions for consonants and vowels showing tongue placement and airflow patterns (essential for proper pronunciation)*
- **Stress:** Stress is strictly on the **penultimate (second-to-last) syllable** in multi-syllabic words.

### 4.3 Grammatical Structure
- **Typology:** Fidakune is strictly **analytic**, using SVO (Subject-Verb-Object) word order and function words.
- **Particles:**
  - **Pre-Verbal:** **Tense (`pa`, `fu`) -> Negation (`nok`)**.
  - **Post-Verbal:** **Aspect (`le`)**.
- **Questions:**
  - **Yes/No:** Indicated by rising intonation or, for written clarity, the optional starting particle **`ka`**. (e.g., `ka you go?`).
  - **Information:** Use question words at the start of the sentence.
  - **Example Complex Question:** `keva mi pa give le to ami?` ("What did I finish giving to the friend?").
- **Respect Particle `ri`:** The optional particle `ri` is used in formal or respectful contexts. It precedes the noun/pronoun it modifies, including question words (e.g., `ri kove` for "respected who").

### 4.4 Vocabulary
- A **foundational vocabulary of ~1,200 words** will be organized into logical semantic domains.
  - **Example Domains:** Nature: `aqua` (water), `sole` (sun); Society: `ami` (friend), `lei` (law).
- **Proper Nouns:** Retain their original forms but may be adapted to Fidakune phonology (e.g., ‘Paris’ as `Pa-ris`). Loanwords are discouraged.
- **Governance Model:** New words will be proposed via the digital lexicon and approved by a **Fidakune Language Council** (composed of linguists, community representatives, and accessibility experts) through a community voting process. Proposed words must adhere to phonotactics and avoid homophony with existing terms.

### 4.5 Standardized Gestural Component
- A standardized set of **no more than 20 simple gestures designed for maximum cross-cultural clarity and minimal known offense**.
- **Cultural Neutrality Testing:** Gestures are tested with diverse groups to ensure cultural neutrality and avoid misinterpretation. Feedback welcomed via [Issues](https://github.com/jlillywh/Fidakune-Language/issues).
- **Example Gestures:**
  - **Yes:** A single, slow nod of the head. *[Audio description: "Affirmative head nod" for visually impaired users]*
  - **Question:** A slight shoulder shrug with open palms. *[Audio description: "Questioning gesture with raised shoulders" for visually impaired users]*
  - **Number 1:** Index finger raised. *[Audio description: "Single finger raised indicating one" for visually impaired users]*
  - **Please repeat:** Hand circling near the ear. *[Audio description: "Circular hand motion near ear requesting repetition" for visually impaired users]*
- **Accessibility:** Gestures will be designed for minimal movement. **Text descriptions or facial expressions** will substitute for gestures for accessibility.
- **Pedagogy:** Taught through video tutorials and interactive exercises in digital tools.

---

## 5. Philosophy of Expression and Artistry
The language's pedagogy must teach its expressive capacity. Expressive techniques will be taught through **creative writing exercises and prosody-focused activities**.
- **Examples:**
  - **Repetition:** `mal, mal, mal` ("very bad").
  - **Compounding:** `kore-pet` ("heart-stone" for grief).
  - **Pacing:** Short sentences for urgency (`run! hide! now!`).
  - **Prosody:** A rising pitch on `ami` emphasizes affection.
  - **Sample Exercise:** "Write a three-sentence story using compounding to express joy."

---

## 6. Core Project Metrics

### 6.1 Learnability
- **Tier 1 (Core Proficiency):** A learner, after 20 hours of study, must demonstrate mastery of all grammar and understand the 200 most frequent words.
- **Tier 2 (Functional Fluency):** A learner should achieve functional fluency (~800 active words) within 100-150 hours.

### 6.2 Success Criteria
- Learners achieve Tier 1 proficiency.
- Adoption in **10 community settings** (educational institutions, online groups, international organizations) within three years.
- **80% of learners report satisfaction** with ease of use and expressiveness, measured via Likert scale surveys and qualitative interviews.
- **80% of learners correctly use at least 10 gestures** after 20 hours of study.

---

## 7. Deliverables & Timeline ✅

### 7.1 Deliverables
- A **Guidebook** translated into at least five major world languages (**English, Mandarin, Spanish, Arabic, Hindi**).
- A **digital lexicon** and governance platform.
- **Digital learning tools** (web platform, mobile app) supporting low-bandwidth environments with text-only interfaces.

### 7.2 Timeline
- **Months 1-6:** Finalize phonology, grammar, core 200 words, and gestures. **Review feedback from diverse test group to inform refinements.**
- **Months 7-18:** Develop the remaining 1,000 words and digital lexicon. Conduct **beta testing of digital tools** with 100 learners.
- **Months 19-24:** Develop the full suite of learning tools.
- **Year 3-4:** Launch in community settings.

---

## 8. Inclusivity and Evolution Framework
- **8.1 Inclusivity:** The design will be reviewed by a diverse test group of **50 learners from 10 language families**, including tonal and non-alphabetic systems.
- **8.2 Accessibility:** All components will be designed for learners with visual, auditory, or motor impairments.
- **8.3 Evolution:** A **Fidakune Language Council** will monitor usage and propose updates every two years. All Council decisions will be documented and **publicly accessible** on the digital platform.

---

## Testing Call-to-Action

We invite speakers of diverse linguistic backgrounds to test Fidakune's design principles. We're particularly seeking feedback from speakers of tonal languages, non-alphabetic writing systems, and those with accessibility needs.

**Specific Testing Areas:**
- **Phonology:** Try pronouncing /ɾ/ in `kore-pet` (/ˈko.ɾe.pet/). Can it be approximated as /d/ or /r/ from your native language? Are all 20 phonemes accessible to speakers from your language family?
- **Gestures:** Test the "Yes" nod or "Question" shrug for cultural clarity. Do these gestures convey the intended meaning in your cultural context without offense?
- **Vocabulary:** Propose new words like `sky-net` for "internet" - do they fit Fidakune's phonotactic rules and semantic domains?
- **Grammar:** Test the SVO structure with particles: `mi fu go` ("I will go") or `ami pa help le mi` ("friend helped me"). Is the meaning clear?
- **Learning Materials:** Review accessibility of digital tools and documentation using screen readers or other assistive technologies.

**How to Contribute Feedback:**
Submit your observations, suggestions, and test results via our [GitHub Issues](https://github.com/jlillywh/Fidakune-Language/issues) page or email [fidakune.contact@gmail.com]. Use tags like [PHONOLOGY], [GESTURE], [ACCESSIBILITY], [VOCAB PROPOSAL], or [GRAMMAR] to help us categorize your input.

**Target:** We aim to test with 50 learners from 10 language families (Section 8.1) to ensure Fidakune's universal accessibility and cultural neutrality.

---

## 9. Edge Cases and Implementation Notes
- **Complex Sentences:** The grammar must support multiple clauses (e.g., `mi know ke ri ami fu go kela` – "I know that the respected friend will go there.").
- **Homophone Management:** The Language Council will ensure new words are phonetically distinct to avoid homophony.
- **Severe Impairment Accessibility:** For users with severe motor impairments, **facial expressions or defined verbal cues** can substitute for standardized gestures.
