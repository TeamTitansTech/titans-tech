// 'use client';

// import { useState, useEffect } from 'react';
// import { useTranslations } from 'next-intl';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Typography } from '@/components/ui/typography';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { toast } from 'sonner';
// import { createInspection } from '@/data/services/inspections.api';
// import {
//   MatingPartType,
//   type BearingClearanceData,
//   type CreateInspectionPayload,
// } from '@/data/types/inspections.types';

// interface InspectionCreationModalProps {
//   machineId: string;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// const OUTER_FIELDS = [
//   'totalClearance_RH',
//   'totalClearance_LH',
//   'mainBearings_RH',
//   'mainBearings_LH',
//   'upperConnectionBearings_RH',
//   'upperConnectionBearings_LH',
//   'wristPinToMatingPart_RH',
//   'wristPinToMatingPart_LH',
//   'wristPinToBushing_RH',
//   'wristPinToBushing_LH',
//   'slideAdjNutToScrewSleeve_RH',
//   'slideAdjNutToScrewSleeve_LH',
//   'extraDoubleLockOpen_RH',
//   'extraDoubleLockOpen_LH',
//   'ballBoxArea_RH',
//   'ballBoxArea_LH',
// ] as const;

// const defaultBearingData: BearingClearanceData = {
//   totalClearance_RH: 0,
//   totalClearance_LH: 0,
//   mainBearings_RH: 0,
//   mainBearings_LH: 0,
//   upperConnectionBearings_RH: 0,
//   upperConnectionBearings_LH: 0,
//   wristPinToMatingPart_RH: 0,
//   wristPinToMatingPart_LH: 0,
//   wristPinToBushing_RH: 0,
//   wristPinToBushing_LH: 0,
//   slideAdjNutToScrewSleeve_RH: 0,
//   slideAdjNutToScrewSleeve_LH: 0,
//   extraDoubleLockOpen_RH: 0,
//   extraDoubleLockOpen_LH: 0,
//   ballBoxArea_RH: 0,
//   ballBoxArea_LH: 0,
//   hasBeenAdjusted: 'NA' as const,
//   combinedWith: '',
//   matingPart: MatingPartType.BUSHING,
// };

// interface RenderBearingFieldsProps {
//   data: BearingClearanceData;
//   updateFn: (field: keyof BearingClearanceData, value: string | number) => void;
//   errors: Record<string, string>;
//   handleBlur: (field: keyof BearingClearanceData) => void;
// }

// function RenderBearingFields({ data, updateFn, errors, handleBlur }: RenderBearingFieldsProps) {
//   const t = useTranslations('inspections');

//   return (
//     <div className="space-y-6">
//       <div>
//         <Typography variant="h4" className="mb-3">
//           {t('form.bearingClearance.outer')}
//         </Typography>
//         <div className="grid grid-cols-2 gap-4">
//           {OUTER_FIELDS.map((field) => (
//             <div key={field}>
//               <Label htmlFor={field} className="text-xs">
//                 {t(`form.bearingClearance.fields.${field}`)}
//               </Label>
//               <Input
//                 id={field}
//                 type="number"
//                 step="0.0001"
//                 min="0"
//                 max="999999.9999"
//                 value={data[field as keyof BearingClearanceData] ?? ''}
//                 onChange={(e) => {
//                   const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
//                   updateFn(field as keyof BearingClearanceData, isNaN(value) ? 0 : value);
//                 }}
//                 onBlur={() => handleBlur(field as keyof BearingClearanceData)}
//                 className={`mt-1 ${errors[field] ? 'border-destructive' : ''}`}
//                 required
//               />
//               {errors[field] && (
//                 <Typography variant="small" className="text-xs text-destructive mt-1">
//                   {errors[field]}
//                 </Typography>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4 mt-6">
//         <div>
//           <Label htmlFor="combinedWith">{t('form.bearingClearance.combinedWith.label')}</Label>
//           <Input
//             id="combinedWith"
//             value={data.combinedWith}
//             onChange={(e) => updateFn('combinedWith', e.target.value)}
//             onBlur={() => handleBlur('combinedWith')}
//             placeholder={t('form.bearingClearance.combinedWith.placeholder')}
//             className={`mt-1 ${errors.combinedWith ? 'border-destructive' : ''}`}
//             required
//           />
//           {errors.combinedWith && (
//             <Typography variant="small" className="text-xs text-destructive mt-1">
//               {errors.combinedWith}
//             </Typography>
//           )}
//         </div>
//         <div>
//           <Label htmlFor="matingPart">{t('form.bearingClearance.matingPart.label')}</Label>
//           <Select
//             value={data.matingPart}
//             onValueChange={(value) => updateFn('matingPart', value as MatingPartType)}
//           >
//             <SelectTrigger className="mt-1">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value={MatingPartType.BUSHING}>
//                 {t('form.bearingClearance.matingPart.bushing')}
//               </SelectItem>
//               <SelectItem value={MatingPartType.CONNECTION}>
//                 {t('form.bearingClearance.matingPart.connection')}
//               </SelectItem>
//               <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
//                 {t('form.bearingClearance.matingPart.nut_screw_sleeve')}
//               </SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
//     </div>
//   );
// }

