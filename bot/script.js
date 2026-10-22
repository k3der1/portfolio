// ---- Шапка при скролле (без scroll-слушателей) ----
var header = document.querySelector('.header');
var heroTop = document.querySelector('.hero-top');
if (heroTop && 'IntersectionObserver' in window){
  new IntersectionObserver(function(es){
    header.classList.toggle('scrolled', !es[0].isIntersecting);
  }, { rootMargin: '-70px 0px 0px 0px' }).observe(heroTop);
}

// ---- Появление блоков ----
var io = new IntersectionObserver(function(es){
  es.forEach(function(e){
    if (e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

// ---- Анимированные счётчики ----
var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
var cio = new IntersectionObserver(function(es){
  es.forEach(function(e){
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    var el = e.target, end = +el.getAttribute('data-count');
    if (reduceMotion){ el.textContent = end.toLocaleString('ru-RU'); return; }
    var t0 = null;
    function step(ts){
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / 1300, 1);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * p).toLocaleString('ru-RU');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}, { threshold: 0.4 });
document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });

// ---- Подсветка карточек под курсором ----
document.querySelectorAll('.card').forEach(function(c){
  c.addEventListener('mousemove', function(e){
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// ---- Демо-чат: симуляция бота ----
var chat = document.getElementById('chat');
var chatText = document.getElementById('chatText');
var step = 0; // 0-меню, 1-имя, 2-контакт, 3-задача
var lead = { name: '', contact: '' };

function scrollChat(){ chat.scrollTop = chat.scrollHeight; }
function userSay(text){
  var d = document.createElement('div');
  d.className = 'msg user'; d.textContent = text;
  chat.appendChild(d); scrollChat();
}
function botSay(text){
  var d = document.createElement('div');
  d.className = 'msg bot'; d.innerHTML = text;
  chat.appendChild(d); scrollChat();
}
function botReply(text, cb){
  if (reduceMotion){ botSay(text); if (cb) cb(); return; }
  var d = document.createElement('div');
  d.className = 'msg bot typing';
  d.innerHTML = '<span></span><span></span><span></span>';
  chat.appendChild(d); scrollChat();
  setTimeout(function(){
    d.remove(); botSay(text);
    if (cb) cb();
  }, 650 + Math.random() * 500);
}
function showMenu(){
  var d = document.createElement('div');
  d.className = 'chat-btns';
  d.innerHTML = '<button data-a="about">Обо мне</button>' +
    '<button data-a="skills">Навыки</button>' +
    '<button data-a="projects">Проекты</button>' +
    '<button data-a="lead">Оставить заявку</button>';
  chat.appendChild(d); scrollChat();
}
function hideMenu(){
  chat.querySelectorAll('.chat-btns').forEach(function(b){ b.remove(); });
}
function answer(a){
  userSay(a === 'about' ? 'Обо мне' : a === 'skills' ? 'Навыки'
    : a === 'projects' ? 'Проекты' : 'Оставить заявку');
  if (a === 'lead') hideMenu();
  setTimeout(function(){
    if (a === 'about') botReply('Я Егор Маханенко, мне 20. Делаю сайты и Telegram-ботов: фронт, бэк, запуск.');
    if (a === 'skills') botReply('Python: aiogram, FastAPI, парсинг.<br>Веб: HTML/CSS/JS, React.<br>Базы данных: SQLite, PostgreSQL.');
    if (a === 'projects') botReply('1. Этот бот<br>2. Сайт-портфолио<br>3. Лендинг + адаптив<br>4. Сайт + бот под ключ');
    if (a === 'lead'){ step = 1; botReply('Заявка (1/3). Как тебя зовут?'); }
  }, 350);
}
chat.addEventListener('click', function(e){
  var b = e.target.closest('.chat-btns button');
  if (b) answer(b.getAttribute('data-a'));
});
function sendChat(){
  var t = chatText.value.trim();
  if (!t) return;
  userSay(t); chatText.value = '';
  setTimeout(function(){
    if (step === 0){
      var l = t.toLowerCase();
      if (l.indexOf('заяв') > -1 || l.indexOf('бот') > -1 || l.indexOf('заказ') > -1){ step = 1; hideMenu(); botReply('Заявка (1/3). Как тебя зовут?'); }
      else if (l.indexOf('навык') > -1) botReply('Python: aiogram, FastAPI, парсинг. Веб: HTML/CSS/JS, React. Базы: SQLite.');
      else if (l.indexOf('проект') > -1) botReply('1. Этот бот 2. Сайт-портфолио 3. Лендинг (скоро).');
      else if (l.indexOf('цен') > -1 || l.indexOf('стоим') > -1) botReply('Бот — от 3 000 ₽. Сайт — от 15 000 ₽. Точную цену назову после задачи 🙂');
      else botReply('Понял! Нажми «Оставить заявку» — оформим за 30 секунд 🙂');
    } else if (step === 1){ lead.name = t; step = 2; botReply('Приятно, ' + t + '! (2/3) Твой контакт?'); }
    else if (step === 2){ lead.contact = t; step = 3; botReply('(3/3) Что нужно? (бот / сайт / задача)'); }
    else if (step === 3){
      step = 0;
      var all = JSON.parse(localStorage.getItem('demo_leads') || '[]');
      all.push({ name: lead.name, contact: lead.contact, task: t, at: new Date().toLocaleString('ru-RU') });
      localStorage.setItem('demo_leads', JSON.stringify(all));
      botReply('Готово, заявка #' + all.length + ' сохранена! (демо, в браузере) 🙂<br>В настоящем боте она улетит в SQLite + админу.', function(){
        setTimeout(showMenu, 700);
      });
    }
  }, 350);
}
document.getElementById('chatSend').onclick = sendChat;
chatText.addEventListener('keydown', function(e){ if (e.key === 'Enter') sendChat(); });

// ---- Мини-калькулятор проекта ----
var chips = document.querySelectorAll('.chip');
function calcUpd(){
  var sum = 3000, extra = 0;
  chips.forEach(function(c){
    if (c.classList.contains('on')){ sum += +c.getAttribute('data-price'); extra++; }
  });
  document.getElementById('calcSum').textContent = sum.toLocaleString('ru-RU');
  var d = 3 + extra;
  document.getElementById('calcDays').textContent = d + '-' + (d + 2);
}
chips.forEach(function(c){
  c.addEventListener('click', function(){ c.classList.toggle('on'); calcUpd(); });
});
calcUpd();

// ---- Конфетти при отправке заявки ----
function burst(x, y){
  var colors = ['#d6ff3f', '#4dff6a', '#f2f2f0'];
  for (var i = 0; i < 26; i++){
    (function(){
      var s = document.createElement('span');
      s.style.cssText = 'position:fixed;z-index:400;width:8px;height:8px;border-radius:2px;' +
        'pointer-events:none;left:' + x + 'px;top:' + y + 'px;background:' + colors[i % 3];
      document.body.appendChild(s);
      var a = Math.random() * Math.PI * 2, v = 70 + Math.random() * 110;
      var an = s.animate([
        { transform: 'translate(-50%,-50%)', opacity: 1 },
        { transform: 'translate(' + Math.round(Math.cos(a) * v) + 'px,' + Math.round(Math.sin(a) * v + 90) + 'px) rotate(' + (Math.random() * 360 | 0) + 'deg)', opacity: 0 }
      ], { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' });
      an.onfinish = function(){ s.remove(); };
    })();
  }
}

// ---- Форма заказа ----
document.getElementById('leadForm').addEventListener('submit', function(e){
  e.preventDefault();
  var n = document.getElementById('fName').value.trim();
  var c = document.getElementById('fContact').value.trim();
  var t = document.getElementById('fTask').value.trim();
  var all = JSON.parse(localStorage.getItem('demo_leads') || '[]');
  all.push({ name: n, contact: c, task: t, at: new Date().toLocaleString('ru-RU') });
  localStorage.setItem('demo_leads', JSON.stringify(all));
  var note = document.getElementById('formNote');
  note.textContent = 'Заявка #' + all.length + ' сохранена в браузере (демо). Для настоящей — пиши в Telegram!';
  note.style.color = '#d6ff3f';
  var btn = this.querySelector('button[type=submit]');
  var r = btn.getBoundingClientRect();
  if (!reduceMotion) burst(r.left + r.width / 2, r.top + r.height / 2);
  this.reset();
});
