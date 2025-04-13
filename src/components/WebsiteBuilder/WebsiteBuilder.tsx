
import React, { useState } from 'react';
import { BuilderProvider } from '@/context/BuilderContext';
import ComponentsPanel from './ComponentsPanel';
import BuilderCanvas from './BuilderCanvas';
import PropertiesPanel from './PropertiesPanel';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Eye, Save, Undo, Redo, Layout, Sliders, Laptop } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

const WebsiteBuilder: React.FC = () => {
  const [previewMode, setPreviewMode] = useState(false);
  const isMobile = useIsMobile();
  const [mobilePanel, setMobilePanel] = useState<'components' | 'properties' | null>('components');

  const handleSave = () => {
    toast.success('Website saved successfully!', {
      description: 'Your changes have been saved.',
    });
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      toast.info('Preview mode enabled', {
        description: 'Viewing site as a visitor would see it.',
      });
    } else {
      toast.info('Edit mode enabled', {
        description: 'You can now edit your website.',
      });
    }
  };

  return (
    <BuilderProvider>
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Builder Toolbar */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between p-3 bg-white border-b shadow-sm"
        >
          <div className="flex items-center">
            <Layout className="h-6 w-6 mr-2 text-builder-blue" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-builder-blue to-purple-500 text-transparent bg-clip-text">
              Website Builder
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled className="text-gray-500">
              <Undo className="w-4 h-4 mr-1" />
              Undo
            </Button>
            <Button variant="outline" size="sm" disabled className="text-gray-500">
              <Redo className="w-4 h-4 mr-1" />
              Redo
            </Button>
            <Button 
              variant={previewMode ? "outline" : "default"} 
              size="sm" 
              onClick={togglePreviewMode}
              className={`transition-all duration-200 ${previewMode ? "" : "bg-builder-blue hover:bg-builder-blue-dark"}`}
            >
              <Eye className="w-4 h-4 mr-1" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-builder-blue to-purple-500 hover:from-builder-blue-dark hover:to-purple-600 transition-all duration-300"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </motion.div>

        {/* Builder Interface */}
        <div className="flex flex-1 overflow-hidden">
          {/* Components Panel - Show only in edit mode */}
          {!previewMode && (!isMobile || mobilePanel === 'components') && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-64 border-r bg-white overflow-y-auto shadow-sm"
            >
              <ComponentsPanel onSelectPanel={() => isMobile && setMobilePanel('properties')} />
            </motion.div>
          )}

          {/* Canvas - Middle section */}
          <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={`flex-1 overflow-auto ${previewMode ? 'bg-white' : 'bg-builder-gray-light p-4'}`}
          >
            <BuilderCanvas previewMode={previewMode} />
          </motion.div>

          {/* Properties Panel - Show only in edit mode */}
          {!previewMode && (!isMobile || mobilePanel === 'properties') && (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-72 border-l bg-white overflow-y-auto shadow-sm"
            >
              <PropertiesPanel onSelectPanel={() => isMobile && setMobilePanel('components')} />
            </motion.div>
          )}

          {/* Mobile Bottom Navigation for switching panels */}
          {!previewMode && isMobile && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 flex justify-around bg-white border-t p-3 z-10 shadow-md"
            >
              <Button
                variant={mobilePanel === 'components' ? 'default' : 'outline'}
                className={`flex-1 mr-1 ${mobilePanel === 'components' ? 'bg-builder-blue hover:bg-builder-blue-dark' : ''}`}
                onClick={() => setMobilePanel('components')}
              >
                <Layout className="w-4 h-4 mr-1" />
                Components
              </Button>
              <Button
                variant={mobilePanel === 'properties' ? 'default' : 'outline'}
                className={`flex-1 ml-1 ${mobilePanel === 'properties' ? 'bg-builder-blue hover:bg-builder-blue-dark' : ''}`}
                onClick={() => setMobilePanel('properties')}
              >
                <Sliders className="w-4 h-4 mr-1" />
                Properties
              </Button>
            </motion.div>
          )}
        </div>

        {/* Display mode indicator */}
        {previewMode && (
          <div className="fixed bottom-4 right-4">
            <Button 
              onClick={togglePreviewMode}
              className="bg-builder-blue hover:bg-builder-blue-dark shadow-lg flex items-center"
            >
              <Laptop className="w-4 h-4 mr-2" />
              Exit Preview
            </Button>
          </div>
        )}
      </div>
    </BuilderProvider>
  );
};

export default WebsiteBuilder;
