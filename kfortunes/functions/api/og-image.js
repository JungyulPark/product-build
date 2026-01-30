/**
 * Dynamic OG Image Generator for KFortunes
 * Generates share images with celebrity photo and match score
 * Uses SVG for fast rendering (no Sharp dependency)
 *
 * Usage:
 * /api/og-image?celeb=BTS%20Jungkook&score=92&template=square
 * /api/og-image?celeb=IU&score=88&template=story (1080x1920)
 * /api/og-image?celeb=Taylor%20Swift&score=95&template=twitter (1200x628)
 */

export async function onRequest(context) {
  try {
    const { searchParams } = new URL(context.request.url);

    // Get parameters
    const celebName = searchParams.get('celeb') || 'Your K-Star Twin';
    const score = parseInt(searchParams.get('score')) || 85;
    const template = searchParams.get('template') || 'square'; // square, story, twitter
    const korean = searchParams.get('korean') || '';

    // Template dimensions
    const templates = {
      square: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
      twitter: { width: 1200, height: 628 }
    };

    const { width, height } = templates[template] || templates.square;

    // Generate SVG
    const svg = generateOGImageSVG(celebName, korean, score, width, height, template);

    // Return SVG as image
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Error generating image', { status: 500 });
  }
}

function generateOGImageSVG(celebName, korean, score, width, height, template) {
  // Gradient colors based on score
  const gradient = score >= 80
    ? { from: '#8b5cf6', to: '#ec4899' }
    : score >= 60
    ? { from: '#f59e0b', to: '#22c55e' }
    : { from: '#ef4444', to: '#f59e0b' };

  // Grade emoji and label
  let grade = '';
  if (score >= 85) grade = '🌟 Destiny Twin';
  else if (score >= 70) grade = '✨ Soul Match';
  else if (score >= 55) grade = '💫 Same Energy';
  else grade = '🔮 Similar Vibe';

  if (template === 'story') {
    // Instagram Story (1080x1920)
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a2e" />
            <stop offset="100%" style="stop-color:#16213e" />
          </linearGradient>
          <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradient.from}" />
            <stop offset="100%" style="stop-color:${gradient.to}" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#bg-grad)" />

        <!-- Decorative circles -->
        <circle cx="100" cy="200" r="120" fill="${gradient.from}" opacity="0.1" />
        <circle cx="980" cy="1700" r="150" fill="${gradient.to}" opacity="0.1" />

        <!-- Header -->
        <text x="540" y="180" font-family="Arial, sans-serif" font-size="48" font-weight="bold"
              fill="white" text-anchor="middle">
          🔮 K-Star Match
        </text>

        <!-- Celebrity Avatar Placeholder -->
        <circle cx="540" cy="500" r="200" fill="url(#score-grad)" opacity="0.2" />
        <circle cx="540" cy="500" r="180" fill="#2d3748" />
        <text x="540" y="530" font-family="Arial, sans-serif" font-size="80" font-weight="bold"
              fill="white" text-anchor="middle">
          ${celebName.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </text>

        <!-- Celebrity Name -->
        <text x="540" y="800" font-family="Arial, sans-serif" font-size="56" font-weight="bold"
              fill="white" text-anchor="middle">
          ${wrapText(celebName, 18)}
        </text>

        ${korean ? `
        <text x="540" y="880" font-family="Arial, sans-serif" font-size="36"
              fill="#a0aec0" text-anchor="middle">
          ${korean}
        </text>
        ` : ''}

        <!-- Match Score Ring -->
        <g transform="translate(540, 1150)">
          <circle cx="0" cy="0" r="160" fill="none" stroke="#374151" stroke-width="20" />
          <circle cx="0" cy="0" r="160" fill="none" stroke="url(#score-grad)" stroke-width="20"
                  stroke-dasharray="${(score / 100) * 1005} 1005"
                  stroke-linecap="round" transform="rotate(-90)" />
          <text x="0" y="20" font-family="Arial, sans-serif" font-size="120" font-weight="bold"
                fill="white" text-anchor="middle">
            ${score}
          </text>
          <text x="0" y="80" font-family="Arial, sans-serif" font-size="40"
                fill="#a0aec0" text-anchor="middle">
            % Match
          </text>
        </g>

        <!-- Grade -->
        <text x="540" y="1500" font-family="Arial, sans-serif" font-size="44" font-weight="bold"
              fill="white" text-anchor="middle">
          ${grade}
        </text>

        <!-- Call to Action -->
        <text x="540" y="1650" font-family="Arial, sans-serif" font-size="36"
              fill="#a0aec0" text-anchor="middle">
          Find Your K-Star Twin
        </text>

        <!-- Footer -->
        <text x="540" y="1820" font-family="Arial, sans-serif" font-size="32" font-weight="600"
              fill="${gradient.from}" text-anchor="middle">
          kstarmatch.com
        </text>
      </svg>
    `;
  } else if (template === 'twitter') {
    // Twitter Card (1200x628)
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a2e" />
            <stop offset="100%" style="stop-color:#16213e" />
          </linearGradient>
          <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradient.from}" />
            <stop offset="100%" style="stop-color:${gradient.to}" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#bg-grad)" />

        <!-- Left Side: Avatar & Name -->
        <g transform="translate(200, 314)">
          <circle cx="0" cy="0" r="140" fill="url(#score-grad)" opacity="0.2" />
          <circle cx="0" cy="0" r="120" fill="#2d3748" />
          <text x="0" y="20" font-family="Arial, sans-serif" font-size="60" font-weight="bold"
                fill="white" text-anchor="middle">
            ${celebName.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </text>
        </g>

        <!-- Celebrity Info -->
        <text x="400" y="280" font-family="Arial, sans-serif" font-size="48" font-weight="bold"
              fill="white">
          ${wrapText(celebName, 16)}
        </text>
        <text x="400" y="360" font-family="Arial, sans-serif" font-size="32"
              fill="${gradient.from}" font-weight="600">
          ${grade}
        </text>

        <!-- Score Circle -->
        <g transform="translate(1000, 314)">
          <circle cx="0" cy="0" r="120" fill="none" stroke="#374151" stroke-width="16" />
          <circle cx="0" cy="0" r="120" fill="none" stroke="url(#score-grad)" stroke-width="16"
                  stroke-dasharray="${(score / 100) * 754} 754"
                  stroke-linecap="round" transform="rotate(-90)" />
          <text x="0" y="10" font-family="Arial, sans-serif" font-size="72" font-weight="bold"
                fill="white" text-anchor="middle">
            ${score}
          </text>
          <text x="0" y="50" font-family="Arial, sans-serif" font-size="24"
                fill="#a0aec0" text-anchor="middle">
            %
          </text>
        </g>

        <!-- Header -->
        <text x="600" y="80" font-family="Arial, sans-serif" font-size="36" font-weight="bold"
              fill="white" text-anchor="middle">
          🔮 K-Star Personality Twin
        </text>

        <!-- Footer -->
        <text x="600" y="580" font-family="Arial, sans-serif" font-size="28" font-weight="600"
              fill="${gradient.from}" text-anchor="middle">
          kstarmatch.com - Find Your K-Star Twin
        </text>
      </svg>
    `;
  } else {
    // Square (1080x1080) - Default
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a2e" />
            <stop offset="100%" style="stop-color:#16213e" />
          </linearGradient>
          <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradient.from}" />
            <stop offset="100%" style="stop-color:${gradient.to}" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#bg-grad)" />

        <!-- Decorative elements -->
        <circle cx="100" cy="100" r="80" fill="${gradient.from}" opacity="0.1" />
        <circle cx="980" cy="980" r="100" fill="${gradient.to}" opacity="0.1" />

        <!-- Header -->
        <text x="540" y="140" font-family="Arial, sans-serif" font-size="44" font-weight="bold"
              fill="white" text-anchor="middle">
          🔮 K-Star Match
        </text>

        <!-- Celebrity Avatar -->
        <circle cx="540" cy="380" r="160" fill="url(#score-grad)" opacity="0.2" />
        <circle cx="540" cy="380" r="140" fill="#2d3748" />
        <text x="540" y="410" font-family="Arial, sans-serif" font-size="70" font-weight="bold"
              fill="white" text-anchor="middle">
          ${celebName.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </text>

        <!-- Celebrity Name -->
        <text x="540" y="620" font-family="Arial, sans-serif" font-size="52" font-weight="bold"
              fill="white" text-anchor="middle">
          ${wrapText(celebName, 18)}
        </text>

        ${korean ? `
        <text x="540" y="690" font-family="Arial, sans-serif" font-size="32"
              fill="#a0aec0" text-anchor="middle">
          ${korean}
        </text>
        ` : ''}

        <!-- Match Score -->
        <g transform="translate(540, 850)">
          <circle cx="0" cy="0" r="110" fill="none" stroke="#374151" stroke-width="16" />
          <circle cx="0" cy="0" r="110" fill="none" stroke="url(#score-grad)" stroke-width="16"
                  stroke-dasharray="${(score / 100) * 691} 691"
                  stroke-linecap="round" transform="rotate(-90)" />
          <text x="0" y="15" font-family="Arial, sans-serif" font-size="80" font-weight="bold"
                fill="white" text-anchor="middle">
            ${score}
          </text>
          <text x="0" y="60" font-family="Arial, sans-serif" font-size="32"
                fill="#a0aec0" text-anchor="middle">
            % Match
          </text>
        </g>

        <!-- Grade -->
        <text x="540" y="1010" font-family="Arial, sans-serif" font-size="36" font-weight="bold"
              fill="white" text-anchor="middle">
          ${grade}
        </text>

        <!-- Footer -->
        <text x="540" y="1040" font-family="Arial, sans-serif" font-size="28" font-weight="600"
              fill="${gradient.from}" text-anchor="middle">
          kstarmatch.com
        </text>
      </svg>
    `;
  }
}

// Helper function to wrap text if too long
function wrapText(text, maxLength) {
  if (text.length <= maxLength) return text;
  const words = text.split(' ');
  if (words.length === 1) return text.substring(0, maxLength) + '...';
  return words.slice(0, 2).join(' ');
}
