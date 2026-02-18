
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to validate URLs
const isValidUrl = (urlString: string) => {
    try { 
      return Boolean(new URL(urlString)); 
    } catch(e) { 
      return false; 
    }
};

// Helper to resolve relative URLs
const resolveUrl = (base: string, relative: string) => {
    try {
        return new URL(relative, base).href;
    } catch (e) {
        return null;
    }
};

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const reqBody = await req.json();
    const url = reqBody.url;

    console.log(`[Scraper] 🚀 Starting analysis for: ${url}`);

    if (!url) {
      throw new Error('URL is required');
    }

    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // 2. Initial Fetch (The HTML Page)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    let htmlResponse;
    try {
        htmlResponse = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Upgrade-Insecure-Requests': '1'
            },
            redirect: 'follow',
            signal: controller.signal
        });
    } catch (e) {
        console.error(`[Scraper] ❌ Network failed: ${e.message}`);
        // If network fails, throw to trigger fallback in frontend
        throw new Error(`Failed to reach site: ${e.message}`);
    } finally {
        clearTimeout(timeoutId);
    }

    const finalUrl = htmlResponse.url || targetUrl;
    console.log(`[Scraper] 📍 Final URL: ${finalUrl} (Status: ${htmlResponse.status})`);

    // If site errors, we return a valid object with "isValid: false" so frontend can fallback
    if (htmlResponse.status >= 400) {
        console.warn(`[Scraper] ⚠️ Site returned ${htmlResponse.status}`);
        return new Response(JSON.stringify({
            title: '', 
            icon: null,
            url: finalUrl,
            error: `Site returned ${htmlResponse.status}`,
            isValid: false 
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const html = await htmlResponse.text();
    const $ = cheerio.load(html);

    // --- PHASE 1: Basic Metadata Extraction ---
    
    // Title
    let title = 
        $('meta[property="og:site_name"]').attr('content') ||
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('meta[name="apple-mobile-web-app-title"]').attr('content') ||
        $('title').text() || 
        '';

    // Cleanup Title
    if (title) {
        const separators = ['|', '-', '–', '—', ':'];
        for (const sep of separators) {
            if (title.includes(` ${sep} `)) {
                title = title.split(` ${sep} `)[0];
                break;
            }
        }
        title = title.trim();
    }

    // Theme Color
    const themeColor = 
        $('meta[name="theme-color"]').attr('content') || 
        $('meta[name="msapplication-TileColor"]').attr('content') ||
        '#000000';

    // --- PHASE 2: Icon Hunting (The "Deep Scan") ---

    let finalIcon = null;

    // A. Check for PWA Manifest (Gold Standard)
    const manifestHref = $('link[rel="manifest"]').attr('href');
    if (manifestHref) {
        try {
            const manifestUrl = resolveUrl(finalUrl, manifestHref);
            console.log(`[Scraper] 🔍 Found manifest at: ${manifestUrl}`);
            
            const manifestReq = await fetch(manifestUrl);
            if (manifestReq.ok) {
                const manifest = await manifestReq.json();
                
                // 1. Try to get name from manifest if we don't have a good one
                if (manifest.name && (!title || title.length < 3)) title = manifest.name;
                if (manifest.short_name && (!title || title.length > 20)) title = manifest.short_name;

                // 2. Find best icon (largest PNG)
                if (manifest.icons && Array.isArray(manifest.icons)) {
                    const bestIcon = manifest.icons.sort((a, b) => {
                        const sizeA = parseInt(a.sizes?.split('x')[0] || '0');
                        const sizeB = parseInt(b.sizes?.split('x')[0] || '0');
                        return sizeB - sizeA; // Descending
                    })[0];

                    if (bestIcon && bestIcon.src) {
                        finalIcon = resolveUrl(manifestUrl, bestIcon.src);
                        console.log(`[Scraper] ✅ Extracted icon from Manifest: ${finalIcon}`);
                    }
                }
            }
        } catch (e) {
            console.warn(`[Scraper] ⚠️ Failed to parse manifest: ${e.message}`);
        }
    }

    // B. Check for JSON-LD (Structured Data) if no icon yet
    if (!finalIcon) {
        $('script[type="application/ld+json"]').each((i, el) => {
            if (finalIcon) return;
            try {
                const json = JSON.parse($(el).html() || '{}');
                // Look for Organization logo or WebSite image
                const logo = json.logo || json.image;
                if (logo) {
                    const logoUrl = typeof logo === 'string' ? logo : logo.url;
                    if (logoUrl) {
                        finalIcon = resolveUrl(finalUrl, logoUrl);
                        console.log(`[Scraper] ✅ Extracted icon from JSON-LD: ${finalIcon}`);
                    }
                }
            } catch (e) {}
        });
    }

    // C. Standard Meta Tags (Fallback)
    if (!finalIcon) {
        const rawIcon = 
            $('link[rel="apple-touch-icon"]').attr('href') || 
            $('link[rel="icon"][sizes="192x192"]').attr('href') ||
            $('meta[property="og:image"]').attr('content') ||
            $('link[rel="icon"]').attr('href') || 
            $('link[rel="shortcut icon"]').attr('href');
        
        if (rawIcon) {
            finalIcon = resolveUrl(finalUrl, rawIcon);
            console.log(`[Scraper] ✅ Extracted icon from HTML Tags: ${finalIcon}`);
        }
    }

    // D. Ultimate Fallback: Google Favicon Service
    // If we still found nothing, or the icon seems broken/relative-but-failed
    if (!finalIcon) {
        try {
            const hostname = new URL(finalUrl).hostname;
            finalIcon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`;
            console.log(`[Scraper] ⚠️ Using Google Fallback: ${finalIcon}`);
        } catch (e) {
            finalIcon = null;
        }
    }

    // --- PHASE 3: Legal Links (Hebrew & English Support) ---
    
    const findLink = (keywords: string[]) => {
        let bestLink = '';
        $('a').each((i, el) => {
            if (bestLink) return;
            const text = $(el).text().toLowerCase().trim();
            const href = $(el).attr('href');
            if (!href) return;
            
            // Check text content
            if (keywords.some(k => text.includes(k))) {
                bestLink = href;
                return;
            }
            // Check URL content (e.g. /privacy-policy)
            if (keywords.some(k => href.toLowerCase().includes(k.replace(' ', '-')))) {
                bestLink = href;
                return;
            }
        });
        return bestLink ? resolveUrl(finalUrl, bestLink) : '';
    };

    const privacyUrl = findLink(['privacy', 'פרטיות', 'policy', 'מדיניות']);
    const termsUrl = findLink(['terms', 't&c', 'conditions', 'תקנון', 'שימוש', 'תנאי']);

    // --- Final Response ---
    
    return new Response(
      JSON.stringify({
        title: title || 'My App',
        themeColor,
        icon: finalIcon,
        url: finalUrl,
        privacyPolicyUrl: privacyUrl,
        termsOfServiceUrl: termsUrl,
        isValid: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(`[Scraper] 💥 Fatal Error: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isValid: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 with error field so frontend handles it gracefully
      }
    )
  }
})
