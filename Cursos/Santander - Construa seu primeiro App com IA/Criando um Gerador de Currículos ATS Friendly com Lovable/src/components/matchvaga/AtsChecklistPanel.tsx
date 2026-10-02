import { AlertTriangle, CheckCircle2 } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { AtsChecklistItem } from "@/lib/matchvaga";

export function AtsChecklistPanel({ items }: { items: AtsChecklistItem[] }) {
  if (items.length === 0) return null;

  return (
    <Accordion type="multiple" className="w-full">
      {items.map((item, index) => (
        <AccordionItem key={`${item.item}-${index}`} value={`item-${index}`}>
          <AccordionTrigger className="text-left">
            <span className="flex items-center gap-2">
              {item.ok ? (
                <CheckCircle2 className="size-4 shrink-0 text-success" />
              ) : (
                <AlertTriangle className="size-4 shrink-0 text-warning" />
              )}
              <span>{item.item}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{item.tip}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
