import type { SectionComponentProps } from '../types';
import type { FooterProps } from '../schemas/footer';

export function Footer({ props }: SectionComponentProps) {
  const footer = props as FooterProps;
  const year = new Date().getFullYear();
  const copyright =
    footer.copyright ?? `© ${year} ${footer.businessName}. All rights reserved.`;

  return (
    <footer className="border-t border-border bg-background px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-primary">{footer.businessName}</p>
          {footer.tagline ? <p className="text-sm text-muted">{footer.tagline}</p> : null}
        </div>
        {footer.links?.length ? (
          <nav aria-label="Footer links" className="flex flex-wrap gap-4">
            {footer.links.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-muted hover:text-primary">
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
        {footer.showSocialLinks && footer.social?.length ? (
          <div className="flex gap-3">
            {footer.social.map((item) => (
              <a
                key={item.platform}
                href={item.url}
                className="text-sm text-muted hover:text-primary"
              >
                {item.platform}
              </a>
            ))}
          </div>
        ) : footer.showSocialLinks ? (
          <p className="text-sm text-muted">Social links</p>
        ) : null}
      </div>
      <p className="mx-auto mt-6 max-w-5xl text-xs text-muted">{copyright}</p>
    </footer>
  );
}
