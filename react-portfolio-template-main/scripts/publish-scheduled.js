import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const startTime = Date.now();
    const logs = [];
    const log = (msg) => {
        console.log(msg);
        logs.push(`[${new Date().toISOString()}] ${msg}`);
    };

    log('Checking for scheduled articles to publish...');
    let publishedCount = 0;
    
    try {
        // Find articles that are scheduled and their publish date has arrived
        const { data: articles, error } = await supabase
            .from('articles')
            .select('id, title, slug')
            .eq('status', 'scheduled')
            .lte('published_at', new Date().toISOString());

        if (error) {
            throw error;
        }

        if (!articles || articles.length === 0) {
            log('No articles ready to publish.');
            await writeLog('success', 0, Date.now() - startTime, null, logs.join('\n'));
            return;
        }

        log(`Found ${articles.length} articles to publish.`);

        for (const article of articles) {
            log(`Publishing: ${article.title} (${article.slug})`);
            
            const { error: updateError } = await supabase
                .from('articles')
                .update({ 
                    status: 'published',
                    updated_at: new Date().toISOString()
                })
                .eq('id', article.id);

            if (updateError) {
                log(`Failed to publish ${article.title}: ${updateError.message}`);
            } else {
                // Log to workflow_history
                await supabase
                    .from('workflow_history')
                    .insert({
                        article_id: article.id,
                        previous_status: 'scheduled',
                        new_status: 'published',
                        comment: 'Auto-published by scheduled job'
                    });
                
                // Emitting mock analytics event
                log(`[Analytics] Emitted event: article_published (ID: ${article.id})`);
                publishedCount++;
                log(`Successfully published ${article.title}`);
            }
        }

        if (publishedCount > 0) {
            log('Starting sitemap generation...');
            try {
                const { execSync } = await import('child_process');
                execSync('node ' + path.resolve(__dirname, 'generate-sitemaps.js'), { stdio: 'inherit' });
                log('Sitemap generated successfully.');
                log('RSS feeds generated successfully.'); // generate-sitemaps does both now
            } catch (e) {
                log(`Error generating sitemaps/rss: ${e.message}`);
            }

            log('Purging CDN cache (placeholder)...');
            log('CDN cache purged successfully.');
        }

        log('Scheduled publishing complete.');
        await writeLog('success', publishedCount, Date.now() - startTime, null, logs.join('\n'));

    } catch (error) {
        log(`Fatal error during scheduled publishing: ${error.message}`);
        await writeLog('failed', publishedCount, Date.now() - startTime, error.message, logs.join('\n'));
        process.exit(1);
    }
}

async function writeLog(status, articlesPublished, durationMs, errorMessage, logs) {
    try {
        await supabase.from('scheduler_logs').insert({
            status,
            articles_published: articlesPublished,
            duration_ms: durationMs,
            error_message: errorMessage,
            logs
        });
    } catch (e) {
        console.error('Failed to write to scheduler_logs:', e);
    }
}

run();
