(function(){
  var lang = localStorage.getItem('site:lang') || 'en';

  function applyLang(){
    document.documentElement.lang = lang;
    document.documentElement.classList.toggle('lang-th', lang === 'th');
    document.querySelectorAll('[data-en]').forEach(function(el){
      var t = el.getAttribute('data-' + lang);
      if(t !== null) el.textContent = t;
    });
    var btn = document.getElementById('langBtn');
    if(btn) btn.textContent = (lang === 'en') ? 'TH ◇ EN' : 'EN ◇ TH';
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
    document.querySelectorAll('a[href^="index.html"], .brand').forEach(function(a){
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
    if(toggle && links){
      toggle.addEventListener('click', function(){ links.classList.toggle('open'); });
      links.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){ links.classList.remove('open'); });
      });
    }
    applyLang();
  });

  applyLang();
})();
