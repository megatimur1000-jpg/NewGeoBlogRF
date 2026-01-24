import ActivityFiltersComponent from "./ActivityFilters";
import { X } from "lucide-react";

export const ActivityFiltersOverlay = ({
  filters,
  onFiltersChange,
  onClose,
}: {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 bg-black/30 flex justify-end">
    <div className="bg-white shadow-2xl w-full max-w-sm h-full p-6 relative flex flex-col">
      <button
        className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
        onClick={onClose}
        aria-label="Закрыть"
      >
        <X className="w-6 h-6" />
      </button>
      <ActivityFiltersComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    </div>
    {/* Клик по затемнённой области тоже закрывает */}
    <div className="flex-1" onClick={onClose} />
  </div>
);