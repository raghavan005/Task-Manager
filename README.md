# 📝 Task Manager

A full-stack web application built with **FastAPI** (Python) and **React**, allowing users to register, log in, and manage their personal tasks securely with JWT-based authentication.

---

## 📌 Features

- 🔐 **JWT Authentication** (Login/Register)
- 🧾 **Per-user Task Management**
- ⚙️ **Task CRUD**: Create, Read, Update, Delete
- 📊 **Task Insights**: Visual summary with Pie Chart
- ✅ **Protected Routes** using FastAPI's `Depends`
- 🚫 **Auto Logout on Token Expiry**

---

## 🚀 Getting Started

### 🔧 Backend Setup (FastAPI)

1. Navigate to the backend folder:
   ```bash
   cd backend
Create a virtual environment:

bash
Copy
Edit
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
Install dependencies:

bash
Copy
Edit
pip install -r requirements.txt
Start the FastAPI server:

bash
Copy
Edit
uvicorn main:app --reload
Backend runs at: http://localhost:8000

💻 Frontend Setup (React)
Navigate to the frontend folder:

bash
Copy
Edit
cd frontend
Install packages:

bash
Copy
Edit
npm install
Start the React development server:

bash
Copy
Edit
npm run dev
Frontend runs at: http://localhost:5173

🔐 API Endpoints
✅ Auth
Method	Endpoint	Description
POST	/register	Create a new user
POST	/login	Login and get JWT

📋 Task (JWT Required)
Method	Endpoint	Description
GET	/tasks/	Get tasks for user
POST	/tasks/	Create a new task
PUT	/tasks/{id}/	Update a task
DELETE	/tasks/{id}/	Delete a task

🧪 Functional Validation
✅ User registration & login

✅ JWT-based auth with expiry

✅ Tasks are user-specific

✅ CRUD operations work per user

✅ Token errors auto-redirect to login

✅ Clean separation of frontend/backend

✅ Insights via Pie Chart dropdown

📦 Future Improvements
🔁 Token Refresh system

🔍 Search & filter tasks

🧪 Add tests using pytest / React Testing Library

🌍 Deploy via Render / Vercel

📱 Responsive PWA support

