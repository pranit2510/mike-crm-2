'use client';

import React, { useState } from 'react';
import { ArrowRight, Send, CheckCircle, DollarSign, Clock, AlertTriangle, UserPlus, FileText, Briefcase } from 'lucide-react';
import { leadStages, clientStages, quoteStages, jobStages, invoiceStages } from '@/lib/flowStates';
import type { LeadStatus, ClientStatus, QuoteStatus, JobStatus, InvoiceStatus } from '@/lib/flowStates';
import ConversionModal from '@/components/flow/ConversionModal';

interface FlowActionsProps {
  module: 'leads' | 'clients' | 'quotes' | 'jobs' | 'invoices';
  status: LeadStatus | ClientStatus | QuoteStatus | JobStatus | InvoiceStatus;
  entityId: string;
  onAction?: (action: string, entityId: string) => void;
  isCompact?: boolean;
}

const FlowActions: React.FC<FlowActionsProps> = ({
  module,
  status,
  entityId,
  onAction,
  isCompact = false
}) => {
  const [conversionModal, setConversionModal] = useState<{
    isOpen: boolean;
    type: 'leadToClient' | 'quoteToJob' | 'jobToInvoice' | null;
    sourceData: any;
  }>({
    isOpen: false,
    type: null,
    sourceData: null
  });

  const getActions = () => {
    switch (module) {
      case 'leads':
        switch (status as LeadStatus) {
          case 'New':
            return [
              { 
                key: 'contact', 
                label: 'Contact Lead', 
                icon: <Send size={14} />, 
                variant: 'primary',
                description: 'Reach out to the lead'
              }
            ];
          case 'Contacted':
            return [
              { 
                key: 'qualify', 
                label: 'Mark Qualified', 
                icon: <CheckCircle size={14} />, 
                variant: 'success',
                description: 'Lead shows genuine interest'
              },
              { 
                key: 'followUp', 
                label: 'Schedule Follow-up', 
                icon: <Clock size={14} />, 
                variant: 'secondary',
                description: 'Set reminder for next contact'
              }
            ];
          case 'Qualified':
            return [
              { 
                key: 'convertToClient', 
                label: 'Convert to Client', 
                icon: <UserPlus size={14} />, 
                variant: 'success',
                description: 'Create client record from this lead',
                isConversion: true,
                conversionType: 'leadToClient' as const
              },
              { 
                key: 'sendProposal', 
                label: 'Send Proposal', 
                icon: <FileText size={14} />, 
                variant: 'primary',
                description: 'Send quote or proposal'
              }
            ];
          case 'Proposal Sent':
            return [
              { 
                key: 'followUpProposal', 
                label: 'Follow Up', 
                icon: <Clock size={14} />, 
                variant: 'secondary',
                description: 'Check on proposal status'
              }
            ];
          default:
            return [];
        }

      case 'clients':
        switch (status as ClientStatus) {
          case 'Prospective':
            return [
              { 
                key: 'createQuote', 
                label: 'Create Quote', 
                icon: <FileText size={14} />, 
                variant: 'primary',
                description: 'Generate quote for services'
              }
            ];
          case 'Active':
            return [
              { 
                key: 'createQuote', 
                label: 'New Quote', 
                icon: <FileText size={14} />, 
                variant: 'primary',
                description: 'Create additional quote'
              }
            ];
          case 'VIP':
            return [
              { 
                key: 'priorityService', 
                label: 'Priority Service', 
                icon: <AlertTriangle size={14} />, 
                variant: 'primary',
                description: 'Fast-track service request'
              }
            ];
          default:
            return [];
        }

      case 'quotes':
        switch (status as QuoteStatus) {
          case 'Draft':
            return [
              { 
                key: 'sendQuote', 
                label: 'Send Quote', 
                icon: <Send size={14} />, 
                variant: 'primary',
                description: 'Email quote to client'
              }
            ];
          case 'Sent':
            return [
              { 
                key: 'followUp', 
                label: 'Follow Up', 
                icon: <Clock size={14} />, 
                variant: 'secondary',
                description: 'Check with client'
              }
            ];
          case 'Reviewed':
            return [
              { 
                key: 'followUp', 
                label: 'Follow Up', 
                icon: <Clock size={14} />, 
                variant: 'secondary',
                description: 'Discuss with client'
              }
            ];
          case 'Approved':
            return [
              { 
                key: 'createJob', 
                label: 'Create Job', 
                icon: <Briefcase size={14} />, 
                variant: 'success',
                description: 'Schedule work order',
                isConversion: true,
                conversionType: 'quoteToJob' as const
              }
            ];
          default:
            return [];
        }

      case 'jobs':
        switch (status as JobStatus) {
          case 'Scheduled':
            return [
              { 
                key: 'dispatch', 
                label: 'Dispatch', 
                icon: <ArrowRight size={14} />, 
                variant: 'primary',
                description: 'Send technician to job'
              }
            ];
          case 'Dispatched':
            return [
              { 
                key: 'startWork', 
                label: 'Start Work', 
                icon: <CheckCircle size={14} />, 
                variant: 'success',
                description: 'Mark job as in progress'
              }
            ];
          case 'In Progress':
            return [
              { 
                key: 'completeJob', 
                label: 'Mark Complete', 
                icon: <CheckCircle size={14} />, 
                variant: 'success',
                description: 'Job finished successfully'
              }
            ];
          case 'Completed':
            return [
              { 
                key: 'needsInvoicing', 
                label: 'Needs Invoicing', 
                icon: <DollarSign size={14} />, 
                variant: 'primary',
                description: 'Ready for billing'
              }
            ];
          case 'Needs Invoicing':
            return [
              { 
                key: 'createInvoice', 
                label: 'Create Invoice', 
                icon: <DollarSign size={14} />, 
                variant: 'success',
                description: 'Generate bill for client',
                isConversion: true,
                conversionType: 'jobToInvoice' as const
              }
            ];
          default:
            return [];
        }

      case 'invoices':
        switch (status as InvoiceStatus) {
          case 'Draft':
            return [
              { 
                key: 'sendInvoice', 
                label: 'Send Invoice', 
                icon: <Send size={14} />, 
                variant: 'primary',
                description: 'Email to client'
              }
            ];
          case 'Sent':
            return [
              { 
                key: 'followUp', 
                label: 'Follow Up', 
                icon: <Clock size={14} />, 
                variant: 'secondary',
                description: 'Payment reminder'
              }
            ];
          case 'Viewed':
            return [
              { 
                key: 'followUp', 
                label: 'Follow Up', 
                icon: <Clock size={14} />, 
                variant: 'secondary',
                description: 'Check payment status'
              }
            ];
          case 'Overdue':
            return [
              { 
                key: 'sendReminder', 
                label: 'Send Reminder', 
                icon: <AlertTriangle size={14} />, 
                variant: 'warning',
                description: 'Overdue payment notice'
              }
            ];
          default:
            return [];
        }

      default:
        return [];
    }
  };

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
      case 'secondary':
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  const handleActionClick = (action: any) => {
    if (action.isConversion) {
      // Mock source data - in real app, this would come from props or API
      const sourceData = {
        id: entityId,
        name: 'Mock Client Name',
        email: 'client@example.com',
        phone: '555-0123',
        amount: action.conversionType === 'jobToInvoice' ? 1250.75 : undefined
      };

      setConversionModal({
        isOpen: true,
        type: action.conversionType,
        sourceData
      });
    } else {
      onAction?.(action.key, entityId);
    }
  };

  const handleConversionConfirm = async (data: any) => {
    try {
      console.log('Conversion data:', data);
      // Here you would call the actual conversion API
      // await conversionService.convert(data);
      
      setConversionModal({ isOpen: false, type: null, sourceData: null });
      
      // Notify parent component of successful conversion
      onAction?.(data.conversionType, entityId);
    } catch (error) {
      console.error('Conversion failed:', error);
    }
  };

  const actions = getActions();


  return (
    <>
      <div className={`flex ${isCompact ? 'flex-col gap-1' : 'flex-wrap gap-2'}`}>
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => handleActionClick(action)}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium
              transition-all duration-200 hover:shadow-sm
              ${getVariantClasses(action.variant)}
              ${isCompact ? 'justify-start' : 'justify-center'}
            `}
            title={action.description}
          >
            {action.icon}
            <span className={isCompact ? 'truncate' : ''}>{action.label}</span>
          </button>
        ))}
      </div>

      <ConversionModal
        isOpen={conversionModal.isOpen}
        onClose={() => setConversionModal({ isOpen: false, type: null, sourceData: null })}
        onConfirm={handleConversionConfirm}
        conversionType={conversionModal.type!}
        sourceData={conversionModal.sourceData}
      />
    </>
  );
};

export default FlowActions; 