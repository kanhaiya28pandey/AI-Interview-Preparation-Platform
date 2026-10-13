import React, { Suspense, lazy, useState, useEffect } from "react";
import type { QuoteCategoryTheme } from "@/data/quoteThemes";

// Lazy-load lottie-react safely
const LazyLottie = lazy(async () => {
  try {
    const mod = await import("lottie-react");
    const Component = (mod.Lottie || (mod as any).default) as React.ComponentType<any>;
    return { default: Component };
  } catch {
    return { default: (() => null) as React.ComponentType<any> };
  }
});

class SceneErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  override componentDidCatch() {}
  override render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

interface QuoteSceneProps {
  theme: QuoteCategoryTheme;
  isDark: boolean;
  reducedMotion: boolean;
}

export const QuoteScene: React.FC<QuoteSceneProps> = ({
  theme,
  isDark,
  reducedMotion,
}) => {
  const [lottieData, setLottieData] = useState<any>(null);
  const [loadError, setLoadError] = useState(false);
  const variant = isDark ? theme.dark : theme.light;

  useEffect(() => {
    let active = true;
    setLoadError(false);
    setLottieData(null);

    if (reducedMotion || !theme.lottieUrl) {
      return;
    }

    fetch(theme.lottieUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Lottie failed to load");
        return res.json();
      })
      .then((data) => {
        if (active) setLottieData(data);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });

    return () => {
      active = false;
    };
  }, [theme.lottieUrl, reducedMotion]);

  // If Lottie loaded and not reduced motion, render it safely inside ErrorBoundary
  if (lottieData && !loadError && !reducedMotion) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2 opacity-85 select-none pointer-events-none">
        <SceneErrorBoundary fallback={<SvgMotif motif={theme.motif} accentColor={variant.accentColor} />}>
          <Suspense fallback={<SvgMotif motif={theme.motif} accentColor={variant.accentColor} />}>
            <LazyLottie
              src={lottieData}
              loop={true}
              autoplay={true}
              style={{ width: "100%", height: "100%", maxWidth: 220, maxHeight: 220 }}
            />
          </Suspense>
        </SceneErrorBoundary>
      </div>
    );
  }

  // Fallback: Rich SVG Motifs
  return <SvgMotif motif={theme.motif} accentColor={variant.accentColor} />;
};

/**
 * High-performance inline SVG Motifs for each of the 9 categories
 */
