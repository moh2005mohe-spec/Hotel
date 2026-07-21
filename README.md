# Diyafa — Plateforme de réservation d'hébergements et restaurants

Plateforme web complète de réservation d'établissements hôteliers et
restaurants en Algérie. Trois rôles: Client, Partenaire, Administrateur.

## Fonctionnalités

### Public
- Recherche d'établissements par ville, type, prix, note
- Fiche établissement avec galerie photos, équipements, avis
- Bilingue Français / Arabe (RTL)

### Client
- Inscription / connexion
- Réservation d'hébergements
- Gestion des favoris
- Avis et notation
- Profil modifiable

### Partenaire
- Ajout et gestion d'établissements (chambres, équipements, photos)
- Tableau de bord avec statistiques et graphiques
- Gestion des réservations (confirmer / refuser)
- Réponse aux avis clients

### Admin
- Validation des établissements (approuver / rejeter / suspendre)
- Gestion des utilisateurs et rôles
- Vue d'ensemble des réservations
- Statistiques globales

## Stack technique

- React 19 + TypeScript + Vite
- Tailwind CSS
- Supabase (base de données, authentification, RLS)
- React Router, i18next, Recharts, Lucide icons

## Installation

```bash
npm install
```

Configurez les variables d'environnement:

```bash
cp .env.example .env
# Remplissez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
```

## Développement

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Déploiement sur Vercel

1. Importez le dépôt sur [vercel.com](https://vercel.com)
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Variables d'environnement: ajoutez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
6. Déployez

Le fichier `vercel.json` est déjà configuré pour le routing SPA.

## Base de données

Le schéma comprend 7 tables:
- `profiles` — profils utilisateurs (rôles)
- `establishments` — établissements
- `rooms` — chambres / tables
- `reservations` — réservations
- `reviews` — avis clients
- `favorites` — favoris
- `notifications` — notifications

RLS activée sur toutes les tables avec politiques par rôle.
