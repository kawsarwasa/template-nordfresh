'use strict';
// Shop and detail pages share a local-only cart and wishlist; no checkout/payment occurs here.
(() => {
  const C=window.NordFreshCatalog;
  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));
  const icon=(n,cls='ico')=>`<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const money=C.money,products=C.products;
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let cart=C.readCart(),wish=C.readWishlist(),toastTimer;
  const toast=$('#toast');
  function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2800)}
  const count=()=>Object.values(cart).reduce((sum,n)=>sum+n,0);
  function refreshCart(){
    $('#cartCount').textContent=count();$('#drawerCount').textContent=`(${count()})`;
    const subtotal=Object.entries(cart).reduce((sum,[key,qty])=>sum+C.cartItem(key).price*qty,0);
    $('#cartSubtotal').textContent=money(subtotal);
    $('#cartItems').innerHTML=!count()?`<div class="cart-empty">${icon('cart')}<p>Your cart is empty.<br>Add something fresh to get started.</p><a href="shop.html" class="btn btn-primary">Explore groceries</a></div>`:
      Object.entries(cart).map(([key,qty])=>{const item=C.cartItem(key),p=item.product;return `<div class="cart-line"><a href="product.html?id=${encodeURIComponent(p.id)}"><img src="${C.storeSrc(p)}" alt="${p.name}" width="62" height="62"/></a><div><strong><a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a></strong><small>${item.unit} · ${money(item.price)}</small><div class="qty-controls"><button type="button" data-cartkey="${key}" data-change="-1" aria-label="Remove one ${p.name}">${icon('minus')}</button><span>${qty}</span><button type="button" data-cartkey="${key}" data-change="1" aria-label="Add one ${p.name}">${icon('plus')}</button></div></div><span class="cart-line-total">${money(item.price*qty)}</span></div>`}).join('');
  }
  function addToCart(id,qty=1,variantIndex=-1){const p=C.byId[id];if(!p)return;const key=variantIndex>=0&&p.variants?.[variantIndex]?.[0]!==p.unit?`${id}|${variantIndex}`:id;cart[key]=Math.min(99,(cart[key]||0)+qty);C.writeCart(cart);refreshCart();notify(`${p.name} added to your cart`)}
  function updateWishlist(fromStorage=true){if(fromStorage)wish=C.readWishlist();$$('[data-wish]').forEach(btn=>{const active=wish.includes(btn.dataset.wish);btn.classList.toggle('is-saved',active);btn.setAttribute('aria-pressed',String(active));btn.setAttribute('aria-label',(active?'Remove ':'Add ')+(C.byId[btn.dataset.wish]?.name||'item')+(active?' from':' to')+' wishlist');if(btn.id==='detailFav')btn.title=active?'Remove from wishlist':'Add to wishlist';});}
  function toggleWish(id){if(!C.byId[id])return;const adding=!wish.includes(id);wish=adding?[...wish,id]:wish.filter(x=>x!==id);C.writeWishlist(wish);updateWishlist(false);notify(adding?'Saved to your wishlist':'Removed from wishlist');if(document.body.dataset.page==='shop'&&new URLSearchParams(location.search).has('wishlist'))renderShop();}
  const drawer=$('#cartDrawer'),backdrop=$('#cartBackdrop');
  let previousFocus;
  function openCart(){previousFocus=document.activeElement;backdrop.hidden=false;requestAnimationFrame(()=>backdrop.classList.add('open'));drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('no-scroll');$('#closeCart').focus()}
  function closeCart(){backdrop.classList.remove('open');drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll');setTimeout(()=>{if(!drawer.classList.contains('open'))backdrop.hidden=true},280);previousFocus?.focus()}
  $('#openCart').addEventListener('click',openCart);$('#mobileCart').addEventListener('click',openCart);$('#closeCart').addEventListener('click',closeCart);backdrop.addEventListener('click',closeCart);
  $('#cartItems').addEventListener('click',e=>{const b=e.target.closest('[data-cartkey]');if(!b)return;const key=b.dataset.cartkey;cart[key]=(cart[key]||0)+Number(b.dataset.change);if(cart[key]<=0)delete cart[key];else cart[key]=Math.min(99,cart[key]);C.writeCart(cart);refreshCart()});
  $('#checkoutButton').textContent='View Full Cart';$('#checkoutButton').addEventListener('click',()=>{location.href='cart.html'});
  $('#wishlistButton').addEventListener('click',()=>location.href='wishlist.html');
  $('#cityButton').addEventListener('click',()=>notify('Demo delivery area: Karachi.'));
  const popover=$('#categoryPopover');
  $('#popoverCategoryList').innerHTML=`<a href="shop.html">All Products</a>`+C.categories.map(c=>`<a href="shop.html?category=${c.id}">${c.name}</a>`).join('');
  $('#categoryToggle').addEventListener('click',()=>{popover.hidden=!popover.hidden;$('#categoryToggle').setAttribute('aria-expanded',String(!popover.hidden));});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.nav-strip')){popover.hidden=true;$('#categoryToggle').setAttribute('aria-expanded','false')}});
  $('#searchForm').addEventListener('submit',e=>{e.preventDefault();const q=$('#searchInput').value.trim();location.href='shop.html'+(q?'?q='+encodeURIComponent(q):'');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(drawer.classList.contains('open'))closeCart();popover.hidden=true;$('#categoryToggle').setAttribute('aria-expanded','false');closeFilters();}});
  document.addEventListener('click',e=>{
    const add=e.target.closest('[data-add]');if(add){addToCart(add.dataset.add);return}
    const fav=e.target.closest('[data-wish]');if(fav){toggleWish(fav.dataset.wish);return}
    const demo=e.target.closest('[data-demo]');if(demo){e.preventDefault();notify(`${demo.dataset.demo} will be connected in a later phase.`)}
  });
  window.addEventListener('storage',e=>{if(e.key==='nordfresh-demo-cart'){cart=C.readCart();refreshCart()}if(e.key==='nordfresh-demo-wishlist'){updateWishlist();if(document.body.dataset.page==='shop')renderShop()}});
  refreshCart();
  const card=(p)=>`<article class="store-card"><div class="store-card-image"><a class="card-photo-link" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="View ${p.name}"><img loading="lazy" decoding="async" src="${C.storeSrc(p)}" alt="${p.name}" width="270" height="196"/></a>${p.badge?`<span class="card-discount">-${p.badge}%</span>`:''}<button type="button" class="card-favourite" data-wish="${p.id}" aria-pressed="false" aria-label="Add ${p.name} to wishlist">${icon('heart')}</button></div><div class="store-card-content"><div class="store-category">${C.categories.find(c=>c.id===p.category)?.name||''}</div><h3><a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a></h3><div class="card-unit">${p.unit}</div><div class="card-review">${icon('star')} ${p.rating.toFixed(1)} <span>(${p.reviews})</span></div><div class="store-card-bottom"><div class="store-price"><strong>${money(p.price)}</strong>${p.old?`<del>${money(p.old)}</del>`:''}</div><button type="button" data-add="${p.id}" class="store-add" aria-label="Add ${p.name} to cart">${icon('plus')}<span>Add</span></button></div></div></article>`;
  // Shop page state, encoded in query params for direct-linkable category/search pages.
  const shop=$('body[data-page="shop"]');
  const PAGE_SIZE=12;
  let state={categories:[],q:'',sort:'popular',max:2000,organic:false,sale:false,rating:false,wishlist:false,page:1,layout:'grid'};
  const selectedCategories=()=>state.categories.filter(id=>C.categories.some(x=>x.id===id));
  const hasCategory=id=>selectedCategories().includes(id);
  function writeUrl(){const url=new URL(location.href);url.search='';if(selectedCategories().length)url.searchParams.set('category',selectedCategories().join(','));if(state.q)url.searchParams.set('q',state.q);if(state.sort!=='popular')url.searchParams.set('sort',state.sort);if(state.wishlist)url.searchParams.set('wishlist','1');if(state.page>1)url.searchParams.set('page',state.page);if(state.max<2000)url.searchParams.set('max',state.max);if(state.organic)url.searchParams.set('organic','1');if(state.sale)url.searchParams.set('sale','1');if(state.rating)url.searchParams.set('rating','1');if(state.layout==='list')url.searchParams.set('view','list');history.replaceState(null,'',url)}
  function getStateFromUrl(){const q=new URLSearchParams(location.search);const raw=q.get('category')||'';state.categories=raw.split(',').map(x=>x.trim()).filter(Boolean).filter(id=>C.categories.some(x=>x.id===id));state.q=(q.get('q')||'').trim().toLowerCase();state.sort=['popular','newest','price-low','price-high','rating','discount'].includes(q.get('sort'))?q.get('sort'):'popular';state.wishlist=q.get('wishlist')==='1';state.page=Math.max(1,Math.min(30,parseInt(q.get('page'))||1));state.max=q.has('max')&&Number.isFinite(Number(q.get('max')))?Math.max(0,Math.min(2000,Math.round(Number(q.get('max'))/50)*50)):2000;state.organic=q.get('organic')==='1';state.sale=q.get('sale')==='1';state.rating=q.get('rating')==='1';state.layout=q.get('view')==='list'?'list':'grid';}
  function filtered(){const activeCats=selectedCategories();let list=products.filter(p=>(!activeCats.length||activeCats.includes(p.category))&&(!state.q||`${p.name} ${p.category} ${p.unit} ${p.description}`.toLowerCase().includes(state.q))&&p.price<=state.max&&(!state.organic||p.organic)&&(!state.sale||p.badge)&&(!state.rating||p.rating>=4.8)&&(!state.wishlist||C.readWishlist().includes(p.id)));
    if(state.sort==='price-low')list.sort((a,b)=>a.price-b.price);
    if(state.sort==='price-high')list.sort((a,b)=>b.price-a.price);
    if(state.sort==='rating')list.sort((a,b)=>b.rating-a.rating||b.reviews-a.reviews);
    if(state.sort==='discount')list.sort((a,b)=>(b.badge||0)-(a.badge||0));
    if(state.sort==='newest')list.sort((a,b)=>products.indexOf(b)-products.indexOf(a));
    return list;
  }
  function toggleCategory(id){if(!C.categories.some(x=>x.id===id))return;state.categories=hasCategory(id)?selectedCategories().filter(x=>x!==id):[...selectedCategories(),id];state.page=1;}
  function clearCategories(){state.categories=[];state.page=1;}
  function renderCategories(){
    $('#shopCategoryRow').innerHTML=C.categories.map(c=>`<button type="button" class="shop-cat-tile${hasCategory(c.id)?' selected':''}" data-category="${c.id}"><span><img loading="lazy" decoding="async" src="assets/${c.image}" alt="" width="140" height="130"/></span><strong>${c.name}</strong></button>`).join('');
    $('#filterCategories').innerHTML=`<label class="filter-check"><input type="checkbox" name="catFilterAll" value="all" ${selectedCategories().length===0?'checked':''}/><span class="check-ui" aria-hidden="true"></span><span>All Categories</span><small>${products.length}</small></label>`+C.categories.map(c=>`<label class="filter-check"><input type="checkbox" name="catFilter" value="${c.id}" ${hasCategory(c.id)?'checked':''}/><span class="check-ui" aria-hidden="true"></span><span>${c.name}</span><small>${products.filter(p=>p.category===c.id).length}</small></label>`).join('');
  }
  function renderShop(){if(!shop)return;
    const activeCats=selectedCategories(),list=filtered(),pages=Math.ceil(list.length/PAGE_SIZE)||1;state.page=Math.min(state.page,pages);
    const slice=list.slice((state.page-1)*PAGE_SIZE,state.page*PAGE_SIZE);
    $('#shopGrid').classList.toggle('list-mode',state.layout==='list');$('#shopGrid').innerHTML=slice.map(card).join('');$('#shopEmpty').hidden=list.length!==0;
    $('#resultsLabel').textContent=list.length+' product'+(list.length===1?'':'s');$('#resultCountPill').textContent=list.length+' fresh pick'+(list.length===1?'':'s');
    $('#headingContext').textContent=state.wishlist?'· Wishlist':!activeCats.length?'':activeCats.length===1?'· '+(C.categories.find(c=>c.id===activeCats[0])?.name||''):`· ${activeCats.length} categories`;
    $('#currentFilterLabel').textContent=state.q?`Results for “${state.q}”`:state.wishlist?'Your saved favourites':activeCats.length?`${activeCats.length} categor${activeCats.length===1?'y':'ies'} selected`:'Freshly picked for you';
    $('#searchInput').value=state.q;
    $('#sortSelect').value=state.sort;$('#priceRange').value=state.max;$('#maxPriceDisplay').textContent=money(state.max)+(state.max===2000?'+':'');
    $('#organicOnly').checked=state.organic;$('#discountOnly').checked=state.sale;$('#highRated').checked=state.rating;
    const chips=[];if(state.q)chips.push(['search',`Search: ${state.q}`]);activeCats.forEach(id=>chips.push([`category:${id}`,C.categories.find(c=>c.id===id)?.name||id]));if(state.organic)chips.push(['organic','Organic & natural']);if(state.sale)chips.push(['sale','On sale']);if(state.rating)chips.push(['rating','Top rated']);if(state.max!==2000)chips.push(['max',`Under ${money(state.max)}`]);if(state.wishlist)chips.push(['wishlist','My wishlist']);
    $('#activeChips').hidden=chips.length===0;$('#activeChips').innerHTML=chips.map(([key,text])=>`<button type="button" data-clear="${escapeHTML(key)}">${escapeHTML(text)} ${icon('close')}</button>`).join('');
    $('#filterCount').hidden=chips.length===0;$('#filterCount').textContent=chips.length;
    $('#pagination').innerHTML=pages<=1?'':`<button type="button" data-page="${state.page-1}" ${state.page===1?'disabled':''} aria-label="Previous page">${icon('chevron','ico flip')}</button>`+Array.from({length:pages},(_,i)=>`<button type="button" data-page="${i+1}" class="${state.page===i+1?'current':''}" ${state.page===i+1?'aria-current="page"':''}>${i+1}</button>`).join('')+`<button type="button" data-page="${state.page+1}" ${state.page===pages?'disabled':''} aria-label="Next page">${icon('chevron')}</button>`;
    $$('.shop-cat-tile').forEach(el=>{const selected=hasCategory(el.dataset.category);el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected))});
    $$('input[name="catFilter"]').forEach(el=>el.checked=hasCategory(el.value));const allBox=$('input[name="catFilterAll"]');if(allBox)allBox.checked=activeCats.length===0;
    $('#gridView').classList.toggle('active',state.layout==='grid');$('#listView').classList.toggle('active',state.layout==='list');
    $('#gridView').setAttribute('aria-pressed',String(state.layout==='grid'));$('#listView').setAttribute('aria-pressed',String(state.layout==='list'));
    updateWishlist();writeUrl();
  }
  function resetShop(){state={...state,categories:[],q:'',sort:'popular',max:2000,organic:false,sale:false,rating:false,wishlist:false,page:1};renderCategories();renderShop()}
  const panel=$('#filterPanel'),filterBackdrop=$('#filterBackdrop');
  function openFilters(){if(!shop)return;panel.classList.add('mobile-open');filterBackdrop.hidden=false;document.body.classList.add('no-scroll');$('#closeFilters').focus()}
  function closeFilters(){if(!shop)return;panel.classList.remove('mobile-open');filterBackdrop.hidden=true;if(!drawer.classList.contains('open'))document.body.classList.remove('no-scroll')}
  if(shop){getStateFromUrl();renderCategories();renderShop();
    $('#shopCategoryRow').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;toggleCategory(b.dataset.category);renderCategories();renderShop();$('#products').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})});
    $('#filterCategories').addEventListener('change',e=>{if(e.target.name==='catFilterAll'){clearCategories();renderCategories();renderShop();return}if(e.target.name==='catFilter'){toggleCategory(e.target.value);renderCategories();renderShop();}});
    $('#priceRange').addEventListener('input',e=>{state.max=Number(e.target.value);state.page=1;renderShop()});
    [['organicOnly','organic'],['discountOnly','sale'],['highRated','rating']].forEach(([id,key])=>$('#'+id).addEventListener('change',e=>{state[key]=e.target.checked;state.page=1;renderShop()}));
    $('#sortSelect').addEventListener('change',e=>{state.sort=e.target.value;state.page=1;renderShop()});
    $('#gridView').addEventListener('click',()=>{state.layout='grid';renderShop()});$('#listView').addEventListener('click',()=>{state.layout='list';renderShop()});
    $('#resetFilters').addEventListener('click',resetShop);$('#emptyReset').addEventListener('click',resetShop);
    $('#activeChips').addEventListener('click',e=>{const b=e.target.closest('[data-clear]');if(!b)return;const key=b.dataset.clear;if(key.startsWith('category:'))state.categories=selectedCategories().filter(id=>id!==key.split(':')[1]);else if(key==='search')state.q='';else if(key==='wishlist')state.wishlist=false;else if(key==='max')state.max=2000;else state[key]=false;state.page=1;renderCategories();renderShop()});
    $('#pagination').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(!b||b.disabled)return;state.page=Number(b.dataset.page);renderShop();$('#products').scrollIntoView({behavior:'smooth',block:'start'})});
    $('#openFilters').addEventListener('click',openFilters);$('#closeFilters').addEventListener('click',closeFilters);$('#applyFilters').addEventListener('click',closeFilters);filterBackdrop.addEventListener('click',closeFilters);
  }
  // Detail page.
  if($('body[data-page="product"]')){
    let id=new URLSearchParams(location.search).get('id')||'bananas';if(!C.byId[id])id='bananas';const p=C.byId[id];
    let qty=1,variantIndex=Math.max(-1,p.variants?.findIndex(v=>v[0]===p.unit)??-1),view=0,zoom=false;
    const cat=C.categories.find(c=>c.id===p.category);
    document.title=`${p.name} | NordFresh`;
    $('#breadcrumbCategory').textContent=cat.name;$('#breadcrumbCategory').href='shop.html?category='+cat.id;$('#breadcrumbName').textContent=p.name;
    $('#detailCategoryLabel').textContent=cat.name;$('#productTitle').textContent=p.name;$('#detailDescription').textContent=p.description;
    $('#ratingValue').textContent=p.rating.toFixed(1);$('#reviewTotal').textContent=`(${p.reviews} reviews)`;$('#skuLabel').textContent='SKU: NF-'+String(products.indexOf(p)+1).padStart(4,'0');
    $('#galleryBadge').textContent=p.badge?`${p.badge}% OFF`:(p.tags?.[0]||'FARM FRESH').toUpperCase();
    $('#mainProductImage').src=C.storeSrc(p);$('#mainProductImage').alt=p.name;
    $('#detailFav').dataset.wish=p.id;$('#aboutDescription').textContent=p.description;
    $('#specProduct').textContent=p.name;$('#specCategory').textContent=cat.name;$('#specOrigin').textContent=p.origin;$('#tabReviewCount').textContent=`(${p.reviews})`;$('#reviewsSummary').textContent=`${p.rating.toFixed(1)} / 5`;
    const group=p.category;
    const benefitLabels={fruits:['Freshly selected','Everyday fruit & veg','Handled with care','Great for daily meals'],dairy:['Quality checked','Everyday essential','Chilled handling','Family favourites'],seafood:['Quality cuts','Chilled handling','Kitchen ready','Careful packing'],bakery:['Bakery favourite','Easy to enjoy','Prepared with care','Breakfast ready'],pantry:['Kitchen staple','Hand selected','Everyday cooking','Pantry friendly'],snacks:['Snack-time choice','Hand selected','Ready to enjoy','Packed with care'],beverages:['Refreshing choice','Ready to serve','Quality selected','Everyday refreshment'],household:['Everyday care','Useful essentials','Neatly packed','Home favourites']};
    const specificBenefits={bananas:['Naturally sweet','Source of fibre','Selected fresh','Great for snacking'],apples:['Crisp & juicy','Hand selected','Easy to snack','Fresh produce'], 'strawberry-fruit':['Seasonal fruit','Hand selected','Great for desserts','Sweet fresh bites']};
    const benefits=specificBenefits[p.id]||benefitLabels[group]||benefitLabels.pantry;
    $$('.key-benefit-grid strong').forEach((node,i)=>node.textContent=benefits[i]);
    const storageByCategory={fruits:'Wash fresh produce before eating. Keep perishable fruits and vegetables chilled when appropriate; refer to the item label for specific instructions.',dairy:'Keep refrigerated and follow the use-by date and storage instructions on the original packaging.',seafood:'Keep refrigerated at the safe temperature indicated on the label. Cook or freeze promptly and follow food-safety guidance.',bakery:'Keep sealed in a cool, dry place. Follow packaging instructions and consume within the stated shelf life.',pantry:'Keep unopened products in a cool, dry place away from direct sunlight. Follow the package label after opening.',snacks:'Keep sealed in a cool, dry place and follow any allergen and storage instructions on the package.',beverages:'Store according to the label. Refrigerate after opening where instructed, and consume within the recommended time.',household:'Keep away from children and food. Read the manufacturer label for safe storage and usage directions.'};
    const storageByProduct={bananas:'Keep unripe bananas at room temperature, away from direct sunlight. Once ripe, refrigeration may extend their freshness (the peel may darken).',milk:'Keep refrigerated as directed on the milk carton; do not leave out at room temperature.',eggs:'Store eggs according to the package directions and local food-safety guidance.',chicken:'Keep chilled as directed on the pack, separate from ready-to-eat foods, and cook thoroughly.',salmon:'Keep chilled as directed on the pack; cook promptly or freeze safely.', 'orange-juice':'Keep chilled if indicated on the bottle; refrigerate after opening and use within the labelled period.'};
    $('#careTips').textContent=storageByProduct[p.id]||storageByCategory[group]||'Follow the instructions on the original product packaging.';
    $('#nutritionIntro').textContent=group==='household'?'This is a non-food item. See the product label for ingredients, safety and directions for use.':`Nutrition varies by product, pack size and origin. For accurate quantities, allergens and dietary information, refer to the actual ${p.name} package label. No numeric nutrition values are claimed in this demo.`;
    $('#nutritionTabLabel').textContent=group==='household'?'Product Information':'Nutrition Facts';$('#specNutritionLabel').textContent=group==='household'?'Label':'Nutrition';
    updateWishlist();
    $('#variantOptions').innerHTML=(p.variants||[[p.unit,p.price]]).map(([unit,price],i)=>`<button type="button" data-variant="${i}" class="variant-button"><span>${unit}</span><strong>${money(price)}</strong></button>`).join('');
    if(variantIndex<0)variantIndex=0;
    const getVariant=()=>p.variants?.[variantIndex]||[p.unit,p.price];
    function updatePrice(){const [unit,price]=getVariant();const original=unit===p.unit?p.old:undefined;$('#detailPrice').textContent=money(price);$('#detailOldPrice').textContent=original?money(original):'';$('#detailOldPrice').hidden=!original;$('#detailSavings').hidden=!original;$('#detailSavings').textContent=original?`Save ${Math.round((1-price/original)*100)}%`:'';$('#galleryBadge').textContent=original?`${Math.round((1-price/original)*100)}% OFF`:(p.tags?.[0]||'FARM FRESH').toUpperCase();$('#detailUnit').textContent='/ '+unit;$('#specPack').textContent=unit;$('#addInlinePrice').textContent='· '+money(price*qty);$$('[data-variant]').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.variant)===variantIndex);b.setAttribute('aria-pressed',String(Number(b.dataset.variant)===variantIndex))});}
    updatePrice();
    $('#variantOptions').addEventListener('click',e=>{const b=e.target.closest('[data-variant]');if(b){variantIndex=Number(b.dataset.variant);updatePrice()}});
    const updateQty=()=>{$('#detailQty').textContent=qty;$('#addInlinePrice').textContent='· '+money(getVariant()[1]*qty)};
    $('#detailMinus').addEventListener('click',()=>{qty=Math.max(1,qty-1);updateQty()});$('#detailPlus').addEventListener('click',()=>{qty=Math.min(99,qty+1);updateQty()});
    $('#detailAdd').addEventListener('click',()=>addToCart(p.id,qty,p.variants?variantIndex:-1));
    $('#buyNow').addEventListener('click',()=>openCart());
    $('#shareProduct').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);notify('Product link copied!')}catch(e){notify('Copy this page’s URL to share this product.')}});
    const galleryPhotos=p.id==='bananas'?[
      {src:'assets/bananas-hero.webp',alt:'Fresh yellow bananas – front view'},
      {src:'assets/bananas-detail.webp',alt:'Fresh bananas – alternate view'},
      {src:'assets/bananas-farm.webp',alt:'Fresh bananas – natural farm-style view'}
    ]:[{src:C.storeSrc(p),alt:p.name}];
    $('#mainProductImage').src=galleryPhotos[0].src;$('#mainProductImage').alt=galleryPhotos[0].alt;
    $('#galleryThumbs').innerHTML=galleryPhotos.map((photo,i)=>`<button type="button" class="thumb-button ${i===0?'active':''}" data-view="${i}" aria-label="View photo ${i+1}: ${photo.alt}" aria-pressed="${i===0}"><img src="${photo.src}" alt="" width="100" height="86"/></button>`).join('');
    function setView(i){view=i;zoom=false;$('#galleryMain').classList.remove('zoomed');$('#galleryMain').dataset.view=i;$('#mainProductImage').src=galleryPhotos[i].src;$('#mainProductImage').alt=galleryPhotos[i].alt;$$('[data-view]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.view)===i);b.setAttribute('aria-pressed',String(Number(b.dataset.view)===i))})}
    $('#galleryThumbs').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)setView(Number(b.dataset.view))});
    $('#zoomButton').addEventListener('click',()=>{zoom=!zoom;$('#galleryMain').classList.toggle('zoomed',zoom);$('#zoomButton span').textContent=zoom?'Zoom out':'Click to zoom'});
    function activateDetailTab(name){$$('.product-tabs button').forEach(x=>{const active=x.dataset.tab===name;x.classList.toggle('active',active);x.setAttribute('aria-selected',String(active))});['about','details','delivery','reviews'].forEach(tab=>$('#'+tab+'Panel').hidden=tab!==name);}
    $$('.product-tabs button').forEach(b=>b.addEventListener('click',()=>activateDetailTab(b.dataset.tab)));
    $('.review-link')?.addEventListener('click',()=>activateDetailTab('reviews'));
    const featuredIds=['apples','oranges','grapes','strawberry-fruit','pineapple','mango'];
    const related=(p.id==='bananas'?featuredIds.map(id=>C.byId[id]).filter(Boolean):products.filter(x=>x.id!==id&&x.category===p.category).concat(products.filter(x=>x.id!==id&&x.category!==p.category))).slice(0,6);
    $('#relatedGrid').innerHTML=related.map(card).join('');updateWishlist();
  }
})();
