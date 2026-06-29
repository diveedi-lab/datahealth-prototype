import type { SourceFormat, TargetFormat } from './types';

export interface FormatDescriptor {
  id: SourceFormat | TargetFormat;
  label: string;
  role: 'source' | 'target' | 'both';
  description: string;
  color: string;
}

export const FORMAT_CATALOG: FormatDescriptor[] = [
  { id: 'custom', label: 'Custom / CSV', role: 'source', description: 'Tabelle proprietarie o export generici', color: '#64748b' },
  { id: 'oracledb', label: 'Oracle DB', role: 'source', description: 'Dump relazionale Oracle', color: '#dc2626' },
  { id: 'redcap', label: 'REDCap', role: 'source', description: 'Export REDCap (record + data dictionary)', color: '#0ea5e9' },
  { id: 'cdash', label: 'CDISC CDASH', role: 'source', description: 'Standard di raccolta dati CDASH', color: '#f59e0b' },
  { id: 'omop', label: 'OMOP CDM', role: 'both', description: 'Common Data Model OHDSI', color: '#06b6d4' },
  { id: 'cdisc', label: 'CDISC SDTM', role: 'both', description: 'Study Data Tabulation Model', color: '#8b5cf6' },
  { id: 'fhir', label: 'HL7 FHIR', role: 'both', description: 'Fast Healthcare Interoperability Resources', color: '#10b981' },
];

export const SOURCE_FORMATS = FORMAT_CATALOG.filter((f) => f.role !== 'target');
export const TARGET_FORMATS = FORMAT_CATALOG.filter((f) => f.role !== 'source');
