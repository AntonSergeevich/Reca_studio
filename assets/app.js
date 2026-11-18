/* RECA — общие блоки и интерактив для всех страниц */
(function(){
const PAGE=document.body.dataset.page||"home";
const NAV=[["index.html","Главная","home"],["dj.html","DJ-обучение","dj"],["rehearsal.html","Репетиционные залы","halls"],["recording.html","Звукозапись","rec"]];
// Контакты: заменить на актуальные данные студии
const C={phone:"+7 (900) 000-00-00",tel:"+79000000000",addr:"Красноярск, ул. Ады Лебедевой, 150",hours:"Ежедневно 10:00–00:30",
  tg:"#",vk:"#",ig:"#",map:"https://yandex.ru/maps/?text=%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D1%8F%D1%80%D1%81%D0%BA%2C%20%D0%90%D0%B4%D1%8B%20%D0%9B%D0%B5%D0%B1%D0%B5%D0%B4%D0%B5%D0%B2%D0%BE%D0%B9%2C%20150"};
const LEADS={
  dj:{t:"Бесплатное DJ-занятие",d:"60 минут за пультом с преподавателем. Перезвоним и подберём время.",opts:null},
  hall:{t:"Бронь репетиционного зала",d:"Оставьте контакты — подтвердим бронь в Telegram в течение 15 минут.",opts:["Большой зал","Малый зал","Не знаю, подскажите"]},
  rec:{t:"Заявка на запись",d:"Расскажите, что хотите записать — посчитаем стоимость и время.",opts:["Вокал","Трек под ключ","Сведение","Подкаст / голос"]},
  q:{t:"Задать вопрос",d:"Ответим в течение часа в рабочее время.",opts:null}
};

/* ---------- header / drawer ---------- */
const navLinks=NAV.map(([h,t,k])=>`<a href="${h}"${k===PAGE?' aria-current="page"':""}>${t}</a>`).join("");
document.body.insertAdjacentHTML("afterbegin",`
<header class="top"><div class="wrap">
  <a class="logo" href="index.html" aria-label="RECA, на главную"><i></i>RECA</a>
  <nav class="menu" aria-label="Основное меню">${navLinks}</nav>
  <div class="cta"><button class="btn" data-lead="dj">Бесплатное DJ-занятие</button><button class="btn primary" data-lead="hall">Забронировать зал</button></div>
  <button class="burger" aria-label="Меню" aria-expanded="false"><span></span><span></span></button>
</div></header>
<div class="drawer" id="drawer">${navLinks}
  <div class="btns"><button class="btn primary" data-lead="hall">Забронировать зал</button><button class="btn" data-lead="dj">Бесплатное DJ-занятие</button><a class="btn" href="tel:${C.tel}">${C.phone}</a></div>
</div>`);
const burger=document.querySelector(".burger"),drawer=document.getElementById("drawer");
burger.onclick=()=>{const o=drawer.classList.toggle("open");document.body.classList.toggle("menu-open",o);burger.setAttribute("aria-expanded",o)};
drawer.addEventListener("click",e=>{if(e.target.closest("a,button")){drawer.classList.remove("open");document.body.classList.remove("menu-open")}});
addEventListener("scroll",()=>document.querySelector(".top").classList.toggle("scrolled",scrollY>8),{passive:true});

/* ---------- contacts (на каждой странице) ---------- */
document.querySelectorAll("[data-slot=contacts]").forEach(s=>{s.innerHTML=`
<div class="wrap">
  <div class="head reveal"><h2>Контакты</h2><p class="lead">Приходите посмотреть студию — покажем залы, пульты и нальём кофе.</p></div>
  <div class="contacts reveal">
    <div class="cinfo">
      <div><div class="mono mute">Телефон</div><a class="big" href="tel:${C.tel}">${C.phone}</a></div>
      <div><div class="mono mute">Адрес</div><div class="big">${C.addr.replace("Красноярск, ","")}</div><div class="mute" style="margin-top:6px">${C.hours}</div></div>
      <div class="socials"><a href="${C.tg}">Telegram</a><a href="${C.vk}">VK</a><a href="${C.ig}">Instagram</a><a href="${C.map}" target="_blank" rel="noopener">Яндекс Карты ↗</a></div>
      <div class="btns" style="margin-top:auto"><button class="btn primary" data-lead="${PAGE==="dj"?"dj":PAGE==="rec"?"rec":"hall"}">${PAGE==="dj"?"Записаться на бесплатное занятие":PAGE==="rec"?"Оставить заявку на запись":"Забронировать зал"}</button><button class="btn" data-lead="q">Задать вопрос</button></div>
    </div>
    <a class="map" href="${C.map}" target="_blank" rel="noopener" aria-label="Открыть адрес в Яндекс Картах">
      <svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g stroke="var(--line)" stroke-width="1"><path d="M0 70H600M0 150H600M0 230H600M0 310H600M90 0V420M210 0V420M330 0V420M450 0V420M560 0V420"/></g>
        <g stroke="var(--line)" stroke-width="7" fill="none" stroke-linecap="round"><path d="M-10 190 C150 180 280 222 610 160"/><path d="M310 -10 L340 430"/></g>
        <path id="yen" d="M-20 370 C120 310 220 392 360 342 S560 272 640 312" stroke="var(--accent)" stroke-opacity=".22" stroke-width="34" fill="none"/>
        <text font-family="JetBrains Mono" font-size="11" fill="var(--mute)" letter-spacing="4"><textPath href="#yen" startOffset="10%">ЕНИСЕЙ · ЕНИСЕЙ · ЕНИСЕЙ · ЕНИСЕЙ</textPath></text>
      </svg>
      <span class="pin">● RECA</span>
    </a>
  </div>
</div>`});

/* ---------- footer, sticky CTA, palette, modal ---------- */
document.body.insertAdjacentHTML("beforeend",`
<footer><div class="wrap">
  <div><a class="logo" href="index.html"><i></i>RECA</a><p class="mute" style="margin-top:12px">Музыкальное пространство · ${C.addr}</p></div>
  <nav class="socials" aria-label="Страницы">${NAV.map(([h,t])=>`<a href="${h}">${t}</a>`).join("")}</nav>
  <p class="mono mute">© RECA, 2026 · <a href="#" style="text-decoration:none">Политика конфиденциальности</a></p>
</div></footer>
<div class="sticky">${PAGE==="dj"?`<button class="btn primary" data-lead="dj">Бесплатное занятие</button>`:PAGE==="rec"?`<button class="btn primary" data-lead="rec">Записаться</button><a class="btn ink" href="tel:${C.tel}">Позвонить</a>`:`<button class="btn primary" data-lead="hall">Бронь зала</button><button class="btn ink" data-lead="dj">DJ бесплатно</button>`}</div>
<div class="concept" role="group" aria-label="Палитра под интерьер">
  <span class="mono mute">Палитра</span>
  <button data-p="graphite" title="Графит" style="background:#0f1011;box-shadow:inset 0 0 0 6px #ff5a1f"></button>
  <button data-p="concrete" title="Бетон" style="background:#e9e6e0;box-shadow:inset 0 0 0 6px #e2481b"></button>
  <button data-p="wood" title="Дерево" style="background:#141110;box-shadow:inset 0 0 0 6px #d9a35b"></button>
</div>
<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="box">
  <button class="x" aria-label="Закрыть">✕</button>
  <form class="form" id="leadForm" novalidate>
    <div class="mono" style="color:var(--accent)">Заявка</div>
    <h3 id="mt" style="font-size:30px"></h3><p class="mute" id="md"></p>
    <div class="seg" id="mo"></div>
    <div class="field"><label for="f1">Имя</label><input id="f1" name="name" autocomplete="name" required></div>
    <div class="field"><label for="f2">Телефон или @telegram</label><input id="f2" name="contact" autocomplete="tel" required></div>
    <div class="field"><label for="f3">Комментарий</label><textarea id="f3" name="msg" placeholder="Например: группа из 4 человек, пятница вечером"></textarea></div>
    <button class="btn primary" type="submit">Отправить заявку <span class="arr">→</span></button>
    <p class="consent">Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</p>
    <div class="ok"><div style="font-size:48px">✓</div><h3>Заявка отправлена</h3><p class="mute" style="margin-top:8px">Свяжемся с вами в ближайшее время. В рабочей версии заявка уходит администратору в Telegram.</p></div>
  </form>
</div></div>`);

const root=document.documentElement;
function setPal(p){root.dataset.palette=p;document.querySelectorAll(".concept button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.p===p));try{localStorage.setItem("reca-pal",p)}catch(e){}}
let saved="graphite";try{saved=localStorage.getItem("reca-pal")||saved}catch(e){}
setPal(saved);
document.querySelectorAll(".concept button").forEach(b=>b.onclick=()=>setPal(b.dataset.p));

const modal=document.getElementById("modal"),form=document.getElementById("leadForm");
let lastFocus=null;
window.openLead=function(type,note){const L=LEADS[type]||LEADS.q;lastFocus=document.activeElement;form.classList.remove("sent");form.reset();
  document.getElementById("mt").textContent=L.t;document.getElementById("md").textContent=L.d;
  document.getElementById("mo").innerHTML=(L.opts||[]).map((o,i)=>`<label><input type="radio" name="opt" value="${o}"${i?"":" checked"}><span>${o}</span></label>`).join("");
  if(note){document.getElementById("f3").value=note;
    document.querySelectorAll("#mo input").forEach(i=>{if(note.startsWith(i.value.split(" ")[0]))i.checked=true})}
  modal.classList.add("open");setTimeout(()=>document.getElementById("f1").focus(),50)};
const close=()=>{modal.classList.remove("open");lastFocus&&lastFocus.focus()};
modal.addEventListener("click",e=>{if(e.target===modal||e.target.closest(".x"))close()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&modal.classList.contains("open"))close()});
document.addEventListener("click",e=>{const b=e.target.closest("[data-lead]");if(b){e.preventDefault();openLead(b.dataset.lead,b.dataset.note)}});
function bindForm(f){f.addEventListener("submit",e=>{e.preventDefault();let ok=true;
  f.querySelectorAll("[required]").forEach(i=>{const bad=!i.value.trim();i.style.borderColor=bad?"var(--accent)":"";if(bad&&ok){i.focus();ok=false}});
  if(ok)f.classList.add("sent")})}
document.querySelectorAll("form.form").forEach(bindForm);

/* ---------- волна в hero ---------- */
document.querySelectorAll("svg.wave").forEach(svg=>{
  const W=1200,H=120,N=5,paths=[];svg.setAttribute("viewBox",`0 0 ${W} ${H}`);svg.setAttribute("preserveAspectRatio","none");
  for(let i=0;i<N;i++){const p=document.createElementNS("http://www.w3.org/2000/svg","path");if(i===2)p.classList.add("hot");svg.appendChild(p);paths.push(p)}
  let t=0,mx=-1;svg.parentElement.addEventListener("pointermove",e=>{const r=svg.getBoundingClientRect();mx=(e.clientX-r.left)/r.width*W});
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  (function f(){paths.forEach((p,i)=>{let d="";for(let x=0;x<=W;x+=10){const near=mx<0?0:Math.max(0,1-Math.abs(x-mx)/220);
      const y=H/2+Math.sin(x*.006+t+i*.7)*(10+i*3)+Math.sin(x*.017-t*1.3+i)*5+Math.sin(x*.06-t*6)*near*18*(i===2?1.4:.6);
      d+=(x?"L":"M")+x+" "+y.toFixed(1)}p.setAttribute("d",d)});t+=.012;if(!reduce)requestAnimationFrame(f)})();
});

/* ---------- бронь-таймлайн (страница залов) ---------- */
const tl=document.getElementById("tl");
if(tl){
  const HALLS=JSON.parse(tl.dataset.halls),HOURS=[...Array(14)].map((_,i)=>10+i);
  const daysEl=document.getElementById("days");let dayIdx=0,sel=null,busy=[],drag=null;
  const dates=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return d});
  const fmtN=d=>d.getDate()+" "+d.toLocaleDateString("ru-RU",{month:"short"}).replace(".","");
  dates.forEach((d,i)=>{const b=document.createElement("button");b.className="day"+(i?"":" on");
    b.innerHTML=`<span class="mono">${i===0?"сегодня":i===1?"завтра":d.toLocaleDateString("ru-RU",{weekday:"short"})}</span><b>${fmtN(d)}</b>`;
    b.onclick=()=>{dayIdx=i;sel=null;daysEl.querySelectorAll(".day").forEach((x,j)=>x.classList.toggle("on",j===i));render()};daysEl.appendChild(b)});
  const rnd=s=>()=>(s=s*16807%2147483647)/2147483647;
  function busyFor(hi){const r=rnd(dates[dayIdx].getDate()*31+hi*7+1),b=new Set();let h=0;
    while(h<14){if(r()<.28){const len=2+Math.floor(r()*2);for(let k=0;k<len&&h+k<14;k++)b.add(h+k);h+=len+1}else h++}return b}
  function render(){busy=HALLS.map((_,i)=>busyFor(i));
    tl.innerHTML=`<div class="hd"></div>`+HOURS.map(h=>`<div class="hd mono">${h}:00</div>`).join("");
    HALLS.forEach((h,hi)=>{tl.insertAdjacentHTML("beforeend",`<div class="name">${h.name}<small>${h.day} ₽/ч</small></div>`);
      HOURS.forEach((hr,ci)=>{tl.insertAdjacentHTML("beforeend",`<div class="cell${hr>=h.nightFrom?" night":""}${busy[hi].has(ci)?" busy":""}" data-h="${hi}" data-c="${ci}"></div>`)})});
    paint()}
  function paint(){tl.querySelectorAll(".cell").forEach(c=>{const hi=+c.dataset.h,ci=+c.dataset.c,B=busy[hi];c.classList.remove("sel","s","e");
      if(B.has(ci)){B.has(ci-1)||c.classList.add("s");B.has(ci+1)||c.classList.add("e");return}
      if(sel&&sel.h===hi&&ci>=sel.a&&ci<=sel.b){c.classList.add("sel");ci===sel.a&&c.classList.add("s");ci===sel.b&&c.classList.add("e")}});
    const txt=document.getElementById("selText"),btn=document.getElementById("bookBtn");
    if(!sel){txt.textContent="Нажмите или протяните по свободным часам";btn.disabled=true;btn.style.opacity=.4;return}
    const h=HALLS[sel.h];let sum=0;for(let i=sel.a;i<=sel.b;i++)sum+=HOURS[i]>=h.nightFrom?h.night:h.day;const n=sel.b-sel.a+1;
    txt.textContent=`${h.name} · ${fmtN(dates[dayIdx])} · ${HOURS[sel.a]}:00–${HOURS[sel.b]+1}:00 · ${sum.toLocaleString("ru-RU")} ₽`;
    btn.disabled=false;btn.style.opacity=1;btn.dataset.note=`${txt.textContent} (${n} ч)`}
  tl.addEventListener("pointerdown",e=>{const c=e.target.closest(".cell");if(!c||c.classList.contains("busy"))return;
    drag={h:+c.dataset.h,from:+c.dataset.c};sel={h:drag.h,a:drag.from,b:drag.from};paint()});
  addEventListener("pointermove",e=>{if(!drag)return;const c=document.elementFromPoint(e.clientX,e.clientY)?.closest?.(".cell");if(!c)return;
    const to=+c.dataset.c;let a=Math.min(drag.from,to),b=Math.max(drag.from,to);
    for(let i=drag.from;i>=a;i--)if(busy[drag.h].has(i)){a=i+1;break}
    for(let i=drag.from;i<=b;i++)if(busy[drag.h].has(i)){b=i-1;break}
    sel={h:drag.h,a,b};paint()});
  addEventListener("pointerup",()=>drag=null);
  render();
}

/* ---------- плеер примеров (звукозапись) ---------- */
let actx,cur=null;
document.querySelectorAll(".trk").forEach((el,idx)=>{
  const cv=el.querySelector("canvas"),ctx=cv.getContext("2d"),bars=[...Array(90)].map((_,i)=>.25+.75*Math.abs(Math.sin(i*.37+idx)*Math.cos(i*.11+idx*2)));
  let prog=0,raf;
  function draw(){const w=cv.clientWidth,h=cv.clientHeight,d=Math.min(2,devicePixelRatio||1);cv.width=w*d;cv.height=h*d;ctx.scale(d,d);
    const cs=getComputedStyle(document.documentElement),bw=w/bars.length;
    bars.forEach((v,i)=>{ctx.fillStyle=i/bars.length<prog?cs.getPropertyValue("--accent"):cs.getPropertyValue("--line");ctx.fillRect(i*bw,h/2-v*h/2,Math.max(1,bw-2),v*h)})}
  draw();addEventListener("resize",draw);
  el.querySelector(".pl").addEventListener("click",()=>{
    if(cur&&cur!==el)cur.stop();
    if(el.classList.toggle("on")){cur=el;el.querySelector(".pl").textContent="❚❚";
      actx=actx||new (window.AudioContext||window.webkitAudioContext)();actx.resume();
      const g=actx.createGain();g.gain.value=.0001;g.connect(actx.destination);g.gain.exponentialRampToValueAtTime(.12,actx.currentTime+.4);
      const notes=[[220,277,330],[196,247,294],[175,220,262],[196,247,330]];const oscs=[];
      notes.forEach((ch,k)=>ch.forEach(f=>{const o=actx.createOscillator();o.type=idx%2?"triangle":"sine";o.frequency.value=f*(1+idx*.12);
        const og=actx.createGain();og.gain.setValueAtTime(0,actx.currentTime+k*1.2);og.gain.linearRampToValueAtTime(.3,actx.currentTime+k*1.2+.05);og.gain.linearRampToValueAtTime(0,actx.currentTime+k*1.2+1.15);
        o.connect(og).connect(g);o.start(actx.currentTime+k*1.2);o.stop(actx.currentTime+k*1.2+1.2);oscs.push(o)}));
      const t0=performance.now();(function step(){prog=Math.min(1,(performance.now()-t0)/4800);draw();if(prog<1&&el.classList.contains("on"))raf=requestAnimationFrame(step);else el.stop()})();
      el.stop=()=>{el.classList.remove("on");el.querySelector(".pl").textContent="▶";cancelAnimationFrame(raf);try{g.gain.cancelScheduledValues(actx.currentTime);g.gain.setValueAtTime(0,actx.currentTime)}catch(e){};prog=0;draw();if(cur===el)cur=null};
    }else el.stop();
  });
});

/* ---------- появление ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.1});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
})();
