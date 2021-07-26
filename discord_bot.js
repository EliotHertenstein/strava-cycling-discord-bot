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
      "GUILD_WEBHOOKS",
      "GUILD_INVITES",
      "GUILD_VOICE_STATES",
      "GUILD_PRESENCES",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_TYPING",
      "DIRECT_MESSAGES",
      "DIRECT_MESSAGE_REACTIONS",
      "DIRECT_MESSAGE_TYPING"
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

var refreshClubActivites = new CronJob('*/15 * * * *', function() {
  getClubActivites();
}, null, true, 'America/Los_Angeles');

var refreshAccessToken = new CronJob('0 * * * *', function() {
  access_token = getAccessToken();
}, null, true, 'America/Los_Angeles');

async function getClubActivites() {
  //get club activites
  const activites = await strava.clubs.listActivities({
    'access_token': access_token,
    'id': 'berkeley-high-cycling',
    'per_page': '5'
  });
  console.log(activites);
  const embed = {
    color: 0xfc4c02,
    title: 'Recent Club Rides',
    thumbnail: {
      url: 'https://pbs.twimg.com/profile_images/900411562250256384/ALkwa0jf_400x400.jpg',
    },
    fields: [
      {
        name: `${activites[0].name} | ${activites[0].athlete.firstname} ${activites[0].athlete.lastname}`,
        value: `Distance: \`\`${activites[0].distance} mi\`\`
        Elevation Gain: \`\`${activites[0].total_elevation_gain} ft\`\`
        Elapsed Time: \`\`${activites[0].elapsed_time} minutes\`\`
        Moving Time: \`\`${activites[0].moving_time} minutes\`\`
        Type: \`\`${activites[0].type}\`\``,
        inline: false
      },
      {
        name: `${activites[1].name} | ${activites[1].athlete.firstname} ${activites[1].athlete.lastname}`,
        value: `Distance: \`\`${activites[1].distance} mi\`\`
        Elevation Gain: \`\`${activites[1].total_elevation_gain} ft\`\`
        Elapsed Time: \`\`${activites[1].elapsed_time} minutes\`\`
        Moving Time: \`\`${activites[1].moving_time} minutes\`\`
        Type: \`\`${activites[1].type}\`\``,
        inline: false
      },
      {
        name: `${activites[2].name} | ${activites[2].athlete.firstname} ${activites[2].athlete.lastname}`,
        value: `Distance: \`\`${activites[2].distance} mi\`\`
        Elevation Gain: \`\`${activites[2].total_elevation_gain} ft\`\`
        Elapsed Time: \`\`${activites[2].elapsed_time} minutes\`\`
        Moving Time: \`\`${activites[2].moving_time} minutes\`\`
        Type: \`\`${activites[2].type}\`\``,
        inline: false
      },
      {
        name: `${activites[3].name} | ${activites[3].athlete.firstname} ${activites[3].athlete.lastname}`,
        value: `Distance: \`\`${activites[3].distance} mi\`\`
        Elevation Gain: \`\`${activites[3].total_elevation_gain} ft\`\`
        Elapsed Time: \`\`${activites[3].elapsed_time} minutes\`\`
        Moving Time: \`\`${activites[3].moving_time} minutes\`\`
        Type: \`\`${activites[3].type}\`\``,
        inline: false
      },
      {
        name: `${activites[4].name} | ${activites[4].athlete.firstname} ${activites[4].athlete.lastname}`,
        value: `Distance: \`\`${activites[4].distance} mi\`\`
        Elevation Gain: \`\`${activites[4].total_elevation_gain} ft\`\`
        Elapsed Time: \`\`${activites[4].elapsed_time} minutes\`\`
        Moving Time: \`\`${activites[4].moving_time} minutes\`\`
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

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
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
			name: 'sc_perms',
			description: 'Set permissions of a Slash Command',
      options: [
        {
        name: 'command',
        type: 'STRING',
        description: 'The Slash Command ID',
        required: true,
        },  
        {
          name: 'id',
          type: 'STRING',
          description: 'The User or Role ID',
          required: true,
        }, 
        {
          name: 'type',
          type: 'STRING',
          description: 'Specify if ID is a User or a Role',
          required: true,
          choices: [
            {
              name: 'User',
              value: 'USER',
            },
            {
              name: 'Role',
              value: 'ROLE',
            }
          ]          
        },
        {
          name: 'allowdeny',
          type: 'STRING',
          description: 'Allow or Deny this user/role access',
          required: true,
          choices: [
            {
              name: 'Allow',
              value: 'true',
            },
            {
              name: 'Deny',
              value: 'false',
            }
          ]          
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
      color: 0x0099ff,
      title: 'Berkeley High Cycling',
      description: "Hello, and welcome to the Berkeley High Cycling Discord!\n\nHere, you can schedule rides, keep updated with the Club, and much more.\n\nI'm the BHS Cycling Discord Bot, and I'm here to help out! You can see a list of avalible commands by typing `/`.",
      thumbnail: {
        url: 'https://discord.com/assets/6f26ddd1bf59740c536d2274bb834a05.png',
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

client.login(process.env.BOT_TOKEN);