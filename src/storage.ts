import type { Cook, Match } from "./types";

const STORAGE_KEY = "cook-registry-v1";

type Store = {
  cooks: Cook[];
  matches: Match[];
};

const emptyStore = (): Store => ({ cooks: [], matches: [] });

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.cooks || !parsed.matches) return emptyStore();
    return parsed;
  } catch {
    return emptyStore();
  }
}

function save(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getCooks(): Cook[] {
  return load().cooks;
}

export function getMatches(): Match[] {
  return load().matches;
}

export function addCook(cook: Cook) {
  const store = load();
  store.cooks.push(cook);
  save(store);
}

export function completeMatch(matchId: string) {
  const store = load();
  const match = store.matches.find((m) => m.id === matchId);
  if (!match) return;
  const cook = store.cooks.find((c) => c.id === match.cookId);
  if (cook) cook.status = "available";
  store.matches = store.matches.filter((m) => m.id !== matchId);
  save(store);
}

export type MatchResult =
  | { ok: true; match: Match }
  | { ok: false; reason: "no_cooks" };

export function matchCustomer(input: {
  customerName: string;
  customerEmail: string;
  mealNotes: string;
  preferredDate: string;
  cuisineHint: string;
}): MatchResult {
  const store = load();

  const norm = (s: string) => s.trim().toLowerCase();
  const hint = norm(input.cuisineHint);

  const available = store.cooks.filter((c) => c.status === "available");
  const preferred =
    hint.length > 0
      ? available.filter((c) => norm(c.specialty).includes(hint))
      : [];
  const pick =
    preferred.length > 0 ? preferred[0] : available.length > 0 ? available[0] : null;

  if (!pick) {
    return { ok: false, reason: "no_cooks" };
  }

  pick.status = "matched";
  const match: Match = {
    id: crypto.randomUUID(),
    cookId: pick.id,
    cookName: pick.name,
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim(),
    mealNotes: input.mealNotes.trim(),
    preferredDate: input.preferredDate,
    createdAt: new Date().toISOString(),
  };
  store.matches.push(match);
  save(store);
  return { ok: true, match };
}
