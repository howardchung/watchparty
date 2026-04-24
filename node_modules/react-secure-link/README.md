# react-secure-link 🔗

![Test](https://github.com/dbudwin/react-secure-link/workflows/Test/badge.svg?branch=main)
[![Coverage Status](https://coveralls.io/repos/github/dbudwin/react-secure-link/badge.svg?branch=main)](https://coveralls.io/github/dbudwin/react-secure-link?branch=main)
![npm](https://img.shields.io/npm/dw/react-secure-link)
![GitHub](https://img.shields.io/github/license/dbudwin/react-secure-link)
![npm bundle size](https://img.shields.io/bundlephobia/min/react-secure-link)
![npm](https://img.shields.io/npm/v/react-secure-link)

A TypeScript compatible React component to avoid security exploits when opening a link in a new tab.  `react-secure-link` is **lightweight** and has **zero dependencies**!

## The Exploit 💥

It's possible when opening a link to a webpage in a new tab that the webpage in the new tab can hijack the webpage in the original tab via the `window.opener` property.  This is an easy, low-level exploit.  Here is how it can occur:

A hacker knows they can leave links in comments on your webpage and that they will open in a new tab.  When a user to your website clicks that link, it will show them a seemingly harmless webpage.  This newly opened tab has access to the `window.opener` property which the hacker can exploit.  This webpage will use the `window.opener` property to run a little JavaScript like: `window.opener.location = "https://www.some-malicious-website.com/login.html"`.  This changes what webpage is opened in the original tab where the user clicked the link.  This is problematic if the hacker redirects the original tab to a webpage that _looks_ like the original.  The hacker could show a message like, "You have been automatically logged out, log back in to continue."  Since the webpage _looks_ the same and the user knows they were just on the same webpage in that same tab, they'll trust the login form, but now their account has been compromised and they don't know it.  The hacker could then redirect back to the original webpage after the login form is submitted to further cover their tracks.

## What is the `window.opener` Property?

From [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/opener):

> The Window interface's opener property returns a reference to the window that opened the window, either with open(), or by navigating a link with a target attribute.

## How Does `react-secure-link` Prevent this Exploit?

Using `react-secure-link` for outbound links prevents the new tab from having access to the `window.opener` property altogether.

## Usage

1. Add `react-secure-link` to your project via `npm install react-secure-link`
2. Import the package: `import { SecureLink } from "react-secure-link";`
3. Use the following for links you want to open in a new tab: `<SecureLink href="https://www.npmjs.com/package/react-secure-link">react-secure-link on NPM</SecureLink>`

## CodeSandbox Examples

There are several examples of the various ways to use this package on CodeSandbox.

[react-secure-link CodeSandbox Examples](https://codesandbox.io/s/react-seucre-link-examples-wzcwf)

### API

`SecureLink` can be used to make text, images, or other children components clickable.  In addition, standard `a` element attributes can be pass in as props (i.e. `href`, `className`, `id`, `role`, `style`).

### Basic Usage Example

```tsx
<SecureLink href="https://www.npmjs.com/package/react-secure-link" />
```

### Advance Usage Example

```tsx
<SecureLink
    href="https://www.npmjs.com/package/react-secure-link"
    className="no-link-decoration"
    style={{ color: "red" }}
    key={123}
    onClick={() => console.log("Clicked")}
>
    react-secure-link on NPM
</SecureLink>
```
