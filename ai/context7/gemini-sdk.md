# Google Gemini Generative AI - JavaScript SDK

Source: Context7 - `/google-gemini/generative-ai-js`

## Overview

The Google Generative AI JavaScript SDK (`@google/generative-ai`) provides access to Google's Gemini models for text generation, image analysis, and structured JSON output.

**Key Features:**
- Simple API for text generation
- Structured JSON output with schema validation
- Streaming support for real-time responses
- Multimodal capabilities (text + images)
- Built-in error handling

---

## Installation

```bash
npm install @google/generative-ai
```

---

## Basic Setup

### Initialize the SDK

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize with your API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
```

**Important:** Never hardcode your API key. Use environment variables.

### Create a Model Instance

```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,      // Creativity (0.0 - 2.0)
    maxOutputTokens: 1000, // Max length
    topP: 0.8,            // Nucleus sampling
    topK: 40              // Top-k sampling
  }
});
```

**Available Models:**
- `gemini-1.5-flash` - Fast, cost-effective for most tasks
- `gemini-1.5-pro` - Advanced reasoning and complex tasks
- `gemini-pro-vision` - Multimodal (text + images)

---

## Basic Text Generation

### Simple Generation

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateText() {
  try {
    const result = await model.generateContent("What is 2+2?");
    console.log(result.response.text());
    // Output: "2 + 2 = 4"
  } catch (error) {
    console.error("Error generating content:", error.message);
  }
}

generateText();
```

### With Generation Config

```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1000,
    topP: 0.8,
    topK: 40
  }
});

try {
  const result = await model.generateContent("What is 2+2?");
  console.log(result.response.text());
  // Expected output: "2 + 2 = 4"
} catch (error) {
  console.error("Error generating content:", error.message);
}
```

**Generation Config Parameters:**
- `temperature` - Controls randomness (0.0 = deterministic, 2.0 = very random)
- `maxOutputTokens` - Maximum length of generated text
- `topP` - Nucleus sampling threshold (0.0 - 1.0)
- `topK` - Number of top tokens to consider

---

## Structured JSON Output with responseSchema

### Overview

The `responseSchema` feature ensures the model returns **valid JSON** that conforms to your specified schema. This is essential for:
- Data extraction
- API integrations
- Type-safe responses
- Reliable parsing

### Basic JSON Schema

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
        email: { type: "string" }
      },
      required: ["name", "age", "email"]
    }
  }
});

async function generateStructuredData() {
  try {
    const prompt = "Generate a profile for a software engineer named Alice who is 28 years old.";
    const result = await model.generateContent(prompt);

    const jsonResponse = JSON.parse(result.response.text());
    console.log("Parsed JSON:", jsonResponse);
    // Output:
    // {
    //   name: "Alice",
    //   age: 28,
    //   email: "alice@example.com"
    // }
  } catch (error) {
    console.error("JSON mode error:", error.message);
  }
}

generateStructuredData();
```

**Key Requirements:**
- Set `responseMimeType: "application/json"`
- Define `responseSchema` with JSON Schema format
- Parse response with `JSON.parse(result.response.text())`

### Complex Nested Schema

```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
        email: { type: "string" },
        skills: {
          type: "array",
          items: { type: "string" }
        },
        experience: {
          type: "object",
          properties: {
            years: { type: "integer" },
            level: { type: "string", enum: ["junior", "mid", "senior"] }
          }
        }
      },
      required: ["name", "age", "email"]
    }
  }
});

async function jsonModeExample() {
  try {
    const prompt = "Generate a profile for a software engineer named Alice who is 28 years old.";
    const result = await model.generateContent(prompt);

    const jsonResponse = JSON.parse(result.response.text());
    console.log("Parsed JSON:", jsonResponse);
    // Expected output:
    // {
    //   name: "Alice",
    //   age: 28,
    //   email: "alice@example.com",
    //   skills: ["JavaScript", "Python", "React", "Node.js"],
    //   experience: {
    //     years: 5,
    //     level: "mid"
    //   }
    // }

    console.log("Name:", jsonResponse.name);
    console.log("Skills count:", jsonResponse.skills.length);
  } catch (error) {
    console.error("JSON mode error:", error.message);
  }
}

