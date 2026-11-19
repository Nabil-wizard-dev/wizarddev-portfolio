import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, computed, effect, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { LANGS, Lang, TRANSLATIONS } from './i18n';

declare const FrenifyDeebo: { init: () => void } | undefined;

interface Tech {
  name: string;
  url: string;
  logo: string;
}

interface StackGroup {
  title: string;
  /** Une « copie » de la bande : les technos répétées pour couvrir la largeur. */
  tiles: Tech[];
}

/** Tuiles minimum par copie, pour qu'une copie soit plus large que la bande même sur un grand écran. */
const MIN_TILES_PER_COPY = 12;

function stackGroup(title: string, items: Tech[]): StackGroup {
  const repeat = Math.ceil(MIN_TILES_PER_COPY / items.length);
  return { title, tiles: Array.from({ length: repeat }, () => items).flat() };
}

type Theme = 'light' | 'dark';

/** Carte en train d'être lancée hors du paquet (« out ») ou ramenée devant (« in »). */
interface DeckMotion {
  index: number;
  kind: 'out' | 'in';
  /** 1 : vers la droite, -1 : vers la gauche. */
  dir: 1 | -1;
}

/** Distance (px) au-delà de laquelle un glisser lance la carte. */
const DECK_THROW_DISTANCE = 90;
/** Durée de l'animation de lancer, alignée sur le CSS (deck-out / deck-in). */
const DECK_MOTION_MS = 700;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './project-deck.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  /** Sections du contenu, dans l'ordre d'affichage (navigation par points). */
  readonly sections = ['cv_biography', 'cv_education', 'clients', 'tips', 'contact'];

  readonly langs = LANGS;
  /** Langue affichée : français par défaut. */
  readonly lang = signal<Lang>('fr');
  /** Textes de la langue courante. */
  readonly t = computed(() => TRANSLATIONS[this.lang()]);

  /** Thème : clair par défaut. */
  readonly theme = signal<Theme>('light');

  /**
   * Ma stack : chaque groupe défile en continu (bande « marquee »).
   * La bande contient deux copies identiques ; elle glisse de la largeur
   * d'une copie puis recommence, sans saut visible.
   */
  readonly stackGroups: StackGroup[] = [
    stackGroup('Front-end', [
      { name: 'Angular', url: 'https://angular.dev/', logo: 'img/clients/angular-ar21.svg' },
      { name: 'Vue.js', url: 'https://vuejs.org/', logo: 'img/clients/vuejs-ar21~bgwhite.svg' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com/', logo: 'img/clients/tailwindcss-ar21.svg' },
    ]),
    stackGroup('Back-end', [
      { name: 'Spring Boot', url: 'https://spring.io/', logo: 'img/clients/springio-ar21.svg' },
      { name: 'Django', url: 'https://www.djangoproject.com/', logo: 'img/clients/djangoproject-ar21.svg' },
      { name: 'Symfony', url: 'https://symfony.com/', logo: 'img/clients/symfony-ar21~bgwhite.svg' },
      { name: 'Laravel', url: 'https://laravel.com/', logo: 'img/clients/laravel-ar21.svg' },
      { name: 'Oracle', url: 'https://www.oracle.com/database/', logo: 'img/clients/oracle-ar21.svg' },
    ]),
    stackGroup('Mobile & Design', [
      { name: 'Flutter', url: 'https://flutter.dev/', logo: 'img/clients/flutterio-ar21.svg' },
      { name: 'React Native CLI', url: 'https://reactnative.dev/', logo: 'img/clients/reactjs-ar21.svg' },
      { name: 'Figma', url: 'https://www.figma.com/', logo: 'img/clients/figma-ar21~bgwhite.svg' },
    ]),
  ];

  /**
   * Projets : un paquet de cartes. La carte de devant s'ouvre dans le
   * modal du template ; on la fait glisser (ou on utilise les flèches)
   * pour passer à la suivante. Une dernière carte invite à me contacter.
   */
  readonly deckFront = signal(0);
  readonly deckTotal = computed(() => this.t().projects.items.length + 1);
  readonly deckMotion = signal<DeckMotion | null>(null);
  /** Décalage horizontal de la carte pendant qu'on la fait glisser. */
  readonly dragX = signal(0);
  readonly dragging = signal(false);

  private drag: { id: number; startX: number; moved: boolean } | null = null;
  private suppressClick = false;
  private motionTimer?: ReturnType<typeof setTimeout>;

  /** Section actuellement au centre de l'écran. */
  readonly activeSection = signal<string | null>(null);

  /** Vrai sous 1040px : tout le bloc défile et la carte de profil est la 1re « page ». */
  private readonly isSmallScreen = signal(false);

  /**
   * Bouton « retour en haut » : visible dès qu'on a dépassé la première
   * « page » affichée au chargement.
   * - Grand écran : la 1re page est la Biographie → visible à partir de Formation.
   * - Mobile : la 1re page est la carte de profil → visible dès la Biographie.
   */
  readonly showBackToTop = computed(() => {
    const active = this.activeSection();
    if (active === null) {
      return false;
    }
    const index = this.sections.indexOf(active);
    return this.isSmallScreen() ? index >= 0 : index > 0;
  });

  private observer?: IntersectionObserver;
  private tallObserver?: ResizeObserver;
  private mediaQuery?: MediaQueryList;
  private readonly onMediaChange = (e: MediaQueryListEvent) => this.isSmallScreen.set(e.matches);

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private readonly document: Document,
    title: Title,
    meta: Meta
  ) {
    // Langue : attribut lang de la page, titre de l'onglet et description.
    effect(() => {
      const t = this.t();
      this.document.documentElement.lang = this.lang();
      title.setTitle(t.meta.title);
      meta.updateTag({ name: 'description', content: t.meta.description });
    });

    // Thème : le template CSS attend la classe « light » sur <body>
    // (sans elle, il affiche le mode sombre).
    effect(() => {
      const isLight = this.theme() === 'light';
      this.document.body.classList.toggle('light', isLight);
      this.document.body.classList.toggle('dark', !isLight);
    });
  }

  setLang(lang: string): void {
    if (lang in TRANSLATIONS) {
      this.lang.set(lang as Lang);
    }
  }

  toggleTheme(): void {
    this.theme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
  }

  /** Rang d'une carte dans le paquet : 0 devant, puis 1, 2… vers l'arrière. */
  deckPos(index: number): number {
    const total = this.deckTotal();
    return (index - this.deckFront() + total) % total;
  }

  isMoving(index: number, kind: DeckMotion['kind']): boolean {
    const motion = this.deckMotion();
    return motion?.index === index && motion.kind === kind;
  }

  motionDir(index: number): number {
    const motion = this.deckMotion();
    return motion?.index === index ? motion.dir : 1;
  }

  /** Décalage de glisser : la carte de devant le suit, la carte lancée part de là. */
  cardDrag(index: number): number {
    const motion = this.deckMotion();
    if (motion) {
      return motion.index === index ? this.dragX() : 0;
    }
    return this.deckPos(index) === 0 ? this.dragX() : 0;
  }

  /** Lance la carte de devant (dir 1 : à droite) et fait avancer le paquet. */
  deckNext(dir: 1 | -1 = 1): void {
    if (this.deckMotion()) {
      return;
    }
    const leaving = this.deckFront();
    this.deckFront.set((leaving + 1) % this.deckTotal());
    this.startMotion({ index: leaving, kind: 'out', dir });
  }

  /** Ramène devant la carte du fond. */
  deckPrev(): void {
    if (this.deckMotion()) {
      return;
    }
    const total = this.deckTotal();
    const coming = (this.deckFront() - 1 + total) % total;
    this.deckFront.set(coming);
    this.startMotion({ index: coming, kind: 'in', dir: -1 });
  }

  onDeckKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      this.deckNext();
    } else if (event.key === 'ArrowLeft') {
      this.deckPrev();
    } else {
      return;
    }
    event.preventDefault();
    // le focus suit la nouvelle carte de devant
    setTimeout(() => this.focusFrontCard());
  }

  /** Entrée / Espace sur la carte de devant : même effet qu'un clic (ouvre le modal). */
  openFrontCard(event: Event): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).click();
  }

  onCardPointerDown(event: PointerEvent): void {
    if (this.deckMotion() || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }
    this.suppressClick = false;
    this.drag = { id: event.pointerId, startX: event.clientX, moved: false };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  onCardPointerMove(event: PointerEvent): void {
    if (!this.drag || event.pointerId !== this.drag.id) {
      return;
    }
    const dx = event.clientX - this.drag.startX;
    if (!this.drag.moved && Math.abs(dx) > 6) {
      this.drag.moved = true;
      this.dragging.set(true);
    }
    if (this.drag.moved) {
      this.dragX.set(dx);
    }
  }

  onCardPointerUp(event: PointerEvent): void {
    if (!this.drag || event.pointerId !== this.drag.id) {
      return;
    }
    const { moved } = this.drag;
    const dx = this.dragX();
    this.drag = null;
    this.dragging.set(false);
    if (!moved) {
      return; // simple clic : le modal s'ouvre
    }
    this.suppressClick = true; // un glisser n'est pas un clic
    if (Math.abs(dx) > DECK_THROW_DISTANCE && event.type === 'pointerup') {
      this.deckNext(dx > 0 ? 1 : -1); // l'animation part de la position lâchée
    } else {
      this.dragX.set(0); // pas assez loin : la carte revient
    }
  }

  /** La bulle « Glisser » suit le pointeur au-dessus du paquet (souris uniquement). */
  moveBubble(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') {
      return;
    }
    const deck = event.currentTarget as HTMLElement;
    const box = deck.getBoundingClientRect();
    deck.style.setProperty('--bubble-x', `${event.clientX - box.left}px`);
    deck.style.setProperty('--bubble-y', `${event.clientY - box.top}px`);
  }

  private startMotion(motion: DeckMotion): void {
    this.deckMotion.set(motion);
    clearTimeout(this.motionTimer);
    this.motionTimer = setTimeout(() => {
      this.deckMotion.set(null);
      this.dragX.set(0);
    }, DECK_MOTION_MS);
  }

  private focusFrontCard(): void {
    this.host.nativeElement.querySelector<HTMLElement>('.deck_card.is-front .deck_focus')?.focus();
  }

  /** Après un glisser, le navigateur envoie quand même un clic : on l'arrête avant jQuery. */
  private readonly onDeckClickCapture = (event: MouseEvent) => {
    if (this.suppressClick) {
      this.suppressClick = false;
      event.stopPropagation();
      event.preventDefault();
    }
  };

  ngAfterViewInit(): void {
    this.host.nativeElement
      .querySelector('.project_deck')
      ?.addEventListener('click', this.onDeckClickCapture as EventListener, true);

    // The template's jQuery script runs on document ready, before Angular
    // has rendered this component's content, so it never finds any of its
    // elements. Re-run it once the view is actually in the DOM.
    setTimeout(() => {
      if (typeof FrenifyDeebo !== 'undefined') {
        FrenifyDeebo.init();
      }
    });

    this.mediaQuery = window.matchMedia('(max-width: 1040px)');
    this.isSmallScreen.set(this.mediaQuery.matches);
    this.mediaQuery.addEventListener('change', this.onMediaChange);

    this.setupScrollEffects();
    this.setupTallSections();
  }

  ngOnDestroy(): void {
    clearTimeout(this.motionTimer);
    this.host.nativeElement
      .querySelector('.project_deck')
      ?.removeEventListener('click', this.onDeckClickCapture as EventListener, true);
    this.observer?.disconnect();
    this.tallObserver?.disconnect();
    this.mediaQuery?.removeEventListener('change', this.onMediaChange);
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Remonte tout en haut de la zone qui défile :
   * la colonne de droite sur grand écran, le bloc entier sur mobile
   * (on revient alors sur la carte de profil).
   */
  scrollToTop(): void {
    const isSmallScreen = window.matchMedia('(max-width: 1040px)').matches;
    const scroller = this.host.nativeElement.querySelector<HTMLElement>(
      isSmallScreen ? '.deebo_fn__cv' : '.deebo_fn__cv .cv__content'
    );
    scroller?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Repère la section qui traverse le centre de l'écran :
   * - elle devient « active » (pleine taille, nette) ;
   * - à sa première apparition, son contenu se dévoile en cascade.
   * Fonctionne pour la colonne de droite (grand écran) comme pour le bloc
   * entier (mobile) : la zone d'observation est le viewport, après découpe
   * par les conteneurs qui défilent.
   */
  private setupScrollEffects(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return; // sans support : tout reste affiché normalement
    }

    const sections = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('.cv__content section')
    );
    if (!sections.length) {
      return;
    }

    // Les styles d'animation ne s'appliquent qu'une fois le JS prêt.
    document.body.classList.add('scroll-fx');

    // Sections qui traversent actuellement la bande centrale.
    const inBand = new Set<string>();

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const section = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            section.classList.add('is-active', 'is-revealed');
            inBand.add(section.id);
            this.activeSection.set(section.id);
          } else {
            section.classList.remove('is-active');
            inBand.delete(section.id);
          }
        }
        // Aucune section au centre (mobile, retour sur la carte de profil).
        if (inBand.size === 0) {
          this.activeSection.set(null);
        }
      },
      // bande horizontale fine au milieu de l'écran : une seule section à la fois
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach((section) => this.observer!.observe(section));
  }

  /**
   * Marque « is-tall » les blocs plus hauts que la zone visible :
   * le CSS leur ajoute alors un point d'arrêt à leur bas (voir styles.css).
   * Recalculé à chaque changement de taille (fenêtre, contenu, thème, langue).
   */
  private setupTallSections(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const root = this.host.nativeElement as HTMLElement;
    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>('.cv__header, .cv__content section')
    );
    const scrollers = Array.from(
      root.querySelectorAll<HTMLElement>('.deebo_fn__cv, .deebo_fn__cv .cv__content')
    );
    if (!blocks.length || !scrollers.length) {
      return;
    }

    const update = () => {
      const isSmallScreen = window.matchMedia('(max-width: 1040px)').matches;
      const scroller = root.querySelector<HTMLElement>(
        isSmallScreen ? '.deebo_fn__cv' : '.deebo_fn__cv .cv__content'
      );
      if (!scroller) {
        return;
      }
      const style = getComputedStyle(scroller);
      const snapport =
        scroller.clientHeight -
        (parseFloat(style.scrollPaddingTop) || 0) -
        (parseFloat(style.scrollPaddingBottom) || 0);

      for (const block of blocks) {
        // sur grand écran, la carte de profil ne défile pas
        const inScroller = isSmallScreen || block.tagName === 'SECTION';
        block.classList.toggle('is-tall', inScroller && block.offsetHeight > snapport + 2);
      }
    };

    this.tallObserver = new ResizeObserver(update);
    [...blocks, ...scrollers].forEach((el) => this.tallObserver!.observe(el));
  }
}
