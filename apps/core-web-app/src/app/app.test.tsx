import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './app';

describe('App', () => {
  it('renders Core Web App', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /core web app/i })).toBeInTheDocument();
  });
});
