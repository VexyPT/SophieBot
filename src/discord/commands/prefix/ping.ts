import { createPrefixCommand } from "#base";

createPrefixCommand({
    name: "ping",
    alias: ["p"],
    description: "teste",
    async run(message) {
        message.reply("Pong!");
    }
});