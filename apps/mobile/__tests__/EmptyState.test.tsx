import React from 'react';
import { render, screen } from '@testing-library/react-native';
import EmptyState from '../src/components/EmptyState';

describe('EmptyState', () => {
  it('renders the default message when none is provided', () => {
    render(<EmptyState />);
    expect(screen.getByText('No tasks found.')).toBeTruthy();
  });

  it('renders a custom message when provided', () => {
    render(<EmptyState message="No tasks assigned to this patient." />);
    expect(screen.getByText('No tasks assigned to this patient.')).toBeTruthy();
  });
});
