
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

    // SSRF Protection: Block internal/private network URLs
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      // Block localhost, private IPs, and metadata endpoints
      const blockedPatterns = [
        /^localhost$/,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2\d|3[01])\./,
        /^192\.168\./,
        /^169\.254\./,      // AWS metadata
        /^0\./,
        /^\[::1\]$/,        // IPv6 localhost
        /^metadata\./,
        /^internal\./,
      ];

      if (blockedPatterns.some(pattern => pattern.test(hostname))) {
        return NextResponse.json({ error: 'Invalid URL: private addresses are not allowed', isValid: false }, { status: 400 });
      }

      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: 'Invalid URL: only HTTP/HTTPS allowed', isValid: false }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format', isValid: false }, { status: 400 });
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
    // We check the title heavily, and the body loosely
    const isParkedTitle = PARKED_KEYWORDS.some(keyword => titleLower.includes(keyword));
    
    // If title looks suspicious, check body length or specific parked structures
    if (isParkedTitle) {
        // Most real sites have a complex structure. Parked sites are usually simple.
        if (html.length < 1500) {
            throw new Error("This appears to be a parked domain.");
        }
    }

    // --- EXTRACTION LOGIC (Only runs if valid) ---

    // Extract Raw Title
    let rawTitle = 
      $('meta[property="og:title"]').attr('content') || 
      titleText || 
      'My App';

    // Logic to prioritize English and limit to 3 words
    let finalTitle = 'My App';
    const cleanText = rawTitle.replace(/[|\-:]/g, ' ').replace(/\s+/g, ' ').trim();
    const englishWords = cleanText.match(/[a-zA-Z0-9]+/g);

    if (englishWords && englishWords.length > 0) {
        finalTitle = englishWords.slice(0, 3).join(' ');
    } else {
        finalTitle = cleanText.split(' ').slice(0, 3).join(' ');
    }
    finalTitle = finalTitle.replace(/\b\w/g, l => l.toUpperCase());

    // Extract Description
    const description = 
      $('meta[property="og:description"]').attr('content') || 
      $('meta[name="description"]').attr('content') || 
      '';

    // Extract Theme Color
    const themeColor = $('meta[name="theme-color"]').attr('content') || '#000000';

    // Extract Icon
    let icon = 
      $('link[rel="apple-touch-icon"]').attr('href') || 
      $('link[rel="icon"]').attr('href') || 
      $('link[rel="shortcut icon"]').attr('href');

    // Resolve relative URL to absolute URL
    if (icon) {
      try {
        icon = new URL(icon, url).href;
      } catch (e) {
        icon = undefined;
      }
    } else {
      try {
        // Fallback to Google Favicon API if no icon found in HTML
        // This ensures we almost always get an icon for real sites
        icon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;
      } catch (e) {
        icon = undefined;
      }
    }

    return NextResponse.json({
      title: finalTitle,
      description: description.trim(),
      themeColor,
      icon,
      url,
      isValid: true
    });

  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; response?: { status?: number } };
    console.error('Validation error:', err.message);

    let userMessage = 'Failed to load website.';
    if (err.code === 'ECONNABORTED') userMessage = 'Connection timed out. Site is too slow.';
    if (err.response?.status === 404) userMessage = 'Website not found (404).';
    if (err.message?.includes('parked')) userMessage = 'Domain appears to be parked or for sale.';
    if (err.message?.includes('error page')) userMessage = 'Website returned an error page.';
    if (err.message?.includes('too short')) userMessage = 'Website content appears empty or incomplete.';

    return NextResponse.json({
      error: userMessage,
      isValid: false
    }, { status: 400 });
  }
}
