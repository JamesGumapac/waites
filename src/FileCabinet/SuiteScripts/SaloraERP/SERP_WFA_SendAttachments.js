/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/search', 'N/email', 'N/runtime', 'N/render', 'N/file'],
    /**
   * @param{record} record
   */
    (record, search, email, runtime, render, file) => {
        /**
         * Defines the WorkflowAction script trigger point.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.workflowId - Internal ID of workflow which triggered this action
         * @param {string} scriptContext.type - Event type
         * @param {Form} scriptContext.form - Current form that the script uses to interact with the record
         * @since 2016.1
         */
        const onAction = (scriptContext) => {

            try {

                log.debug("Workflow", "Triggered");
                let recordObj = scriptContext.newRecord;

                log.debug("Record Type", recordObj.type);
                log.debug("Record Id", recordObj.id);

                let scriptObj = runtime.getCurrentScript();

                let transactionId = recordObj.id

                let templateId = scriptObj.getParameter({
                    name: "custscript_serp_email_template"
                }) || "";

                let senderId = scriptObj.getParameter({
                    name: "custscript_serp_email_sender"
                }) || "";

                let recipientId = scriptObj.getParameter({
                    name: "custscript_serp_email_recipient"
                }) || "";

                if (transactionId == "" || templateId == "" || senderId == "" || recipientId == "") {
                    log.error("Error:", "Invalid Script Parameters");
                    return false;
                }

                log.debug("transactionId", transactionId);
                log.debug("templateId", templateId);
                log.debug("recipientId", recipientId);
                log.debug("senderId", senderId);

                let mailTemplate = render.mergeEmail({
                    templateId: templateId,
                    entity: null,
                    recipient: null,
                    supportCaseId: null,
                    transactionId: transactionId,
                    customRecord: null
                });

                log.debug("Email Subject", mailTemplate.subject);
                log.debug("Email Body", mailTemplate.body);

                let blResult = SendEmail(transactionId, mailTemplate, senderId, recipientId);

                if (blResult) {
                    return 'T'
                }
                else {
                    return 'F'
                }

            } catch (e) {
                log.error("Error: From Send Mails", e);
                return false;
            }
        }

        const SendEmail = (transactionId, mailTemplate, senderId, recipientId) => {

            try {
                let arrAttachmentObjects = getRelatedFiles(transactionId);
                let intArrayLength = arrAttachmentObjects.length;
                let arrAttachmentList = [];
                let flTotalFileSize = 0;

                log.debug("objAttachmentDetails", arrAttachmentObjects);
                log.debug("intArrayLength", intArrayLength);

                if (intArrayLength > 0) {
                    for (let i = 0; i < intArrayLength; i++) {

                        let objFile = file.load({
                            id: arrAttachmentObjects[i].intAttachmentId
                        });

                        flTotalFileSize = flTotalFileSize + parseFloat(arrAttachmentObjects[i].flDocumentSize);
                        if (parseFloat(arrAttachmentObjects[i].flDocumentSize) < 10000) {
                            arrAttachmentList.push(objFile);
                        }
                        else {
                            log.error("Error Sending Email: " + recipientId, e);
                            throw 'Error sending attachment. Maximum allowable size has been reached.'

                        }
                        log.debug("arrAttachmentList", arrAttachmentList);
                        log.debug("flTotalFileSize", flTotalFileSize);
                    }
                }

                if (flTotalFileSize < 25000) {
                    let transactionFile = render.transaction({
                        entityId: transactionId,
                        printMode: render.PrintMode.PDF
                    });

                    log.debug({
                        title: 'transactionFile',
                        details: transactionFile
                    })

                    arrAttachmentList.push(transactionFile);

                    try {
                        email.send({
                            author: senderId,
                            body: mailTemplate.body,
                            recipients: recipientId,
                            attachments: arrAttachmentList,
                            subject: mailTemplate.subject,
                            relatedRecords: {
                                entityId: recipientId,
                                transactionId: transactionId
                            }
                        });

                        return true

                    } catch (e) {
                        log.error("Error Sending Email: " + recipientId, e);
                        return false
                    }
                }


            } catch (e) {
                log.error("Error: From Send Mails", e);
                return false;
            }
        }


        const getRelatedFiles = (transactionId) => {

            let arrAttachmentObjects = [];
            let expenseSearchObj = search.create({
                type: "expensereport",
                filters:
                    [
                        ["type", "anyof", "ExpRept"],
                        "AND",
                        ["internalid", "anyof", transactionId],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            join: "file",
                            sort: search.Sort.ASC,
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "name",
                            join: "file",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "documentsize",
                            join: "file",
                            label: "Size (KB)"
                        })
                    ]
            });
            let searchResultCount = expenseSearchObj.runPaged().count;
            log.debug("ExpenseAttachments result count", searchResultCount);
            expenseSearchObj.run().each(function (result) {

                let intAttachmentId = result.getValue({
                    name: 'internalid',
                    join: 'file'
                });
                let flDocumentSize = result.getValue({
                    name: 'documentsize',
                    join: 'file'
                });

                log.debug({
                    title: 'intAttachmentId + flDocumentSize',
                    details: intAttachmentId + ' + ' + flDocumentSize
                })

                if (intAttachmentId) {

                    let objAttachmentDetails = {};
                    objAttachmentDetails.intAttachmentId = intAttachmentId;
                    objAttachmentDetails.flDocumentSize = flDocumentSize;

                    arrAttachmentObjects.push(objAttachmentDetails);
                }

                return true;
            });

            return arrAttachmentObjects;
        }

        return { onAction };
    });
