(function () {
  var app = document.getElementById('app');
  var archiveFilter = 'All';
  var articles = [];
  var contributors = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtDate(d) {
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch (e) { return d; }
  }

  function topicClass(topic) {
    return topic === 'Cardiology' ? 'cardio' : 'neuro';
  }

  function byline(a) {
    return '<span class="name">' + esc(a.author) + '</span> · ' + fmtDate(a.publishedDate) + (a.readTime ? ' · ' + esc(a.readTime) : '');
  }

  function articleTeaser(a) {
    return (
      '<li>' +
        '<div class="a-title"><a href="#/article/' + esc(a.slug) + '">' + esc(a.title) + '</a></div>' +
        '<div class="a-meta">' + byline(a) + ' · ' + esc(a.topic) + '</div>' +
        '<div class="a-summary">' + esc(a.aiSummary || '') + '</div>' +
      '</li>'
    );
  }

  function renderArticleBody(a) {
    var paragraphs = a.content.map(function (p) {
      var isSubhead = p.length < 70 && !/[.!?]$/.test(p.trim());
      return '<p' + (isSubhead ? ' class="subhead"' : '') + '>' + esc(p) + '</p>';
    }).join('');
    var sources = (a.sources || []).map(function (s) {
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + ' ↗</a>';
    }).join('');
    return (
      '<span class="badge-topic ' + topicClass(a.topic) + '">' + esc(a.topic) + '</span>' +
      '<h2 class="page-title">' + esc(a.title) + '</h2>' +
      '<div class="meta-row">By ' + byline(a) + '</div>' +
      (a.aiSummary ? '<div class="ai-summary"><div class="label">AI Quick Summary</div><p>' + esc(a.aiSummary) + '</p></div>' : '') +
      '<div class="article-body">' + paragraphs + '</div>' +
      (sources ? '<div class="sources-list"><div class="label">Sources</div>' + sources + '</div>' : '')
    );
  }

  function renderHome() {
    if (!articles.length) {
      app.innerHTML = '<h2 class="page-title">No articles yet</h2><p>Check back soon for the first issue.</p>';
      return;
    }
    var latest = articles[0];
    var recent = articles.slice(1, 7).map(articleTeaser).join('');
    app.innerHTML =
      '<div class="home-hero">' +
        '<span class="badge-topic ' + topicClass(latest.topic) + '">' + esc(latest.topic) + '</span>' +
        '<h2>' + esc(latest.title) + '</h2>' +
        '<div class="meta-row">By ' + byline(latest) + '</div>' +
        (latest.aiSummary ? '<p class="summary">' + esc(latest.aiSummary) + '</p>' : '') +
        '<a class="btn" href="#/article/' + esc(latest.slug) + '">Read the full article →</a>' +
      '</div>' +
      (recent ? '<h3 style="font-family: var(--serif); font-size: 18px; margin-bottom: 6px;">More from MedIntel</h3><ul class="article-list">' + recent + '</ul>' : '') +
      '<p style="margin-top:18px;"><a href="#/archive">Browse the full archive →</a></p>';
  }

  function renderArticle(slug) {
    var a = articles.filter(function (x) { return x.slug === slug; })[0];
    if (!a) {
      app.innerHTML = '<h2 class="page-title">Article not found</h2><p><a href="#/">Back to Home</a></p>';
      return;
    }
    app.innerHTML = renderArticleBody(a);
  }

  function renderArchive() {
    var topics = ['All'].concat(articles.map(function (a) { return a.topic; }).filter(function (t, i, arr) { return arr.indexOf(t) === i; }));
    var filtered = archiveFilter === 'All' ? articles : articles.filter(function (a) { return a.topic === archiveFilter; });
    var filterBtns = topics.map(function (t) {
      return '<button class="filter-btn' + (t === archiveFilter ? ' active' : '') + '" data-topic="' + esc(t) + '">' + esc(t) + '</button>';
    }).join('');
    var items = filtered.length ? filtered.map(articleTeaser).join('') : '<p>No articles in this category yet.</p>';
    app.innerHTML =
      '<div class="eyebrow">Archive</div>' +
      '<h2 class="page-title">Every article</h2>' +
      '<div class="filter-row">' + filterBtns + '</div>' +
      '<ul class="article-list">' + items + '</ul>';
    var btns = app.querySelectorAll('.filter-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function (e) {
        archiveFilter = e.currentTarget.getAttribute('data-topic');
        renderArchive();
      });
    }
  }

  function renderAbout() {
    var contributorItems = contributors.length
      ? contributors.map(function (c) {
          return (
            '<li>' +
              '<div class="c-name">' + esc(c.name) + '</div>' +
              '<div class="c-role">' + esc(c.role) + '</div>' +
              (c.bio ? '<div class="c-bio">' + esc(c.bio) + '</div>' : '') +
            '</li>'
          );
        }).join('')
      : '<li><div class="c-bio">Contributor bios will appear here once added.</div></li>';

    app.innerHTML =
      '<div class="eyebrow">About</div>' +
      '<h2 class="page-title">Our Mission</h2>' +
      '<div class="about-content">' +
        '<p>Our team is dedicated to providing a weekly digest of notable developments in medical and scientific research. We cover clinical trials, drug approvals, public-health surveillance, and developments in medical technology.</p>' +
        '<h3>How stories are selected</h3>' +
        '<p>Each week, our contributors find reputable primary and secondary sources (regulatory agencies like the FDA and CDC, peer-reviewed journals, and major research institutions, and established science journalism).</p>' +
        '<p>We feature original articles written by contributors. Each student writes and submits a draft, which is reviewed by the MedIntel editorial team before publishing. These pieces reflect each writer’s own research and perspective and are clearly bylined as student-authored.</p>' +
        '<h3>Our contributors</h3>' +
        '<ul class="contributor-list">' + contributorItems + '</ul>' +
        '<h3>Sourcing</h3>' +
        '<p>Every story links to the sources it was built from so you can read the original reporting or research yourself.</p>' +
        '<div class="disclaimer"><strong>Not medical advice.</strong> MedIntel is an educational publication. Nothing here provides individualized medical advice, and nothing here should be used to start, stop, or change any medication or treatment. Talk to a qualified healthcare provider about your own health.</div>' +
      '</div>';
  }

  function setActiveNav(route) {
    var links = document.querySelectorAll('#main-nav a');
    for (var i = 0; i < links.length; i++) {
      var r = links[i].getAttribute('data-route');
      var isActive = route === r || (route.indexOf('/article/') === 0 && r === '/');
      links[i].classList.toggle('active', isActive);
    }
  }

  function router() {
    var hash = location.hash.replace(/^#/, '') || '/';
    window.scrollTo(0, 0);
    if (hash === '/') { renderHome(); setActiveNav('/'); }
    else if (hash === '/archive') { renderArchive(); setActiveNav('/archive'); }
    else if (hash === '/about') { renderAbout(); setActiveNav('/about'); }
    else if (hash.indexOf('/article/') === 0) { renderArticle(hash.replace('/article/', '')); setActiveNav(hash); }
    else { renderHome(); setActiveNav('/'); }
  }

  // Content lives in data.json, loaded at runtime. To publish a new article,
  // edit/add to data.json only — this file and index.html never need to change.
  app.innerHTML = '<p class="loading-note">Loading articles…</p>';
  fetch('./data.json', { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (DATA) {
      articles = (DATA.articles || []).slice().sort(function (a, b) { return a.publishedDate < b.publishedDate ? 1 : -1; });
      contributors = DATA.contributors || [];
      window.addEventListener('hashchange', router);
      router();
    })
    .catch(function (err) {
      app.innerHTML = '<h2 class="page-title">Unable to load articles</h2><p>Could not load data.json: ' + esc(err.message) + '</p>';
    });
})();
