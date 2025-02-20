import ck from "chalk";
import { Message } from "discord.js";
import { baseStorage } from "./base.storage.js";

export interface PrefixCommandData {
    name: string;
    description?: string;
    alias?: string[];
    run(message: Message, args: (string | undefined)[]): void;
}

export type GenericPrefixCommandData = PrefixCommandData;

export async function basePrefixCommandHandler(message: Message) {
    const { content } = message;

    const [base, ...args] = content.split(" ");
    if (!base.startsWith(process.env.DEFAULT_PREFIX)) return;
    const commandName = base.replace("!", "");
    const command = baseStorage.prefix.get(commandName) ?? baseStorage.prefix.find(
        command => command.alias && command.alias.some(alias => alias === commandName)
    );
    if (!command) return;

    command.run(message, args);
}

export function basePrefixCommandLog(data: GenericPrefixCommandData) {
    baseStorage.loadLogs.commands
    .push(ck.green(`[!PREFIX] ${ck.blue.underline(data.name)} command loaded!`))
};