import { z } from "zod";

const envSchema = z.object({
    BOT_TOKEN: z.string({ description: "Discord Bot Token is required" }).min(1),
    DEFAULT_PREFIX: z.string({ description: "Default Prefix is required" }).min(1),
    MONGO_URI: z.string({ description: "MongoDb URI is required" }).min(1),
    SERVER_PORT: z.string().refine(v => !Number.isNaN(Number(v)), "Invalid server port").optional(),
    MAIN_GUILD_ID: z.string().refine(v => !Number.isNaN(Number(v)), "Invalid GuildID (MAIN_GUILD_ID"),
    WEBHOOK_LOGS_URL: z.string().url().optional(),
    COMMAND_LOGS_ID: z.string().refine(v => !Number.isNaN(Number(v)), "Invalid ChannelID (COMMAND_LOGS_ID)").optional(),
    // Env vars...
});

type EnvSchema = z.infer<typeof envSchema>;

export { envSchema, type EnvSchema };