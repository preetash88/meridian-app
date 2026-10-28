import {
  Briefcase,
  Calculator,
  Cpu,
  GraduationCap,
  HardHat,
  HeartPulse,
  Store,
  Truck,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for brand details and page content.
 * Everything marked CONFIRM needs the client's sign-off before launch.
 */
export const SITE = {
  name: "Meridian Recruitment",
  shortName: "Meridian",
  tagline: "Recruitment for every industry, built in Australia.",
  description:
    "Meridian recruits across every industry in Australia. Every candidate is identity-checked, right-to-work verified, qualification-checked and assessed for role fit before we introduce them.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@example.com.au", // CONFIRM: client's real enquiries address
  phone: null as string | null, // CONFIRM: leave null to hide
  responseTime: "one business day", // CONFIRM: a public promise
  legalName: "[Legal entity name]", // CONFIRM: for the privacy policy
  abn: null as string | null, // CONFIRM
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
  { slug: "healthcare", name: "Healthcare and aged care", roles: "Nurses, care workers, allied health", icon: HeartPulse },
  { slug: "hospitality", name: "Hospitality and tourism", roles: "Chefs, venue managers, front of house", icon: UtensilsCrossed },
  { slug: "construction", name: "Construction and trades", roles: "Site managers, electricians, coordinators", icon: HardHat },
  { slug: "technology", name: "Technology and data", roles: "Analysts, engineers, product managers", icon: Cpu },
  { slug: "finance", name: "Finance and accounting", roles: "Accountants, bookkeepers, analysts", icon: Calculator },
  { slug: "logistics", name: "Logistics and warehousing", roles: "Supervisors, coordinators, operators", icon: Truck },
  { slug: "retail", name: "Retail and sales", roles: "Store managers, account executives", icon: Store },
  { slug: "education", name: "Education and childcare", roles: "Teachers, educators, administrators", icon: GraduationCap },
  { slug: "engineering", name: "Engineering and resources", roles: "Engineers, technicians, safety officers", icon: Wrench },
  { slug: "office", name: "Office and administration", roles: "Executive assistants, office managers", icon: Briefcase },
];

/** The five checks from the client brief. */
export const CHECKS = [
  "Identity confirmed",
  "Right to work verified",
  "Qualifications checked",
  "Criminal history checked, with consent",
  "Role fit assessed",
] as const;

/** CONFIRM with client: prices, GST wording, and rules on fees charged to job seekers in each state. */
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
