import { useState, useCallback } from 'react'
import { supabase } from '/src/utils/supabase.js'
import { useAuth } from '/src/providers/AuthProvider.jsx'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

export function useMedia() {
    const { user } = useAuth()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState(null)

    // Helper to get image dimensions
    const getImageDimensions = (file) => {
        return new Promise((resolve) => {
            if (file.type === 'image/svg+xml') {
                // SVGs might not have inherent width/height, fallback to null
                resolve({ width: null, height: null })
                return
            }
            
            const img = new Image()
            const objectUrl = URL.createObjectURL(file)
            img.onload = () => {
                URL.revokeObjectURL(objectUrl)
                resolve({ width: img.naturalWidth, height: img.naturalHeight })
            }
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl)
                resolve({ width: null, height: null }) // Fallback if parsing fails
            }
            img.src = objectUrl
        })
    }

    const validateFile = (file) => {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            throw new Error(`Invalid file type: ${file.type}. Allowed types: JPG, PNG, WEBP, GIF, SVG.`)
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max allowed size is 5MB.`)
        }
    }

    const uploadMedia = useCallback(async (file) => {
        if (!user) throw new Error("Authentication required to upload media.")
        
        setIsUploading(true)
        setError(null)
        setUploadProgress(10) // Start

        try {
            validateFile(file)

            // Extract metadata
            setUploadProgress(20)
            const dimensions = await getImageDimensions(file)
            
            // Create hierarchical storage path: YYYY/MM/unique_name.ext
            const date = new Date()
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const storagePath = `${year}/${month}/${fileName}`

            setUploadProgress(40)
            // 1. Upload to Supabase Storage
            const { error: storageError } = await supabase.storage
                .from('media')
                .upload(storagePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (storageError) throw storageError
            
            setUploadProgress(80)
            // 2. Insert metadata into public.media table
            const { data: mediaData, error: dbError } = await supabase
                .from('media')
                .insert({
                    filename: file.name,
                    storage_path: storagePath,
                    mime_type: file.type,
                    size_bytes: file.size,
                    width: dimensions.width,
                    height: dimensions.height,
                    alt_text: file.name.replace(`.${fileExt}`, ''), // Default alt text
                    uploaded_by: user.id
                })
                .select()
                .single()

            if (dbError) {
                // If DB insert fails, ideally we should clean up the storage object.
                await supabase.storage.from('media').remove([storagePath])
                throw dbError
            }

            setUploadProgress(100)
            return mediaData

        } catch (err) {
            console.error("Media upload error:", err)
            setError(err.message)
            throw err
        } finally {
            setIsUploading(false)
            // Reset progress after a short delay
            setTimeout(() => setUploadProgress(0), 1000)
        }
    }, [user])

    const fetchMedia = useCallback(async (options = {}) => {
        try {
            let query = supabase
                .from('media')
                .select('*')
                .is('deleted_at', null)

            // Basic filtering and sorting logic
            if (options.mimeType) {
                query = query.like('mime_type', `${options.mimeType}%`) // e.g. 'image/'
            }
            if (options.search) {
                query = query.ilike('filename', `%${options.search}%`)
            }
            
            const sortOrder = options.sortOrder || 'desc'
            const sortField = options.sortField || 'created_at'
            query = query.order(sortField, { ascending: sortOrder === 'asc' })

            const { data, error } = await query

            if (error) throw error
            return data
        } catch (err) {
            console.error("Fetch media error:", err)
            throw err
        }
    }, [])

    const updateMediaMetadata = useCallback(async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('media')
                .update({
                    alt_text: updates.alt_text,
                    caption: updates.caption,
                    description: updates.description
                })
                .eq('id', id)
                .select()
                .single()
            
            if (error) throw error
            return data
        } catch (err) {
            console.error("Update media metadata error:", err)
            throw err
        }
    }, [])

    const deleteMedia = useCallback(async (mediaItem) => {
        if (!user) throw new Error("Authentication required.")
        
        try {
            // First soft delete from public.media
            const { error: dbError } = await supabase
                .from('media')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', mediaItem.id)

            if (dbError) throw dbError

            // Then remove from storage
            const { error: storageError } = await supabase.storage
                .from('media')
                .remove([mediaItem.storage_path])

            if (storageError) {
                console.error("Failed to delete from storage:", storageError)
                // We might want to alert the user or log it, but the DB row is soft deleted.
            }

            return true
        } catch (err) {
            console.error("Delete media error:", err)
            throw err
        }
    }, [user])

    return {
        uploadMedia,
        fetchMedia,
        updateMediaMetadata,
        deleteMedia,
        isUploading,
        uploadProgress,
        error
    }
}
