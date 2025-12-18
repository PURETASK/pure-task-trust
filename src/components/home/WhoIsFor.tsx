import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Briefcase, Heart, Home, Users, ArrowRight } from "lucide-react";

const audiences = [
  {
    icon: Briefcase,
    title: "For Professionals",
    description: "Busy professionals who need reliable, scheduled cleaning",
    iconBg: "bg-pt-cyan",
    borderColor: "border-pt-cyan/20",
    titleColor: "text-foreground",
    linkColor: "text-foreground",
  },
  {
    icon: Heart,
    title: "For Retirees",
    description: "Senior-friendly service with trusted, caring cleaners",
    iconBg: "bg-pt-purple",
    borderColor: "border-pt-purple/20",
    titleColor: "text-pt-purple",
    linkColor: "text-pt-purple",
  },
  {
    icon: Home,
    title: "For Airbnb Hosts",
    description: "Fast turnaround cleaning between guest stays",
    iconBg: "bg-pt-amber",
    borderColor: "border-pt-amber/20",
    titleColor: "text-pt-amber",
    linkColor: "text-pt-amber",
  },
  {
    icon: Users,
    title: "For Families",
    description: "Child-safe products and family-friendly service",
    iconBg: "bg-pt-green/20",
    borderColor: "border-pt-green/20",
    titleColor: "text-foreground",
    linkColor: "text-foreground",
  },
];

export function WhoIsFor() {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Who PureTask Is For</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Perfect cleaning solutions for every lifestyle
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-card rounded-2xl p-6 border-2 ${audience.borderColor} hover-lift cursor-default`}
            >
              <div className={`${audience.iconBg} h-14 w-14 rounded-full flex items-center justify-center mb-5`}>
                <audience.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className={`${audience.titleColor} font-bold text-lg mb-2`}>
                {audience.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {audience.description}
              </p>
              <Link
                to="/discover"
                className={`${audience.linkColor} text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all`}
              >
                Learn More <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
