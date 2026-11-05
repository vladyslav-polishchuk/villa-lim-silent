import { neon } from "@neondatabase/serverless";

export type BookingStatus = "pending" | "approved" | "rejected";

export type Booking = {
  id: string;
  createdAt: number;
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  total: number;
  message: string;
  lang: string;
  status: BookingStatus;
  decidedAt?: number;
};

// Vercel's Postgres (Neon) integration injects DATABASE_URL / POSTGRES_URL.
function client() {
  // The Neon integration here prefixes its variables with the project name.
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.VILLA_LIM_SILENT_DATABASE_URL;
  return url ? neon(url) : null;
}

/** Connected client with the schema guaranteed to exist, or null when storage is not configured. */
export async function db() {
  const sql = client();
  if (!sql) return null;
  await ensureSchema(sql);
  return sql;
}

export function storageConfigured() {
  return client() !== null;
}

let ready: Promise<void> | null = null;

async function ensureSchema(sql: NonNullable<ReturnType<typeof client>>) {
  ready ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS bookings (
      id text PRIMARY KEY,
      created_at bigint NOT NULL,
      name text NOT NULL,
      email text NOT NULL,
      check_in text NOT NULL,
      check_out text NOT NULL,
      guests int NOT NULL,
      nights int NOT NULL,
      total numeric NOT NULL,
      message text NOT NULL,
      lang text NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      decided_at bigint
    )`;
    await sql`CREATE TABLE IF NOT EXISTS rates (
      start_date text PRIMARY KEY,
      end_date text NOT NULL,
      price numeric NOT NULL,
      discounted_price numeric,
      min_nights int NOT NULL,
      description text
    )`;
    await sql`CREATE TABLE IF NOT EXISTS settings (
      key text PRIMARY KEY,
      value text NOT NULL
    )`;
    await sql`CREATE TABLE IF NOT EXISTS login_attempts (
      key text NOT NULL,
      at bigint NOT NULL
    )`;
  })().catch((err) => {
    ready = null;
    throw err;
  });
  await ready;
}

type Row = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  total: string;
  message: string;
  lang: string;
  status: BookingStatus;
  decided_at: string | null;
};

function toBooking(r: Row): Booking {
  return {
    id: r.id,
    createdAt: Number(r.created_at),
    name: r.name,
    email: r.email,
    checkIn: r.check_in,
    checkOut: r.check_out,
    guests: r.guests,
    nights: r.nights,
    total: Number(r.total),
    message: r.message,
    lang: r.lang,
    status: r.status,
    decidedAt: r.decided_at === null ? undefined : Number(r.decided_at),
  };
}

export async function saveBooking(b: Booking): Promise<boolean> {
  const sql = client();
  if (!sql) return false;
  await ensureSchema(sql);
  await sql`INSERT INTO bookings
    (id, created_at, name, email, check_in, check_out, guests, nights, total, message, lang, status)
    VALUES (${b.id}, ${b.createdAt}, ${b.name}, ${b.email}, ${b.checkIn}, ${b.checkOut},
      ${b.guests}, ${b.nights}, ${b.total}, ${b.message}, ${b.lang}, ${b.status})`;
  return true;
}

export async function getBooking(id: string): Promise<Booking | null> {
  const sql = client();
  if (!sql) return null;
  await ensureSchema(sql);
  const rows = (await sql`SELECT * FROM bookings WHERE id = ${id}`) as Row[];
  return rows[0] ? toBooking(rows[0]) : null;
}

export async function listBookings(): Promise<Booking[]> {
  const sql = client();
  if (!sql) return [];
  await ensureSchema(sql);
  const rows =
    (await sql`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 200`) as Row[];
  return rows.map(toBooking);
}

/** Only moves a pending booking; returns null if it was missing or already decided. */
export async function setStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking | null> {
  const sql = client();
  if (!sql) return null;
  await ensureSchema(sql);
  const rows =
    (await sql`UPDATE bookings SET status = ${status}, decided_at = ${Date.now()}
    WHERE id = ${id} AND status = 'pending' RETURNING *`) as Row[];
  return rows[0] ? toBooking(rows[0]) : null;
}

// Counts attempts in a sliding window; returns true when the limit is exceeded.
export async function hitRateLimit(
  key: string,
  limit: number,
  windowSec: number,
) {
  const sql = client();
  if (!sql) return false;
  await ensureSchema(sql);
  const now = Date.now();
  await sql`DELETE FROM login_attempts WHERE at < ${now - windowSec * 1000}`;
  await sql`INSERT INTO login_attempts (key, at) VALUES (${key}, ${now})`;
  const rows =
    (await sql`SELECT count(*)::int AS n FROM login_attempts WHERE key = ${key}`) as {
      n: number;
    }[];
  return rows[0].n > limit;
}
