import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => (
  <div
    style={{
      margin: '1em',
      paddingBottom: '1em',
      fontSize: '18px',
      color: 'white',
    }}
  >
    <Link style={{ color: 'white' }} to="/terms">
      Terms
    </Link>
    {' · '}
    <Link style={{ color: 'white' }} to="/privacy">
      Privacy
    </Link>
    {' · '}
    <Link style={{ color: 'white' }} to="/faq">
      FAQ
    </Link>
    {' · '}
    <Link style={{ color: 'white' }} to="/discordBot">
      Discord Bot
    </Link>
    {' · '}
    <span>Gravitech LLC</span>
  </div>
);
