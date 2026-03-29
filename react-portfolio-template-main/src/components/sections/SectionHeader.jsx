import "./SectionHeader.scss"
import React, {useEffect, useState} from 'react'
import {useViewport} from "/src/providers/ViewportProvider.jsx"
import {useParser} from "/src/hooks/parser.js"

function SectionHeader({ section }) {
    const viewport = useViewport()
    const parser = useParser()

    const isMobileLayout = viewport.isMobileLayout()
    const parsedTitle = parser.parseSectionTitle(section)
    const isHomeSection = section?.id === "Home"

    const titleClass = !isMobileLayout ?
        `lead-4` :
        ``

    const TitleTag = isHomeSection ? 'h1' : 'h2'

    return (
        <header className={`section-header`}>
            {parsedTitle.prefix && (
                <div className={`section-header-prefix lead-2 mb-2`}>
                    <i className={`fa-solid fa-cubes`}/>
                    <span dangerouslySetInnerHTML={{__html: parsedTitle.prefix}}/>
                </div>
            )}

            <TitleTag className={`section-header-title ${titleClass} h3`}
                      dangerouslySetInnerHTML={{__html: parsedTitle.title}}/>
        </header>
    )
}

export default SectionHeader