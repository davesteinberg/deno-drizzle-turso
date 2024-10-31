# Deno, Drizzle, and Turso Starter

This project covers basic use of a local database file with libSQL and of a hosted Turso database via HTTP.
It is based on the following Drizzle and Turso tutorials, but adapted for Deno:

- [Get Started with Drizzle and SQLite](https://orm.drizzle.team/docs/get-started/sqlite-new)
- [Get Started with Drizzle and Turso](https://orm.drizzle.team/docs/get-started/turso-new)
- [Turso Quickstart](https://docs.turso.tech/quickstart)
- [Turso TypeScript/JS Quickstart](https://docs.turso.tech/sdk/ts/quickstart)

## libSQL client issue

One complication is that Drizzle Kit creates the libSQL client for you, using the @libsql/client package's default [. export](https://github.com/tursodatabase/libsql-client-ts/blob/e9db106651333b5111a640c1ea0d141a281d0aba/packages/libsql-client/package.json#L28), which on Deno is the web client, not the fully-featured Node client.
The web client [does not support](https://docs.turso.tech/sdk/ts/reference#local-development) local file URLs or embedded replicas for Turso databases.

A similar shortcoming was recently fixed in [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm/releases/tag/0.35.3).
Hopefully, a solution will come to Drizzle Kit, as well (see [this question](https://github.com/drizzle-team/drizzle-orm/discussions/3122) and [this Discord post](https://discord.com/channels/1043890932593987624/1070810929475883038/1300278316414009415)).
In the mean time, there is a hacky workaround: You can patch @libsql/client to export the Node client on Deno by default:

```sh
sed -i -e 's/"deno"/"no-deno"/' node_modules/@libsql/client/package.json
```

Of course, note that this only changes the cached version of the package.
It will need to be repeated after reinstalling or updating the package.

To revert to the web client:

```sh
sed -i -e 's/"no-deno"/"deno"/' node_modules/@libsql/client/package.json
```

## Quick start: Local database file

1. Install the required packages:

   ```sh
   deno install
   ```

2. Setup connection variables:

   ```sh
   cp .env.template .env
   ```

3. [Apply the above workaround](#libsql-client-issue) to use Drizzle Kit with a local database file.

4. Apply the SQL migration to the database:

   ```sh
   deno task db:migrate
   ```

5. Run the [main.ts](src/main.ts) script to seed and query the database.

   ```sh
   deno run -ERWS --allow-ffi --env-file src/main.ts
   ```

## Quick start: Turso database

1. Install the required packages:

   ```sh
   deno install
   ```

2. [Sign up](https://app.turso.tech/signup) for Turso.

3. [Install](https://docs.turso.tech/cli/installation) the Turso CLI.

4. Log in to the CLI:

   ```sh
   turso auth login
   ```

5. Create a database:

   ```sh
   turso db create starter
   ```

   Note: This creates a default group for your database in your nearest location.

6. Create an authentication token and setup connection variables:

   ```sh
   echo "DB_URL=$(turso db show --url starter)" > .env
   echo "DB_AUTH_TOKEN=$(turso db tokens create starter)" >> .env
   ```

7. Apply the SQL migration to the database:

   ```sh
   deno task db:migrate
   ```

8. Edit [main.ts](src/main.ts), changing the first `import` to use the libSQL web client:

   ```ts
   // import { drizzle } from "drizzle-orm/libsql/node";
   import { drizzle } from "drizzle-orm/libsql/web";
   ```

9. Run the [main.ts](src/main.ts) script to seed and query the database:

   ```sh
   deno run -EN --env-file src/main.ts
   ```

## From scratch

These steps mirror those in [Get Started with Drizzle and Turso](https://orm.drizzle.team/docs/get-started/turso-new), allowing you to recreate this project from scratch.
You can use a local database file or a hosted Turso databse.
Differences between the two options are noted along the way.

0. Create a basic Deno project (`deno init <project>`), and add to [deno.json](deno.json): `"nodeModulesDir": "auto"`.
   When adding packages, this option will create a `node_modules` directory, which is required by Drizzle Kit.

1. Install required packages:

   ```sh
   deno add npm:drizzle-orm npm:@libsql/client
   deno add -D npm:drizzle-kit
   ```

   We don't need the `dotenv` and `tsx` packages, as they provide capabilities that are built in to Deno.

2. Setup connection variables.
   Follow [Quick start: Local database file](#quick-start-local-database-file) step 2 or [Quick start: Turso database](#quick-start-turso-database) steps 2-6, depending on which type of database you wish to use.

3. Connect Drizzle ORM to the database: See the module-scope `db` constant in [main.ts](src/main.ts).
   Note that it uses the libSQL Node client by importing from "drizzle-orm/libsql/node", instead of the default web client that does not support local file URLs.
   If you are using a Turso database without an embedded replica, you may choose to switch to the web client by changing the import to "drizzle-orm/libsql/web".

4. Create a table: See [schema.ts](src/db/schema.ts).

5. Setup Drizzle config file: See [drizzle.config.ts](drizzle.config.ts).

   If you are using the libSQL Node client, you must [apply the above workaround](#local-file-database-issue) to have Drizzle Kit use it as well.

6. Apply changes to the database:

   ```sh
   deno run -A --env-file npm:drizzle-kit push
   ```

   Or, to generate and apply a SQL migration:

   ```sh
   deno run -A --env-file npm:drizzle-kit generate
   deno run -A --env-file npm:drizzle-kit migrate
   ```

   The generated migration is committed to this repository under the [drizzle](drizzle) directory.

   Note that you can add `drizzle-kit`, `db:generate`, and `db:migrate` tasks to [deno.json](deno.json) to simplify running these commands.

7. Seed and query the database: See the `main()` function in [main.ts](src/main.ts).

8. Run the [main.ts](src/main.ts) script:

   ```sh
   # Web client:
   deno run -EN --env-file src/main.ts

   # Node client:
   deno run -ERWS --allow-ffi --env-file src/main.ts
   ```

   You can also add tasks that do this, like `start` and `dev`, to [deno.json](deno.json).
   Note that only the above permissions are required, depending on the client you are using.
   The example tasks in this repository grant the all the permissions required by both clients, in order to work with either.
