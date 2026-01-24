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
    <div className="sticky top-nav bg-background border-b border-border z-30">
      <div className="flex gap-1 px-2 py-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterTabs;

