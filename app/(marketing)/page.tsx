import { Hero } from "@/components/landing/Hero";
import { ProcessStrip } from "@/components/landing/ProcessStrip";

export default function LandingPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 py-10">
      <Hero />
      <section id="how-it-works">
        <ProcessStrip />
      </section>
    </div>
  );
}