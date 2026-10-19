"use client";

import { Button } from "@/registry/react/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/react/ui/hover-card";
import { Progress } from "@/registry/react/ui/progress";
import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

const ICON_RADIUS = 10;

// Saqara: the token fields of the `ai` SDK's LanguageModelUsage, without depending on it.
export type ContextUsage = {
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
};

// Saqara: costs come from the app (it knows its model's pricing), not from a bundled price list
// (tokenlens). Leave one out and its row shows tokens only; without `total` the footer is hidden.
export type ContextCosts = {
  input?: number;
  output?: number;
  reasoning?: number;
  cache?: number;
  total?: number;
};

interface ContextSchema {
  usedTokens: number;
  maxTokens: number;
  usage?: ContextUsage;
  costs?: ContextCosts;
  /** ISO 4217 code of the costs. */
  currency?: string;
}

const ContextContext = createContext<(ContextSchema & { currency: string }) | null>(null);

const useContextValue = () => {
  const context = useContext(ContextContext);

  if (!context) {
    throw new Error("Context components must be used within Context");
  }

  return context;
};

const percent = (value: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1, style: "percent" }).format(value);
const compact = (value: number) => new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(value);
const money = (value: number, currency: string) => new Intl.NumberFormat("fr-FR", { currency, maximumFractionDigits: 4, style: "currency" }).format(value);

export type ContextProps = ComponentProps<typeof HoverCard> & ContextSchema;

export const Context = ({
  usedTokens,
  maxTokens,
  usage,
  costs,
  currency = "USD",
  ...props
}: ContextProps) => {
  const contextValue = useMemo(
    () => ({ costs, currency, maxTokens, usage, usedTokens }),
    [costs, currency, maxTokens, usage, usedTokens]
  );

  return (
    <ContextContext.Provider value={contextValue}>
      <HoverCard closeDelay={0} openDelay={0} {...props} />
    </ContextContext.Provider>
  );
};

const ContextIcon = () => {
  const { usedTokens, maxTokens } = useContextValue();
  const circumference = 2 * Math.PI * ICON_RADIUS;
  const dashOffset = circumference * (1 - usedTokens / maxTokens);

  return (
    <svg aria-hidden="true" height="20" viewBox="0 0 24 24" width="20">
      <circle cx={12} cy={12} fill="none" opacity="0.25" r={ICON_RADIUS} stroke="currentColor" strokeWidth={2} />
      <circle
        cx={12}
        cy={12}
        fill="none"
        opacity="0.7"
        r={ICON_RADIUS}
        stroke="currentColor"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        strokeWidth={2}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
      />
    </svg>
  );
};

export type ContextTriggerProps = ComponentProps<typeof Button>;

export const ContextTrigger = ({ children, ...props }: ContextTriggerProps) => {
  const { usedTokens, maxTokens } = useContextValue();
  const rendered = percent(usedTokens / maxTokens);

  return (
    <HoverCardTrigger asChild>
      {children ?? (
        <Button aria-label={`Contexte utilisé : ${rendered}`} type="button" variant="ghost" {...props}>
          <span className="font-medium text-muted-foreground">{rendered}</span>
          <ContextIcon />
        </Button>
      )}
    </HoverCardTrigger>
  );
};

export type ContextContentProps = ComponentProps<typeof HoverCardContent>;

export const ContextContent = ({
  className,
  ...props
}: ContextContentProps) => (
  <HoverCardContent
    className={cn("min-w-60 divide-y overflow-hidden p-0", className)}
    {...props}
  />
);

export type ContextContentHeaderProps = ComponentProps<"div">;

export const ContextContentHeader = ({
  children,
  className,
  ...props
}: ContextContentHeaderProps) => {
  const { usedTokens, maxTokens } = useContextValue();
  const used = usedTokens / maxTokens;

  return (
    <div className={cn("w-full space-y-2 p-3", className)} {...props}>
      {children ?? (
        <>
          <div className="flex items-center justify-between gap-3 text-xs">
            <p>{percent(used)}</p>
            <p className="font-mono text-muted-foreground">
              {compact(usedTokens)} / {compact(maxTokens)}
            </p>
          </div>
          <Progress aria-label="Contexte utilisé" className="bg-muted" value={used * 100} />
        </>
      )}
    </div>
  );
};

export type ContextContentBodyProps = ComponentProps<"div">;

export const ContextContentBody = ({
  children,
  className,
  ...props
}: ContextContentBodyProps) => (
  <div className={cn("w-full space-y-1 p-3", className)} {...props}>
    {children}
  </div>
);

export type ContextContentFooterProps = ComponentProps<"div">;

export const ContextContentFooter = ({
  children,
  className,
  ...props
}: ContextContentFooterProps) => {
  const { costs, currency } = useContextValue();

  if (!children && costs?.total === undefined) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-3 bg-secondary p-3 text-xs",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <span className="text-muted-foreground">Coût total</span>
          <span>{money(costs?.total ?? 0, currency)}</span>
        </>
      )}
    </div>
  );
};

const UsageRow = ({
  label,
  tokens,
  cost,
  className,
  children,
  ...props
}: ComponentProps<"div"> & { label: string; tokens?: number; cost?: number }) => {
  const { currency } = useContextValue();

  if (children) {
    return children as ReactNode;
  }

  if (!tokens) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-between text-xs", className)} {...props}>
      <span className="text-muted-foreground">{label}</span>
      <span>
        {compact(tokens)}
        {cost !== undefined && <span className="ml-2 text-muted-foreground">• {money(cost, currency)}</span>}
      </span>
    </div>
  );
};

export type ContextInputUsageProps = ComponentProps<"div">;

export const ContextInputUsage = (props: ContextInputUsageProps) => {
  const { usage, costs } = useContextValue();
  return <UsageRow cost={costs?.input} label="Entrée" tokens={usage?.inputTokens} {...props} />;
};

export type ContextOutputUsageProps = ComponentProps<"div">;

export const ContextOutputUsage = (props: ContextOutputUsageProps) => {
  const { usage, costs } = useContextValue();
  return <UsageRow cost={costs?.output} label="Sortie" tokens={usage?.outputTokens} {...props} />;
};

export type ContextReasoningUsageProps = ComponentProps<"div">;

export const ContextReasoningUsage = (props: ContextReasoningUsageProps) => {
  const { usage, costs } = useContextValue();
  return <UsageRow cost={costs?.reasoning} label="Raisonnement" tokens={usage?.reasoningTokens} {...props} />;
};

export type ContextCacheUsageProps = ComponentProps<"div">;

export const ContextCacheUsage = (props: ContextCacheUsageProps) => {
  const { usage, costs } = useContextValue();
  return <UsageRow cost={costs?.cache} label="Cache" tokens={usage?.cachedInputTokens} {...props} />;
};
