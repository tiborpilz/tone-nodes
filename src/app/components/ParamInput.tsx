'use client';

import { useState } from 'react';
import { Param } from 'tone';
import { UnitName, TimeObject, Subdivision } from 'tone/build/esm/core/type/Units';
import midiListener from '@/app/utils/midiListener';

function isParam<T extends UnitName>(param: Param<T> | number): param is Param<T> {
  return (param as Param<T>).value !== undefined;
}

function isTimeObject(param: string | TimeObject): param is TimeObject {
  const exponents = Array.from({ length: 8 }, (_, i) => i);
  const subdivisionKeys =
    exponents.reduce((acc, curr) => {
      const value = Math.pow(2, curr);
      return [
        ...acc,
        `${value}n`,
        `${value}n.`,
        `${value}t`,
      ] as Array<Subdivision>;
  }, [] as Array<Subdivision>);

  return Object.keys(param).every(key => subdivisionKeys.includes(key));
}

function paramToNumber(param: string | number | TimeObject): number {
  if (typeof param === 'number') {
    return param;
  }
  if (isTimeObject(param)) {
    const firstValue = Object.values(param)[0];
    if (typeof firstValue === 'number') {
      return firstValue;
    }
    return parseFloat(firstValue ?? 0);
  }
  return parseFloat(param);
}

export default function ParamInput<T extends UnitName>({
  param,
  label,
  onChange,
}: {
  param: Param<T> | number,
  label: string,
  onChange?: (value: number) => void,
}) {
  const defaultValue = isParam(param) ? param.value : param;
  const [value, setValue] = useState(defaultValue);
  const [isLearning, setIsLearning] = useState(false);
  const [midiChannel, setMidiChannel] = useState(-1);

  const setParamValue = (value: number) => {
    if (isParam(param)) {
      param.value = value;
    } else {
      onChange?.(value);
    }
    setValue(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParamValue(parseFloat(e.target.value));
  };

  const min = label === 'volume' ? -60 : 0;
  const max = label === 'volume' ? 6 : 1;

  const handleMidiLearn = () => {
    setIsLearning(true);
  }

  midiListener((command: number, channel: number, value: number) => {
    if (isLearning && command === 176) {
      setIsLearning(false);
      setMidiChannel(channel);
    }

    if (channel === -1 || channel !== midiChannel) {
      return;
    }

    requestAnimationFrame(() => {
      console.log('setting param value', value, channel, midiChannel, isLearning, label);
      setParamValue(value / 127 * (max - min) + min);
    });
  });

  return (
    <label data-testid="param-input">
      <span>{label}</span>
      <input
        type="range"
        value={paramToNumber(value)}
        onChange={handleChange}
        min={label === 'volume' ? -60 : 0}
        max={label === 'volume' ? 6 : 1}
        step={label === 'volume' ? 0.1 : 0.01}
      />
      <span>{paramToNumber(value)}</span>
      <button onClick={handleMidiLearn}>
        { isLearning ? 'Learning...' : 'Learn MIDI' }
      </button>
    </label>
  );
}
