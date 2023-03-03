/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/record', 'N/search'], function (
    record, search) {
	/**
     * Function to be executed after page is initialized.
     */
    function pageInit(context) {
        var customer = context.currentRecord;
        var internalId = customer.id;
        var currentPrimary = customer.getValue('custentity_customer_primary_contact');
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
                    "title",
                    "firstname",
                    "middlename",
                    "lastname",
                    "phone",
                    "email"
                ]
        });
        var searchResultCount = contactSearchObj.runPaged().count;
        log.debug("contactSearchObj result count", searchResultCount);
        contactSearchObj.run().each(function (result) {
          customer.setValue({
                fieldId: 'custentity_primary_contact_job_title',
                value: result.getValue('title')
            });
            customer.setValue({
                fieldId: 'custentity_primary_contact_first_name',
                value: result.getValue('firstname')
            });
            customer.setValue({
                fieldId: 'custentity_primary_contact_middle_name',
                value: result.getValue('middlename')
            });
            customer.setValue({
                fieldId: 'custentity_primary_contact_last_name',
                value: result.getValue('lastname')
            });
            log.debug('email', result.getValue('email'));
            customer.setValue({
                fieldId: 'custentity_primary_contact_email',
                value: result.getValue('email')
            });
            customer.setValue({
                fieldId: 'custentity_primary_contact_phone',
                value: result.getValue('phone')
            });
            customer.setValue({
                fieldId: 'custentity_primary_contact_id',
                value: result.id
            });
            return true;
        });

        if (searchResultCount == 0) {
            log.debug('No primary');
          customer.setValue({
                fieldId: 'custentity_primary_contact_job_title',
                value: ''
            });          
            customer.setValue({
                fieldId: 'custentity_primary_contact_first_name',
                value: ''
            });
            customer.setValue({
                fieldId: 'custentity_primary_contact_middle_name',
                value: ''
            });
            customer.setValue({
                fieldId: 'custentity_primary_contact_last_name',
                value: ''
            });
            customer.setValue({
                fieldId: 'custentity_primary_contact_phone',
                value: ''
            });
            customer.setValue({
                fieldId: 'custentity_primary_contact_email',
                value: ''
            });
            customer.setValue({
                fieldId: 'custentity_primary_contact_id',
                value: null
            });
        }

    }

    return {
        pageInit: pageInit
    };
});