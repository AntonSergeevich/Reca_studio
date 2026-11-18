/* RECA — микшерный пульт цен и виджет онлайн-брони (как YPLACES: помещение → день → время → контакты).
   Данные демо: в рабочей версии расписание приходит из Google Calendar / YCLIENTS, бронь — админу в Telegram. */
(function(){
const ROOMS=[
  {id:"big",name:"Большой зал",short:"Большой",kind:"Репетиция",day:450,night:600,nightFrom:22,size:"≈ 40 м²",tags:["До 7 человек","Пульт 18 кан.","RCF"],extra:["Запись репетиции по каналам",300]},
  {id:"small",name:"Малый зал",short:"Малый",kind:"Репетиция",day:400,night:500,nightFrom:22,size:"≈ 25 м²",tags:["Дуэт, трио, соло","Ударные","Вокал"],extra:["Запись репетиции по каналам",300]},
  {id:"studio",name:"Студия записи",short:"Студия",kind:"Звукозапись",day:800,night:800,nightFrom:24,size:"аппаратная + вокальная",tags:["Звукорежиссёр","Вокал","Инструменты"],extra:["Сведение и мастеринг",3000]},
  {id:"dj",name:"DJ-класс",short:"DJ-класс",kind:"Практика",day:500,night:500,nightFrom:24,size:"≈ 12 м²",tags:["Контроллер","Мониторы","Для учеников"],extra:null}
];
const HOURS=[...Array(14)].map((_,i)=>10+i);           // 10:00 … 23:00, конец в 24:00
const DAYS=[...Array(14)].map((_,i)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+i);return d});
const byId=id=>Math.max(0,ROOMS.findIndex(r=>r.id===id));
const rub=n=>n.toLocaleString("ru-RU")+" ₽";
const plural=(n,f)=>{n=Math.abs(n)%100;const a=n%10;return n>10&&n<20?f[2]:a>1&&a<5?f[1]:a===1?f[0]:f[2]};
const hrs=n=>n+" "+plural(n,["час","часа","часов"]);
const fmtDay=d=>d.getDate()+" "+d.toLocaleDateString("ru-RU",{month:"short"}).replace(".","");
const wd=(d,i)=>i===0?"сегодня":i===1?"завтра":d.toLocaleDateString("ru-RU",{weekday:"short"});
const rate=(r,h)=>h>=r.nightFrom?r.night:r.day;
const nowH=+new Date().toLocaleString("en-US",{timeZone:"Asia/Krasnoyarsk",hour:"numeric",hour12:false});

/* детерминированная занятость: одинаковая у всех посетителей концепта */
const cache={};
function busy(ri,di){const k=ri+"-"+di;if(cache[k])return cache[k];
  let s=DAYS[di].getDate()*131+DAYS[di].getMonth()*17+ri*29+7;const r=()=>(s=s*16807%2147483647)/2147483647;
  const b=new Set();let h=0;const p=[.3,.26,.22,.2][ri]+(DAYS[di].getDay()%6===5?.12:0);
  while(h<14){if(r()<p){const len=2+Math.floor(r()*2);for(let k2=0;k2<len&&h+k2<14;k2++)b.add(h+k2);h+=len+1}else h++}
  if(di===0)HOURS.forEach((hr,i)=>{if(hr<=nowH)b.add(i)});
  return cache[k]=b}
const freeRun=(ri,di,s)=>{let n=0;while(s+n<14&&!busy(ri,di).has(s+n))n++;return n};
const load=(ri,di)=>busy(ri,di).size/14;

