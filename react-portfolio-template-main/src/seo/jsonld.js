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

