import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/components/sections/Hero';
import { Work } from '@/components/sections/Work';
import { About } from '@/components/sections/About';
import { LookFor } from '@/components/sections/LookFor';
import { HowWeWork } from '@/components/sections/HowWeWork';
import { Lab } from '@/components/sections/Lab';
import { Advisory } from '@/components/sections/Advisory';
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
  sameAs: contact.links.map((link) => link.href),
  owns: [
    {
      '@type': 'WebSite',
      name: work.product.name,
      url: work.product.href,
    },
  ],
};

export default function Page() {
  return (
    <>
      <a className="skip" href="#work">
        Skip to content
      </a>

      <Header />

      <main className="page" id="top">
        <Hero />
        <Work />
        <About />
        <LookFor />
        <HowWeWork />
        <Lab />
        <Advisory />
        <Contact />
        <Footer />
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
