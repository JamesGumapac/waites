/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record'],
    function (record) {
        function afterSubmit(context) {
            if (context.type === context.UserEventType.CREATE) {
                var oppRecord = context.newRecord;
                var customerId = oppRecord.getValue({
                    fieldId: 'entity'
                });
                log.debug('customerId', customerId);

                if (customerId) {
                    var customerRec = record.load({
                        type: 'prospect',
                        id: customerId,
                        isDynamic: false
                    });
                    var status = customerRec.getValue({
                        fieldId: 'entitystatus'
                    });
                    log.debug('status', status);
                    if (customerRec && status != 13) {
                        log.debug('update status');
                        try {
                            customerRec.setValue({
                                fieldId: 'entitystatus',
                                value: 13
                            });
                            customerRec.save();
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