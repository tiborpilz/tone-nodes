import { render } from '@testing-library/react';
import { Param } from 'tone';
import ParamInput from '@/app/components/ParamInput';
import { describe, expect, it, mock } from 'bun:test';

const invokeMock = mock();

mock.module('@tauri-apps/api/core', () => ({
  invoke: invokeMock,
}));

const listenMock = mock();

mock.module('@tauri-apps/api/event', () => ({
  listen: listenMock,
}));

const mockAudioParam = {
  value: 0,
} as unknown as Param;

describe('ParamInput', () => {
  it('should render without crashing', () => {
    render(<div data-testid="param-input"><ParamInput param={mockAudioParam} label="Mock Param" /></div>);

    const component = document.querySelector('[data-testid="param-input"]');
    expect(component?.innerHTML).toMatchSnapshot();
  });
});
