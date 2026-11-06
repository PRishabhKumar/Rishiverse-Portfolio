// Publication and research content. No filing numbers are stated until they exist.
export const publication = Object.freeze({
  kind: "Patent",
  title:
    "DEVICE AND METHOD FOR TACTILE AND VOICE NAVIGATION AND RECITATION ASSESSMENT OF HIERARCHICALLY STRUCTURED TEXT",
  summary:
    "A device and method for moving through hierarchically structured text—verses, chapters, and their nested linguistic units—using touch and voice together, and for evaluating how accurately that text is recited.",
  areas: [
    "Tactile navigation",
    "Voice navigation",
    "Recitation assessment",
    "Hierarchical text",
    "Assistive interaction",
  ],
  audience:
    "Readers who learn, recite, or teach layered classical texts—including visually impaired learners.",
});

export const project = Object.freeze({
  name: "Swadhyay",
  tagline: "An end-to-end RAG platform for classical Sanskrit philosophy.",
  summary:
    "Computational philology meets retrieval-augmented generation: automated Sandhi splitting, grammatical inflection tagging, word-by-word morphology, and grounded question-answering across the 1,000+ verses of the Shrimad Bhagavad Gita.",
  focus: [
    "Sandhi splitting",
    "Morphological tagging",
    "Word-by-word meaning",
    "Grounded verse Q&A",
  ],
  note: "The engineering write-up—ingestion, embeddings, vector search, and the full stack—will join the work section once the platform is complete.",
});

// Shrimad Bhagavad Gita 1.1, a public-domain classical text, used to show how the
// system decomposes a single verse. Splits follow the provided specification.
export const verse = Object.freeze({
  reference: "Shrimad Bhagavad Gita · Chapter 1 · Verse 1",
  speaker: "Dhritarashtra uvāca",
  devanagari:
    "धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः ।\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ॥",
  iast: "dharmakṣetre kurukṣetre samavetā yuyutsavaḥ |\nmāmakāḥ pāṇḍavāś caiva kim akurvata sañjaya ||",
  translation:
    "On the field of dharma, the field of the Kurus, gathered and eager to fight—what did my sons and the Pandavas do, O Sanjaya?",
  tokens: [
    {
      word: "धर्मक्षेत्रे",
      iast: "dharmakṣetre",
      meaning: "in the field of dharma",
      tag: "Saptamī · locative",
      note: "Location: where duty is examined.",
    },
    {
      word: "कुरुक्षेत्रे",
      iast: "kurukṣetre",
      meaning: "in the field of the Kurus",
      tag: "Saptamī · locative",
      note: "A real place, and a state of mind.",
    },
    {
      word: "समवेताः",
      iast: "samavetāḥ",
      meaning: "assembled together",
      tag: "Past participle",
      note: "Collected, gathered as one.",
    },
    {
      word: "युयुत्सवः",
      iast: "yuyutsavaḥ",
      meaning: "desiring to fight",
      tag: "Desiderative",
      note: "The wish, before the act.",
    },
    {
      word: "मामकाः",
      iast: "māmakāḥ",
      meaning: "my sons / my people",
      tag: "Genitive sense",
      note: "Attachment, speaking plainly.",
    },
    {
      word: "पाण्डवाः",
      iast: "pāṇḍavāḥ",
      meaning: "the Pandavas",
      tag: "Nominative plural",
      note: "The other side of a family.",
    },
    {
      word: "च",
      iast: "ca",
      meaning: "and",
      tag: "Conjunction",
      note: "Joins two fates.",
    },
    {
      word: "एव",
      iast: "eva",
      meaning: "indeed / also",
      tag: "Emphasis",
      note: "Adds weight, not just grammar.",
    },
    {
      word: "किम्",
      iast: "kim",
      meaning: "what?",
      tag: "Interrogative",
      note: "The question, split from its verb.",
    },
    {
      word: "अकुर्वत",
      iast: "akurvata",
      meaning: "did they do",
      tag: "Imperfect·3rd plural",
      note: "An act already underway.",
    },
    {
      word: "सञ्जय",
      iast: "sañjaya",
      meaning: "O Sanjaya",
      tag: "Sambodhana · vocative",
      note: "Direct address to the narrator.",
    },
  ],
  compounds: [
    {
      raw: "पाण्डवाश्चैव",
      parts: "पाण्डवाः + च + एव",
      gloss: "the Pandavas + and + indeed",
    },
    { raw: "किमकुर्वत", parts: "किम् + अकुर्वत", gloss: "what + did they do" },
    {
      raw: "धर्मक्षेत्रे",
      parts: "धर्म + क्षेत्रे",
      gloss: "dharma + in the field",
    },
  ],
});

