const { SlashCommandBuilder, SlashCommandRoleOption } = require('discord.js');

function getRole(guild, roleName) {
    return guild.roles.cache.find(
        role => role.name.localeCompare(roleName, undefined, { sensitivity: 'base' }) === 0)
}

function formatMembers(members) {
    return members.map(member => `${member.displayName} [${member.user.tag}]`).join('\n')
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
        const allowRoles = ["Civis"]
        const filterRoles = ["Eques"]

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
            for (const member of role.members) {
                if (filterIds.has(member.id)) {
                    continue
                }
                allowedUsers.push(member)
            }          
        }

        message = `Users with ${allowRoles.join('and')} but not ${filterRoles.join('or')}:\n`
        for (const member of allowedUsers) {
            console.log(member)
            console.log(member.displayName)
            console.log(member.user)
            console.log('\n')
        }
    
		await interaction.reply(message);
	},
};
