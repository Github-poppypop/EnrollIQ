import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../app/dashboard/page';

describe('DashboardPage', () => {
  it('renders the dashboard heading', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeDefined();
  });
});
