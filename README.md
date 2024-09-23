# Expense tracker REST API

## Overview

This REST API allows you to manage users, categories and expenses in an expense tracking application.
It provides 13 endpoints for interacting with the resources.

## Endpoints

- /api/auth/login
- /api/users
- /api/categories
- /api/expenses

## Technologies

- NestJS with TypeScript.
- MongoDB as the database with Mongoose ODM.
- Docker container for MongoDB.
- jsonwebtoken package for verifying tokens.
- class-validator package for validating user inputs.

## Getting started

1. Install the dependencies:

```bash
$ npm i
```

2. Clone the configuration file: Copy the .env.template to .env and adjust the environment variables as needed.
3. Run the Docker container:

```bash
$ docker compose up -d
```

4. Run the app:

```bash
$ npm run start:dev
```
