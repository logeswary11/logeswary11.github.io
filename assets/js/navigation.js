/* Shared page navigation. Routes remain the existing static HTML destinations. */
(()=>{
 const header=document.querySelector('.site-header');if(!header)return;
 const nav=header.querySelector('.editorial-nav'),list=nav.querySelector('ul'),links=[...nav.querySelectorAll('a')],indicator=nav.querySelector('.nav-underline'),menu=header.querySelector('.menu-control');
 const file=location.pathname.split('/').pop()||'index.html';
 const active=links.find(link=>new URL(link.href,location.href).pathname.split('/').pop()===file)||links[0];
 links.forEach(link=>{if(link===active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
 function move(link){if(getComputedStyle(menu).display!=='none')return;const r=link.getBoundingClientRect(),n=nav.getBoundingClientRect();indicator.style.width=r.width+'px';indicator.style.transform='translateX('+(r.left-n.left)+'px)';indicator.style.opacity='1'}
 function close(restore=false){header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');if(restore)menu.focus()}
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';header.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));if(open)active.focus()});
 links.forEach(link=>{link.addEventListener('pointerenter',()=>move(link));link.addEventListener('focus',()=>move(link));link.addEventListener('click',()=>close())});
 nav.addEventListener('pointerleave',()=>move(nav.contains(document.activeElement)?document.activeElement:active));nav.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!nav.contains(document.activeElement))move(active)}));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&header.classList.contains('menu-open'))close(true)});
 document.addEventListener('pointerdown',event=>{if(!header.contains(event.target))close()});
 header.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!header.contains(document.activeElement))close()}));
 let frame;
 function size(){header.classList.remove('is-compact');if(innerWidth>1100){const n=nav.getBoundingClientRect(),b=header.querySelector('.brand-flip').getBoundingClientRect(),s=header.querySelector('.top').getBoundingClientRect();header.classList.toggle('is-compact',n.left<b.right+24||n.right>s.left-24)}if(getComputedStyle(menu).display==='none')close();move(active)}
 window.addEventListener('resize',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(size)});
 function scroll(){header.classList.toggle('is-scrolled',scrollY>16)}window.addEventListener('scroll',scroll,{passive:true});scroll();size();document.fonts.ready.then(size);
})();
