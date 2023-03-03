define(["./pick_form", "./format", "N/record", "N/log"], function(pick_form, format, record, log) {
    function toFloat(val) {
        return val ? parseFloat(val) : 0;
    }
    return {
        render: function() {
            return pick_form.render();
        },
        loadData: function(context) {
            log.debug("Context", context);
            let transaction = record.load({
                type: context.type,
                id: context.id,
            });

            let form = context.form;

            const bodyFields = {
                custpage_tranid: "id",
                custpage_trandate: "trandate",
              	custpage_trantype: "baserecordtype"
            };

            for (let field in bodyFields) {
                let bodyField = form.getField({
                    id: field,
                });

                log.debug(field, transaction.getValue(bodyFields[field]));
                if (bodyField) {
                    bodyField.defaultValue = transaction.getValue(bodyFields[field]);
                }
            }

            const sublistFields = {
                custpage_line: "line",
                custpage_item: "item",
                custpage_quantity: "quantity",
                custpage_quantitycommitted: "quantitycommitted",
                custpage_quantityfulfilled: "quantityfulfilled",
                custpage_quantityreceived: "quantityreceived",
                custpage_quantitybackordered: "backordered",
            };

            let sublist = form.getSublist({
                id: "custpage_items",
            });

            let index = 0;
            for (let i = 0; i < transaction.getLineCount("item"); i++) {
                for (let field in sublistFields) {
                    let value = transaction.getSublistValue({
                        sublistId: "item",
                        fieldId: sublistFields[field],
                        line: i,
                    });
                    log.debug(field, value);
                    if (value) {
                        sublist.setSublistValue({
                            id: field,
                            line: index,
                            value: value,
                        });
                    }
                }
                let qty =
                    transaction.getSublistValue({
                        sublistId: "item",
                        fieldId: "quantity",
                        line: i,
                    }) || 0;
                let fulfilled =
                    transaction.getSublistValue({
                        sublistId: "item",
                        fieldId: "quantityfulfilled",
                        line: i,
                    }) || 0;
                let received =
                    transaction.getSublistValue({
                        sublistId: "item",
                        fieldId: "quantityreceived",
                        line: i,
                    }) || fulfilled;
                let remaining = format.toFloat(qty) - format.toFloat(received);
                sublist.setSublistValue({
                    id: "custpage_remainingquantity",
                    line: index,
                    value: remaining || 0,
                });
                index++;
            }

            log.debug("Done");
        },
    };
});