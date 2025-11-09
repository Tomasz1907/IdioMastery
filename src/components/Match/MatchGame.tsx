import { useState, useEffect, useRef } from "react";
import { auth, database } from "@/../FirebaseConfig";
import { ref, push, set } from "firebase/database";
import { updateStreak } from "@/lib/firebaseUtils";
import MatchHeader from "./MatchHeader";
import MatchCard from "./MatchCard";
import { DictionaryEntry } from "@/lib/types/DictionaryEntry";

interface Props {
  entries: DictionaryEntry[];
  mode: "english-spanish" | "spanish-english";
  timeLimit: number;
  onEnd: (results: {
    correct: number;
    wrong: number;
    highestCombo: number;
  }) => void;
}

interface Card {
  text: string;
  id: string;
  side: "left" | "right";
  slot: number;
}

const ANIMATION_DURATION = 300;

const MatchGame: React.FC<Props> = ({ entries, mode, timeLimit, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [selectedLeft, setSelectedLeft] = useState<Card | null>(null);
  const [selectedRight, setSelectedRight] = useState<Card | null>(null);
  const [leftSlots, setLeftSlots] = useState<(Card | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [rightSlots, setRightSlots] = useState<(Card | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const scoresRef = useRef({
    correct: 0,
    wrong: 0,
    combo: 0,
    highestCombo: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animatingPairs = useRef<Set<string>>(new Set());

  useEffect(() => {
    initializeGame();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    intervalRef.current = interval;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [mode, entries]);

  const initializeGame = () => {
    const leftLang = mode === "english-spanish" ? "english" : "spanish";
    const rightLang = mode === "english-spanish" ? "spanish" : "english";
    const shuffled = [...entries].sort(() => Math.random() - 0.5).slice(0, 4);

    const left = shuffled.map((e, i) => ({
      text: e[leftLang] as string,
      id: e.id!,
      side: "left" as const,
      slot: i,
    }));

    const right = shuffled
      .sort(() => Math.random() - 0.5)
      .map((e, i) => ({
        text: e[rightLang] as string,
        id: e.id!,
        side: "right" as const,
        slot: i,
      }));

    setLeftSlots(left);
    setRightSlots(right);
    setSelectedLeft(null);
    setSelectedRight(null);
    animatingPairs.current.clear();

    scoresRef.current = { correct: 0, wrong: 0, combo: 0, highestCombo: 0 };
  };

  const handleClick = (card: Card) => {
    if (animatingPairs.current.has(card.id)) return;
    if (selectedLeft && selectedRight) return;

    if (card.side === "left") {
      if (selectedLeft?.id === card.id) return;
      setSelectedLeft(card);
      if (selectedRight) checkMatch(card, selectedRight);
    } else {
      if (selectedRight?.id === card.id) return;
      setSelectedRight(card);
      if (selectedLeft) checkMatch(selectedLeft, card);
    }
  };

  const checkMatch = (leftCard: Card, rightCard: Card) => {
    const pairKey = `${leftCard.id}-${rightCard.id}`;
    if (animatingPairs.current.has(pairKey)) return;

    const rightLang = mode === "english-spanish" ? "spanish" : "english";
    const isCorrect =
      entries.find((e) => e.id === leftCard.id)?.[rightLang] === rightCard.text;

    animatingPairs.current.add(pairKey);

    if (isCorrect) {
      scoresRef.current.correct++;
      scoresRef.current.combo++;
      if (scoresRef.current.combo > scoresRef.current.highestCombo) {
        scoresRef.current.highestCombo = scoresRef.current.combo;
      }

      setTimeout(() => {
        replaceMatchedPair(leftCard, rightCard);
        animatingPairs.current.delete(pairKey);
      }, ANIMATION_DURATION);
    } else {
      scoresRef.current.wrong++;
      scoresRef.current.combo = 0;

      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        animatingPairs.current.delete(pairKey);
      }, ANIMATION_DURATION);
    }
  };

  const replaceMatchedPair = (leftCard: Card, rightCard: Card) => {
    const leftLang = mode === "english-spanish" ? "english" : "spanish";
    const rightLang = mode === "english-spanish" ? "spanish" : "english";

    const remaining = entries.filter(
      (e) =>
        !leftSlots.some((c) => c?.id === e.id!) &&
        !rightSlots.some((c) => c?.id === e.id!)
    );

    const next =
      remaining.length > 0
        ? remaining[Math.floor(Math.random() * remaining.length)]
        : null;

    if (next) {
      const newLeft = {
        ...leftCard,
        text: next[leftLang] as string,
        id: next.id!,
      };
      const newRight = {
        ...rightCard,
        text: next[rightLang] as string,
        id: next.id!,
      };

      setLeftSlots((prev) =>
        prev.map((c) => (c?.slot === leftCard.slot ? newLeft : c))
      );
      setRightSlots((prev) =>
        prev.map((c) => (c?.slot === rightCard.slot ? newRight : c))
      );
    } else {
      setLeftSlots((prev) =>
        prev.map((c) => (c?.slot === leftCard.slot ? null : c))
      );
      setRightSlots((prev) =>
        prev.map((c) => (c?.slot === rightCard.slot ? null : c))
      );
    }

    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const endGame = async () => {
    intervalRef.current && clearInterval(intervalRef.current);

    const finalResults = { ...scoresRef.current };

    if (auth.currentUser) {
      updateStreak(auth.currentUser.uid);
      const resultRef = ref(
        database,
        `users/${auth.currentUser.uid}/matchResults`
      );
      const newRef = push(resultRef);
      await set(newRef, { ...finalResults, timestamp: Date.now() });
    }

    onEnd(finalResults);
  };

  return (
    <div className="space-y-6 w-full">
      <MatchHeader
        timeLeft={timeLeft}
        correct={scoresRef.current.correct}
        wrong={scoresRef.current.wrong}
        combo={scoresRef.current.combo}
      />

      <div className="grid grid-cols-2 gap-2 md:gap-8">
        {/* Left Column */}
        <div className="grid grid-rows-4 gap-2 md:gap-4">
          {leftSlots.map((card, i) => (
            <div key={`left-${i}`} className="min-h-24">
              {card && (
                <MatchCard
                  text={card.text}
                  isSelected={selectedLeft?.id === card.id}
                  onClick={() => handleClick(card)}
                  correct={
                    selectedLeft?.id === card.id &&
                    selectedRight?.id === card.id
                  }
                  wrong={
                    selectedLeft?.id === card.id && selectedRight
                      ? selectedRight.id !== card.id
                      : false
                  }
                />
              )}
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="grid grid-rows-4 gap-4">
          {rightSlots.map((card, i) => (
            <div key={`right-${i}`} className="min-h-24">
              {card && (
                <MatchCard
                  text={card.text}
                  isSelected={selectedRight?.id === card.id}
                  onClick={() => handleClick(card)}
                  correct={
                    selectedRight?.id === card.id &&
                    selectedLeft?.id === card.id
                  }
                  wrong={
                    selectedRight?.id === card.id && selectedLeft
                      ? selectedLeft.id !== card.id
                      : false
                  }
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchGame;
