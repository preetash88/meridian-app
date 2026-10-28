import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_LINKS, SITE } from "@/lib/site";

export function Footer() {
  return (
      <footer className="bg-night text-paper/80">
        <div className="mx-auto grid max-w-(--container-page) gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-[0.95rem] leading-relaxed text-paper/65">{SITE.tagline}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-display text-base font-semibold text-paper">Explore</h2>
            <ul className="mt-4 space-y-3 text-[0.95rem]">
              {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-white">{l.label}</Link>
                  </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-base font-semibold text-paper">Start here</h2>
            <ul className="mt-4 space-y-3 text-[0.95rem]">
              <li><Link href="/get-started?type=employer" className="hover:text-white">I'm hiring</Link></li>
              <li><Link href="/get-started?type=candidate" className="hover:text-white">I'm looking for work</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy policy</Link></li>
            </ul>
          </div>

          <div className="glass-dark rounded-tile p-6">
            <h2 className="font-display text-base font-semibold text-paper">Talk to us</h2>
            <p className="mt-2 text-[0.9rem] text-paper/65">We reply to every enquiry within {SITE.responseTime}.</p>
            <ul className="mt-4 space-y-2.5 text-[0.95rem]">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-verdigris-bright" aria-hidden="true" />
                <a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a>
              </li>
              {SITE.phone && (
                  <li className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-verdigris-bright" aria-hidden="true" />
                    <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-white">{SITE.phone}</a>
                  </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-paper/10">
          <div className="mx-auto flex max-w-(--container-page) flex-wrap items-center justify-between gap-2 px-5 py-6 text-sm text-paper/50 sm:px-8">
            <p>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
  );
}
