require("dotenv").config();

const Discord = require("discord.js"),
  client = new Discord.Client({
    intents: [
      "GUILDS",
      "GUILD_MEMBERS",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
    ],
  }),
  procenv = process.env,
  unb = (() => {
    const { Client } = require("unb-api");
    return new Client(procenv.UNBTOKEN);
  })(),
  // Remove .defult when in production
  Enmap = require("enmap").default,
  db = new Enmap({ name: "db" }),
  events = require("./events");

function login() {
  client.login(procenv.TOKEN).catch(() => {
    console.log("Failed to login! Retrying in 5 seconds...");
    setTimeout(login, 5000);
  });
}

login();

client.on("ready", () => {
  console.log("Logged in as " + client.user.tag);
  db.ensure("lastPost", 0);
});

client.on("messageCreate", async (message) => {
  if (
    events.channels[
      events.rewards.indexOf(events.determineEventReward(message))
    ] != message.channel.id
  )
    return;

  if (lastPost > Date.now()) return;

  let logChannel;

  try {
    logChannel = await client.channels.fetch(procenv.LOGCHANNEL);
  } catch (e) {
    console.log(e);
  }

  if (!message.member.roles.cache.has(procenv.MODROLE)) return;

  let fetchedEntries

  try {
    fetchedEntries = await message.channel.messages.fetch({ limit: 100 });
  } catch (e) {
	      console.log(e);
  }

  let lastMessage = fetchedEntries.last();

  if (lastMessage.author.id != client.user.id) let winner;

  winner = lastMessage.mentions.users.first();
});
