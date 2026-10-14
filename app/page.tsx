import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/components/sections/Hero';
import { Work } from '@/components/sections/Work';
import { Coming } from '@/components/sections/Coming';
import { Services } from '@/components/sections/Services';
import { About } from '@/components/sections/About';
import { Process } from '@/components/sections/Process';
import { Business } from '@/components/sections/Business';
import { Contact } from '@/components/sections/Contact';
import { contact, site, work } from '@/lib/site';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: site.url,
  slogan: site.tagline,
  description: site.description,
  email: site.email,
  sameAs: contact.links.map((link) => link.href),
  owns: work.products.map((product) => ({
    '@type': 'WebSite',
    name: product.name,
    url: product.href,
  })),
};

export default function Page() {
  return (
    <>
      <a className="skip" href="#products">
        Skip to content
      </a>

      <Header />

      <main className="page" id="top">
        <Hero />
        <Work />
        <Coming />
        <Services />
        <About />
        <Process />
        <Business />
        <Contact />
        <Footer />
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
