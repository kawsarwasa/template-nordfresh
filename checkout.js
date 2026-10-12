'use strict';
/* Checkout is a frontend demonstration. No payment/order is sent to any server. */
(() => {
  const C = window.NordFreshCatalog;
  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];
  const money = n => '৳' + Number(n).toLocaleString('en-BD', {maximumFractionDigits:0});
  const safe = txt => String(txt).replace(/[&<>"']/g, x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const place = $('#placeOrder');
  let cart = C.readCart();
  const CITY_THANA = new Set(window.NordFreshDhakaCityThanas);
  const allLocations = window.NordFreshLocations;
  const districtSelect = $('#district');
  const thanaSelect = $('#thana');
  const divisionSelect = $('#division');
  const notice = $('#checkoutStatus');
  const showNotice = (message, error=false) => {notice.textContent=message; notice.classList.toggle('co-error',error)};
  const setOptions = (element,options,placeholder) => {
    element.replaceChildren(new Option(placeholder,''),...options.map(s=>new Option(s,s)));
    element.disabled = options.length===0;
  };
  function updateDistricts(){
    const division = allLocations.find(entry=>entry[0]===divisionSelect.value);
    setOptions(districtSelect,division?division[1].map(x=>x[0]):[],'Select district');
    setOptions(thanaSelect,[],'Select thana / upazila');
    refreshSummary();
  }
  function updateThanas(){
    const division = allLocations.find(entry=>entry[0]===divisionSelect.value);
    const district = division?.[1].find(entry=>entry[0]===districtSelect.value);
    const names = district?district[1]:[];
    // Metropolitan thanas are not listed in upazila datasets; include them separately for Dhaka city.
    const dhaka = divisionSelect.value==='Dhaka' && districtSelect.value==='Dhaka';
    const all = dhaka?[...window.NordFreshDhakaCityThanas,...names]:names;
    setOptions(thanaSelect,all.sort((a,b)=>a.localeCompare(b)),'Select thana / upazila');
    refreshSummary();
  }
  function shipping(){
    const div=divisionSelect.value, dis=districtSelect.value, th=thanaSelect.value;
    if(!div||!dis||!th)return null;
    return div==='Dhaka' && dis==='Dhaka' && CITY_THANA.has(th)?70:130;
  }
  function lineItems(){
    return Object.entries(cart).map(([key,quantity])=>({key,quantity,item:C.cartItem(key)})).filter(x=>x.item);
  }
  function summaryTotals(){
    const lines = lineItems();
    const saleTotal=lines.reduce((sum,l)=>sum+l.item.price*l.quantity,0);
    const originalTotal=lines.reduce((sum,l)=>sum+(l.item.product.old&&l.item.unit===l.item.product.unit?l.item.product.old:l.item.price)*l.quantity,0);
    const savings=originalTotal-saleTotal;
    const fee=shipping();
    return {lines,originalTotal,savings,fee,total:fee===null?null:saleTotal+fee};
  }
  function refreshSummary(){
    const s=summaryTotals();
    const unitCount=s.lines.reduce((sum,x)=>sum+x.quantity,0);
    $('#summaryTypes').textContent=String(s.lines.length);
    $('#checkoutUnits').textContent=String(unitCount);
    $('#originalSubtotal').textContent=money(s.originalTotal);
    $('#productSavings').textContent='− '+money(s.savings);
    $('#checkoutDelivery').textContent=s.fee===null?'Select address':money(s.fee);
    $('#checkoutTotal').textContent=s.total===null?'—':money(s.total);
    $('#checkoutProducts').innerHTML=s.lines.length?s.lines.map(({item,quantity})=>`
      <div class="co-order-line">
        <a href="product.html?id=${encodeURIComponent(item.product.id)}"><img src="${C.storeSrc(item.product)}" alt="${safe(item.product.name)}" loading="lazy" width="53" height="50"></a>
        <div><strong>${safe(item.product.name)}</strong><small>${safe(item.unit)} · Qty: ${quantity}</small></div>
        <strong class="co-line-price">${money(item.price*quantity)}</strong>
      </div>`).join(''):'<div class="co-order-empty">Your cart is empty. <a href="shop.html">Browse fresh groceries</a>.</div>';
    const area = [thanaSelect.value,districtSelect.value,divisionSelect.value].filter(Boolean);
    $('#deliveryAreaLabel').textContent = s.fee===null?'Your Delivery Area':(s.fee===70?'Dhaka City Delivery':'Delivery Outside Dhaka City');
    $('#deliveryExplanation').textContent = s.fee===null
      ? 'Select Division, District and Thana/Upazila to calculate delivery.'
      : `${area[0]}${area[1]?`, ${area[1]}`:''}`;
    $('#deliverySelectedFee').textContent = s.fee===null?'—':money(s.fee);
    place.disabled=s.lines.length===0;
    return s;
  }

  // Province and district cascading dropdowns.
  divisionSelect.append(...allLocations.map(([name])=>new Option(name,name)));
  divisionSelect.addEventListener('change',updateDistricts);
  districtSelect.addEventListener('change',updateThanas);
  thanaSelect.addEventListener('change',refreshSummary);
  $('#orderComment').addEventListener('input',e=>$('#commentCount').textContent=e.target.value.length);
  $$('[name=payment]').forEach(input=>input.addEventListener('change',()=>{
    const labels={mobile:'Mobile banking payment selected. Gateway integration will be added later.',card:'Visa / Mastercard selected. Card details are not collected in this frontend demo.',cod:'Cash on Delivery selected.'};
    $('#paymentNote').textContent=labels[input.value];
  }));

  function checkForm(){
    const form=$('#checkoutForm');
    const phone=$('#customerPhone');
    const digits=phone.value.replace(/[\s()+-]/g,'');
    const bdPhone=/^(?:\+?88)?01[3-9]\d{8}$/.test(digits);
    phone.setCustomValidity(bdPhone?'':'Enter a valid Bangladesh mobile number, e.g. 01712345678.');
    for(const field of [$('#customerName'),phone,$('#customerEmail'),divisionSelect,districtSelect,thanaSelect,$('#fullAddress')]){
      if(!field.checkValidity()){
        field.reportValidity(); field.focus(); showNotice('Please complete the required delivery details.',true);return false;
      }
    }
    if($('#customerName').value.trim().length<2){$('#customerName').setCustomValidity('Please enter your full name.');$('#customerName').reportValidity();$('#customerName').setCustomValidity('');return false;}
    if($('#fullAddress').value.trim().length<8){$('#fullAddress').setCustomValidity('Please enter a complete house, road and area address.');$('#fullAddress').reportValidity();$('#fullAddress').setCustomValidity('');return false;}
    return form.checkValidity();
  }
  $('#customerPhone').addEventListener('input',()=>$('#customerPhone').setCustomValidity(''));
  $('#checkoutForm').addEventListener('submit',e=>{
    e.preventDefault();
    const s=refreshSummary();
    if(s.lines.length===0){showNotice('Your cart is empty. Add products before checking out.',true);return;}
    if(!checkForm())return;
    if(s.fee===null){showNotice('Select a valid delivery area.',true);return;}
    const payment=$('[name=payment]:checked').value;
    // Intentionally no simulated receipt, order number, gateway or backend persistence.
    showNotice(`Preview validated · ${money(s.total)} · ${payment==='cod'?'Cash on Delivery':payment==='mobile'?'Mobile Banking':'Visa / Mastercard'}. No real order was placed. Backend and payment integration are not connected.`,false);
  });
  $('#searchForm').addEventListener('submit',e=>{e.preventDefault();const query=$('#searchInput').value.trim();location.href='shop.html'+(query?'?q='+encodeURIComponent(query):'')});
  $('#wishlistButton').addEventListener('click',()=>location.href='shop.html?wishlist=1');
  $('#openCart').addEventListener('click',()=>location.href='cart.html');
  $('#mobileCart').addEventListener('click',()=>location.href='cart.html');
  $('#cityButton').addEventListener('click',()=>showNotice('Delivery areas are selected in the address form.'));
  $('#popoverCategoryList').innerHTML='<a href="shop.html">All Products</a>'+C.categories.map(c=>`<a href="shop.html?category=${encodeURIComponent(c.id)}">${safe(c.name)}</a>`).join('');
  const popover=$('#categoryPopover');
  $('#categoryToggle').addEventListener('click',()=>{popover.hidden=!popover.hidden;$('#categoryToggle').setAttribute('aria-expanded',String(!popover.hidden))});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.nav-strip')){popover.hidden=true;$('#categoryToggle').setAttribute('aria-expanded','false')}});
  document.addEventListener('click',e=>{const demo=e.target.closest('[data-demo]');if(demo){e.preventDefault();showNotice(`${demo.dataset.demo} is not part of the checkout demo.`)}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){popover.hidden=true;$('#categoryToggle').setAttribute('aria-expanded','false')}});
  window.addEventListener('storage',e=>{if(e.key==='nordfresh-demo-cart'){cart=C.readCart();syncCartCount();refreshSummary()}});
  function syncCartCount(){$('#cartCount').textContent=Object.values(cart).reduce((sum,q)=>sum+q,0)}
  syncCartCount(); refreshSummary();
})();
