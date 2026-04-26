import { groq, MODELS } from "./client";

export interface Candidate {
  name: string;
  verazScore: number | null;
  confianzaScore: number | null;
  compatibilityPct: number | null;
  guaranteeType: string;
  monthlyIncome: number;
  profileType: string | null;
}

export async function computeCandidateSummary(
  candidates: Candidate[],
  propertyTitle: string
): Promise<string> {
  const list = candidates
    .map(
      (c, i) =>
        `${i + 1}. ${c.name}: Veraz ${c.verazScore ?? "N/A"}, Confianza ${c.confianzaScore ?? "N/A"}/100, Compatibilidad ${c.compatibilityPct ?? "N/A"}%, Garantía ${c.guaranteeType}, Ingresos ARS ${c.monthlyIncome}`
    )
    .join("\n");

  const prompt = `You are a real estate advisor summarizing rental candidates for the property "${propertyTitle}".

Candidates:
${list}

Write a comparative paragraph in Spanish (3-5 sentences) highlighting each candidate's strengths and key differences. Be specific with the numbers. End with a recommendation.`;

  const response = await groq.chat.completions.create({
    model: MODELS.text,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  return response.choices[0].message.content ?? "";
}
