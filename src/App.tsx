import { FormEvent, useState } from "react";
import type { Cook, Match } from "./types";
import {
  addCook,
  completeMatch,
  getCooks,
  getMatches,
  matchCustomer,
} from "./storage";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function App() {
  const [cooks, setCooks] = useState<Cook[]>(() => getCooks());
  const [matches, setMatches] = useState<Match[]>(() => getMatches());
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerSuccess, setCustomerSuccess] = useState<string | null>(null);
  const [cookError, setCookError] = useState<string | null>(null);

  const refresh = () => {
    setCooks(getCooks());
    setMatches(getMatches());
  };

  const availableCount = cooks.filter((c) => c.status === "available").length;
  const matchedCookCount = cooks.filter((c) => c.status === "matched").length;

  const onCookSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCookError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const specialty = String(fd.get("specialty") ?? "").trim();
    const serviceArea = String(fd.get("serviceArea") ?? "").trim();
    const availability = String(fd.get("availability") ?? "").trim();

    if (!name || !email) {
      setCookError("Name and email are required.");
      return;
    }

    const cook: Cook = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      specialty: specialty || "General",
      serviceArea: serviceArea || "—",
      availability: availability || "Flexible",
      createdAt: new Date().toISOString(),
      status: "available",
    };
    addCook(cook);
    form.reset();
    refresh();
  };

  const onCustomerSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCustomerError(null);
    setCustomerSuccess(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const customerName = String(fd.get("customerName") ?? "").trim();
    const customerEmail = String(fd.get("customerEmail") ?? "").trim();
    const mealNotes = String(fd.get("mealNotes") ?? "").trim();
    const preferredDate = String(fd.get("preferredDate") ?? "").trim();
    const cuisineHint = String(fd.get("cuisineHint") ?? "").trim();

    if (!customerName || !customerEmail || !preferredDate) {
      setCustomerError("Name, email, and preferred date are required.");
      return;
    }

    const result = matchCustomer({
      customerName,
      customerEmail,
      mealNotes,
      preferredDate,
      cuisineHint,
    });

    if (!result.ok) {
      setCustomerError(
        "No cooks are available right now. Try again after someone finishes a booking."
      );
      return;
    }

    setCustomerSuccess(
      `MatchedWith ${result.match.cookName}. They will reach out at ${customerEmail}.`
    );
    form.reset();
    refresh();
  };

  const onCompleteMatch = (id: string) => {
    completeMatch(id);
    refresh();
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="hero-eyebrow">Private chef marketplace</p>
        <h1>Register cooks. Match them with hungry customers.</h1>
        <p>
          Cooks join the pool when they sign up for work. When a customer books,
          the next available cook is paired automatically—optionally steered by
          cuisine preference.
        </p>
      </header>

      <div className="stats-row">
        <div className="stat-pill">
          <strong>{cooks.length}</strong> cooks registered
        </div>
        <div className="stat-pill">
          <strong>{availableCount}</strong> available for new bookings
        </div>
        <div className="stat-pill">
          <strong>{matches.length}</strong> active matches
        </div>
        <div className="stat-pill">
          <strong>{matchedCookCount}</strong> cooks currently booked
        </div>
      </div>

      <div className="layout-grid">
        <section className="panel">
          <h2>Cook signup</h2>
          <p className="panel-desc">
            Add yourself to the registry. You appear as available until a
            customer is matched with you.
          </p>
          {cookError ? <div className="alert alert-error">{cookError}</div> : null}
          <form className="form-grid" onSubmit={onCookSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" />
            </div>
            <div className="field">
              <label htmlFor="specialty">Cuisine specialty</label>
              <input
                id="specialty"
                name="specialty"
                placeholder="e.g. Italian, plant-based, pastry"
              />
            </div>
            <div className="field">
              <label htmlFor="serviceArea">Service area</label>
              <input
                id="serviceArea"
                name="serviceArea"
                placeholder="Neighborhoods or city"
              />
            </div>
            <div className="field">
              <label htmlFor="availability">Typical availability</label>
              <input
                id="availability"
                name="availability"
                placeholder="Weekends, weekday dinners…"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Join the registry
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Request a cook</h2>
          <p className="panel-desc">
            Customers submit a booking. The registry pairs you with the next
            free cook, preferring a cuisine match when possible.
          </p>
          {customerError ? (
            <div className="alert alert-error">{customerError}</div>
          ) : null}
          {customerSuccess ? (
            <div className="alert alert-success">{customerSuccess}</div>
          ) : null}
          <form className="form-grid" onSubmit={onCustomerSubmit}>
            <div className="field">
              <label htmlFor="customerName">Your name</label>
              <input id="customerName" name="customerName" required />
            </div>
            <div className="field">
              <label htmlFor="customerEmail">Email</label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="preferredDate">Preferred service date</label>
              <input id="preferredDate" name="preferredDate" type="date" required />
            </div>
            <div className="field">
              <label htmlFor="cuisineHint">Cuisine preference (optional)</label>
              <input
                id="cuisineHint"
                name="cuisineHint"
                placeholder="Helps pick a specialist if one is free"
              />
            </div>
            <div className="field">
              <label htmlFor="mealNotes">Meal notes</label>
              <textarea
                id="mealNotes"
                name="mealNotes"
                placeholder="Allergies, number of guests, style of meal…"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Find a cook
            </button>
          </form>
        </section>
      </div>

      <section className="panel full-width-section">
        <div className="split-heading">
          <h2>Active matches</h2>
        </div>
        {matches.length === 0 ? (
          <p className="empty-hint">No active pairings yet.</p>
        ) : (
          <div className="card-list">
            {matches.map((m) => (
              <article key={m.id} className="match-card">
                <header>
                  <h3>
                    {m.customerName} → {m.cookName}
                  </h3>
                  <button
                    type="button"
                    className="btn btn-danger btn-slim"
                    onClick={() => onCompleteMatch(m.id)}
                  >
                    Mark complete
                  </button>
                </header>
                <div className="meta-grid">
                  <div>
                    Customer email: <span>{m.customerEmail}</span>
                  </div>
                  <div>
                    Preferred date: <span>{m.preferredDate}</span>
                  </div>
                  <div>
                    Meal notes: <span>{m.mealNotes || "—"}</span>
                  </div>
                  <div>
                    Matched: <span>{formatDate(m.createdAt)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel full-width-section">
        <div className="split-heading">
          <h2>Cook registry</h2>
        </div>
        {cooks.length === 0 ? (
          <p className="empty-hint">No cooks yet—be the first to sign up.</p>
        ) : (
          <div className="card-list">
            {cooks
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((c) => (
                <article key={c.id} className="cook-card">
                  <header>
                    <h3>{c.name}</h3>
                    <span
                      className={
                        c.status === "available"
                          ? "badge badge-available"
                          : "badge badge-matched"
                      }
                    >
                      {c.status === "available" ? "Available" : "Booked"}
                    </span>
                  </header>
                  <div className="meta-grid">
                    <div>
                      Specialty: <span>{c.specialty}</span>
                    </div>
                    <div>
                      Area: <span>{c.serviceArea}</span>
                    </div>
                    <div>
                      Availability: <span>{c.availability}</span>
                    </div>
                    <div>
                      Contact: <span>{c.email}</span>
                      {c.phone ? ` · ${c.phone}` : null}
                    </div>
                    <div>
                      Joined: <span>{formatDate(c.createdAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>

      <p className="panel-desc" style={{ marginTop: "2rem", textAlign: "center" }}>
        Data stays in this browser (localStorage). Hook up a backend when you are
        ready for real accounts and notifications.
      </p>
    </div>
  );
}
