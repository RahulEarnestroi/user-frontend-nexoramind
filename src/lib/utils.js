import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function generateCertificateId() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `NM-${year}-${random}`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getVerificationUrl(certificateId) {
  return `${window.location.origin}/verify/${certificateId}`;
}

export function getShareMessage(certificate) {
  return `I've successfully earned the ${certificate.certificationName} from NexoraMind Tech. Verify: ${getVerificationUrl(certificate.certificateId)}`;
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export function getStatusColor(status) {
  switch (status) {
    case 'ACTIVE': return 'text-success-600 bg-success-50';
    case 'REVOKED': return 'text-danger-600 bg-danger-50';
    case 'EXPIRED': return 'text-warning-600 bg-warning-50';
    default: return 'text-slate-600 bg-slate-50';
  }
}
