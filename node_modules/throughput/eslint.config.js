import config from 'eslint-config-standard-universal'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  ...config(globals.node),
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname
      }
    }
  }
)
