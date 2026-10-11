# Nuvia — Beyond artificial

## Projet et objectif
Landing page conceptuelle SaaS/IA, entièrement statique, centrée sur une sphère 3D organique et iridescente. Direction artistique : fond presque noir, typographie Space Grotesk / DM Sans, accents vert amande, verre aux reflets cyan, magenta et violet. Contenus de démonstration en anglais. Nuvia et les éléments de marque sont une proposition créative, pas un service IA opérationnel.

## Fonctionnalités réalisées
- Hero responsive : titre, description, CTA lumineux, aperçu explicatif dans une boîte de dialogue native.
- Scène WebGL réelle avec Three.js, React Three Fiber et les composants Environment / Lightformer de drei.
- Géométrie sphérique déformée, rotation lente et flottement au repos.
- MeshPhysicalMaterial : transmission, épaisseur, indice de réfraction, roughness, iridescence et clearcoat.
- Shader vertex personnalisé : ondulations et bruit 3D avec déformation locale au point survolé. Normales recalculées pour que les reflets suivent la déformation. Shader fragment : teinte cyan/magenta dépendant du pointeur et de l’angle de vue.
- Survol détecté par raycasting sur la véritable géométrie, même quand la sphère change de position au défilement. Capture des mouvements à l’échelle de la page pour ne pas dépendre du canvas placé derrière le contenu.
- Reflets de studio orientés par `scene.environmentRotation` (la source utilisée par drei), sans recalculer toute la cubemap à chaque frame. Relâchement progressif de la déformation hors de la sphère.
- GSAP + ScrollTrigger : fondu et déplacement du texte, agrandissement et rapprochement de la sphère vers le centre, rotation et transformation continue du verre vers un métal chromé.
- Arrêt du suivi de l’écran à la section « Always evolving. » : la sphère reste ancrée à cette section et quitte l’écran avec elle. À la remontée, le suivi reprend et la transition centre → droite / chrome → verre s’inverse comme auparavant. Correction CSS ciblée : la marge de superposition négative appartient désormais à la hero, et non au conteneur sticky, pour respecter sa limite basse réelle.
- Deuxième section immersive, bandeau de marques illustratives, cartes Think/Create/Evolve, vision et section contact.
- Menu mobile, ancres, contrôles clavier, fermeture par Échap des interfaces superposées et prise en compte de `prefers-reduced-motion`.
- Visuel CSS de secours si WebGL ou les imports 3D ne sont pas disponibles ; navigation indépendante du chargement 3D. Un statut visible distingue chargement, rendu interactif et indisponibilité (Internet/WebGL). Le secours n’est masqué qu’après le premier rendu de la sphère.
- Formulaire d’intérêt avec validation email et stockage **local uniquement**. L’interface explique qu’aucun email n’est envoyé et aucune inscription distante n’est créée.

## Stack et exécution
- HTML5, CSS3, JavaScript ES modules, sans serveur applicatif ni build obligatoire.
- React 18.3.1, Three.js 0.170.0, React Three Fiber 8.17.10, drei 9.117.3 via esm.sh et import map.
- GSAP / ScrollTrigger 3.12.5 via jsDelivr.
- Tailwind CSS Play CDN pour les utilitaires de mise en page ; CSS personnalisé pour la direction artistique et les media queries.
- Google Fonts : Space Grotesk et DM Sans.
- DPR plafonné à 1,5 sur desktop et 1,25 sur mobile ; environnement de studio capturé une fois en résolution 128.

### Ouverture du dossier téléchargé
1. Extraire **tout** le dossier du site, en conservant `index.html`, `css/` et `js/` ensemble.
2. Rester connecté à Internet, puis ouvrir `index.html` dans un navigateur récent (Chrome, Edge, Firefox ou Safari avec import maps et WebGL).
3. Attendre la fin du chargement des bibliothèques : le statut passe de « Loading interactive 3D… » à « Move your cursor… ».
4. Si seule la forme CSS reste visible, consulter le statut, vérifier la connexion, le blocage des CDN et l’accélération graphique du navigateur, puis recharger.

**Correction du lancement local :** `js/scene.js` est désormais un script classique chargé avec `defer`, et non un module local bloqué par les restrictions `file://`. Il importe uniquement les dépendances **HTTPS** CORS-enabled via `import()` et l’import map. Aucun `fetch()` de fichier local ou import ES d’un fichier local n’est nécessaire pour le site.

Ce n’est **pas une version entièrement hors ligne** : Internet reste indispensable pour React, Three.js, R3F/drei, GSAP, Tailwind et les polices. L’ouverture HTTP(S) reste aussi possible. Aucun token, clé API ni HDRI externe n’est utilisé. Si la politique de sécurité du navigateur ou de l’entreprise interdit les imports distants depuis un fichier local, utiliser l’aperçu d’un serveur statique local (par exemple Live Server de VS Code), sans désactiver la sécurité du navigateur.

## Arborescence
```text
index.html           Contenu et import map
css/style.css        Direction artistique, composants, responsive
js/interface.js     Navigation, dialogue, formulaire et GSAP
js/scene.js          Entrée classique, imports CDN, scène R3F, shaders et matériaux
tests/smoke.html     Banc de vérification du vrai site dans une iframe
tests/smoke.js       Assertions fonctionnelles du navigateur
tests/interaction.html + .js   Tests du survol, bruit, reflets et scroll
tests/local-origin.html + .js  Test des imports CDN en origine opaque/null
tests/opaque-probe.js          Sonde de rendu WebGL du test d’origine opaque
tests/scroll-stop.html + .js   Régression de l’arrêt du sticky et de la remontée
```

