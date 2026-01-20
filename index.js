/* Import Required Modules */
require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const cors = require('cors');

/* Initialize Express App */
const app = express();
app.use(express.json());
app.use(cors());

/* Discord Client Setup */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

/* Bot Ready Event */
client.once('ready', () => {
  console.log(`Logged In As ${client.user.tag}`);
});

/* Role Configuration Map */
const ROLE_MAP = {
  'among-us': '1433199512020586506',
  'general-ping': '1388890622538289163',
  'vc-ping': '845287190036086825',
  'gaming-ping': '849383861334835202',
  'syrian': '699296516455661709',
  'non-syrian': '699296715701878934'
};

/* Health Check Endpoint */
app.get('/', (req, res) => {
  res.send('Syria Backend Is Running Smoothly');
});

/* Role Assignment Endpoint */
app.post('/api/assign-role', async (req, res) => {
  /* Extract Data From Request */
  const { userId, roleKey } = req.body;

  /* Validate Input Presence */
  if (!userId || !roleKey) {
    return res.status(400).json({ success: false, message: 'Missing User ID Or Role Key' });
  }

  try {
    /* Check Bot Connection */
    if (!client.isReady()) {
      throw new Error('Bot Is Not Connected To Discord');
    }

    /* Fetch Guild Information */
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) {
      throw new Error('Guild Not Found Or Bot Is Not In Server');
    }

    /* Fetch Member Object */
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) {
      return res.status(404).json({ success: false, message: 'User Not Found In Server' });
    }

    /* Get Role ID From Map */
    const roleId = ROLE_MAP[roleKey];
    if (!roleId) {
      return res.status(400).json({ success: false, message: 'Invalid Role Key' });
    }

    /* Assign The Role */
    await member.roles.add(roleId);
    
    /* Return Success Response */
    return res.status(200).json({ success: true, message: `Role ${roleKey} Assigned Successfully` });

  } catch (error) {
    /* Log Error For Debugging */
    console.error('Role Assignment Error:', error);
    
    /* Return Safe User Error */
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal Server Error' 
    });
  }
});

/* Login Bot Safely */
client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Bot Login Failed:', err);
});

/* Start Express Server */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
