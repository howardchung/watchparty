import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => (
  <div
    style={{
      margin: '1em',
      paddingBottom: '1em',
      fontSize: '14px',
      color: 'white',
    }}
  >
    <Link to="/terms">Terms</Link>
    {' · '}
    <Link to="/privacy">Privacy</Link>
    {' · '}
    <Link to="/faq">FAQ</Link>
  </div>
);
