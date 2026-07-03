import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Mock dataset for Fluxora Sandbox
const MOCK_PROJECTS = [
  { id: 1, title: 'Fluxora', tags: 'FastAPI, PostgreSQL, Gemini, Streamlit', github: 'github.com/anubhavsinghgtm/fluxora' },
  { id: 2, title: 'PULSE', tags: 'Python, PyTorch, NLSTM, Transformers, LIME', github: 'github.com/anubhavsinghgtm/pulse' },
  { id: 3, title: 'Aayronix Hub', tags: 'Astro, CSS, React, JavaScript', github: 'github.com/anubhavsinghgtm' }
];

const MOCK_SKILLS = [
  { name: 'FastAPI', category: 'Backend & APIs', rating: 95 },
  { name: 'Python', category: 'Languages', rating: 94 },
  { name: 'Generative AI', category: 'AI & ML', rating: 92 },
  { name: 'PostgreSQL', category: 'Databases', rating: 92 },
  { name: 'PyTorch', category: 'AI & ML', rating: 88 },
  { name: 'Astro', category: 'Web Architecture', rating: 86 }
];

export default function ProjectSandbox() {
  const location = useLocation();
  const sandboxRef = useRef(null);
  const [subTab, setSubTab] = useState('fluxora'); // 'fluxora' | 'pulse'

  useEffect(() => {
    if (location.state?.activeSandbox) {
      const target = location.state.activeSandbox;
      setSubTab(target);
      
      const timer = setTimeout(() => {
        if (sandboxRef.current) {
          sandboxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);

      // Clear the router state to avoid re-triggering the scroll effect on future component updates
      window.history.replaceState({}, document.title);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Fluxora Sandbox state
  const [fluxoraInput, setFluxoraInput] = useState('Find all projects tagged with Gemini');
  const [fluxoraSQL, setFluxoraSQL] = useState('');
  const [fluxoraResults, setFluxoraResults] = useState(null);
  const [fluxoraInsight, setFluxoraInsight] = useState('');
  const [isFluxoraRunning, setIsFluxoraRunning] = useState(false);

  // PULSE Sandbox state
  const [pulseInput, setPulseInput] = useState('Worried about the long term side effects of this new vaccine. It was rushed and there is no explainable data yet.');
  const [selectedPreset, setSelectedPreset] = useState('rushed');
  const [pulseResults, setPulseResults] = useState(null);
  const [isPulseRunning, setIsPulseRunning] = useState(false);

  // Fluxora Sandbox Execution Logic
  const handleFluxoraRun = async (prompt) => {
    if (isFluxoraRunning) return;
    setIsFluxoraRunning(true);
    setFluxoraSQL('');
    setFluxoraResults(null);
    setFluxoraInsight('');

    await new Promise((r) => setTimeout(r, 650));

    const cleanPrompt = prompt.toLowerCase();
    let querySQL = '';
    let resultsData = [];
    let insightStr = '';

    if (cleanPrompt.includes('gemini') || cleanPrompt.includes('projects')) {
      querySQL = "SELECT title, tags, github FROM projects WHERE tags @> ARRAY['Gemini'];";
      resultsData = MOCK_PROJECTS.filter(p => p.tags.includes('Gemini'));
      insightStr = `Found 2 matching projects: 'Fluxora' (an AI-powered SQL generator) and 'PULSE' (an explainable deep NLP sentiment classifier). Both utilize Gemini or advanced NLP layers.`;
    } else if (cleanPrompt.includes('skills') || cleanPrompt.includes('rating') || cleanPrompt.includes('above 90')) {
      querySQL = "SELECT name, category, rating FROM skills WHERE rating > 90 ORDER BY rating DESC;";
      resultsData = MOCK_SKILLS.filter(s => s.rating > 90);
      insightStr = `Found 4 core skills matching rating > 90%: FastAPI (95%), Python (94%), Generative AI (92%), and PostgreSQL (92%).`;
    } else if (cleanPrompt.includes('fastapi') || cleanPrompt.includes('backend')) {
      querySQL = "SELECT title, github FROM projects WHERE tags @> ARRAY['FastAPI'];";
      resultsData = MOCK_PROJECTS.filter(p => p.tags.includes('FastAPI')).map(p => ({ title: p.title, github: p.github }));
      insightStr = `Found 1 backend project built with FastAPI: 'Fluxora' (Anubhav's flagship SQL analytics platform).`;
    } else {
      querySQL = `SELECT title, tags FROM projects WHERE title ILIKE '%${prompt.replace(/'/g, "''")}%';`;
      resultsData = MOCK_PROJECTS.filter(p => p.title.toLowerCase().includes(cleanPrompt)).map(p => ({ title: p.title, tags: p.tags }));
      insightStr = `Retrieved ${resultsData.length} database entries matching keyword filter '${prompt}'.`;
    }

    setFluxoraSQL(querySQL);
    setFluxoraResults(resultsData);
    setFluxoraInsight(insightStr);
    setIsFluxoraRunning(false);
  };

  // PULSE Classifier Sandbox Execution Logic
  const handlePulseRun = async (text) => {
    if (isPulseRunning) return;
    setIsPulseRunning(true);
    setPulseResults(null);

    await new Promise((r) => setTimeout(r, 1200));

    let labels = [];
    let wordsMapping = [];
    const textLower = text.toLowerCase();

    if (textLower.includes('worried') || textLower.includes('side effects') || textLower.includes('rushed')) {
      labels = [
        { name: 'Apprehensive / Hesitant', val: 88 },
        { name: 'Transparency Concern', val: 75 },
        { name: 'Pro-Vaccine / Acceptance', val: 12 }
      ];
      wordsMapping = [
        { word: 'Worried', weight: 'hesitant' },
        { word: 'about', weight: 'neutral' },
        { word: 'the', weight: 'neutral' },
        { word: 'long', weight: 'neutral' },
        { word: 'term', weight: 'neutral' },
        { word: 'side', weight: 'hesitant' },
        { word: 'effects', weight: 'hesitant' },
        { word: 'of', weight: 'neutral' },
        { word: 'this', weight: 'neutral' },
        { word: 'new', weight: 'neutral' },
        { word: 'vaccine.', weight: 'neutral' },
        { word: 'It', weight: 'neutral' },
        { word: 'was', weight: 'neutral' },
        { word: 'rushed', weight: 'hesitant' },
        { word: 'and', weight: 'neutral' },
        { word: 'there', weight: 'neutral' },
        { word: 'is', weight: 'neutral' },
        { word: 'no', weight: 'neutral' },
        { word: 'explainable', weight: 'neutral' },
        { word: 'data', weight: 'neutral' },
        { word: 'yet.', weight: 'neutral' }
      ];
    } else if (textLower.includes('booster') || textLower.includes('protecting') || textLower.includes('safe')) {
      labels = [
        { name: 'Pro-Vaccine / Acceptance', val: 94 },
        { name: 'Apprehensive / Hesitant', val: 8 },
        { name: 'Conspiracy / Disbelief', val: 3 }
      ];
      wordsMapping = [
        { word: 'Highly', weight: 'neutral' },
        { word: 'recommend', weight: 'neutral' },
        { word: 'getting', weight: 'neutral' },
        { word: 'the', weight: 'neutral' },
        { word: 'booster.', weight: 'neutral' },
        { word: 'Sore', weight: 'neutral' },
        { word: 'arm', weight: 'neutral' },
        { word: 'but', weight: 'neutral' },
        { word: 'fully', weight: 'neutral' },
        { word: 'worth', weight: 'neutral' },
        { word: 'protecting', weight: 'neutral' },
        { word: 'my', weight: 'neutral' },
        { word: 'family!', weight: 'neutral' }
      ];
    } else if (textLower.includes('profits') || textLower.includes('corporate') || textLower.includes('pfizer')) {
      labels = [
        { name: 'Conspiracy / Profit-Driven', val: 82 },
        { name: 'Apprehensive / Hesitant', val: 54 },
        { name: 'Pro-Vaccine / Acceptance', val: 5 }
      ];
      wordsMapping = [
        { word: 'Pfizer', weight: 'promotional' },
        { word: 'shares', weight: 'neutral' },
        { word: 'are', weight: 'neutral' },
        { word: 'soaring', weight: 'neutral' },
        { word: 'right', weight: 'neutral' },
        { word: 'now.', weight: 'neutral' },
        { word: 'It\'s', weight: 'neutral' },
        { word: 'all', weight: 'neutral' },
        { word: 'about', weight: 'neutral' },
        { word: 'corporate', weight: 'promotional' },
        { word: 'profits,', weight: 'promotional' },
        { word: 'they', weight: 'neutral' },
        { word: 'don\'t', weight: 'neutral' },
        { word: 'care', weight: 'neutral' },
        { word: 'about', weight: 'neutral' },
        { word: 'health.', weight: 'neutral' }
      ];
    } else {
      labels = [
        { name: 'Neutral / General', val: 80 },
        { name: 'Apprehensive / Hesitant', val: 10 }
      ];
      wordsMapping = text.split(' ').map((word) => ({ word, weight: 'neutral' }));
    }

    setPulseResults({ labels, wordsMapping });
    setIsPulseRunning(false);
  };

  // Preset switch triggers
  const handlePresetSwitch = (presetType) => {
    setSelectedPreset(presetType);
    let statement = '';
    if (presetType === 'rushed') {
      statement = 'Worried about the long term side effects of this new vaccine. It was rushed and there is no explainable data yet.';
    } else if (presetType === 'family') {
      statement = 'Highly recommend getting the booster. Sore arm for a day but fully worth protecting my family!';
    } else if (presetType === 'profits') {
      statement = 'Pfizer shares are soaring right now. It\'s all about corporate profits, they don\'t care about health.';
    }
    setPulseInput(statement);
    setPulseResults(null);
  };

  // Preset SQL tags switcher
  const handleFluxoraTagSelect = (tagText) => {
    setFluxoraInput(tagText);
    setFluxoraSQL('');
    setFluxoraResults(null);
  };

  return (
    <section ref={sandboxRef} className="sandbox-hub-section fade-in" style={{ marginTop: '5rem' }}>
      <div className="section-header">
        <h2 className="section-title">Live Playgrounds</h2>
      </div>

      <div className="sandbox-card" style={{ width: '100%' }}>
        <div className="sandbox-card-header">
          <h3 className="sandbox-card-title">🔬 Project Sandbox</h3>
          <p className="sandbox-card-subtitle">
            Test-drive interactive modules from my AI and backend implementations.
          </p>
        </div>

        {/* Tab segmented switch */}
        <div className="sandbox-segmented-tabs">
          <button
            onClick={() => setSubTab('fluxora')}
            className={`sandbox-tab-option ${subTab === 'fluxora' ? 'active' : ''}`}
          >
            ⚡ Fluxora (SQL Generator)
          </button>
          <button
            onClick={() => setSubTab('pulse')}
            className={`sandbox-tab-option ${subTab === 'pulse' ? 'active' : ''}`}
          >
            🧠 PULSE (NLP Classifier)
          </button>
        </div>

        <div className="sandbox-tab-content-area">
          {/* FLUXORA PLAYGROUND */}
          {subTab === 'fluxora' && (
            <>
              {/* Project External Links */}
              <div className="sandbox-project-links">
                <span className="sandbox-links-label">Project Details:</span>
                <a href="https://anubhav-fluxora.streamlit.app/" target="_blank" rel="noopener noreferrer" className="sandbox-external-link">
                  🌐 Live Application ↗
                </a>
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>&middot;</span>
                <a href="https://github.com/anubhavsinghgtm/fluxora" target="_blank" rel="noopener noreferrer" className="sandbox-external-link">
                  📁 Source Code ↗
                </a>
              </div>
              <div className="fluxora-grid-view">
              <div className="fluxora-schema-panel">
                <div className="schema-entity">
                  <span className="schema-entity-name">📁 projects</span>
                  <div className="schema-field-list">
                    <span className="schema-field-item">title<span className="schema-field-type">TEXT</span></span>
                    <span className="schema-field-item">tags<span className="schema-field-type">TEXT[]</span></span>
                    <span className="schema-field-item">github<span className="schema-field-type">TEXT</span></span>
                  </div>
                </div>
                <div className="schema-entity">
                  <span className="schema-entity-name">📁 skills</span>
                  <div className="schema-field-list">
                    <span className="schema-field-item">name<span className="schema-field-type">TEXT</span></span>
                    <span className="schema-field-item">category<span className="schema-field-type">TEXT</span></span>
                    <span className="schema-field-item">rating<span className="schema-field-type">INT</span></span>
                  </div>
                </div>
              </div>

              <div className="fluxora-compiler-panel">
                <div className="fluxora-composer">
                  <span className="composer-label">Natural Language English Command:</span>
                  <div className="composer-chips">
                    <button
                      onClick={() => handleFluxoraTagSelect('Find all projects tagged with Gemini')}
                      className="composer-preset-chip"
                    >
                      Gemini projects
                    </button>
                    <button
                      onClick={() => handleFluxoraTagSelect('List the top 3 skills with rating above 90')}
                      className="composer-preset-chip"
                    >
                      Top rated skills
                    </button>
                    <button
                      onClick={() => handleFluxoraTagSelect('Select all backend projects developed using FastAPI')}
                      className="composer-preset-chip"
                    >
                      FastAPI backends
                    </button>
                  </div>

                  <div className="composer-input-row">
                    <input
                      type="text"
                      value={fluxoraInput}
                      onChange={(e) => setFluxoraInput(e.target.value)}
                      className="composer-text-input"
                      placeholder="Type database query request..."
                      disabled={isFluxoraRunning}
                    />
                    <button
                      onClick={() => handleFluxoraRun(fluxoraInput)}
                      className="composer-compile-btn"
                      disabled={isFluxoraRunning}
                    >
                      {isFluxoraRunning ? 'Run' : 'Run'}
                    </button>
                  </div>
                </div>

                {isFluxoraRunning && (
                  <div className="pulse-loader-spinner-box">
                    <div className="pulse-mini-spinner"></div>
                    <span className="pulse-loader-text-val">Parsing metadata schema...</span>
                  </div>
                )}

                {!isFluxoraRunning && fluxoraInsight && (
                  <div className="sandbox-insight-panel" style={{ animation: 'fadeIn 0.3s ease forwards' }}>
                    <div className="insight-header">ℹ️ Query Results Summary</div>
                    <p className="insight-text">{fluxoraInsight}</p>
                  </div>
                )}

                {!isFluxoraRunning && fluxoraSQL && (
                  <div className="sandbox-sql-card" style={{ animation: 'fadeIn 0.3s ease forwards' }}>
                    <div className="sql-card-header">Generated SQL Code</div>
                    <code className="sql-code-block">
                      <span className="keyword">SELECT</span>{' '}
                      {fluxoraSQL.includes('projects') ? (
                        <>
                          <span className="ident">title</span>, <span className="ident">tags</span>, <span className="ident">github</span> <span className="keyword">FROM</span> <span className="ident">projects</span>
                        </>
                      ) : (
                        <>
                          <span className="ident">name</span>, <span className="ident">category</span>, <span className="ident">rating</span> <span className="keyword">FROM</span> <span className="ident">skills</span>
                        </>
                      )}
                      <br />
                      <span className="keyword">WHERE</span>{' '}
                      {fluxoraSQL.includes('Gemini') && (
                        <>
                          <span className="ident">tags</span> @&gt; <span className="keyword">ARRAY</span>[<span className="string">'Gemini'</span>];
                        </>
                      )}
                      {fluxoraSQL.includes('FastAPI') && (
                        <>
                          <span className="ident">tags</span> @&gt; <span className="keyword">ARRAY</span>[<span className="string">'FastAPI'</span>];
                        </>
                      )}
                      {fluxoraSQL.includes('90') && (
                        <>
                          <span className="ident">rating</span> &gt; <span className="string">90</span> <span className="keyword">ORDER BY</span> <span className="ident">rating</span> <span className="keyword">DESC</span>;
                        </>
                      )}
                      {!fluxoraSQL.includes('Gemini') && !fluxoraSQL.includes('FastAPI') && !fluxoraSQL.includes('90') && (
                        <>
                          <span className="ident">title</span> <span className="keyword">ILIKE</span> <span className="string">'%custom%'</span>;
                        </>
                      )}
                    </code>
                  </div>
                )}

                {!isFluxoraRunning && fluxoraResults && (
                  <div className="sandbox-table-wrapper" style={{ animation: 'fadeIn 0.3s ease forwards' }}>
                    <table className="sandbox-grid-table">
                      <thead>
                        <tr>
                          {Object.keys(fluxoraResults[0] || {}).map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {fluxoraResults.map((row, idx) => (
                          <tr key={idx}>
                            {Object.values(row).map((val, cellIdx) => (
                              <td key={cellIdx}>{val.toString()}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

          {/* PULSE PLAYGROUND */}
          {subTab === 'pulse' && (
            <>
              {/* Project External Links */}
              <div className="sandbox-project-links">
                <span className="sandbox-links-label">Project Details:</span>
                <a href="https://github.com/anubhavsinghgtm/pulse" target="_blank" rel="noopener noreferrer" className="sandbox-external-link">
                  📁 Source Code ↗
                </a>
              </div>
              <div className="pulse-workspace">
              <p className="pulse-summary-text">
                Analyzes narratives using a multi-label deep classifier (Nested LSTM / XLM-RoBERTa) and provides LIME explanation contribution heatmaps.
              </p>

              <div className="pulse-presets-group">
                <div className="pulse-presets-pills">
                  <button
                    onClick={() => handlePresetSwitch('rushed')}
                    className={`pulse-preset-pill-btn ${selectedPreset === 'rushed' ? 'active' : ''}`}
                  >
                    📝 Rushed: "Worried about long term side effects, vaccine rushed..."
                  </button>
                  <button
                    onClick={() => handlePresetSwitch('family')}
                    className={`pulse-preset-pill-btn ${selectedPreset === 'family' ? 'active' : ''}`}
                  >
                    📝 Protect: "Highly recommend booster, fully worth protecting family!"
                  </button>
                  <button
                    onClick={() => handlePresetSwitch('profits')}
                    className={`pulse-preset-pill-btn ${selectedPreset === 'profits' ? 'active' : ''}`}
                  >
                    📝 Profit: "Pfizer shares soaring, all about corporate profits..."
                  </button>
                </div>
              </div>

              <div className="pulse-input-row">
                <textarea
                  value={pulseInput}
                  onChange={(e) => setPulseInput(e.target.value)}
                  className="pulse-text-area"
                  placeholder="Input statement narrative..."
                  disabled={isPulseRunning}
                />
                <button
                  onClick={() => handlePulseRun(pulseInput)}
                  className="pulse-run-button"
                  disabled={isPulseRunning}
                >
                  {isPulseRunning ? 'Analyze' : 'Analyze'}
                </button>
              </div>

              {isPulseRunning && (
                <div className="pulse-loader-spinner-box">
                  <div className="pulse-mini-spinner"></div>
                  <span className="pulse-loader-text-val">Running LSTM classifications...</span>
                </div>
              )}

              {!isPulseRunning && pulseResults && (
                <div className="pulse-interactive-results">
                  <div className="pulse-gauges-panel">
                    <div className="pulse-panel-label">Classifications</div>
                    {pulseResults.labels.map((lbl, idx) => (
                      <div key={idx} className="pulse-metric-gauge">
                        <div className="metric-gauge-head">
                          <span className="metric-gauge-title">{lbl.name}</span>
                          <span className="metric-gauge-value">{lbl.val}%</span>
                        </div>
                        <div className="metric-gauge-track">
                          <div className="metric-gauge-fill" style={{ width: `${lbl.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pulse-lime-panel">
                    <div className="lime-panel-title">LIME Word Importance</div>
                    <div className="lime-pills-container">
                      {pulseResults.wordsMapping.map((wordObj, idx) => {
                        let weightClass = 'neutral';
                        if (wordObj.weight === 'hesitant') weightClass = 'hesitant';
                        if (wordObj.weight === 'promotional') weightClass = 'promotional';
                        
                        return (
                          <span key={idx} className={`lime-word ${weightClass}`}>
                            {wordObj.word}
                          </span>
                        );
                      })}
                    </div>
                    <div className="lime-pills-legend">
                      <span>🔴 Hesitancy Trigger</span>
                      <span>🟡 Profit/Corporate Vibe</span>
                      <span>🟢 Neutral/Acceptance</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </section>
  );
}
