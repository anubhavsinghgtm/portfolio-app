import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectsGrid from './components/ProjectsGrid';
import BlogSection from './components/BlogSection';
import Footer from './components/Footer';
import projects from './content/projects.json';
import Expertise from './components/Expertise';

// Dynamic Glob Import to dynamically resolve and fetch raw content of local Markdown files inside src/content/blog/
const blogFiles = import.meta.glob('/src/content/blog/*.md', { query: '?raw', import: 'default', eager: true });

// Frontmatter Metadata parser for standard Git-based Markdown pipelines
function parseMarkdownPost(rawText, filepath) {
  const filename = filepath.split('/').pop() || filepath;
  const id = filename.replace(/\.md$/, '');
  
  // Regex to isolate Frontmatter block (everything enclosed within starting and ending --- lines)
  const match = rawText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  
  if (!match) {
    return {
      id,
      title: id.replace(/-/g, ' '),
      category: 'General',
      date: 'Recent',
      readingTime: '3 min read',
      draft: 'false',
      excerpt: '',
      content: rawText
    };
  }

  const frontmatterRaw = match[1];
  const content = match[2];
  const metadata = {};

  frontmatterRaw.split('\n').forEach(line => {
    const colIndex = line.indexOf(':');
    if (colIndex !== -1) {
      const key = line.slice(0, colIndex).trim();
      const value = line.slice(colIndex + 1).trim();
      metadata[key] = value;
    }
  });

  return {
    id,
    title: metadata.title || id.replace(/-/g, ' '),
    category: metadata.category || 'General',
    date: metadata.date || 'Recent',
    readingTime: metadata.readingTime || '3 min read',
    draft: metadata.draft || 'false',
    excerpt: metadata.excerpt || '',
    content: content.trim()
  };
}

// Convert files object into a structured blog articles dataset
const articles = Object.keys(blogFiles).map((path) => {
  const rawContent = blogFiles[path];
  return parseMarkdownPost(rawContent, path);
})
.filter(article => article.draft !== 'true') // Filter out drafts
.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort chronologically (latest first)

// 🚀 Dynamic Scroll Reset & SEO Head Injection Component
function ScrollToTopAndSEO({ articles }) {
  const { pathname } = useLocation();
  const params = useParams();

  useEffect(() => {
    // 1. Scroll browser window to the top on every route navigation
    window.scrollTo(0, 0);

    // 2. Default standard SEO meta fallbacks
    let title = "Anubhav Singh — AI & Backend Engineer";
    let description = "I engineer AI-powered analytics platforms and deep learning classification systems — orchestrating custom LLM flows with Gemini, FastAPI, and Astro.";

    // 3. Dynamic metadata overrides based on active browser pathname route
    if (pathname === '/projects') {
      title = "Featured Projects — Anubhav Singh";
      description = "Explore real-world software architectures, GenAI platforms, explainable vaccine hesitancy classifications, and Astro consultancy websites built by Anubhav Singh.";
    } else if (pathname === '/blog') {
      title = "Notes & Writing — Anubhav Singh";
      description = "Technical guides, deep dives, and learning summaries about database partitioning, LLM compilers, and resilient API backend scaling.";
    } else if (pathname.startsWith('/blog/')) {
      // Parse active blog path ID parameters
      const blogId = pathname.split('/').pop();
      const article = articles.find(a => a.id === blogId);
      if (article) {
        title = `${article.title} — Anubhav Singh`;
        description = article.excerpt;
      }
    }

    // 4. Inject dynamically resolved tags directly into HTML head
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
  }, [pathname, params, articles]);

  return null;
}

