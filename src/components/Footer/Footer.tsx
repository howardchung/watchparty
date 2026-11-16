import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer
    style={{
      padding: "24px 18px",
      borderTop: "1px solid var(--border-subtle)",
      fontSize: "13px",
      color: "var(--text-secondary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
    }}
  >
    <Link to="/terms">Terms</Link>
    <span>·</span>
    <Link to="/privacy">Privacy</Link>
    <span>·</span>
    <Link to="/faq">FAQ</Link>
  </footer>
);
