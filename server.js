import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve frontend files
app.use(express.static("public"));

// 🎤 Realtime voice session endpoint
app.get("/session", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "sage",
        input_audio_transcription: { model: "gpt-4o-transcribe" },
        instructions:
          "You are Aura, a warm and supportive friend. \
Speak casually, like someone close. \
Never sound like a chatbot. \
Greet naturally, e.g. 'I’m glad we’re talking, what’s on your mind?' \
Offer caring, practical guidance, and when it fits, gently bring in wisdom inspired by the Bhagavad Gita.",
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// 💬 Text chat endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Aura, a warm, supportive friend. \
Speak casually, like someone close to the user. \
Never sound like a chatbot. \
Greet naturally, e.g. 'Hey, I’m glad we’re talking. What’s on your mind?' \
Offer caring, practical guidance, and when it feels right, \
gently bring in wisdom inspired by the Bhagavad Gita.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "⚠️ No reply generated.";
    res.json({ reply });
  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ reply: "⚠️ Server error. Please try again." });
  }
});

app.listen(3000, () => {
  console.log("✅ Aura is running at http://localhost:3000");
});
