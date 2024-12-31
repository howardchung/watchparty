"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = __importDefault(require("./config"));
const axios_1 = __importDefault(require("axios"));
const redis_1 = require("./utils/redis");
// URL to invite bot: https://discord.com/api/oauth2/authorize?client_id=1071394728513380372&permissions=2147485696&scope=bot
const HOST_NAME = 'https://www.watchparty.me';
const API_NAME = 'https://backend.watchparty.me';
const client = new discord_js_1.Client({
    intents: [discord_js_1.IntentsBitField.Flags.Guilds, discord_js_1.IntentsBitField.Flags.GuildMessages],
});
client.on('ready', () => {
    console.log('I am ready!');
    console.log('bot is in %s guilds', client.guilds.cache.size);
});
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.commandName === 'watch') {
        const preload = interaction.options.get('video')?.value;
        // Call the watchparty API to make a room
        const response = await axios_1.default.post(API_NAME + '/createRoom', {
            video: preload,
        });
        (0, redis_1.redisCount)('discordBotWatch');
        // Return the generated room URL
        await interaction.reply({
            content: `Created a new WatchParty${preload ? ` with video ${preload}` : ''}!
${HOST_NAME + '/watch' + response.data.name}
`,
        });
    }
});
client.login(config_1.default.DISCORD_BOT_TOKEN);