// export function InspectionCreationModal({
//   machineId,
//   open,
//   onOpenChange,
// }: InspectionCreationModalProps) {
//   const t = useTranslations('inspections');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [isMaintenance, setIsMaintenance] = useState(false);
//   const [performedBy, setPerformedBy] = useState('');
//   const [beforeData, setBeforeData] = useState<BearingClearanceData>(defaultBearingData);
//   const [afterData, setAfterData] = useState<BearingClearanceData>(defaultBearingData);

//   const [beforeErrors, setBeforeErrors] = useState<Record<string, string>>({});
//   const [afterErrors, setAfterErrors] = useState<Record<string, string>>({});
//   const [dateError, setDateError] = useState<string>('');

//   // Reset form when modal closes
//   useEffect(() => {
//     if (!open) {
//       // Reset all form fields
//       setDate(new Date().toISOString().split('T')[0]);
//       setIsMaintenance(false);
//       setPerformedBy('');
//       setBeforeData(defaultBearingData);
//       setAfterData(defaultBearingData);
//       setBeforeErrors({});
//       setAfterErrors({});
//       setDateError('');
//     }
//   }, [open]);

//   const updateBeforeField = (field: keyof BearingClearanceData, value: string | number) => {
//     setBeforeData((prev) => ({ ...prev, [field]: value }));
//     setBeforeErrors((prev) => ({ ...prev, [field]: '' }));
//   };

//   const updateAfterField = (field: keyof BearingClearanceData, value: string | number) => {
//     setAfterData((prev) => ({ ...prev, [field]: value }));
//     setAfterErrors((prev) => ({ ...prev, [field]: '' }));
//   };

//   const validateField = (field: keyof BearingClearanceData, value: string | number): string => {
//     const MAX_DECIMAL = 999999.9999;
//     const MIN_DECIMAL = 0;

//     if (field === 'combinedWith') {
//       if (!value || String(value).trim() === '') {
//         return t('form.error.required');
//       }
//       return '';
//     }

//     if (field === 'matingPart') {
//       if (!value) {
//         return t('form.error.required');
//       }
//       return '';
//     }

//     const numValue = Number(value);
//     if (isNaN(numValue)) {
//       return t('form.error.invalidNumber');
//     }
//     if (numValue < MIN_DECIMAL) {
//       return t('form.error.minValue', { min: MIN_DECIMAL });
//     }
//     if (numValue > MAX_DECIMAL) {
//       return t('form.error.maxValue', { max: MAX_DECIMAL });
//     }

//     return '';
//   };

//   const validateBearingData = (data: BearingClearanceData): string[] => {
//     const errors: string[] = [];
//     const MAX_DECIMAL = 999999.9999;
//     const MIN_DECIMAL = 0;

//     const numericFields = OUTER_FIELDS as unknown as (keyof BearingClearanceData)[];

//     numericFields.forEach((field) => {
//       const value = Number(data[field]);
//       if (isNaN(value)) {
//         errors.push(
//           t(`form.bearingClearance.fields.${field}`) + ': ' + t('form.error.invalidNumber'),
//         );
//       } else if (value < MIN_DECIMAL) {
//         errors.push(
//           t(`form.bearingClearance.fields.${field}`) +
//             ': ' +
//             t('form.error.minValue', { min: MIN_DECIMAL }),
//         );
//       } else if (value > MAX_DECIMAL) {
//         errors.push(
//           t(`form.bearingClearance.fields.${field}`) +
//             ': ' +
//             t('form.error.maxValue', { max: MAX_DECIMAL }),
//         );
//       }
//     });

//     if (!data.combinedWith || data.combinedWith.trim() === '') {
//       errors.push(t('form.bearingClearance.combinedWith.label') + ': ' + t('form.error.required'));
//     }

//     if (!data.matingPart) {
//       errors.push(t('form.bearingClearance.matingPart.label') + ': ' + t('form.error.required'));
//     }

//     return errors;
//   };

//   const handleBlurBefore = (field: keyof BearingClearanceData) => {
//     const error = validateField(field, beforeData[field] ?? '');
//     setBeforeErrors((prev) => ({ ...prev, [field]: error }));
//   };

//   const handleBlurAfter = (field: keyof BearingClearanceData) => {
//     const error = validateField(field, afterData[field] ?? '');
//     setAfterErrors((prev) => ({ ...prev, [field]: error }));
//   };

//   const handleDateBlur = () => {
//     const selectedDate = new Date(date);
//     const today = new Date();
//     today.setHours(23, 59, 59, 999);

