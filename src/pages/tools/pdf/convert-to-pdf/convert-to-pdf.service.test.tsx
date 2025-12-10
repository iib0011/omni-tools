import { render, screen, fireEvent } from '@testing-library/react';
import ConvertToPdf from './index';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

describe('ConvertToPdf', () => {
  it('renders with default state values (full, portrait hidden, no scale shown)', () => {
    render(<ConvertToPdf title="Test PDF" />);

    expect(screen.getByLabelText(/Full Size \(Same as Image\)/i)).toBeChecked();

    expect(screen.queryByLabelText(/A4 Page/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Portrait/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Scale image:/i)).not.toBeInTheDocument();
  });

  it('switches to A4 page type and shows orientation and scale', () => {
    render(<ConvertToPdf title="Test PDF" />);

    const a4Option = screen.getByLabelText(/A4 Page/i);
    fireEvent.click(a4Option);
    expect(a4Option).toBeChecked();

    expect(screen.getByLabelText(/Portrait/i)).toBeChecked();
    expect(screen.getByText(/Scale image:\s*100%/i)).toBeInTheDocument();
  });

  it('updates scale when slider moves (after switching to A4)', () => {
    render(<ConvertToPdf title="Test PDF" />);

    fireEvent.click(screen.getByLabelText(/A4 Page/i));

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 80 } });

    expect(screen.getByText(/Scale image:\s*80%/i)).toBeInTheDocument();
  });
});
