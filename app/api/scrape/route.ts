
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { load } from 'cheerio';

// Keywords that indicate a domain is not a real website
const PARKED_KEYWORDS = [
  'domain for sale',
  'buy this domain',
  'parked domain',
  'domain is available',
  'godaddy',
  'namecheap',
  'under construction',
  'coming soon',
  'site not found',
  'website expired',
  'this site can’t be reached'
];

// Keywords indicating server errors
const ERROR_TITLES = [
  '404 not found',
  '403 forbidden',
  '500 internal server error',
  '502 bad gateway',
  'error',
  'access denied'
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // 1. Fetch the Website
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 8000, // 8 second timeout
      validateStatus: (status) => status < 400 // Reject if status is 4xx or 5xx
    });

    const html = response.data;
    
    // 2. Validate Content Length (Empty sites)
    if (!html || html.length < 200) {
       throw new Error("Site content is too short or empty.");
    }

    const $ = load(html);
    const titleText = $('title').text().trim();
    const bodyText = $('body').text().toLowerCase();
    const titleLower = titleText.toLowerCase();

    // 3. Validate against Error Titles
    if (ERROR_TITLES.some(err => titleLower.includes(err))) {
       throw new Error("Site returned an error page.");
    }

    // 4. Validate against Parked/Fake Domain Keywords
    const isParkedTitle = PARKED_KEYWORDS.some(keyword => titleLower.includes(keyword));
    
    if (isParkedTitle) {
        if (html.length < 1500) {
            throw new Error("This appears to be a parked domain.");
        }
    }

    // --- EXTRACTION LOGIC ---

    // A. Title Extraction (Improved to avoid "Convert" issue)
    // Priority: og:site_name -> apple-mobile-web-app-title -> <title> tag
    let finalTitle = 
      $('meta[property="og:site_name"]').attr('content') || 
      $('meta[name="apple-mobile-web-app-title"]').attr('content') ||
      $('title').text() ||
      'My App';

    // Clean up title: Split by common separators like "|", "-", ":" and take the first part
    // Example: "My Brand - The Best Shop" -> "My Brand"
    if (finalTitle.includes('|')) finalTitle = finalTitle.split('|')[0];
    else if (finalTitle.includes(' - ')) finalTitle = finalTitle.split(' - ')[0];
    else if (finalTitle.includes(':')) finalTitle = finalTitle.split(':')[0];
    
    finalTitle = finalTitle.trim();
    
    // Fallback if title is still empty
    if (!finalTitle || finalTitle.length < 2) {
        try {
            finalTitle = new URL(url).hostname.replace('www.', '').split('.')[0];
            finalTitle = finalTitle.charAt(0).toUpperCase() + finalTitle.slice(1);
        } catch (e) {
            finalTitle = 'My App';
        }
    }

    // B. Description Extraction
    const description = 
      $('meta[property="og:description"]').attr('content') || 
      $('meta[name="description"]').attr('content') || 
      '';

    // C. Theme Color Extraction
    const themeColor = 
      $('meta[name="theme-color"]').attr('content') || 
      $('meta[name="msapplication-TileColor"]').attr('content') ||
      '#000000';

    // D. Icon Extraction
    let icon = 
      $('link[rel="apple-touch-icon"]').attr('href') || 
      $('link[rel="icon"]').attr('href') || 
      $('link[rel="shortcut icon"]').attr('href');

    // Resolve relative URL to absolute URL for Icon
    if (icon) {
      try {
        icon = new URL(icon, url).href;
      } catch (e) {
        icon = undefined;
      }
    } else {
      try {
        icon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;
      } catch (e) {
        icon = undefined;
      }
    }

    // E. Legal Links Extraction (Privacy & Terms)
    let privacyPolicyUrl = '';
    let termsOfServiceUrl = '';

    // Helper to find link by text content
    const findLinkByText = (keywords: string[]) => {
      let foundHref = '';
      $('a').each((i, el) => {
        if (foundHref) return; // Stop if found
        const text = $(el).text().toLowerCase();
        const href = $(el).attr('href');
        
        if (href && keywords.some(k => text.includes(k))) {
            // Check validity of href (exclude mailto, tel, javascript)
            if (!href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
                foundHref = href;
            }
        }
      });
      return foundHref;
    };

    const rawPrivacy = findLinkByText(['privacy policy', 'privacy notice', 'privacy statement']);
    const rawTerms = findLinkByText(['terms of service', 'terms of use', 'terms & conditions', 'terms and conditions']);

    // Resolve relative URLs for legal links
    if (rawPrivacy) {
        try { privacyPolicyUrl = new URL(rawPrivacy, url).href; } catch(e) {}
    }
    if (rawTerms) {
        try { termsOfServiceUrl = new URL(rawTerms, url).href; } catch(e) {}
    }

    return NextResponse.json({
      title: finalTitle,
      description: description.trim(),
      themeColor,
      icon,
      url,
      privacyPolicyUrl,
      termsOfServiceUrl,
      isValid: true
    });

  } catch (error: any) {
    console.error('Validation error:', error.message);
    
    let userMessage = 'Failed to load website.';
    if (error.code === 'ECONNABORTED') userMessage = 'Connection timed out. Site is too slow.';
    if (error.response && error.response.status === 404) userMessage = 'Website not found (404).';
    if (error.message.includes('parked')) userMessage = 'Domain appears to be parked or for sale.';
    if (error.message.includes('error page')) userMessage = 'Website returned an error page.';

    return NextResponse.json({ 
      error: userMessage,
      isValid: false
    }, { status: 400 });
  }
}
