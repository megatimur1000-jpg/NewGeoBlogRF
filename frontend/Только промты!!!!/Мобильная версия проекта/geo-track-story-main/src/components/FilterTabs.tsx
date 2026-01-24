import { useState } from "react";
import { cn } from "@/lib/utils";

interface FilterTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

const FilterTabs = ({ tabs, defaultTab, onTabChange }: FilterTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="sticky top-nav bg-background border-b border-border z-30 overflow-x-auto scrollbar-hide">
      <div className="flex gap-1 px-4 py-2 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterTabs;
