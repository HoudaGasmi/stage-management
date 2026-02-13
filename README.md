# 🎓 StageManager — Plateforme de gestion des stages universitaires

Application **full-stack** Angular 21 + Node.js 20 + MongoDB pour la gestion complète des stages universitaires.

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js ≥ 20
- MongoDB (local ou Atlas)
- npm

### Installation

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos paramètres (MONGODB_URI, JWT_SECRET...)
npm run dev
```

**2. Frontend**
```bash
cd frontend
npm install
ng serve
```

**3. Accès**
- 🌐 Application : http://localhost:4200
- 📚 API Docs : http://localhost:3000/api-docs

---

## 🏗️ Architecture

```
stage-manager/
├── backend/
│   └── src/
│       ├── config/          # DB, Swagger
│       ├── controllers/     # Logique métier
│       ├── middleware/      # Auth, Upload
│       ├── models/          # Schémas Mongoose
│       ├── routes/          # Routes Express
│       └── services/        # Recommendation service (IA)
│
└── frontend/
    └── src/app/
        ├── core/
        │   ├── guards/      # Auth, Role guards
        │   ├── interceptors/ # JWT, Error
        │   └── services/    # API services, Auth, Notification
        ├── features/
        │   ├── auth/        # Login, Register
        │   ├── dashboard/   # Dashboard adaptatif par rôle
        │   ├── student/     # Profil, compétences, CV
        │   ├── offers/      # Liste, détail, formulaire
        │   ├── applications/ # Candidatures
        │   ├── tracking/    # Suivi stages, rapports
        │   ├── recommandations/ # IA recommandations
        │   └── admin/       # Gestion utilisateurs
        └── shared/
            ├── components/  # Layout
            └── models/      # TypeScript interfaces
```

---

## 👤 Rôles et fonctionnalités

| Fonctionnalité | Étudiant | Encadrant | Admin |
|---|:---:|:---:|:---:|
| Gérer profil & CV | ✅ | - | - |
| Consulter offres | ✅ | ✅ | ✅ |
| Postuler | ✅ | - | - |
| Recommandations IA | ✅ | - | - |
| Suivre candidatures | ✅ | ✅ | ✅ |
| Valider stages | - | ✅ | ✅ |
| Créer/Publier offres | - | - | ✅ |
| Gérer utilisateurs | - | - | ✅ |
| Statistiques | - | ✅ | ✅ |

---

## 🤖 Système de recommandation

Le moteur de recommandation utilise :
- **Score de compatibilité (0-100%)** basé sur les compétences
- **Pondération** : compétences requises (70%) + optionnelles (20%) + niveau d'études (10%)
- **Fuzzy matching** avec coefficient de Dice pour la comparaison de chaînes
- **Analyse de profil** : suggestions de compétences à acquérir, taux de complétude
- **Conseils CV** : recommandations personnalisées pour améliorer le profil

---

## 🔐 Sécurité

- JWT + Refresh Token (rotation automatique)
- Hachage bcrypt des mots de passe
- Helmet.js (headers sécurisés)
- Rate limiting (100 req/15min)
- CORS configuré
- Validation des entrées
- Guards Angular côté client

---

## 📡 API Endpoints

```
POST   /api/auth/register          Inscription
POST   /api/auth/login             Connexion
POST   /api/auth/refresh           Rafraîchir token
GET    /api/auth/me                Profil connecté

GET    /api/offers                 Liste offres
POST   /api/offers                 Créer offre (admin)
GET    /api/offers/:id             Détail offre
PATCH  /api/offers/:id/status      Changer statut

GET    /api/students/me            Mon profil
PATCH  /api/students/me            Mettre à jour profil
POST   /api/students/me/skills     Ajouter compétence
POST   /api/students/me/cv         Upload CV

POST   /api/applications           Postuler
GET    /api/applications           Mes candidatures
PATCH  /api/applications/:id/status  Changer statut

GET    /api/internships            Mes stages
POST   /api/internships/:id/reports  Soumettre rapport

GET    /api/recommendations        Offres recommandées
GET    /api/recommendations/profile-analysis  Analyse profil

GET    /api/stats/dashboard        Statistiques (admin/supervisor)
```

---

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Angular 21, Angular Material, Signals |
| Backend | Node.js 20, Express 4 |
| Base de données | MongoDB + Mongoose 8 |
| Auth | JWT + Refresh Token |
| Upload | Multer |
| IA | Algorithme maison (Dice coefficient) |
