/**
 * Alessandro Panaia — Project Manager Edilizia Privata
 * main.js — Core interactions
 *
 * 1.  AOS init
 * 2.  Active nav highlighting via IntersectionObserver
 * 3.  Smooth scroll
 * 4.  Skill bar animation (FIX: observer on .skills-section, staggered)
 * 5.  Mobile hamburger sidebar toggle
 * 6.  Resize handler
 * 7.  Metodo accordion (mobile only)
 * 8.  Animated stat counters
 * 9.  Scroll progress indicator
 * 10. Custom cursor dot (desktop pointer:fine only)
 */

'use strict';

/* ─────────────────────────────────────────
   1. AOS — Animate On Scroll
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600,
      once: true,
      offset: 60,
      easing: 'ease-out-cubic'
    });
  }

  /* ─────────────────────────────────────────
     2. ACTIVE NAV LINK — IntersectionObserver
     FIX: threshold 0.3 + rootMargin for reliable
     highlighting as user scrolls between sections.
  ───────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  if (sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.getAttribute('id'));
        }
      });
    }, {
      root: null,
      rootMargin: '-15% 0px -55% 0px',
      threshold: 0.3
    });

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  function setActiveNav(activeId) {
    navLinks.forEach(function (link) {
      const key = link.getAttribute('data-section');
      if (key === activeId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'true');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ─────────────────────────────────────────
     3. SMOOTH SCROLL
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      closeMobileSidebar();

      const isMobile = window.innerWidth < 768;
      const offset = isMobile ? 60 : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ─────────────────────────────────────────
     4. SKILL BARS — FIX: observe .skills-section
     When the section enters viewport, animate each
     fill bar with a 150ms stagger per bar.
  ───────────────────────────────────────── */
  const skillsSection = document.querySelector('.skills-section');

  if (skillsSection) {
    const skillsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const fills = entry.target.querySelectorAll('.skill-fill');
          fills.forEach(function (fill, index) {
            const targetWidth = fill.getAttribute('data-width') || '0';
            setTimeout(function () {
              fill.style.width = targetWidth + '%';
            }, 200 + index * 150); // stagger: 200ms, 350ms, 500ms, 650ms
          });
          skillsObserver.unobserve(entry.target); // fire once only
        }
      });
    }, { threshold: 0.2 });

    skillsObserver.observe(skillsSection);
  }

  /* ─────────────────────────────────────────
     5. MOBILE HAMBURGER TOGGLE
  ───────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebarOverlay');

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', function () {
      const isOpen = sidebar.classList.contains('sidebar--open');
      isOpen ? closeMobileSidebar() : openMobileSidebar();
    });

    if (overlay) overlay.addEventListener('click', closeMobileSidebar);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileSidebar();
    });
  }

  function openMobileSidebar() {
    if (!sidebar || !hamburger) return;
    sidebar.classList.add('sidebar--open');
    hamburger.classList.add('hamburger--active');
    hamburger.setAttribute('aria-expanded', 'true');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    if (!sidebar || !hamburger) return;
    sidebar.classList.remove('sidebar--open');
    hamburger.classList.remove('hamburger--active');
    hamburger.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ─────────────────────────────────────────
     6. RESIZE HANDLER
  ───────────────────────────────────────── */
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth >= 768) closeMobileSidebar();
    }, 150);
  });

  /* ─────────────────────────────────────────
     7. METODO ACCORDION (mobile only, < 768px)
     Clicking a card's toggle button expands its
     .card-collapsible; collapses all others.
  ───────────────────────────────────────── */
  const cardsGrid = document.querySelector('.cards-grid');

  if (cardsGrid) {
    cardsGrid.addEventListener('click', function (e) {
      // Only active on mobile
      if (window.innerWidth >= 768) return;

      const btn = e.target.closest('.card-toggle-btn');
      if (!btn) return;

      const card = btn.closest('.service-card');
      if (!card) return;

      const isOpen = card.classList.contains('is-open');

      // Collapse all cards first
      cardsGrid.querySelectorAll('.service-card.is-open').forEach(function (openCard) {
        openCard.classList.remove('is-open');
        openCard.querySelector('.card-toggle-btn').setAttribute('aria-expanded', 'false');
      });

      // If it wasn't open, open it
      if (!isOpen) {
        card.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  /* ─────────────────────────────────────────
     8. ANIMATED STAT COUNTERS
     Triggers when .stats-row enters viewport.
  ───────────────────────────────────────── */
  const statsRow = document.querySelector('.stats-row');

  if (statsRow) {
    const statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-number').forEach(function (el) {
            animateCounter(el);
          });
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    statsObserver.observe(statsRow);
  }

  /**
   * Animate a counter element from 0 to its data-target value.
   * @param {HTMLElement} el
   */
  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1500; // ms
    const step     = target / (duration / 16);
    var current    = 0;

    var timer = setInterval(function () {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 16);
  }

  /* ─────────────────────────────────────────
     9. SCROLL PROGRESS INDICATOR (sidebar)
     Fills a 60px tall bar proportional to
     the user's scroll position on the page.
  ───────────────────────────────────────── */
  const progressFill = document.getElementById('scrollProgress');

  if (progressFill) {
    window.addEventListener('scroll', function () {
      const scrolled = window.scrollY;
      const total    = document.body.scrollHeight - window.innerHeight;
      const pct      = total > 0 ? scrolled / total : 0;
      progressFill.style.height = (pct * 60) + 'px';
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     10. CUSTOM CURSOR DOT
     Only activates on devices with a fine pointer
     (desktop/laptop with mouse). Tracks mousemove
     via rAF; scales up over interactive elements.
  ───────────────────────────────────────── */
  if (window.matchMedia('(pointer: fine)').matches) {
    var dot = document.createElement('div');
    dot.id  = 'cursor-dot';
    document.body.appendChild(dot);

    var cursorX = 0;
    var cursorY = 0;
    var rafId   = null;

    document.addEventListener('mousemove', function (e) {
      cursorX = e.clientX;
      cursorY = e.clientY;

      if (!rafId) {
        rafId = requestAnimationFrame(function () {
          dot.style.left = cursorX + 'px';
          dot.style.top  = cursorY + 'px';
          rafId = null;
        });
      }
    });

    // Scale up on interactive elements
    var hoverTargets = '.btn, .nav-link, .advenire-link, .card-link, a';

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverTargets)) {
        dot.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverTargets)) {
        dot.classList.remove('cursor-hover');
      }
    });

    // Hide dot when cursor leaves the window
    document.addEventListener('mouseleave', function () {
      dot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity = '';
    });
  }

  /* ─────────────────────────────────────────
     11. COMMITTENZA TABS
     Click or keyboard (←/→) to switch panels.
  ───────────────────────────────────────── */

  var ctabBtns   = Array.from(document.querySelectorAll('.ctab-btn'));
  var ctabPanels = document.querySelectorAll('.ctab-panel');

  function activateCtab(btn) {
    ctabBtns.forEach(function (b) {
      b.classList.remove('ctab-btn--active');
      b.setAttribute('aria-selected', 'false');
    });
    ctabPanels.forEach(function (p) {
      p.classList.remove('ctab-panel--active');
    });
    btn.classList.add('ctab-btn--active');
    btn.setAttribute('aria-selected', 'true');
    var panelId = btn.getAttribute('aria-controls');
    var panel   = panelId ? document.getElementById(panelId) : null;
    if (panel) panel.classList.add('ctab-panel--active');
  }

  if (ctabBtns.length) {
    ctabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activateCtab(btn);
      });

      // Keyboard: ← → to navigate tabs
      btn.addEventListener('keydown', function (e) {
        var idx = ctabBtns.indexOf(btn);
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          var next = ctabBtns[(idx + 1) % ctabBtns.length];
          next.focus();
          activateCtab(next);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          var prev = ctabBtns[(idx - 1 + ctabBtns.length) % ctabBtns.length];
          prev.focus();
          activateCtab(prev);
        }
      });
    });
  }

});

