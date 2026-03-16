import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';
import { db } from '../../db';
import { devices, bpPulseRecords, alertHistory, users } from '../../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { getBpAndPulseByAge } from '../../utils/bpByAge';
import { sendAlertEmail } from '../../utils/emailConf';

const app = new Hono();

// Device ID pattern: VP-XXXX-XXXX (VP = VitaPulse, X = alphanumeric)
const DEVICE_ID_PATTERN = /^VP-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

const registerDeviceSchema = z.object({
    // userId: z.number().int().positive(),
    deviceId: z.string()
        .min(1)
        .max(255)
        .regex(DEVICE_ID_PATTERN, 'Invalid device ID format.'),
    // deviceName: z.string().min(1).max(255).optional(),
});

// Register device
app.post('/register', validator('json', (value, c) => {
    const parsed = registerDeviceSchema.safeParse(value);
    if (!parsed.success) {
        return c.json({ message: 'Validation failed', errors: parsed.error.format() }, 400);
    }
    return parsed.data;
}), async (c) => {
    const { deviceId } = c.req.valid('json');
    const { id: userId } = await c.get('jwtPayload');
    const deviceName = deviceId;

    try {
        // Check if user already has a connected device (status = 1)
        const existingDevice = await db.select().from(devices).where(
            and(
                eq(devices.userId, userId),
                eq(devices.status, 1)
            )
        );

        if (existingDevice.length > 0) {
            return c.json({
                message: 'User already has a device registered. Please disconnect the old device first.'
            }, 400);
        }

        // Check if device ID is already in use by ANOTHER user with status = 1 (connected)
        const deviceExists = await db.select().from(devices).where(
            and(
                eq(devices.deviceId, deviceId),
                eq(devices.status, 1),
                ne(devices.userId, userId)
            )
        );

        if (deviceExists.length > 0) {
            return c.json({ message: 'This device is currently registered. Please disconnect it from the other account before registering.' }, 400);
        }

        // Register the device
        const [newDevice] = await db.insert(devices).values({
            userId,
            deviceId,
            deviceName,
            status: 1,
        }).returning();

        return c.json({
            message: 'Device registered successfully',
            // device: newDevice,
        }, 201);

    } catch (error) {
        console.error('Error registering device:', error);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// Get device status for logged-in user
app.get('/status', async (c) => {
    try {
        const { id: userId } = c.get('jwtPayload');


        const userDevices = await db
            .select()
            .from(devices)
            .where(and(eq(devices.userId, userId), eq(devices.status, 1)))
            .limit(1);

        if (userDevices.length === 0) {
            return c.json({
                has_device: false,
                device_id: null,
                registered_at: null,
            });
        }

        const device = userDevices[0];

        return c.json({
            has_device: true,
            device_id: device.deviceId,
            device_name: device.deviceName,
            registered_at: device.registeredAt,
        });
        
        // // Dummy device data for testing
        // // Remove this and uncomment actual DB logic when ready
        // // Example dummy device
        // const device = {
        //     deviceId: 'VP-1A2B-3C4D',
        //     deviceName: 'Test Device',
        //     createdAt: new Date().toISOString(),
        // };

        // return c.json({
        //     has_device: true,
        //     device_id: device.deviceId,
        //     device_name: device.deviceName,
        //     registered_at: device.createdAt,
        // });
    } catch (error) {
        console.error('Error checking device status:', error);
        return c.json({ error: 'Failed to check device status' }, 500);
    }
});

// Disconnect device
app.delete('/disconnect', async (c) => {
    try {
        const { id: userId } = c.get('jwtPayload');

        const result = await db
            .update(devices)
            .set({ status: 0 })
            .where(and(eq(devices.userId, userId), eq(devices.status, 1)))
            .returning();

        if (result.length === 0) {
            return c.json({ message: 'No active device found to disconnect' }, 404);
        }

        return c.json({ message: 'Device disconnected successfully' });
    } catch (error) {
        console.error('Error disconnecting device:', error);
        return c.json({ error: 'Failed to disconnect device' }, 500);
    }
});


// Get all devices for a user (including disconnected) // Not needed
app.get('/history', async (c) => {
    try {
        const { id: userId } = c.get('jwtPayload');

        const userDevices = await db
            .select()
            .from(devices)
            .where(eq(devices.userId, userId))
            .orderBy(devices.registeredAt);

        return c.json({ devices: userDevices });
    } catch (error) {
        console.error('Error fetching device history:', error);
        return c.json({ error: 'Failed to fetch device history' }, 500);
    }
});


export { app as deviceRoutes };