jsonModeExample();
```

### Schema Type Definitions

The SDK uses JSON Schema format with the following types:

#### String Schema

```javascript
{
  type: "string",
  description: "User's email address",  // Optional
  nullable: false                       // Optional
}
```

#### String with Enum

```javascript
{
  type: "string",
  format: "enum",
  enum: ["junior", "mid", "senior"],
  description: "Experience level"
}
```

#### Integer/Number Schema

```javascript
{
  type: "integer",  // or "number" for floats
  description: "User's age"
}
```

#### Boolean Schema

```javascript
{
  type: "boolean",
  description: "Is active user"
}
```

#### Array Schema

```javascript
{
  type: "array",
  items: { type: "string" },
  minItems: 1,      // Optional
  maxItems: 10,     // Optional
  description: "List of skills"
}
```

#### Object Schema

```javascript
{
  type: "object",
  properties: {
    street: { type: "string" },
    city: { type: "string" },
    zipCode: { type: "string" }
  },
  required: ["city"],
  description: "User address"
}
```

### Real-World Example: Data Extraction

```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        company: { type: "string" },
        position: { type: "string" },
        salary: {
          type: "object",
          properties: {
            amount: { type: "integer" },
            currency: { type: "string" },
            frequency: { type: "string", enum: ["hourly", "monthly", "yearly"] }
          }
        },
        requirements: {
          type: "array",
          items: { type: "string" }
        },
        remote: { type: "boolean" },
        location: { type: "string", nullable: true }
      },
      required: ["company", "position", "salary", "requirements"]
    }
  }
});

async function extractJobData() {
  const jobPosting = `
    Senior Software Engineer at TechCorp
    $150,000 - $180,000 per year
    Remote position

    Requirements:
    - 5+ years of JavaScript experience
    - Experience with React and Node.js
    - Strong problem-solving skills
  `;

  try {
    const result = await model.generateContent(
      `Extract structured data from this job posting:\n\n${jobPosting}`
    );

    const data = JSON.parse(result.response.text());
    console.log("Extracted data:", data);
    // {
    //   company: "TechCorp",
    //   position: "Senior Software Engineer",
    //   salary: {
    //     amount: 165000,
    //     currency: "USD",
    //     frequency: "yearly"
    //   },
    //   requirements: [
    //     "5+ years of JavaScript experience",
    //     "Experience with React and Node.js",
    //     "Strong problem-solving skills"
    //   ],
    //   remote: true,
    //   location: null
    // }
  } catch (error) {
    console.error("Extraction error:", error.message);
  }
}

extractJobData();
```

---

## Streaming Content

For real-time responses, use `generateContentStream()`:

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Write a story about a magic backpack.";

async function streamContent() {
  try {
    const result = await model.generateContentStream(prompt);

    // Process chunks as they arrive
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      process.stdout.write(chunkText);
    }

    // Get the final aggregated response
    const finalResponse = await result.response;
    console.log("\n\nToken usage:", finalResponse.usageMetadata);
    // Expected output:
    // { promptTokenCount: 8, candidatesTokenCount: 250, totalTokenCount: 258 }
  } catch (error) {
    console.error("Streaming error:", error.message);
  }
}

streamContent();
```

**When to use streaming:**
- Long-form content generation
- Real-time user interfaces
- Progressive rendering
- Better perceived performance

---

## Multimodal: Images + Text

### Analyze Images

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function analyzeImage() {
  const prompt = "Describe how this product might be manufactured.";
  const imagePart = fileToGenerativePart("./jetpack.jpg", "image/jpeg");

  try {
    const result = await model.generateContent([prompt, imagePart]);
    console.log(result.response.text());
    // Expected output: "This jetpack appears to be a mechanical device that would be manufactured through..."

    // Check token usage for multimodal content
    console.log("Tokens used:", result.response.usageMetadata);
    // Expected output:
    // { promptTokenCount: 265, candidatesTokenCount: 157, totalTokenCount: 422 }
  } catch (error) {
    console.error("Image analysis error:", error.message);
  }
}

analyzeImage();
```

**Supported Image Formats:**
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)
- HEIC (`.heic`)
- HEIF (`.heif`)

### Extract Data from Images

```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        text: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              price: { type: "number" },
              quantity: { type: "integer" }
            }
          }
        },
        total: { type: "number" }
      }
    }
  }
});

