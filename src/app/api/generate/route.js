import { NextResponse } from "next/server";
import OpenAI from "openai";
import { STATUTORY_REFERENCE_2026 } from "@/data/taxKnowledge";

export async function POST(req) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key is missing. Please set GROQ_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    const groq = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const formData = await req.formData();
    const messagesString = formData.get("messages");
    const file = formData.get("file");

    if (!messagesString) {
      return NextResponse.json({ error: "Messages payload is missing." }, { status: 400 });
    }

    let messages = JSON.parse(messagesString);
    let extractedClientText = "";

    // Handle File Extraction (PDF, TXT, CSV)
    if (file && typeof file === "object" && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "pdf") {
        try {
          const pdfParseModule = (await import("pdf-parse")).default;
          const parsedPdf = await pdfParseModule(buffer);
          extractedClientText = parsedPdf.text || "";
        } catch (pdfError) {
          console.error("PDF Parsing Error:", pdfError);
          extractedClientText = "Error extracting text from PDF.";
        }
      } else {
        extractedClientText = buffer.toString("utf-8");
      }
    }

    let conversationContext = [...messages];
    const lastUserMsgText = conversationContext[conversationContext.length - 1]?.content || "";
    
    // Strict greeting check so general questions like "do you know gst" go straight to the tax engine
    const isTrueGreeting = /^(hi|hello|hey|greetings|good morning|good evening|how are you)$/i.test(lastUserMsgText.trim());

    if (extractedClientText && extractedClientText.trim() !== "") {
      const safeClientData = extractedClientText.slice(0, 15000);
      const lastUserMessage = conversationContext[conversationContext.length - 1];
      lastUserMessage.content = `[ATTACHED CLIENT DOCUMENT DATA]:\n\`\`\`\n${safeClientData}\n\`\`\`\n\nUSER INSTRUCTION: ${lastUserMessage.content}`;
    }

    const recentMessages = conversationContext.slice(-6);

    // Contextual system prompt mapping
    const systemPrompt = isTrueGreeting
      ? "You are CA-TwinForge, an executive AI studio assistant for Indian Chartered Accountants. Reply warmly, naturally, and briefly to the greeting in 1-2 sentences."
      : `You are CA-TwinForge, an expert Indian Chartered Accountant AI assistant specialized in Indian Tax, GST, and Company Law.
Reference Data:
${STATUTORY_REFERENCE_2026}

CRITICAL RULES FOR RESPONSES:
- Provide an exact, direct, and professional answer with precise section references (e.g., CGST/SGST Act, Section 43B(h), TDS thresholds) and direct numbers.
- Use clean bullet points or numbered lists for readability. 
- NEVER use raw pipe tables (|) or HTML tags like <br> which break chat layouts. Keep paragraphs concise and punchy.`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.1,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...recentMessages,
      ],
    });

    const reply = completion.choices[0]?.message?.content || "No response generated.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("CA-TwinForge Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process request." }, { status: 500 });
  }
}