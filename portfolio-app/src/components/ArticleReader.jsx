import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// 📖 Dynamic Article Detail View Component
export default function ArticleReader({ articles, stats, incrementView, toggleLike }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = articles.find(a => a.id === id);

  const contentRef = useRef(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [copied, setCopied] = useState(false);

  // Memoize the HTML object to prevent React from re-rendering the innerHTML and wiping out copy buttons on state updates
  const htmlContent = useMemo(() => {
    if (!article) return { __html: '' };
    return { __html: formatMarkdown(article.content) };
  }, [article?.id, article?.content]);

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

  // 📋 Dynamic Code Block "Copy" Button Injector
  useEffect(() => {
    if (!article || !contentRef.current) return;

    const codeBlocks = contentRef.current.querySelectorAll('pre');
    codeBlocks.forEach((block) => {
      // Prevent duplicate buttons if this effect runs multiple times
      if (block.querySelector('.copy-code-btn')) {
        return;
      }

      // Create copy button
      const button = document.createElement('button');
      button.className = 'copy-code-btn';
      button.type = 'button';
      button.title = 'Copy code to clipboard';
      
      // Use inline SVG for double-square copy icon
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="copy-icon">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
        <span class="copy-text">Copy</span>
      `;
      
      button.addEventListener('click', () => {
        const codeElement = block.querySelector('code');
        if (!codeElement) return;

        // Copy raw text content (ensuring HTML entities are decoded correctly by innerText)
        const codeText = codeElement.innerText;
        
        navigator.clipboard.writeText(codeText)
          .then(() => {
            button.classList.add('copied');
            const textSpan = button.querySelector('.copy-text');
            if (textSpan) textSpan.textContent = 'Copied!';
            
            const svgElement = button.querySelector('svg');
            if (svgElement) {
              svgElement.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>'; // Checkmark icon
            }
            
            setTimeout(() => {
              button.classList.remove('copied');
              if (textSpan) textSpan.textContent = 'Copy';
              if (svgElement) {
                svgElement.innerHTML = `
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                `;
              }
            }, 2000);
          })
          .catch((err) => {
            console.error('Failed to copy code block content: ', err);
          });
      });

      block.appendChild(button);
    });
  }); // Run on every render to ensure copy buttons are restored if React's reconciliation wipes them out

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
    const url = `https://anubhavsinghgtm.com/blog/${article.id}`;
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
        ref={contentRef}
        className="article-rich-content"
        dangerouslySetInnerHTML={htmlContent}
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
