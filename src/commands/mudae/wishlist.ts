import { ApplyOptions } from '@sapphire/decorators';
import type { PaginatedMessageActionButton, PaginatedMessageActionContext } from '@sapphire/discord.js-utilities';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';

import { Command } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { ButtonStyle, Colors, ComponentType, EmbedBuilder } from 'discord.js';
import { sendLoadingMessage } from '../../lib/utils';
import { xiao } from '../../db/xiao';
import type { Wish } from '../../db/schema/wishes';

const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const capitalize = (s: string) => s.split(' ').map(upperFirst).join(' ');

@ApplyOptions<Command.Options>({
  aliases: ['wl', 'desejos'],
  description: 'Custom Mudae wishlist',
  generateDashLessAliases: true
})
export class UserCommand extends Command {
  public async messageRun(message: Message) {
    const response = await sendLoadingMessage(message);

    const previousButton: PaginatedMessageActionButton = {
      style: ButtonStyle.Primary,
      type: ComponentType.Button,
      label: 'Previous',
      customId: 'previous',
      run({ handler }: PaginatedMessageActionContext) {
        if (handler.index === 0) {
          handler.index = handler.pages.length - 1;
        } else {
          --handler.index;
        }
      }
    }

    const nextButton: PaginatedMessageActionButton = {
      style: ButtonStyle.Primary,
      type: ComponentType.Button,
      label: 'Next',
      customId: 'next',
      run({ handler }: PaginatedMessageActionContext) {
        if (handler.index === handler.pages.length - 1) {
          handler.index = 0;
        } else {
          ++handler.index;
        }
      }
    }

    const userId = message.mentions.users.first()?.id || message.author.id;

    const paginatedMessage = new PaginatedMessage({
      template: new EmbedBuilder().setColor(Colors.Blurple)
        .setTitle(`${message.mentions.users.first()?.username || message.author.username}'s Wishlist`),
      actions: [previousButton, nextButton]
    });

    const wishes = await xiao.getWishes(userId);

    if (wishes.length === 0) {
      return response.edit('You have no wishes');
    }

    const chunks = wishes.reduce((resultArray: Wish[][], item: Wish, index: number) => {
      const chunkIndex = Math.floor(index / 10)

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []
      }

      resultArray[chunkIndex].push(item)

      return resultArray
    }, []);

    for (const chunk of chunks) {
      const embed = new EmbedBuilder().setColor(Colors.Blurple);

      const characters = chunk.filter(wish => wish.type === 'character');
      const series = chunk.filter(wish => wish.type === 'series');

      const description = [];


      if (characters.length > 0) {
        description.push('### Characters');
        description.push(...characters.map(wish =>
          wish.category ?
            `${capitalize(wish.target)} (${wish.category}` :
            `${capitalize(wish.target)}`)
        );
      }

      if (series.length > 0) {
        description.push('### Series');
        description.push(...series.map(wish => capitalize(wish.target)));
      }

      embed.setDescription(description.join('\n'));

      paginatedMessage.addPageBuilder(builder => builder.setEmbeds([embed]));
    }

    await paginatedMessage.run(response, message.author);
    return response;
  }
}
