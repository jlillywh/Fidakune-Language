---
title: "Fidakune Grammar"
version: 1.0
status: "Official"
related_docs:
- "REQUIREMENTS.md"
- "PHONOLOGY.md"
- "LEXICON.md"
---

# Fidakune Grammar

This document serves as the single source of truth for Fidakune's grammatical system, providing comprehensive guidance on sentence structure, particles, and syntactic rules. Fidakune's grammar is designed for maximum simplicity, regularity, and predictability to minimize cognitive load while maintaining expressive capacity.

## 1. Core Principles

Fidakune is a **strictly analytic language**, meaning it relies entirely on word order and function words (particles) rather than inflection to express grammatical relationships. This design eliminates irregular verb conjugations, noun declensions, and other morphological complexities found in many natural languages.

### Word Order
Fidakune employs a fixed **Subject-Verb-Object (SVO)** word order in all declarative sentences:

- `mi go home` (I go home)
- `ami help mi` (friend helps me)
- `ri ami pa give le aqua to mi` (the respected friend finished giving water to me)

This consistent ordering provides a reliable framework for sentence construction and interpretation across all contexts.

## 2. Particles

Function words (particles) in Fidakune serve to express grammatical concepts such as tense, aspect, and negation. These particles maintain fixed positions relative to the verb, creating a predictable and learnable system.

### Particle Order
Particles follow a strict sequence around the verb:

**Tense → Negation → VERB → Aspect**

### Tense Particles (Pre-Verbal)
- `pa` - past tense
- `fu` - future tense
- (no particle) - present tense

### Negation Particle (Pre-Verbal)
- `nok` - negation (not)

### Aspect Particle (Post-Verbal)
- `le` - completed aspect (finished action)

### Example Demonstrating Full Particle Order
`mi pa nok go le` 
("I did not finish going" - literally: I PAST NOT go COMPLETED)

This sentence demonstrates the complete particle sequence: subject (`mi`) + past tense (`pa`) + negation (`nok`) + verb (`go`) + completed aspect (`le`).

## 3. Question Formation

Fidakune employs two distinct strategies for forming questions, depending on the type of information sought.

### Yes/No Questions
Yes/No questions are formed through:
1. **Rising intonation** in spoken Fidakune
2. **Optional sentence-initial particle `ka`** for written clarity or emphasis

**Examples:**
- `you go?` (with rising intonation)
- `ka you go?` (with optional question particle)

### Information Questions
Information questions place question words at the beginning of the sentence, followed by standard SVO order.

**Question words include:**
- `keva` - what
- `kove` - who  
- `kela` - where
- `keta` - when
- `kemo` - how

**Complex Example:**
`keva mi pa give le to ami?`
("What did I finish giving to the friend?")

This demonstrates question word placement with the full particle system: question word (`keva`) + subject (`mi`) + past tense (`pa`) + verb (`give`) + completed aspect (`le`) + prepositional phrase (`to ami`).

## 4. The Respect Particle `ri`

The particle `ri` serves as an optional marker of respect or formality in social contexts.

### Usage Rules
- `ri` is **optional** and used in formal or respectful contexts
- `ri` **precedes** the noun or pronoun it modifies
- `ri` can modify question words for respectful inquiries

### Examples
- `ri ami` (respected friend)
- `ri kove` (respected who - "who, if I may ask respectfully")
- `mi help ri ami` (I help the respected friend)

The respect particle allows speakers to navigate social hierarchies and cultural expectations while maintaining grammatical simplicity.

## 5. Complex Sentences

Fidakune's grammar supports multiple clauses and complex sentence structures while maintaining its analytic nature.

### Subordinate Clauses
The complementizer `ke` introduces subordinate clauses:

`mi know ke ri ami fu go kela`
("I know that the respected friend will go there")

This sentence demonstrates:
- Main clause: `mi know` (I know)
- Complementizer: `ke` (that)
- Subordinate clause: `ri ami fu go kela` (the respected friend will go there)

### Clause Structure
Each clause maintains standard SVO order and particle placement, allowing for complex ideas to be expressed through clause combination rather than morphological complexity.

## Check Your Understanding: Particle Ordering

Arrange the following elements into a grammatically correct Fidakune sentence:
- `ami` (friend)
- `pa` (past tense)
- `nok` (negation)  
- `help` (verb)
- `le` (completed aspect)
- `mi` (me/I)

**Challenge:** Create a sentence meaning "The friend did not finish helping me."

**Answer:** `ami pa nok help le mi`

**Explanation:** This follows the required order: Subject (`ami`) + Tense (`pa`) + Negation (`nok`) + Verb (`help`) + Aspect (`le`) + Object (`mi`).

---

*This document aligns with REQUIREMENTS.md v.0.13 and serves as the authoritative reference for all Fidakune grammatical specifications.*