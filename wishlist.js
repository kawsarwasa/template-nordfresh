'use strict';
/* NordFresh locally saved favourites. Real inventory will come from the Django API. */
(()=>{
const C=window.NordFreshCatalog, $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g, x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const money=n=>'৳'+Number(n).toLocaleString('en-BD');
const icon=(name)=>`<svg aria-hidden="true" class="ico"><use href="#i-${name}"></use></svg>`;
const outOfStock=p=>p.stock===0||p.inStock===false||p.outOfStock===true;
let wish=C.readWishlist(), filter='all', sort='newest', qty={}, selected=new Set(),toastTimeout;
const numberEl=$('#cartCount'),list=$('#wlItems'),empty=$('#wlEmpty'),bulk=$('#wlBulk');
function syncCart(){numberEl.textContent=String(Object.values(C.readCart()).reduce((sum,n)=>sum+n,0))}
function notify(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),2600)}
function normalize(){wish=C.readWishlist();selected=new Set([...selected].filter(id=>wish.includes(id)));}
function displayed(){let items=wish.map(id=>C.byId[id]).filter(Boolean);if(filter==='out')items=items.filter(outOfStock);if(sort==='newest')items.reverse();else if(sort==='price-low')items.sort((a,b)=>a.price-b.price);else if(sort==='price-high')items.sort((a,b)=>b.price-a.price);else if(sort==='name')items.sort((a,b)=>a.name.localeCompare(b.name));return items}
function render(){normalize();const products=displayed(),outCount=wish.map(id=>C.byId[id]).filter(p=>p&&outOfStock(p)).length;
  $('#wlAllCount').textContent=`(${wish.length})`;$('#wlOutCount').textContent=`(${outCount})`;
  $$('.wl-tab').forEach(el=>{const active=el.dataset.filter===filter;el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active))});
  $('#wlClear').disabled=wish.length===0;list.hidden=products.length===0;empty.hidden=products.length!==0;
  bulk.hidden=wish.length===0;const checkAll=$('#wlSelectAll');checkAll.checked=products.length>0&&products.every(p=>selected.has(p.id));checkAll.indeterminate=products.some(p=>selected.has(p.id))&&!checkAll.checked;
  $('#wlSelectedCount').textContent=`${selected.size} selected`;$('#wlRemoveSelected').disabled=selected.size===0;
  if(!products.length){list.replaceChildren();$('#wlEmptyTitle').textContent=filter==='out'?'No out-of-stock products':'Your wishlist is empty';$('#wlEmptyDesc').textContent=filter==='out'?'All your saved products are currently available in this demo catalog.':'Tap the heart on products you love to save them here for later.';return}
  list.innerHTML=products.map(p=>{
    const stock=!outOfStock(p);const amount=qty[p.id]||1;
    return `<article class="wl-row" data-id="${escapeHTML(p.id)}">
      <input class="wl-row-select" type="checkbox" aria-label="Select ${escapeHTML(p.name)}" data-select="${escapeHTML(p.id)}" ${selected.has(p.id)?'checked':''}>
      <a class="wl-thumb" href="product.html?id=${encodeURIComponent(p.id)}"><img alt="${escapeHTML(p.name)}" src="${escapeHTML(C.storeSrc(p))}" loading="lazy" width="92" height="83"></a>
      <div class="wl-product-details"><a class="wl-product-name" href="product.html?id=${encodeURIComponent(p.id)}">${escapeHTML(p.name)}</a><span class="wl-product-unit">${escapeHTML(p.unit)}</span></div>
      <div class="wl-pricing"><span class="wl-price">${money(p.price)}</span><span class="wl-stock${stock?'':' unavailable'}">${stock?'In Stock':'Out of Stock'}</span></div>
      <div class="wl-qty" aria-label="Quantity for ${escapeHTML(p.name)}"><button type="button" data-qty="-1" aria-label="Decrease ${escapeHTML(p.name)} quantity" ${amount<=1?'disabled':''}>${icon('minus')}</button><span aria-live="polite">${amount}</span><button type="button" data-qty="1" aria-label="Increase ${escapeHTML(p.name)} quantity" ${amount>=99?'disabled':''}>${icon('plus')}</button></div>
      <button class="wl-add" data-add="${escapeHTML(p.id)}" type="button" ${stock?'':'disabled'}>${icon('cart')} ${stock?'Add to Cart':'Out of Stock'}</button>
      <button class="wl-remove" data-remove="${escapeHTML(p.id)}" type="button" aria-label="Remove ${escapeHTML(p.name)} from wishlist" title="Remove from wishlist">${icon('trash')}</button>
    </article>`}).join('');
}
function removeItems(ids){const remove=new Set(ids);if(!remove.size)return;C.writeWishlist(wish.filter(id=>!remove.has(id)));remove.forEach(id=>{delete qty[id];selected.delete(id)});render();notify(remove.size===1?'Removed from wishlist':`${remove.size} products removed from wishlist`)}
list.addEventListener('click',e=>{const row=e.target.closest('.wl-row');if(!row)return;const id=row.dataset.id;
  if(e.target.closest('[data-remove]')){removeItems([id]);return}
  const q=e.target.closest('[data-qty]');if(q){qty[id]=Math.max(1,Math.min(99,(qty[id]||1)+Number(q.dataset.qty)));render();return}
  if(e.target.closest('[data-add]')){const p=C.byId[id];if(!p||outOfStock(p))return;const cart=C.readCart();const old=Number(cart[id]||0);cart[id]=Math.min(99,old+(qty[id]||1));C.writeCart(cart);syncCart();notify(`${p.name} added to cart${old+(qty[id]||1)>99?' (maximum 99)':''}`)}
});
list.addEventListener('change',e=>{const cb=e.target.closest('[data-select]');if(!cb)return;cb.checked?selected.add(cb.dataset.select):selected.delete(cb.dataset.select);render()});
$('#wlSelectAll').addEventListener('change',e=>{const ids=displayed().map(p=>p.id);ids.forEach(id=>e.target.checked?selected.add(id):selected.delete(id));render()});
$('#wlRemoveSelected').addEventListener('click',()=>removeItems([...selected]));
$('#wlClear').addEventListener('click',()=>{if(!wish.length)return;if(window.confirm(`Remove all ${wish.length} saved products from your wishlist?`))removeItems([...wish])});
$$('.wl-tab').forEach(el=>el.addEventListener('click',()=>{filter=el.dataset.filter;render()}));
$('#wlSort').addEventListener('change',e=>{sort=e.target.value;render()});
$('#wishlistButton').addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'})});
$('#searchForm').addEventListener('submit',e=>{e.preventDefault();const q=$('#searchInput').value.trim();location.href='shop.html'+(q?'?q='+encodeURIComponent(q):'')});
$('#openCart').addEventListener('click',()=>location.href='cart.html');
$('#mobileCart').addEventListener('click',()=>location.href='cart.html');
$('#cityButton').addEventListener('click',()=>notify('Delivery: Dhaka City ৳70 · Other areas ৳130'));
$('#popoverCategoryList').innerHTML='<a href="shop.html">All Products</a>'+C.categories.map(c=>`<a href="shop.html?category=${encodeURIComponent(c.id)}">${escapeHTML(c.name)}</a>`).join('');
const pop=$('#categoryPopover');$('#categoryToggle').addEventListener('click',()=>{pop.hidden=!pop.hidden;$('#categoryToggle').setAttribute('aria-expanded',String(!pop.hidden))});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.nav-strip')){pop.hidden=true;$('#categoryToggle').setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){pop.hidden=true;$('#categoryToggle').setAttribute('aria-expanded','false')}});
document.addEventListener('click',e=>{if(e.target.closest('[data-demo]')){e.preventDefault();notify('This section is not connected in the frontend demo.')}});
window.addEventListener('storage',e=>{if(e.key==='nordfresh-demo-wishlist')render();if(e.key==='nordfresh-demo-cart')syncCart()});
window.addEventListener('nordfresh-wishlist-change',render);window.addEventListener('nordfresh-cart-change',syncCart);
syncCart();render();
})();
