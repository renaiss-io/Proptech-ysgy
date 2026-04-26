import { groq, MODELS } from "./client";

export interface CompatibilityResult {
  compatibility_pct: number;
  explanation: string;
}

interface TenantData {
  monthlyIncome: number;
  guaranteeType: string;
  profileType: string | null;
  hasPets: boolean;
  isSmoker: boolean;
  familySize: number | null;
  verazScore: number | null;
  confianzaScore: number | null;
}

interface PropertyData {
  title: string;
  price: number;
  neighborhood: string | null;
  propertyType: string;
  bedrooms: number;
  area: number;
}

export async function computeCompatibility(
  tenant: TenantData,
  property: PropertyData
): Promise<CompatibilityResult> {
  const prompt = `You are a rental compatibility engine for an Argentine real estate platform.

Tenant profile:
- Monthly income: ARS ${tenant.monthlyIncome}
- Rent price: ARS ${property.price}
- Income/rent ratio: ${(tenant.monthlyIncome / property.price).toFixed(1)}x
- Guarantee: ${tenant.guaranteeType}
- Employment: ${tenant.profileType ?? "no especificado"}
- Pets: ${tenant.hasPets ? "sí" : "no"}
- Smoker: ${tenant.isSmoker ? "sí" : "no"}
- Family size: ${tenant.familySize ?? 1}
- Veraz score: ${tenant.verazScore ?? "not checked"}
- Confianza score: ${tenant.confianzaScore ?? "not computed"}

Property:
- ${property.title} — ${property.neighborhood ?? "Buenos Aires"}
- Type: ${property.propertyType}, ${property.bedrooms} bedrooms, ${property.area}m²
- Monthly rent: ARS ${property.price}

Return ONLY valid JSON:
{
  "compatibility_pct": <integer 0-100>,
  "explanation": "<2-3 sentences in Spanish explaining the compatibility, highlighting strengths and any concerns>"
}`;

  const response = await groq.chat.completions.create({
    model: MODELS.text,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const raw = response.choices[0].message.content ?? "{}";
  return JSON.parse(raw) as CompatibilityResult;
}
