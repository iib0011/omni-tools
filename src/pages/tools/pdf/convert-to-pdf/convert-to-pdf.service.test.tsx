import { render, screen, fireEvent } from '@testing-library/react';
import ConvertToPdf from './index';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

it('should render with default state values', () => {
  render(<ConvertToPdf title="Test PDF" />);
  expect(screen.getByLabelText(/A4 Page/i)).toBeChecked();
  expect(screen.getByLabelText(/Portrait/i)).toBeChecked();
  expect(screen.getByText(/Scale image: 100%/i)).toBeInTheDocument();
});

it('should switch to full page type when selected', () => {
  render(<ConvertToPdf title="Test PDF" />);
  const fullOption = screen.getByLabelText(/Full Size/i);
  fireEvent.click(fullOption);
  expect(fullOption).toBeChecked();
});

it('should update scale when slider moves', () => {
  render(<ConvertToPdf title="Test PDF" />);
  const slider = screen.getByRole('slider');
  fireEvent.change(slider, { target: { value: 80 } });
  expect(screen.getByText(/Scale image: 80%/i)).toBeInTheDocument();
});

it('should change orientation to landscape', () => {
  render(<ConvertToPdf title="Test PDF" />);
  const landscapeRadio = screen.getByLabelText(/Landscape/i);
  fireEvent.click(landscapeRadio);
  expect(landscapeRadio).toBeChecked();
});

vi.mock('jspdf', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      setDisplayMode: vi.fn(),
      internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
      addImage: vi.fn(),
      output: vi.fn().mockReturnValue(new Blob())
    }))
  };
});

it('should call jsPDF and addImage when compute is triggered', async () => {
  const createObjectURLStub = vi
    .spyOn(global.URL, 'createObjectURL')
    .mockReturnValue('blob:url');

  vi.mock('components/input/ToolImageInput', () => ({
    default: ({ onChange }: any) => (
      <input
        type="file"
        title="Input Image"
        onChange={(e) => onChange(e.target.files[0])}
      />
    )
  }));

  const mockFile = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
  render(<ConvertToPdf title="Test PDF" />);

  const fileInput = screen.getByTitle(/Input Image/i);
  fireEvent.change(fileInput, { target: { files: [mockFile] } });

  const jsPDF = (await import('jspdf')).default;
  expect(jsPDF).toHaveBeenCalled();

  createObjectURLStub.mockRestore();
});
