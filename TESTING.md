# Fidakune Testing Metrics Framework

This document outlines the testing metrics for evaluating Fidakune's learnability, accessibility, and cultural neutrality, as defined in [REQUIREMENTS.md](REQUIREMENTS.md) Sections 6.1 and 8.1. These metrics guide testing with 50 learners from 10 language families to ensure the language meets its goals of cognitive simplicity, articulatory ease, and universal accessibility.

## Overview
Fidakune's testing framework measures proficiency at two tiers:
- **Tier 1 (Core Proficiency)**: Achieved in ~20 hours, mastering 200 core words and basic grammar.
- **Tier 2 (Functional Fluency)**: Achieved in ~100–150 hours, using 800 words and complex structures.

Feedback is welcomed via [Issues](https://github.com/jlillywh/Fidakune-Language/issues) or [fidakune.contact@gmail.com], especially from speakers of tonal or non-alphabetic languages.

## Tier 1: Core Proficiency
- **Learning Time**: ~20 hours
- **Objectives**:
  - Master all grammar: Subject-Verb-Object (SVO) structure, particles (`pa` for past, `fu` for future, `nok` for negation, `ri` for respect, `le` for aspect).
  - Understand and use 200 core words (e.g., `aqua` for water, `ami` for friend).
  - Produce 10 basic sentences (e.g., `mi pa go kela` for "I went there").
  - Perform 10 gestures (e.g., single nod for "Yes," shoulder shrug for "Question").
- **Phonology Test**:
  - Pronounce 5 words with /ɾ/ (e.g., `kore-pet` /ˈko.ɾe.pet/) and note approximations (e.g., /d/ or /r/).
  - Report ease or difficulty for tonal language speakers.
- **Gesture Test**:
  - Perform "Yes" nod and "Question" shrug; confirm cultural clarity.
  - Suggest accessibility alternatives (e.g., facial expressions for motor-impaired users).
- **Accessibility Test**:
  - Review guidebook exercises with screen readers (e.g., NVDA) for WCAG 2.1 compliance.
- **Sample Test**:
  - Translate: "I saw a friend" (`mi pa see ami`).
  - Perform: "Yes" gesture in a video or describe its clarity.

## Tier 2: Functional Fluency
- **Learning Time**: ~100–150 hours
- **Objectives**:
  - Use 800 words actively across semantic domains (Nature, Society, Emotion, Technology).
  - Produce complex sentences with compounding (e.g., `kore-pet` for "grief") and particles (e.g., `mi know ke ri ami fu go kela` for "I know that my respected friend will go there").
  - Write a 3-sentence story using at least one compound word.
  - Perform all 20 gestures with confidence.
- **Phonology Test**:
  - Pronounce 10 complex words (e.g., `sky-net` /skai.net/, `sole-lum` /ˈso.le.lum/ for "sunlight").
  - Identify any homophony risks (e.g., similar-sounding words).
- **Gesture Test**:
  - Test all 20 gestures for cultural neutrality in diverse settings.
  - Propose new gestures if needed (e.g., for "Number 2").
- **Accessibility Test**:
  - Evaluate digital lexicon prototype for WCAG 2.1 compliance (e.g., alt text, keyboard navigation).
- **Sample Test**:
  - Write: A 3-sentence story about nature (e.g., using `aqua`, `sole`).
  - Translate: "We will learn a new law tomorrow" (`nos fu learn lei nova demoro`).

## Testing Success Metrics

### Phonology Testing (Per Section 4.2)
- **Target**: 90% pronunciation accuracy across 10 language families
- **Key Tests**: /ɾ/ approximation, consonant clusters (/st/, /pl/, /pr/, /tr/, /sp/)
- **Evaluation**: Can speakers produce recognizable versions? What approximations work best?

### Grammar Testing (Per Section 4.3)
- **Target**: 95% comprehension of SVO + particle structure
- **Key Tests**: Basic sentences with `pa`/`fu` tense, `nok` negation, `ri` respect
- **Evaluation**: Do learners understand meaning without ambiguity?

### Gesture Testing (Per Section 4.5)
- **Target**: 80% comprehension without explanation across cultural groups
- **Key Tests**: "Yes" nod, "Question" shrug, "Number 1" finger raise
- **Evaluation**: Cultural appropriateness, accessibility alternatives needed?

### Accessibility Testing (Per Section 2)
- **Target**: WCAG 2.1 AA compliance for all materials
- **Key Tests**: Screen reader navigation, keyboard accessibility, alternative formats
- **Evaluation**: Can users with disabilities access all learning materials?

## Submission Guidelines
- **Technical Users**: Submit test results via [Issues](https://github.com/jlillywh/Fidakune-Language/issues) using `[TESTING FEEDBACK]` prefix:
  - Example: `[TESTING FEEDBACK] Phonology Test for /ɾ/`
  - Include: Test type, results, linguistic background, suggestions.
- **Non-Technical Users**: Email results to [fidakune.contact@gmail.com].
- **Feedback Focus**:
  - Phonology: Ease of pronunciation, approximation challenges.
  - Grammar: Clarity of SVO structure and particles.
  - Vocabulary: Cultural neutrality, expressiveness.
  - Gestures: Cultural appropriateness, accessibility.
  - Accessibility: Screen reader compatibility, tool usability.

## Data Collection for Language Council

Testing results will inform the [Fidakune Language Council](GOVERNANCE.md) decision-making process:

### Quantitative Metrics
- Learning time to reach Tier 1/Tier 2 proficiency
- Pronunciation accuracy rates by language family
- Grammar comprehension scores
- Gesture recognition rates across cultures

### Qualitative Feedback
- Cultural sensitivity concerns
- Accessibility improvement suggestions
- Phoneme approximation strategies
- Learning difficulty reports

## Accessibility

All testing materials and tools adhere to WCAG 2.1 standards. Testers are encouraged to report accessibility issues to ensure inclusivity. Alternative testing formats available upon request.

## Current Vocabulary for Testing

See [lexicon.json](lexicon.json) and [LEXICON.md](LEXICON.md) for the current 15-word vocabulary available for testing. This will expand to 200 words by Month 6 per the development timeline.

---

Thank you for helping validate Fidakune as a global second language! Your feedback shapes a more inclusive and learnable communication tool for everyone.
