// Base URL for Pokemon Showdown trainer sprites
const BASE_URL = "https://play.pokemonshowdown.com/sprites/trainers";

export const LEADER_SPRITES = {
  "Brock": `${BASE_URL}/brock.png`,
  "Misty": `${BASE_URL}/misty.png`,
  "Lt. Surge": `${BASE_URL}/ltsurge.png`,
  "Erika": `${BASE_URL}/erika.png`,
  "Koga": `${BASE_URL}/koga.png`,
  "Sabrina": `${BASE_URL}/sabrina.png`,
  "Blaine": `${BASE_URL}/blaine.png`,
  "Giovanni": `${BASE_URL}/giovanni.png`,
  "Lorelei": `${BASE_URL}/lorelei.png`,
  "Bruno": `${BASE_URL}/bruno.png`,
  "Agatha": `${BASE_URL}/agatha.png`,
  "Lance": `${BASE_URL}/lance.png`,
  "Champion Red": `${BASE_URL}/red.png`,
};

// You can keep your SVG as a fallback for errors
export const LEADER_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='%23666' font-family='Arial,Helvetica,sans-serif'>?</text></svg>";
