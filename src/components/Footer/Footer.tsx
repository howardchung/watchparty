import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => (
  <div style={{ margin: '1em', fontSize: '14px', color: 'white' }}>
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
  </div>
);
