import { z } from "zod";

const envSchema = z.object({
    BOT_TOKEN: z.string({ description: "Discord Bot Token is required" }).min(1),
    WEBHOOK_LOGS_URL: z.string().url().optional(),
    MONGO_URI: z.string({ description: "MongoDb URI is required" }).min(1),
    SERVER_PORT: z.string().refine(v => !Number.isNaN(Number(v)), "Invalid server port").optional(),
    // Env vars...
});

type EnvSchema = z.infer<typeof envSchema>;

export { envSchema, type EnvSchema };