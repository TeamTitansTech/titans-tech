'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  User,
  Wrench,
  X,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  getServiceRequests,
  closeServiceRequest,
  reopenServiceRequest,
  type ServiceRequestResponse,
  type ServiceRequestStatus,
} from '@/data/services/service-requests.api';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import SimpleServiceCreationModal from '../../machines/[id]/components/SimpleServiceCreationModal';

export function ServiceRequestsList() {
  const t = useTranslations('serviceRequests');
  const [requests, setRequests] = useState<ServiceRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | ServiceRequestStatus>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestResponse | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await getServiceRequests({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
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
  }, [statusFilter]);

  const handleClose = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const handleReopen = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const handleCreateService = (request: ServiceRequestResponse, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedRequest(request);
    setCreateModalOpen(true);
  };

  const handleServiceCreated = () => {
    fetchRequests();
    toast.success(t('serviceCreatedSuccess'));
  };

  const handleViewDetails = (request: ServiceRequestResponse) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
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

  const openCount = requests.filter((r) => r.status === 'OPEN').length;

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as 'all' | ServiceRequestStatus)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  <SelectItem value="OPEN">{t('openOnly')}</SelectItem>
                  <SelectItem value="CLOSED">{t('closedOnly')}</SelectItem>
                </SelectContent>
              </Select>

              {openCount > 0 && (
                <Badge variant="destructive">
                  {openCount} {t('open')}
                </Badge>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('noRequests')}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('machine')}</TableHead>
                    <TableHead>{t('requester')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const isOpen = request.status === 'OPEN';
                    const isLoadingAction = actionLoading === request.id;

                    return (
                      <TableRow
                        key={request.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(request)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={isOpen ? 'destructive' : 'secondary'}>
                              {isOpen ? t('statusOpen') : t('statusClosed')}
                            </Badge>
                            {request.imageUrl && (
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Link
                              href={`/admin/machines/${request.machineId}`}
                              className="font-medium hover:underline text-primary"
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                              {request.machineName}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              {request.companyName} / {request.branchName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {request.requesterName}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <a
                                href={`mailto:${request.requesterEmail}`}
                                className="hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {request.requesterEmail}
                              </a>
                            </div>
                            {request.requesterPhone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <a
                                  href={`tel:${request.requesterPhone}`}
                                  className="hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {request.requesterPhone}
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(request.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(request);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t('viewDetails')}</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Link href={`/admin/machines/${request.machineId}`}>
                                    <ExternalLink className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t('viewMachine')}</TooltipContent>
                            </Tooltip>

                            {isOpen ? (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-primary"
                                      onClick={(e) => handleCreateService(request, e)}
                                      disabled={isLoadingAction}
                                    >
                                      {isLoadingAction ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Wrench className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t('createService')}</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => handleClose(request.id, e)}
                                      disabled={isLoadingAction}
                                    >
                                      {isLoadingAction ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <X className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t('close')}</TooltipContent>
                                </Tooltip>
                              </>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => handleReopen(request.id, e)}
                                    disabled={isLoadingAction}
                                  >
                                    {isLoadingAction ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t('reopen')}</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Creation Modal */}
      {selectedRequest && (
        <SimpleServiceCreationModal
          machineId={selectedRequest.machineId}
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          serviceRequestId={selectedRequest.id}
          onServiceCreated={handleServiceCreated}
        />
      )}

      {/* Service Request Detail Modal */}
      <ServiceRequestDetailModal
        request={selectedRequest}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onClose={(id) => handleClose(id)}
        onReopen={(id) => handleReopen(id)}
        onCreateService={(request) => {
          setDetailModalOpen(false);
          handleCreateService(request);
        }}
        isLoading={!!actionLoading}
        formatDate={formatDate}
        t={t}
      />
    </>
  );
}

interface ServiceRequestDetailModalProps {
  request: ServiceRequestResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: (id: string) => void;
  onReopen: (id: string) => void;
  onCreateService: (request: ServiceRequestResponse) => void;
  isLoading: boolean;
  formatDate: (date: string) => string;
  t: ReturnType<typeof useTranslations>;
}

function ServiceRequestDetailModal({
  request,
  open,
  onOpenChange,
  onClose,
  onReopen,
  onCreateService,
  isLoading,
  formatDate,
  t,
}: ServiceRequestDetailModalProps) {
  if (!request) return null;

  const isOpen = request.status === 'OPEN';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('requestDetails')}
            <Badge variant={isOpen ? 'destructive' : 'secondary'}>
              {isOpen ? t('statusOpen') : t('statusClosed')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Machine Info */}
          <div>
            <h4 className="text-sm font-medium mb-2">{t('machine')}</h4>
            <div className="bg-muted p-3 rounded-md">
              <Link
                href={`/admin/machines/${request.machineId}`}
                className="font-medium hover:underline text-primary"
              >
                {request.machineName}
              </Link>
              <div className="text-sm text-muted-foreground">
                {request.companyName} / {request.branchName}
              </div>
            </div>
          </div>

          {/* Requester Info */}
          <div>
            <h4 className="text-sm font-medium mb-2">{t('requester')}</h4>
            <div className="bg-muted p-3 rounded-md space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{request.requesterName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${request.requesterEmail}`}
                  className="text-primary hover:underline"
                >
                  {request.requesterEmail}
                </a>
              </div>
              {request.requesterPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${request.requesterPhone}`}
                    className="text-primary hover:underline"
                  >
                    {request.requesterPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Date */}
          <div>
            <h4 className="text-sm font-medium mb-2">{t('date')}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatDate(request.createdAt)}
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <h4 className="text-sm font-medium mb-2">{t('problemDescription')}</h4>
            <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
              {request.problemDescription}
            </p>
          </div>

          {/* Image */}
          {request.imageUrl && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {t('attachedPhoto')}
              </h4>
              <div className="relative w-full h-64 rounded-md border overflow-hidden bg-muted">
                <Image src={request.imageUrl} alt="Problem photo" fill className="object-contain" />
              </div>
            </div>
          )}

          {/* Device Info */}
          {(request.browser || request.os || request.deviceType) && (
            <div>
              <h4 className="text-sm font-medium mb-2">{t('deviceInfo')}</h4>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground bg-muted p-3 rounded-md">
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

          {/* Linked Services */}
          {request.services && request.services.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">{t('linkedServices')}</h4>
              <div className="space-y-1 bg-muted p-3 rounded-md">
                {request.services.map((service) => (
                  <div key={service.id} className="text-sm flex items-center gap-2">
                    <Wrench className="h-3 w-3 text-muted-foreground" />
                    {service.type} - {formatDate(service.date)} ({service.status})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            {isOpen ? (
              <>
                <Button onClick={() => onCreateService(request)} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wrench className="h-4 w-4 mr-2" />
                  )}
                  {t('createService')}
                </Button>
                <Button variant="outline" onClick={() => onClose(request.id)} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  {t('close')}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => onReopen(request.id)} disabled={isLoading}>
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
      </DialogContent>
    </Dialog>
  );
}
