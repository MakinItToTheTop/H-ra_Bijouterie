# Héra Bijouterie

Site e-commerce de joaillerie, bijouterie et horlogerie pour Héra Bijouterie à Nantes.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Stripe

## Installation

```bash
npm install
npm run dev
```

## Variables d’environnement

Créez un fichier `.env.local` avec :

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Déploiement

Le projet est prêt pour Vercel. Ajoutez les variables d’environnement dans le dashboard Vercel puis lancez le build de production.

## Données de démonstration

Les produits de démonstration sont dans `src/data/products.ts`.

## Fonctionnalités principales

- Catalogue boutique
- Panier persistant avec localStorage
- Fiche produit
- Checkout et confirmation de commande
- Pages légales
- Design responsive luxe
