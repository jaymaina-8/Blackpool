import React, { useMemo } from 'react'
import * as Diff from 'diff'

export default function RevisionDiff({ oldText, newText }) {
    const diffs = useMemo(() => {
        if (!oldText && !newText) return []
        return Diff.diffWords(oldText || '', newText || '')
    }, [oldText, newText])

    return (
        <div className="revision-diff border rounded bg-light p-3" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px', maxHeight: '400px', overflowY: 'auto' }}>
            {diffs.map((part, index) => {
                const color = part.added ? '#d4edda' : part.removed ? '#f8d7da' : 'transparent'
                const textColor = part.added ? '#155724' : part.removed ? '#721c24' : 'inherit'
                const textDecoration = part.removed ? 'line-through' : 'none'
                
                return (
                    <span 
                        key={index} 
                        style={{ 
                            backgroundColor: color, 
                            color: textColor,
                            textDecoration: textDecoration,
                            padding: part.added || part.removed ? '2px 0' : '0',
                            borderRadius: '2px'
                        }}
                    >
                        {part.value}
                    </span>
                )
            })}
        </div>
    )
}
