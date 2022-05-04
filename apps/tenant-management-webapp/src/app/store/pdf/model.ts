export interface PdfTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}
export interface PdfState {
  pdfTemplates: Record<string, PdfTemplate>;
}

export const defaultPdfTemplate: PdfTemplate = {
  id: '',
  name: '',
  description: '',
  template: '',
};
