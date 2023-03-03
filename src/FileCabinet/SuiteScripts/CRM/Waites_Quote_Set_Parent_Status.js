/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record'],
    function (record) {
        function afterSubmit(context) {
            if (context.type === context.UserEventType.CREATE) {
                var quoteRecord = context.newRecord;
                var createdFrom = quoteRecord.getValue({
                    fieldId: 'createdfrom'
                });
                log.debug('createdFrom', createdFrom);

                if (createdFrom) {
                    try {
                        record.submitFields({
                            type: "opportunity",
                            id: createdFrom,
                            values: {
                                'entitystatus': 9
                            }
                        });
                    } catch (e) {
                        log.error("Error", e.toString());
                    }
                }
            }
        }
        return {
            afterSubmit: afterSubmit
        };
    });