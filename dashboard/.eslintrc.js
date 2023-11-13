module.exports = {
    "settings": {
        "react": {
            "version": "detect"
        }
    },
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "plugin:react/recommended",
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier'
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "tsconfigRootDir": __dirname,
	"project": ['./tsconfig.json']
    },
    "plugins": [
        "@typescript-eslint",
        "react"
    ],
    "rules": {
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off'
    },
    "ignorePatterns": [
        'build/',
        'public/',
        'components/',
        'contexts/',
        'hooks/',
        '**/node_modules/',
        '*.config.js',
        '.*lintrc.js',
        '/*.*'
    ]
}
