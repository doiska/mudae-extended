import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { PieceContext } from '@sapphire/pieces';
import { ModalSubmitInteraction } from 'discord.js';
import { xiao } from '../db/xiao';
import type { Wish } from '../db/schema/wishes';

export class NewWishModal extends InteractionHandler {
  public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit
    });
  }

  public override parse(_interaction: ModalSubmitInteraction) {
    if (_interaction.customId !== 'new-wish-modal') {
      return this.none();
    }

    return this.some();
  }

  public async run(interaction: ModalSubmitInteraction) {

    const characters = interaction.fields.getTextInputValue('characters')
      .split('\n')
      .map(s => ({
        type: 'character',
        target: s
      })) as Wish[];

    const series = interaction.fields.getTextInputValue('series')
      .split('\n')
      .map(s => ({
        type: 'series',
        target: s
      })) as Wish[];

    const wishes = [...characters, ...series];

    await xiao.setWishes(interaction.user.id, wishes);

    return interaction.reply({
      content: 'Wishes saved!'
    })
  }
}