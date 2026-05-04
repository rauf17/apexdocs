# ⚡ ApexDocs

![ApexDocs Banner](./public/banner-placeholder.png)

ApexDocs is a high-performance, aesthetically pleasing Markdown editor and document management platform built for modern professionals. Write in pristine Markdown, preview in real-time with stunning themes, and export directly to a print-ready PDF with a single click.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.2-61dafb.svg?logo=react)
![Firebase](https://img.shields.io/badge/firebase-10.12-ffca28.svg?logo=firebase)

---

## ✨ Features

- **Live Markdown Preview:** Write in CodeMirror 6 with custom syntax highlighting; see the rendered output instantly.
- **Premium Themes:** Toggle between Dark, Light, Sepia, and Minimal viewing experiences.
- **PDF Export:** Custom print-optimized CSS ensures your document looks exactly as intended without watermarks.
- **Auto-Save & Version History:** Your work is saved to the cloud automatically. Restore past versions instantly.
- **Templates Library:** 10+ professionally designed templates (Resumes, Invoices, Proposals, etc.).
- **Secure Sharing:** Generate a public link instantly to share your document securely.
- **Optimistic UI:** Buttery smooth interface updates, backed by Google Firebase.

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, React Router v6
- **Styling:** Tailwind CSS v3 + CSS Variables (Midnight Theme)
- **Database & Auth:** Firebase v10 (Firestore, Authentication)
- **Editor:** CodeMirror 6, marked (Markdown parser)
- **Utilities:** html2pdf.js, lucide-react

---

## 🚀 Local Setup Instructions

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/apexdocs.git
   cd apexdocs
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables**
   Rename \`.env.example\` to \`.env\` and fill in your Firebase credentials.
   \`\`\`env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_ID=your_messaging_id
   VITE_FIREBASE_APP_ID=your_app_id
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`
   The application will be running at \`http://localhost:5173\`.

---

## 🔥 Firebase Setup Steps

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Add a Web App to your project to get your configuration object.
3. Enable **Authentication**:
   - Enable **Email/Password** provider.
   - Enable **Google** provider.
4. Enable **Firestore Database**:
   - Create a database and set up your security rules. Example rules:
     \`\`\`text
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /documents/{docId} {
           allow read: if request.auth != null && resource.data.userId == request.auth.uid;
           allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
           allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
         }
       }
     }
     \`\`\`

---

## ☁️ Deploy to Vercel

ApexDocs is configured for zero-hassle deployment on Vercel.

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and create a "New Project".
3. Import your GitHub repository.
4. **Environment Variables:** Add all the \`VITE_FIREBASE_*\` variables from your \`.env\` file into the Vercel project settings.
5. Click **Deploy**. Vercel will automatically detect Vite and configure the build settings.
6. The included \`vercel.json\` ensures that client-side routing works perfectly.

---

## 📸 Screenshots

*(Add screenshot placeholders here)*

- **Dashboard:** \`![Dashboard](./public/screenshot-dashboard.png)\`
- **Editor:** \`![Editor](./public/screenshot-editor.png)\`
- **PDF Output:** \`![PDF Export](./public/screenshot-pdf.png)\`

---

*Made with ❤️ by the ApexDocs Team.*
