import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectsGrid from './components/ProjectsGrid';
import BlogSection from './components/BlogSection';
import Footer from './components/Footer';

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
    excerpt: metadata.excerpt || '',
    content: content.trim()
  };
}

// Convert files object into a structured blog articles dataset
const articles = Object.keys(blogFiles).map((path) => {
  const rawContent = blogFiles[path];
  return parseMarkdownPost(rawContent, path);
}).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort chronologically (latest first)

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Scroll to top on tab change or article select
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab, selectedArticle]);

  const projects = [
    {
      id: 'supernova',
      title: 'Supernova API Gateway',
      description: 'A high-performance API gateway engineered in Rust and Actix-Web. Features custom-designed sub-millisecond dynamic rate limiting, token bucket algorithms, and zero-allocation reverse proxying.',
      tags: ['Rust', 'Actix-Web', 'Docker', 'Redis'],
      github: 'https://github.com',
      live: 'https://example.com'
    },
    {
      id: 'omnisearch',
      title: 'Omnisearch Engine',
      description: 'An ultra-fast, distributed full-text search engine built with FastAPI and PostgreSQL. Implements custom lexical scanners, trigram indexes, and rank-ordered BM25 query evaluations.',
      tags: ['FastAPI', 'PostgreSQL', 'Python', 'Elasticsearch'],
      github: 'https://github.com',
      live: 'https://example.com'
    },
    {
      id: 'flowstream',
      title: 'FlowStream Real-time Pipelines',
      description: 'Scalable streaming analytics pipeline processing high-throughput web telemetry. Leverages Apache Spark, Kafka cluster, and AWS S3 data lakes for instant sessionized metrics aggregation.',
      tags: ['Apache Spark', 'Kafka', 'AWS S3', 'Scala'],
      github: 'https://github.com',
      live: ''
    }
  ];

  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
  };

  const handleBackToBlog = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="app-container">
      <Navbar currentTab={currentTab} setCurrentTab={(tab) => {
        setCurrentTab(tab);
        setSelectedArticle(null); // Clear selected article on navigation click
      }} />

      <main className="main-content">
        {selectedArticle ? (
          <article className="article-reader fade-in">
            <button className="article-back-btn font-mono" onClick={handleBackToBlog}>
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
              <div className="article-category">{selectedArticle.category}</div>
              <h1 className="article-title">{selectedArticle.title}</h1>
              <div className="article-meta">
                <span className="article-date">{selectedArticle.date}</span>
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
                  {selectedArticle.readingTime}
                </span>
              </div>
            </header>

            <div 
              className="article-rich-content"
              dangerouslySetInnerHTML={{ 
                __html: formatMarkdown(selectedArticle.content) 
              }}
            />
          </article>
        ) : (
          <>
            {currentTab === 'home' && (
              <>
                <Hero setCurrentTab={setCurrentTab} />
                <ProjectsGrid projects={projects} limit={2} />
                
                <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'flex-start' }}>
                  <button 
                    onClick={() => setCurrentTab('projects')}
                    className="font-mono"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: 0
                    }}
                  >
                    <span>View all projects</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>

                <BlogSection articles={articles} limit={2} onSelectArticle={handleSelectArticle} />
                
                <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'flex-start' }}>
                  <button 
                    onClick={() => setCurrentTab('blog')}
                    className="font-mono"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: 0
                    }}
                  >
                    <span>View all writing</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </>
            )}

            {currentTab === 'projects' && (
              <ProjectsGrid projects={projects} />
            )}

            {currentTab === 'blog' && (
              <BlogSection articles={articles} onSelectArticle={handleSelectArticle} />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
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
