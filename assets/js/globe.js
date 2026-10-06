const section=document.querySelector('.globe-card');
if(section){
 const LOCATION=[3.139,101.687];
 const FOCUS_PHI=Math.PI-(LOCATION[1]*Math.PI/180-Math.PI/2);
 const FOCUS_THETA=LOCATION[0]*Math.PI/180;
 let createGlobe=window.createPortfolioGlobe,cleanup=null,near=false,loading=false;
 function mount(){
 const element=section.querySelector('canvas');
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motion.matches;
    let phi = FOCUS_PHI, theta = FOCUS_THETA, previousTime = 0;
    let elapsed = 0, width = element.clientWidth;
    let pointer = null;
    const markers = [{ location: LOCATION, size: .025 }];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let destroyed = false;
    let globe;
    try { globe = createGlobe(element, {
      devicePixelRatio: dpr, width: width * dpr, height: width * dpr,
      phi: FOCUS_PHI, theta: FOCUS_THETA, dark: document.documentElement.dataset.theme==='light'?0:1, diffuse: 1.4,
      mapSamples: 16000, mapBrightness: 3.6,
      baseColor: [.38, .38, .38], markerColor: [1, .06, .06],
      glowColor: [.16, .16, .16], markers,
      onRender: state => {
        if (destroyed) return;
        const time = performance.now();
        const delta = previousTime ? Math.min(time - previousTime, 50) : 16.67;
        previousTime = time;
        if (!reduced && !pointer) elapsed += delta;
        if (!pointer) {
          // Slow bounded drift keeps the marker near the front hemisphere.
          const targetPhi = FOCUS_PHI + (reduced ? 0 : Math.sin(elapsed / 8000) * .14);
          const targetTheta = FOCUS_THETA;
          const easing = reduced ? 1 : 1 - Math.pow(.92, delta / 16.67);
          const shortest = Math.atan2(Math.sin(targetPhi - phi), Math.cos(targetPhi - phi));
          phi += shortest * easing; theta += (targetTheta - theta) * easing;
        }
        markers[0].size = reduced ? .025 : .025 * (.55 + .45 * (.5 + .5 * Math.sin(elapsed / 220)));
        state.dark=document.documentElement.dataset.theme==='light'?0:1;state.baseColor=document.documentElement.dataset.theme==='light'?[.7,.7,.7]:[.38,.38,.38];state.markerColor=[1,.06,.06];state.glowColor=document.documentElement.dataset.theme==='light'?[.85,.85,.85]:[.16,.16,.16];state.phi = phi; state.theta = theta; state.markers = markers;
        state.width = width * dpr; state.height = width * dpr;
        element.style.opacity = "1";
      },
    });
    } catch { return; }
    const resize = new ResizeObserver(() => { width = element.clientWidth; });
    resize.observe(element);
    const change = () => { reduced = motion.matches; previousTime = 0; elapsed = 0; if (reduced) { phi = FOCUS_PHI; theta = FOCUS_THETA; pointer = null; } };
    const down = (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, phi, theta };
      element.setPointerCapture(event.pointerId); element.style.cursor = "grabbing";
    };
    const move = (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      phi = pointer.phi + (event.clientX - pointer.x) / Math.max(width, 1) * 3;
      theta = Math.max(-1.2, Math.min(1.2, pointer.theta + (event.clientY - pointer.y) / Math.max(width, 1) * 2));
    };
    const up = () => { pointer = null; elapsed = 0; element.style.cursor = "grab"; };
    motion.addEventListener("change", change);
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    element.addEventListener("lostpointercapture", up);
return ()=>{destroyed=true;resize.disconnect();globe.destroy();motion.removeEventListener('change',change);element.removeEventListener('pointerdown',down);element.removeEventListener('pointermove',move);element.removeEventListener('pointerup',up);element.removeEventListener('pointercancel',up);element.removeEventListener('lostpointercapture',up);element.style.opacity='0'};
 }
 function isVisibleCard(){return ['is-active','is-left','is-right'].some(name=>section.classList.contains(name))}
 async function sync(){
  if(!near||document.hidden||!isVisibleCard()){if(cleanup){cleanup();cleanup=null}return}
  if(cleanup||loading)return;
  if(!createGlobe)return;
  if(near&&!document.hidden&&isVisibleCard()&&!cleanup)cleanup=mount();
 }
 new IntersectionObserver(([entry])=>{near=entry.isIntersecting;sync()},{rootMargin:'300px'}).observe(section);
 document.addEventListener('visibilitychange',sync);section.closest('.about-coverflow').addEventListener('carouselchange',sync);
}
