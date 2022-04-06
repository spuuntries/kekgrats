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
});

client.on("messageCreate", async (message) => {
  if (
    events.channels[
      events.rewards.indexOf(events.determineEventReward(message))
    ] != message.channel.id
  )
    return;

  let lastPost = db.ensure("lastPost", 0);

  if (lastPost > Date.now()) return;

  /** @type {Discord.TextChannel} */
  let logChannel,
    eventMeta = events.determineEventReward(message);

  try {
    logChannel = await client.channels.fetch(procenv.LOGCHANNEL);
  } catch (e) {
    console.log(e);
    return;
  }

  if (!message.member.roles.cache.has(procenv.MODROLE)) return;

  let fetchedEntries;

  try {
    fetchedEntries = Array.from(
      (await message.channel.messages.fetch({ limit: 30 })).values()
    );
  } catch (e) {
    console.log(e);
    return;
  }

  let lastMessage = fetchedEntries[fetchedEntries.length - 1],
    votingMessage = fetchedEntries[fetchedEntries.length - 2],
    winner;

  if (lastMessage.author.id == client.user.id)
    winner = lastMessage.mentions.users.first();

  let success = [];

  if (winner) {
    try {
      await unb.editUserBalance(message.guild.id, winner.id, eventMeta.winner);
      success.push("winner");
    } catch (e) {
      console.log(e);
    }
  }

  let participants;

  if (votingMessage.author.id == client.user.id)
    participants = Array.from(votingMessage.mentions.users.values()).filter(
      (u) => u.id != client.user.id && u.id != winner.id
    );

  if (participants) {
    participants.forEach(async (participant, i) => {
      try {
        await unb.editUserBalance(
          message.guild.id,
          participant.id,
          eventMeta.participant
        );
        success.push("participant");
      } catch (e) {
        console.log(e);
      }
    });
    success = [...new Set(success)];
  }

  let embed = new Discord.MessageEmbed()
    .setTitle(
      `<t:${new Date().valueOf() / 1000}:f> ${
        Object.keys(events.events)[events.rewards.indexOf(eventMeta)]
      } rewards log`
    )
    .setAuthor({
      name: message.author.tag,
      iconURL: message.author.avatarURL(),
    })
    .setColor(0x00ff00)
    .setDescription(
      `Winner: ${winner ? winner.tag : "No winner"}\nParticipants: ${
        message.mentions.users.size
      }\nRaw result: [${participants.map((u) => u.tag).join(", ")}]`
    )
    .setFooter({
      text: `Amount of cookies distributed: ${
        winner
          ? eventMeta.winner
          : 0 + eventMeta.participant * participants
          ? participants.length
          : 0
      }`,
    });

  logChannel.send({
    embeds: [embed],
  });

  lastPost =
    Date.now() +
    events.time[Object.keys(events.events)[events.rewards.indexOf(eventMeta)]];

  db.set("lastPost", lastPost);

  console.log(
    `[${new Date()}] distributed rewards for ${
      Object.keys(events.events)[events.rewards.indexOf(eventMeta)]
    }`
  );
});
