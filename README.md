# 📝 Task Manager: A Secure Full-Stack Web Application

## Overview

Task Manager is a robust full-stack web application that empowers users to securely manage their personal tasks. Built with **FastAPI** (Python) for the backend and **React** for the frontend, it leverages **JWT-based authentication** to ensure that all user data and operations are protected and private.

---

## ✨ Features

* 🔐 **Secure User Authentication**: Seamless user registration and login powered by **JSON Web Tokens (JWT)**.
* 🧾 **Personalized Task Management**: Each user has a dedicated space to manage their tasks, ensuring data privacy.
* ⚙️ **Complete Task CRUD**: Easily **C**reate, **R**ead, **U**pdate, and **D**elete your tasks.
* 📊 **Task Insights**: Gain a quick visual summary of your tasks with an interactive **Pie Chart**.
* ✅ **Protected Routes**: FastAPI's `Depends` system ensures that only authenticated users can access sensitive task management endpoints.
* 🚫 **Automatic Logout**: Users are automatically logged out when their JWT token expires, enhancing security.
* 🚀 **Clean Architecture**: A clear and efficient separation between frontend and backend concerns.

---

## 🚀 Getting Started

Follow these steps to get the Task Manager application up and running on your local machine.

### 🔧 Backend Setup (FastAPI)

The backend handles all API requests, authentication, and database interactions.

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a Python virtual environment to manage dependencies:
    ```bash
    python -m venv venv
    ```
3.  Activate the virtual environment:
    * **On macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```
    * **On Windows:**
        ```bash
        .\venv\Scripts\activate
        ```
4.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
5.  Start the FastAPI development server:
    ```bash
    uvicorn main:app --reload
    ```
    The backend API will be accessible at: [http://localhost:8000](http://localhost:8000)

---

### 💻 Frontend Setup (React)

The frontend provides the user interface for interacting with the Task Manager.

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install the necessary Node.js packages:
    ```bash
    npm install
    ```
3.  Start the React development server:
    ```bash
    npm run dev
    ```
    The frontend application will be available at: [http://localhost:5173](http://localhost:5173)

---

## 🔐 API Endpoints

### Auth Endpoints

| Method | Endpoint    | Description               |
| :----- | :---------- | :------------------------ |
| `POST` | `/register` | Create a new user account |
| `POST` | `/login`    | Log in and receive a JWT  |

### Task Endpoints (JWT Required)

These endpoints require a valid JWT in the `Authorization` header.

| Method   | Endpoint        | Description                |
| :------- | :-------------- | :------------------------- |
| `GET`    | `/tasks/`       | Retrieve all tasks for the authenticated user |
| `POST`   | `/tasks/`       | Create a new task          |
| `PUT`    | `/tasks/{id}/`  | Update an existing task by its ID |
| `DELETE` | `/tasks/{id}/`  | Delete a task by its ID    |

---

## ✅ Functional Validation

The application has been validated against the following key functionalities:

* **User Authentication**: Robust user registration and login mechanisms.
* **JWT-based Security**: Secure authentication with token expiry handling.
* **User-Specific Tasks**: Tasks are strictly segregated and accessible only by their respective owners.
* **Comprehensive CRUD**: All Create, Read, Update, and Delete operations for tasks are fully functional.
* **Token Expiry Handling**: Automatic redirection to the login page upon token expiration.
* **Architectural Clarity**: A clean and well-defined separation between frontend and backend logic.
* **Visual Insights**: Task summaries are effectively presented via a Pie Chart dropdown.

---

## 📦 Future Improvements

We have several exciting enhancements planned for the Task Manager:

* **Token Refresh System**: Implement a mechanism to refresh JWTs seamlessly, improving user experience.
* **Search & Filter**: Add advanced search and filtering capabilities for tasks.
* **Comprehensive Testing**: Integrate `pytest` for backend testing and `React Testing Library` for frontend testing to ensure robust code quality.
* **Deployment Automation**: Prepare for live deployment on platforms like Render or Vercel.
* **Responsive PWA Support**: Enhance the application with Progressive Web App (PWA) features for a better mobile experience.
