
import React from 'react';
import { useBuilder, ComponentData } from '@/context/BuilderContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  PanelTop,
  Type, 
  Image as ImageIcon, 
  SquareUser, 
  Box, 
  PaintBucket, 
  Sliders,
  Space,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PropertiesPanelProps {
  onSelectPanel?: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ onSelectPanel }) => {
  const { getSelectedComponent, updateComponent } = useBuilder();
  const selectedComponent = getSelectedComponent();

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedComponent) return;
    
    updateComponent(selectedComponent.id, {
      content: e.target.value
    });
  };

  const handleStyleChange = (property: string, value: string | number) => {
    if (!selectedComponent) return;
    
    updateComponent(selectedComponent.id, {
      styles: {
        ...selectedComponent.styles,
        [property]: value
      }
    });
  };

  const handleImagePropChange = (prop: string, value: string) => {
    if (!selectedComponent || selectedComponent.type !== 'image') return;
    
    updateComponent(selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [prop]: value
      }
    });
  };

  if (!selectedComponent) {
    return (
      <div className="p-4 bg-gradient-to-b from-white to-gray-50 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-builder-blue to-purple-500 text-transparent bg-clip-text">Properties</h2>
          {onSelectPanel && (
            <Button variant="ghost" size="sm" onClick={onSelectPanel}
              className="hover:text-builder-blue transition-colors">
              <ArrowLeft className="mr-1 h-4 w-4" /> Components
            </Button>
          )}
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="py-8 text-center text-muted-foreground"
        >
          <Sliders className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-sm">Select an element to edit its properties</p>
          <p className="text-xs text-gray-400 mt-1">Click on any component in the canvas</p>
        </motion.div>
      </div>
    );
  }

  const renderSpecificProperties = () => {
    switch (selectedComponent.type) {
      case 'heading':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="heading-text" className="text-sm font-medium">Heading Text</Label>
              <Input
                id="heading-text"
                value={selectedComponent.content}
                onChange={handleContentChange}
                className="mt-1 focus-visible:ring-builder-blue"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="font-size" className="text-sm font-medium">Font Size (px)</Label>
              <Input
                id="font-size"
                type="number"
                value={
                  typeof selectedComponent.styles.fontSize === 'string'
                    ? parseInt(selectedComponent.styles.fontSize)
                    : selectedComponent.styles.fontSize || ''
                }
                onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                className="mt-1 focus-visible:ring-builder-blue"
              />
            </div>
          </>
        );
      
      case 'paragraph':
        return (
          <div className="mb-4">
            <Label htmlFor="paragraph-text" className="text-sm font-medium">Text Content</Label>
            <Textarea
              id="paragraph-text"
              value={selectedComponent.content}
              onChange={handleContentChange}
              rows={4}
              className="mt-1 focus-visible:ring-builder-blue"
            />
          </div>
        );
      
      case 'button':
        return (
          <div className="mb-4">
            <Label htmlFor="button-text" className="text-sm font-medium">Button Text</Label>
            <Input
              id="button-text"
              value={selectedComponent.content}
              onChange={handleContentChange}
              className="mt-1 focus-visible:ring-builder-blue"
            />
          </div>
        );
      
      case 'image':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="image-src" className="text-sm font-medium">Image URL</Label>
              <Input
                id="image-src"
                value={selectedComponent.props?.src || ''}
                onChange={(e) => handleImagePropChange('src', e.target.value)}
                placeholder="/placeholder.svg"
                className="mt-1 focus-visible:ring-builder-blue"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="image-alt" className="text-sm font-medium">Alt Text</Label>
              <Input
                id="image-alt"
                value={selectedComponent.props?.alt || ''}
                onChange={(e) => handleImagePropChange('alt', e.target.value)}
                placeholder="Image description"
                className="mt-1 focus-visible:ring-builder-blue"
              />
            </div>
          </>
        );
      
      case 'container':
        return (
          <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm font-medium mb-2">Container Settings</p>
            <p className="text-xs text-muted-foreground">
              This container can hold other components. Drag components into it to add content.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getComponentIcon = () => {
    switch (selectedComponent.type) {
      case 'heading':
        return <Type className="w-4 h-4 mr-2" />;
      case 'paragraph':
        return <Type className="w-4 h-4 mr-2" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 mr-2" />;
      case 'button':
        return <SquareUser className="w-4 h-4 mr-2" />;
      case 'container':
        return <Box className="w-4 h-4 mr-2" />;
      default:
        return <PanelTop className="w-4 h-4 mr-2" />;
    }
  };

  const getComponentTitle = () => {
    switch (selectedComponent.type) {
      case 'heading':
        return 'Heading';
      case 'paragraph':
        return 'Paragraph';
      case 'image':
        return 'Image';
      case 'button':
        return 'Button';
      case 'container':
        return 'Container';
      default:
        return 'Component';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-gradient-to-b from-white to-gray-50 h-full"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-builder-blue to-purple-500 text-transparent bg-clip-text">Properties</h2>
        {onSelectPanel && (
          <Button variant="ghost" size="sm" onClick={onSelectPanel}
            className="hover:text-builder-blue transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" /> Components
          </Button>
        )}
      </div>

      <div className="mb-4 flex items-center p-2 bg-white rounded-md border border-gray-200 shadow-sm">
        {getComponentIcon()}
        <span className="font-medium text-builder-blue">{getComponentTitle()}</span>
      </div>

      <Accordion type="single" collapsible defaultValue="content" className="w-full">
        <AccordionItem value="content" className="border-b border-gray-200">
          <AccordionTrigger className="py-2 hover:text-builder-blue">
            <div className="flex items-center">
              <Type className="w-4 h-4 mr-2" />
              <span>Content</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="py-2">
            {renderSpecificProperties()}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="style" className="border-b border-gray-200">
          <AccordionTrigger className="py-2 hover:text-builder-blue">
            <div className="flex items-center">
              <PaintBucket className="w-4 h-4 mr-2" />
              <span>Styling</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="py-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="color" className="text-sm font-medium">Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="color" 
                    value={selectedComponent.styles.color || '#000000'} 
                    onChange={(e) => handleStyleChange('color', e.target.value)} 
                    className="w-10 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input 
                    id="color"
                    value={selectedComponent.styles.color || '#000000'} 
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="focus-visible:ring-builder-blue" 
                  />
                </div>
              </div>

              {(selectedComponent.type === 'button' || selectedComponent.type === 'container') && (
                <div>
                  <Label htmlFor="bg-color" className="text-sm font-medium">Background Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="color" 
                      value={selectedComponent.styles.backgroundColor || '#ffffff'} 
                      onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} 
                      className="w-10 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input 
                      id="bg-color"
                      value={selectedComponent.styles.backgroundColor || '#ffffff'} 
                      onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                      className="focus-visible:ring-builder-blue" 
                    />
                  </div>
                </div>
              )}

              {selectedComponent.type !== 'image' && (
                <div>
                  <Label htmlFor="font-size" className="text-sm font-medium">Font Size (px)</Label>
                  <Input 
                    id="font-size"
                    type="number" 
                    value={selectedComponent.styles.fontSize?.toString().replace('px', '') || '16'} 
                    onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                    className="mt-1 focus-visible:ring-builder-blue" 
                  />
                </div>
              )}

              {selectedComponent.type !== 'container' && (
                <div>
                  <Label htmlFor="margin-bottom" className="text-sm font-medium">Margin Bottom (px)</Label>
                  <Input 
                    id="margin-bottom"
                    type="number" 
                    value={selectedComponent.styles.marginBottom?.toString().replace('px', '').replace('rem', '') || '0'} 
                    onChange={(e) => handleStyleChange('marginBottom', `${e.target.value}px`)}
                    className="mt-1 focus-visible:ring-builder-blue" 
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advanced" className="border-b border-gray-200">
          <AccordionTrigger className="py-2 hover:text-builder-blue">
            <div className="flex items-center">
              <Sliders className="w-4 h-4 mr-2" />
              <span>Advanced</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="py-2">
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-muted-foreground mb-1">
                Advanced styling options like animations and effects will be available in future updates.
              </p>
              <p className="text-xs text-builder-blue">Coming soon!</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
};

export default PropertiesPanel;