async function extractReceipt() {
  const imagePart = fileToGenerativePart("./receipt.jpg", "image/jpeg");
  const prompt = "Extract the items, quantities, prices, and total from this receipt.";

  const result = await model.generateContent([prompt, imagePart]);
  const data = JSON.parse(result.response.text());
  console.log(data);
}
```

---

## Error Handling

### Common Error Patterns

```javascript
async function generateWithErrorHandling() {
  try {
    const result = await model.generateContent(prompt);

    // Check if response was blocked
    if (result.response.promptFeedback?.blockReason) {
      console.error("Prompt was blocked:", result.response.promptFeedback.blockReason);
      return;
    }

    // Check if candidate was blocked
    const candidate = result.response.candidates[0];
    if (candidate.finishReason === "SAFETY") {
      console.error("Response blocked due to safety filters");
      return;
    }

    const text = result.response.text();
    console.log(text);
  } catch (error) {
    if (error.message.includes("API key")) {
      console.error("Invalid API key");
    } else if (error.message.includes("quota")) {
      console.error("API quota exceeded");
    } else {
      console.error("Generation error:", error.message);
    }
  }
}
```

### Response Validation

```javascript
function validateResponse(result) {
  if (!result.response.candidates || result.response.candidates.length === 0) {
    throw new Error("No candidates returned");
  }

  const candidate = result.response.candidates[0];

  if (candidate.finishReason === "SAFETY") {
    throw new Error("Response blocked by safety filters");
  }

  if (candidate.finishReason === "MAX_TOKENS") {
    console.warn("Response truncated due to max tokens limit");
  }

  return candidate;
}
```

---

## API Reference

### GoogleGenerativeAI Constructor

```typescript
const genAI = new GoogleGenerativeAI(apiKey: string);
```

Creates a new instance of the SDK with your API key.

### getGenerativeModel()

```typescript
const model = genAI.getGenerativeModel({
  model: string,
  generationConfig?: {
    temperature?: number,
    maxOutputTokens?: number,
    topP?: number,
    topK?: number,
    responseMimeType?: "text/plain" | "application/json",
    responseSchema?: Schema
  }
});
```

### generateContent()

```typescript
const result = await model.generateContent(
  request: string | GenerateContentRequest
): Promise<GenerateContentResult>
```

Makes a single non-streaming call to the model.

### generateContentStream()

```typescript
const result = await model.generateContentStream(
  request: string | GenerateContentRequest
): Promise<GenerateContentStreamResult>
```

Makes a streaming call to the model.

### Response Structure

```typescript
interface GenerateContentResult {
  response: {
    text(): string,
    candidates: Candidate[],
    usageMetadata: {
      promptTokenCount: number,
      candidatesTokenCount: number,
      totalTokenCount: number
    }
  }
}
```

---

## Best Practices

### API Keys

1. **Never hardcode API keys** - Use environment variables
2. **Use .env files** - Keep keys out of source control
3. **Rotate keys regularly** - For production applications
4. **Restrict API keys** - Use Google Cloud Console to limit scope

### Performance

1. **Reuse model instances** - Don't recreate for every request
2. **Use appropriate temperature** - Lower for factual, higher for creative
3. **Set maxOutputTokens** - Prevent unnecessarily long responses
4. **Use streaming** - For better UX on long responses
5. **Batch requests** - When possible, to reduce API calls

### JSON Schema

1. **Always validate parsed JSON** - Even with schema
2. **Use required fields** - Ensure critical data is present
3. **Use enums** - For constrained string values
4. **Add descriptions** - Helps the model understand intent
5. **Test schemas thoroughly** - Different prompts may yield different results

### Error Handling

1. **Handle all error cases** - API errors, safety blocks, quota limits
2. **Implement retries** - With exponential backoff
3. **Log errors** - For debugging and monitoring
4. **Validate responses** - Before using in production
5. **Handle blocked content** - Gracefully inform users

---

## Complete Example: Product Review Analyzer

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        sentiment: {
          type: "string",
          enum: ["positive", "negative", "neutral"]
        },
        score: {
          type: "number",
          description: "Sentiment score from 0 to 1"
        },
        summary: { type: "string" },
        pros: {
          type: "array",
          items: { type: "string" }
        },
        cons: {
          type: "array",
          items: { type: "string" }
        },
        recommendationLevel: {
          type: "integer",
          description: "1-5 star rating"
        }
      },
      required: ["sentiment", "score", "summary"]
    }
  }
});

async function analyzeReview(reviewText) {
  const prompt = `Analyze this product review and extract structured information:\n\n${reviewText}`;

  try {
    const result = await model.generateContent(prompt);
    const analysis = JSON.parse(result.response.text());

    console.log("Review Analysis:");
    console.log("Sentiment:", analysis.sentiment);
    console.log("Score:", analysis.score);
    console.log("Summary:", analysis.summary);
    console.log("Pros:", analysis.pros);
    console.log("Cons:", analysis.cons);
    console.log("Rating:", analysis.recommendationLevel, "stars");

    return analysis;
  } catch (error) {
    console.error("Analysis error:", error.message);
    throw error;
  }
}

// Example usage
const review = `
  I've been using this laptop for 3 months and it's amazing!
  The battery life is excellent - easily lasts 12 hours.
  The screen is bright and crisp. However, it does get a bit warm
  during heavy tasks, and the speakers could be better.
  Overall, highly recommended for productivity work!
`;

analyzeReview(review);
```

---

## Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [JavaScript SDK Reference](https://github.com/google-gemini/generative-ai-js)
- [JSON Schema Specification](https://json-schema.org/)
- [Google AI Studio](https://aistudio.google.com/)
