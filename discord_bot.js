const Discord = require('discord.js');
const strava = require('strava-v3');
var CronJob = require('cron').CronJob;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const dotenv = require('dotenv');
const path = require("path");
const fs = require("fs");
const client = new Discord.Client({
    intents: [
      "GUILDS",
      "GUILD_MEMBERS",
      "GUILD_BANS",
      "GUILD_EMOJIS",
      "GUILD_INTEGRATIONS",
      "GUILD_MESSAGE_REACTIONS",
      "GUILD_WEBHOOKS",
      "GUILD_INVITES",
      "GUILD_VOICE_STATES",
      "GUILD_PRESENCES",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_TYPING",
      "DIRECT_MESSAGES",
      "DIRECT_MESSAGE_REACTIONS",
      "DIRECT_MESSAGE_TYPING"
    ],
    partials: [
      "MESSAGE",
      "CHANNEL",
      "REACTION",
    ]
  })

dotenv.config();

var client_id = process.env.STRAVA_CLIENT_ID;
var client_secret = process.env.STRAVA_CLIENT_SECRET;
var refresh_token = process.env.STRAVA_REFRESH_TOKEN;

function getAccessToken() {
  var url = "https://www.strava.com/oauth/token";

  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  
  xhr.onreadystatechange = function () {
     if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          console.log(response);
          access_token = response.access_token;
          refresh_token = response.refresh_token;
          console.log("Access Token: " + access_token);
          console.log("Refresh Token: " + refresh_token);
          return access_token;
        }
     }};
  
  var data = `{
    "client_id": "${client_id}",
    "client_secret": "${client_secret}",
    "grant_type": "refresh_token",
    "refresh_token": "${refresh_token}"
  }`;
  
  xhr.send(data);
}

var access_token = getAccessToken()

async function getClubActivites() {
  //get club activites
  const activites = await strava.clubs.listActivities({
    'access_token': access_token,
    'id': 'berkeley-high-cycling',
    'per_page': '5'
  });
  console.log(`Got Activites`);
  console.log(activites);

  // convert meters to miles

  function convertMetersToRoundedMiles(meters) {
    return Math.round(meters * 0.000621371 * 100) / 100;
  };

  // convert meters to feet
  function convertMetersToRoundedFeet(meters) {
    return Math.round(meters * 3.28084 * 100) / 100;
  }

  // convert seconds to hh:mm:ss
  function convertSecondsToTime(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var seconds = seconds % 60;
    return (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

  const embed = {
    color: 0xfc4c02,
    title: 'Recent Club Rides',
    thumbnail: {
      url: 'https://pbs.twimg.com/profile_images/900411562250256384/ALkwa0jf_400x400.jpg',
    },
    fields: [
      {
        name: `${activites[0].name} | ${activites[0].athlete.firstname} ${activites[0].athlete.lastname}`,
        value: `Distance: \`\`${convertMetersToRoundedMiles(activites[0].distance)} mi\`\`
        Elevation Gain: \`\`${convertMetersToRoundedFeet(activites[0].total_elevation_gain)} ft\`\`
        Elapsed Time: \`\`${convertSecondsToTime(activites[0].elapsed_time)}\`\`
        Moving Time: \`\`${convertSecondsToTime(activites[0].moving_time)}\`\`
        Type: \`\`${activites[0].type}\`\``,
        inline: false
      },
      {
        name: `${activites[1].name} | ${activites[1].athlete.firstname} ${activites[1].athlete.lastname}`,
        value: `Distance: \`\`${convertMetersToRoundedMiles(activites[1].distance)} mi\`\`
        Elevation Gain: \`\`${convertMetersToRoundedFeet(activites[1].total_elevation_gain)} ft\`\`
        Elapsed Time: \`\`${convertSecondsToTime(activites[1].elapsed_time)} minutes\`\`
        Moving Time: \`\`${convertSecondsToTime(activites[1].moving_time)} minutes\`\`
        Type: \`\`${activites[1].type}\`\``,
        inline: false
      },
      {
        name: `${activites[2].name} | ${activites[2].athlete.firstname} ${activites[2].athlete.lastname}`,
        value: `Distance: \`\`${convertMetersToRoundedMiles(activites[2].distance)} mi\`\`
        Elevation Gain: \`\`${convertMetersToRoundedFeet(activites[2].total_elevation_gain)} ft\`\`
        Elapsed Time: \`\`${convertSecondsToTime(activites[2].elapsed_time)} minutes\`\`
        Moving Time: \`\`${convertSecondsToTime(activites[2].moving_time)} minutes\`\`
        Type: \`\`${activites[2].type}\`\``,
        inline: false
      },
      {
        name: `${activites[3].name} | ${activites[3].athlete.firstname} ${activites[3].athlete.lastname}`,
        value: `Distance: \`\`${convertMetersToRoundedMiles(activites[3].distance)} mi\`\`
        Elevation Gain: \`\`${convertMetersToRoundedFeet(activites[3].total_elevation_gain)} ft\`\`
        Elapsed Time: \`\`${convertSecondsToTime(activites[3].elapsed_time)} minutes\`\`
        Moving Time: \`\`${convertSecondsToTime(activites[3].moving_time)} minutes\`\`
        Type: \`\`${activites[3].type}\`\``,
        inline: false
      },
      {
        name: `${activites[4].name} | ${activites[4].athlete.firstname} ${activites[4].athlete.lastname}`,
        value: `Distance: \`\`${convertMetersToRoundedMiles(activites[4].distance)} mi\`\`
        Elevation Gain: \`\`${convertMetersToRoundedFeet(activites[4].total_elevation_gain)} ft\`\`
        Elapsed Time: \`\`${convertSecondsToTime(activites[4].elapsed_time)} minutes\`\`
        Moving Time: \`\`${convertSecondsToTime(activites[4].moving_time)} minutes\`\`
        Type: \`\`${activites[4].type}\`\``,
        inline: false
      }
    ],
    timestamp: new Date(),
  };
  //edit message by message id
  client.channels.fetch('865501544840822786').then(channel => {
    console.log(channel);
    // channel.send({embeds: [embed]});
    channel.messages.fetch('869095213073829939').then(message => {
      message.edit({embeds: [embed]});
    });
  });
};

var refreshAccessToken = new CronJob('0 * * * *', function() {
  access_token = getAccessToken();
}, null, true, 'America/Los_Angeles');

var refreshClubActivites = new CronJob('*/15 * * * *', function() {
  getClubActivites();
}, null, true, 'America/Los_Angeles');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`Join our strava club! | /strava`, { type: "PLAYING"});
  refreshClubActivites.start();
  refreshAccessToken.start();
});

