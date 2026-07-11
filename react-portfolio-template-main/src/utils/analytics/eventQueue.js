import { supabase } from '/src/utils/supabase.js'

class EventQueue {
    constructor() {
        this.queue = []
        this.isProcessing = false
        this.batchSize = 10
        this.flushInterval = 5000 // 5 seconds
        
        if (typeof window !== 'undefined') {
            setInterval(() => this.flush(), this.flushInterval)
            window.addEventListener('beforeunload', () => this.flush())
        }
    }

    add(event) {
        this.queue.push(event)
        if (this.queue.length >= this.batchSize) {
            this.flush()
        }
    }

    async flush() {
        if (this.queue.length === 0 || this.isProcessing) return
        
        this.isProcessing = true
        const batch = [...this.queue]
        this.queue = []

        try {
            const { error } = await supabase.from('marketing_events').insert(batch)
            if (error) {
                console.error("Failed to sync analytics batch to Supabase", error)
                // Requeue failed events (could add retry limit logic here)
                this.queue = [...batch, ...this.queue]
            }
        } catch (err) {
            console.error("Error in event flush:", err)
            this.queue = [...batch, ...this.queue]
        } finally {
            this.isProcessing = false
        }
    }
}

export const eventQueue = new EventQueue()
