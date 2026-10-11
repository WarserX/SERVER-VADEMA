/* ============================================================ */
/* SCRIPTS — все скрипты foto-28.html                            */
/* ============================================================ */

(function () {
    'use strict';

    /* ============================================================ */
    /* БЛОК 11 — ПОДСВЕТКА ИМЁН (Вадимус — зелёный, Иван — красный)  */
    /* ============================================================ */

    function initNameHighlight() {
        const patternVadimus = /(Вадимус[а-яё]*)/g;
        const patternIvan = /(Сайбер\s+Иван[а-яё]*)/g;

        function replaceInNode(node) {
            if (node.nodeType === 3) {
                const text = node.nodeValue;
                if (!patternVadimus.test(text) && !patternIvan.test(text)) return;

                patternVadimus.lastIndex = 0;
                patternIvan.lastIndex = 0;

                const parts = text.split(patternIvan);
                const frag = document.createDocumentFragment();

                parts.forEach(part => {
                    if (/^Сайбер\s+Иван[а-яё]*$/.test(part)) {
                        const s = document.createElement('strong');
                        s.textContent = part;
                        s.style.fontWeight = '700';
                        s.style.color = '#E53935';
                        frag.appendChild(s);
                    } else if (part) {
                        const subParts = part.split(patternVadimus);
                        subParts.forEach(sub => {
                            if (/^Вадимус[а-яё]*$/.test(sub)) {
                                const s = document.createElement('strong');
                                s.textContent = sub;
                                s.style.fontWeight = '700';
                                s.style.color = '#4ade80';
                                frag.appendChild(s);
                            } else if (sub) {
                                frag.appendChild(document.createTextNode(sub));
                            }
                        });
                    }
                });

                node.parentNode.replaceChild(frag, node);
            } else if (
                node.nodeType === 1 &&
                node.tagName !== 'SCRIPT' &&
                node.tagName !== 'STYLE' &&
                !node.closest('.header__list') &&
                !node.closest('a')
            ) {
                [...node.childNodes].forEach(replaceInNode);
            }
        }

        replaceInNode(document.body);
    }

    /* ============================================================ */
    /* БЛОК 12 — СЖАТИЕ ШАПКИ ПРИ СКРОЛЛЕ                            */
    /* ============================================================ */

    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        let ticking = false;
        let compact = false;

        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                const y = window.scrollY;
                if (!compact && y > 100) {
                    compact = true;
                    header.classList.add('header--scrolled');
                } else if (compact && y < 50) {
                    compact = false;
                    header.classList.remove('header--scrolled');
                }
                ticking = false;
            });
        }, { passive: true });
    }

    /* ============================================================ */
    /* БЛОК 13 — ПОДСВЕТКА АКТИВНОЙ ССЫЛКИ В ШАПКЕ                   */
    /* ============================================================ */
