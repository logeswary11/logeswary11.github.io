/* Vanilla HTML adaptation of Magic UI Particles: quantity 240, ease 80, white. */
(()=>{
 const canvas=document.querySelector('.site-particles');if(!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let width=0,height=0,particles=[],frame=0,last=0,mouse={x:0,y:0};
 function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:width<600?160:240},()=>({x:Math.random()*width,y:Math.random()*height,r:Math.random()*1.5+.5,a:Math.random()*.35+.3,vx:(Math.random()-.5)*.12,vy:-Math.random()*.12-.02,tx:0,ty:0,depth:Math.random()*.7+.3}));draw(0);}
 function draw(delta){ctx.clearRect(0,0,width,height);particles.forEach(p=>{if(!motion.matches){p.x+=p.vx*delta;p.y+=p.vy*delta;p.tx+=(mouse.x*p.depth/25-p.tx)/80;p.ty+=(mouse.y*p.depth/25-p.ty)/80;if(p.y< -20)p.y=height+20;if(p.x< -20)p.x=width+20;if(p.x>width+20)p.x=-20;}const edge=Math.min(p.x,width-p.x,p.y,height-p.y);ctx.beginPath();ctx.arc(p.x+p.tx,p.y+p.ty,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(${document.documentElement.dataset.theme==='light'?'35,39,36':'255,255,255'},${p.a*Math.max(0,Math.min(1,edge/40))})`;ctx.fill();});}
 function tick(time){const delta=last?Math.min((time-last)/16.67,3):1;last=time;draw(delta);frame=requestAnimationFrame(tick)}
 function sync(){cancelAnimationFrame(frame);last=0;if(!document.hidden&&!motion.matches)frame=requestAnimationFrame(tick);else draw(0)}
 window.addEventListener('resize',()=>{resize();sync()},{passive:true});window.addEventListener('pointermove',e=>{mouse.x=e.clientX-width/2;mouse.y=e.clientY-height/2},{passive:true});document.addEventListener('pointerleave',()=>mouse={x:0,y:0});document.addEventListener('visibilitychange',sync);document.addEventListener('themechange',()=>draw(0));motion.addEventListener('change',()=>{particles.forEach(p=>{p.tx=0;p.ty=0});sync()});resize();sync();
})();
