import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { load } from 'cheerio';

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

    // Set User-Agent to mimic a browser to avoid some bot blocks
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000 // 10 second timeout
    });

    const html = response.data;
    const $ = load(html);

    // 1. Extract Raw Title
    let rawTitle = 
      $('meta[property="og:title"]').attr('content') || 
      $('title').text() || 
      'My App';

    // 2. Logic to prioritize English and limit to 3 words
    let finalTitle = 'My App';
    
    // Clean strings (remove separators like | - :)
    const cleanText = rawTitle.replace(/[|\-:]/g, ' ').trim();
    
    // Regex to find English words (latin characters)
    const englishWords = cleanText.match(/[a-zA-Z0-9]+/g);

    if (englishWords && englishWords.length > 0) {
        // If English words exist, take the first 3
        finalTitle = englishWords.slice(0, 3).join(' ');
    } else {
        // Fallback: Take first 3 words of the original language
        finalTitle = cleanText.split(/\s+/).slice(0, 3).join(' ');
    }

    // Capitalize first letter of each word for aesthetics
    finalTitle = finalTitle.replace(/\b\w/g, l => l.toUpperCase());

    // 3. Extract Description
    const description = 
      $('meta[property="og:description"]').attr('content') || 
      $('meta[name="description"]').attr('content') || 
      '';

    // 4. Extract Theme Color
    const themeColor = $('meta[name="theme-color"]').attr('content') || '#000000';

    // 5. Extract Icon
    let icon = 
      $('link[rel="apple-touch-icon"]').attr('href') || 
      $('link[rel="icon"]').attr('href') || 
      $('link[rel="shortcut icon"]').attr('href');

    // Resolve relative URL to absolute URL
    if (icon) {
      icon = new URL(icon, url).href;
    } else {
      try {
        const faviconUrl = new URL('/favicon.ico', url).href;
        icon = faviconUrl;
      } catch (e) {
        icon = undefined;
      }
    }

    return NextResponse.json({
      title: finalTitle,
      description: description.trim(),
      themeColor,
      icon,
      url // Return the normalized URL
    });

  } catch (error: any) {
    console.error('Scraping error:', error.message);
    return NextResponse.json({ 
      error: 'Failed to scrape',
      title: 'My App',
      themeColor: '#000000',
      icon: null
    }, { status: 200 }); 
  }
}