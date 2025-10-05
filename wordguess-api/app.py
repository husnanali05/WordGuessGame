from flask import Flask, request, jsonify
from flask_cors import CORS
import random, string, requests, os
from leaderboard import leaderboard_bp, init_db

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("python-dotenv not installed. Install with: pip install python-dotenv")

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "https://spacewordsgame.netlify.app",
    "https://wordsspaceguess.netlify.app"
])

# Initialize database and register leaderboard blueprint
init_db(app)
app.register_blueprint(leaderboard_bp)

# Game state storage
GAMES = {}
CURRENT_LEVELS = {}  # Track current level for each game
GAME_TOPICS = {}     # Track topic for each game

# Simple word cache to reduce AI calls
WORD_CACHE = {}

def mask(word, guessed): return " ".join([c if c in guessed else "_" for c in word])
def new_id(n=8): return "".join(random.choice(string.ascii_letters + string.digits) for _ in range(n))

def generate_ai_word(topic, word_length):
    """Generate a word using AI with fallback"""
    # Check cache first
    cache_key = f"{topic}_{word_length}"
    if cache_key in WORD_CACHE and len(WORD_CACHE[cache_key]) > 0:
        cached_words = WORD_CACHE[cache_key]
        word = cached_words.pop(0)  # Remove from cache to avoid reuse
        print(f"Using cached word: {word}")
        return word
    
    try:
        api_key = os.getenv('IBM_API_KEY')
        if not api_key:
            print("IBM_API_KEY not found in environment variables")
            return get_fallback_word(topic, word_length)
        api_url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2024-11-20"
        
        prompt = f"""Generate a {word_length}-letter word about {topic}. Examples: {get_examples(topic, word_length)}. Return only the word."""

        response = requests.post(api_url, 
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model_id': 'ibm/granite-3.3-8b-instruct',
                'input': prompt,
                'parameters': {
                    'max_new_tokens': 5,
                    'temperature': 0.7,
                    'top_p': 0.9
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            generated_text = data.get('results', [{}])[0].get('generated_text', '').strip()
            if generated_text and len(generated_text) == word_length and generated_text.isalpha():
                print(f"AI generated word: {generated_text}")
                return generated_text.upper()
        else:
            print(f"AI API failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"AI generation failed: {e}")
    
    # Fallback to predefined words
    print(f"Using fallback word for {topic} {word_length}-letter")
    return get_fallback_word(topic, word_length)

def pregenerate_words(topic, word_length, count=5):
    """Pre-generate multiple words using AI"""
    cache_key = f"{topic}_{word_length}"
    if cache_key not in WORD_CACHE:
        WORD_CACHE[cache_key] = []
    
    try:
        api_key = os.getenv('IBM_API_KEY')
        if not api_key:
            print("IBM_API_KEY not found in environment variables")
            return get_fallback_word(topic, word_length)
        api_url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2024-11-20"
        
        prompt = f"""Generate {count} different {word_length}-letter words about {topic}. Examples: {get_examples(topic, word_length)}. Return only the words, one per line."""

        response = requests.post(api_url, 
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model_id': 'ibm/granite-3.3-8b-instruct',
                'input': prompt,
                'parameters': {
                    'max_new_tokens': 20,
                    'temperature': 0.7,
                    'top_p': 0.9
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            generated_text = data.get('results', [{}])[0].get('generated_text', '').strip()
            words = [word.strip().upper() for word in generated_text.split('\n') if word.strip()]
            valid_words = [word for word in words if len(word) == word_length and word.isalpha()]
            
            if valid_words:
                WORD_CACHE[cache_key].extend(valid_words)
                print(f"Pre-generated {len(valid_words)} AI words for {topic} {word_length}-letter: {valid_words}")
                return valid_words[0]
        else:
            print(f"AI API failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"AI generation failed: {e}")
    
    # Fallback to predefined words
    fallback_words = []
    for _ in range(count):
        word = get_fallback_word(topic, word_length)
        if word not in fallback_words:
            fallback_words.append(word)
    
    if fallback_words:
        WORD_CACHE[cache_key].extend(fallback_words)
        print(f"Pre-generated {len(fallback_words)} fallback words for {topic} {word_length}-letter: {fallback_words}")
        return fallback_words[0]
    
    return get_fallback_word(topic, word_length)

def get_examples(topic, length):
    examples = {
        "animals": {3: "CAT, DOG, BAT, RAT, COW, PIG, FOX, BEE, ANT, OWL", 4: "BEAR, LION, WOLF, DEER, FISH, BIRD, FROG, GOAT, DUCK, SWAN", 5: "TIGER, EAGLE, SHARK, WHALE, PANDA, KOALA, ZEBRA, HORSE, SHEEP, MOUSE"},
        "food": {3: "PIE, TEA, CAKE, SOUP, BREAD, RICE, MEAT, FISH, MILK, SALT", 4: "PIZZA, PASTA, SALAD, STEAK, CHICKEN, BURGER, SANDWICH, COOKIE", 5: "PIZZA, PASTA, SALAD, STEAK, CHICKEN, BURGER, SANDWICH, COOKIE"},
        "sports": {3: "RUN, GOLF, TENNIS, SOCCER, HOCKEY, BASKETBALL, FOOTBALL, BASEBALL", 4: "GOLF, TENNIS, SOCCER, HOCKEY, BASKETBALL, FOOTBALL, BASEBALL", 5: "TENNIS, SOCCER, HOCKEY, BASKETBALL, FOOTBALL, BASEBALL"},
        "technology": {3: "CPU, RAM, USB, WIFI, APP, WEB, CODE, DATA, FILE, LINK", 4: "CODE, DATA, FILE, LINK, BLOG, WIFI, USB, CPU, RAM, APP", 5: "LAPTOP, MOUSE, KEYBOARD, SCREEN, CAMERA, PHONE, TABLET, ROUTER"},
        "nature": {3: "TREE, FLOWER, GRASS, LEAF, BARK, ROOT, STEM, SEED, BUD, FRUIT", 4: "TREE, FLOWER, GRASS, LEAF, BARK, ROOT, STEM, SEED, BUD, FRUIT", 5: "TREE, FLOWER, GRASS, LEAF, BARK, ROOT, STEM, SEED, BUD, FRUIT"},
        "space": {3: "SUN, MOON, STAR, PLANET, EARTH, MARS, JUPITER, SATURN, NEPTUNE, URANUS", 4: "SUN, MOON, STAR, PLANET, EARTH, MARS, JUPITER, SATURN, NEPTUNE, URANUS", 5: "SUN, MOON, STAR, PLANET, EARTH, MARS, JUPITER, SATURN, NEPTUNE, URANUS"},
        "music": {3: "SONG, BEAT, RHYTHM, MELODY, HARMONY, CHORD, NOTE, SCALE, PIANO, GUITAR", 4: "SONG, BEAT, RHYTHM, MELODY, HARMONY, CHORD, NOTE, SCALE, PIANO, GUITAR", 5: "SONG, BEAT, RHYTHM, MELODY, HARMONY, CHORD, NOTE, SCALE, PIANO, GUITAR"},
        "movies": {3: "FILM, MOVIE, ACTOR, ACTOR, DIRECTOR, PRODUCER, SCREENPLAY, SCRIPT, SCENE, CUT", 4: "FILM, MOVIE, ACTOR, ACTOR, DIRECTOR, PRODUCER, SCREENPLAY, SCRIPT, SCENE, CUT", 5: "FILM, MOVIE, ACTOR, ACTOR, DIRECTOR, PRODUCER, SCREENPLAY, SCRIPT, SCENE, CUT"},
        "science": {3: "ATOM, CELL, GENE, DNA, MOLECULE, ELEMENT, COMPOUND, REACTION, EXPERIMENT, HYPOTHESIS", 4: "ATOM, CELL, GENE, DNA, MOLECULE, ELEMENT, COMPOUND, REACTION, EXPERIMENT, HYPOTHESIS", 5: "ATOM, CELL, GENE, DNA, MOLECULE, ELEMENT, COMPOUND, REACTION, EXPERIMENT, HYPOTHESIS"},
        "travel": {3: "TRIP, JOURNEY, VACATION, HOLIDAY, ADVENTURE, EXPLORE, DISCOVER, VISIT, TOUR, SIGHTSEEING", 4: "TRIP, JOURNEY, VACATION, HOLIDAY, ADVENTURE, EXPLORE, DISCOVER, VISIT, TOUR, SIGHTSEEING", 5: "TRIP, JOURNEY, VACATION, HOLIDAY, ADVENTURE, EXPLORE, DISCOVER, VISIT, TOUR, SIGHTSEEING"}
    }
    return examples.get(topic, {}).get(length, "WORD, GAME, PLAY, FUN, EASY, HARD, GOOD, BEST")

def get_fallback_word_list(topic, length):
    """Get list of all fallback words for a topic and length"""
    fallback_words = {
        "animals": {
            3: ["CAT", "DOG", "BAT", "RAT", "COW", "PIG", "FOX", "BEE", "ANT", "OWL"], 
            4: ["BEAR", "LION", "WOLF", "DEER", "FISH", "BIRD", "FROG", "GOAT", "DUCK", "SWAN"], 
            5: ["TIGER", "EAGLE", "SHARK", "WHALE", "PANDA", "KOALA", "ZEBRA", "HORSE", "SHEEP", "MOUSE"]
        },
        "food": {
            3: ["PIE", "TEA", "HAM", "JAM", "BUN", "EGG", "OAT", "NUT", "FIG", "YAM"],
            4: ["MEAT", "FISH", "RICE", "MILK", "SALT", "SOUP", "CAKE", "TACO", "PEAR", "PLUM"],
            5: ["PIZZA", "PASTA", "SALAD", "STEAK", "BREAD", "APPLE", "LEMON", "MANGO", "PEACH", "MELON"]
        },
        "sports": {
            3: ["RUN", "BOX", "SKI", "ROW", "JOG", "GYM", "WIN", "TIE", "BAT", "NET"],
            4: ["GOLF", "YOGA", "SURF", "DIVE", "RACE", "JUMP", "SWIM", "KICK", "BALL", "PUNT"],
            5: ["RUGBY", "JUDO", "BOXEO", "RELAY", "CHESS", "DARTS", "SKATE", "CYCLE", "WRESTL", "FENCE"]
        },
        "technology": {
            3: ["CPU", "RAM", "USB", "APP", "WEB", "NET"],
            4: ["CODE", "DATA", "FILE", "LINK", "BLOG", "WIFI", "BYTE", "CHIP", "PORT", "DISK"],
            5: ["MOUSE", "CABLE", "PIXEL", "CLOUD", "EMAIL", "LOGIN", "VIRUS", "PROXY", "CACHE", "LINUX"]
        },
        "nature": {
            3: ["SKY", "SUN", "SEA", "OAK", "DEW", "FOG", "MUD", "BAY", "DAM", "IVY"],
            4: ["TREE", "LEAF", "ROOT", "SEED", "SOIL", "MOSS", "WEED", "PINE", "FERN", "VINE"],
            5: ["GRASS", "PLANT", "RIVER", "OCEAN", "MOUNT", "STONE", "CLOUD", "STORM", "FLORA", "FAUNA"]
        },
        "space": {
            3: ["SUN", "ORB", "RAY", "SKY", "UFO", "ION", "GAS", "RED", "DIM", "HOT"],
            4: ["MOON", "STAR", "MARS", "ORBIT", "VOID", "NOVA", "TAIL", "RING", "DUST", "BEAM"],
            5: ["EARTH", "VENUS", "PLUTO", "COMET", "ORBIT", "GALAXY", "NEBULA", "QUARK", "BLACK", "SPACE"]
        },
        "music": {
            3: ["RAP", "POP", "HIP", "JAZ", "DUO", "BAR", "KEY", "BOP", "HIT", "JAM"],
            4: ["SONG", "BEAT", "NOTE", "TUNE", "BASS", "DRUM", "JAZZ", "ROCK", "FUNK", "SOLO"],
            5: ["PIANO", "OPERA", "CHOIR", "VOCAL", "TRACK", "ALBUM", "TEMPO", "SCALE", "CHORD", "MUSIC"]
        },
        "movies": {
            3: ["ACT", "SET", "CUT", "DVD", "CGI", "VFX", "RUN", "HIT", "BIO", "WAR"],
            4: ["FILM", "HERO", "PLOT", "ROLE", "CAST", "SHOT", "CLIP", "REEL", "TAKE", "ZOOM"],
            5: ["ACTOR", "DRAMA", "SCENE", "GENRE", "CAMEO", "TITLE", "FRAME", "AWARD", "DEBUT", "SEQUEL"]
        },
        "science": {
            3: ["DNA", "ION", "LAB", "RAY", "GAS", "ORE", "WAX", "OIL", "AIR", "ICE"],
            4: ["ATOM", "CELL", "GENE", "TEST", "ACID", "BASE", "SALT", "BOND", "MASS", "VOLT"],
            5: ["LASER", "ENERGY", "FORCE", "SPEED", "QUANTUM", "PLASMA", "PHOTON", "PROTON", "ELECTRON", "NEUTR"]
        },
        "travel": {
            3: ["JET", "BUS", "CAR", "MAP", "BAG", "VAN", "SKY", "SEA", "BAY", "ZIP"],
            4: ["TRIP", "TOUR", "VISA", "TAXI", "ROAD", "SHIP", "PORT", "CITY", "ISLE", "LANE"],
            5: ["TRAIN", "HOTEL", "BEACH", "PLANE", "FERRY", "CRUISE", "FLIGHT", "TICKET", "RESORT", "VOYAGE"]
        }
    }
    
    topic_words = fallback_words.get(topic, fallback_words["animals"])
    length_words = topic_words.get(length, topic_words.get(3, ["CAT", "DOG", "BAT"]))
    return length_words

def get_fallback_word(topic, length):
    """Get a random fallback word for a topic and length"""
    words = get_fallback_word_list(topic, length)
    return random.choice(words)

@app.get("/api/health")
def health():
    return {"ok": True}

@app.post("/api/new-game")
def new_game():
    data = request.get_json(silent=True) or {}
    topic = data.get("topic", "animals")
    level = data.get("level", 1)
    
    gid = new_id()
    
    # Generate word based on topic and level
    word_length = 3 + (level - 1)  # Level 1 = 3 letters, Level 2 = 4 letters, etc.
    
    # Try AI generation first, fallback to predefined words
    # Pre-generate words to reduce AI calls
    if len(WORD_CACHE.get(f"{topic}_{word_length}", [])) < 2:
        pregenerate_words(topic, word_length, 5)
    selected_word = generate_ai_word(topic, word_length)
    
    GAMES[gid] = {
        "word": selected_word, 
        "guessed": [], 
        "lives": 6, 
        "status": "playing",
        "level": level,
        "topic": topic
    }
    CURRENT_LEVELS[gid] = level
    GAME_TOPICS[gid] = topic
    
    g = GAMES[gid]
    return jsonify({
        "game_id": gid, 
        "masked": mask(g["word"], g["guessed"]), 
        "lives": g["lives"], 
        "status": g["status"], 
        "guessed": g["guessed"],
        "level": level,
        "topic": topic,
        "word_length": word_length
    })

@app.post("/api/guess")
def guess():
    data = request.get_json(silent=True) or {}
    gid = data.get("game_id"); letter = (data.get("letter") or "").upper()[:1]
    if not gid or gid not in GAMES: return jsonify({"error": "game_not_found"}), 404
    if not letter.isalpha(): return jsonify({"error": "invalid_letter"}), 400

    g = GAMES[gid]
    if g["status"] != "playing":
        return jsonify({"error": "game_over", "status": g["status"]}), 400

    if letter not in g["guessed"]:
        g["guessed"].append(letter)
        if letter not in g["word"]:
            g["lives"] -= 1

    masked_now = mask(g["word"], g["guessed"])

    # Determine end state
    if "_" not in masked_now.replace(" ", ""):
        g["status"] = "won"
    elif g["lives"] <= 0:
        g["status"] = "lost"

    # Send the real answer ONLY when the game is over
    answer = g["word"] if g["status"] in ("won", "lost") else None

    return jsonify({
        "game_id": gid,
        "masked": masked_now,
        "lives": g["lives"],
        "status": g["status"],
        "guessed": g["guessed"],
        "answer": answer,
        "level": g.get("level", 1),
        "topic": g.get("topic", "animals")
    })

@app.post("/api/hint")
def get_hint():
    data = request.get_json(silent=True) or {}
    gid = data.get("game_id")
    
    if not gid or gid not in GAMES:
        return jsonify({"error": "game_not_found"}), 404
    
    g = GAMES[gid]
    word = g["word"]
    guessed = g["guessed"]
    
    # Find unrevealed letters
    unrevealed_positions = []
    for i, letter in enumerate(word):
        if letter not in guessed:
            unrevealed_positions.append(i)
    
    if not unrevealed_positions:
        return jsonify({"error": "all_letters_revealed"}), 400
    
    # Pick a random unrevealed letter
    import random
    reveal_index = random.choice(unrevealed_positions)
    reveal_letter = word[reveal_index]
    
    # Add to guessed letters
    if reveal_letter not in guessed:
        g["guessed"].append(reveal_letter)
    
    # Create new masked word
    new_masked = mask(word, g["guessed"])
    
    return jsonify({
        "game_id": gid,
        "masked": new_masked,
        "revealed_letter": reveal_letter,
        "revealed_position": reveal_index,
        "guessed": g["guessed"],
        "lives": g["lives"],
        "status": g["status"]
    })

@app.post("/api/next-level")
def next_level():
    data = request.get_json(silent=True) or {}
    gid = data.get("game_id")
    
    if not gid or gid not in GAMES:
        return jsonify({"error": "game_not_found"}), 404
    
    current_level = CURRENT_LEVELS.get(gid, 1)
    topic = GAME_TOPICS.get(gid, "animals")
    next_level_num = current_level + 1
    
    # Update level tracking
    CURRENT_LEVELS[gid] = next_level_num
    
    # Generate new word for next level
    word_length = 3 + (next_level_num - 1)
    
    # Try AI generation first, fallback to predefined words
    new_word = generate_ai_word(topic, word_length)
    
    # Update game state for next level
    GAMES[gid] = {
        "word": new_word,
        "guessed": [],
        "lives": 6,
        "status": "playing",
        "level": next_level_num,
        "topic": topic
    }
    
    g = GAMES[gid]
    return jsonify({
        "game_id": gid,
        "masked": mask(g["word"], g["guessed"]),
        "lives": g["lives"],
        "status": g["status"],
        "guessed": g["guessed"],
        "level": next_level_num,
        "topic": topic,
        "word_length": word_length
    })

if __name__ == "__main__":
    print("Starting Flask on http://127.0.0.1:5001 …")
    app.run(host="127.0.0.1", port=5001, debug=True)
