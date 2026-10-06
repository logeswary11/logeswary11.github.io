/* Fill one cycle to at least the viewport width, then duplicate it exactly.
   ResizeObserver runs only when the ticker width changes, never per frame. */
(() => {
 document.querySelectorAll('.ticker-wrap .ticker').forEach(track => {
  const original = [...track.children].filter(el => el.tagName === 'SPAN');
  if (!original.length) return;
  const first = original[0].textContent.trim();
  const repeat = original.findIndex((el, i) => i > 0 && el.textContent.trim() === first);
  const items = original.slice(0, repeat > 0 ? repeat : original.length);
  const group = document.createElement('div'); group.className = 'ticker-loop-group';
  let width = -1;
  const fill = () => {
   const nextWidth = track.parentElement.clientWidth;
   if (nextWidth === width || !nextWidth) return;
   width = nextWidth;
   group.replaceChildren(...items.map(el => el.cloneNode(true)));
   track.replaceChildren(group); track.classList.add('is-seamless');
   let repeats = 0;
   while (group.getBoundingClientRect().width < nextWidth && repeats++ < 32) {
    group.append(...items.map(el => el.cloneNode(true)));
   }
   const copy = group.cloneNode(true); copy.setAttribute('aria-hidden', 'true');
   track.append(copy);
  };
  fill();
  if ('ResizeObserver' in window) new ResizeObserver(fill).observe(track.parentElement);
  else window.addEventListener('resize', fill, {passive:true});
  if (document.fonts) document.fonts.ready.then(() => {width = -1; fill();});
 });
})();
