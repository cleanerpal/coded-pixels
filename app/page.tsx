import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-3xl space-y-6 p-8">
        <h1 className="text-3xl font-bold text-primary">CodedPixels</h1>
        <p className="text-text-muted">
          Design token samples — all colours use CSS variables from globals.css.
        </p>
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary CTA</Button>
            <Button variant="secondary">Secondary</Button>
            <Badge variant="success">Save £XX per year</Badge>
          </div>
        </Card>
      </section>
    </main>
  );
}
