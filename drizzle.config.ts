// Only load dotenv in local/dev
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: './.env' });
}

export default {
    schema: ['./drizzle/schema/*.{ts,js}'],
    out: './drizzle/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    schemaFilter: ['public'],
};