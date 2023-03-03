/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/record'], function (
    record) {
    function pageInit(context) {
        var currentRecord = context.currentRecord;
        var id = currentRecord.id;
        console.log('id', id);

        currentRecord.setValue({
            fieldId: 'isperson',
            value: 'F'
        });
        currentRecord.setValue({
            fieldId: 'subsidiary',
            value: 2
        });

    }

    return {
        pageInit: pageInit
    };
});