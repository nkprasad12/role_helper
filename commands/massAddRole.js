const { SlashCommandBuilder } = require('discord.js');

const OPTION_ROLE = 'role'
const OPTION_USERS = 'users'


function getRole(guild, roleName) {
    return guild.roles.cache.find(
        role => role.name.localeCompare(roleName, undefined, { sensitivity: 'base' }) === 0)
}

function formatMember(member) {
    return `${member.displayName} [${member.user.tag}]`
}

function formatMembers(members) {
    return members.map(formatMember).join('\n') + `\nAll Tags:\n${members.map(member => member.id).join(",")}`
}

function parseListOption(interaction, key) {
    const rawValue = interaction.options.getString(key);
    if (rawValue === null) {
        return [];
    }
    return rawValue.split(',').map(s => s.trim())
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('massaddrole')
        .addRoleOption(option =>
            option.setName(OPTION_ROLE)
                .setDescription('The role to add users to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName(OPTION_USERS)
                .setDescription('Users to include (separate with commas)')
                .setRequired(true))
        .setDescription('Allows mass adding users to a role.'),

    async execute(interaction) {
        const role = interaction.options.getRole(OPTION_ROLE)
        const usersToAdd = parseListOption(interaction, OPTION_USERS)
        const failures = []
        for (const userId of usersToAdd) {
            const user = interaction.guild.members.cache.get(userId)
            try {
              await user.roles.add(role)
            }
            catch (e) {
                console.log(e)
                failures.push(`${userId} (${user.displayName})`)
            }
        }
        const message = failures.length === 0 ? "Success!" : `Failed to add role to:\n${failures.join("\n")}`
        await interaction.reply({ content: message, ephemeral: true })
    },
}
