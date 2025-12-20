import { useCallback, useState } from "react";
import { type BattleState, initializeBattle } from "@/lib/battle";
import type { Card } from "@/types/app";

export const useBattle = () => {
  const [battleState, setBattleState] = useState<BattleState | null>(null);

  // バトル開始
  const startBattle = useCallback(
    (
      myCircleName: string,
      myCards: Card[],
      opponentCircleName: string,
      opponentCards: Card[],
    ) => {
      const initialState = initializeBattle(
        myCircleName,
        myCards,
        opponentCircleName,
        opponentCards,
      );
      setBattleState(initialState);
    },
    [],
  );

  // ログ追加ヘルパー
  const addLog = useCallback((state: BattleState, message: string) => {
    return { ...state, logs: [message, ...state.logs] };
  }, []);

  /**
   * 敵のターン処理（AI）
   */
  const executeEnemyTurn = useCallback(
    (currentState: BattleState): BattleState => {
      let nextState = { ...currentState };
      const attacker = nextState.opponentDeck[0];
      const defender = nextState.myDeck[0];

      if (!attacker || !defender) return nextState;

      // ダメージ計算
      const variance = 0.9 + Math.random() * 0.2;
      const damage = Math.floor(attacker.attack * variance);

      nextState = addLog(
        nextState,
        `相手の${attacker.name}の攻撃！ ${defender.name}に${damage}ダメージ！`,
      );

      const newDefenderHp = Math.max(0, defender.maxHp - damage);
      const newMyDeck = [...nextState.myDeck];
      newMyDeck[0] = { ...defender, maxHp: newDefenderHp };
      nextState.myDeck = newMyDeck;

      if (newDefenderHp === 0) {
        nextState = addLog(nextState, `${defender.name}は力尽きた...`);
        nextState.myHp -= 1;

        if (nextState.myHp <= 0) {
          nextState.winner = "opponent";
          nextState = addLog(nextState, "こちらの戦意喪失...敗北です。");
          return nextState;
        }

        // 次のカード
        newMyDeck.shift();
        nextState.myDeck = newMyDeck;
        nextState = addLog(
          nextState,
          `次のカードを繰り出してください！（自動繰り上げ）`,
        );
      }

      return nextState;
    },
    [addLog],
  );

  /**
   * 攻撃処理
   */
  const attack = useCallback(() => {
    setBattleState((prev) => {
      if (!prev || prev.winner) return prev;

      let nextState = { ...prev };
      const attacker = nextState.myDeck[0];
      const defender = nextState.opponentDeck[0];

      // 1. ダメージ計算
      // 乱数幅 ±10%
      const variance = 0.9 + Math.random() * 0.2;
      const damage = Math.floor(attacker.attack * variance);

      nextState = addLog(
        nextState,
        `${attacker.name}の攻撃！ ${defender.name}に${damage}ダメージ！`,
      );

      // 2. HP減少
      const newDefenderHp = Math.max(0, defender.maxHp - damage);

      // 状態更新（相手のHPを減らす処理をどうするか...
      // Cardオブジェクト自体を書き換えるのは非破壊的にやる必要あり
      const newOpponentDeck = [...nextState.opponentDeck];
      newOpponentDeck[0] = { ...defender, maxHp: newDefenderHp };
      nextState.opponentDeck = newOpponentDeck;

      // 3. 気絶判定
      if (newDefenderHp === 0) {
        nextState = addLog(nextState, `${defender.name}は力尽きた...`);
        nextState.opponentHp -= 1;

        // 勝利判定
        if (nextState.opponentHp <= 0) {
          nextState.winner = "player";
          nextState = addLog(nextState, "相手の戦意喪失！あなたの勝利です！");
          return nextState;
        }

        // 相手の次のカードを出す（ベンチから繰り上がり）
        // [0]を削除し、後ろを詰める
        const deadCard = newOpponentDeck.shift(); // Remove active
        if (deadCard) {
          // 墓地へ送る処理が必要ならここで
        }

        if (newOpponentDeck.length === 0) {
          // カード切れ（一応HPチェックで勝ちになってるはずだが念のため）
          nextState.winner = "player";
        }
        nextState.opponentDeck = newOpponentDeck;
        nextState = addLog(nextState, `相手は次のカードを繰り出した！`);
      }

      // 4. ターン経過 -> 相手のターンへ
      // 今回は簡易実装で、自分の攻撃後すぐに相手も攻撃してくるとする（オート返答）
      // 本来はフェーズ管理が必要

      // 相手の反撃
      if (!nextState.winner) {
        nextState = executeEnemyTurn(nextState);
      }

      nextState.turn += 1;
      return nextState;
    });
  }, [addLog, executeEnemyTurn]);

  /**
   * 交代処理
   */
  const retreat = useCallback(
    (benchIndex: number) => {
      setBattleState((prev) => {
        if (!prev || prev.winner) return prev;
        let nextState = { ...prev };

        const activeCard = nextState.myDeck[0];
        const benchCard = nextState.myDeck[benchIndex + 1]; // +1 for skipping active

        if (!benchCard) return prev;

        // Swap
        const newMyDeck = [...nextState.myDeck];
        newMyDeck[0] = benchCard;
        newMyDeck[benchIndex + 1] = activeCard;
        nextState.myDeck = newMyDeck;

        nextState = addLog(
          nextState,
          `${activeCard.name}と${benchCard.name}を交代しました。`,
        );

        // 交代したら相手の攻撃を受ける（ターン消費）
        nextState = executeEnemyTurn(nextState);
        nextState.turn += 1;

        return nextState;
      });
    },
    [addLog, executeEnemyTurn],
  );

  return {
    battleState,
    startBattle,
    attack,
    retreat,
  };
};
