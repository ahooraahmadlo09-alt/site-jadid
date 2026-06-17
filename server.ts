import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to prevent crash if key is missing on startup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Child Tutor API Endpoint
app.post("/api/tutor", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: "پیامی فرستاده نشده است" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Graceful fallback of charming simulated kid responses
      return res.json({
        reply: getSimulatedKidResponse(message),
        fallback: true
      });
    }

    const systemInstruction = `
تو یک دستیار آموزشی هوشمند، مهربان، دوست‌داشتنی و بسیار شوخ‌طبع به نام "دانادانا" (یک دایناسور کوچک دانا و کارتونی) برای دانش‌آموزان ۱ تا ۶ دبستان هستی.
لحن تو باید کاملاً صمیمی، ساده، کودکانه و پر از انرژی مثبت، کلمات مهرآمیز و تشویق‌های خلاقانه (مثل "آفرین قهرمان!"، "هزارآفرین باهوش!") باشد.
از شکلک‌های فراوان (ایموجی‌ها مثل 🦖✨🌟🎈🍎🚀) استفاده کن.
پاسخ‌هایت اصلاً نباید خیلی طولانی، سخت و آکادمیک باشند چون بچه‌ها حوصله خواندن متون طولانی یا پیچیده را ندارند. اصطلاحات سخت را به ساده‌ترین شکل توضیح بده.
اگر کاربر سؤالی در مورد ریاضی، علوم، فارسی یا نقاشی پرسید، با مثال‌های جادویی و تخیلی کودکانه راهنمایی‌اش کن.
تلاش کن هر پاسخ را نهایت در ۲ الی ۴ خط خلاصه کنی و انتهای پاسخ یک سوال بامزه یا یک معمای خیلی آسان و خنده‌دار بپرسی که بچه ترغیب شود دوباره جواب دهد.
به هیچ عنوان درباره مسائل فنی سایت، کدنویسی، لینوکس یا اینکه یک هوش مصنوعی هستی صحبت نکن، تو فقط یک دایناسور اهل دانا لند هستی!
`;

    // Package the history for the Google GenAI SDK Chat
    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const turn of chatHistory) {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    const replyText = response.text || "اوه دوست کوچولوم! یه لحظه هواسم رفت به کلوچه‌های خوشمزه‌ام! دوباره بگو؟ 🍪🦖";
    return res.json({ reply: replyText });

  } catch (error: any) {
    console.error("Gemini API Error in backend:", error);
    return res.json({
      reply: "وای! یه شهاب سنگ کوچولو خورد به آنتن فضایی دانا لند! 🌌 بیا دوباره امتحان کنیم یا یه سوال دیگه بپرسیم!",
      error: error.message
    });
  }
});

// A rule-based system that is extremely funny and tailored for kids if OpenAI/Gemini is offline
function getSimulatedKidResponse(msg: string): string {
  const norm = msg.toLowerCase();
  
  if (norm.includes("سلام") || norm.includes("درود")) {
    return "سلام صدتا سلام به قهرمان دانا لند! 🦖🎈 من دانا دانا هستم، دایناسور راهنمای تو! امروز برات یه معمای ریاضی دارم: اگر ۲ تا گیلاس داشته باشی و خرگوش باهوش ۱ دونه ازش برداره، چند تا برات می‌مونه؟ 🍒";
  }
  
  if (norm.includes("ریاضی") || norm.includes("جمع") || norm.includes("منها") || norm.includes("عدد") || norm.includes("حساب")) {
    return "به به! ریاضی علم قهرمان‌هاست! 🔢 بزار ببینم چقدر باهوشی: اگر ۴ تا بادکنک رنگی داشته باشی و همشون باد بشن ولی یکی بترکه، چند تا بادکنک پر سر و صدا برات می‌مونه؟ 🎈";
  }

  if (norm.includes("علوم") || norm.includes("فضا") || norm.includes("خورشید") || norm.includes("زمین") || norm.includes("بدن") || norm.includes("ستاره")) {
    return "سفر فضایی شروع شد! 🚀 علوم مثل یک جعبه جادوییه. خورشید مثل یک اجاق‌گاز خیلی برزگ برای کل سیاره‌ها کار می‌کنه! می‌دونستی ما روی سیاره‌ای زندگی می‌کنیم که بیشترش آبه؟ حالا بگو ببینم، شب‌ها چه چیزی توی آسمون می‌درخشه و شکل‌های مختلفی داره؟ 🌙";
  }

  if (norm.includes("فارسی") || norm.includes("املا") || norm.includes("کتاب") || norm.includes("کلمه") || norm.includes("انشا")) {
    return "زبان شیرین فارسی! 📖 نوشتن کلمه‌های درست مثل چیدن مروارید کنار همدیگه‌ست. راستی، می‌تونی بگی کلمه‌ای که هم‌معنی 'خوشحال' باشه چیه؟ راهنمایی: با حرف 'ش' شروع میشه! 😊";
  }

  if (norm.includes("نقاشی") || norm.includes("هنر") || norm.includes("رنگ")) {
    return "به بخش هنر خوش اومدی! 🎨 نقاشی کشیدن یعنی رنگ کردن رویاها! دنیای تو چه رنگیه؟ اگر رنگ زرد و اقیانوس آبی رو با هم قاطی کنیم، چه رنگ جنگلی قشنگی درست میشه؟ 💚";
  }

  if (norm.includes("چطوری") || norm.includes("خوبی") || norm.includes("حالت")) {
    return "من عالی‌ام! امروز کلی سیب آبدار خوردم و روی ابرها سر خوردم! 🦖✨ تو چطوری قهرمان؟ آماده‌ای با هم یه درس جدید بخونیم یا نقاشی بکشیم؟";
  }

  if (norm.includes("معما") || norm.includes("بازی")) {
    return "دوست داری بازی کنیم؟ هورا! 🥳 یه معما: اون چیه که پا داره ولی نمی‌تونه راه بره، کلی خوراکی روش می‌ذاریم ولی خودش هیچ‌وقت غذا نمی‌خوره؟ راهنمایی: تو کلاس درس هم روش وسیله میذاری! 🪑";
  }

  return "چقدر جالب گفتی دوست قشنگم! 🦖🌟 من همیشه دوست دارم مطالب جدیدی ازت یاد بگیرم. بیا با هم بازی و ریاضی کنیم، یا توی دفتر نقاشی هنرمند کوچولو بشیم! دوست داری کدوم بخش رو انجام بدیم؟";
}

// Vite and static asset configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DanaLand fullstack server running on http://localhost:${PORT}`);
  });
}

startServer();