// ICDMIS 2026 best paper. Names and dates are transcribed from the issued
// certificate; the metrics come from the paper's own evaluation section.
export const award = Object.freeze({
  kind: "Best Paper Award",
  conference: "3rd International Conference on Data Mining and Information Security",
  conferenceShort: "ICDMIS 2026",
  organisers:
    "Eminent College of Management and Technology, India · Sri Lanka Institute of Information Technology (SLIIT), Sri Lanka",
  dates: "7–8 October 2026",
  session: "Technical Paper Presentation · Track 2",
  paper: {
    lines: [
      "Explainable Resume–Job Matching",
      "via Multi-Granular Semantic Embedding’s",
      "and Calibrated Gradient Boosting",
    ],
    idea:
      "Semantic embeddings read at three granularities — document, sentence, keyword — fused with experience features and a calibrated gradient-boosting classifier, so every decision arrives with its reasons attached.",
    metrics: [
      { value: "66%", label: "overall accuracy", at: 0.13 },
      { value: "72%", label: "true-positive rate", at: 0.18 },
      { value: "65.5%", label: "“good fit” precision", at: 0.23 },
      { value: "−70%", label: "embedding compute time", at: 0.28 },
    ],
  },
  route: {
    from: { place: "India", note: "written, argued, rehearsed" },
    to: { place: "Sri Lanka", note: "presented on stage at SLIIT" },
    caption: "The paper crossed the sea before it crossed the finish line.",
  },
  verdict: {
    title: "Best Paper",
    session: "Technical Paper Presentation · Track 2",
    line: "Awarded for the winning paper of the track, ICDMIS 2026.",
  },
  authors: [
    "Rishabh Kumar",
    "Dr. Narayanan Prasanth",
    "Karkuvelraja Thangamariappan",
    "Naveenkumar Jayakumar",
    "Varughese Matheo",
  ],
  role:
    "My role — co-author: I contributed to the writing and the analysis, then prepared and briefed the co-authors who travelled to Sri Lanka to present the paper on stage.",
  signatories: [
    "Dr. Surajit Goon — Academic Director, Eminent Group of Colleges, India",
    "Prof. Nuwan Kodagoda — Deputy Vice Chancellor (Computing), SLIIT, Sri Lanka",
  ],
  artifacts: [
    {
      id: "certificate",
      src: "/images/award/certificate.webp",
      alt: "ICDMIS 2026 best paper certificate naming the five authors and the winning paper title",
      caption: "The certificate, as issued.",
    },
    {
      id: "memento",
      src: "/images/award/memento.webp",
      alt: "Silver ICDMIS 2026 best paper award plaque with three rising stars",
      caption: "The award memento, ICDMIS 2026.",
    },
  ],
});

export const awardActs = [
  { id: "paper", number: "01", fillAt: 0, label: "The paper" },
  { id: "crossing", number: "02", fillAt: 0.36, label: "The crossing" },
  { id: "verdict", number: "03", fillAt: 0.7, label: "The verdict" },
];

export const stages = [
  {
    id: "source",
    number: "01",
    fillAt: 0,
    label: "The source",
    text: "One verse, dual script.",
  },
  {
    id: "split",
    number: "02",
    label: "The split",
    text: "Sandhi and compounds unwind.",
  },
  {
    id: "meaning",
    number: "03",
    label: "The meaning",
    text: "Each unit, word by word.",
  },
  {
    id: "grammar",
    number: "04",
    label: "The grammar",
    text: "Case, mood, and address.",
  },
  {
    id: "access",
    number: "05",
    label: "The access",
    text: "Touch it. Say it. Be assessed.",
  },
];