function initActiveLink() {
    const header = document.querySelector('.header');
    if (!header) return;

    const LINE = 150;
    let currentActive = null;

    function getVisibleList() {
        if (header.classList.contains('header--site05'))
            return header.querySelector('.header__list--site05');
        if (header.classList.contains('header--site3'))
            return header.querySelector('.header__list--site3');
        return header.querySelector('.header__list:not(.header__list--site3):not(.header__list--site05)');
    }

    function getCurrentMain() {
        if (header.classList.contains('header--site05'))
            return document.getElementById('site05');
        if (header.classList.contains('header--site3'))
            return document.getElementById('site3');
        if (header.classList.contains('header--site2'))
            return document.getElementById('site2');
        const hero = document.getElementById('hero');
        return hero ? hero.closest('main') : null;
    }

    function findWinner(links, main) {
        let winner = null;
        let winnerTop = -Infinity;

        links.forEach(function (link) {
            const href = (link.getAttribute('href') || '').trim();

            let top;
            if (href === '#' || href === '') {
                top = main ? main.getBoundingClientRect().top : -100000;
            } else if (href.charAt(0) === '#') {
                const target = document.getElementById(href.slice(1));
                if (!target) return;
                if (main && target.closest('main') !== main) return;  // чужой сайт — не участвует
                top = target.getBoundingClientRect().top;
            } else {
                return;
            }

            if (top <= LINE && top > winnerTop) {
                winnerTop = top;
                winner = link;
            }
        });

        if (!winner) winner = links[0];
        return winner;
    }

    function tick() {
        const list = getVisibleList();
        const main = getCurrentMain();
        if (!list) return;

        const links = Array.prototype.slice.call(
            list.querySelectorAll('.header__list_link')
        );
        if (!links.length) return;

        const winner = findWinner(links, main);

        if (winner === currentActive) return;
        currentActive = winner;

        header.querySelectorAll('.header__list_link.active').forEach(function (el) {
            if (el !== winner) el.classList.remove('active');
        });
        winner.classList.add('active');
    }

    let raf = false;
    function schedule() {
        if (raf) return;
        raf = true;
        requestAnimationFrame(function () { tick(); raf = false; });
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);

    new MutationObserver(function () {
        currentActive = null;
        schedule();
    }).observe(header, {
        attributes: true,
        attributeFilter: ['class']
    });

    schedule();
}
    /* ============================================================ */
    /* БЛОК 15 — ГАЛЕРЕЯ + ЛАЙТБОКС                                  */
    /* ============================================================ */

    function initGalleries() {
        const lb = document.getElementById('photo-lightbox');
        const lbImg = lb ? lb.querySelector('.photo-lightbox__img') : null;

        function openLightbox(slide) {
            if (!lb || !lbImg) return;
            const img = slide.querySelector('img');
            if (!img) return;
            lbImg.src = img.src;
            lbImg.alt = img.alt || '';
            lb.classList.add('is-open');
            lb.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            if (!lb || !lbImg) return;
            lb.classList.remove('is-open');
            lb.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            setTimeout(function () { lbImg.src = ''; }, 300);
        }

        if (lb) {
            lb.addEventListener('click', function (e) {
                if (e.target === lb || e.target.closest('.photo-lightbox__close')) {
                    closeLightbox();
                }
            });
        }
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lb && lb.classList.contains('is-open')) closeLightbox();
        });

        document.querySelectorAll('[data-gallery]').forEach(function (wrap) {
            const slides = Array.prototype.slice.call(wrap.querySelectorAll('.card__gallery-slide'));
            const prevBtn = wrap.querySelector('[data-gallery-prev]');
            const nextBtn = wrap.querySelector('[data-gallery-next]');
            const dotsBox = wrap.querySelector('[data-gallery-dots]');
            const total = slides.length;
            if (total === 0) return;

            let current = 0;

            dotsBox.innerHTML = '';
            for (let i = 0; i < total; i++) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'card__gallery-dot' + (i === 0 ? ' is-active' : '');
                dot.setAttribute('data-index', i);
                dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
                dotsBox.appendChild(dot);
            }
            const dots = Array.prototype.slice.call(dotsBox.querySelectorAll('.card__gallery-dot'));

            if (total === 1) {
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
                if (dotsBox) dotsBox.style.display = 'none';
                slides[0].classList.add('is-active');
                slides[0].addEventListener('click', function () { openLightbox(slides[0]); });
                return;
            }

            function update() {
                slides.forEach(function (s, i) {
                    s.classList.remove('is-active', 'is-prev', 'is-next');
                    const diff = (i - current + total) % total;
                    if (diff === 0) s.classList.add('is-active');
                    else if (diff === 1) s.classList.add('is-next');
                    else if (diff === total - 1) s.classList.add('is-prev');
                });
                dots.forEach(function (d, i) {
                    d.classList.toggle('is-active', i === current);
                });
            }

            function goTo(index) {
                if (index < 0) index = total - 1;
                if (index >= total) index = 0;
                current = index;
                update();
            }

            if (nextBtn) nextBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                goTo(current + 1);
            });
            if (prevBtn) prevBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                goTo(current - 1);
            });

            dotsBox.addEventListener('click', function (e) {
                const dot = e.target.closest('.card__gallery-dot');
                if (!dot) return;
                e.preventDefault();
                e.stopPropagation();
                goTo(parseInt(dot.getAttribute('data-index'), 10));
            });

            slides.forEach(function (s, i) {
                s.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (i === current) {
                        openLightbox(s);
                    } else {
                        goTo(i);
                    }
                });
            });

            update();
        });
    }

    /* ============================================================ */
    /* БЛОК 16 — ЛАЙТБОКС ДЛЯ ФОТО ВАДИМУСА                          */
    /* ============================================================ */

    function initVadimusLightbox() {
        const lb = document.getElementById('photo-lightbox');
        if (!lb) return;
        const lbImg = lb.querySelector('.photo-lightbox__img');

        function openLb(img) {
            lbImg.src = img.src;
            lbImg.alt = img.alt || '';
            lb.classList.add('is-open');
            lb.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        document.querySelectorAll('.vadimus__portrait-img').forEach(function (img) {
            img.addEventListener('click', function () {
                openLb(img);
            });
        });
    }

    /* ============================================================ */
    /* БЛОК 17 — ПЕРЕКЛЮЧЕНИЕ ШАПКИ (3 РЕЖИМА)                       */
    /* ============================================================ */

    function initHeaderModeSwitch() {
    const header = document.querySelector('.header');
    const site05 = document.getElementById('site05');
    const site2 = document.getElementById('site2');
    const site3 = document.getElementById('site3');
    if (!header) return;

    const links = document.querySelectorAll(
        '.header__list:not(.header__list--site05):not(.header__list--site3) .header__list_link[data-href-1]'
    );
    let currentMode = '';

    function setMode(mode) {
        if (currentMode === mode) return;
        currentMode = mode;

        header.classList.toggle('header--site05', mode === 'site05');
        header.classList.toggle('header--site2', mode === 'site2');
        header.classList.toggle('header--site3', mode === 'site3');

        if (mode === 'site05' || mode === 'site3') return;

        const isSite2 = (mode === 'site2');
        links.forEach(function (link) {
            const h1 = link.getAttribute('data-href-1');
            const h2 = link.getAttribute('data-href-2');
            link.href = isSite2 ? (h2 || h1) : (h1 || h2);
        });
    }

    function tick() {
        const mid = window.innerHeight * 0.4;

        if (site3 && site3.getBoundingClientRect().top <= mid) { setMode('site3'); return; }
        if (site2 && site2.getBoundingClientRect().top <= mid) { setMode('site2'); return; }
        if (site05 && site05.getBoundingClientRect().bottom > mid) { setMode('site05'); return; }
        setMode('site1');
    }

    let raf = false;
    window.addEventListener('scroll', function () {
        if (raf) return;
        raf = true;
        requestAnimationFrame(function () { tick(); raf = false; });
    }, { passive: true });

    window.addEventListener('load', tick);
    tick();
}
    /* ============================================================ */
    /* БУРГЕР-МЕНЮ                                                   */
    /* ============================================================ */

    function initBurger() {
        const burger = document.querySelector('.header__burger');
        if (!burger) return;

        function getLists() {
            return document.querySelectorAll('.header__list');
        }

        burger.addEventListener('click', function () {
            burger.classList.toggle('is-open');
            getLists().forEach(function (l) { l.classList.toggle('is-open'); });
        });

        getLists().forEach(function (list) {
            list.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () {
                    burger.classList.remove('is-open');
                    getLists().forEach(function (l) { l.classList.remove('is-open'); });
                });
            });
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 1200) {
                burger.classList.remove('is-open');
                getLists().forEach(function (l) { l.classList.remove('is-open'); });
            }
        });
    }

    /* ============================================================ */
    /* ЗАПУСК                                                        */
    /* ============================================================ */

    window.addEventListener('load', function () {
        initNameHighlight();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initHeaderScroll();
            initActiveLink();
            initGalleries();
            initVadimusLightbox();
            initHeaderModeSwitch();
            initBurger();
        });
    } else {
        initHeaderScroll();
        initActiveLink();
        initGalleries();
        initVadimusLightbox();
        initHeaderModeSwitch();
        initBurger();
    }

})();

