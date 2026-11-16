import { AfterViewInit, Component, ElementRef, OnDestroy, computed, signal } from '@angular/core';

declare const FrenifyDeebo: { init: () => void } | undefined;

interface NavSection {
  id: string;
  label: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  /** Sections du contenu, dans l'ordre d'affichage (navigation par points). */
  readonly sections: NavSection[] = [
    { id: 'cv_biography', label: 'Biographie' },
    { id: 'cv_education', label: 'Formation' },
    { id: 'clients', label: 'Ma stack' },
    { id: 'tips', label: 'Projets' },
    { id: 'contact', label: 'Contact' },
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
    const index = this.sections.findIndex((s) => s.id === active);
    return this.isSmallScreen() ? index >= 0 : index > 0;
  });

  private observer?: IntersectionObserver;
  private mediaQuery?: MediaQueryList;
  private readonly onMediaChange = (e: MediaQueryListEvent) => this.isSmallScreen.set(e.matches);

  constructor(private readonly host: ElementRef<HTMLElement>) {}

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
