const { SlashCommandBuilder } = require('discord.js');

const imageFiles = [
  'image1',
  'image2'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('carte')
    .setDescription('Affiche une carte')
    .addStringOption(option =>
      option
        .setName('nom')
        .setDescription('Nom de la carte')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const filtered = imageFiles.filter(img => img.toLowerCase().startsWith(focusedValue));
    const choices = filtered.map(name => ({ name, value: name })).slice(0, 25);
    await interaction.respond(choices);
  },

  async execute(interaction) {
    const nomImage = interaction.options.getString('nom');
    const url = `https://raw.githubusercontent.com/XXXXX/bot-dti/main/images/${nomImage}.jpg`;
    await interaction.reply({ files: [url] });
  }
};
