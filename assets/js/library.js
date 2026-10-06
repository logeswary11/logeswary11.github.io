(()=>{
 const root=document.querySelector('.library-page');if(!root)return;
 const tabs=[...root.querySelectorAll('.lib-tab')],panels=[...root.querySelectorAll('.panel')],dialog=document.getElementById('portfolioDialog');let returnFocus;
 function activate(tab){if(tab.dataset.panel==='portfolio'){returnFocus=tab;dialog.showModal();dialog.querySelector('button').focus();return}tabs.forEach(t=>{const on=t===tab;t.classList.toggle('active',on);t.setAttribute('aria-pressed',String(on))});panels.forEach(p=>{const on=p.id===tab.dataset.panel;p.classList.toggle('active',on);p.hidden=!on})}
 tabs.forEach(tab=>{tab.type='button';tab.addEventListener('click',()=>activate(tab))});activate(tabs[0]);dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>returnFocus?.focus());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});

 const rows=document.getElementById('writingRows'),status=document.getElementById('writingUpdate');
 const TAG='Beyond the Pitch Deck';
 function isArticle(article){
  if(!article||typeof article.title!=='string'||!article.title.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(article.date||''))return false;
  try{const u=new URL(article.url);if(u.protocol!=='https:'||!['usescalinginsights.com','www.usescalinginsights.com'].includes(u.hostname)||!u.pathname.startsWith('/p/')||u.username||u.password||u.port)return false}catch{return false}
  if(/daily[\s_-]*brief/i.test(article.title+' '+article.url))return false;
  return article.source==='curated'||(Array.isArray(article.tags)&&article.tags.some(tag=>typeof tag==='string'&&tag.trim().toLowerCase()===TAG.toLowerCase()));
 }
 function render(data){
  if(!data||!Array.isArray(data.articles))return false;
  const articles=[...new Map(data.articles.filter(isArticle).map(a=>[a.url,a])).values()].sort((a,b)=>b.date.localeCompare(a.date));
  rows.replaceChildren();
  articles.forEach(article=>{
   const a=document.createElement('a');a.className='row';a.href=article.url;a.target='_blank';a.rel='noopener noreferrer';
   const time=document.createElement('time');time.dateTime=article.date;time.textContent=new Date(article.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
   const title=document.createElement('strong');title.textContent=article.title;
   const view=document.createElement('span');view.className='view-label';view.textContent='View';
   a.append(time,title,view);rows.append(a);
  });
  status.textContent=articles.length?'':'New essays will appear here soon.';
  return true;
 }
 render(window.LIBRARY_WRITINGS);
 let loading=false;
 async function refresh(){
  if(loading||document.hidden||location.protocol==='file:')return;
  loading=true;const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
  try{const response=await fetch('data/writings.json',{cache:'no-store',signal:controller.signal});if(response.ok)render(await response.json())}catch{/* Keep the bundled archive during temporary connectivity failures. */}
  finally{clearTimeout(timeout);loading=false}
 }
 refresh();setInterval(refresh,300000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();
