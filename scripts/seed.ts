import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { hashPassword } from '../src/utils/hashVerify';

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('Seeding database...');

  const hashedPassword = await hashPassword('password');
  
  const [admin, user1, user2] = await db.insert(schema.users).values([
    {
      name: 'Admin User',
      birthday: '1990-01-01',
      sex: 'male',
      email: 'vitapulse911@gmail.com',
      contact: '+1234567890',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      status: true,
    },
    {
      name: 'John Doe',
      birthday: '1995-05-15',
      sex: 'male',
      email: 'testdev@gmail.com',
      contact: '+1234567891',
      password: hashedPassword,
      isVerified: true,
    },
    // {
    //   name: 'Jane Smith',
    //   birthday: '1992-08-20',
    //   sex: 'female',
    //   email: 'jane@example.com',
    //   contact: '+1234567892',
    //   password: hashedPassword,
    //   isVerified: true,
    // },
  ]).returning();

  // await db.insert(schema.bpPulseRecords).values([
  //   {
  //     user_id: user1.id,
  //     systolic: 120,
  //     diastolic: 80,
  //     bpStatus: 'Normal',
  //     pulse: 72,
  //     pulseStatus: 'Normal',
  //     clinicalBpLabel: 'Normal',
  //     timestamp: new Date().toISOString(),
  //   },
  //   {
  //     user_id: user2.id,
  //     systolic: 140,
  //     diastolic: 90,
  //     bpStatus: 'High',
  //     pulse: 85,
  //     pulseStatus: 'Elevated',
  //     clinicalBpLabel: 'Stage 1 Hypertension',
  //     timestamp: new Date().toISOString(),
  //   },
  // ]);

  // await db.insert(schema.devices).values([
  //   {
  //     userId: user1.id,
  //     deviceId: 'DEV-001',
  //     deviceName: 'John\'s Monitor',
  //   },
  //   {
  //     userId: user2.id,
  //     deviceId: 'DEV-002',
  //     deviceName: 'Jane\'s Monitor',
  //   },
  // ]);

  console.log('✅ Seeding complete!');
  await sql.end();
}

seed().catch(console.error);