/* ============================================================ */
/* БЛОК 18 — ГИМН ЯДЕРСТАНА                                     */
/* ============================================================ */

function initAnthem() {
    const btn = document.querySelector('.site3-anthem');
    if (!btn) return;
    const audio = btn.querySelector('.site3-anthem__audio');
    const icon = btn.querySelector('.site3-anthem__icon');
    const label = btn.querySelector('.site3-anthem__label');
    const bar = btn.querySelector('.site3-anthem__bar');
    if (!audio) return;

    const progress = document.querySelector('[data-anthem-progress]');
    const currentEl = document.querySelector('[data-anthem-current]');
    const durationEl = document.querySelector('[data-anthem-duration]');
    const volumeEl = document.querySelector('[data-anthem-volume]');

    function fmt(sec) {
        if (!isFinite(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return m + ':' + String(s).padStart(2, '0');
    }

    // Стартовая громкость
    audio.volume = volumeEl ? parseFloat(volumeEl.value) : 0.8;

    // Метаданные загружены — показать длительность
    audio.addEventListener('loadedmetadata', function () {
        if (durationEl) durationEl.textContent = fmt(audio.duration);
    });

    // Кнопка play/pause
    btn.addEventListener('click', function () {
        if (audio.paused) {
            audio.play().then(function () {
                btn.classList.add('is-playing');
                icon.textContent = '■';
                label.textContent = 'Остановить';
            }).catch(function () {
                label.textContent = 'Файл не найден';
            });
        } else {
            audio.pause();
            btn.classList.remove('is-playing');
            icon.textContent = '▶';
            label.textContent = 'Воспроизвести';
        }
    });

    // Прогресс играет
    audio.addEventListener('timeupdate', function () {
        if (!progress || !audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        progress.value = pct;
        progress.style.setProperty('--val', pct + '%');
        if (currentEl) currentEl.textContent = fmt(audio.currentTime);
    });

    // Перемещение ползунка прогресса
    if (progress) {
        progress.addEventListener('input', function () {
            if (!audio.duration) return;
            audio.currentTime = (progress.value / 100) * audio.duration;
            progress.style.setProperty('--val', progress.value + '%');
        });
    }

    // Громкость
    if (volumeEl) {
        volumeEl.addEventListener('input', function () {
            audio.volume = parseFloat(volumeEl.value);
        });
    }

    // Конец трека — сброс
    audio.addEventListener('ended', function () {
        btn.classList.remove('is-playing');
        icon.textContent = '▶';
        label.textContent = 'Воспроизвести';
        if (progress) {
            progress.value = 0;
            progress.style.setProperty('--val', '0%');
        }
        if (currentEl) currentEl.textContent = '0:00';
    });
}

/* ============================================================ */
/* Запуск гимна после загрузки страницы                         */
/* ============================================================ */

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnthem);
} else {
    initAnthem();
}

/* ============================================================ */
/* БЛОК 19 — ПАУЗА HUD ЯДЕРСТАНА ВНЕ ВИДИМОСТИ                  */
/* ============================================================ */

function initHudVisibility() {
    const site3 = document.getElementById('site3');
    if (!site3) return;

    const obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            document.documentElement.classList.toggle(
                'site3-hud-paused',
                !entry.isIntersecting
            );
        });
    }, { rootMargin: '200px 0px' });

    obs.observe(site3);
}

