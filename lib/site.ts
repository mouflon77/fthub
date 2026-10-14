export const site = {
  name: 'Frontier Tech Hub',
  shortName: 'FTH',
  domain: 'frontiertechhub.com',
  url: 'https://frontiertechhub.com',
  tagline: 'AI-Native Product Studio',
  description:
    'Frontier Tech Hub builds AI-powered software, SaaS platforms and intelligent automation solutions. Explore our products and build with us.',
  footerLine: 'AI-native products. Real-world solutions.',
  email: 'info@frontiertechhub.com',
} as const;

export const nav = [
  { label: 'Products', href: '#products' },
  { label: 'What We Do', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
] as const;

export type SocialKind = 'linkedin' | 'x' | 'telegram';

export type SocialLink = {
  kind: SocialKind;
  href: string;
  label: string;
};

const enquire = `mailto:${site.email}?subject=Project%20enquiry`;
const collaborate = `mailto:${site.email}?subject=Let's%20build%20something`;

export const hero = {
  eyebrow: 'AI-Native Product Studio',
  heading: 'We build AI-powered products that solve real problems.',
  body: 'We design, develop and launch intelligent software, SaaS platforms and AI-powered solutions that help people and businesses work smarter.',
  primary: { label: 'Explore our products', href: '#products' },
  secondary: { label: 'Build with us', href: '#contact' },
} as const;

export const work = {
  eyebrow: 'Our portfolio',
  heading: 'Products, not prototypes.',
  lede: "We don't just talk about emerging technology. We build with it. Real products designed to solve specific problems and create new opportunities.",
  products: [
    {
      key: 'jobs',
      status: 'Live product',
      name: 'Frontier Tech Jobs',
      claim: 'Where frontier-tech talent meets opportunity.',
      body: 'A specialist platform connecting professionals with opportunities across AI, Web3 and emerging technologies, while helping companies reach relevant talent.',
      href: 'https://frontiertechjobs.com/',
      cta: 'Explore Frontier Tech Jobs',
      visual: 'jobs',
      socials: [
        { kind: 'x', href: 'https://x.com/frontiertechx', label: 'Frontier Tech Jobs on X' },
        { kind: 'telegram', href: 'https://t.me/onchainbrits', label: 'Frontier Tech Jobs on Telegram' },
      ] satisfies SocialLink[],
    },
    {
      key: 'hastur',
      status: 'Early access',
      name: 'Hastur',
      claim: 'Spot narratives before they become market opportunities.',
      body: 'An AI-powered intelligence platform tracking emerging news, social trends and market sentiment, connecting narratives with memecoins and potential trading opportunities.',
      href: 'https://hastur.io/',
      cta: 'Explore Hastur',
      visual: 'hastur',
      socials: [{ kind: 'x', href: 'https://x.com/gethastur', label: 'Hastur on X' }] satisfies SocialLink[],
    },
  ],
} as const;

export const coming = {
  eyebrow: 'In development',
  heading: "What's coming next.",
  lede: 'New products exploring how AI can simplify everyday life, transform discovery and accelerate business growth.',
  items: [
    {
      icon: '▦',
      name: 'Family Scheduling Assistant',
      lead: 'Less organising. More living.',
      body: 'An intelligent assistant bringing family calendars, school commitments, appointments and routines into one place to help busy mums stay organised.',
    },
    {
      icon: '◉',
      name: 'AI Advertising Platform',
      lead: 'Advertising for the next era of discovery.',
      body: 'A platform being developed to help businesses navigate emerging advertising opportunities in AI environments, including ChatGPT.',
    },
    {
      icon: '◎',
      name: 'AI Lead Generation Platform',
      lead: 'Smarter prospecting. Better opportunities.',
      body: 'An AI-powered platform intended to help businesses discover and qualify prospects and develop more efficient sales pipelines.',
    },
  ],
} as const;

export const services = {
  eyebrow: 'What we build',
  heading: 'From idea to intelligent software.',
  lede: 'We combine product thinking, modern development and AI to build useful technology around real market and business needs.',
  items: [
    {
      number: '01 /',
      title: 'AI-Native SaaS Platforms',
      body: 'From early concepts to scalable applications, we build SaaS products designed for practical use and long-term evolution.',
    },
    {
      number: '02 /',
      title: 'Custom AI Applications',
      body: 'Purpose-built AI tools and applications to tackle business challenges, improve experiences and unlock new capabilities.',
    },
    {
      number: '03 /',
      title: 'Intelligent Automation',
      body: 'Connected systems and smarter workflows that cut repetitive tasks and help teams work more efficiently.',
    },
  ],
} as const;

export const about = {
  eyebrow: 'Why Frontier Tech Hub',
  heading: 'Small team. Fast cycles. Real products.',
  lede: 'Great software starts with clear thinking and gets better through focused execution, collaboration and feedback.',
  principles: [
    {
      title: 'Product-first thinking',
      body: 'We focus on understanding the problem before choosing the technology.',
    },
    {
      title: 'Lean by design',
      body: 'Small teams, direct communication and fewer unnecessary layers.',
    },
    {
      title: 'Built to launch',
      body: 'We prioritise working products, real users and continuous improvement.',
    },
    {
      title: 'AI-native approach',
      body: 'We use AI in how we design, develop and evolve products, not just as an add-on.',
    },
  ],
} as const;

export const process = {
  eyebrow: 'Our process',
  heading: 'From idea to launch.',
  lede: 'A practical process built to turn promising concepts into software people can actually use.',
  steps: [
    { title: '01. Discover', body: 'Understand the challenge, the audience and the opportunity.' },
    { title: '02. Design', body: 'Define the product, the user experience and delivery priorities.' },
    { title: '03. Build', body: 'Develop, test and iterate using modern tools and AI-powered workflows.' },
    { title: '04. Launch & Evolve', body: 'Release, learn from users and keep improving.' },
  ],
} as const;

export const business = {
  eyebrow: 'For businesses',
  heading: 'Bring the lab inside your business.',
  lede: 'Alongside building our own products, we help businesses apply AI, create custom software and improve the way they work.',
  cta: { label: 'Discuss your project', href: '#contact' },
  items: [
    {
      title: 'AI Infrastructure Audits',
      body: 'Identify practical opportunities for AI adoption, improved workflows and more effective systems.',
    },
    {
      title: 'In-House AI Training',
      body: 'Help teams build the confidence and skills to use AI responsibly and effectively in everyday work.',
    },
    {
      title: 'Custom-Built Solutions',
      body: 'Create intelligent internal tools, business applications and customer-facing software tailored to your needs.',
    },
  ],
} as const;

export const contact = {
  eyebrow: "Let's collaborate",
  heading: 'Have an idea worth building?',
  body: "Whether you're planning a SaaS product, exploring AI for your business or looking for a technical development partner, we'd love to hear about it.",
  cta: { label: "Let's build something", href: collaborate },
  headerCta: { label: 'Build with us', href: enquire },
  links: [
    {
      kind: 'linkedin',
      href: 'https://www.linkedin.com/company/frontiertechcommunity',
      label: 'Frontier Tech Hub on LinkedIn',
    },
    { kind: 'x', href: 'https://x.com/OnchainHubco', label: 'Frontier Tech Hub on X' },
  ] satisfies SocialLink[],
} as const;
