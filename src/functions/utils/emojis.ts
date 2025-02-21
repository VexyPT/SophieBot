import { formatEmoji } from "discord.js";
import fs from "node:fs/promises";

type EmojiList = typeof import("#emojis");

const filepath = process.env.ENV === "dev" ? "emojis.dev.json" : "emojis.json";
const file = await fs.readFile(filepath, "utf-8");
const emojis: EmojiList = JSON.parse(file);

type IconKey = keyof EmojiList["animated"] | keyof EmojiList["static"];
type IconInfo = { id: string, animated?: boolean, toString(): string };
type Icon = Record<IconKey, IconInfo>;

const icon: Icon = Object.create({});

const transform = (emojis: Record<string, string>, animated?: boolean) => {
    for(const [name, id] of Object.entries(emojis)){
        function toString(){
            return formatEmoji(id, animated);
        }
        const data = { id, animated, toString };
        Object.assign(icon, { [name]: data });
    }
};

transform(emojis.static);
transform(emojis.animated, true);

export { icon };