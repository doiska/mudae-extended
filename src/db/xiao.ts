import type { Wish } from './schema/wishes';
import { wishes as wishesTable } from './schema/wishes';
import { db } from './db';
import { and, eq } from 'drizzle-orm';

class _Xiao {

  private _wishes: Map<string, Wish[]> = new Map();

  constructor() {
    db.select().from(wishesTable).then((wishes) => {
      console.log(wishes);

      this._wishes = wishes.reduce((acc, wish) => {
        const wishes = acc.get(wish.userId) ?? [];
        wishes.push(wish);
        acc.set(wish.userId, wishes);
        return acc;
      }, new Map<string, Wish[]>());

      console.log(`Xiao loaded wishes!`);
      console.log(this._wishes);

    });
  }

  public async wish(userId: string, wish: Wish) {
    const userWishes = await this.getWishes(userId)

    const hasWish = userWishes.some(w =>
      w.target.toLowerCase() === wish.target.toLowerCase() &&
      w.type === wish.type
    );

    if (hasWish) {
      return;
    }

    await db.insert(wishesTable).values({
      userId,
      target: wish.target.toLowerCase(),
      type: wish.type
    });

    userWishes.push(wish);
    this._wishes.set(userId, userWishes);
  }

  public async getWishes(userId: string): Promise<Wish[]> {

    if (!this._wishes.has(userId)) {
      await this.loadWishes(userId);
    }

    return this._wishes.get(userId) ?? [];
  }

  public getAllCachedWishes(): Map<string, Wish[]> {
    return this._wishes;
  }

  public async setWishes(userId: string, wishes: Wish[]) {
    this._wishes.set(userId, wishes);

    await db.delete(wishesTable).where(eq(wishesTable.userId, userId));

    await db.transaction((transaction) => {
      const insertions = wishes.map(wish => {
        return {
          userId,
          target: wish.target.toLowerCase(),
          type: wish.type
        }
      });

      return transaction.insert(wishesTable).values(insertions);
    });
  }

  public async deleteWish(userId: string, wish: string, type?: string) {
    const userWishes = this._wishes.get(userId) ?? [];

    const omitWish = userWishes.filter(w => w.target.toLowerCase() !== wish && w.type !== type);

    this._wishes.set(userId, omitWish);

    await db.delete(wishesTable).where(and(
      eq(wishesTable.target, wish.toLowerCase()),
      eq(wishesTable.userId, userId)
    ));
  }

  private async loadWishes(userId: string) {
    const wishes = await db.select().from(wishesTable).where(eq(wishesTable.userId, userId));
    this._wishes.set(userId, wishes.map(w => ({ target: w.target.toLowerCase(), type: w.type })));
  }
}

export const xiao = new _Xiao();