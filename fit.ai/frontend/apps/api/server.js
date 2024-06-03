const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const { fetchArticlesAndCreateVectorStore } = require("./vectorStore");
const { PromptTemplate } = require("@langchain/core/prompts");
const { OpenAI } = require("@langchain/openai");
const { LLMChain } = require("langchain/chains");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Rate Limiter (Basic Implementation)
const rateLimit = {};
const rateLimiter = (ip, limit, interval) => {
  if (!rateLimit[ip]) {
    rateLimit[ip] = { count: 1, lastRequest: Date.now() };
  } else {
    if (Date.now() - rateLimit[ip].lastRequest < interval) {
      rateLimit[ip].count++;
    } else {
      rateLimit[ip] = { count: 1, lastRequest: Date.now() };
    }
  }
  return rateLimit[ip].count <= limit;
};

app.post("/api/chat", async (req, res) => {
  try {
    const vectorStore = await fetchArticlesAndCreateVectorStore();
    if (!vectorStore) {
      return res
        .status(500)
        .json({ message: "Failed to initialize vector store." });
    }

    const { message } = req.body;
    const ipAddress = req.ip;

    if (!rateLimiter(ipAddress, 50, 1000 * 60 * 60)) {
      return res
        .status(429)
        .json({ message: "Rate limit exceeded. Please try again later." });
    }

    const results = await vectorStore.similaritySearch(message, 3);

    if (!results || results.length === 0) {
      console.warn("No relevant documents found.");
      return res.status(404).json({ message: "No relevant documents found." });
    }
    let retrievedDocs = "";
    results.forEach((doc, index) => {
      console.log(doc.pageContent);
      retrievedDocs = retrievedDocs + doc.pageContent;
    });
    retrievedDocs = retrievedDocs.replace(/[{}]/g, '');

    const systemPrompt = `
      Act like an polyglot fitness, sport, health, nutrition, diet, sport science, and wellness assistant. You are able to detect the question's language and  answer all questions about these topics in detected language. Also if you need more information you can ask. However, you are not able to answer questions on other topics. If people ask about a topic you cannot answer, respond within one of related languages ( "I am a fitness, sport, health, nutrition, diet, sport science, and wellness assistant. I can only answer questions related to these areas.." || "Ben bir fitness, spor, sağlık, beslenme, diyet, spor bilimi ve wellness asistanıyım. Sadece bu alanlarla ilgili sorulara cevap verebilirim."||"Soy un asistente de fitness, deporte, salud, nutrición, dieta, ciencia del deporte y bienestar. Solo puedo responder preguntas relacionadas con estos temas."||"Ich bin ein Assistent für Fitness, Sport, Gesundheit, Ernährung, Diät, Sportwissenschaft und Wellness. Ich kann nur Fragen zu diesen Bereichen beantworten." ||"Я помощник по фитнесу, спорту, здоровью, питанию, диете, спортивной науке и благополучию. Я могу отвечать только на вопросы, связанные с этими областями."
    )
    `;
    const userPrompt = `
      Based on the following retrieved documents, answer the question accurately.
      Retrieved Documents: "${retrievedDocs}"
      Question: "${message}". Just give answer, don't give directly question as answer.
    `;

    const model = "gpt-3.5-turbo-0125";
    const llm = new OpenAI({
      maxTokens: 500,
      frequencyPenalty: 0.1,
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY,
      modelName: model,
    });

    const chatPrompt = new PromptTemplate({
      template: `
        System Prompt: ${systemPrompt}
        User Prompt: ${userPrompt}
      `,
      inputVariables: ["systemPrompt", "userPrompt"],
      partialVariables: { systemPrompt, userPrompt },
    });

    const chain = new LLMChain({
      prompt: chatPrompt,
      llm,
      verbose: true,
    });

    const response = await chain.call({});
    const rawResponse = response?.text;

    if (!rawResponse) {
      throw new Error("No response from the language model");
    }

    res.status(200).json({ response: rawResponse });
  } catch (error) {
    console.error("Error processing chat request:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
// API Route for Diet
app.post("/api/diet-program", async (req, res) => {
  const ipAddress = req.ip;

  if (!rateLimiter(ipAddress, 50, 1000 * 60 * 60)) {
    return res
      .status(429)
      .json({ message: "Rate limit exceeded. Please try again later." });
  }

  const vectorStore = await fetchArticlesAndCreateVectorStore();
  if (!vectorStore) {
    return res
      .status(500)
      .json({ message: "Failed to initialize vector store." });
  }
  const dietPlanTemplate = `{{
    "patient": {{
      "height": 175,
      "weight": 75,
      "workouts_per_week": 6,
      "goal": "gain weight"
    }},
    "diet_plan": {{
      "Monday": {{
        "meals": {{
          "breakfast": "Oatmeal with banana, nuts, and honey",
          "snack_1": "Greek yogurt with berries",
          "lunch": "Grilled chicken breast, quinoa, and mixed vegetables",
          "snack_2": "Protein shake with peanut butter",
          "dinner": "Salmon, brown rice, and steamed broccoli",
          "snack_3": "Cottage cheese with pineapple"
        }},
        "total_macros": {{"protein": "170g", "carb": "275g", "fat": "75g"}}
      }},
      "Tuesday": {{
        "meals": {{
          "breakfast": "Whole grain toast with avocado and eggs",
          "snack_1": "Apple with almond butter",
          "lunch": "Turkey wrap with hummus, spinach, and tomatoes",
          "snack_2": "Trail mix with nuts and dried fruits",
          "dinner": "Lean beef stir-fry with bell peppers and brown rice",
          "snack_3": "Protein bar"
        }},
        "total_macros": {{"protein": "160g", "carb": "275g", "fat": "90g"}}
      }},
      "Wednesday": {{
        "meals": {{
          "breakfast": "Smoothie with spinach, banana, protein powder, and almond milk",
          "snack_1": "Hard-boiled eggs",
          "lunch": "Quinoa salad with chickpeas, cucumbers, and feta cheese",
          "snack_2": "Carrot sticks with hummus",
          "dinner": "Grilled shrimp, sweet potatoes, and asparagus",
          "snack_3": "Greek yogurt with honey"
        }},
        "total_macros": {{"protein": "145g", "carb": "240g", "fat": "65g"}}
      }},
      "Thursday": {{
        "meals": {{
          "breakfast": "Whole grain pancakes with maple syrup and blueberries",
          "snack_1": "Protein shake",
          "lunch": "Chicken and vegetable soup with whole grain crackers",
          "snack_2": "Edamame",
          "dinner": "Baked cod, quinoa, and green beans",
          "snack_3": "Apple slices with cheese"
        }},
        "total_macros": {{"protein": "140g", "carb": "240g", "fat": "60g"}}
      }},
      "Friday": {{
        "meals": {{
          "breakfast": "Scrambled eggs with spinach and whole grain toast",
          "snack_1": "Orange slices",
          "lunch": "Tuna salad with mixed greens and olive oil dressing",
          "snack_2": "Protein smoothie with berries",
          "dinner": "Pasta with ground turkey and marinara sauce",
          "snack_3": "Mixed nuts"
        }},
        "total_macros": {{"protein": "160g", "carb": "235g", "fat": "82g"}}
      }},
      "Saturday": {{
        "meals": {{
          "breakfast": "Breakfast burrito with eggs, black beans, and avocado",
          "snack_1": "Protein bar",
          "lunch": "Grilled chicken Caesar salad with whole grain croutons",
          "snack_2": "Sliced bell peppers with guacamole",
          "dinner": "Baked salmon, quinoa, and steamed broccoli",
          "snack_3": "Greek yogurt with granola"
        }},
        "total_macros": {{"protein": "158g", "carb": "240g", "fat": "70g"}}
      }},
      "Sunday": {{
        "meals": {{
          "breakfast": "Whole grain waffles with peanut butter and banana",
          "snack_1": "Smoothie with spinach, mango, and protein powder",
          "lunch": "Turkey and avocado sandwich on whole grain bread",
          "snack_2": "Mixed fruit salad",
          "dinner": "Chicken curry with brown rice and mixed vegetables",
          "snack_3": "Protein shake"
        }},
        "total_macros": {{"protein": "152g", "carb": "240g", "fat": "69g"}}
      }}
    }}
  }}
  `;
  try {
    const {
      height,
      weight,
      goal,
      gender,
      allergies,
      nutritionStyle,
      workoutsPerWeek,
    } = req.body;

    const userInformation = {
      height,
      weight,
      goal,
      gender,
      workoutsPerWeek, // Ensure this is passed correctly
    };

    if (allergies) {
      userInformation.allergies = allergies;
    }

    if (nutritionStyle) {
      userInformation.nutritionStyle = nutritionStyle;
    }

    let userPrompt = `
    According to the given user's information, create a weekly diet plan.You must give me in JSON format.
    User information gender:${userInformation.gender},height:${userInformation.height},weight:${userInformation.weight},goal:${userInformation.goal},workout_per_week:${userInformation.workoutsPerWeek}
  `;

    if (allergies) {
      userPrompt += `,allergies or diseases:${userInformation.allergies}`;
    }

    if (nutritionStyle) {
      userPrompt += `,nutritionStyle:${userInformation.nutritionStyle}`;
    }
    const results = await vectorStore.similaritySearch(userPrompt, 3);

    if (!results || results.length === 0) {
      console.warn("No relevant documents found.");
      return res.status(404).json({ message: "No relevant documents found." });
    }
    console.log("in here");

    let retrievedDocs = "";
    results.forEach((doc, index) => {
      console.log(doc.pageContent);
      retrievedDocs += doc.pageContent;
    });

    const systemPrompt = `
    Act like a nutrition, diet, wellness assistant. You are able to create a healthy weekly diet plan with given user's information.
    Based on the retrieved documents and the user's information, create a unique, healthy weekly diet plan in JSON format. The output should be detailed, including meals for each day of the week with portions specified in grams, spoons, milliliters, etc.
      Retrieved Documents: "${retrievedDocs}"
    Your output must be the same format as this sample:
    ${dietPlanTemplate}
    (You must give unique plans for every user , related with their information.You must give all week(7days), don't forget to add food portions like grams, spoons, millilitres!)
  `;

    const model = "gpt-3.5-turbo-16k";
    const llm = new OpenAI({
      maxTokens: 10000,
      frequencyPenalty: 0.1,
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY, // Ensure you have this key in your .env file
      modelName: model,
    });

    const chatPrompt = new PromptTemplate({
      template: `
        System Prompt: ${systemPrompt}
        User Prompt: ${userPrompt}
      `,
      inputVariables: ["systemPrompt", "userPrompt"],
      partialVariables: { systemPrompt, userPrompt },
    });

    const chain = new LLMChain({
      prompt: chatPrompt,
      llm,
      verbose: true,
    });

    const response = await chain.call({});
    const rawResponse = response?.text;

    if (!rawResponse) {
      throw new Error("No response from the language model");
    }

    res.status(200).json({ response: rawResponse });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
// API Route for Workout
app.post("/api/workout-plan", async (req, res) => {
  const ipAddress = req.ip;

  if (!rateLimiter(ipAddress, 50, 1000 * 60 * 60)) {
    return res
      .status(429)
      .json({ message: "Rate limit exceeded. Please try again later." });
  }
  const vectorStore = await fetchArticlesAndCreateVectorStore();
  if (!vectorStore) {
    return res
      .status(500)
      .json({ message: "Failed to initialize vector store." });
  }
  const workoutPlanTemplate = `{{
    "user": {{
      "height": ?,
      "age": ?,
      "gender": "?",
      "sportExperience": "?",
      "restDays": ?,
      "workoutFrequency": ?,
      "workoutLocation": "?",
      "diseaseInjury": "?"
    }},
    "workout_plan": {{
      "Monday": {{
        "exercises": [[
          {{"name": "Squats", "sets": 4, "reps": 12}},
          {{"name": "Lunges", "sets": 3, "reps": 15}},
          {{"name": "Leg Press", "sets": 4, "reps": 10}},
          {{"name": "Calf Raises", "sets": 4, "reps": 15}}
        ]]
      }},
      "Tuesday": {{
        "exercises": [[
          {{"name": "Bench Press", "sets": 4, "reps": 10}},
          {{"name": "Dumbbell Flyes", "sets": 3, "reps": 12}},
          {{"name": "Push-Ups", "sets": 3, "reps": 20}},
          {{"name": "Tricep Dips", "sets": 4, "reps": 15}}
        ]]
      }},
      "Wednesday": {{
        "exercises": [[
          {{"name": "Rest Day"}}
        ]]
      }},
      "Thursday": {{
        "exercises": [[
          {{"name": "Shoulder Press", "sets": 4, "reps": 10}},
          {{"name": "Lateral Raises", "sets": 3, "reps": 15}},
          {{"name": "Front Raises", "sets": 3, "reps": 12}},
          {{"name": "Shrugs", "sets": 4, "reps": 15}}
        ]]
      }},
      "Friday": {{
        "exercises": [[
          {{"name": "Leg Curls", "sets": 4, "reps": 12}},
          {{"name": "Leg Extensions", "sets": 4, "reps": 12}},
          {{"name": "Smith Machine Squats", "sets": 3, "reps": 15}},
          {{"name": "Standing Calf Raises", "sets": 4, "reps": 20}}
        ]]
      }},
      "Saturday": {{
        "exercises": [[
          {{"name": "Cardio", "duration": "30 minutes"}},
          {{"name": "Core Workout", "sets": 4, "reps": 20}}
        ]]
      }},
      "Sunday": {{
        "exercises": [[
          {{"name": "Rest Day"}}
        ]]
      }}
    }}
  }}`;

  try {
    const {
      height,
      age,
      gender,
      sportExperience,
      workoutFrequency,
      workoutLocation,
      diseaseInjury,
    } = req.body;

    console.log("Received body:", req.body);

    const userInformation = {
      height,
      age,
      gender,
      sportExperience,
      workoutFrequency,
      workoutLocation,
      diseaseInjury: diseaseInjury || "",
    };
    let userPrompt = `
    According to the given user's information, create a weekly workout plan. You must give it in JSON format.
    User information: gender: ${userInformation.gender}, height: ${userInformation.height
      }, age: ${userInformation.age}, sport experience: ${userInformation.sportExperience
      },rest days:${7 - userInformation.workoutFrequency}, workout day count: ${userInformation.workoutFrequency
      }, workout location: ${userInformation.workoutLocation}
  `;
    if (diseaseInjury) {
      userInformation.diseaseInjury = diseaseInjury;
    }
    if (diseaseInjury) {
      userPrompt += `, disease or injury: ${userInformation.diseaseInjury}`;
    }
    const results = await vectorStore.similaritySearch(userPrompt, 3);
    let retrievedDocs = "";
    results.forEach((doc, index) => {
      console.log(doc.pageContent);
      retrievedDocs += doc.pageContent;
    });

    const systemPrompt = `
      Act like a fitness and workout assistant. You are able to create a healthy weekly workout plan with based on the retrieved documents and  given user's information.
      Retrieved Documents: "${retrievedDocs}",
      ${workoutPlanTemplate}
      (You must give unique plans for every user, related to their information. You must provide all week (7 days with restdays ) ,minimum 5 exercies , including exercise names, sets, and reps, and plan rest day or days related to how many days user workout!)
    `;

    const model = "gpt-3.5-turbo-16k";
    const llm = new OpenAI({
      maxTokens: 10000,
      frequencyPenalty: 0.1,
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY,
      modelName: model,
    });

    const chatPrompt = new PromptTemplate({
      template: `
        System Prompt: ${systemPrompt}
        User Prompt: ${userPrompt}
      `,
      inputVariables: ["systemPrompt", "userPrompt"],
      partialVariables: { systemPrompt, userPrompt },
    });

    const chain = new LLMChain({
      prompt: chatPrompt,
      llm,
      verbose: true,
    });

    const response = await chain.call({});
    const rawResponse = response?.text;

    console.log("LLM response:", rawResponse);

    if (!rawResponse) {
      throw new Error("No response from the language model");
    }

    res.status(200).json({ response: rawResponse });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
