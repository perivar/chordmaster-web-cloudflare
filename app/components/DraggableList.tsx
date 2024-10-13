import React, { createContext, useContext, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DraggableAttributes,
  DraggableSyntheticListeners,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// see: https://docs.dndkit.com/presets/sortable
// see: https://codesandbox.io/s/dnd-kit-sortable-starter-template-22x1ix

// Generic interface that accepts any type `T`
interface DraggableListProps<T> {
  items: T[];
  getId: (item: T) => UniqueIdentifier; // Returns a string or number
  onReorder: (newOrder: T[]) => void;
  renderItem: (item: T, isDragging: boolean) => React.ReactNode; // Function to render the item, exposing isDragging
  renderOverlay?: (item: T) => React.ReactNode; // Function to render the DragOverlay
}

export function DraggableList<T>({
  items,
  getId,
  onReorder,
  renderItem,
  renderOverlay,
}: DraggableListProps<T>) {
  const [list, setList] = useState(items);
  const [activeItem, setActiveItem] = useState<T | null>(null); // Track the item being dragged

  // Initialize sensors for mouse and touch input
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Starts dragging after moving 10px
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Delay before activating drag for touch input
        tolerance: 5, // Tolerance for slight touch movements
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null); // Reset active item after drag ends

    if (over && active.id !== over.id) {
      const oldIndex = list.findIndex(item => getId(item) === active.id);
      const newIndex = list.findIndex(item => getId(item) === over.id);

      const newOrder = arrayMove(list, oldIndex, newIndex);
      setList(newOrder);
      onReorder(newOrder);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedItem = list.find(item => getId(item) === active.id);
    setActiveItem(draggedItem || null);
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveItem(null);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      sensors={sensors}>
      <SortableContext
        items={list.map(getId)}
        strategy={verticalListSortingStrategy}>
        {list.map(item => (
          <React.Fragment key={getId(item)}>
            {renderItem(
              item,
              (activeItem && getId(activeItem)) === getId(item)
            )}
          </React.Fragment>
        ))}
      </SortableContext>

      {renderOverlay && (
        <DragOverlay>
          {activeItem ? renderOverlay(activeItem) : null}
        </DragOverlay>
      )}
    </DndContext>
  );
}

interface DraggableContext {
  attributes?: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

const DraggableItemContext = createContext<DraggableContext>({
  attributes: undefined,
  listeners: undefined,
  ref() {},
});

interface DraggableItemProps {
  id: UniqueIdentifier;
}

function DraggableItem({
  children,
  id,
}: PropsWithChildren<DraggableItemProps>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <DraggableItemContext.Provider value={context}>
      <div ref={setNodeRef} style={style}>
        {children}
      </div>
    </DraggableItemContext.Provider>
  );
}

interface DragHandleProps {}

function DragHandle({ children }: PropsWithChildren<DragHandleProps>) {
  const { attributes, listeners, ref } = useContext(DraggableItemContext);

  return (
    <div {...attributes} {...listeners} ref={ref}>
      {children}
    </div>
  );
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

interface DraggableOverlayProps {}

export function DraggableOverlay({
  children,
}: PropsWithChildren<DraggableOverlayProps>) {
  return (
    <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>
  );
}

// Attach Item and DragHandle as subcomponents
DraggableList.Item = DraggableItem;
DraggableList.DragHandle = DragHandle;
