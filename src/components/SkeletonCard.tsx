import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <CardContent className="pt-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-full" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </CardContent>
      <CardFooter className="flex gap-2">
        <div className="h-9 bg-muted rounded animate-pulse flex-1" />
      </CardFooter>
    </Card>
  );
}
