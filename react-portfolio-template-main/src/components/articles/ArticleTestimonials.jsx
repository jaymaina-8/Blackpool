import "./ArticleTestimonials.scss"
import React, {useEffect, useState} from 'react'
import Article from "/src/components/articles/base/Article.jsx"
import Swipeable from "/src/components/capabilities/Swipeable.jsx"
import {Balloon, BalloonQuote} from "/src/components/generic/Balloon"
import {useViewport} from "/src/providers/ViewportProvider.jsx"
import Link from "/src/components/generic/Link.jsx"
import AvatarView from "/src/components/generic/AvatarView.jsx"
import {useConstants} from "/src/hooks/constants.js"
import {useLanguage} from "/src/providers/LanguageProvider.jsx"

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {Number} id
 * @return {JSX.Element}
 * @constructor
 */
function ArticleTestimonials({ dataWrapper, id }) {
    const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(null)

    return (
        <Article id={dataWrapper.uniqueId}
                 type={Article.Types.SPACING_DEFAULT}
                 dataWrapper={dataWrapper}
                 className={`article-testimonials`}
                 selectedItemCategoryId={selectedItemCategoryId}
                 setSelectedItemCategoryId={setSelectedItemCategoryId}>
            <ArticleTestimonialsItems dataWrapper={dataWrapper}
                                      selectedItemCategoryId={selectedItemCategoryId}/>
        </Article>
    )
}

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {String} selectedItemCategoryId
 * @return {JSX.Element}
 * @constructor
 */
function ArticleTestimonialsItems({ dataWrapper, selectedItemCategoryId }) {
    const constants = useConstants()

    const filteredItems = dataWrapper.getOrderedItemsFilteredBy(selectedItemCategoryId)

    return (
        <Swipeable className={`article-testimonials-items`}
                   breakpoints={constants.SWIPER_BREAKPOINTS_FOR_THREE_SLIDES}>
            {filteredItems.map((itemWrapper, key) => (
                <ArticleTestimonialsItem itemWrapper={itemWrapper}
                                         key={key}/>
            ))}
        </Swipeable>
    )
}

/**
 * @param {ArticleItemDataWrapper} itemWrapper
 * @return {JSX.Element}
 * @constructor
 */
function ArticleTestimonialsItem({ itemWrapper }) {
    const viewport = useViewport()
    const language = useLanguage()

    const textClass = viewport.isMobileLayout() ?
        `text-3` :
        `text-2`

    const caseStudyHref = itemWrapper.link?.href

    return (
        <div className={`article-testimonials-item`}>
            <Balloon className={`article-testimonials-item-balloon`}>
                <BalloonQuote className={`${textClass}`}
                              text={itemWrapper.locales.text || itemWrapper.placeholder}/>
            </Balloon>

            <div className={`article-testimonials-item-info`}>
                <AvatarView src={itemWrapper.img}
                            faIcon={itemWrapper.faIcon}
                            style={itemWrapper.faIconStyle}
                            alt={itemWrapper.imageAlt}
                            className={`article-testimonials-item-avatar`}/>

                <Link href={caseStudyHref}
                      tooltip={itemWrapper.link?.tooltip}
                      className={`article-testimonials-item-name text-5`}>
                    <span dangerouslySetInnerHTML={{__html: itemWrapper.locales.label || itemWrapper.label || "---"}}/>
                </Link>

                <div className={`article-testimonials-item-role text-2`}
                     dangerouslySetInnerHTML={{__html: itemWrapper.locales.title || "---"}}/>

                {caseStudyHref && (
                    <Link href={caseStudyHref}
                          tooltip={itemWrapper.link?.tooltip}
                          className={`article-testimonials-item-case-study text-2 mt-1`}>
                        {language.getString("read_case_study")}
                    </Link>
                )}
            </div>
        </div>
    )
}

export default ArticleTestimonials
