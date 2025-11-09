import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DictionaryEntry } from "@/lib/types/DictionaryEntry";
import { useState } from "react";

interface Props {
  entries: DictionaryEntry[];
  onStart: (mode: "english-spanish" | "spanish-english", time: number) => void;
}

const TIME_OPTIONS = [
  { value: 60, label: "1 Minute" },
  { value: 120, label: "2 Minutes" },
  { value: 300, label: "5 Minutes" },
];

const MatchSettings: React.FC<Props> = ({ entries, onStart }) => {
  const [mode, setMode] = useState<"english-spanish" | "spanish-english">(
    "english-spanish"
  );
  const [time, setTime] = useState<number | null>(null);

  const canStart = time && entries.length >= 5;

  return (
    <CardContent className="space-y-8 w-full">
      {entries.length >= 5 ? (
        <>
          {/* TRANSLATION MODE */}
          <div className="space-y-3">
            <label
              htmlFor="mode"
              className="block text-lg font-medium text-center"
            >
              Translation Mode
            </label>
            <Select
              value={mode}
              onValueChange={(v) =>
                setMode(v as "english-spanish" | "spanish-english")
              }
              disabled={false}
            >
              <SelectTrigger id="mode" className="w-full h-12 text-base">
                <SelectValue placeholder="Choose translation direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english-spanish">
                  English to Spanish
                </SelectItem>
                <SelectItem value="spanish-english">
                  Spanish to English
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TIME LIMIT */}
          <div className="space-y-3">
            <label
              htmlFor="time"
              className="block text-lg font-medium text-center"
            >
              Time Limit
            </label>
            <Select
              value={time?.toString() || ""}
              onValueChange={(v) => setTime(Number(v))}
            >
              <SelectTrigger id="time" className="w-full h-12 text-base">
                <SelectValue placeholder="Choose time limit" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* START BUTTON */}
          <Button
            onClick={() => canStart && onStart(mode, time!)}
            disabled={!canStart}
            className="w-full py-6 text-xl font-bold bg-[#F6BE2C] hover:bg-[#e0a800] text-slate-900"
          >
            Start Matching!
          </Button>

          {time && entries.length < 5 && (
            <p className="text-sm text-red-600 text-center">
              You need at least 5 saved words to play.
            </p>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">
            Save at least <strong>5 words</strong> in your dictionary to start
            matching.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Go to <strong>Learn</strong> page and click the star to save!
          </p>
        </div>
      )}
    </CardContent>
  );
};

export default MatchSettings;
