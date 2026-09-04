import MovieClient from "./MovieClient";

export async function generateStaticParams() {
  return [
    { id: "129" }, // Spirited Away
    { id: "4935" }, // Howl's Moving Castle
    { id: "155" }, // The Dark Knight placeholder
    { id: "27205" }, // Inception
    { id: "496243" }, // Parasite
    { id: "118340" }, // Your Name
    { id: "315162" }, // Puss in Boots
    { id: "129865" }, // Akira
  ];
}

export default function Page() {
  return <MovieClient />;
}
