const { SlashCommandBuilder, SlashCommandRoleOption } = require('discord.js');

function getRole(guild, roleName) {
    return guild.roles.cache.find(
        role => role.name.localeCompare(roleName, undefined, { sensitivity: 'base' }) === 0)
}

function formatMember(member) {
    return `${member.displayName} [${member.user.tag}]`
}

function formatMembers(members) {
    return members.map(formatMember).join('\n')
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
        .addStringOption(option =>
            option.setName('include')
                .setDescription('Name of roless to include (separate with commas)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('exclude')
                .setDescription('Names of roles to include (separate with commas)')
                .setRequired(true))
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
        const allowRoles = interaction.options.getString('include').split(',').map(s => s.trim())
        const filterRoles = interaction.options.getString('exclude').split(',').map(s => s.trim())

        const filterIds = new Set()
        for (const roleName of filterRoles) {
            role = getRole(interaction.guild, roleName)
            if (role === undefined) {
                await interaction.reply(`Could not find any role with name ${roleName}`);
                return
            }
            for (const member of role.members) {
                filterIds.add(member.id)
            }          
        }

        const allowedUsers = []
        for (const roleName of allowRoles) {
            role = getRole(interaction.guild, roleName)
            if (role === undefined) {
                await interaction.reply(`Could not find any role with name ${roleName}`);
                return
            }
            role.members.forEach(member => {
                if (filterIds.has(member.id)) {
                    return
                }
                allowedUsers.push(member)                
            });       
        }

        message = `Users with ${allowRoles.join('and')} but not ${filterRoles.join('or')}:\n`
        message += formatMembers(allowedUsers)
    
		await interaction.reply({ content: message, ephemeral: true});
	},
};
