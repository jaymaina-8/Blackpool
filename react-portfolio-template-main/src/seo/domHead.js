const ensureHeadElement = (selector, create) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
};

export const setDocumentTitle = (title) => {
  if (typeof title === "string" && title.length) document.title = title;
};

export const upsertMeta = ({ name, property, content }) => {
  if (!content) return;

  const selector = name
    ? `meta[name="${CSS.escape(name)}"]`
    : `meta[property="${CSS.escape(property)}"]`;

  const meta = ensureHeadElement(selector, () => {
    const el = document.createElement("meta");
    if (name) el.setAttribute("name", name);
    if (property) el.setAttribute("property", property);
    return el;
  });

  meta.setAttribute("content", content);
};

export const upsertLink = ({ rel, href }) => {
  if (!rel || !href) return;
  const selector = `link[rel="${CSS.escape(rel)}"]`;
  const link = ensureHeadElement(selector, () => {
    const el = document.createElement("link");
    el.setAttribute("rel", rel);
    return el;
  });
  link.setAttribute("href", href);
};

export const upsertJsonLd = ({ id, json }) => {
  if (!id) return;
  const selector = `script#${CSS.escape(id)}[type="application/ld+json"]`;
  const script = ensureHeadElement(selector, () => {
    const el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("id", id);
    return el;
  });

  script.text = json ? JSON.stringify(json) : "";
};

export const removeJsonLd = (id) => {
  if (!id) return;
  const el = document.head.querySelector(
    `script#${CSS.escape(id)}[type="application/ld+json"]`
  );
  if (el) el.remove();
};

