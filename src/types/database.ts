export type FriendshipStatus = "pending" | "accepted";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  email_verified_at: string | null;
  telegram_id: number | null;
  telegram_username: string | null;
  telegram_linked_at: string | null;
  created_at: string;
};

export type Visit = {
  id: string;
  user_id: string;
  country_code: string;
  visited_at: string | null;
  created_at: string;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  country_code: string;
  created_at: string;
};

export type TripCity = {
  id: string;
  trip_id: string;
  country_code: string;
  city_name: string;
};

export type TripStatus = "planned" | "completed";

export type TripMember = {
  user_id: string;
  profile?: Pick<Profile, "id" | "username" | "display_name">;
};

export type Trip = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TripStatus;
  created_at: string;
  trip_countries?: { country_code: string }[];
  trip_cities?: TripCity[];
  trip_members?: TripMember[];
};

export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  requester?: Profile;
  addressee?: Profile;
};

export type WallPost = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  profile?: Pick<Profile, "id" | "username" | "display_name">;
};

export type TripPayload = {
  title: string;
  notes: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TripStatus;
  countries: string[];
  cities: { country_code: string; city_name: string }[];
  member_ids: string[];
};
