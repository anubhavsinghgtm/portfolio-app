import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://anubhavsinghgtm.com';

// Define static website routes
const staticRoutes = [
  { path: '', changefreq: 'weekly', priority: 1.0 },
  { path: 'projects', changefreq: 'weekly', priority: 0.8 },
  { path: 'blog', changefreq: 'daily', priority: 0.8 },
];

// Helper to format date as YYYY-MM-DD
function parseDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {
    // Fall back to current date if parsing fails
  }
  return new Date().toISOString().split('T')[0];
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

function generateSitemap() {
  console.log('Generating sitemap.xml...');
  const blogDir = path.join(__dirname, 'src', 'content', 'blog');
  
  const urls = [];

  // 1. Add static routes
  staticRoutes.forEach(route => {
    urls.push({
      loc: `${BASE_URL}/${route.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: route.changefreq,
      priority: route.priority
    });
  });

  // 2. Discover dynamic blog routes
  if (fs.existsSync(blogDir)) {
    const mdFiles = getMarkdownFiles(blogDir);
    mdFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Parse frontmatter draft status and date
      const draftMatch = content.match(/draft:\s*(\w+)/);
      const isDraft = draftMatch ? draftMatch[1] === 'true' : false;
      
      if (!isDraft) {
        const id = path.basename(file, '.md');
        const dateMatch = content.match(/date:\s*([^\n\r]+)/);
        const date = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
        
        urls.push({
          loc: `${BASE_URL}/blog/${id}`,
          lastmod: parseDate(date),
          changefreq: 'monthly',
          priority: 0.6
        });
      }
    });
  }

  // 3. Generate XML structure
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>\n';

  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  console.log('sitemap.xml generated successfully in public/ folder!');
}

generateSitemap();
