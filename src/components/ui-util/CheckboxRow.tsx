import React from 'react';

interface CheckboxRowProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  count?: number;
}

export const CheckboxRow = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  count,
}: CheckboxRowProps) => (
  <tr>
    <td>
      {label} {count !== undefined && `(${count})`}
    </td>
    <td>
      <div className='checkbox-container'>
        <input
          type='checkbox'
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </td>
  </tr>
);
