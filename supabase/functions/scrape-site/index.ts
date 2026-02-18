
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PARKED_KEYWORDS = [
  'domain for sale', 'buy this domain', 'parked domain', 'domain is available',
  'godaddy', 'namecheap', 'under construction', 'coming soon',
  'site not found', 'website expired', 'this site can’t be reached'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log(`[Scraper] Starting analysis for: ${url}`);

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // Prepare Fallbacks immediately in case fetch fails
    let hostname = 'app';
    try {
        hostname = new URL(targetUrl).hostname;
    } catch {}
    
    const fallbackTitle = hostname.replace(/^www\./, '').split('.')[0].replace(/^\w/, c => c.toUpperCase());
    const fallbackIcon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=192`;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    let response;
    try {
        response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Upgrade-Insecure-Requests': '1',
            'Referer': 'https://www.google.com/'
          },
          redirect: 'follow',
          signal: controller.signal
        });
    } catch (fetchErr) {
        console.error(`[Scraper] Network Error: ${fetchErr.message}`);
        // Return fallback data on network failure (e.g. DNS issue, timeout)
        return new Response(JSON.stringify({
            title: fallbackTitle,
            themeColor: '#000000',
            icon: fallbackIcon,
            url: targetUrl,
            isValid: true, // Treat as valid so builder can proceed
            isFallback: true
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } finally {
        clearTimeout(id);
    }

    // Use the final URL after redirects for resolving relative paths
    const finalUrl = response.url || targetUrl;
    console.log(`[Scraper] Final URL: ${finalUrl}, Status: ${response.status}`);

    // If site blocks bots (403/401/500), return fallback data instead of error
    if (response.status >= 400) {
        console.warn(`[Scraper] Site returned error status. Using fallbacks.`);
        return new Response(JSON.stringify({
            title: fallbackTitle,
            themeColor: '#000000',
            icon: fallbackIcon,
            url: finalUrl,
            isValid: true,
            isFallback: true
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const html = await response.text();
    
    if (!html || html.length < 50) {
       console.warn("[Scraper] Empty HTML.");
       return new Response(JSON.stringify({
            title: fallbackTitle,
            themeColor: '#000000',
            icon: fallbackIcon,
            url: finalUrl,
            isValid: true,
            isFallback: true
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const $ = cheerio.load(html);
    const titleText = $('title').text().trim();
    const titleLower = titleText.toLowerCase();

    // Check for parked domains
    const isParked = PARKED_KEYWORDS.some(k => titleLower.includes(k));
    if (isParked && html.length < 2000) {
        throw new Error("Parked domain detected");
    }

    // --- EXTRACTION ---

    // 1. Title
    let finalTitle = 
      $('meta[property="og:site_name"]').attr('content') || 
      $('meta[name="apple-mobile-web-app-title"]').attr('content') ||
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      '';

    if (finalTitle) {
        // Clean title
        const separators = ['|', '-', '–', '—', ':'];
        for (const sep of separators) {
            if (finalTitle.includes(` ${sep} `)) {
                finalTitle = finalTitle.split(` ${sep} `)[0];
                break;
            }
        }
        finalTitle = finalTitle.trim();
    }
    
    if (!finalTitle || finalTitle.length < 2) {
        finalTitle = fallbackTitle;
    }

    // 2. Theme Color
    const themeColor = 
      $('meta[name="theme-color"]').attr('content') || 
      $('meta[name="msapplication-TileColor"]').attr('content') ||
      '#000000';

    // 3. Icon
    // Priority: Apple Icon > Manifest Icon (hard to parse without request) > OG Image > Rel Icon > Shortcut
    let iconUrl = 
      $('link[rel="apple-touch-icon"]').attr('href') || 
      $('link[rel="icon"]').attr('href') || 
      $('link[rel="shortcut icon"]').attr('href') ||
      $('meta[property="og:image"]').attr('content');

    let finalIcon = null;

    if (iconUrl) {
      try {
        // Resolve relative paths against the final redirected URL
        finalIcon = new URL(iconUrl, finalUrl).href;
      } catch (e) {
        finalIcon = null;
      }
    }

    // If we didn't find an icon, or found a tiny ico/svg that might be bad, default to Google
    // Note: We prefer Google Favicon Service as a strong fallback because it handles caching and format conversion well.
    if (!finalIcon) {
        finalIcon = fallbackIcon;
    } else {
        // Even if we found one, if it's relative or weird, Google might be safer. 
        // But let's trust the site if it explicitly defined one.
    }

    // 4. Legal Links
    const findLinkInDom = (textKeywords: string[], hrefKeywords: string[]) => {
      let foundHref = '';
      
      // Strategy A: Check visible text
      $('a').each((i, el) => {
        if (foundHref) return; 
        const text = $(el).text().toLowerCase().trim();
        if (textKeywords.some(k => text.includes(k))) {
            foundHref = $(el).attr('href');
        }
      });
      
      if (foundHref) return foundHref;

      // Strategy B: Check HREF
      $('a').each((i, el) => {
        if (foundHref) return; 
        const href = $(el).attr('href');
        if (href) {
            const hrefLower = href.toLowerCase();
            if (hrefKeywords.some(k => hrefLower.includes(k))) {
                foundHref = href;
            }
        }
      });

      return foundHref;
    };

    const privacyKeywords = ['privacy policy', 'privacy', 'פרטיות', 'מדיניות פרטיות'];
    const privacyHrefKeywords = ['/privacy', 'privacy-policy', 'legal/privacy'];
    const termsKeywords = ['terms of service', 'terms', 'conditions', 'user agreement', 'תקנון', 'תנאי שימוש'];
    const termsHrefKeywords = ['/terms', 'terms-of-service', 'terms-conditions'];

    let privacyPolicyUrl = '';
    let termsOfServiceUrl = '';

    const rawPrivacy = findLinkInDom(privacyKeywords, privacyHrefKeywords);
    const rawTerms = findLinkInDom(termsKeywords, termsHrefKeywords);

    if (rawPrivacy) {
        try { privacyPolicyUrl = new URL(rawPrivacy, finalUrl).href; } catch(e) {}
    }
    if (rawTerms) {
        try { termsOfServiceUrl = new URL(rawTerms, finalUrl).href; } catch(e) {}
    }

    return new Response(
      JSON.stringify({
        title: finalTitle,
        themeColor,
        icon: finalIcon,
        url: finalUrl,
        privacyPolicyUrl,
        termsOfServiceUrl,
        isValid: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(`[Scraper] Fatal Error: ${error.message}`);
    
    // Even on fatal error, return a valid fallback structure so the UI doesn't break
    return new Response(
      JSON.stringify({ 
        title: 'My App',
        themeColor: '#000000',
        url: '',
        isValid: false, // UI can choose to show error or just default
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 so client parses JSON
      }
    )
  }
})