/* ─────────────────────────────────────────
   12. GCCP MODAL — Dati + logica apertura/chiusura
   Dati estratti dal PDF: Metodo-GCCP-6-schede-professionali.pdf
───────────────────────────────────────── */
(function () {
  'use strict';

  var fasiData = {
    1: {
      num:       'FASE 1',
      titolo:    'Analisi strategica iniziale',
      obiettivo: 'Impostare correttamente la commessa prima dell\'avvio, così da partire con obiettivi chiari, responsabilità definite e rischi sotto controllo.',
      descrizione: [
        'La prima fase del Metodo G.C.C.P. serve a costruire una base di governo solida prima dell\'ingresso in cantiere. In questa fase si mettono in ordine documentazione tecnica ed economica, si chiariscono il perimetro operativo, i vincoli autorizzativi, le prescrizioni e le aspettative di tempi, costi e qualità. Il valore della fase non è solo organizzativo: evita avvii confusi, decisioni non presidiate e responsabilità non formalizzate.',
        'Operativamente, l\'attenzione si concentra sul kick-off tecnico, sulla mappatura degli stakeholder coinvolti, sull\'analisi preventiva dei rischi e sulla definizione delle regole di gestione delle varianti e delle decisioni. Ne deriva un assetto iniziale leggibile, tracciabile e condiviso, che riduce ambiguità e consente di presidiare fin da subito i punti sensibili della commessa.'
      ],
      presidio: [
        'verifica coordinata di progetto, capitolato, computo, preventivi e prescrizioni;',
        'definizione di ruoli, responsabilità e canali comunicativi tra committente, impresa, DL, progettisti, fornitori e coordinatori sicurezza;',
        'analisi dei rischi tecnici, temporali, economici, logistici e di interferenza;',
        'impostazione del piano di controllo e della cadenza minima di presidio.'
      ],
      output: [
        'documento di impostazione della commessa;',
        'matrice rischi con azioni preventive e responsabilità assegnate;',
        'piano di reporting con verbali, report e scadenze di aggiornamento.'
      ],
      tempi:   'Riduce partenze disordinate, decisioni tardive e blocchi dovuti a ruoli non chiariti.',
      costi:   'Rende visibili fin dall\'inizio i fattori che possono generare extracosti o varianti non presidiate.',
      rischio: 'Abbassa l\'esposizione a errori iniziali, incomprensioni operative e contestazioni su responsabilità e perimetro.',
      valore:  'Il risultato atteso è una commessa avviata con regole chiare, priorità condivise e minore esposizione a errori iniziali che, se trascurati, tendono a trasformarsi in ritardi, extracosti e contenziosi in fase esecutiva.',
      pdf:     'PDF/fase-1-analisi-strategica-iniziale.pdf'
    },
    2: {
      num:       'FASE 2',
      titolo:    'Pianificazione strutturata',
      obiettivo: 'Tradurre obiettivi, costi e vincoli in un assetto economico, contrattuale e operativo realmente governabile.',
      descrizione: [
        'La seconda fase consolida l\'impostazione iniziale e la trasforma in pianificazione concreta. Qui il metodo lavora sul quadro economico, sui preventivi, sul computo, sui criteri di contabilizzazione e sugli elementi contrattuali che definiscono perimetro, esclusioni e responsabilità. Non si tratta di una pianificazione teorica: l\'obiettivo è creare una base chiara e sostenibile, capace di reggere l\'esecuzione senza zone grigie.',
        'Parallelamente vengono analizzati i rischi economici e le lavorazioni sensibili, si organizzano le fasi operative e le milestone, si coordinano forniture e approvvigionamenti e si definisce il flusso delle approvazioni. Questo passaggio è decisivo perché rende esplicito come una scelta tecnica o una variante possa riflettersi su tempi, costi e continuità produttiva.'
      ],
      presidio: [
        'lettura tecnico-economica di computo, preventivi, contratti e criteri di contabilizzazione;',
        'definizione di perimetro, esclusioni, responsabilità e regole di gestione delle varianti;',
        'sequenza delle lavorazioni, milestone, fabbisogni di approvvigionamento e decisioni critiche;',
        'costruzione di un sistema di tracciabilità delle approvazioni.'
      ],
      output: [
        'assetto economico e contrattuale sintetico e condiviso;',
        'piano fasi e milestone;',
        'schema registro decisioni e approvazioni.'
      ],
      tempi:   'Coordina fasi, milestone e approvvigionamenti evitando ritardi da sequenze incoerenti o approvazioni tardive.',
      costi:   'Collega quadro economico, contratti e criteri di contabilizzazione, rendendo più leggibili impatti e marginalità.',
      rischio: 'Riduce ambiguità contrattuali, esclusioni non presidiate e varianti prive di una base decisionale chiara.',
      valore:  'Una pianificazione strutturata riduce l\'ambiguità contrattuale, migliora la coerenza tra risorse e fasi, e consente di prevenire varianti non governate o ritardi generati da approvazioni tardive e forniture disallineate.',
      pdf:     'PDF/fase-2-pianificazione-strutturata.pdf'
    },
    3: {
      num:       'FASE 3',
      titolo:    'Esecuzione coordinata',
      obiettivo: 'Mantenere il cantiere fluido e ordinato, con attori allineati, prerequisiti verificati e interferenze gestite prima che blocchino la produzione.',
      descrizione: [
        'Con l\'avvio operativo della commessa, il Metodo G.C.C.P. entra nella fase di coordinamento dell\'esecuzione. Il focus non è soltanto "far partire i lavori", ma farli procedere con continuità, sequenza logica e controllo delle interfacce. In questa fase si presidiano programmazione di maestranze e forniture, relazioni con DL e progettisti, regole logistiche e prerequisiti per l\'avvio delle fasi critiche.',
        'Il coordinamento ha una funzione molto concreta: prevenire tempi morti, rilavorazioni, sovrapposizioni improduttive e blocchi causati da dettagli tecnici non risolti o approvvigionamenti non sincronizzati. Ogni fase operativa viene quindi accompagnata da verifiche preliminari, allineamenti tecnici e gestione delle priorità, così da garantire continuità produttiva e maggiore affidabilità esecutiva.'
      ],
      presidio: [
        'coordinamento quotidiano tra squadre, fornitori, figure tecniche e referenti di cantiere;',
        'gestione delle interferenze tra lavorazioni e verifica dei prerequisiti di avvio delle fasi sensibili;',
        'allineamento su dettagli esecutivi, decisioni tecniche e varianti operative;',
        'aggiornamento della programmazione in funzione di priorità, vincoli e disponibilità reali.'
      ],
      output: [
        'piano di coordinamento operativo con azioni e responsabili;',
        'verbali di avvio fase, quando necessari;',
        'aggiornamenti di programmazione di forniture e maestranze.'
      ],
      tempi:   'Limita tempi morti e attese improduttive grazie a prerequisiti verificati e priorità allineate.',
      costi:   'Contiene rilavorazioni, inefficienze di squadra e disallineamenti tra forniture e produzione.',
      rischio: 'Riduce interferenze, errori esecutivi e blocchi operativi che possono compromettere continuità e qualità.',
      valore:  'Una esecuzione coordinata riduce fermi, incomprensioni e rilavorazioni, migliora la qualità del flusso produttivo e mette il cantiere nelle condizioni di avanzare con ordine, sicurezza e affidabilità.',
      pdf:     'PDF/fase-3-esecuzione-coordinata.pdf'
    },
    4: {
      num:       'FASE 4',
      titolo:    'Controllo continuo',
      obiettivo: 'Monitorare l\'avanzamento in modo costante, documentato e leggibile, per intercettare gli scostamenti prima che diventino criticità di commessa.',
      descrizione: [
        'La quarta fase introduce un presidio regolare dell\'andamento del cantiere attraverso sopralluoghi, checklist, verbali e report. Il controllo continuo non coincide con una semplice verifica periodica: è un sistema di lettura dell\'avanzamento che consente di confrontare quanto pianificato con quanto realmente eseguito, individuando in tempo utile ritardi, non conformità, criticità di qualità e scostamenti economici.',
        'Elemento centrale della fase è la formalizzazione delle decisioni: ogni sopralluogo produce indicazioni operative, responsabilità, scadenze e aggiornamenti al registro delle azioni aperte e delle varianti. In questo modo il controllo non resta osservazione passiva, ma diventa uno strumento di governo, utile sia alla gestione quotidiana sia alla tutela professionale e documentale delle parti coinvolte.'
      ],
      presidio: [
        'calendario stabile di sopralluoghi e verifiche con checklist di qualità, avanzamento e sicurezza;',
        'rilevazione di scostamenti rispetto a programma, costi, priorità e standard esecutivi;',
        'formalizzazione di decisioni, azioni correttive, responsabili e scadenze;',
        'aggiornamento continuo di report, registro varianti e stato delle azioni aperte.'
      ],
      output: [
        'verbali standardizzati di sopralluogo;',
        'report di avanzamento;',
        'registro varianti e azioni correttive aggiornato.'
      ],
      tempi:   'Intercetta in anticipo gli scostamenti e consente di attivare azioni correttive prima che il ritardo si consolidi.',
      costi:   'Fa emergere variazioni e inefficienze quando sono ancora governabili, evitando derive economiche tardive.',
      rischio: 'Rafforza tutela documentale e trasparenza decisionale, elementi essenziali in caso di contestazioni.',
      valore:  'Il beneficio principale è la capacità di intervenire in anticipo: gli scostamenti vengono intercettati precocemente, la comunicazione tra le parti diventa trasparente e le decisioni restano tracciate, riducendo il rischio di contestazioni future.',
      pdf:     'PDF/fase-4-controllo-continuo.pdf'
    },
    5: {
      num:       'FASE 5',
      titolo:    'Gestione delle criticità',
      obiettivo: 'Affrontare problemi, imprevisti e varianti con metodo, rapidità decisionale e tracciabilità documentale.',
      descrizione: [
        'Nessuna commessa complessa è priva di criticità. La differenza la fa il modo in cui vengono lette, condivise e governate. Nella quinta fase il Metodo G.C.C.P. struttura la gestione dei problemi tecnici, organizzativi o di sicurezza attraverso una logica analitica e documentata: si parte dalla segnalazione, si ricostruiscono cause e alternative, si valutano gli impatti su tempi, costi e qualità e si formalizza la decisione più coerente con il progetto e con il quadro contrattuale.',
        'Questo approccio evita risposte improvvisate e, soprattutto, impedisce che una criticità locale produca effetti più ampi sulla commessa. La variante viene trattata come un processo da presidiare, non come una semplice modifica operativa. Ne deriva una gestione più ordinata delle approvazioni, minori conflitti tra soggetti coinvolti e migliore capacità di difendere le scelte tecniche ed economiche adottate.'
      ],
      presidio: [
        'raccolta strutturata delle segnalazioni di criticità e delle informazioni di contesto;',
        'analisi delle cause e costruzione di opzioni alternative con relativi pro e contro;',
        'valutazione degli impatti su tempi, costi, qualità, sicurezza e conformità contrattuale;',
        'formalizzazione della decisione, gestione della variante, comunicazione e verifica finale.'
      ],
      output: [
        'scheda criticità o variante;',
        'piano delle azioni correttive aggiornato;',
        'verbale di decisione, quando necessario.'
      ],
      tempi:   'Accelera il ciclo di risposta alle anomalie evitando che un problema locale paralizzi più fasi di cantiere.',
      costi:   'Misura gli effetti delle alternative tecniche e delle varianti prima dell\'esecuzione, limitando extracosti non valutati.',
      rischio: 'Riduce conflitti e contenziosi perché ogni scelta viene analizzata, approvata e formalizzata con tracciabilità.',
      valore:  'Una gestione rigorosa delle criticità riduce tempi di risposta, limita fermi e rilavorazioni e abbassa il rischio di contenzioso, perché ogni scelta viene motivata, condivisa e documentata.',
      pdf:     'PDF/fase-5-gestione-delle-criticita.pdf'
    },
    6: {
      num:       'FASE 6',
      titolo:    'Chiusura controllata',
      obiettivo: 'Concludere la commessa con verifiche finali, documentazione completa e chiusura tecnico-economica ordinata.',
      descrizione: [
        'L\'ultima fase del Metodo G.C.C.P. ha l\'obiettivo di evitare che il progetto si chiuda in modo approssimativo, lasciando residui tecnici, documentali o economici destinati a riemergere dopo il cantiere. La chiusura controllata prevede la verifica del completamento delle opere, la risoluzione delle non conformità residue, la raccolta delle dichiarazioni e della documentazione finale e la sistemazione della contabilità conclusiva.',
        'È una fase spesso sottovalutata, ma fondamentale per tutelare committenza, professionisti e impresa. Un dossier finale ordinato consente infatti di ricostruire quanto eseguito, cosa è stato approvato, quali varianti sono intervenute e come si è chiuso il quadro economico. La commessa non viene soltanto terminata: viene chiusa in modo leggibile, coerente e difendibile.'
      ],
      presidio: [
        'checklist di completamento opere e verifica finale delle difformità residue;',
        'raccolta, controllo e organizzazione della documentazione di fine lavori;',
        'consuntivo finale di tempi, costi, varianti e stato della commessa;',
        'redazione della relazione finale e consegna ordinata degli elaborati conclusivi.'
      ],
      output: [
        'checklist finale e verbale di fine lavori, se previsto;',
        'dossier documentale di chiusura;',
        'consuntivo finale e relazione conclusiva.'
      ],
      tempi:   'Consente una chiusura ordinata della commessa senza trascinare attività residue o richieste postume.',
      costi:   'Allinea consuntivo finale, varianti e contabilizzazione conclusiva, migliorando leggibilità e coerenza economica.',
      rischio: 'Riduce contestazioni post-lavori e lacune documentali, tutelando sia il professionista sia la committenza.',
      valore:  'La chiusura controllata riduce contestazioni post-lavori, migliora la trasparenza verso il cliente e consente di archiviare la commessa con un quadro tecnico ed economico completo, pronto per eventuali verifiche o passaggi successivi.',
      pdf:     'PDF/fase-6-chiusura-controllata.pdf'
    }
  };

  /* ── DOM refs ── */
  var overlay  = document.getElementById('gccpModalOverlay');
  var modal    = document.getElementById('gccpModal');
  var closeBtn = document.getElementById('gccpModalClose');
  var backBtn  = document.getElementById('gccpModalBack');

  if (!overlay || !modal) return;

  /* ── Populate modal with fase data ── */
  function populateModal(faseNum) {
    var d = fasiData[faseNum];
    if (!d) return;

    document.getElementById('gccpModalNum').textContent       = d.num;
    document.getElementById('gccpModalTitle').textContent     = d.titolo;
    document.getElementById('gccpModalObiettivo').textContent = d.obiettivo;
    document.getElementById('gccpModalTempi').textContent     = d.tempi;
    document.getElementById('gccpModalCosti').textContent     = d.costi;
    document.getElementById('gccpModalRischio').textContent   = d.rischio;
    document.getElementById('gccpModalValore').textContent    = d.valore;

    /* Descrizione (multi-paragraph) */
    var descEl = document.getElementById('gccpModalDescrizione');
    descEl.innerHTML = '';
    d.descrizione.forEach(function (para) {
      var p = document.createElement('p');
      p.textContent = para;
      descEl.appendChild(p);
    });

    /* Presidio list */
    var presEl = document.getElementById('gccpModalPresidio');
    presEl.innerHTML = '';
    d.presidio.forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item;
      presEl.appendChild(li);
    });

    /* Output list */
    var outEl = document.getElementById('gccpModalOutput');
    outEl.innerHTML = '';
    d.output.forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item;
      outEl.appendChild(li);
    });
  }

  /* ── Open modal ── */
  function openModal(faseNum) {
    populateModal(faseNum);
    document.getElementById('gccpModalBody').scrollTop = 0;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    /* Focus first focusable element inside modal */
    setTimeout(function () {
      if (closeBtn) closeBtn.focus();
    }, 350);
  }

  /* ── Close modal ── */
  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    /* Return focus to the trigger that opened the modal */
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  /* ── Focus trap ── */
  function getFocusableElements() {
    return Array.from(modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
  }

  function trapFocus(e) {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key !== 'Tab') return;

    var focusable = getFocusableElements();
    if (!focusable.length) return;

    var first = focusable[0];
    var last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* ── Event listeners ── */
  var lastTrigger = null;

  /* "Scopri di più" buttons on cards */
  document.querySelectorAll('.btn-scopri').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lastTrigger = btn;
      var faseNum = parseInt(btn.getAttribute('data-fase'), 10);
      openModal(faseNum);
    });
  });

  /* Close via × button */
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  /* Close via "← Torna al Metodo" button */
  if (backBtn) backBtn.addEventListener('click', closeModal);

  /* Close via overlay click (outside modal panel) */
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  /* Close via ESC */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });

  /* Focus trap on Tab */
  document.addEventListener('keydown', trapFocus);

}());
