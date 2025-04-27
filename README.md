# 🚀 Project Title:
# GroqPilot – High Speed Desktop Automation.

-------------------------------------------------------------------------------

# 📌 Problem Statement:
Problem Statement 5 :Build an assistant that uses terminator to interact with desktop apps based on user requests processed by Groq (e.g., "summarize my open emails," "find recent customer interactions in the CRM").

------------------------------------------------------------------------------------------------------------------------------------------------

# 🎯 Objective:

The objective is to develop a robust desktop automation assistant with AI capabilities, leveraging Next.js, Tauri, and Python.

Problem:
Modern users and businesses increasingly demand instant, intelligent conversational interfaces for applications such as customer support, personal assistants, automation, and smart services. However, the development of high-quality, real-time AI chat systems that are scalable, accurate, and easily integrated presents significant challenges and requires substantial resources.

Solution (GROQPILOT):
This project provides a ready-to-use AI Chat API, built upon Groq's high-speed Llama 3 models and Next.js serverless functions. This solution enables developers and businesses to integrate real-time, intelligent conversational capabilities into their websites, applications, or internal tools, without the need for extensive model training or complex infrastructure management.

Real-World Use Cases:
✅ Customer Support Chatbots: Organizations can deploy intelligent assistants on their websites to provide 24/7 support for user inquiries.

✅ Personal AI Assistants: Applications can integrate personalized bots to assist with scheduling, reminders, and frequently asked questions.

✅ Internal Business Tools: Teams can develop custom knowledge assistants to facilitate more efficient information access.

✅ Educational Platforms: Real-time AI tutoring bots can be implemented to assist students with questions or assignments.

Value Provided:
Reduces development time and engineering effort by eliminating the need to build models from scratch.

Enhances user experience with rapid and intelligent responses.

Lowers operational costs through serverless architecture and on-demand scalability.

Ensures future compatibility with its model-agnostic design, allowing for seamless upgrades to newer LLMs.

---------------------------------------------------------------------------
# 🧠 Team & Approach:

Team Name: DEEPBLOCK

Team Members:

Himanshu Chavan – [ Team Lead ] AI & Automation Developer

Devid Deshmukh – Frontend Engineer

Yogesh Nagarare – Backend Engineer

Nikhilesh Ghormode – Testing and Development

Approach:

Problem Selection:
The team chose to develop an AI-powered desktop assistant to enhance productivity, streamline task management, and simplify daily workflows.

Key Challenges Addressed:

Natural Language Understanding (NLU): The team ensured accurate voice recognition and support for multiple languages.

Seamless Integrations: The assistant was designed to connect with various third-party tools, including email, calendar, and cloud storage, to provide a unified solution.

Security & Privacy: The team prioritized the encryption of sensitive user data and the maintenance of privacy while preserving functionality.

Cross-Platform Support: The assistant was developed to function across both desktop and mobile platforms.

Pivots/Brainstorms:

The team decided to add mobile application support to enhance accessibility across multiple devices. Additionally, the Bhashini API was integrated to provide regional language support, enabling multilingual voice and text capabilities.

-----------------------------------------------------------------------------------------------------------------------------------------------------------------

🛠️ Tech Stack

Frontend
Next.js: React framework for the web UI

*Tailwind CSS: Utility-first CSS framework

Framer Motion: Animation library

Lucide React: Icon library

shadcn/ui: UI component library

Backend
Tauri: Desktop application framework

Python: Backend scripting for automation

FASTAPI: API server for Python backend

pyautogui

imaplib (Gmail IMAP)

Database:

Firebase (for authentication)

APIs:

Groq (NLP engine)

Hosting:

Vercel (Frontend)

GitHub (Backend)

Sponsor Technologies Used:
Groq: The project utilizes Groq’s Llama 3-70B model to deliver ultra-fast, real-time AI chat responses.

ScreenPipe: ScreenPipe is employed to track user screen interactions and optimize chat workflows.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

✨ Key Features:

⚡ Real-Time AI Responses:
Provides instant, natural language conversations using Groq's Llama 3-70B model with ultra-low latency.
🧠 Customizable System Prompts:
Enables tailoring of the AI's behavior and tone to suit diverse user requirements.
🖥️ ScreenPipe Integration:
Captures, analyzes, and enhances user workflows based on screen interactions.
🛡️ Robust Error Handling:
Implements a reliable backend with comprehensive API error management and smooth fallback mechanisms.
🛠️ Flexible Message Formatting:
Supports multi-turn conversations using structured, role-based messaging.
🚀 Serverless and Scalable:
Leverages Next.js Serverless APIs for effortless scalability without server management.
🔥 Performance Optimized:
Employs minimal API payloads, optimized maximum token usage, and temperature tuning to enhance output quality.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

