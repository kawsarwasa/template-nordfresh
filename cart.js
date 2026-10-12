'use strict';
(() => {
  const C = window.NordFreshCatalog;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const money = C.money;
  const icon = (name, cls='ico') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const toast = $('#toast');
  let toastTimer;
  let cart = C.readCart();
  let wishlist = C.readWishlist();
  let couponDiscount = 0;
  let couponCode = '';

  function notify(message){
    if(!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function saveCart(){
    C.writeCart(cart);
    syncHeaderCount();
  }

  function syncHeaderCount(){
    const total = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    $$('#cartCount, #cartCountMobile').forEach(node => node && (node.textContent = total));
  }

  function maybeSeedDemoCart(){
    const raw = localStorage.getItem('nordfresh-demo-cart');
    if(raw === null || raw === ''){
      cart = {'bananas|2':1, tomatoes:2, milk:1, eggs:1};
      saveCart();
    }
  }

  maybeSeedDemoCart();
  syncHeaderCount();

  function categoryName(id){
    return C.categories.find(c => c.id === id)?.name || 'Groceries';
  }

  function getSavings(key, qty){
    const item = C.cartItem(key);
    if(!item) return 0;
    const {product, unit, price} = item;
    return product.old && unit === product.unit ? Math.max(0, product.old - price) * qty : 0;
  }

  function lineItemMarkup(key, qty){
    const item = C.cartItem(key);
    if(!item) return '';
    const {product, unit, price} = item;
    const lineTotal = price * qty;
    const saved = wishlist.includes(product.id);
    return `
      <article class="cart-item" data-key="${key}">
        <div class="cart-item-media">
          ${product.badge ? `<span class="cart-item-badge">${product.badge}% OFF</span>` : ''}
          <a href="product.html?id=${encodeURIComponent(product.id)}"><img src="${C.storeSrc(product)}" alt="${product.name}" width="250" height="180"></a>
        </div>
        <div class="cart-item-body">
          <div class="cart-item-topline">
            <div>
              <div class="cart-item-category">${categoryName(product.category)}</div>
              <h3 class="cart-item-title"><a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3>
              <div class="cart-item-unit">${unit}</div>
            </div>
          </div>
          <div class="cart-item-price-row">
            <strong class="cart-price">${money(price)}</strong>
            ${product.old && unit === product.unit ? `<span class="cart-price-old">${money(product.old)}</span>` : ''}
          </div>
          <div class="cart-item-actions">
            <div class="cart-qty" aria-label="Quantity selector">
              <button type="button" data-qty="${key}" data-change="-1" aria-label="Decrease quantity">${icon('minus')}</button>
              <span>${qty}</span>
              <button type="button" data-qty="${key}" data-change="1" aria-label="Increase quantity">${icon('plus')}</button>
            </div>
            <div class="cart-meta-actions">
              <button type="button" class="cart-icon-btn" data-wish="${product.id}" aria-pressed="${saved}">${icon('heart')}<span>${saved ? 'Saved' : 'Wishlist'}</span></button>
            </div>
          </div>
        </div>
        <div class="cart-item-total">
          <strong>${money(lineTotal)}</strong>
          <button type="button" data-remove="${key}">${icon('close')}<span>Remove</span></button>
        </div>
      </article>`;
  }

  function renderCart(){
    const itemsWrap = $('#cartPageItems');
    const totalProducts = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    const keys = Object.keys(cart).filter(key => C.cartItem(key));
    const subtotal = keys.reduce((sum, key) => sum + C.cartItem(key).price * cart[key], 0);
    const savings = keys.reduce((sum, key) => sum + getSavings(key, cart[key]), 0);
    const delivery = subtotal >= 2000 || subtotal === 0 ? 0 : 100;
    const discount = couponDiscount; // Sale prices are already reflected in item subtotals.
    const total = Math.max(0, subtotal + delivery - discount);

    $('#cartItemCountLabel').textContent = totalProducts;
    $('#summaryItemCount').textContent = totalProducts;
    $('#summarySubtotal').textContent = money(subtotal);
    $('#summaryDelivery').textContent = subtotal === 0 ? 'Rs. 0' : money(delivery);
    $('#summaryDiscount').textContent = discount ? `- ${money(discount)}` : 'Rs. 0';
    $('#summaryTotal').textContent = money(total);
    $('#couponNote').textContent = couponCode ? `Coupon ${couponCode} applied successfully.` : '';

    if(!keys.length){
      itemsWrap.innerHTML = `
        <div class="cart-empty-state">
          ${icon('cart')}
          <h3>Your cart is empty</h3>
          <p>Add farm-fresh groceries to your basket and they’ll appear here. You can continue shopping and come back anytime.</p>
          <a class="btn btn-primary" href="shop.html">Explore groceries ${icon('arrow')}</a>
        </div>`;
      $('#summaryPanel').classList.add('is-empty');
    } else {
      itemsWrap.innerHTML = keys.map(key => lineItemMarkup(key, cart[key])).join('');
      $('#summaryPanel').classList.remove('is-empty');
    }
  }

  function toggleWishlist(id){
    if(!C.byId[id]) return;
    if(wishlist.includes(id)){
      wishlist = wishlist.filter(x => x !== id);
      notify('Removed from wishlist');
    } else {
      wishlist = [...wishlist, id];
      notify('Saved to wishlist');
    }
    C.writeWishlist(wishlist);
    renderCart();
    renderRecommendations();
  }

  function recommendationIds(){
    const inCart = new Set(Object.keys(cart).map(key => key.split('|')[0]));
    return C.products.filter(p => !inCart.has(p.id)).slice(0, 6);
  }

  function renderRecommendations(){
    const grid = $('#cartRecommendations');
    const products = recommendationIds();
    grid.innerHTML = products.map(p => `
      <article class="store-card">
        <div class="store-card-image">
          <a class="card-photo-link" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="View ${p.name}">
            <img loading="lazy" decoding="async" src="${C.storeSrc(p)}" alt="${p.name}" width="270" height="196">
          </a>
          ${p.badge ? `<span class="card-discount">-${p.badge}%</span>` : ''}
          <button type="button" class="card-favourite ${wishlist.includes(p.id) ? 'is-saved' : ''}" data-wish="${p.id}" aria-pressed="${wishlist.includes(p.id)}" aria-label="Wishlist ${p.name}">${icon('heart')}</button>
        </div>
        <div class="store-card-content">
          <div class="store-category">${categoryName(p.category)}</div>
          <h3><a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a></h3>
          <div class="card-unit">${p.unit}</div>
          <div class="card-review">${icon('star')} ${p.rating.toFixed(1)} <span>(${p.reviews})</span></div>
          <div class="store-card-bottom">
            <div class="store-price"><strong>${money(p.price)}</strong>${p.old ? `<del>${money(p.old)}</del>` : ''}</div>
            <button type="button" data-add="${p.id}" class="store-add" aria-label="Add ${p.name} to cart">${icon('plus')}<span>Add</span></button>
          </div>
        </div>
      </article>`).join('');
  }

  function addToCart(id){
    const p = C.byId[id];
    if(!p) return;
    cart[id] = Math.min(99, (cart[id] || 0) + 1);
    saveCart();
    renderCart();
    renderRecommendations();
    notify(`${p.name} added to cart`);
  }

  document.addEventListener('click', (e) => {
    const qtyBtn = e.target.closest('[data-qty]');
    if(qtyBtn){
      const key = qtyBtn.dataset.qty;
      cart[key] = (cart[key] || 0) + Number(qtyBtn.dataset.change);
      if(cart[key] <= 0) delete cart[key];
      saveCart();
      renderCart();
      renderRecommendations();
      return;
    }
    const removeBtn = e.target.closest('[data-remove]');
    if(removeBtn){
      delete cart[removeBtn.dataset.remove];
      saveCart();
      renderCart();
      renderRecommendations();
      notify('Item removed from cart');
      return;
    }
    const wishBtn = e.target.closest('[data-wish]');
    if(wishBtn){
      toggleWishlist(wishBtn.dataset.wish);
      return;
    }
    const addBtn = e.target.closest('[data-add]');
    if(addBtn){
      addToCart(addBtn.dataset.add);
      return;
    }
    const demoLink = e.target.closest('[data-demo]');
    if(demoLink){
      e.preventDefault();
      notify(`${demoLink.dataset.demo} will be connected in the next phase.`);
    }
  });

  $('#clearCartPage').addEventListener('click', () => {
    cart = {};
    couponDiscount = 0;
    couponCode = '';
    saveCart();
    renderCart();
    renderRecommendations();
    notify('Cart cleared');
  });

  $('#couponForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#couponInput');
    const code = input.value.trim().toUpperCase();
    if(!code){
      couponDiscount = 0;
      couponCode = '';
      $('#couponNote').textContent = 'Enter a coupon code to apply discount.';
      return;
    }
    if(['FRESH80','NORD50','WELCOME'].includes(code)){
      couponCode = code;
      couponDiscount = code === 'FRESH80' ? 80 : code === 'NORD50' ? 50 : 35;
      renderCart();
      notify('Coupon applied');
    } else {
      couponDiscount = 0;
      couponCode = '';
      $('#couponNote').textContent = 'This demo code is not available. Try FRESH80.';
      notify('Invalid coupon code');
    }
  });

  $('#checkoutCart').addEventListener('click', () => {
    notify('Checkout will be connected in the next frontend phase.');
  });

  $('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#searchInput').value.trim();
    location.href = 'shop.html' + (q ? `?q=${encodeURIComponent(q)}` : '');
  });

  $('#wishlistButton').addEventListener('click', () => location.href = 'shop.html?wishlist=1');
  $('#openCart').addEventListener('click', () => location.href = 'cart.html');
  $('#mobileCart').addEventListener('click', () => location.href = 'cart.html');
  $('#cityButton').addEventListener('click', () => notify('Demo delivery city: Karachi.'));

  const popover = $('#categoryPopover');
  $('#popoverCategoryList').innerHTML = `<a href="shop.html">All Products</a>` + C.categories.map(c => `<a href="shop.html?category=${c.id}">${c.name}</a>`).join('');
  $('#categoryToggle').addEventListener('click', () => {
    popover.hidden = !popover.hidden;
    $('#categoryToggle').setAttribute('aria-expanded', String(!popover.hidden));
  });
  document.addEventListener('pointerdown', (e) => {
    if(!e.target.closest('.nav-strip')){
      popover.hidden = true;
      $('#categoryToggle').setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      popover.hidden = true;
      $('#categoryToggle').setAttribute('aria-expanded', 'false');
    }
  });

  renderCart();
  renderRecommendations();
})();
