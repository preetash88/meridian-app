import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ButtonLink } from "@/components/Button";
import { PriceCard } from "@/components/PriceCard";
import { Process } from "@/components/Process";
import { Faq } from "@/components/Faq";
import { CtaBand } from "@/components/CtaBand";
import { PRICING } from "@/lib/site";

export const metadata: Metadata = {
  title: "Find a role with Meridian",
  description: "Job-search support for candidates across every industry in Australia: resume building, LinkedIn optimisation and skills guidance.",
  alternates: { canonical: "/job-seekers" },
};

export default function JobSeekers() {
  return (
    <>
      <PageHero
        title="Present your best self to the employers who matter."
        intro="Tell us the role you want. We help you sharpen your resume, your LinkedIn profile and your skills, and introduce you when a role fits."
      >
        <ButtonLink href="/get-started?type=candidate">Tell us what you're after</ButtonLink>
      </PageHero>

      <Process heading="How it works for you" initial="candidate" showTabs={false} />

      <section className="mx-auto max-w-3xl px-5 pb-8 sm:px-8">
        <h2 className="mb-8 text-3xl font-semibold sm:text-4xl">Job-search support</h2>
        <PriceCard title="Candidate subscription" {...PRICING.candidate} href="/get-started?type=candidate" cta="Get started" />
      </section>

      <Faq items={[
        { q: "Will you get me a job?", a: "We can't guarantee a placement. We give you stronger application materials and clear guidance, and we introduce you to employers when a role fits." },
        { q: "What happens to my details?", a: "We use them to respond to your enquiry and to match you with roles. See our privacy policy for the full detail." },
        { q: "Which industries do you cover?", a: "Every industry. Tell us the role and the city you're aiming for." },
      ]} />
      <CtaBand />
    </>
  );
}
