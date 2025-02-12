import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";

createCommand({
    name: "test",
    description: "app command",
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        interaction.reply({ content: "Hello World!" });
    }
});