/* ---------------- микшер ---------------- */
function mixer(el){
  const ids=(el.dataset.mixer||"big,small,studio,dj").split(",");
  el.classList.add("mixer");
  ids.forEach((id,n)=>{const r=ROOMS[byId(id)];const ch=document.createElement("article");ch.className="ch";
    ch.innerHTML=`
      <div class="ch-top mono"><span>CH ${String(n+1).padStart(2,"0")}</span><span class="ch-kind">${r.kind}</span></div>
      <h3>${r.name}</h3>
      <div class="chips">${r.tags.map(t=>`<span class="chip">${t}</span>`).join("")}</div>
      <div class="knobs" aria-hidden="true">${["GAIN","HI","LO","PAN"].map((k,j)=>`<div class="knob-l"><div class="knob" style="--r:${-70+((j*53+n*37)%140)}deg"></div><span class="mono">${k}</span></div>`).join("")}</div>
      <div class="mode" role="group" aria-label="Тариф"><button aria-pressed="true" data-m="day">День</button><button aria-pressed="false" data-m="night"${r.nightFrom>=24?" disabled":""}>${r.nightFrom>=24?"Без ночного":"После "+r.nightFrom+":00"}</button></div>
      <div class="strip">
        <div class="meters" aria-hidden="true"><i class="meter"><b></b></i><i class="meter"><b></b></i></div>
        <div class="fader" role="slider" tabindex="0" aria-label="Часы, ${r.name}" aria-valuemin="1" aria-valuemax="8">
          <div class="scale mono" aria-hidden="true">${[8,7,6,5,4,3,2,1].map(v=>`<span>${v}</span>`).join("")}</div>
          <div class="slot"></div><div class="cap"></div></div>
        <div class="readout"><span class="mono" data-h></span><b data-sum></b><span class="mono" data-rate></span></div>
      </div>
      <button class="btn primary ch-go">Выбрать время <span class="arr">→</span></button>`;
    el.appendChild(ch);
    let v=2+n%3,mode="day";const fader=ch.querySelector(".fader"),cap=ch.querySelector(".cap");
    const upd=()=>{const pr=mode==="day"?r.day:r.night;cap.style.top=(10+(8-v)/7*(fader.clientHeight-20||210))+"px";
      fader.setAttribute("aria-valuenow",v);fader.setAttribute("aria-valuetext",hrs(v));
      ch.querySelector("[data-h]").textContent=hrs(v);ch.querySelector("[data-sum]").textContent=rub(v*pr);ch.querySelector("[data-rate]").textContent=pr+" ₽/час";ch.dataset.lvl=v/8};
    const setFromY=y=>{const b=fader.getBoundingClientRect();const t=Math.min(1,Math.max(0,(y-b.top-10)/(b.height-20)));v=Math.round(8-t*7);upd()};
    fader.addEventListener("pointerdown",e=>{fader.setPointerCapture(e.pointerId);setFromY(e.clientY);fader.classList.add("drag")});
    fader.addEventListener("pointermove",e=>{if(fader.hasPointerCapture(e.pointerId))setFromY(e.clientY)});
    fader.addEventListener("pointerup",()=>fader.classList.remove("drag"));
    fader.addEventListener("keydown",e=>{const d={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1}[e.key];if(d){e.preventDefault();v=Math.min(8,Math.max(1,v+d));upd()}});
    ch.querySelectorAll(".mode button").forEach(b=>b.addEventListener("click",()=>{mode=b.dataset.m;ch.querySelectorAll(".mode button").forEach(x=>x.setAttribute("aria-pressed",x===b));upd()}));
    ch.querySelector(".ch-go").addEventListener("click",()=>book(r.id,v,mode));
    upd();addEventListener("resize",upd);
  });
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  (function meters(){el.querySelectorAll(".ch").forEach(ch=>{const l=+ch.dataset.lvl||.3;ch.querySelectorAll(".meter b").forEach((m,i)=>{m.style.height=Math.min(100,l*72+Math.random()*22+(i?3:0))+"%"})});setTimeout(meters,reduce?6e4:120)})();
}

/* переход к брони: на этой странице или на нужной */
function book(id,len,mode){
  const w=document.querySelector("[data-booking]");
  if(w&&w._set){w._set(id,len,mode);document.getElementById("book").scrollIntoView({behavior:"smooth"});return}
  location.href=(id==="studio"?"recording.html":"rehearsal.html")+"#book-"+id+"-"+len;
}

