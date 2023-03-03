/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */

define(["./format"], function(format) {
    return {
        fieldChanged: function(context) {
            if (context.fieldId == "custpage_partialpickedqty" && context.sublistId == "custpage_items") {
                debugger;
                var pickqty = context.currentRecord.getCurrentSublistValue({
                    sublistId: context.sublistId,
                    fieldId: context.fieldId,
                });
              
                var quantity = context.currentRecord.getSublistValue({
                    sublistId: context.sublistId,
                    fieldId: "custpage_quantity",
                    line: context.line,
                });
                var committed = context.currentRecord.getSublistValue({
                    sublistId: context.sublistId,
                    fieldId: "custpage_quantitycommitted",
                    line: context.line,
                }) || quantity;

                if (format.toFloat(pickqty) > format.toFloat(committed)) {
                    context.currentRecord.setCurrentSublistValue({
                        sublistId: context.sublistId,
                        fieldId: context.fieldId,
                        value: format.toFloat(committed),
                        ignoreFieldChange: true,
                    });
                }
            }
        },
    };
});