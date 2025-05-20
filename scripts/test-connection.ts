// Only needed for local scripts, not in production build!
if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config({ path: '.env.local' });
}

import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL!,
    });

    await client.connect();
    const db = drizzle(client);

    const result = await client.query('SELECT 1');
    console.log('✅ Connection successful:', result.rows);

    await client.end();
}

main().catch((err) => {
    console.error('❌ Connection failed:', err);
    process.exit(1);
});