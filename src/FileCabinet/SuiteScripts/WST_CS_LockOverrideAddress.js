/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @NAuthor Brendel Macalino
 */
define(['N/currentRecord'], function (currentRecord) {
    function pageInit(context) {
        var field = context.currentRecord.getField({
            fieldId: 'override'
        });
        field.isDisabled = true;
    }

    return {
        pageInit: pageInit
    };
});