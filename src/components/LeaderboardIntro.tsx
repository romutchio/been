import { TOTAL_COUNTRIES } from "@/lib/countries";
import { pluralTravelers } from "@/lib/plural";

type Props = {
  travelerCount: number;
  className?: string;
};

export function LeaderboardIntro({ travelerCount, className }: Props) {
  return (
    <p className={`mt-1 text-sm text-zinc-500 ${className ?? ""}`}>
      {travelerCount > 0 && (
        <>
          <span className="text-zinc-400">
            {travelerCount} {pluralTravelers(travelerCount)}
          </span>
          {" · "}
        </>
      )}
      Топ-50 по числу посещённых стран (из {TOTAL_COUNTRIES})
    </p>
  );
}
