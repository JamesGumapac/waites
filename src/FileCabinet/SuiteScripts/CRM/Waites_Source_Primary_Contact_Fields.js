/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', "./Waites_CRM_lib.js"],
    function (record, search, lib) {
        function afterSubmit(context) {
            //log.debug('context.type', context.type);
            if (context.type !== context.UserEventType.DELETE) {
                var rec = context.newRecord;
                var recType = rec.type;
                var company = rec.getValue('company');
                log.debug('company', company);
                log.debug('rec.id', rec.id);
                var role = rec.getValue('contactrole');
                log.debug('primaryContact', role);
                var primaryContactRole = -Math.abs(10);
                if (company) {
                    var customerRec = record.load({
                        type: 'lead',
                        id: company,
                        isDynamic: false
                    });
                    log.debug('customerRec', customerRec);
                    if (!customerRec) {
                        customerRec = record.load({
                            type: 'customer',
                            id: company,
                            isDynamic: false
                        });
                    }
                    log.debug('customerRec', customerRec);
                    if (customerRec) {
                        try {
                            var currentPrimary = customerRec.getValue('custentity_primary_contact_id');
                            log.debug('currentPrimary', currentPrimary);
                            //Primary checked and the contact saved on the customer is different
                            if (role == -10) {

                                //log.debug('', isNaN(currentPrimary));
                                //if (currentPrimary != '' && currentPrimary != null) {
                                //    //update existing primary contact
                                //    var primaryContactRec = record.load({
                                //        type: 'contact',
                                //        id: currentPrimary,
                                //        isDynamic: false
                                //    });
                                //    if (primaryContactRec) {
                                //        primaryContactRec.setValue({
                                //            fieldId: 'custentity_primary_contact',
                                //            value: false
                                //        });
                                //        primaryContactRec.setValue({
                                //            fieldId: 'contactrole',
                                //            value: null
                                //        });
                                //        primaryContactRec.save();
                                //    }
                                //} else {
                                //    log.debug('No primary on customer found');
                                //    lib.CleanNonPrimaryContacts(company, rec.id);
                                //}
                                log.debug('Update customer record');
                                //rec.setValue({
                                //    fieldId: 'contactrole',
                                //    value: primaryContactRole
                                //});
                                log.debug('rec.id', rec.id);
                                //customerRec.setValue({
                                //    fieldId: 'custentity_primary_contact_id',
                                //    value: rec.id
                                //});
                                log.debug('fname', rec.getValue('firstname'));
                                customerRec.setValue({
                                    fieldId: 'custentity_primary_contact_first_name',
                                    value: rec.getValue('firstname')
                                });
                                log.debug('middlename', rec.getValue('middlename'));
                                customerRec.setValue({
                                    fieldId: 'custentity_primary_contact_middle_name',
                                    value: rec.getValue('middlename')
                                });
                                log.debug('lastname', rec.getValue('lastname'));
                                customerRec.setValue({
                                    fieldId: 'custentity_primary_contact_last_name',
                                    value: rec.getValue('lastname')
                                });
                                log.debug('email', rec.getValue('email'));
                                customerRec.setValue({
                                    fieldId: 'custentity_primary_contact_email',
                                    value: rec.getValue('email')
                                });
                                log.debug('phone', rec.getValue('phone'));
                                customerRec.setValue({
                                    fieldId: 'custentity_primary_contact_phone',
                                    value: rec.getValue('phone')
                                });
                                customerRec.save({
                                    ignoreMandatoryFields: true
                                });
                                //rec.save();
                            }

                            //log.debug('rec.id', rec.id);
                            //log.debug('currentPrimary', currentPrimary);
                            //if (primaryContact == false && rec.id == currentPrimary) {
                            //    //rec.setValue({
                            //    //    fieldId: 'contactrole',
                            //    //    value: null
                            //    //});
                            //    log.debug('Remove from customer');
                            //    customerRec.setValue({
                            //        fieldId: 'custentity_primary_contact_id',
                            //        value: null
                            //    });
                            //    customerRec.setValue({
                            //        fieldId: 'custentity_primary_contact_first_name',
                            //        value: ''
                            //    });
                            //    customerRec.setValue({
                            //        fieldId: 'custentity_primary_contact_middle_name',
                            //        value: ''
                            //    });
                            //    customerRec.setValue({
                            //        fieldId: 'custentity_primary_contact_last_name',
                            //        value: ''
                            //    });
                            //    customerRec.setValue({
                            //        fieldId: 'custentity_primary_contact_email',
                            //        value: ''
                            //    });
                            //    customerRec.setValue({
                            //        fieldId: 'custentity_primary_contact_phone',
                            //        value: ''
                            //    });
                            //    customerRec.save({
                            //        ignoreMandatoryFields: true
                            //    });
                            //}


                        } catch (e) {
                            log.error("Error", e.toString());
                        }
                    } else {
                        log.debug('Not Found');
                    }

                }
            }
        }

        return {
            afterSubmit: afterSubmit
        };
    });