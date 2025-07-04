require('dotenv').config();

const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');

const deployCommands = require('./deploy-commands');

const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT || 3000;

const app = express();

// Serveur web minimal pour UptimeRobot
app.get('/', (req, res) => {
  res.send('Bot Discord en ligne !');
});
app.listen(PORT, () => {
  console.log(`Serveur web démarré sur le port ${PORT}`);
});

// Initialisation du client Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Chargement des commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, async () => {
  console.log(`Connecté en tant que ${client.user.tag}`);

  // Mettre le bot en statut invisible (optionnel)
  try {
    await client.user.setStatus('invisible');
    console.log('Statut du bot défini sur invisible');
  } catch (error) {
    console.error('Erreur lors du changement de statut :', error);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (!command?.autocomplete) return;
    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error('Erreur autocomplétion :', error);
    }
  } else if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Erreur exécution commande :', error);
      await interaction.reply({ content: 'Erreur lors de la commande.', ephemeral: true });
    }
  }
});

// Déploiement global des commandes puis connexion du bot
(async () => {
  await deployCommands();
  client.login(TOKEN);
})();
