import { contact } from '@/lib/site';
import { ArrowRight } from '@/components/ui/Icons';

export function Contact() {
  return (
    <section id="contact" className="section wrap">
      <div className="cta">
        <div className="eyebrow">{contact.eyebrow}</div>
        <h2>{contact.heading}</h2>
        <p>{contact.body}</p>
        <a className="btn btn-primary" href={contact.cta.href}>
          {contact.cta.label}
          <span className="btn-chip" aria-hidden="true">
            <ArrowRight />
          </span>
        </a>
      </div>
    </section>
  );
}
