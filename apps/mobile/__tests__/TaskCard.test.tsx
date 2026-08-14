import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import TaskCard from '../src/features/care/components/TaskCard';
import type { CareTask } from '../src/features/care/types';

const mockTask: CareTask = {
  id: 't1',
  patientId: 'p1',
  patientName: 'John Doe',
  title: 'Follow up with patient',
  priority: 'high',
  status: 'pending',
  dueDate: new Date().toISOString().split('T')[0],
  notes: null,
};

describe('TaskCard', () => {
  it('renders patient name and task title', () => {
    render(<TaskCard task={mockTask} onPress={jest.fn()} />);
    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('Follow up with patient')).toBeTruthy();
  });

  it('calls onPress with the patient id when tapped', () => {
    const onPress = jest.fn();
    render(<TaskCard task={mockTask} onPress={onPress} />);

    fireEvent.press(screen.getByText('John Doe'));

    expect(onPress).toHaveBeenCalledWith('p1');
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows a completed badge when the task is done', () => {
    render(<TaskCard task={{ ...mockTask, status: 'completed' }} onPress={jest.fn()} />);
    expect(screen.getByText('✓ Done')).toBeTruthy();
  });
});
