import {
  Box,
  Checkbox,
  CircularProgress,
  Paper,
  Typography
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { DropPlacement, OrganizerPage } from './types';
import type { PdfThumbnailRenderer } from './thumbnail-service';

interface PageThumbnailCardProps {
  page: OrganizerPage;
  position: number;
  selected: boolean;
  disabled: boolean;
  renderer: PdfThumbnailRenderer | null;
  labels: {
    page: (pageNumber: number) => string;
    originalPage: (pageNumber: number) => string;
    blankPage: string;
    thumbnail: (pageNumber: number) => string;
    thumbnailError: string;
  };
  onToggle: (pageId: string, range: boolean) => void;
  onDragStart: (pageId: string) => void;
  onDrop: (targetId: string, placement: DropPlacement) => void;
  onMoveBy: (pageId: string, direction: -1 | 1) => void;
  onMoveToEdge: (pageId: string, edge: 'start' | 'end') => void;
}

export default function PageThumbnailCard({
  page,
  position,
  selected,
  disabled,
  renderer,
  labels,
  onToggle,
  onDragStart,
  onDrop,
  onMoveBy,
  onMoveToEdge
}: PageThumbnailCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [renderState, setRenderState] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || visible) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || page.kind === 'blank' || !renderer || !canvasRef.current) {
      return;
    }

    const controller = new AbortController();
    setRenderState('loading');
    renderer
      .renderPage(page.sourceIndex, canvasRef.current, controller.signal)
      .then(() => setRenderState('ready'))
      .catch((error: unknown) => {
        if (
          !controller.signal.aborted &&
          (!(error instanceof Error) || error.name !== 'AbortError')
        ) {
          setRenderState('error');
        }
      });
    return () => controller.abort();
  }, [page, renderer, visible]);

  const accessibleName =
    page.kind === 'source'
      ? `${labels.page(position)}, ${labels.originalPage(
          page.sourcePageNumber
        )}`
      : `${labels.page(position)}, ${labels.blankPage}`;

  return (
    <Paper
      ref={containerRef}
      component="article"
      role="option"
      aria-label={accessibleName}
      aria-selected={selected}
      aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Alt+Home Alt+End"
      tabIndex={0}
      draggable={!disabled}
      data-page-id={page.id}
      data-testid="organizer-page"
      onClick={(event) => onToggle(page.id, event.shiftKey)}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', page.id);
        onDragStart(page.id);
      }}
      onDragEnd={() => setDragOver(false)}
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        if (disabled) return;
        event.preventDefault();
        const bounds = event.currentTarget.getBoundingClientRect();
        const placement =
          event.clientX > bounds.left + bounds.width / 2 ? 'after' : 'before';
        setDragOver(false);
        onDrop(page.id, placement);
      }}
      onKeyDown={(event) => {
        if (event.key === ' ' && !event.altKey) {
          event.preventDefault();
          onToggle(page.id, event.shiftKey);
          return;
        }
        if (disabled || !event.altKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          onMoveBy(page.id, -1);
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          onMoveBy(page.id, 1);
        } else if (event.key === 'Home') {
          event.preventDefault();
          onMoveToEdge(page.id, 'start');
        } else if (event.key === 'End') {
          event.preventDefault();
          onMoveToEdge(page.id, 'end');
        }
      }}
      sx={{
        position: 'relative',
        minHeight: 286,
        p: 1,
        cursor: disabled ? 'default' : 'grab',
        border: 2,
        borderColor: dragOver
          ? 'secondary.main'
          : selected
            ? 'primary.main'
            : 'divider',
        outline: 'none',
        '&:focus-visible': {
          boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}`
        }
      }}
    >
      <Checkbox
        checked={selected}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(page.id, event.shiftKey);
        }}
        inputProps={{ 'aria-label': accessibleName, readOnly: true }}
        sx={{
          position: 'absolute',
          top: 2,
          left: 2,
          zIndex: 2,
          bgcolor: 'background.paper',
          borderRadius: 1
        }}
      />

      <Box
        sx={{
          height: 230,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          bgcolor: page.kind === 'blank' ? 'grey.100' : 'grey.200',
          border: 1,
          borderColor: 'divider'
        }}
      >
        {page.kind === 'blank' ? (
          <Typography color="text.secondary">{labels.blankPage}</Typography>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              aria-label={labels.thumbnail(page.sourcePageNumber)}
              style={{
                display: renderState === 'ready' ? 'block' : 'none',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
            {(renderState === 'idle' || renderState === 'loading') && (
              <CircularProgress
                size={28}
                aria-label={labels.thumbnail(page.sourcePageNumber)}
              />
            )}
            {renderState === 'error' && (
              <Typography
                variant="caption"
                color="error"
                textAlign="center"
                px={1}
              >
                {labels.thumbnailError}
              </Typography>
            )}
          </>
        )}
      </Box>

      <Typography variant="subtitle2" mt={1} textAlign="center">
        {labels.page(position)}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        textAlign="center"
      >
        {page.kind === 'source'
          ? labels.originalPage(page.sourcePageNumber)
          : labels.blankPage}
      </Typography>
    </Paper>
  );
}
