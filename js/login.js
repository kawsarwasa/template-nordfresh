'use strict';
/* Frontend-only NordFresh account preview. No credentials or account information are stored or transmitted. */
(()=>{
 const C=window.NordFreshCatalog,$=selector=>document.querySelector(selector),$$=selector=>[...document.querySelectorAll(selector)];
 const feedback=$('#authFeedback');
 function message(text,error=false){feedback.textContent=text;feedback.hidden=false;feedback.classList.toggle('is-error',error)}
 function clearFeedback(){feedback.hidden=true;feedback.textContent='';feedback.classList.remove('is-error')}
 function tab(mode,push=true){
  const register=mode==='register';
  $('#authSignInTab').classList.toggle('is-active',!register);
  $('#authRegisterTab').classList.toggle('is-active',register);
  $('#authSignInTab').setAttribute('aria-selected',String(!register));
  $('#authRegisterTab').setAttribute('aria-selected',String(register));
  $('#authSignInTab').tabIndex=register?-1:0;$('#authRegisterTab').tabIndex=register?0:-1;
  $('#authSignInPane').hidden=register;$('#authRegisterPane').hidden=!register;
  clearFeedback();
  if(push){try{const url=new URL(location.href);if(register)url.searchParams.set('tab','register');else url.searchParams.delete('tab');history.replaceState(null,'',url)}catch(_){}}
 }
 $$('[data-tab]').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));
 $$('[data-switch]').forEach(b=>b.addEventListener('click',()=>{tab(b.dataset.switch);$(b.dataset.switch==='register'?'#authRegisterTab':'#authSignInTab').focus()}));
 $('.auth-tabs').addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const reg=e.key==='ArrowRight'||e.key==='End';tab(reg?'register':'sign-in');$(reg?'#authRegisterTab':'#authSignInTab').focus()});
 $$('[data-toggle]').forEach(b=>b.addEventListener('click',()=>{const i=document.getElementById(b.dataset.toggle),show=i.type==='password';i.type=show?'text':'password';b.setAttribute('aria-pressed',String(show));b.setAttribute('aria-label',show?'Hide password':'Show password')}));
 const normalizedPhone=value=>{let p=String(value).replace(/[^\d]/g,'');if(p.startsWith('8801')&&p.length===13)p=p.slice(2);return p};
 const validIdentity=value=>{const v=value.trim();return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)||/^01[3-9]\d{8}$/.test(normalizedPhone(v))};
 function ensure(field,condition,text){if(!condition){message(text,true);field.setAttribute('aria-invalid','true');field.focus();return false}field.removeAttribute('aria-invalid');return true}
 $('#signInForm').addEventListener('submit',e=>{
  e.preventDefault();clearFeedback();const id=$('#signInIdentity'),pw=$('#signInPassword');
  if(!ensure(id,validIdentity(id.value),'Enter a valid email address or Bangladesh mobile number.'))return;
  if(!ensure(pw,pw.value.length>=8,'Enter a password of at least 8 characters.'))return;
  message('Sign In is a frontend preview. No account was accessed, and your credentials were not sent or saved. Django authentication will be connected later.');
 });
 $('#registerForm').addEventListener('submit',e=>{
  e.preventDefault();clearFeedback();
  const name=$('#registerName'),id=$('#registerIdentity'),pw=$('#registerPassword'),confirm=$('#registerConfirm'),terms=$('#registerTerms');
  if(!ensure(name,name.value.trim().length>=2,'Enter your full name (at least 2 characters).'))return;
  if(!ensure(id,validIdentity(id.value),'Enter a valid email address or Bangladesh mobile number.'))return;
  if(!ensure(pw,pw.value.length>=8,'Use a password of at least 8 characters.'))return;
  if(!ensure(confirm,pw.value===confirm.value,'The passwords do not match.'))return;
  if(!ensure(terms,terms.checked,'Please accept the terms before continuing.'))return;
  message('Create Account is a frontend preview. No account was created, and your password or personal information was not saved or sent. Django registration will be integrated later.');
 });
 $$('.auth-input input').forEach(el=>el.addEventListener('input',()=>el.removeAttribute('aria-invalid')));
 $('#forgotPassword').addEventListener('click',()=>message('Password recovery will be available once secure email or mobile verification is connected to Django.'));
 $$('[data-provider]').forEach(b=>b.addEventListener('click',()=>message(b.dataset.provider+' sign-in is not connected yet. No login was attempted.')));
 $('#cartCount').textContent=String(Object.values(C.readCart()).reduce((s,n)=>s+Number(n||0),0));
 $('#wishlistButton').addEventListener('click',()=>location.assign('wishlist.html'));
 $('#openCart').addEventListener('click',()=>location.assign('cart.html'));
 $('#mobileCart').addEventListener('click',()=>location.assign('cart.html'));
 $('#searchForm').addEventListener('submit',e=>{e.preventDefault();const q=$('#searchInput').value.trim();location.assign('shop.html'+(q?'?q='+encodeURIComponent(q):''))});
 $('#cityButton').addEventListener('click',()=>message('Delivery fees: Dhaka City ৳70; other areas ৳130.'));
 const esc=v=>String(v).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[x]));
 $('#popoverCategoryList').innerHTML='<a href="shop.html">All Products</a>'+C.categories.map(c=>'<a href="shop.html?category='+encodeURIComponent(c.id)+'">'+esc(c.name)+'</a>').join('');
 const pop=$('#categoryPopover');
 $('#categoryToggle').addEventListener('click',()=>{pop.hidden=!pop.hidden;$('#categoryToggle').setAttribute('aria-expanded',String(!pop.hidden))});
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.nav-strip')){pop.hidden=true;$('#categoryToggle').setAttribute('aria-expanded','false')}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){pop.hidden=true;$('#categoryToggle').setAttribute('aria-expanded','false')}});
 document.addEventListener('click',e=>{const btn=e.target.closest('[data-demo]');if(btn){e.preventDefault();message('This service is not connected in the frontend preview.')}});
 tab(new URLSearchParams(location.search).get('tab')==='register'?'register':'sign-in',false);
})();