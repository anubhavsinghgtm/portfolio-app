import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function BlogSection({ articles, limit, stats = {} }) {
  const navigate = useNavigate();
  const { tag: activeTag } = useParams();

  // Filter by tag if we're on a tag route
  const filteredArticles = activeTag
    ? articles.filter(a => a.tags && a.tags.some(t => t.toLowerCase() === activeTag.toLowerCase()))
    : articles;

  const displayArticles = limit ? filteredArticles.slice(0, limit) : filteredArticles;

  // Gather all unique tags across all articles for the tag bar (only on full /blog listing, not on homepage)
  const allTags = !limit
    ? Array.from(new Set(articles.flatMap(a => a.tags || []))).sort()
    : [];

  const handleTagClick = (tag) => {
    navigate(`/blog/tag/${encodeURIComponent(tag)}`);
  };

  const isTagPage = Boolean(activeTag);

  return (
    <section className="fade-in" style={{ marginTop: '5rem', width: '100%' }}>
      <div className="section-header">
        <h2 className="section-title">
          {isTagPage
            ? <><span style={{ color: 'var(--muted-foreground)' }}>Writing /</span> <span style={{ color: 'var(--primary)' }}>#{activeTag}</span></>
            : 'Latest writing'
          }
        </h2>
        {limit && filteredArticles.length > limit && (
          <Link to="/blog" className="section-link font-mono">
            View all posts
          </Link>
        )}
        {isTagPage && (
          <Link to="/blog" className="section-link font-mono">
            ← All posts
          </Link>
        )}
      </div>

      {/* Tag filter bar — only visible on full blog listing */}
      {allTags.length > 0 && (
        <div className="blog-tag-bar">
          {allTags.map(tag => (
            <button
              key={tag}
              className={`blog-tag-pill ${activeTag && activeTag.toLowerCase() === tag.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </button>
          ))}
          {activeTag && (
            <button
              className="blog-tag-pill blog-tag-clear"
              onClick={() => navigate('/blog')}
            >
              ✕ Clear
            </button>
          )}
        </div>
      )}

      <div className="blog-feed">
        {displayArticles.length === 0 ? (
          <div className="blog-empty-state">
            <p className="blog-empty">
              {isTagPage
                ? `No posts tagged with "#${activeTag}" yet.`
                : 'No articles published yet. Stay tuned!'
              }
            </p>
            {isTagPage && (
              <Link to="/blog" className="section-link font-mono" style={{ marginTop: '0.5rem' }}>
                ← Browse all posts
              </Link>
            )}
          </div>
        ) : (
          displayArticles.map((article) => (
            <article key={article.id} className="blog-item">
              <div className="blog-meta">
                <span className="blog-category">{article.category}</span>
                <span className="meta-dot">·</span>
                <span className="blog-date">{article.date}</span>
                <span className="meta-dot">·</span>
                <span className="blog-read-time" style={{ color: 'var(--muted-foreground)' }}>
                  {article.readingTime}
                </span>
                <span className="meta-dot">·</span>
                <span className="blog-views" style={{ color: 'var(--muted-foreground)' }}>
                  {stats[article.id]?.views || 0} views
                </span>
                <span className="meta-dot">·</span>
                <span className="blog-likes" style={{ color: 'var(--muted-foreground)' }}>
                  {stats[article.id]?.likes || 0} likes
                </span>
              </div>
              
              <h3 className="blog-title">
                <Link to={`/blog/${article.id}`}>
                  {article.title}
                </Link>
              </h3>
              
              <p className="blog-excerpt">{article.excerpt}</p>
              
              {/* Tags row */}
              {article.tags && article.tags.length > 0 && (
                <div className="blog-tags-row">
                  {article.tags.map(tag => (
                    <button
                      key={tag}
                      className={`blog-inline-tag ${activeTag && activeTag.toLowerCase() === tag.toLowerCase() ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleTagClick(tag);
                      }}
                      title={`View all posts tagged #${tag}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              <Link 
                to={`/blog/${article.id}`}
                className="blog-read-more font-mono"
                style={{ display: 'inline-flex', alignItems: 'center', marginTop: article.tags && article.tags.length > 0 ? '1rem' : '0' }}
              >
                <span>Read article</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ marginLeft: '0.35rem' }}
                >
                  <path d="M7 7h10v10"></path>
                  <path d="M7 17 17 7"></path>
                </svg>
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
