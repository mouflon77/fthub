export const site = {
  name: 'Frontier Tech Hub',
  shortName: 'FTH',
  domain: 'frontiertechhub.com',
  url: 'https://frontiertechhub.com',
  tagline: 'We build AI-native products for markets ready to work differently.',
  description:
    'Frontier Tech Hub is a London-based product lab. We find industries, workflows and platforms still running on outdated, fragmented or inefficient mechanics, then build intelligent SaaS products that rethink how they should work today.',
  footerLine: 'Building intelligent products for markets ready to work differently.',
} as const;

export const nav = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Lab', href: '#lab' },
  { label: 'Advisory', href: '#advisory' },
] as const;

export type SocialKind = 'linkedin' | 'x' | 'telegram';

export type SocialLink = {
  kind: SocialKind;
  href: string;
  label: string;
};

export const hero = {
  heading: 'We build AI-native products for markets ready to work differently.',
  intro: 'Frontier Tech Hub is a London-based product lab.',
  body: 'We find industries, workflows and platforms still running on outdated, fragmented or inefficient mechanics, then build intelligent SaaS products that rethink how they should work today.',
  primary: { label: 'See our work', href: '#work' },
  secondary: { label: 'What we do', href: '#about' },
} as const;

export const work = {
  eyebrow: 'Work',
  heading: 'Products, not prototypes.',
  lede: 'We build, launch and operate our own software.',
  question: 'If this was being built from scratch today, how should it work?',
  product: {
    eyebrow: 'Our first product',
    name: 'Frontier Tech Jobs',
    href: 'https://frontiertechjobs.com',
    display: 'frontiertechjobs.com',
    role: 'Jobs and talent platform',
    image: '/work/frontiertechjobs.jpg',
    tagline: 'Rebuilding how specialist talent is discovered.',
    problem:
      'Traditional job boards still depend on static listings, keyword searches and candidates manually filtering through irrelevant opportunities.',
    pitch:
      'Frontier Tech Jobs is an AI-powered jobs and talent platform built specifically for frontier technology. It structures roles, companies, sectors and skills more intelligently so candidates can find relevant opportunities faster, and companies can reach the people they actually want.',
    featuresHeading: 'Built differently',
    features: [
      'AI-powered job discovery',
      'Structured role and company data',
      'Search by role, company, stack and ecosystem',
      'Company-vetted opportunities',
      'Stale listings automatically removed',
      'Built specifically for frontier technology',
    ],
    cta: 'Visit Frontier Tech Jobs',
    socials: [
      { kind: 'x', href: 'https://x.com/frontiertechx', label: 'Frontier Tech Jobs on X' },
      { kind: 'telegram', href: 'https://t.me/onchainbrits', label: 'Frontier Tech Jobs on Telegram' },
    ] satisfies SocialLink[],
  },
} as const;

export const about = {
  eyebrow: 'About',
  heading: 'Tools first. Everything else follows.',
  paragraphs: [
    'A lot of software still works the way it did ten years ago.',
    'The interfaces have improved. The branding has changed. More features have been added.',
    'But underneath, many of the mechanics are exactly the same.',
    'Manual workflows. Fragmented data. Disconnected platforms. Repetitive tasks. Search systems that rely on keywords rather than understanding.',
    'We look for markets where AI can materially change how the product works, not simply add another feature to it.',
    'Then we build the software.',
  ],
  callout: {
    heading: "AI isn't a feature.",
    paragraphs: [
      "We don't believe adding a chatbot to an existing product makes it AI-native.",
      'The opportunity is bigger than that.',
      "AI should remove unnecessary work, connect information that was previously fragmented, improve decision-making and enable experiences that weren't practical before.",
      "If the underlying product works exactly the same without the AI, we probably haven't gone far enough.",
    ],
  },
} as const;

export const lookFor = {
  eyebrow: 'What we look for',
  heading: 'Where we build.',
  lede: 'We are interested in markets where technology can fundamentally improve the mechanics of how something works.',
  items: [
    {
      title: 'Broken mechanics',
      body: 'Products and industries are still dependent on manual processes, fragmented tooling, inefficient workflows or systems designed for another era.',
    },
    {
      title: 'AI leverage',
      body: 'Problems where intelligence, automation and better use of data can materially improve the experience rather than simply decorate it.',
    },
    {
      title: 'Product potential',
      body: 'Opportunities capable of becoming standalone software products with repeat users, genuine utility and room to scale.',
    },
  ],
} as const;

export const howWeWork = {
  eyebrow: 'How we work',
  heading: 'Small team. Fast cycles. Real products.',
  lede: "We don't spend months debating what might work. We identify a problem, understand the existing mechanics, build quickly and put the product in front of real users. Feedback drives the next iteration.",
  steps: [
    {
      title: 'Start with the problem.',
      subtitle: 'Technology comes second.',
      body: 'We first understand what is inefficient, fragmented or unnecessarily difficult — and why it still works that way.',
    },
    {
      title: 'Rebuild from first principles.',
      subtitle: '',
      body: "We don't automatically digitise the existing workflow. We ask what the product should look like if today's technology had always existed.",
    },
    {
      title: 'Ship early.',
      subtitle: '',
      body: 'A working product teaches us more than a perfect presentation. We prototype, launch, measure and improve.',
    },
  ],
} as const;

