const Discord = require('azrael-djs');
const botconfig = require('./botconfig.json');
const config = require('./botconfig.json');
const messageHandler = require('./messageHandler.js');
const bot = new Discord.Client({
            intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "MESSAGE_CONTENT"]
})
const deleter = require('./deleter.js');
let guild = bot.guilds.cache.get(botconfig.guild);

let Guild = null;

let channels = [];

bot.on("ready", async () => {
  guild = bot.guilds.cache.get(botconfig.guild);
  messageHandler.init(bot.user.id, bot.guilds.cache.get(botconfig.guild), botconfig.messages)
  console.log(`${bot.user.username} is working!`);

  botconfig.channels.forEach(c => {
    c = guild.channels.cache.get(c);
    switch (c.type) {
      case 'GUILD_TEXT':
        channels.push(c);
        break;
      case 'GUILD_CATEGORY':
        for (let chan of guild.channels.cache.filter(_c => _c.parentID === c.id && _c.type === 'GUILD_TEXT').values()) {
            channels.push(chan);
        }
        break;
    }
  });


});

bot.on('message', message => messageHandler.handle(message));

bot.on('error', err => console.error(err));

process.on('uncaughtException', err => console.error(err.stack));

process.on('unhandledRejection', err => console.error(`Uncaught Promise Rejection: \n${err.stack}`));

bot.on('guildMemberRemove', member => {
  if (member.guild.id !== botconfig.guild) return;
  const logChannel = bot.channels.cache.get(botconfig.logChannel);
  const guild = bot.guilds.cache.get(botconfig.guild);
  // logChannel.send(`Deleting messages from \`${member.user.tag}\``);
  deleter.delete(member.user, channels, n => {
    let deletedembed = new Discord.MessageEmbed()
      .setAuthor("Auto Purge", bot.user.displayAvatarURL())
      .setThumbnail(`${member.user.displayAvatarURL({ dynamic: true })}`)
      .addField("User Left", `**${member.user.tag}**\n\`${member.user.id}\``)
      .addField("Advertisements Deleted", `\`${n}\``)
      .setColor("c04949")
      .setFooter(`User joined ${member.joinedAt}`, guild.iconURL({
        dynamic: true
      }))

    if (botconfig.logChannel)
      logChannel.send(deletedembed);
  });
});

bot.login(botconfig.token);
