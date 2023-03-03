/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', "./Waites_CRM_lib.js"],
    function (record, search, lib) {
        function beforeLoad(context) {
            log.debug('beforeLoad', context.type);
            var customer = context.newRecord;
            var internalId = customer.id;
            //var currentPrimary = customer.getValue('custentity_customer_primary_contact');
            log.debug('ID', internalId);
            if (context.type === context.UserEventType.VIEW) {
                var contactSearchObj = search.create({
                    type: "contact",
                    filters:
                        [
                            ["company", "anyof", internalId],
                            "AND",
                            ["role", "anyof", "-10"]
                        ],
                    columns:
                        [
                            "firstname",
                            "middlename",
                            "lastname",
                            "phone",
                            "email"
                        ]
                });
                var currentPrimary;
                var rec = {};
                var searchResultCount = contactSearchObj.runPaged().count;
                log.debug("contactSearchObj result count", searchResultCount);
                contactSearchObj.run().each(function (result) {
                    currentPrimary = result.id;
                    rec.FirstName = result.getValue('firstname');
                    rec.MiddleName = result.getValue('middlename');
                    rec.LastName = result.getValue('lastname');
                    return true;
                });
                log.debug('currentPrimary', currentPrimary);
                var customerRec = record.load({
                    type: 'customer',
                    id: internalId,
                    isDynamic: false
                });
                log.debug('rec.FirstName', rec.FirstName);
                customerRec.setValue({
                    fieldId: 'custentity_primary_contact_first_name',
                    value: rec.FirstName
                });
                customerRec.setValue({
                    fieldId: 'custentity_primary_contact_middle_name',
                    value: rec.MiddleName
                });
                customerRec.setValue({
                    fieldId: 'custentity_primary_contact_last_name',
                    value: rec.LastName
                });
                customerRec.save();

            }
        }

        function afterSubmit(context) {
            if (context.type !== context.UserEventType.DELETE) {
                var customer = context.newRecord;
                var internalId = customer.id;
                //var currentPrimary = customer.getValue('custentity_customer_primary_contact');
                log.debug('ID', internalId);
                log.debug('currentPrimary', currentPrimary);

                var contactSearchObj = search.create({
                    type: "contact",
                    filters:
                        [
                            ["company", "anyof", internalId],
                            "AND",
                            ["role", "anyof", "-10"]
                        ],
                    columns:
                        [
                            "firstname",
                            "middlename",
                            "lastname",
                            "phone",
                            "email"
                        ]
                });
                var currentPrimary;
                var searchResultCount = contactSearchObj.runPaged().count;
                log.debug("contactSearchObj result count", searchResultCount);
                contactSearchObj.run().each(function (result) {
                    currentPrimary = result.id;
                    return true;
                });


                if (currentPrimary > 0) {
                    //Edit primary
                    EditPrimary(currentPrimary, customer);
                    lib.CleanNonPrimaryContacts(customer.id, currentPrimary);
                } else {
                    //add primary
                    var contactId = CreatePrimaryContact(customer);
                    var customerRec = record.load({
                        type: 'customer',
                        id: customer.id,
                        isDynamic: false
                    });
                    customerRec.setValue({
                        fieldId: 'custentity_customer_primary_contact',
                        value: contactId
                    });

                    try {
                        customerRec.save();
                    } catch (e) {
                        log.error("Error", e.toString());
                    }
                }
            }
        }

        function CreatePrimaryContact(customer) {
            log.debug('CreatePrimaryContact', customer.id);
            if (customer.getValue('custentity_primary_contact_first_name') !== "" && customer.getValue('custentity_primary_contact_last_name') !== "" &&
                customer.getValue('custentity_primary_contact_phone') !== "") {
                var objRecord = record.create({
                    type: record.Type.CONTACT,
                    isDynamic: true,
                    //defaultValues: {
                    //    company: customer.id
                    //}
                });
                objRecord.setValue({
                    fieldId: 'company',
                    value: customer.id
                });
                objRecord.setValue({
                    fieldId: 'title',
                    value: customer.getValue('custentity_primary_contact_job_title')
                });

                objRecord.setValue({
                    fieldId: 'firstname',
                    value: customer.getValue('custentity_primary_contact_first_name')
                });
                objRecord.setValue({
                    fieldId: 'middlename',
                    value: customer.getValue('custentity_primary_contact_middle_name')
                });
                objRecord.setValue({
                    fieldId: 'lastname',
                    value: customer.getValue('custentity_primary_contact_last_name')
                });
                objRecord.setValue({
                    fieldId: 'phone',
                    value: customer.getValue('custentity_primary_contact_phone')
                });
                objRecord.setValue({
                    fieldId: 'email',
                    value: customer.getValue('custentity_primary_contact_email')
                });
                objRecord.setValue({
                    fieldId: 'custentity_primary_contact',
                    value: true
                });
                objRecord.setValue({
                    fieldId: 'contactrole',
                    value: -10
                });

                var internalId;
                try {
                    internalId = objRecord.save();
                } catch (e) {
                    log.error("Error", e.toString());
                }
            }
            return internalId;
        }

        function EditPrimary(currentPrimary, customer) {
            log.debug('EditPrimary');
            var primaryContactRec = record.load({
                type: 'contact',
                id: currentPrimary,
                isDynamic: false
            });
            if (primaryContactRec) {
                primaryContactRec.setValue({
                    fieldId: 'title',
                    value: customer.getValue('custentity_primary_contact_job_title')
                });
                primaryContactRec.setValue({
                    fieldId: 'firstname',
                    value: customer.getValue('custentity_primary_contact_first_name')
                });
                primaryContactRec.setValue({
                    fieldId: 'middlename',
                    value: customer.getValue('custentity_primary_contact_middle_name')
                });
                primaryContactRec.setValue({
                    fieldId: 'lastname',
                    value: customer.getValue('custentity_primary_contact_last_name')
                });
                primaryContactRec.setValue({
                    fieldId: 'email',
                    value: customer.getValue('custentity_primary_contact_email')
                });
                primaryContactRec.setValue({
                    fieldId: 'phone',
                    value: customer.getValue('custentity_primary_contact_phone')
                });
                primaryContactRec.setValue({
                    fieldId: 'custentity_primary_contact',
                    value: true
                });
                primaryContactRec.setValue({
                    fieldId: 'contactrole',
                    value: -10
                });
                primaryContactRec.save();
            }
        }

        return {
            afterSubmit: afterSubmit,
            //  beforeLoad: beforeLoad
        };
    });