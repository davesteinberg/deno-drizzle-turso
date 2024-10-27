# Deno, Drizzle, and libSQL Starter

This project is based on [Get Started with Drizzle and SQLite](https://orm.drizzle.team/docs/get-started/sqlite-new), but adapted for Deno.

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

## Quick start

1. Install the required packages:

   ```sh
   deno install
   ```

2. Setup connection variables:

   ```sh
   cp .env.template .env
   ```

3. [Apply the above workaround](#libsql-client-issue) to use Drizzle Kit with a local database file.

4. Apply the schema to the database:

   ```sh
   deno task drizzle-kit push
   ```

5. Run the [main.ts](src/main.ts) script to seed and query the database.

   ```sh
   deno run -ERWS --allow-ffi --env-file src/main.ts
   ```

## From scratch

These steps mirror those in [Get Started with Drizzle and SQLite](https://orm.drizzle.team/docs/get-started/sqlite-new), allowing you to recreate this project from scratch.

0. Add to [deno.json](deno.json): `"nodeModulesDir": "auto"`.
   This creates a `node_modules` directory when adding packages, which is required by Drizzle Kit.

1. Install required packages:

   ```sh
   deno add npm:drizzle-orm npm:@libsql/client
   deno add -D npm:drizzle-kit
   ```

   We don't need the `dotenv` and `tsx` packages, as they provide capabilities that are built in to Deno.

2. Setup connection variables: See [.env.template](.env.template).

3. Connect Drizzle ORM to the database: See [main.ts](src/main.ts).
   Note that it uses the Node client (by importing from "drizzle-orm/libsql/node"), instead of the default web client that does not support local file URLs.

4. Create a table: See [schema.ts](src/db/schema.ts).

5. Setup Drizzle config file: See [drizzle.config.ts](drizzle.config.ts).

   You must also [apply the above workaround](#local-file-database-issue) to use Drizzle Kit with a local database file.

6. Apply changes to the database (using the `drizzle-kit` task defined in [deno.json](deno.json)):

   ```sh
   deno task drizzle-kit push
   ```

7. Seed and query the database: See [main.ts](src/main.ts).

8. Run the [main.ts](src/main.ts) script:

   ```sh
   deno run -ERWS --allow-ffi --env-file src/main.ts
   ```

   You can also use the `start` or `dev` task.
