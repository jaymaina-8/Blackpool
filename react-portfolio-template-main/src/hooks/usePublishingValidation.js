import { useState, useCallback } from 'react'

export function usePublishingValidation() {
    const [validationScore, setValidationScore] = useState(0)
    const [validationIssues, setValidationIssues] = useState([])

    const validateArticle = useCallback((article) => {
        let score = 0
        let issues = []
        let totalChecks = 10

        if (!article) return { score: 0, issues: ['Article data is missing'] }

        // 1. Title
        if (article.title && article.title.length >= 10) score += 1
        else issues.push({ field: 'Title', message: 'Title should be at least 10 characters long.', type: 'error' })

        // 2. Slug
        if (article.slug && article.slug.length >= 5) score += 1
        else issues.push({ field: 'Slug', message: 'Valid slug is required.', type: 'error' })

        // 3. Featured Image
        if (article.cover_image_id || article.cover) score += 1
        else issues.push({ field: 'Featured Image', message: 'A cover image is required for publishing.', type: 'error' })

        // 4. Category
        if (article.category_id || article.category) score += 1
        else issues.push({ field: 'Category', message: 'Article must be assigned to a category.', type: 'error' })

        // 5. Author
        if (article.author_id || article.author) score += 1
        else issues.push({ field: 'Author', message: 'Primary author must be assigned.', type: 'error' })

        // 6. Meta Description
        if (article.seo_description && article.seo_description.length >= 50) score += 1
        else issues.push({ field: 'SEO Description', message: 'SEO description should be at least 50 characters long.', type: 'warning' })

        // 7. Word Count
        if (article.word_count && article.word_count >= 300) score += 1
        else issues.push({ field: 'Content', message: 'Article is too short. Minimum recommended word count is 300.', type: 'warning' })

        // 8. Tags
        if (article.tags && article.tags.length > 0) score += 1
        else issues.push({ field: 'Tags', message: 'Adding tags improves discoverability.', type: 'warning' })

        // 9. SEO Title
        if (article.seo_title && article.seo_title.length >= 10) score += 1
        else issues.push({ field: 'SEO Title', message: 'Explicit SEO title is recommended.', type: 'warning' })

        // 10. Reviewer (Optional but good for E-E-A-T)
        if (article.reviewed_by || article.reviewer || (article.article_authors && article.article_authors.some(a => a.role === 'reviewer'))) score += 1
        else issues.push({ field: 'Reviewer', message: 'No technical/clinical reviewer assigned.', type: 'warning' })

        const finalScore = Math.round((score / totalChecks) * 100)
        setValidationScore(finalScore)
        setValidationIssues(issues)

        return { score: finalScore, issues }
    }, [])

    return {
        validateArticle,
        validationScore,
        validationIssues
    }
}
