import { render, fireEvent, screen } from '@testing-library/react';
import ParamInput from '@/app/components/ParamInput';
import { describe, expect, it, spy } from 'bun:test';

const mockAudioParam = {
  value: 0,
} as unknown as AudioParam;

describe('ParamInput', () => {
  it('should render without crashing', () => {

    render(<ParamInput param={mockAudioParam} label="Mock Param" />);
    const component = document.querySelector('[data-testid="param-input"]');

    expect(component?.innerHTML).toMatchSnapshot();
  });
});
