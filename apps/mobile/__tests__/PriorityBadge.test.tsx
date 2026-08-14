import React from 'react';
import { render, screen } from '@testing-library/react-native';
import PriorityBadge from '../src/components/PriorityBadge';

describe('PriorityBadge', () => {
  it('renders the correct label for each priority', () => {
    render(<PriorityBadge priority="high" />);
    expect(screen.getByText('High')).toBeTruthy();
  });

  it('renders Medium for medium priority', () => {
    render(<PriorityBadge priority="medium" />);
    expect(screen.getByText('Medium')).toBeTruthy();
  });

  it('renders Low for low priority', () => {
    render(<PriorityBadge priority="low" />);
    expect(screen.getByText('Low')).toBeTruthy();
  });
});
