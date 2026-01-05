require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const isProduction = process.env.NODE_ENV === 'production';
let databaseUrl = process.env.DATABASE_URL;

if (isProduction && databaseUrl) {
  databaseUrl = databaseUrl.replace(/[?&]sslmode=[^&]*/g, '');
  databaseUrl = databaseUrl.replace(/[?&]ssl=(true|false)/g, '');
  databaseUrl = databaseUrl.replace(/[?&]$/, '');
}

const poolConfig = {
  connectionString: databaseUrl,
};

if (isProduction) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolConfig);

async function updateUserCodes() {
  try {
    console.log('Connecting to database...');

    // Get all users with codes longer than 6 characters
    const result = await pool.query(
      'SELECT id, user_code FROM users WHERE LENGTH(user_code) > 6'
    );

    console.log(`Found ${result.rows.length} users with long codes`);

    if (result.rows.length === 0) {
      console.log('No users need updating.');
      return;
    }

    // Update each user with a new 6-character code
    for (const user of result.rows) {
      const newCode = nanoid(6);
      await pool.query(
        'UPDATE users SET user_code = $1 WHERE id = $2',
        [newCode, user.id]
      );
      console.log(`Updated user ${user.id}: ${user.user_code} -> ${newCode}`);
    }

    console.log('All user codes updated successfully!');
  } catch (error) {
    console.error('Error updating user codes:', error.message);
  } finally {
    await pool.end();
  }
}

updateUserCodes();
