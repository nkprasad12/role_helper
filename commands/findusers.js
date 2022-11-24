const { SlashCommandBuilder, SlashCommandRoleOption } = require('discord.js');

const OPTION_WITH = 'with'
const OPTION_WITHOUT = 'without'


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

function parseListOption(interaction, key) {
    return interaction.options.getString(key).split(',').map(s => s.trim())
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('findusers')
        .addStringOption(option =>
            option.setName(OPTION_WITH)
                .setDescription('Name of roles to include (separate with commas)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName(OPTION_WITHOUT)
                .setDescription('Names of roles to include (separate with commas)')
                .setRequired(true))
        .setDescription('Allows finding users by role.'),

    async execute(interaction) {
        const rolesToAllow = parseListOption(interaction, OPTION_WITH)
        const rolesToFilter = parseListOption(interaction, OPTION_WITHOUT)

        const idsToFilter = new Set()
        for (const roleName of rolesToFilter) {
            role = getRole(interaction.guild, roleName)
            if (role === undefined) {
                await interaction.reply(`Could not find any role with name ${roleName}`)
                return
            }
            role.members.forEach(member => {
                idsToFilter.add(member.id)
            })
        }

        const filteredUsers = []
        for (const roleName of rolesToAllow) {
            role = getRole(interaction.guild, roleName)
            if (role === undefined) {
                await interaction.reply(`Could not find any role with name ${roleName}`);
                return
            }
            role.members.forEach(member => {
                if (idsToFilter.has(member.id)) {
                    return
                }
                filteredUsers.push(member)
                idsToFilter.add(member.id)
            })
        }

        allowed = rolesToAllow.join('and')
        filtered = rolesToFilter.join('or')
        message = `Found ${filteredUsers.length} users with ${allowed} but not ${filtered}:\n`
        message += formatMembers(filteredUsers)
        await interaction.reply({ content: message, ephemeral: true })
    },
}
