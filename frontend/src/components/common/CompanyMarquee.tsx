import React from "react";
import googleSvg from "@/assets/logos/google.svg";
import amazonSvg from "@/assets/logos/amazon.svg";
import microsoftSvg from "@/assets/logos/microsoft.svg";
import atlassianSvg from "@/assets/logos/atlassian.svg";
import flipkartSvg from "@/assets/logos/flipkart.svg";
import zomatoSvg from "@/assets/logos/zomato.svg";
import oracleSvg from "@/assets/logos/oracle.svg";

interface CompanyLogo {
  name: string;
  ariaLabel: string;
  src: string;
  glowColor: string;
}

const companies: CompanyLogo[] = [
  {
    name: "Google",
    ariaLabel: "Google logo",
    src: googleSvg,
    glowColor: "rgba(66, 133, 244, 0.45)",
  },
  {
    name: "Amazon",
    ariaLabel: "Amazon logo",
    src: amazonSvg,
    glowColor: "rgba(255, 153, 0, 0.45)",
  },
  {
    name: "Microsoft",
    ariaLabel: "Microsoft logo",
    src: microsoftSvg,
    glowColor: "rgba(0, 164, 239, 0.45)",
  },
  {
    name: "Atlassian",
    ariaLabel: "Atlassian logo",
    src: atlassianSvg,
    glowColor: "rgba(38, 132, 255, 0.45)",
  },
  {
    name: "Flipkart",
    ariaLabel: "Flipkart logo",
    src: flipkartSvg,
    glowColor: "rgba(40, 116, 240, 0.45)",
  },
  {
    name: "Zomato",
    ariaLabel: "Zomato logo",
    src: zomatoSvg,
    glowColor: "rgba(226, 55, 68, 0.45)",
  },
  {
    name: "Oracle",
    ariaLabel: "Oracle logo",
    src: oracleSvg,
    glowColor: "rgba(248, 0, 0, 0.45)",
  },
];

export const CompanyMarquee: React.FC = () => {
  // Duplicate array 3 times to ensure a completely seamless continuous infinite loop
  const marqueeItems = [...companies, ...companies, ...companies];

  return (
    <section className="border-y border-border/60 py-8 bg-surface/50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Practice for interviews at top tech companies
        </p>

        {/* Marquee Strip Outer Container with Fade Masks */}
        <div className="relative w-full overflow-hidden py-2">
          {/* Left Fade Mask */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-surface to-transparent z-10" />

          {/* Right Fade Mask */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-surface to-transparent z-10" />

          {/* Scrolling Marquee Container */}
          <div className="animate-marquee flex items-center gap-10 sm:gap-16">
            {marqueeItems.map((comp, idx) => (
              <div
                key={`${comp.name}-${idx}`}
                className="group relative flex items-center justify-center shrink-0 cursor-pointer py-1 px-3 transition-transform duration-200 ease-out hover:scale-[1.08]"
                style={{
                  transformOrigin: "center center",
                }}
              >
                <img
                  src={comp.src}
                  alt={comp.ariaLabel}
                  aria-label={comp.ariaLabel}
                  className="h-6 sm:h-8 w-auto max-w-none transition-all duration-200 filter drop-shadow-[0_0_2px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_12px_var(--glow-color)]"
                  style={{
                    ["--glow-color" as any]: comp.glowColor,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-[10px] text-text-muted/70 tracking-wide">
          Logos are trademarks of their respective owners.
        </p>
      </div>
    </section>
  );
};
