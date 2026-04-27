import { groq, MODELS } from "./client";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "documents";

function getStorage() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ).storage.from(BUCKET);
}

async function downloadBuffer(storageKey: string): Promise<Buffer | null> {
  const { data, error } = await getStorage().download(storageKey);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

export interface ConfidenceScoreResult {
  score: number;
  dimensions: {
    docQuality: string;
    incomeRatio: string;
    guaranteeStrength: string;
    completeness: string;
  };
  improvement_text: string;
}

interface ProfileData {
  monthlyIncome: number;
  guaranteeType: string;
  profileType: string | null;
  dniImagePath: string | null;
  incomeDocPath: string | null;
}

async function extractPdfText(storageKey: string): Promise<string> {
  const buffer = await downloadBuffer(storageKey);
  if (!buffer) return "No income document provided.";
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdf = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
  const data = await pdf(buffer);
  return data.text.slice(0, 3000);
}

async function analyzeDniImage(storageKey: string): Promise<string> {
  const buffer = await downloadBuffer(storageKey);
  if (!buffer) return "No DNI image provided.";
  const ext = path.extname(storageKey).toLowerCase();
  const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
  const imageData = buffer.toString("base64");

  const response = await groq.chat.completions.create({
    model: MODELS.vision,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${imageData}` },
          },
          {
            type: "text",
            text: "This is an Argentine DNI document. Briefly describe its visual quality and legibility in one sentence. Is the document clear and authentic-looking?",
          },
        ],
      },
    ],
    max_tokens: 150,
  });

  return response.choices[0].message.content ?? "Document analyzed.";
}

export async function computeConfidenceScore(
  profile: ProfileData
): Promise<ConfidenceScoreResult> {
  const hasDoc = Boolean(profile.dniImagePath || profile.incomeDocPath);
  const hasBothDocs = Boolean(profile.dniImagePath && profile.incomeDocPath);

  let dniAnalysis = "No DNI image provided.";
  let incomeText = "No income document provided.";

  if (profile.dniImagePath) {
    dniAnalysis = await analyzeDniImage(profile.dniImagePath);
  }

  if (profile.incomeDocPath) {
    incomeText = await extractPdfText(profile.incomeDocPath);
  }

  const prompt = `You are a rental scoring system for an Argentine real estate platform.

Analyze this tenant profile and return a JSON confidence score.

Profile:
- Monthly income: ARS ${profile.monthlyIncome}
- Guarantee type: ${profile.guaranteeType}
- Employment type: ${profile.profileType ?? "not specified"}
- DNI document analysis: ${dniAnalysis}
- Income document excerpt: ${incomeText}
- Both documents uploaded: ${hasBothDocs}

Return ONLY valid JSON with this exact structure:
{
  "score": <integer 0-100>,
  "dimensions": {
    "docQuality": "<Alta|Media|Baja>",
    "incomeRatio": "<Adecuado|Ajustado|Insuficiente>",
    "guaranteeStrength": "<Fuerte|Moderada|Débil>",
    "completeness": "<Completo|Parcial|Incompleto>"
  },
  "improvement_text": "<1-2 sentences in Spanish with actionable advice>"
}`;

  const response = await groq.chat.completions.create({
    model: MODELS.text,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const raw = response.choices[0].message.content ?? "{}";
  return JSON.parse(raw) as ConfidenceScoreResult;
}
