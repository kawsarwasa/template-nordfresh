
'use strict';
/* Local browser preview: real order tracking needs an authenticated backend API. */
(() => {
const C=window.NordFreshCatalog;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const form=$('#trackForm'), feedback=$('#trackFeedback'), phoneInput=$('#trackPhone'), orderInput=$('#trackOrderNumber'), timeline=$('#trackTimeline');
const stages=[
 ['Order Placed','Your order has been received.'],['Order Confirmed','We are preparing your order.'],
 ['Processing','Your items are being packed.'],['Out for Delivery','On the way to you.'],
 ['Delivered','Enjoy your groceries!']
];
const say=(message,ok=false)=>{feedback.textContent=message;feedback.classList.toggle('is-good',ok)};
const normalizedPhone=value=>{let digits=String(value??'').replace(/\D/g,'');if(digits.startsWith('8801')&&digits.length===13)digits=digits.slice(2);return digits};
const readSavedOrder=()=>{try{const p=JSON.parse(localStorage.getItem('nordfresh-demo-last-order')||'null');return p&&typeof p.orderNumber==='string'&&typeof p.customer?.phone==='string'?p:null}catch(_){return null}};
function drawTimeline(order){
 const active=Boolean(order);
 $$('.to-step').forEach((step,i)=>{
   const complete=active?i===0:i<2;
   step.classList.toggle('is-complete',complete);step.classList.toggle('is-pending',!complete);
   const dot=step.querySelector('.to-step-dot');dot.replaceChildren();
   if(complete){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','ico');svg.setAttribute('aria-hidden','true');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#i-check');svg.append(use);dot.append(svg)}
   const block=step.querySelector('div');block.querySelector('strong').textContent=stages[i][0];
   let small=block.querySelector('small');if(!small){small=document.createElement('small');block.insertBefore(small,block.querySelector('p'))}
   const when=active&&i===0&&order.createdAt&&Number.isFinite(Date.parse(order.createdAt))?new Intl.DateTimeFormat('en-BD',{dateStyle:'medium',timeStyle:'short'}).format(new Date(order.createdAt)):'';
   small.textContent=active?when:i===0?'Example: Oct 12, 2026 · 10:30 AM':i===1?'Example: Oct 12, 2026 · 11:15 AM':'';
   small.hidden=!small.textContent;
   block.querySelector('p').textContent=active?(i===0?'Checkout details saved in this browser (demo only).':'No live status update available.'):stages[i][1];
 });
 $('#trackingStatusHeading').textContent=active?'Your Demo Order Status':'Sample Order Status';
 $('#trackingStatusNote').textContent=active?'Order '+order.orderNumber:'Illustrative timeline';
 $('#trackStatusFootnote').textContent=active?'This record is saved only in this browser. Carrier tracking requires a live order system.':'This is an example, not a live shipment.';
}
const saved=readSavedOrder();if(saved&&/^[A-Z0-9-]{8,36}$/i.test(saved.orderNumber))orderInput.value=saved.orderNumber;
$('#cartCount').textContent=String(Object.values(C.readCart()).reduce((s,n)=>s+n,0));
form.addEventListener('submit',e=>{
 e.preventDefault();const number=orderInput.value.trim(),phone=normalizedPhone(phoneInput.value);
 orderInput.setAttribute('aria-invalid',String(number.length<8));phoneInput.setAttribute('aria-invalid',String(!/^01[3-9]\d{8}$/.test(phone)));
 if(number.length<8){say('Please enter your complete order number.');orderInput.focus();return}
 if(!/^01[3-9]\d{8}$/.test(phone)){say('Enter a valid Bangladesh mobile number, e.g. 01712345678.');phoneInput.focus();return}
 const found=readSavedOrder();
 if(!found||found.orderNumber.trim().toLowerCase()!==number.toLowerCase()||normalizedPhone(found.customer.phone)!==phone){drawTimeline(null);say('No matching demo order was found in this browser. Real tracking will be available when the backend is connected.');return}
 drawTimeline(found);say('Saved demo checkout found. The timeline is not connected to courier updates.',true);
});
orderInput.addEventListener('input',()=>orderInput.removeAttribute('aria-invalid'));phoneInput.addEventListener('input',()=>phoneInput.removeAttribute('aria-invalid'));
$('#contactSupport').addEventListener('click',()=>say('Support details are not connected in this frontend demo. Use NordFresh’s official support channel.'));
$('#searchForm').addEventListener('submit',e=>{e.preventDefault();const q=$('#searchInput').value.trim();location.href='shop.html'+(q?'?q='+encodeURIComponent(q):'')});
$('#wishlistButton').addEventListener('click',()=>location.href='shop.html?wishlist=1');
$('#openCart').addEventListener('click',()=>location.href='cart.html');
$('#mobileCart').addEventListener('click',()=>location.href='cart.html');
$('#cityButton').addEventListener('click',()=>say('Delivery charges: Dhaka City ৳70 · Other areas ৳130.'));
$('#popoverCategoryList').innerHTML='<a href="shop.html">All Products</a>'+C.categories.map(c=>'<a href="shop.html?category='+encodeURIComponent(c.id)+'">'+c.name+'</a>').join('');
const pop=$('#categoryPopover');$('#categoryToggle').addEventListener('click',()=>{pop.hidden=!pop.hidden;$('#categoryToggle').setAttribute('aria-expanded',String(!pop.hidden))});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.nav-strip')){pop.hidden=true;$('#categoryToggle').setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){pop.hidden=true;$('#categoryToggle').setAttribute('aria-expanded','false')}});
document.addEventListener('click',e=>{if(e.target.closest('[data-demo]')){e.preventDefault();say('This service is not connected in the frontend preview.')}});
drawTimeline(null);
})();
