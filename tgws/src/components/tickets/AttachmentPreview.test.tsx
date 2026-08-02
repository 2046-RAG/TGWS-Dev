import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AttachmentPreview from './AttachmentPreview';

const attachments = [
  { id: 'a1', file_name: 'screenshot.png', file_url: '/a.png', file_size: 2048, file_type: 'image/png' },
  { id: 'a2', file_name: 'report.pdf', file_url: '/r.pdf', file_size: 1024 * 1024, file_type: 'application/pdf' },
  { id: 'a3', file_name: 'notes.txt', file_url: '/n.txt', file_size: 512, file_type: 'text/plain' },
];

describe('AttachmentPreview', () => {
  it('renders nothing when no attachments', () => {
    const { container } = render(<AttachmentPreview attachments={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders file names and formatted sizes', () => {
    render(<AttachmentPreview attachments={attachments} />);
    expect(screen.getByText('screenshot.png')).toBeInTheDocument();
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('2 KB')).toBeInTheDocument(); // 2048 bytes
    expect(screen.getByText('1 MB')).toBeInTheDocument();
    expect(screen.getByText('512 Bytes')).toBeInTheDocument();
  });

  it('renders image thumbnails for image types', () => {
    render(<AttachmentPreview attachments={[attachments[0]]} />);
    const img = screen.getByAltText('screenshot.png');
    expect(img.getAttribute('src')).toBe('/a.png');
  });

  it('shows preview modal on click for image', () => {
    render(<AttachmentPreview attachments={[attachments[0]]} />);
    fireEvent.click(screen.getByTitle('Preview'));
    expect(screen.getByRole('dialog', { name: 'screenshot.png' })).toBeInTheDocument();
  });

  it('closes preview modal on Escape', () => {
    render(<AttachmentPreview attachments={[attachments[0]]} />);
    fireEvent.click(screen.getByTitle('Preview'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows iframe for PDF preview with sandbox', () => {
    render(<AttachmentPreview attachments={[attachments[1]]} />);
    fireEvent.click(screen.getByTitle('Preview'));
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe!.getAttribute('sandbox')).toBe('');
  });

  it('shows download-fallback for non-previewable files', () => {
    render(<AttachmentPreview attachments={[attachments[2]]} />);
    // no preview button for txt
    expect(screen.queryByTitle('Preview')).not.toBeInTheDocument();
    expect(screen.getByTitle('Download')).toBeInTheDocument();
  });

  it('calls onRemove when remove clicked', () => {
    const onRemove = vi.fn();
    render(<AttachmentPreview attachments={[attachments[0]]} onRemove={onRemove} showRemove />);
    fireEvent.click(screen.getByTitle('Remove'));
    expect(onRemove).toHaveBeenCalledWith('a1');
  });

  it('does not show remove when showRemove false', () => {
    render(<AttachmentPreview attachments={[attachments[0]]} />);
    expect(screen.queryByTitle('Remove')).not.toBeInTheDocument();
  });
});
