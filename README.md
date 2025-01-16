# Dealls! Technical Test

## Running the Application

Using Docker Compose:

```sh
docker compose up --build
```

## Running Tests

```sh
pnpm run test
```

## Code Style and Formatting

This project's code style is loosely based on Airbnb JS style. It also uses Prettier alongside `.prettierrc` file albeit in a somewhat minimal manner, but it allows the codebase to be further customized and/or opinionated. Linting script is also provided:

```sh
pnpm run lint
```

## Project Structure

Excluding the directories, The project directory root contains.

### `migrations` and `seed`

Contains Knex migrations and seed files

### `src`

Contains application code

#### `src/app`

Express App code

#### `src/constants`

Constant values, including a wrapper code for ENV access as constants

#### `src/types`

Type root for this Typescript project

#### `src/utils`

Constant values, including a wrapper code for ENV access as constants

### `tests`

Contains test code

### Directory tree

```sh
.
├── Dockerfile
├── README.md
├── docker-compose.yml
├── eslint.config.mjs
├── knexfile.ts
├── migrations
│   └── 20250114132125_initial_schema.ts
├── package.json
├── pnpm-lock.yaml
├── seeds
│   └── test_users_10.ts
├── src
│   ├── app
│   │   ├── index.ts
│   │   └── routes
│   │       ├── matching.ts
│   │       ├── premium.ts
│   │       └── user.ts
│   ├── constants
│   │   ├── env.ts
│   │   └── purchase_types.ts
│   ├── db
│   │   ├── configs.ts
│   │   ├── knex.ts
│   │   └── models
│   │       ├── Purchase.ts
│   │       ├── User.ts
│   │       ├── UserLike.ts
│   │       └── base
│   │           ├── AutoTimestampModel.ts
│   │           └── BaseModel.ts
│   ├── index.ts
│   ├── types
│   │   └── express.d.ts
│   └── utils
│       ├── middlewares.ts
│       ├── passport.ts
│       └── redis.ts
├── tests
│   ├── index.test.ts
│   └── integration
│       ├── matchingService.test.ts
│       └── userService.test.ts
└── tsconfig.json
```

Update using `tree` command: `tree -I 'node_modules|.pnpm-store|dist'`
