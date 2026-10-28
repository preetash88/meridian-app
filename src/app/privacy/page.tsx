import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${SITE.name} handles personal information.`,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function Privacy() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-24 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:mt-3 [&_p]:text-slate [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-slate [&_li]:mt-1.5">
      <h1 className="text-4xl font-semibold sm:text-5xl">Privacy policy</h1>
      <p>{SITE.legalName}{SITE.abn ? ` (ABN ${SITE.abn})` : ""} operates {SITE.name}. This page explains what we collect through this website and why.</p>

      <h2>What we collect</h2>
      <p>When you send an enquiry we collect the details you enter: your name, email address, optional phone number, role, industry, location and any message, plus a LinkedIn link if you provide one.</p>

      <h2>Why we collect it</h2>
      <ul>
        <li>To reply to your enquiry.</li>
        <li>For employers: to understand and fulfil your hiring brief.</li>
        <li>For job seekers: to provide job-search support and to match you with suitable roles.</li>
      </ul>

      <h2>Who sees it</h2>
      <p>Enquiries are emailed to our team through an email delivery provider. We don't sell your information. We share candidate details with an employer only when you've agreed to be put forward for a role.</p>

      <h2>Checks on candidates</h2>
      <p>Identity, right-to-work, qualification and criminal history checks are only carried out with the candidate's consent.</p>

      <h2>Access and corrections</h2>
      <p>You can ask to see, correct or delete the information we hold about you by emailing <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>

      <p className="!mt-10 text-sm">Last updated: {new Date().getFullYear()}.</p>
    </article>
  );
}
