// Only load dotenv in local/dev
// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }
// import { drizzle } from 'drizzle-orm/postgres-js'
// import postgres from 'postgres'
// const connectionString = process.env.DATABASE_URL!
// // Disable prefetch as it is not supported for "Transaction" pool mode
// export const client = postgres(connectionString, { prepare: false })
// export const db = drizzle(client);


import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, {
    ssl: { rejectUnauthorized: false },
    // prepare: true  ← default, safe in session-mode
});

export const db = drizzle(client);