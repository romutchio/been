"use client";

import Link from "next/link";
import { useRef, useTransition, useState } from "react";
import {
  removeFriend,
  respondFriendRequest,
  sendFriendRequest,
} from "@/app/actions";
import { UserPlus, Check, X, Map, UserMinus } from "lucide-react";
import type { Friendship, Profile } from "@/types/database";

type FriendWithProfile = Friendship & {
  requester: Profile;
  addressee: Profile;
};

type Props = {
  friendships: FriendWithProfile[];
  currentUserId: string;
};

export function FriendsPanel({ friendships, currentUserId }: Props) {
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const pendingIncoming = friendships.filter(
    (f) => f.status === "pending" && f.addressee_id === currentUserId,
  );
  const pendingOutgoing = friendships.filter(
    (f) => f.status === "pending" && f.requester_id === currentUserId,
  );
  const accepted = friendships.filter((f) => f.status === "accepted");

  function friendProfile(f: FriendWithProfile): Profile {
    return f.requester_id === currentUserId ? f.addressee : f.requester;
  }

  function handleRemove(friendshipId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await removeFriend(friendshipId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка");
      }
    });
  }

  return (
    <div className="space-y-8">
      <form
        ref={formRef}
        action={(fd) => {
          setError(null);
          startTransition(async () => {
            try {
              await sendFriendRequest(fd.get("username") as string);
              formRef.current?.reset();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Ошибка");
            }
          });
        }}
        className="flex gap-2"
      >
        <input
          name="username"
          placeholder="username друга"
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
        >
          <UserPlus className="h-4 w-4" />
          Добавить
        </button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}

      {pendingIncoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
            Входящие заявки
          </h2>
          <ul className="space-y-2">
            {pendingIncoming.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span>@{f.requester.username}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(() =>
                        respondFriendRequest(f.id, true),
                      )
                    }
                    className="rounded-lg bg-emerald-600/20 p-2 text-emerald-400 hover:bg-emerald-600/30"
                    aria-label="Принять"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(f.id)}
                    className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                    aria-label="Отклонить"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pendingOutgoing.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
            Ожидают ответа
          </h2>
          <ul className="space-y-2">
            {pendingOutgoing.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="text-zinc-400">@{f.addressee.username}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(f.id)}
                  disabled={pending}
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-zinc-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Отменить
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          Друзья
        </h2>
        {accepted.length === 0 ? (
          <p className="text-sm text-zinc-500">Пока нет друзей</p>
        ) : (
          <ul className="space-y-2">
            {accepted.map((f) => {
              const p = friendProfile(f);
              return (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {p.display_name ?? p.username}
                    </p>
                    <p className="text-sm text-zinc-500">@{p.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/map?friend=${p.id}`}
                      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
                    >
                      <Map className="h-4 w-4" />
                      Карта
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(f.id)}
                      disabled={pending}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                      aria-label="Удалить из друзей"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
