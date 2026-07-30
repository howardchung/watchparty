'use client';
import { useState } from 'react';

function useValidatedState(initialValue, validate, initialValidationState) {
  const [value, setValue] = useState(initialValue);
  const [lastValidValue, setLastValidValue] = useState(
    validate(initialValue) ? initialValue : void 0
  );
  const [valid, setValid] = useState(
    typeof initialValidationState === "boolean" ? initialValidationState : validate(initialValue)
  );
  const onChange = (val) => {
    if (validate(val)) {
      setLastValidValue(val);
      setValid(true);
    } else {
      setValid(false);
    }
    setValue(val);
  };
  return [{ value, lastValidValue, valid }, onChange];
}

export { useValidatedState };
//# sourceMappingURL=use-validated-state.mjs.map