## Entrées fonctionnelles et paramètres
- `/` ou `/index.html` : page principale.
- `/#hero-section` : accueil.
- `/#intelligence` : transition vers le chrome.
- `/#possibilities` : cartes de fonctionnalités conceptuelles.
- `/#about` : vision.
- `/#contact` : formulaire d’intérêt local.
- `/tests/smoke.html` : contrôles automatisés de l’interface ; ne reçoit pas de paramètres et ne conserve pas les données de test.
- `/tests/interaction.html` : événements `pointermove` sur le vrai site, entrée/sortie de la sphère, uniformes du bruit/RGB, rotation de l’environnement, transition chrome et survol après défilement.
- `/tests/local-origin.html` : chargement des mêmes sources dans une iframe à origine opaque (`null`), avec imports CDN et vrai rendu WebGL. À ouvrir via HTTP(S), car le banc de test (contrairement au site lui-même) lit les fichiers avec `fetch()`.
- `/tests/scroll-stop.html` : parcourt la vraie page dans une iframe à la taille du viewport, contrôle l’ancrage de la sphère à la deuxième section, sa sortie de l’écran, puis le trajet inverse vers la hero. Laisse la page 120 px après le point d’arrêt pour le contrôle visuel.
- Aucun paramètre de requête nécessaire.

## Données et stockage
Aucune table, API, base de données distante ou infrastructure d’authentification.

Clé navigateur `localStorage["nuvia-interest"]` :
```json
{
  "email": "adresse saisie par le visiteur",
  "savedAt": "date ISO 8601"
}
```
Une nouvelle soumission remplace la précédente sur le même navigateur. Les données ne quittent pas l’appareil. Le formulaire signale les erreurs si le stockage local est bloqué. Pour effacer l’information, supprimer cette clé ou les données du site dans le navigateur.

L’état transitoire `window.nuviaScene.progress` (0 à 1) relie ScrollTrigger à la scène ; il n’est pas enregistré. `window.nuvia3D` expose uniquement des diagnostics éphémères du rendu (prêt, survol, coordonnées projetées, uniformes, rotation de l’environnement) pour les tests ; aucune donnée n’est transmise. Le formulaire est une démonstration, pas une liste d’attente réelle.

## Vérifications
- Rendu réel contrôlé dans le navigateur en desktop 1280 × 800 et mobile 390 × 844.
- Contrôle visuel du deuxième écran après défilement et du matériau chromé.
- Arrêt du sticky : bug reproduit avant correction (le canvas restait à `top: 0` tandis que le texte remontait), puis tests validés après correction : après 190 px de scroll supplémentaires, canvas et section remontent tous deux de 190 px. Vérification de la sortie avec la section, de la reprise à la remontée et du retour à la position initiale. Captures du test en desktop 1280 × 800 et mobile 390 × 844.
- Tests navigateur : absence de débordement horizontal, lisibilité du titre, ouverture/fermeture du dialogue, ouverture/fermeture du menu, validation du formulaire, stockage local avec restauration de la valeur préexistante, progression GSAP, disparition du texte et initialisation de WebGL.
- Tests de régression spécifiques : shader compilé, augmentation du bruit au survol, changement des coordonnées RGB, rotation réelle de l’environnement dans les deux axes, retour au repos hors de l’objet, interaction conservée après déplacement au scroll.
- Chargement des dépendances et rendu WebGL confirmés dans une origine opaque `null`. Ce test isole les restrictions d’origine des modules mais **ne remplace pas une ouverture physique du dossier téléchargé sur le PC de l’utilisateur** ; cette dernière n’est pas exécutable avec les outils de vérification disponibles ici.
- Le rendu logiciel du navigateur de test peut produire des avertissements GPU et ralentir les transitions. Tailwind Play CDN émet également son avertissement d’utilisation en production. Ce ne sont pas des erreurs JavaScript.

## Non implémenté / limites
- Pas de moteur IA, compte utilisateur, paiement ou traitement serveur.
- Pas d’inscription distante, newsletter, envoi d’emails ou analytics.
- Pas de film pré-rendu : « See it in motion » explique et ouvre l’expérience interactive réelle.
- Pas d’image générée ni de fichier Spline/Midjourney ; la sphère est calculée dans le navigateur.
- La qualité et la fluidité 3D dépendent du GPU et du navigateur. Le visuel CSS de secours n’a pas la physique du verre.
- Le toucher mobile conserve le défilement natif, sans interaction de survol. Une souris fonctionne aussi sur un viewport étroit ; la largeur de l’écran ne désactive plus le survol.
- En mode système « réduire les animations », la rotation automatique s’arrête et les réactions au pointeur sont fortement atténuées.
- Pas de paquet hors ligne intégrant toutes les dépendances ; une connexion Internet reste nécessaire même en ouverture locale.

## URL publiques et API
- URL de production : non déployée dans cette intervention, aucune URL fournie.
- API applicative : aucune.
- Publication possible depuis l’onglet **Publish** ; un Hosted Deploy nécessite une demande et une approbation explicites.

## Prochaines étapes recommandées
1. Personnaliser la marque, les textes, les marques illustratives et la destination commerciale du CTA.
2. Pour une collecte réelle, remplacer le stockage local par une table via l’API Table, avec mentions de confidentialité et règles d’accès adaptées.
3. Pour une mise en production durable, compiler Tailwind et regrouper/localiser les dépendances JS plutôt que dépendre du Play CDN et d’imports à la volée.
4. Tester les performances sur appareils physiques, notamment Safari iOS et Android d’entrée de gamme ; envisager une qualité adaptative et la suspension de la scène hors écran.
5. Ajouter les mentions légales et publier lorsque le contenu final est validé.
