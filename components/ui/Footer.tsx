import { footer, site } from '@/lib/site';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <span className="footer-brand">
            <Logo className="footer-mark" />
            {site.name}
          </span>
          <p className="footer-line">{site.footerLine}</p>
        </div>

        <nav className="footer-links" aria-label="Site">
          {footer.links.map((link) =>
            link.external ? (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer noopener">
                {link.label}
              </a>
            ) : (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ),
          )}
        </nav>

        <span>&copy; 2024</span>
      </div>
    </footer>
  );
}
