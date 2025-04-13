
import WebsiteBuilder from '@/components/WebsiteBuilder/WebsiteBuilder';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const Index = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <WebsiteBuilder />
    </DndProvider>
  );
};

export default Index;
