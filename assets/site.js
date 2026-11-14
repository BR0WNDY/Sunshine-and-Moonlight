(function(){
  var lang = localStorage.getItem('site:lang') || 'en';

  function applyLang(){
    document.documentElement.lang = lang;
    document.documentElement.classList.toggle('lang-th', lang === 'th');
    document.querySelectorAll('[data-en]').forEach(function(el){
      var t = el.getAttribute('data-' + lang);
      if(t !== null) el.textContent = t;
    });
    document.querySelectorAll('[data-en-placeholder]').forEach(function(el){
      var p = el.getAttribute('data-' + lang + '-placeholder');
      if(p !== null) el.setAttribute('placeholder', p);
    });
    var btn = document.getElementById('langBtn');
    if(btn) btn.textContent = (lang === 'en') ? 'TH ◇ EN' : 'EN ◇ TH';
    window.dispatchEvent(new CustomEvent('site:langchange', { detail: { lang: lang } }));
  }

  window.toggleLang = function(){
    lang = (lang === 'en') ? 'th' : 'en';
    localStorage.setItem('site:lang', lang);
    applyLang();
  };

  // Demos opened from /work (?from=work) are a closed loop: the page Fastwork
  // links to may not lead anywhere with contact details, so the nav collapses
  // to the language switch and every way back points at /work, not the homepage.
  var fromWork = new URLSearchParams(location.search).get('from') === 'work';
  if(fromWork) document.documentElement.classList.add('from-work');

  function applyWorkView(){
    if(!fromWork) return;
    document.querySelectorAll('a[href^="index.html"], a[href^="../index.html"], a[href^="/index.html"], .brand').forEach(function(a){
      a.setAttribute('href', '/work');
    });
    document.querySelectorAll('footer a[data-en]').forEach(function(a){
      a.setAttribute('data-en', '← Back to my work');
      a.setAttribute('data-th', '← กลับไปหน้าผลงาน');
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    applyWorkView();
    var toggle = document.querySelector('.menu-toggle');
    var links = document.querySelector('.nav-links');
    function setMenu(open){
      if(!toggle || !links) return;
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '✕' : '☰';
    }
    if(toggle && links){
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', function(e){
        e.stopPropagation();
        setMenu(!links.classList.contains('open'));
      });
      links.querySelectorAll('a, button').forEach(function(el){
        el.addEventListener('click', function(){ setMenu(false); });
      });
      document.addEventListener('click', function(e){
        if(links.classList.contains('open') && !links.contains(e.target) && e.target !== toggle){
          setMenu(false);
        }
      });
      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape' && links.classList.contains('open')) setMenu(false);
      });
    }
    applyLang();
  });

  applyLang();
})();
