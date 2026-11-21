'use strict';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && 'IntersectionObserver' in window) document.documentElement.classList.add('js-ready');
const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
const menu = document.querySelector('.menu-button');
const nav = document.querySelector('#nav');
const closeMenu = () => {menu?.setAttribute('aria-expanded','false'); menu?.setAttribute('aria-label','Open navigation'); nav?.classList.remove('open')};
menu?.addEventListener('click', () => {const open = menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open)});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
document.addEventListener('click',e=>{if(nav?.classList.contains('open')&&!nav.contains(e.target)&&!menu.contains(e.target))closeMenu()});
window.matchMedia('(min-width: 761px)').addEventListener('change',closeMenu);
if (!reducedMotion && 'IntersectionObserver' in window){const observer=new IntersectionObserver((entries,obs)=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');obs.unobserve(entry.target)}}},{threshold:.07,rootMargin:'0px 0px 90px 0px'});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
const progress=document.querySelector('.page-progress');
let ticking=false;
function updateScroll(){const max=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.width=`${max>0?Math.max(0,Math.min(100,scrollY/max*100)):0}%`;ticking=false}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updateScroll)}},{passive:true});addEventListener('resize',updateScroll);updateScroll();
if('IntersectionObserver' in window){const links=[...document.querySelectorAll('.nav a')];const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){links.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+e.target.id))}})},{rootMargin:'-25% 0px -60% 0px'});document.querySelectorAll('#work,#expertise,#about').forEach(s=>obs.observe(s))}
const copyBtn=document.querySelector('.copy-email');const copyFeedback=document.querySelector('.copy-feedback');
copyBtn?.addEventListener('click',async()=>{const email=copyBtn.dataset.email;try{await navigator.clipboard.writeText(email);copyFeedback.textContent='Email copied to clipboard.'}catch{copyFeedback.textContent='Copy this address: '+email}});
const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
const submitButton = form?.querySelector('button[type="submit"]');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  if (form.querySelector('[name="_honey"]')?.value) return;

  const name = form.elements.namedItem('name').value.trim();
  const email = form.elements.namedItem('email').value.trim();
  const message = form.elements.namedItem('message').value.trim();
  if (name.length < 2 || message.length < 10) {
    status.textContent = 'Please enter your name and a message of at least 10 characters.';
    return;
  }

  submitButton.disabled = true;
  submitButton.querySelector('.submit-text').textContent = 'SENDING…';
  status.textContent = 'Sending your message…';

  const data = new FormData(form);
  data.set('name', name);
  data.set('email', email);
  data.set('message', message);
  data.delete('_honey');
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      let result = {};
      try { result = await response.json(); } catch (_) {}
      const details = result.errors?.map(error => error.message).filter(Boolean).join(' ') || result.error || 'Please try again.';
      throw new Error(details);
    }
    status.textContent = 'Your message was sent successfully. Thank you!';
    form.reset();
  } catch (error) {
    status.textContent = 'Could not send the message. Please try again or copy the email address shown here.';
    console.warn('Contact form submission failed:', error);
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector('.submit-text').textContent = 'SEND MESSAGE';
  }
});

const cursorDot=document.querySelector('.cursor-dot');
const cursorRing=document.querySelector('.cursor-ring');
if(cursorDot&&cursorRing&&window.matchMedia('(min-width: 761px)').matches&&!reducedMotion){
  let mouseX=window.innerWidth/2, mouseY=window.innerHeight/2, ringX=mouseX, ringY=mouseY;
  const ringLabel=cursorRing.querySelector('span');
  const show=()=>{cursorDot.style.opacity='1';cursorRing.style.opacity='1'};
  const hide=()=>{cursorDot.style.opacity='0';cursorRing.style.opacity='0';cursorRing.classList.remove('is-active')};
  // Inputs, textareas and editable content use the native text-selection cursor.
  const isEditingTarget = target => target instanceof Element && !!target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
  window.addEventListener('mousemove',e=>{
    mouseX=e.clientX;
    mouseY=e.clientY;
    if (isEditingTarget(e.target)) {
      hide();
      return;
    }
    show();
    cursorDot.style.left=mouseX+'px';
    cursorDot.style.top=mouseY+'px';
  },{passive:true});
  window.addEventListener('mouseleave',hide);
  const animate=()=>{ringX += (mouseX-ringX)*0.16; ringY += (mouseY-ringY)*0.16; cursorRing.style.left=ringX+'px'; cursorRing.style.top=ringY+'px'; requestAnimationFrame(animate)};
  animate();
  const interactive=document.querySelectorAll('a, button, .project-cover');
  interactive.forEach(el=>{
    el.addEventListener('mouseenter',()=>{
      cursorRing.classList.add('is-active');
      const label=el.getAttribute('data-cursor');
      if(ringLabel) ringLabel.textContent=label||'OPEN';
    });
    el.addEventListener('mouseleave',()=>cursorRing.classList.remove('is-active'));
  });
  document.querySelectorAll('input, textarea, select, [contenteditable]:not([contenteditable="false"])').forEach(el=>{
    el.addEventListener('mouseenter',hide);
    el.addEventListener('focus',hide);
  });
}


