/**
 * Textes du portfolio en français (langue par défaut) et en anglais.
 * Le type `Translations` est déduit du français : si une clé manque
 * dans l'anglais, la compilation échoue.
 */

export type Lang = 'fr' | 'en';

export const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: 'fr', label: 'Fr', name: 'Français' },
  { code: 'en', label: 'En', name: 'English' },
];

export interface Project {
  year: string;
  /** Plateformes livrées, affichées sous le titre sur la carte. */
  kind: string;
  title: string;
  image: string;
  repos: { label: string; url: string }[];
  description: string;
}

const fr = {
  /** Séparateur « libellé : valeur » (espace avant les deux-points en français). */
  colon: ' : ',
  meta: {
    title: 'Nabil Adamou | Ingénieur logiciel Full-Stack & Mobile',
    description:
      'Portfolio de Nabil Adamou (Wizarddev), ingénieur logiciel Full-Stack et Mobile basé à Lomé : Angular, Spring Boot, Django, Flutter. Disponible pour des missions freelance.',
  },
  controls: {
    language: 'Langue',
    darkMode: 'Mode sombre',
    backToTop: 'Revenir en haut',
    sectionsNav: 'Navigation entre les sections',
    prev: 'Précédent',
    next: 'Suivant',
  },
  nav: {
    cv_biography: 'Biographie',
    cv_education: 'Formation',
    clients: 'Ma stack',
    tips: 'Projets',
    contact: 'Contact',
  } as Record<string, string>,
  header: {
    tagline: 'Ingénieur logiciel · Full-Stack & Mobile',
    available: 'Disponible pour des missions freelance.',
    contactMe: 'Me contacter',
    cv: 'CV',
    cvTitle: 'Télécharger le CV de Nabil Adamou (PDF, 275 Ko)',
  },
  bio: {
    title: 'Biographie',
    text:
      "Titulaire d'une licence en génie logiciel obtenue à l'iPNet Institute of Technology, je suis passionné par le développement de solutions logicielles innovantes. Compétent en programmation, en conception de systèmes et en gestion de bases de données, j'aime relever des défis techniques dans des environnements exigeants. Je suis également disponible pour des projets freelance.",
    name: 'Nom',
    languages: 'Langues',
    languagesValue: 'Français, Anglais',
    nationality: 'Nationalité',
    nationalityValue: 'Togolaise',
    address: 'Adresse',
    phone: 'Téléphone',
    email: 'Email',
  },
  education: {
    title: 'Formation',
    degree: 'Licence en Génie Logiciel',
    degreeText:
      'Développement logiciel, systèmes distribués, gestion de projet, programmation système et réalisation de plusieurs projets pratiques intégrant des technologies modernes.',
    bac: 'Baccalauréat',
    bacText: 'Obtention du Baccalauréat en 2022 avec la mention Bien.',
  },
  stack: {
    title: 'Ma stack',
  },
  projects: {
    title: 'Derniers projets',
    readMore: 'Lire la suite',
    repos: 'Dépôts GitHub',
    github: 'Mon GitHub',
    deck: 'Mes projets, une carte à la fois',
    open: 'Voir le détail du projet',
    drag: 'Glisser',
    position: (n: number, total: number) => `Carte ${n} sur ${total}`,
    cta: {
      title: 'Le vôtre ?',
      text: 'Un projet en tête ? Parlons-en.',
      link: 'Me contacter',
    },
    items: [
      {
        year: '2025',
        kind: 'Web & mobile',
        title: "Application de signalement des problèmes d'infrastructures urbaines",
        image: 'img/portfolio/citizen-web.jpg',
        repos: [
          { label: 'backend', url: 'https://github.com/Nabil-wizard-dev/SignalementApp_api' },
          { label: 'web', url: 'https://github.com/Nabil-wizard-dev/SignalementApp_web-admin' },
          { label: 'mobile', url: 'https://github.com/Nabil-wizard-dev/SignalementApp_mobile' },
        ],
        description:
          "Plateforme de création et de traitement de signalements. Elle permet aux citoyens d'une localité de signaler des dégradations du domaine public ou d'autres anomalies. Les autorités (la mairie ou un autre service de la collectivité) prennent ensuite en charge ces signalements via la plateforme : enregistrement du signalement, affectation d'un agent et suivi de son intervention, l'agent mettant à jour le statut de ses tâches au fur et à mesure de l'avancement des travaux.",
      },
      {
        year: '2024',
        kind: 'Web',
        title: 'Plateforme de promotion de biens immobiliers',
        image: 'img/blog/2.jpg',
        repos: [
          { label: 'cliquez ici', url: 'https://github.com/Nabil-wizard-dev/Plateforme-Immobiliere' },
        ],
        description:
          "Application web développée avec Django qui facilite la recherche et la promotion de biens immobiliers. Elle s'adresse aux propriétaires souhaitant mettre en valeur leurs biens et aux utilisateurs à la recherche de leur prochain logement ou investissement immobilier.",
      },
      {
        year: '2025',
        kind: 'Web',
        title: 'Plateforme universitaire de suggestions, plaintes et réclamations',
        image: 'img/blog/6.jpg',
        repos: [
          { label: 'backend', url: 'https://github.com/Nabil-wizard-dev/MiabeGne_backend' },
          { label: 'web', url: 'https://github.com/Nabil-wizard-dev/Miabe_Gbe_web' },
        ],
        description:
          "Cette plateforme offre aux étudiants, au personnel et aux enseignants un moyen simple et transparent de s'exprimer. Les utilisateurs peuvent proposer des suggestions pour améliorer la vie du campus, signaler les problèmes rencontrés ou déposer des réclamations nécessitant un suivi officiel. Chaque demande est suivie, catégorisée et traitée dans les meilleurs délais, ce qui aide l'université à être plus réactive et à l'écoute.",
      },
    ] as Project[],
  },
  contact: {
    title: 'Me contacter',
    success: 'Votre message a bien été reçu, je vous recontacterai très bientôt.',
    error: 'Une erreur est survenue, veuillez réessayer plus tard.',
    empty: 'Veuillez remplir les champs obligatoires !',
    name: 'Nom *',
    email: 'Email *',
    phone: 'Téléphone',
    message: 'Message',
    send: 'Envoyer le message',
  },
};

