
import React from 'react';
import { useBuilder, ComponentType } from '@/context/BuilderContext';
import { Button } from '@/components/ui/button';
import { 
  Heading, 
  Type, 
  Image as ImageIcon, 
  Square, 
  MousePointer, 
  Layout, 
  ListTodo,
  PlusCircle
} from 'lucide-react';
import { useDrag } from 'react-dnd';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { motion } from 'framer-motion';

interface ComponentItemProps {
  title: string;
  icon: React.ReactNode;
  type: ComponentType;
}

const ComponentItem: React.FC<ComponentItemProps> = ({ title, icon, type }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        // Component was not dropped on a valid target
        console.log('Component was not dropped on a valid target');
      }
    },
  }));

  const { addComponent } = useBuilder();

  const handleClick = () => {
    addComponent(type);
    toast.success(`Added ${title} component`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      ref={drag}
      className={`
        flex items-center p-3 rounded-md mb-2 cursor-move
        bg-gradient-to-r from-white to-gray-50 border border-gray-200 
        hover:border-builder-blue hover:from-blue-50 hover:to-blue-50/70
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        transition-all duration-200 shadow-sm hover:shadow
      `}
      onClick={handleClick}
    >
      <div className="mr-3 text-builder-blue">
        {icon}
      </div>
      <span className="text-sm font-medium">{title}</span>
      <div className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100">
        <PlusCircle size={14} />
      </div>
    </motion.div>
  );
};

interface ComponentsPanelProps {
  onSelectPanel?: () => void;
}

const ComponentsPanel: React.FC<ComponentsPanelProps> = ({ onSelectPanel }) => {
  const basicComponents = [
    { title: 'Heading', icon: <Heading size={18} />, type: 'heading' as ComponentType },
    { title: 'Text', icon: <Type size={18} />, type: 'paragraph' as ComponentType },
    { title: 'Image', icon: <ImageIcon size={18} />, type: 'image' as ComponentType },
    { title: 'Button', icon: <Square size={18} />, type: 'button' as ComponentType },
    { title: 'Container', icon: <Layout size={18} />, type: 'container' as ComponentType },
  ];

  return (
    <div className="p-4 bg-gradient-to-b from-white to-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-builder-blue to-purple-500 text-transparent bg-clip-text">Components</h2>
        {onSelectPanel && (
          <Button variant="ghost" size="sm" onClick={onSelectPanel}
            className="hover:text-builder-blue transition-colors">
            Properties →
          </Button>
        )}
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full mb-4 bg-gray-100">
          <TabsTrigger value="basic" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-builder-blue">Basic</TabsTrigger>
          <TabsTrigger value="layouts" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-builder-blue">Layouts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-3 animate-fade-in">
          {basicComponents.map((component) => (
            <ComponentItem
              key={component.title}
              title={component.title}
              icon={component.icon}
              type={component.type}
            />
          ))}
        </TabsContent>
        
        <TabsContent value="layouts" className="animate-fade-in">
          <div className="p-6 text-center text-muted-foreground bg-white rounded-md border border-dashed border-gray-300">
            <Layout className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm">Advanced layouts will be available in the next version!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComponentsPanel;
