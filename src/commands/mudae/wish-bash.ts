import { ApplyOptions } from '@sapphire/decorators';
import { ActionRowBuilder, ApplicationCommandType, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { xiao } from '../../db/xiao';

@ApplyOptions<Command.Options>({
  name: 'quero',
  description: 'Custom Mudae wishlist'
})
export class UserCommand extends Command {

  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await this.showWishesModal(interaction);
  }


  public async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
    await this.showWishesModal(interaction);
  }

  private async showWishesModal(interaction: Command.ContextMenuCommandInteraction | Command.ChatInputCommandInteraction) {
    const modal = new ModalBuilder().setCustomId('new-wish-modal')
      .setTitle('Wish Controller');

    const wishes = await xiao.getWishes(interaction.user.id);

    const characters = new TextInputBuilder()
      .setLabel('Characters (one per line)')
      .setValue(wishes.filter(wish => wish.type === 'character').map(wish => wish.target).join('\n'))
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setCustomId('characters');

    const series = new TextInputBuilder().setLabel('Series (one per line)')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(wishes.filter(wish => wish.type === 'series').map(wish => wish.target).join('\n'))
      .setRequired(false)
      .setCustomId('series');

    const charactersRow = new ActionRowBuilder<TextInputBuilder>().addComponents(characters);
    const seriesRow = new ActionRowBuilder<TextInputBuilder>().addComponents(series);

    modal.addComponents(charactersRow, seriesRow);

    await interaction.showModal(modal);
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand({
      name: 'quero',
      description: this.description
    });

    registry.registerContextMenuCommand({
      name: 'View Wishes',
      type: ApplicationCommandType.User
    });
  }
}
