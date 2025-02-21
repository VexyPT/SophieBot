import ck from "chalk";
import { Message, TextChannel, time } from "discord.js";
import { baseStorage } from "./base.storage.js";
import { db } from "#database";

export interface PrefixCommandData {
    name: string;
    description?: string;
    alias?: string[];
    run(message: Message, args: (string | undefined)[]): void;
}

export type GenericPrefixCommandData = PrefixCommandData;

export async function basePrefixCommandHandler(message: Message, guildId: string) {
    const { content } = message;
    if (!guildId) return;
    const prefix = String((await db.guilds.get(guildId)).prefix);

    const [base, ...args] = content.split(" ");
    if (!base.startsWith(prefix)) return;
    const commandName = base.replace(prefix, "");
    const command = baseStorage.prefix.get(commandName) ?? baseStorage.prefix.find(
        command => command.alias && command.alias.some(alias => alias === commandName)
    );
    if (!command) return;

    try {
        command.run(message, args);
    } catch (error) {
        console.error("Erro ao executar comando de prefixo:", error);
        return;
    }

    // Sistema de logs
    const { client, author, channel, guild, createdAt } = message;
    
    const logsGuild = client.guilds.cache.get(process.env.MAIN_GUILD_ID!);
    if (!logsGuild) return;

    const logsChannel = logsGuild.channels.cache.get(process.env.COMMAND_LOGS_ID!) as TextChannel;
    if (!logsChannel) return;

    const emoji = "🖌️";
    const timeString = time(createdAt, "R");
    const userInfo = `**@${author.username}** (${author.id})`;
    const commandInfo = `\`${command.name}\``;
    
    let location = "";
    if (channel instanceof TextChannel) {
        location = `em ${channel.url} - ${guild?.name || "DM"}`;
    } else {
        location = "em um canal desconhecido";
    }

    const logContent = `${emoji} ${timeString} ${userInfo} __usou o comando de prefixo__ ${commandInfo} ${location}`;

    logsChannel.send({ content: logContent })
        .catch((err: any) => console.error("Falha ao enviar log:", err));
}

export function basePrefixCommandLog(data: GenericPrefixCommandData) {
    baseStorage.loadLogs.commands
    .push(ck.green(`[PREFIX] ${ck.blue.underline(data.name)} command loaded!`))
};