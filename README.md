# AI Desktop Assistant

A powerful desktop automation assistant with AI capabilities, built with Next.js, Tauri, and Python.

![AI Desktop Assistant Screenshot](/public/screenshot.png)

## Features

- 🛠️ **Dashboard**: Overview of tasks, automations, and quick actions
- 🧠 **Task Assistant**: Create, edit, and manage tasks with reminders
- 📬 **Email & CRM**: Send emails via Outlook and manage contacts
- 📄 **Document Assistant**: Create Word documents and Excel spreadsheets
- ⚡ **Automation Scripts**: Run desktop automation scripts with pyautogui
- 📝 **History & Logs**: Track past tasks and automation runs
- 👤 **Profile & Settings**: Customize your experience
- 🧠 **NLP Engine**: Natural language processing capabilities
- 🖥️ **Desktop Automation**: Control your desktop with Python scripts
- ✨ **AI Chat**: Conversational AI assistant with real-time responses

## Tech Stack

### Frontend
- **Next.js**: React framework for the web UI
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **shadcn/ui**: UI component library

### Backend
- **Tauri**: Desktop application framework
- **Python**: Backend scripting for automation
- **Flask**: API server for Python backend
- **Transformers**: Hugging Face NLP models
- **Firebase**: Authentication and data storage

## Prerequisites

- Node.js 16+
- Python 3.8+
- Rust (for Tauri)

## Installation

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/yourusername/ai-desktop-assistant.git
cd ai-desktop-assistant
\`\`\`

### 2. Install frontend dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Install Python dependencies

\`\`\`bash
cd python-backend
pip install -r requirements.txt
cd ..
\`\`\`

### 4. Set up environment variables

Create a `.env.local` file in the root directory:

\`\`\`
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id


# Groq API 
GROQ_API_KEY=your_groq_api_key
\`\`\`

## Running the Application

### Development Mode

1. Start the Python backend:

\`\`\`bash
cd python-backend
python main.py
\`\`\`

2. In a new terminal, start the Next.js development server:

\`\`\`bash
npm run dev
\`\`\`

3. To run as a desktop app with Tauri:

\`\`\`bash
npm run tauri:dev
\`\`\`

### Production Build

1. Build the Next.js application:

\`\`\`bash
npm run build
\`\`\`

2. Build the Tauri desktop application:

\`\`\`bash
npm run tauri:build
\`\`\`

The compiled application will be available in the `src-tauri/target/release` directory.

## Troubleshooting

### Python Backend Issues

If you encounter issues with the Python backend:

1. Check that all dependencies are installed:
\`\`\`bash
pip install -r python-backend/requirements.txt
\`\`\`

2. Verify the Python server is running on port 5000:
\`\`\`bash
curl http://localhost:5000/api/health
\`\`\`

3. Check the Python logs for errors.

### Desktop Automation Issues

1. Make sure you have the necessary permissions for automation:
   - On Windows: Run as administrator
   - On macOS: Grant accessibility permissions
   - On Linux: Install required dependencies (xdotool, etc.)

2. Some automation features may be platform-specific.

### AI Chat Issues

If the AI chat is not working:

1. Check that the Python backend is running
2. Verify your OpenAI API key if using OpenAI
3. Try the fallback mode which uses local models


