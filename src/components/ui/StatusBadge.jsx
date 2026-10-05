import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function StatusBadge({ status, type = 'availability' }) {
  const { t } = useLanguage();

  if (!status) return null;

  const getBadgeClass = (s) => {
    switch (s) {
      case 'Available':
      case 'Approved':
      case 'active':
      case 'Complete':
      case 'Resolved':
        return 'badge-available';
      case 'Pending':
      case 'Contacted':
      case 'Interviewing':
      case 'Processing':
      case 'Under Review':
        return 'badge-pending';
      case 'Rejected':
      case 'Blocked':
      case 'Not Available':
      case 'suspended':
      case 'deactivated':
      case 'Cancelled':
      case 'expired':
        return 'badge-rejected';
      case 'Hired':
      case 'Completed':
      case 'Closed':
        return 'badge-hired';
      default:
        return 'badge-custom';
    }
  };

  const getLabel = (s) => {
    switch (s) {
      case 'Available': return t('available');
      case 'Contacted': return t('contacted');
      case 'Interviewing': return t('interviewing');
      case 'Hired': return t('hired');
      case 'Not Available': return t('notAvailable');
      case 'Pending': return t('pending');
      case 'Approved': return t('approved');
      case 'Rejected': return t('rejected');
      case 'Blocked': return t('blocked');
      case 'active': return t('approved');
      case 'Complete': return 'مكتمل';
      case 'Incomplete': return 'غير مكتمل';
      default: return s;
    }
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
      {getLabel(status)}
    </span>
  );
}
