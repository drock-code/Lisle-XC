import FAQItem from "@/components/FAQItem";
import { getFAQs } from "@/lib/queries";

export const metadata = {
  title: 'Frequently Asked Questions',
};

export default async function FAQPage() {
  const faqs = await getFAQs();

  return (
    <div className="p-4 md:p-8">
      <main className="max-w-3xl mx-auto py-8">
        
        {/* Header Section */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="font-heading text-4xl font-extrabold text-lisle-blue tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.6)] mb-2">
            Frequently Asked Questions
          </h1>
          <p className="font-body text-light-blue drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Find answers to common questions about the running cross country for Lisle.
          </p>
        </div>

        {/* Accordion Component */}
        {faqs && faqs.length > 0 ? (
          <FAQItem faqs={faqs} />
        ) : (
          <div className="p-8 text-center bg-background rounded-2xl shadow-sm border border-border text-foreground">
            No FAQs available right now. Please check back later!
          </div>
        )}

      </main>
    </div>
  );
}