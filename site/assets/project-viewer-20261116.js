(() => {
  'use strict';
  const links = [...document.querySelectorAll('.yg-media-page .yg-photo-link')];
  if (!links.length || typeof HTMLDialogElement === 'undefined') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'yg-image-viewer';
  dialog.setAttribute('aria-labelledby', 'yg-viewer-title');
  dialog.innerHTML = '<div class="yg-viewer-toolbar"><h2 id="yg-viewer-title">YAPIGÜÇ · Saha arşivi</h2><button type="button" data-viewer-close aria-label="Görseli kapat">Kapat ×</button></div><img alt=""><p class="yg-viewer-caption" aria-live="polite" aria-atomic="true"></p><p data-viewer-error hidden>Görsel yüklenemedi. Özgün dosya bağlantısını kullanabilirsiniz.</p><div class="yg-viewer-bottom"><div><button type="button" data-viewer-prev aria-label="Önceki fotoğraf">← Önceki</button><button type="button" data-viewer-next aria-label="Sonraki fotoğraf">Sonraki →</button></div><a target="_blank" rel="noopener noreferrer">Özgün görseli aç ↗</a></div>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('.yg-viewer-caption');
  const original = dialog.querySelector('a');
  const previous = dialog.querySelector('[data-viewer-prev]');
  const next = dialog.querySelector('[data-viewer-next]');
  const error = dialog.querySelector('[data-viewer-error]');
  let items = [], index = 0, opener, previousOverflow;
  const render = () => {
    const link = items[index];
    const source = link.querySelector('img');
    error.hidden = true;
    image.alt = source.alt;
    image.src = link.href;
    const label = link.closest('figure')?.querySelector('figcaption')?.textContent.trim() || source.alt;
    caption.textContent = `${index + 1} / ${items.length} · ${label}`;
    original.href = link.href;
    previous.disabled = index === 0;
    next.disabled = index === items.length - 1;
  };
  image.addEventListener('error', () => { error.hidden = false; });
  const move = direction => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    index = target;
    render();
  };
  links.forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    items = links.filter(item => !item.closest('[hidden]'));
    index = items.indexOf(link);
    if (index < 0) return;
    opener = link;
    render();
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.querySelector('[data-viewer-close]').focus();
  }));
  dialog.querySelector('[data-viewer-close]').addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    opener?.focus({ preventScroll: true });
  });
})();
