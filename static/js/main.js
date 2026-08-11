// Project page behaviour: nav highlighting + copy buttons.
// No dependencies, no build step.

(function () {
  'use strict';

  /* --- Highlight the nav link for the section currently in view ----------- */

  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    var byId = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      byId[id] = link;
      sections.push(section);
    });

    var visible = new Set();

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        // The topmost visible section wins, so the highlight never lags behind.
        var current = sections.filter(function (s) {
          return visible.has(s.id);
        })[0];

        links.forEach(function (link) { link.classList.remove('is-active'); });
        if (current && byId[current.id]) byId[current.id].classList.add('is-active');
      },
      { rootMargin: '-25% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* --- Copy-to-clipboard for code and BibTeX blocks ----------------------- */

  function initCopyButtons() {
    document.querySelectorAll('.code').forEach(function (block) {
      var pre = block.querySelector('pre');
      if (!pre) return;

      var button = document.createElement('button');
      button.className = 'code__copy';
      button.type = 'button';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy to clipboard');

      button.addEventListener('click', function () {
        var text = pre.innerText;
        var done = function () {
          button.textContent = 'Copied';
          setTimeout(function () { button.textContent = 'Copy'; }, 1600);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {
            button.textContent = 'Failed';
          });
        } else {
          var area = document.createElement('textarea');
          area.value = text;
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          document.body.removeChild(area);
          done();
        }
      });

      block.appendChild(button);
    });
  }

  /* --- Pause offscreen videos so a page of loops stays cheap -------------- */

  function initVideoPausing() {
    var videos = document.querySelectorAll('video[autoplay]');
    if (!videos.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.isIntersecting) {
            var playing = video.play();
            if (playing && playing.catch) playing.catch(function () {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    videos.forEach(function (video) { observer.observe(video); });
  }

  function init() {
    initScrollSpy();
    initCopyButtons();
    initVideoPausing();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
