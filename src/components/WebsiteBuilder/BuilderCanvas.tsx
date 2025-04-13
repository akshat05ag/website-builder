
import React, { useRef } from 'react';
import { useBuilder, ComponentData, ComponentType } from '@/context/BuilderContext';
import { useDrop } from 'react-dnd';
import { Trash2, MoveVertical, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface BuilderCanvasProps {
  previewMode: boolean;
}

interface StyleObject {
  [key: string]: string | number;
}

// Helper to convert object style to inline style string
const styleObjectToString = (styles: StyleObject): React.CSSProperties => {
  return styles as React.CSSProperties;
};

interface RenderComponentProps {
  component: ComponentData;
  previewMode: boolean;
  parentId?: string;
  depth?: number;
}

const RenderComponent: React.FC<RenderComponentProps> = ({ 
  component, 
  previewMode, 
  parentId, 
  depth = 0 
}) => {
  const { selectComponent, updateComponent, removeComponent, state } = useBuilder();
  const isSelected = state.selectedComponentId === component.id;
  
  const handleClick = (e: React.MouseEvent) => {
    if (previewMode) return;
    e.stopPropagation();
    selectComponent(component.id);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(component.id);
    toast.success('Component removed');
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementation pending - would clone this component
    toast.info('Duplicate feature coming soon!');
  };

  // Handle drop for container components
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    drop: (item: { type: ComponentType }, monitor) => {
      if (component.type === 'container') {
        // Only allow drop if directly over this container
        if (monitor.isOver({ shallow: true })) {
          return { parentId: component.id };
        }
      }
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [component.id]);

  const renderComponentContent = () => {
    const styles = styleObjectToString(component.styles);
    
    switch (component.type) {
      case 'heading':
        return <h2 style={styles}>{component.content}</h2>;
        
      case 'paragraph':
        return <p style={styles}>{component.content}</p>;
        
      case 'button':
        return <button style={styles}>{component.content}</button>;
        
      case 'image':
        return (
          <img 
            src={component.props?.src || '/placeholder.svg'} 
            alt={component.props?.alt || 'Image'} 
            style={styles}
          />
        );
        
      case 'container':
        const containerStyle = {
          ...styles,
          outline: isOver && !previewMode ? '2px dashed #0099ff' : 'none',
        };
        
        return (
          <div 
            style={containerStyle} 
            ref={component.type === 'container' ? drop : undefined}
          >
            {component.children?.map((child) => (
              <RenderComponent 
                key={child.id} 
                component={child} 
                previewMode={previewMode}
                parentId={component.id}
                depth={depth + 1}
              />
            ))}
          </div>
        );
        
      default:
        return <div>Unknown component type</div>;
    }
  };

  // Don't add extra wrappers in preview mode
  if (previewMode) {
    return renderComponentContent();
  }

  // In edit mode, wrap with editing controls
  return (
    <div
      className={`
        relative group mb-2
        ${isSelected ? 'outline outline-2 outline-builder-blue rounded-md' : ''}
        ${component.type === 'container' ? 'p-1' : ''}
      `}
      onClick={handleClick}
    >
      {isSelected && (
        <div className="absolute -top-7 right-0 flex space-x-1 bg-white shadow-sm border border-gray-200 rounded-t-md p-1 z-10">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-5 w-5" 
            onClick={handleDuplicate}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-5 w-5 text-red-500 hover:text-red-700" 
            onClick={handleRemove}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <div className={`
        ${isSelected ? 'outline-builder-blue' : 'outline-transparent'}
        ${component.type === 'container' ? isOver ? 'bg-blue-50/50' : '' : ''}
        transition-colors duration-200
      `}>
        {renderComponentContent()}
      </div>
      
      {isSelected && component.type === 'container' && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white border border-gray-200 rounded-md p-1 z-10">
          <Button size="sm" variant="ghost" className="h-6 flex items-center text-xs">
            <MoveVertical className="h-3 w-3 mr-1" /> 
            Drag to reorder
          </Button>
        </div>
      )}
    </div>
  );
};

const BuilderCanvas: React.FC<BuilderCanvasProps> = ({ previewMode }) => {
  const { state, addComponent, selectComponent } = useBuilder();
  const { components, selectedComponentId } = state;
  
  // Handle drop at the root level
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    drop: (item: { type: ComponentType }, monitor) => {
      if (monitor.didDrop()) {
        // If already handled by a nested drop target
        return;
      }
      // Add component to root level
      addComponent(item.type);
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [addComponent]);

  const handleCanvasClick = () => {
    if (!previewMode && selectedComponentId) {
      selectComponent(null);
    }
  };

  return (
    <div 
      ref={drop}
      className={`
        relative min-h-full
        ${previewMode ? '' : 'p-4'}
        ${isOver && canDrop && !previewMode ? 'bg-blue-50/50' : ''}
        transition-colors duration-200
      `}
      onClick={handleCanvasClick}
    >
      <div className={`
        mx-auto bg-white 
        ${previewMode ? '' : 'shadow-md border border-gray-200 rounded-lg'}
        transition-all
        max-w-[1200px]
      `}>
        {components.map((component) => (
          <RenderComponent 
            key={component.id} 
            component={component} 
            previewMode={previewMode} 
          />
        ))}
        
        {components.length === 0 && !previewMode && (
          <div className="flex flex-col items-center justify-center h-96 text-center p-4">
            <h3 className="text-xl font-medium text-gray-600 mb-4">Your canvas is empty</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Drag components from the panel on the left to start building your website.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderCanvas;
