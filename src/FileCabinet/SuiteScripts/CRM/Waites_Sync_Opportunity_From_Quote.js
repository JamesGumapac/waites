/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search'],
    function (record, search) {


        function afterSubmit(context) {
            var quoteRecord = context.newRecord;
            var internalId = quoteRecord.id;
            var preferredQuote = quoteRecord.getValue('custbody_preferred_quote');
            var opportunityId = quoteRecord.getValue('opportunity');
            log.debug('ID', internalId);
            log.debug('preferredQuote', preferredQuote);
            if (parseInt(opportunityId) > 0) {
                var quoteCount = GetQuotesByOpp(opportunityId, internalId);
                log.debug('quoteCount', quoteCount);
                if ((opportunityId > 0 && preferredQuote === true) || quoteCount <= 1) {
                    log.debug('Attempt Sync');
                    var recs = GetPreferredQuotedByOpp(opportunityId, internalId);
                    for (var i = 0; recs != null && i < recs.length; i++) {
                        record.submitFields({
                            type: "estimate",
                            id: recs[i],
                            values: { "custbody_preferred_quote": false }
                        });
                    }
                    if (quoteCount <= 1) {
                        record.submitFields({
                            type: "estimate",
                            id: internalId,
                            values: { "custbody_preferred_quote": true }
                        });
                    }

                    log.debug('Attempt to Sync');
                    var opportunityRecord = record.load({ type: 'opportunity', id: opportunityId, isDynamic: false });
                    UpdateOpportunityHeader(opportunityRecord, quoteRecord);

                    UpdateOpportunityLines(opportunityRecord, quoteRecord);

                    try {
                        opportunityRecord.save();
                    } catch (e) {
                        log.error("Error", e.toString());
                    }
                }
            }
        }


        function GetQuotesByOpp(oppId, quoteId) {
            var recs = [];
            var estimateSearchObj = search.create({
                type: "estimate",
                filters:
                    [
                        ["type", "anyof", "Estimate"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["opportunity", "anyof", oppId]
                    ],
                columns:
                    [
                        "tranid"
                    ]
            });
            var searchResultCount = estimateSearchObj.runPaged().count;
            log.debug("estimateSearchObj result count", searchResultCount);
            //estimateSearchObj.run().each(function (result) {
            //    recs.push(result.id);
            //    return true;
            //});
            return searchResultCount;
        }

        function GetPreferredQuotedByOpp(oppId, quoteId) {
            var recs = [];
            var estimateSearchObj = search.create({
                type: "estimate",
                filters:
                    [
                        ["type", "anyof", "Estimate"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["opportunity", "anyof", oppId],
                        "AND",
                        ["custbody_preferred_quote", "is", "T"],
                        "AND",
                        ["internalid", "noneof", quoteId]
                    ],
                columns:
                    [
                        "tranid"
                    ]
            });
            var searchResultCount = estimateSearchObj.runPaged().count;
            log.debug("estimateSearchObj result count", searchResultCount);
            estimateSearchObj.run().each(function (result) {
                recs.push(result.id);
                return true;
            });
            return recs;
        }

        function UpdateOpportunityLines(opp, quote) {
            RemoveOpportunityLines(opp);

            var numLines = quote.getLineCount({
                sublistId: 'item'
            });
            log.debug('numLines', numLines);
            var sublist = "item";
            for (var i = 0; i < quote.getLineCount({ sublistId: sublist }); i++) {
                //log.debug('i', i);
                //Item
                var itemId = quote.getSublistValue({ sublistId: sublist, fieldId: 'item', line: i });
                opp.setSublistValue({ sublistId: sublist, line: i, fieldId: "item", value: itemId });

                //Item Description
                var itemDescription = quote.getSublistValue({ sublistId: sublist, fieldId: 'description', line: i });
                opp.setSublistValue({ sublistId: sublist, line: i, fieldId: "description", value: itemDescription });

                //Quantity
                var quantity = quote.getSublistValue({ sublistId: sublist, fieldId: 'quantity', line: i });
                opp.setSublistValue({ sublistId: sublist, line: i, fieldId: "quantity", value: quantity });
                //log.debug('quantity', quantity);

                //Price Level
                var priceLevel = quote.getSublistValue({ sublistId: sublist, fieldId: 'price', line: i });
                opp.setSublistValue({ sublistId: sublist, line: i, fieldId: "price", value: priceLevel });
                //log.debug('priceLevel', priceLevel);

                //Custom Price Level
                if (parseInt(priceLevel) < 0) {
                    //Rate
                    var rate = quote.getSublistValue({ sublistId: sublist, fieldId: 'rate', line: i });
                    opp.setSublistValue({ sublistId: sublist, line: i, fieldId: "rate", value: rate });
                    //log.debug('rate', rate);

                    //Amount
                    var amount = quote.getSublistValue({ sublistId: sublist, fieldId: 'amount', line: i });
                    opp.setSublistValue({ sublistId: sublist, line: i, fieldId: "amount", value: amount });
                    //log.debug('amount', amount);
                }
            }

        }

        function RemoveOpportunityLines(opp) {
            var sublist = "item";
            for (var i = 0; i < opp.getLineCount({ sublistId: sublist }); i++) {
                opp.removeLine({ sublistId: sublist, line: i, ignoreRecalc: true });
            }
        }

        function UpdateOpportunityHeader(opp, quote) {
            opp.setValue({
                fieldId: 'entity',
                value: quote.getValue('entity')
            });
            opp.setValue({
                fieldId: 'title',
                value: quote.getValue('title')
            });
        }

        return {
            afterSubmit: afterSubmit
        };
    });