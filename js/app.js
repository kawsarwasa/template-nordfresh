'use strict';
// Self-contained storefront DEMO. Product information, reviews and promotions are sample data.
const categories = NordFreshCatalog.categories.map(c=>({id:c.id,label:c.name,img:c.image.replace('cat-','').replace('.webp','')}));
const products = NordFreshCatalog.products;
const $=s=>document.querySelector(s), svg=(name,cls='ico')=>`<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const money=n=>'Rs. '+Number(n).toLocaleString('en-PK');
const imagePath=id=>NordFreshCatalog.src(productById[id]);
const categoryGrid=$('#categoriesGrid'), dealsGrid=$('#dealsGrid'), recommendedGrid=$('#recommendedGrid');
const productById=Object.fromEntries(products.map(p=>[p.id,p]));
const cardMarkup=(p,compact=false)=>`<article class="product-card${compact?' compact':''}" data-id="${p.id}" data-category="${p.category}">
  <div class="product-thumb"><a class="product-picture-link" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="View ${p.name}"><img loading="lazy" decoding="async" src="${imagePath(p.id)}" alt="${p.name}" width="270" height="196" /></a>${p.badge?`<span class="discount">-${p.badge}%</span>`:''}</div>
  <div class="product-info"><h3><a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a></h3><span class="product-unit">(${p.unit})</span><div class="price-row"><strong class="price">${money(p.price)}</strong>${p.old?`<span class="old-price">${money(p.old)}</span>`:''}</div>
  <button type="button" class="add-button" data-add="${p.id}" aria-label="Add ${p.name} to cart">${svg('cart')}<span>Add to Cart</span></button></div></article>`;
function renderProducts(){
  dealsGrid.innerHTML=products.filter(p=>p.home==='deals').map(p=>cardMarkup(p)).join('');
  recommendedGrid.innerHTML=products.filter(p=>p.home==='recommended').map(p=>cardMarkup(p,true)).join('');
  const ranked=['bananas','eggs','chicken','rice','milk'];
  $('#bestSellers').innerHTML=ranked.map((id,index)=>{const p=productById[id];return `<div class="seller-row"><span class="seller-rank">${index+1}</span><img loading="lazy" decoding="async" width="47" height="47" src="${imagePath(p.id)}" alt=""/><div><strong>${p.name} (${p.unit})</strong><small>${money(p.price)}</small></div><button data-add="${p.id}" type="button" aria-label="Add ${p.name} to cart">${svg('cart')}</button></div>`}).join('');
}
function renderCategories(){
  categoryGrid.innerHTML=categories.map(c=>`<button class="category-tile" type="button" data-filter="${c.id}" aria-label="View ${c.label}"><span class="category-image"><img src="assets/cat-${c.img}.webp" alt="" width="204" height="188" loading="lazy" decoding="async"/></span><span>${c.label}</span></button>`).join('');
  $('#popoverCategoryList').innerHTML=`<button type="button" data-filter="all">All Products</button>`+categories.map(c=>`<button type="button" data-filter="${c.id}">${c.label}</button>`).join('');
}
renderProducts();renderCategories();
// Filter/search products in both sections; no remote request.
let activeCategory='all', query='';
function applyFilters(){
  let count=0,dealCount=0;
  document.querySelectorAll('.product-card').forEach(card=>{
    const p=productById[card.dataset.id];
    const matchCategory=activeCategory==='all'||p.category===activeCategory;
    const searchable=`${p.name} ${p.unit} ${p.category}`.toLowerCase();
    const visible=matchCategory && searchable.includes(query);
    card.hidden=!visible;
    if(visible){count++;if(!p.featured)dealCount++}
  });
  $('#noDeals').hidden=dealCount>0 || count>0;
  const feedback=$('#searchFeedback');
  feedback.hidden=activeCategory==='all'&&!query;
  if(!feedback.hidden){
    const title=activeCategory==='all'?'all categories':categories.find(c=>c.id===activeCategory)?.label||activeCategory;
    feedback.textContent=`Showing ${count} product${count===1?'':'s'} in ${title}${query?' matching “'+query+'”':''}.`;
  }
  document.querySelectorAll('.category-tile').forEach(el=>el.classList.toggle('active',el.dataset.filter===activeCategory));
}
function changeCategory(id){window.location.href='shop.html'+(id==='all'?'':'?category='+encodeURIComponent(id==='vegetables'?'fruits':id));}
document.addEventListener('click',e=>{
 const cat=e.target.closest('[data-filter]');if(cat){e.preventDefault();changeCategory(cat.dataset.filter);return}
 const add=e.target.closest('[data-add]');if(add){addToCart(add.dataset.add);return}
 const demo=e.target.closest('[data-demo]');if(demo){e.preventDefault();showToast(`${demo.dataset.demo} is a demo link — connect your backend to enable it.`)}
});
$('#searchForm').addEventListener('submit',e=>{e.preventDefault();window.location.href='shop.html'+($('#searchInput').value.trim()?'?q='+encodeURIComponent($('#searchInput').value.trim()):'');});
$('#searchInput').addEventListener('input',e=>{if(!e.target.value.trim()){query='';activeCategory='all';applyFilters();}});
$('#showAllDeals').addEventListener('click',e=>{e.preventDefault();window.location.href='shop.html?sort=discount'});
$('#showAllRecommended').addEventListener('click',e=>{e.preventDefault();window.location.href='shop.html?sort=popular'});
$('#viewCategories').addEventListener('click',e=>{e.preventDefault();window.location.href='shop.html'});
const categoryPopover=$('#categoryPopover');
$('#categoryToggle').addEventListener('click',()=>{const visible=categoryPopover.hidden;categoryPopover.hidden=!visible;$('#categoryToggle').setAttribute('aria-expanded',String(visible))});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.nav-strip')){categoryPopover.hidden=true;$('#categoryToggle').setAttribute('aria-expanded','false')}});
$('#cityButton').addEventListener('click',()=>showToast('Delivery location is Karachi (demo).'));
$('#wishlistButton').addEventListener('click',()=>window.location.href='wishlist.html');
// Cart with quantity update and browser-side persistence.
let cart={};try{const existing=JSON.parse(localStorage.getItem('nordfresh-demo-cart')||'{}');if(existing&&typeof existing==='object'&&!Array.isArray(existing))cart=NordFreshCatalog.readCart();}catch(_){cart={}}
function persistCart(){try{NordFreshCatalog.writeCart(cart)}catch(_){} }
function cartCount(){return Object.values(cart).reduce((a,b)=>a+b,0)}
function updateCart(){
 const count=cartCount();$('#cartCount').textContent=String(count);$('#drawerCount').textContent=`(${count})`;
 $('#cartSubtotal').textContent=money(Object.entries(cart).reduce((sum,[id,qty])=>sum+NordFreshCatalog.cartItem(id).price*qty,0));
 const list=$('#cartItems');
 if(!count){list.innerHTML=`<div class="cart-empty">${svg('cart')}<p>Your cart is empty.<br/>Add some fresh groceries to get started.</p></div>`;return}
 list.innerHTML=Object.entries(cart).map(([id,qty])=>{const info=NordFreshCatalog.cartItem(id),p=info.product;return `<div class="cart-line"><img src="${imagePath(p.id)}" alt="${p.name}" width="62" height="62"/><div><strong><a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a></strong><small>${info.unit} · ${money(info.price)}</small><div class="qty-controls"><button type="button" data-qty="${id}" data-change="-1" aria-label="Remove one ${p.name}">${svg('minus')}</button><span>${qty}</span><button type="button" data-qty="${id}" data-change="1" aria-label="Add one ${p.name}">${svg('plus')}</button></div></div><span class="cart-line-total">${money(info.price*qty)}</span></div>`}).join('');
}
function addToCart(id){if(!productById[id])return;cart[id]=Math.min((cart[id]||0)+1,99);persistCart();updateCart();showToast(`${productById[id].name} added to cart`)}
$('#cartItems').addEventListener('click',e=>{const btn=e.target.closest('[data-qty]');if(!btn)return;const id=btn.dataset.qty;cart[id]=(cart[id]||0)+Number(btn.dataset.change);if(cart[id]<=0)delete cart[id];cart[id]=Math.min(cart[id]||0,99);if(!cart[id])delete cart[id];persistCart();updateCart()});
const drawer=$('#cartDrawer'),backdrop=$('#cartBackdrop');
function openCart(){backdrop.hidden=false;requestAnimationFrame(()=>backdrop.classList.add('open'));drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#closeCart').focus()}
function closeCart(){backdrop.classList.remove('open');drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.style.overflow='';setTimeout(()=>{if(!drawer.classList.contains('open'))backdrop.hidden=true},260)}
$('#openCart').addEventListener('click',openCart);$('#mobileCart').addEventListener('click',openCart);$('#closeCart').addEventListener('click',closeCart);backdrop.addEventListener('click',closeCart);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('open'))closeCart();if(e.key==='Escape'){categoryPopover.hidden=true;$('#categoryToggle').setAttribute('aria-expanded','false')}});
$('#checkoutButton').textContent='View Full Cart';$('#checkoutButton').addEventListener('click',()=>{location.href='cart.html'});
updateCart();
window.addEventListener('storage',e=>{if(e.key==='nordfresh-demo-cart'){cart=NordFreshCatalog.readCart();updateCart()}});
// Countdown to midnight in the browser time zone (sample daily-deal UI).
function tickClock(){let end=new Date();end.setHours(24,0,0,0);let secs=Math.max(0,Math.floor((end-Date.now())/1000));const h=String(Math.floor(secs/3600)).padStart(2,'0');const m=String(Math.floor(secs%3600/60)).padStart(2,'0');const s=String(secs%60).padStart(2,'0');$('#timer').textContent=`${h} : ${m} : ${s}`}
tickClock();setInterval(tickClock,1000);
let toastTimer;function showToast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}
$('#newsletterForm').addEventListener('submit',e=>{e.preventDefault();if(!$('#newsletterForm').reportValidity())return;showToast('Newsletter form is ready — connect an email service to save subscribers.');e.target.reset()});
