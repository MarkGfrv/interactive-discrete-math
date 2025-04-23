## Installation
Make sure to have `pnpm` installed, otherwise run `npm i pnpm -g`.

Setup credentials:
```sh
pnpm config set @ennealand:registry https://npm.pkg.github.com
pnpm config set //npm.pkg.github.com/:_authToken YOUR_AUTH_TOKEN
```

Install dependencies:
```sh
pnpm i
```

Create the environment configuration file and specify the port `sc-machine` is running on:
```
cp .env.example .env
```

## Development
Make sure that path to `kb` folder exists in repo.path that is used to build knowledge base.

Start the dev server:
```sh
pnpm dev
```
