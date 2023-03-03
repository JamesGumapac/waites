/**
 *@NApiVersion 2.0
 *@NScriptType Suitelet
 */
define(['N/record', 'N/runtime', 'N/ui/serverWidget', 'N/url'], function (record, runtime, serverWidget, url) {

    function onRequest(context) {
        try {

            params = context.request.parameters;

            log.debug({
                title: 'params',
                details: params
            })

            var objForm = serverWidget.createForm({
                title: 'Expense Report Approval',
                hideNavBar: true
            });

            if (context.request.method === 'GET') {

                //https://5337101-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=2483&deploy=1&compid=5337101_SB1&h=eef705badfc26b774320&recordid=197707&approvalstatus=approved&expensereport=ER461 

                var intRecordId = params.recordid;
                var stApprovalStatus = params.approvalstatus;
                var stExpenseReport = params.expensereport;

                var stUrl = url.resolveRecord({
                    recordType: 'expensereport',
                    recordId: intRecordId,
                    isEditMode: false
                });

                var objExpenseReportRecord = record.load({
                    type: record.Type.EXPENSE_REPORT,
                    id: intRecordId,
                    isDynamic: true
                });

                var intCurrentApprovalStatus = objExpenseReportRecord.getValue({
                    fieldId: 'approvalstatus'
                });

                if (intCurrentApprovalStatus == 1) {

                    if (stApprovalStatus == 'approved') {
                        record.submitFields({
                            type: record.Type.EXPENSE_REPORT,
                            id: intRecordId,
                            values: {
                                approvalstatus: 2,
                                custbody_serp_approved_email: true,
                                custbody_serp_rejected_email: false
                            }
                        });

                        objForm.addField({
                            id: 'custfield_serp_approval_message',
                            label: 'Your expense report: ' + stExpenseReport + ' has been approved.',
                            type: serverWidget.FieldType.TEXT
                        }).updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.INLINE
                        });

                        objForm.addButton({
                            id: 'custpage_serp_redirect_record',
                            label: 'Go to Record',
                            functionName: 'window.open(\'' + stUrl + '\',\'_blank\'' + ');' + 'return true;'
                        });
                    } else {

                        var stRejectionReason = objForm.addField({
                            id: 'custpage_rejectionreason',
                            type: serverWidget.FieldType.TEXTAREA,
                            label: 'Enter Rejection Reason'
                        });

                        var intRecordIdReject = objForm.addField({
                            id: 'custpage_rejectedtranid',
                            type: serverWidget.FieldType.TEXT,
                            label: 'Transaction Id'
                        });
                        var stExpenseReportId = objForm.addField({
                            id: 'custpage_expensereportid',
                            type: serverWidget.FieldType.TEXT,
                            label: 'Expense Report Id'
                        });

                        intRecordIdReject.defaultValue = intRecordId;
                        stExpenseReportId.defaultValue = stExpenseReport;
                        intRecordIdReject.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        stExpenseReportId.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        stRejectionReason.isMandatory = true;

                        objForm.addSubmitButton({
                            label: 'Reject Transaction'
                        });
                    }
                }

                else {

                    objForm.addField({
                        id: 'custfield_serp_approval_message',
                        label: 'Your expense report: ' + stExpenseReport + ' has been previously processed. Kindly proceed to view the record to validate.',
                        type: serverWidget.FieldType.TEXT
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    });

                    objForm.addButton({
                        id: 'custpage_serp_redirect_record',
                        label: 'Go to Record',
                        functionName: 'window.open(\'' + stUrl + '\',\'_blank\'' + ');' + 'return true;'
                    });

                }
            }
            else {

                log.debug({
                    title: 'params',
                    details: params
                })

                var intRecordId = params.custpage_rejectedtranid;
                var stRejectionReason = params.custpage_rejectionreason;
                var stExpenseReport = params.custpage_expensereportid;
                var stUrl = url.resolveRecord({
                    recordType: 'expensereport',
                    recordId: intRecordId,
                    isEditMode: false
                });

                record.submitFields({
                    type: record.Type.EXPENSE_REPORT,
                    id: intRecordId,
                    values: {
                        approvalstatus: 3,
                        custbody_serp_approved_email: false,
                        custbody_serp_rejected_email: true,
                        custbody_exp_report_rejection_reason: stRejectionReason
                    }
                });
                objForm.addField({
                    id: 'custfield_serp_approval_message',
                    label: 'Your expense report: ' + stExpenseReport + ' has been rejected.',
                    type: serverWidget.FieldType.TEXT
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                objForm.addButton({
                    id: 'custpage_serp_redirect_record',
                    label: 'Go to Record',
                    functionName: 'window.open(\'' + stUrl + '\',\'_blank\'' + ');' + 'return true;'
                });
            }

            context.response.writePage(objForm);

        } catch (ex) {
            log.error('ERROR: onRequest()', ex.message);
        }

    }

    return {
        onRequest: onRequest
    }
});
