'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  User,
  Monitor,
  Smartphone,
  Wrench,
  X,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  getServiceRequestsByMachine,
  closeServiceRequest,
  reopenServiceRequest,
  type ServiceRequestResponse,
} from '@/data/services/service-requests.api';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SimpleServiceCreationModal from './SimpleServiceCreationModal';

interface ServiceRequestsProps {
  machineId: string;
}

export function ServiceRequests({ machineId }: ServiceRequestsProps) {
  const t = useTranslations('serviceRequests');
  const [requests, setRequests] = useState<ServiceRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await getServiceRequestsByMachine(machineId);
      if (response.data) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch service requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [machineId]);

  const handleClose = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await closeServiceRequest(id);
      if (response.data) {
        setRequests((prev) => prev.map((r) => (r.id === id ? response.data! : r)));
        toast.success(t('closedSuccess'));
      } else if (response.errors) {
        toast.error(response.errors[0]);
      }
    } catch (error) {
      toast.error(t('actionFailed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopen = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await reopenServiceRequest(id);
      if (response.data) {
        setRequests((prev) => prev.map((r) => (r.id === id ? response.data! : r)));
        toast.success(t('reopenedSuccess'));
      } else if (response.errors) {
        toast.error(response.errors[0]);
      }
    } catch (error) {
      toast.error(t('actionFailed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateService = (id: string) => {
    setSelectedRequestId(id);
    setCreateModalOpen(true);
  };

  const handleServiceCreated = () => {
    // Refresh the requests list after a service is created
    fetchRequests();
    toast.success(t('serviceCreatedSuccess'));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openRequests = requests.filter((r) => r.status === 'OPEN');
  const closedRequests = requests.filter((r) => r.status === 'CLOSED');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('noRequests')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          {t('title')}
          {openRequests.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {openRequests.length} {t('open')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {openRequests.map((request) => (
          <ServiceRequestCard
            key={request.id}
            request={request}
            isExpanded={expandedId === request.id}
            onToggle={() => setExpandedId(expandedId === request.id ? null : request.id)}
            onClose={() => handleClose(request.id)}
            onReopen={() => handleReopen(request.id)}
            onCreateService={() => handleCreateService(request.id)}
            isLoading={actionLoading === request.id}
            formatDate={formatDate}
            t={t}
          />
        ))}

        {closedRequests.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="text-muted-foreground">
                  {t('closedRequests', { count: closedRequests.length })}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {closedRequests.map((request) => (
                <ServiceRequestCard
                  key={request.id}
                  request={request}
                  isExpanded={expandedId === request.id}
                  onToggle={() => setExpandedId(expandedId === request.id ? null : request.id)}
                  onClose={() => handleClose(request.id)}
                  onReopen={() => handleReopen(request.id)}
                  onCreateService={() => handleCreateService(request.id)}
                  isLoading={actionLoading === request.id}
                  formatDate={formatDate}
                  t={t}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>

      {/* Service Creation Modal */}
      <SimpleServiceCreationModal
        machineId={machineId}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        serviceRequestId={selectedRequestId || undefined}
        onServiceCreated={handleServiceCreated}
      />
    </Card>
  );
}

interface ServiceRequestCardProps {
  request: ServiceRequestResponse;
  isExpanded: boolean;
  onToggle: () => void;
  onClose: () => void;
  onReopen: () => void;
  onCreateService: () => void;
  isLoading: boolean;
  formatDate: (date: string) => string;
  t: ReturnType<typeof useTranslations>;
}

function ServiceRequestCard({
  request,
  isExpanded,
  onToggle,
  onClose,
  onReopen,
  onCreateService,
  isLoading,
  formatDate,
  t,
}: ServiceRequestCardProps) {
  const isOpen = request.status === 'OPEN';

  return (
    <div
      className={`border rounded-lg p-4 ${
        isOpen
          ? 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20'
          : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={isOpen ? 'destructive' : 'secondary'}>
              {isOpen ? t('statusOpen') : t('statusClosed')}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(request.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm mb-2">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4 text-muted-foreground" />
              {request.requesterName}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${request.requesterEmail}`} className="text-primary hover:underline">
                {request.requesterEmail}
              </a>
            </span>
            {request.requesterPhone && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${request.requesterPhone}`} className="text-primary hover:underline">
                  {request.requesterPhone}
                </a>
              </span>
            )}
          </div>

          <p className="text-sm text-foreground line-clamp-2">{request.problemDescription}</p>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isExpanded ? t('collapse') : t('expand')}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-current/10 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">{t('problemDescription')}</h4>
            <p className="text-sm whitespace-pre-wrap bg-background p-3 rounded-md border">
              {request.problemDescription}
            </p>
          </div>

          {request.imageUrl && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {t('attachedPhoto')}
              </h4>
              <div className="relative w-full max-w-md h-48 rounded-md border overflow-hidden bg-muted">
                <Image src={request.imageUrl} alt="Problem photo" fill className="object-contain" />
              </div>
            </div>
          )}

          {(request.browser || request.os || request.deviceType) && (
            <div>
              <h4 className="text-sm font-medium mb-2">{t('deviceInfo')}</h4>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {request.deviceType && (
                  <span className="flex items-center gap-1">
                    {request.isMobile ? (
                      <Smartphone className="h-3 w-3" />
                    ) : (
                      <Monitor className="h-3 w-3" />
                    )}
                    {request.deviceType}
                  </span>
                )}
                {request.browser && <span>Browser: {request.browser}</span>}
                {request.os && <span>OS: {request.os}</span>}
                {request.ipAddress && <span>IP: {request.ipAddress}</span>}
              </div>
            </div>
          )}

          {request.services.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">{t('linkedServices')}</h4>
              <div className="space-y-1">
                {request.services.map((service) => (
                  <div
                    key={service.id}
                    className="text-xs flex items-center gap-2 text-muted-foreground"
                  >
                    <Wrench className="h-3 w-3" />
                    {service.type} - {formatDate(service.date)} ({service.status})
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {isOpen ? (
              <>
                <Button variant="default" size="sm" onClick={onCreateService} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wrench className="h-4 w-4 mr-2" />
                  )}
                  {t('createService')}
                </Button>
                <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  {t('close')}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onReopen} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                {t('reopen')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