// client.on('debug', console.log);

// bot owner commands
client.on('messageCreate', async message => {
	if (!client.application?.owner) await client.application?.fetch();

  const messageContent = message.content.split(" ");

	if (messageContent[0].toLowerCase() === '!deploy_slash_command' && message.author.id === client.application?.owner.id) {

    const data = {
			name: 'strava_user',
			description: 'Get information about a Strava username. Must be in the Berkley High Cycling Club on Strava.',
      options: [
        {
        name: 'username',
        type: 'STRING',
        description: `The user's username`,
        required: true
        }                      
      ]
		};

		const command = await client.guilds.cache.get(message.guild.id)?.commands.create(data);
		console.log(command);
    message.reply(`Deployed your Slash Command`);
	}
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

  if (interaction.commandName === 'help') {    
    const helpEmbed = {
      color: 0xfdb614,
      title: 'Berkeley High Cycling',
      description: "Hello, and welcome to the Berkeley High Cycling Discord!\n\nHere, you can schedule rides, keep updated with the Club, and much more.\n\nI'm the BHS Cycling Discord Bot, and I'm here to help out! You can see a list of avalible commands by typing `/`.",
      thumbnail: {
        url: 'https://cdn.discordapp.com/icons/865312044068634634/7beb3fce0696960ff406cc34ef2a2338.webp?size=256',
      },
      timestamp: new Date(),
    };

    await interaction.reply({ embeds: [helpEmbed] });
  };

  if (interaction.commandName === 'strava') {
    const response = await strava.clubs.get({'access_token': access_token, 'id': "berkeley-high-cycling"});

    const stravaEmbed = {
      color: 0xfc4c02,
      title: 'Strava',
      description: "Join the official Strava Club to compete with other club athletes, see the leaderboards, and more!\n\n[https://www.strava.com/clubs/berkeley-high-cycling](https://www.strava.com/clubs/berkeley-high-cycling)",
      thumbnail: {
        url: 'https://pbs.twimg.com/profile_images/900411562250256384/ALkwa0jf_400x400.jpg',
      },
      timestamp: new Date(),
      footer: {
        text: `Member Count: ${response.member_count}`,
      },
    };

    await interaction.reply({ embeds: [stravaEmbed] });
  };

  if (interaction.commandName === 'next_ride') {
    const response = await strava.clubs.listEvents({'access_token': access_token, 'id': "berkeley-high-cycling"});

    console.log(response);

    var dateTime = new Date(response[0].upcoming_occurrences[0]);

    function skillLevelString(skill_level) {
      if (skill_level === 1) {
        return "Casual (No Drop)";
      } else if (skill_level === 2) {
        return "Tempo"
      } else {
        return "Race Pace"
      };
    };
      
    function terrainTypeString(terrain_type) {
      if (terrain_type === 0) {
        return "Mostly Flat";
      } else if (terrain_type === 1) {
        return "Rolling Hills"
      } else {
        return "Killer Climbs"
      };
    };

    var skillLevel = skillLevelString(response[0].skill_levels);
    var terrainType = terrainTypeString(response[0].terrain);

    const stravaEmbed = {
      color: 0xfc4c02,
      title: response[0].title,
      url: `https://www.strava.com/clubs/960150/group_events/${response[0].id}`,
      description: response[0].description,
      thumbnail: {
        url: 'https://pbs.twimg.com/profile_images/900411562250256384/ALkwa0jf_400x400.jpg',
      },
      // add fields
      fields: [
        {
          name: 'Time',
          value: dateTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
          inline: true
        },
        {
          name: 'Location',
          value: response[0].address,
          inline: true
        },
        {
          name: 'Skill Level',
          value: skillLevel,
          inline: true
        },
        {
          name: 'Terrain Type',
          value: terrainType,
          inline: true
        }
      ],
      timestamp: new Date(),
      footer: {
        text: `Event created by ${response[0].organizing_athlete.firstname}`,
      },
    };

    await interaction.reply({ embeds: [stravaEmbed] });
  };

  if (interaction.commandName === 'calendar') {
    const embed = {
      color: 0xfc4c02,
      title: 'Calendar',
      url: 'https://calendar.google.com/calendar/u/0?cid=NXYzYzkyZTl2Njh0NTdlcGRzOTcxcWhzdWNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ',
      description: 'Add the BHS Calendar Events to YOUR Calendar! Integrate with Google Calendar using the link above, or [integrate with a different calendar](https://calendar.google.com/calendar/ical/5v3c92e9v68t57epds971qhsuc%40group.calendar.google.com/public/basic.ics)',
      timestamp: new Date(),
    };
  
    await interaction.reply({ embeds: [embed] });
  };

  if (interaction.commandName === 'sc_list') {
    const command = await client.guilds.cache.get(interaction.guild.id)?.commands.fetch();
    const iterator1 = command[Symbol.iterator]();

    var list = '';

    for (const item of iterator1) {
      var field = '**/'+ item[1].name + ':**\nDescription:\n*' + item[1].description + '*\nID:\n`' + item[1].id + '`\n'
      list = list + field;
    }

    list = list.slice(0, -1);

    if(list.length < 1) {
      list = "No Slash Commands"
    }

    await interaction.reply({ content: list, ephemeral: true });
  }

  if (interaction.commandName === 'sc_create') {
    var name_arr = interaction.options.get('name');
    var description_arr = interaction.options.get('description');

    var name = name_arr.value;
    var description = description_arr.value;

    const data = {
			name: name,
			description: description
		};

    try{
      const command = await client.guilds.cache.get(interaction.guild.id)?.commands.create(data);
      await interaction.reply(`Created command *${name}*`);
    }
    catch(err) {
      await interaction.reply(`Error`);
    };
  };

  if (interaction.commandName === 'sc_perms') {
    var command_arr = interaction.options.get('command');
    var type_arr  = interaction.options.get('type');
    var id_arr = interaction.options.get('id');
    var allowdeny_arr = interaction.options.get('allowdeny');

    var command_id = command_arr.value;
    var type = type_arr.value;
    var id = id_arr.value;
    var allowdeny = allowdeny_arr.value;

		const command = await client.guilds.cache.get(interaction.guild.id)?.commands.fetch(command_id);

    if (allowdeny === "true") {
      var permission = true;
    }
    else {
      var permission = false;
    };

		const permissions = [
			{
				id: id,
				type: type,
				permission: permission,
			},
		];

		await command.permissions.add({ permissions });
    
    await interaction.reply({ content: `Updated permissions!`, ephemeral: true });
  };

  if (interaction.commandName === 'sc_delete') {
    var id_arr = interaction.options.get('id');

    var id = id_arr.value;
    try {
      var command = await client.guilds.cache.get(interaction.guild.id)?.commands.fetch(id);
      var name = command.name;
      command.delete();
      await interaction.reply({ content: `Deleted command *${name}*`, ephemeral: true });
    }
    catch (err) {
      await interaction.reply({ content: `Error`, ephemeral: true });
    };
  };
});

// get reaction
client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.id == '871048479139577866') {
    if (reaction.emoji.name == 'strava_logo') {
      const memberWhoReacted = await reaction.message.guild.members.fetch(user.id);
      memberWhoReacted.roles.add('870756385804152863');
      console.log(`Added role to ${user.username}`);
    };
  };
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.message.id == '871048479139577866') {
    if (reaction.emoji.name == 'strava_logo') {
      const memberWhoReacted = await reaction.message.guild.members.fetch(user.id);
      memberWhoReacted.roles.remove('870756385804152863');
      console.log(`Removed role from ${user.username}`);
    };
  };
});

client.login(process.env.BOT_TOKEN);