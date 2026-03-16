import Image from "next/image";

interface CharacterEdge {
  role: string;
  node: {
    id: number;
    name: { full: string };
    image: { medium: string };
  };
  voiceActors: Array<{
    id: number;
    name: { full: string };
    image: { medium: string };
    language: string;
  }>;
}

interface CharacterListProps {
  characters: CharacterEdge[];
}

export function CharacterList({ characters }: CharacterListProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {characters.map((edge) => {
        const va = edge.voiceActors?.[0];
        return (
          <div
            key={edge.node.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
              <Image
                src={edge.node.image.medium}
                alt={edge.node.name.full}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{edge.node.name.full}</p>
              <p className="text-xs text-muted-foreground">{edge.role}</p>
            </div>
            {va && (
              <div className="flex items-center gap-2 text-right">
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{va.name.full}</p>
                  <p className="text-xs text-muted-foreground">{va.language}</p>
                </div>
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={va.image.medium}
                    alt={va.name.full}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