/* ---------------- виджет брони ---------------- */
function booking(el){
  const st={r:byId(el.dataset.booking),d:0,s:null,len:2,ext:false,done:null};
  const hm=/^#book-(\w+)-(\d)/.exec(location.hash);if(hm){st.r=byId(hm[1]);st.len=+hm[2]}
  el.classList.add("booking");
  el.innerHTML=`
  <div class="bk-main">
    <div class="bk-step"><div class="bk-h"><span class="bk-n">1</span><h3>Помещение</h3></div><div class="rooms" role="radiogroup" aria-label="Помещение"></div></div>
    <div class="bk-step"><div class="bk-h"><span class="bk-n">2</span><h3>День</h3><span class="mono mute bk-hint">полоска — загрузка дня</span></div><div class="days"></div></div>
    <div class="bk-step bk-time"><div class="bk-h"><span class="bk-n">3</span><h3>Время</h3><span class="mono mute bk-hint">протяните по дорожке или выберите начало</span></div>
      <div class="tl-scroll"><div class="tl"></div></div>
      <div class="bk-pick"><div><div class="mono mute">Начало</div><div class="slots"></div></div>
        <div><div class="mono mute">Длительность</div><div class="stepper"><button data-d="-1" aria-label="Меньше">−</button><output></output><button data-d="1" aria-label="Больше">+</button></div></div></div>
      <div class="legend mono"><span><i style="background:var(--line)"></i>Занято</span><span><i style="background:var(--accent)"></i>Ваше время</span><span><i class="lg-night"></i>Ночной тариф</span></div>
    </div>
  </div>
  <aside class="bk-sum" aria-live="polite"></aside>`;
  const $=s=>el.querySelector(s);

  function rooms(){$(".rooms").innerHTML=ROOMS.map((r,i)=>`<button class="room" role="radio" aria-checked="${i===st.r}" data-i="${i}">
      <span class="mono">${r.kind}</span><b>${r.name}</b><span class="mute">от ${r.day} ₽/час</span></button>`).join("")}
  function days(){$(".days").innerHTML=DAYS.map((d,i)=>`<button class="day${i===st.d?" on":""}" data-i="${i}" aria-pressed="${i===st.d}">
      <span class="mono">${wd(d,i)}</span><b>${fmtDay(d)}</b><i class="ld"><i style="width:${Math.round(load(st.r,i)*100)}%"></i></i></button>`).join("");
    const box=$(".days"),on=$(".day.on");if(on)box.scrollLeft=on.offsetLeft-box.offsetLeft-box.clientWidth/2+on.clientWidth/2}
  function tl(){const t=$(".tl");
    t.innerHTML=`<div class="hd"></div>`+HOURS.map(h=>`<div class="hd mono">${h}:00</div>`).join("")+
      ROOMS.map((r,ri)=>`<div class="name${ri===st.r?" on":""}" data-r="${ri}">${r.short}<small>${r.day} ₽/ч</small></div>`+
        HOURS.map((h,ci)=>{const B=busy(ri,st.d),b=B.has(ci);let c="cell"+(ri!==st.r?" dim":"")+(h>=r.nightFrom?" night":"");
          if(b){c+=" busy"+(B.has(ci-1)?"":" s")+(B.has(ci+1)?"":" e")}
          else if(ri===st.r&&st.s!==null&&ci>=st.s&&ci<st.s+st.len){c+=" sel"+(ci===st.s?" s":"")+(ci===st.s+st.len-1?" e":"")}
          return `<div class="${c}" data-r="${ri}" data-c="${ci}"></div>`}).join("")).join("")}
  function pick(){const B=busy(st.r,st.d);
    const free=HOURS.map((h,i)=>i).filter(i=>!B.has(i));
    $(".slots").innerHTML=free.length?free.map(i=>`<button class="slot-chip${i===st.s?" on":""}" data-c="${i}">${HOURS[i]}:00</button>`).join(""):`<span class="mute">На этот день мест нет — выберите другой</span>`;
    $(".stepper output").textContent=hrs(st.len)}
  function sum(){const r=ROOMS[st.r],a=$(".bk-sum");
    if(st.done){a.innerHTML=`<div class="bk-ok"><div class="mono" style="color:var(--accent)">● Заявка ${st.done}</div><h3>Время придержали</h3>
      <p class="mute">${r.name}, ${fmtDay(DAYS[st.d])}, ${HOURS[st.s]}:00–${HOURS[st.s]+st.len}:00. Администратор подтвердит бронь в Telegram в течение 15 минут.</p>
      <p class="mono mute">В рабочей версии бронь сразу попадает в расписание студии</p><button class="btn" data-again>Забронировать ещё</button></div>`;return}
    let total=0;if(st.s!==null)for(let i=st.s;i<st.s+st.len;i++)total+=rate(r,HOURS[i]);
    const ex=r.extra&&st.ext?r.extra[1]:0;
    a.innerHTML=`<div class="mono mute">Ваша бронь</div>
      <dl><div><dt>Помещение</dt><dd>${r.name}</dd></div><div><dt>День</dt><dd>${fmtDay(DAYS[st.d])}, ${wd(DAYS[st.d],st.d)}</dd></div>
      <div><dt>Время</dt><dd>${st.s===null?"не выбрано":`${HOURS[st.s]}:00–${HOURS[st.s]+st.len}:00 · ${hrs(st.len)}`}</dd></div></dl>
      ${r.extra?`<label class="ext"><input type="checkbox" id="bkx"${st.ext?" checked":""}><span>${r.extra[0]}</span><b>+${rub(r.extra[1])}</b></label>`:""}
      <div class="total"><span>Итого</span><b>${st.s===null?"—":rub(total+ex)}</b></div>
      <form class="bk-form" novalidate>
        <div class="field"><label for="bkn">Имя или название группы</label><input id="bkn" autocomplete="name" required></div>
        <div class="field"><label for="bkc">Телефон или @telegram</label><input id="bkc" autocomplete="tel" required></div>
        <button class="btn primary" type="submit"${st.s===null?" disabled":""}>${st.s===null?"Выберите время":"Забронировать за "+rub(total+ex)}</button>
        <p class="consent">Отмена бесплатно за 48 часов. Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</p>
      </form>`}
  function all(){rooms();days();tl();pick();sum()}
  const keep=()=>{const n=$("#bkn")?.value,c=$("#bkc")?.value;return()=>{if(n&&$("#bkn"))$("#bkn").value=n;if(c&&$("#bkc"))$("#bkc").value=c}};
  function soft(){const k=keep();tl();pick();sum();k()}
  function fit(){if(st.s===null)return;const run=freeRun(st.r,st.d,st.s);if(!run){st.s=null;return}st.len=Math.min(Math.max(1,st.len),run)}
  function firstFree(){const B=busy(st.r,st.d);const i=HOURS.findIndex((h,i)=>!B.has(i)&&HOURS[i]>=17);return i>=0?i:HOURS.findIndex((h,i)=>!B.has(i))}

  el.addEventListener("click",e=>{
    const rm=e.target.closest(".room");if(rm){st.r=+rm.dataset.i;st.s=null;st.ext=false;all();return}
    const dy=e.target.closest(".day");if(dy){st.d=+dy.dataset.i;st.s=null;days();soft();return}
    const ch=e.target.closest(".slot-chip");if(ch){st.s=+ch.dataset.c;fit();soft();return}
    const sp=e.target.closest(".stepper button");if(sp){if(st.s===null){st.s=firstFree();if(st.s<0){st.s=null;return}}st.len+= +sp.dataset.d;fit();soft();return}
    const nm=e.target.closest(".name[data-r]");if(nm){st.r=+nm.dataset.r;st.s=null;all();return}
    if(e.target.closest("[data-again]")){st.done=null;st.s=null;all()}
  });
  el.addEventListener("change",e=>{if(e.target.id==="bkx"){st.ext=e.target.checked;const k=keep();sum();k()}});
  el.addEventListener("submit",e=>{e.preventDefault();let ok=true;
    el.querySelectorAll(".bk-form [required]").forEach(i=>{const bad=!i.value.trim();i.style.borderColor=bad?"var(--accent)":"";if(bad&&ok){i.focus();ok=false}});
    if(ok&&st.s!==null){st.done="RC-"+String(1000+Math.floor(Math.random()*9000));sum()}});

  /* выделение протягиванием, как регион в секвенсоре */
  let drag=null;
  el.querySelector(".tl").addEventListener("pointerdown",e=>{const c=e.target.closest(".cell");if(!c||c.classList.contains("busy"))return;
    const ri=+c.dataset.r;if(ri!==st.r){st.r=ri;st.ext=false;rooms();days()}
    drag={from:+c.dataset.c};st.s=drag.from;st.len=1;soft();e.preventDefault()});
  addEventListener("pointermove",e=>{if(!drag)return;const c=document.elementFromPoint(e.clientX,e.clientY)?.closest?.(".cell");if(!c||+c.dataset.r!==st.r)return;
    const to=+c.dataset.c,B=busy(st.r,st.d);let a=Math.min(drag.from,to),b=Math.max(drag.from,to);
    for(let i=drag.from;i>=a;i--)if(B.has(i)){a=i+1;break}
    for(let i=drag.from;i<=b;i++)if(B.has(i)){b=i-1;break}
    if(a!==st.s||b-a+1!==st.len){st.s=a;st.len=b-a+1;soft()}});
  addEventListener("pointerup",()=>drag=null);

  el._set=(id,len,mode)=>{st.r=byId(id);st.len=len||2;st.done=null;
    const r=ROOMS[st.r];
    const find=(di,need)=>{for(let i=0;i<14;i++){if(mode==="night"&&HOURS[i]<r.nightFrom)continue;if(freeRun(st.r,di,i)>=need)return i}return -1};
    // ближайший день, где есть окно нужной длины; если такого нет — самое длинное окно сегодня
    let di=-1,start=-1;
    for(let d=0;d<DAYS.length&&di<0;d++){const s=find(d,st.len);if(s>=0){di=d;start=s}}
    if(di<0){di=0;let best=0;for(let i=0;i<14;i++){const run=freeRun(st.r,0,i);if(run>best){best=run;start=i}}st.len=Math.max(1,best);if(!best)start=-1}
    st.d=di;st.s=start>=0?start:null;all()};
  if(hm){el._set(ROOMS[st.r].id,st.len);setTimeout(()=>document.getElementById("book")?.scrollIntoView(),60)}
  else all();
}

document.querySelectorAll("[data-mixer]").forEach(mixer);
document.querySelectorAll("[data-booking]").forEach(booking);
})();
