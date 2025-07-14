import React, { useState } from 'react';
import '../../style/uiBox.css';

interface CustomRangeInputProps {
  onValueChange: (newValue: number) => void;
  currentValue: number;
  visible: boolean;
}
const CustomRangeInput: React.FC<CustomRangeInputProps> = ({
  onValueChange,
  currentValue,
  visible,
}) => {
  const [value, setValue] = useState<number>(currentValue);
  const [displayValue, setDisplayValue] = useState<string>(currentValue.toFixed(1).toString());

  const valueToStepIndex = (val: number) => {
    const index = steps.findIndex((step) => step === val);
    return index >= 0 ? index : 0; // Default to first step if not found
  };
  React.useEffect(() => {
    const newIndex = valueToStepIndex(currentValue);
    setValue(newIndex);
    setDisplayValue(currentValue % 1 === 0 ? currentValue.toString() : currentValue.toFixed(1));
  }, [currentValue]);

  const steps = [0.2, 0.5, 1.0, 2.0, 3, 5, 10];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedIndex = Number(e.target.value);
    const selectedValue: number = steps[selectedIndex];
    setValue(selectedIndex);
    setDisplayValue(selectedValue % 1 === 0 ? selectedValue.toString() : selectedValue.toFixed(1));
    onValueChange(selectedValue);
  };

  return (
    <div className={`custom-range-input ${visible ? 'visible' : 'hidden'}`}>
      <input
        type='range'
        min='0'
        max={steps.length - 1}
        value={value}
        onChange={handleChange}
        step='1'
      />
      <div className='value-display'>{displayValue} seconds</div>
    </div>
  );
};

export default CustomRangeInput;
