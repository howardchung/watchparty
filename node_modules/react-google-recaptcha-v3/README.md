<h1 align="center">React Google Recaptcha V3</h1>
<div align="center">

[React](https://reactjs.org/) library for integrating Google ReCaptcha V3 to your App.

[![npm package](https://img.shields.io/npm/v/react-google-recaptcha-v3/latest.svg)](https://www.npmjs.com/package/react-google-recaptcha-v3)
![Code style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)
![type definition](https://img.shields.io/npm/types/react-google-recaptcha-v3)

</div>

## Install

```bash
npm install react-google-recaptcha-v3
```

## Usage

#### Provide Recaptcha Key

To use `react-google-recaptcha-v3`, you need to create a recaptcha key for your domain, you can get one from [here](https://www.google.com/recaptcha/intro/v3.html).

#### Enterprise

When you enable to use the enterprise version, **you must create new keys**. These keys will replace any Site Keys you created in reCAPTCHA. Check the [migration guide](https://cloud.google.com/recaptcha-enterprise/docs/migrate-recaptcha).

To work properly, you **must** select the Integration type to be `Scoring` since is equivalent to the reCAPTCHA v3.

The complete documentation to the enterprise version you can see [here](https://cloud.google.com/recaptcha-enterprise/docs/quickstart).

#### Components

##### GoogleReCaptchaProvider

`react-google-recaptcha-v3` provides a `GoogleReCaptchaProvider` provider component that should be used to wrap around your components.

`GoogleReCaptchaProvider`'s responsibility is to load the necessary reCaptcha script and provide access to reCaptcha to the rest of your application.

Usually, your application only needs one provider. You should place it as high as possible in your React tree. It's to make sure you only have one instance of Google Recaptcha per page and it doesn't reload unecessarily when your components re-rendered.

Same thing applied when you use this library with framework such as Next.js or React Router and only want to include the script on a single page. Try to make sure you only have one instance of the provider on a React tree and to place it as high (on the tree) as possible.

| **Props**            |     **Type**     | **Default** | **Required?** | **Note**                                                                                                                                                                                                                                                        |
|----------------------|:----------------:| ----------: | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reCaptchaKey         |      String      |             | Yes           | Your recaptcha key, get one from [here](https://www.google.com/recaptcha/intro/v3.html)                                                                                                                                                                         |
| scriptProps          |      Object      |             | No            | You can customize the injected `script` tag with this prop. It allows you to add `async`, `defer`, `nonce` attributes to the script tag. You can also control whether the injected script will be added to the document body or head with `appendTo` attribute. |
| language             |      String      |             | No            | optional prop to support different languages that is supported by Google Recaptcha. https://developers.google.com/recaptcha/docs/language                                                                                                                       |
| useRecaptchaNet      |     Boolean      |       false | No            | The provider also provide the prop `useRecaptchaNet` to load script from `recaptcha.net`: https://developers.google.com/recaptcha/docs/faq#can-i-use-recaptcha-globally                                                                                         |
| useEnterprise        |     Boolean      |       false | No            | [Enterprise option](#enterprise)                                                                                                                                                                                                                                |
| container.element    | String HTMLElement |             | No            | Container ID where the recaptcha badge will be rendered                                                                                                                                                                                                         |
| container.parameters |      Object      |             | No            | Configuration for the inline badge (See google recaptcha docs)                                                                                                                                                                                                  |

```javascript
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

ReactDom.render(
  <GoogleReCaptchaProvider
    reCaptchaKey="[Your recaptcha key]"
    language="[optional_language]"
    useRecaptchaNet="[optional_boolean_value]"
    useEnterprise="[optional_boolean_value]"
    scriptProps={{
      async: false, // optional, default to false,
      defer: false, // optional, default to false
      appendTo: 'head', // optional, default to "head", can be "head" or "body",
      nonce: undefined // optional, default undefined
    }}
    container={{ // optional to render inside custom element
      element: "[required_id_or_htmlelement]",
      parameters: {
        badge: '[inline|bottomright|bottomleft]', // optional, default undefined
        theme: 'dark', // optional, default undefined
      }
    }}
  >
    <YourApp />
  </GoogleReCaptchaProvider>,
  document.getElementById('app')
);
```

There are three ways to trigger the recaptcha validation: using the `GoogleReCaptcha` component, wrapping your component with the HOC `withGoogleReCaptcha`, or using the custom hook `useGoogleReCaptcha`.

#### GoogleReCaptcha

`GoogleRecaptcha` is a react component that can be used in your app to trigger the validation. It provides a prop `onVerify`, which will be called once the verify is done successfully, also supports a prop `refreshReCaptcha` which supports any type of value and is used to force recaptcha to revalidate (you can use a timestamp updated after every submit), there is an example below.

```javascript
import {
  GoogleReCaptchaProvider,
  GoogleReCaptcha
} from 'react-google-recaptcha-v3';

ReactDom.render(
  <GoogleReCaptchaProvider reCaptchaKey="[Your recaptcha key]">
    <GoogleReCaptcha onVerify={handleVerify} />
  </GoogleReCaptchaProvider>,
  document.getElementById('app')
);
```

```javascript
// IMPORTANT NOTES: The `GoogleReCaptcha` component is a wrapper around `useGoogleRecaptcha` hook and use `useEffect` to run the verification.
// It's important that you understand how React hooks work to use it properly.
// Avoid using inline function for the `onVerify` props as it can possibly cause the verify function to run continously.
// To avoid that problem, you can use a memoized function provided by `React.useCallback` or a class method
// The code below is an example that inline function can result in an infinite loop and the verify function runs continously:

const MyComponent: FC = () => {
  const [token, setToken] = useState();

  return (
    <div>
      <GoogleReCaptcha
        onVerify={token => {
          setToken(token);
        }}
      />
    </div>
  );
};
```

```javascript
// Example of refreshReCaptcha option:

const MyComponent: FC = () => {
  const [token, setToken] = useState();
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false);

  const onVerify = useCallback((token) => {
    setToken(token);
  });

  const doSomething = () => {
    /* do something like submit a form and then refresh recaptcha */
    setRefreshReCaptcha(r => !r);
  }

  return (
    <div>
      <GoogleReCaptcha
        onVerify={onVerify}
        refreshReCaptcha={refreshReCaptcha}
      />
      <button onClick={doSomething}>
        Do Something
      </button>
    </div>
  );
};
```

#### React Hook: useGoogleReCaptcha (recommended approach)

If you prefer a React Hook approach over the old good Higher Order Component, you can choose to use the custom hook `useGoogleReCaptcha` over the HOC `withGoogleReCaptcha`.

The `executeRecaptcha` function returned from the hook can be undefined when the recaptcha script has not been successfully loaded.
You can do a null check to see if it's available or not.

How to use the hook:

```javascript
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha
} from 'react-google-recaptcha-v3';

const YourReCaptchaComponent = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Create an event handler so you can call the verification on button click event or form submit
  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      console.log('Execute recaptcha not yet available');
      return;
    }

    const token = await executeRecaptcha('yourAction');
    // Do whatever you want with the token
  }, [executeRecaptcha]);

  // You can use useEffect to trigger the verification as soon as the component being loaded
  useEffect(() => {
    handleReCaptchaVerify();
  }, [handleReCaptchaVerify]);

  return <button onClick={handleReCaptchaVerify}>Verify recaptcha</button>;
};

ReactDom.render(
  <GoogleReCaptchaProvider reCaptchaKey="[Your recaptcha key]">
    <YourReCaptchaComponent />
  </GoogleReCaptchaProvider>,
  document.getElementById('app')
);
```

#### withGoogleReCaptcha

`GoogleRecaptcha` is a HOC (higher order component) that can be used to integrate reCaptcha validation with your component and trigger the validation programmatically. It inject the wrapped component with `googleReCaptchaProps` object.

The object contains the `executeRecaptcha` function that can be called to validate the user action.

You are recommended to use the custom hook `useGoogleReCaptcha` over the HOC whenever you can. The HOC can be removed in future version.

```javascript
import {
  GoogleReCaptchaProvider,
  withGoogleReCaptcha
} from 'react-google-recaptcha-v3';

class ReCaptchaComponent extends Component<{}> {
  handleVerifyRecaptcha = async () => {
    const { executeRecaptcha } = (this.props as IWithGoogleReCaptchaProps)
      .googleReCaptchaProps;

    if (!executeRecaptcha) {
      console.log('Recaptcha has not been loaded');

      return;
    }

    const token = await executeRecaptcha('homepage');
  };

  render() {
    return (
      <div>
        <button onClick={this.handleVerifyRecaptcha}>Verify Recaptcha</button>
      </div>
    );
  }
}

export const WithGoogleRecaptchaExample =
  withGoogleReCaptcha(ReCaptchaComponent);

ReactDom.render(
  <GoogleReCaptchaProvider reCaptchaKey="[Your recaptcha key]">
    <WithGoogleRecaptchaExample />
  </GoogleReCaptchaProvider>,
  document.getElementById('app')
);
```

## Example

An example of how to use these two hooks can found inside the `example` folder. You will need to provide an .env file if you want to run it on your own machine.

```
RECAPTCHA_KEY=[YOUR_RECAPTCHA_KEY]
```
