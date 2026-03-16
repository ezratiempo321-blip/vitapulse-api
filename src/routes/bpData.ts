import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';
import { db } from '../db';
import { devices, bpPulseRecords, alertHistory, users } from '../db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { getBpAndPulseByAge } from '../utils/bpByAge';
import { sendAlertEmail } from '../utils/emailConf';

const app = new Hono();

// Device ID pattern: VP-XXXX-XXXX (VP = VitaPulse, X = alphanumeric)
const DEVICE_ID_PATTERN = /^VP-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

const bpDataSchema = z.object({
    deviceId: z.string().regex(DEVICE_ID_PATTERN, 'Invalid device.'),
    systolic: z.number().int().min(50).max(300),
    diastolic: z.number().int().min(30).max(200),
    pulse: z.number().int().min(20).max(300),
    // timestamp: z.string().or(z.number()),
    timestamp: z.string().or(z.number()).optional(),
});

// Receive BP data from physical device (no JWT - uses deviceId)
app.post('/', validator('json', (value, c) => {
    const parsed = bpDataSchema.safeParse(value);
    if (!parsed.success) {
        return c.json({ message: 'Validation failed', errors: parsed.error.format() }, 400);
    }
    return parsed.data;
}), async (c) => {
    const { deviceId, systolic, diastolic, pulse } = c.req.valid('json');

    const timestamp = new Date().toISOString();
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();

    console.log('Received BP data:', { deviceId, systolic, diastolic, pulse });

    try {
        // 1. Check if device exists and is active (status = 1)
        const deviceRecord = await db
            .select()
            .from(devices)
            .where(and(eq(devices.deviceId, deviceId), eq(devices.status, 1)))
            .limit(1);

        if (!deviceRecord[0]) {
            return c.json({ message: 'Device not found or not active' }, 404);
        }

        const userId = deviceRecord[0].userId;

        // 2. Get user info (for age + email)
        const userRecord = await db
            .select({
                id: users.id,
                email: users.email,
                birthday: users.birthday,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!userRecord[0]) {
            return c.json({ message: 'User not found' }, 404);
        }

        const { email, birthday } = userRecord[0];

        // Calculate age from birthday
        const age = new Date().getFullYear() - new Date(birthday).getFullYear();

        // 3. Get BP status
        const getStatus = getBpAndPulseByAge(systolic, diastolic, pulse, age);
        if (!getStatus) return c.json({ message: 'Unexpected error calculating BP status' }, 500);

        const { bpStatus, pulseStatus, clinicalBpLabel } = getStatus;

        // 4. Check for duplicate timestamp
        // const isBpTheSame = await db
        //     .select({ timestamp: bpPulseRecords.timestamp })
        //     .from(bpPulseRecords)
        //     .where(eq(bpPulseRecords.timestamp, String(timestamp)));
        const isBpTheSame = await db
            .select({ timestamp: bpPulseRecords.timestamp })
            .from(bpPulseRecords)
            .where(
                and(
                    eq(bpPulseRecords.user_id, userId),
                    gte(bpPulseRecords.timestamp, thirtySecondsAgo)
                )
            )
            .limit(1);

        if (isBpTheSame[0]) return c.json({ message: 'Same data already saved' }, 200);

        // 5. Check if abnormal → send alert email
        const isAbnormal =
            [
                'Hypertensive Crisis',
                'Hypertension Stage 2',
                'Hypertension Stage 1',
                'Elevated',
                'Low',
                'Low BP (Hypotension)',
            ].includes(bpStatus) || ['High', 'Low'].includes(pulseStatus);

        if (isAbnormal) {
            const isAlertSent = await sendAlertEmail(
                email,
                `Blood Pressure: ${clinicalBpLabel}. Consider going to the nearest clinic.`
            );

            if (isAlertSent) {
                await db.insert(alertHistory).values({
                    user_id: userId,
                    message: `Bp: ${clinicalBpLabel} Pulse: ${pulseStatus}`,
                    timestamp: new Date(Date.now()).toISOString(),
                });
            }
        }

        // 6. Save BP record
        await db.insert(bpPulseRecords).values({
            user_id: userId,
            systolic,
            diastolic,
            pulse,
            bpStatus,
            pulseStatus,
            clinicalBpLabel,
            timestamp: String(timestamp),
        });

        return c.json({ message: 'Blood pressure saved successfully' }, 201);

    } catch (error) {
        console.error('Error saving BP data from device:', error);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

export { app as bpDataPublicRoute };