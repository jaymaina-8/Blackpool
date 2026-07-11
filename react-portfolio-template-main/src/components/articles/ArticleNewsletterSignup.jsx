import React, { useState } from 'react'
import Article from "/src/components/articles/base/Article.jsx"
import NewsletterSignup from "/src/components/blog/NewsletterSignup.jsx"

export default function ArticleNewsletterSignup({ dataWrapper, id }) {
    const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(null)

    return (
        <Article 
            id={dataWrapper.uniqueId}
            type={Article.Types.SPACING_DEFAULT}
            dataWrapper={dataWrapper}
            className={`article-newsletter-signup`}
            selectedItemCategoryId={selectedItemCategoryId}
            setSelectedItemCategoryId={setSelectedItemCategoryId}
        >
            <div className="py-2">
                <NewsletterSignup source="homepage" />
            </div>
        </Article>
    )
}
