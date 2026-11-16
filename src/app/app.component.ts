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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
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

  ngAfterViewInit(): void {
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
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
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
}
