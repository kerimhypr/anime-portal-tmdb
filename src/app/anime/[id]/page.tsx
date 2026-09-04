import AnimeClient from "./AnimeClient";

export async function generateStaticParams() {
  // pre-render popular anime IDs for static export
  return [
    { id: "1399" }, // Game of Thrones placeholder but we use anime IDs: actual anime tv ids from TMDB
    { id: "94605" }, // Arcane
    { id: "37854" }, // One Piece
    { id: "1429" },  // Attack on Titan
    { id: "66732" }, // Stranger Things -> will work generically
    { id: "1396" },  // Breaking Bad
    { id: "31911" }, // Naruto
    { id: "46260" }, // Naruto Shippuden-ish
  ];
}

export default function Page() {
  return <AnimeClient />;
}
