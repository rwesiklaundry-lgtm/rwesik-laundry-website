(function(){
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.navlinks');
  const backdrop = document.querySelector('.menu-backdrop');
  if(!toggle || !menu || !backdrop) return;

  function setMenu(open){
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  }

  toggle.addEventListener('click', function(){
    setMenu(!document.body.classList.contains('menu-open'));
  });

  backdrop.addEventListener('click', function(){ setMenu(false); });
  menu.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){ setMenu(false); });
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') setMenu(false);
  });
})();
