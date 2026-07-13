import React from "react";
import { t } from "../../i18n";
import styles from "./Footer.module.css";

export const Footer = () => (
  <footer className={styles.footer} dir="rtl">
    <nav aria-label="لینک‌های حقوقی">
      <a href="/faq">{t("faq")}</a>
      <a href="/privacy">{t("privacy")}</a>
      <a href="/terms">{t("terms")}</a>
    </nav>
    <p>{t("legalNotice")}</p>
    <span>© Watch</span>
  </footer>
);
