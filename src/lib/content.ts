export const villa = {
  name: "Villa Lim Silent",
  location: "Matohanci, Rovinj",
  country: "Croatia",
  coordinates: {
    lat: 45.1112099,
    lng: 13.7551098,
    label: `45°06'40.4"N 13°45'18.3"E`,
  },
  mapsPlace: {
    name: "Villa with heated pool, patio & grill",
    featureId: "0x477cb9b263e8efe5:0x13772ba58561efcf",
    url: "https://www.google.com/maps/place/Villa+with+heated+pool,+patio+%26+grill/@45.1112099,13.7551098,17z/data=!3m1!4b1!4m6!3m5!1s0x477cb9b263e8efe5:0x13772ba58561efcf!8m2!3d45.1112099!4d13.7551098!16s%2Fg%2F11xkgcvrvz",
  },
  rating: "5.0",
  reviewCount: 17,
  guests: 6,
  bedrooms: 3,
  bathrooms: 2,
  livingArea: 140,
  plotArea: 650,
  poolArea: 31.5,
  beachKm: 3,
  checkIn: "16:00",
  checkOut: "10:00",
  pets: 1,
  fromPrice: 170,
};

export const highlights = [
  { label: "Guests", value: "6" },
  { label: "Bedrooms", value: "3" },
  { label: "Bathrooms", value: "2" },
  { label: "Pets", value: "Max. 1" },
  { label: "Beach", value: "3 km" },
  { label: "Pool", value: "Heated" },
  { label: "Parking", value: "Private" },
  { label: "Wi-Fi", value: "Free" },
];

export const about = [
  "A contemporary villa on the quiet edge of Matohanci, a few kilometres from Rovinj. Three king bedrooms, two bathrooms, and a 650 m² enclosed garden make it a private base for families and small groups.",
  "The heated pool sits at the centre of the terrace, with sun and shade throughout the day, an olive tree courtyard, and an outdoor dining table for long Istrian evenings.",
  "Lim Bay beach is about 3 km away. The former railway line to Rovinj is nearby for cycling, walking, and running, and an electric SUP is available for the calm water of the fjord.",
];

export const bedrooms = [
  {
    name: "Bedroom 1",
    details: ["King bed", "Air conditioning", "TV", "Garden view"],
  },
  {
    name: "Bedroom 2",
    details: ["King bed", "Air conditioning", "TV", "Pool access"],
  },
  {
    name: "Bedroom 3",
    details: ["King bed", "Air conditioning", "TV", "Quiet wing"],
  },
];

export const amenityGroups = [
  {
    title: "Kitchen",
    items: [
      "Oven & stove",
      "Refrigerator & freezer",
      "Dishwasher",
      "Microwave",
      "Coffee machine",
      "Kettle & toaster",
      "High chair",
    ],
  },
  {
    title: "Indoors",
    items: [
      "140 m² living space",
      "Air conditioning",
      "Free Wi-Fi",
      "Satellite TV",
      "Safe & iron",
      "Two bathrooms with showers",
      "Hair dryers",
    ],
  },
  {
    title: "Outdoors",
    items: [
      "Heated pool, 31.5 m²",
      "Sun deck & loungers",
      "Barbecue",
      "Covered dining terrace",
      "Garden, 650 m²",
      "Fully enclosed fence",
      "Private parking",
    ],
  },
];

export const gallery = [
  { src: "/gallery/hero.jpg", alt: "Villa Lim Silent at dusk with heated pool" },
  { src: "/gallery/pool.jpg", alt: "Evening pool terrace with olive tree" },
  { src: "/gallery/photo-03.jpg", alt: "Daytime pool with shade sail" },
  { src: "/gallery/photo-04.jpg", alt: "Pool viewed from sun loungers" },
  { src: "/gallery/photo-05.jpg", alt: "Olive courtyard beside the pool" },
  { src: "/gallery/photo-06.jpg", alt: "Covered outdoor dining table" },
  { src: "/gallery/photo-07.jpg", alt: "Living room opening onto the garden" },
  { src: "/gallery/photo-08.jpg", alt: "Lounge sofa with terrace view" },
  { src: "/gallery/photo-09.jpg", alt: "Living room seating area" },
];