📽️ Demo & Deliverables:
Screenshots -
# LOGIN
![LOGIN](https://github.com/user-attachments/assets/507692de-dbc5-4533-8fb3-83ff7d58c05a)
# DASHBORD
![DASHBOARD](https://github.com/user-attachments/assets/e2946641-d655-4ccf-b98a-80c3c6171b6c)
# EMAIL
![EMAIL](https://github.com/user-attachments/assets/bff47d55-a5ee-4f68-b255-654834ec9866)
# TASK ASSIATANT
![TASK](https://github.com/user-attachments/assets/f52d714f-5714-4d89-b5fa-3894107719f8)
# DOCUMENT
![DOCUMENT](https://github.com/user-attachments/assets/b2573bc9-a7ee-4ad1-a7e5-719963a02975)
# AUTOMATION
![AUTOMATION](https://github.com/user-attachments/assets/11ec5747-74a5-4795-8ef8-d23674206214)
# NLP ENGINE
![NLP ENGINE](https://github.com/user-attachments/assets/e9543343-2b5f-4f54-a8f5-0db377bcb4a2)
# QUICK ASSISTANCE
![QUICK ASSIST](https://github.com/user-attachments/assets/9bc6fcd2-6af4-42d9-81fc-9700c18ec9a9)
# AI CHAT
![AI CHAT](https://github.com/user-attachments/assets/2e8eb13e-083f-452d-93f9-81f514057321)

Demo Video Link: [Paste YouTube or Loom link here]
PPT Link: [Paste Google Slides / PDF link here]

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# ✅ Tasks & Bonus Checklist:
✅ All members of the team completed the mandatory task - Followed at least 2 of our social channels and filled the form (Details in Participant Manual)
❌  All members of the team completed Bonus Task 1 - Sharing of Badges and filled the form (2 points) (Details in Participant Manual)
❌ All members of the team completed Bonus Task 2 - Signing up for Sprint.dev and filled the form (3 points) (Details in Participant Manual)

---------------------------------------------------------------------------------------------------------------------------
 
# 🧪 How to Run the Project

Prerequisites
Node.js 16+

Python 3.8+

Rust (for Tauri)

Installation
1. Clone the repository
```bash
git clone https://github.com/Himanshujchavan/GROQPILOT.git
cd GROQPILOT
```

2. Install frontend dependencies
```bash
npm install
```

3. Install Python dependencies
```bash
cd python-backend
pip install -r requirements.txt
python main.py
```

4. Set up environment variables
Create a .env.local file in the root directory:

```

Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-app-485c4
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBZwevHjURD07kOB80VGedWN21ah11xsZ8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-app-485c4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-app-485c4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=620624159206
NEXT_PUBLIC_FIREBASE_APP_ID=1:620624159206:web:a26153700189cb68a2f627

Groq API
GROQ_API_KEY=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
```

Running the Application
Development Mode
Start the Python backend:

```bash
cd python-backend
python main.py
```

In a new terminal, start the Next.js development server:

```bash
npm run dev
```

To run as a desktop app with Tauri:

```bash
npm run tauri:dev
```

Production Build
Build the Next.js application:

```bash
npm run build
```

Build the Tauri desktop application:

```bash
npm run tauri:build
```

The compiled application will be available in the src-tauri/target/release directory.

Troubleshooting
Python Backend Issues
If you encounter issues with the Python backend:

Ensure that all dependencies are installed:

```bash
pip install -r python-backend/requirements.txt
```

Verify that the Python server is running on port 5000:

```bash
curl http://localhost:5000/api/health
```
--
Check the Python logs for errors.

Desktop Automation Issues
Ensure that you have the necessary permissions for automation:

On Windows: Run as administrator

On macOS: Grant accessibility permissions

On Linux: Install required dependencies (xdotool, etc.)

Some automation features may be platform-specific.

--
AI Chat Issues
If the AI chat is not working:

Check that the Python backend is running

Verify your OpenAI API key if using OpenAI

Try the fallback mode which uses local models

### user login for perview :
Email : test@example.com
password : password123

----------------------------------------------------------------------------------------------------------------------------

# 🧬 Future Scope:

More Integrations:

Integrations with tools such as Slack, Trello, Google Calendar, and cloud storage (Google Drive, Dropbox).

Security Enhancements:

Implementation of end-to-end encryption, 2FA, role-based access control (RBAC), and audit logs to improve security.

Localization / Accessibility:

Multilingual support and regional customization (local languages, weather, news).

Enhanced accessibility with screen readers, voice recognition, and customizable voice commands.

AI/ML Enhancements:

Context-aware and personalized task predictions, intelligent automation, and more accurate voice recognition.

Offline Mode & Mobile App:

Offline support for key features and mobile applications for iOS and Android to expand accessibility and usability.

----------------------------------------------------------------------------------------------------------------------------------------

# 📎 Resources / Credits
APIs or Datasets Used:

Gmail API / Outlook API – For email summarization and integration with email services.

Google Calendar API – For calendar and scheduling integration

Firebase API - For authentication

Groq API - For AI chat

Open Source Libraries or Tools Referenced:

React.js – For building the user interface.

Next.js (App Router) – For the web framework to manage server-side rendering and routing.

Tailwind CSS – For styling the components and layouts.

ShadCN/UI – For pre-built, reusable UI components.

Framer Motion – For creating smooth animations in the UI.

FastAPI – For building the backend and API endpoints for the assistant.

JWT (JSON Web Tokens) – For secure authentication and session management.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# 🏁 Final Words:

This hackathon was an enriching journey filled with challenges, learning, and rewarding moments. Key challenges included the seamless integration of multiple third-party APIs, ensuring real-time responsiveness for voice commands, and maintaining robust security and privacy for sensitive data. Each obstacle, however, provided valuable learning experiences.

We are immensely proud of the resulting product and are enthusiastic about its potential for future development. The collaborative team dynamic, continuous brainstorming, and mutual support were instrumental to the project's success. We extend our sincere gratitude to everyone involved, including our teammates, the open-source community, and the API providers. The future of AI assistants appears promising, and we are eager to contribute to its evolution through ongoing enhancements and the addition of new features.
