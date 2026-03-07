import { supabase } from "@/integrations/supabase/client";

export interface InterestTier {
  week: number;
  label: string;
  rate: number;
}

const DEFAULT_TIERS: InterestTier[] = [
  { week: 1, label: "Week 1", rate: 5 },
  { week: 2, label: "Week 2", rate: 10 },
  { week: 3, label: "Week 3", rate: 14 },
  { week: 4, label: "Week 4", rate: 17 },
  { week: 5, label: "Week 5+", rate: 19 },
];

let cachedTiers: InterestTier[] | null = null;
let lastFetch = 0;

export async function fetchInterestTiers(): Promise<InterestTier[]> {
  // Cache for 60 seconds
  if (cachedTiers && Date.now() - lastFetch < 60000) return cachedTiers;

  try {
    const { data, error } = await supabase
      .from("interest_settings")
      .select("*")
      .limit(1)
      .single();

    if (!error && data) {
      cachedTiers = [
        { week: 1, label: "Week 1", rate: Number(data.week1_rate) },
        { week: 2, label: "Week 2", rate: Number(data.week2_rate) },
        { week: 3, label: "Week 3", rate: Number(data.week3_rate) },
        { week: 4, label: "Week 4", rate: Number(data.week4_rate) },
        { week: 5, label: "Week 5+", rate: Number(data.week5_plus_rate) },
      ];
      lastFetch = Date.now();
      return cachedTiers;
    }
  } catch {}
  return DEFAULT_TIERS;
}

/** Synchronous fallback using cached data */
export function getInterestTiers(): InterestTier[] {
  return cachedTiers ?? DEFAULT_TIERS;
}

export function clearInterestCache() {
  cachedTiers = null;
  lastFetch = 0;
}

export function calculateWeeklyInterest(loanAmount: number, weeksPassed: number) {
  const tiers = getInterestTiers();
  const tierMap: Record<number, number> = {};
  let maxRate = 19;
  for (const t of tiers) {
    if (t.week <= 4) tierMap[t.week] = t.rate;
    else maxRate = t.rate;
  }
  const rate = weeksPassed <= 0 ? tierMap[1] ?? 5 : (tierMap[weeksPassed] ?? maxRate);
  const interest = parseFloat((loanAmount * (rate / 100)).toFixed(2));
  return { rate, interest, total: parseFloat((loanAmount + interest).toFixed(2)) };
}
