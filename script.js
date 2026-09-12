
(function(){
  // ---- Navbar scroll state ----
  var nav = document.getElementById('siteNav');
  function onScroll(){
    if(window.scrollY > 60){ nav.classList.add('scrolled'); } else { nav.classList.remove('scrolled'); }
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  // ---- Mobile menu ----
  var burger = document.getElementById('burgerBtn');
  burger.addEventListener('click', function(){
    var open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.mobile-panel a').forEach(function(a){
    a.addEventListener('click', function(){
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // ---- Carrousel éditorial (grande image + rail d'aperçus) ----
  var railItems = Array.prototype.slice.call(document.querySelectorAll('.rail-item'));
  var spotMedia = document.getElementById('spotMedia');
  var spotCatTag = document.getElementById('spotCatTag');
  var spotCat = document.getElementById('spotCat');
  var spotTitle = document.getElementById('spotTitle');
  var spotDesc = document.getElementById('spotDesc');
  var spotMaterials = document.getElementById('spotMaterials');
  var railProgress = document.getElementById('railProgress');
  var current = 0;
  var autoplay = true;
  var timer, progressTimer;
  var DURATION = 5200;

  function setActive(i, userInitiated){
    current = (i + railItems.length) % railItems.length;
    railItems.forEach(function(el, idx){ el.setAttribute('aria-current', idx === current ? 'true' : 'false'); });
    var d = railItems[current].dataset;
    spotMedia.innerHTML = '<img src="' + d.img + '" alt="' + d.title + '" loading="eager"><span class="cat-tag">' + d.cat + '</span>';
    spotCatTag.textContent = d.cat;
    spotCat.textContent = d.cat;
    spotTitle.textContent = d.title;
    spotDesc.textContent = d.desc;
    spotMaterials.textContent = d.materials;
    if(userInitiated) resetTimer();
  }
  railItems.forEach(function(btn, i){
    btn.addEventListener('click', function(){ setActive(i, true); });
  });
  document.getElementById('carNext').addEventListener('click', function(){ setActive(current + 1, true); });
  document.getElementById('carPrev').addEventListener('click', function(){ setActive(current - 1, true); });

  var toggleBtn = document.getElementById('autoplayToggle');
  toggleBtn.addEventListener('click', function(){
    autoplay = !autoplay;
    toggleBtn.setAttribute('aria-pressed', autoplay ? 'true' : 'false');
    toggleBtn.textContent = autoplay ? 'Défilement auto' : 'Défilement en pause';
    resetTimer();
  });

  function resetTimer(){
    clearInterval(timer); clearInterval(progressTimer);
    railProgress.style.width = '0%';
    if(!autoplay) return;
    var start = Date.now();
    progressTimer = setInterval(function(){
      var pct = Math.min(100, ((Date.now() - start) / DURATION) * 100);
      railProgress.style.width = pct + '%';
    }, 80);
    timer = setInterval(function(){
      setActive(current + 1, false);
      start = Date.now();
    }, DURATION);
  }
  setActive(0, false);
  resetTimer();
  var spotlightEl = document.querySelector('.spotlight');
  spotlightEl.addEventListener('mouseenter', function(){ clearInterval(timer); clearInterval(progressTimer); });
  spotlightEl.addEventListener('mouseleave', function(){ resetTimer(); });

  // ---- Services: ouverture d'une catégorie à la fois ----
  var serviceButtons = document.querySelectorAll('.svc-explore');
  serviceButtons.forEach(function(button){
    button.addEventListener('click', function(){
      var card = button.closest('.svc');
      var detail = document.getElementById(button.getAttribute('aria-controls'));
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      serviceButtons.forEach(function(otherButton){
        var otherDetail = document.getElementById(otherButton.getAttribute('aria-controls'));
        otherButton.setAttribute('aria-expanded', 'false');
        otherDetail.hidden = true;
        otherButton.closest('.svc').classList.remove('is-open');
      });
      if(!isOpen){
        button.setAttribute('aria-expanded', 'true');
        detail.hidden = false;
        card.classList.add('is-open');
      }
    });
  });

  // ---- Gallery filters ----
  var filterBtns = document.querySelectorAll('#filters button');
  var items = document.querySelectorAll('.g-item');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.setAttribute('aria-pressed','false'); });
      btn.setAttribute('aria-pressed','true');
      var f = btn.getAttribute('data-filter');
      items.forEach(function(it){
        var show = f === 'all' || it.getAttribute('data-cat') === f;
        it.hidden = !show;
      });
    });
  });

  // ---- Lightbox ----
  var lightbox = document.getElementById('lightbox');
  var lbMedia = document.getElementById('lbMedia');
  var lbCat = document.getElementById('lbCat');
  var lbTitle = document.getElementById('lbTitle');
  var lbDesc = document.getElementById('lbDesc');
  var lbMaterials = document.getElementById('lbMaterials');
  var lastFocused;

  function openLightbox(item){
    lastFocused = document.activeElement;
    var img = item.querySelector('img');
    lbMedia.innerHTML = img ? '<img src="' + img.getAttribute('src') + '" alt="' + (item.getAttribute('data-title') || 'Projet') + '" loading="eager">' : '';
    lbCat.textContent = item.getAttribute('data-cat-label');
    lbTitle.textContent = item.getAttribute('data-title');
    lbDesc.textContent = item.getAttribute('data-desc');
    var mat = item.getAttribute('data-materials');
    lbMaterials.textContent = mat ? 'Matériaux : ' + mat : '';
    lightbox.classList.add('open');
    document.getElementById('lbClose').focus();
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    if(lastFocused) lastFocused.focus();
  }
  items.forEach(function(it){
    it.addEventListener('click', function(){ openLightbox(it); });
    it.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openLightbox(it); }
    });
  });
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function(e){ if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });

  // ---- Aperçu du nom de fichier joint ----
  var fileInput = document.getElementById('f-photo');
  var fileHint = document.getElementById('fileHint');
  if(fileInput){
    fileInput.addEventListener('change', function(){
      if(fileInput.files && fileInput.files[0]){
        fileHint.textContent = 'Fichier joint : ' + fileInput.files[0].name;
        fileHint.classList.add('file-chosen');
      } else {
        fileHint.textContent = 'JPG ou PNG, 10 Mo maximum.';
        fileHint.classList.remove('file-chosen');
      }
    });
  }

  // ---- Form validation ----
  var form = document.getElementById('devisForm');
  var success = document.getElementById('formSuccess');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var valid = true;
    var fields = form.querySelectorAll('.field');
    fields.forEach(function(field){
      var input = field.querySelector('input, select, textarea');
      if(!input) return;
      var ok = true;
      if(input.type === 'file'){ ok = true; }
      else if(input.type === 'checkbox'){ ok = input.checked; }
      else if(input.type === 'email'){ ok = input.value.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value); }
      else { ok = input.value.trim() !== ''; }
      field.classList.toggle('error', !ok);
      if(!ok) valid = false;
    });
    if(valid){
      var photo = document.getElementById('f-photo');
      var photoNote = photo.files && photo.files[0] ? '\nPhoto à joindre dans WhatsApp : ' + photo.files[0].name : '';
      var whatsappMessage = [
        'Bonjour Couronne Urban,',
        '',
        'Je souhaite demander un devis pour mon projet.',
        '',
        'Nom : ' + document.getElementById('f-nom').value.trim(),
        'Prénom : ' + document.getElementById('f-prenom').value.trim(),
        'E-mail : ' + document.getElementById('f-email').value.trim(),
        'Téléphone : ' + document.getElementById('f-tel').value.trim(),
        'Type de projet : ' + document.getElementById('f-type').value,
        'Message : ' + document.getElementById('f-message').value.trim(),
        photoNote,
        '',
        'Merci de me recontacter.'
      ].join('\n');
      var whatsappUrl = 'https://wa.me/212661778452?text=' + encodeURIComponent(whatsappMessage);
      var whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if(!whatsappWindow){ window.location.href = whatsappUrl; }
      success.textContent = 'Votre demande est prête dans WhatsApp. Vérifiez le message puis envoyez-le.';
      success.classList.add('show');
      form.reset();
      if(fileHint){ fileHint.textContent = 'JPG ou PNG, 10 Mo maximum.'; fileHint.classList.remove('file-chosen'); }
      success.setAttribute('tabindex','-1');
      success.focus();
    } else {
      success.classList.remove('show');
      var firstError = form.querySelector('.field.error input, .field.error select, .field.error textarea');
      if(firstError) firstError.focus();
    }
  });

  var compareSlider = document.querySelector('.compare-slider');
  var compareRange = document.querySelector('.compare-slider input[type="range"]');
  var compareAfter = document.querySelector('.compare-after');
  var compareHandle = document.querySelector('.compare-handle');
  if(compareSlider && compareRange && compareAfter && compareHandle){
    function syncCompare(value){
      var percent = Math.min(Math.max(value, 0), 100);
      compareAfter.style.width = percent + '%';
      compareHandle.style.left = percent + '%';
    }
    compareRange.addEventListener('input', function(e){ syncCompare(e.target.value); });
    syncCompare(50);
  }

  // ---- Footer year ----
  document.getElementById('copyYear').textContent = '© ' + new Date().getFullYear() + ' Couronne Urban. Tous droits réservés.';
})();
