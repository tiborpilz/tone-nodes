'use client';

import { useState } from 'react';
import { Param } from 'tone';
import { UnitName } from 'tone/build/esm/core/type/Units';

export default function ParamInput<T extends UnitName>({
  param,
  label,
}: {
  param: Param<T>,
  label: string,
}) {
  const [value, setValue] = useState(param.value as number);

  return (
    <label>
      <span>{label}</span>
      <input
        type="range"
        value={value}
        onChange={(e) => {
          setValue(parseFloat(e.target.value));
          param.value = parseFloat(e.target.value);
        }}
      />
      <span>{value}</span>
    </label>
  );
}
