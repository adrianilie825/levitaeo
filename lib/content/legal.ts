import { siteConfig } from "@/lib/site";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

const contactEmail = siteConfig.contactEmail;

export const privacyPolicyContent = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  intro:
    "Levitaeo respects your privacy. This policy explains what information we collect, how we use it, and the choices available to you.",
  lastUpdated: "30 August 2026",
  sections: [
    {
      title: "Who we are",
      paragraphs: [
        `Levitaeo (“we”, “us”) publishes curated digital art editions through levitaeo.com. For privacy enquiries, contact us at ${contactEmail}.`,
      ],
    },
    {
      title: "Information we collect",
      paragraphs: [
        "Account information: When you create an account, we collect your email address to authenticate you and provide access to your Library.",
        "Purchase information: When you acquire an edition, we record your order details, including the edition purchased, transaction reference, and entitlement to download files. Payment card details are processed directly by Stripe and are not stored on our servers.",
        "Usage information: We may collect standard technical data such as browser type, device information, and pages visited to maintain and improve the service.",
        "Communications: If you contact us or subscribe to the Journal, we retain your message or email address to respond and, where permitted, send editorial updates.",
      ],
    },
    {
      title: "How we use your information",
      paragraphs: [
        "We use your information to provide access to purchased editions, manage your account, process orders, respond to support requests, and improve the Levitaeo experience.",
        "We do not sell your personal information. We share data only with service providers that help us operate the platform — such as payment processing, hosting, and email delivery — under appropriate contractual safeguards.",
      ],
    },
    {
      title: "Data retention",
      paragraphs: [
        "We retain account and purchase records for as long as your account remains active and as required to honour your edition entitlements, comply with legal obligations, and resolve disputes.",
        "You may request deletion of your account by contacting us. Some records may be retained where required by law or for legitimate business purposes.",
      ],
    },
    {
      title: "Your rights",
      paragraphs: [
        "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data, and to object to certain processing or request portability.",
        `To exercise these rights, contact ${contactEmail}. We will respond within a reasonable timeframe.`,
      ],
    },
    {
      title: "Cookies and similar technologies",
      paragraphs: [
        "We use essential cookies and local storage to maintain your session and keep you signed in. We do not use third-party advertising cookies.",
        "You can control cookies through your browser settings. Disabling essential cookies may affect account access and Library functionality.",
      ],
    },
    {
      title: "International transfers",
      paragraphs: [
        "Your information may be processed in countries other than your own where our service providers operate. We take steps to ensure appropriate safeguards are in place.",
      ],
    },
    {
      title: "Changes to this policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. Material changes will be noted on this page with an updated date. Continued use of Levitaeo after changes constitutes acceptance of the revised policy.",
      ],
    },
  ] satisfies LegalSection[],
};

export const termsOfServiceContent = {
  eyebrow: "Legal",
  title: "Terms of Service",
  intro:
    "These terms govern your use of Levitaeo and your purchase of digital editions. By using our website or acquiring an edition, you agree to these terms.",
  lastUpdated: "30 August 2026",
  sections: [
    {
      title: "About Levitaeo",
      paragraphs: [
        "Levitaeo publishes curated digital art editions for personal collection and display. We operate as an editorial publication — not a general marketplace.",
      ],
    },
    {
      title: "Eligibility and accounts",
      paragraphs: [
        "You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account or make a purchase.",
        "You are responsible for maintaining access to your account email and for all activity under your account.",
      ],
    },
    {
      title: "Purchasing editions",
      paragraphs: [
        "Prices are displayed in the currency shown at checkout. Payment is processed securely through Stripe.",
        "Upon successful payment, your edition is added to your Levitaeo Library with download access. Digital editions are delivered electronically; no physical goods are shipped unless separately offered.",
        "Because digital editions are made available immediately, purchases are generally final. If you experience a technical issue with your order, contact us and we will work to resolve it.",
      ],
    },
    {
      title: "License and use",
      paragraphs: [
        "Your purchase grants a personal, non-exclusive, non-transferable licence to display and enjoy the edition for private, non-commercial use on your personal devices and in your personal spaces.",
        "Unless expressly stated on an edition page, you may print the edition for private, non-commercial use.",
        "You may not redistribute, resell, sublicense, or use editions for commercial purposes without written permission from Levitaeo.",
        "Copyright in each artwork remains with Levitaeo and its creators. Your purchase does not transfer copyright ownership.",
      ],
    },
    {
      title: "Acceptable use",
      paragraphs: [
        "You agree not to misuse the website, attempt unauthorised access, interfere with other users, or use Levitaeo in violation of applicable law.",
        "We may suspend or terminate access where we reasonably believe these terms have been breached.",
      ],
    },
    {
      title: "Intellectual property",
      paragraphs: [
        "The Levitaeo name, website design, editorial content, and all edition artwork are protected by intellectual property laws. Nothing in these terms grants rights to our branding or content beyond your edition licence.",
      ],
    },
    {
      title: "Disclaimer",
      paragraphs: [
        "Levitaeo is provided on an “as is” basis. We do not guarantee uninterrupted access, though we aim to maintain a reliable service.",
        "To the fullest extent permitted by law, Levitaeo is not liable for indirect, incidental, or consequential damages arising from your use of the service.",
      ],
    },
    {
      title: "Governing law",
      paragraphs: [
        "These terms are governed by the laws applicable in the jurisdiction where Levitaeo operates, without regard to conflict-of-law principles. Disputes shall be subject to the exclusive jurisdiction of the competent courts in that jurisdiction, unless mandatory consumer protection laws provide otherwise.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        `Questions about these terms may be directed to ${contactEmail}.`,
      ],
    },
    {
      title: "Changes",
      paragraphs: [
        "We may revise these Terms of Service from time to time. Updated terms will be posted on this page with a revised date. Material changes affecting existing purchases will be communicated where appropriate.",
      ],
    },
  ] satisfies LegalSection[],
};
