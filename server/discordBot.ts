import { Client, IntentsBitField, Events } from "discord.js";
import config from "./config.ts";
import { redisCount } from "./utils/redis.ts";

// URL to invite bot: https://discord.com/api/oauth2/authorize?client_id=1071394728513380372&permissions=2147485696&scope=bot

const HOST_NAME = "https://www.watchparty.me";
const API_NAME = "https://backend.watchparty.me";

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});

client.on("ready", () => {
  console.log("I am ready!");
  console.log("bot is in %s guilds", client.guilds.cache.size);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "watch") {
    const preload = interaction.options.get("video")?.value;
    // Call the watchparty API to make a room
    const response = await fetch(API_NAME + "/createRoom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video: preload,
      }),
    });
    const data = await response.json();
    redisCount("discordBotWatch");
    // Return the generated room URL
    await interaction.reply({
      content: `Created a new WatchParty${
        preload ? ` with video ${preload}` : ""
      }!
${HOST_NAME + "/watch" + data.name}
`,
    });
  }
});

client.login(config.DISCORD_BOT_TOKEN);
