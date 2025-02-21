import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";

createCommand({
    name: "ping",
    description: "teste",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        interaction.reply("Pong!");
    }
});