import { contact, site } from '@/lib/site';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';

export function Footer() {
  return (
    <footer className="wrap footer">
      <div>
        <strong className="footer-brand">
          <Logo className="footer-mark" />
          {site.name}
        </strong>
        <br />
        {site.footerLine}
      </div>
      <SocialLinks links={contact.links} />
      <div>&copy; 2024 {site.name}</div>
    </footer>
  );
}