const SvgMotif: React.FC<{ motif: string; accentColor: string }> = ({
  motif,
  accentColor,
}) => {
  switch (motif) {
    case "code":
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full max-w-[200px] max-h-[200px] opacity-75 animate-pulse select-none"
          fill="none"
        >
          {/* Laptop frame */}
          <rect x="30" y="50" width="140" height="90" rx="8" stroke={accentColor} strokeWidth="3" />
          <path d="M15 140H185C188 140 190 142 190 145V148H10V145C10 142 12 140 15 140Z" fill={accentColor} fillOpacity="0.4" stroke={accentColor} strokeWidth="2" />
          {/* Code brackets and prompt */}
          <path d="M60 85L45 95L60 105" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M140 85L155 95L140 105" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M105 80L95 110" stroke={accentColor} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <line x1="72" y1="95" x2="128" y2="95" stroke={accentColor} strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
        </svg>
      );

    case "circles":
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full max-w-[200px] max-h-[200px] opacity-75 select-none"
          fill="none"
        >
          <circle cx="100" cy="100" r="75" stroke={accentColor} strokeWidth="2" strokeDasharray="6 6" className="animate-[spin_20s_linear_infinite]" />
          <circle cx="100" cy="100" r="55" stroke={accentColor} strokeWidth="2.5" opacity="0.8" />
          <circle cx="100" cy="100" r="35" stroke={accentColor} strokeWidth="3" fill={accentColor} fillOpacity="0.15" />
          <circle cx="100" cy="100" r="12" fill={accentColor} />
        </svg>
      );

    case "embers":
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full max-w-[200px] max-h-[200px] opacity-75 select-none"
          fill="none"
        >
          {/* Torch flame / rising embers */}
          <path
            d="M100 25C100 25 125 65 125 105C125 135 110 160 100 165C90 160 75 135 75 105C75 65 100 25 100 25Z"
            fill={accentColor}
            fillOpacity="0.25"
            stroke={accentColor}
            strokeWidth="3"
          />
          <path
            d="M100 65C100 65 112 85 112 110C112 125 105 140 100 145C95 140 88 125 88 110C88 85 100 65 100 65Z"
            fill={accentColor}
            fillOpacity="0.6"
          />
          <circle cx="65" cy="80" r="4" fill={accentColor} opacity="0.8" />
          <circle cx="135" cy="70" r="5" fill={accentColor} opacity="0.7" />
          <circle cx="115" cy="40" r="3" fill={accentColor} opacity="0.9" />
          <circle cx="85" cy="45" r="4" fill={accentColor} opacity="0.8" />
        </svg>
      );

    case "stars":
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full max-w-[200px] max-h-[200px] opacity-75 select-none"
          fill="none"
        >
          {/* Spotlight star cluster */}
          <polygon
            points="100,20 115,75 170,80 125,115 140,170 100,135 60,170 75,115 30,80 85,75"
            fill={accentColor}
            fillOpacity="0.2"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="45" cy="45" r="3.5" fill={accentColor} />
          <circle cx="155" cy="40" r="4" fill={accentColor} />
          <circle cx="165" cy="140" r="3" fill={accentColor} />
          <circle cx="40" cy="145" r="4" fill={accentColor} />
          <circle cx="100" cy="98" r="8" fill={accentColor} />
        </svg>
      );

    case "leaves":
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full max-w-[200px] max-h-[200px] opacity-75 select-none"
          fill="none"
        >
          {/* Botanical leaf / ascending growth stairs */}
          <path
            d="M50 160C50 160 60 90 110 50C160 90 150 160 150 160C150 160 110 170 50 160Z"
            fill={accentColor}
            fillOpacity="0.25"
            stroke={accentColor}
            strokeWidth="3"
          />
          <path d="M50 160C90 120 110 50 110 50" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M85 125C110 120 125 110 125 110" stroke={accentColor} strokeWidth="2.5" />
          <path d="M70 145C90 142 105 135 105 135" stroke={accentColor} strokeWidth="2.5" />
        </svg>
      );

    case "mountains":
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full max-w-[200px] max-h-[200px] opacity-75 select-none"
          fill="none"
        >
          {/* Sunrise behind mountains */}
          <circle cx="100" cy="80" r="35" fill={accentColor} fillOpacity="0.3" stroke={accentColor} strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="20,165 85,75 140,165" fill={accentColor} fillOpacity="0.3" stroke={accentColor} strokeWidth="3" strokeLinejoin="round" />
          <polygon points="90,165 145,95 185,165" fill={accentColor} fillOpacity="0.5" stroke={accentColor} strokeWidth="3" strokeLinejoin="round" />
          <line x1="10" y1="165" x2="190" y2="165" stroke={accentColor} strokeWidth="3" />
        </svg>
      );

    case "aurora":
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full max-w-[200px] max-h-[200px] opacity-75 select-none"
          fill="none"
        >
          {/* Trophy & aurora ribbons */}
          <path d="M60 45H140V90C140 115 120 135 100 135C80 135 60 115 60 90V45Z" fill={accentColor} fillOpacity="0.25" stroke={accentColor} strokeWidth="3" />
          <path d="M60 60H40C40 85 55 95 65 95" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M140 60H160C160 85 145 95 135 95" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M100 135V160" stroke={accentColor} strokeWidth="4" />
          <rect x="70" y="160" width="60" height="15" rx="4" fill={accentColor} fillOpacity="0.5" stroke={accentColor} strokeWidth="2" />
        </svg>
      );

    case "target":
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full max-w-[200px] max-h-[200px] opacity-75 select-none"
          fill="none"
        >
          <circle cx="100" cy="100" r="70" stroke={accentColor} strokeWidth="2.5" />
          <circle cx="100" cy="100" r="45" stroke={accentColor} strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="22" fill={accentColor} fillOpacity="0.3" stroke={accentColor} strokeWidth="3" />
          <circle cx="100" cy="100" r="6" fill={accentColor} />
          <line x1="100" y1="15" x2="100" y2="40" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="100" y1="160" x2="100" y2="185" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="15" y1="100" x2="40" y2="100" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="160" y1="100" x2="185" y2="100" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case "speech":
    default:
      return (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full max-w-[200px] max-h-[200px] opacity-75 select-none"
          fill="none"
        >
          {/* Speech dialogue & checkmark */}
          <path
            d="M35 50C35 41.7 41.7 35 50 35H150C158.3 35 165 41.7 165 50V115C165 123.3 158.3 130 150 130H85L50 155V130H50C41.7 130 35 123.3 35 115V50Z"
            fill={accentColor}
            fillOpacity="0.25"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M75 80L90 95L125 65" stroke={accentColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};
