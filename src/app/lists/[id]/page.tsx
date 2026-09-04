import ListClient from "./ListClient";

export async function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return <ListClient />;
}
