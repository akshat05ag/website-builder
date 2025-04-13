import React, { createContext, useContext, useReducer, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define component types that can be added to the canvas
export type ComponentType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'button'
  | 'container';

// Component data structure
export interface ComponentData {
  id: string;
  type: ComponentType;
  content: string;
  styles: Record<string, string | number>;
  props?: Record<string, any>;
  children?: ComponentData[];
}

// Initial template data
export const initialTemplate: ComponentData[] = [
  {
    id: 'section-1',
    type: 'container',
    content: '',
    styles: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '300px',
      padding: '20px',
      backgroundColor: '#ffffff',
    },
    children: [
      {
        id: 'heading-1',
        type: 'heading',
        content: 'Welcome to Your Website',
        styles: {
          fontSize: '2.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#333333',
        },
      },
      {
        id: 'paragraph-1',
        type: 'paragraph',
        content: 'This is a sample paragraph. Start building your website by dragging elements from the sidebar.',
        styles: {
          fontSize: '1rem',
          marginBottom: '1.5rem',
          color: '#555555',
        },
      },
      {
        id: 'button-1',
        type: 'button',
        content: 'Get Started',
        styles: {
          backgroundColor: '#0099ff',
          color: 'white',
          padding: '0.5rem 1.5rem',
          borderRadius: '0.375rem',
          fontWeight: '500',
          cursor: 'pointer',
          border: 'none',
          display: 'inline-block',
        },
      },
    ],
  },
];

// Component templates for dragging
export const componentTemplates: Record<ComponentType, Omit<ComponentData, 'id'>> = {
  heading: {
    type: 'heading',
    content: 'New Heading',
    styles: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#333333',
    },
  },
  paragraph: {
    type: 'paragraph',
    content: 'Add your text here',
    styles: {
      fontSize: '1rem',
      marginBottom: '1rem',
      color: '#555555',
    },
  },
  image: {
    type: 'image',
    content: '',
    styles: {
      width: '100%',
      maxWidth: '500px',
      marginBottom: '1rem',
    },
    props: {
      src: '/placeholder.svg',
      alt: 'Image description',
    },
  },
  button: {
    type: 'button',
    content: 'Click Me',
    styles: {
      backgroundColor: '#0099ff',
      color: 'white',
      padding: '0.5rem 1.5rem',
      borderRadius: '0.375rem',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      display: 'inline-block',
    },
  },
  container: {
    type: 'container',
    content: '',
    styles: {
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      backgroundColor: '#f5f5f7',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    children: [],
  },
};

// Builder context state type
interface BuilderState {
  components: ComponentData[];
  selectedComponentId: string | null;
}

// Builder context actions
type BuilderAction =
  | { type: 'ADD_COMPONENT'; payload: { component: ComponentData; parentId?: string } }
  | { type: 'UPDATE_COMPONENT'; payload: { id: string; updates: Partial<ComponentData> } }
  | { type: 'REMOVE_COMPONENT'; payload: { id: string } }
  | { type: 'SELECT_COMPONENT'; payload: { id: string | null } }
  | { type: 'REORDER_COMPONENTS'; payload: { components: ComponentData[] } };

// Builder context reducer
function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'ADD_COMPONENT': {
      const { component, parentId } = action.payload;
      
      // Helper function to add component to children
      const addToChildren = (components: ComponentData[]): ComponentData[] => {
        return components.map(comp => {
          if (comp.id === parentId) {
            return {
              ...comp,
              children: [...(comp.children || []), component],
            };
          }
          if (comp.children) {
            return {
              ...comp,
              children: addToChildren(comp.children),
            };
          }
          return comp;
        });
      };

      // If parentId is provided, add to that parent's children
      if (parentId) {
        return {
          ...state,
          components: addToChildren(state.components),
        };
      }
      
      // Otherwise add to root level
      return {
        ...state,
        components: [...state.components, component],
      };
    }
    
    case 'UPDATE_COMPONENT': {
      const { id, updates } = action.payload;
      
      // Helper function to update component
      const updateComponent = (components: ComponentData[]): ComponentData[] => {
        return components.map(comp => {
          if (comp.id === id) {
            return { ...comp, ...updates };
          }
          if (comp.children) {
            return {
              ...comp,
              children: updateComponent(comp.children),
            };
          }
          return comp;
        });
      };

      return {
        ...state,
        components: updateComponent(state.components),
      };
    }
    
    case 'REMOVE_COMPONENT': {
      const { id } = action.payload;
      
      // Helper function to remove component
      const removeComponent = (components: ComponentData[]): ComponentData[] => {
        return components
          .filter(comp => comp.id !== id)
          .map(comp => {
            if (comp.children) {
              return {
                ...comp,
                children: removeComponent(comp.children),
              };
            }
            return comp;
          });
      };

      return {
        ...state,
        components: removeComponent(state.components),
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
      };
    }
    
    case 'SELECT_COMPONENT': {
      return {
        ...state,
        selectedComponentId: action.payload.id,
      };
    }
    
    case 'REORDER_COMPONENTS': {
      return {
        ...state,
        components: action.payload.components,
      };
    }
    
    default:
      return state;
  }
}

// Create the context
interface BuilderContextType {
  state: BuilderState;
  addComponent: (type: ComponentType, parentId?: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentData>) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  getSelectedComponent: () => ComponentData | null;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

// Create provider component
export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(builderReducer, {
    components: initialTemplate,
    selectedComponentId: null,
  });

  const addComponent = (type: ComponentType, parentId?: string) => {
    const newComponent: ComponentData = {
      ...componentTemplates[type],
      id: uuidv4(),
    };
    
    dispatch({
      type: 'ADD_COMPONENT',
      payload: { component: newComponent, parentId },
    });
    
    dispatch({
      type: 'SELECT_COMPONENT',
      payload: { id: newComponent.id },
    });
  };

  const updateComponent = (id: string, updates: Partial<ComponentData>) => {
    dispatch({
      type: 'UPDATE_COMPONENT',
      payload: { id, updates },
    });
  };

  const removeComponent = (id: string) => {
    dispatch({
      type: 'REMOVE_COMPONENT',
      payload: { id },
    });
  };

  const selectComponent = (id: string | null) => {
    dispatch({
      type: 'SELECT_COMPONENT',
      payload: { id },
    });
  };

  // Helper function to find the selected component
  const findComponent = (components: ComponentData[], id: string): ComponentData | null => {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = findComponent(comp.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const getSelectedComponent = (): ComponentData | null => {
    if (!state.selectedComponentId) return null;
    return findComponent(state.components, state.selectedComponentId);
  };

  const value = {
    state,
    addComponent,
    updateComponent,
    removeComponent,
    selectComponent,
    getSelectedComponent,
  };

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
};

// Create hook for using the builder context
export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (context === undefined) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};
