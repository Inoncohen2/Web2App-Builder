
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Keywords that indicate a domain is not a real website
const PARKED_KEYWORDS = [
  'domain for sale', 'buy this domain', 'parked domain', 'domain is available',
  'godaddy', 'namecheap', 'under construction', 'coming soon',
  'site not found', 'website expired', 'this site can’t be reached'
];

const ERROR_TITLES = [
  '404 not found', '403 forbidden', '500 internal server error', 
  '502 bad gateway', 'error', 'access denied'
];

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Normalize URL
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // Fetch with timeout signal
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      signal: controller.signal
    });
    clearTimeout(id);

    if (response.status >= 400) {
      throw new Error(`Site returned status ${response.status}`);
    }

    const html = await response.text();

    if (!html || html.length < 100) {
       throw new Error("Site content is too short or empty.");
    }

    const $ = cheerio.load(html);
    const titleText = $('title').text().trim();
    const titleLower = titleText.toLowerCase();

    // Validation
    if (ERROR_TITLES.some(err => titleLower.includes(err))) {
       throw new Error("Site returned an error page.");
    }

    // Only fail on parked domain if content is very short (some legit landing pages have these keywords)
    const isParkedTitle = PARKED_KEYWORDS.some(keyword => titleLower.includes(keyword));
    if (isParkedTitle && html.length < 1500) {
        throw new Error("This appears to be a parked domain.");
    }

    // --- EXTRACTION ---

    // Title Strategy
    let finalTitle = 
      $('meta[property="og:site_name"]').attr('content') || 
      $('meta[name="apple-mobile-web-app-title"]').attr('content') ||
      $('title').text() ||
      $('meta[property="og:title"]').attr('content') ||
      '';

    // Clean Title
    if (finalTitle) {
        if (finalTitle.includes('|')) finalTitle = finalTitle.split('|')[0];
        else if (finalTitle.includes(' - ')) finalTitle = finalTitle.split(' - ')[0];
        else if (finalTitle.includes(':')) finalTitle = finalTitle.split(':')[0];
        finalTitle = finalTitle.trim();
    }
    
    // Fallback Title from Domain
    if (!finalTitle || finalTitle.length < 2) {
        try {
            const urlObj = new URL(targetUrl);
            finalTitle = urlObj.hostname.replace('www.', '').split('.')[0];
            finalTitle = finalTitle.charAt(0).toUpperCase() + finalTitle.slice(1);
        } catch (e) {
            finalTitle = 'My App';
        }
    }

    // Theme Color
    const themeColor = 
      $('meta[name="theme-color"]').attr('content') || 
      $('meta[name="msapplication-TileColor"]').attr('content') ||
      '#000000';

    // Icon Strategy
    let iconUrl = 
      $('link[rel="apple-touch-icon"]').attr('href') || 
      $('link[rel="icon"]').attr('href') || 
      $('link[rel="shortcut icon"]').attr('href') ||
      $('meta[property="og:image"]').attr('content'); // Fallback to OG image if no icon

    let finalIcon = null;

    if (iconUrl) {
      try {
        finalIcon = new URL(iconUrl, targetUrl).href;
      } catch (e) {
        // Failed to resolve relative path
        finalIcon = null;
      }
    }

    // Fallback Icon (Google Favicon Service) - Always run if no valid icon found
    if (!finalIcon) {
        try {
            const hostname = new URL(targetUrl).hostname;
            finalIcon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=192`;
        } catch (e) {}
    }

    // Legal Links Logic
    const findLinkInDom = (textKeywords: string[], hrefKeywords: string[]) => {
      let foundHref = '';
      
      $('a').each((i, el) => {
        if (foundHref) return; 
        const text = $(el).text().toLowerCase();
        const href = $(el).attr('href');
        
        if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
            if (textKeywords.some(k => text.includes(k))) {
                foundHref = href;
            }
        }
      });
      
      if (foundHref) return foundHref;

      $('a').each((i, el) => {
        if (foundHref) return; 
        const href = $(el).attr('href');
        if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
            const hrefLower = href.toLowerCase();
            if (hrefKeywords.some(k => hrefLower.includes(k))) {
                foundHref = href;
            }
        }
      });

      return foundHref;
    };

    const privacyKeywords = ['privacy policy', 'privacy notice', 'privacy statement', 'privacy'];
    const privacyHrefKeywords = ['/privacy', 'privacy-policy', 'legal/privacy', 'privacy_policy'];
    const termsKeywords = ['terms of service', 'terms of use', 'terms & conditions', 'terms and conditions', 'user agreement', 't&c'];
    const termsHrefKeywords = ['/terms', 'terms-of-service', 'terms-conditions', 'legal/terms', 'user-agreement', 'terms_of_service'];

    let privacyPolicyUrl = '';
    let termsOfServiceUrl = '';

    const rawPrivacy = findLinkInDom(privacyKeywords, privacyHrefKeywords);
    const rawTerms = findLinkInDom(termsKeywords, termsHrefKeywords);

    if (rawPrivacy) {
        try { privacyPolicyUrl = new URL(rawPrivacy, targetUrl).href; } catch(e) {}
    }
    if (rawTerms) {
        try { termsOfServiceUrl = new URL(rawTerms, targetUrl).href; } catch(e) {}
    }

    return new Response(
      JSON.stringify({
        title: finalTitle,
        themeColor,
        icon: finalIcon,
        url: targetUrl,
        privacyPolicyUrl,
        termsOfServiceUrl,
        isValid: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to scrape site',
        isValid: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
