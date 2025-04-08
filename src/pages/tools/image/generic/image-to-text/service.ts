import { createWorker } from 'tesseract.js';
import { InitialValuesType } from './types';

export const extractTextFromImage = async (
  file: File,
  options: InitialValuesType
): Promise<string> => {
  try {
    const { language, detectParagraphs } = options;

    // Create a Tesseract worker
    const worker = await createWorker(language);

    // Convert file to URL
    const imageUrl = URL.createObjectURL(file);

    // Recognize text
    const { data } = await worker.recognize(imageUrl);

    // Clean up
    URL.revokeObjectURL(imageUrl);
    await worker.terminate();

    // Process the result based on options
    if (detectParagraphs) {
      // Return text with paragraph structure preserved
      return data.text;
    } else {
      // Return plain text with basic formatting
      return data.text;
    }
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error(
      'Failed to extract text from image. Please try again with a clearer image.'
    );
  }
};

// Helper function to get available languages
export const getAvailableLanguages = (): { value: string; label: string }[] => {
  return [
    { value: 'eng', label: 'English' },
    { value: 'fra', label: 'French' },
    { value: 'deu', label: 'German' },
    { value: 'spa', label: 'Spanish' },
    { value: 'ita', label: 'Italian' },
    { value: 'por', label: 'Portuguese' },
    { value: 'rus', label: 'Russian' },
    { value: 'jpn', label: 'Japanese' },
    { value: 'chi_sim', label: 'Chinese (Simplified)' },
    { value: 'chi_tra', label: 'Chinese (Traditional)' },
    { value: 'kor', label: 'Korean' },
    { value: 'ara', label: 'Arabic' }
  ];
};
