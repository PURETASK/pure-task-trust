import { motion } from "framer-motion";

// Client-facing steps → blue border. Alternating with purple for variety.
const steps = [
  {
    number: "01",
    title: "Book a Cleaner",
    description: "Browse verified cleaners, check their reviews and rates, then book the perfect match for your home.",
    borderColor: "hsl(var(--primary))",
    shadowColor: "hsl(var(--primary) / 0.18)",
    numColor: "text-primary",
    numBg: "bg-primary",
  },
  {
    number: "02",
    title: "Cleaner Works",
    description: "Your cleaner checks in with GPS, takes before photos, completes the job, and documents the results.",
    borderColor: "hsl(var(--success))",
    shadowColor: "hsl(var(--success) / 0.18)",
    numColor: "text-success",
    numBg: "bg-success",
  },
  {
    number: "03",
    title: "Approve & Pay",
    description: "Review the before & after photos, approve the work, and only then are your credits released.",
    borderColor: "hsl(var(--pt-purple))",
    shadowColor: "hsl(var(--pt-purple) / 0.18)",
    numColor: "text-[hsl(var(--pt-purple))]",
    numBg: "bg-[hsl(var(--pt-purple))]",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Simple, transparent, and fair for everyone.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -4 }}
                className="relative text-center"
              >
                <div
                  className="bg-card rounded-2xl p-8 relative z-10 transition-all duration-300"
                  style={{
                    border: `2px solid ${step.borderColor}`,
                    boxShadow: `0 4px 20px 0 ${step.shadowColor}, 0 1px 6px 0 ${step.shadowColor}`,
                  }}
                >
                  <div
                    className={`h-16 w-16 rounded-full ${step.numBg} text-primary-foreground flex items-center justify-center mx-auto mb-6 text-2xl font-bold`}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
