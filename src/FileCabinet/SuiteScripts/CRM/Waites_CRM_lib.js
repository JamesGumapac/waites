/** 
* @NApiVersion 2.x
* @NScriptName 
* @NModuleScope Public
*/
define(["N/record", "N/search"],
    function (record,
        search) {

        function GetPrimaryContactsByNot(companyId, contactId) {
            //ok so this is a double check.. if we edit
            //a contact and set it as primary just double check no other are
            var recs = [];
            var contactSearchObj = search.create({
                type: "contact",
                filters:
                    [
                        ["company", "anyof", companyId],
                        "AND",
                        ["internalid", "noneof", contactId],
                        "AND",
                        ["custentity_primary_contact", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            sort: search.Sort.ASC
                        }),
                        "custentity_primary_contact",
                        "contactrole"
                    ]
            });
            var searchResultCount = contactSearchObj.runPaged().count;
            log.debug("contactSearchObj result count", searchResultCount);
            contactSearchObj.run().each(function (result) {
                recs.push(result.id);
                return true;
            });
            return recs;
        }

        function CleanNonPrimaryContacts(company, currentPrimary) {
            log.debug('CleanNonPrimaryContacts', currentPrimary + ' ' + company);
            var recs = GetPrimaryContactsByNot(company, currentPrimary);
            log.debug('recs', recs);
            for (var i = 0; recs !== null &&
                i <= recs.length; i++) {
                if (recs[i] > 0) {
                    var contactRec = record.load({
                        type: 'contact',
                        id: recs[i],
                        isDynamic: false
                    });
                    if (contactRec) {
                        contactRec.setValue({
                            fieldId: 'custentity_primary_contact',
                            value: false
                        });
                        //contactRec.setValue({
                        //    fieldId: 'contactrole',
                        //    value: null
                        //});
                        try {
                            contactRec.save();
                        } catch (e) {
                            log.error("Error", e.toString());
                        }
                    }
                }
            }
        }

        function post() {

        }

        return {
            GetPrimaryContactsByNot: GetPrimaryContactsByNot,
            CleanNonPrimaryContacts: CleanNonPrimaryContacts,
            post: post
        };
    });