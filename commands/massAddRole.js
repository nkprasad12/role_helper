const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const OPTION_ROLE = 'role'
const OPTION_USERS = 'users'


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
        .setDescription('Allows mass adding users to a role.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const role = interaction.options.getRole(OPTION_ROLE)
        const usersToAdd = parseListOption(interaction, OPTION_USERS)

        await interaction.deferReply({ephemeral: true})

        console.log("Fetching members")
        try {
            await interaction.guild.members.fetch({time: 10000})
        } catch (e) {
            console.log(e)
            console.log("Failed to fetch members")
            // return
        }

        const failures = []
        for (const userId of usersToAdd) {
            const user = interaction.guild.members.cache.get(userId)
            if (user === undefined) {
                failures.push(userId)
                continue
            }
            try {
              await user.roles.add(role)
            } catch (e) {
                console.log(e)
                failures.push(`${userId} (${user.displayName})`)
            }
        }
        const message = failures.length === 0 ? "Success!" : `Failed to add role to:\n${failures.join("\n")}`
        await interaction.editReply(message)
    },
}


/**
 * 
 */