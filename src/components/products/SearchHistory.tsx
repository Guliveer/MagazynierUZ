"use client";

import { Clock, X, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { SearchHistoryItem } from "@/hooks/useSearchHistory";

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  isLoading: boolean;
  onSelectSearch: (filters: SearchHistoryItem["filters"]) => void;
  onRemoveSearch: (id: string) => void;
  onClearHistory: () => void;
}

/**
 * Component to display and manage search history
 * Shows recent searches with ability to reload, remove individual items, or clear all
 */
export function SearchHistory({ history, isLoading, onSelectSearch, onRemoveSearch, onClearHistory }: SearchHistoryProps) {
  // Format timestamp to relative time
  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return "Just now";
    }
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    if (days < 7) {
      return `${days}d ago`;
    }
    return new Date(timestamp).toLocaleDateString("pl-PL", {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return null;
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Recent Searches</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {history.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearHistory} className="h-8 text-xs text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="group flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                <button onClick={() => onSelectSearch(item.filters)} className="flex-1 text-left min-w-0" title="Load this search">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate flex-1">{item.description}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTimestamp(item.timestamp)}</span>
                  </div>
                  {/* Show filter details */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.filters.searchQuery && (
                      <Badge variant="outline" className="text-xs">
                        {item.filters.searchQuery}
                      </Badge>
                    )}
                    {item.filters.warehouseId && (
                      <Badge variant="outline" className="text-xs">
                        W#{item.filters.warehouseId}
                      </Badge>
                    )}
                    {item.filters.locationId && (
                      <Badge variant="outline" className="text-xs">
                        L#{item.filters.locationId}
                      </Badge>
                    )}
                    {(item.filters.minPrice || item.filters.maxPrice) && (
                      <Badge variant="outline" className="text-xs">
                        {item.filters.minPrice || "0"} - {item.filters.maxPrice || "∞"} PLN
                      </Badge>
                    )}
                    {(item.filters.minQuantity || item.filters.maxQuantity) && (
                      <Badge variant="outline" className="text-xs">
                        Qty: {item.filters.minQuantity || "0"} - {item.filters.maxQuantity || "∞"}
                      </Badge>
                    )}
                    {item.filters.isAvailable && (
                      <Badge variant="outline" className="text-xs">
                        Available
                      </Badge>
                    )}
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSearch(item.id);
                  }}
                  title="Remove from history">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
