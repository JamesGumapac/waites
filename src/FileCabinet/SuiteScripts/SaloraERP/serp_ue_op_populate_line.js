/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search'],
    /**
     * @param{search} search
     */
    (search) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            try {
                if (scriptContext.type == "create") {
                    let clientScriptFileId = search
                        .create({
                            type: "file",
                            filters: [["name", "is", "serp_cs_op_lib.js"]],
                        })
                        .run()
                        .getRange({start: 0, end: 1});

                    let thisForm = scriptContext.form;
                    thisForm.clientScriptFileId = clientScriptFileId[0].id;
                    log.debug(clientScriptFileId[0].id)
                    thisForm.addButton({
                        id: "custpage_add_default_item",
                        label: "Add Default Items",
                        functionName: `populateLineItems()`,
                    });

                }
            } catch (e) {
                log.debug("beforeLoad", e.message)
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

        }

        return {beforeLoad}

    });
