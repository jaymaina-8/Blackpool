import { useEffect, useMemo } from "react";
import { useNavigation } from "/src/providers/NavigationProvider.jsx";
import { useLanguage } from "/src/providers/LanguageProvider.jsx";
import {
  CANONICAL_ORIGIN,
  DEFAULT_META,
  DEFAULT_OG_IMAGE_URL,
  SECTION_META,
} from "/src/seo/seoConfig.js";
import { buildFaqPageJsonLd } from "/src/seo/jsonld.js";
import {
  removeJsonLd,
  setDocumentTitle,
  upsertJsonLd,
  upsertLink,
  upsertMeta,
} from "/src/seo/domHead.js";

const getAbsoluteUrl = (pathOrUrl) => {
  if (!pathOrUrl) return CANONICAL_ORIGIN;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://"))
    return pathOrUrl;
  return `${CANONICAL_ORIGIN}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
};

const getSectionFaqs = (language, section) => {
  const articles = section?.data?.articles;
  if (!Array.isArray(articles)) return [];

  const thread = articles.find((a) => a?.component === "ArticleThread");
  const items = thread?.items;
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      question: language.getTranslation(item?.locales, "title", ""),
      answer: language.getTranslation(item?.locales, "text", ""),
    }))
    .filter((x) => x.question && x.answer);
};

export default function SeoManager() {
  const navigation = useNavigation();
  const language = useLanguage();

  const section = navigation?.targetSection || null;
  const sectionId = section?.id || null;

  const meta = useMemo(() => {
    if (sectionId && SECTION_META[sectionId]) return SECTION_META[sectionId];
    return DEFAULT_META;
  }, [sectionId]);

  useEffect(() => {
    const title = meta?.title || DEFAULT_META.title;
    const description = meta?.description || DEFAULT_META.description;
    const canonicalUrl = getAbsoluteUrl(meta?.canonicalPath || "/");
    const ogUrl = getAbsoluteUrl(meta?.ogPath || meta?.canonicalPath || "/");

    setDocumentTitle(title);

    upsertLink({ rel: "canonical", href: canonicalUrl });

    upsertMeta({ name: "description", content: description });
    upsertMeta({ name: "robots", content: DEFAULT_META.robots });

    upsertMeta({ property: "og:type", content: "website" });
    upsertMeta({ property: "og:site_name", content: "Blackpool Industry" });
    upsertMeta({ property: "og:url", content: ogUrl });
    upsertMeta({ property: "og:title", content: title });
    upsertMeta({ property: "og:description", content: description });
    upsertMeta({ property: "og:image", content: DEFAULT_OG_IMAGE_URL });

    upsertMeta({ name: "twitter:card", content: "summary_large_image" });
    upsertMeta({ name: "twitter:url", content: ogUrl });
    upsertMeta({ name: "twitter:title", content: title });
    upsertMeta({ name: "twitter:description", content: description });
    upsertMeta({ name: "twitter:image", content: DEFAULT_OG_IMAGE_URL });

    // FAQPage JSON-LD should only exist when FAQ content is present (Services section).
    if (sectionId === "services") {
      const faqs = getSectionFaqs(language, section);
      const faqJsonLd = buildFaqPageJsonLd({ canonicalUrl, faqs });
      if (faqJsonLd) {
        upsertJsonLd({ id: "seo-jsonld-faq", json: faqJsonLd });
      } else {
        removeJsonLd("seo-jsonld-faq");
      }
    } else {
      removeJsonLd("seo-jsonld-faq");
    }
  }, [language, meta, section, sectionId]);

  return null;
}

