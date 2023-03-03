/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * @Owner
 */
define(["N/search", "N/record"],

    function (search, record) {


        function getInputData() {

            return search.create({
                type: "lead",
                filters:
                    [
                         ["msesubsidiary.namesel","anyof","1"]
                    ],
                columns:
                    [
                      "internalid"
                    ]
            });

        }

        function map(context) {

            try {
                //log.debug(context);
                //log.audit(context.key, context.value);
                //log.audit("values", values);
                log.audit('context.value', context.value);

                var cust = record.load({
                    type: 'customer',
                    isDynamic: true,
                    id: context.key
                });

                    cust.setValue({
                        fieldId: 'subsidiary',
                        value: 2
                    });


                    var result = cust.save();

                    log.debug('updated', result);
                
            } catch (e) {
                log.error("Error", e.toString());
            }
        }


        return {
            getInputData: getInputData,
            map: map,
        };

    });
