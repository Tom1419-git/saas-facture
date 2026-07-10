# FactureArtisan 🚀

> Générateur de factures professionnel, rapide et conforme pour artisans et indépendants.

![FactureArtisan](https://facture.mayoraz-net.ch/favicon.svg) <!-- Remplacer par un vrai og-image plus tard -->

**Site officiel :** [https://facture.mayoraz-net.ch](https://facture.mayoraz-net.ch)

## 📖 Présentation

**FactureArtisan** est une application SaaS conçue spécialement pour les indépendants, les freelances et les artisans suisses. Elle permet de générer des factures PDF professionnelles, propres et conformes en quelques clics, sans avoir besoin d'un logiciel comptable complexe.

### Fonctionnalités Clés
- ⚡ **Génération Instantanée :** Créez des factures PDF directement depuis votre navigateur.
- 🔒 **Espace Sécurisé :** Vos factures sont sauvegardées dans le cloud.
- 🎨 **Personnalisation (Pro) :** Ajoutez votre propre logo d'entreprise.
- 💰 **Abonnements Flexibles :** 3 factures gratuites, puis abonnements mensuels, annuels ou licence à vie.
- 🇨🇭 **Conformité Suisse :** Taux de TVA (8.1%, 2.6%) et mise en page adaptée.

## 🛠️ Stack Technique

- **Frontend / Backend :** [Astro](https://astro.build/) (SSR)
- **Base de données & Auth :** [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Paiements :** [Stripe](https://stripe.com/) (Payment Links + Webhooks)
- **Hébergement :** [Cloudflare Pages / Workers](https://pages.cloudflare.com/) (Edge runtime)
- **Styling :** CSS Vanilla + Variables CSS (Thème Clair/Sombre)

## 💻 Installation en local

Si vous souhaitez faire tourner le projet localement pour le développement :

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/Tom1419-git/saas-facture.git
   cd saas-facture
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Variables d'environnement :**
   Créer un fichier `.env` à la racine (ne pas commiter) avec les clés publiques :
   ```env
   PUBLIC_SUPABASE_URL=votre_url_supabase
   PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
   ```

4. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:4321`.

## 📜 Licence & Mentions Légales

Ce code source est la propriété intellectuelle de **Thomas Mayoraz**. Toute copie, revente ou hébergement tiers sans autorisation préalable est strictement interdite. 

Pour les conditions d'utilisation du service hébergé, veuillez consulter les [Mentions Légales](https://facture.mayoraz-net.ch/mentions-legales) et les [CGV](https://facture.mayoraz-net.ch/cgv).

---
*Créé avec passion par [Thomas Mayoraz](https://mayoraz-net.ch).*
