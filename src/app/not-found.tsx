import { ButtonLink } from "@/components/Button";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-28 text-center sm:px-8">
      <h1 className="text-5xl font-semibold">That page isn't here.</h1>
      <p className="mt-4 text-lg text-slate">The link may be old or mistyped. Head back to the home page and try again.</p>
      <ButtonLink href="/" className="mt-8">Back to home</ButtonLink>
    </section>
  );
}
