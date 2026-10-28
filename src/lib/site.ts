import {
  Briefcase,
  Calculator,
  Car,
  Cpu,
  Drill,
  Factory,
  Flower2,
  GraduationCap,
  HardHat,
  HeartPulse,
  Leaf,
  Pickaxe,
  Plane,
  Scale,
  ShieldCheck,
  Ship,
  Store,
  Truck,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const SITE = {
  name: "Meridian Recruitment",
  shortName: "Meridian",
  tagline: "Recruitment for every industry, built in Australia.",
  description:
      "Meridian recruits across every industry in Australia and New Zealand. Every candidate is identity-checked, right-to-work verified, qualification-checked and assessed for role fit before we introduce them.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@example.com.au", // CONFIRM
  phone: null as string | null,
  responseTime: "one business day",
  legalName: "[Legal entity name]",
  abn: null as string | null,
} as const;

export const NAV_LINKS = [
  { label: "Employers", href: "/employers" },
  { label: "Job seekers", href: "/job-seekers" },
  { label: "Industries", href: "/industries" },
  { label: "About", href: "/about" },
] as const;

export type Industry = {
  slug: string;
  name: string;
  roles: string;
  icon: LucideIcon;
};

export const INDUSTRIES: Industry[] = [
  { slug: "healthcare", name: "Healthcare and aged care", roles: "Nurses, care workers, allied health, aged care support", icon: HeartPulse },
  { slug: "hospitality", name: "Hospitality and tourism", roles: "Chefs, venue managers, front of house, hotel staff", icon: UtensilsCrossed },
  { slug: "construction", name: "Construction and trades", roles: "Site managers, electricians, plumbers, carpenters", icon: HardHat },
  { slug: "technology", name: "Technology and data", roles: "Analysts, software engineers, product managers, DevOps", icon: Cpu },
  { slug: "finance", name: "Finance and accounting", roles: "Accountants, bookkeepers, financial analysts, auditors", icon: Calculator },
  { slug: "logistics", name: "Logistics and supply chain", roles: "Warehouse supervisors, coordinators, forklift operators", icon: Truck },
  { slug: "retail", name: "Retail and sales", roles: "Store managers, account executives, visual merchandisers", icon: Store },
  { slug: "education", name: "Education and childcare", roles: "Teachers, early childhood educators, administrators", icon: GraduationCap },
  { slug: "engineering", name: "Engineering and resources", roles: "Civil, mechanical and mining engineers, technicians", icon: Wrench },
  { slug: "office", name: "Office and administration", roles: "Executive assistants, office managers, receptionists", icon: Briefcase },
  { slug: "mining", name: "Mining and energy", roles: "Geologists, drillers, plant operators, safety officers", icon: Pickaxe },
  { slug: "agriculture", name: "Agriculture and horticulture", roles: "Farm managers, pickers, agronomists, livestock hands", icon: Leaf },
  { slug: "manufacturing", name: "Manufacturing and production", roles: "Machine operators, quality inspectors, production managers", icon: Factory },
  { slug: "transport", name: "Transport and aviation", roles: "Drivers, pilots, ground crew, fleet coordinators", icon: Plane },
  { slug: "maritime", name: "Maritime and ports", roles: "Deckhands, stevedores, port logistics, marine engineers", icon: Ship },
  { slug: "automotive", name: "Automotive and mechanical", roles: "Mechanics, auto electricians, panel beaters, parts advisors", icon: Car },
  { slug: "legal", name: "Legal and compliance", roles: "Paralegals, compliance officers, legal secretaries", icon: Scale },
  { slug: "security", name: "Security and defence", roles: "Security guards, risk analysts, defence contractors", icon: ShieldCheck },
  { slug: "trades", name: "Skilled trades and maintenance", roles: "HVAC technicians, welders, fitters, maintenance crew", icon: Drill },
  { slug: "beauty", name: "Beauty and wellness", roles: "Hairdressers, beauty therapists, massage therapists", icon: Flower2 },
];

export const CHECKS = [
  "Identity confirmed",
  "Right to work verified",
  "Qualifications checked",
  "Criminal history checked, with consent",
  "Role fit assessed",
] as const;

export const PRICING = {
  employer: {
    price: "A$2,999",
    unit: "per candidate",
    includes: [
      "Search and shortlisting for your role",
      "Identity, right-to-work, qualification and criminal history checks (with the candidate's consent)",
      "A role-fit assessment for every candidate you meet",
    ],
  },
  candidate: {
    price: "A$150",
    unit: "for 3 months",
    includes: [
      "Resume building",
      "LinkedIn profile optimisation",
      "Skills guidance for the roles you want",
    ],
    note: "This is job-search support. It is not a placement guarantee.",
  },
} as const;

// --- Locations (Country → State/Region) ---

export type Country = {
  code: string;
  name: string;
  states: { code: string; name: string }[];
};

export const COUNTRIES: Country[] = [
  {
    code: "AU",
    name: "Australia",
    states: [
      { code: "NSW", name: "New South Wales" },
      { code: "VIC", name: "Victoria" },
      { code: "QLD", name: "Queensland" },
      { code: "WA", name: "Western Australia" },
      { code: "SA", name: "South Australia" },
      { code: "TAS", name: "Tasmania" },
      { code: "ACT", name: "Australian Capital Territory" },
      { code: "NT", name: "Northern Territory" },
    ],
  },
  {
    code: "NZ",
    name: "New Zealand",
    states: [
      { code: "AKL", name: "Auckland" },
      { code: "WGN", name: "Wellington" },
      { code: "CAN", name: "Canterbury" },
      { code: "WKO", name: "Waikato" },
      { code: "BOP", name: "Bay of Plenty" },
      { code: "OTA", name: "Otago" },
      { code: "MWT", name: "Manawatū-Whanganui" },
      { code: "HKB", name: "Hawke's Bay" },
      { code: "TKI", name: "Taranaki" },
      { code: "NTL", name: "Northland" },
      { code: "STL", name: "Southland" },
      { code: "GIS", name: "Gisborne" },
      { code: "MBH", name: "Marlborough" },
      { code: "NSN", name: "Nelson" },
      { code: "TAS", name: "Tasman" },
      { code: "WTC", name: "West Coast" },
    ],
  },
];