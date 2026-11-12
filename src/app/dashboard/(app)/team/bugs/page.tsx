import { TeamList } from "@/dashboard/TeamBoard";

export default async function BugsPage({ searchParams }: PageProps<"/dashboard/team/bugs">) {
  return <TeamList kind="bug" sp={await searchParams} />;
}
