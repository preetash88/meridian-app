// import { ButtonLink } from "./Button";
// import { MeridianArcs } from "./MeridianArcs";
// import { SITE } from "@/lib/site";
//
// export function CtaBand({
//   heading = "Tell us who you're looking for, or what you're looking for.",
//   body = `Send a short enquiry and we'll reply within ${SITE.responseTime}.`,
// }: { heading?: string; body?: string }) {
//   return (
//     <section className="px-5 pb-20 sm:px-8 lg:pb-28">
//       <div className="relative isolate mx-auto max-w-(--container-page) overflow-hidden rounded-[2rem] bg-ink px-8 py-16 text-chalk sm:px-14 lg:py-20">
//         <MeridianArcs tone="light" className="absolute -right-24 -top-24 -z-10 h-[34rem] w-[34rem] opacity-80" />
//         <h2 className="max-w-2xl text-4xl font-semibold sm:text-5xl">{heading}</h2>
//         <p className="mt-5 max-w-lg text-lg text-chalk/70">{body}</p>
//         <div className="mt-9 flex flex-wrap gap-3">
//           <ButtonLink href="/get-started?type=employer" variant="light">I'm hiring</ButtonLink>
//           <ButtonLink href="/get-started?type=candidate" variant="ghost-light">I'm looking for work</ButtonLink>
//         </div>
//       </div>
//     </section>
//   );
// }

import { ButtonLink } from "./Button";
import { MeridianArcs } from "./MeridianArcs";
import { Reveal } from "./Reveal";
import { SITE } from "@/lib/site";

export function CtaBand({
                          heading = "Tell us who you're looking for, or what you're looking for.",
                          body = `Send a short enquiry and we'll reply within ${SITE.responseTime}.`,
                        }: { heading?: string; body?: string }) {
  return (
      <section className="defer px-5 pb-20 sm:px-8 lg:pb-28">
        <Reveal>
          <div className="beam relative isolate mx-auto max-w-(--container-page) overflow-hidden rounded-[2rem] bg-ink px-8 py-16 text-chalk sm:px-14 lg:py-20">
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10"
                style={{
                  background:
                      "radial-gradient(34rem 22rem at 100% 0%, rgba(76,192,168,0.28), transparent 65%), radial-gradient(30rem 20rem at 0% 100%, rgba(150,140,230,0.25), transparent 65%)",
                }}
            />
            <MeridianArcs tone="light" className="absolute -right-24 -top-24 -z-10 h-[34rem] w-[34rem] opacity-80" />
            <h2 className="max-w-2xl text-4xl font-semibold sm:text-5xl">{heading}</h2>
            <p className="mt-5 max-w-lg text-lg text-chalk/70">{body}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/get-started?type=employer" variant="light">I'm hiring</ButtonLink>
              <ButtonLink href="/get-started?type=candidate" variant="ghost-light">I'm looking for work</ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
  );
}