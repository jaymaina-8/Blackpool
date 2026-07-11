import { useMemo } from 'react'

export function useSeoEngine({ title, seoTitle, seoDesc, contentHtml, categoryId, coverImageId, contentWords }) {
    
    return useMemo(() => {
        const rules = []
        let score = 0
        let maxScore = 0

        const addRule = (name, description, isPassed, weight = 10) => {
            rules.push({ name, description, isPassed, weight })
            maxScore += weight
            if (isPassed) score += weight
        }

        // Rule 1: Title Length (50-60 optimal, but let's say 40-70 is passing)
        const t = seoTitle || title || ''
        const titlePass = t.length >= 30 && t.length <= 70
        addRule('Title Length', 'Title should be between 30 and 70 characters.', titlePass, 15)

        // Rule 2: Meta Description
        const d = seoDesc || ''
        const descPass = d.length >= 120 && d.length <= 160
        addRule('Meta Description', 'Meta description should be between 120 and 160 characters.', descPass, 15)

        // Rule 3: Category
        addRule('Category Assigned', 'Article must be assigned to a category.', !!categoryId, 10)

        // Rule 4: Cover Image
        addRule('Cover Image', 'Article must have a featured cover image.', !!coverImageId, 15)

        // Rule 5: Word Count
        const wordPass = contentWords >= 300
        addRule('Word Count', 'Article should have at least 300 words.', wordPass, 15)

        // Parse HTML for link checks
        let hasInternalLink = false
        let hasExternalLink = false
        
        if (contentHtml) {
            const parser = new DOMParser()
            const doc = parser.parseFromString(contentHtml, 'text/html')
            const links = doc.querySelectorAll('a')
            links.forEach(a => {
                const href = a.getAttribute('href') || ''
                if (href.startsWith('/') || href.includes('blackpoolindustry.com')) {
                    hasInternalLink = true
                } else if (href.startsWith('http')) {
                    hasExternalLink = true
                }
            })
        }

        // Rule 6: Internal Links
        addRule('Internal Links', 'Include at least one internal link to another article or service.', hasInternalLink, 10)

        // Rule 7: External Links
        addRule('External Links', 'Include at least one external link to a reputable source.', hasExternalLink, 10)

        // Rule 8: Keyword in Title
        // Since we don't have a focus_keyword field, we implicitly check if the first 2 words of the title appear in the content.
        let keywordPass = false
        if (t.length > 0 && contentHtml) {
            const firstWords = t.split(' ').slice(0, 2).join(' ').toLowerCase()
            if (firstWords.length > 3 && contentHtml.toLowerCase().includes(firstWords)) {
                keywordPass = true
            }
        }
        addRule('Keyword Context', 'The main topic of your title should appear in the content.', keywordPass, 10)

        const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
        
        let color = 'danger'
        if (finalScore >= 80) color = 'success'
        else if (finalScore >= 50) color = 'warning'

        return { score: finalScore, rules, color }

    }, [title, seoTitle, seoDesc, contentHtml, categoryId, coverImageId, contentWords])
}
