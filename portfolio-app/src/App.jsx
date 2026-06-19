import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectsGrid from './components/ProjectsGrid';
import BlogSection from './components/BlogSection';
import Footer from './components/Footer';
import projects from './content/projects.json';
import Expertise from './components/Expertise';
import { supabase } from './lib/supabaseClient';

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
        </main>

        <Footer />
      </div>
    </Router>
  );
}

// 📖 Dynamic Article Detail View Component
function ArticleReader({ articles, stats, incrementView, toggleLike }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = articles.find(a => a.id === id);

  const [hasLiked, setHasLiked] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (article) {
      // Check local storage to see if the user has already liked this post
      const likedKeys = JSON.parse(localStorage.getItem('liked_articles') || '[]');
      setHasLiked(likedKeys.includes(article.id));

      // Increment view count in session-based non-spam way
      const sessionViewed = sessionStorage.getItem(`viewed_${article.id}`);
      if (!sessionViewed) {
        incrementView(article.id);
        sessionStorage.setItem(`viewed_${article.id}`, 'true');
      }
    }
  }, [article?.id]);

  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 768;
      const isNearBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 380);
      
      // Show floating bar if scrolled past 180px on mobile and NOT near the bottom
      if (window.scrollY > 180 && isMobile && !isNearBottom) {
        setShowFloatingBar(true);
      } else {
        setShowFloatingBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleLikeToggle = async () => {
    if (!article || isUpdating) return;
    setIsUpdating(true);

    const nextLikedState = !hasLiked;
    const success = await toggleLike(article.id, nextLikedState);

    if (success) {
      setHasLiked(nextLikedState);
      const likedKeys = JSON.parse(localStorage.getItem('liked_articles') || '[]');
      if (nextLikedState) {
        if (!likedKeys.includes(article.id)) {
          likedKeys.push(article.id);
        }
      } else {
        const idx = likedKeys.indexOf(article.id);
        if (idx > -1) likedKeys.splice(idx, 1);
      }
      localStorage.setItem('liked_articles', JSON.stringify(likedKeys));
    }
    setIsUpdating(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });
  };

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

  const articleStats = stats[article.id] || { views: 0, likes: 0 };
  const displayViews = articleStats.views || 0;
  const displayLikes = articleStats.likes || 0;

  return (
    <article className="article-reader fade-in" style={{ position: 'relative' }}>
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
          <span className="meta-dot">·</span>
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
          <span className="meta-dot">·</span>
          <span className="article-views" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="lucide lucide-eye"
              style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem' }}
            >
              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>{displayViews} views</span>
          </span>
          <span className="meta-dot">·</span>
          <button 
            className={`like-btn font-mono ${hasLiked ? 'liked' : ''}`}
            onClick={handleLikeToggle}
            disabled={isUpdating}
            title={hasLiked ? "Unlike this post" : "Like this post"}
            style={{ display: 'inline-flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill={hasLiked ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth="2" 
              className="lucide lucide-heart"
              style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem', transition: 'transform 0.15s ease' }}
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span>{displayLikes} likes</span>
          </button>
        </div>
      </header>

      <div 
        className="article-rich-content"
        dangerouslySetInnerHTML={{ 
          __html: formatMarkdown(article.content) 
        }}
      />

      {/* 🌟 End of article feedback card */}
      <div className="article-feedback-card">
        <h3 className="feedback-title">Whoa, you read the whole thing!</h3>
        <p className="feedback-subtitle">If this saved you an AI prompt, click that heart to boost your dev karma.</p>
        
        <div className="feedback-actions">
          <button 
            className={`feedback-btn like-cta ${hasLiked ? 'liked' : ''}`}
            onClick={handleLikeToggle}
            disabled={isUpdating}
            title={hasLiked ? "Unlike this article" : "Like this article"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill={hasLiked ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth="2" 
              className="lucide lucide-heart"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span>{hasLiked ? 'Liked' : 'Like Post'} ({displayLikes})</span>
          </button>

          <button 
            className={`feedback-btn share-cta ${copied ? 'copied' : ''}`}
            onClick={handleShare}
            title="Copy link to clipboard"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="lucide lucide-share2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
          </button>
        </div>

        <div className="feedback-footer">
          <button className="feedback-back-link font-mono" onClick={() => navigate('/blog')}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem' }}
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to writing</span>
          </button>
        </div>
      </div>

      {/* 📱 Scroll-aware mobile floating bottom action bar */}
      <div className={`mobile-floating-bar ${showFloatingBar ? 'visible' : ''}`}>
        <div className="floating-bar-content">
          <div className="floating-bar-info">
            <div className="floating-bar-title">{article.title}</div>
            <div className="floating-bar-meta font-mono">{displayViews} views · {article.readingTime}</div>
          </div>

          <div className="floating-bar-actions">
            <button 
              className={`floating-like-btn ${hasLiked ? 'liked' : ''}`}
              onClick={handleLikeToggle}
              disabled={isUpdating}
              title={hasLiked ? "Unlike this article" : "Like this article"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill={hasLiked ? "currentColor" : "none"} 
                stroke="currentColor" 
                strokeWidth="2" 
                className="lucide lucide-heart"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span>{displayLikes}</span>
            </button>
            
            <button 
              className={`floating-share-btn ${copied ? 'copied' : ''}`}
              onClick={handleShare}
              title="Copy link"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        </div>
      </div>
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
