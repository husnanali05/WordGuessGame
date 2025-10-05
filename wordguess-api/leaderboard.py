"""
Leaderboard API endpoints for Words Guess Game
Uses SQLite with SQLAlchemy for persistent score storage
"""

from flask import Blueprint, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import os

# Create blueprint
leaderboard_bp = Blueprint('leaderboard', __name__)

# Database setup
db = SQLAlchemy()

class Score(db.Model):
    """Score model for persistent leaderboard storage"""
    __tablename__ = 'scores'
    
    id = db.Column(db.Integer, primary_key=True)
    player = db.Column(db.String(64), nullable=False, index=True)
    won = db.Column(db.Boolean, nullable=False)
    word = db.Column(db.String(64), nullable=True)
    word_length = db.Column(db.Integer, nullable=False)
    mistakes = db.Column(db.Integer, nullable=False, default=0)
    correct = db.Column(db.Integer, nullable=False, default=0)
    accuracy = db.Column(db.Float, nullable=False, default=0.0)
    duration_ms = db.Column(db.Integer, nullable=False, default=0)
    score = db.Column(db.Integer, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    def to_dict(self):
        """Convert model to dictionary for JSON response"""
        return {
            'id': self.id,
            'player': self.player,
            'won': self.won,
            'word': self.word,
            'word_length': self.word_length,
            'mistakes': self.mistakes,
            'correct': self.correct,
            'accuracy': round(self.accuracy, 1),
            'duration_ms': self.duration_ms,
            'score': self.score,
            'created_at': self.created_at.isoformat()
        }

def compute_score(won, word_length, mistakes, duration_ms, accuracy, level=1):
    """
    Compute score based on game performance
    Formula: base + length_bonus + level_bonus + accuracy_bonus - time_penalty - mistake_penalty
    """
    base = 100 if won else 40
    length_bonus = word_length * 8
    level_bonus = level * 50  # Bonus for higher levels
    accuracy_bonus = int(accuracy)
    time_penalty = min(duration_ms // 1000, 120)  # Max 2 minutes penalty
    mistake_penalty = mistakes * 6
    return max(0, base + length_bonus + level_bonus + accuracy_bonus - time_penalty - mistake_penalty)

@leaderboard_bp.route('/api/score', methods=['POST'])
def submit_score():
    """Submit a new score to the leaderboard"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['player', 'won', 'word_length', 'mistakes', 'correct', 'accuracy', 'duration_ms']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Extract and validate data
        player = str(data['player'])[:64]  # Limit to 64 chars
        won = bool(data['won'])
        word = str(data.get('word', ''))[:64] if data.get('word') else None
        word_length = int(data['word_length'])
        mistakes = int(data['mistakes'])
        correct = int(data['correct'])
        accuracy = float(data['accuracy'])
        duration_ms = int(data['duration_ms'])
        level = int(data.get('level', 1))  # Default to level 1 if not provided
        
        # Compute score server-side
        score = compute_score(won, word_length, mistakes, duration_ms, accuracy, level)
        
        # Create new score record
        new_score = Score(
            player=player,
            won=won,
            word=word,
            word_length=word_length,
            mistakes=mistakes,
            correct=correct,
            accuracy=accuracy,
            duration_ms=duration_ms,
            score=score
        )
        
        # Save to database
        db.session.add(new_score)
        db.session.commit()
        
        return jsonify(new_score.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to save score: {str(e)}'}), 500

@leaderboard_bp.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get top scores for the leaderboard"""
    try:
        limit = min(int(request.args.get('limit', 20)), 100)  # Max 100 results
        
        # Query top scores ordered by score DESC, then by created_at DESC
        scores = Score.query.order_by(
            Score.score.desc(),
            Score.created_at.desc()
        ).limit(limit).all()
        
        return jsonify([score.to_dict() for score in scores])
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch leaderboard: {str(e)}'}), 500

@leaderboard_bp.route('/api/player/<player>/scores', methods=['GET'])
def get_player_scores(player):
    """Get recent scores for a specific player"""
    try:
        limit = min(int(request.args.get('limit', 50)), 100)  # Max 100 results
        
        # Query player's scores ordered by created_at DESC
        scores = Score.query.filter_by(player=player).order_by(
            Score.created_at.desc()
        ).limit(limit).all()
        
        return jsonify([score.to_dict() for score in scores])
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch player scores: {str(e)}'}), 500

def init_db(app):
    """Initialize database with the Flask app"""
    # Configure SQLite database
    db_path = os.path.join(os.path.dirname(__file__), 'wordguess.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database
    db.init_app(app)
    
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
        print(f"Database initialized: {db_path}")
