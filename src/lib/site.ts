// Central place for product-wide constants so copy and links stay consistent.

export const siteConfig = {
  name: "ProfilePilot",
  tagline: "Your real experience, presented at its best.",
  // While true, a banner explains that accounts are not open yet and the
  // sign-in/sign-up pages say so honestly. Set to false once Phase 2 ships.
  inDevelopment: true,
} as const;

export const marketingNav = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Honesty", href: "/#honesty" },
  { label: "Privacy", href: "/#privacy" },
  { label: "FAQ", href: "/#faq" },
] as const;
