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
		.setName('findusers')
        .addStringOption(option =>
            option.setName('with')
                .setDescription('Name of roles to include (separate with commas)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('without')
                .setDescription('Names of roles to include (separate with commas)')
                .setRequired(true))
		.setDescription('Allows finding users by role.'),
	async execute(interaction) {
        const allowRoles = interaction.options.getString('with').split(',').map(s => s.trim())
        const filterRoles = interaction.options.getString('without').split(',').map(s => s.trim())

        const filterIds = new Set()
        for (const roleName of filterRoles) {
            role = getRole(interaction.guild, roleName)
            if (role === undefined) {
                await interaction.reply(`Could not find any role with name ${roleName}`);
                return
            }
            role.members.forEach(member => {
                filterIds.add(member.id)
            });      
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

        allowed = allowRoles.join('and')
        filtered = filterRoles.join('or')
        message = `Found ${allowedUsers.length} users with ${allowed} but not ${filtered}:\n`
        message += formatMembers(allowedUsers)
    
		await interaction.reply({ content: message, ephemeral: true});
	},
};
