import type { Metadata } from "next";
import { InterestForm } from "@/components/InterestForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get started",
  description: "Tell us who you're hiring or what role you're after. We reply within one business day.",
  alternates: { canonical: "/get-started" },
};

export default async function GetStarted({ searchParams }: { searchParams: Promise<{ type?: string; industry?: string }> }) {
  const { type, industry } = await searchParams;
  const initialType = type === "candidate" ? "candidate" : "employer";

  return (
    <section className="mx-auto grid max-w-(--container-page) gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
      <div>
        <h1 className="text-4xl font-semibold sm:text-5xl">Tell us a little, and we'll take it from there.</h1>
        <p className="mt-5 max-w-md text-lg text-slate">
          A few details is enough. We reply to every enquiry within {SITE.responseTime}.
        </p>
        <p className="mt-8 text-slate">
          Prefer email? Write to <a className="font-medium text-ink underline underline-offset-2" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </div>
      <InterestForm initialType={initialType} initialIndustry={industry} />
    </section>
  );
}
