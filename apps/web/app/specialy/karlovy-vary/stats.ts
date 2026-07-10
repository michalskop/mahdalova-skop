export const finalStats = [
  { year: 2023, tickets: 123517, screenings: 445, passes: 9085, filmmakers: 432, industry: 942, journalists: 537, films: 185 },
  { year: 2024, tickets: 127325, screenings: 453, passes: 8726, filmmakers: 411, industry: 1097, journalists: 535, films: 177 },
  { year: 2025, tickets: 128133, screenings: 465, passes: 7926, filmmakers: 411, industry: 1055, journalists: 557, films: 175 },
];

export const current2026 = {
  label: '2026*',
  tickets: 97075,
  screenings: 262,
  passes: 7882,
  filmmakers: 891,
  industry: 1112,
  journalists: 578,
  budgetMil: 250,
  sponsorsShare: 80,
  publicShare: 20,
  spendingMil: 650,
};

export const maxTickets = 128133;
export const comparison2025 = finalStats[2];

export function pct(value: number, max: number) {
  return Math.round((value / max) * 1000) / 10;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('cs-CZ').format(value);
}

export const ticketShare2026 = pct(current2026.tickets, comparison2025.tickets);
export const screeningsShare2026 = pct(current2026.screenings, comparison2025.screenings);
export const passesShare2026 = pct(current2026.passes, comparison2025.passes);
export const journalistsShare2026 = pct(current2026.journalists, comparison2025.journalists);
export const industryShare2026 = pct(current2026.industry, comparison2025.industry);
export const sponsorMil2026 = current2026.budgetMil * current2026.sponsorsShare / 100;
export const publicMil2026 = current2026.budgetMil * current2026.publicShare / 100;
export const spendingRatio2026 = current2026.spendingMil / current2026.budgetMil;
