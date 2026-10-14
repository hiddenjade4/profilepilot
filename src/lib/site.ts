// Central place for product-wide constants so copy and links stay consistent.

export const siteConfig = {
  name: "ProfilePilot",
  tagline: "Your real experience, presented at its best.",
  // While true, a banner tells visitors the product is still being built.
  inDevelopment: true,
} as const;

export const marketingNav = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Honesty", href: "/#honesty" },
  { label: "Privacy", href: "/#privacy" },
  { label: "FAQ", href: "/#faq" },
] as const;
