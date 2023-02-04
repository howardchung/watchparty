import { Client, IntentsBitField, Events } from 'discord.js';
import config from './config';
import axios from 'axios';

// URL to invite bot: https://discord.com/api/oauth2/authorize?client_id=1071394728513380372&permissions=2147485696&scope=bot

const HOST_NAME = 'https://www.watchparty.me';

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});

client.on('ready', () => {
  console.log('I am ready!');
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'watch') {
    console.log(interaction.options);
    // Call the watchparty API to make a room
    const response = await axios.post(HOST_NAME + '/createRoom', {
      video: interaction.options.get('video')?.value,
    });
    // Return the generated room URL
    await interaction.reply({ content: HOST_NAME + '#' + response.data.name });
  }
});

client.login(config.DISCORD_BOT_TOKEN);
