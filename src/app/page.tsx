import { Hero } from "@/components/Hero";
import { IndustryMarquee } from "@/components/IndustryMarquee";
import { Audience } from "@/components/Audience";
import { Offer } from "@/components/Offer";
import { Commitments } from "@/components/Commitments";
import { Process } from "@/components/Process";
import { IndustryCarousel } from "@/components/IndustryCarousel";
import { Faq } from "@/components/Faq";
import { CtaBand } from "@/components/CtaBand";

export default function Home() {
    return (
        <>
            <Hero />
            <IndustryMarquee />
            <Audience />
            <Offer />
            <Commitments />
            <Process />
            <IndustryCarousel />
            <Faq
                items={[
                    { q: "Which industries do you recruit in?", a: "All of them. We cover healthcare, hospitality, construction, technology, finance, logistics, retail, education, engineering and office roles, and we're happy to talk about others." },
                    { q: "What checks does every candidate go through?", a: "Identity, right to work, qualifications, criminal history (only with the candidate's consent) and a role-fit assessment, all before we introduce them to you." },
                    { q: "Can you guarantee a job for candidates?", a: "No. Our job-seeker support covers resume building, LinkedIn optimisation and skills guidance, and we introduce you when a role fits. It isn't a placement guarantee." },
                    { q: "How quickly will you reply?", a: "We reply to every enquiry within one business day." },
                ]}
            />
            <CtaBand />
        </>
    );
}
