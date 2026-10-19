// Preloader
var num = document.getElementById('preloaderNum');
var bar = document.getElementById('preloaderBar');
var pre = document.getElementById('preloader');
var p = 0;
var t = setInterval(function(){
  p += Math.random() * 18;
  if (p >= 100) { p = 100; clearInterval(t);
    setTimeout(function(){ pre.classList.add('done'); }, 350);
  }
  if (num) num.textContent = Math.floor(p);
  if (bar) bar.style.width = p + '%';
}, 140);

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Menu
var overlay = document.getElementById('menuOverlay');
var menuBtn = document.getElementById('menuBtn');
function openMenu(){ overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeMenu(){ overlay.classList.remove('open'); document.body.style.overflow = ''; }
menuBtn.onclick = openMenu;
document.getElementById('menuClose').onclick = closeMenu;
overlay.querySelectorAll('a').forEach(function(a){
  a.onclick = closeMenu;
});
// свайп вниз по меню — закрыть (мобильные)
var touchY = null;
overlay.addEventListener('touchstart', function(e){ touchY = e.touches[0].clientY; }, {passive:true});
overlay.addEventListener('touchend', function(e){
  if (touchY === null) return;
  var dy = e.changedTouches[0].clientY - touchY;
  if (dy > 90) closeMenu();
  touchY = null;
}, {passive:true});

// Reveal on scroll (на мобильных срабатывает раньше)
var io = new IntersectionObserver(function(es){
  es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

// Counters
var cio = new IntersectionObserver(function(es){
  es.forEach(function(e){
    if (!e.isIntersecting) return;
    var b = e.target, end = +b.dataset.count, cur = 0;
    var ct = setInterval(function(){
      cur += Math.max(1, Math.round(end / 30));
      if (cur >= end) { cur = end; clearInterval(ct); }
      b.textContent = cur;
    }, 50);
    cio.unobserve(b);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(function(b){ cio.observe(b); });

// Modal
var modal = document.getElementById('caseModal');
var mTitle = document.getElementById('modalTitle');
function openModal(title){
  mTitle.textContent = title || 'Кейс';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  modal.classList.remove('open');
  if (!overlay.classList.contains('open')) document.body.style.overflow = '';
}
document.querySelectorAll('.work').forEach(function(w){
  w.onclick = function(){ openModal(w.dataset.title); };
});
document.getElementById('modalClose').onclick = closeModal;
document.getElementById('modalCta').onclick = closeModal;
modal.onclick = function(e){ if (e.target === modal) closeModal(); };
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') { closeModal(); closeMenu(); }
});

// Cursor — только для мыши (не для тачскринов)
var cur = document.getElementById('cursor');
if (window.matchMedia('(pointer:fine)').matches) {
  document.addEventListener('mousemove', function(e){
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
  });
} else if (cur) {
  cur.style.display = 'none';
}

// Form
document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  var note = document.getElementById('formNote');
  note.textContent = 'Заявка принята! Я свяжусь с тобой в течение дня.';
  note.style.color = '#d6ff3f';
  this.reset();
  setTimeout(function(){
    note.textContent = 'Нажимая кнопку, ты соглашаешься на обработку данных.';
    note.style.color = '';
  }, 5000);
});
