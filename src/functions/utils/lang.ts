import fs from "fs";
import path from "path";

const dirname = import.meta.dirname;

interface Replacements {
  [key: string]: string;
}

interface TranslationOptions {
  locale: string;
  replacements?: Replacements;
}

const languages: Record<string, any> = {};

const loadLanguage = (lang: string): Record<string, any> | null => {
  if (!languages[lang]) {
    try {
      const data = fs.readFileSync(path.resolve(dirname, `../../../languages/${lang}.json`), "utf8");
      languages[lang] = JSON.parse(data);
    } catch (error) {
      console.error(`Error loading language file: ${error instanceof Error ? error.message : error}`);
      return null;
    }
  }
  return languages[lang];
};

const t = (key: string, { locale, replacements = {} }: TranslationOptions): string => {

  const language = loadLanguage(locale);

  if (!language) {
    return key;
  }

  let translated = key.split(".").reduce<Record<string, any> | string | null>((obj, i) => (obj ? (obj as any)[i] : null), language) || key;
  
  if (typeof translated === "string") {
    for (const [searchValue, replaceValue] of Object.entries(replacements)) {
      translated = translated.replace(new RegExp(`{{${searchValue}}}`, "g"), replaceValue);
    }
  }

  return translated as string;
};

export { t };