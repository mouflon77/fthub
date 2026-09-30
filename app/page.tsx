import { Stage } from '@/components/garden/Stage';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Work } from '@/components/sections/Work';
import { Contact } from '@/components/sections/Contact';
import { contact, site, work } from '@/lib/site';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: site.url,
  slogan: site.tagline,
  description: site.description,
  address: { '@type': 'PostalAddress', addressLocality: 'London', addressCountry: 'GB' },
  sameAs: [...new Set([...contact.links, ...work.projects.flatMap((project) => project.socials)].map((link) => link.href))],
  owns: work.projects.map((project) => ({ '@type': 'WebSite', name: project.name, url: project.href })),
};

export default function Page() {
  return (
    <>
      <a className="skip" href="#about">
        Skip to content
      </a>

      <Stage />

      <Header />

      <main className="page" id="top">
        <Hero />
        <About />
        <Work />
        <Contact />
        <Footer />
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
