export type FriendshipStatus = "pending" | "accepted";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
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

export type Trip = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  trip_countries?: { country_code: string }[];
  trip_cities?: TripCity[];
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

export type TripPayload = {
  title: string;
  notes: string | null;
  start_date: string | null;
  end_date: string | null;
  countries: string[];
  cities: { country_code: string; city_name: string }[];
};
