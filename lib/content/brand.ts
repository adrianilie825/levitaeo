export type BrandValue = {
  title: string;
  description: string;
};

export type EditorialProcessStep = {
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqTopic = {
  id: string;
  title: string;
  items: FaqItem[];
  comingSoon?: boolean;
};

export const aboutSections = [
  {
    eyebrow: "Our Story",
    title: "A vision for digital art that endures.",
    description:
      "Levitaeo began with a simple conviction: digital art deserves the same care, restraint, and permanence we expect from the finest print editions.",
    href: "/about/our-story",
    cta: "Read our story",
  },
  {
    eyebrow: "Philosophy",
    title: "Five values that guide every edition.",
    description:
      "Timeless, minimal, curated, authentic, and collectible — not as marketing language, but as editorial standards we return to with every release.",
    href: "/about/philosophy",
    cta: "Explore our philosophy",
  },
  {
    eyebrow: "Editorial Process",
    title: "From research to collection.",
    description:
      "Each edition passes through a deliberate sequence — research, curation, design, publication, and collection — before it reaches you.",
    href: "/about/editorial-process",
    cta: "See the process",
  },
] as const;

export const whyLevitaeoExists = {
  eyebrow: "Why Levitaeo Exists",
  title: "Digital art, treated as culture — not content.",
  paragraphs: [
    "The internet offers infinite images, yet very few feel worth keeping. Levitaeo exists to close that gap: to publish digital editions with the same editorial integrity found in fine art books, independent magazines, and considered design studios.",
    "We believe screens are not a lesser medium. They are the surfaces where most of us live — in homes, studios, and quiet moments between tasks. Art for those spaces should feel intentional, calm, and lasting.",
    "Levitaeo is not a marketplace. It is a publication. Fewer releases. Stronger worlds. Work you return to.",
  ],
};

export const ourStoryContent = {
  eyebrow: "Our Story",
  title: "Built for collectors who value restraint.",
  intro:
    "Levitaeo was founded on the belief that digital art can carry the same emotional weight as a framed print or a well-edited volume — when it is created, selected, and presented with care.",
  sections: [
    {
      title: "The beginning",
      body: "We started Levitaeo after years spent surrounded by visual noise — endless feeds, disposable imagery, and art that disappeared as quickly as it appeared. We wanted the opposite: a quiet place to discover work with character, balance, and staying power.",
    },
    {
      title: "An editorial mindset",
      body: "Every Levitaeo collection is developed as a focused visual world. We release in volumes rather than floods, allowing each edition room to breathe. The result is a catalogue that feels personal — closer to a private library than a warehouse.",
    },
    {
      title: "Looking forward",
      body: "Our ambition is modest and enduring: to publish digital editions that collectors are proud to live with — on premium displays, in curated interiors, and in personal libraries that grow slowly and meaningfully over time.",
    },
  ],
};

export const philosophyValues: BrandValue[] = [
  {
    title: "Timeless",
    description:
      "We favour visual language that outlasts trends — compositions, palettes, and atmospheres designed to feel relevant years from now, not merely this season.",
  },
  {
    title: "Minimal",
    description:
      "Restraint is an editorial choice. We remove what distracts so the essential image can hold the room — on a screen, a wall, or in memory.",
  },
  {
    title: "Curated",
    description:
      "Nothing is published by accident. Each edition is selected for distinct character and placed within a collection where it belongs — never added to fill space.",
  },
  {
    title: "Authentic",
    description:
      "We work with original vision and honest craft. Levitaeo editions are created to be collected, not replicated — each release reflects a genuine artistic point of view.",
  },
  {
    title: "Collectible",
    description:
      "Digital ownership should feel meaningful. Our editions are prepared at exceptional resolution, documented with care, and released in numbered series worthy of a personal collection.",
  },
];

export const editorialProcessSteps: EditorialProcessStep[] = [
  {
    title: "Research",
    description:
      "We begin with observation — studying light, form, atmosphere, and the cultural moods that give a collection its reason to exist.",
  },
  {
    title: "Curation",
    description:
      "Ideas are narrowed with editorial discipline. Only work with clear identity and lasting presence advances beyond the studio wall.",
  },
  {
    title: "Design",
    description:
      "Each edition is refined for balance, scale, and detail — composed for modern screens and prepared for premium reproduction.",
  },
  {
    title: "Publication",
    description:
      "Released deliberately, with full metadata, edition numbering, and presentation that honours the work as a finished object.",
  },
  {
    title: "Collection",
    description:
      "Editions enter your library instantly — ready for display, download, and the quiet pleasure of ownership.",
  },
];

export const faqTopics: FaqTopic[] = [
  {
    id: "digital-editions",
    title: "Digital Editions",
    items: [
      {
        question: "What is a Levitaeo digital edition?",
        answer:
          "A Levitaeo edition is a curated, high-resolution digital artwork released in a numbered series. Each edition belongs to a collection and is prepared for display on premium screens and personal devices.",
      },
      {
        question: "How are editions numbered?",
        answer:
          "Every edition within a release carries a unique edition number. Your purchase confirms ownership of that specific edition in the series.",
      },
      {
        question: "Can I view my editions before downloading?",
        answer:
          "Yes. After purchase, your editions appear in your Levitaeo Library, where you can preview and download your files at any time.",
      },
    ],
  },
  {
    id: "downloads",
    title: "Downloads",
    items: [
      {
        question: "What file formats are included?",
        answer:
          "Downloads are provided in high-resolution formats suited to display and archival use. Specific formats may vary by edition and are listed on each product page.",
      },
      {
        question: "How many times can I download my edition?",
        answer:
          "Your Library provides ongoing access to your purchased editions. You may download your files whenever you need them.",
      },
      {
        question: "Which devices are supported?",
        answer:
          "Levitaeo editions are designed for modern displays — desktop monitors, tablets, phones, and digital frames that accept standard image files.",
      },
    ],
  },
  {
    id: "license",
    title: "License",
    items: [
      {
        question: "What am I allowed to do with my edition?",
        answer:
          "Your purchase grants personal use rights — display in your home, studio, or personal devices, and print for private, non-commercial use unless otherwise stated on the edition page.",
      },
      {
        question: "Can I share or resell my edition?",
        answer:
          "Editions are licensed for personal enjoyment. Redistribution, resale, or commercial use is not permitted without explicit written agreement.",
      },
      {
        question: "Do I own the copyright?",
        answer:
          "You own your edition as a collectible digital object. The underlying copyright remains with Levitaeo and its creators.",
      },
    ],
  },
  {
    id: "printing",
    title: "Printing",
    items: [
      {
        question: "Can I print my edition?",
        answer:
          "Yes. Editions are prepared at resolutions suitable for premium printing. We recommend professional print services for best results.",
      },
      {
        question: "Are there size recommendations?",
        answer:
          "Recommended print dimensions depend on the edition’s native resolution. Guidance is provided on individual edition pages where applicable.",
      },
      {
        question: "Will colours match my screen?",
        answer:
          "Screens and printers interpret colour differently. For critical colour accuracy, we suggest working with a reputable fine-art printer and requesting a proof.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    items: [
      {
        question: "Which payment methods do you accept?",
        answer:
          "Checkout is handled securely through Stripe. Major credit and debit cards are accepted where available in your region.",
      },
      {
        question: "When do I receive my edition?",
        answer:
          "Access is immediate. Once payment is confirmed, your edition appears in your Library without delay.",
      },
      {
        question: "Can I request a refund?",
        answer:
          "Because digital editions are delivered instantly, purchases are generally final. If you experience a technical issue with your order, please contact us and we will help resolve it.",
      },
    ],
  },
  {
    id: "membership",
    title: "Membership",
    comingSoon: true,
    items: [
      {
        question: "What is Levitaeo Membership?",
        answer:
          "Membership will offer early access to new editions, studio notes, and exclusive releases for collectors who want a closer relationship with the Levitaeo editorial programme.",
      },
      {
        question: "When will Membership launch?",
        answer:
          "We are developing Membership with the same care we bring to every edition. Join our newsletter to be notified when it becomes available.",
      },
    ],
  },
];

export const contactContent = {
  eyebrow: "Contact",
  title: "We welcome thoughtful correspondence.",
  intro:
    "Whether you have a question about an edition, your library, or a future collaboration — write to us. We read every message and respond with care.",
  responseNote: "We typically respond within two business days.",
};
