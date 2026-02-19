
# FamilySphere 🛡️ – Private Family Network

FamilySphere is a high-end, private-access social network designed to protect and preserve family legacies. Unlike public platforms, FamilySphere is invite-only, ad-free, and encrypted for family peace of mind.

## 🚀 Core Technologies
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Lucide.
- **AI Engine**: Google Gemini API (AI Historian for summaries & captions).
- **Backend (Architecture)**: Node.js/Express with WebSocket (Socket.io) support.
- **Database**: PostgreSQL with Prisma ORM.
- **Real-Time**: Integrated chat and live feed updates.

## ✨ Key Features
- **3-Column Social Layout**: Familiar yet focused on private connections.
- **AI Historian**: Automatically summarizes family activity and describes photos.
- **Vault Identity**: Secure profile management for all family members.
- **The Archives**: Advanced gallery management for family milestones.
- **Direct Messaging**: Private real-time 1:1 chat between relatives.
- **Gatherings**: RSVP-driven event system for birthdays and reunions.
- **Admin HQ**: Centralized control for the "Family Founder" to manage access.

## 🛠️ Local Setup
1. **API Key**: Ensure you have a Google Gemini API Key.
2. **Environment**:
   ```bash
   export API_KEY=your_gemini_key
   ```
3. **Run**:
   - The app uses `localStorage` as a mock database (`services/mockDb.ts`) for immediate evaluation.
   - For production, connect the `schema.sql` to a PostgreSQL instance.

## 🐳 Docker Deployment
```bash
docker-compose up --build
```

---
*Preserving the moments that matter most.*
