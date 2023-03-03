/**
 * 
 * WST - Set Created Date on Journal
 * 
 * 
 *    Date               Name              Version             Comments
 * 19/06/2022          BMACALINO             1.0           Initial Version

/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/runtime'], function (record, runtime) {

    function afterSubmit(context) {

        try {

            log.debug({
                title: 'context.type',
                details: context.type
            })
            var objNewRecord = context.newRecord;
            var intRecordId = objNewRecord.id;
            var dtDateCreated = objNewRecord.getValue({ fieldId: 'custbody_esc_created_date' });;
            var blRevRec = objNewRecord.getValue({ fieldId: 'isfromrevrec' });;

            log.debug({
                title: 'dtDateCreated + blRevRec',
                details: dtDateCreated + ' + ' + blRevRec
            })

            if (blRevRec) {
                record.submitFields({
                    type: 'journalentry',
                    id: intRecordId,
                    values: {
                        'trandate': dtDateCreated
                    }
                });
            }

        } catch (ex) {
            log.error('ERROR', 'An unexpected error occured. Please contact your NetSuite Administrator. For more details see: '
                + ex);
            throw 'An unexpected error occured. Please contact your NetSuite Administrator. For more details see: ' + ex;
        }

    }

    return {
        afterSubmit: afterSubmit
    }
});