export type Translations = typeof fr;

const en: Translations = {
  colon: ': ',
  meta: {
    title: 'Nabil Adamou | Full-Stack & Mobile Software Engineer',
    description:
      'Portfolio of Nabil Adamou (Wizarddev), Full-Stack and Mobile software engineer based in Lomé: Angular, Spring Boot, Django, Flutter. Available for freelance work.',
  },
  controls: {
    language: 'Language',
    darkMode: 'Dark mode',
    backToTop: 'Back to top',
    sectionsNav: 'Section navigation',
    prev: 'Previous',
    next: 'Next',
  },
  nav: {
    cv_biography: 'Biography',
    cv_education: 'Education',
    clients: 'My stack',
    tips: 'Projects',
    contact: 'Contact',
  },
  header: {
    tagline: 'Software Engineer · Full-Stack & Mobile',
    available: 'Available for freelance work.',
    contactMe: 'Get in touch',
    cv: 'CV',
    cvTitle: "Download Nabil Adamou's CV (PDF in French, 275 KB)",
  },
  bio: {
    title: 'Biography',
    text:
      "I hold a bachelor's degree in software engineering from iPNet Institute of Technology and I'm passionate about building innovative software solutions. Skilled in programming, system design and database management, I enjoy taking on technical challenges in demanding environments. I'm also available for freelance projects.",
    name: 'Name',
    languages: 'Languages',
    languagesValue: 'French, English',
    nationality: 'Nationality',
    nationalityValue: 'Togolese',
    address: 'Location',
    phone: 'Phone',
    email: 'Email',
  },
  education: {
    title: 'Education',
    degree: "Bachelor's in Software Engineering",
    degreeText:
      'Software development, distributed systems, project management, systems programming and several hands-on projects built with modern technologies.',
    bac: 'Baccalaureate',
    bacText: 'Baccalaureate (high school diploma) obtained in 2022 with honours.',
  },
  stack: {
    title: 'My stack',
  },
  projects: {
    title: 'Latest projects',
    readMore: 'Read more',
    repos: 'GitHub repositories',
    github: 'My GitHub',
    deck: 'My projects, one card at a time',
    open: 'View project details',
    drag: 'Drag',
    position: (n: number, total: number) => `Card ${n} of ${total}`,
    cta: {
      title: 'Yours next?',
      text: 'Got a project in mind? Let’s talk.',
      link: 'Get in touch',
    },
    items: [
      {
        ...fr.projects.items[0],
        title: 'Urban infrastructure issue reporting app',
        description:
          'A platform for filing and handling reports. It lets residents of a locality report damage to public property or other issues. The authorities (the town hall or another local service) then take charge of these reports through the platform: logging the report, assigning an agent and tracking their intervention, with the agent updating the status of their tasks as the work progresses.',
      },
      {
        ...fr.projects.items[1],
        title: 'Real estate listing platform',
        repos: [{ label: 'click here', url: fr.projects.items[1].repos[0].url }],
        description:
          'A web application built with Django that makes it easier to find and promote real estate. It serves owners who want to showcase their properties and people looking for their next home or property investment.',
      },
      {
        ...fr.projects.items[2],
        title: 'University suggestions, complaints and claims platform',
        description:
          'This platform gives students, staff and teachers a simple, transparent way to speak up. Users can submit suggestions to improve campus life, report problems they run into, or file claims that need official follow-up. Every request is tracked, categorised and handled promptly, helping the university become more responsive and attentive.',
      },
    ],
  },
  contact: {
    title: 'Contact me',
    success: "Your message has been received, I'll get back to you very soon.",
    error: 'Something went wrong, please try again later.',
    empty: 'Please fill in the required fields!',
    name: 'Name *',
    email: 'Email *',
    phone: 'Phone',
    message: 'Message',
    send: 'Send message',
  },
};

export const TRANSLATIONS: Record<Lang, Translations> = { fr, en };
