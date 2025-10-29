SHARED KINGDOM — STARTER (ultra simple)
======================================

Ce starter contient 2 dossiers :
- apps/client  → le jeu dans le navigateur (Babylon.js)
- apps/server  → le serveur multijoueur (Colyseus)

PRÉ-REQUIS
----------
1) Installe Node.js (version LTS). Sur Windows : télécharge "Node.js LTS", installe en cliquant Suivant → Suivant.
2) Dézippe ce dossier où tu veux (ex: Documents/shared-kingdom-starter).

LANCER LE SERVEUR (fenêtre 1)
-----------------------------
1) Ouvre "Terminal" (ou "Invite de commandes").
2) Tape (copie/colle) :
   cd C:\chemin\vers\shared-kingdom-starter\apps\server
   npm install
   npm run dev

   Le serveur écoute sur le port 2567 (OK si tu vois "Server listening on 2567").

LANCER LE CLIENT (fenêtre 2)
----------------------------
1) Ouvre une DEUXIÈME fenêtre de Terminal.
2) Tape :
   cd C:\chemin\vers\shared-kingdom-starter\apps\client
   npm install
   npm run dev

3) Le client affiche une URL (ex: http://localhost:5173). Ouvre-la dans ton navigateur.

CE QUE TU VERRAS
----------------
- Une scène 3D simple (cube + sol) et une caméra que tu peux bouger.
- Le client tente de se connecter au serveur (ws://localhost:2567) et affiche un message dans la console si OK.

CONSEILS
--------
- Laisse les deux fenêtres (client et serveur) ouvertes pendant que tu testes.
- Pour arrêter : Ctrl+C dans chaque fenêtre.
- Si tu ne sais pas où est ton dossier, fais glisser le dossier dans la fenêtre du Terminal pour coller son chemin.

Étapes suivantes (quand prêt) :
- apps/server/src/rooms/GameRoom.ts → ajoute des règles (ex: positions des joueurs).
- apps/client/src/main.ts → ajoute le joueur, la collecte, etc.

Bon dev !