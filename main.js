// Pion — page behaviour. Everything works without it; this adds motion and the live board.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero strip: light the frame nearest the centre, start in the middle of the row.
  const strip = document.querySelector('[data-strip]');
  if (strip) {
    const figs = [...strip.querySelectorAll('figure')];
    figs.forEach((f, i) => f.style.setProperty('--n', Math.abs(i - 4)));
    const light = () => {
      const mid = strip.getBoundingClientRect().left + strip.clientWidth / 2;
      let best = null, bestD = Infinity;
      for (const f of figs) { const r = f.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bestD) { bestD = d; best = f; } }
      figs.forEach((f) => f.classList.toggle('is-centre', f === best));
    };
    const start = figs[4];
    const centre = () => { strip.scrollLeft = start.offsetLeft - (strip.clientWidth - start.offsetWidth) / 2; light(); };
    const imgs = start.querySelector('img');
    imgs.complete ? centre() : imgs.addEventListener('load', centre, { once: true });
    let raf = 0;
    strip.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(light); }, { passive: true });
    addEventListener('resize', light);
  }

  // Work films: open on the drawing, neighbours peeking.
  document.querySelectorAll('[data-film]').forEach((film) => {
    [...film.children].forEach((el, i) => el.style.setProperty('--n', i));
    const s = film.querySelector('[data-start]');
    const go = () => { film.scrollLeft = s.offsetLeft - (film.clientWidth - s.offsetWidth) / 2; };
    go(); addEventListener('load', go);
  });

  // Moments row: buttons, progress bar, drag with the mouse.
  const row = document.querySelector('[data-moments]');
  if (row) {
    [...row.children].forEach((el, i) => el.style.setProperty('--n', i));
    const bar = document.querySelector('[data-progress]');
    const update = () => {
      const max = row.scrollWidth - row.clientWidth;
      const seen = (row.scrollLeft + row.clientWidth) / row.scrollWidth;
      bar.style.width = (max <= 0 ? 100 : Math.max(8, seen * 100)) + '%';
    };
    row.addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
    const step = () => row.children[0].getBoundingClientRect().width + 32;
    document.querySelectorAll('[data-how]').forEach((b) => b.addEventListener('click', () => row.scrollBy({ left: step() * Number(b.dataset.how), behavior: reduce ? 'auto' : 'smooth' })));
    let down = false, x0 = 0, s0 = 0;
    row.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; s0 = row.scrollLeft; row.classList.add('dragging'); });
    addEventListener('pointermove', (e) => { if (down) row.scrollLeft = s0 - (e.clientX - x0); });
    addEventListener('pointerup', () => { if (!down) return; down = false; row.classList.remove('dragging'); const w = step(); row.scrollTo({ left: Math.round(row.scrollLeft / w) * w, behavior: reduce ? 'auto' : 'smooth' }); });
  }

  // Reveal once on entry.
  const targets = document.querySelectorAll('[data-reveal], [data-film], [data-moments]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px', threshold: 0 });
    targets.forEach((t) => io.observe(t));
    addEventListener('load', () => setTimeout(() => targets.forEach((t) => { const r = t.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) t.classList.add('is-in'); }), 2500));
  } else targets.forEach((t) => t.classList.add('is-in'));

  // The live board: your own site information board.
  const form = document.querySelector('[data-calc]');
  if (form) {
    const STD = {
      sso: { name: 'stan surowy', price: 2900, weeks: (m) => 14 + m / 20 },
      dev: { name: 'stan deweloperski', price: 4600, weeks: (m) => 22 + m / 12 },
      key: { name: 'pod klucz', price: 6200, weeks: (m) => 30 + m / 9 },
    };
    const out = (k) => document.querySelector(`[data-out="${k}"]`);
    const zl = (n) => new Intl.NumberFormat('pl-PL').format(Math.round(n / 1000) * 1000) + ' zł netto';
    const tyg = (n) => { const l = n % 10, t = n % 100; return n === 1 ? 'tydzień' : (l >= 2 && l <= 4 && !(t >= 12 && t <= 14)) ? 'tygodnie' : 'tygodni'; };
    const raport = (n) => { const l = n % 10, t = n % 100; return n === 1 ? 'piątkowy raport' : (l >= 2 && l <= 4 && !(t >= 12 && t <= 14)) ? 'piątkowe raporty' : 'piątkowych raportów'; };
    const render = () => {
      const m = Number(form.m2.value), s = STD[form.std.value];
      const w = Math.round(s.weeks(m));
      document.getElementById('m2-out').value = `${m} m²`;
      out('kind').textContent = `Budowa domu jednorodzinnego, ${m} m², ${s.name}`;
      out('cost').textContent = zl(m * s.price);
      out('weeks').textContent = `${w} ${tyg(w)}, czyli ${w} ${raport(w)} ze zdjęciami`;
      out('start').textContent = m > 220 ? 'kwiecień 2027, dla ekipy Ewy' : 'luty 2027';
      out('mail').href = 'mailto:biuro@pionbudowa.pl?subject=' + encodeURIComponent(`Dom ${m} m², ${s.name}`) + '&body=' + encodeURIComponent(`Dzień dobry,\n\nustawiłam / ustawiłem na Waszej stronie dom ${m} m², ${s.name}.\nSzacunek: ${zl(m * s.price)}, ${w} ${tyg(w)}.\n\nAdres działki: \nCzy mają Państwo projekt: \n`);
    };
    form.addEventListener('input', render); form.addEventListener('change', render); render();
  }

  // Footer clock, Łódź time.
  const clock = document.querySelector('[data-clock]'), note = document.querySelector('[data-clock-note]');
  if (clock) {
    const tick = () => {
      const now = new Date();
      const p = new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false }).formatToParts(now);
      const h = Number(p.find((x) => x.type === 'hour').value), mi = p.find((x) => x.type === 'minute').value, wd = p.find((x) => x.type === 'weekday').value;
      clock.textContent = `${h}:${mi}`;
      const work = h >= 7 && h < 17 && !/sob|niedz/.test(wd);
      note.textContent = work ? 'Teraz na sześciu budowach trwa praca.' : 'Ekipy wracają na budowy o 7:00.';
    };
    tick(); setInterval(tick, 30000);
  }
})();
