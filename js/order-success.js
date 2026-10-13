
'use strict';
/* Order success page for frontend flow preview. */
(() => {
  const C = window.NordFreshCatalog;
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const money = n => '৳' + Number(n || 0).toLocaleString('en-BD', {maximumFractionDigits:0});
  const safe = txt => String(txt ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const demoKey = 'nordfresh-demo-last-order';
  function paymentLabel(id){return id==='card'?'Visa / Mastercard':id==='cod'?'Cash on Delivery':'Mobile Banking (bKash)';}
  function paymentBrand(id){return id==='card'?'VISA':id==='cod'?'Cash on Delivery':'bKash';}
  function zoneLabel(fee){return Number(fee)===70?'Dhaka City':'Outside Dhaka';}
  function fallbackOrder(){
    const lines = [
      {key:'milk', quantity:1, item:C.cartItem('milk')},
      {key:'eggs', quantity:1, item:C.cartItem('eggs')},
      {key:'rice', quantity:1, item:C.cartItem('rice')},
      {key:'almonds', quantity:1, item:C.cartItem('almonds')},
      {key:'bread', quantity:1, item:C.cartItem('bread')}
    ].filter(x => x.item);
    const saleTotal = lines.reduce((sum, l) => sum + l.item.price * l.quantity, 0);
    const originalTotal = lines.reduce((sum, l) => sum + ((l.item.product.old && l.item.unit === l.item.product.unit) ? l.item.product.old : l.item.price) * l.quantity, 0);
    return {
      orderNumber: 'NF-20261012-0001',
      createdAt: new Date().toISOString(),
      payment: 'mobile',
      customer: {
        name: 'John Doe',
        phone: '01725634890',
        email: 'john@example.com',
        division: 'Dhaka',
        district: 'Dhaka',
        thana: 'Gulshan',
        address: 'House 12, Road 4, Block B, Niketon, Gulshan, Dhaka - 1212',
        comment: 'Please call before delivery.'
      },
      lines: lines.map(l => ({
        key: l.key,
        id: l.item.product.id,
        name: l.item.product.name,
        unit: l.item.unit,
        price: l.item.price,
        quantity: l.quantity,
        image: C.storeSrc(l.item.product)
      })),
      totals: {
        units: lines.reduce((sum,l)=>sum+l.quantity,0),
        originalTotal,
        savings: Math.max(0, originalTotal - saleTotal),
        delivery: 70,
        grandTotal: saleTotal + 70
      },
      delivery: {label: 'Dhaka City Delivery', fee: 70, zone: 'Dhaka City'},
      statusNote: ''
    };
  }
  function readOrder(){
    try {
      const raw = localStorage.getItem(demoKey);
      if(!raw) return fallbackOrder();
      const parsed = JSON.parse(raw);
      if(!parsed || !Array.isArray(parsed.lines) || !parsed.lines.length) return fallbackOrder();
      return parsed;
    } catch (_){
      return fallbackOrder();
    }
  }
  let order = readOrder();
  const cartCount = Object.values(C.readCart()).reduce((sum, qty) => sum + qty, 0);
  const cartCountNode = $('#cartCount');
  if(cartCountNode) cartCountNode.textContent = String(cartCount);
  function render(){
    $('#successOrderNumber').textContent = order.orderNumber || 'NF-20261012-0001';
    $('#detailName').textContent = order.customer?.name || 'Customer';
    $('#detailPhone').textContent = order.customer?.phone || '—';
    const payText = paymentLabel(order.payment);
    $('#detailPayment').textContent = payText;
    const brandBadge = $('#paymentBrandBadge'); brandBadge.textContent = paymentBrand(order.payment); brandBadge.className = 'os-payment-badge ' + (order.payment === 'card' ? 'brand-card' : order.payment === 'cod' ? 'brand-cod' : 'brand-bkash');
    const paymentStatus = $('#detailPaymentStatus'); paymentStatus.textContent = order.payment === 'cod' ? 'Pay on delivery' : ''; paymentStatus.classList.toggle('is-hidden', order.payment !== 'cod');
    const addressParts = [order.customer?.address, order.customer?.thana, order.customer?.district, order.customer?.division].filter(Boolean);
    $('#detailAddress').textContent = addressParts.join(', ');
    $('#detailComment').textContent = order.customer?.comment?.trim() || 'No special instructions were added.';
    const zone = order.delivery?.zone || zoneLabel(order.totals?.delivery);
    $('#deliveryZoneBadge').textContent = zone;
    $('#deliveryChargeBadge').textContent = 'Delivery Charge: ' + money(order.totals?.delivery || order.delivery?.fee || 0);
    $('#deliveryTypeInline').textContent = zone;
    const lines = order.lines || [];
    $('#summaryUnitsSuccess').textContent = String(order.totals?.units || lines.reduce((sum, line)=>sum + Number(line.quantity || 0),0));
    $('#summaryOriginalSuccess').textContent = money(order.totals?.originalTotal || 0);
    $('#summarySavingsSuccess').textContent = '- ' + money(order.totals?.savings || 0);
    $('#summaryDeliverySuccess').textContent = money(order.totals?.delivery || 0);
    $('#summaryGrandSuccess').textContent = money(order.totals?.grandTotal || 0);
    $('#successSummaryList').innerHTML = lines.map(line => `
      <div class="os-summary-line">
        <img src="${safe(line.image || (C.byId[line.id] ? C.storeSrc(C.byId[line.id]) : ''))}" alt="${safe(line.name)}" width="58" height="54">
        <div><strong>${safe(line.name)}</strong><small>${safe(line.unit)} · Qty: ${Number(line.quantity || 0)}</small></div>
        <strong class="os-line-price">${money((line.price || 0) * (line.quantity || 0))}</strong>
      </div>`).join('');
    if(!lines.length){
      $('#successSummaryList').innerHTML = '<div class="os-empty-state">No order data found. Please place an order from the checkout page.</div>';
    }
    $('#detailsLead').textContent = 'Here are your order details.';
  }
  document.addEventListener('click', e => {
    const demoLink = e.target.closest('[data-demo]');
    if(demoLink){
      e.preventDefault();
      const status = document.getElementById('toast');
      if(status){
        status.textContent = 'Track Order page can be connected in the next step.';
        status.classList.add('show');
        clearTimeout(window.__nfToastTimer);
        window.__nfToastTimer = setTimeout(() => status.classList.remove('show'), 2600);
      }
    }
  });
  $('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    const q = $('#searchInput').value.trim();
    location.href = 'shop.html' + (q ? `?q=${encodeURIComponent(q)}` : '');
  });
  $('#wishlistButton').addEventListener('click', () => location.href = 'wishlist.html');
  $('#openCart').addEventListener('click', () => location.href = 'cart.html');
  $('#mobileCart').addEventListener('click', () => location.href = 'cart.html');
  $('#cityButton').addEventListener('click', () => {
    const status = document.getElementById('toast');
    if(status){
      status.textContent = 'Delivery charge in this demo: Dhaka City ৳70 · Other areas ৳130.';
      status.classList.add('show');
      clearTimeout(window.__nfToastTimer);
      window.__nfToastTimer = setTimeout(() => status.classList.remove('show'), 2600);
    }
  });
  const popover = $('#categoryPopover');
  $('#popoverCategoryList').innerHTML = '<a href="shop.html">All Products</a>' + C.categories.map(c => `<a href="shop.html?category=${encodeURIComponent(c.id)}">${safe(c.name)}</a>`).join('');
  $('#categoryToggle').addEventListener('click', () => {
    popover.hidden = !popover.hidden;
    $('#categoryToggle').setAttribute('aria-expanded', String(!popover.hidden));
  });
  document.addEventListener('pointerdown', e => {
    if(!e.target.closest('.nav-strip')){
      popover.hidden = true;
      $('#categoryToggle').setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      popover.hidden = true;
      $('#categoryToggle').setAttribute('aria-expanded', 'false');
    }
  });
  render();
})();
