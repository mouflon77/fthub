import { site, work } from '@/lib/site';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">
          <Logo className="footer-mark" />
          {site.name} · {site.domain}
        </span>

        <nav className="footer-links" aria-label="Our products">
          {work.projects.map((project) => (
            <a key={project.name} href={project.href} target="_blank" rel="noreferrer noopener">
              {project.display}
            </a>
          ))}
        </nav>

        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
