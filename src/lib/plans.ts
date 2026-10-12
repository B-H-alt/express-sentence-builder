export type AccountPlan = "preview" | "free" | "plus" | "care_team" | "internal_team";

export type PlanFeature =
  | "advanced_levels"
  | "grammar"
  | "natural_voice"
  | "image_generation"
  | "parent_dashboard"
  | "multiple_learners"
  | "care_collaboration";

export interface PlanDetails {
  name: string;
  shortDescription: string;
  price: string;
  period?: string;
  features: string[];
}

export const PLAN_DETAILS: Record<AccountPlan, PlanDetails> = {
  preview: {
    name: "Preview",
    shortDescription: "Temporary access while Expressly prepares subscriptions.",
    price: "Included",
    features: ["All three vocabulary levels", "Grammar and natural voice", "Custom cards", "Parent dashboard"],
  },
  free: {
    name: "Free",
    shortDescription: "A simple way to begin communicating with pictures.",
    price: "$0",
    features: ["Level 1 vocabulary", "Core communication cards", "One learner profile", "Basic customization"],
  },
  plus: {
    name: "Plus",
    shortDescription: "The complete communication experience for one learner.",
    price: "$14.99",
    period: "per month",
    features: ["All three vocabulary levels", "Grammar and natural voice", "Custom cards and limited image creation", "Progress and parent dashboard"],
  },
  care_team: {
    name: "Care",
    shortDescription: "Shared support for families, therapists, and caregivers.",
    price: "$24.99",
    period: "per month",
    features: ["Everything in Plus", "Up to three learner profiles", "Caregiver and therapist collaboration", "Expanded progress tools and higher limits"],
  },
  internal_team: {
    name: "Expressly Team",
    shortDescription: "Complimentary internal access for the Expressly team.",
    price: "Included",
    features: ["All Expressly features", "Internal testing access", "No consumer usage limits"],
  },
};

export const isAccountPlan = (value: unknown): value is AccountPlan =>
  typeof value === "string" && value in PLAN_DETAILS;

const PLAN_FEATURES: Record<AccountPlan, ReadonlySet<PlanFeature>> = {
  free: new Set(),
  preview: new Set([
    "advanced_levels",
    "grammar",
    "natural_voice",
    "image_generation",
    "parent_dashboard",
  ]),
  plus: new Set([
    "advanced_levels",
    "grammar",
    "natural_voice",
    "image_generation",
    "parent_dashboard",
  ]),
  care_team: new Set([
    "advanced_levels",
    "grammar",
    "natural_voice",
    "image_generation",
    "parent_dashboard",
    "multiple_learners",
    "care_collaboration",
  ]),
  internal_team: new Set([
    "advanced_levels",
    "grammar",
    "natural_voice",
    "image_generation",
    "parent_dashboard",
    "multiple_learners",
    "care_collaboration",
  ]),
};

export const planIncludes = (plan: AccountPlan, feature: PlanFeature) =>
  PLAN_FEATURES[plan].has(feature);
