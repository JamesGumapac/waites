/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/error', 'N/ui/dialog', 'N/search'],
    function (error, dialog, search) {
        function saveRecord(context) {
            var currentRecord = context.currentRecord;
            var id = currentRecord.id;
            console.log('id', id);

            var hasPrimaryContact = false;
            if (id > 0) {
                hasPrimaryContact = DoesCustomerHavePrimaryContact(id);
            } else {
                var contactCount = currentRecord.getLineCount({
                    sublistId: 'contact'
                });
                console.log('contactCount: ' + contactCount);

                for (var counter = 0;
                    counter < contactCount;
                    counter++) {
                    var contactname = currentRecord.getSublistValue({
                        sublistId: 'contact',
                        fieldId: 'entityid',
                        line: counter
                    });
                    var contactrole = currentRecord.getSublistValue({
                        sublistId: 'contact',
                        fieldId: 'contactrole',
                        line: counter
                    });
                    console.log('contactrole: ' + contactrole);

                    if (contactrole = -Math.abs(10)) {
                        hasPrimaryContact = true;
                    }
                }
            }

            if (hasPrimaryContact === false) {
                var options = {
                    title: 'I am a Confirmation',
                    message: 'Press OK or Cancel'
                };


                var answer = dialog.confirm(options).then(success).catch(failure);
                alert(answer);
               // return false;
            } else {
                return true;
            }
        }
        function success(result) {
            //console.log('Success with value ' + result);
            return true;
        }
        function failure(reason) {
            console.log('Failure: ' + reason);
            return false;
        }

        return {
            saveRecord: saveRecord
        };

        function DoesCustomerHavePrimaryContact(id) {
            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                        ["internalid", "anyof", id],
                        "AND",
                        ["contactprimary.internalid", "noneof", "@NONE@"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            join: "contact"
                        })
                    ]
            });
            var searchResultCount = customerSearchObj.runPaged().count;
            console.log("customerSearchObj result count", searchResultCount);

            if (searchResultCount > 0) {
                return true;
            }

            return false;
        }
    }); 