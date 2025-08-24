import React, { useEffect, useRef, useState } from "react";
import { Plus, Edit, Trash2, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextMenuOption {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  disabled?: boolean;
}

interface MenuContextMenuProps {
  x: number;
  y: number;
  options: ContextMenuOption[];
  onClose: () => void;
  visible: boolean;
}

export function MenuContextMenu({ x, y, options, onClose, visible }: MenuContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]"
      style={{
        left: x,
        top: y,
      }}
    >
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => {
            if (!option.disabled) {
              option.onClick();
              onClose();
            }
          }}
          disabled={option.disabled}
          className={cn(
            "w-full px-4 py-2 text-left text-sm flex items-center space-x-3 transition-colors",
            option.disabled
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <option.icon className="w-4 h-4" />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}

// Hook for managing context menu state
export function useMenuContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const showContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      visible: true,
    });
  };

  const hideContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
  };
}