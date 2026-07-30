'use client';
'use strict';

var React = require('react');

function useValidatedState(initialValue, validate, initialValidationState) {
  const [value, setValue] = React.useState(initialValue);
  const [lastValidValue, setLastValidValue] = React.useState(
    validate(initialValue) ? initialValue : void 0
  );
  const [valid, setValid] = React.useState(
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

exports.useValidatedState = useValidatedState;
//# sourceMappingURL=use-validated-state.cjs.map
