/**
 * AI Word Generator Service using IBM Granite
 * Generates words based on topic and difficulty level
 */

const IBM_API_KEY = import.meta.env.VITE_IBM_API_KEY;
const IBM_API_URL = "https://api.ibm.com/watsonx/v1/generate";

export class AIWordGenerator {
  static async generateWord(topic, level) {
    const wordLength = 3 + (level - 1); // Level 1 = 3 letters, Level 2 = 4 letters, etc.
    
    const prompt = `Generate a single ${wordLength}-letter word related to the topic "${topic}". 
    Requirements:
    - Exactly ${wordLength} letters long
    - Common English word
    - Related to the topic "${topic}"
    - No proper nouns (names, places, brands)
    - No spaces or special characters
    - Return only the word, nothing else
    
    Examples for ${wordLength}-letter words about ${topic}:
    ${this.getExamples(topic, wordLength)}`;

    try {
      if (!IBM_API_KEY) {
        console.warn('IBM_API_KEY not found in environment variables');
        return this.getFallbackWord(topic, wordLength);
      }
      
      const response = await fetch(IBM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${IBM_API_KEY}`
        },
        body: JSON.stringify({
          model: "ibm-granite/granite-3.3-8b-instruct",
          prompt: prompt,
          max_tokens: 10,
          temperature: 0.7,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`IBM API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedWord = data.choices?.[0]?.text?.trim().toUpperCase();
      
      if (!generatedWord || generatedWord.length !== wordLength) {
        // Fallback to predefined words if AI fails
        return this.getFallbackWord(topic, wordLength);
      }

      return generatedWord;
    } catch (error) {
      console.error('AI word generation failed:', error);
      // Fallback to predefined words
      return this.getFallbackWord(topic, wordLength);
    }
  }

  static getExamples(topic, length) {
    const examples = {
      animals: {
        3: "CAT, DOG, BAT, RAT, COW, PIG, FOX, BEE, ANT, OWL",
        4: "BEAR, LION, WOLF, DEER, FISH, BIRD, FROG, GOAT, DUCK, SWAN",
        5: "TIGER, EAGLE, SHARK, WHALE, PANDA, KOALA, ZEBRA, HORSE, SHEEP, MOUSE",
        6: "RABBIT, TURTLE, SPIDER, MONKEY, DOLPHIN, PENGUIN, GIRAFFE, ELEPHANT"
      },
      food: {
        3: "PIE, TEA, CAKE, SOUP, BREAD, RICE, MEAT, FISH, MILK, SALT",
        4: "PIZZA, PASTA, SOUP, CAKE, MEAT, FISH, RICE, BREAD, MILK, SALT",
        5: "PIZZA, PASTA, SALAD, STEAK, CHICKEN, BURGER, SANDWICH, COOKIE",
        6: "BURGER, SANDWICH, COOKIE, DONUT, WAFFLE, PANCAKE, SPAGHETTI"
      },
      sports: {
        3: "RUN, GOLF, TENNIS, SOCCER, HOCKEY, BASKETBALL, FOOTBALL, BASEBALL",
        4: "GOLF, TENNIS, SOCCER, HOCKEY, BASKETBALL, FOOTBALL, BASEBALL",
        5: "TENNIS, SOCCER, HOCKEY, BASKETBALL, FOOTBALL, BASEBALL",
        6: "TENNIS, SOCCER, HOCKEY, BASKETBALL, FOOTBALL, BASEBALL"
      }
    };

    return examples[topic]?.[length] || "WORD, GAME, PLAY, FUN, EASY, HARD, GOOD, BEST";
  }

  static getFallbackWord(topic, length) {
    const fallbackWords = {
      animals: {
        3: ["CAT", "DOG", "BAT", "RAT", "COW", "PIG", "FOX", "BEE", "ANT", "OWL"],
        4: ["BEAR", "LION", "WOLF", "DEER", "FISH", "BIRD", "FROG", "GOAT", "DUCK", "SWAN"],
        5: ["TIGER", "EAGLE", "SHARK", "WHALE", "PANDA", "KOALA", "ZEBRA", "HORSE", "SHEEP", "MOUSE"],
        6: ["RABBIT", "TURTLE", "SPIDER", "MONKEY", "DOLPHIN", "PENGUIN", "GIRAFFE", "ELEPHANT"]
      },
      food: {
        3: ["PIE", "TEA", "CAKE", "SOUP", "BREAD", "RICE", "MEAT", "FISH", "MILK", "SALT"],
        4: ["PIZZA", "PASTA", "SOUP", "CAKE", "MEAT", "FISH", "RICE", "BREAD", "MILK", "SALT"],
        5: ["PIZZA", "PASTA", "SALAD", "STEAK", "CHICKEN", "BURGER", "SANDWICH", "COOKIE"],
        6: ["BURGER", "SANDWICH", "COOKIE", "DONUT", "WAFFLE", "PANCAKE", "SPAGHETTI"]
      },
      sports: {
        3: ["RUN", "GOLF", "TENNIS", "SOCCER", "HOCKEY", "BASKETBALL", "FOOTBALL", "BASEBALL"],
        4: ["GOLF", "TENNIS", "SOCCER", "HOCKEY", "BASKETBALL", "FOOTBALL", "BASEBALL"],
        5: ["TENNIS", "SOCCER", "HOCKEY", "BASKETBALL", "FOOTBALL", "BASEBALL"],
        6: ["TENNIS", "SOCCER", "HOCKEY", "BASKETBALL", "FOOTBALL", "BASEBALL"]
      },
      technology: {
        3: ["CPU", "RAM", "USB", "WIFI", "APP", "WEB", "CODE", "DATA", "FILE", "LINK"],
        4: ["CODE", "DATA", "FILE", "LINK", "BLOG", "WIFI", "USB", "CPU", "RAM", "APP"],
        5: ["LAPTOP", "MOUSE", "KEYBOARD", "SCREEN", "CAMERA", "PHONE", "TABLET", "ROUTER"],
        6: ["LAPTOP", "MOUSE", "KEYBOARD", "SCREEN", "CAMERA", "PHONE", "TABLET", "ROUTER"]
      },
      nature: {
        3: ["TREE", "FLOWER", "GRASS", "LEAF", "BARK", "ROOT", "STEM", "SEED", "BUD", "FRUIT"],
        4: ["TREE", "FLOWER", "GRASS", "LEAF", "BARK", "ROOT", "STEM", "SEED", "BUD", "FRUIT"],
        5: ["TREE", "FLOWER", "GRASS", "LEAF", "BARK", "ROOT", "STEM", "SEED", "BUD", "FRUIT"],
        6: ["TREE", "FLOWER", "GRASS", "LEAF", "BARK", "ROOT", "STEM", "SEED", "BUD", "FRUIT"]
      }
    };

    const topicWords = fallbackWords[topic] || fallbackWords.animals;
    const lengthWords = topicWords[length] || topicWords[3];
    return lengthWords[Math.floor(Math.random() * lengthWords.length)];
  }
}
