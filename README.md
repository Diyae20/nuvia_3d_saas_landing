# Nuvia — Beyond artificial

## Technologies
- **Front-End :** HTML5, CSS3, JavaScript (ES modules), Tailwind CSS Play CDN, Google Fonts (Space Grotesk, DM Sans).
- **3D & WebGL :** Three.js (0.170.0), React Three Fiber (8.17.10), Drei (9.117.3) via esm.sh et import maps.
- **Animations :** GSAP & ScrollTrigger (3.12.5) via jsDelivr.
- **Stockage & Outils :** LocalStorage, Git / GitHub.

## Features
- **Hero & Scène 3D WebGL :** Sphère 3D organique et iridescente interactive (MeshPhysicalMaterial, transmission, reflets de studio et shaders de bruit personnalisés).
- **Animations & Scroll :** Effets fluides avec GSAP et ScrollTrigger (zoom de la sphère, transition du verre vers un métal chromé, et ancrage sticky).
- **Interactivité :** Raycasting sur la géométrie réelle, suivi des mouvements de la souris, menu mobile, et contrôles d'accessibilité (`prefers-reduced-motion`).
- **Secours WebGL :** Affichage d’un visuel CSS de secours et d’un statut explicite si le rendu 3D n'est pas disponible.
- **Formulaire d’intérêt local :** Saisie et validation d'email avec stockage local sécurisé (`localStorage`).

## The Process
1. **Conception & UI/UX :** Élaboration d'une direction artistique moderne (fond sombre, accents vert amande et reflets cyan/magenta/violet) centrée sur l'immersion visuelle.
2. **Développement 3D & Shaders :** Intégration de Three.js et R3F, écriture de shaders de vertex et de fragment pour dynamiser la déformation et les reflets de la sphère au survol.
3. **Mise en page & Animations :** Structuration des sections SaaS (Hero, Intelligence, Possibilities, Contact) et synchronisation des transitions fluides à l'aide de GSAP ScrollTrigger.
4. **Optimisation & Tests :** Plafonnement du DPR, vérification du comportement sticky/scroll, tests de robustesse avec les dépendances CDN et mise en place d'un système de secours visuel.

## Running the project
1. Extraire l'ensemble du dossier du projet en conservant la structure (`index.html`, `css/`, `js/`).
2. S'assurer d'une connexion Internet active (nécessaire pour charger les bibliothèques CDN et les polices).
3. Ouvrir le fichier `index.html` directement dans un navigateur web récent (Chrome, Edge, Firefox, Safari) ou utiliser un serveur local (comme Live Server de VS Code) pour éviter les restrictions de sécurité locales.
4. Attendre que le statut passe de chargement à interactif pour profiter de l'expérience 3D.
