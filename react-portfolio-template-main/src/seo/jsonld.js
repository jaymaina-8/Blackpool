const stripHtml = (html) => {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const buildFaqPageJsonLd = ({ canonicalUrl, faqs }) => {
  const items = Array.isArray(faqs) ? faqs : [];
  const mainEntity = items
    .map(({ question, answer }) => ({
      question: stripHtml(question),
      answer: stripHtml(answer),
    }))
    .filter((x) => x.question && x.answer)
    .map((x) => ({
      "@type": "Question",
      name: x.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: x.answer,
      },
    }));

  if (!mainEntity.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq`,
    mainEntity,
  };
};

export const buildOrganizationJsonLd = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Blackpool Industry",
    "url": "https://blackpoolindustry.com",
    "logo": "https://blackpoolindustry.com/images/logos/logo.svg",
    "sameAs": [
      "https://twitter.com/blackpoolindustry",
      "https://linkedin.com/company/blackpoolindustry"
    ]
  };
};

export const buildWebSiteJsonLd = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Blackpool Industry",
    "url": "https://blackpoolindustry.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://blackpoolindustry.com/blog?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
};

