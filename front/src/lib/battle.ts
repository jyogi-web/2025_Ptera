import type { Card } from "@/types/app";

/**
 * ダミーカードを生成する
 */
export const createDummyCard = (): Card => {
  const id = `dummy-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    creatorId: "system",
    name: "勧誘中...",
    grade: 1,
    position: "未定",
    hobby: "特になし",
    description: "まだ見ぬ新入部員",
    imageUrl: "", // No Image
    createdAt: new Date(),
    expiryDate: new Date(),
    maxHp: 600, // Average HP
    attack: 150, // Average Attack
    flavor: "これから期待の新人。",
  };
};

/**
 * サークルメンバーからデッキ（5枚）を構築する
 * 足りない場合はダミーで埋める
 */
export const buildDeck = (cards: Card[]): Card[] => {
  // 1. シャッフル
  const shuffled = [...cards].sort(() => 0.5 - Math.random());

  // 2. 5枚選出
  const deck = shuffled.slice(0, 5);

  // 3. 不足分をダミーで埋める
  while (deck.length < 5) {
    deck.push(createDummyCard());
  }

  return deck;
};

// バトルの型定義
export interface BattleState {
  myCircleName: string;
  opponentCircleName: string;
  myDeck: Card[]; // [0] is active, [1-4] are bench
  opponentDeck: Card[]; // [0] is active, [1-4] are bench
  myHp: number; // プレイヤーHP (倒されたカード数許容枠) - 今回は「相手を全滅させたら勝ち」とするなら、残存カード数などでもよいが、仕様通り「相手プレイヤーHP」とする
  opponentHp: number;
  turn: number;
  logs: string[];
  winner: "player" | "opponent" | null;
}

export const INITIAL_PLAYER_HP = 3;

export const initializeBattle = (
  myCircleName: string,
  myCards: Card[],
  opponentCircleName: string,
  opponentCards: Card[],
): BattleState => {
  return {
    myCircleName,
    opponentCircleName,
    myDeck: buildDeck(myCards),
    opponentDeck: buildDeck(opponentCards),
    myHp: INITIAL_PLAYER_HP,
    opponentHp: INITIAL_PLAYER_HP,
    turn: 1,
    logs: ["バトル開始！"],
    winner: null,
  };
};
