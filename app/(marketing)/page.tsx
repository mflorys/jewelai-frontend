import { Hero } from "@/components/landing/Hero";
import { ProcessStrip } from "@/components/landing/ProcessStrip";

export default function LandingPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 py-10">
      <Hero />
      <section id="how-it-works">
        <ProcessStrip />
      </section>
      <section
        id="features"
        className="grid gap-6 rounded-3xl border border-black/5 bg-white/70 p-8 shadow-luxe sm:grid-cols-3"
      >
        {[
          {
            title: "JWT-ready",
            text: "Authenticated fetches with a shared client so you can plug straight into Spring Security.",
          },
          {
            title: "Status aware",
            text: "Polling logic for generation and production stages keeps clients in sync without reloading.",
          },
          {
            title: "Designed for growth",
            text: "Componentized questionnaire, badges, and detail panels ready for admin and billing add-ons.",
          },
        ].map((item) => (
          <div key={item.title} className="space-y-2">
            <h3 className="serif-heading text-xl text-ink">{item.title}</h3>
            <p className="text-sm text-ash">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
