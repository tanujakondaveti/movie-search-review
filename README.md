# Movie Search and Review Application

A full-stack application for searching movies and writing reviews.

## Tech Stack

*   **Frontend:** React + Vite
*   **Backend:** Python + FastAPI
*   **Database:** MongoDB

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js and npm installed
*   Python installed
*   Git installed
*   MongoDB installed and running (or a MongoDB Atlas connection string)

### Installation and Setup

1.  **Clone the Repository**

    First, clone this code into your system:
    ```bash
    git clone <repository-url>
    ```

2.  **Open the Project**

    Open the cloned folder in VS Code.

3.  **Run the Application**

    Open a terminal in VS Code and split it into two terminals (one for frontend, one for backend).

    #### Terminal 1: Frontend Setup

    Navigate to the frontend folder, install dependencies, and start the development server:

    ```bash
    cd frontend
    npm i
    npm run dev
    ```

    > **Note:** Ensure you have created a `.env` file in the `frontend` directory with your necessary environment variables (e.g., `VITE_OMDB_API_KEY`).

    #### Terminal 2: Backend Setup

    Navigate to the backend folder and set up the Python environment:

    1.  Navigate to the backend directory:
        ```powershell
        cd backend
        ```

    2.  Create a virtual environment (replace `"name of venv"` with your preferred name, e.g., `venv`):
        ```powershell
        python -m venv "name of venv"
        ```

    3.  Activate the virtual environment:
        ```powershell
        .\name of venv\Scripts\activate
        ```

    4.  Install dependencies:
        ```powershell
        pip install -r .\requirements.txt
        ```

    5.  Start the server:
        ```powershell
        python .\main.py
        ```
    
    > **Note:** Ensure you have created a `.env` file in the `backend` directory with your MongoDB connection string (`MONGODB_URI`).

## Project Structure

*   `frontend/`: React application code
*   `backend/`: FastAPI application code
