import { TeamList } from "@/dashboard/TeamBoard";

export default async function TasksPage({ searchParams }: PageProps<"/dashboard/team/tasks">) {
  return <TeamList kind="task" sp={await searchParams} />;
}
