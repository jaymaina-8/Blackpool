import "./ArticlePricing.scss"
import React from 'react'
import Article from "/src/components/articles/base/Article.jsx"

/**
 * Pricing plans article component.
 * Data mapping (using supported ArticleItemDataWrapper fields):
 *   locales.title        → plan name
 *   locales.institution  → price string (e.g. "KSh 14,999")
 *   locales.province     → period string (e.g. "one-time", "/month")
 *   locales.text         → short description
 *   locales.list         → array of feature strings
 *   label                → badge text (e.g. "Most Popular"), null if none
 *   percentage           → highlight flag: 1 = highlighted card, 0 = default
 *
 * @param {ArticleDataWrapper} dataWrapper
 * @return {JSX.Element}
 */
function ArticlePricing({ dataWrapper }) {
    const items = dataWrapper.orderedItems

    return (
        <Article id={dataWrapper.uniqueId}
            type={Article.Types.SPACING_DEFAULT}
            dataWrapper={dataWrapper}
            className={`article-pricing`}>
            <div className="article-pricing-grid">
                {items.map((itemWrapper, key) => (
                    <ArticlePricingCard itemWrapper={itemWrapper} key={key} />
                ))}
            </div>
        </Article>
    )
}

/**
 * @param {ArticleItemDataWrapper} itemWrapper
 * @return {JSX.Element}
 */
function ArticlePricingCard({ itemWrapper }) {
    const locales = itemWrapper.locales || {}
    const price = locales.institution || ""
    const period = locales.province || ""
    const desc = locales.text || ""
    const badge = itemWrapper.label || null        // root-level label field
    const highlight = (itemWrapper.percentage || 0) >= 1  // percentage=1 → highlight

    // locales.list comes back as an HTML string via array.toHtmlList —
    // but in the JSON we store it as a plain array, so if it parsed as
    // an array we can use it directly; otherwise we skip the feature list.
    const rawList = locales.list
    let features = []
    if (Array.isArray(rawList)) {
        features = rawList
    }

    return (
        <div className={`article-pricing-card${highlight ? " article-pricing-card--highlight" : ""}`}>
            {badge && (
                <div className="article-pricing-card-badge">{badge}</div>
            )}

            {itemWrapper.faIcon && (
                <div className="article-pricing-card-icon-wrapper">
                    <i className={`article-pricing-card-icon ${itemWrapper.faIcon}`}
                        style={itemWrapper.faIconStyle} />
                </div>
            )}

            <h5 className="article-pricing-card-title"
                dangerouslySetInnerHTML={{ __html: locales.title || itemWrapper.placeholder }} />

            <div className="article-pricing-card-price">
                <span className="article-pricing-card-price-amount">{price}</span>
                {period && (
                    <span className="article-pricing-card-price-period">{period}</span>
                )}
            </div>

            {desc && (
                <p className="article-pricing-card-description">{desc}</p>
            )}

            {features.length > 0 && (
                <ul className="article-pricing-card-features">
                    {features.map((feature, i) => (
                        <li key={i} className="article-pricing-card-feature">
                            <i className="fa-solid fa-check article-pricing-card-feature-check" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            )}

            <a href="#contact" className="article-pricing-card-cta">
                Get Started
            </a>
        </div>
    )
}

export default ArticlePricing
