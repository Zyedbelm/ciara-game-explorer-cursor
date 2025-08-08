## Basculer la fonction de tchat (fallback rapide)

Pour revenir à l’ancienne fonction Edge sans changer le code, définissez la variable:

```
VITE_CHAT_FUNCTION_NAME=ai-chat
```

Par défaut, la nouvelle fonction est `enhanced-ai-chat`.

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/40a689fe-ccbb-43a6-bc77-5ddf348ea8bb

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/40a689fe-ccbb-43a6-bc77-5ddf348ea8bb) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/40a689fe-ccbb-43a6-bc77-5ddf348ea8bb) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 🧪 Test Data

This project includes comprehensive test data for development and testing purposes.

### What's included
- **5 Swiss cities** with complete tourist information
- **50+ journeys** across different categories
- **28+ points of interest** with detailed descriptions
- **30+ local partners** (restaurants, hotels, shops)
- **120+ rewards** for gamification
- **Interactive quiz questions** and content documents for AI chat

### Using test data
```bash
# Apply test data
cd supabase
supabase migration up --local

# Verify installation
supabase db shell --local
```

### Documentation
- [📖 Complete Test Data Guide](./docs/test-data-guide.md)
- [⚡ Quick Reference](./docs/test-data-quick-reference.md)

The test data includes realistic Swiss tourism destinations like Lausanne, Montreux, Gruyères, Zermatt, and Lucerne, complete with authentic points of interest, local partners, and interactive content.
# Fri Aug  8 22:49:59 CEST 2025
