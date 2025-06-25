# Project LangDuck

A multi-stage Dockerized full-stack application with Laravel (PHP) backend, Vue/Vite frontend, and PostgreSQL database. Supports both development and production environments with optimized caching and HMR.

## Quick run

Follow steps **1.1 Enable WSL & Virtualization**, **1.2 Install Docker Desktop**, and **3.5 Pull & Run Production Images** to get up and running in seconds:

* **Enable WSL & Virtualization** (see [1.1 Enable WSL & Virtualization](#11-enable-wsl--virtualization))
* **Install Docker Desktop** (see [1.2 Install Docker Desktop](#12-install-docker-desktop))
* **Pull & Run Production Images** (see [3.5 Pull & Run Production Images](#35-pull--run-production-images))

## Prerequisites

* **Operating System**: Windows 10 or later
* **CPU virtualization**: VT-x/AMD-V enabled
* **Administrator privileges** for installation
* **RAM**: Minimum 8 GB
* **Internet** connection
* **GitHub account** (for SSH key setup)
* **JetBrains account** (optional, for PhpStorm)

## Project Structure

```
<project-root>/
├── backend/                        # Laravel application
├── frontend/                       # Vue/Vite application
├── docs/                           # Project documentation
├── .dockerignore                   # Files to exclude from Docker build context
├── .env.example                    # Example environment variables
├── docker-compose.yml              # Dev Docker Compose configuration
├── docker-compose.prod.yml         # Production Docker Compose configuration
├── README.md                       # Project overview and instructions
└── .github/
    └── workflows/
        └── docker-image.yml        # GitHub Actions workflow for build/push image
```

## 1. Setup

### 1.1 Enable WSL & Virtualization

Open PowerShell as Administrator and run:

```powershell
# Enable Virtual Machine Platform and WSL
wsl --install
# Or on existing systems:
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

Reboot your machine.

### 1.2 Install Docker Desktop

1. Download from [Docker Docs](https://docs.docker.com/desktop/setup/install/windows-install/)
2. Run `Docker Desktop Installer.exe`
3. Ensure **Use WSL 2 instead of Hyper-V** is selected
4. Complete the installation and launch Docker

### 1.3 Install Developer Tools

* **PhpStorm**: [Download](https://www.jetbrains.com/phpstorm/download/#section=windows)
* **Git**: [Download](https://git-scm.com/downloads)

## 2. Clone & Configure

### 1. Clone the repo and switch to the branch:

```bash
# Clone the repository
git clone <repo-url>

# Navigate into the project directory
cd <project-root>

# Check out the develop branch to start development
git checkout develop
```

**Note**: If you're checking out the develop branch for the first time, you may need to set up tracking:

```bash
git checkout -t origin/develop
```
### 2. Configure Git user and SSH signing key:

#### Set your Git identity

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

#### Generate an SSH **signing key** (not for pushing)

```bash
ssh-keygen -t ed25519 -C "you@example.com" -f "$env:USERPROFILE\.ssh\id_ed25519_signing"
```

This creates:

* Private key: `id_ed25519_signing`
* Public key: `id_ed25519_signing.pub`

---

#### Copy the public key

```bash
type "$env:USERPROFILE\.ssh\id_ed25519_signing.pub"
```

Open GitHub to add the **signing key**: [https://github.com/settings/ssh/new](https://github.com/settings/ssh/new)

Fill in:

* **Title**: `SSH signing key`
* **Key type**: `Signing key`
* **Key**: Paste what you copied

---

#### Enable commit signing using SSH key

```bash
git config --global gpg.format ssh
git config --global user.signingkey "$env:USERPROFILE\.ssh\id_ed25519_signing"
git config --global commit.gpgsign true
```


#### Done ✅! Now every commit will be signed with your SSH key.

You can verify it by committing something and pushing — GitHub will show a **“Verified”** badge next to your commit.

### 3. Environment variables:

```bash
# Copy root .env

copy .env.example .env

# Copy backend .env

copy backend/.env.example backend/.env
```
Edit `.env` files to set ports and database credentials as needed.


## 3. Running Locally

### 3.1 Build and start containers

```bash
docker compose up -d --build
```

* Builds and caches dependencies for backend, frontend, and Postgres.
* Runs migrations and starts servers automatically.

### 3.2 Access Services

| Service        | URL                                            |
|----------------|------------------------------------------------|
| Frontend (HMR) | [http://localhost:5173](http://localhost:5173) |
| Backend (API)  | [http://localhost:8000](http://localhost:8000) |
| PostgreSQL     | localhost:5432 (use any client)                |

### 3.3 Stop Containers

```bash
docker compose down -v  # Removes volumes (Postgres data)
# Or without -v to keep data
```

### 3.4 Update Code

After pulling new changes:

```bash
git pull
docker compose up -d --build
```

Only changed layers will rebuild for faster turnaround.

### 3.5 Pull & Run Production Images

If you do **not** need the development setup and want to run using the **production compose file**, follow these steps:

1. **Pull the latest images** from Docker Hub and **start services** with the production compose file [docker-compose.prod.yml](docker-compose.prod.yml) in the repository by running:

   ```bash
   docker compose -f docker-compose.prod.yml up --pull always -d
   ```

2. **Verify**:

    * Backend: `http://localhost:8000`
    * Frontend: `http://localhost:5173`

*No container rebuild or code mounting is required in this mode.*

## 4. Docker CI/CD

CI pipelines build and push Docker images for `backend` and `frontend`:

* **GitHub Actions** workflow at `.github/workflows/docker-image.yml`
* Uses Buildx, QEMU, and layer caching for efficient multi-arch builds
* Tags images on `main`, `develop`, `release/*`, and feature/hotfix branches

## 5. Hot Module Reload (HMR)

Configured in `frontend/vite.config.js`:

```js
export default defineConfig({
    server: {
        host: '0.0.0.0',
        watch: { usePolling: true, interval: 100, ignoreInitial: true },
        hmr: { protocol: 'ws', host: 'localhost', port: 5173 },
    },
})
```

## 6. Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/awesome`
3. Commit changes with Conventional Commits
4. Push and open a Pull Request

---

Happy coding!
