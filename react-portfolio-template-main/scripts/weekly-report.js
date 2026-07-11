import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import emailjs from '@emailjs/nodejs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Supabase URL and Service Role Key are required.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function generateWeeklyReport() {
    console.log('Generating Weekly Analytics Report...')

    try {
        // Fetch last 7 days of daily_metrics
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: metrics, error } = await supabase
            .from('daily_metrics')
            .select('*')
            .gte('date', sevenDaysAgo.toISOString().split('T')[0])

        if (error) throw error

        let totalViews = 0
        let totalVisitors = 0
        let totalLeads = 0
        let totalRevenue = 0

        metrics?.forEach(m => {
            totalViews += m.views
            totalVisitors += m.visitors
            totalLeads += m.leads
            totalRevenue += Number(m.revenue)
        })

        // Format Report
        const reportText = `
Blackpool Weekly Report

Visitors: ${totalVisitors.toLocaleString()}
Views: ${totalViews.toLocaleString()}
Leads: ${totalLeads}
Estimated Revenue: KES ${totalRevenue.toLocaleString()}

*To view full insights, including top performing articles and content decay warnings, please log in to your Publishing Dashboard.*
        `

        console.log('\n--- REPORT ---')
        console.log(reportText)
        console.log('--------------\n')

        // Send Email via EmailJS
        if (process.env.VITE_EMAILJS_SERVICE_ID && process.env.VITE_EMAILJS_TEMPLATE_ID && process.env.VITE_EMAILJS_PUBLIC_KEY && process.env.EMAILJS_PRIVATE_KEY) {
            console.log('Sending email report...')
            await emailjs.send(
                process.env.VITE_EMAILJS_SERVICE_ID,
                process.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    to_name: "Admin",
                    from_name: "Blackpool Intelligence",
                    message: reportText,
                    reply_to: "noreply@blackpool.com"
                },
                {
                    publicKey: process.env.VITE_EMAILJS_PUBLIC_KEY,
                    privateKey: process.env.EMAILJS_PRIVATE_KEY
                }
            )
            console.log('Email sent successfully.')
        } else {
            console.log('EmailJS credentials not found. Skipping email delivery.')
        }

    } catch (err) {
        console.error('Failed to generate weekly report:', err.message)
        process.exit(1)
    }
}

generateWeeklyReport()
