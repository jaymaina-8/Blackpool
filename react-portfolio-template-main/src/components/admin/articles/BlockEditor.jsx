import React from 'react'
import { BlockNoteView } from "@blocknote/mantine"
import { useCreateBlockNote } from "@blocknote/react"
import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"

export default function BlockEditor({ initialContent, onChange, onUploadFile }) {
    
    // Validate if initialContent is actually an array of blocks
    const validatedContent = Array.isArray(initialContent) && initialContent.length > 0 
        ? initialContent 
        : undefined

    const editor = useCreateBlockNote({
        initialContent: validatedContent,
        uploadFile: onUploadFile
    })

    const handleChange = async () => {
        const json = editor.document
        const html = await editor.blocksToHTMLLossy(json)
        onChange({ json, html })
    }

    return (
        <div className="block-editor-container border rounded bg-white mt-4" style={{ minHeight: '400px' }}>
            <BlockNoteView 
                editor={editor} 
                onChange={handleChange} 
                theme="light" 
                className="p-3"
            />
        </div>
    )
}
