import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { Colors, EmbedBuilder, userMention } from 'discord.js';
import { xiao } from '../db/xiao';

// import { xiao } from '../db/xiao';

@ApplyOptions<Listener.Options>({ event: Events.MessageCreate, once: false })
export class CharacterSpawn extends Listener {

  public run(message: Message) {
    if (!message.author.bot) {
      return;
    }

    if (message.author.id !== '432610292342587392') {
      return;
    }

    const hasEmbed = message?.embeds?.[0];

    if(!hasEmbed) {
      return;
    }

    const isKakera = message?.embeds?.[0].description?.includes('kakera');
    const hasImage = message.embeds?.[0].image?.url;

    if (!isKakera || !hasImage) {
      return;
    }

    const characterName = message.embeds?.[0].author?.name;
    const description = message.embeds?.[0].description?.split('\n').filter(line => !line.includes('kakera')).join(' ');

    if(!characterName || !description) {
      return;
    }

    const allWishes = xiao.getAllCachedWishes();

    const whoWants = [];

    for (const [userId, value] of allWishes.entries()) {
      if (characterName) {
        if (value.filter(wish => wish.target === characterName).length > 0) {
          whoWants.push(userId);
        }
      }

      if (description) {
        if (value.filter(wish => wish.target === description).length > 0) {
          whoWants.push(userId);
        }
      }
    }

    if(!whoWants.length) {
      return;
    }

    console.log(JSON.stringify(message, null, 2));

    console.log(`A character appeared!`, { characterName, description, whoWants });

    const mentions = [...new Set(whoWants)].map(userId => userMention(userId));

    const embed = new EmbedBuilder()
      .setDescription(`### **${characterName}** appeared!\n${mentions.join(' ')} you wished for this!`)
      .setColor(Colors.Gold);

    message.channel.send({ embeds: [embed], content: mentions.join(' ') });
  }
}
