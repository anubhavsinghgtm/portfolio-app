import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import projects from './content/projects.json';
import Expertise from './components/Expertise';
import { supabase } from './lib/supabaseClient';

// Lazy-loaded routes/components to optimize initial bundle delivery
const ProjectsGrid = lazy(() => import('./components/ProjectsGrid'));
const BlogSection = lazy(() => import('./components/BlogSection'));
const ArticleReader = lazy(() => import('./components/ArticleReader'));

// Dynamic Glob Import to dynamically resolve and fetch raw content of local Markdown files inside src/content/blog/ (including subdirectories)
const blogFiles = import.meta.glob('/src/content/blog/**/*.md', { query: '?raw', import: 'default', eager: true });

// Helper to calculate reading time dynamically based on word count (avg 200 WPM)
function calculateReadingTime(content) {
  if (!content) return '1 min read';
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

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
      readingTime: calculateReadingTime(rawText),
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
    readingTime: metadata.readingTime || calculateReadingTime(content),
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

  useEffect(() => {
    // 1. Scroll browser window to the top on every route navigation
    window.scrollTo(0, 0);

    // 2. Default standard SEO meta fallbacks
    let title = "Anubhav Singh — AI & Backend Engineer";
    let description = "I engineer AI-powered analytics platforms and deep learning classification systems — orchestrating custom LLM flows with Gemini, FastAPI, and Astro.";
    let pageType = "website";
    let datePublished = null;

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
        pageType = "article";
        if (article.date) {
          try {
            const parsedDate = new Date(article.date);
            if (!isNaN(parsedDate.getTime())) {
              datePublished = parsedDate.toISOString().split('T')[0];
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }

    const pageUrl = `https://anubhavsinghgtm.com${pathname}`;
    const defaultOgImage = "https://anubhavsinghgtm.com/og-image.png";

    // 4. Inject dynamically resolved tags directly into HTML head
    document.title = title;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', pageUrl);

    // Open Graph Tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:url': pageUrl,
      'og:type': pageType,
      'og:image': defaultOgImage
    };
    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Twitter Tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:url': pageUrl,
      'twitter:image': defaultOgImage
    };
    Object.entries(twitterTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Dynamic JSON-LD Schema
    let jsonLdScript = document.getElementById('json-ld-seo');
    if (jsonLdScript) {
      jsonLdScript.remove(); // Clean up existing tag to prevent duplicate schemas
    }
    jsonLdScript = document.createElement('script');
    jsonLdScript.id = 'json-ld-seo';
    jsonLdScript.type = 'application/ld+json';

    let schema = {};
    if (pageType === 'article') {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': title,
        'description': description,
        'image': defaultOgImage,
        'datePublished': datePublished || new Date().toISOString().split('T')[0],
        'author': {
          '@type': 'Person',
          'name': 'Anubhav Singh',
          'url': 'https://anubhavsinghgtm.com'
        },
        'publisher': {
          '@type': 'Person',
          'name': 'Anubhav Singh'
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': pageUrl
        }
      };
    } else {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': 'Anubhav Singh',
        'jobTitle': 'AI & Backend Engineer',
        'url': 'https://anubhavsinghgtm.com',
        'sameAs': [
          'https://github.com/anubhavsinghgtm',
          'https://www.linkedin.com/in/anubhavsinghgtm/'
        ],
        'knowsAbout': [
          'Artificial Intelligence',
          'Backend Engineering',
          'LLMs',
          'PostgreSQL',
          'FastAPI',
          'Vite',
          'React'
        ]
      };
    }
    jsonLdScript.text = JSON.stringify(schema);
    document.head.appendChild(jsonLdScript);

    // 5. Send pageview configuration to Google Analytics 4
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId && typeof window.gtag === 'function') {
      window.gtag('config', gaId, {
        page_path: pathname,
        page_location: window.location.href,
        page_title: title
      });
    }
  }, [pathname, articles]);

  return null;
}

export default function App() {
  // Filter out draft projects so only published projects appear on the live site
  const activeProjects = projects.filter(project => project.draft !== true);

  const [blogStats, setBlogStats] = useState({}); // { [articleId]: { views: 0, likes: 0 } }

  // Fetch all stats on mount
  useEffect(() => {
    async function fetchStats() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase.from('blog_stats').select('*');
        if (!error && data) {
          const statsMap = {};
          data.forEach(item => {
            statsMap[item.id] = { views: item.views, likes: item.likes };
          });
          setBlogStats(statsMap);
        }
      } catch (err) {
        console.error('Failed to fetch blog stats from Supabase:', err);
      }
    }
    fetchStats();
  }, []);

  // Secure functions to increment views and likes
  const incrementView = async (articleId) => {
    if (!supabase) {
      // Fallback: local storage offline demo view increment
      const localViews = parseInt(localStorage.getItem(`view_count_${articleId}`) || '0', 10) + 1;
      localStorage.setItem(`view_count_${articleId}`, localViews.toString());
      setBlogStats(prev => ({
        ...prev,
        [articleId]: {
          views: localViews,
          likes: prev[articleId]?.likes || 0
        }
      }));
      return;
    }

    try {
      const { error } = await supabase.rpc('increment_views', { article_id: articleId });
      if (!error) {
        setBlogStats(prev => ({
          ...prev,
          [articleId]: {
            ...prev[articleId],
            views: (prev[articleId]?.views || 0) + 1
          }
        }));
      } else {
        console.error('Error calling increment_views RPC:', error);
      }
    } catch (err) {
      console.error('Failed to increment view count:', err);
    }
  };

  const toggleLike = async (articleId, shouldLike) => {
    if (!supabase) {
      // Fallback: local storage offline demo like increment
      const localLikes = Math.max(0, parseInt(localStorage.getItem(`like_count_${articleId}`) || '0', 10) + (shouldLike ? 1 : -1));
      localStorage.setItem(`like_count_${articleId}`, localLikes.toString());
      setBlogStats(prev => ({
        ...prev,
        [articleId]: {
          views: prev[articleId]?.views || 0,
          likes: localLikes
        }
      }));
      return true;
    }

    try {
      const rpcName = shouldLike ? 'increment_likes' : 'decrement_likes';
      const { error } = await supabase.rpc(rpcName, { article_id: articleId });
      if (!error) {
        setBlogStats(prev => ({
          ...prev,
          [articleId]: {
            ...prev[articleId],
            likes: Math.max(0, (prev[articleId]?.likes || 0) + (shouldLike ? 1 : -1))
          }
        }));
        return true;
      } else {
        console.error(`Error calling ${rpcName} RPC:`, error);
      }
    } catch (err) {
      console.error('Failed to toggle like count:', err);
    }
    return false;
  };

  return (
    <Router>
      <ScrollToTopAndSEO articles={articles} />
      <div className="app-container">
        <Navbar />

        <main className="main-content">
          <Suspense fallback={
            <div className="page-loader">
              <div className="loader-spinner"></div>
              <div className="loader-text">Loading...</div>
            </div>
          }>
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

                  <BlogSection articles={articles} stats={blogStats} limit={3} />
                  
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
              <Route path="/blog" element={<BlogSection articles={articles} stats={blogStats} />} />

              {/* Dynamic Blog Article Reading Route */}
              <Route path="/blog/:id" element={
                <ArticleReader 
                  articles={articles} 
                  stats={blogStats} 
                  incrementView={incrementView} 
                  toggleLike={toggleLike} 
                />
              } />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
