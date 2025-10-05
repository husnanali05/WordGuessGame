# Environment Variables Setup

## API Configuration

To use the AI word generation features, you need to set up environment variables for the IBM Watson API.

### Backend (Python/Flask)

1. Create a `.env` file in the `wordguess-api/` directory:
```bash
cd wordguess-api
echo "IBM_API_KEY=your_actual_ibm_api_key_here" > .env
```

2. Install python-dotenv if not already installed:
```bash
pip install python-dotenv
```

3. Update `app.py` to load environment variables (add this at the top):
```python
from dotenv import load_dotenv
load_dotenv()
```

### Frontend (React/Vite)

1. Create a `.env` file in the `wordguess-web/` directory:
```bash
cd wordguess-web
echo "VITE_IBM_API_KEY=your_actual_ibm_api_key_here" > .env
```

2. Restart your development server after adding the environment variable.

## Getting Your IBM API Key

1. Go to [IBM Cloud](https://cloud.ibm.com/)
2. Create an account or sign in
3. Navigate to Watson services
4. Create a new Watson Machine Learning service
5. Get your API key from the service credentials

## Fallback Behavior

If the API key is not configured, the application will automatically fall back to predefined word lists, so the game will still work without the AI features.
