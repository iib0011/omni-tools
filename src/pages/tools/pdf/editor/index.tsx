import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Link,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { EmbedPDF } from '@simplepdf/react-embed-pdf';

export const SIMPLEPDF_PRIVACY_POLICY_URL =
  'https://simplepdf.com/privacy-policy';

/**
 * The PDF editor is not an OmniTools engine: it is the third-party SimplePDF
 * editor, rendered in an iframe served from *.simplepdf.com. Once loaded, that
 * iframe sends usage analytics and a SHA-256 fingerprint of the opened PDF to
 * SimplePDF servers (see issue #301). Telemetry cannot be disabled without a
 * SimplePDF company account, so the iframe is only created after an explicit,
 * per-visit opt-in. Until then no request is made to SimplePDF.
 */
export function SimplePdfConsentGate({ onAccept }: { onAccept: () => void }) {
  const { t } = useTranslation('pdf');

  return (
    <Alert severity="warning" data-testid="simplepdf-consent">
      <AlertTitle>{t('editor.thirdParty.title')}</AlertTitle>
      <Typography variant="body2" mb={1}>
        {t('editor.thirdParty.description')}
      </Typography>
      <Typography variant="body2" mb={2}>
        {t('editor.thirdParty.alternatives')}{' '}
        <Link
          href={SIMPLEPDF_PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('editor.thirdParty.privacyPolicy')}
        </Link>
      </Typography>
      <Button variant="contained" onClick={onAccept}>
        {t('editor.thirdParty.accept')}
      </Button>
    </Alert>
  );
}

export default function PdfEditor({ title }: ToolComponentProps) {
  // Deliberately not persisted: consent is asked again on every visit.
  const [thirdPartyAccepted, setThirdPartyAccepted] = useState(false);

  return (
    <ToolContent
      title={title}
      initialValues={{}}
      getGroups={null}
      input={null}
      inputComponent={
        thirdPartyAccepted ? (
          <Box sx={{ width: '100%', height: '80vh' }}>
            <EmbedPDF mode="inline" style={{ width: '100%', height: '100%' }} />
          </Box>
        ) : (
          <SimplePdfConsentGate onAccept={() => setThirdPartyAccepted(true)} />
        )
      }
      toolInfo={{
        title: 'PDF Editor',
        description:
          'Edit, annotate, highlight, fill forms, and export your PDFs with the embedded third-party SimplePDF editor. Add text, drawings, signatures, and more to your PDF documents. Unlike the other OmniTools PDF tools, this editor is loaded from simplepdf.com and only after you opt in.'
      }}
      compute={() => {
        /* no background compute required */
      }}
    />
  );
}
