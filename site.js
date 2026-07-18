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

  document.addEventListener('DOMContentLoaded', function(){
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
