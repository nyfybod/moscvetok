
(() => {
 'use strict';
 const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];
 const cards=$$('.product');let category='all',limit=9;const money=new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0});
 const menu=$('.menu-toggle'),nav=$('.nav');
 function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}
 menu.addEventListener('click',()=>{let open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
 nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
 function render(){
  const budget=$('#budget').checked;
  const matches=cards.filter(c=>(category==='all'||c.dataset.group===category)&&(!budget||Number(c.dataset.price)<=4000));
  const sort=$('#sort').value;
  if(sort==='low')matches.sort((a,b)=>+a.dataset.price-+b.dataset.price);
  if(sort==='high')matches.sort((a,b)=>+b.dataset.price-+a.dataset.price);
  cards.forEach(c=>c.hidden=true);matches.forEach((c,i)=>{$('.catalog-grid').append(c);c.hidden=i>=limit;});
  $('#catalog-status').textContent=`Показано ${Math.min(limit,matches.length)} из ${matches.length}`;
  $('#show-more').hidden=limit>=matches.length;$('#empty').hidden=matches.length>0;
 }
 $$('.chip').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.filter;limit=9;$$('.chip').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));render();}));
 $('#budget').addEventListener('change',()=>{limit=9;render();});$('#sort').addEventListener('change',()=>{limit=9;render();});
 $('#reset').addEventListener('click',()=>{category='all';limit=9;$('#budget').checked=false;$('#sort').value='default';$$('.chip').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.filter==='all')));render();$('.chip').focus();});
 $('#show-more').addEventListener('click',()=>{const before=new Set(cards.filter(c=>!c.hidden));limit+=9;render();const first=cards.find(c=>!c.hidden&&!before.has(c));first?.querySelector('button')?.focus({preventScroll:true});});
 const dialog=$('#viewer');let group=[],index=0,origin=null,oldOverflow='';
 function paint(){const el=group[index],product=el.closest('.product');$('#viewer-image').src=el.dataset.image;$('#viewer-image').alt=el.dataset.title;$('#viewer-title').textContent=el.dataset.title;$('#viewer-price').textContent=product?money.format(Number(product.dataset.price)):'';$('#viewer-note').textContent=product?'Цена из опубликованного прайс-листа. Наличие, состав и итоговую стоимость уточните у флориста.':'Фотография магазина или его работы с Яндекс Карт. Цена по этой фотографии не определяется.';$('#viewer-order').hidden=!product;$('#viewer-source').href=el.dataset.source;$('#viewer-count').textContent=`${index+1} / ${group.length}`;}
 $$('[data-view]').forEach(el=>el.addEventListener('click',()=>{origin=el;group=el.dataset.view==='gallery'?$$('[data-view="gallery"]'):$$('.product:not([hidden]) [data-view="product"]');index=group.indexOf(el);paint();oldOverflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';$('.dialog-close').focus();}));
 $('#viewer-prev').addEventListener('click',()=>{index=(index-1+group.length)%group.length;paint();});$('#viewer-next').addEventListener('click',()=>{index=(index+1)%group.length;paint();});
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){$('#viewer-next').click();e.preventDefault();}if(e.key==='ArrowLeft'){$('#viewer-prev').click();e.preventDefault();}});
 $('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;origin?.focus({preventScroll:true});});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 render();
})();

/* Motion enhances visible content; it never controls availability or layout. */
(() => {
  'use strict';
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!Element.prototype.animate || !('IntersectionObserver' in window)) return;
  const running = new Map();
  const seen = new WeakSet();
  const play = (element, delay = 0, distance = 20) => {
    if (seen.has(element) || preference.matches || element.contains(document.activeElement)) return;
    seen.add(element);
    const animation = element.animate([
      {opacity: 0, transform: `translateY(${distance}px)`},
      {opacity: 1, transform: 'translateY(0)'}
    ], {duration: 560, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards'});
    running.set(element, animation);
    const cleanup = () => { if (running.get(element) === animation) running.delete(element); };
    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
  };
  document.querySelectorAll('.hero-art, .hero-copy > *').forEach((element, index) => {
    play(element, Math.min(index * 65, 260), 16);
  });
  const observer = new IntersectionObserver(entries => {
    let stagger = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      play(entry.target, Math.min(stagger++ * 55, 165));
      observer.unobserve(entry.target);
    });
  }, {threshold: 0.08, rootMargin: '0px 0px -24px 0px'});
  document.querySelectorAll('.section-head, .product, .service, .about-grid, .gallery-photo, .review, .faq-grid, .contact-panel').forEach(element => observer.observe(element));
  document.addEventListener('focusin', event => {
    running.forEach((animation, element) => {
      if (element.contains(event.target)) animation.cancel();
    });
  });
  preference.addEventListener('change', () => {
    if (preference.matches) running.forEach(animation => animation.cancel());
  });
})();