//     if (selectedDate > today) {
//       setDateError(t('form.error.futureDate'));
//     } else {
//       setDateError('');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const selectedDate = new Date(date);
//       const today = new Date();
//       today.setHours(23, 59, 59, 999);

//       if (selectedDate > today) {
//         toast.error(t('form.error.futureDate'));
//         setIsSubmitting(false);
//         return;
//       }

//       const validationErrors: string[] = [];

//       if (isMaintenance) {
//         const beforeErrors = validateBearingData(beforeData);
//         if (beforeErrors.length > 0) {
//           validationErrors.push(
//             ...beforeErrors.map((err) => `[${t('form.bearingClearance.before')}] ${err}`),
//           );
//         }
//       }

//       const afterErrors = validateBearingData(afterData);
//       if (afterErrors.length > 0) {
//         validationErrors.push(
//           ...afterErrors.map((err) => `[${t('form.bearingClearance.after')}] ${err}`),
//         );
//       }

//       if (validationErrors.length > 0) {
//         toast.error(validationErrors.join('\n'));
//         setIsSubmitting(false);
//         return;
//       }

//       const payload: CreateInspectionPayload = {
//         machineId,
//         date: new Date(date).toISOString(),
//         type: isMaintenance ? 'MAINTENANCE' : 'INSPECTION',
//         performedBy: performedBy || undefined,
//         bearingClearance: {
//           outerBefore: isMaintenance ? beforeData : undefined,
//           outerData: afterData,
//         },
//       };

//       const response = await createInspection(payload);

//       if (response.errors) {
//         toast.error(t('form.error.title') + ' ' + response.errors.join(', '));
//       } else {
//         toast.success(t('createdSuccessfully'));
//         onOpenChange(false);
//       }
//     } catch (error) {
//       console.error('Erro ao criar inspeção:', error);
//       toast.error(t('form.error.title') + ' ' + String(error));
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>{t('title')}</DialogTitle>
//           <DialogDescription>{t('description')}</DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="date">{t('form.date.label')}</Label>
//               <Input
//                 id="date"
//                 type="date"
//                 value={date}
//                 onChange={(e) => {
//                   setDate(e.target.value);
//                   setDateError('');
//                 }}
//                 onBlur={handleDateBlur}
//                 max={new Date().toISOString().split('T')[0]}
//                 required
//                 className={`mt-1 ${dateError ? 'border-destructive' : ''}`}
//               />
//               {dateError && (
//                 <Typography variant="small" className="text-xs text-destructive mt-1">
//                   {dateError}
//                 </Typography>
//               )}
//             </div>
//             <div>
//               <Label htmlFor="performedBy">{t('form.performedBy.label')}</Label>
//               <Input
//                 id="performedBy"
//                 value={performedBy}
//                 onChange={(e) => setPerformedBy(e.target.value)}
//                 placeholder={t('form.performedBy.placeholder')}
//                 className="mt-1"
//               />
//             </div>
//           </div>

//           <div className="flex items-center space-x-2">
//             <Checkbox
//               id="isMaintenance"
//               checked={isMaintenance}
//               onCheckedChange={(checked: boolean) => setIsMaintenance(checked)}
//             />
//             <Label htmlFor="isMaintenance" className="cursor-pointer">
//               {t('form.isMaintenance.label')}
//             </Label>
//           </div>

//           <div>
//             <Typography variant="h3" className="mb-4">
//               {t('form.bearingClearance.title')}
//             </Typography>

//             {isMaintenance ? (
//               <Tabs defaultValue="before" className="w-full">
//                 <TabsList>
//                   <TabsTrigger value="before">{t('form.bearingClearance.before')}</TabsTrigger>
//                   <TabsTrigger value="after">{t('form.bearingClearance.after')}</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="before" className="mt-4">
//                   <RenderBearingFields
//                     data={beforeData}
//                     updateFn={updateBeforeField}
//                     errors={beforeErrors}
//                     handleBlur={handleBlurBefore}
//                   />
//                 </TabsContent>

//                 <TabsContent value="after" className="mt-4">
//                   <RenderBearingFields
//                     data={afterData}
//                     updateFn={updateAfterField}
//                     errors={afterErrors}
//                     handleBlur={handleBlurAfter}
//                   />
//                 </TabsContent>
//               </Tabs>
//             ) : (
//               <div className="mt-4">
//                 <RenderBearingFields
//                   data={afterData}
//                   updateFn={updateAfterField}
//                   errors={afterErrors}
//                   handleBlur={handleBlurAfter}
//                 />
//               </div>
//             )}
//           </div>

//           <div className="flex justify-end gap-3 pt-4">
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               {t('form.cancel')}
//             </Button>
//             <Button type="submit" disabled={isSubmitting}>
//               {isSubmitting ? t('form.submit.loading') : t('form.submit.idle')}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