// V5: lightweight native motion enhancements. Never prevent standard scrolling.
(function initialiseMotion(){
  if (reducedMotion || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('motion-ready');
  // The initial screen retains its original layout. Stagger only the supporting UI.
  const heroPieces=document.querySelectorAll('.hero-intro');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    heroPieces.forEach(piece=>piece.classList.add('intro-visible'));
  }));
  const editorialObserver=new IntersectionObserver((entries,observer)=>{
    for(const entry of entries){
      if(!entry.isIntersecting) continue;
      const target=entry.target.querySelector('.statement-text') || entry.target;
      target.classList.add('motion-shown');
      if(entry.target.classList.contains('about-grid')) entry.target.querySelector('h2.reveal')?.classList.add('visible');
      observer.unobserve(entry.target);
    }
  },{threshold:0.12,rootMargin:'0px 0px 40px 0px'});
  document.querySelectorAll('.statement-inner, .about-grid').forEach(el=>editorialObserver.observe(el));

  // Localized light follows pointer only inside hero; no animated decoration.
  const hero=document.querySelector('[data-motion-hero]');
  if(hero && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    let raf=0;
    hero.addEventListener('pointermove',event=>{
      if(raf) return;
      const x=event.clientX,y=event.clientY;
      raf=requestAnimationFrame(()=>{
        const box=hero.getBoundingClientRect();
        hero.style.setProperty('--hero-x',`${x-box.left}px`);
        hero.style.setProperty('--hero-y',`${y-box.top}px`);
        hero.classList.add('is-pointed');raf=0;
      });
    },{passive:true});
    hero.addEventListener('pointerleave',()=>hero.classList.remove('is-pointed'));
  }

  // Short-lived scroll cue. Browsers keep their native scroll mechanics.
  const cue=document.querySelector('.scroll-cue');
  const updateCue=()=>cue?.classList.toggle('is-hidden',window.scrollY>90);
  updateCue();
  window.addEventListener('scroll',updateCue,{passive:true});
})();

// V6: viewport-bound ambient illumination (never cropped to the hero grid).
(function ambientLight(){
  const hero=document.querySelector('[data-motion-hero]');
  const light=document.querySelector('.hero-viewport-light');
  if(!hero||!light||reducedMotion||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  // Disable the old container-clipped effect; this one follows viewport coordinates.
  hero.addEventListener('pointermove',e=>{
    light.style.setProperty('--spot-x',`${e.clientX}px`);
    light.style.setProperty('--spot-y',`${e.clientY}px`);
    light.classList.add('is-visible');
  },{passive:true});
  hero.addEventListener('pointerleave',()=>light.classList.remove('is-visible'));
  window.addEventListener('blur',()=>light.classList.remove('is-visible'));
})();

// V6: type responds to pointer proximity — an original, restrained kinetic treatment.
(function kineticTypography(){
  const section=document.querySelector('.motion-feature');
  if(!section)return;
  const rows=[...section.querySelectorAll('[data-letter-row]')];
  for(const row of rows){
    const word=row.getAttribute('data-letter-row');
    row.textContent='';
    for(const character of word){
      const el=document.createElement('span');
      el.className='motion-letter'+(character===' '?' is-space':'');
      el.setAttribute('aria-hidden','true');
      el.textContent=character===' '?'\u00a0':character;
      row.append(el);
    }
  }
  if(reducedMotion||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  const letters=[...section.querySelectorAll('.motion-letter:not(.is-space)')];
  let frame=0, x=0, y=0;
  function update(){
    frame=0;
    for(const letter of letters){
      const bounds=letter.getBoundingClientRect();
      const midX=bounds.left+bounds.width/2;
      const midY=bounds.top+bounds.height/2;
      const dx=x-midX,dy=y-midY;
      const distance=Math.hypot(dx,dy);
      const proximity=Math.max(0,1-distance/195);
      const offsetX=proximity*(dx>0?-1:1)*Math.min(14,Math.abs(dx)*.15);
      const offsetY=-proximity*12;
      const rotation=proximity*(dx>0?4:-4);
      letter.style.transform=`translate3d(${offsetX.toFixed(2)}px,${offsetY.toFixed(2)}px,0) skewY(${rotation.toFixed(2)}deg) scaleY(${(1+proximity*.09).toFixed(3)})`;
      letter.classList.toggle('is-near',proximity>.14);
    }
  }
  section.addEventListener('pointermove',e=>{
    x=e.clientX;y=e.clientY;
    if(!frame)frame=requestAnimationFrame(update);
    section.classList.add('is-interacting');
  },{passive:true});
  section.addEventListener('pointerleave',()=>{
    if(frame)cancelAnimationFrame(frame);
    frame=0;
    section.classList.remove('is-interacting');
    for(const letter of letters){letter.style.transform='';letter.classList.remove('is-near')}
  });
})();
