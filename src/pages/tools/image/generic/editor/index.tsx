import React, { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';

// Import the image editor with proper typing
import FilerobotImageEditor, {
  FilerobotImageEditorConfig
} from 'react-filerobot-image-editor';

export default function ImageEditor({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Handle file input change
  const handleInputChange = useCallback((file: File | null) => {
    setInput(file);
    if (file) {
      // Create object URL for the image editor
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setIsEditorOpen(true);
    } else {
      setImageUrl(null);
    }
  }, []);

  const onCloseEditor = (reason: string) => {
    setIsEditorOpen(false);
    setImageUrl(null);
  };

  // Handle save from image editor
  const handleSave: FilerobotImageEditorConfig['onSave'] = (
    editedImageObject,
    designState
  ) => {
    if (editedImageObject && editedImageObject.imageBase64) {
      // Convert base64 to blob
      const base64Data = editedImageObject.imageBase64.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: editedImageObject.mimeType });

      const editedFile = new File(
        [blob],
        editedImageObject.fullName ?? 'edited.png',
        {
          type: editedImageObject.mimeType
        }
      );
      // Create a temporary download link
      const url = URL.createObjectURL(editedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = editedFile.name; // This will be the name of the downloaded file
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Release the blob URL
      URL.revokeObjectURL(url);
    }
  };

  const getDefaultImageName = () => {
    if (!input) return;
    const originalName = input?.name || 'edited-image';
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const editedFileName = `${nameWithoutExt}-edited`;
    return editedFileName;
  };

  return (
    <ToolContent
      title={title}
      initialValues={{}}
      getGroups={null}
      input={input}
      inputComponent={
        isEditorOpen ? (
          imageUrl && (
            <Box style={{ width: '100%', height: '70vh' }}>
              <FilerobotImageEditor
                source={imageUrl}
                onSave={handleSave}
                onClose={onCloseEditor}
                annotationsCommon={{
                  fill: 'blue'
                }}
                defaultSavedImageName={getDefaultImageName()}
                Rotate={{ angle: 90, componentType: 'slider' }}
                savingPixelRatio={1}
                previewPixelRatio={1}
              />
            </Box>
          )
        ) : (
          <ToolImageInput
            value={input}
            onChange={handleInputChange}
            accept={['image/*']}
            title="Upload Image to Edit"
          />
        )
      }
      toolInfo={{
        title: 'Image Editor',
        description:
          'A powerful image editing tool that provides professional-grade features including cropping, rotating, color adjustments, text annotations, drawing tools, and watermarking. Edit your images directly in your browser without the need for external software.'
      }}
      compute={() => {}}
    />
  );
}
