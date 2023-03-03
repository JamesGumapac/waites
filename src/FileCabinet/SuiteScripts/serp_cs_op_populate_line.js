/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', "N/currentRecord"],
    /**
     * @param{record} record
     */
    function (record, currentRecord) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(context) {
            try {
                if (context.mode !== "create") return
                const itemList = [{
                    itemId: 7,
                    quantity: 100,
                    rate: 550
                }, {
                    itemId: 9,
                    quantity: 100,
                    rate: 60
                }, {
                    itemId: 271,
                    quantity: 1,
                    rate: 600
                }, {
                    itemId: 334,
                    quantity: 1,
                    rate: 1800
                }, {
                    itemId: 11,
                    quantity: 100,
                    rate: 100
                }, {
                    itemId: 1526,
                    quantity: 1,
                    rate: 4995
                }, {
                    itemId: 375,
                    quantity: 5,
                    rate: 720
                }]
                const curRec = context.currentRecord;
                let entity = curRec.getValue("entity")
                console.log("entity")
                if (entity) {
                    curRec.selectLine({
                        sublistId: 'item',
                        line: 0
                    })
                    itemList.forEach(item => {
                        curRec.setCurrentSublistValue(({
                            sublistId: "item",
                            fieldId: "item",
                            value: item.itemId,
                            fireSlavingSync: true
                        }));
                        curRec.setCurrentSublistValue(({
                            sublistId: "item",
                            fieldId: "quantity",
                            value: item.quantity
                        }))
                        curRec.setCurrentSublistValue(({
                            sublistId: "item",
                            fieldId: "pricelevels",
                            value: -1
                        }))
                        curRec.setCurrentSublistValue(({
                            sublistId: "item",
                            fieldId: "rate",
                            value: item.rate
                        }))
                        curRec.commitLine("item")
                        curRec.selectNewLine({sublistId: "item"})

                    })
                }
            } catch (e) {
                log.debug("pageInit", e.message)
            }
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function postSourcing(context) {

        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */


        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {

        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {

        }



        return {
            pageInit: pageInit,
            // postSourcing: postSourcing,
            populateItems: populateItems

        };

    });
