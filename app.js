(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const scenes = {
    horizon: { number:'01', title:'На краю<br><span>бесконечности.</span>', description:'Здесь заканчивается привычный мир.<br>И начинается твоя вселенная.', label:'SINGULARITY — 001', sub:'ЗА ГРАНИЦЕЙ ИЗВЕСТНОГО', note:'Потяни за звёзды — измени ракурс', sound:'Глубокий гул сингулярности' },
    nebula: { number:'02', title:'Там, где<br><span>рождается свет.</span>', description:'У каждого далёкого солнца было начало.<br>Побудь внутри этого мгновения.', label:'NEBULA — 002', sub:'КОЛЫБЕЛЬ НОВЫХ СОЛНЦ', note:'Двигайся сквозь облака звёздной пыли', sound:'Нежное дыхание туманности' },
    system: { number:'03', title:'Вселенная.<br><span>Твоего авторства.</span>', description:'Придумай имя. Выбери цвет.<br>Где-то в бесконечности появится твой мир.', label:'GENESIS — 003', sub:'ЗДЕСЬ ЕСТЬ МЕСТО ТВОЕМУ МИРУ', note:'Нажми на планету, чтобы познакомиться', sound:'Мелодия твоей звёздной системы' }
  };
  let scene='horizon', paused=false, traveling=false, toastTimer, audioBusy=false;
  let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let planets=[];
  try {const saved=JSON.parse(localStorage.getItem('orbita.planets.v1') || '[]'); if(Array.isArray(saved)) planets=saved.filter(p=>p && typeof p.name==='string' && p.name.length<=28 && /^#[0-9a-f]{6}$/i.test(p.color) && Number.isFinite(p.size) && p.size>=.5 && p.size<=2 && typeof p.rings==='boolean').slice(0,12);} catch(_) {}
  const visited=new Set(['horizon']);
  const canvas=$('#cosmos');
  const renderer=new CosmosRenderer(canvas, {onObjectClick: object=>toast(`${object.name} · ${object.description}`)});
  const audio=new CosmosAudio();
  renderer.setReducedMotion(reduced);
  planets.forEach(p=>renderer.createPlanet(p));
  const missionStart=Date.now();
  const clockTimer=setInterval(()=>{
    const t=Math.floor((Date.now()-missionStart)/1000);$('#mission-clock').textContent=[Math.floor(t/3600),Math.floor(t/60)%60,t%60].map(n=>String(n).padStart(2,'0')).join(':');
  },1000);
  function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4200);}
  function setScene(next, announce=true){
    if(!scenes[next]) return;
    scene=next; const data=scenes[next];renderer.setScene(next);audio.setScene(next);visited.add(next);$('#world-list').hidden=next!=='system';
    $('#scene-number').textContent=data.number;$('#scene-title').innerHTML=data.title;$('#scene-description').innerHTML=data.description;$('#object-label').firstChild.textContent=data.label;$('#object-subtitle').textContent=data.sub;$('#flight-note').textContent=data.note;
    $$('.destination').forEach(b=>{const active=b.dataset.scene===next;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    $('#discovered').textContent=`ИССЛЕДОВАНО ${String(visited.size).padStart(2,'0')} / 03`;
    if(announce && visited.size===3 && !sessionStorageSafeGet('orbita.explored')){toast('Ты открыл все три уголка космоса. Теперь создай свой.');try{sessionStorage.setItem('orbita.explored','1');}catch(_){}}
  }
  function sessionStorageSafeGet(key){try{return sessionStorage.getItem(key);}catch(_){return null;}}
  $$('.destination').forEach(button=>button.addEventListener('click',()=>{if(!traveling)setScene(button.dataset.scene);}));
  $('.brand').addEventListener('click',event=>{event.preventDefault();if(!traveling)setScene('horizon');});
  function setPaused(value){paused=value;renderer.setPaused(paused);$('#pause').setAttribute('aria-pressed',String(paused));$('#pause').setAttribute('aria-label',paused?'Продолжить движение':'Приостановить движение');$('#pause').title=paused?'Продолжить · P':'Пауза · P';$('#pause use').setAttribute('href',paused?'#i-play':'#i-pause');}
  $('#pause').addEventListener('click',()=>{if(!traveling)setPaused(!paused);});
  $('#speed').addEventListener('input',event=>{const value=Number(event.target.value);renderer.setSpeed(value);$('#speed-value').textContent=value.toFixed(1);});
  async function toggleSound(){
    if(audioBusy)return;audioBusy=true;
    try{if(audio.enabled){audio.disable();}else{await audio.enable();audio.setScene(scene);toast(scenes[scene].sound+' · лучше в наушниках');}
      $('#sound').setAttribute('aria-pressed',String(audio.enabled));$('#sound').setAttribute('aria-label',audio.enabled?'Выключить звук':'Включить звук');$('#sound').title=audio.enabled?'Выключить звук · M':'Включить звук · M';$('#sound use').setAttribute('href',audio.enabled?'#i-sound':'#i-mute');
    }catch(_){toast('Браузер не смог включить звук. Космос всё равно с тобой.');}finally{audioBusy=false;}
  }
  $('#sound').addEventListener('click',toggleSound);
  async function warp(){
    if(traveling)return;traveling=true;
    document.body.classList.add('traveling');$('#warp').disabled=true;$('#create').disabled=true;$('#pause').disabled=true;$$('.destination').forEach(b=>b.disabled=true);
    const keys=Object.keys(scenes),next=keys[(keys.indexOf(scene)+1)%keys.length];
    audio.warp();
    try{await renderer.warp();setScene(next);}catch(_){setScene(next);}finally{document.body.classList.remove('traveling');$('#warp').disabled=false;$('#create').disabled=false;$('#pause').disabled=false;$$('.destination').forEach(b=>b.disabled=false);traveling=false;}
  }
  $('#warp').addEventListener('click',warp);
  const planetDialog=$('#planet-dialog');const helpDialog=$('#help-dialog');
  function openPlanet(){if(traveling)return;if(planets.length>=12){toast('В твоей системе уже 12 авторских планет — целая коллекция миров.');return;}if(helpDialog.open)helpDialog.close();planetDialog.showModal();$('#planet-name').focus();}
  $('#create').addEventListener('click',openPlanet);
  $('#help').addEventListener('click',()=>helpDialog.showModal());
  $('#world-list').addEventListener('click',()=>{
    const content=$('#world-content');content.replaceChildren();
    renderer.planets.forEach(planet=>{const article=document.createElement('article'),heading=document.createElement('h3'),description=document.createElement('p');heading.textContent=planet.name;heading.style.color=planet.color;description.textContent=planet.description;article.append(heading,description);content.append(article);});
    $('#world-dialog').showModal();
  });
  $$('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}));
  function updatePlanetPreview(){
    const color=$('input[name=color]:checked').value;const size=Number($('#planet-size').value), rings=$('#planet-rings').checked;
    $('#preview-planet').style.background=`radial-gradient(circle at 28% 24%, #eee8ff, ${color} 20%, ${color}99 43%, #171124 70%, #090611 85%)`;
    $('#preview-planet').style.transform=`scale(${.65+size*.35})`;$('#preview-rings').style.transform=`rotate(-24deg) scale(${.65+size*.35})`;$('#preview-rings').style.display=rings?'block':'none';$('#size-output').textContent=size.toFixed(1)+' ×';
  }
  $('#planet-form').addEventListener('input',updatePlanetPreview);
  $('#planet-form').addEventListener('submit',event=>{
    event.preventDefault();const name=$('#planet-name').value.trim();if(!name){$('#planet-name').setCustomValidity('Дай своему миру имя.');$('#planet-name').reportValidity();return;}
    if(planets.length>=12)return;
    const planet={name,color:$('input[name=color]:checked').value,size:Number($('#planet-size').value),rings:$('#planet-rings').checked};
    planets.push(planet);renderer.createPlanet(planet);let persisted=true;try{localStorage.setItem('orbita.planets.v1',JSON.stringify(planets));}catch(_){persisted=false;}
    planetDialog.close();setScene('system',false);audio.planet();toast(`Планета «${name}» появилась во вселенной.${persisted?' Она будет ждать тебя здесь.':' Браузер не разрешил сохранить её после закрытия.'}`);
    $('#planet-name').value='';$('#planet-limit').textContent=`Твоих планет: ${planets.length} / 12. Сохраняются в этом браузере.`;
  });
  $('#planet-name').addEventListener('input',()=>$('#planet-name').setCustomValidity(''));
  if(planets.length)$('#planet-limit').textContent=`Твоих планет: ${planets.length} / 12. Сохраняются в этом браузере.`;
  function updateReduced(){renderer.setReducedMotion(reduced);document.body.classList.toggle('reduced',reduced);$('#reduce-motion').setAttribute('aria-pressed',String(reduced));$('#reduce-motion').textContent=reduced?'Вернуть обычное движение':'Уменьшить движение';}
  $('#reduce-motion').addEventListener('click',()=>{reduced=!reduced;updateReduced();});updateReduced();
  $('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('Этот браузер не поддерживает полноэкранный режим.');}catch(_){toast('Полноэкранный режим недоступен в этом окне.');}});
  $('#capture').addEventListener('click',()=>{
    try{
      const card=document.createElement('canvas');card.width=canvas.width;card.height=canvas.height;const c=card.getContext('2d');c.fillStyle='#070811';c.fillRect(0,0,card.width,card.height);c.drawImage(canvas,0,0);const scale=card.width/1200;
      const g=c.createLinearGradient(0,card.height*.68,0,card.height);g.addColorStop(0,'transparent');g.addColorStop(1,'#070811d9');c.fillStyle=g;c.fillRect(0,0,card.width,card.height);
      c.fillStyle='#e6dafa';c.font=`${Math.round(24*scale)}px Segoe UI, sans-serif`;c.fillText('О Р Б И Т А',45*scale,card.height-60*scale);c.fillStyle='#b6a7c9';c.font=`${Math.round(13*scale)}px Segoe UI, sans-serif`;c.fillText(scenes[scene].label+'   /   ТВОЯ МАЛЕНЬКАЯ БЕСКОНЕЧНОСТЬ',45*scale,card.height-34*scale);
      card.toBlob(blob=>{if(!blob){toast('Не удалось сохранить открытку.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`orbita-${scene}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);toast('Космическая открытка готова к сохранению.');},'image/png');
    }catch(_){toast('Браузер не разрешил сохранить изображение.');}
  });
  document.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey||event.repeat||event.target.closest('input,textarea,select')||document.querySelector('dialog[open]'))return;
    const key=event.key.toLowerCase();if(key==='h'||key==='р'){event.preventDefault();warp();}else if(key==='p'||key==='з'){if(!traveling)setPaused(!paused);}else if(key==='m'||key==='ь')toggleSound();else if(['1','2','3'].includes(key)&&!traveling)setScene(Object.keys(scenes)[Number(key)-1]);
  });
  document.addEventListener('visibilitychange',()=>{renderer.setPaused(document.hidden||paused);if(document.hidden&&audio.enabled){audio.disable();$('#sound').setAttribute('aria-pressed','false');$('#sound').setAttribute('aria-label','Включить звук');$('#sound').title='Включить звук · M';$('#sound use').setAttribute('href','#i-mute');}});
  window.addEventListener('pagehide',()=>{audio.disable();});
  updatePlanetPreview();
})();
