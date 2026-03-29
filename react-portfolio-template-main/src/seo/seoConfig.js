export const CANONICAL_ORIGIN = "https://www.blackpoolindustry.com";

export const DEFAULT_OG_IMAGE_URL = `${CANONICAL_ORIGIN}/images/content/m.png`;

export const DEFAULT_META = {
  title: "Website Design in Nairobi | Blackpool Industry",
  description:
    "Blackpool Industry builds fast, mobile-friendly websites for businesses in Nairobi, Kenya. Get a professional website that helps customers find you, trust you, and contact you.",
  canonicalPath: "/",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
};

/**
 * SPA sections are hash-routed. Canonical should stay clean (no fragment),
 * but OG sharing URLs can include the fragment.
 */
export const SECTION_META = {
  Home: {
    title: DEFAULT_META.title,
    description: DEFAULT_META.description,
    canonicalPath: "/",
    ogPath: "/",
  },
  About: {
    title: "About | Blackpool Industry (Nairobi, Kenya)",
    description:
      "Blackpool Industry is a Nairobi-based web design and development company helping businesses build a strong, reliable online presence.",
    canonicalPath: "/",
    ogPath: "/#About",
  },
  services: {
    title: "Web Design & Development Services in Nairobi | Blackpool Industry",
    description:
      "Web design and development services for Nairobi businesses: fast, mobile-first websites, e-commerce solutions, optimization, and ongoing support.",
    canonicalPath: "/",
    ogPath: "/#services",
  },
  portfolio: {
    title: "Portfolio | Blackpool Industry (Nairobi Web Design)",
    description:
      "Recent web design and development work by Blackpool Industry. Modern, mobile-friendly websites built for real business outcomes.",
    canonicalPath: "/",
    ogPath: "/#portfolio",
  },
  pricing: {
    title: "Pricing | Blackpool Industry (Nairobi Website Design)",
    description:
      "Transparent website pricing for businesses in Nairobi, Kenya. Get a clear quote based on your goals and required features.",
    canonicalPath: "/",
    ogPath: "/#pricing",
  },
  contact: {
    title: "Contact | Blackpool Industry (Nairobi, Kenya)",
    description:
      "Contact Blackpool Industry for website design and web development in Nairobi, Kenya. Email, phone, and WhatsApp available.",
    canonicalPath: "/",
    ogPath: "/#contact",
  },
};

