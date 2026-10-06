/* Single-open accordion fallback for browsers without details[name] support. */
(()=>{const root=document.querySelector('.work-faq-list');if(!root)return;const items=[...root.querySelectorAll('details')];items.forEach(item=>item.addEventListener('toggle',()=>{if(item.open)items.forEach(other=>{if(other!==item)other.open=false})}));})();
