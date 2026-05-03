import React from "react";
import {
  FaLinkedin,
  FaGithub,
  FaFacebook,
  FaInstagram,
  FaEnvelope,
  FaXTwitter,
} from "react-icons/fa6";
import styles from "./contact-app.module.css";
import type { AppProps } from "@/components/apps/app-registry";

interface Contact {
  label: string;
  handle: string;
  href: string;
  Icon: React.ElementType;
  colorVar: string;
}

const CONTACTS: Contact[] = [
  {
    label: "LinkedIn",
    handle: "nurahfezannordin-0201",
    href: "https://www.linkedin.com/in/nurahfezannordin-0201/",
    Icon: FaLinkedin,
    colorVar: "--contact-linkedin",
  },
  {
    label: "GitHub",
    handle: "NestumMilo-isFezan",
    href: "https://github.com/NestumMilo-isFezan",
    Icon: FaGithub,
    colorVar: "--contact-github",
  },
  {
    label: "Facebook",
    handle: "nurahfezan.nordin.3",
    href: "https://www.facebook.com/nurahfezan.nordin.3",
    Icon: FaFacebook,
    colorVar: "--contact-facebook",
  },
  {
    label: "Instagram",
    handle: "nestummilo_",
    href: "https://www.instagram.com/nestummilo_/",
    Icon: FaInstagram,
    colorVar: "--contact-instagram",
  },
  {
    label: "X",
    handle: "nestummilo_",
    href: "https://x.com/nestummilo_",
    Icon: FaXTwitter,
    colorVar: "--contact-x",
  },
  {
    label: "Email",
    handle: "nurahfezanbinnordin@gmail.com",
    href: "mailto:nurahfezanbinnordin@gmail.com",
    Icon: FaEnvelope,
    colorVar: "--contact-email",
  },
];

export const ContactApp: React.FC<AppProps> = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.headerDecoLeft}>▓▒░</span>
        <span className={styles.headerTitle}>SIGNAL_CHANNELS</span>
        <span className={styles.headerDecoRight}>░▒▓</span>
      </div>
      <p className={styles.subtitle}>
        &gt; Establish connection via any channel below
        <span className={styles.cursor}>▮</span>
      </p>

      <div className={styles.grid}>
        {CONTACTS.map((contact) => (
          <a
            key={contact.label}
            href={contact.href}
            target={contact.href.startsWith("mailto") ? undefined : "_blank"}
            rel="noreferrer"
            className={styles.card}
            data-cursor-mode="pointer"
            style={{ "--card-accent": `var(${contact.colorVar})` } as React.CSSProperties}
          >
            <div className={styles.cardIcon}>
              <contact.Icon size={28} />
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardLabel}>{contact.label}</div>
              <div className={styles.cardHandle}>{contact.handle}</div>
            </div>
            <div className={styles.cardArrow}>›</div>
          </a>
        ))}
      </div>
    </div>
  );
};
