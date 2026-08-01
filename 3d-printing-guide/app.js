/* ============================================================
   3D打印材料指南 — 交互脚本
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 移动端导航 ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav   = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('open');
      const expanded = mainNav.classList.contains('open');
      navToggle.setAttribute('aria-expanded', String(expanded));
    });
    // 点导航链接后关闭菜单
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
      });
    });
  }

  /* ---------- 快速导航卡片跳转 ---------- */
  document.querySelectorAll('.quick-card[data-target]').forEach(function (card) {
    card.addEventListener('click', function () {
      const targetId = card.getAttribute('data-target');
      const target   = document.getElementById(targetId);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // 高亮脉冲动画
      target.classList.remove('highlighted');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          target.classList.add('highlighted');
        });
      });
      target.addEventListener('animationend', function () {
        target.classList.remove('highlighted');
      }, { once: true });
    });
  });

  /* ---------- 活跃导航链接高亮（IntersectionObserver） ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

  if ('IntersectionObserver' in window && navLinks.length > 0) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.classList.remove('active');
              if (link.getAttribute('href') === '#' + entry.target.id) {
                link.classList.add('active');
              }
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- 平滑滚动（兼容旧版浏览器） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
