export const site = {
  name: 'Frontier Tech Hub',
  shortName: 'FTH',
  domain: 'frontiertechhub.com',
  url: 'https://frontiertechhub.com',
  tagline: 'We build the intelligent tools that build the future.',
  description:
    'Frontier Tech Hub is a London studio building intelligent tools for AI and onchain teams: community infrastructure, hiring systems, and the software that connects them.',
} as const;

export const nav = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
] as const;

export const about = {
  eyebrow: 'About',
  heading: 'Tools first. Everything else follows.',
  lede: 'Frontier tech does not lack ideas. It lacks the working software that turns those ideas into something people can join, use and build a career inside.',
  paragraphs: [
    'We are a small London studio that designs and ships intelligent tools for the AI and onchain world. Products, not prototypes: things with real users, real data and a roadmap behind them.',
    'Our own platforms cover the two problems we kept running into: communities scattered across a dozen disconnected apps, and hiring that wastes everyone\'s time. So we built the infrastructure for both, then kept the standard high enough to use it ourselves every day.',
    'If you are building at the frontier, use the tools or bring us the problem. We are most useful early, when the shape of the thing is still up for debate.',
  ],
  pillars: [
    {
      title: 'Product design',
      body: 'Interfaces that stay calm under real complexity: dense data, live state, non-technical users.',
    },
    {
      title: 'Applied AI',
      body: 'Retrieval, ranking and agents wired into the parts of a product where they earn their keep.',
    },
    {
      title: 'Onchain systems',
      body: 'Identity, membership and rewards designed to survive contact with an actual community.',
    },
  ],
} as const;

export type SocialKind = 'linkedin' | 'x' | 'telegram';

export type SocialLink = {
  kind: SocialKind;
  href: string;
  label: string;
};

export const work = {
  eyebrow: 'Work',
  heading: 'Two platforms, live today.',
  lede: 'Both are ours end to end: strategy, design, engineering and operations.',
  projects: [
    {
      name: 'OnchainHub',
      href: 'https://onchainhub.co',
      display: 'onchainhub.co',
      role: 'Community platform',
      image: '/work/onchainhub.jpg',
      pitch:
        'The home of AI and Web3 communities. One system for membership, identity, events and intelligence, run as a global network with operator-led regional hubs.',
      points: [
        'Global hub with regional operators',
        'Membership, identity and events in one place',
        'Campaigns and partner distribution',
      ],
      accent: 'primary',
      socials: [
        { kind: 'x', href: 'https://x.com/onchainhubco', label: 'OnchainHub on X' },
        { kind: 'linkedin', href: 'https://www.linkedin.com/company/onchainbrits', label: 'OnchainHub on LinkedIn' },
        { kind: 'telegram', href: 'https://t.me/onchainbrits', label: 'OnchainHub on Telegram' },
      ] satisfies SocialLink[],
    },
    {
      name: 'Frontier Tech Jobs',
      href: 'https://frontiertechjobs.com',
      display: 'frontiertechjobs.com',
      role: 'Job board and ATS',
      image: '/work/frontiertechjobs.jpg',
      pitch:
        'An advanced ATS and active job board for frontier tech. Company-vetted listings are pruned at 60 days, so what you see is a role someone is still hiring for.',
      points: [
        'Zero ghost jobs. 60 day listing life',
        'Search by role, company, stack or ecosystem',
        'Built for high-intent talent',
      ],
      accent: 'tertiary',
      socials: [
        { kind: 'x', href: 'https://x.com/frontiertechx', label: 'Frontier Tech Jobs on X' },
        { kind: 'telegram', href: 'https://t.me/onchainbrits', label: 'Frontier Tech Jobs on Telegram' },
      ] satisfies SocialLink[],
    },
  ],
} as const;

export const contact = {
  eyebrow: 'Contact',
  heading: 'Tell us what you are building.',
  lede: 'We read everything. If there is a fit, you will hear back from a person, not a funnel.',
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
