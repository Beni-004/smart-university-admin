# Smart University Admin - Fresh Installation Guide

This guide will walk you through setting up the Smart University Admin system from scratch on both Windows and Linux environments.

---

## Table of Contents

1. [LLM Service Options](#llm-service-options)
2. [Prerequisites Installation](#prerequisites-installation)
   - [Windows](#windows-prerequisites)
   - [Linux](#linux-prerequisites)
3. [Installing Ollama (Optional)](#installing-ollama-optional)
4. [Getting Groq API Key (Optional)](#getting-groq-api-key-optional)
5. [Setting Up PostgreSQL](#setting-up-postgresql)
6. [Project Setup](#project-setup)
7. [Running the Application](#running-the-application)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)

---

## LLM Service Options

**IMPORTANT:** This system supports **flexible LLM configuration**. You need **at least ONE** of the following:

### Option 1: Groq API (Cloud-based, Fast)
- **Pros:** Fast, no local resources needed, no installation
- **Cons:** Requires API key, rate limits, needs internet connection
- **Setup:** Get free API key from [console.groq.com](https://console.groq.com)
- **Cost:** Free tier available

### Option 2: Ollama (Local, Private)
- **Pros:** Free, private, works offline, no rate limits
- **Cons:** Requires local installation, uses RAM/VRAM, slower
- **Setup:** Install Ollama + download SQLCoder model
- **Requirements:** 8-16 GB RAM depending on model size

### Option 3: Both (Recommended)
- Use **Groq as primary** for speed
- Automatic **Ollama fallback** if Groq rate limits or fails
- Best of both worlds

**For your friend's laptop:** If they don't want to install Ollama (large download), they can just use Groq API. If they don't want to use Groq API, they can just install Ollama. Either one works!

---

## Prerequisites Installation

### Windows Prerequisites

#### 1. Install Python 3.10+

1. Download Python from [python.org](https://www.python.org/downloads/)
2. Run the installer:
   - Check "Add Python to PATH"
   - Click "Install Now"
3. Verify installation:
   ```powershell
   python --version
   ```
   Should show Python 3.10 or higher.

#### 2. Install Node.js 18+

1. Download from [nodejs.org](https://nodejs.org/)
2. Run the installer (choose LTS version)
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

#### 3. Install PostgreSQL 14+

1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer:
   - Remember your postgres user password!
   - Default port: 5432
   - Include pgAdmin 4 (GUI tool)
3. Verify installation:
   ```powershell
   psql --version
   ```

#### 4. Install Git (if not already installed)

1. Download from [git-scm.com](https://git-scm.com/download/win)
2. Run the installer with default options
3. Verify:
   ```powershell
   git --version
   ```

---

### Linux Prerequisites

#### 1. Update System Packages

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt upgrade -y
```

**Arch Linux:**
```bash
sudo pacman -Syu
```

**Fedora/RHEL:**
```bash
sudo dnf update -y
```

#### 2. Install Python 3.10+

**Ubuntu/Debian:**
```bash
sudo apt install python3 python3-pip python3-venv -y
```

**Arch Linux:**
```bash
sudo pacman -S python python-pip
```

**Fedora/RHEL:**
```bash
sudo dnf install python3 python3-pip python3-venv -y
```

Verify:
```bash
python3 --version
pip3 --version
```

#### 3. Install Node.js 18+

**Ubuntu/Debian (using NodeSource):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
```

**Arch Linux:**
```bash
sudo pacman -S nodejs npm
```

**Fedora/RHEL:**
```bash
sudo dnf install nodejs npm -y
```

Verify:
```bash
node --version
npm --version
```

#### 4. Install PostgreSQL 14+

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Arch Linux:**
```bash
sudo pacman -S postgresql
sudo -u postgres initdb -D /var/lib/postgres/data
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Fedora/RHEL:**
```bash
sudo dnf install postgresql postgresql-server -y
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Verify:
```bash
psql --version
```

#### 5. Install Git (usually pre-installed)

```bash
# Ubuntu/Debian
sudo apt install git -y

# Arch Linux
sudo pacman -S git

# Fedora/RHEL
sudo dnf install git -y
```

Verify:
```bash
git --version
```

---

## Installing Ollama (Optional)

**Note:** You can skip this section if you're using Groq API only.

Ollama enables local SQL generation using the SQLCoder model.

### Windows

1. Download Ollama from [ollama.com](https://ollama.com/download)
2. Run the installer
3. Ollama will start automatically in the background
4. Verify installation:
   ```powershell
   ollama --version
   ```

### Linux

Run the official installation script:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Start Ollama service:
```bash
# If using systemd (most distributions)
sudo systemctl start ollama
sudo systemctl enable ollama

# Or run manually in a separate terminal
ollama serve
```

Verify:
```bash
ollama --version
```

### Pull the SQLCoder Model

Once Ollama is installed, download the SQLCoder model:

```bash
ollama pull sqlcoder:15b
```

**Note:** The 15B model requires significant RAM/VRAM. For lower-spec systems, use:
```bash
ollama pull sqlcoder:7b
```

Verify the model is available:
```bash
ollama list
```

---

## Getting Groq API Key (Optional)

**Note:** You can skip this section if you're using Ollama only.

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Click "Create API Key"
5. Copy your API key (starts with `gsk_...`)
6. Save it for the backend configuration step

**Free tier includes:** Generous rate limits for personal/development use.

---

## Setting Up PostgreSQL

### Windows

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Connect to PostgreSQL server (use the password you set during installation)
3. Or use **psql** from Command Prompt:
   ```powershell
   # Connect to PostgreSQL
   psql -U postgres
   ```
   Enter your postgres password when prompted.

### Linux

Set up PostgreSQL access:

```bash
# Switch to postgres user
sudo -u postgres psql
```

**Optional:** Set a password for postgres user (if not already set):
```sql
ALTER USER postgres PASSWORD 'your_secure_password';
```

To enable password authentication:
1. Edit `pg_hba.conf`:
   ```bash
   # Ubuntu/Debian
   sudo nano /etc/postgresql/*/main/pg_hba.conf

   # Arch Linux
   sudo nano /var/lib/postgres/data/pg_hba.conf
   ```
2. Change the line for local connections from `peer` to `md5`:
   ```
   local   all             postgres                                md5
   ```
3. Restart PostgreSQL:
   ```bash
   sudo systemctl restart postgresql
   ```

### Create the Database

In the psql prompt (both Windows and Linux):

```sql
-- Create database
CREATE DATABASE university_db;

-- Connect to the new database
\c university_db

-- Exit psql
\q
```

---

## Project Setup

### 1. Clone the Repository

**Windows (PowerShell or Command Prompt):**
```powershell
cd C:\Users\YourUsername\Projects
git clone https://github.com/perfectking321/smart-university-admin.git
cd smart-university-admin
```

**Linux:**
```bash
cd ~/Projects
git clone https://github.com/perfectking321/smart-university-admin.git
cd smart-university-admin
```

If you already have the project, skip this step.

---

### 2. Database Schema Setup

Apply the database schema:

**Windows:**
```powershell
# Using psql
psql -U postgres -d university_db -f database\schema.sql
```

**Linux:**
```bash
# Using psql
psql -U postgres -d university_db -f database/schema.sql
```

Enter your postgres password when prompted.

**Alternative (using psql interactive mode):**
```bash
psql -U postgres -d university_db
```
Then inside psql:
```sql
\i /full/path/to/smart-university-admin/database/schema.sql
\q
```

---

### 3. Generate Fake Data (Optional)

If you want to populate the database with sample data for testing:

**Windows:**
```powershell
cd database

# Edit generate_fake_data.py and update DATABASE_URL with your password
notepad generate_fake_data.py

# Run the generator (make sure you're in the project root venv or use python directly)
python generate_fake_data.py

cd ..
```

**Linux:**
```bash
cd database

# Edit generate_fake_data.py and update DATABASE_URL with your password
nano generate_fake_data.py

# Run the generator
python3 generate_fake_data.py

cd ..
```

The script will create fake students, departments, courses, enrollments, grades, attendance, and placements.

---

### 4. Backend Setup

#### Create Backend Environment File

**Windows:**
```powershell
cd backend
notepad .env
```

**Linux:**
```bash
cd backend
nano .env
```

Add the following content (update with your actual configuration):

**If using BOTH Groq and Ollama (Recommended):**
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/university_db
GROQ_API_KEY=gsk_your_groq_api_key_here
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=sqlcoder:15b
```

**If using ONLY Groq API (no Ollama):**
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/university_db
GROQ_API_KEY=gsk_your_groq_api_key_here
```

**If using ONLY Ollama (no Groq API):**
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/university_db
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=sqlcoder:15b
```

Save and close the file.

#### Install Backend Dependencies

**Windows:**
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**Linux:**
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

You should see `(venv)` prefix in your terminal prompt after activation.

---

### 5. Frontend Setup

Open a new terminal window (keep the backend terminal open).

#### Navigate to Frontend Directory

**Windows:**
```powershell
cd C:\Users\YourUsername\Projects\smart-university-admin\frontend
```

**Linux:**
```bash
cd ~/Projects/smart-university-admin/frontend
```

#### Create Frontend Environment File

**Windows:**
```powershell
notepad .env.local
```

**Linux:**
```bash
nano .env.local
```

Add the following content:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Save and close the file.

#### Install Frontend Dependencies

Both Windows and Linux:
```bash
npm install
```

This will install all React, TypeScript, Vite, and Tailwind CSS dependencies.

---

## Running the Application

### 1. Start Ollama (if using Ollama)

**Skip this step if you're using Groq API only.**

**Windows:**
Ollama typically starts automatically. Check the system tray for the Ollama icon.

If not running, open PowerShell and run:
```powershell
ollama serve
```

**Linux:**
```bash
# If using systemd
sudo systemctl start ollama

# Or run manually
ollama serve
```

Keep this terminal open or run it in the background.

---

### 2. Start the Backend

In your backend terminal (with venv activated):

**Windows:**
```powershell
cd C:\Users\YourUsername\Projects\smart-university-admin\backend
venv\Scripts\activate
python main.py
```

**Linux:**
```bash
cd ~/Projects/smart-university-admin/backend
source venv/bin/activate
python main.py
```

The backend should start on **http://localhost:8000**

You should see output like:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

### 3. Start the Frontend

In a new terminal window:

**Windows:**
```powershell
cd C:\Users\YourUsername\Projects\smart-university-admin\frontend
npm run dev
```

**Linux:**
```bash
cd ~/Projects/smart-university-admin/frontend
npm run dev
```

The frontend should start on **http://localhost:3000**

You should see output like:
```
VITE ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: http://0.0.0.0:3000/
```

---

## Verification

### 1. Check Backend Health

Open your browser or use curl:

**Browser:**
Visit: http://localhost:8000/api/health

**Command Line:**

Windows (PowerShell):
```powershell
curl http://localhost:8000/api/health
```

Linux:
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "groq": "connected",
  "ollama": "connected",
  "llm_service": "available"
}
```

**Note:** The `groq` and `ollama` fields will show:
- `"connected"` if the service is available
- `"not configured"` if the service is not set up
- `"disconnected"` if configured but not reachable

### 2. Check Frontend

Open your browser and visit: http://localhost:3000

You should see the Smart University Admin interface.

### 3. Test a Query

Try asking a question like:
- "Show all students in Computer Science department"
- "What is the average GPA by department?"
- "List all courses"

The system should:
1. Generate SQL from your question
2. Execute it against PostgreSQL
3. Display both the SQL and results

---

## Troubleshooting

### Backend Issues

#### "Neither Groq API nor Ollama is available"
- You need at least ONE LLM service configured
- Either set up Groq API (add `GROQ_API_KEY` to `.env`)
- Or install and start Ollama
- See [LLM Service Options](#llm-service-options) section

#### "ModuleNotFoundError" or import errors
```bash
# Make sure virtual environment is activated
# Windows:
venv\Scripts\activate

# Linux:
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### "Ollama not available"
**Note:** This is only an issue if you're trying to use Ollama (not using Groq API).
- **Windows:** Check if Ollama is running in the system tray. If not, run `ollama serve` in PowerShell.
- **Linux:** Run `sudo systemctl start ollama` or `ollama serve` manually.
- Verify: `curl http://localhost:11434/api/tags`

#### "Groq API error" or rate limit
**Note:** This is only an issue if you're trying to use Groq API (not using Ollama).
- Check your `GROQ_API_KEY` is correct in `.env`
- Verify API key is active at [console.groq.com](https://console.groq.com)
- If you hit rate limits, the system will automatically fallback to Ollama (if configured)
- Or wait a few minutes for rate limits to reset

#### "Database connection failed"
- Verify PostgreSQL is running:
  - **Windows:** Check Services (Win+R → `services.msc` → PostgreSQL service)
  - **Linux:** `sudo systemctl status postgresql`
- Check `DATABASE_URL` in `backend/.env` matches your actual password
- Test connection:
  ```bash
  psql -U postgres -d university_db
  ```

#### "Model not found" error
**Note:** Only relevant if using Ollama.
```bash
# Make sure the sqlcoder model is downloaded
ollama list

# If not present, pull it
ollama pull sqlcoder:15b
```

---

### Frontend Issues

#### Port 3000 already in use
Edit the dev script in `frontend/package.json` or specify a different port:
```bash
npm run dev -- --port 3001
```

#### "Cannot GET /" or blank page
- Make sure backend is running on port 8000
- Check `frontend/.env.local` has correct API URL
- Open browser console (F12) to see any errors

#### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json  # Linux
# Or manually delete node_modules folder on Windows

npm install
```

---

### PostgreSQL Issues

#### Can't connect as postgres user (Linux)
```bash
# Switch to postgres system user first
sudo -u postgres psql

# Or set password and use password auth
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_password';"
```

#### Permission denied
Make sure your database user has proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE university_db TO postgres;
```

---

### Port Conflicts

If ports 3000, 8000, or 11434 are already in use:

**Find process using a port:**

Windows:
```powershell
netstat -ano | findstr :8000
```

Linux:
```bash
sudo lsof -i :8000
```

**Kill the process or change the port in configuration files.**

---

## Summary of Default URLs

After successful installation:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Health Check:** http://localhost:8000/api/health
- **API Docs:** http://localhost:8000/docs (FastAPI auto-generated)
- **Ollama:** http://localhost:11434

---

## Next Steps

1. Try asking questions in the web interface
2. Check the generated SQL to understand query patterns
3. Explore the codebase:
   - `backend/main.py` - FastAPI application entry point
   - `frontend/src/` - React components
   - `database/schema.sql` - Database structure

---

## Uninstalling / Cleaning Up

### Windows

1. Delete the project folder
2. Drop the database:
   ```powershell
   psql -U postgres -c "DROP DATABASE university_db;"
   ```
3. Uninstall software via "Add or Remove Programs"

### Linux

1. Delete the project folder:
   ```bash
   rm -rf ~/Projects/smart-university-admin
   ```
2. Drop the database:
   ```bash
   sudo -u postgres psql -c "DROP DATABASE university_db;"
   ```
3. Uninstall packages if desired:
   ```bash
   # Ubuntu/Debian
   sudo apt remove postgresql python3 nodejs

   # Arch Linux
   sudo pacman -R postgresql python nodejs
   ```

---

## Additional Notes

### Virtual Environment Management

Always activate the virtual environment before running backend commands:

**Windows:**
```powershell
cd backend
venv\Scripts\activate
```

**Linux:**
```bash
cd backend
source venv/bin/activate
```

To deactivate:
```bash
deactivate
```

### Running in Production

This setup is for **development only**. For production deployment:

1. Use a production WSGI server (e.g., Gunicorn on Linux)
2. Set up proper environment variables and secrets management
3. Configure CORS properly (don't use `*`)
4. Add authentication and authorization
5. Use a process manager (systemd, PM2, or Docker)
6. Set up HTTPS with proper certificates
7. Configure firewall rules

### System Requirements

**Minimum:**
- 8 GB RAM
- 2 CPU cores
- 10 GB free disk space

**Recommended (for sqlcoder:15b):**
- 16 GB RAM
- 4 CPU cores
- 20 GB free disk space
- GPU with 8+ GB VRAM (optional, for faster inference)

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the main [README.md](./README.md) for more details
2. Review the [Troubleshooting](#troubleshooting) section above
3. Check Ollama logs: `ollama logs` (if available)
4. Check PostgreSQL logs:
   - **Windows:** `C:\Program Files\PostgreSQL\14\data\log\`
   - **Linux:** `/var/log/postgresql/` or `/var/lib/postgres/data/log/`
5. Check backend logs in the terminal where `python main.py` is running
6. Check browser console (F12) for frontend errors

---

**Happy querying!**
