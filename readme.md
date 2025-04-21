Job Tracker Application
A web application to help users track their job applications, interview statuses, and deadlines.

Features
User registration and authentication
Add, edit, and delete job applications
Track application status (Applied, Interview, Rejected)
Search and filter jobs
Set and monitor application deadlines
Dark mode support
Installation
Prerequisites
Python 3.8 or higher
pip (Python package manager)
Setup
Clone the repository:
bash
git clone <repository-url>
cd job-tracker
Install required Python packages:
bash
pip install -r requirements.txt
Configure environment variables (optional):
Create a .env file in the project root directory
Add the following configuration variables:
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URI=sqlite:///job_tracker.db
DEBUG=True
Initialize the database:
bash
python -c "from app import app, db; app.app_context().push(); db.create_all()"
Running the Application
Start the Flask server:
bash
python app.py
Open your browser and navigate to:
http://localhost:5000
API Endpoints
Authentication
POST /api/register - Register a new user
POST /api/login - Log in a user
Jobs
GET /api/jobs - Get all jobs (filtered by query parameters)
POST /api/jobs - Create a new job
PUT /api/jobs/<job_id> - Update a job
DELETE /api/jobs/<job_id> - Delete a job
User
GET /api/user - Get current user profile
GET /api/dashboard - Get dashboard statistics
File Structure
job-tracker/
│
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
│
├── index.html              # Login page
├── signup.html             # Sign-up page
├── home.html               # Dashboard page
├── style.css               # CSS styles
└── script.js               # JavaScript for frontend
Technologies Used
Backend:
Flask (Python web framework)
SQLAlchemy (ORM)
JWT for authentication
Frontend:
HTML5
CSS3
JavaScript (vanilla)
License
MIT License

Contact
[Your Name] - [your.email@example.com]

