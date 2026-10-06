/* Plain HTML adaptation of Magic UI's animated theme transition. */
(()=>{
 const root=document.documentElement,system=matchMedia('(prefers-color-scheme: light)');let saved;
 try{saved=localStorage.getItem('portfolio-theme')}catch{}
 function apply(theme){root.dataset.theme=theme;root.style.colorScheme=theme;document.querySelectorAll('.theme-toggle').forEach(b=>{b.setAttribute('aria-label',`Switch to ${theme==='dark'?'light':'dark'} mode`);b.setAttribute('aria-pressed',String(theme==='light'))});document.dispatchEvent(new Event('themechange'))}
 apply(saved==='light'||saved==='dark'?saved:system.matches?'light':'dark');
 document.addEventListener('DOMContentLoaded',()=>{apply(root.dataset.theme);document.querySelectorAll('.theme-toggle').forEach(button=>button.addEventListener('click',async()=>{const theme=root.dataset.theme==='dark'?'light':'dark';const change=()=>{apply(theme);saved=theme;try{localStorage.setItem('portfolio-theme',theme)}catch{}};if(!document.startViewTransition||matchMedia('(prefers-reduced-motion: reduce)').matches){change();return}const rect=button.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2,radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));const transition=document.startViewTransition(change);try{await transition.ready;root.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${radius}px at ${x}px ${y}px)`]},{duration:650,easing:'cubic-bezier(.2,.8,.2,1)',pseudoElement:'::view-transition-new(root)'})}catch{}}))});
 system.addEventListener('change',()=>{if(!saved)apply(system.matches?'light':'dark')});window.addEventListener('storage',event=>{if(event.key==='portfolio-theme'){saved=event.newValue;apply(saved|| (system.matches?'light':'dark'))}});
})();
