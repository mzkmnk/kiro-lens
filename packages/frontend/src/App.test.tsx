import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });
});
