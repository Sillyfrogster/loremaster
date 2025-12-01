# Loremaster

**Loremaster** is a lorebook tool built for beginners and advanced users alike. It brings an ease to lorebook creation / management. 

## Tech Stack

### Frontend
- **Framework:** [Vue 3](https://vuejs.org/) (Composition API)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Runtime:** [Node.js](https://nodejs.org/) (Bun supported)

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **Language:** Python 3.10+
- **Package Manager:** [uv](https://github.com/astral-sh/uv) (recommended)

## Getting Started

### Prerequisites

- **Node.js:** v20+ (or Bun)
- **Python:** v3.10+

### Installation

1.  **Install Frontend Dependencies:**
    ```bash
    bun install
    # or 'npm install'
    ```

2.  **Install Backend Dependencies:**
    Navigate to the `backend/` directory and install dependencies.
    ```bash
    cd backend
    uv sync
    # or 'pip install -r requirements.txt' if you export them
    ```

### Configuration

Create a `.env` file in the `backend/` directory to configure the optional Discord authentication. You can copy `.env.example`.

```ini
# backend/.env
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
```

### Running the Project

You can run the frontend and backend independently or concurrently.

**Full Stack (Recommended):**
```bash
bun run dev:full
```
- **Frontend:** http://localhost:5173
- **Backend:** http://127.0.0.1:5330

**Frontend Only:**
```bash
bun run dev
```

**Backend Only:**
```bash
cd backend
uv run python -X utf8 -m fastapi dev src/main.py --host 127.0.0.1 --port 5330
```

### Building for Production

To build the frontend assets for deployment:

```bash
bun run build
```
The artifacts will be generated in the `dist/` directory.

## Project Structure

```
loremaster/
├── src/                # Frontend
│   ├── components/     # UI Components
│   ├── stores/         # Pinia State Stores
│   ├── services/       # API Clients
│   └── views/          # Route Views
├── backend/            # FastAPI Backend
│   └── src/
│       ├── api/        # API Routes & Dependencies
│       ├── services/   # Business Logic
│       └── models.py   # Pydantic Models
├── public/             # Static Assets
└── dist/               # Build Artifacts
```
## License

MIT