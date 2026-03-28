# NUMERIC FORECASTING WEB APPLICATION

A comprehensive web application for numeric forecasting with a modern FastAPI backend and Next.js frontend.

## 🚀 Features

### Backend (FastAPI)
- **Authentication System** - Secure admin authentication
- **Game Management** - Create and manage numeric games
- **Result Processing** - Automated result calculation and storage
- **Admin Dashboard** - Complete administrative interface
- **API Integration** - RESTful APIs for frontend communication
- **Database Support** - SQLAlchemy with PostgreSQL/SQLite

### Frontend (Next.js)
- **Modern UI** - Responsive design with Tailwind CSS
- **Admin Dashboard** - Complete admin management interface
- **Game Interface** - Interactive game pages
- **Charts & Analytics** - Visual representation of game data
- **Results Display** - Comprehensive results viewing
- **Real-time Updates** - Live data synchronization

## 📁 Project Structure

```
NUMERIC-FORECASTING-WEB-APPLICATION/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── db/                # Database configuration
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── main.py           # FastAPI application entry
│   ├── migrations/            # Database migrations
│   ├── scripts/              # Utility scripts
│   └── requirements.txt      # Python dependencies
├── frontend/                  # Next.js Frontend
│   ├── app/
│   │   ├── admin/            # Admin pages
│   │   ├── api/              # API routes
│   │   ├── chart/            # Chart pages
│   │   ├── game/             # Game pages
│   │   └── results/          # Results pages
│   ├── components/           # Reusable components
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API services
│   └── package.json          # Node.js dependencies
└── README.md                 # This file
```

## 🛠️ Installation

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up database**
   ```bash
   # Run migrations
   python scripts/add_columns.py
   
   # Generate demo data (optional)
   python scripts/generate_demo_data.py
   ```

5. **Start the backend server**
   ```bash
   python app/main.py
   ```

   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## 📊 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

### Key API Endpoints

#### Authentication
- `POST /admin/login` - Admin login
- `POST /admin/logout` - Admin logout

#### Games
- `GET /games` - List all games
- `GET /games/{id}` - Get specific game
- `POST /games` - Create new game (admin)

#### Results
- `GET /results` - List all results
- `GET /results/{game_id}` - Get results for specific game

## 🎯 Usage

### Admin Access
1. Navigate to `/admin/login`
2. Use admin credentials to log in
3. Access dashboard at `/admin/dashboard`

### Playing Games
1. Visit `/game` to see available games
2. Click on any game to start playing
3. Submit your predictions

### Viewing Results
1. Go to `/results` to see all game results
2. Visit `/chart` for visual analytics

## 🔧 Configuration

### Backend Configuration
Edit `backend/app/db/database.py` to configure database connection:
```python
DATABASE_URL = "postgresql://user:password@localhost/dbname"
```

### Frontend Configuration
Edit `frontend/services/api.ts` to update API base URL:
```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables
2. Install dependencies on server
3. Run with Gunicorn:
   ```bash
   gunicorn app.main:app --host 0.0.0.0 --port 8000
   ```

### Frontend Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Start production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with complete backend and frontend functionality
  - FastAPI backend with authentication and game management
  - Next.js frontend with admin dashboard and game interface
  - Chart functionality and results display

---

**Built with ❤️ using FastAPI, Next.js, and modern web technologies**
