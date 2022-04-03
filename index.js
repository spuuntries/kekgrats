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
    ] !== message.channel.id
  )
    return;
});
