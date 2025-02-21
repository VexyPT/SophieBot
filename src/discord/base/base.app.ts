import { baseErrorHandler, log } from "#settings";
import { CustomItents, CustomPartials } from "@magicyan/discord";
import { Client, ClientOptions, version as djsVersion, Guild, TextChannel, time } from "discord.js";
import { baseAutocompleteHandler, baseCommandHandler, baseRegisterCommands } from "./base.command.js";
import { baseRegisterEvents } from "./base.event.js";
import { baseResponderHandler } from "./base.responder.js";
import { baseStorage } from "./base.storage.js";
import glob from "fast-glob";
import ck from "chalk";
import { basePrefixCommandHandler } from "./base.prefix.js";

interface BootstrapOptions extends Partial<ClientOptions> {
    meta: ImportMeta;
	/**
	 * A list of paths that will be imported to load the project's structure classes
	 * 
	 * The paths are relative to the **workdir** folder
	 */
    directories?: string[];
    /** Send load logs in terminal */
    loadLogs?: boolean;
    /** Run before load directories */
    beforeLoad?(client: Client): void
    /** Run when client is ready */
    whenReady?(client: Client<true>): void;
}
export async function bootstrap(options: BootstrapOptions){
    const client = createClient(process.env.BOT_TOKEN, options);
    options.beforeLoad?.(client);
    
    await loadModules(options.meta.dirname, options.directories);

    if (options.loadLogs??true){
        loadLogs();
    }

    console.log();
    log.info("📦",
        `${ck.hex("#5865F2").underline("discord.js")} ${ck.dim(djsVersion)}`,
        "/",
        `${ck.hex("#68a063").underline("NodeJs")} ${ck.dim(process.versions.node)}`,
    );
    
    baseRegisterEvents(client);

    client.login();

    return { client };
}

async function loadModules(workdir: string, directories: string[] = []){
    const pattern = "**/*.{js,ts,jsx,tsx}";
    const files = await glob([
        `!./discord/index.*`,
        `!./discord/base/**/*`,
        `./discord/${pattern}`,
        directories.map(
            path => `./${path.replaceAll("\\", "/")}/${pattern}`
        )
    ].flat(), { absolute: true, cwd: workdir });

    await Promise.all(files.map(path => {
        return import(`file://${path}`);
    }));
}

function createClient(token: string, options: BootstrapOptions) {

    const client = new Client(Object.assign(options, {
        intents: options.intents ?? CustomItents.All,
        partials: options.partials ?? CustomPartials.All,
        failIfNotExists: options.failIfNotExists ?? false
    }));

    client.token=token;
    client.on("ready", async (client) => {
        await client.guilds.fetch().catch(() => null);

        log.log(ck.greenBright(`➝ Online as ${ck.hex("#57F287").underline(client.user.username)}`));
        
        await baseRegisterCommands(client);
        
        process.on("uncaughtException", err => baseErrorHandler(err, client));
        process.on("unhandledRejection", err => baseErrorHandler(err, client));
        
        options.whenReady?.(client);
    });

    client.on("interactionCreate", async (interaction) => {
        switch(true){
            case interaction.isAutocomplete():{
                baseAutocompleteHandler(interaction);
                return;
            }
            case interaction.isCommand(): {
                baseCommandHandler(interaction);
                const {
                    guild, client, channel, user, commandName, createdAt, commandType
                } = interaction;
    
                const logsGuild = client.guilds.cache.get(process.env.MAIN_GUILD_ID) as Guild;
                const logsChannel = logsGuild.channels.cache.get(process.env.COMMAND_LOGS_ID!) as TextChannel;
                if(!logsChannel) return;
                const emoji = ["⌨️", "👤", "✉️"];
                const text = [
                    "usou o comando",
                    "usou o contexto de usuário",
                    "usou o contexto de mensagem"
                ];
    
                let content = `${emoji[commandType - 1]} ${time(createdAt, "R")} `;
                content += `**@${user.username}**(${user.id}) `;
                content += `__${text[commandType - 1]}__ `;
                content += `\`${commandName}\` `;
                if(channel) content += `em ${channel.url} - ${guild}`;
    
                logsChannel.send({ content });
                return;
            }
            default: 
                baseResponderHandler(interaction);
                return;
        }
    });

    client.on("messageCreate", (message) => {
        basePrefixCommandHandler(message, message.guild?.id ?? "");
    });

    return client;
}

function loadLogs(){
    const logs = [
        baseStorage.loadLogs.commands,
        baseStorage.loadLogs.responders,
        baseStorage.loadLogs.events,
    ].flat();
    logs.forEach(text => log.success(text));
}