export const reviews = [
  {
    name: "Alexandra R.",
    date: "September 2026",
    text: "A private house on the edge of the village, with a pool that stays in the sun until early evening. The technical setup is complete, including insect screens, and Rovinj is close when you want the town. Host Matjaž greeted us in person — it felt like staying with friends.",
  },
  {
    name: "Daniel R.",
    date: "August 2026",
    text: "Everything was perfect.",
  },
  {
    name: "Vladyslav P.",
    date: "August 2026",
    text: "Modern, larger in person than in photos, and meticulously kept. The garden is fully fenced, so our dog could roam off-leash. Welcome fruit, coffee, and wine were waiting, and the host stayed in touch before, during, and after the stay — including EV charging at the villa.",
  },
];

export const distances = [
  { label: "Restaurant", value: "2 km" },
  { label: "Shop", value: "3 km" },
  { label: "Sea / beach", value: "3 km" },
  { label: "Rovinj centre", value: "8 km" },
  { label: "Pula airport", value: "36 km" },
];

export type Rate = {
  start: string;
  end: string;
  price: number;
  minNights: number;
};

export const rates: Rate[] = [
  { start: "2026-09-19", end: "2026-10-31", price: 194, minNights: 7 },
  { start: "2026-10-31", end: "2026-12-01", price: 170, minNights: 5 },
  { start: "2027-03-27", end: "2027-04-01", price: 194, minNights: 7 },
  { start: "2027-04-01", end: "2027-05-29", price: 295, minNights: 7 },
  { start: "2027-05-29", end: "2027-06-05", price: 272.5, minNights: 7 },
  { start: "2027-06-05", end: "2027-07-03", price: 338.5, minNights: 7 },
  { start: "2027-07-03", end: "2027-07-17", price: 470.5, minNights: 7 },
  { start: "2027-07-17", end: "2027-08-21", price: 514.5, minNights: 7 },
  { start: "2027-08-21", end: "2027-08-28", price: 470.5, minNights: 7 },
  { start: "2027-08-28", end: "2027-09-04", price: 338.5, minNights: 7 },
  { start: "2027-09-04", end: "2027-09-18", price: 272.5, minNights: 7 },
  { start: "2027-09-18", end: "2027-09-30", price: 228.5, minNights: 7 },
  { start: "2027-09-30", end: "2027-10-30", price: 194, minNights: 7 },
  { start: "2027-10-30", end: "2027-11-27", price: 170, minNights: 5 },
];

export function formatDateRange(start: string, end: string) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${fmt.format(new Date(`${start}T12:00:00`))} – ${fmt.format(new Date(`${end}T12:00:00`))}`;
}

export function nightsBetween(from: string, to: string) {
  const a = new Date(`${from}T12:00:00`);
  const b = new Date(`${to}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function quoteStay(from: string, to: string) {
  const nights = nightsBetween(from, to);
  if (!from || !to || nights <= 0) {
    return { nights: 0, total: 0, minNights: 0, error: "Select check-in and check-out." };
  }

  let total = 0;
  let minNights = 1;
  const cursor = new Date(`${from}T12:00:00`);
  const last = new Date(`${to}T12:00:00`);

  while (cursor < last) {
    const iso = cursor.toISOString().slice(0, 10);
    const rate = rates.find((r) => iso >= r.start && iso < r.end);
    if (!rate) {
      return {
        nights,
        total: 0,
        minNights: 0,
        error: "Those dates are outside the published season.",
      };
    }
    total += rate.price;
    minNights = Math.max(minNights, rate.minNights);
    cursor.setDate(cursor.getDate() + 1);
  }

  if (nights < minNights) {
    return {
      nights,
      total,
      minNights,
      error: `Minimum stay for these dates is ${minNights} nights.`,
    };
  }

  return { nights, total, minNights, error: null as string | null };
}
