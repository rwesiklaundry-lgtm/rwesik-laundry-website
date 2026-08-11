(function(){
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.navlinks');
  const backdrop = document.querySelector('.menu-backdrop');
  if(!toggle || !menu || !backdrop) return;

  const originalParent = menu.parentNode;
  const placeholder = document.createComment('rwesik-mobile-menu');
  originalParent.insertBefore(placeholder, menu);
  const mq = window.matchMedia('(max-width:700px)');
  let lastTouch = 0;

  function setMenu(open){
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  }

  function syncPlacement(){
    setMenu(false);
    if(mq.matches){
      if(menu.parentNode !== document.body) document.body.appendChild(menu);
      menu.classList.add('mobile-portaled');
    }else{
      if(menu.parentNode !== originalParent) originalParent.insertBefore(menu, placeholder.nextSibling);
      menu.classList.remove('mobile-portaled');
    }
  }

  function goToLink(link, event){
    const href = link && link.href;
    if(!href) return;
    if(event){
      event.preventDefault();
      event.stopPropagation();
    }
    setMenu(false);
    window.location.assign(href);
  }

  syncPlacement();
  if(typeof mq.addEventListener === 'function') mq.addEventListener('change', syncPlacement);
  else if(typeof mq.addListener === 'function') mq.addListener(syncPlacement);

  toggle.addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    setMenu(!document.body.classList.contains('menu-open'));
  });

  backdrop.addEventListener('click', function(e){
    e.preventDefault();
    setMenu(false);
  });

  /* iOS/Safari fallback: touch dan click sama-sama mengarahkan URL secara eksplisit. */
  menu.addEventListener('touchend', function(e){
    const link = e.target.closest('a');
    if(!link) return;
    lastTouch = Date.now();
    goToLink(link, e);
  }, {passive:false, capture:true});

  menu.addEventListener('click', function(e){
    const link = e.target.closest('a');
    if(!link) return;
    if(Date.now() - lastTouch < 700){
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    goToLink(link, e);
  }, true);

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') setMenu(false);
  });
})();

(function(){
  const triggers = Array.from(document.querySelectorAll('.outlet-card,.process-card')).filter(function(el){ return el.querySelector('img'); });
  if(!triggers.length) return;

  const style = document.createElement('style');
  style.textContent = `
    .outlet-card.photo-zoom,.process-card.photo-zoom{cursor:zoom-in;position:relative}
    .outlet-card.photo-zoom:focus-visible,.process-card.photo-zoom:focus-visible{outline:3px solid #118c4f;outline-offset:4px}
    .photo-zoom-badge{position:absolute;left:14px;top:14px;z-index:4;background:rgba(3,28,15,.78);color:#fff;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:800;pointer-events:none;box-shadow:0 5px 18px rgba(0,0,0,.18)}
    #rwesikLightbox[hidden]{display:none!important}
    #rwesikLightbox{position:fixed;inset:0;z-index:9999;background:rgba(2,15,9,.94);display:flex;align-items:center;justify-content:center;padding:24px}
    #rwesikLightbox .lb-inner{position:relative;max-width:min(96vw,1500px);max-height:94vh;display:flex;flex-direction:column;align-items:center}
    #rwesikLightbox img{display:block;max-width:96vw;max-height:86vh;width:auto;height:auto;object-fit:contain;border-radius:14px;box-shadow:0 24px 70px rgba(0,0,0,.48)}
    #rwesikLightbox .lb-close{position:absolute;right:0;top:-49px;width:42px;height:42px;border:0;border-radius:50%;background:#fff;color:#17342a;font-size:29px;line-height:1;cursor:pointer;font-weight:900}
    #rwesikLightbox .lb-caption{color:#fff;margin:10px 0 0;text-align:center;font-weight:800}
    body.rwesik-lightbox-open{overflow:hidden}
    @media(max-width:700px){#rwesikLightbox{padding:12px}#rwesikLightbox img{max-width:96vw;max-height:80vh}.photo-zoom-badge{font-size:11px;padding:6px 9px}}
  `;
  document.head.appendChild(style);

  const box = document.createElement('div');
  box.id = 'rwesikLightbox';
  box.hidden = true;
  box.setAttribute('aria-hidden','true');
  box.setAttribute('role','dialog');
  box.setAttribute('aria-modal','true');
  box.innerHTML = '<div class="lb-inner"><button class="lb-close" type="button" aria-label="Tutup foto">×</button><img alt=""><div class="lb-caption"></div></div>';
  document.body.appendChild(box);

  const fullImg = box.querySelector('img');
  const caption = box.querySelector('.lb-caption');
  const closeBtn = box.querySelector('.lb-close');
  let lastTrigger = null;

  function openPhoto(el){
    const source = el.querySelector('img');
    if(!source) return;
    lastTrigger = el;
    fullImg.src = source.currentSrc || source.src;
    fullImg.alt = source.alt || 'Foto Rwesik Laundry';
    caption.textContent = source.alt || 'Rwesik Laundry';
    box.hidden = false;
    box.setAttribute('aria-hidden','false');
    document.body.classList.add('rwesik-lightbox-open');
    closeBtn.focus();
  }

  function closePhoto(){
    box.hidden = true;
    box.setAttribute('aria-hidden','true');
    fullImg.src = '';
    document.body.classList.remove('rwesik-lightbox-open');
    if(lastTrigger) lastTrigger.focus();
  }

  triggers.forEach(function(el){
    el.classList.add('photo-zoom');
    el.setAttribute('role','button');
    el.setAttribute('tabindex','0');
    el.setAttribute('aria-label','Buka foto ukuran besar');
    if(!el.querySelector('.photo-zoom-badge')){
      const badge = document.createElement('span');
      badge.className = 'photo-zoom-badge';
      badge.textContent = 'Klik untuk perbesar';
      el.appendChild(badge);
    }
    el.addEventListener('click', function(){ openPhoto(el); });
    el.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openPhoto(el); } });
  });

  closeBtn.addEventListener('click', closePhoto);
  box.addEventListener('click', function(e){ if(e.target === box) closePhoto(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !box.hidden) closePhoto(); });
})();