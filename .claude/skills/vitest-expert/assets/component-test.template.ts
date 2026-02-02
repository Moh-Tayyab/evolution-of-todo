import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {{COMPONENT_NAME}} from './{{COMPONENT_NAME}}';

describe('{{COMPONENT_NAME}} Component', () => {
  it('should render without crashing', () => {
    render(<{{COMPONENT_NAME}} />);
    expect(screen.getByTestId('{{COMPONENT_NAME}}')).toBeInTheDocument();
  });

  it('should display correct content', () => {
    render(<{{COMPONENT_NAME}} />);
    // Add specific assertions
  });
});
