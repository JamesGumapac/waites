    /*
    *  Date                 Name           Version          Description
    * 12/13/2021          BMACALINO          1.0           Initial Release
    * 12/26/2021          BMACALINO          1.1           Revised to no longer work on EDIT and add numbering sequence for child customers. Also, remove name from numbering sequence.
    * 
    */


    /**
     *@NApiVersion 2.1
    *@NScriptType UserEventScript
    */
    define(['N/record', 'N/search'], (record, search) => {

        function beforeLoad(context) {
            if (['create', 'copy', 'edit', 'xedit'].indexOf(context.type) == -1) return
            let { newRecord, form } = context

            if (newRecord.getValue('representingsubsidiary')) // If this field has value, dont proceed
                return false;

            if (['create', 'copy'].indexOf(context.type) > -1) {
                newRecord.setValue({ fieldId: 'custentity_wst_id_num', value: 'To Be Generated' })
            }
            try { // Hide the autoname checkbox on create
                // newRecord.setValue({ fieldId: 'autoname', value: false })
                form.getField({ id: 'autoname' }).updateDisplayType({ displayType: 'hidden' }) // Dont let the user untick the autoname checkbox. just let the script generate the entityid
            } catch (e) {
                // log.debug('Hiding autoname field error', e.message)
            }
            // if (['edit','xedit'].indexOf(context.type) > -1) {
            //     try { // Hide the entity field on edit
            //         form.getField({ id: 'custentity_wst_id_num' }).updateDisplayType({ displayType : 'hidden' })
            //     } catch(e) {
            //         // log.debug('Hiding entityid field error', e.message)
            //     }
            // }
        }

        // Generate new document number
        function beforeSubmit(context) {
            try {
                if (context.type == 'delete') return
                log.debug('######## [START beforeSubmit] ########', context.type)
                let { oldRecord, newRecord } = context

                // if (newRecord.getValue('representingsubsidiary')) // If this field has value, dont proceed
                //     return false;

                let hasParent = newRecord.getValue({ fieldId: 'parent' });
                log.debug({
                    title: 'hasParent',
                    details: hasParent
                })
                let custRec = getCustomRecordObj(newRecord.type)

                if (custRec.id) { // If has customrecord setup for this record type, proceed else return
                    if (context.type == 'create' || context.type == 'copy') {
                        let newEntityIdNum = generateNewDocNum(custRec, hasParent)
                        if (newEntityIdNum) {
                            let newEntityId = ''
                            let newEmployeeId = ''
                            if (record.Type.EMPLOYEE == newRecord.type) {
                                let firstName = newRecord.getValue({ fieldId: 'firstname' })
                                let lastName = newRecord.getValue({ fieldId: 'lastname' })
                                newEntityId = `${newEntityIdNum}` // Ex. Firstname Lastname EMP101
                                newEmployeeId = `${lastName}, ${firstName} ${newEntityIdNum}`
                                newRecord.setValue({ fieldId: 'entityid', value: newEmployeeId })
                            } else {
                                let isPerson = newRecord.getValue({ fieldId: 'isperson' }) // Radio button returns T/F
                                if (isPerson == 'F') { // Company
                                    // let companyName = newRecord.getValue({ fieldId: 'companyname' })
                                    newEntityId = `${newEntityIdNum}` // Ex. Company ABC CUS101
                                } else { // Individual
                                    // let firstName = newRecord.getValue({ fieldId: 'firstname' })
                                    // let lastName = newRecord.getValue({ fieldId: 'lastname' })
                                    newEntityId = `${newEntityIdNum}` // Ex. Firstname Lastname EMP101
                                }
                            }
                            newRecord.setValue({ fieldId: 'custentity_wst_id_num', value: newEntityId })
                        }
                    }
                    // else if (['edit', 'xedit'].indexOf(context.type) > -1) {
                    //     let oldEntityId = oldRecord.getValue({ fieldId: 'entityid' })
                    //     let entityId = newRecord.getValue({  fieldId: 'entityid' })
                    //     log.debug(`Edited: ${oldEntityId != entityId}`, { oldEntityId, entityId })  

                    //     if (oldEntityId != entityId) { // If the entity has changed due to firstname/lastname/companyname update, proceed else return
                    //         let newEntityId = ''
                    //         if (record.Type.EMPLOYEE == newRecord.type) {
                    //             let firstName = newRecord.getValue({ fieldId: 'firstname' })
                    //             let lastName = newRecord.getValue({ fieldId: 'lastname' })
                    //             newEntityId = `${firstName} ${lastName} ${custRec.currentNumber}`
                    //         } else {
                    //             let isPerson = newRecord.getValue({ fieldId: 'isperson' }) // Radio button returns T/F
                    //             if (isPerson == 'F') { // Company
                    //                 let companyName = newRecord.getValue({ fieldId: 'companyname' })
                    //                 newEntityId = `${companyName} ${custRec.currentNumber}`
                    //             }  else { // Individual
                    //                 let firstName = newRecord.getValue({ fieldId: 'firstname' })
                    //                 let lastName = newRecord.getValue({ fieldId: 'lastname' })
                    //                 newEntityId = `${firstName} ${lastName} ${custRec.currentNumber}`
                    //             }
                    //         }
                    //         newRecord.setValue({ fieldId: 'custentity_wst_id_num', value: newEntityId })
                    //     }
                    // }
                }
            } catch (e) {
                log.debug('beforeSubmitError', e.message)
            }
            log.debug('######## [END beforeSubmit] ########')
        }

        // Update custom record's initial and current numbering
        function afterSubmit(context) {
            try {
                if (context.type == 'delete') return
                log.debug('######## [START afterSubmit] ########', context.type)
                let { oldRecord, newRecord } = context

                // if (newRecord.getValue('representingsubsidiary')) // If this field has value, dont proceed
                //     return false;

                let custRec = getCustomRecordObj(newRecord.type)
                let oldEntityId = oldRecord ? oldRecord.getValue({ fieldId: 'custentity_wst_id_num' }) : ''
                let newEntityId = newRecord.getValue({ fieldId: 'custentity_wst_id_num' }) // Updated entityid by the beforesubmit function

                if (custRec.id) { // If has customrecord setup for this record type, proceed else return
                    if (context.type == 'create' || context.type == 'copy') {
                        if (newEntityId.indexOf(custRec.prefix) > -1) { // If entityid field has prefix updated by the beforeSubmit function, proceed
                            let newEntityNum = custRec.initialNumber + 1
                            let newEntityIdNum = generateNewDocNum(custRec, '')

                            record.submitFields({
                                type: 'customrecord_document_numbering',
                                id: custRec.id,
                                values: {
                                    custrecord_docnum_number: newEntityNum, // Ex. 001
                                    custrecord_docnum_current_number: `${newEntityIdNum}` // Ex. EMP001
                                }
                            })
                        }
                    }
                    else if (['edit', 'xedit'].indexOf(context.type) > -1) {
                        // Do nothing
                    }
                }
            } catch (e) {
                log.debug('afterSubmitError', e.message)
            }
            log.debug('######## [END afterSubmit] ########')
        }

        ///////////////// OTHER FUNCTIONS /////////////////

        const generateNewDocNum = (obj, hasParent) => {
            let tranID = '';
            let count = 0;
            let parentId = '';

            if (hasParent) {

                let customerSearchObj = search.create({
                    type: "customer",
                    filters: [
                        ["parentcustomer.internalid", "anyof", hasParent],
                        "OR",
                        ["internalid", "anyof", hasParent]
                    ],
                    columns:
                        [
                            search.createColumn({
                                name: "entityid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({ name: "custentity_wst_id_num", label: "WST ID #" })
                        ]
                });
                customerSearchObj.run().each(each => {
                    log.debug('custentity_wst_id_num', each.getValue({ name: 'custentity_wst_id_num' }))

                    count = count + 1;
                    if (count == 1) {
                        parentId = each.getValue({ name: 'custentity_wst_id_num' });
                    }

                    log.debug('child count', count);
                    log.debug('parentId', parentId);
                    return true;
                });

                log.debug('child count', count);
                log.debug('obj.subEntDigits', obj.subEntDigits);
                
                
                count = count.toString();
                log.debug('count.length', count.length);
                tranID += parentId + '-';
                tranID += obj.subEntDigits > count.length ? '0'.repeat(obj.subEntDigits - count.length) : '';
                tranID += count;
            }
            else {
                obj.initialNumber++;
                obj.initialNumber = obj.initialNumber.toString();
                tranID += obj.prefix;
                tranID += obj.digits > obj.initialNumber.length ? '0'.repeat(obj.digits - (obj.initialNumber.length)) : '';
                tranID += obj.initialNumber;
            }

            log.debug('generateNewDocNum tranID', tranID);
            return tranID;
        }

        const getCustomRecordObj = type => {
            let obj = {
                id: '',
                prefix: '',
                digits: '',
                initialNumber: '',
                currentNumber: '',
                subEntDigits: ''
            };
            if (type == search.Type.PROSPECT || type == search.Type.LEAD)
                type = search.Type.CUSTOMER

            let s = search.create({
                type: 'customrecord_document_numbering',
                filters: [
                    ['isinactive', search.Operator.IS, 'F'],
                    'AND',
                    ['custrecord_docnum_rectype_id', search.Operator.IS, type]
                ],
                columns: [
                    'custrecord_docnum_prefix',
                    'custrecord_docnum_digits',
                    'custrecord_docnum_number',
                    'custrecord_docnum_current_number',
                    'custrecord_docnum_subent_digits'
                ]
            });
            s.run().each(each => {
                obj.id = each.id;
                obj.prefix = each.getValue({ name: 'custrecord_docnum_prefix' }) || '';
                obj.digits = parseFloat(each.getValue({ name: 'custrecord_docnum_digits' })) || 0;
                obj.initialNumber = parseFloat(each.getValue({ name: 'custrecord_docnum_number' })) || 0;
                obj.currentNumber = each.getValue({ name: 'custrecord_docnum_current_number' });
                obj.subEntDigits = parseFloat(each.getValue({ name: 'custrecord_docnum_subent_digits' }) || 0);
                return false;
            })
            log.debug('getCustomRecordObj obj', obj);
            return obj;
        }

        return {
            beforeLoad,
            beforeSubmit,
            afterSubmit
        };
    })