export const lab = {
  eyebrow: 'The Lab',
  heading: 'Built at Frontier Tech Hub.',
  lede: 'We sit at the intersection of product, AI, data and emerging technology.',
  paragraphs: [
    'Our role is not to predict what the future looks like.',
    "It's to build the software people will use when it arrives.",
  ],
  interestsHeading: 'Current areas of interest include:',
  interests: [
    {
      title: 'AI systems',
      body: 'Intelligent software that replaces repetitive workflows and improves how people access, understand and act on information.',
    },
    {
      title: 'Marketplaces & discovery',
      body: 'Products that use better data and intelligence to connect people, opportunities and resources.',
    },
    {
      title: 'Community infrastructure',
      body: 'New ways to manage identity, membership, participation, distribution and digital communities.',
    },
    {
      title: 'Frontier technology',
      body: 'Products built around emerging behaviours, industries and technologies where existing software has yet to catch up.',
    },
  ],
} as const;

export const advisory = {
  eyebrow: 'Advisory',
  heading: 'Bring the lab inside your business.',
  lede: 'Not every problem needs a new standalone product.',
  paragraphs: [
    'We also work directly with organisations that want to understand where AI can improve their existing systems, workflows and teams — and help them turn those opportunities into something practical.',
    'From identifying where AI can create leverage to training internal teams and building bespoke solutions, our advisory work applies the same thinking we use to build our own products.',
  ],
  services: [
    {
      title: 'AI & Infrastructure Audit',
      intro:
        'Understand where your current systems are helping, where they are holding you back and where AI can create meaningful efficiency.',
      body: 'We review existing technology, workflows, data and operational processes to identify:',
      points: [
        'Manual and repetitive workflows',
        'Fragmented systems and data',
        'Automation opportunities',
        'AI integration opportunities',
        'Inefficient or outdated processes',
        'Areas where custom technology could create an advantage',
      ],
      outro: 'The result is a practical roadmap of what to improve, automate, replace or build.',
    },
    {
      title: 'In-House AI Training',
      intro: 'Give your team the knowledge to actually use AI.',
      body: 'We create practical training programmes around the tools, workflows and use cases most relevant to your organisation. From foundational AI literacy through to role-specific implementation, training can be delivered across individual teams or company-wide.',
      pointsHeading: 'Examples include:',
      points: [
        'AI fundamentals',
        'Prompting and workflow design',
        'AI productivity tools',
        'Role-specific AI use cases',
        'Automation',
        'Internal AI adoption',
        'Responsible AI usage',
      ],
      outro: '',
    },
    {
      title: 'Custom-Built Solutions',
      intro: "When off-the-shelf software isn't enough, we build around the problem.",
      body: 'We design and develop bespoke AI-powered tools, workflows and internal systems around specific business requirements.',
      pointsHeading: 'That can include:',
      points: [
        'Internal AI tools',
        'Intelligent workflow automation',
        'AI agents',
        'Data and knowledge systems',
        'Search and discovery tools',
        'Existing platform integrations',
        'Bespoke SaaS applications',
      ],
      outro:
        'From initial problem definition through to deployment, we focus on building technology that removes friction and creates measurable operational value.',
    },
  ],
  cta: { label: 'Talk to us about Advisory', href: '#contact' },
} as const;

export const contact = {
  eyebrow: 'Contact',
  heading: 'See something that should work differently?',
  paragraphs: [
    "We are always interested in broken workflows, overlooked markets, proprietary data, distribution advantages and problems that technology hasn't solved properly yet.",
    'If you are an operator, founder, investor or domain expert with a market you believe is ready to be rebuilt, we\'d like to hear about it.',
  ],
  cta: {
    label: 'Tell us about it',
    href: 'https://www.linkedin.com/company/frontiertechcommunity',
  },
  note: "We read everything. If there's a fit, you'll hear back from a person — not a funnel.",
  location: 'London, United Kingdom',
  links: [
    {
      kind: 'linkedin',
      href: 'https://www.linkedin.com/company/frontiertechcommunity',
      label: 'Frontier Tech Hub on LinkedIn',
    },
    { kind: 'x', href: 'https://x.com/OnchainHubco', label: 'Frontier Tech Hub on X' },
  ] satisfies SocialLink[],
} as const;

export const footer = {
  links: [
    { label: 'Frontier Tech Jobs', href: 'https://frontiertechjobs.com', external: true },
    { label: 'Advisory', href: '#advisory', external: false },
  ],
} as const;
