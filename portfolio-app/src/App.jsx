import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectsGrid from './components/ProjectsGrid';
import BlogSection from './components/BlogSection';
import Footer from './components/Footer';
import projects from './content/projects.json';
import Expertise from './components/Expertise';

// Dynamic Glob Import to dynamically resolve and fetch raw content of local Markdown files inside src/content/blog/ (including subdirectories)
const blogFiles = import.meta.glob('/src/content/blog/**/*.md', { query: '?raw', import: 'default', eager: true });

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

  const codeBlocks = [];
  const inlineCodes = [];

  // 1. Temporarily extract code blocks (triple backticks) to prevent formatting within them
  let formatted = content.replace(/```(\w*)\s*\r?\n([\s\S]*?)\r?\n```/g, (match, lang, code) => {
    const placeholder = `<!--CODE_BLOCK_PLACEHOLDER_${codeBlocks.length}-->`;
    const cleanCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const codeTag = lang 
      ? `<code class="language-${lang}">${cleanCode}</code>` 
      : `<code>${cleanCode}</code>`;
    codeBlocks.push(`<pre>${codeTag}</pre>`);
    return placeholder;
  });

  // 2. Temporarily extract inline code (single backticks) to prevent formatting within them
  formatted = formatted.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `<!--INLINE_CODE_PLACEHOLDER_${inlineCodes.length}-->`;
    const cleanCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    inlineCodes.push(`<code>${cleanCode}</code>`);
    return placeholder;
  });

  // 3. Convert Markdown syntax to HTML

  // Headers (H2, H3)
  formatted = formatted
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>');

  // Blockquotes and Note alerts
  const bqLines = formatted.split('\n');
  let inBq = false;
  let bqItems = [];
  const bqProcessed = [];
  
  for (let i = 0; i < bqLines.length; i++) {
    const line = bqLines[i];
    const noteMatch = line.match(/^>\s+\[!NOTE\]\s*(.*)$/i);
    const regularMatch = line.match(/^>\s*(.*)$/);
    if (noteMatch) {
      if (inBq) {
        bqProcessed.push(`<blockquote>${bqItems.join('<br/>')}</blockquote>`);
        inBq = false;
      }
      bqProcessed.push(`<blockquote><strong>Note:</strong> ${noteMatch[1]}</blockquote>`);
    } else if (regularMatch) {
      if (!inBq) {
        inBq = true;
        bqItems = [];
      }
      bqItems.push(regularMatch[1]);
    } else {
      if (inBq) {
        bqProcessed.push(`<blockquote>${bqItems.join('<br/>')}</blockquote>`);
        inBq = false;
      }
      bqProcessed.push(line);
    }
  }
  if (inBq) {
    bqProcessed.push(`<blockquote>${bqItems.join('<br/>')}</blockquote>`);
  }
  formatted = bqProcessed.join('\n');

  // Markdown links: [text](url)
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  // Bold (**text** or __text__)
  formatted = formatted.replace(/\*\*(?=\S)([\s\S]+?)(?<=\S)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(?=\S)([\s\S]+?)(?<=\S)__/g, '<strong>$1</strong>');

  // Italic (*text* or _text_)
  formatted = formatted.replace(/\*(?=\S)([\s\S]+?)(?<=\S)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/(?<!\w)_(?=\S)([\s\S]+?)(?<=\S)_(?!\w)/g, '<em>$1</em>');

  // Horizontal rules (--- or *** or ___ on their own line)
  formatted = formatted.replace(/^[-*_]{3,}\s*$/gim, '<hr/>');

  // Tables
  const lines = formatted.split('\n');
  let inTable = false;
  let tableRows = [];
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      if (line.includes('---')) {
        continue;
      }
      const cells = line
        .slice(1, -1)
        .split('|')
        .map(c => c.trim());
      
      const isHeaderRow = tableRows.length === 0 && i + 1 < lines.length && lines[i + 1].includes('---');
      const cellTag = isHeaderRow ? 'th' : 'td';
      const rowHtml = `<tr>${cells.map(c => `<${cellTag}>${c}</${cellTag}>`).join('')}</tr>`;
      tableRows.push(rowHtml);
    } else {
      if (inTable) {
        processedLines.push(`<table class="article-table">${tableRows.join('')}</table>`);
        inTable = false;
      }
      processedLines.push(lines[i]);
    }
  }
  if (inTable) {
    processedLines.push(`<table class="article-table">${tableRows.join('')}</table>`);
  }
  formatted = processedLines.join('\n');

  // Unordered Lists (- or *)
  const listLines = formatted.split('\n');
  let inList = false;
  let listItems = [];
  const listProcessed = [];

  for (let i = 0; i < listLines.length; i++) {
    const line = listLines[i];
    const match = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (match) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(`<li>${match[2]}</li>`);
    } else {
      if (inList) {
        listProcessed.push(`<ul>${listItems.join('')}</ul>`);
        inList = false;
      }
      listProcessed.push(line);
    }
  }
  if (inList) {
    listProcessed.push(`<ul>${listItems.join('')}</ul>`);
  }
  formatted = listProcessed.join('\n');

  // Paragraph wrapping (split by double newlines)
  formatted = formatted
    .split(/\n\s*\n/)
    .map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<table') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<hr') ||
        trimmed.startsWith('<!--CODE_BLOCK_PLACEHOLDER')
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .filter(Boolean)
    .join('\n\n');

  // 4. Restore inline code tags
  inlineCodes.forEach((codeHtml, index) => {
    formatted = formatted.replace(`<!--INLINE_CODE_PLACEHOLDER_${index}-->`, codeHtml);
  });

  // 5. Restore code block tags
  codeBlocks.forEach((codeBlockHtml, index) => {
    formatted = formatted.replace(`<!--CODE_BLOCK_PLACEHOLDER_${index}-->`, codeBlockHtml);
  });

  return formatted;
}
