import { contact } from '@/lib/site';
import { Reveal } from '@/components/ui/Reveal';
import { Pin } from '@/components/ui/Icons';
import { SocialLinks } from '@/components/ui/SocialLinks';

export function Contact() {
  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="shell">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">{contact.eyebrow}</span>
            <h2 id="contact-title" className="h2">
              {contact.heading}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div className="contact-panel glass">
            <div className="contact-pitch">
              <p className="lede">{contact.lede}</p>
            </div>

            <div className="contact-rows">
              <div className="contact-row">
                <span className="contact-label">Studio</span>
                <span className="contact-value">
                  <Pin />
                  {contact.location}
                </span>
              </div>

              <div className="contact-row contact-socials">
                <span className="contact-label">Social</span>
                <SocialLinks links={contact.links} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
