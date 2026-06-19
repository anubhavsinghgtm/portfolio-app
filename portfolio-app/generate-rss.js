import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://anubhavsinghgtm.com';

// Helper to escape special XML characters
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Helper to format date to RFC-822 (standard for RSS feeds)
function formatRfc822Date(dateStr) {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toUTCString();
    }
  } catch (e) {
    // Ignore and fallback
  }
  return new Date().toUTCString();
}

// Recursively find all Markdown files in a directory
function getMarkdownFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });
  return results;
}

function generateRss() {
  console.log('Generating feed.xml (RSS)...');
  const blogDir = path.join(__dirname, 'src', 'content', 'blog');
  
  const articles = [];

  // Discover and parse blog posts
  if (fs.existsSync(blogDir)) {
    const mdFiles = getMarkdownFiles(blogDir);
    mdFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Parse frontmatter
      const draftMatch = content.match(/draft:\s*(\w+)/);
      const isDraft = draftMatch ? draftMatch[1] === 'true' : false;
      
      if (!isDraft) {
        const id = path.basename(file, '.md');
        
        const titleMatch = content.match(/title:\s*([^\n\r]+)/);
        const title = titleMatch ? titleMatch[1].trim() : id.replace(/-/g, ' ');
        
        const dateMatch = content.match(/date:\s*([^\n\r]+)/);
        const date = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
        
        const excerptMatch = content.match(/excerpt:\s*([^\n\r]+)/);
        const excerpt = excerptMatch ? excerptMatch[1].trim() : '';

        articles.push({
          id,
          title,
          date,
          excerpt,
        });
      }
    });
  }

  // Sort articles chronologically (latest first)
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Construct RSS XML schema
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
  xml += '  <channel>\n';
  xml += '    <title>Anubhav Singh — AI &amp; Backend Engineer</title>\n';
  xml += `    <link>${BASE_URL}</link>\n`;
  xml += '    <description>I engineer AI-powered analytics platforms and deep learning classification systems — orchestrating custom LLM flows with Gemini, FastAPI, and Astro.</description>\n';
  xml += '    <language>en-us</language>\n';
  xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
  xml += `    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>\n`;

  articles.forEach(article => {
    const postUrl = `${BASE_URL}/blog/${article.id}`;
    xml += '    <item>\n';
    xml += `      <title>${escapeXml(article.title)}</title>\n`;
    xml += `      <link>${postUrl}</link>\n`;
    xml += `      <guid isPermaLink="true">${postUrl}</guid>\n`;
    xml += `      <pubDate>${formatRfc822Date(article.date)}</pubDate>\n`;
    xml += `      <description>${escapeXml(article.excerpt)}</description>\n`;
    xml += '    </item>\n';
  });

  xml += '  </channel>\n';
  xml += '</rss>\n';

  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  fs.writeFileSync(path.join(publicDir, 'feed.xml'), xml);
  console.log('feed.xml (RSS) generated successfully in public/ folder!');
}

generateRss();
