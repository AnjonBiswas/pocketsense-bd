import { SquadDetailsClient } from "@/components/squads/SquadDetailsClient";

export default function SquadDetailsPage({ params }: { params: { id: string } }) {
  return <SquadDetailsClient squadId={params.id} />;
}