export default function App() {
  // Filter out draft projects so only published projects appear on the live site
  const activeProjects = projects.filter(project => project.draft !== true);

  return (
    <Router>
      <ScrollToTopAndSEO articles={articles} />
      <div className="app-container">
        <Navbar />

        <main className="main-content">
          <Routes>
            {/* Homepage (Landing) Route */}
            <Route path="/" element={
              <>
                <Hero />
                <Expertise />
                <ProjectsGrid projects={activeProjects} limit={3} />
                
                <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'flex-start' }}>
                  <Link 
                    to="/projects"
                    className="font-mono text-sm inline-flex items-center gap-[0.35rem] text-[var(--primary)] font-medium hover:text-[var(--accent)] transition-colors"
                  >
                    <span>View all projects</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                </div>

                <BlogSection articles={articles} limit={3} />
                
                <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'flex-start' }}>
                  <Link 
                    to="/blog"
                    className="font-mono text-sm inline-flex items-center gap-[0.35rem] text-[var(--primary)] font-medium hover:text-[var(--accent)] transition-colors"
                  >
                    <span>View all writing</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                </div>
              </>
            } />

            {/* Standalone Projects Grid Route */}
            <Route path="/projects" element={<ProjectsGrid projects={activeProjects} />} />

            {/* Standalone Blog List Route */}
            <Route path="/blog" element={<BlogSection articles={articles} />} />

            {/* Dynamic Blog Article Reading Route */}
            <Route path="/blog/:id" element={<ArticleReader articles={articles} />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

// 📖 Dynamic Article Detail View Component
function ArticleReader({ articles }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = articles.find(a => a.id === id);

  if (!article) {
    return (
      <div className="article-reader fade-in text-left">
        <button className="article-back-btn font-mono" onClick={() => navigate('/blog')}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ marginRight: '0.25rem', display: 'inline-block', verticalAlign: 'middle' }}
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to writing</span>
        </button>
        <h1 className="article-title text-3xl font-serif mt-4">Article Not Found</h1>
        <p className="text-muted-foreground mt-2">The requested article could not be resolved or does not exist.</p>
      </div>
    );
  }

  return (
    <article className="article-reader fade-in">
      <button className="article-back-btn font-mono" onClick={() => navigate('/blog')}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          style={{ marginRight: '0.25rem', display: 'inline-block', verticalAlign: 'middle' }}
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Back to writing</span>
      </button>

      <header className="article-header">
        <div className="article-category">{article.category}</div>
        <h1 className="article-title">{article.title}</h1>
        <div className="article-meta">
          <span className="article-date">{article.date}</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span className="article-reading-time">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="lucide lucide-clock"
              style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem' }}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {article.readingTime}
          </span>
        </div>
      </header>

      <div 
        className="article-rich-content"
        dangerouslySetInnerHTML={{ 
          __html: formatMarkdown(article.content) 
        }}
      />
    </article>
  );
}

// Simple Markdown Formatter Helper Function
function formatMarkdown(content) {
  if (!content) return '';
  
  return content
    // Paragraph spaces
    .trim()
    // Headers (H2, H3)
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    // Alerts (Notes/Warnings)
    .replace(/^> \[!NOTE\]\s*(.*$)/gim, '<blockquote><strong>Note:</strong> $1</blockquote>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Code blocks with syntax formatting placeholders
    .replace(/```sql([\s\S]*?)```/gim, '<pre><code class="language-sql">$1</code></pre>')
    .replace(/```javascript([\s\S]*?)```/gim, '<pre><code class="language-javascript">$1</code></pre>')
    .replace(/```python([\s\S]*?)```/gim, '<pre><code class="language-python">$1</code></pre>')
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // Inline code tags
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Tables formatting helper (basic regex)
    .replace(/\| (.*) \|/g, (match, p1) => {
      const cells = p1.split(' | ');
      const isHeader = match.includes('---');
      if (isHeader) return '';
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    })
    // Wrap tables
    .replace(/(<tr>[\s\S]*?<\/tr>)/g, '<table class="article-table">$1</table>')
    // Fix multiple tables consolidation
    .replace(/<\/table>\s*<table class="article-table">/g, '')
    // Bold tags
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic tags
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Lists formatting
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    // Convert newlines to paragraphs/breaks
    .split('\n\n')
    .map(para => {
      if (para.trim().startsWith('<h') || para.trim().startsWith('<pre') || para.trim().startsWith('<blockquote') || para.trim().startsWith('<table') || para.trim().startsWith('<ul')) {
        return para;
      }
      return para ? `<p>${para.replace(/\n/g, '<br/>')}</p>` : '';
    })
    .join('');
}
