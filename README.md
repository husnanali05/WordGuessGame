# Word Guess Game

A pixel-art style word guessing game with unlimited levels, AI-generated words, and leaderboard system.

## Features

- 🎮 **Unlimited Levels**: Progress through increasingly difficult words
- 🤖 **AI Word Generation**: Dynamic word generation using IBM Watson AI
- 🏆 **Leaderboard System**: Track scores and player statistics
- 🎨 **Pixel Art Design**: Retro-style UI with animated backgrounds
- 🚀 **Space Theme**: Animated space background with planets and stars
- 👨‍🚀 **Interactive Character**: Animated astronaut with helmet toggle
- 💡 **Hint System**: Get help when stuck (3 hints per game)
- 📊 **Score Tracking**: Comprehensive scoring system

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Custom pixel-art animations
- Responsive design

### Backend
- Flask (Python)
- SQLite database
- Flask-SQLAlchemy for ORM
- Flask-CORS for cross-origin requests
- IBM Watson AI integration

## Project Structure

```
├── wordguess-web/          # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── public/assets/      # Game assets
│   └── package.json
├── wordguess-api/          # Flask backend
│   ├── app.py             # Main Flask application
│   ├── leaderboard.py     # Leaderboard functionality
│   └── requirements.txt   # Python dependencies
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd word-guess-game
   ```

2. **Setup Backend**
   ```bash
   cd wordguess-api
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python3 app.py
   ```

3. **Setup Frontend**
   ```bash
   cd wordguess-web
   npm install
   npm run dev
   ```

4. **Access the Game**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

## Game Rules

1. **Choose a Topic**: Select from various categories (animals, food, space, etc.)
2. **Guess Letters**: Type letters to reveal the hidden word
3. **Limited Lives**: You have 6 lives (wrong guesses cost a life)
4. **Hints Available**: Use up to 3 hints per game
5. **Level Progression**: Each level adds one more letter to the word
6. **Score Tracking**: Your scores are saved to the leaderboard

## Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

### Backend (Heroku/Railway)
1. Create a new app on your hosting platform
2. Connect your GitHub repository
3. Set environment variables
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.