/* ============================================================ */
/* SITE3 — пауза анимаций в невидимых секциях                   */
/* ============================================================ */

function initSectionAnimationPause() {
    const site3 = document.getElementById('site3');
    if (!site3) return;

    /* Наблюдаемые элементы: все секции + hero + footer */
    const targets = site3.querySelectorAll(
        '.site3-hero, .site3-section, .site3-footer'
    );

    if (!targets.length) return;

    const obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            entry.target.classList.toggle(
                's3-off-screen',
                !entry.isIntersecting
            );
        });
    }, {
        /* rootMargin: 200px сверху и снизу. Анимации стартуют
           чуть раньше, чем элемент войдёт в экран — без рывка. */
        rootMargin: '200px 0px'
    });

    targets.forEach(function (t) { obs.observe(t); });
}

/* Запуск пауз */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        initHudVisibility();
        initSectionAnimationPause();
    });
} else {
    initHudVisibility();
    initSectionAnimationPause();
}

/* ============================================================ */
/* ГЛОБАЛЬНЫЙ ЛАЙТБОКС — клик по любому фото открывает большое  */
/* ============================================================ */

function initGlobalLightbox() {
    const lb = document.getElementById('photo-lightbox');
    if (!lb) return;
    const lbImg = lb.querySelector('.photo-lightbox__img');
    if (!lbImg) return;

    function openLb(src, alt) {
        lbImg.src = src;
        lbImg.alt = alt || '';
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    document.querySelectorAll('img').forEach(function (img) {
        /* Пропускаем логотипы, галереи (у них своя логика) и сам лайтбокс */
        if (img.closest('.photo-lightbox')) return;
        if (img.closest('.header__logo')) return;
        if (img.closest('.footer__logo')) return;
        if (img.classList.contains('footer__logo')) return;
        if (img.closest('.card__gallery-slide')) return;

        /* Пропускаем декоративные иконки < 80px */
        if (img.naturalWidth && img.naturalWidth < 80 && img.naturalHeight < 80) return;

        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function (e) {
            /* Ещё одна проверка — на момент клика картинка точно загружена */
            if (img.naturalWidth && img.naturalWidth < 80 && img.naturalHeight < 80) return;
            e.preventDefault();
            e.stopPropagation();
            openLb(img.src, img.alt);
        });
    });
}

/* Запуск после загрузки страницы */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalLightbox);
} else {
    initGlobalLightbox();
}