import { createEvent } from "#base";
import { Guild, TextChannel, time } from "discord.js";

createEvent({
    name: "Command Logger",
    event: "interactionCreate",
    run(interation) {
        if(interation.isCommand()) {
            const {
                guild, client, channel, user, commandName, createdAt, commandType
            } = interation;

            const logsGuild = client.guilds.cache.get(process.env.MAIN_GUILD_ID) as Guild;
            const logsChannel = logsGuild.channels.cache.get(process.env.COMMAND_LOGS_ID!) as TextChannel;
            if(!logsChannel) return;
            const emoji = ["⌨️", "👤", "✉️"];
            const text = [
                "usou o comando",
                "usou o contexto de usuário",
                "usou o contexto de mensagem"
            ];

            let content = `${emoji[commandType - 1]} ${time(createdAt, "R")}`;
            content += `**@${user.username}**(${user.id}) `;
            content += `__${text[commandType - 1]}__ `;
            content += `\`${commandName}\` `;
            if(channel) content += `em ${channel.url} - ${guild}`;

            logsChannel.send({ content });
            return;
        }
    }
});