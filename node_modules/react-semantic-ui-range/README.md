# react-semantic-ui-range

This is a React Component range slider for Semantic UI

It is developed based on https://github.com/tyleryasaka/semantic-ui-range but has additional functionalities

The demo for the project can be found here: https://iozbeyli.github.io/react-semantic-ui-range/

The original library was using jQuery so I changed the parts that use jQuery to make it more compatible with React.

```
  npm i react-semantic-ui-range
```

Sample Usage

```javascript
import React, { useState } from "react";
import { Slider } from "react-semantic-ui-range";
import "semantic-ui-css/semantic.min.css";
import { Label, Grid, Input } from "semantic-ui-react";

const App = props => {
  const [value, setValue] = useState(5);

  const settings = {
    start: 2,
    min: 0,
    max: 10,
    step: 1,
    onChange: value => {
      setValue(value);
    }
  };

  const handleValueChange = e => {
    let value = parseInt(e.target.value);
    if (!value) {
      value = 0;
    }
    setValue(e.target.value);
  };

  return (
    <Grid>
      <Grid.Column width={16}>
        <Slider value={value} color="red" settings={settings} />
      </Grid.Column>
      <Grid.Column width={16}>
        <Input placeholder="Enter Value" onChange={handleValueChange} />
        <Label color="red">{value}</Label>
      </Grid.Column>
    </Grid>
  );
};

export default App;
```


