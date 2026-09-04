import ForumDetailClient from "./ForumDetailClient";

export async function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return <ForumDetailClient />;
}
