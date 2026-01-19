import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqData = [
  {
    category: 'Booking & Scheduling',
    questions: [
      {
        q: 'How do I book a cleaning?',
        a: 'Click "Book a Cleaning" from your dashboard, select your cleaning type, choose the date and time, and confirm your booking. Your credits will be held until the job is complete.',
      },
      {
        q: 'Can I cancel or reschedule a booking?',
        a: 'Yes! You can cancel or reschedule up to 24 hours before your appointment for free. Cancellations within 24 hours may incur a fee. Go to your booking details to make changes.',
      },
      {
        q: 'How far in advance can I book?',
        a: 'You can book up to 3 months in advance. We recommend booking at least 2-3 days ahead to ensure your preferred cleaner is available.',
      },
      {
        q: 'What if my cleaner doesn\'t show up?',
        a: 'If your cleaner fails to arrive, you\'ll receive a full refund plus bonus credits ($50). We take no-shows very seriously and may suspend cleaners who repeatedly miss appointments.',
      },
    ],
  },
  {
    category: 'Credits & Payments',
    questions: [
      {
        q: 'What are credits?',
        a: 'Credits are our in-app currency. 1 credit = $1 USD. You purchase credits in advance and use them to book cleanings. All prices shown in dollars are equivalent to credits.',
      },
      {
        q: 'Why use credits instead of paying per booking?',
        a: 'Credits give you flexibility - unused credits never expire, and you only pay for the exact time worked. If a job takes less time than estimated, you keep the difference.',
      },
      {
        q: 'How do credit holds work?',
        a: 'When you book, we place a hold on your credits (not a charge). After the job, you approve the final amount based on actual time worked, and only then are credits deducted.',
      },
      {
        q: 'Can I get a refund on purchased credits?',
        a: 'Unused credits can be refunded within 30 days of purchase. Credits used for completed bookings cannot be refunded unless there was a service issue.',
      },
    ],
  },
  {
    category: 'Cleaners & Quality',
    questions: [
      {
        q: 'How are cleaners vetted?',
        a: 'All cleaners undergo background checks, identity verification, and must maintain a high reliability score. We also collect reviews from every completed job.',
      },
      {
        q: 'Can I request a specific cleaner?',
        a: 'Absolutely! Save cleaners to your Favorites and book directly with them. You can also view cleaner profiles before booking to find the right fit.',
      },
      {
        q: 'What if I\'m not satisfied with the cleaning?',
        a: 'Report any issues within 24 hours of job completion through the app. We\'ll investigate and may offer a partial or full credit refund depending on the situation.',
      },
      {
        q: 'What supplies do cleaners bring?',
        a: 'Many cleaners bring their own supplies (marked on their profile). If you prefer specific products, you can leave them out for the cleaner to use.',
      },
    ],
  },
  {
    category: 'Account & Safety',
    questions: [
      {
        q: 'Is my home safe with PureTask cleaners?',
        a: 'Yes. All cleaners are background-checked, and our rating system helps ensure quality. You can also review cleaner profiles and read reviews before booking.',
      },
      {
        q: 'What if something is damaged during cleaning?',
        a: 'Report damages immediately through the Help section. We have a claims process to handle such situations and will work to resolve issues fairly.',
      },
      {
        q: 'How do I update my address or payment info?',
        a: 'Go to your Profile settings to update addresses and payment methods. You can save multiple addresses for different locations.',
      },
    ],
  },
];

export function FAQSection() {
  return (
    <div className="space-y-8">
      {faqData.map((category) => (
        <div key={category.category}>
          <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
          <Accordion type="single" collapsible className="w-full">
            {category.questions.map((faq, index) => (
              <AccordionItem key={index} value={`${category.category}-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
